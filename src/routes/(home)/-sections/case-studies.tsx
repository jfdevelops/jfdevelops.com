import { IslandShell } from '@/components/ui/island-shell'
import { Kicker } from '@/components/ui/kicker'
import { Pill } from '../-components/pill'
import { SoftwarePreview } from '../-components/software-preview/software-preview'
import { createResourceLayout } from './definition'

const CaseStudiesSection = createResourceLayout({
  id: 'case-studies',
  name: 'CaseStudiesSection',
  resource: 'case-studies',
  sectionName: 'The possibilities, made tangible',
  title: 'Small details. Meaningful differences.',
})

const caseStudies = [
  {
    title: 'Multi-step Form Platform',
    variant: 'form' as const,
    problem:
      'Teams needed to collect complex, conditional information but long single-page forms had high drop-off.',
    solution:
      'A configurable multi-step form engine with progress saving, conditional logic, and validation at each step.',
    tech: ['React', 'TypeScript', 'TanStack', 'Zod'],
    outcome: 'Progress saving and reusable form definitions across products.',
  },
  {
    title: 'Dynamic Admin Dashboard',
    variant: 'dashboard' as const,
    problem: 'Operations relied on scattered spreadsheets with no single view of key metrics.',
    solution:
      'A role-based admin dashboard with live KPIs, charts, and editable data tables backed by a clean API.',
    tech: ['React', 'TypeScript', 'REST API', 'Charts'],
    outcome: 'One source of truth and faster day-to-day decisions for the team.',
  },
  {
    title: 'Ticketing & Issue Management',
    variant: 'tickets' as const,
    problem: 'Support requests were tracked over email and constantly fell through the cracks.',
    solution:
      'A kanban-style ticketing system with statuses, assignments, comments, and notifications.',
    tech: ['React', 'TypeScript', 'Database design', 'Webhooks'],
    outcome: 'Clear ownership, status tracking, and a shared queue for every issue.',
  },
]

export function CaseStudies() {
  return (
    <CaseStudiesSection className="space-y-6">
      {caseStudies.map((study, index) => (
        <IslandShell as="article" key={study.title} className="overflow-hidden rounded-2xl">
          <div className="grid gap-0 lg:grid-cols-2">
            <div className={`order-1 ${index % 2 === 1 ? 'lg:order-2' : 'lg:order-1'}`}>
              <div className="flex h-full min-h-[370px] items-center justify-center bg-brand-tint p-[34px] max-[900px]:min-h-[340px] max-md:p-5">
                <SoftwarePreview
                  variant={study.variant}
                  className="w-full shadow-[0_12px_24px_#00000012]"
                />
              </div>
            </div>
            <div className={`order-2 p-6 sm:p-8 ${index % 2 === 1 ? 'lg:order-1' : 'lg:order-2'}`}>
              <h3 className="font-display mb-4 text-2xl font-bold text-sea-ink">{study.title}</h3>
              <dl className="space-y-3 text-sm">
                <div>
                  <Kicker as="dt" className="mb-1">
                    Problem
                  </Kicker>
                  <dd className="m-0 leading-relaxed text-sea-ink-soft">{study.problem}</dd>
                </div>
                <div>
                  <Kicker as="dt" className="mb-1">
                    Solution
                  </Kicker>
                  <dd className="m-0 leading-relaxed text-sea-ink-soft">{study.solution}</dd>
                </div>
                <div>
                  <Kicker as="dt" className="mb-1">
                    Capabilities
                  </Kicker>
                  <dd className="m-0 leading-relaxed text-sea-ink-soft">{study.outcome}</dd>
                </div>
              </dl>
              <ul className="mt-4 flex flex-wrap gap-2">
                {study.tech.map((tech) => (
                  <Pill key={tech}>{tech}</Pill>
                ))}
              </ul>
            </div>
          </div>
        </IslandShell>
      ))}
    </CaseStudiesSection>
  )
}
