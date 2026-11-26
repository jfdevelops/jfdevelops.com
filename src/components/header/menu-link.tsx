import { createLink } from '@tanstack/react-router'
import type { ComponentPropsWithRef } from 'react'
import { DropdownMenuLinkItem } from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

function MenuLinkItem({ className, ...props }: ComponentPropsWithRef<'a'>) {
  return (
    <DropdownMenuLinkItem
      closeOnClick
      className={cn(
        'block rounded-[4px] p-3 text-[14px] text-sea-ink no-underline focus:bg-brand-tint focus:text-brand-accent',
        className,
      )}
      {...props}
    />
  )
}

/** Type-safe router link for the small-screen menu. */
export const MenuLink = createLink(MenuLinkItem)
