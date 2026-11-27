import { createLink } from '@tanstack/react-router'
import type { ComponentPropsWithRef } from 'react'
import { cn } from '@/lib/utils'

function FooterLinkAnchor({ className, ...props }: ComponentPropsWithRef<'a'>) {
  return (
    <a
      className={cn('text-sm text-lagoon-deep no-underline transition hover:text-palm', className)}
      {...props}
    />
  )
}

/** Type-safe footer navigation link. */
export const FooterLink = createLink(FooterLinkAnchor)
