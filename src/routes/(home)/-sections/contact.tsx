import { ContactForm } from '@/components/ContactForm';
import { FeatureCard, IslandShell } from '@/components/ui/island-shell';
import { Kicker } from '@/components/ui/kicker';
import { cn } from '@/lib/utils';
import { CalendarClock, Mail } from 'lucide-react';
import type { ComponentPropsWithRef } from 'react';
import { createResourceLayout } from './definition';

const ContactSection = createResourceLayout.makeComposable({
  name: 'ContactSection',
  resource: 'contact',
});

const calendlyUrl = 'https://calendly.com/jfdevelops/intro-call';
const email = 'hello@jfdevelops.com';

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
  );
}

export function Contact() {
  return (
    <ContactSection id='contact'>
      <div className='grid gap-4 lg:grid-cols-5'>
        <Content className='lg:col-span-3'>
          <ContactSection.SectionName>Contact</ContactSection.SectionName>
          <ContactSection.SectionTitle>
            Tell me about your project
          </ContactSection.SectionTitle>
          <ContactSection.SectionDescription>
            Share a few details and I&apos;ll get back to you with next steps.
          </ContactSection.SectionDescription>
          <ContactForm />
        </Content>

        <Content className='lg:col-span-2 flex flex-col gap-4'>
          <Kicker>Prefer to talk?</Kicker>
          <div className='space-y-4'>
          <FeatureCard
            as='a'
            href={calendlyUrl}
            target='_blank'
            rel='noreferrer'
            className='flex min-h-11 items-start gap-3 rounded-xl p-4 no-underline'
          >
            <span className='mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-(--chip-line) bg-(--chip-bg) text-(--sea-ink)'>
              <CalendarClock className='h-5 w-5' aria-hidden='true' />
            </span>
            <span>
              <span className='block text-sm font-semibold text-(--sea-ink)'>
                Book a call
              </span>
              <span className='block text-xs text-(--sea-ink-soft)'>
                Grab a free 30-minute intro slot on my calendar.
              </span>
            </span>
          </FeatureCard>
          <FeatureCard
            as='a'
            href={`mailto:${email}`}
            className='flex min-h-11 items-start gap-3 rounded-xl p-4 no-underline'
          >
            <span className='mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-(--chip-line) bg-(--chip-bg) text-(--sea-ink)'>
              <Mail className='h-5 w-5' aria-hidden='true' />
            </span>
            <span>
              <span className='block text-sm font-semibold text-(--sea-ink)'>
                Email me
              </span>
              <span className='block break-all text-xs text-(--sea-ink-soft)'>
                {email}
              </span>
              </span>
            </FeatureCard>
          </div>
        </Content>
      </div>
    </ContactSection>
  );
}
