import { notFound, redirect } from '@tanstack/react-router'
import FumadocsLink from 'fumadocs-core/link'
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/page'
import { getMdxComponents } from '@/components/mdx'
import { getDocContent, getDocLibrary, getDocsLibraries } from '@/docs/client'
import {
  getDefaultFramework,
  getDefaultVersion,
  getPageUrl,
  resolveDocContext,
  resolveDocHref,
} from '@/docs/registry'
import { renderDocs } from '@/docs/render'
import { DocsShell } from './docs-shell'

export async function loadDocPage(packageSlug: string, slugs: string[]) {
  const summary = await getDocLibrary({ data: packageSlug })
  const pkg = summary?.library
  if (!pkg) throw notFound()
  if (slugs.length < 2) {
    const framework = slugs[0]
      ? pkg.frameworks.find((framework) => framework.id === slugs[0])
      : getDefaultFramework(pkg)
    if (!framework) throw notFound()
    throw redirect({
      to: '/docs/$package/$',
      params: { package: pkg.slug, _splat: `${framework.id}/${framework.defaultVersion}` },
      search: { docsNotice: undefined },
      statusCode: 302,
    })
  }
  const context = resolveDocContext(pkg, slugs)
  if (!context) throw notFound()
  const content = await getDocContent({
    data: {
      library: pkg.slug,
      framework: context.framework.id,
      version: context.version.id,
      page: context.pageId,
    },
  })
  if (!content) throw notFound()
  const libraries = await getDocsLibraries()
  return { ...content, libraries, title: content.page.title, description: content.page.description }
}

type DocPageProps = { data: Awaited<ReturnType<typeof loadDocPage>>; missingPage?: boolean }
export function DocPage({ data, missingPage }: DocPageProps) {
  const { pkg, page, libraries } = data
  const framework = pkg.frameworks.find((framework) => framework.id === page.framework)
  if (!framework) throw new Error('Missing docs framework')
  const version = framework.versions.find((version) => version.id === page.version)
  if (!version) throw new Error('Missing docs version')
  const pageId = page.id
  const toc = page.toc
  const currentVersion = getDefaultVersion(framework)
  const currentPage = currentVersion.pages.find((page) => page.id === pageId)

  return (
    <DocsShell
      pkg={pkg}
      framework={framework}
      version={version}
      pageId={pageId}
      libraries={libraries}
    >
      <DocsPage toc={toc}>
        {missingPage ? (
          <div role="status" className="rounded-lg border border-fd-border bg-fd-muted p-4 text-sm">
            This page does not exist in this version. Showing the first page instead.
          </div>
        ) : null}
        {version.status !== 'current' ? (
          <div role="note" className="rounded-lg border border-fd-border bg-fd-muted p-4 text-sm">
            {version.status === 'legacy'
              ? 'This is an unstable 0.x line. Only the final release is documented.'
              : version.status === 'next'
                ? 'This version is not released.'
                : 'You are reading docs for an older major.'}{' '}
            <FumadocsLink
              href={getPageUrl(pkg, framework, currentVersion, currentPage?.id)}
              className="font-medium text-fd-primary underline"
            >
              Read the current docs
            </FumadocsLink>
          </div>
        ) : null}
        <DocsTitle>{page.title}</DocsTitle>
        <DocsDescription>{page.description}</DocsDescription>
        <DocsBody>
          {renderDocs(
            page.body,
            getMdxComponents({
              a: function DocLink({ href, ...props }) {
                const target = href ? resolveDocHref(pkg, version, pageId, href) : href
                return (
                  <FumadocsLink
                    {...props}
                    href={target}
                    rel={target?.startsWith('https:') ? 'noopener noreferrer' : undefined}
                  />
                )
              },
              img: function DocImage({ src, alt, ...props }) {
                return (
                  <img
                    {...props}
                    alt={alt ?? ''}
                    src={
                      typeof src === 'string'
                        ? resolveDocHref(pkg, version, pageId, src, true)
                        : src
                    }
                  />
                )
              },
            }),
          )}
        </DocsBody>
      </DocsPage>
    </DocsShell>
  )
}
