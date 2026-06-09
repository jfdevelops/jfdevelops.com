function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function inlineMarkdown(value: string) {
  return escapeHtml(value)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
}

export function renderMarkdown(markdown: string) {
  const lines = markdown.split('\n')
  const html: string[] = []
  let inCodeBlock = false
  let codeLines: string[] = []
  let paragraphLines: string[] = []

  function flushParagraph() {
    if (paragraphLines.length === 0) {
      return
    }

    html.push(`<p>${inlineMarkdown(paragraphLines.join(' '))}</p>`)
    paragraphLines = []
  }

  for (const line of lines) {
    if (line.startsWith('```')) {
      flushParagraph()

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
      flushParagraph()
      html.push(`<h1>${inlineMarkdown(line.slice(2))}</h1>`)
      continue
    }

    if (line.startsWith('## ')) {
      flushParagraph()
      html.push(`<h2>${inlineMarkdown(line.slice(3))}</h2>`)
      continue
    }

    if (line.startsWith('### ')) {
      flushParagraph()
      html.push(`<h3>${inlineMarkdown(line.slice(4))}</h3>`)
      continue
    }

    if (line.trim() === '') {
      flushParagraph()
      continue
    }

    paragraphLines.push(line.trim())
  }

  flushParagraph()

  if (inCodeBlock && codeLines.length > 0) {
    html.push(`<pre><code>${escapeHtml(codeLines.join('\n'))}</code></pre>`)
  }

  return html.join('')
}
