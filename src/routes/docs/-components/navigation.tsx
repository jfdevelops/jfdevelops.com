import type { ComponentProps } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useDocs } from './context'

export function DocsNavigation({ className, ...props }: ComponentProps<'nav'>) {
  const { pkg, page, version } = useDocs()

  return (
    <nav aria-label={`${pkg.name} documentation`} className={cn('space-y-5', className)} {...props}>
      {version.navigation.map((group) => (
        <div key={group.title}>
          <p className="mb-2 text-xs font-semibold uppercase">{group.title}</p>
          <ul className="m-0 list-none space-y-1 p-0">
            {group.pages.map((id) => {
              const item = pkg.pages.find(
                (candidate) => candidate.version === version.id && candidate.pageId === id,
              )

              if (!item) {
                throw new Error(`Missing generated page: ${id}`)
              }

              return (
                <li key={id}>
                  <Button
                    variant={item.slug === page.slug ? 'secondary' : 'ghost'}
                    className="h-auto w-full justify-start whitespace-normal px-2 py-1.5 text-left text-sm"
                    render={
                      <a
                        href={`/docs/${pkg.id}/${item.slug}`}
                        aria-label={item.title}
                        aria-current={item.slug === page.slug ? 'page' : undefined}
                      >
                        {item.title}
                      </a>
                    }
                  >
                    {item.title}
                  </Button>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}
