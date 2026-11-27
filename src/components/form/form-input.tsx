import type { ComponentProps } from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export function FormInput({ className, ...props }: ComponentProps<typeof Input>) {
  return (
    <Input
      className={cn(
        'mt-2 h-auto min-h-11 rounded-xl border-line bg-surface-strong px-4 py-2.5 text-base text-sea-ink md:text-base dark:bg-surface-strong',
        className,
      )}
      {...props}
    />
  )
}
