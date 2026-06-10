import { Check } from 'lucide-react'

const reasons = [
  'Full-stack development — frontend, backend, and database',
  'Modern React and TypeScript expertise',
  'Custom solutions instead of generic templates',
  'Direct communication with the developer doing the work',
  'Scalable architecture built to grow with you',
]

export function About() {
  return (
    <section id="about" className="scroll-mt-24">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="island-shell rounded-2xl p-6 sm:p-8">
          <p className="island-kicker mb-2">Why work with me</p>
          <h2 className="display-title mb-5 text-2xl font-bold text-[var(--sea-ink)] sm:text-3xl">
            A focused partner, not a faceless agency
          </h2>
          <ul className="space-y-3 p-0">
            {reasons.map((reason) => (
              <li key={reason} className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] text-[var(--sea-ink)]">
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <span className="text-sm leading-relaxed text-[var(--sea-ink-soft)]">
                  {reason}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="island-shell rounded-2xl p-6 sm:p-8">
          <p className="island-kicker mb-2">About</p>
          <h2 className="display-title mb-5 text-2xl font-bold text-[var(--sea-ink)] sm:text-3xl">
            Hi, I&apos;m the developer behind JF Develops
          </h2>
          <div className="space-y-4 text-sm leading-relaxed text-[var(--sea-ink-soft)]">
            <p className="m-0">
              I&apos;m a full-stack software developer who specializes in
              building custom web applications and internal tools with React,
              TypeScript, and modern backend technologies.
            </p>
            <p className="m-0">
              I work with founders, small teams, and growing businesses who need
              software tailored to how they actually operate &mdash; not another
              one-size-fits-all SaaS subscription.
            </p>
            <p className="m-0">
              Every project is handled directly by me, which means clear
              communication, thoughtful architecture, and software you can
              keep building on for years.
            </p>
          </div>
          <ul className="mt-5 flex flex-wrap gap-2">
            {['React', 'TypeScript', 'Node.js', 'Postgres', 'REST APIs', 'TanStack'].map(
              (tech) => (
                <li key={tech} className="demo-pill">
                  {tech}
                </li>
              ),
            )}
          </ul>
        </div>
      </div>
    </section>
  )
}
