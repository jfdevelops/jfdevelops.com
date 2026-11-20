import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { collectLibrary } from './collect.mjs'
import { prepareLibrary } from './prepare.mjs'

const directories = []
afterEach(async () => {
  await Promise.all(
    directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })),
  )
})

describe('Markdown-only repository ingestion', () => {
  it('derives framework navigation, package identity and versions without repo scripts', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'site-docs-'))
    directories.push(root)
    await writeFile(
      path.join(root, 'package.json'),
      JSON.stringify({ name: '@example/workspace', version: '1.0.0' }),
    )
    await mkdir(path.join(root, 'packages/core'), { recursive: true })
    await writeFile(
      path.join(root, 'packages/core/package.json'),
      JSON.stringify({ name: '@example/forms', version: '1.2.0' }),
    )
    for (const framework of ['react', 'core']) {
      const directory = path.join(root, 'docs/framework', framework, 'v1')
      await mkdir(directory, { recursive: true })
      await writeFile(
        path.join(directory, 'overview.md'),
        '---\ntitle: Overview\ndescription: Learn forms.\norder: 10\n---\n\nBuild a form.\n\n## Next steps\n\nRead this page.\n',
      )
    }
    const registration = {
      repository: 'https://github.com/example/forms',
      commit: 'a'.repeat(40),
      description: 'Forms.',
      docs: { package: 'packages/core', name: 'Forms' },
    }
    const run = vi.fn()
    await prepareLibrary(root, registration, run, false)
    expect(run).not.toHaveBeenCalled()
    const manifest = JSON.parse(await readFile(path.join(root, 'docs/docs.json'), 'utf8'))
    const library = await collectLibrary(root, manifest, registration)
    expect(library.packageName).toBe('@example/forms')
    expect(library.name).toBe('Forms')
    expect(library.frameworks.map((framework) => framework.id).sort()).toEqual(['core', 'react'])
    expect(library.frameworks.every((framework) => framework.defaultVersion === 'v1')).toBe(true)
    expect(library.pageCount).toBe(2)
  })
})
