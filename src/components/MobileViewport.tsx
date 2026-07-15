import { ReactNode } from 'react'

interface Props {
  children?: ReactNode
}

export default function MobileViewport({ children }: Props) {
  return (
    <div
      className="relative bg-white rounded-[2.75rem] shadow-2xl shadow-black/60 overflow-hidden border border-gray-800"
      style={{ width: 390, minHeight: 760 }}
    >
      {/* Status bar */}
      <div className="flex items-center justify-between px-7 pt-3.5 pb-2 bg-white">
        <span className="text-[13px] font-semibold text-gray-800 tabular-nums">9:41</span>
        <div className="flex items-center gap-1.5">
          <svg width="17" height="12" viewBox="0 0 17 12" fill="none" aria-hidden="true">
            <rect x="0" y="3" width="3" height="9" rx="1" fill="#1c1c1e" />
            <rect x="4.5" y="2" width="3" height="10" rx="1" fill="#1c1c1e" />
            <rect x="9" y="0" width="3" height="12" rx="1" fill="#1c1c1e" />
            <rect x="13.5" y="0" width="3" height="12" rx="1" fill="#1c1c1e" opacity="0.3" />
          </svg>
          <svg width="16" height="12" viewBox="0 0 16 12" fill="none" aria-hidden="true">
            <rect x="0.5" y="0.5" width="13" height="11" rx="2.5" stroke="#1c1c1e" />
            <rect x="2" y="2" width="8" height="8" rx="1.5" fill="#1c1c1e" />
            <path d="M14.5 4v4a2 2 0 0 0 0-4z" fill="#1c1c1e" />
          </svg>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1">
        {children ?? (
          <div className="flex flex-col items-center justify-center h-[660px] gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
                <rect x="5" y="2" width="14" height="20" rx="2" />
                <line x1="9" y1="7" x2="15" y2="7" />
                <line x1="9" y1="11" x2="15" y2="11" />
                <line x1="9" y1="15" x2="12" y2="15" />
              </svg>
            </div>
            <p className="text-sm text-gray-400">Mobile experience</p>
            <p className="text-xs text-gray-500">Figma screens load here</p>
          </div>
        )}
      </div>
    </div>
  )
}
