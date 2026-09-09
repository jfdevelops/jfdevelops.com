import { createFileRoute, notFound } from '@tanstack/react-router'
import { DocContent } from '@/docs/doc-content'
import { getDocPage, getPackageDocs } from '@/docs/registry'
import { DocsShell } from '../-components/docs-shell'

export const Route = createFileRoute('/docs/$package/$')({
  loader: ({ params }) => {
    const pkg = getPackageDocs(params.package)
    if (!pkg) {
      throw notFound()
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

  return (
    <DocsShell pkg={pkg}>
      <DocContent content={page.content} />
    </DocsShell>
  )
}
