import { createFileRoute, notFound } from '@tanstack/react-router'
import { DocContent } from '#/docs/DocContent'
import { getPackageDocs } from '#/docs/registry'
import { DocsShell } from '../-components/docs-shell'

export const Route = createFileRoute('/docs/$package/')({
  loader: ({ params }) => {
    const pkg = getPackageDocs(params.package)
    if (!pkg) {
      throw notFound()
    }

    const indexPage = pkg.pages.find((page) => page.slug === 'index')
    return { pkg, indexPage }
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.pkg.name ?? 'Library'} documentation — JF Develops` },
      {
        name: 'description',
        content: loaderData?.pkg.description ?? 'JF Develops library documentation.',
      },
    ],
  }),
  component: PackageDocsIndex,
})

function PackageDocsIndex() {
  const { pkg, indexPage } = Route.useLoaderData()

  return (
    <DocsShell pkg={pkg}>
      {indexPage ? (
        <DocContent content={indexPage.content} />
      ) : (
        <div>
          <h1 className="font-display mb-3 text-3xl font-bold text-[var(--sea-ink)]">{pkg.name}</h1>
          <p className="text-[var(--sea-ink-soft)]">
            Select a page from the sidebar to get started.
          </p>
        </div>
      )}
    </DocsShell>
  )
}
