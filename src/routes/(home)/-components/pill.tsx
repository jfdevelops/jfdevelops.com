import type { ComponentProps } from 'react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export function Pill({ className, ...props }: ComponentProps<typeof Badge>) {
  return (
    <Badge
      variant="outline"
      render={<li />}
      className={cn(
        'h-auto gap-[0.35rem] border-chip-line bg-chip-bg px-[0.65rem] py-[0.35rem] text-[0.75rem] font-bold text-sea-ink-soft dark:bg-chip-bg',
        className,
      )}
      {...props}
    />
  )
}
