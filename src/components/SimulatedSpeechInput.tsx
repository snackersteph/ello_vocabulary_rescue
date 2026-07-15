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
    <div className="flex flex-col gap-3 bg-white rounded-2xl p-5 border border-gray-200 flex-1">
      {/* Label */}
      <div>
        <p className="text-[14px] font-semibold uppercase tracking-widest text-gray-500">
          Simulate Brian's speech
        </p>
        <p className="text-sm text-gray-400 mt-0.5">
          Type what Brian says. Press Enter to submit.
        </p>
      </div>

      {/* Typing convention reference */}
      <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">
          Typing convention
        </p>
        <div className="space-y-1">
          {CONVENTION_ROWS.map(({ pattern, meaning }) => (
            <div key={pattern} className="flex items-baseline gap-2">
              <span className="font-mono text-[12px] shrink-0 w-32" style={{ color: '#00a4a4' }}>
                {pattern}
              </span>
              <span className="text-[12px] text-gray-400">{meaning}</span>
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
        className="w-full flex-1 min-h-0 bg-gray-50 text-gray-800 placeholder-gray-300 rounded-xl px-3.5 py-3 text-sm font-mono resize-none outline-none border border-gray-200 disabled:opacity-40 transition-opacity"
        style={{ '--tw-ring-color': '#00a4a4' } as React.CSSProperties}
        onFocus={(e) => (e.target.style.borderColor = '#00a4a4')}
        onBlur={(e) => (e.target.style.borderColor = '')}
        aria-label="Simulated child speech input"
      />

      <div className="flex items-center justify-between">
        <p className="text-[10px] text-gray-300">Shift+Enter for a new line</p>
        <button
          onClick={handleSubmit}
          disabled={!value.trim() || isSubmitting || disabled}
          className="text-white text-sm font-medium px-5 py-2 rounded-xl transition-colors disabled:opacity-30"
          style={{ background: '#00a4a4' }}
        >
          {isSubmitting ? 'Interpreting…' : 'Submit'}
        </button>
      </div>
    </div>
  )
}
