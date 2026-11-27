import type { ComponentProps } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

export function FormTextarea({ className, ...props }: ComponentProps<typeof Textarea>) {
  return (
    <Textarea
      className={cn(
        'mt-2 min-h-28 rounded-xl border-line bg-surface-strong px-4 py-2.5 text-base text-sea-ink md:text-base dark:bg-surface-strong',
        className,
      )}
      {...props}
    />
  )
}
