import { notFound, redirect } from '@tanstack/react-router'
import { getDocContent, getDocLibrary, getDocsLibraries } from '@/routes/docs/-utils/client'
import { getDefaultFramework, resolveDocContext } from '@/routes/docs/-utils/registry'

export async function loadDocPage(packageSlug: string, slugs: string[]) {
  const summary = await getDocLibrary({ data: packageSlug })
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
      params: { package: pkg.slug, _splat: `${framework.id}/${framework.defaultVersion}` },
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
      library: pkg.slug,
      framework: context.framework.id,
      version: context.version.id,
      page: context.pageId,
    },
  })

  if (!content) {
    throw notFound()
  }

  const libraries = await getDocsLibraries()

  return {
    ...content,
    libraries,
    title: content.page.title,
    description: content.page.description,
  }
}

