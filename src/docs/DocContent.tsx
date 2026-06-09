import { renderMarkdown } from './renderMarkdown'

type DocContentProps = {
  content: string
}

export function DocContent({ content }: DocContentProps) {
  return (
    <article
      className="prose prose-neutral max-w-none text-[var(--sea-ink)]"
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
    />
  )
}
