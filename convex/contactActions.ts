'use node';

import { v } from 'convex/values';
import { internal } from './_generated/api';
import { action } from './_generated/server';
import { sendEmail } from './lib/email/client';
import {
  contactEmail,
  createContactSubject,
} from './lib/email/templates/contact';

function requireEnvironmentValue(
  name: 'CONTACT_FROM_EMAIL' | 'CONTACT_TO_EMAIL',
) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is required to send contact emails.`);
  }

  return value;
}

function validateSubmission(args: {
  name: string;
  email: string;
  projectType: string;
  message: string;
}) {
  const submission = {
    name: args.name.trim(),
    email: args.email.trim(),
    projectType: args.projectType.trim(),
    message: args.message.trim(),
  };

  if (
    !submission.name ||
    !submission.email ||
    !submission.projectType ||
    !submission.message
  ) {
    throw new Error('Name, email, project type, and message are required.');
  }

  if (
    submission.name.length > 100 ||
    submission.email.length > 320 ||
    submission.projectType.length > 100 ||
    submission.message.length > 5_000
  ) {
    throw new Error('One or more contact fields are too long.');
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(submission.email)) {
    throw new Error('Please provide a valid email address.');
  }

  return submission;
}

export const submit = action({
  args: {
    name: v.string(),
    email: v.string(),
    projectType: v.string(),
    message: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args): Promise<null> => {
    const submission = validateSubmission(args);
    const from = requireEnvironmentValue('CONTACT_FROM_EMAIL');
    const to = requireEnvironmentValue('CONTACT_TO_EMAIL');
    const { text, html } = await contactEmail(submission);

    await sendEmail({
      to,
      from,
      replyTo: {
        email: submission.email,
        name: submission.name,
      },
      subject: createContactSubject({
        projectType: submission.projectType,
        name: submission.name,
      }),
      text,
      html,
    });

    await ctx.runMutation(internal.contact.store, submission);

    return null;
  },
});
