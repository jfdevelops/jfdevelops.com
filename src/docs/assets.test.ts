import { expect, it, vi } from 'vitest'
import { serveDocsAsset } from './assets.server'

function setup() {
  const entries = new Map<string, Response>()
  const fetcher = vi.fn(
    async (_input: RequestInfo | URL, _init?: RequestInit) =>
      new Response('<svg xmlns="http://www.w3.org/2000/svg"/>', {
        headers: { 'content-type': 'text/plain', 'x-content-type-options': 'nosniff' },
      }),
  )
  return {
    repositories: [{ id: 'library', repository: 'https://github.com/example/library' }],
    fetch: fetcher,
    cache: {
      async match(request: Request) {
        return entries.get(request.url)?.clone()
      },
      async put(request: Request, response: Response) {
        entries.set(request.url, response.clone())
      },
    },
  }
}
const url = `https://example.com/docs-assets/library/${'a'.repeat(40)}/framework/react/v1/assets/logo.svg`

it('serves GitHub SVG bytes with image MIME, sandboxing and immutable caching', async () => {
  const options = setup()
  const response = await serveDocsAsset(new Request(url), options)
  expect(response.status).toBe(200)
  expect(response.headers.get('content-type')).toBe('image/svg+xml')
  expect(response.headers.get('content-security-policy')).toContain('sandbox')
  expect(response.headers.get('cache-control')).toContain('immutable')
  expect(await response.text()).toContain('<svg')
  expect((await serveDocsAsset(new Request(url), options)).status).toBe(200)
  expect(await (await serveDocsAsset(new Request(url, { method: 'HEAD' }), options)).text()).toBe(
    '',
  )
  expect(options.fetch).toHaveBeenCalledTimes(1)
  expect(options.fetch.mock.calls[0][0]).toContain('raw.githubusercontent.com/example/library/')
})

it('rejects unregistered repositories, non-image files and encoded traversal without fetching', async () => {
  const options = setup()
  for (const invalid of [
    url.replace('/library/', '/unknown/'),
    url.replace('.svg', '.html'),
    url.replace('logo.svg', '..%2fsecret.svg'),
    url.replace('logo.svg', '%00.svg'),
  ])
    expect((await serveDocsAsset(new Request(invalid), options)).status).toBe(404)
  expect(options.fetch).not.toHaveBeenCalled()
})

it('does not cache origin failures', async () => {
  const options = setup()
  options.fetch.mockResolvedValue(new Response('missing', { status: 404 }))
  expect((await serveDocsAsset(new Request(url), options)).status).toBe(404)
  options.fetch.mockResolvedValue(new Response('<svg/>'))
  expect((await serveDocsAsset(new Request(url), options)).status).toBe(200)
  expect(options.fetch).toHaveBeenCalledTimes(2)
})
