import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

export const getDocsLibraryVersions = createServerFn({ method: 'GET' }).handler(async () => {
  const { docsLibraries } = await import('./libraries')
  const { getLatestReleaseVersion } = await import('./release')
  const cache = await caches.open('docs-release-tags-v1')
  const entries = await Promise.all(
    docsLibraries.map(
      async (library) =>
        [
          library.id,
          await getLatestReleaseVersion(library.repository, library.packageName, { cache }),
        ] as const,
    ),
  )

  return JSON.stringify(Object.fromEntries(entries))
})

export const getDocsLibraryVersion = createServerFn({ method: 'GET' })
  .validator(
    z.object({
      library: z.string().regex(/^[a-z0-9-]+$/),
      major: z.number().int().nonnegative(),
    }),
  )
  .handler(async ({ data }) => {
    const { getDocsLibrary } = await import('./libraries')
    const { getLatestReleaseVersion } = await import('./release')
    const library = getDocsLibrary(data.library)
    const cache = await caches.open('docs-release-tags-v1')

    return JSON.stringify(
      library
        ? await getLatestReleaseVersion(library.repository, library.packageName, {
            cache,
            major: data.major,
          })
        : null,
    )
  })

export const getDocLibrary = createServerFn({ method: 'GET' })
  .validator(z.string().regex(/^[a-z0-9-]+$/))
  .handler(async ({ data }) => {
    const { getRuntimeDocs } = await import('./source.server')

    return JSON.stringify(await (await getRuntimeDocs()).library(data))
  })

export const getDocContent = createServerFn({ method: 'GET' })
  .validator(
    z.object({
      library: z.string(),
      framework: z.string(),
      version: z.string(),
      page: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const { getRuntimeDocs } = await import('./source.server')
    const { setResponseHeader } = await import('@tanstack/react-start/server')
    const content = await (await getRuntimeDocs()).page(
      data.library,
      data.framework,
      data.version,
      data.page,
    )

    if (content) {
      setResponseHeader('x-docs-revision', content.revision)
    }

    return JSON.stringify(content)
  })
