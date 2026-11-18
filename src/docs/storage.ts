import { pageSchema, pointerSchema, snapshotSchema, summarySchema } from './schema'

type DocsBucket = {
  get(key: string): Promise<{
    body: ReadableStream | null
    httpMetadata?: { contentType?: string }
    httpEtag: string
  } | null>
  list(options: {
    prefix: string
    cursor?: string
  }): Promise<{ objects: { key: string }[]; truncated: boolean; cursor?: string }>
}
type DocsCache = {
  match(request: Request): Promise<Response | undefined>
  put(request: Request, response: Response): Promise<void>
}

export function createDocsStorage(bucket: DocsBucket, cache: DocsCache) {
  async function object(key: string, ttl = 31536000) {
    const request = new Request(`https://jfdevelops.com/__docs-cache/${key}`)
    const cached = await cache.match(request)

    if (cached) {
      return cached
    }

    const value = await bucket.get(key)

    if (!value) {
      return null
    }

    const bytes = await new Response(value.body).arrayBuffer()
    const response = new Response(bytes, {
      headers: {
        'content-type': value.httpMetadata?.contentType ?? 'application/json',
        'cache-control': `public, max-age=${ttl}`,
        etag: value.httpEtag,
      },
    })
    await cache.put(request, response.clone())

    return response
  }

  async function pointer(id: string) {
    const response = await object(`libraries/${id}.json`, 15)

    return response ? pointerSchema.parse(await response.json()) : null
  }

  async function context(id: string, slug?: string, snapshot?: string) {
    const selected = snapshot ? { snapshot: snapshotSchema.parse(snapshot) } : await pointer(id)

    if (!selected) {
      return null
    }

    const prefix = `snapshots/${id}/${selected.snapshot}`
    const response = await object(`${prefix}/manifest.json`)

    if (!response) {
      throw new Error(`Published docs manifest is missing: ${id}/${selected.snapshot}`)
    }

    const pkg = summarySchema.parse(await response.json())
    const exists = slug && pkg.pages.some((page) => page.slug === slug)
    const pageResponse = exists ? await object(`${prefix}/pages/${slug}.json`) : null
    const page = pageResponse ? pageSchema.parse(await pageResponse.json()) : null

    if (exists && !page) {
      throw new Error(`Published docs page is missing: ${id}/${slug}`)
    }

    return { pkg, page }
  }

  async function libraries() {
    const ids: string[] = []
    let cursor: string | undefined

    do {
      const listed = await bucket.list({ prefix: 'libraries/', cursor })
      ids.push(
        ...listed.objects.map((object) => object.key.slice('libraries/'.length, -'.json'.length)),
      )
      cursor = listed.truncated ? listed.cursor : undefined
    } while (cursor)

    const entries = await Promise.all(ids.map((id) => context(id)))

    return entries.flatMap((entry) =>
      entry
        ? [
            {
              id: entry.pkg.id,
              name: entry.pkg.name,
              description: entry.pkg.description,
              version: entry.pkg.version,
              pageCount: entry.pkg.pages.filter((page) => page.version === entry.pkg.defaultVersion)
                .length,
            },
          ]
        : [],
    )
  }

  return { object, pointer, context, libraries }
}
