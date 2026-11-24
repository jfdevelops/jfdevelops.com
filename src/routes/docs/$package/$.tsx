import { createFileRoute, notFound } from '@tanstack/react-router'
import { DocPage } from '@/routes/docs/-components/page'
import { DocsError, DocsNotFound } from '@/routes/docs/-components/status'
import { resources } from '@/routes/docs/-utils/definition'
import { getDocSlugs, loadDocPage } from '@/routes/docs/-utils/loader'
import { docsSearchSchema } from '@/routes/docs/-utils/search'

export const Route = createFileRoute('/docs/$package/$')({
  notFoundComponent: DocsNotFound,
  errorComponent: DocsError,
  validateSearch: docsSearchSchema,
  params: {
    parse: ({ package: packageId, _splat }) => {
      if (!resources.isResource(packageId)) {
        throw notFound()
      }

      return {
        package: packageId,
        _splat,
      }
    },
    stringify: ({ package: packageId, _splat }) => ({
      package: packageId,
      _splat: _splat ?? '',
    }),
  },
  loader: ({ params }) => loadDocPage(params.package, getDocSlugs(params._splat)),
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
  component: DocPage,
})
