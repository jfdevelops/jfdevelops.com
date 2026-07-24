import { v } from 'convex/values'
import { internalMutation } from './_generated/server'

export const store = internalMutation({
  args: {
    name: v.string(),
    email: v.string(),
    projectType: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert('contactMessages', {
      name: args.name,
      email: args.email,
      projectType: args.projectType,
      message: args.message,
    })

    return { id }
  },
})
