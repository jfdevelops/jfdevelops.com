import type registry from './generated/registry.json'

export type DocPage = (typeof registry)[number]['pages'][number]
export type PackageDocs = Omit<(typeof registry)[number], 'pages'> & {
  pages: Omit<DocPage, 'content' | 'html'>[]
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
