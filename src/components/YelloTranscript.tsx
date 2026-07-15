'use client'

import { useEffect, useRef } from 'react'

export interface TranscriptEntry {
  id: string
  speaker: 'yello' | 'child'
  text: string
}

interface Props {
  entries: TranscriptEntry[]
}

export default function YelloTranscript({ entries }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [entries])

  return (
    <div className="flex flex-col gap-3 bg-white rounded-2xl p-5 border border-gray-200 min-h-[240px]">
      {/* Label */}
      <p className="text-[14px] font-semibold uppercase tracking-widest text-gray-500 shrink-0">
        Yello
      </p>

      {/* Transcript entries */}
      <div className="flex-1 flex flex-col gap-2.5 overflow-y-auto max-h-72 pr-1">
        {entries.length === 0 ? (
          <p className="text-xs text-gray-300 italic mt-1">
            Yello's responses will appear here.
          </p>
        ) : (
          entries.map((entry) =>
            entry.speaker === 'yello' ? (
              <div key={entry.id} className="flex items-start gap-2">
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#00a4a4' }} />
                <p className="text-sm text-gray-700 leading-relaxed">
                  <span className="font-semibold" style={{ color: '#00a4a4' }}>Yello: </span>
                  &ldquo;{entry.text}&rdquo;
                </p>
              </div>
            ) : (
              <div key={entry.id} className="flex items-start gap-2 opacity-50">
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0" />
                <p className="text-xs text-gray-400 font-mono leading-relaxed">
                  Brian: {entry.text}
                </p>
              </div>
            )
          )
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
