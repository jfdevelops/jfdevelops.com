import { notFound, redirect } from '@tanstack/react-router'
import { getDocContent, getDocLibrary } from '@/routes/docs/-utils/client'
import type { DocsPackageId } from '@/routes/docs/-utils/definition'
import { getDocsLibrary } from '@/routes/docs/-utils/libraries'
import { getDefaultFramework, resolveDocContext } from '@/routes/docs/-utils/registry'

export async function loadDocPage(libraryId: DocsPackageId, slugs: string[]) {
  const catalog = getDocsLibrary(libraryId)

  if (!catalog) {
    throw notFound()
  }

  const summary = await getDocLibrary({ data: libraryId })
  const pkg = summary?.library

  if (!pkg) {
    throw notFound()
  }

  if (slugs.length < 2) {
    const framework = slugs[0]
      ? pkg.frameworks.find((entry) => entry.id === slugs[0])
      : getDefaultFramework(pkg)

    if (!framework) {
      throw notFound()
    }

    throw redirect({
      to: '/docs/$package/$',
      params: {
        package: catalog.id,
        _splat: `${framework.id}/${framework.defaultVersion}`,
      },
      search: { docsNotice: undefined },
      statusCode: 302,
    })
  }

  const context = resolveDocContext(pkg, slugs)

  if (!context) {
    throw notFound()
  }

  const content = await getDocContent({
    data: {
      library: catalog.id,
      framework: context.framework.id,
      version: context.version.id,
      page: context.pageId,
    },
  })

  if (!content) {
    throw notFound()
  }

  return {
    ...content,
    title: content.page.title,
    description: content.page.description,
  }
}

export function getDocSlugs(splat: string | undefined) {
  return splat?.split('/').filter(Boolean) ?? []
}
