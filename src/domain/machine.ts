import type { UIState, MachineEvent } from './types'

export const INITIAL_STATE: UIState = 'READING'

export function transition(state: UIState, event: MachineEvent): UIState {
  // RESET is a reviewer action — valid from any state
  if (event === 'RESET') return 'READING'

  switch (state) {
    case 'READING':
      if (event === 'MEANING_STALL') return 'WORD_OFFER'
      return 'READING'

    case 'WORD_OFFER':
      if (event === 'TAP_WORD')       return 'MEANING_ACTIVITY'
      if (event === 'TIMER_EXPIRED')  return 'COMPANION_OFFER'
      if (event === 'READING_RESUMED') return 'READING'
      return 'WORD_OFFER'

    case 'COMPANION_OFFER':
      if (event === 'TAP_WORD' || event === 'TAP_GLASS') return 'MEANING_ACTIVITY'
      if (event === 'READING_RESUMED') return 'READING'
      return 'COMPANION_OFFER'

    case 'MEANING_ACTIVITY':
      if (event === 'CONTINUE') return 'RETURN_REREAD'
      return 'MEANING_ACTIVITY'

    case 'RETURN_REREAD':
      return 'RETURN_REREAD'
  }
}
