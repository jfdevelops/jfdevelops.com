import { Link, useLocation, useNavigate } from '@tanstack/react-router'
import { DocsLayout } from 'fumadocs-ui/layouts/docs'
import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import ThemeToggle from '@/components/theme-toggle'
import { docsLayoutOptions } from '@/routes/docs/-components/layout-options'
import { LibrarySelector } from '@/routes/docs/-components/library-selector'
import { Selectors } from '@/routes/docs/-components/selectors'
import { resources } from '@/routes/docs/-utils/definition'
import {
  type DocsFramework,
  type DocsVersion,
  getSwitchTarget,
  type PackageDocs,
} from '@/routes/docs/-utils/registry'

type DocsShellProps = {
  children: ReactNode
  pkg: PackageDocs
  framework: DocsFramework
  version: DocsVersion
  pageId: string
}

export function DocsShell({ children, pkg, framework, version, pageId }: DocsShellProps) {
  const navigate = useNavigate()
  const hash = useLocation({ select: (location) => location.hash })

  function switchDocs(nextFramework: DocsFramework, nextVersion: DocsVersion) {
    const target = getSwitchTarget(pkg, nextFramework, nextVersion, pageId, hash)
    const splat = target.url.split('/').slice(3).join('/')
    const packageId = resources.parse(pkg.slug)

    void navigate({
      to: '/docs/$package/$',
      params: { package: packageId, _splat: splat },
      search: {
        docsNotice: target.missing ? ('missing-page' as const) : undefined,
      },
      hash: target.hash,
    })
  }

  return (
    <DocsLayout
      key={`${pkg.slug}/${framework.id}/${version.id}`}
      {...docsLayoutOptions()}
      themeSwitch={{ enabled: false }}
      tree={version.tree ?? { name: pkg.name, children: [] }}
      containerProps={{ className: 'docs-reader' }}
      tabs={false}
      sidebar={{
        banner: (
          <div className="flex flex-col gap-2">
            <LibrarySelector selectedId={pkg.slug} />
            <Selectors
              frameworks={pkg.frameworks}
              framework={framework}
              version={version}
              onSwitch={switchDocs}
            />
          </div>
        ),
        footer: (
          <div className="flex flex-col gap-4 border-t border-fd-border pt-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-fd-muted-foreground">
                {version.endpointVersion ?? version.label}
              </span>
              <ThemeToggle />
            </div>
            <Link
              to="/docs"
              className="inline-flex items-center gap-2 text-xs text-fd-muted-foreground hover:text-fd-foreground"
            >
              <ArrowLeft aria-hidden="true" className="size-3.5" />
              All libraries
            </Link>
          </div>
        ),
      }}
    >
      {children}
    </DocsLayout>
  )
}
