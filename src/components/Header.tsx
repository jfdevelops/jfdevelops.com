import { Link } from '@tanstack/react-router'
import ThemeToggle from './ThemeToggle'

const sectionLinks = [
  { href: '/#services', label: 'Services' },
  { href: '/#work', label: 'Work' },
  { href: '/#process', label: 'Process' },
  { href: '/#about', label: 'About' },
  { href: '/#faq', label: 'FAQ' },
]

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--header-bg)] px-4 backdrop-blur-lg">
      <nav className="page-wrap flex flex-wrap items-center gap-x-3 gap-y-2 py-3 sm:py-4">
        <h2 className="m-0 flex-shrink-0 text-base font-semibold tracking-tight">
          <Link
            to="/"
            className="inline-flex items-center gap-3 rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-3 py-1.5 text-sm text-[var(--sea-ink)] no-underline shadow-[0_8px_24px_rgba(20,20,20,0.08)] sm:px-4 sm:py-2"
          >
            <img
              src="/logo.png"
              alt="JF Develops"
              className="h-8 w-8 object-contain"
            />
            <span>JF Develops</span>
          </Link>
        </h2>

        <div className="order-3 hidden w-full flex-wrap items-center gap-x-4 gap-y-1 pb-1 text-sm font-semibold sm:order-none sm:flex sm:w-auto sm:flex-nowrap sm:pb-0">
          {sectionLinks.map((link) => (
            <a key={link.href} href={link.href} className="nav-link">
              {link.label}
            </a>
          ))}
          <Link
            to="/docs"
            className="nav-link"
            activeProps={{ className: 'nav-link is-active' }}
          >
            Docs
          </Link>
        </div>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <a
            href="/#contact"
            className="hidden min-h-11 items-center rounded-full border border-[var(--lagoon-deep)] bg-[var(--lagoon-deep)] px-4 py-2 text-sm font-semibold !text-[var(--foam)] no-underline transition hover:-translate-y-0.5 hover:opacity-90 sm:inline-flex"
          >
            Get in touch
          </a>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  )
}
