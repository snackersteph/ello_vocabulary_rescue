'use client'

import { useState } from 'react'
import MobileViewport from '@/components/MobileViewport'
import SimulatedSpeechInput from '@/components/SimulatedSpeechInput'
import YelloTranscript, { TranscriptEntry } from '@/components/YelloTranscript'

export default function Page() {
  const [utterance, setUtterance] = useState('')
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  function addEntry(entry: Omit<TranscriptEntry, 'id'>) {
    setTranscript((prev) => [...prev, { ...entry, id: crypto.randomUUID() }])
  }

  async function handleSubmit(text: string) {
    if (!text.trim() || isSubmitting) return

    setIsSubmitting(true)
    setUtterance('')

    addEntry({ speaker: 'child', text })

    // Placeholder: real classifier call wired in Stage 4
    await new Promise((r) => setTimeout(r, 600))
    addEntry({ speaker: 'yello', text: 'Want to see what burrow means?' })

    setIsSubmitting(false)
  }

  function handleReset() {
    setUtterance('')
    setTranscript([])
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center py-10 px-4 gap-8">

      {/* Header */}
      <header className="text-center">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-600">
          Prototype reviewer shell
        </p>
        <h1 className="mt-1 text-lg font-semibold text-gray-200 tracking-tight">
          Ello Vocabulary Rescue
        </h1>
      </header>

      {/* Mobile viewport */}
      <MobileViewport />

      {/* Reviewer controls */}
      <div className="w-full max-w-2xl grid grid-cols-2 gap-4">
        <SimulatedSpeechInput
          value={utterance}
          onChange={setUtterance}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
        <YelloTranscript entries={transcript} />
      </div>

      {/* Reset */}
      <button
        onClick={handleReset}
        className="text-[11px] text-gray-600 hover:text-gray-400 underline underline-offset-2 transition-colors"
      >
        Reset prototype
      </button>

    </div>
  )
}
