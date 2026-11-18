import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { renderPage } from './docs/markdown.mjs'

export async function generateDocs(sourceFile = 'docs.sources.json') {
  const sources = JSON.parse(await readFile(sourceFile, 'utf8'))
  const staging = await mkdtemp(path.join(os.tmpdir(), 'jf-docs-'))
  const registry = []
  try {
    for (const [id, source] of Object.entries(sources)) {
      if (!/^[a-z0-9-]+$/.test(id) || !/^[a-f0-9]{40}$/.test(source.commit)) {
        throw Error(`Invalid docs pin for ${id}: expected a 40-character commit`)
      }
      const checkout = path.join(staging, id)
      const git = (...args) => execFileSync('git', args, { cwd: checkout, stdio: 'inherit' })
      await mkdir(checkout)
      git('init', '-q')
      git('remote', 'add', 'origin', source.repository)
      git('fetch', '--depth=1', 'origin', source.commit)
      git('checkout', '--detach', 'FETCH_HEAD')
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
      const { parseFrontmatter, scanMarkdown } = await import(
        pathToFileURL(path.join(checkout, 'scripts/check-docs.mjs')).href
      )
      const pages = []
      const pageExists = {}
      for (const version of manifest.versions) {
        const entries = version.navigation.flatMap((group) =>
          group.pages.map((pageId) => ({ pageId, group: group.title })),
        )
        pageExists[version.id] = entries.map((entry) => entry.pageId)
        const slugFor = (pageId) => `${version.id}${pageId === 'index' ? '' : `/${pageId}`}`
        for (const [index, entry] of entries.entries()) {
          const file = `docs/${version.path}/${entry.pageId}.md`
          const { data, body } = parseFrontmatter(await readFile(path.join(checkout, file), 'utf8'))
          const headings = scanMarkdown(body).headings
          const html = renderPage(body, { file, library: id, headings })
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
          await cp(assets, path.join(staging, 'assets', id, version.path, 'assets'), {
            recursive: true,
          })
        }
      }
      registry.push({
        id,
        name: manifest.library.name,
        description: source.description,
        version: manifest.versions.find((v) => v.id === manifest.defaultVersion).package
          .endpointVersion,
        defaultVersion: manifest.defaultVersion,
        versions: manifest.versions,
        pageExists,
        pages,
        commit: source.commit,
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
    await rm(staging, { recursive: true, force: true })
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await generateDocs(process.argv[2])
}
