import { z } from 'zod'

export const docsSearchSchema = z.object({
  docsNotice: z.literal('missing-page').optional(),
})
