import { BRIAN_PROFILE } from './profile'
import { CONTINUATION_WORDS } from './content'
import type { ClassifierOutput } from '@/server/schema'

export function localFallback(utterance: string): ClassifierOutput {
  const text = utterance
  const lower = text.toLowerCase().trim()

  if (!lower) {
    return { event: 'NO_RELEVANT_SIGNAL', confidence: 'HIGH', reasonCode: 'empty_input', evidence: '(empty)' }
  }

  // Resumed reading: burrow followed by a continuation word
  if (lower.includes('burrow')) {
    const afterWord = lower.slice(lower.indexOf('burrow') + 6)
    const match = (CONTINUATION_WORDS as readonly string[]).find((w) => afterWord.includes(w))
    if (match) {
      return {
        event: 'READING_RESUMED',
        confidence: 'HIGH',
        reasonCode: 'continuation_after_target',
        evidence: text.slice(0, 60),
      }
    }
  }

  // Decoding struggle: hyphens without completing the word, or phonetic substitution
  const dashCount = (text.match(/-/g) ?? []).length
  const hasDashes = dashCount >= BRIAN_PROFILE.decodingThreshold
  const hasSubstitution =
    lower.includes('borrow') ||
    BRIAN_PROFILE.unknownVocabulary
      .filter((w) => w !== 'burrow')
      .some((w) => lower.includes(w.replace('-', '')))

  if (hasDashes && !lower.includes('burrow')) {
    return {
      event: 'DECODING_INCOMPLETE',
      confidence: 'HIGH',
      reasonCode: 'hyphenated_attempt_no_completion',
      evidence: text.slice(0, 60),
    }
  }

  if (hasSubstitution) {
    return {
      event: 'DECODING_INCOMPLETE',
      confidence: 'MEDIUM',
      reasonCode: 'phonetic_substitution',
      evidence: text.slice(0, 60),
    }
  }

  if (!lower.includes('burrow')) {
    return {
      event: 'NO_RELEVANT_SIGNAL',
      confidence: 'HIGH',
      reasonCode: 'target_word_absent',
      evidence: text.slice(0, 60),
    }
  }

  // Meaning stall: target word present but followed by a notable pause or uncertainty
  const maxDots = Math.max(0, ...(text.match(/\.+/g) ?? []).map((r) => r.length))
  if (maxDots >= BRIAN_PROFILE.pauseThreshold) {
    return {
      event: 'MEANING_STALL',
      confidence: 'HIGH',
      reasonCode: 'long_pause_after_target',
      evidence: text.slice(0, 60),
    }
  }

  if (lower.includes('burrow?')) {
    return {
      event: 'MEANING_STALL',
      confidence: 'MEDIUM',
      reasonCode: 'uncertain_intonation',
      evidence: text.slice(0, 60),
    }
  }

  return {
    event: 'NO_RELEVANT_SIGNAL',
    confidence: 'LOW',
    reasonCode: 'no_pause_no_continuation',
    evidence: text.slice(0, 60),
  }
}
