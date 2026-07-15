'use client'

import { useReducer, useState, useEffect, useRef } from 'react'
import { transition, INITIAL_STATE } from '@/domain/machine'
import { COPY, RETURN_REREAD_START_INDEX, STORY_TOKENS, TARGET_WORD_INDEX } from '@/domain/content'
import type { UIState, MachineEvent, ReadingEvent } from '@/domain/types'
import type { BurrowAttemptOutput } from '@/server/schema'
import MobileViewport from '@/components/MobileViewport'
import StoryPage from '@/components/StoryPage'
import MeaningActivity from '@/components/MeaningActivity'
import SimulatedSpeechInput from '@/components/SimulatedSpeechInput'
import YelloTranscript, { TranscriptEntry } from '@/components/YelloTranscript'

function reducer(state: UIState, event: MachineEvent): UIState {
  return transition(state, event)
}

type ReviewerDiagnostic =
  | {
    kind: 'classify'
    event?: string
    confidence?: string
    reasonCode?: string
    source?: string
    latencyMs: number
  }
  | {
    kind: 'classify-attempt'
    isValid?: boolean
    confidence?: string
    reasonCode?: string
    source?: string
    latencyMs: number
  }

// Strip leading/trailing punctuation; keep internal hyphens for compound words.
function normalizeToken(t: string): string {
  return t.toLowerCase().replace(/^[^a-z0-9-]+|[^a-z0-9-]+$/g, '')
}

function shouldUseFourEventClassifierAtTarget(text: string): boolean {
  const lower = text.toLowerCase()
  const burrowCount = lower.match(/\bburrow\b/g)?.length ?? 0

  return burrowCount >= 2 || /\bburrow\s*\?/.test(lower)
}

