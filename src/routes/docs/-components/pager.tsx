import type { ComponentProps } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useDocs } from './context'

export function DocsPager({ className, ...props }: ComponentProps<'nav'>) {
  const { pkg, page } = useDocs()

  return (
    <nav
      aria-label="Adjacent pages"
      className={cn('mt-8 flex justify-between gap-4 border-t border-(--line) pt-4', className)}
      {...props}
    >
      {page.previous ? (
        <Button
          variant="outline"
          className="h-auto whitespace-normal py-2 text-left"
          render={
            <a href={`/docs/${pkg.id}/${page.previous}`} aria-label="Previous page">
              Previous page
            </a>
          }
        >
          ← {pkg.pages.find((candidate) => candidate.slug === page.previous)?.title}
        </Button>
      ) : (
        <span />
      )}
      {page.next && (
        <Button
          variant="outline"
          className="h-auto whitespace-normal py-2 text-right"
          render={
            <a href={`/docs/${pkg.id}/${page.next}`} aria-label="Next page">
              Next page
            </a>
          }
        >
          {pkg.pages.find((candidate) => candidate.slug === page.next)?.title} →
        </Button>
      )}
    </nav>
  )
}
