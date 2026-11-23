import { Link, useLocation, useNavigate } from '@tanstack/react-router'
import { DocsLayout } from 'fumadocs-ui/layouts/docs'
import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import ThemeToggle from '@/components/theme-toggle'
import {
  type DocsFramework,
  type DocsVersion,
  getSwitchTarget,
  type PackageDocs,
} from '@/routes/docs/-utils/registry'
import { docsLayoutOptions } from './layout-options'
import { LibrarySelector } from './library-selector'
import { Selectors } from './selectors'

type DocsShellProps = {
  children: ReactNode
  pkg: PackageDocs
  framework: DocsFramework
  version: DocsVersion
  pageId: string
  libraries: PackageDocs[]
}

export function DocsShell({
  children,
  pkg,
  framework,
  version,
  pageId,
  libraries,
}: DocsShellProps) {
  const navigate = useNavigate()
  const hash = useLocation({ select: (location) => location.hash })

  function switchDocs(nextFramework: DocsFramework, nextVersion: DocsVersion) {
    const target = getSwitchTarget(pkg, nextFramework, nextVersion, pageId, hash)
    void navigate({
      to: '/docs/$package/$',
      params: { package: pkg.slug, _splat: target.url.split('/').slice(3).join('/') },
      search: { docsNotice: target.missing ? 'missing-page' : undefined },
      hash: target.hash,
    })
  }

  return (
    <DocsLayout
      key={`${pkg.slug}/${framework.id}/${version.id}`}
      {...docsLayoutOptions(libraries)}
      themeSwitch={{ enabled: false }}
      tree={version.tree ?? { name: pkg.name, children: [] }}
      containerProps={{ className: 'docs-reader' }}
      tabs={false}
      sidebar={{
        banner: (
          <div className="flex flex-col gap-2">
            <LibrarySelector libraries={libraries} selected={pkg} />
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

