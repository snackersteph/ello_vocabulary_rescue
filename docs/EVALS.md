# Evals

The eval suite covers deterministic classification, API/model fallback boundaries, UI timer behavior, and a client-bundle security smoke check.

Run it with:

```bash
npm run eval
```

Current status:

- `npm run eval`: 23 deterministic fallback cases pass.
- `npm test`: 14 Vitest integration tests pass.
- `npm run smoke:client-bundle-security`: passes after `npm run build`.

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
| Attempt route fallback | `/api/classify-attempt` returns accurate source labels for fallback and model results. | Vitest route tests with mocked attempt classifier. |
| Attempt fallback | `localAttemptFallback()` handles empty input, full word, phonetic substitution, and incomplete hyphenated attempts. | Direct Vitest unit tests. |
| Offer escalation | Valid `burrow` attempt plus `MEANING_STALL` reaches `WORD_OFFER`, then escalates to `COMPANION_OFFER` after 7 s. | React Testing Library with mocked `fetch` and fake timers. |
| Resume dismissal | `READING_RESUMED` dismisses `WORD_OFFER` and does not ghost-transition later. | React Testing Library with mocked `fetch` and fake timers. |
| Timer cleanup | Tapping `burrow` enters `MEANING_ACTIVITY` and cancels the escalation timer. | React Testing Library with fake timers. |
| Return flow | `MEANING_ACTIVITY` adds the return prompt and advances to `RETURN_REREAD`. | React Testing Library with fake timers. |
| Reset cleanup | Reset from `MEANING_ACTIVITY` clears transcript/input and prevents ghost return. | React Testing Library with fake timers. |
| Client bundle security | Built client artifacts do not include Anthropic key-shaped values, `ANTHROPIC_API_KEY`, or Anthropic SDK strings. | `scripts/check-client-bundle.ts` after `next build`. |

## Remaining Gaps

- Direct timeout coverage for the Anthropic SDK wrapper itself is still not isolated; current route tests cover thrown/fallback behavior through mocked boundaries.
- Reviewer diagnostics are not implemented, so diagnostics-specific tests remain deferred.
