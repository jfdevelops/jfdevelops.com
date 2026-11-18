import { existsSync } from 'node:fs'
import { mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { getPlatformProxy } from 'wrangler'
import { type Asset, buildArtifact, publishArtifact } from './docs/artifact'

const remote = process.argv.includes('--remote')
const warmUrl = process.env.DOCS_WARM_URL

if (remote && !warmUrl && !process.argv.includes('--bootstrap')) {
  throw new Error(
    'Remote publication requires DOCS_WARM_URL, or --bootstrap for the initial pre-deployment seed',
  )
}

const temp = await mkdtemp(path.join(os.tmpdir(), 'docs-publisher-'))
const configuration = path.join(temp, 'wrangler.json')
await writeFile(
  configuration,
  JSON.stringify({
    name: 'jfdevelops-docs-publisher',
    compatibility_date: '2025-09-02',
    r2_buckets: [{ binding: 'DOCS_BUCKET', bucket_name: 'jfdevelops-docs', remote }],
  }),
)
const proxy = await getPlatformProxy<Pick<Cloudflare.Env, 'DOCS_BUCKET'>>({
  configPath: configuration,
  persist: { path: path.resolve('.wrangler/state/v3') },
  remoteBindings: remote,
})

try {
  const libraries: unknown[] = JSON.parse(
    await readFile('src/docs/generated/registry.json', 'utf8'),
  )

  for (const library of libraries) {
    const preliminary = buildArtifact(library)
    const assets: Asset[] = []
    const root = `public/docs-assets/${preliminary.library}`

    async function collect(directory: string) {
      for (const entry of await readdir(directory, { withFileTypes: true })) {
        const file = path.join(directory, entry.name)

        if (entry.isDirectory()) {
          await collect(file)
        } else {
          if (!entry.isFile()) {
            throw new Error(`Unsupported docs asset: ${file}`)
          }

          const contentType =
            (
              {
                '.svg': 'image/svg+xml',
                '.png': 'image/png',
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.webp': 'image/webp',
                '.gif': 'image/gif',
                '.avif': 'image/avif',
              } as Record<string, string>
            )[path.extname(file)] ?? 'application/octet-stream'
          assets.push({
            path: path.relative(root, file).split(path.sep).join('/'),
            body: await readFile(file),
            contentType,
          })
        }
      }
    }

    if (existsSync(root)) {
      await collect(root)
    }

    const artifact = buildArtifact(library, assets)
    await publishArtifact(
      artifact,
      async (object) => {
        await proxy.env.DOCS_BUCKET.put(object.key, object.body, {
          httpMetadata: { contentType: object.contentType },
        })
      },
      warmUrl
        ? async () => {
            for (const page of artifact.summary.pages) {
              let warmed = false

              for (let attempt = 0; attempt < 3; attempt++) {
                const response = await fetch(
                  `${warmUrl.replace(/\/$/, '')}/docs/${artifact.library}/${page.slug}`,
                  {
                    headers: { 'x-docs-snapshot': artifact.snapshot },
                    signal: AbortSignal.timeout(30000),
                  },
                )

                if (!response.ok || response.headers.get('x-docs-snapshot') !== artifact.snapshot) {
                  throw new Error(`Could not warm ${page.slug}; publication aborted`)
                }

                await response.arrayBuffer()

                if (response.headers.get('x-docs-cache') === 'HIT') {
                  warmed = true
                  break
                }
              }

              if (!warmed) {
                throw new Error(
                  `HTML cache did not become ready for ${page.slug}; publication aborted`,
                )
              }
            }
          }
        : undefined,
    )
    console.log(
      `Published ${artifact.library}: ${artifact.snapshot} (${artifact.summary.pages.length} pages, ${remote ? 'R2' : 'local R2'})`,
    )
  }
} finally {
  await proxy.dispose()
  await rm(temp, { recursive: true, force: true })
}
