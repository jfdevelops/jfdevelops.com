import type { DocPage, PackageDocs } from './schema'
export type { DocPage, PackageDocs } from './schema'

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
