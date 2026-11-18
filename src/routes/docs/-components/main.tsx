import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export function DocsMain({ className, ...props }: ComponentProps<'section'>) {
  return (
    <section
      className={cn(
        'min-h-[calc(100dvh-var(--site-header-height,6rem))] min-w-0 bg-(--surface-strong) p-6 sm:p-8 lg:p-10',
        className,
      )}
      {...props}
    />
  )
}
