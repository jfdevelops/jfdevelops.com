import { access, mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

export function annotateCodeBlocks(markdown, context) {
  let fence
  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  return lines
    .map((line, index) => {
      if (fence) {
        if (new RegExp(`^ {0,3}${fence.character}{${fence.length},}\\s*$`).test(line))
          fence = undefined
        return line
      }
      const match = /^( {0,3})(`{3,}|~{3,})([^\s]*)(.*)$/.exec(line)
      if (!match) return line
      fence = { character: match[2][0], length: match[2].length }
      if (
        !['ts', 'tsx', 'typescript', 'js', 'jsx', 'javascript'].includes(match[3]) ||
        /\b(?:notwoslash|no-twoslash)\b/.test(match[4])
      )
        return line
      // Generated API examples use ^? as prose, without the declarations needed
      // to execute a Twoslash query. Explicitly opted-in examples retain queries.
      if (!/\btwoslash\b/.test(match[4])) {
        const end = lines.findIndex(
          (candidate, candidateIndex) =>
            candidateIndex > index &&
            new RegExp(`^ {0,3}${fence.character}{${fence.length},}\\s*$`).test(candidate),
        )
        if (
          lines
            .slice(index + 1, end < 0 ? undefined : end)
            .some((code) => /^\s*\/\/\s*\^\?/.test(code))
        )
          return line
      }
      return `${line} docs-types=${context}`
    })
    .join('\n')
}

export async function addTypeContext(directory, context) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name)
    if (entry.isDirectory() && entry.name !== 'assets') await addTypeContext(full, context)
    else if (entry.name.endsWith('.md'))
      await writeFile(full, annotateCodeBlocks(await readFile(full, 'utf8'), context))
  }
}

async function readJson(file) {
  return JSON.parse(await readFile(file, 'utf8'))
}

export async function prepareTypeContext(projectRoot, checkout, library, framework, version, run) {
  if (library.slug !== 'react-layout') {
    const paths = {}
    const rootPackage = await readJson(path.join(checkout, 'package.json'))
    let packages = []
    try {
      packages = (await readdir(path.join(checkout, 'packages'), { withFileTypes: true }))
        .filter((entry) => entry.isDirectory())
        .map((entry) => `packages/${entry.name}`)
    } catch (error) {
      if (error.code !== 'ENOENT') throw error
    }
    for (const directory of ['.', ...packages]) {
      const pkg =
        directory === '.'
          ? rootPackage
          : await readJson(path.join(checkout, directory, 'package.json'))
      const entry = path.join(checkout, directory, 'src/index.ts')
      try {
        await access(entry)
        paths[pkg.name] = [entry]
      } catch (error) {
        if (error.code !== 'ENOENT') throw error
      }
    }
    return {
      key: `${library.slug}/${framework.id}/${version.id}`,
      cacheKey: `${library.commit}/${library.slug}/${framework.id}/${version.id}`,
      cwd: checkout,
      compilerOptions: {
        strict: true,
        target: 'ESNext',
        module: 'ESNext',
        moduleResolution: 'Bundler',
        jsx: 'react-jsx',
        paths,
      },
    }
  }
  const coreDirectory = path.join(checkout, 'packages/core')
  const core = await readJson(path.join(coreDirectory, 'package.json'))
  const base = await readJson(path.join(checkout, 'tsconfig.base.json'))
  const tools = await readJson(path.join(checkout, 'tools/docs/tsconfig.json'))
  const key = `${library.slug}/${framework.id}/${version.id}`
  const cacheKey = `${library.commit}/${key}`
  if (version.status === 'current' || version.status === 'next') {
    return {
      key,
      cacheKey,
      cwd: path.join(checkout, 'tools/docs'),
      compilerOptions: { ...base.compilerOptions, ...tools.compilerOptions },
    }
  }

  const dependencies = {
    [library.packageName]: version.endpointVersion,
    react: core.devDependencies.react,
    'react-dom': core.devDependencies['react-dom'],
    '@types/react': core.devDependencies['@types/react'],
    '@types/react-dom': core.devDependencies['@types/react-dom'],
    '@types/node': core.devDependencies['@types/node'],
    zod: await readJson(path.join(coreDirectory, 'node_modules/zod/package.json')).then(
      (pkg) => pkg.version,
    ),
  }
  if (!version.endpointVersion)
    throw new Error(`No published package version for hover types: ${key}`)
  for (const page of version.pages) {
    const content = await readFile(path.join(checkout, 'docs', version.path, page.file), 'utf8')
    for (const match of content.matchAll(/(@jfdevelops\/[\w-]+)@(\d+\.\d+\.\d+(?:-[\w.-]+)?)/g)) {
      dependencies[match[1]] ??= match[2]
    }
  }
  const directory = path.join(
    projectRoot,
    '.docs-cache/types',
    library.slug,
    library.commit,
    framework.id,
    version.id,
  )
  await mkdir(directory, { recursive: true })
  const manifest = { private: true, type: 'module', dependencies }
  const content = `${JSON.stringify(manifest, null, 2)}\n`
  let installed = false
  try {
    installed = (await readFile(path.join(directory, 'package.json'), 'utf8')) === content
    await access(path.join(directory, 'node_modules', library.packageName, 'package.json'))
  } catch {
    installed = false
  }
  if (!installed) {
    await writeFile(path.join(directory, 'package.json'), content)
    await run('pnpm', ['install', '--ignore-scripts', '--no-frozen-lockfile'], directory)
  }
  return {
    key,
    cacheKey,
    cwd: directory,
    compilerOptions: { ...base.compilerOptions, types: ['react', 'node'] },
  }
}
