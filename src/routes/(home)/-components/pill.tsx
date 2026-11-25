import type { ComponentPropsWithRef } from 'react'
import { cn } from '@/lib/utils'

export function Pill({ className, ...props }: ComponentPropsWithRef<'li'>) {
  return (
    <li
      className={cn(
        'inline-flex items-center gap-[0.35rem] rounded-full border border-chip-line bg-chip-bg px-[0.65rem] py-[0.35rem] text-[0.75rem] font-bold text-sea-ink-soft',
        className,
      )}
      {...props}
    />
  )
}
