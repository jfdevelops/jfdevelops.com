import { Link } from '@tanstack/react-router'
import { BookOpen, FileQuestion } from 'lucide-react'
import { DocsHome } from './layout'

function DocsStatus({ unavailable = false, retry }: { unavailable?: boolean; retry?: () => void }) {
  return (
    <DocsHome>
      <main className="mx-auto flex min-h-[65vh] max-w-xl flex-col items-center justify-center px-6 py-20 text-center">
        <FileQuestion aria-hidden="true" className="mb-6 size-12 text-fd-muted-foreground" />
        <p className="mb-3 text-sm font-medium text-fd-primary">
          {unavailable ? 'Documentation' : '404 — Documentation'}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          {unavailable ? 'Docs are temporarily unavailable' : 'This docs page could not be found'}
        </h1>
        <p className="mt-4 text-fd-muted-foreground">
          {unavailable
            ? 'We could not load the documentation right now. Please try again in a moment.'
            : 'The library, framework, version, or page may have moved. Browse the library docs to find what you need.'}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/docs"
            className="inline-flex items-center gap-2 rounded-full bg-fd-primary px-5 py-2.5 text-sm font-medium text-fd-primary-foreground"
          >
            <BookOpen aria-hidden="true" className="size-4" />
            Browse documentation
          </Link>
          {retry ? (
            <button
              type="button"
              onClick={retry}
              className="rounded-full border border-fd-border px-5 py-2.5 text-sm font-medium"
            >
              Try again
            </button>
          ) : (
            <Link
              to="/"
              className="rounded-full border border-fd-border px-5 py-2.5 text-sm font-medium"
            >
              Go to home
            </Link>
          )}
        </div>
      </main>
    </DocsHome>
  )
}

export function DocsNotFound() {
  return <DocsStatus />
}

export function DocsError({ reset }: { reset: () => void }) {
  return <DocsStatus unavailable retry={reset} />
}
