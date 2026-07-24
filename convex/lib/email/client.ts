import { BrevoClient } from '@getbrevo/brevo'

type SendEmailArgs = {
  to: string
  from: string
  subject: string
  text: string
  html?: string
  replyTo?: {
    email: string
    name?: string
  }
}

function createBrevoClient() {
  const apiKey = process.env.BREVO_API_KEY?.trim()

  if (!apiKey) {
    throw new Error('BREVO_API_KEY is required to send email.')
  }

  return new BrevoClient({ apiKey })
}

export async function sendEmail(args: SendEmailArgs) {
  const client = createBrevoClient()
  const result = await client.transactionalEmails.sendTransacEmail({
    sender: { email: args.from },
    to: [{ email: args.to }],
    replyTo: args.replyTo,
    subject: args.subject,
    textContent: args.text,
    htmlContent: args.html,
  })

  return result
}
