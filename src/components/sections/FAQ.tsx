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
    <section id="faq" className="scroll-mt-24">
      <div className="mb-6">
        <p className="island-kicker mb-2">FAQ</p>
        <h2 className="display-title text-3xl font-bold text-[var(--sea-ink)] sm:text-4xl">
          Common questions
        </h2>
      </div>
      <div className="space-y-3">
        {faqs.map((faq) => (
          <details
            key={faq.question}
            className="island-shell group rounded-2xl p-5 [&_summary::-webkit-details-marker]:hidden"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-[var(--sea-ink)]">
              {faq.question}
              <span className="inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] text-[var(--sea-ink)] transition group-open:rotate-45">
                <span aria-hidden="true" className="text-lg leading-none">
                  +
                </span>
              </span>
            </summary>
            <p className="mb-0 mt-3 text-sm leading-relaxed text-[var(--sea-ink-soft)]">
              {faq.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  )
}
