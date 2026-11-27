import type { ComponentPropsWithRef } from 'react'
import { cn } from '@/lib/utils'

/** Bordered card inside the preview window. */
export function PreviewPanel({ className, ...props }: ComponentPropsWithRef<'div'>) {
  return <div className={cn('rounded-[5px] border border-line p-3', className)} {...props} />
}
