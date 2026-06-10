import { Link } from '@tanstack/react-router'

const columns = [
  {
    title: 'Services',
    links: [
      { href: '/#services', label: 'What I build' },
      { href: '/#work', label: 'Case studies' },
      { href: '/#process', label: 'Process' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/#about', label: 'About' },
      { href: '/#faq', label: 'FAQ' },
      { href: '/#contact', label: 'Contact' },
    ],
  },
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-24 border-t border-[var(--line)] px-4 pb-14 pt-12 text-[var(--sea-ink-soft)]">
      <div className="page-wrap grid gap-10 sm:grid-cols-3">
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-3 text-sm font-semibold text-[var(--sea-ink)] no-underline"
          >
            <img
              src="/logo.png"
              alt="JF Develops"
              className="h-8 w-8 object-contain"
            />
            <span>JF Develops</span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed">
            Custom software that solves real business problems &mdash; built and
            shipped by the developer you talk to.
          </p>
        </div>

        {columns.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <p className="island-kicker mb-3">{column.title}</p>
            <ul className="space-y-2 p-0">
              {column.links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-[var(--sea-ink-soft)] no-underline transition hover:text-[var(--sea-ink)]"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="page-wrap mt-10 flex flex-col items-center justify-between gap-3 border-t border-[var(--line)] pt-6 text-center sm:flex-row sm:text-left">
        <p className="m-0 text-sm">
          &copy; {year} JF Develops. All rights reserved.
        </p>
        <p className="island-kicker m-0">Software consulting &amp; development</p>
      </div>
    </footer>
  )
}
