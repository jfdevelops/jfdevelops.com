import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { IslandShell } from '@/components/ui/island-shell'
import { type DocPage, type PackageDocs, versionDestination } from '@/docs/registry'
import { cn } from '@/lib/utils'

export function DocsShell({
  children,
  pkg,
  page,
}: {
  children: ReactNode
  pkg: PackageDocs
  page: DocPage
}) {
  const version = pkg.versions.find((v) => v.id === page.version)

  if (!version) {
    throw new Error(`Missing generated version: ${page.version}`)
  }
  const versions = [...pkg.versions].sort(
    (a, b) => Number(b.status === 'current') - Number(a.status === 'current'),
  )

  return (
    <main className="w-full">
      <div className="grid min-h-[calc(100dvh-6rem)] items-start lg:grid-cols-[280px_minmax(0,1fr)]">
        <IslandShell
          as="aside"
          className="rounded-none border-x-0 border-t-0 p-4 shadow-none lg:sticky lg:top-24 lg:max-h-[calc(100dvh-6rem)] lg:overflow-y-auto lg:border-b-0 lg:border-r lg:p-6"
        >
          <p className="font-semibold">{pkg.name}</p>
          <label htmlFor="docs-version" className="block text-sm">
            Documentation version
          </label>
          <select
            id="docs-version"
            value={version.id}
            className="my-3 w-full rounded border bg-[var(--foam)] p-2 text-[var(--sea-ink)]"
            onChange={(event) => {
              window.location.assign(
                versionDestination(pkg, page, event.target.value, window.location.hash),
              )
            }}
          >
            {versions.map((v) => (
              <option key={v.id} value={v.id}>
                {v.label} · {v.status}
              </option>
            ))}
          </select>
          <nav aria-label={`${pkg.name} documentation`}>
            {version.navigation.map((group) => (
              <div key={group.title} className="mb-5">
                <p className="mb-2 text-xs font-semibold uppercase">{group.title}</p>
                <ul className="m-0 list-none p-0">
                  {group.pages.map((id) => {
                    const item = pkg.pages.find((p) => p.version === version.id && p.pageId === id)

                    if (!item) {
                      throw new Error(`Missing generated page: ${id}`)
                    }

                    return (
                      <li key={id}>
                        <a
                          href={`/docs/${pkg.id}/${item.slug}`}
                          aria-current={item.slug === page.slug ? 'page' : undefined}
                          className={cn(
                            'block rounded px-2 py-1.5 text-sm',
                            item.slug === page.slug && 'bg-[var(--link-bg-hover)] font-semibold',
                          )}
                        >
                          {item.title}
                        </a>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </IslandShell>
        <IslandShell
          as="section"
          className="min-h-[calc(100dvh-6rem)] min-w-0 rounded-none border-0 p-6 shadow-none sm:p-8 lg:p-10"
        >
          <nav aria-label="Breadcrumb" className="mb-6">
            <Link to="/docs">Docs</Link> / {pkg.name} / {version.label}
          </nav>
          {version.status === 'previous' && (
            <aside className="mb-6 rounded border p-4">
              You are reading docs for an older major.{' '}
              <a href={versionDestination(pkg, page, pkg.defaultVersion)}>Read the current docs</a>.
            </aside>
          )}
          {version.status === 'legacy' && (
            <aside role="note" className="mb-6 rounded border border-amber-500 p-4">
              {version.note}
            </aside>
          )}
          {version.status === 'next' && (
            <aside className="mb-6 rounded border p-4">This version is not released.</aside>
          )}
          {version.examples.verification === 'adapted-from-source' && (
            <p className="mb-6 text-sm">Examples were adapted from source and not compiled.</p>
          )}
          {children}
          <nav aria-label="Adjacent pages" className="mt-8 flex justify-between border-t pt-4">
            {page.previous ? (
              <a href={`/docs/${pkg.id}/${page.previous}`}>
                ← {pkg.pages.find((p) => p.slug === page.previous)?.title}
              </a>
            ) : (
              <span />
            )}
            {page.next && (
              <a href={`/docs/${pkg.id}/${page.next}`}>
                {pkg.pages.find((p) => p.slug === page.next)?.title} →
              </a>
            )}
          </nav>
        </IslandShell>
      </div>
    </main>
  )
}
