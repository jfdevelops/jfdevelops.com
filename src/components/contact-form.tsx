import { useConvexAction } from '@convex-dev/react-query'
import { useForm } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { api } from '../../convex/_generated/api'
import { FormInput } from './form/form-input'
import { FormLabel } from './form/form-label'
import { FormSelectTrigger } from './form/form-select-trigger'
import { FormTextarea } from './form/form-textarea'
import { PillButton } from './pill-button'
import { FeatureCard } from './ui/island-shell'
import { Select, SelectContent, SelectItem, SelectValue } from './ui/select'

const projectTypes = [
  'Custom web application',
  'Internal business tool',
  'Admin dashboard',
  'Customer portal',
  'API / integration',
  'Maintenance & support',
  'Something else',
]

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const submitMessage = useMutation({
    mutationFn: useConvexAction(api.actions.contact.submit),
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
        <h3 className="font-display mb-2 text-xl font-bold text-sea-ink">
          Thanks &mdash; message received
        </h3>
        <p className="mb-4 text-sm leading-relaxed text-sea-ink-soft">
          I&apos;ll get back to you shortly. You can also email me directly using the option nearby.
        </p>
        <PillButton
          variant="secondary"
          onClick={() => {
            form.reset()
            setSubmitted(false)
          }}
        >
          Send another message
        </PillButton>
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
            <div>
              <FormLabel htmlFor="contact-name">Name</FormLabel>
              <FormInput
                id="contact-name"
                type="text"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                placeholder="Your name"
                required
              />
            </div>
          )}
        </form.Field>

        <form.Field name="email">
          {(field) => (
            <div>
              <FormLabel htmlFor="contact-email">Email</FormLabel>
              <FormInput
                id="contact-email"
                type="email"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                placeholder="you@company.com"
                required
              />
            </div>
          )}
        </form.Field>
      </div>

      <form.Field name="projectType">
        {(field) => (
          <div>
            <FormLabel htmlFor="contact-project-type">Project type</FormLabel>
            <Select
              value={field.state.value}
              items={projectTypes.map((projectType) => ({
                value: projectType,
                label: projectType,
              }))}
              onValueChange={(value) => {
                if (value) {
                  field.handleChange(value)
                }
              }}
            >
              <FormSelectTrigger id="contact-project-type" onBlur={field.handleBlur}>
                <SelectValue />
              </FormSelectTrigger>
              <SelectContent alignItemWithTrigger={false}>
                {projectTypes.map((projectType) => (
                  <SelectItem key={projectType} value={projectType}>
                    {projectType}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </form.Field>

      <form.Field name="message">
        {(field) => (
          <div>
            <FormLabel htmlFor="contact-message">Message</FormLabel>
            <FormTextarea
              id="contact-message"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.value)}
              placeholder="Tell me about your project, timeline, and goals"
              required
            />
          </div>
        )}
      </form.Field>

      {error ? (
        <p className="text-sm font-medium text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
        {([canSubmit, isSubmitting]) => (
          <PillButton type="submit" disabled={!canSubmit}>
            {isSubmitting ? 'Sending...' : 'Send message'}
          </PillButton>
        )}
      </form.Subscribe>
    </form>
  )
}
