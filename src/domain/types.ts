// ── UI states ────────────────────────────────────────────────────────────────

export type UIState =
  | 'READING'
  | 'WORD_OFFER'
  | 'COMPANION_OFFER'
  | 'MEANING_ACTIVITY'
  | 'RETURN_REREAD'

// ── Events from the classifier ───────────────────────────────────────────────

export type ReadingEvent =
  | 'MEANING_STALL'
  | 'DECODING_INCOMPLETE'
  | 'READING_RESUMED'
  | 'NO_RELEVANT_SIGNAL'

// ── Events from user interaction ─────────────────────────────────────────────

export type UIEvent =
  | 'TAP_WORD'       // child taps the target word
  | 'TAP_GLASS'      // child taps Yello's magnifying glass
  | 'TIMER_EXPIRED'  // escalation timer fires in WORD_OFFER
  | 'CONTINUE'       // advance from MEANING_ACTIVITY
  | 'RESET'          // reviewer resets the prototype

export type MachineEvent = ReadingEvent | UIEvent

// ── Classifier output ────────────────────────────────────────────────────────

export type Confidence = 'low' | 'medium' | 'high'

export type ClassifierSource = 'model' | 'fallback'

export interface ClassifierOutput {
  event: ReadingEvent
  confidence: Confidence
  reasonCode: string
  evidence: string
  source: ClassifierSource
}
