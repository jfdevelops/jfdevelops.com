import type { ComponentProps } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type PillButtonProps = Omit<ComponentProps<typeof Button>, 'variant' | 'size'> & {
  variant?: 'primary' | 'secondary'
}

/** Rounded brand button used for form actions. */
export function PillButton({ className, variant = 'primary', ...props }: PillButtonProps) {
  return (
    <Button
      className={cn(
        'h-auto min-h-11 rounded-full px-5 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5',
        variant === 'primary' &&
          'border-lagoon-deep bg-lagoon-deep text-foam hover:bg-lagoon-deep hover:opacity-90 disabled:opacity-50',
        variant === 'secondary' &&
          'border-chip-line bg-chip-bg text-sea-ink hover:bg-link-bg-hover',
        className,
      )}
      {...props}
    />
  )
}
