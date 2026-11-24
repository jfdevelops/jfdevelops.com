import { Link } from '@tanstack/react-router'
import { ArrowUpRight } from 'lucide-react'
import type { DocsLibrary } from '@/routes/docs/-utils/libraries'

type LibraryCardProps = {
  library: DocsLibrary
  version: string | null | undefined
  index: number
}

export function LibraryCard({ library, version, index }: LibraryCardProps) {
  const Icon = library.icon

  return (
    <Link
      to="/docs/$package"
      params={{ package: library.id }}
      className="docs-library-card group"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <span className="docs-library-card-rail" aria-hidden="true" />
      <span className="docs-library-card-top">
        <span className="docs-library-card-icon">
          <Icon aria-hidden="true" />
        </span>
        {version ? <span className="docs-library-card-version">{version}</span> : null}
      </span>
      <span className="docs-library-card-copy">
        <span className="docs-library-card-title">
          {library.title}
          <ArrowUpRight aria-hidden="true" className="docs-library-card-arrow" />
        </span>
        <span className="docs-library-card-description">{library.description}</span>
      </span>
      <span className="docs-library-card-cta">Open docs</span>
    </Link>
  )
}
