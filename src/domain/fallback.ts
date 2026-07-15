import { BRIAN_PROFILE } from './profile'
import { CONTINUATION_WORDS } from './content'
import type { ClassifierOutput } from '@/server/schema'

// Strip hyphens (with optional surrounding spaces) to detect fully-spelled
// sounding-out attempts: "b-u-r-r-o-w" and "b - u - r - r - o - w" both → "burrow"
function normalize(text: string): string {
  return text.replace(/\s*-\s*/g, '')
}

export function localFallback(utterance: string): ClassifierOutput {
  const text = utterance
  const lower = text.toLowerCase().trim()

  if (!lower) {
    return { event: 'NO_RELEVANT_SIGNAL', confidence: 'HIGH', reasonCode: 'empty_input', evidence: '(empty)' }
  }

  const normed = normalize(lower)
  // Target is completed if said directly OR fully spelled out letter-by-letter
  const targetDirect = lower.includes('burrow')
  const targetCompleted = targetDirect || normed.includes('burrow')

  // Resumed reading: target completed and a continuation word follows it
  if (targetCompleted) {
    const searchIn = targetDirect ? lower : normed
    const afterWord = searchIn.slice(searchIn.indexOf('burrow') + 6)
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

  // Decoding struggle: hyphens present but the target was NOT fully spelled out
  const dashCount = (text.match(/-/g) ?? []).length
  const hasDashes = dashCount >= BRIAN_PROFILE.decodingThreshold
  if (hasDashes && !targetCompleted) {
    return {
      event: 'DECODING_INCOMPLETE',
      confidence: 'HIGH',
      reasonCode: 'hyphenated_attempt_no_completion',
      evidence: text.slice(0, 60),
    }
  }

  // Phonetic substitution (e.g. "borrow" for "burrow")
  const hasSubstitution = lower.includes('borrow')
  if (hasSubstitution && !targetCompleted) {
    return {
      event: 'DECODING_INCOMPLETE',
      confidence: 'MEDIUM',
      reasonCode: 'phonetic_substitution',
      evidence: text.slice(0, 60),
    }
  }

  if (!targetCompleted) {
    return {
      event: 'NO_RELEVANT_SIGNAL',
      confidence: 'HIGH',
      reasonCode: 'target_word_absent',
      evidence: text.slice(0, 60),
    }
  }

  // Target completed — check for meaning stall signals
  const maxDots = Math.max(0, ...(text.match(/\.+/g) ?? []).map((r) => r.length))

  // Sustained stall: 6+ consecutive dots (BRIAN_PROFILE.pauseThreshold)
  if (maxDots >= BRIAN_PROFILE.pauseThreshold) {
    return {
      event: 'MEANING_STALL',
      confidence: 'HIGH',
      reasonCode: 'sustained_stall_after_target',
      evidence: text.slice(0, 60),
    }
  }

  // Uncertain intonation
  if (lower.includes('burrow?')) {
    return {
      event: 'MEANING_STALL',
      confidence: 'MEDIUM',
      reasonCode: 'uncertain_intonation',
      evidence: text.slice(0, 60),
    }
  }

  // Repetition with noticeable pause (word said 2+ times + 3+ dots)
  const burrowCount = (lower.match(/burrow/g) ?? []).length
  if (burrowCount >= 2 && maxDots >= 3) {
    return {
      event: 'MEANING_STALL',
      confidence: 'MEDIUM',
      reasonCode: 'repetition_with_pause',
      evidence: text.slice(0, 60),
    }
  }

  return {
    event: 'NO_RELEVANT_SIGNAL',
    confidence: 'LOW',
    reasonCode: 'no_stall_signal',
    evidence: text.slice(0, 60),
  }
}
