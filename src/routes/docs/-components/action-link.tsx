import { createLink } from '@tanstack/react-router'
import type { ComponentPropsWithRef } from 'react'
import { cn } from '@/lib/utils'

const variants = {
  primary: 'bg-lagoon-deep text-foam hover:opacity-90 motion-safe:hover:-translate-y-px',
  secondary:
    'border border-line bg-surface-strong text-sea-ink hover:border-lagoon/45 hover:bg-lagoon/8',
}

type ActionLinkAnchorProps = ComponentPropsWithRef<'a'> & {
  variant?: keyof typeof variants
}

function ActionLinkAnchor({ variant = 'primary', className, ...props }: ActionLinkAnchorProps) {
  return (
    <a
      className={cn(
        'inline-flex items-center gap-2 rounded-[0.65rem] px-[1.05rem] py-[0.65rem] text-[0.875rem] font-semibold transition-[transform,background-color,border-color,opacity] duration-180',
        variants[variant],
        className,
      )}
      {...props}
    />
  )
}

/** Type-safe hero action link for the docs home. */
export const ActionLink = createLink(ActionLinkAnchor)
