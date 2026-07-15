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

// Schema for the burrow-attempt classifier: judges whether the child's
// reading of "burrow" is valid and generates an optional Yello response.
export const BurrowAttemptOutputSchema = z.object({
  isValid:       z.boolean(),
  confidence:    ConfidenceSchema,
  reasonCode:    z.string().min(1).max(80),
  yelloResponse: z.string().max(200).nullable(),
})

export type BurrowAttemptOutput = z.infer<typeof BurrowAttemptOutputSchema>
