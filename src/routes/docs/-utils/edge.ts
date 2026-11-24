import type { SnapshotCache } from './runtime'

type Options = {
  docs: {
    libraries(): Promise<Array<{ slug: string; commit: string }>>
    library(id: string): Promise<{ revision: string } | null>
  }
  cache: SnapshotCache
  viewer: string
  render(request: Request): Promise<Response>
}

export async function serveDocsRequest(request: Request, options: Options) {
  const url = new URL(request.url)

  if (
    request.method !== 'GET' ||
    !/^\/docs(?:\/|$)/.test(url.pathname) ||
    request.headers.has('cookie') ||
    request.headers.has('authorization')
  ) {
    return options.render(request)
  }

  const id = url.pathname.split('/')[2]
  let revision: string | undefined

  try {
    revision = id
      ? (await options.docs.library(id))?.revision
      : (await options.docs.libraries())
          .map((library) => `${library.slug}:${library.commit}`)
          .join(',')
  } catch {
    return options.render(request)
  }

  if (!revision) {
    return options.render(request)
  }

  const cacheUrl = new URL(request.url)
  cacheUrl.searchParams.set('__docs_snapshot', revision)
  cacheUrl.searchParams.set('__docs_ui', options.viewer)
  const key = new Request(cacheUrl)
  const cached = await options.cache.match(key)

  if (cached) {
    const headers = new Headers(cached.headers)
    headers.set('cache-control', 'public, max-age=0, must-revalidate')

    return new Response(cached.body, { status: cached.status, headers })
  }

  const response = await options.render(request)
  const actualRevision = response.headers.get('x-docs-revision')

  if (
    response.status !== 200 ||
    response.headers.has('set-cookie') ||
    (id && actualRevision !== revision)
  ) {
    return response
  }

  const stored = new Response(response.clone().body, response)
  stored.headers.set('cache-control', 'public, max-age=31536000')
  await options.cache.put(key, stored)
  const headers = new Headers(response.headers)
  headers.set('cache-control', 'public, max-age=0, must-revalidate')

  return new Response(response.body, { status: response.status, headers })
}

