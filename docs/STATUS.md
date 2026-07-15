# Prototype Status

Last updated: 2026-07-15

---

## Stages

| Stage | Description | Status |
|---|---|---|
| 0 | Scaffold: create-next-app, install deps, file structure | ✅ Done |
| 1 | Figma inspection via MCP | ✅ Done |
| 2 | Domain layer: types.ts, machine.ts, content.ts | ✅ Done |
| 3 | Reviewer shell + 5 UI states wired to state machine | ✅ Done |
| 4 | Anthropic integration: prompt.ts, schema.ts, classifier.ts, route.ts | ✅ Done |
| 5 | Fallback + eval runner (23 cases) | 🔄 In progress |
| 6 | Burrow attempt classifier (unhappy path) | ✅ Done |
| 7 | Figma polish: spacing, typography, animations, teaching layer | ⬜ Not started |

---

## Stage 3 — UI states detail

| Screen | Component | Figma inspected | Implemented | Wired to machine |
|---|---|---|---|---|
| READING | StoryPage.tsx | ✅ | ✅ | ✅ |
| WORD_OFFER | StoryPage.tsx (props) | ✅ | ✅ | ✅ |
| COMPANION_OFFER | StoryPage.tsx (props) | ✅ | ✅ | ✅ |
| MEANING_ACTIVITY | MeaningActivity.tsx | ✅ | ✅ | ✅ |
| RETURN_REREAD | StoryPage.tsx (returnHighlight prop) | ✅ | ✅ | ✅ |

---

## What's working now

- Full reviewer shell: two-column layout, speech input, Yello transcript, reset
- Reviewer shell is light mode: `#fcf6f7` background, `#00a4a4` teal accent throughout
- State machine (`transition()`) handles all 5 states and all events
- READING → WORD_OFFER on MEANING_STALL (6+ dot sustained stall after "burrow")
- WORD_OFFER: Yello switches to LookingUp pose, "burrow" enlarged + transparent inline (floating pulse visible), word-pulse animation on floating word
- Escalation timer: 7 s in WORD_OFFER → COMPANION_OFFER
- COMPANION_OFFER: Yello in handOut pose (25% larger), magnifying glass pulsed with same animation as floating word; tapping word or glass → MEANING_ACTIVITY
- READING_RESUMED dismisses active offer (WORD_OFFER or COMPANION_OFFER → READING)
- MEANING_ACTIVITY: dark teal overlay, burrow illustration card; auto-advances with transcript sequence:
  - 0 ms: definition
  - 1.5 s: return prompt
  - 3.8 s: CONTINUE → RETURN_REREAD
- RETURN_REREAD: "His cozy burrow was nestled" highlighted, prefix dimmed; Yello listening
- Yello fades in (0.4s) on every screen and every variant change (`key={yelloSrc}`)
- Anthropic classifier: `POST /api/classify` → Zod-validated model output → fallback on timeout/error
- Deterministic fallback (`localFallback`) handles all classification paths:
  - Normalises hyphens to detect fully-spelled sounding-out (`b-u-r-r-o-w` = completed)
  - Sustained stall threshold: 6+ dots
  - Repetition with noticeable pause (3+ dots) → MEANING_STALL
  - Uncertain intonation (`burrow?`) → MEANING_STALL
  - Phonetic substitution (`borrow`) → DECODING_INCOMPLETE
- Eval suite: 23 cases, 23 passing (`npm run eval`)
- TypeScript clean (`npx tsc --noEmit`)
- Match Figma spacing, typography, Yello position across all screens
- Verify word pulse does not shift surrounding text
- Burrow attempt classifier (Stage 6):
  - `POST /api/classify-attempt` — new route, Zod-validated, fallback on error
  - `src/server/classify-attempt.ts` — Anthropic call + `localAttemptFallback()`
  - `src/server/prompt-attempt.ts` — Yello persona + valid/invalid decision rules
  - `BurrowAttemptOutputSchema` added to schema.ts (`isValid`, `confidence`, `reasonCode`, `yelloResponse | null`)
  - `handleSubmit` in page.tsx is now position-aware:
    - At "burrow" → attempt classifier first; invalid = Yello responds; valid = advance word count then 4-event classifier
    - Before/after "burrow" → word tracking only, no API call
    - WORD_OFFER / COMPANION_OFFER → 4-event classifier only (detect READING_RESUMED)
  - `burrowAttemptCount` state tracks how many invalid attempts; passed to model; reset on valid read or Reset

## What's next

**Stage 5 — remaining evals (deferred):**
- Schema validation: invalid model output cannot control the UI
- API failure: fallback is used when Anthropic call fails
- Secrets audit: API key absent from client code

**Stage 7 — Polish:**
- Test escalation timer cleanup (no ghost transitions)
- Test Reset Prototype button clears state, timers, input, transcript
- ReviewerDiagnostics.tsx (optional — event, confidence, source, latency)

---

## Known deviations from PLAN.md

- `WordOffer.tsx`, `CompanionOffer.tsx`, and `ReturnReread.tsx` were not created as separate files; all three states are handled via props on `StoryPage.tsx` (avoids duplicating chrome)
- `ReviewerDiagnostics.tsx` deferred to Stage 6 (nice-to-have, not blocking demo)
- MEANING_ACTIVITY Yello pose uses `yello-looking-up.svg` as a stand-in; will update when the correct asset (happy/waving pose) is provided
- Brian's `pauseThreshold` updated from 2 → 6 to match CLAUDE.md typing convention (6+ dots = sustained stall); eval cases confirmed this is the correct threshold