import { renderMarkdown } from './render-markdown'

type DocContentProps = {
  content: string
}

export function DocContent({ content }: DocContentProps) {
  return (
    <article
      className="docs-content prose prose-neutral max-w-none"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: renderMarkdown escapes HTML and sanitizes link targets.
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
    />
  )
}
