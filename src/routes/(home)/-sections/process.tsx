import { FeatureCard } from '@/components/ui/island-shell'
import { createResourceLayout } from './definition'

const ProcessSection = createResourceLayout({
  id: 'process',
  name: 'ProcessSection',
  resource: 'process',
  sectionName: 'Process',
  title: 'What working together looks like',
})

const steps = [
  {
    title: 'Discovery Call',
    description:
      'We talk through your goals, constraints, and what success looks like — no jargon, no pressure.',
  },
  {
    title: 'Requirements & Proposal',
    description:
      'I scope the work into clear deliverables with a timeline and a fixed, transparent quote.',
  },
  {
    title: 'Development',
    description:
      'I build in focused iterations, sharing progress so you always know where things stand.',
  },
  {
    title: 'Testing',
    description:
      'Functionality, edge cases, and performance are checked before anything reaches your users.',
  },
  {
    title: 'Launch',
    description:
      'We deploy to production together and make sure everything runs cleanly on day one.',
  },
  {
    title: 'Ongoing Support',
    description:
      'Optional maintenance keeps your software secure, updated, and evolving with your needs.',
  },
]

export function Process() {
  return (
    <ProcessSection className="grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
      {steps.map(({ title, description }, index) => (
        <FeatureCard as="li" key={title} className="rounded-2xl p-5">
          <span className="font-display mb-2 block text-2xl font-bold text-[var(--sea-ink)]">
            {String(index + 1).padStart(2, '0')}
          </span>
          <h3 className="mb-1.5 text-base font-semibold text-[var(--sea-ink)]">{title}</h3>
          <p className="m-0 text-sm leading-relaxed text-[var(--sea-ink-soft)]">{description}</p>
        </FeatureCard>
      ))}
    </ProcessSection>
  )
}
