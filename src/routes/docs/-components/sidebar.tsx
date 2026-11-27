import {
  Sidebar as GlassSidebar,
  SidebarDrawer,
  SidebarProvider,
  useSidebar,
} from 'fumadocs-ui/layouts/glass/slots/sidebar'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

function Sidebar({ className, ...props }: ComponentProps<typeof GlassSidebar>) {
  return (
    <GlassSidebar
      className={cn(
        // Radix wraps the scroll area content in a `display: table` div, which lays top-level pages out inline.
        '[&_[data-radix-scroll-area-viewport]>div]:flex! [&_[data-radix-scroll-area-viewport]>div]:flex-col!',
        className,
      )}
      {...props}
    />
  )
}

/** Glass layout sidebar slots with the top-level page list stacked. */
export const sidebarSlots = {
  main: Sidebar,
  drawer: SidebarDrawer,
  provider: SidebarProvider,
  use: useSidebar,
}
