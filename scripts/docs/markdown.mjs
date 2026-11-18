import path from 'node:path'
import MarkdownIt from 'markdown-it'

export function renderPage(body, { file, library, headings, routes = {}, renderCode }) {
  const md = new MarkdownIt({ html: false })
  if (renderCode) {
    md.renderer.rules.fence = (tokens, index) => {
      const token = tokens[index]
      const language = token.info.trim().split(/\s+/)[0]

      return renderCode(token.content, language)
    }
  }
  let heading = 0
  md.renderer.rules.heading_open = (tokens, index, options, _env, renderer) => {
    tokens[index].attrSet('id', headings[heading++].slug)

    return renderer.renderToken(tokens, index, options)
  }
  const rewrite = (href, image = false) => {
    if (href.startsWith('#')) {
      return href
    }
    if (/^https:\/\//.test(href)) {
      return image ? '#' : href
    }
    if (/^[a-z]+:|^\/\//i.test(href)) {
      return '#'
    }
    const [target, fragment] = href.split('#')
    const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(file), target))
    const [sourceVersion, ...segments] = resolved.slice(5).split('/')
    const route = routes[sourceVersion] ?? sourceVersion

    if (image && resolved.startsWith('docs/')) {
      return `/docs-assets/${library}/${route}/${segments.join('/')}`
    }
    if (!resolved.startsWith('docs/') || !resolved.endsWith('.md')) {
      return '#'
    }
    const slug = `${route}/${segments.join('/').slice(0, -3)}`.replace(/\/index$/, '')

    return `/docs/${library}/${slug}${fragment ? `#${fragment}` : ''}`
  }
  md.core.ruler.after('inline', 'docs-links', (state) => {
    for (const block of state.tokens) {
      for (const token of block.children ?? []) {
        if (token.type === 'link_open') {
          token.attrSet('href', rewrite(token.attrGet('href') ?? ''))
          token.attrSet('rel', 'noopener noreferrer')
        }
        if (token.type === 'image') {
          token.attrSet('src', rewrite(token.attrGet('src') ?? '', true))
        }
      }
    }
    state.tokens.forEach((token, i) => {
      if (token.type === 'blockquote_open') {
        const opener = state.tokens[i + 2]?.content ?? ''
        const kind = /^\*\*(Note|Tip|Warning):\*\*/.exec(opener)?.[1]
        if (kind) {
          token.attrSet('class', `docs-callout docs-callout-${kind.toLowerCase()}`)
        }
      }
    })
  })

  return md.render(body)
}
