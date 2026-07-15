import { NextRequest } from 'next/server'
import { classify as classifyWithModel } from '@/server/classifier'
import { localFallback } from '@/domain/fallback'
import { ClassifierOutputSchema } from '@/server/schema'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const utterance = typeof body?.utterance === 'string' ? body.utterance : ''

  let result
  let source: 'model' | 'fallback' = 'model'

  try {
    result = await classifyWithModel(utterance)
  } catch {
    result = localFallback(utterance)
    source = 'fallback'
  }

  // Final guard: schema-validate before returning. If somehow invalid, use fallback.
  const validated = ClassifierOutputSchema.safeParse(result)
  if (!validated.success) {
    result = localFallback(utterance)
    source = 'fallback'
  }

  return Response.json({ ...result, source })
}
