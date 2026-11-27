import { createLink } from '@tanstack/react-router'
import type { ComponentPropsWithRef } from 'react'
import { NavigationMenuLink } from '@/components/ui/navigation-menu'
import { cn } from '@/lib/utils'

function DocsMenuLinkItem({ className, ...props }: ComponentPropsWithRef<'a'>) {
  return (
    <NavigationMenuLink
      closeOnClick
      className={cn(
        'flex-col items-start gap-1 rounded-[8px] p-3 text-sea-ink no-underline hover:bg-brand-tint focus:bg-brand-tint',
        className,
      )}
      {...props}
    />
  )
}

/** Type-safe router link inside the developer docs menu. */
export const DocsMenuLink = createLink(DocsMenuLinkItem)
