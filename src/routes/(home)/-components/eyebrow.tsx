import type { ComponentPropsWithRef } from 'react'
import { cn } from '@/lib/utils'

/** Small uppercase line above a heading. */
export function Eyebrow({ className, ...props }: ComponentPropsWithRef<'p'>) {
  return (
    <p
      className={cn(
        'flex items-center gap-2.5 text-[11px] font-bold tracking-[0.12em] text-sea-ink uppercase',
        className,
      )}
      {...props}
    />
  )
}
