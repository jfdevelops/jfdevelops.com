import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { getMdxComponents } from '@/components/mdx'
import { getDocSource } from './generated-sources'
import {
  getDefaultFramework,
  getDefaultVersion,
  getLibraries,
  getSwitchTarget,
  resolveDocContext,
  resolveDocHref,
} from './registry'

const library = getLibraries()[0]
const framework = library.frameworks[0]
const current = getDefaultVersion(framework)

describe('repository docs', () => {
  for (const library of getLibraries()) {
    for (const framework of library.frameworks) {
      for (const version of framework.versions) {
        it(`loads every ${library.slug}/${framework.id}/${version.id} page and uses library heading IDs`, async () => {
          const source = getDocSource(library.slug, framework.id, version.id)
          expect(source.getPages()).toHaveLength(version.pages.length)
          for (const entry of version.pages) {
            const page = source.getPage(entry.id === 'index' ? [] : entry.id.split('/'))
            expect(page, entry.id).toBeDefined()
            if (!page || entry.id.startsWith('reference/')) continue
            const content = await page.data.load()
            expect(
              content.toc.map((heading) => heading.url.slice(1)),
              entry.id,
            ).toEqual(entry.headings)
          }
        }, 60000)
      }
    }
  }
  it('rejects unknown frameworks, versions, and pages', () => {
    expect(resolveDocContext(library, ['unknown', current.id])).toBeNull()
    expect(resolveDocContext(library, [framework.id, 'v999'])).toBeNull()
    expect(resolveDocContext(library, [framework.id, current.id, 'missing'])).toBeNull()
  })
  it('preserves pages and existing anchors when switching versions', () => {
    const target = getSwitchTarget(
      library,
      framework,
      current,
      'guides/hosted-surfaces',
      'next-steps',
    )
    expect(target.missing).toBe(false)
    expect(target.hash).toBe('next-steps')
    const earlier = framework.versions.find((version) => version.id === 'v1')
    if (!earlier) throw new Error('The React Layout fixture must include v1.')
    const fallback = getSwitchTarget(
      library,
      framework,
      earlier,
      'guides/hosted-surfaces',
      'next-steps',
    )
    expect(fallback.missing).toBe(true)
    expect(fallback.hash).toBe('')
    expect(fallback.url).toBe(`/docs/${library.slug}/${framework.id}/v1`)
  })
  it('resolves relative links across pages and versions, including index pages', () => {
    expect(
      resolveDocHref(library, current, 'overview', './installation.md#companion-packages'),
    ).toBe(`/docs/${library.slug}/${framework.id}/${current.id}/installation#companion-packages`)
    expect(resolveDocHref(library, current, 'guides/migration', '../../v3/index.md')).toBe(
      `/docs/${library.slug}/${framework.id}/v3`,
    )
    expect(resolveDocHref(library, current, 'overview', './reference/index.md')).toBe(
      `/docs/${library.slug}/${framework.id}/${current.id}/reference`,
    )
  })
  it('keeps safe external links and rejects unsafe link schemes', () => {
    expect(resolveDocHref(library, current, 'overview', 'https://example.com')).toBe(
      'https://example.com',
    )
    expect(resolveDocHref(library, current, 'overview', 'javascript:alert(1)')).toBe('#')
    expect(resolveDocHref(library, current, 'overview', '//example.com')).toBe('#')
  })
})

it('generates hover UI and inferred library types for the quick start', async () => {
  const library = getLibraries()[0]
  const framework = getDefaultFramework(library)
  const version = getDefaultVersion(framework)
  const page = getDocSource(library.slug, framework.id, version.id).getPage(['quick-start'])
  if (!page) throw new Error('Missing quick-start fixture')
  const content = await page.data.load()
  const html = renderToStaticMarkup(createElement(content.body, { components: getMdxComponents() }))
  expect(html).toContain('twoslash-hover')
  const directory = path.resolve(
    '.docs-cache/twoslash/v2',
    library.commit,
    library.slug,
    framework.id,
    version.id,
  )
  const results = await Promise.all(
    (await readdir(directory)).map(async (file) =>
      JSON.parse(await readFile(path.join(directory, file), 'utf8')),
    ),
  )
  const example = results.find(
    (result) =>
      result.code.includes("resources: ['services', 'appointments']") &&
      result.code.includes('export const ServicesPage = createResourceLayout'),
  )
  expect(example).toBeDefined()
  const factory = example.nodes.find(
    (node: { target: string }) => node.target === 'createResourceLayout',
  )
  expect(factory?.text).toContain('services')
  expect(factory?.text).not.toMatch(/: any$/)
}, 60000)
