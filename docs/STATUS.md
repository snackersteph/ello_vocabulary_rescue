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
| 5 | Fallback + deterministic/integration evals | ✅ Done |
| 6 | Burrow attempt classifier (unhappy path) | ✅ Done |
| 7 | Figma polish: spacing, typography, animations, teaching layer | ✅ Done |

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
  - 3 s: return prompt
  - 5.5 s: CONTINUE → RETURN_REREAD
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
- Integration test suite: 21 Vitest tests passing (`npm test`)
- Client bundle security smoke check passes (`npm run smoke:client-bundle-security` after `npm run build`)
- TypeScript clean (`npx tsc --noEmit`)
- Figma polish complete: spacing, typography, Yello positions, animations, teaching layer, and word-pulse layout have been reviewed
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
- Reviewer diagnostics:
  - Compact reviewer-only card outside the mobile viewport
  - Shows only the latest `/api/classify-attempt` or `/api/classify` result
  - Displays kind, event/isValid, confidence, reasonCode, source, and latencyMs; reset clears it
- Reset flow increments the local session, aborts any active request, clears timers through state cleanup, restores initial UI, and ignores stale responses

## What's next

- Demo hardening and any reviewer feedback polish

---

## Known deviations from PLAN.md

- `WORD_OFFER`, `COMPANION_OFFER`, and `RETURN_REREAD` are intentionally handled through props on `StoryPage.tsx`; the unused placeholder component files were removed to avoid duplicating the phone chrome
- `ReviewerDiagnostics.tsx` is implemented as a reviewer-only shell card rather than child-facing UI
- MEANING_ACTIVITY uses the approved `yello-presenting.svg` pose
- Brian's `pauseThreshold` updated from 2 → 6 to match CLAUDE.md typing convention (6+ dots = sustained stall); eval cases confirmed this is the correct threshold
