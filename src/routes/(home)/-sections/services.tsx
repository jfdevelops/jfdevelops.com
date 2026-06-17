import { FeatureCard } from '@/components/ui/island-shell'
import {
  AppWindow,
  Database,
  Gauge,
  LayoutDashboard,
  LifeBuoy,
  Plug,
  Users,
  Workflow,
  Wrench,
} from 'lucide-react'
import { createResourceLayout } from './definition'

const ServicesSection = createResourceLayout({
  id: 'services',
  name: 'ServicesSection',
  resource: 'services',
  sectionName: 'Services',
  title: 'What I build',
})

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
    description: 'Clear, fast dashboards that surface the metrics and controls that matter.',
  },
  {
    icon: Users,
    title: 'Customer Portals',
    description: 'Self-serve portals that give your customers a secure, polished experience.',
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
    description: 'Schemas and data models built for integrity, performance, and future growth.',
  },
  {
    icon: Workflow,
    title: 'System Integrations',
    description: 'Connect the tools you already use so data flows automatically between them.',
  },
  {
    icon: LifeBuoy,
    title: 'Maintenance & Support',
    description: 'Ongoing care to keep your software secure, updated, and running smoothly.',
  },
  {
    icon: Gauge,
    title: 'Performance Optimization',
    description: 'Profiling and tuning to make slow apps fast and expensive infra cheaper.',
  },
]

export function Services() {
  return (
    <ServicesSection className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {services.map(({ icon: Icon, title, description }) => (
        <FeatureCard as="article" key={title} className="rounded-2xl p-5">
          <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-(--chip-line) bg-(--chip-bg) text-(--sea-ink)">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <h3 className="mb-1.5 text-base font-semibold text-(--sea-ink)">{title}</h3>
          <p className="m-0 text-sm leading-relaxed text-(--sea-ink-soft)">{description}</p>
        </FeatureCard>
      ))}
    </ServicesSection>
  )
}
