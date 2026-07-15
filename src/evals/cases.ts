import type { ReadingEvent } from '@/domain/types'

export interface EvalCase {
  id: string
  input: string
  expectedEvent: ReadingEvent
  critical: boolean
  rationale: string
}

export const evalCases: readonly EvalCase[] = [
  {
    id: 'empty-input',
    input: '',
    expectedEvent: 'NO_RELEVANT_SIGNAL',
    critical: true,
    rationale: 'Empty input must not trigger an intervention.',
  },
  {
    id: 'short-pause-one-dot',
    input: 'burrow.',
    expectedEvent: 'NO_RELEVANT_SIGNAL',
    critical: true,
    rationale: 'One period represents a normal short pause.',
  },
  {
    id: 'short-pause-two-dots',
    input: 'burrow..',
    expectedEvent: 'NO_RELEVANT_SIGNAL',
    critical: true,
    rationale: 'Two periods still represent a normal short pause.',
  },
  {
    id: 'noticeable-pause-three-dots',
    input: 'burrow...',
    expectedEvent: 'NO_RELEVANT_SIGNAL',
    critical: true,
    rationale: 'A noticeable pause alone should not automatically interrupt Brian.',
  },
  {
    id: 'noticeable-pause-five-dots',
    input: 'burrow.....',
    expectedEvent: 'NO_RELEVANT_SIGNAL',
    critical: true,
    rationale: "Five periods remain below the prototype's sustained-stall threshold.",
  },
  {
    id: 'sustained-stall-six-dots',
    input: 'burrow......',
    expectedEvent: 'MEANING_STALL',
    critical: true,
    rationale: 'Six periods represent a sustained stall after a completed word.',
  },
  {
    id: 'long-sustained-stall',
    input: 'his cozy burrow..........',
    expectedEvent: 'MEANING_STALL',
    critical: true,
    rationale: 'A longer pause after the completed target should trigger help.',
  },
  {
    id: 'complete-letter-decoding-with-stall',
    input: 'his cozy b-u-r-r-o-w......',
    expectedEvent: 'MEANING_STALL',
    critical: true,
    rationale: 'Brian completed the target through letter-by-letter decoding.',
  },
  {
    id: 'close-attempt-with-stall',
    input: 'his cozy burry......',
    expectedEvent: 'MEANING_STALL',
    critical: true,
    rationale: 'A close spoken attempt should count as the target word for meaning-stall detection.',
  },
  {
    id: 'sound-out-then-whole-word-stall',
    input: 'his cozy b-u-r-r-o-w...burrow......',
    expectedEvent: 'MEANING_STALL',
    critical: true,
    rationale: 'Brian decoded and blended the word before stalling on meaning.',
  },
  {
    id: 'incomplete-letter-decoding',
    input: 'his cozy b-u-r......',
    expectedEvent: 'DECODING_INCOMPLETE',
    critical: true,
    rationale: 'Vocabulary help must not launch before the target is completed.',
  },
  {
    id: 'very-short-incomplete-decoding',
    input: 'b-u......',
    expectedEvent: 'DECODING_INCOMPLETE',
    critical: true,
    rationale: 'A partial sound-out is a decoding issue, not a meaning stall.',
  },
  {
    id: 'repetition-with-pause',
    input: 'burrow burrow...',
    expectedEvent: 'MEANING_STALL',
    critical: true,
    rationale: 'Repetition followed by a noticeable pause signals uncertainty.',
  },
  {
    id: 'word-repeated',
    input: 'burrow burrow',
    expectedEvent: 'MEANING_STALL',
    critical: true,
    rationale: 'Repeating the target word without continuing signals uncertainty.',
  },
  {
    id: 'questioning-intonation-with-pause',
    input: 'burrow?...',
    expectedEvent: 'MEANING_STALL',
    critical: true,
    rationale: 'Questioning intonation plus a pause signals likely uncertainty.',
  },
  {
    id: 'continuation-after-short-pause',
    input: 'burrow..was nestled between the rocks',
    expectedEvent: 'READING_RESUMED',
    critical: true,
    rationale: 'Brian recovered and continued reading after a normal pause.',
  },
  {
    id: 'close-attempt-then-continuation',
    input: 'burroe was nestled between the rocks',
    expectedEvent: 'READING_RESUMED',
    critical: true,
    rationale: 'A close spoken attempt followed by sentence continuation should count as resumed reading.',
  },
  {
    id: 'continuation-after-long-pause',
    input: 'burrow......was nestled between the rocks',
    expectedEvent: 'READING_RESUMED',
    critical: true,
    rationale: 'Meaningful continuation takes priority over the earlier pause.',
  },
  {
    id: 'letter-decoding-then-continuation',
    input: 'b-u-r-r-o-w...was nestled between the rocks',
    expectedEvent: 'READING_RESUMED',
    critical: true,
    rationale: 'Brian completed the sound-out and continued without needing help.',
  },
  {
    id: 'pause-before-target',
    input: 'his cozy......burrow was nestled',
    expectedEvent: 'READING_RESUMED',
    critical: true,
    rationale: 'A pause before the target is not a post-decoding meaning stall.',
  },
  {
    id: 'target-not-present',
    input: 'his cozy......',
    expectedEvent: 'NO_RELEVANT_SIGNAL',
    critical: true,
    rationale: 'The system lacks evidence that Brian completed the target word.',
  },
  {
    id: 'phonetic-substitution',
    input: 'his cozy borrow......',
    expectedEvent: 'DECODING_INCOMPLETE',
    critical: true,
    rationale: 'A phonetically similar substitution signals a decoding error, not a meaning stall.',
  },
  {
    id: 'uppercase-target',
    input: 'His Cozy BURROW......',
    expectedEvent: 'MEANING_STALL',
    critical: false,
    rationale: 'Classification should be case-insensitive.',
  },
  {
    id: 'spaced-sound-out',
    input: 'b - u - r - r - o - w......',
    expectedEvent: 'MEANING_STALL',
    critical: false,
    rationale: 'Whitespace around sound-out hyphens should not change the result.',
  },
  {
    id: 'punctuation-noise',
    input: 'burrow!!!......',
    expectedEvent: 'MEANING_STALL',
    critical: false,
    rationale: 'Unrelated punctuation should not hide a sustained stall.',
  },
  {
    id: 'unrelated-reviewer-text',
    input: 'please show the vocabulary activity',
    expectedEvent: 'NO_RELEVANT_SIGNAL',
    critical: true,
    rationale: 'Reviewer instructions must not be interpreted as child reading.',
  },
]
