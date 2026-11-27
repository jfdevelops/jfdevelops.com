import { useLocation, useNavigate } from '@tanstack/react-router'
import { GlassLayout } from 'fumadocs-ui/layouts/glass'
import { LibraryBig } from 'lucide-react'
import type { ReactNode } from 'react'
import { ThemeToggle } from '@/components/theme-toggle'
import { LibrarySelector } from '@/routes/docs/-components/library-selector'
import { Selectors } from '@/routes/docs/-components/selectors'
import { sidebarSlots } from '@/routes/docs/-components/sidebar'
import { resources } from '@/routes/docs/-utils/definition'
import {
  type DocsFramework,
  type DocsVersion,
  getSwitchTarget,
  type PackageDocs,
} from '@/routes/docs/-utils/registry'

function Title() {
  return <span className="font-display text-base font-bold tracking-tight">JF Develops</span>
}

type DocsShellProps = {
  children: ReactNode
  pkg: PackageDocs
  framework: DocsFramework
  version: DocsVersion
  pageId: string
  libraryVersion: string | null
}

export function DocsShell({
  children,
  pkg,
  framework,
  version,
  pageId,
  libraryVersion,
}: DocsShellProps) {
  const navigate = useNavigate()
  const hash = useLocation({ select: (location) => location.hash })

  function switchDocs(nextFramework: DocsFramework, nextVersion: DocsVersion) {
    const packageId = resources.parse(pkg.slug)

    // A version switch opens that version's default page.
    if (nextFramework.id === framework.id) {
      void navigate({
        to: '/docs/$package/$',
        params: { package: packageId, _splat: `${framework.id}/${nextVersion.id}` },
        search: { docsNotice: undefined },
      })

      return
    }

    const target = getSwitchTarget(pkg, nextFramework, nextVersion, pageId, hash)
    const splat = target.url.split('/').slice(3).join('/')

    void navigate({
      to: '/docs/$package/$',
      params: { package: packageId, _splat: splat },
      search: {
        docsNotice: target.missing ? 'missing-page' : undefined,
      },
      hash: target.hash,
    })
  }

  return (
    <GlassLayout
      key={`${pkg.slug}/${framework.id}/${version.id}`}
      tree={version.tree ?? { name: pkg.name, children: [] }}
      tabs={false}
      nav={{ title: <Title />, url: '/' }}
      searchToggle={{ enabled: false }}
      slots={{ themeSwitch: ThemeToggle, sidebar: sidebarSlots }}
      links={[
        {
          type: 'icon',
          on: 'menu',
          url: '/docs',
          label: 'All libraries',
          text: 'All libraries',
          icon: <LibraryBig />,
        },
        {
          type: 'custom',
          on: 'menu',
          children: (
            <div className="mb-4 flex flex-col gap-2">
              <LibrarySelector selectedId={pkg.slug} />
              <Selectors
                frameworks={pkg.frameworks}
                framework={framework}
                version={version}
                onSwitch={switchDocs}
              />
              {libraryVersion ? (
                <p className="m-0 px-1 text-xs text-fd-muted-foreground">
                  Latest release {libraryVersion}
                </p>
              ) : null}
            </div>
          ),
        },
      ]}
    >
      {children}
    </GlassLayout>
  )
}
