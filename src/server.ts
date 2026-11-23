import { env } from 'cloudflare:workers'
import handler, { createServerEntry } from '@tanstack/react-start/server-entry'
import docsConfig from '../docs.sources.json'
import { serveDocsAsset } from './routes/docs/-utils/assets.server'
import { serveDocsRequest } from './routes/docs/-utils/edge'
import { getRuntimeDocs } from './routes/docs/-utils/source.server'

export default createServerEntry({
  async fetch(request, options) {
    if (new URL(request.url).pathname.startsWith('/docs-assets/')) {
      return serveDocsAsset(request, {
        repositories: docsConfig.libraries,
        cache: await caches.open('docs-assets-v1'),
        fetch: (input, init) => fetch(input, init),
      })
    }

    return serveDocsRequest(request, {
      docs: await getRuntimeDocs(),
      cache: await caches.open('docs-html'),
      viewer: env.VERSION_METADATA.id,
      render: async (currentRequest) => handler.fetch(currentRequest, options),
    })
  },
})

