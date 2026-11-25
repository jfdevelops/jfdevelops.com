import type { SnapshotReader } from './reader'
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
type StoredPointer = { pointer: Pointer; previous?: Pointer }
type Options = {
  repositories: Repository[]
  read: SnapshotReader
  cache: SnapshotCache
  log?: (error: unknown) => void
}

// Cache keys only; snapshots are read through `options.read`.
const cacheOrigin = 'https://docs-snapshots.invalid'

export function createRuntimeDocs(options: Options) {
  function key(path: string) {
    return new Request(`${cacheOrigin}/${path}`)
  }

  function snapshotPath(id: string, revision: string) {
    return `${id}/snapshots/${revision}`
  }

  function repository(id: string) {
    return options.repositories.find((entry) => entry.id === id)
  }

  async function immutable<T>(path: string, parse: (value: unknown) => T): Promise<T> {
    const cached = await options.cache.match(key(path))

    if (cached) {
      return parse(await cached.json())
    }

    const value = parse(await options.read(path))
    await options.cache.put(
      key(path),
      Response.json(value, { headers: { 'cache-control': 'public, max-age=31536000' } }),
    )

    return value
  }

  async function manifest(id: string, pointer: Pointer) {
    const registered = repository(id)

    if (!registered) {
      return null
    }

    return immutable(`${snapshotPath(id, pointer.revision)}/manifest.json`, (input) => {
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

  // The pointer is read on every request so a published snapshot is live at once.
  // The cached copy is only a fallback for when the store cannot be read.
  async function pointer(id: string): Promise<StoredPointer | null> {
    if (!repository(id)) {
      return null
    }

    const path = `${id}/current.json`
    const cached = await options.cache.match(key(path))
    let stored: StoredPointer | undefined

    if (cached) {
      const raw = (await cached.json()) as StoredPointer
      stored = {
        pointer: pointerSchema.parse(raw.pointer),
        previous: raw.previous ? pointerSchema.parse(raw.previous) : undefined,
      }
    }

    try {
      const next = pointerSchema.parse(await options.read(path))

      if (stored && next.revision === stored.pointer.revision) {
        return stored
      }

      // Validate the new snapshot before promoting its pointer.
      await manifest(id, next)
      const value: StoredPointer = { pointer: next, previous: stored?.pointer }
      await options.cache.put(
        key(path),
        Response.json(value, { headers: { 'cache-control': 'public, max-age=604800' } }),
      )

      return value
    } catch (error) {
      if (!stored) {
        throw error
      }

      options.log?.(error)

      return stored
    }
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
        `${snapshotPath(id, current.revision)}/pages/${framework}/${version}/${file}.json`,
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
