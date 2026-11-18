import { describe, expect, it } from 'vitest'
import { renderPage } from './markdown.mjs'

function render(body) {
  return renderPage(body, {
    file: 'docs/v4/getting-started.md',
    library: 'react-layout',
    headings: [{ slug: 'details' }],
  })
}
describe('build-time Markdown', () => {
  it('renders tables, nested lists, quotes, headings, callouts and highlighted code', () => {
    const html = render(
      '#### Details\n\n| A | B |\n| --- | --- |\n| a | b |\n\n- first\n  - nested\n\n> **Warning:** Read this\n> and this too\n\n```tsx example=x\nconst X = () => <div />\n```',
    )
    expect(html).toContain('<h4 id="details">')
    expect(html).toContain('<table>')
    expect(html.match(/<ul>/g)).toHaveLength(2)
    expect(html).toContain('docs-callout-warning')
    expect(html).toContain('and this too')
    expect(html).toContain('language-tsx')
    expect(html).toContain('hljs-')
  })
  it('resolves page, cross-version, fragment and image URLs and disables HTML and unsafe URLs', () => {
    const html = render(
      '[local](./guides/lazy-loading.md#loading) [old](../v3/migration.md) ![pic](./assets/x.svg) [external](https://example.com) <script>alert(1)</script> [unsafe](javascript:alert(1)) [http](http://example.com)',
    )
    expect(html).toContain('/docs/react-layout/v4/guides/lazy-loading#loading')
    expect(html).toContain('/docs/react-layout/v3/migration')
    expect(html).toContain('/docs-assets/react-layout/v4/assets/x.svg')
    expect(html).toContain('rel="noopener noreferrer"')
    expect(html).not.toContain('<script>')
    expect(html).not.toContain('href="javascript:')
    expect(html).not.toContain('href="http:')
  })
})

it('rewrites links and assets within a branch channel while preserving cross-version links', () => {
  const html = renderPage(
    '[local](./guides/start.md) [old](../v3/index.md) ![asset](./assets/x.svg)',
    {
      file: 'docs/v4/index.md',
      library: 'library',
      headings: [],
      routes: { v4: 'alpha' },
    },
  )
  expect(html).toContain('/docs/library/alpha/guides/start')
  expect(html).toContain('/docs/library/v3')
  expect(html).toContain('/docs-assets/library/alpha/assets/x.svg')
})
