const docModules = import.meta.glob<string>('../../packages/*/docs/**/*.md', {
  eager: true,
  import: 'default',
  query: '?raw',
})

const packageModules = import.meta.glob<Record<string, unknown>>('../../packages/*/package.json', {
  eager: true,
  import: 'default',
})

type DocPage = {
  slug: string
  title: string
  description: string
  order: number
  content: string
}

type PackageDocs = {
  id: string
  name: string
  description: string
  version: string
  pages: DocPage[]
}

type DocFrontmatter = {
  title?: string
  description?: string
  order?: number
}

function parseDocPath(path: string) {
  const match = path.match(/packages\/([^/]+)\/docs\/(.+)\.md$/)
  if (!match) {
    return null
  }

  return { packageName: match[1], slug: match[2] }
}

function titleFromMarkdown(content: string) {
  const heading = content.match(/^#\s+(.+)$/m)
  return heading?.[1] ?? 'Untitled'
}

function parseFrontmatter(content: string) {
  if (!content.startsWith('---\n')) {
    return { attributes: {}, content }
  }

  const closingMarker = content.indexOf('\n---\n', 4)
  if (closingMarker === -1) {
    return { attributes: {}, content }
  }

  const attributes: DocFrontmatter = {}
  const frontmatter = content.slice(4, closingMarker)

  for (const line of frontmatter.split('\n')) {
    const separator = line.indexOf(':')
    if (separator === -1) {
      continue
    }

    const key = line.slice(0, separator).trim()
    const value = line.slice(separator + 1).trim()

    if (key === 'title') {
      attributes.title = value
    }

    if (key === 'description') {
      attributes.description = value
    }

    if (key === 'order') {
      const order = Number(value)
      if (Number.isFinite(order)) {
        attributes.order = order
      }
    }
  }

  return {
    attributes,
    content: content.slice(closingMarker + 5),
  }
}

function getPackageMetadata(packageId: string) {
  const entry = Object.entries(packageModules).find(([path]) =>
    path.endsWith(`/packages/${packageId}/package.json`),
  )
  const metadata = entry?.[1]

  return {
    name: typeof metadata?.name === 'string' ? metadata.name : packageId,
    description:
      typeof metadata?.description === 'string'
        ? metadata.description
        : `Documentation for ${packageId}.`,
    version: typeof metadata?.version === 'string' ? metadata.version : '0.0.0',
  }
}

function buildRegistry() {
  const packages = new Map<string, DocPage[]>()

  for (const [path, content] of Object.entries(docModules)) {
    const parsed = parseDocPath(path)
    if (!parsed) {
      continue
    }

    const { attributes, content: markdownContent } = parseFrontmatter(content)
    const pages = packages.get(parsed.packageName) ?? []
    pages.push({
      slug: parsed.slug,
      title: attributes.title ?? titleFromMarkdown(markdownContent),
      description: attributes.description ?? '',
      order: attributes.order ?? 100,
      content: markdownContent,
    })
    packages.set(parsed.packageName, pages)
  }

  return [...packages.entries()]
    .map(([id, pages]) => ({
      id,
      ...getPackageMetadata(id),
      pages: pages.sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug)),
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

const registry = buildRegistry()

export function getPackages() {
  return registry.map(({ id, name, description, version, pages }) => ({
    id,
    name,
    description,
    version,
    pageCount: pages.length,
    indexPage: pages.find((page) => page.slug === 'index'),
  }))
}

export function getPackageDocs(packageName: string) {
  return registry.find((pkg) => pkg.id === packageName) ?? null
}

export function getDocPage(packageName: string, slug: string) {
  const pkg = getPackageDocs(packageName)
  if (!pkg) {
    return null
  }

  return pkg.pages.find((page) => page.slug === slug) ?? null
}

export type { DocPage, PackageDocs }
