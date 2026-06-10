import { useForm } from '@tanstack/react-form'

export function ContactForm() {
  const form = useForm({
    defaultValues: {
      email: '',
      message: '',
    },
    onSubmit: async ({ value }) => {
      console.log('Contact form submitted', value)
    },
  })

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        form.handleSubmit()
      }}
    >
      <form.Field name="email">
        {(field) => (
          <label className="block text-sm font-semibold text-[var(--sea-ink)]">
            Email
            <input
              className="mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-2.5 text-[var(--sea-ink)]"
              type="email"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.value)}
              placeholder="you@company.com"
            />
          </label>
        )}
      </form.Field>

      <form.Field name="message">
        {(field) => (
          <label className="block text-sm font-semibold text-[var(--sea-ink)]">
            Message
            <textarea
              className="mt-2 min-h-28 w-full rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-2.5 text-[var(--sea-ink)]"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.value)}
              placeholder="Tell us about your project"
            />
          </label>
        )}
      </form.Field>

      <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
        {([canSubmit, isSubmitting]) => (
          <button
            type="submit"
            disabled={!canSubmit}
            className="rounded-full border border-[var(--lagoon-deep)] bg-[var(--lagoon-deep)] px-5 py-2.5 text-sm font-semibold text-[var(--foam)] transition hover:-translate-y-0.5 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Sending...' : 'Send message'}
          </button>
        )}
      </form.Subscribe>
    </form>
  )
}
