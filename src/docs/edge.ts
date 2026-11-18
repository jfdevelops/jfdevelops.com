import { libraryIdSchema, snapshotSchema } from './schema'
import type { createDocsStorage } from './storage'

type EdgeServices = {
  storage: ReturnType<typeof createDocsStorage>
  cache: {
    match(request: Request): Promise<Response | undefined>
    put(request: Request, response: Response): Promise<void>
  }
  viewer: string
  render(request: Request): Promise<Response>
  waitUntil(task: Promise<unknown>): void
}

export async function serveDocsRequest(
  request: Request,
  { storage, cache, viewer, render, waitUntil }: EdgeServices,
) {
  const url = new URL(request.url)
  const assets = /^\/_docs\/assets\/([a-z0-9-]+)\/([a-f0-9]{64})\/(.+)$/.exec(url.pathname)

  if (assets) {
    const path = assets[3]

    if (path.includes('..') || !['GET', 'HEAD'].includes(request.method)) {
      return new Response('Not found', { status: 404 })
    }

    const response = await storage.object(`snapshots/${assets[1]}/${assets[2]}/assets/${path}`)

    return response ?? new Response('Not found', { status: 404 })
  }

  const match = /^\/docs\/([a-z0-9-]+)(?:\/.*)?$/.exec(url.pathname)
  const headers = new Headers(request.headers)
  const requestedSnapshot = headers.get('x-docs-snapshot')
  headers.delete('x-docs-snapshot')

  if (request.method !== 'GET' || !match || !libraryIdSchema.safeParse(match[1]).success) {
    return render(new Request(request, { headers }))
  }

  const pointer =
    requestedSnapshot && snapshotSchema.safeParse(requestedSnapshot).success
      ? { snapshot: requestedSnapshot }
      : await storage.pointer(match[1])

  if (!pointer) {
    return render(new Request(request, { headers }))
  }

  headers.set('x-docs-snapshot', pointer.snapshot)
  const cacheable = !request.headers.has('authorization') && !request.headers.has('cookie')
  const keyUrl = new URL(url)
  keyUrl.searchParams.set('__docs_snapshot', pointer.snapshot)
  keyUrl.searchParams.set('__viewer', viewer)
  const key = new Request(keyUrl)
  const cached = cacheable ? await cache.match(key) : undefined

  if (cached) {
    const response = new Response(cached.body, cached)
    response.headers.set('x-docs-cache', 'HIT')
    response.headers.set('cache-control', 'no-cache')

    return response
  }

  const result = await render(new Request(request, { headers }))
  const response = new Response(result.body, result)
  response.headers.set('x-docs-snapshot', pointer.snapshot)
  response.headers.set('x-docs-cache', 'MISS')

  if (
    cacheable &&
    result.status === 200 &&
    result.headers.get('content-type')?.includes('text/html') &&
    !result.headers.has('set-cookie')
  ) {
    const body = response.clone()
    waitUntil(
      (async () => {
        const html = await body.text()

        if (
          !html.includes('<article') ||
          html.includes('data-msg=') ||
          html.includes('Switched to client rendering')
        ) {
          return
        }

        const cachedResponse = new Response(html, response)
        cachedResponse.headers.set('cache-control', 'public, max-age=86400')
        await cache.put(key, cachedResponse)
      })(),
    )
  }

  response.headers.set('cache-control', 'no-cache')

  return response
}
