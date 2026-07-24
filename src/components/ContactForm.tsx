import { useConvexAction } from '@convex-dev/react-query'
import { useForm } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { api } from '../../convex/_generated/api'
import { FeatureCard } from './ui/island-shell'

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const submitMessage = useMutation({
    mutationFn: useConvexAction(api.contactActions.submit),
  })

  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      projectType: 'Custom web application',
      message: '',
    },
    onSubmit: async ({ value }) => {
      setError(null)
      try {
        await submitMessage.mutateAsync(value)
        setSubmitted(true)
      } catch {
        setError(
          'Something went wrong sending your message. Please try again or email me directly.',
        )
      }
    },
  })

  if (submitted) {
    return (
      <FeatureCard className="rounded-xl p-6 text-center">
        <h3 className="font-display mb-2 text-xl font-bold text-(--sea-ink)">
          Thanks &mdash; message received
        </h3>
        <p className="mb-4 text-sm leading-relaxed text-(--sea-ink-soft)">
          I&apos;ll get back to you shortly. Want to talk sooner? Book a call or email me directly
          using the options nearby.
        </p>
        <button
          type="button"
          onClick={() => {
            form.reset()
            setSubmitted(false)
          }}
          className="inline-flex min-h-11 items-center rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-5 py-2.5 text-sm font-semibold text-[var(--sea-ink)] transition hover:-translate-y-0.5 hover:bg-[var(--link-bg-hover)]"
        >
          Send another message
        </button>
      </FeatureCard>
    )
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        form.handleSubmit()
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <form.Field name="name">
          {(field) => (
            <label className="block text-sm font-semibold text-[var(--sea-ink)]">
              Name
              <input
                className="mt-2 min-h-11 w-full rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-2.5 text-base text-[var(--sea-ink)]"
                type="text"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                placeholder="Your name"
                required
              />
            </label>
          )}
        </form.Field>

        <form.Field name="email">
          {(field) => (
            <label className="block text-sm font-semibold text-[var(--sea-ink)]">
              Email
              <input
                className="mt-2 min-h-11 w-full rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-2.5 text-base text-[var(--sea-ink)]"
                type="email"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                placeholder="you@company.com"
                required
              />
            </label>
          )}
        </form.Field>
      </div>

      <form.Field name="projectType">
        {(field) => (
          <label className="block text-sm font-semibold text-[var(--sea-ink)]">
            Project type
            <select
              className="mt-2 min-h-11 w-full rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-2.5 text-base text-[var(--sea-ink)]"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.value)}
            >
              <option>Custom web application</option>
              <option>Internal business tool</option>
              <option>Admin dashboard</option>
              <option>Customer portal</option>
              <option>API / integration</option>
              <option>Maintenance & support</option>
              <option>Something else</option>
            </select>
          </label>
        )}
      </form.Field>

      <form.Field name="message">
        {(field) => (
          <label className="block text-sm font-semibold text-[var(--sea-ink)]">
            Message
            <textarea
              className="mt-2 min-h-28 w-full rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-2.5 text-base text-[var(--sea-ink)]"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.value)}
              placeholder="Tell me about your project, timeline, and goals"
              required
            />
          </label>
        )}
      </form.Field>

      {error ? (
        <p className="text-sm font-medium text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
        {([canSubmit, isSubmitting]) => (
          <button
            type="submit"
            disabled={!canSubmit}
            className="inline-flex min-h-11 items-center rounded-full border border-[var(--lagoon-deep)] bg-[var(--lagoon-deep)] px-5 py-2.5 text-sm font-semibold !text-[var(--foam)] transition hover:-translate-y-0.5 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Sending...' : 'Send message'}
          </button>
        )}
      </form.Subscribe>
    </form>
  )
}
