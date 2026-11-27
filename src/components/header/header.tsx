import { Link } from '@tanstack/react-router'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { createResourceLinks } from '@/routes/(home)/-sections/definition'
import { BrandLogo } from '../brand-logo'
import { NavLink } from '../ui/nav-link'
import { PageWrap } from '../ui/page-wrap'
import { DocsMenu } from './docs-menu'
import { MenuLink } from './menu-link'

const sectionLinks = createResourceLinks({
  services: {
    label: 'Services',
    hash: 'services',
  },
  'case-studies': {
    label: 'Work',
    hash: 'case-studies',
  },
  process: {
    label: 'Process',
    hash: 'process',
  },
  about: {
    label: 'About',
    hash: 'about',
  },
  faq: {
    label: 'FAQ',
    hash: 'faq',
  },
})

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-header-bg px-4 backdrop-blur-lg">
      <PageWrap as="nav" className="flex flex-wrap items-center gap-x-3 gap-y-2 py-3 sm:py-4">
        <div className="shrink-0">
          <Link
            to="/"
            className="inline-flex min-h-11 items-center rounded-sm text-sea-ink no-underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sea-ink"
          >
            <BrandLogo />
          </Link>
        </div>

        <div className="order-3 hidden w-full flex-wrap items-center gap-x-4 gap-y-1 pb-1 text-sm font-semibold lg:order-0 lg:flex lg:w-auto lg:flex-nowrap lg:pb-0">
          {sectionLinks.map(({ href, label }) => (
            <NavLink
              key={href.full}
              to={href.given}
              hash={href.hash}
              activeOptions={{ includeHash: true }}
            >
              {label}
            </NavLink>
          ))}
          <DocsMenu />
        </div>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <Link
            to="/"
            className="hidden min-h-11 items-center rounded-full border border-lagoon-deep bg-lagoon-deep px-4 py-2 text-sm font-semibold text-foam! no-underline transition hover:-translate-y-0.5 hover:opacity-90 lg:inline-flex"
            hash="contact"
          >
            Get in touch
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Navigation menu"
                  className="size-11 rounded-[6px] border-line bg-transparent text-sea-ink lg:hidden dark:bg-transparent"
                />
              }
            >
              <Menu size={19} aria-hidden="true" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={8}
              className="w-[220px] rounded-[8px] border border-line bg-foam p-2.5 text-sea-ink shadow-[0_12px_30px_#06241826] ring-0"
            >
              {sectionLinks.map(({ href, label }) => (
                <MenuLink key={href.full} to={href.given} hash={href.hash}>
                  {label}
                </MenuLink>
              ))}
              <MenuLink to="/docs">For developers</MenuLink>
              <MenuLink to="/" hash="contact">
                Get in touch
              </MenuLink>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </PageWrap>
    </header>
  )
}
