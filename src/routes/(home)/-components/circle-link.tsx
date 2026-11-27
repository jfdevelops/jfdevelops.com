import { createLink } from '@tanstack/react-router'
import type { ComponentPropsWithRef } from 'react'
import { cn } from '@/lib/utils'

function CircleLinkAnchor({ className, ...props }: ComponentPropsWithRef<'a'>) {
  return (
    <a
      className={cn(
        'grid size-9 place-items-center rounded-full border border-line hover:bg-brand-accent hover:text-foam',
        className,
      )}
      {...props}
    />
  )
}

/** Type-safe round icon link. */
export const CircleLink = createLink(CircleLinkAnchor)