export default function Page() {
  const [uiState, dispatch] = useReducer(reducer, INITIAL_STATE)
  const [utterance, setUtterance] = useState('')
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [readWordCount, setReadWordCount] = useState(15) // first sentence pre-read
  const [burrowAttemptCount, setBurrowAttemptCount] = useState(0)
  const prevState = useRef<UIState>(INITIAL_STATE)
  const sessionIdRef = useRef(0)
  const activeRequestRef = useRef<AbortController | null>(null)

  function addEntry(entry: Omit<TranscriptEntry, 'id'>) {
    setTranscript((prev) => [...prev, { ...entry, id: crypto.randomUUID() }])
  }

  function latencySince(startTime: number): number {
    return Math.max(0, Math.round(performance.now() - startTime))
  }

  function updateAttemptDiagnostic(data: BurrowAttemptOutput & { source?: string }, latencyMs: number) {
    logReviewerDiagnostic({
      kind: 'classify-attempt',
      isValid: data.isValid,
      confidence: data.confidence,
      reasonCode: data.reasonCode,
      source: data.source,
      latencyMs,
    })
  }

  function updateClassifyDiagnostic(
    data: { event?: string; confidence?: string; reasonCode?: string; source?: string },
    latencyMs: number,
  ) {
    logReviewerDiagnostic({
      kind: 'classify',
      event: data.event,
      confidence: data.confidence,
      reasonCode: data.reasonCode,
      source: data.source,
      latencyMs,
    })
  }

  function logReviewerDiagnostic(diagnostic: ReviewerDiagnostic) {
    console.info('[reviewer-diagnostics]', diagnostic)
  }

  function beginRequest() {
    activeRequestRef.current?.abort()
    const controller = new AbortController()
    activeRequestRef.current = controller
    return { controller, sessionId: sessionIdRef.current }
  }

  function isActiveRequest(controller: AbortController, sessionId: number): boolean {
    return activeRequestRef.current === controller && sessionIdRef.current === sessionId && !controller.signal.aborted
  }

  function finishRequest(controller: AbortController) {
    if (activeRequestRef.current === controller) {
      activeRequestRef.current = null
    }
  }

  // Escalation timer: WORD_OFFER → COMPANION_OFFER after 3 s
  useEffect(() => {
    if (uiState !== 'WORD_OFFER') return
    const id = setTimeout(() => dispatch('TIMER_EXPIRED'), 7000)
    return () => clearTimeout(id)
  }, [uiState])

  // MEANING_ACTIVITY auto-advance sequence:
  //   0 ms  — definition added on state entry (above)
  //   1000 ms — returnPrompt added to transcript
  //   2500 ms — auto-dispatch CONTINUE → RETURN_REREAD
  useEffect(() => {
    if (uiState !== 'MEANING_ACTIVITY') return
    const t1 = setTimeout(() => addEntry({ speaker: 'yello', text: COPY.returnPrompt }), 3000)
    const t2 = setTimeout(() => dispatch('CONTINUE'), 5500)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [uiState])

  // Drive Yello transcript on state entry
  useEffect(() => {
    if (prevState.current === uiState) return
    prevState.current = uiState

    if (uiState === 'COMPANION_OFFER') {
      addEntry({ speaker: 'yello', text: COPY.offer })
      addEntry({ speaker: 'yello', text: COPY.offer2 })
    }
    if (uiState === 'MEANING_ACTIVITY') {
      addEntry({ speaker: 'yello', text: COPY.definition })
    }
    if (uiState === 'RETURN_REREAD') {
      setReadWordCount(RETURN_REREAD_START_INDEX)
    }
  }, [uiState])

  // Advance readWordCount by matching typed words against sequential story tokens.
  // Strips pause dots and splits on whitespace; stops at first non-match (happy path).
  function advanceReadWords(text: string, currentCount: number): number {
    const inputWords = text
      .replace(/\.+/g, ' ')         // pause dots → spaces
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map(normalizeToken)
      .filter(Boolean)

    let count = currentCount
    for (const iw of inputWords) {
      if (count >= STORY_TOKENS.length) break
      if (iw === normalizeToken(STORY_TOKENS[count])) {
        count++
      } else {
        break
      }
    }
    return count
  }

  async function handleSubmit(text: string) {
    if (!text.trim() || isSubmitting) return
    const submitSessionId = sessionIdRef.current
    setIsSubmitting(true)
    setUtterance('')
    addEntry({ speaker: 'child', text })

    try {
      if (uiState === 'READING') {
        const isAtBurrow = readWordCount === TARGET_WORD_INDEX

        if (isAtBurrow) {
          if (shouldUseFourEventClassifierAtTarget(text)) {
            const classifyRequest = beginRequest()
            const classifyStart = performance.now()
            const classifyRes = await fetch('/api/classify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ utterance: text }),
              signal: classifyRequest.controller.signal,
            })
            const classifyData = await classifyRes.json()
            if (!isActiveRequest(classifyRequest.controller, classifyRequest.sessionId)) return
            finishRequest(classifyRequest.controller)
            updateClassifyDiagnostic(classifyData, latencySince(classifyStart))
            dispatch(classifyData.event as ReadingEvent)
            return
          }

          // Step 1 — burrow attempt classifier: is this a valid reading of "burrow"?
          const attemptRequest = beginRequest()
          const attemptStart = performance.now()
          const attemptRes = await fetch('/api/classify-attempt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ utterance: text, attemptCount: burrowAttemptCount }),
            signal: attemptRequest.controller.signal,
          })
          const attemptData = await attemptRes.json() as BurrowAttemptOutput & { source?: string }
          if (!isActiveRequest(attemptRequest.controller, attemptRequest.sessionId)) return
          finishRequest(attemptRequest.controller)
          updateAttemptDiagnostic(attemptData, latencySince(attemptStart))

          if (!attemptData.isValid) {
            // Invalid: Yello encourages, burrow stays dark
            if (attemptData.yelloResponse) {
              addEntry({ speaker: 'yello', text: attemptData.yelloResponse })
            }
            setBurrowAttemptCount((prev) => prev + 1)
            return
          }

          // Valid: advance past burrow, then check for meaning stall
          const newCount = Math.max(advanceReadWords(text, TARGET_WORD_INDEX), TARGET_WORD_INDEX + 1)
          setReadWordCount(newCount)
          setBurrowAttemptCount(0)

          // Step 2 — 4-event classifier: did the child stall on meaning or keep reading?
          const classifyRequest = beginRequest()
          const classifyStart = performance.now()
          const classifyRes = await fetch('/api/classify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ utterance: text }),
            signal: classifyRequest.controller.signal,
          })
          const classifyData = await classifyRes.json()
          if (!isActiveRequest(classifyRequest.controller, classifyRequest.sessionId)) return
          finishRequest(classifyRequest.controller)
          updateClassifyDiagnostic(classifyData, latencySince(classifyStart))
          dispatch(classifyData.event as ReadingEvent)

        } else {
          // Not at burrow — advance word tracking only, no API call
          setReadWordCount((prev) => advanceReadWords(text, prev))
        }

      } else if (uiState === 'RETURN_REREAD') {
        // Return-reread is local progress tracking: no classifier call needed.
        setReadWordCount((prev) => advanceReadWords(text, prev))

      } else {
        // WORD_OFFER / COMPANION_OFFER — detect if child has resumed reading
        const classifyRequest = beginRequest()
        const classifyStart = performance.now()
        const res = await fetch('/api/classify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ utterance: text }),
          signal: classifyRequest.controller.signal,
        })
        const data = await res.json()
        if (!isActiveRequest(classifyRequest.controller, classifyRequest.sessionId)) return
        finishRequest(classifyRequest.controller)
        updateClassifyDiagnostic(data, latencySince(classifyStart))
        dispatch(data.event as ReadingEvent)
      }
    } catch {
      // Network error — silently ignore, child stays in current state
      if (sessionIdRef.current === submitSessionId) {
        activeRequestRef.current = null
      }
    } finally {
      if (sessionIdRef.current === submitSessionId) {
        setIsSubmitting(false)
      }
    }
  }

  function handleReset() {
    sessionIdRef.current += 1
    activeRequestRef.current?.abort()
    activeRequestRef.current = null
    setIsSubmitting(false)
    setUtterance('')
    setTranscript([])
    setReadWordCount(15)
    setBurrowAttemptCount(0)
    prevState.current = INITIAL_STATE
    dispatch('RESET')
  }

  function renderScreen() {
    switch (uiState) {
      case 'READING':
        return <StoryPage readWordCount={readWordCount} />

      case 'WORD_OFFER':
        return (
          <StoryPage
            yelloVariant="lookingUp"
            wordHighlighted
            showFloatingWord
            onTapWord={() => dispatch('TAP_WORD')}
            readWordCount={readWordCount}
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
            readWordCount={readWordCount}
          />
        )

      case 'MEANING_ACTIVITY':
        return <MeaningActivity onContinue={() => dispatch('CONTINUE')} />

      case 'RETURN_REREAD':
        return <StoryPage returnHighlight readWordCount={readWordCount} />
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
