import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export function DocContent({ className, ...props }: ComponentProps<'article'>) {
  return (
    <article className={cn('docs-content prose prose-neutral max-w-none', className)} {...props} />
  )
}
