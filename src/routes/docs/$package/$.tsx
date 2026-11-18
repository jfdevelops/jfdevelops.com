import { createFileRoute, notFound, redirect } from '@tanstack/react-router'
import { DocContent } from '@/docs/doc-content'
import { getDocPage, getPackageDocs } from '@/docs/registry'
import { DocsShell } from '../-components/docs-shell'

export const Route = createFileRoute('/docs/$package/$')({
  validateSearch: (search: Record<string, unknown>): { missingPage?: boolean } => {
    if (search.missingPage === true || search.missingPage === 'true') {
      return { missingPage: true }
    }

    return {}
  },
  loader: ({ params }) => {
    const pkg = getPackageDocs(params.package)
    if (!pkg) {
      throw notFound()
    }

    const slug = params._splat ?? ''
    if (slug.endsWith('/index') && pkg.versions.some((version) => `${version.id}/index` === slug)) {
      throw redirect({
        to: '/docs/$package/$',
        params: { package: pkg.id, _splat: slug.slice(0, -6) },
        search: {},
      })
    }
    const page = getDocPage(params.package, params._splat ?? '')
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
    <DocsShell pkg={pkg} page={page}>
      {missingPage && <p role="status">This page does not exist in this version.</p>}
      <DocContent page={page} />
    </DocsShell>
  )
}
