import { access, mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { completeCodeBlocks, publicImports } from './code-context.mjs'
import { markdownNodes } from './markdown.mjs'

export function annotateCodeBlocks(markdown, context) {
  let fence
  let previousManagerEnd = -1
  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  let output = lines
    .map((line, index) => {
      if (fence) {
        if (new RegExp(`^ {0,3}${fence.character}{${fence.length},}\\s*$`).test(line))
          fence = undefined
        return line
      }
      const match = /^( {0,3})(`{3,}|~{3,})([^\s]*)(.*)$/.exec(line)
      if (!match) return line
      fence = { character: match[2][0], length: match[2].length }
      if (['npm', 'pnpm', 'yarn', 'bun'].includes(match[3])) {
        const end = lines.findIndex(
          (candidate, candidateIndex) =>
            candidateIndex > index &&
            new RegExp(`^ {0,3}${fence.character}{${fence.length},}\\s*$`).test(candidate),
        )
        const previousIsManager =
          previousManagerEnd >= 0 &&
          lines.slice(previousManagerEnd + 1, index).every((candidate) => !candidate.trim())
        const next = lines.slice(end + 1).find((candidate) => candidate.trim()) ?? ''
        previousManagerEnd = end
        const nextIsManager = /^ {0,3}(?:`{3,}|~{3,})(?:npm|pnpm|yarn|bun)\b/.test(next)
        // Preserve Fumadocs' automatic conversion for a standalone npm command.
        if (!previousIsManager && !nextIsManager)
          return match[3] === 'npm' ? line : `${match[1]}${match[2]}bash${match[4]}`
        return `${match[1]}${match[2]}bash${match[4]} tab="${match[3]}" tab-group="package-manager"`
      }
      if (!['ts', 'tsx', 'typescript', 'js', 'jsx', 'javascript'].includes(match[3])) return line
      return `${line.replace(/\b(?:notwoslash|no-twoslash)\b/g, '').trimEnd()} docs-types=${context}`
    })
    .join('\n')
  // CommonMark containers (lists and blockquotes) can prefix a fence with markers.
  for (const node of markdownNodes(output).reverse()) {
    if (
      node.type !== 'code' ||
      !['ts', 'tsx', 'typescript', 'js', 'jsx', 'javascript'].includes(node.lang) ||
      node.meta?.includes('docs-types=')
    )
      continue
    const start = node.position.start.offset
    const end = output.indexOf('\n', start)
    if (end < 0) continue
    const header = output.slice(start, end)
    if (!/^(`{3,}|~{3,})/.test(header)) continue
    output =
      output.slice(0, start) +
      header.replace(/\b(?:notwoslash|no-twoslash)\b/g, '').trimEnd() +
      ' docs-types=' +
      context +
      output.slice(end)
  }
  return output
}

export async function addTypeContext(
  directory,
  context,
  root = directory,
  imports = publicImports(context),
) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name)
    if (entry.isDirectory() && entry.name !== 'assets')
      await addTypeContext(full, context, root, imports)
    else if (entry.name.endsWith('.md')) {
      let prelude = ''
      const relative = path.relative(root, full).replace(/\\/g, '/').replace(/\.md$/, '.tsx')
      try {
        prelude = await readFile(path.join('docs/type-contexts', context.key, relative), 'utf8')
      } catch (error) {
        if (error.code !== 'ENOENT') throw error
      }
      try {
        prelude = await readFile(full.replace(/\.md$/, '.context.tsx'), 'utf8')
      } catch (error) {
        if (error.code !== 'ENOENT') throw error
      }
      const markdown = completeCodeBlocks(await readFile(full, 'utf8'), { imports, prelude })
      await writeFile(full, annotateCodeBlocks(markdown, context.key))
    }
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
      packageName: library.packageName,
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
      packageName: library.packageName,
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
    packageName: library.packageName,
    cacheKey,
    cwd: directory,
    compilerOptions: { ...base.compilerOptions, types: ['react', 'node'] },
  }
}
