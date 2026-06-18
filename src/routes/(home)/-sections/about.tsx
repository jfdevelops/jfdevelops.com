import { IslandShell } from '@/components/ui/island-shell';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import type { ComponentPropsWithRef } from 'react';
import { createResourceLayout } from './definition';

const AboutSection = createResourceLayout.makeComposable({
  name: 'AboutSection',
  resource: 'about',
});

const reasons = [
  'Full-stack development — frontend, backend, and database',
  'Modern React and TypeScript expertise',
  'Custom solutions instead of generic templates',
  'Direct communication with the developer doing the work',
  'Scalable architecture built to grow with you',
];

function  Content({className, ...props}: ComponentPropsWithRef<typeof AboutSection.SectionHeaderWrapper>){
  return <AboutSection.SectionHeaderWrapper
    as={IslandShell}
    className={cn('rounded-2xl p-6 sm:p-8 mb-0', className)}
    {...props}
  />
}

export function About() {
  return (
    <AboutSection id='about'>
      <div className='flex flex-col lg:flex-row gap-4'>
        <Content>
          <AboutSection.SectionName>Why work with me</AboutSection.SectionName>
          <AboutSection.SectionTitle>
            A focused partner, not a faceless agency
          </AboutSection.SectionTitle>
          <AboutSection.SectionDescription>
            I work with founders, small teams, and growing businesses who need
            software tailored to how they actually operate &mdash; not another
            one-size-fits-all SaaS subscription.
          </AboutSection.SectionDescription>
          <ul className='space-y-3 p-0'>
            {reasons.map((reason) => (
              <li key={reason} className='flex items-start gap-3'>
                <span className='mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-(--chip-line) bg-(--chip-bg) text-(--sea-ink)'>
                  <Check className='h-3.5 w-3.5' aria-hidden='true' />
                </span>
                <span className='text-sm leading-relaxed text-(--sea-ink-soft)'>
                  {reason}
                </span>
              </li>
            ))}
          </ul>
        </Content>
        <Content>
          <AboutSection.SectionName>About</AboutSection.SectionName>
          <AboutSection.SectionTitle>
            Hi, I&apos;m the developer behind JF Develops
          </AboutSection.SectionTitle>
          <AboutSection.SectionDescription>
            <p className='m-0'>
              I&apos;m a full-stack software developer who specializes in
              building custom web applications and internal tools with React,
              TypeScript, and modern backend technologies.
            </p>
            <p className='m-0'>
              I work with founders, small teams, and growing businesses who need
              software tailored to how they actually operate &mdash; not another
              one-size-fits-all SaaS subscription.
            </p>
            <p className='m-0'>
              Every project is handled directly by me, which means clear
              communication, thoughtful architecture, and software you can keep
              building on for years.
            </p>
          </AboutSection.SectionDescription>
          <ul className='mt-5 flex flex-wrap gap-2'>
            {[
              'React',
              'TypeScript',
              'Node.js',
              'Postgres',
              'REST APIs',
              'TanStack',
            ].map((tech) => (
              <li key={tech} className='demo-pill'>
                {tech}
              </li>
            ))}
          </ul>
        </Content>
      </div>
    </AboutSection>
  );
}
