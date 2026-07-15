import { BRIAN_PROFILE } from './profile'
import { CONTINUATION_WORDS } from './content'
import type { ClassifierOutput } from '@/server/schema'

// Strip hyphens (with optional surrounding spaces) to detect fully-spelled
// sounding-out attempts: "b-u-r-r-o-w" and "b - u - r - r - o - w" both → "burrow"
function normalize(text: string): string {
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

function firstCompletedTargetIndex(text: string): number {
  const targetIndex = text.indexOf('burrow')
  if (targetIndex >= 0) return targetIndex

  const closeMatch = wordsIn(text).find(isCloseBurrowAttempt)
  return closeMatch ? text.indexOf(closeMatch) : -1
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
  const completedTargetIndex = firstCompletedTargetIndex(targetDirect ? lower : normed)
  const targetCompleted = completedTargetIndex >= 0

  // Resumed reading: target completed and either a continuation word follows it,
  // or it's a clean completion with nothing else attached (no repeat, pause, or "?") —
  // a confident bare "burrow" needs no proof of continued reading to count as resumed.
  if (targetCompleted) {
    const searchIn = targetDirect ? lower : normed
    const completedWord = wordsIn(searchIn.slice(completedTargetIndex))[0] ?? 'burrow'
    const afterWord = searchIn.slice(completedTargetIndex + completedWord.length)
    const continuesWithNextWord = (CONTINUATION_WORDS as readonly string[]).some((w) => afterWord.includes(w))
    const isCleanCompletion = afterWord.trim() === ''
    if (continuesWithNextWord || isCleanCompletion) {
      return {
        event: 'READING_RESUMED',
        confidence: 'HIGH',
        reasonCode: continuesWithNextWord ? 'continuation_after_target' : 'clean_target_completion',
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
  if (wordsIn(lower.replace(/\?/g, ' ?')).some((word) => lower.includes(`${word}?`) && isCloseBurrowAttempt(word)) || lower.includes('burrow?')) {
    return {
      event: 'MEANING_STALL',
      confidence: 'MEDIUM',
      reasonCode: 'uncertain_intonation',
      evidence: text.slice(0, 60),
    }
  }

  // Repetition signals uncertainty even without an added pause marker.
  const burrowCount = wordsIn(normed).filter((word) => word === 'burrow' || isCloseBurrowAttempt(word)).length
  if (burrowCount >= 2) {
    return {
      event: 'MEANING_STALL',
      confidence: 'MEDIUM',
      reasonCode: maxDots >= 3 ? 'repetition_with_pause' : 'word_repeated',
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
