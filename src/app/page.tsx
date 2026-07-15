'use client'

import { useReducer, useState, useEffect, useRef } from 'react'
import { transition, INITIAL_STATE } from '@/domain/machine'
import { COPY, CONTINUATION_WORDS } from '@/domain/content'
import { BRIAN_PROFILE } from '@/domain/profile'
import type { UIState, MachineEvent, ReadingEvent } from '@/domain/types'
import MobileViewport from '@/components/MobileViewport'
import StoryPage from '@/components/StoryPage'
import MeaningActivity from '@/components/MeaningActivity'
import SimulatedSpeechInput from '@/components/SimulatedSpeechInput'
import YelloTranscript, { TranscriptEntry } from '@/components/YelloTranscript'

function reducer(state: UIState, event: MachineEvent): UIState {
  return transition(state, event)
}

export default function Page() {
  const [uiState, dispatch] = useReducer(reducer, INITIAL_STATE)
  const [utterance, setUtterance] = useState('')
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const prevState = useRef<UIState>(INITIAL_STATE)

  function addEntry(entry: Omit<TranscriptEntry, 'id'>) {
    setTranscript((prev) => [...prev, { ...entry, id: crypto.randomUUID() }])
  }

  // Escalation timer: WORD_OFFER → COMPANION_OFFER after 3 s
  useEffect(() => {
    if (uiState !== 'WORD_OFFER') return
    const id = setTimeout(() => dispatch('TIMER_EXPIRED'), 3000)
    return () => clearTimeout(id)
  }, [uiState])

  // MEANING_ACTIVITY auto-advance sequence:
  //   0 ms  — definition added on state entry (above)
  //   1000 ms — returnPrompt added to transcript
  //   2500 ms — auto-dispatch CONTINUE → RETURN_REREAD
  useEffect(() => {
    if (uiState !== 'MEANING_ACTIVITY') return
    const t1 = setTimeout(() => addEntry({ speaker: 'yello', text: COPY.returnPrompt }), 1500)
    const t2 = setTimeout(() => dispatch('CONTINUE'), 3800)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [uiState])

  // Drive Yello transcript on state entry
  useEffect(() => {
    if (prevState.current === uiState) return
    prevState.current = uiState

    if (uiState === 'COMPANION_OFFER') {
      addEntry({ speaker: 'yello', text: COPY.offer })
    }
    if (uiState === 'MEANING_ACTIVITY') {
      addEntry({ speaker: 'yello', text: COPY.definition })
    }
  }, [uiState])

  // Local fallback classifier — Stage 4 replaces this with /api/classify.
  // Thresholds are calibrated from BRIAN_PROFILE, not hardcoded.
  function classify(text: string): ReadingEvent {
    const lower = text.toLowerCase().trim()

    // In offer states, any continuation word dismisses the offer
    if (uiState === 'WORD_OFFER' || uiState === 'COMPANION_OFFER') {
      const resumed = (CONTINUATION_WORDS as readonly string[]).some((w) => lower.includes(w))
      if (resumed) return 'READING_RESUMED'
    }

    // Resumed reading: target word followed by sentence continuation
    if (lower.includes('burrow')) {
      const afterWord = lower.slice(lower.indexOf('burrow') + 6)
      const continues = (CONTINUATION_WORDS as readonly string[]).some((w) => afterWord.includes(w))
      if (continues) return 'READING_RESUMED'
    }

    // Decoding struggle: hyphenated attempt without completing the word,
    // or a common substitution (e.g. "borrow" for "burrow").
    // Uses profile.decodingThreshold — Brian blends, so 1 hyphen is enough.
    const dashCount = (text.match(/-/g) ?? []).length
    const hasDashes = dashCount >= BRIAN_PROFILE.decodingThreshold
    const unknownSubs = BRIAN_PROFILE.unknownVocabulary
      .filter((w) => w !== 'burrow')
      .some((w) => lower.includes(w.replace('-', '')))
    const hasSubstitution = lower.includes('borrow') || unknownSubs

    if ((hasDashes && !lower.includes('burrow')) || hasSubstitution) {
      return 'DECODING_INCOMPLETE'
    }

    if (!lower.includes('burrow')) return 'NO_RELEVANT_SIGNAL'

    // Meaning stall: long pause at or after the target word.
    // Uses profile.pauseThreshold — Brian's is 2 (lower than the default 3).
    const maxDots = Math.max(0, ...(text.match(/\.+/g) ?? []).map((r) => r.length))
    if (maxDots >= BRIAN_PROFILE.pauseThreshold || lower.includes('burrow?')) {
      return 'MEANING_STALL'
    }

    return 'NO_RELEVANT_SIGNAL'
  }

  async function handleSubmit(text: string) {
    if (!text.trim() || isSubmitting) return
    setIsSubmitting(true)
    setUtterance('')
    addEntry({ speaker: 'child', text })
    dispatch(classify(text))
    setIsSubmitting(false)
  }

  function handleReset() {
    setUtterance('')
    setTranscript([])
    prevState.current = INITIAL_STATE
    dispatch('RESET')
  }

  function renderScreen() {
    switch (uiState) {
      case 'READING':
        return <StoryPage />

      case 'WORD_OFFER':
        return (
          <StoryPage
            yelloVariant="lookingUp"
            wordHighlighted
            showFloatingWord
            onTapWord={() => dispatch('TAP_WORD')}
          />
        )

      case 'COMPANION_OFFER':
        return (
          <StoryPage
            yelloVariant="handOut"
            wordHighlighted
            showFloatingWord
            onTapWord={() => dispatch('TAP_WORD')}
            showMagnifyingGlass
            onTapGlass={() => dispatch('TAP_GLASS')}
          />
        )

      case 'MEANING_ACTIVITY':
        return <MeaningActivity onContinue={() => dispatch('CONTINUE')} />

      case 'RETURN_REREAD':
        return <StoryPage returnHighlight />
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center px-8 py-8" style={{ background: '#fcf6f7' }}>
      <div className="w-full max-w-5xl flex flex-col gap-6">

        <header>
          <p className="mt-0.5 font-mono text-[16px] font-semibold" style={{ color: '#00a4a4' }}>FEATURE PROTOTYPE</p>
          <h1 className="mt-1 text-[26px] font-semibold text-gray-700 tracking-tight">
            Vocabulary Rescue
          </h1>
        </header>

        <div className="flex gap-8 items-stretch">

          <div className="shrink-0">
            <MobileViewport>
              {renderScreen()}
            </MobileViewport>
          </div>

          <div className="flex flex-col gap-4 flex-1 min-w-0">
            <YelloTranscript entries={transcript} />

            <SimulatedSpeechInput
              value={utterance}
              onChange={setUtterance}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              disabled={uiState === 'MEANING_ACTIVITY'}
            />

            <div className="flex flex-wrap items-center gap-3">
              {uiState === 'MEANING_ACTIVITY' && (
                <button
                  onClick={() => dispatch('CONTINUE')}
                  className="text-[11px] font-medium px-3 py-1.5 rounded-lg transition-colors text-white"
                  style={{ background: '#00a4a4' }}
                >
                  Continue → Return &amp; Reread
                </button>
              )}
              <button
                onClick={handleReset}
                className="text-[11px] text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors"
              >
                Reset prototype
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
