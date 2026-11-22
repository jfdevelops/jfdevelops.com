import { readFile, realpath } from 'node:fs/promises'
import { createServer } from 'node:http'
import path from 'node:path'

const root = await realpath('.docs-snapshots')
createServer(async (request, response) => {
  try {
    const url = new URL(request.url, 'http://127.0.0.1:3031')
    const file = await realpath(path.resolve(root, `.${decodeURIComponent(url.pathname)}`))
    if (!file.startsWith(root + path.sep) || !file.endsWith('.json'))
      throw new Error('Invalid snapshot path')
    response.setHeader('content-type', 'application/json')
    response.end(await readFile(file))
  } catch {
    response.writeHead(404)
    response.end('Snapshot not found')
  }
}).listen(3031, '127.0.0.1', () => console.log('Local docs snapshots: http://127.0.0.1:3031'))
