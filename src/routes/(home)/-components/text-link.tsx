import { createLink } from '@tanstack/react-router'
import type { ComponentPropsWithRef } from 'react'
import { cn } from '@/lib/utils'

function TextLinkAnchor({ className, ...props }: ComponentPropsWithRef<'a'>) {
  return (
    <a
      className={cn(
        'inline-flex items-center gap-3 text-[13px] font-semibold no-underline',
        className,
      )}
      {...props}
    />
  )
}

/** Type-safe inline link with a trailing icon, used beside primary actions. */
export const TextLink = createLink(TextLinkAnchor)
