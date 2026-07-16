import { z } from 'zod'
const eventSchema = z.object({
  title: z.string().min(1),
  eventType: z.enum(['upcoming', 'past']),
  description: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  date: z.string(),
  endDate: z.string().optional().nullable(),
  highlights: z.array(z.string()).optional().default([]),
  posterRatio: z.number().optional().nullable(),
  linkedMOU: z.string().optional().nullable(),
  isArchived: z.boolean().optional().default(false),
  addToHomepage: z.boolean().optional().default(false),
  registrationLink: z.string().optional().nullable(),
  posterUrl: z.string().optional().nullable(),
  galleryUrls: z.array(z.string()).optional().default([]),
  status: z.enum(['draft', 'pending_approval', 'published', 'archived']).optional().default('draft')
})
const parsed = eventSchema.partial().parse({ isArchived: true })
console.log(JSON.stringify(parsed, null, 2))
