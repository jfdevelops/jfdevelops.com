import { manifestSchema, pageSchema, pointerSchema } from './snapshot'

export type Repository = {
  id: string
  repository: string
  branch: string
  description: string
}

function bindCatalogSlug<T>(value: T, sourceSlug: string, catalogId: string) {
  if (sourceSlug === catalogId) {
    return value
  }

  return JSON.parse(
    JSON.stringify(value).replaceAll(`/docs/${sourceSlug}`, `/docs/${catalogId}`),
  ) as T
}

export type SnapshotCache = {
  match(request: Request): Promise<Response | undefined>
  put(request: Request, response: Response): Promise<void>
}

type Pointer = ReturnType<typeof pointerSchema.parse>
type StoredPointer = { pointer: Pointer; previous?: Pointer; checkedAt: number }
type Options = {
  repositories: Repository[]
  origin: string
  cache: SnapshotCache
  fetch: typeof fetch
  waitUntil: (promise: Promise<unknown>) => void
  now?: () => number
  log?: (error: unknown) => void
}

export function createRuntimeDocs(options: Options) {
  const now = options.now ?? Date.now
  const origin = options.origin.replace(/\/$/, '')

  function key(url: string) {
    return new Request(url)
  }

  function snapshotUrl(id: string, revision: string) {
    return `${origin}/${id}/snapshots/${revision}`
  }

  function repository(id: string) {
    return options.repositories.find((entry) => entry.id === id)
  }

  async function download(url: string) {
    const response = await options.fetch(url, {
      signal: AbortSignal.timeout(10000),
      redirect: 'manual',
    })

    if (!response.ok) {
      throw new Error(`Documentation origin returned ${response.status}`)
    }

    if (Number(response.headers.get('content-length') ?? 0) > 8 * 1024 * 1024) {
      throw new Error('Documentation response is too large')
    }

    const reader = response.body?.getReader()

    if (!reader) {
      throw new Error('Empty documentation response')
    }

    let size = 0
    const chunks: Uint8Array[] = []

    while (true) {
      const result = await reader.read()

      if (result.done) {
        break
      }

      size += result.value.byteLength

      if (size > 8 * 1024 * 1024) {
        await reader.cancel()

        throw new Error('Documentation response is too large')
      }

      chunks.push(result.value)
    }

    const bytes = new Uint8Array(size)
    let offset = 0

    for (const chunk of chunks) {
      bytes.set(chunk, offset)
      offset += chunk.length
    }

    return JSON.parse(new TextDecoder().decode(bytes))
  }

  async function immutable<T>(url: string, parse: (value: unknown) => T): Promise<T> {
    const cached = await options.cache.match(key(url))

    if (cached) {
      return parse(await cached.json())
    }

    const value = parse(await download(url))
    await options.cache.put(
      key(url),
      Response.json(value, { headers: { 'cache-control': 'public, max-age=31536000' } }),
    )

    return value
  }

  async function manifest(id: string, pointer: Pointer) {
    const registered = repository(id)

    if (!registered) {
      return null
    }

    return immutable(`${snapshotUrl(id, pointer.revision)}/manifest.json`, (input) => {
      const value = manifestSchema.parse(input)

      if (
        value.library.repository !== registered.repository ||
        value.library.commit !== pointer.sourceCommit ||
        registered.branch !== 'main'
      ) {
        throw new Error('Documentation snapshot does not match the registered repository')
      }

      const bound = bindCatalogSlug(value, value.library.slug, id)

      return {
        ...bound,
        library: {
          ...bound.library,
          slug: id,
        },
      }
    })
  }

  async function pointer(id: string): Promise<StoredPointer | null> {
    if (!repository(id)) {
      return null
    }

    const url = `${origin}/${id}/current.json`
    const cached = await options.cache.match(key(url))
    let stored: StoredPointer | undefined

    if (cached) {
      const raw = (await cached.json()) as StoredPointer
      stored = {
        pointer: pointerSchema.parse(raw.pointer),
        previous: raw.previous ? pointerSchema.parse(raw.previous) : undefined,
        checkedAt: raw.checkedAt,
      }
    }

    async function refresh() {
      const next = pointerSchema.parse(await download(url))
      await manifest(id, next)
      const value: StoredPointer = {
        pointer: next,
        checkedAt: now(),
        previous: next.revision !== stored?.pointer.revision ? stored?.pointer : stored?.previous,
      }
      await options.cache.put(
        key(url),
        Response.json(value, { headers: { 'cache-control': 'public, max-age=604800' } }),
      )

      return value
    }

    if (!stored) {
      return refresh()
    }

    if (now() - stored.checkedAt >= 60000) {
      options.waitUntil(refresh().catch((error) => options.log?.(error)))
    }

    return stored
  }

  async function library(id: string) {
    const selected = await pointer(id)

    if (!selected) {
      return null
    }

    const value = await manifest(id, selected.pointer)

    return value ? { ...value, revision: selected.pointer.revision } : null
  }

  async function libraries() {
    const results = await Promise.allSettled(options.repositories.map((entry) => library(entry.id)))

    for (const result of results) {
      if (result.status === 'rejected') {
        options.log?.(result.reason)
      }
    }

    const available = results.flatMap((result) =>
      result.status === 'fulfilled' && result.value ? [result.value.library] : [],
    )

    if (!available.length && options.repositories.length) {
      throw new Error('Documentation is temporarily unavailable')
    }

    return available
  }

  async function page(id: string, framework: string, version: string, pageId: string) {
    const selected = await pointer(id)

    if (!selected) {
      return null
    }

    async function read(current: Pointer) {
      const summary = await manifest(id, current)
      const entry = summary?.library.frameworks
        .find((frameworkEntry) => frameworkEntry.id === framework)
        ?.versions.find((versionEntry) => versionEntry.id === version)
        ?.pages.find((pageEntry) => pageEntry.id === pageId)

      if (!summary || !entry) {
        return null
      }

      const file = pageId.split('/').map(encodeURIComponent).join('/')
      const content = await immutable(
        `${snapshotUrl(id, current.revision)}/pages/${framework}/${version}/${file}.json`,
        (input) => {
          const value = pageSchema.parse(input)

          if (value.framework !== framework || value.version !== version || value.id !== pageId) {
            throw new Error('Documentation page identity mismatch')
          }

          return value
        },
      )

      return { pkg: summary.library, revision: current.revision, page: content }
    }

    try {
      return await read(selected.pointer)
    } catch (error) {
      options.log?.(error)

      if (selected.previous) {
        return read(selected.previous)
      }

      throw error
    }
  }

  return { library, libraries, page }
}
