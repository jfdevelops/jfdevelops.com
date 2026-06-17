import { Link, createFileRoute } from '@tanstack/react-router'
import { IslandShell } from '#/components/ui/island-shell'
import { Kicker } from '#/components/ui/kicker'
import { PageWrap } from '#/components/ui/page-wrap'
import { getPackages } from '#/docs/registry'

export const Route = createFileRoute('/docs/')({
  loader: () => getPackages(),
  component: DocsIndex,
})

function DocsIndex() {
  const packages = Route.useLoaderData()

  return (
    <PageWrap as="main" className="px-4 py-12">
      <IslandShell as="section" className="rounded-2xl p-6 sm:p-8">
        <Kicker className="mb-2">Documentation</Kicker>
        <h1 className="font-display mb-3 text-4xl font-bold text-[var(--sea-ink)] sm:text-5xl">
          Package docs
        </h1>
        <p className="m-0 max-w-3xl text-base leading-8 text-[var(--sea-ink-soft)]">
          Central documentation for JF Develops packages. Each package contributes a{' '}
          <code>docs</code> directory that is bundled into this site.
        </p>
      </IslandShell>

      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        {packages.map((pkg) => (
          <IslandShell as="article" key={pkg.name} className="rounded-2xl p-5">
            <h2 className="mb-2 text-lg font-semibold text-[var(--sea-ink)]">
              <Link
                to="/docs/$package"
                params={{ package: pkg.name }}
                className="no-underline hover:text-[var(--lagoon-deep)]"
              >
                {pkg.name}
              </Link>
            </h2>
            <p className="m-0 text-sm text-[var(--sea-ink-soft)]">
              {pkg.pageCount} {pkg.pageCount === 1 ? 'page' : 'pages'}
            </p>
            {pkg.indexPage ? (
              <p className="mt-3 text-sm text-[var(--sea-ink-soft)]">{pkg.indexPage.title}</p>
            ) : null}
          </IslandShell>
        ))}
      </section>
    </PageWrap>
  )
}
