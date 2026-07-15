import { z } from 'zod'

export const ReadingEventSchema = z.enum([
  'MEANING_STALL',
  'DECODING_INCOMPLETE',
  'READING_RESUMED',
  'NO_RELEVANT_SIGNAL',
])

export const ConfidenceSchema = z.enum(['HIGH', 'MEDIUM', 'LOW'])

export const ClassifierOutputSchema = z.object({
  event:      ReadingEventSchema,
  confidence: ConfidenceSchema,
  reasonCode: z.string().min(1).max(80),
  evidence:   z.string().min(1).max(120),
})

export type ClassifierOutput = z.infer<typeof ClassifierOutputSchema>
