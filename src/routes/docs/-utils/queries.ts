import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

export const getDocsLibraryVersions = createServerFn({ method: 'GET' }).handler(async () => {
  const { docsLibraries } = await import('./libraries')
  const { getLatestNpmVersion } = await import('./npm')
  const entries = await Promise.all(
    docsLibraries.map(async (library) => {
      const version = await getLatestNpmVersion(library.packageName)

      return [library.id, version] as const
    }),
  )

  return JSON.stringify(Object.fromEntries(entries))
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
