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
    const { getDocsContext } = await import('./source.server')

    return getDocsContext(data.package, data.slug)
  })
