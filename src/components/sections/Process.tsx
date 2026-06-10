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
    <section id="process" className="scroll-mt-24">
      <div className="mb-6">
        <p className="island-kicker mb-2">Process</p>
        <h2 className="display-title text-3xl font-bold text-[var(--sea-ink)] sm:text-4xl">
          What working together looks like
        </h2>
      </div>
      <ol className="grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
        {steps.map((step, index) => (
          <li
            key={step.title}
            className="island-shell feature-card rounded-2xl p-5"
          >
            <span className="display-title mb-2 block text-2xl font-bold text-[var(--sea-ink)]">
              {String(index + 1).padStart(2, '0')}
            </span>
            <h3 className="mb-1.5 text-base font-semibold text-[var(--sea-ink)]">
              {step.title}
            </h3>
            <p className="m-0 text-sm leading-relaxed text-[var(--sea-ink-soft)]">
              {step.description}
            </p>
          </li>
        ))}
      </ol>
    </section>
  )
}
