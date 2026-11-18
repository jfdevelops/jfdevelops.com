import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export function DocsSidebar({ className, ...props }: ComponentProps<'aside'>) {
  return (
    <aside
      className={cn(
        'border-b border-(--line) bg-(--surface-strong) p-4 lg:sticky lg:top-[var(--site-header-height,6rem)] lg:max-h-[calc(100dvh-var(--site-header-height,6rem))] lg:overflow-y-auto lg:border-r lg:border-b-0 lg:p-6',
        className,
      )}
      {...props}
    />
  )
}
