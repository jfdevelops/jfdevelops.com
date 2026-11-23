import { createFileRoute } from '@tanstack/react-router'
import { DocPage, loadDocPage } from '../-components/doc-page'
import { DocsError, DocsNotFound } from '../-components/docs-status'

export const Route = createFileRoute('/docs/$package/')({
  notFoundComponent: DocsNotFound,
  errorComponent: DocsError,
  loader: ({ params }) => loadDocPage(params.package, []),
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.title ?? 'Library'} — JF Develops` },
      {
        name: 'description',
        content: loaderData?.description ?? 'JF Develops library documentation.',
      },
    ],
  }),
  component: PackageDocsIndex,
})

function PackageDocsIndex() {
  const data = Route.useLoaderData()

  return <DocPage data={data} />
}
