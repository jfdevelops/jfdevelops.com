import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { DocContent } from '#/docs/DocContent'
import { IslandShell } from '#/components/ui/island-shell'
import { Kicker } from '#/components/ui/kicker'
import { PageWrap } from '#/components/ui/page-wrap'
import { RouterNavLink } from '#/components/ui/nav-link'
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
    <PageWrap as="main" className="px-4 py-12">
      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <IslandShell as="aside" className="h-fit rounded-2xl p-4">
          <Kicker className="mb-3">Pages</Kicker>
          <nav className="flex flex-col gap-2 text-sm">
            {pkg.pages.map((page) => (
              <RouterNavLink
                key={page.slug}
                to="/docs/$package/$"
                params={{ package: pkg.name, _splat: page.slug }}
              >
                {page.title}
              </RouterNavLink>
            ))}
          </nav>
        </IslandShell>

        <IslandShell as="section" className="rounded-2xl p-6 sm:p-8">
          {indexPage ? (
            <DocContent content={indexPage.content} />
          ) : (
            <div>
              <h1 className="font-display mb-3 text-3xl font-bold text-[var(--sea-ink)]">
                {pkg.name}
              </h1>
              <p className="text-[var(--sea-ink-soft)]">
                Select a page from the sidebar to get started.
              </p>
            </div>
          )}
        </IslandShell>
      </div>
    </PageWrap>
  )
}
