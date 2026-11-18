import { createFileRoute, notFound, redirect } from '@tanstack/react-router'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { DocBody } from '@/docs/body'
import { DocContent } from '@/docs/content'
import { getDocsContext } from '@/docs/queries'
import { DocsBreadcrumb } from '../-components/breadcrumb'
import { DocsProvider } from '../-components/context'
import { DocsShell } from '../-components/docs-shell'
import { DocsMain } from '../-components/main'
import { DocsNavigation } from '../-components/navigation'
import { DocsNotices } from '../-components/notices'
import { DocsPager } from '../-components/pager'
import { DocsSidebar } from '../-components/sidebar'
import { VersionSelector } from '../-components/version-selector'

export const Route = createFileRoute('/docs/$package/$')({
  validateSearch: (search: Record<string, unknown>): { missingPage?: boolean } => {
    if (search.missingPage === true || search.missingPage === 'true') {
      return { missingPage: true }
    }

    return {}
  },
  loader: async ({ params }) => {
    const docs = await getDocsContext({
      data: { package: params.package, slug: params._splat ?? '' },
    })
    if (!docs) {
      throw notFound()
    }

    const { pkg, page } = docs
    const slug = params._splat ?? ''
    if (slug.endsWith('/index') && pkg.versions.some((version) => `${version.id}/index` === slug)) {
      throw redirect({
        to: '/docs/$package/$',
        params: { package: pkg.id, _splat: slug.slice(0, -6) },
        search: {},
      })
    }
    if (!page) {
      throw notFound()
    }

    return { pkg, page }
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: `${loaderData?.page.title ?? 'Guide'} — ${loaderData?.pkg.name ?? 'JF Develops'}`,
      },
      {
        name: 'description',
        content:
          loaderData?.page.description ||
          loaderData?.pkg.description ||
          'JF Develops library documentation.',
      },
    ],
  }),
  component: PackageDocPage,
})

function PackageDocPage() {
  const { pkg, page } = Route.useLoaderData()

  const { missingPage } = Route.useSearch()

  return (
    <DocsProvider value={{ pkg, page }}>
      <DocsShell>
        <DocsSidebar>
          <p className="font-semibold">{pkg.name}</p>
          <VersionSelector />
          <DocsNavigation />
        </DocsSidebar>
        <DocsMain>
          <DocsBreadcrumb />
          <DocsNotices>
            {missingPage && (
              <Alert>
                <AlertDescription>This page does not exist in this version.</AlertDescription>
              </Alert>
            )}
          </DocsNotices>
          <DocContent>
            <h1>{page.title}</h1>
            {/* biome-ignore lint/security/noDangerouslySetInnerHtml: Page HTML is validated and escaped at build time. */}
            <DocBody key={page.slug} dangerouslySetInnerHTML={{ __html: page.html }} />
          </DocContent>
          <DocsPager />
        </DocsMain>
      </DocsShell>
    </DocsProvider>
  )
}
