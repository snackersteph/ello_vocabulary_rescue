import Anthropic from '@anthropic-ai/sdk'
import { buildSystemPrompt } from './prompt'
import { ClassifierOutputSchema } from './schema'
import type { ClassifierOutput } from './schema'
import { BRIAN_PROFILE } from '@/domain/profile'

const MODEL = process.env.ANTHROPIC_MODEL ?? 'claude-haiku-4-5-20251001'
const TIMEOUT_MS = 5000

let _client: Anthropic | null = null
function client(): Anthropic {
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  return _client
}

export async function classify(utterance: string): Promise<ClassifierOutput> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const message = await client().messages.create(
      {
        model: MODEL,
        max_tokens: 256,
        system: buildSystemPrompt(BRIAN_PROFILE),
        messages: [{ role: 'user', content: utterance }],
      },
      { signal: controller.signal },
    )

    const raw = message.content.find((b) => b.type === 'text')?.text ?? ''
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('no JSON in response')

    const parsed = JSON.parse(jsonMatch[0])
    return ClassifierOutputSchema.parse(parsed)
  } finally {
    clearTimeout(timer)
  }
}
