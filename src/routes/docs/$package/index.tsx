import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { DocContent } from '#/docs/DocContent'
import { getPackageDocs } from '#/docs/registry'

export const Route = createFileRoute('/docs/$package/')({
  loader: ({ params }) => {
    const pkg = getPackageDocs(params.package)
    if (!pkg) {
      throw notFound()
    }

    const indexPage = pkg.pages.find((page) => page.slug === 'index')
    return { pkg, indexPage }
  },
  component: PackageDocsIndex,
})

function PackageDocsIndex() {
  const { pkg, indexPage } = Route.useLoaderData()

  return (
    <main className="page-wrap px-4 py-12">
      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="island-shell h-fit rounded-2xl p-4">
          <p className="island-kicker mb-3">Pages</p>
          <nav className="flex flex-col gap-2 text-sm">
            {pkg.pages.map((page) => (
              <Link
                key={page.slug}
                to="/docs/$package/$"
                params={{ package: pkg.name, _splat: page.slug }}
                className="nav-link"
                activeProps={{ className: 'nav-link is-active' }}
              >
                {page.title}
              </Link>
            ))}
          </nav>
        </aside>

        <section className="island-shell rounded-2xl p-6 sm:p-8">
          {indexPage ? (
            <DocContent content={indexPage.content} />
          ) : (
            <div>
              <h1 className="display-title mb-3 text-3xl font-bold text-[var(--sea-ink)]">
                {pkg.name}
              </h1>
              <p className="text-[var(--sea-ink-soft)]">
                Select a page from the sidebar to get started.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
