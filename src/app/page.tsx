'use client'

import { useState } from 'react'
import MobileViewport from '@/components/MobileViewport'
import StoryPage from '@/components/StoryPage'
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
    <div className="min-h-screen bg-gray-950 flex flex-col items-center px-8 py-8">
      <div className="w-full max-w-5xl flex flex-col gap-6">

        {/* Header */}
        <header>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-600">
            Prototype reviewer shell
          </p>
          <h1 className="mt-1 text-lg font-semibold text-gray-200 tracking-tight">
            Feature: Vocabulary Rescue
          </h1>
        </header>

        {/* Two-column body */}
        <div className="flex gap-8 items-stretch flex-1">

          {/* Left: mobile viewport */}
          <div className="shrink-0">
            <MobileViewport>
            <StoryPage />
          </MobileViewport>
          </div>

          {/* Right: reviewer controls */}
          <div className="flex flex-col gap-4 flex-1 min-w-0">
            <SimulatedSpeechInput
              value={utterance}
              onChange={setUtterance}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
            <YelloTranscript entries={transcript} />

            <button
              onClick={handleReset}
              className="self-start text-[11px] text-gray-600 hover:text-gray-400 underline underline-offset-2 transition-colors"
            >
              Reset prototype
            </button>
          </div>

        </div>

      </div>
    </div>
  )
}
