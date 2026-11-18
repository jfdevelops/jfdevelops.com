import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { createCodeRenderer } from './docs/highlight.mjs'
import { renderPage } from './docs/markdown.mjs'
import { createPageCodeRenderer } from './docs/snippets.mjs'
import { checkoutDocs, selectVersions, validateSources } from './docs/sources.mjs'
import { createVersionTypes } from './docs/types.mjs'

export async function generateDocs(sourceFile = 'docs.sources.json') {
  const sources = JSON.parse(await readFile(sourceFile, 'utf8'))
  validateSources(sources)
  const staging = await mkdtemp(path.join(os.tmpdir(), 'jf-docs-'))
  const registry = []
  const codeRenderer = await createCodeRenderer()

  try {
    for (const [id, library] of Object.entries(sources)) {
      const pages = []
      const versions = []
      const pageExists = {}
      let defaultVersion
      let name

      for (const [channelId, channel] of Object.entries(library.channels)) {
        const checkout = path.join(staging, id, channelId)
        const docsSource = await checkoutDocs(checkout, library.repository, channel)
        console.log(`Docs source ${id}/${channelId}: ${docsSource.commit}`)
        execFileSync(process.execPath, ['scripts/check-docs.mjs'], {
          cwd: checkout,
          stdio: 'inherit',
        })
        const manifest = JSON.parse(await readFile(path.join(checkout, 'docs/docs.json'), 'utf8'))

        if (manifest.schemaVersion !== 1) {
          throw Error(`Unsupported docs schemaVersion: ${manifest.schemaVersion}; expected 1`)
        }

        if (manifest.library.id !== id) {
          throw Error(`Library id mismatch: ${id}`)
        }

        name = manifest.library.name
        const isDefault = channelId === library.defaultChannel

        if (isDefault) {
          defaultVersion = manifest.defaultVersion
        }

        const selected = selectVersions(manifest, channelId, channel, isDefault)
        const routes = Object.fromEntries(selected.map((version) => [version.path, version.id]))
        const { parseFrontmatter, scanMarkdown } = await import(
          pathToFileURL(path.join(checkout, 'scripts/check-docs.mjs')).href
        )

        for (const version of selected) {
          if (versions.some((existing) => existing.id === version.id)) {
            throw Error(`Duplicate docs route ${id}/${version.id}`)
          }

          versions.push({ ...version, note: version.note ?? null, channel: channelId, docsSource })
          const entries = version.navigation.flatMap((group) =>
            group.pages.map((pageId) => ({ pageId, group: group.title })),
          )
          pageExists[version.id] = entries.map((entry) => entry.pageId)
          const slugFor = (pageId) => `${version.id}${pageId === 'index' ? '' : `/${pageId}`}`

          const inputs = await Promise.all(
            entries.map(async (entry) => {
              const file = `docs/${version.path}/${entry.pageId}.md`
              const { data, body } = parseFrontmatter(
                await readFile(path.join(checkout, file), 'utf8'),
              )
              const { headings, fences } = scanMarkdown(body)

              return { file, data, body, headings, fences }
            }),
          )
          const twoslasher = await createVersionTypes(inputs, version)

          for (const [index, entry] of entries.entries()) {
            const { file, data, body, headings } = inputs[index]
            const html = renderPage(body, {
              file,
              library: id,
              headings,
              routes,
              renderCode: createPageCodeRenderer(codeRenderer, twoslasher),
            })
            const renderedIds = [...html.matchAll(/<h[2-6] id="([^"]*)"/g)].map((match) => match[1])

            if (JSON.stringify(renderedIds) !== JSON.stringify(headings.map((h) => h.slug))) {
              throw Error(`Heading mismatch: ${file}`)
            }

            pages.push({
              ...data,
              ...entry,
              slug: slugFor(entry.pageId),
              version: version.id,
              content: body,
              html,
              headings: headings.map((h) => h.slug),
              previous: index ? slugFor(entries[index - 1].pageId) : null,
              next: entries[index + 1] ? slugFor(entries[index + 1].pageId) : null,
            })
          }

          const assets = path.join(checkout, 'docs', version.path, 'assets')

          if (existsSync(assets)) {
            await cp(assets, path.join(staging, 'assets', id, version.id, 'assets'), {
              recursive: true,
            })
          }
        }
      }

      registry.push({
        id,
        name,
        description: library.description,
        defaultVersion,
        version: versions.find((version) => version.id === defaultVersion).package.endpointVersion,
        versions,
        pageExists,
        pages,
      })
    }

    await mkdir('src/docs/generated', { recursive: true })
    await rm('public/docs-assets', { recursive: true, force: true })

    if (existsSync(path.join(staging, 'assets'))) {
      await cp(path.join(staging, 'assets'), 'public/docs-assets', { recursive: true })
    }

    await writeFile('src/docs/generated/registry.json', JSON.stringify(registry))
    console.log(
      `Generated ${registry.reduce((n, pkg) => n + pkg.pages.length, 0)} validated docs pages`,
    )
  } finally {
    codeRenderer.dispose()
    await rm(staging, { recursive: true, force: true })
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await generateDocs(process.argv[2])
}
