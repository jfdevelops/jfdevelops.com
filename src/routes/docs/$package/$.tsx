import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { DocContent } from '#/docs/DocContent'
import { IslandShell } from '#/components/ui/island-shell'
import { Kicker } from '#/components/ui/kicker'
import { PageWrap } from '#/components/ui/page-wrap'
import { RouterNavLink } from '#/components/ui/nav-link'
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
    <PageWrap as="main" className="px-4 py-12">
      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <IslandShell as="aside" className="h-fit rounded-2xl p-4">
          <Kicker className="mb-3">{pkg.name}</Kicker>
          <nav className="flex flex-col gap-2 text-sm">
            {pkg.pages.map((docPage) => (
              <RouterNavLink
                key={docPage.slug}
                to="/docs/$package/$"
                params={{ package: pkg.name, _splat: docPage.slug }}
              >
                {docPage.title}
              </RouterNavLink>
            ))}
          </nav>
        </IslandShell>

        <IslandShell as="section" className="rounded-2xl p-6 sm:p-8">
          <DocContent content={page.content} />
        </IslandShell>
      </div>
    </PageWrap>
  )
}
