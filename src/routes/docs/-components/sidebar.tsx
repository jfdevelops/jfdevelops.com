import type { Node, Root } from 'fumadocs-core/page-tree'
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
        // The header row is top-aligned for a text title; center the icon buttons on the logo instead.
        '[&>div:first-child]:items-center [&>div:first-child]:justify-between [&>div:first-child>div]:m-0',
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

function collapseNode(node: Node): Node {
  if (node.type !== 'folder') return node

  return {
    ...node,
    defaultOpen: node.defaultOpen ?? false,
    children: node.children.map(collapseNode),
  }
}

/**
 * Closes folders without an explicit `defaultOpen`. The glass sidebar opens them by default;
 * the folder holding the current page still opens.
 */
export function collapseFolders(tree: Root): Root {
  return { ...tree, children: tree.children.map(collapseNode) }
}
