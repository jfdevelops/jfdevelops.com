import { AppWindow, ArrowUpRight, Plug, Workflow, Wrench } from 'lucide-react'
import { CircleLink } from '../-components/circle-link'
import { createResourceLayout } from './definition'

const ServicesSection = createResourceLayout({
  id: 'services',
  name: 'ServicesSection',
  resource: 'services',
  sectionName: 'What I can help with',
  title: 'Good software makes room for better work.',
  description:
    'From a first product to the tools behind your team. Built to fit, and built to last.',
})
const services = [
  {
    icon: AppWindow,
    title: 'Bring your product to life.',
    description:
      'Custom web applications and customer portals that make your idea useful, intuitive, and ready for real people.',
    detail: 'Web apps / Customer portals',
  },
  {
    icon: Workflow,
    title: 'Give your team better tools.',
    description:
      'Replace scattered spreadsheets and repetitive steps with a workspace that makes the next move clear.',
    detail: 'Internal tools / Dashboards',
  },
  {
    icon: Plug,
    title: 'Make your systems talk.',
    description:
      'Connect your apps, organize your data, and automate the handoffs that keep your business moving.',
    detail: 'Integrations / APIs / Databases',
  },
  {
    icon: Wrench,
    title: 'Keep moving forward.',
    description:
      'Thoughtful improvements, performance tuning, and ongoing support as your software and business grow.',
    detail: 'Maintenance / Optimization',
  },
]
export function Services() {
  return (
    <ServicesSection className="grid grid-cols-2 gap-[18px] max-md:grid-cols-1">
      {services.map(({ icon: Icon, title, description, detail }, index) => (
        <article
          key={title}
          className="rounded-[10px] border border-line bg-surface-strong p-[30px] first:bg-brand-tint max-md:p-[25px]"
        >
          <div className="flex items-center justify-between text-sea-ink">
            <Icon size={27} strokeWidth={1.5} aria-hidden="true" />
            <span className="font-[monospace] text-[11px] opacity-65">0{index + 1}</span>
          </div>
          <h3 className="mt-[25px] mb-3 font-display text-[25px] font-medium tracking-[-0.03em]">
            {title}
          </h3>
          <p className="max-w-[420px] text-[14px] leading-[1.8] text-sea-ink-soft">{description}</p>
          <div className="mt-6 flex items-center justify-between gap-2.5 border-t border-line pt-5 text-[10px] text-sea-ink-soft">
            <span>{detail}</span>
            <CircleLink to="/" hash="contact" aria-label={`Discuss ${title.toLowerCase()}`}>
              <ArrowUpRight size={20} />
            </CircleLink>
          </div>
        </article>
      ))}
    </ServicesSection>
  )
}
