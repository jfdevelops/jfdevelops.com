function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function sanitizeHref(value: string) {
  const trimmedValue = value.trim()
  const isSafe =
    trimmedValue.startsWith('/') ||
    trimmedValue.startsWith('#') ||
    trimmedValue.startsWith('https://') ||
    trimmedValue.startsWith('http://') ||
    trimmedValue.startsWith('mailto:')

  return isSafe ? escapeHtml(trimmedValue) : '#'
}

function inlineMarkdown(value: string) {
  const escapedValue = escapeHtml(value)

  return escapedValue
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/_([^_]+)_/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label: string, href: string) => {
      return `<a href="${sanitizeHref(href)}">${label}</a>`
    })
}

export function renderMarkdown(markdown: string) {
  const lines = markdown.split('\n')
  const html: string[] = []
  let inCodeBlock = false
  let codeLines: string[] = []
  let paragraphLines: string[] = []
  let listType: 'ol' | 'ul' | null = null

  function flushParagraph() {
    if (paragraphLines.length === 0) {
      return
    }

    html.push(`<p>${inlineMarkdown(paragraphLines.join(' '))}</p>`)
    paragraphLines = []
  }

  function flushList() {
    if (!listType) {
      return
    }

    html.push(`</${listType}>`)
    listType = null
  }

  function flushTextBlocks() {
    flushParagraph()
    flushList()
  }

  for (const line of lines) {
    if (line.startsWith('```')) {
      flushTextBlocks()

      if (inCodeBlock) {
        html.push(`<pre><code>${escapeHtml(codeLines.join('\n'))}</code></pre>`)
        codeLines = []
        inCodeBlock = false
      } else {
        inCodeBlock = true
      }

      continue
    }

    if (inCodeBlock) {
      codeLines.push(line)
      continue
    }

    if (line.startsWith('# ')) {
      flushTextBlocks()
      html.push(`<h1>${inlineMarkdown(line.slice(2))}</h1>`)
      continue
    }

    if (line.startsWith('## ')) {
      flushTextBlocks()
      html.push(`<h2>${inlineMarkdown(line.slice(3))}</h2>`)
      continue
    }

    if (line.startsWith('### ')) {
      flushTextBlocks()
      html.push(`<h3>${inlineMarkdown(line.slice(4))}</h3>`)
      continue
    }

    const unorderedItem = line.match(/^[-*]\s+(.+)$/)
    const orderedItem = line.match(/^\d+\.\s+(.+)$/)
    if (unorderedItem || orderedItem) {
      flushParagraph()
      const nextListType = unorderedItem ? 'ul' : 'ol'

      if (listType !== nextListType) {
        flushList()
        listType = nextListType
        html.push(`<${listType}>`)
      }

      html.push(`<li>${inlineMarkdown((unorderedItem ?? orderedItem)?.[1] ?? '')}</li>`)
      continue
    }

    if (line.startsWith('> ')) {
      flushTextBlocks()
      html.push(`<blockquote><p>${inlineMarkdown(line.slice(2))}</p></blockquote>`)
      continue
    }

    if (line.trim() === '---') {
      flushTextBlocks()
      html.push('<hr>')
      continue
    }

    if (line.trim() === '') {
      flushTextBlocks()
      continue
    }

    flushList()
    paragraphLines.push(line.trim())
  }

  flushTextBlocks()

  if (inCodeBlock && codeLines.length > 0) {
    html.push(`<pre><code>${escapeHtml(codeLines.join('\n'))}</code></pre>`)
  }

  return html.join('')
}
