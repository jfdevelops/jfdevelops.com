import { readdir, readFile, realpath } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { parse } from 'yaml'

export function containedPath(root, relative) {
  if (typeof relative !== 'string' || !relative || relative.includes('\\'))
    throw new Error(`Invalid docs path: ${relative}`)
  const resolved = path.resolve(root, relative)
  if (!resolved.startsWith(path.resolve(root) + path.sep))
    throw new Error(`Docs path escapes its root: ${relative}`)
  return resolved
}

export function validateManifest(manifest) {
  if (manifest.schemaVersion !== 2)
    throw new Error(`Unsupported docs schemaVersion: ${manifest.schemaVersion}; expected 2.`)
  if (
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(manifest.library?.id) ||
    !manifest.library?.name ||
    !Array.isArray(manifest.frameworks) ||
    !manifest.frameworks.length
  )
    throw new Error('Invalid library docs manifest.')
  const frameworks = new Set()
  for (const framework of manifest.frameworks) {
    if (
      !/^[a-z0-9-]+$/.test(framework.id) ||
      framework.path !== `framework/${framework.id}` ||
      frameworks.has(framework.id) ||
      !framework.versions?.length
    )
      throw new Error('Invalid or duplicate docs framework.')
    frameworks.add(framework.id)
    const versions = new Set()
    for (const version of framework.versions) {
      if (
        !/^v\d+$/.test(version.id) ||
        versions.has(version.id) ||
        !['current', 'previous', 'legacy', 'next'].includes(version.status) ||
        version.path !== `${framework.path}/${version.id}`
      )
        throw new Error(`Invalid docs version: ${version.id}`)
      versions.add(version.id)
    }
    if (!versions.has(framework.defaultVersion))
      throw new Error(`Missing default version for ${framework.id}`)
  }
}

async function readPages(directory, scanMarkdown, relative = '') {
  const pages = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isSymbolicLink()) throw new Error(`Symlink in public docs: ${entry.name}`)
    if (entry.name === 'assets') continue
    const name = [relative, entry.name].filter(Boolean).join('/')
    const full = path.join(directory, entry.name)
    if (entry.isDirectory()) pages.push(...(await readPages(full, scanMarkdown, name)))
    else if (entry.name.endsWith('.md')) {
      const text = (await readFile(full, 'utf8')).replace(/\r\n/g, '\n')
      const match = /^---\n([\s\S]*?)\n---(?:\n|$)/.exec(text)
      if (!match) throw new Error(`Missing frontmatter: ${full}`)
      const data = parse(match[1])
      if (typeof data.title !== 'string') throw new Error(`Missing page title: ${full}`)
      pages.push({
        id: name.slice(0, -3).replace(/\/index$/, ''),
        file: name,
        title: data.title,
        headings: scanMarkdown(text.slice(match[0].length)).headings.map((heading) => heading.slug),
      })
    }
  }
  return pages
}

async function navigationPages(directory, relative = '') {
  const meta = JSON.parse(await readFile(path.join(directory, 'meta.json'), 'utf8'))
  const result = []
  for (const entry of meta.pages ?? []) {
    if (
      typeof entry !== 'string' ||
      !entry ||
      entry === '.' ||
      entry === '..' ||
      /[\\/]/.test(entry)
    )
      throw new Error(`Invalid generated navigation entry: ${entry}`)
    const file = path.join(directory, `${entry}.md`)
    try {
      await readFile(file)
      result.push([relative, entry].filter(Boolean).join('/'))
    } catch (error) {
      if (error.code !== 'ENOENT') throw error
      result.push(
        ...(await navigationPages(
          path.join(directory, entry),
          [relative, entry].filter(Boolean).join('/'),
        )),
      )
    }
  }
  return result
}

export async function collectLibrary(checkout, manifest, registration) {
  validateManifest(manifest)
  const docsRoot = path.join(checkout, 'docs')
  // The pinned docs tool exports its scanner from check.js, alongside its public entry.
  const { scanMarkdown } = await import(
    pathToFileURL(
      path.join(path.dirname(fileURLToPath(import.meta.resolve('@jfdevelops/docs'))), 'check.js'),
    ).href
  )
  const frameworks = []
  for (const framework of manifest.frameworks) {
    const versions = []
    for (const version of framework.versions) {
      const directory = containedPath(docsRoot, version.path)
      const realDirectory = await realpath(directory)
      if (!realDirectory.startsWith((await realpath(docsRoot)) + path.sep))
        throw new Error('Docs directory escapes its root.')
      const pages = await readPages(directory, scanMarkdown)
      const orderedIds = (await navigationPages(directory)).map((id) => id.replace(/\/index$/, ''))
      if (new Set(pages.map((page) => page.id)).size !== pages.length)
        throw new Error(`Duplicate page URL in ${version.path}`)
      if (!orderedIds.length || orderedIds.some((id) => !pages.some((page) => page.id === id)))
        throw new Error(`Broken generated navigation: ${version.path}`)
      versions.push({
        id: version.id,
        label: version.label,
        status: version.status,
        path: version.path,
        endpointVersion: version.package.endpointVersion,
        defaultPage: orderedIds[0],
        pages,
      })
    }
    frameworks.push({
      id: framework.id,
      title: framework.title,
      defaultVersion: framework.defaultVersion,
      versions: versions.sort(
        (left, right) => Number(right.status === 'current') - Number(left.status === 'current'),
      ),
    })
  }
  return {
    slug: manifest.library.id,
    name: manifest.library.name,
    packageName: manifest.library.npmPackage,
    description: registration.description,
    repository: registration.repository,
    commit: registration.commit,
    frameworks,
    pageCount: frameworks.flatMap((framework) =>
      framework.versions.flatMap((version) => version.pages),
    ).length,
  }
}
