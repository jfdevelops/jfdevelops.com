import type { ComponentProps } from 'react'
import { SelectTrigger } from '@/components/ui/select'
import { cn } from '@/lib/utils'

export function FormSelectTrigger({ className, ...props }: ComponentProps<typeof SelectTrigger>) {
  return (
    <SelectTrigger
      className={cn(
        'mt-2 min-h-11 w-full rounded-xl border-line bg-surface-strong px-4 py-2.5 text-base text-sea-ink data-[size=default]:h-auto dark:bg-surface-strong dark:hover:bg-surface-strong',
        className,
      )}
      {...props}
    />
  )
}
