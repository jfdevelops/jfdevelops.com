import { createLink } from '@tanstack/react-router'
import type { ComponentPropsWithRef } from 'react'
import { cn } from '@/lib/utils'

function NavLinkAnchor({ className, ...props }: ComponentPropsWithRef<'a'>) {
  return (
    <a
      className={cn(
        'relative inline-flex cursor-pointer items-center text-lagoon-deep no-underline hover:text-palm',
        // Underline that grows in on hover and stays for the active link.
        'after:absolute after:bottom-[-4px] after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0',
        'after:bg-linear-90 after:from-sea-ink after:to-sea-ink-soft after:transition-transform after:duration-170 after:content-[""]',
        'hover:after:scale-x-100 data-[status=active]:after:scale-x-100 sm:after:bottom-[-6px]',
        className,
      )}
      {...props}
    />
  )
}

/** Type-safe router link for site navigation. */
export const NavLink = createLink(NavLinkAnchor)
