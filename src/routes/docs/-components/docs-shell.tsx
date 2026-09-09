import { Link } from '@tanstack/react-router'
import { BookOpen, Boxes, ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { IslandShell } from '@/components/ui/island-shell'
import { Kicker } from '@/components/ui/kicker'
import { PageWrap } from '@/components/ui/page-wrap'
import type { PackageDocs } from '@/docs/registry'

type DocsShellProps = {
  children: ReactNode
  pkg: PackageDocs
}

export function DocsShell({ children, pkg }: DocsShellProps) {
  return (
    <PageWrap as="main" className="px-4 py-8 sm:py-12">
      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex items-center gap-2 text-sm text-[var(--sea-ink-soft)]"
      >
        <Link to="/docs" className="no-underline hover:text-[var(--sea-ink)]">
          Docs
        </Link>
        <ChevronRight aria-hidden="true" className="h-4 w-4" />
        <span aria-current="page" className="text-[var(--sea-ink)]">
          {pkg.name}
        </span>
      </nav>

      <div className="grid items-start gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <IslandShell as="aside" className="rounded-2xl p-4 lg:sticky lg:top-24">
          <div className="mb-4 border-b border-[var(--line)] pb-4">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--sea-ink)] text-[var(--foam)]">
              <Boxes aria-hidden="true" className="h-4 w-4" />
            </div>
            <p className="m-0 break-words text-sm font-semibold text-[var(--sea-ink)]">
              {pkg.name}
            </p>
            <p className="mt-1 text-xs text-[var(--sea-ink-soft)]">v{pkg.version}</p>
          </div>

          <Kicker className="mb-3">Documentation</Kicker>
          <nav aria-label={`${pkg.name} documentation`}>
            <ul className="m-0 flex list-none flex-col gap-1 p-0">
              {pkg.pages.map((page) => (
                <li key={page.slug}>
                  <DocLink packageId={pkg.id} page={page} />
                </li>
              ))}
            </ul>
          </nav>
        </IslandShell>

        <IslandShell as="section" className="min-w-0 rounded-2xl p-6 sm:p-8 lg:p-10">
          {children}
        </IslandShell>
      </div>
    </PageWrap>
  )
}

function DocLink({ packageId, page }: { packageId: string; page: PackageDocs['pages'][number] }) {
  const linkClasses =
    'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[var(--sea-ink-soft)] no-underline hover:bg-[var(--link-bg-hover)] hover:text-[var(--sea-ink)]'
  const activeProps = {
    className: `${linkClasses} bg-[var(--link-bg-hover)] text-[var(--sea-ink)]`,
  }

  if (page.slug === 'index') {
    return (
      <Link
        to="/docs/$package"
        params={{ package: packageId }}
        className={linkClasses}
        activeOptions={{ exact: true }}
        activeProps={activeProps}
      >
        <BookOpen aria-hidden="true" className="h-4 w-4 shrink-0" />
        {page.title}
      </Link>
    )
  }

  return (
    <Link
      to="/docs/$package/$"
      params={{ package: packageId, _splat: page.slug }}
      className={linkClasses}
      activeProps={activeProps}
    >
      <BookOpen aria-hidden="true" className="h-4 w-4 shrink-0" />
      {page.title}
    </Link>
  )
}
