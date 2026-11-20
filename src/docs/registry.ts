import manifests from './generated-library-manifests.json'

type DocsStatus = 'current' | 'previous' | 'legacy' | 'next'
type DocEntry = { id: string; file: string; title: string; headings: string[] }
type DocsVersion = {
  id: string
  label: string
  status: DocsStatus
  path: string
  endpointVersion: string | null
  defaultPage: string
  pages: DocEntry[]
}
type DocsFramework = { id: string; title: string; defaultVersion: string; versions: DocsVersion[] }
type PackageDocs = {
  slug: string
  name: string
  packageName: string
  description: string
  repository: string
  commit: string
  pageCount: number
  frameworks: DocsFramework[]
}
const libraries = manifests as PackageDocs[]

export function getLibraries() {
  return libraries
}
export function getPackageDocs(slug: string) {
  return libraries.find((library) => library.slug === slug) ?? null
}
export function getDefaultFramework(library: PackageDocs) {
  return library.frameworks[0]
}
export function getDefaultVersion(framework: DocsFramework) {
  return (
    framework.versions.find((version) => version.id === framework.defaultVersion) ??
    framework.versions[0]
  )
}
export function getStatusLabel(status: DocsStatus) {
  return { current: 'Current', previous: 'Previous', legacy: 'Legacy', next: 'Unreleased' }[status]
}
export function getPageUrl(
  library: PackageDocs,
  framework: DocsFramework,
  version: DocsVersion,
  pageId = version.defaultPage,
) {
  const base = `/docs/${library.slug}/${framework.id}/${version.id}`
  return pageId === version.defaultPage ? base : `${base}/${pageId}`
}
export function getSwitchTarget(
  library: PackageDocs,
  framework: DocsFramework,
  version: DocsVersion,
  pageId: string,
  hash = '',
) {
  const page = version.pages.find((page) => page.id === pageId)
  let heading = hash.replace(/^#/, '')
  try {
    heading = decodeURIComponent(heading)
  } catch {
    heading = ''
  }
  return {
    url: getPageUrl(library, framework, version, page?.id),
    missing: !page,
    hash: page?.headings.includes(heading) ? hash.replace(/^#/, '') : '',
  }
}
export function resolveDocContext(library: PackageDocs, slugs: string[]) {
  const framework = library.frameworks.find((framework) => framework.id === slugs[0])
  const version = framework?.versions.find((version) => version.id === slugs[1])
  if (!framework || !version) return null
  const pageId = slugs.slice(2).join('/') || version.defaultPage
  if (!version.pages.some((page) => page.id === pageId)) return null
  return { framework, version, pageId }
}

export function resolveDocHref(
  library: PackageDocs,
  version: DocsVersion,
  pageId: string,
  href: string,
  image = false,
) {
  if (href.startsWith('https://') || href.startsWith('#')) return href
  if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(href)) return '#'
  if (href.startsWith('/')) return href
  const file = version.pages.find((page) => page.id === pageId)?.file ?? `${pageId}.md`
  const resolved = new URL(href, `https://docs.invalid/${version.path}/${file}`)
  const relative = decodeURI(resolved.pathname.slice(1))
  for (const framework of library.frameworks) {
    for (const candidate of framework.versions) {
      if (!relative.startsWith(`${candidate.path}/`)) continue
      const target = relative.slice(candidate.path.length + 1)
      if (image && target.startsWith('assets/'))
        return `/docs-assets/${library.slug}/${library.commit}/${relative}${resolved.search}${resolved.hash}`
      const id = target.replace(/\.md$/, '').replace(/\/index$/, '')
      const page = candidate.pages.find((page) => page.id === id)
      if (page)
        return getPageUrl(library, framework, candidate, id) + resolved.search + resolved.hash
    }
  }
  return '#'
}
export type { DocsFramework, DocsVersion, PackageDocs }
