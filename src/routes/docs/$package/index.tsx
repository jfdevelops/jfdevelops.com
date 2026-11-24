import { createFileRoute, notFound } from '@tanstack/react-router'
import { DocsError, DocsNotFound } from '@/routes/docs/-components/status'
import { resources } from '@/routes/docs/-utils/definition'
import { loadDocPage } from '@/routes/docs/-utils/loader'
import { docsSearchSchema } from '@/routes/docs/-utils/search'

export const Route = createFileRoute('/docs/$package/')({
  notFoundComponent: DocsNotFound,
  errorComponent: DocsError,
  validateSearch: docsSearchSchema,
  params: {
    parse: (raw) => {
      if (!resources.isResource(raw.package)) {
        throw notFound()
      }

      return { package: raw.package }
    },
    stringify: ({ package: packageId }) => ({ package: packageId }),
  },
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
  return null
}
