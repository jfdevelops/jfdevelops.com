import { JSDOM } from 'jsdom'
import { createTwoslasher } from 'twoslash'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createCodeRenderer } from './highlight.mjs'
import { createPageCodeRenderer } from './snippets.mjs'
import { collectDependencies } from './types.mjs'

let renderer
beforeAll(async () => {
  renderer = await createCodeRenderer()
}, 30000)
afterAll(() => renderer?.dispose())

describe('Shiki and build-time type hovers', () => {
  it('embeds real inferred types and escaped hover metadata', () => {
    const twoslasher = createTwoslasher({ handbookOptions: { noErrors: true } })
    const html = renderer.render(
      'const count = 42\nconst label = "<script>"\nconsole.log(count, label)',
      'ts',
      twoslasher,
    )
    expect(html).toContain('class="shiki')
    expect(html).toContain('--shiki-light')
    expect(html).toContain('--shiki-dark')
    expect(html).toContain('data-type="const count: 42"')
    expect(new JSDOM(html).window.document.querySelector('script')).toBeNull()
    expect(html).not.toContain('twoslash-popup-container')
  }, 30000)

  it('preserves source text and highlights other languages without fabricated type hovers', () => {
    const html = renderer.render('echo "hello"', 'bash')
    expect(html).toContain('hello')
    expect(html).not.toContain('docs-type-mount')
    expect(renderer.render('<script>alert(1)</script>', 'text')).not.toContain('<script>')
  })

  it('resolves the documented release and companion versions instead of the site package versions', () => {
    const pages = [
      {
        body: '| Adapter | `@scope/adapter` | 1.2.3 |\n',
        fences: [
          {
            language: 'ts',
            content: "import { x } from '@scope/adapter'\nimport { z } from 'zod'",
          },
        ],
      },
    ]
    expect(
      collectDependencies(
        pages,
        { package: { name: '@scope/library', endpointVersion: '4.0.0' } },
        { devDependencies: { zod: '4.6.7', react: '18.3.1', '@types/react': '18.3.28' } },
      ),
    ).toMatchObject({ '@scope/library': '4.0.0', '@scope/adapter': '1.2.3', zod: '4.6.7' })
  })
})

it('uses hidden earlier declarations for subsequent snippets without showing setup code', async () => {
  const renderer = await createCodeRenderer()
  const twoslasher = createTwoslasher({ handbookOptions: { noErrors: true } })
  const render = createPageCodeRenderer(renderer, twoslasher)

  try {
    render('const getCount = () => 42', 'ts')
    const html = render('const count = getCount()', 'ts')
    expect(html).toContain('data-type="const count: number"')
    const text = new JSDOM(html).window.document.querySelector('code').textContent
    expect(text.trim()).toBe('const count = getCount()')
    expect(text).not.toContain('---cut---')
  } finally {
    renderer.dispose()
  }
}, 30000)

it('keeps compiler package resolution inside the version environment', async () => {
  const { loadTypeFiles } = await import('./types.mjs')
  const { mkdtempSync, mkdirSync, writeFileSync, rmSync } = await import('node:fs')
  const os = await import('node:os')
  const path = await import('node:path')
  const root = mkdtempSync(path.join(os.tmpdir(), 'type-snapshot-'))
  mkdirSync(path.join(root, 'node_modules/snapshot'), { recursive: true })
  writeFileSync(path.join(root, 'node_modules/snapshot/package.json'), '{"types":"index.d.ts"}')
  writeFileSync(
    path.join(root, 'node_modules/snapshot/index.d.ts'),
    'export declare const version: "snapshot-only";',
  )

  try {
    const twoslasher = createTwoslasher({
      fsMap: loadTypeFiles(root),
      vfsRoot: '/',
      handbookOptions: { noErrors: true },
    })
    const result = twoslasher(
      'import { version } from "snapshot"\nconst current = version\nimport { defineResourceLayout } from "@jfdevelops/react-layout"',
      'ts',
    )
    expect(
      result.hovers.some((hover) => hover.text.includes('const current: "snapshot-only"')),
    ).toBe(true)
    expect(result.errors).toEqual([])
    expect(
      result.hovers
        .filter((hover) => hover.target === 'defineResourceLayout')
        .every((hover) => !hover.text.includes('resources')),
    ).toBe(true)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
}, 30000)
