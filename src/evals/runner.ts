import { evalCases } from './cases'
import { localFallback } from '@/domain/fallback'

const RESET  = '\x1b[0m'
const GREEN  = '\x1b[32m'
const RED    = '\x1b[31m'
const YELLOW = '\x1b[33m'
const BOLD   = '\x1b[1m'
const DIM    = '\x1b[2m'

let passed = 0
let failed = 0
const failures: string[] = []

for (const c of evalCases) {
  const result = localFallback(c.input)
  const ok = result.event === c.expectedEvent

  if (ok) {
    passed++
    console.log(`${GREEN}✓${RESET} ${DIM}[${c.id}]${RESET}`)
  } else {
    failed++
    const tag = c.critical ? `${RED}FAIL${RESET}` : `${YELLOW}FAIL${RESET}`
    console.log(`${tag} [${c.id}]`)
    failures.push(
      [
        `  ${BOLD}[${c.id}]${RESET}`,
        `  input:    ${JSON.stringify(c.input)}`,
        `  expected: ${c.expectedEvent}`,
        `  got:      ${result.event}  (${result.reasonCode})`,
        `  rationale: ${c.rationale}`,
      ].join('\n'),
    )
  }
}

const total = passed + failed
console.log(`\n${BOLD}${total} cases — ${GREEN}${passed} passed${RESET}${BOLD}, ${failed > 0 ? RED : GREEN}${failed} failed${RESET}`)

if (failures.length > 0) {
  console.log('\nFailures:\n')
  console.log(failures.join('\n\n'))
  process.exit(1)
}
