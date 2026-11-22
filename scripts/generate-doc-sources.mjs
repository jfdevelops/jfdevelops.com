import { execFile, spawn } from 'node:child_process'
import { access, cp, mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import { collectLibrary } from './docs/collect.mjs'
import { prepareLibrary } from './docs/prepare.mjs'
import { addTypeContext, prepareTypeContext } from './docs/types.mjs'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const config = JSON.parse(await readFile(path.join(projectRoot, 'docs.sources.json'), 'utf8'))

function run(command, args, cwd) {
  return new Promise((resolve, reject) => {
    const windowsPnpm = process.platform === 'win32' && command === 'pnpm'
    const executable = windowsPnpm ? (process.env.ComSpec ?? 'cmd.exe') : command
    const commandArgs = windowsPnpm ? ['/d', '/s', '/c', ['pnpm', ...args].join(' ')] : args
    const child = spawn(executable, commandArgs, {
      cwd,
      stdio: 'inherit',
      env: { ...process.env, CI: 'true', HUSKY: '0' },
    })
    child.on('error', reject)
    child.on('exit', (code) =>
      code === 0 ? resolve() : reject(new Error(`${command} ${args.join(' ')} failed (${code})`)),
    )
  })
}

async function exists(file) {
  try {
    await access(file)
    return true
  } catch {
    return false
  }
}

const libraries = []
const declarations = []
const sources = []
const libraryIds = new Set()
const typeContexts = []
for (const source of config.libraries) {
  if (
    source.branch !== 'main' ||
    !/^https:\/\/github.com\/[\w.-]+\/[\w.-]+$/.test(source.repository)
  )
    throw new Error('Docs sources must register a public GitHub repository and main branch.')
  const { stdout } = await promisify(execFile)(
    'git',
    ['ls-remote', source.repository, 'refs/heads/main'],
    { timeout: 60000 },
  )
  const commit = stdout.split(/\s+/)[0]
  const registration = { ...source, commit }
  if (
    !/^https:\/\/github\.com\/[\w.-]+\/[\w.-]+$/.test(registration.repository) ||
    !/^[a-f0-9]{40}$/.test(registration.commit)
  ) {
    throw new Error('Each docs source needs a GitHub repository URL and a full commit SHA.')
  }
  const repoName = registration.repository.split('/').at(-1)
  const checkout = path.join(projectRoot, '.docs-cache', repoName, registration.commit)
  await mkdir(checkout, { recursive: true })
  const ready = path.join(checkout, '.site-docs-ready-v1')
  if (!(await exists(ready))) {
    if (!(await exists(path.join(checkout, '.git')))) {
      await run('git', ['init', '--quiet'], checkout)
      await run('git', ['remote', 'add', 'origin', registration.repository], checkout)
    }
    // Library checkers consume Markdown fences verbatim; keep repository LF endings on Windows.
    await run('git', ['config', 'core.autocrlf', 'false'], checkout)
    await run('git', ['config', 'core.eol', 'lf'], checkout)
    await run('git', ['fetch', '--depth=1', 'origin', registration.commit], checkout)
    await run('git', ['checkout', '--detach', registration.commit], checkout)
  }
  // Standalone libraries must not inherit the site's parent pnpm workspace settings.
  const workspaceFile = path.join(checkout, 'pnpm-workspace.yaml')
  const needsWorkspace = !(await exists(workspaceFile))
  if (needsWorkspace) await writeFile(workspaceFile, "packages:\n  - '.'\n")
  await prepareLibrary(checkout, registration, run, needsWorkspace || !(await exists(ready)))
  const manifest = JSON.parse(await readFile(path.join(checkout, 'docs/docs.json'), 'utf8'))
  const library = await collectLibrary(checkout, manifest, registration)
  if (library.slug !== registration.id)
    throw new Error(
      `Generated library identity changed: ${library.slug}; registered as ${registration.id}`,
    )
  if (libraryIds.has(library.slug)) throw new Error(`Duplicate docs library: ${library.slug}`)
  libraryIds.add(library.slug)
  const destination = path.join(projectRoot, '.docs-content', library.slug, registration.commit)
  await mkdir(destination, { recursive: true })
  for (const framework of library.frameworks) {
    for (const version of framework.versions) {
      const directory = path.join(destination, version.path)
      await mkdir(directory, { recursive: true })
      await cp(path.join(checkout, 'docs', version.path), directory, { recursive: true })
      const typeContext = await prepareTypeContext(
        projectRoot,
        checkout,
        library,
        framework,
        version,
        run,
      )
      typeContexts.push(typeContext)
      await addTypeContext(directory, typeContext.key)
      const assets = path.join(directory, 'assets')
      if (await exists(assets)) {
        const publicAssets = path.join(
          projectRoot,
          'public/docs-assets',
          library.slug,
          registration.commit,
          version.path,
          'assets',
        )
        await mkdir(publicAssets, { recursive: true })
        await cp(assets, publicAssets, { recursive: true })
      }
      const identifier = `collection${declarations.length}`
      const relative = path.relative(projectRoot, directory).split(path.sep).join('/')
      declarations.push(
        `const ${identifier} = defineDocs({ dir: ${JSON.stringify(relative)}, docs: { async: true } })`,
      )
      sources.push(
        `  ${JSON.stringify(`${library.slug}/${framework.id}/${version.id}`)}: loader({ baseUrl: ${JSON.stringify(`/docs/${library.slug}/${framework.id}/${version.id}`)}, url: (slugs) => ${JSON.stringify(`/docs/${library.slug}/${framework.id}/${version.id}`)} + (slugs.length && slugs.join('/') !== ${JSON.stringify(version.defaultPage)} ? '/' + slugs.join('/') : ''), source: ${identifier}.toFumadocsSource() }),`,
      )
    }
  }
  libraries.push(library)
  await writeFile(ready, registration.commit)
}
await writeFile(
  path.join(projectRoot, 'src/docs/generated-type-contexts.json'),
  `${JSON.stringify(typeContexts, null, 2)}\n`,
)
await writeFile(
  path.join(projectRoot, 'src/docs/generated-library-manifests.json'),
  `${JSON.stringify(libraries, null, 2)}\n`,
)
await writeFile(
  path.join(projectRoot, 'src/docs/generated-sources.ts'),
  `// Generated by pnpm docs:generate. Do not edit.\nimport { loader } from 'fumadocs-core/source'\nimport { defineDocs } from 'fumadocs-mdx/macro'\n\n${declarations.join('\n')}\n\nconst sources = {\n${sources.join('\n')}\n}\n\nexport function getDocSource(library: string, framework: string, version: string) {\n  const key = \`\${library}/\${framework}/\${version}\`\n  return sources[key as keyof typeof sources]\n}\n`,
)
console.log(`Prepared ${libraries.length} libraries from resolved repository commits.`)
