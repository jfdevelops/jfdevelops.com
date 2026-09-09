import { describe, expect, it } from 'vitest'
import { renderMarkdown } from './render-markdown'

describe('renderMarkdown', () => {
  it('renders common documentation blocks', () => {
    const html = renderMarkdown(`# Guide

- First item
- Second item

1. Install
2. Build

> A useful note`)

    expect(html).toContain('<h1>Guide</h1>')
    expect(html).toContain('<ul><li>First item</li><li>Second item</li></ul>')
    expect(html).toContain('<ol><li>Install</li><li>Build</li></ol>')
    expect(html).toContain('<blockquote><p>A useful note</p></blockquote>')
  })

  it('escapes markup and rejects unsafe links', () => {
    const html = renderMarkdown('<script>alert(1)</script> [bad](javascript:alert(1))')

    expect(html).not.toContain('<script>')
    expect(html).not.toContain('href="javascript:')
    expect(html).toContain('href="#"')
  })
})
