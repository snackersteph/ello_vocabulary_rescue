# Evals

The eval suite covers deterministic classification, API/model fallback boundaries, UI timer behavior, and a client-bundle security smoke check.

Run it with:

```bash
npm run eval
```

Current status:

- `npm run eval`: 23 deterministic fallback cases pass.
- `npm test`: 21 Vitest integration tests pass.
- `npm run smoke:client-bundle-security`: passes after `npm run build`.
- Dependency audit: `npm audit` reports 2 moderate vulnerabilities via `next` → `postcss <8.5.10`; `npm audit fix --force` is deferred because it would downgrade or break the Next 16 setup.

## Deterministic Fallback Coverage

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

## Integration Coverage

The integration tests use mocked model responses and fake timers rather than live Anthropic calls.

| Area | Behavior | Harness |
|---|---|---|
| API route fallback | `/api/classify` falls back with `source: 'fallback'` when the classifier throws or returns invalid shape, and preserves `source: 'model'` for valid model output. | Vitest route tests with mocked server classifier. |
| Classifier timeout | `classify()` aborts the Anthropic SDK request after the timeout window; `classifyBurrowAttempt()` returns fallback with accurate source when its SDK request times out. | Direct Vitest tests with mocked Anthropic SDK and fake timers. |
| Attempt route fallback | `/api/classify-attempt` returns accurate source labels for fallback and model results. | Vitest route tests with mocked attempt classifier. |
| Attempt fallback | `localAttemptFallback()` handles empty input, full word, phonetic substitution, and incomplete hyphenated attempts. | Direct Vitest unit tests. |
| Offer escalation | Valid `burrow` attempt plus `MEANING_STALL` reaches `WORD_OFFER`, then escalates to `COMPANION_OFFER` after 7 s. | React Testing Library with mocked `fetch` and fake timers. |
| Resume dismissal | `READING_RESUMED` dismisses `WORD_OFFER` and does not ghost-transition later. | React Testing Library with mocked `fetch` and fake timers. |
| Timer cleanup | Tapping `burrow` enters `MEANING_ACTIVITY` and cancels the escalation timer. | React Testing Library with fake timers. |
| Return flow | `MEANING_ACTIVITY` adds the return prompt and advances to `RETURN_REREAD`. | React Testing Library with fake timers. |
| Reset cleanup | Reset from `MEANING_ACTIVITY` clears transcript/input and prevents ghost return; reset also restores read progress, attempt count, and reviewer diagnostics, aborts active requests, and ignores stale responses. | React Testing Library with fake timers and controlled pending fetches. |
| Reviewer diagnostics | Latest classifier result displays kind, event/isValid, confidence, reasonCode, source, and latency without exposing model evidence. | React Testing Library with mocked `fetch`. |
| Client bundle security | Built client artifacts do not include Anthropic key-shaped values, `ANTHROPIC_API_KEY`, or Anthropic SDK strings. | `scripts/check-client-bundle.ts` after `next build`. |
