import { ContactForm } from '@/components/ContactForm';
import {
  FeatureCard,
  IslandShell,
  islandShellVariants,
} from '@/components/ui/island-shell';
import { Kicker } from '@/components/ui/kicker';
import { cn } from '@/lib/utils';
import { CalendarClock, Mail } from 'lucide-react';
import { createResourceLayout } from './definition';

const ContactSection = createResourceLayout.makeComposable({
  name: 'ContactSection',
  resource: 'contact',
});

const calendlyUrl = 'https://calendly.com/jfdevelops/intro-call';
const email = 'hello@jfdevelops.com';

export function Contact() {
  return (
    <ContactSection id='contact'>
      <div className='grid gap-4 lg:grid-cols-5'>
        <ContactSection.SectionHeaderWrapper
          className={cn(
            'rounded-2xl p-6 sm:p-8 lg:col-span-3',
            islandShellVariants(),
          )}
        >
          <ContactSection.SectionName>Contact</ContactSection.SectionName>
          <ContactSection.SectionTitle>
            Tell me about your project
          </ContactSection.SectionTitle>
          <ContactSection.SectionDescription>
            Share a few details and I&apos;ll get back to you with next steps.
          </ContactSection.SectionDescription>
          <ContactForm />
        </ContactSection.SectionHeaderWrapper>

        <div className='lg:col-span-2'>
          <IslandShell className='flex h-full flex-col gap-4 rounded-2xl p-6 sm:p-8'>
            <Kicker>Prefer to talk?</Kicker>
            <FeatureCard
              as='a'
              href={calendlyUrl}
              target='_blank'
              rel='noreferrer'
              className='flex min-h-11 items-start gap-3 rounded-xl p-4 no-underline'
            >
              <span className='mt-0.5 inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-[var(--chip-line)] bg-[var(--chip-bg)] text-[var(--sea-ink)]'>
                <CalendarClock className='h-5 w-5' aria-hidden='true' />
              </span>
              <span>
                <span className='block text-sm font-semibold text-[var(--sea-ink)]'>
                  Book a call
                </span>
                <span className='block text-xs text-[var(--sea-ink-soft)]'>
                  Grab a free 30-minute intro slot on my calendar.
                </span>
              </span>
            </FeatureCard>
            <FeatureCard
              as='a'
              href={`mailto:${email}`}
              className='flex min-h-11 items-start gap-3 rounded-xl p-4 no-underline'
            >
              <span className='mt-0.5 inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-[var(--chip-line)] bg-[var(--chip-bg)] text-[var(--sea-ink)]'>
                <Mail className='h-5 w-5' aria-hidden='true' />
              </span>
              <span>
                <span className='block text-sm font-semibold text-[var(--sea-ink)]'>
                  Email me
                </span>
                <span className='block break-all text-xs text-[var(--sea-ink-soft)]'>
                  {email}
                </span>
              </span>
            </FeatureCard>
          </IslandShell>
        </div>
      </div>
    </ContactSection>
  );
}
