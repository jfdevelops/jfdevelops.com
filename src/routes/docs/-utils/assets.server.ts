import type { SnapshotCache } from './runtime'

type Options = {
  repositories: Array<{ id: string; repository: string }>
  cache: SnapshotCache
  fetch: typeof fetch
}

const contentTypes: Record<string, string> = {
  svg: 'image/svg+xml',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  avif: 'image/avif',
  ico: 'image/x-icon',
}

export async function serveDocsAsset(request: Request, options: Options): Promise<Response> {
  if (!['GET', 'HEAD'].includes(request.method)) {
    return new Response('Method not allowed', { status: 405, headers: { Allow: 'GET, HEAD' } })
  }

  let parts: string[]

  try {
    parts = new URL(request.url).pathname.split('/').slice(2).map(decodeURIComponent)
  } catch {
    return new Response('Invalid asset path', { status: 400 })
  }

  const [id, commit, ...segments] = parts
  const repository = options.repositories.find((entry) => entry.id === id)
  const contentType = contentTypes[segments.at(-1)?.split('.').at(-1)?.toLowerCase() ?? '']

  if (
    !repository ||
    !/^[a-f0-9]{40}$/.test(commit ?? '') ||
    !contentType ||
    !segments.includes('assets') ||
    segments.some(
      (part) =>
        !part ||
        part === '.' ||
        part === '..' ||
        /[\\/]/.test(part) ||
        [...part].some((character) => character.charCodeAt(0) < 32),
    )
  ) {
    return new Response('Asset not found', { status: 404 })
  }

  const key = new Request(new URL(request.url).origin + new URL(request.url).pathname)
  const cached = await options.cache.match(key)

  if (cached) {
    return request.method === 'HEAD' ? new Response(null, cached) : cached
  }

  try {
    const url = `${repository.repository.replace('https://github.com/', 'https://raw.githubusercontent.com/')}/${commit}/docs/${segments.map(encodeURIComponent).join('/')}`
    const upstream = await options.fetch(url, {
      redirect: 'manual',
      signal: AbortSignal.timeout(10000),
    })

    if (!upstream.ok) {
      return new Response('Asset unavailable', { status: upstream.status === 404 ? 404 : 502 })
    }

    const limit = 8 * 1024 * 1024

    if (Number(upstream.headers.get('content-length') ?? 0) > limit) {
      return new Response('Asset too large', { status: 502 })
    }

    const reader = upstream.body?.getReader()

    if (!reader) {
      return new Response('Asset unavailable', { status: 502 })
    }

    let size = 0
    const chunks: Uint8Array[] = []

    while (true) {
      const result = await reader.read()

      if (result.done) {
        break
      }

      size += result.value.byteLength

      if (size > limit) {
        await reader.cancel()

        return new Response('Asset too large', { status: 502 })
      }

      chunks.push(result.value)
    }

    const bytes = new Uint8Array(size)
    let offset = 0

    for (const chunk of chunks) {
      bytes.set(chunk, offset)
      offset += chunk.length
    }

    const response = new Response(bytes, {
      headers: {
        'content-type': contentType,
        'cache-control': 'public, max-age=31536000, immutable',
        'x-content-type-options': 'nosniff',
        // SVG is an image, not an executable same-origin document.
        'content-security-policy': "default-src 'none'; style-src 'unsafe-inline'; sandbox",
      },
    })
    await options.cache.put(key, response.clone())

    return request.method === 'HEAD' ? new Response(null, response) : response
  } catch {
    return new Response('Asset unavailable', { status: 502 })
  }
}

