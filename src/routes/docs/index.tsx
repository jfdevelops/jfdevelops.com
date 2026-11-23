import { createFileRoute, Link } from '@tanstack/react-router'
import { HomeLayout } from 'fumadocs-ui/layouts/home'
import { ArrowRight, Blocks, BookOpen, Braces } from 'lucide-react'
import { getDocsLibraries } from '@/docs/client'
import { getDefaultFramework, getDefaultVersion, getStatusLabel } from '@/docs/registry'
import { DocsError, DocsNotFound } from './-components/docs-status'
import { docsLayoutOptions } from './-components/layout-options'

export const Route = createFileRoute('/docs/')({
  notFoundComponent: DocsNotFound,
  errorComponent: DocsError,
  loader: async () => ({ packages: await getDocsLibraries() }),
  head: () => ({
    meta: [
      { title: 'Documentation — JF Develops' },
      {
        name: 'description',
        content:
          'Guides, examples, and API documentation for JF Develops libraries and developer tools.',
      },
    ],
  }),
  component: DocsIndex,
})

const packageIcons = [Blocks, Braces, BookOpen]

function DocsIndex() {
  const { packages } = Route.useLoaderData()
  const firstPackage = packages[0]

  return (
    <HomeLayout {...docsLayoutOptions(packages)} className="docs-home">
      <div className="mx-auto w-full max-w-5xl px-6 pb-20">
        <section className="flex flex-col items-center pb-14 pt-20 text-center sm:pb-16 sm:pt-24">
          <p className="mb-4 text-xs font-medium uppercase tracking-widest text-fd-primary">
            JF Develops · Documentation
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Build with better building blocks.
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-7 text-fd-muted-foreground">
            Type-safe libraries, developer tools, practical guides, and API references.
            <br className="hidden sm:block" /> Everything you need to start putting the pieces
            together.
          </p>
          <div className="mt-6 flex items-center gap-3">
            {firstPackage ? (
              <Link
                to="/docs/$package"
                params={{ package: firstPackage.slug }}
                className="inline-flex items-center gap-2 rounded-full bg-fd-primary px-4 py-2 text-sm font-medium text-fd-primary-foreground transition-opacity hover:opacity-85"
              >
                Get started <ArrowRight aria-hidden="true" className="size-3.5" />
              </Link>
            ) : null}
            <a
              href="#libraries"
              className="rounded-full border border-fd-border bg-fd-secondary px-4 py-2 text-sm font-medium transition-colors hover:bg-fd-accent"
            >
              Browse libraries
            </a>
          </div>
        </section>
        <section id="libraries" aria-labelledby="libraries-title" className="scroll-mt-24">
          <h2 id="libraries-title" className="mb-4 text-xs font-medium text-fd-muted-foreground">
            Libraries
          </h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,18rem),1fr))] gap-3">
            {packages.map((pkg, index) => {
              const Icon = packageIcons[index % packageIcons.length]
              return (
                <Link
                  key={pkg.slug}
                  to="/docs/$package"
                  params={{ package: pkg.slug }}
                  className="group flex flex-col rounded-xl border border-fd-border bg-fd-card p-5 text-start transition-colors hover:bg-fd-accent/50"
                >
                  <Icon aria-hidden="true" className="mb-4 size-5 text-fd-primary" />
                  <h3 className="flex items-center justify-between gap-3 text-sm font-semibold">
                    {pkg.name}
                    <ArrowRight
                      aria-hidden="true"
                      className="size-3.5 text-fd-muted-foreground transition-transform group-hover:translate-x-1"
                    />
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-fd-muted-foreground">
                    {pkg.description}
                  </p>
                  <span className="mt-5 flex items-center justify-between gap-2 border-t border-fd-border pt-3 text-xs text-fd-muted-foreground">
                    <span>
                      {getStatusLabel(getDefaultVersion(getDefaultFramework(pkg)).status)}
                    </span>
                    <span>{pkg.pageCount} pages</span>
                  </span>
                </Link>
              )
            })}
          </div>
          <p className="mt-6 text-center text-xs text-fd-muted-foreground">
            TypeScript libraries. Developer tools. Practical guides.
          </p>
        </section>
      </div>
    </HomeLayout>
  )
}
