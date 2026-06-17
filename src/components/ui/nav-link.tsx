import { Link, type LinkProps } from '@tanstack/react-router'
import { type ComponentPropsWithRef } from 'react'
import { cn } from '#/lib/utils'

const navLinkClass = [
  'relative inline-flex items-center no-underline text-[var(--sea-ink-soft)]',
  'hover:text-[var(--sea-ink)]',
  'after:absolute after:bottom-[-4px] after:left-0 after:h-0.5 after:w-full',
  'after:origin-left after:scale-x-0',
  'after:bg-[linear-gradient(90deg,var(--sea-ink),var(--sea-ink-soft))]',
  'after:transition-transform after:duration-[170ms] after:content-[""]',
  'hover:after:scale-x-100',
  'data-[active]:text-[var(--sea-ink)] data-[active]:after:scale-x-100',
  'sm:after:bottom-[-6px]',
].join(' ')

export function NavLink({ className, ...props }: ComponentPropsWithRef<'a'>) {
  return <a className={cn(navLinkClass, className)} {...props} />
}

export function RouterNavLink({
  className,
  ...props
}: Omit<LinkProps, 'activeProps'> & { className?: string }) {
  return (
    <Link
      className={cn(navLinkClass, className)}
      activeProps={{ 'data-active': '' } as {}}
      {...props}
    />
  )
}
