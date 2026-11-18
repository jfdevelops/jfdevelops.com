import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { createTwoslasher } from 'twoslash'
import ts from 'typescript'

const CACHE = path.resolve('.cache/docs-types')

function packageName(specifier) {
  return specifier.startsWith('@')
    ? specifier.split('/').slice(0, 2).join('/')
    : specifier.split('/')[0]
}

export function collectDependencies(pages, version, metadata) {
  const versions = { [version.package.name]: version.package.endpointVersion }
  const imports = new Set([version.package.name, 'react', '@types/react'])

  for (const page of pages) {
    for (const line of page.body.split('\n')) {
      const row = /\|\s*`(@[^`]+)`\s*\|\s*(\d+\.\d+\.\d+(?:-[\w.-]+)?)\s*\|/.exec(line)

      if (row) {
        versions[row[1]] = row[2]
      }
    }

    for (const match of page.body.matchAll(/(@[\w.-]+\/[\w.-]+)@(\d+\.\d+\.\d+(?:-[\w.-]+)?)/g)) {
      versions[match[1]] = match[2]
    }

    for (const fence of page.fences) {
      if (!['ts', 'tsx', 'js', 'jsx'].includes(fence.language)) {
        continue
      }

      for (const match of fence.content.matchAll(
        /(?:from\s+|import\s*\(\s*|import\s*)['"]([^'"]+)['"]/g,
      )) {
        if (
          !match[1].startsWith('.') &&
          !match[1].startsWith('/') &&
          !match[1].startsWith('node:')
        ) {
          imports.add(packageName(match[1]))
        }
      }
    }
  }

  versions[version.package.name] = version.package.endpointVersion

  const available = {
    ...metadata.peerDependencies,
    ...metadata.devDependencies,
    ...metadata.dependencies,
    ...versions,
  }
  // React types are compile-time support, never the website's library dependency.
  available['@types/react'] ??= '19.3.0'
  const dependencies = {}

  for (const name of [...imports].sort()) {
    const version = available[name]

    if (version && !version.startsWith('workspace:') && !version.startsWith('file:')) {
      dependencies[name] = version
    }
  }

  return dependencies
}

export async function createVersionTypes(pages, version) {
  await mkdir(CACHE, { recursive: true })
  const packageSpec = `${version.package.name}@${version.package.endpointVersion}`
  const metadataFile = path.join(
    CACHE,
    `${createHash('sha256').update(packageSpec).digest('hex')}.json`,
  )
  let metadata

  if (existsSync(metadataFile)) {
    metadata = JSON.parse(await readFile(metadataFile, 'utf8'))
  } else {
    try {
      metadata = JSON.parse(
        execFileSync('npm', ['view', packageSpec, '--json'], {
          encoding: 'utf8',
          maxBuffer: 16 * 1024 * 1024,
          stdio: ['ignore', 'pipe', 'pipe'],
        }),
      )
      await writeFile(metadataFile, JSON.stringify(metadata))
    } catch (error) {
      if (version.status !== 'next' || !String(error.stderr).includes('E404')) {
        throw error
      }

      console.warn(
        `No published type snapshot for ${packageSpec}; only locally resolved symbols will have hovers`,
      )
      metadata = {
        unpublished: true,
        devDependencies: { react: '19.3.1', '@types/react': '19.3.0' },
      }
    }
  }

  const dependencies = metadata.unpublished
    ? metadata.devDependencies
    : collectDependencies(pages, version, metadata)
  const key = createHash('sha256')
    .update(JSON.stringify({ dependencies, typescript: ts.version }))
    .digest('hex')
  const root = path.join(CACHE, key)
  await mkdir(root, { recursive: true })

  if (!existsSync(path.join(root, '.ready'))) {
    await writeFile(
      path.join(root, 'package.json'),
      JSON.stringify({ private: true, type: 'module', dependencies }),
    )
    console.log(`Installing isolated docs types: ${version.id} (${packageSpec})`)
    execFileSync(
      'npm',
      ['install', '--ignore-scripts', '--legacy-peer-deps', '--no-audit', '--no-fund'],
      { cwd: root, stdio: 'inherit' },
    )
    await writeFile(path.join(root, '.ready'), key)
  }

  return createTwoslasher({
    fsMap: loadTypeFiles(root),
    vfsRoot: '/',
    compilerOptions: {
      strict: true,
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      target: ts.ScriptTarget.ESNext,
      skipLibCheck: true,
      allowJs: true,
      checkJs: true,
      types: ['react'],
    },
    handbookOptions: { noErrors: true },
    filterNode: (node) =>
      node.type !== 'hover' || (!/\b(?:any|unknown)$/.test(node.text) && node.text !== node.target),
  })
}

/** A closed virtual filesystem prevents falling back to the site's installed packages. */
export function loadTypeFiles(root) {
  const files = new Map()
  const lib = path.dirname(ts.sys.getExecutingFilePath())

  for (const file of readdirSync(lib)) {
    if (file.endsWith('.d.ts')) {
      files.set(`/${file}`, readFileSync(path.join(lib, file), 'utf8'))
    }
  }

  function collect(directory, virtual) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name)
      const key = `${virtual}/${entry.name}`

      if (entry.isDirectory() && entry.name !== '.bin') {
        collect(file, key)
      } else if (entry.isFile() && /(?:\.d\.[cm]?ts|\.tsx?|package\.json)$/.test(entry.name)) {
        files.set(key, readFileSync(file, 'utf8'))
      }
    }
  }

  collect(path.join(root, 'node_modules'), '/node_modules')

  return files
}
