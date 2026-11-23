import { spawn } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { serveDocsSnapshots } from './docs/serve.mjs'

process.env.CI = 'true'
const { createServer, loadEnv } = await import('vite')
const environment = loadEnv('development', process.cwd(), '')
let snapshots

if (!(process.env.VITE_DOCS_SNAPSHOT_ORIGIN ?? environment.VITE_DOCS_SNAPSHOT_ORIGIN)) {
  const config = JSON.parse(await readFile('docs.sources.json', 'utf8'))
  let missingSnapshot = false
  for (const library of config.libraries) {
    try {
      const pointer = JSON.parse(
        await readFile(`.docs-snapshots/${library.id}/current.json`, 'utf8'),
      )
      await readFile(`.docs-snapshots/${library.id}/snapshots/${pointer.revision}/manifest.json`)
    } catch {
      missingSnapshot = true
    }
  }
  if (missingSnapshot) {
    console.log('Preparing local docs snapshots for the first run. This may take several minutes.')
    for (const script of ['scripts/generate-doc-sources.mjs', 'scripts/docs/export.mjs']) {
      await new Promise((resolve, reject) => {
        const child = spawn(process.execPath, [script], { stdio: 'inherit', env: process.env })
        child.once('error', reject)
        child.once('exit', (code) =>
          code === 0 ? resolve() : reject(new Error(`${script} failed (${code})`)),
        )
      })
    }
  }
  snapshots = await serveDocsSnapshots()
  process.env.VITE_DOCS_SNAPSHOT_ORIGIN = snapshots.origin
  console.log(`Using local docs snapshots: ${snapshots.origin}`)
}

const server = await createServer({
  server: {
    host: process.env.HOST ?? '127.0.0.1',
    port: Number(process.env.PORT ?? 3000),
    strictPort: true,
  },
})
server.httpServer?.once('close', () => snapshots?.server.close())
await server.listen()
server.printUrls()
