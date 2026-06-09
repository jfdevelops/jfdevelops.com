const docModules = import.meta.glob<string>(
  '../../packages/*/docs/**/*.md',
  { eager: true, import: 'default', query: '?raw' },
)

type DocPage = {
  slug: string
  title: string
  content: string
}

type PackageDocs = {
  name: string
  pages: DocPage[]
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

function buildRegistry() {
  const packages = new Map<string, DocPage[]>()

  for (const [path, content] of Object.entries(docModules)) {
    const parsed = parseDocPath(path)
    if (!parsed) {
      continue
    }

    const pages = packages.get(parsed.packageName) ?? []
    pages.push({
      slug: parsed.slug,
      title: titleFromMarkdown(content),
      content,
    })
    packages.set(parsed.packageName, pages)
  }

  return [...packages.entries()]
    .map(([name, pages]) => ({
      name,
      pages: pages.sort((a, b) => a.slug.localeCompare(b.slug)),
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

const registry = buildRegistry()

export function getPackages() {
  return registry.map(({ name, pages }) => ({
    name,
    pageCount: pages.length,
    indexPage: pages.find((page) => page.slug === 'index'),
  }))
}

export function getPackageDocs(packageName: string) {
  return registry.find((pkg) => pkg.name === packageName) ?? null
}

export function getDocPage(packageName: string, slug: string) {
  const pkg = getPackageDocs(packageName)
  if (!pkg) {
    return null
  }

  return pkg.pages.find((page) => page.slug === slug) ?? null
}

export type { DocPage, PackageDocs }
