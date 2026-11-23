import { readFile, realpath } from 'node:fs/promises'
import { createServer } from 'node:http'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

export async function serveDocsSnapshots(port = 0) {
  const root = await realpath('.docs-snapshots')
  const server = createServer(async (request, response) => {
    try {
      const url = new URL(request.url, 'http://127.0.0.1')
      const file = await realpath(path.resolve(root, `.${decodeURIComponent(url.pathname)}`))
      if (!file.startsWith(root + path.sep) || !file.endsWith('.json'))
        throw new Error('Invalid snapshot path')
      response.setHeader('content-type', 'application/json')
      response.end(await readFile(file))
    } catch {
      response.writeHead(404)
      response.end('Snapshot not found')
    }
  })
  await new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(port, '127.0.0.1', resolve)
  })
  return { server, origin: `http://127.0.0.1:${server.address().port}` }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { origin } = await serveDocsSnapshots(3031)
  console.log(`Local docs snapshots: ${origin}`)
}
