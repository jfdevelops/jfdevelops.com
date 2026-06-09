import { Link, createFileRoute } from '@tanstack/react-router'
import { getPackages } from '#/docs/registry'

export const Route = createFileRoute('/docs/')({
  loader: () => getPackages(),
  component: DocsIndex,
})

function DocsIndex() {
  const packages = Route.useLoaderData()

  return (
    <main className="page-wrap px-4 py-12">
      <section className="island-shell rounded-2xl p-6 sm:p-8">
        <p className="island-kicker mb-2">Documentation</p>
        <h1 className="display-title mb-3 text-4xl font-bold text-[var(--sea-ink)] sm:text-5xl">
          Package docs
        </h1>
        <p className="m-0 max-w-3xl text-base leading-8 text-[var(--sea-ink-soft)]">
          Central documentation for JF Develops packages. Each package contributes
          a <code>docs</code> directory that is bundled into this site.
        </p>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        {packages.map((pkg) => (
          <article key={pkg.name} className="island-shell rounded-2xl p-5">
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
              <p className="mt-3 text-sm text-[var(--sea-ink-soft)]">
                {pkg.indexPage.title}
              </p>
            ) : null}
          </article>
        ))}
      </section>
    </main>
  )
}
