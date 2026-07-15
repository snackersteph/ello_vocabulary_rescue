export type ReviewerDiagnostic = {
  kind: 'classify-attempt' | 'classify'
  event?: string
  isValid?: boolean
  confidence?: string
  reasonCode?: string
  source?: string
  latencyMs: number
}

type ReviewerDiagnosticsProps = {
  diagnostic: ReviewerDiagnostic | null
}

function formatValue(value: string | boolean | number | undefined): string {
  if (value === undefined || value === '') return '—'
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  return String(value)
}

export default function ReviewerDiagnostics({ diagnostic }: ReviewerDiagnosticsProps) {
  if (!diagnostic) return null

  const primaryLabel = diagnostic.kind === 'classify' ? 'event' : 'isValid'
  const primaryValue = diagnostic.kind === 'classify' ? diagnostic.event : diagnostic.isValid

  const rows = [
    ['kind', diagnostic.kind],
    [primaryLabel, primaryValue],
    ['confidence', diagnostic.confidence],
    ['reasonCode', diagnostic.reasonCode],
    ['source', diagnostic.source],
    ['latencyMs', diagnostic.latencyMs],
  ] as const

  return (
    <section
      aria-label="Reviewer diagnostics"
      className="rounded-lg border bg-white/70 px-4 py-3 text-[12px] shadow-sm"
      style={{ borderColor: 'rgba(0, 164, 164, 0.24)' }}
    >
      <div className="mb-2 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full" style={{ background: '#00a4a4' }} />
        <h2 className="text-[12px] font-semibold text-gray-700">Reviewer diagnostics</h2>
      </div>

      <dl className="grid grid-cols-[88px_minmax(0,1fr)] gap-x-3 gap-y-1.5">
        {rows.map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="font-mono text-[11px] text-gray-400">{label}</dt>
            <dd className="truncate font-mono text-[11px] text-gray-700" title={formatValue(value)}>
              {formatValue(value)}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
