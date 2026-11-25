const maxSnapshotBytes = 8 * 1024 * 1024

/** Reads one snapshot JSON file by its path, such as `cli/current.json`. */
export type SnapshotReader = (path: string) => Promise<unknown>

type SnapshotBucket = {
  get(key: string): Promise<{ size: number; text(): Promise<string> } | null>
}

/** Production: reads from the R2 bucket binding, which is strongly consistent. */
export function createBucketReader(bucket: SnapshotBucket): SnapshotReader {
  return async (path) => {
    const object = await bucket.get(path)

    if (!object) {
      throw new Error(`Documentation snapshot is missing: ${path}`)
    }

    if (object.size > maxSnapshotBytes) {
      throw new Error('Documentation response is too large')
    }

    return JSON.parse(await object.text())
  }
}

/** Development: reads from the local snapshot server started by `pnpm dev`. */
export function createHttpReader(origin: string, fetcher: typeof fetch): SnapshotReader {
  const base = origin.replace(/\/$/, '')

  return async (path) => {
    const response = await fetcher(`${base}/${path}`, {
      signal: AbortSignal.timeout(10000),
      redirect: 'manual',
    })

    if (!response.ok) {
      throw new Error(`Documentation origin returned ${response.status}`)
    }

    if (Number(response.headers.get('content-length') ?? 0) > maxSnapshotBytes) {
      throw new Error('Documentation response is too large')
    }

    const text = await response.text()

    if (text.length > maxSnapshotBytes) {
      throw new Error('Documentation response is too large')
    }

    return JSON.parse(text)
  }
}
