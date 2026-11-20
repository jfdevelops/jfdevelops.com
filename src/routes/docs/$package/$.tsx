import { createFileRoute } from '@tanstack/react-router'
import { DocPage, loadDocPage } from '../-components/doc-page'

function getSlugs(splat: string | undefined) {
  return splat?.split('/').filter(Boolean) ?? []
}

export const Route = createFileRoute('/docs/$package/$')({
  validateSearch: (search: Record<string, unknown>) => ({
    docsNotice: search.docsNotice === 'missing-page' ? ('missing-page' as const) : undefined,
  }),
  loader: ({ params }) => loadDocPage(params.package, getSlugs(params._splat)),
  head: ({ loaderData }) => ({
    meta: [
      {
        title: `${loaderData?.title ?? 'Guide'} — ${loaderData?.pkg.name ?? 'JF Develops'}`,
      },
      {
        name: 'description',
        content: loaderData?.description ?? 'JF Develops library documentation.',
      },
    ],
  }),
  component: PackageDocPage,
})

function PackageDocPage() {
  const { package: packageSlug, _splat: splat } = Route.useParams()
  const { docsNotice } = Route.useSearch()

  return (
    <DocPage
      packageSlug={packageSlug}
      slugs={getSlugs(splat)}
      missingPage={docsNotice === 'missing-page'}
    />
  )
}
