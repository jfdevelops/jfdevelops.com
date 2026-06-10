const caseStudies = [
  {
    title: 'Multi-step Form Platform',
    image: '/case-studies/multi-step-form.png',
    problem:
      'Teams needed to collect complex, conditional information but long single-page forms had high drop-off.',
    solution:
      'A configurable multi-step form engine with progress saving, conditional logic, and validation at each step.',
    tech: ['React', 'TypeScript', 'TanStack', 'Zod'],
    outcome: 'Higher completion rates and reusable form definitions across products.',
  },
  {
    title: 'Dynamic Admin Dashboard',
    image: '/case-studies/admin-dashboard.png',
    problem:
      'Operations relied on scattered spreadsheets with no single view of key metrics.',
    solution:
      'A role-based admin dashboard with live KPIs, charts, and editable data tables backed by a clean API.',
    tech: ['React', 'TypeScript', 'REST API', 'Charts'],
    outcome: 'One source of truth and faster day-to-day decisions for the team.',
  },
  {
    title: 'Ticketing & Issue Management',
    image: '/case-studies/ticketing-system.png',
    problem:
      'Support requests were tracked over email and constantly fell through the cracks.',
    solution:
      'A kanban-style ticketing system with statuses, assignments, comments, and notifications.',
    tech: ['React', 'TypeScript', 'Database design', 'Webhooks'],
    outcome: 'Clear ownership of every issue and a measurable drop in response times.',
  },
]

export function CaseStudies() {
  return (
    <section id="work" className="scroll-mt-24">
      <div className="mb-6">
        <p className="island-kicker mb-2">Case Studies</p>
        <h2 className="display-title text-3xl font-bold text-[var(--sea-ink)] sm:text-4xl">
          Selected work
        </h2>
        <p className="mt-2 max-w-2xl text-pretty text-sm text-[var(--sea-ink-soft)] sm:text-base">
          A look at the kinds of problems I solve and how I approach them, end to end.
        </p>
      </div>
      <div className="space-y-6">
        {caseStudies.map((study, index) => (
          <article
            key={study.title}
            className="island-shell overflow-hidden rounded-2xl"
          >
            <div className="grid gap-0 lg:grid-cols-2">
              <div
                className={`order-1 ${index % 2 === 1 ? 'lg:order-2' : 'lg:order-1'}`}
              >
                <img
                  src={study.image || '/placeholder.svg'}
                  alt={`${study.title} interface preview`}
                  className="h-56 w-full border-b border-[var(--line)] object-cover sm:h-72 lg:h-full lg:border-b-0"
                  loading="lazy"
                />
              </div>
              <div
                className={`order-2 p-6 sm:p-8 ${index % 2 === 1 ? 'lg:order-1' : 'lg:order-2'}`}
              >
                <h3 className="display-title mb-4 text-2xl font-bold text-[var(--sea-ink)]">
                  {study.title}
                </h3>
                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="island-kicker mb-1">Problem</dt>
                    <dd className="m-0 leading-relaxed text-[var(--sea-ink-soft)]">
                      {study.problem}
                    </dd>
                  </div>
                  <div>
                    <dt className="island-kicker mb-1">Solution</dt>
                    <dd className="m-0 leading-relaxed text-[var(--sea-ink-soft)]">
                      {study.solution}
                    </dd>
                  </div>
                  <div>
                    <dt className="island-kicker mb-1">Outcome</dt>
                    <dd className="m-0 leading-relaxed text-[var(--sea-ink-soft)]">
                      {study.outcome}
                    </dd>
                  </div>
                </dl>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {study.tech.map((tech) => (
                    <li key={tech} className="demo-pill">
                      {tech}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
