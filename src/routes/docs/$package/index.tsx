import { createFileRoute } from '@tanstack/react-router'
import { DocsError, DocsNotFound } from '../-components/status'
import { DocPage } from './-components/page'
import { loadDocPage } from './-utils/loader'

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

