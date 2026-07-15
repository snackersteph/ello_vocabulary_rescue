import Anthropic from '@anthropic-ai/sdk'
import { BRIAN_PROFILE } from '@/domain/profile'
import { buildBurrowAttemptSystemPrompt, buildBurrowAttemptUserPrompt } from './prompt-attempt'
import { BurrowAttemptOutputSchema } from './schema'
import type { BurrowAttemptOutput } from './schema'

const MODEL = process.env.ANTHROPIC_MODEL ?? 'claude-haiku-4-5-20251001'
const TIMEOUT_MS = 5000
type ClassifierSource = 'model' | 'fallback'
export type BurrowAttemptClassification = BurrowAttemptOutput & { source: ClassifierSource }

let _client: Anthropic | null = null
function client(): Anthropic {
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  return _client
}

// Strip hyphens to detect full-word decoding (e.g. "b-u-r-r-o-w" → "burrow").
function stripHyphens(text: string): string {
  return text.replace(/\s*-\s*/g, '')
}

function wordsIn(text: string): string[] {
  return text.match(/[a-z]+/g) ?? []
}

function editDistance(a: string, b: string): number {
  const rows = a.length + 1
  const cols = b.length + 1
  const dp = Array.from({ length: rows }, () => Array<number>(cols).fill(0))

  for (let i = 0; i < rows; i++) dp[i][0] = i
  for (let j = 0; j < cols; j++) dp[0][j] = j

  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost,
      )
    }
  }

  return dp[a.length][b.length]
}

function isCloseBurrowAttempt(word: string): boolean {
  if (word === 'borrow') return false
  if (word.length < 5 || word.length > 7) return false
  if (!word.startsWith('bu') || !word.includes('r')) return false
  return editDistance(word, 'burrow') <= 2
}

export function localAttemptFallback(utterance: string): BurrowAttemptOutput {
  const lower = utterance.toLowerCase().trim()

  if (!lower) {
    return {
      isValid: false,
      confidence: 'HIGH',
      reasonCode: 'empty_input',
      yelloResponse: 'Burrow. Let\'s keep reading.',
    }
  }

  const stripped = stripHyphens(lower)

  // Full word present (direct or via completed letter-by-letter decoding)
  if (lower.includes('burrow') || stripped.includes('burrow')) {
    return { isValid: true, confidence: 'HIGH', reasonCode: 'full_word_decoded', yelloResponse: null }
  }

  // Accept close spoken attempts so Yello does not over-correct a usable reading.
  if (wordsIn(stripped).some(isCloseBurrowAttempt)) {
    return { isValid: true, confidence: 'MEDIUM', reasonCode: 'close_word_attempt', yelloResponse: null }
  }

  // Phonetic substitution — a different real word
  if (lower.includes('borrow')) {
    return {
      isValid: false,
      confidence: 'HIGH',
      reasonCode: 'phonetic_substitution',
      yelloResponse: 'Burrow. Now let\'s keep reading.',
    }
  }

  // Incomplete decoding (hyphens present but full word not reached)
  if (lower.includes('-')) {
    return {
      isValid: false,
      confidence: 'MEDIUM',
      reasonCode: 'incomplete_decoding',
      yelloResponse: 'You found the first part. Burrow.',
    }
  }

  return {
    isValid: false,
    confidence: 'MEDIUM',
    reasonCode: 'no_target_word',
    yelloResponse: 'Burrow. Let\'s put it back in the sentence.',
  }
}

export async function classifyBurrowAttempt(
  utterance: string,
  attemptCount: number,
): Promise<BurrowAttemptClassification> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const message = await client().messages.create(
      {
        model: MODEL,
        max_tokens: 256,
        system: buildBurrowAttemptSystemPrompt(BRIAN_PROFILE),
        messages: [{ role: 'user', content: buildBurrowAttemptUserPrompt(utterance, attemptCount) }],
      },
      { signal: controller.signal },
    )

    const raw = message.content.find((b) => b.type === 'text')?.text ?? ''
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return { ...localAttemptFallback(utterance), source: 'fallback' }

    const parsed = JSON.parse(jsonMatch[0])
    const result = BurrowAttemptOutputSchema.safeParse(parsed)
    if (!result.success) return { ...localAttemptFallback(utterance), source: 'fallback' }

    return { ...result.data, source: 'model' }
  } catch {
    return { ...localAttemptFallback(utterance), source: 'fallback' }
  } finally {
    clearTimeout(timer)
  }
}
