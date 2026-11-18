import { createHash } from 'node:crypto'
import { librarySchema, summarySchema } from '../../src/docs/schema'

export type Asset = { path: string; body: Uint8Array; contentType: string }
export type ArtifactObject = { key: string; body: string | Uint8Array; contentType: string }

export function buildArtifact(input: unknown, assets: Asset[] = []) {
  const library = librarySchema.parse(input)
  if (new Set(assets.map((asset) => asset.path)).size !== assets.length) {
    throw new Error('Duplicate docs assets')
  }

  const hash = createHash('sha256').update(JSON.stringify(library))

  for (const asset of [...assets].sort((a, b) => a.path.localeCompare(b.path))) {
    if (!/^[a-zA-Z0-9_./-]+$/.test(asset.path) || asset.path.split('/').includes('..')) {
      throw new Error(`Invalid docs asset path: ${asset.path}`)
    }

    hash.update(asset.path).update(asset.contentType).update(asset.body)
  }

  const snapshot = hash.digest('hex')
  const prefix = `snapshots/${library.id}/${snapshot}`
  const objects: ArtifactObject[] = assets.map((asset) => ({
    key: `${prefix}/assets/${asset.path}`,
    body: asset.body,
    contentType: asset.contentType,
  }))
  const { pages, ...metadata } = library
  const summary = summarySchema.parse({ ...metadata, pages })
  objects.push({
    key: `${prefix}/manifest.json`,
    body: JSON.stringify(summary),
    contentType: 'application/json',
  })

  for (const page of pages) {
    const html = page.html.replaceAll(
      `/docs-assets/${library.id}/`,
      `/_docs/assets/${library.id}/${snapshot}/`,
    )
    objects.push({
      key: `${prefix}/pages/${page.slug}.json`,
      body: JSON.stringify({ ...page, html }),
      contentType: 'application/json',
    })
  }

  return {
    snapshot,
    library: library.id,
    summary,
    objects,
    pointer: { schemaVersion: 1, library: library.id, snapshot },
  }
}

export async function publishArtifact(
  artifact: ReturnType<typeof buildArtifact>,
  put: (object: ArtifactObject) => Promise<void>,
  warm?: () => Promise<void>,
) {
  // Publication is the final write. A failed upload/warm leaves the old pointer intact.
  for (let index = 0; index < artifact.objects.length; index += 4) {
    await Promise.all(artifact.objects.slice(index, index + 4).map(put))
  }

  await warm?.()
  await put({
    key: `libraries/${artifact.library}.json`,
    body: JSON.stringify(artifact.pointer),
    contentType: 'application/json',
  })
}
