import { afterEach, expect, it, vi } from 'vitest'
import { getLatestNpmVersion, getLatestNpmVersions } from './npm'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

it('reads the exact latest version from the npm registry', async () => {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ version: '4.1.0' }),
  })

  vi.stubGlobal('fetch', fetchMock)

  await expect(getLatestNpmVersion('@jfdevelops/react-layout')).resolves.toBe('4.1.0')
  expect(fetchMock).toHaveBeenCalledWith(
    'https://registry.npmjs.org/%40jfdevelops%2Freact-layout/latest',
    {
      headers: { accept: 'application/json' },
    },
  )
})

it('returns null when the npm registry request fails', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({}),
    }),
  )

  await expect(getLatestNpmVersion('@jfdevelops/missing')).resolves.toBeNull()
})

it('loads latest versions for each package name', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: string) => ({
      ok: true,
      json: async () => ({
        version: input.includes('react-layout') ? '4.1.0' : '0.2.1',
      }),
    })),
  )

  await expect(
    getLatestNpmVersions(['@jfdevelops/react-layout', '@jfdevelops/create-error']),
  ).resolves.toEqual({
    '@jfdevelops/react-layout': '4.1.0',
    '@jfdevelops/create-error': '0.2.1',
  })
})
