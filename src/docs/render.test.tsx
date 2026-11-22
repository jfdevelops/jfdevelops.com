import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { expect, it } from 'vitest'
import { getMdxComponents } from '@/components/mdx'
import { serializeDocs } from '../../scripts/docs/serialize.mjs'
import { renderDocs } from './render'
import { pageSchema } from './snapshot'

it('renders portable Fumadocs components and type hover UI without evaluating JavaScript', () => {
  const components = getMdxComponents()
  const tree = serializeDocs(
    createElement(
      'mdx:Popup',
      null,
      createElement('mdx:PopupTrigger', null, 'createLayout'),
      createElement('mdx:PopupContent', null, 'CreateLayout<"services">'),
    ),
  )
  const html = renderToStaticMarkup(renderDocs(tree, components))
  expect(html).toContain('createLayout')
  expect(html).toContain('twoslash-hover')
})

it('preserves package-manager tabs through JSON serialization and Fumadocs rendering', () => {
  const tree = serializeDocs(
    createElement(
      'mdx:CodeBlockTabs',
      { defaultValue: 'npm' },
      createElement(
        'mdx:CodeBlockTabsList',
        null,
        ...['npm', 'pnpm', 'yarn', 'bun'].map((value) =>
          createElement('mdx:CodeBlockTabsTrigger', { key: value, value }, value),
        ),
      ),
      ...['npm', 'pnpm', 'yarn', 'bun'].map((value) =>
        createElement('mdx:CodeBlockTab', { key: value, value }, `${value} install`),
      ),
    ),
  )
  const parsed = pageSchema.parse({
    schemaVersion: 1,
    framework: 'react',
    version: 'v1',
    id: 'overview',
    title: 'Install',
    description: '',
    toc: [],
    body: JSON.parse(JSON.stringify(tree)),
  })
  expect(renderToStaticMarkup(renderDocs(parsed.body)).match(/role="tab"/g)).toHaveLength(4)
})

it('rejects executable tags, event handlers, and unsafe URLs', () => {
  expect(() => renderDocs({ tag: 'script', props: {}, children: ['alert(1)'] })).toThrow()
  expect(() =>
    renderDocs({ tag: 'a', props: { href: 'javascript:alert(1)' }, children: [] }),
  ).toThrow()
  expect(() =>
    serializeDocs(createElement('button', { type: 'button', onClick() {} }, 'Run')),
  ).toThrow()
})
