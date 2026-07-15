import { describe, expect, it } from 'vitest'

import { localAttemptFallback } from '../classify-attempt'

describe('localAttemptFallback', () => {
  it('handles empty input', () => {
    expect(localAttemptFallback('   ')).toEqual({
      isValid: false,
      confidence: 'HIGH',
      reasonCode: 'empty_input',
      yelloResponse: "Burrow. Let's keep reading.",
    })
  })

  it('accepts the full word', () => {
    expect(localAttemptFallback('I read burrow')).toEqual({
      isValid: true,
      confidence: 'HIGH',
      reasonCode: 'full_word_decoded',
      yelloResponse: null,
    })
  })

  it.each(['burro', 'burow', 'burry', 'burroe', 'burrroe'])(
    'accepts close spoken attempt %s',
    (attempt) => {
      expect(localAttemptFallback(attempt)).toEqual({
        isValid: true,
        confidence: 'MEDIUM',
        reasonCode: 'close_word_attempt',
        yelloResponse: null,
      })
    },
  )

  it('rejects borrow as a phonetic substitution', () => {
    expect(localAttemptFallback('borrow')).toEqual({
      isValid: false,
      confidence: 'HIGH',
      reasonCode: 'phonetic_substitution',
      yelloResponse: "Burrow. Now let's keep reading.",
    })
  })

  it.each(['butt', 'bully'])('rejects unrelated attempt %s', (attempt) => {
    expect(localAttemptFallback(attempt)).toEqual({
      isValid: false,
      confidence: 'MEDIUM',
      reasonCode: 'no_target_word',
      yelloResponse: "Burrow. Let's put it back in the sentence.",
    })
  })

  it('treats an incomplete hyphenated attempt as incomplete decoding', () => {
    expect(localAttemptFallback('b-u-r')).toEqual({
      isValid: false,
      confidence: 'MEDIUM',
      reasonCode: 'incomplete_decoding',
      yelloResponse: 'You found the first part. Burrow.',
    })
  })
})
