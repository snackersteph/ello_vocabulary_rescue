'use client'

import { KeyboardEvent, useRef, useEffect } from 'react'

interface Props {
  value: string
  onChange: (value: string) => void
  onSubmit: (value: string) => void
  isSubmitting: boolean
  disabled?: boolean
}

const CONVENTION_ROWS = [
  { pattern: '. or ..', meaning: 'short pause' },
  { pattern: '... to .....', meaning: 'noticeable pause' },
  { pattern: '...... or more', meaning: 'sustained stall' },
  { pattern: 'b-u-r-r-o-w', meaning: 'sounding out letter by letter' },
  { pattern: 'burrow burrow', meaning: 'word repeated' },
  { pattern: 'burrow?', meaning: 'uncertain intonation' },
]

export default function SimulatedSpeechInput({
  value,
  onChange,
  onSubmit,
  isSubmitting,
  disabled,
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!isSubmitting) textareaRef.current?.focus()
  }, [isSubmitting])

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  function handleSubmit() {
    if (!value.trim() || isSubmitting || disabled) return
    onSubmit(value)
  }

  return (
    <div className="flex flex-col gap-3 bg-gray-800/50 rounded-2xl p-5 border border-gray-700/60 flex-1">
      {/* Label */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
          Simulate Brian's speech
        </p>
        <p className="text-xs text-gray-500 mt-0.5">
          Type what Brian says. Press Enter to submit.
        </p>
      </div>

      {/* Typing convention reference */}
      <div className="bg-gray-900/70 rounded-xl p-3.5 border border-gray-700/40">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-2">
          Typing convention
        </p>
        <div className="space-y-1">
          {CONVENTION_ROWS.map(({ pattern, meaning }) => (
            <div key={pattern} className="flex items-baseline gap-2">
              <span className="font-mono text-[11px] text-amber-400/80 shrink-0 w-32">
                {pattern}
              </span>
              <span className="text-[11px] text-gray-500">{meaning}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Input */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="his cozy b-u-r-r-o-w...burrow......"
        disabled={disabled || isSubmitting}
        className="w-full flex-1 min-h-0 bg-gray-900 text-gray-100 placeholder-gray-600 rounded-xl px-3.5 py-3 text-sm font-mono resize-none outline-none focus:ring-1 focus:ring-indigo-500/70 disabled:opacity-40 transition-opacity"
        aria-label="Simulated child speech input"
      />

      <div className="flex items-center justify-between">
        <p className="text-[10px] text-gray-600">Shift+Enter for a new line</p>
        <button
          onClick={handleSubmit}
          disabled={!value.trim() || isSubmitting || disabled}
          className="bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-medium px-5 py-2 rounded-xl transition-colors"
        >
          {isSubmitting ? 'Interpreting…' : 'Submit'}
        </button>
      </div>
    </div>
  )
}
