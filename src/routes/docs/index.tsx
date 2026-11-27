import { createFileRoute } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { getDocsLibraryVersions } from '@/routes/docs/-utils/client'
import { docsLibraries, libraryGroups } from '@/routes/docs/-utils/libraries'
import { ActionLink } from './-components/action-link'
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
    <DocsHome>
      <div className="mx-auto w-full max-w-5xl px-6 pb-24">
        <section className="flex animate-rise-in flex-col items-center pt-20 pb-14 text-center">
          <p className="mb-4 text-[0.75rem] font-semibold tracking-[0.16em] text-lagoon-deep uppercase">
            JF Develops · Documentation
          </p>
          <h1 className="max-w-[18ch] font-display text-[clamp(2.25rem,5vw,3.25rem)] leading-[1.05] font-bold tracking-[-0.04em] text-sea-ink">
            Build with better building blocks.
          </h1>
          <p className="mt-5 max-w-xl text-[0.975rem] leading-[1.75] text-sea-ink-soft">
            Type-safe libraries, developer tools, practical guides, and API references.
            <br className="hidden sm:block" /> Everything you need to start putting the pieces
            together.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            {firstLibrary ? (
              <ActionLink to="/docs/$package" params={{ package: firstLibrary.id }}>
                Get started <ArrowRight aria-hidden="true" className="size-3.5" />
              </ActionLink>
            ) : null}
            <ActionLink to="/docs" hash="libraries" variant="secondary">
              Browse libraries
            </ActionLink>
          </div>
        </section>
        <div id="libraries" className="grid scroll-mt-24 gap-11">
          {libraryGroups.map((group) => (
            <section key={group.id} aria-labelledby={`${group.id}-title`}>
              <h2
                id={`${group.id}-title`}
                className="mb-4 text-[0.8rem] font-bold tracking-[0.08em] text-sea-ink-soft uppercase"
              >
                {group.title}
              </h2>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,18.5rem),1fr))] gap-4">
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
