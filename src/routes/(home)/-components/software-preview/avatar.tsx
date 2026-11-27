import type { ComponentPropsWithRef } from 'react'
import { cn } from '@/lib/utils'

export function PreviewAvatar({ className, ...props }: ComponentPropsWithRef<'span'>) {
  return (
    <span
      className={cn(
        'inline-grid size-[25px] shrink-0 place-items-center rounded-full bg-brand-tint text-[9px] text-sea-ink-soft',
        className,
      )}
      {...props}
    >
      JF
    </span>
  )
}
