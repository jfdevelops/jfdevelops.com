import { notFound, redirect } from '@tanstack/react-router'
import FumadocsLink from 'fumadocs-core/link'
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/page'
import { use } from 'react'
import { getMdxComponents } from '@/components/mdx'
import { getDocSource } from '@/docs/generated-sources'
import {
  getDefaultFramework,
  getDefaultVersion,
  getPackageDocs,
  getPageUrl,
  resolveDocContext,
  resolveDocHref,
} from '@/docs/registry'
import { DocsShell } from './docs-shell'

export async function loadDocPage(packageSlug: string, slugs: string[]) {
  const pkg = getPackageDocs(packageSlug)
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
  const page = getDocSource(pkg.slug, context.framework.id, context.version.id)?.getPage(
    context.pageId === 'index' ? [] : context.pageId.split('/'),
  )
  if (!page) throw notFound()
  await page.data.preload()
  return {
    pkg: { name: pkg.name },
    title: page.data.title,
    description: page.data.description ?? pkg.description,
  }
}

type DocPageProps = { packageSlug: string; slugs: string[]; missingPage?: boolean }
export function DocPage({ packageSlug, slugs, missingPage }: DocPageProps) {
  const pkg = getPackageDocs(packageSlug)
  const context = pkg ? resolveDocContext(pkg, slugs) : null
  if (!pkg || !context) return null
  const { framework, version, pageId } = context
  const page = getDocSource(pkg.slug, framework.id, version.id)?.getPage(
    pageId === 'index' ? [] : pageId.split('/'),
  )
  if (!page) return null
  const { body: MdxContent, toc } = use(page.data.load())
  const currentVersion = getDefaultVersion(framework)
  const currentPage = currentVersion.pages.find((page) => page.id === pageId)

  return (
    <DocsShell pkg={pkg} framework={framework} version={version} pageId={pageId}>
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
        <DocsTitle>{page.data.title}</DocsTitle>
        <DocsDescription>{page.data.description}</DocsDescription>
        <DocsBody>
          <MdxContent
            components={getMdxComponents({
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
            })}
          />
        </DocsBody>
      </DocsPage>
    </DocsShell>
  )
}
