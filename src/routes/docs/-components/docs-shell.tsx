import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export function DocsShell({ className, ...props }: ComponentProps<'main'>) {
  return (
    <main
      className={cn(
        'grid min-h-[calc(100dvh-var(--site-header-height,6rem))] w-full items-start lg:grid-cols-[280px_minmax(0,1fr)]',
        className,
      )}
      {...props}
    />
  )
}
