const CALENDLY_URL = 'https://calendly.com/jfdevelops/intro-call'

export function Hero() {
  return (
    <section
      id="top"
      className="island-shell rise-in relative overflow-hidden rounded-[2rem] px-6 py-12 sm:px-10 sm:py-16"
    >
      <div className="pointer-events-none absolute -left-20 -top-24 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(42,42,42,0.1),transparent_66%)]" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(58,58,58,0.08),transparent_66%)]" />
      <p className="island-kicker mb-3">JF Develops &middot; Software Consulting</p>
      <h1 className="display-title mb-5 max-w-3xl text-4xl font-bold leading-[1.02] tracking-tight text-[var(--sea-ink)] sm:text-6xl">
        Custom software that solves real business problems.
      </h1>
      <p className="mb-8 max-w-2xl text-pretty text-base text-[var(--sea-ink-soft)] sm:text-lg">
        Web apps, internal tools, admin dashboards, integrations, and business
        automation &mdash; built with modern technologies and shipped by the
        developer you actually talk to.
      </p>
      <div className="flex flex-wrap gap-3">
        <a
          href={CALENDLY_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 items-center rounded-full border border-[var(--lagoon-deep)] bg-[var(--lagoon-deep)] px-5 py-2.5 text-sm font-semibold !text-[var(--foam)] no-underline transition hover:-translate-y-0.5 hover:opacity-90"
        >
          Book a call
        </a>
        <a
          href="#contact"
          className="inline-flex min-h-11 items-center rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-5 py-2.5 text-sm font-semibold text-[var(--sea-ink)] no-underline transition hover:-translate-y-0.5 hover:bg-[var(--link-bg-hover)]"
        >
          Request a quote
        </a>
      </div>

      <dl className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { value: 'Full-stack', label: 'End-to-end delivery' },
          { value: 'React / TS', label: 'Modern stack' },
          { value: '1:1', label: 'Direct with the dev' },
          { value: 'Scalable', label: 'Built to grow' },
        ].map((stat) => (
          <div key={stat.label}>
            <dt className="display-title text-xl font-bold text-[var(--sea-ink)] sm:text-2xl">
              {stat.value}
            </dt>
            <dd className="m-0 text-xs text-[var(--sea-ink-soft)] sm:text-sm">
              {stat.label}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
