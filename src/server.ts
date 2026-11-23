import { env } from 'cloudflare:workers'
import handler, { createServerEntry } from '@tanstack/react-start/server-entry'
import docsConfig from '../docs.sources.json'
import { serveDocsAsset } from './docs/assets.server'
import { serveDocsRequest } from './docs/edge'
import { getRuntimeDocs } from './docs/source.server'

export default createServerEntry({
  async fetch(request, options) {
    if (new URL(request.url).pathname.startsWith('/docs-assets/'))
      return serveDocsAsset(request, {
        repositories: docsConfig.libraries,
        cache: await caches.open('docs-assets-v1'),
        fetch: (input, init) => fetch(input, init),
      })
    return serveDocsRequest(request, {
      docs: await getRuntimeDocs(),
      cache: await caches.open('docs-html'),
      viewer: env.VERSION_METADATA.id,
      render: async (request) => handler.fetch(request, options),
    })
  },
})
