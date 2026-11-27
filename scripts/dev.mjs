import { execFile, spawn } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { promisify } from 'node:util'
import { serveDocsSnapshots } from './docs/serve.mjs'

async function mainCommit(repository) {
  try {
    const { stdout } = await promisify(execFile)(
      'git',
      ['ls-remote', repository, 'refs/heads/main'],
      { timeout: 30000 },
    )
    return stdout.split(/\s+/)[0] || null
  } catch {
    // Offline: keep the existing snapshot instead of blocking dev startup.
    return null
  }
}

process.env.CI = 'true'
const { createServer, loadEnv } = await import('vite')
const environment = loadEnv('development', process.cwd(), '')
let snapshots

if (!(process.env.VITE_DOCS_SNAPSHOT_ORIGIN ?? environment.VITE_DOCS_SNAPSHOT_ORIGIN)) {
  const { loadDocsSources } = await import('./docs/load-sources.mjs')
  const config = await loadDocsSources()
  // Rebuild when a snapshot is missing or its library's main branch has moved on.
  let refreshSnapshots = false
  for (const library of config.libraries) {
    try {
      const pointer = JSON.parse(
        await readFile(`.docs-snapshots/${library.id}/current.json`, 'utf8'),
      )
      await readFile(`.docs-snapshots/${library.id}/snapshots/${pointer.revision}/manifest.json`)
      const latest = await mainCommit(library.repository)
      if (latest && pointer.sourceCommit !== latest) {
        console.log(`Docs for ${library.id} are behind main.`)
        refreshSnapshots = true
      }
    } catch {
      refreshSnapshots = true
    }
  }
  if (refreshSnapshots) {
    console.log('Preparing local docs snapshots. This may take several minutes.')
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
// The snapshot server belongs to the process, not Vite's restartable HTTP server.
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, async () => {
    await server.close()
    snapshots?.server.close()
    process.exit(0)
  })
}
await server.listen()
server.printUrls()
