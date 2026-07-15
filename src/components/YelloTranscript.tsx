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
    <div className="flex flex-col gap-3 bg-gray-800/50 rounded-2xl p-5 border border-gray-700/60 min-h-[240px]">
      {/* Label */}
      <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 shrink-0">
        Yello
      </p>

      {/* Transcript entries */}
      <div className="flex-1 flex flex-col gap-2.5 overflow-y-auto max-h-72 pr-1">
        {entries.length === 0 ? (
          <p className="text-xs text-gray-600 italic mt-1">
            Yello's responses will appear here.
          </p>
        ) : (
          entries.map((entry) =>
            entry.speaker === 'yello' ? (
              <div key={entry.id} className="flex items-start gap-2">
                {/* Yello avatar dot */}
                <div className="mt-0.5 w-2 h-2 rounded-full bg-indigo-400 shrink-0" />
                <p className="text-sm text-gray-200 leading-relaxed">
                  <span className="font-medium text-indigo-400">Yello: </span>
                  &ldquo;{entry.text}&rdquo;
                </p>
              </div>
            ) : (
              <div key={entry.id} className="flex items-start gap-2 opacity-40">
                <div className="mt-0.5 w-2 h-2 rounded-full bg-gray-500 shrink-0" />
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
