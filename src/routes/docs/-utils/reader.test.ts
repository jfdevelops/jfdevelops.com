import { expect, it, vi } from 'vitest'
import { createBucketReader, createHttpReader } from './reader'

it('reads JSON objects from the R2 bucket by key', async () => {
  const get = vi.fn(async (key: string) =>
    key === 'cli/current.json' ? { size: 10, text: async () => '{"revision":"a"}' } : null,
  )
  const read = createBucketReader({ get })

  await expect(read('cli/current.json')).resolves.toEqual({ revision: 'a' })
  await expect(read('cli/missing.json')).rejects.toThrow('missing')
})

it('rejects oversized bucket objects before reading them', async () => {
  const text = vi.fn()
  const read = createBucketReader({ get: async () => ({ size: 9 * 1024 * 1024, text }) })

  await expect(read('cli/current.json')).rejects.toThrow('too large')
  expect(text).not.toHaveBeenCalled()
})

it('reads local development snapshots over HTTP', async () => {
  const fetcher = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) =>
    Response.json({ revision: 'b' }),
  )
  const read = createHttpReader('http://127.0.0.1:3031/', fetcher)

  await expect(read('cli/current.json')).resolves.toEqual({ revision: 'b' })
  expect(fetcher.mock.calls[0]?.[0]).toBe('http://127.0.0.1:3031/cli/current.json')
})
