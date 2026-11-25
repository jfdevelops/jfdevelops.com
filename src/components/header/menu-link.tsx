import { createLink } from '@tanstack/react-router'
import type { ComponentPropsWithRef } from 'react'
import { cn } from '@/lib/utils'

function MenuLinkAnchor({ className, ...props }: ComponentPropsWithRef<'a'>) {
  return (
    <a
      className={cn(
        'block rounded-[4px] p-3 text-[14px] text-sea-ink no-underline hover:bg-brand-tint hover:text-brand-accent',
        className,
      )}
      {...props}
    />
  )
}

/** Type-safe router link for the small-screen menu. */
export const MenuLink = createLink(MenuLinkAnchor)
