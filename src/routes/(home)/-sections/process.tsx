import { createResourceLayout } from './definition'

const ProcessSection = createResourceLayout({
  id: 'process',

  name: 'ProcessSection',

  resource: 'process',

  sectionName: 'Process',

  title: 'A clear path from “what if” to launch.',
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
    <ProcessSection className="grid list-none gap-0 p-0 sm:grid-cols-2 lg:grid-cols-3">
      {steps.map(({ title, description }, index) => (
        <li key={title} className="border-t border-line py-[26px] pr-6">
          <span className="mb-2 block font-display text-[32px] leading-[calc(2/1.5)] font-medium text-sea-ink">
            {String(index + 1).padStart(2, '0')}
          </span>
          <h3 className="mb-1.5 text-base font-semibold text-sea-ink">{title}</h3>
          <p className="m-0 text-sm leading-relaxed text-sea-ink-soft">{description}</p>
        </li>
      ))}
    </ProcessSection>
  )
}
