'use client'

import { useReducer, useState, useEffect, useRef } from 'react'
import { transition, INITIAL_STATE } from '@/domain/machine'
import { COPY, CONTINUATION_WORDS } from '@/domain/content'
import type { UIState, MachineEvent, ReadingEvent } from '@/domain/types'
import MobileViewport from '@/components/MobileViewport'
import StoryPage from '@/components/StoryPage'
import SimulatedSpeechInput from '@/components/SimulatedSpeechInput'
import YelloTranscript, { TranscriptEntry } from '@/components/YelloTranscript'

function reducer(state: UIState, event: MachineEvent): UIState {
  return transition(state, event)
}

export default function Page() {
  const [uiState, dispatch]    = useReducer(reducer, INITIAL_STATE)
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

  // Drive Yello transcript on state entry
  useEffect(() => {
    if (prevState.current === uiState) return
    prevState.current = uiState

    if (uiState === 'COMPANION_OFFER') {
      addEntry({ speaker: 'yello', text: COPY.offer })
    }
    if (uiState === 'MEANING_ACTIVITY') {
      addEntry({ speaker: 'yello', text: COPY.definition })
      addEntry({ speaker: 'yello', text: COPY.wordModel })
    }
    if (uiState === 'RETURN_REREAD') {
      addEntry({ speaker: 'yello', text: COPY.returnPrompt })
    }
  }, [uiState])

  // Local fallback classifier — Stage 4 replaces this with /api/classify
  function classify(text: string): ReadingEvent {
    const lower = text.toLowerCase().trim()

    // In offer states, any continuation word resumes reading
    if (uiState === 'WORD_OFFER' || uiState === 'COMPANION_OFFER') {
      const resumed = (CONTINUATION_WORDS as readonly string[]).some((w) => lower.includes(w))
      if (resumed) return 'READING_RESUMED'
    }

    if (!lower.includes('burrow')) return 'NO_RELEVANT_SIGNAL'

    const burrowIdx  = lower.indexOf('burrow')
    const afterWord  = lower.slice(burrowIdx + 6)
    const continues  = (CONTINUATION_WORDS as readonly string[]).some((w) => afterWord.includes(w))
    if (continues) return 'READING_RESUMED'

    const maxDots = Math.max(0, ...(text.match(/\.+/g) ?? []).map((r) => r.length))
    if (maxDots >= 3 || lower.includes('burrow?')) return 'MEANING_STALL'

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
        // MeaningActivity.tsx — next vertical slice
        return (
          <div className="bg-white h-full w-full flex items-center justify-center p-8">
            <p className="text-center text-gray-400 text-sm leading-relaxed">
              Meaning Activity<br />
              <span className="text-gray-300 text-xs">(coming next)</span>
            </p>
          </div>
        )

      case 'RETURN_REREAD':
        // ReturnReread.tsx — next vertical slice
        return (
          <div className="bg-white h-full w-full flex items-center justify-center p-8">
            <p className="text-center text-gray-400 text-sm leading-relaxed">
              Return &amp; Reread<br />
              <span className="text-gray-300 text-xs">(coming next)</span>
            </p>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center px-8 py-8">
      <div className="w-full max-w-5xl flex flex-col gap-6">

        <header>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-600">
            Prototype reviewer shell
          </p>
          <h1 className="mt-1 text-lg font-semibold text-gray-200 tracking-tight">
            Feature: Vocabulary Rescue
          </h1>
          <p className="mt-0.5 font-mono text-[11px] text-indigo-400">{uiState}</p>
        </header>

        <div className="flex gap-8 items-stretch">

          <div className="shrink-0">
            <MobileViewport>
              {renderScreen()}
            </MobileViewport>
          </div>

          <div className="flex flex-col gap-4 flex-1 min-w-0">
            <SimulatedSpeechInput
              value={utterance}
              onChange={setUtterance}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              disabled={uiState === 'MEANING_ACTIVITY'}
            />
            <YelloTranscript entries={transcript} />

            <div className="flex flex-wrap items-center gap-3">
              {uiState === 'MEANING_ACTIVITY' && (
                <button
                  onClick={() => dispatch('CONTINUE')}
                  className="text-[11px] bg-indigo-700/50 hover:bg-indigo-600/50 text-indigo-200 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Continue → Return &amp; Reread
                </button>
              )}
              <button
                onClick={handleReset}
                className="text-[11px] text-gray-600 hover:text-gray-400 underline underline-offset-2 transition-colors"
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
