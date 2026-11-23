import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, expect, it } from 'vitest'
import { normalizeRepositoryDocs } from './normalize.mjs'

const directories = []
afterEach(async () => {
  for (const directory of directories.splice(0))
    await rm(directory, { recursive: true, force: true })
})

it('rewrites real links without touching fenced, inline, nested, or indented code examples', async () => {
  const checkout = await mkdtemp(path.join(tmpdir(), 'docs-normalize-'))
  directories.push(checkout)
  await mkdir(path.join(checkout, 'docs'))
  await writeFile(path.join(checkout, 'README.md'), '# Readme')
  const input =
    '[real](../README.md)\n\n```markdown\n[sample](../missing.md)\n```\n\n`[inline](../README.md)`\n\n- ```text\n  [nested](../absent.md)\n  ```\n\nEnd list.\n\n    [indented](../missing.md)\n\n[again](../README.md)\n'
  const file = path.join(checkout, 'docs/index.md')
  await writeFile(file, input)
  await normalizeRepositoryDocs(checkout, {
    repository: 'https://github.com/example/library',
    commit: 'a'.repeat(40),
  })
  const output = await readFile(file, 'utf8')
  expect(output).toContain('[sample](../missing.md)')
  expect(output).toContain('`[inline](../README.md)`')
  expect(output).toContain('[nested](../absent.md)')
  expect(output).toContain('    [indented](../missing.md)')
  expect(output.match(/github.com\/example\/library\/blob/g)).toHaveLength(2)
})
