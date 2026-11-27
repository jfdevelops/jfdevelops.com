import { useLocation } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import { cn } from '@/lib/utils'
import { libraryGroups } from '@/routes/docs/-utils/libraries'
import { DocsMenuLink } from './docs-menu-link'

/** "For developers" header menu listing every documented library. */
export function DocsMenu() {
  const isDocs = useLocation({ select: ({ pathname }) => /^\/docs(?:\/|$)/.test(pathname) })

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger
            className={cn(
              'h-auto rounded-none bg-transparent p-0 text-sm font-semibold text-lagoon-deep',
              'hover:bg-transparent hover:text-palm focus:bg-transparent data-open:bg-transparent data-open:hover:bg-transparent data-open:focus:bg-transparent data-popup-open:bg-transparent data-popup-open:hover:bg-transparent',
              // Same underline as the other header links; it stays while browsing the docs.
              'relative after:absolute after:bottom-[-4px] after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0',
              'after:bg-linear-90 after:from-sea-ink after:to-sea-ink-soft after:transition-transform after:duration-170 after:content-[""]',
              'hover:after:scale-x-100 sm:after:bottom-[-6px]',
              isDocs && 'after:scale-x-100',
            )}
          >
            For developers
          </NavigationMenuTrigger>
          <NavigationMenuContent className="w-[min(52rem,calc(100vw-2rem))] p-3">
            {libraryGroups.map((group) => (
              <section key={group.id} aria-labelledby={`docs-menu-${group.id}`}>
                <p
                  id={`docs-menu-${group.id}`}
                  className="m-0 px-3 pt-2 pb-1 text-xs font-semibold text-sea-ink-soft"
                >
                  {group.title}
                </p>
                <ul className="m-0 grid list-none gap-1 p-0 sm:grid-cols-3">
                  {group.libraries.map((library) => (
                    <li key={library.id}>
                      <DocsMenuLink to="/docs/$package" params={{ package: library.id }}>
                        <span className="text-sm font-semibold">{library.title}</span>
                        <span className="text-xs leading-relaxed text-sea-ink-soft">
                          {library.description}
                        </span>
                      </DocsMenuLink>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
            <DocsMenuLink
              to="/docs"
              className="mt-2 flex-row items-center border-t border-line pt-3 text-sm font-semibold text-lagoon-deep"
            >
              All documentation <ArrowRight aria-hidden="true" className="size-3.5" />
            </DocsMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}
