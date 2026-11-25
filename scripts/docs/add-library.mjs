// Registers a library for the docs site: pnpm docs:add <github-url> [options]
import { execFile } from 'node:child_process'
import { readFile, writeFile } from 'node:fs/promises'
import { parseArgs, promisify } from 'node:util'
import { packageId, registerLibrary, titleFromId } from './register.mjs'

const usage = `Usage: pnpm docs:add <github-url> [options]

Options:
  --group <id>          Catalog group (default: libraries)
  --package <name>      npm package name (default: name in the repository's package.json)
  --docs-package <dir>  Package directory in a monorepo, such as packages/core
  --title <text>        Card title (default: derived from the package name)
  --description <text>  Card description (default: the package.json description)
  --icon <Name>         lucide-react icon export (default: BookOpenIcon)
  --dry-run             Print the changes without writing them`

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    group: { type: 'string', default: 'libraries' },
    package: { type: 'string' },
    'docs-package': { type: 'string' },
    title: { type: 'string' },
    description: { type: 'string' },
    icon: { type: 'string', default: 'BookOpenIcon' },
    'dry-run': { type: 'boolean', default: false },
    help: { type: 'boolean', default: false },
  },
})

if (values.help || positionals.length !== 1) {
  console.log(usage)
  process.exit(values.help ? 0 : 1)
}

const repository = positionals[0].replace(/\.git$/, '').replace(/\/$/, '')
const repositoryMatch = /^https:\/\/github\.com\/([\w.-]+)\/([\w.-]+)$/.exec(repository)

if (!repositoryMatch) {
  throw new Error('Pass a public GitHub repository URL, such as https://github.com/jfdevelops/cli')
}

const { stdout } = await promisify(execFile)('git', ['ls-remote', repository, 'refs/heads/main'])

if (!stdout.trim()) {
  throw new Error(`${repository} has no main branch`)
}

const lucide = await import('lucide-react')

if (!(values.icon in lucide)) {
  throw new Error(`lucide-react has no icon named ${values.icon}`)
}

async function readPackageJson() {
  const directory = values['docs-package'] ? `${values['docs-package']}/` : ''
  const url = `https://raw.githubusercontent.com/${repositoryMatch[1]}/${repositoryMatch[2]}/main/${directory}package.json`
  const response = await fetch(url)

  return response.ok ? response.json() : {}
}

const manifest = await readPackageJson()
const packageName = values.package ?? manifest.name

if (!packageName) {
  throw new Error('Could not read the package name; pass --package')
}

const description = values.description ?? manifest.description

if (!description) {
  throw new Error('Could not read a description; pass --description')
}

const files = {
  definition: 'src/routes/docs/-utils/definition.tsx',
  libraries: 'src/routes/docs/-utils/libraries.ts',
}
const result = registerLibrary(
  {
    definition: await readFile(files.definition, 'utf8'),
    libraries: await readFile(files.libraries, 'utf8'),
  },
  {
    packageName,
    title: values.title ?? titleFromId(packageId(packageName)),
    description,
    icon: values.icon,
    repository,
    group: values.group,
    docsPackage: values['docs-package'],
  },
)

if (values['dry-run']) {
  console.log(result.libraries)
  process.exit(0)
}

await writeFile(files.definition, result.definition)
await writeFile(files.libraries, result.libraries)
await promisify(execFile)(process.execPath, [
  'node_modules/@biomejs/biome/bin/biome',
  'format',
  '--write',
  ...Object.values(files),
])

console.log(`Registered ${packageName} as /docs/${result.id}.

Next:
1. Check the card text and icon in ${files.libraries}.
2. In ${repository}, add the "Notify docs" workflow from docs/site-docs.md and its
   DOCS_DISPATCH_TOKEN secret, so pushes to main refresh the docs.
3. Merge and deploy this change. The refresh workflow then publishes the first snapshot.
   Locally, restart pnpm dev to build it.`)
