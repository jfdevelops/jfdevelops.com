import { env } from 'cloudflare:workers'
import { docsSources } from './libraries'
import { createBucketReader, createHttpReader } from './reader'
import { createRuntimeDocs } from './runtime'

function snapshotReader() {
  const localOrigin = import.meta.env.DEV ? import.meta.env.VITE_DOCS_SNAPSHOT_ORIGIN : undefined

  if (!localOrigin) {
    return createBucketReader(env.DOCS_SNAPSHOTS)
  }

  if (!/^http:\/\/(?:127\.0\.0\.1|localhost):[0-9]+$/.test(localOrigin)) {
    throw new Error('Local docs snapshots must use a loopback origin')
  }

  return createHttpReader(localOrigin, (input, init) => fetch(input, init))
}

export async function getRuntimeDocs() {
  return createRuntimeDocs({
    repositories: docsSources.libraries,
    read: snapshotReader(),
    cache: await caches.open('docs-snapshots-v2'),
    log(error) {
      console.error('Docs snapshot read failed', error)
    },
  })
}
