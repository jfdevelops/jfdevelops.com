import 'highlight.js/styles/github-dark.css'
import type { DocPage } from './registry'

export function DocContent({ page }: { page: DocPage }) {
  return (
    <article className="docs-content prose prose-neutral max-w-none">
      <h1>{page.title}</h1>
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: HTML is generated at build time with raw HTML disabled and sanitized links. */}
      <div dangerouslySetInnerHTML={{ __html: page.html }} />
    </article>
  )
}
