import { waitUntil } from 'cloudflare:workers'
import config from '../../docs.sources.json'
import { createRuntimeDocs } from './runtime'

export async function getRuntimeDocs() {
  const localOrigin = import.meta.env.DEV ? import.meta.env.VITE_DOCS_SNAPSHOT_ORIGIN : undefined
  if (localOrigin && !/^http:\/\/(?:127\.0\.0\.1|localhost):[0-9]+$/.test(localOrigin))
    throw new Error('Local docs snapshots must use a loopback origin')
  return createRuntimeDocs({
    repositories: config.libraries,
    origin:
      localOrigin ??
      `https://raw.githubusercontent.com/${config.snapshotRepository}/${config.snapshotBranch}`,
    cache: await caches.open('docs-snapshots-v1'),
    fetch: (input, init) => fetch(input, init),
    waitUntil,
    log(error) {
      console.error('Docs refresh failed', error)
    },
  })
}
