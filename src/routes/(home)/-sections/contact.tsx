import { ContactForm } from '@/components/contact-form'

import { FeatureCard, IslandShell } from '@/components/ui/island-shell'

import { Kicker } from '@/components/ui/kicker'

import { cn } from '@/lib/utils'

import { Mail } from 'lucide-react'

import type { ComponentPropsWithRef } from 'react'

import { createResourceLayout } from './definition'

const ContactSection = createResourceLayout.makeComposable({
  name: 'ContactSection',

  resource: 'contact',
})

const email = 'hello@jfdevelops.com'

function Content({
  className,

  ...props
}: ComponentPropsWithRef<typeof ContactSection.SectionHeaderWrapper>) {
  return (
    <ContactSection.SectionHeaderWrapper
      as={IslandShell}
      className={cn('rounded-2xl p-6 sm:p-8 mb-0', className)}
      {...props}
    />
  )
}

export function Contact() {
  return (
    <ContactSection id="contact">
      <div className="grid gap-4 lg:grid-cols-5">
        <Content className="lg:col-span-3">
          <ContactSection.SectionName>Contact</ContactSection.SectionName>
          <ContactSection.SectionTitle>Tell me about your project</ContactSection.SectionTitle>
          <ContactSection.SectionDescription>
            Share a few details and I&apos;ll get back to you with next steps.
          </ContactSection.SectionDescription>
          <ContactForm />
        </Content>

        <Content className="contact-aside lg:col-span-2 flex flex-col gap-4">
          <Kicker>Let’s make it happen</Kicker>
          <h3 className="contact-invitation">A good project starts with a conversation.</h3>
          <p className="text-sm leading-relaxed text-(--sea-ink-soft)">
            Tell me what’s slowing you down, what you’re imagining, or where you want to go next.
            We’ll work out the right next step together.
          </p>
          <Kicker>Prefer email?</Kicker>
          <div className="space-y-4">
            <FeatureCard
              as="a"
              href={`mailto:${email}`}
              className="flex min-h-11 items-start gap-3 rounded-xl p-4 no-underline"
            >
              <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-(--chip-line) bg-(--chip-bg) text-(--sea-ink)">
                <Mail className="h-5 w-5" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-(--sea-ink)">Email me</span>
                <span className="block break-all text-xs text-(--sea-ink-soft)">{email}</span>
              </span>
            </FeatureCard>
          </div>
        </Content>
      </div>
    </ContactSection>
  )
}
