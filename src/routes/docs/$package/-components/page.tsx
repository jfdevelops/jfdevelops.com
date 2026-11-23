import FumadocsLink from 'fumadocs-core/link'
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/page'
import { getMdxComponents } from '@/routes/docs/-components/mdx'
import {
  getDefaultVersion,
  getPageUrl,
  resolveDocHref,
} from '@/routes/docs/-utils/registry'
import { renderDocs } from '@/routes/docs/-utils/render'
import type { loadDocPage } from '../-utils/loader'
import { DocsShell } from './shell'

type DocPageProps = {
  data: Awaited<ReturnType<typeof loadDocPage>>
  missingPage?: boolean
}

export function DocPage({ data, missingPage }: DocPageProps) {
  const { pkg, page, libraries } = data
  const framework = pkg.frameworks.find((entry) => entry.id === page.framework)

  if (!framework) {
    throw new Error('Missing docs framework')
  }

  const version = framework.versions.find((entry) => entry.id === page.version)

  if (!version) {
    throw new Error('Missing docs version')
  }

  const pageId = page.id
  const toc = page.toc
  const currentVersion = getDefaultVersion(framework)
  const currentPage = currentVersion.pages.find((entry) => entry.id === pageId)

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

