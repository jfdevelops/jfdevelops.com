import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  contactMessages: defineTable({
    name: v.string(),
    email: v.string(),
    projectType: v.string(),
    message: v.string(),
  }),
})
