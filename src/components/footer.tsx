import { Link } from '@tanstack/react-router'
import { BrandLogo } from './brand-logo'
import { FooterLink } from './footer-link'
import { ThemeToggle } from './theme-toggle'
import { Kicker } from './ui/kicker'
import { PageWrap } from './ui/page-wrap'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-24 border-t border-line px-4 pb-14 pt-12 text-sea-ink-soft">
      <PageWrap className="grid gap-10 sm:grid-cols-3">
        <div>
          <Link
            to="/"
            className="inline-flex min-h-11 items-center rounded-sm no-underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sea-ink"
          >
            <BrandLogo />
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed">
            Custom software that solves real business problems &mdash; built and shipped by the
            developer you talk to.
          </p>
        </div>

        <nav aria-label="Services">
          <Kicker className="mb-3">Services</Kicker>
          <ul className="space-y-2 p-0">
            <li>
              <FooterLink to="/" hash="services">
                What I build
              </FooterLink>
            </li>
            <li>
              <FooterLink to="/" hash="case-studies">
                Case studies
              </FooterLink>
            </li>
            <li>
              <FooterLink to="/" hash="process">
                Process
              </FooterLink>
            </li>
          </ul>
        </nav>
        <nav aria-label="Company">
          <Kicker className="mb-3">Company</Kicker>
          <ul className="space-y-2 p-0">
            <li>
              <FooterLink to="/" hash="about">
                About
              </FooterLink>
            </li>
            <li>
              <FooterLink to="/" hash="faq">
                FAQ
              </FooterLink>
            </li>
            <li>
              <FooterLink to="/" hash="contact">
                Contact
              </FooterLink>
            </li>
          </ul>
        </nav>
      </PageWrap>

      <PageWrap className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-line pt-6 text-center sm:flex-row sm:text-left">
        <p className="m-0 text-sm">&copy; {year} JF Develops. All rights reserved.</p>
        <div className="flex items-center gap-3">
          <span className="text-xs">Appearance</span>
          <ThemeToggle />
        </div>
      </PageWrap>
    </footer>
  )
}
