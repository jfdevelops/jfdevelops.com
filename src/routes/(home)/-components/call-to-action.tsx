import { createLink } from '@tanstack/react-router'
import type { ComponentPropsWithRef } from 'react'
import { cn } from '@/lib/utils'

function CallToActionAnchor({ className, ...props }: ComponentPropsWithRef<'a'>) {
  return (
    <a
      className={cn(
        'inline-flex min-h-12 items-center justify-center gap-[18px] rounded-[7px] bg-brand-accent px-[22px] py-3.5 text-[14px] font-semibold text-foam no-underline',
        'hover:bg-lagoon-deep hover:text-foam motion-safe:hover:-translate-y-0.5',
        className,
      )}
      {...props}
    />
  )
}

/** Type-safe primary filled action link. */
export const CallToAction = createLink(CallToActionAnchor)
