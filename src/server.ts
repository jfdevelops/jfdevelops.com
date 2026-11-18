import { env, waitUntil } from 'cloudflare:workers'
import handler, { createServerEntry } from '@tanstack/react-start/server-entry'
import { serveDocsRequest } from './docs/edge'
import { getDocsStorage } from './docs/source.server'

export default createServerEntry({
  async fetch(request, options) {
    return serveDocsRequest(request, {
      storage: await getDocsStorage(),
      cache: await caches.open('docs-html'),
      viewer: env.VERSION_METADATA.id,
      waitUntil,
      render: async (request) => handler.fetch(request, options),
    })
  },
})
