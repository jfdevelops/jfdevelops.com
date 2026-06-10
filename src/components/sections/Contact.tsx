import { Mail, CalendarClock } from 'lucide-react'
import { ContactForm } from '#/components/ContactForm'

const CALENDLY_URL = 'https://calendly.com/jfdevelops/intro-call'
const EMAIL = 'hello@jfdevelops.com'

export function Contact() {
  return (
    <section id="contact" className="scroll-mt-24">
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="island-shell rounded-2xl p-6 sm:p-8 lg:col-span-3">
          <p className="island-kicker mb-2">Contact</p>
          <h2 className="display-title mb-2 text-2xl font-bold text-[var(--sea-ink)] sm:text-3xl">
            Tell me about your project
          </h2>
          <p className="mb-6 text-sm leading-relaxed text-[var(--sea-ink-soft)]">
            Share a few details and I&apos;ll get back to you with next steps.
          </p>
          <ContactForm />
        </div>

        <div className="lg:col-span-2">
          <div className="island-shell flex h-full flex-col gap-4 rounded-2xl p-6 sm:p-8">
            <p className="island-kicker">Prefer to talk?</p>
            <a
              href={CALENDLY_URL}
              target="_blank"
              rel="noreferrer"
              className="island-shell feature-card flex min-h-11 items-start gap-3 rounded-xl p-4 no-underline"
            >
              <span className="mt-0.5 inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-[var(--chip-line)] bg-[var(--chip-bg)] text-[var(--sea-ink)]">
                <CalendarClock className="h-5 w-5" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-[var(--sea-ink)]">
                  Book a call
                </span>
                <span className="block text-xs text-[var(--sea-ink-soft)]">
                  Grab a free 30-minute intro slot on my calendar.
                </span>
              </span>
            </a>
            <a
              href={`mailto:${EMAIL}`}
              className="island-shell feature-card flex min-h-11 items-start gap-3 rounded-xl p-4 no-underline"
            >
              <span className="mt-0.5 inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-[var(--chip-line)] bg-[var(--chip-bg)] text-[var(--sea-ink)]">
                <Mail className="h-5 w-5" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-[var(--sea-ink)]">
                  Email me
                </span>
                <span className="block break-all text-xs text-[var(--sea-ink-soft)]">
                  {EMAIL}
                </span>
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
