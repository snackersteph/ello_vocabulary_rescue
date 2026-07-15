# Evals

The current eval suite covers deterministic classification through `localFallback()` in `src/domain/fallback.ts`.

Run it with:

```bash
npm run eval
```

Current status: 23 cases pass.

## Covered Behavior

The suite verifies:

- Empty input returns `NO_RELEVANT_SIGNAL`.
- One or two dots are treated as short pauses.
- Three to five dots are noticeable pauses but do not interrupt by themselves.
- Six or more dots after a completed target word returns `MEANING_STALL`.
- Completed letter-by-letter decoding of `b-u-r-r-o-w` counts as the target word.
- Incomplete sound-outs such as `b-u-r......` return `DECODING_INCOMPLETE`.
- Phonetic substitution such as `borrow` returns `DECODING_INCOMPLETE`.
- Continuation words after `burrow` return `READING_RESUMED`.
- Continuation after a long pause takes priority over the pause.
- Case and punctuation noise do not hide the target signal.
- Reviewer instruction text is ignored as `NO_RELEVANT_SIGNAL`.

## Minimum Canonical Cases

| Input | Expected |
|---|---|
| `his cozy burrow......` | `MEANING_STALL` |
| `b-u-r-r-o-w...burrow......` | `MEANING_STALL` |
| `burrow...burrow?......` | `MEANING_STALL` |
| `burrow...was nestled between the rocks` | `READING_RESUMED` |
| `burrow..was nestled` | `READING_RESUMED` |
| `b-u-r......` | `DECODING_INCOMPLETE` |
| `his cozy borrow......` | `DECODING_INCOMPLETE` |
| `his cozy......` | `NO_RELEVANT_SIGNAL` |
| Empty input | `NO_RELEVANT_SIGNAL` |

## Remaining Nondeterministic / Integration Evals

The deterministic suite does not yet prove model-boundary behavior, browser timers, UI cleanup, or network failure. These should use mocked model responses and fake timers rather than live Anthropic calls.

| Priority | Behavior | Recommended harness | Useful seam |
|---|---|---|---|
| P0 | Invalid `/api/classify` model output cannot control the UI: no JSON, malformed JSON, unknown event, empty fields, oversized evidence. | Route-level Vitest tests with `vi.mock('@/server/classifier')`. | Optional route payload helper if `NextRequest` setup is noisy. |
| P0 | `/api/classify` falls back on thrown model error and timeout, returning deterministic output with `source: 'fallback'`. | Vitest route tests plus direct classifier tests with fake timers. | Injectable Anthropic client factory or resettable cached client for tests. |
| P0 | `/api/classify-attempt` falls back on no JSON, malformed JSON, schema failure, thrown request, and timeout. | Vitest route tests plus direct tests for `classifyBurrowAttempt()`. | Return `{ result, source }` or throw from the helper; it currently catches internally, so the route can report `source: 'model'` for helper-level fallback. |
| P0 | `READING_RESUMED` dismisses both `WORD_OFFER` and `COMPANION_OFFER`. | React Testing Library with mocked `fetch`. | Stable accessible labels or test IDs for screen states. |
| P1 | `WORD_OFFER` escalation timer is cancelled when the child taps, resumes reading, or resets. | React Testing Library with `vi.useFakeTimers()`. | State-visible DOM markers; avoid animation-only assertions. |
| P1 | `MEANING_ACTIVITY` transcript and continue timers are cancelled on reset or manual continue. | React Testing Library with fake timers. | State-visible DOM markers for teaching and return states. |
| P1 | Reset clears UI state, input, transcript, read progress, attempt count, submission state, and pending timers. | React Testing Library with fake timers and mocked `fetch`. | Observe read progress through rendered story styling or a reviewer-only marker. |
| P1 | Secrets and server-only modules stay out of client bundles. | Build-time smoke test scanning `.next/static` and client manifests. | Build with a sentinel `ANTHROPIC_API_KEY` value and search for it. |
| P2 | Reviewer-only diagnostics, if implemented, show event/source/latency outside the mobile viewport only. | React Testing Library component tests. | Keep diagnostics as a separate reviewer-shell component. |
