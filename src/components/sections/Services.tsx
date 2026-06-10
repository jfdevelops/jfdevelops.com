import {
  AppWindow,
  Wrench,
  LayoutDashboard,
  Users,
  Plug,
  Database,
  Workflow,
  LifeBuoy,
  Gauge,
} from 'lucide-react'

const services = [
  {
    icon: AppWindow,
    title: 'Custom Web Applications',
    description:
      'Bespoke products built to your exact workflow, not forced into a generic template.',
  },
  {
    icon: Wrench,
    title: 'Internal Business Tools',
    description:
      'Replace spreadsheets and manual steps with tools your team actually enjoys using.',
  },
  {
    icon: LayoutDashboard,
    title: 'Admin Dashboards',
    description:
      'Clear, fast dashboards that surface the metrics and controls that matter.',
  },
  {
    icon: Users,
    title: 'Customer Portals',
    description:
      'Self-serve portals that give your customers a secure, polished experience.',
  },
  {
    icon: Plug,
    title: 'API Development',
    description:
      'Well-documented, reliable APIs that power your apps and third-party integrations.',
  },
  {
    icon: Database,
    title: 'Database Design',
    description:
      'Schemas and data models built for integrity, performance, and future growth.',
  },
  {
    icon: Workflow,
    title: 'System Integrations',
    description:
      'Connect the tools you already use so data flows automatically between them.',
  },
  {
    icon: LifeBuoy,
    title: 'Maintenance & Support',
    description:
      'Ongoing care to keep your software secure, updated, and running smoothly.',
  },
  {
    icon: Gauge,
    title: 'Performance Optimization',
    description:
      'Profiling and tuning to make slow apps fast and expensive infra cheaper.',
  },
]

export function Services() {
  return (
    <section id="services" className="scroll-mt-24">
      <div className="mb-6">
        <p className="island-kicker mb-2">Services</p>
        <h2 className="display-title text-3xl font-bold text-[var(--sea-ink)] sm:text-4xl">
          What I build
        </h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => {
          const Icon = service.icon
          return (
            <article
              key={service.title}
              className="island-shell feature-card rounded-2xl p-5"
            >
              <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--chip-line)] bg-[var(--chip-bg)] text-[var(--sea-ink)]">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="mb-1.5 text-base font-semibold text-[var(--sea-ink)]">
                {service.title}
              </h3>
              <p className="m-0 text-sm leading-relaxed text-[var(--sea-ink-soft)]">
                {service.description}
              </p>
            </article>
          )
        })}
      </div>
    </section>
  )
}
