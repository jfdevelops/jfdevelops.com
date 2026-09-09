import { AppWindow, ArrowUpRight, Plug, Workflow, Wrench } from 'lucide-react'
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
    <ServicesSection className="services-grid">
      {services.map(({ icon: Icon, title, description, detail }, index) => (
        <article className="service-card" key={title}>
          <div className="service-top">
            <Icon size={27} strokeWidth={1.5} aria-hidden="true" />
            <span>0{index + 1}</span>
          </div>
          <h3>{title}</h3>
          <p>{description}</p>
          <div className="service-bottom">
            <span>{detail}</span>
            <a href="#contact" aria-label={`Discuss ${title.toLowerCase()}`}>
              <ArrowUpRight size={20} />
            </a>
          </div>
        </article>
      ))}
    </ServicesSection>
  )
}
