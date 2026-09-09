import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight, BookOpen, Boxes, GitBranch } from 'lucide-react'
import { FeatureCard, IslandShell } from '#/components/ui/island-shell'
import { Kicker } from '#/components/ui/kicker'
import { PageWrap } from '#/components/ui/page-wrap'
import { getPackages } from '#/docs/registry'

export const Route = createFileRoute('/docs/')({
  loader: () => getPackages(),
  head: () => ({
    meta: [
      { title: 'Documentation — JF Develops' },
      {
        name: 'description',
        content: 'Guides and API documentation for open-source JF Develops libraries.',
      },
    ],
  }),
  component: DocsIndex,
})

function DocsIndex() {
  const packages = Route.useLoaderData()

  return (
    <PageWrap as="main" className="px-4 py-8 sm:py-12">
      <IslandShell
        as="section"
        className="relative overflow-hidden rounded-3xl px-6 py-10 sm:px-10 sm:py-14"
      >
        <div
          aria-hidden="true"
          className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[color-mix(in_oklab,var(--sea-ink)_8%,transparent)] blur-3xl"
        />
        <div className="relative max-w-3xl">
          <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--sea-ink)] text-[var(--foam)] shadow-lg">
            <BookOpen aria-hidden="true" className="h-5 w-5" />
          </div>
          <Kicker className="mb-2">JF Develops documentation</Kicker>
          <h1 className="font-display mb-4 text-4xl font-bold leading-tight text-[var(--sea-ink)] sm:text-6xl">
            Build with the libraries behind our work.
          </h1>
          <p className="m-0 max-w-2xl text-base leading-8 text-[var(--sea-ink-soft)] sm:text-lg">
            Practical guides, examples, and API references for every public JF Develops library,
            gathered in one place.
          </p>
        </div>
      </IslandShell>

      <section aria-labelledby="library-heading" className="mt-10">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <Kicker className="mb-2">Library index</Kicker>
            <h2 id="library-heading" className="m-0 text-2xl font-semibold text-[var(--sea-ink)]">
              Choose a package
            </h2>
          </div>
          <p className="m-0 text-sm text-[var(--sea-ink-soft)]">
            {packages.length} {packages.length === 1 ? 'library' : 'libraries'} documented
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg) => (
            <FeatureCard
              as="article"
              key={pkg.id}
              className="group relative flex min-h-64 flex-col rounded-2xl p-5"
            >
              <div className="mb-5 flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--chip-bg)]">
                  <Boxes aria-hidden="true" className="h-5 w-5 text-[var(--sea-ink)]" />
                </span>
                <span className="rounded-full border border-[var(--line)] px-2.5 py-1 text-xs font-semibold text-[var(--sea-ink-soft)]">
                  v{pkg.version}
                </span>
              </div>
              <h3 className="mb-2 break-words text-lg font-semibold text-[var(--sea-ink)]">
                <Link
                  to="/docs/$package"
                  params={{ package: pkg.id }}
                  className="after:absolute after:inset-0 after:content-[''] no-underline hover:text-[var(--lagoon-deep)]"
                >
                  {pkg.name}
                </Link>
              </h3>
              <p className="m-0 flex-1 text-sm leading-6 text-[var(--sea-ink-soft)]">
                {pkg.description}
              </p>
              <div className="mt-6 flex items-center justify-between border-t border-[var(--line)] pt-4 text-xs font-semibold text-[var(--sea-ink-soft)]">
                <span>
                  {pkg.pageCount} {pkg.pageCount === 1 ? 'page' : 'pages'}
                </span>
                <ArrowRight
                  aria-hidden="true"
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                />
              </div>
            </FeatureCard>
          ))}
        </div>
      </section>

      <section className="mt-10 grid gap-4 sm:grid-cols-2">
        <IslandShell className="rounded-2xl p-5">
          <GitBranch aria-hidden="true" className="mb-4 h-5 w-5 text-[var(--sea-ink)]" />
          <h2 className="mb-2 text-base font-semibold text-[var(--sea-ink)]">
            Owned by each library
          </h2>
          <p className="m-0 text-sm leading-6 text-[var(--sea-ink-soft)]">
            Documentation stays next to the code it explains and is pulled into this site at build
            time.
          </p>
        </IslandShell>
        <IslandShell className="rounded-2xl p-5">
          <BookOpen aria-hidden="true" className="mb-4 h-5 w-5 text-[var(--sea-ink)]" />
          <h2 className="mb-2 text-base font-semibold text-[var(--sea-ink)]">
            One reading experience
          </h2>
          <p className="m-0 text-sm leading-6 text-[var(--sea-ink-soft)]">
            Every package gets the same responsive navigation, typography, and searchable URL
            structure.
          </p>
        </IslandShell>
      </section>
    </PageWrap>
  )
}
