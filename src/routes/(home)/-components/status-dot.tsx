import type { ComponentPropsWithRef } from 'react'
import { cn } from '@/lib/utils'

export function StatusDot({ className, ...props }: ComponentPropsWithRef<'span'>) {
  return (
    <span
      className={cn(
        'size-[7px] rounded-full bg-brand-accent shadow-[0_0_0_4px] shadow-brand-tint',
        className,
      )}
      {...props}
    />
  )
}
