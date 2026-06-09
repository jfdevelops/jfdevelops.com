import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { DocContent } from '#/docs/DocContent'
import { getDocPage, getPackageDocs } from '#/docs/registry'

export const Route = createFileRoute('/docs/$package/$')({
  loader: ({ params }) => {
    const pkg = getPackageDocs(params.package)
    if (!pkg) {
      throw notFound()
    }

    const page = getDocPage(params.package, params._splat)
    if (!page) {
      throw notFound()
    }

    return { pkg, page }
  },
  component: PackageDocPage,
})

function PackageDocPage() {
  const { pkg, page } = Route.useLoaderData()

  return (
    <main className="page-wrap px-4 py-12">
      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="island-shell h-fit rounded-2xl p-4">
          <p className="island-kicker mb-3">{pkg.name}</p>
          <nav className="flex flex-col gap-2 text-sm">
            {pkg.pages.map((docPage) => (
              <Link
                key={docPage.slug}
                to="/docs/$package/$"
                params={{ package: pkg.name, _splat: docPage.slug }}
                className="nav-link"
                activeProps={{ className: 'nav-link is-active' }}
              >
                {docPage.title}
              </Link>
            ))}
          </nav>
        </aside>

        <section className="island-shell rounded-2xl p-6 sm:p-8">
          <DocContent content={page.content} />
        </section>
      </div>
    </main>
  )
}
