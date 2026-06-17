import { cn } from '@/lib/utils';
import { createLink } from '@tanstack/react-router';
import type { AnchorHTMLAttributes } from 'react';

interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {}

export const HeaderLink = createLink(HeaderLinkImpl);

function HeaderLinkImpl({ className, ...props }: LinkProps) {
  return (
    <a
      className={cn(
        'relative inline-flex items-center no-underline text-(--sea-ink-soft)',
        'hover:text-(--sea-ink)',
        'after:absolute after:bottom-[-4px] after:left-0 after:h-0.5 after:w-full',
        'after:origin-left after:scale-x-0',
        'after:bg-[linear-gradient(90deg,var(--sea-ink),var(--sea-ink-soft))]',
        'after:transition-transform after:duration-170 after:content-[""]',
        'hover:after:scale-x-100',
        'data-active:text-(--sea-ink) data-active:after:scale-x-100',
        'sm:after:bottom-[-6px]',
        className,
      )}
      {...props}
    />
  );
}
