import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { getDocsLibraryVersions } from '@/routes/docs/-utils/client'
import { docsLibraries, libraryGroups } from '@/routes/docs/-utils/libraries'
import { DocsHome } from './-components/layout'
import { LibraryCard } from './-components/library-card'
import { DocsError, DocsNotFound } from './-components/status'

export const Route = createFileRoute('/docs/')({
  notFoundComponent: DocsNotFound,
  errorComponent: DocsError,
  loader: () => getDocsLibraryVersions(),
  head: () => ({
    meta: [
      { title: 'Documentation — JF Develops' },
      {
        name: 'description',
        content:
          'Guides, examples, and API documentation for JF Develops libraries and developer tools.',
      },
    ],
  }),
  component: DocsIndex,
})

function DocsIndex() {
  const versions = Route.useLoaderData()
  const firstLibrary = docsLibraries[0]

  return (
    <DocsHome className="docs-home">
      <div className="mx-auto w-full max-w-5xl px-6 pb-24">
        <section className="docs-home-hero">
          <p className="docs-home-kicker">JF Develops · Documentation</p>
          <h1 className="docs-home-title">Build with better building blocks.</h1>
          <p className="docs-home-lede">
            Type-safe libraries, developer tools, practical guides, and API references.
            <br className="hidden sm:block" /> Everything you need to start putting the pieces
            together.
          </p>
          <div className="docs-home-actions">
            {firstLibrary ? (
              <Link
                to="/docs/$package"
                params={{ package: firstLibrary.id }}
                className="docs-home-action-primary"
              >
                Get started <ArrowRight aria-hidden="true" className="size-3.5" />
              </Link>
            ) : null}
            <a href="#libraries" className="docs-home-action-secondary">
              Browse libraries
            </a>
          </div>
        </section>
        <div id="libraries" className="docs-home-catalog">
          {libraryGroups.map((group) => (
            <section
              key={group.id}
              aria-labelledby={`${group.id}-title`}
              className="docs-home-group"
            >
              <h2 id={`${group.id}-title`} className="docs-home-group-title">
                {group.title}
              </h2>
              <div className="docs-home-grid">
                {group.libraries.map((library, index) => (
                  <LibraryCard
                    key={library.id}
                    library={library}
                    version={versions[library.id]}
                    index={index}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </DocsHome>
  )
}
