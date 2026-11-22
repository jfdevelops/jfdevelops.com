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
  const data = Route.useLoaderData()
  const { docsNotice } = Route.useSearch()

  return <DocPage data={data} missingPage={docsNotice === 'missing-page'} />
}
