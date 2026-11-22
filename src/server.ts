import { env } from 'cloudflare:workers'
import handler, { createServerEntry } from '@tanstack/react-start/server-entry'
import { serveDocsRequest } from './docs/edge'
import { getRuntimeDocs } from './docs/source.server'

export default createServerEntry({
  async fetch(request, options) {
    return serveDocsRequest(request, {
      docs: await getRuntimeDocs(),
      cache: await caches.open('docs-html'),
      viewer: env.VERSION_METADATA.id,
      render: async (request) => handler.fetch(request, options),
    })
  },
})
