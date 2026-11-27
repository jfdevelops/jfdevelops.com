import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { IslandShell } from '@/components/ui/island-shell'
import { createResourceLayout } from './definition'

const FAQSection = createResourceLayout({
  id: 'faq',
  name: 'FAQSection',
  resource: 'faq',
  sectionName: 'FAQ',
  title: 'Common questions',
})

const faqs = [
  {
    question: 'How much does a project cost?',
    answer:
      'It depends on scope, but I provide a clear, fixed quote after our discovery call so there are no surprises. Small tools start lower; larger platforms are scoped in phases.',
  },
  {
    question: 'How long does development take?',
    answer:
      'Most focused projects ship in a few weeks to a couple of months. After understanding your requirements I give you a realistic timeline before any work begins.',
  },
  {
    question: 'Do you provide hosting?',
    answer:
      'Yes. I can deploy and manage your app on modern platforms like Vercel, or hand everything off to your own infrastructure — whichever you prefer.',
  },
  {
    question: 'Do you offer ongoing support?',
    answer:
      'Absolutely. I offer optional maintenance and support plans to keep your software secure, updated, and improving after launch.',
  },
  {
    question: 'Can you work with existing systems?',
    answer:
      'Yes. I regularly integrate with existing databases, APIs, and tools, and can extend or modernize software you already rely on.',
  },
]

export function FAQ() {
  return (
    <FAQSection>
      <Accordion className="gap-3 overflow-visible rounded-none border-0">
        {faqs.map((faq) => (
          <AccordionItem
            key={faq.question}
            render={<IslandShell />}
            className="rounded-2xl p-5 data-open:bg-surface-strong"
          >
            <AccordionTrigger className="items-center gap-4 p-0 text-base font-semibold text-sea-ink hover:no-underline **:data-[slot=accordion-trigger-icon]:hidden">
              {faq.question}
              <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full border border-chip-line bg-chip-bg text-sea-ink transition group-aria-expanded/accordion-trigger:rotate-45">
                <span aria-hidden="true" className="text-lg leading-none">
                  +
                </span>
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-0 pt-3 pb-0 text-sm leading-relaxed text-sea-ink-soft">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </FAQSection>
  )
}
