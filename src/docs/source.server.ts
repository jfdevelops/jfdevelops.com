import registry from './generated/registry.json'

export function getPackages() {
  return registry.map((pkg) => ({
    id: pkg.id,
    name: pkg.name,
    description: pkg.description,
    version: pkg.version,
    pageCount: pkg.pages.filter((p) => p.version === pkg.defaultVersion).length,
  }))
}

export function getPackageDocs(id: string) {
  return registry.find((pkg) => pkg.id === id) ?? null
}

export function getDocPage(id: string, slug: string) {
  return getPackageDocs(id)?.pages.find((page) => page.slug === slug) ?? null
}
