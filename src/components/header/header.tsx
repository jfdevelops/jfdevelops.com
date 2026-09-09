import { Menu } from 'lucide-react'
import { createResourceLinks } from '@/routes/(home)/-sections/definition'
import { Link } from '@tanstack/react-router'
import { HeaderLink } from './link'
import { RouterNavLink } from '../ui/nav-link'
import { PageWrap } from '../ui/page-wrap'
import { BrandLogo } from '../brand-logo'

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
    <header className="sticky top-0 z-50 border-b border-(--line) bg-(--header-bg) px-4 backdrop-blur-lg">
      <PageWrap as="nav" className="flex flex-wrap items-center gap-x-3 gap-y-2 py-3 sm:py-4">
        <div className="shrink-0">
          <Link
            to="/"
            className="inline-flex min-h-11 items-center rounded-sm no-underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--sea-ink)"
          >
            <BrandLogo />
          </Link>
        </div>

        <div className="order-3 hidden w-full flex-wrap items-center gap-x-4 gap-y-1 pb-1 text-sm font-semibold lg:order-0 lg:flex lg:w-auto lg:flex-nowrap lg:pb-0">
          {sectionLinks.map(({ href, label }) => (
            <HeaderLink key={href.full} hash={href.hash} to={href.given}>
              {label}
            </HeaderLink>
          ))}
          <RouterNavLink to="/docs">Docs</RouterNavLink>
        </div>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <HeaderLink
            to="/"
            className="hidden min-h-11 items-center rounded-full border border-(--lagoon-deep) bg-(--lagoon-deep) px-4 py-2 text-sm font-semibold text-(--foam)! no-underline transition hover:-translate-y-0.5 hover:opacity-90 lg:inline-flex"
            hash="contact"
          >
            Get in touch
          </HeaderLink>
          <details className="mobile-nav">
            <summary aria-label="Navigation menu">
              <Menu size={19} aria-hidden="true" />
            </summary>
            <nav className="mobile-nav-panel" aria-label="Mobile navigation">
              {[
                ...sectionLinks.map(({ href, label }) => ({ href: href.full, label })),
                { href: '/docs', label: 'Docs' },
                { href: '/#contact', label: 'Get in touch' },
              ].map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  onClick={(event) =>
                    event.currentTarget.closest('details')?.removeAttribute('open')
                  }
                >
                  {label}
                </a>
              ))}
            </nav>
          </details>
        </div>
      </PageWrap>
    </header>
  )
}
