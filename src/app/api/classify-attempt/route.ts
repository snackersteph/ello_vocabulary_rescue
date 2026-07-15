import { NextRequest } from 'next/server'
import { classifyBurrowAttempt, localAttemptFallback } from '@/server/classify-attempt'
import { BurrowAttemptOutputSchema } from '@/server/schema'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const utterance    = typeof body?.utterance    === 'string' ? body.utterance    : ''
  const attemptCount = typeof body?.attemptCount === 'number' ? body.attemptCount : 0

  let result
  let source: 'model' | 'fallback' = 'model'

  try {
    result = await classifyBurrowAttempt(utterance, attemptCount)
  } catch {
    result = localAttemptFallback(utterance)
    source = 'fallback'
  }

  const validated = BurrowAttemptOutputSchema.safeParse(result)
  if (!validated.success) {
    result = localAttemptFallback(utterance)
    source = 'fallback'
  }

  return Response.json({ ...result, source })
}
