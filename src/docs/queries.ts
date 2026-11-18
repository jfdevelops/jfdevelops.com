import { createServerFn } from '@tanstack/react-start'

export const getDocsLibraries = createServerFn({ method: 'GET' }).handler(async () => {
  const { getPackages } = await import('./source.server')

  return getPackages()
})

export const getDocsContext = createServerFn({ method: 'GET' })
  .inputValidator((input: { package: string; slug?: string }) => {
    if (
      typeof input?.package !== 'string' ||
      (input.slug !== undefined && typeof input.slug !== 'string')
    ) {
      throw new Error('Invalid docs request')
    }

    return input
  })
  .handler(async ({ data }) => {
    const { getPackageDocs } = await import('./source.server')
    const library = getPackageDocs(data.package)

    if (!library) {
      return null
    }

    const { pages, ...metadata } = library
    const pkg = {
      ...metadata,
      pages: pages.map(({ content: _content, html: _html, ...page }) => page),
    }
    const page = pages.find((page) => page.slug === data.slug) ?? null

    return { pkg, page }
  })
