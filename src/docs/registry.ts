import registry from './generated/registry.json'

export type PackageDocs = (typeof registry)[number]
export type DocPage = PackageDocs['pages'][number]

export function getPackages() {
  return registry.map((pkg) => ({
    id: pkg.id,
    name: pkg.name,
    description: pkg.description,
    version: pkg.version,
    pageCount: pkg.pages.filter((p) => p.version === pkg.defaultVersion).length,
    indexPage: pkg.pages.find((p) => p.slug === pkg.defaultVersion),
  }))
}

export function getPackageDocs(id: string) {
  return registry.find((pkg) => pkg.id === id) ?? null
}

export function getDocPage(id: string, slug: string) {
  return getPackageDocs(id)?.pages.find((page) => page.slug === slug) ?? null
}

export function versionDestination(pkg: PackageDocs, page: DocPage, version: string, hash = '') {
  const target = pkg.pages.find(
    (candidate) => candidate.version === version && candidate.pageId === page.pageId,
  )
  const slug = target?.slug ?? version
  const fragment = hash.replace(/^#/, '')
  let decodedFragment = fragment

  try {
    decodedFragment = decodeURIComponent(fragment)
  } catch {
    decodedFragment = ''
  }

  return `/docs/${pkg.id}/${slug}${target ? '' : '?missingPage=true'}${target?.headings.includes(decodedFragment) ? `#${fragment}` : ''}`
}
