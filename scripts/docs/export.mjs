import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fumadocsMdx } from 'fumadocs-mdx/vite'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'
import { headingText, serializeDocs } from './serialize.mjs'

const output = path.resolve('.docs-snapshots')
const libraries = JSON.parse(await readFile('src/docs/generated-library-manifests.json', 'utf8'))
const server = await createServer({
  configFile: false,
  cacheDir: '.docs-cache/vite-snapshots',
  plugins: [fumadocsMdx()],
  resolve: { tsconfigPaths: true },
  server: { middlewareMode: true, watch: null },
})
try {
  const { getDocSource } = await server.ssrLoadModule('/src/docs/generated-sources.ts')
  const { getMdxComponents } = await server.ssrLoadModule('/src/components/mdx.tsx')
  const { manifestSchema, pageSchema } = await server.ssrLoadModule('/src/docs/snapshot.ts')
  const { renderDocs } = await server.ssrLoadModule('/src/docs/render.tsx')
  const components = Object.fromEntries(
    Object.keys(getMdxComponents()).map((name) => [name, `mdx:${name}`]),
  )
  for (const library of libraries) {
    const folder = path.join(output, library.slug)
    const renderer = process.env.GITHUB_SHA ?? 'local'
    try {
      const prior = JSON.parse(await readFile(path.join(folder, 'current.json'), 'utf8'))
      if (prior.sourceCommit === library.commit && prior.renderer === renderer) {
        console.log(`Unchanged snapshot: ${library.slug}`)
        continue
      }
    } catch (error) {
      if (error.code !== 'ENOENT') throw error
    }
    const pages = []
    for (const framework of library.frameworks) {
      for (const version of framework.versions) {
        const source = getDocSource(library.slug, framework.id, version.id)
        version.tree = JSON.parse(JSON.stringify(source.getPageTree()))
        for (const entry of version.pages) {
          const file = source.getPage(entry.id === 'index' ? [] : entry.id.split('/'))
          if (!file) throw new Error(`Missing generated page: ${entry.id}`)
          const content = await file.data.load()
          const data = pageSchema.parse({
            schemaVersion: 1,
            framework: framework.id,
            version: version.id,
            id: entry.id,
            title: file.data.title,
            description: file.data.description ?? library.description,
            toc: content.toc.map((heading) => ({ ...heading, title: headingText(heading.title) })),
            body: serializeDocs(content.body({ components })),
          })
          renderToStaticMarkup(renderDocs(data.body))
          pages.push({ name: `pages/${framework.id}/${version.id}/${entry.id}.json`, data })
        }
      }
    }
    const manifest = manifestSchema.parse({ schemaVersion: 1, sourceBranch: 'main', library })
    const revision = createHash('sha256').update(JSON.stringify({ manifest, pages })).digest('hex')
    const directory = path.join(folder, 'snapshots', revision)
    await mkdir(directory, { recursive: true })
    for (const page of pages) {
      const file = path.join(directory, page.name)
      await mkdir(path.dirname(file), { recursive: true })
      await writeFile(file, JSON.stringify(page.data))
    }
    await writeFile(path.join(directory, 'manifest.json'), JSON.stringify(manifest))
    // Publish the pointer only after the complete, validated immutable snapshot exists.
    await writeFile(
      path.join(folder, 'current.json'),
      JSON.stringify({ schemaVersion: 1, revision, sourceCommit: library.commit, renderer }),
    )
    console.log(`Snapshot ready: ${library.slug}, ${pages.length} pages, ${revision}`)
  }
} finally {
  await server.close()
}
