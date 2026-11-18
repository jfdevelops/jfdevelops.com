import { readFile } from 'node:fs/promises'
import { buildArtifact } from './docs/artifact'

const libraries: unknown[] = JSON.parse(await readFile('src/docs/generated/registry.json', 'utf8'))

for (const library of libraries) {
  const artifact = buildArtifact(library)
  console.log(`Verified ${artifact.library}: ${artifact.summary.pages.length} pages`)
}
