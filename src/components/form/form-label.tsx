import type { ComponentProps } from 'react'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export function FormLabel({ className, ...props }: ComponentProps<typeof Label>) {
  return (
    <Label
      className={cn('block text-sm leading-normal font-semibold text-sea-ink', className)}
      {...props}
    />
  )
}
