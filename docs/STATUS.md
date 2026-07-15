# Prototype Status

Last updated: 2026-07-14

---

## Stages

| Stage | Description | Status |
|---|---|---|
| 0 | Scaffold: create-next-app, install deps, file structure | ✅ Done |
| 1 | Figma inspection via MCP | ✅ Done |
| 2 | Domain layer: types.ts, machine.ts, content.ts | ✅ Done |
| 3 | Reviewer shell + 5 UI states wired to state machine | ✅ Done |
| 4 | Anthropic integration: prompt.ts, schema.ts, classifier.ts, route.ts | ⬜ Not started |
| 5 | Fallback + eval runner (9 cases) | ⬜ Not started |
| 6 | Figma polish: spacing, typography, animations, teaching layer | ⬜ Not started |

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
- READING → WORD_OFFER on MEANING_STALL (2+ dot pause after "burrow", calibrated to Brian's profile)
- WORD_OFFER: Yello switches to LookingUp pose, "burrow" enlarged to 28 px, floating word with two-pulse CSS animation
- Escalation timer: 3 s in WORD_OFFER → COMPANION_OFFER
- COMPANION_OFFER: Yello in handOut pose (25% larger), magnifying glass aligned to hand; tapping word or glass → MEANING_ACTIVITY
- READING_RESUMED dismisses active offer (WORD_OFFER or COMPANION_OFFER → READING)
- MEANING_ACTIVITY: dark teal overlay, burrow illustration card, "burrow" label, Yello; auto-advances:
  - 0 ms: definition in transcript
  - 1.5 s: return prompt in transcript
  - 3.8 s: auto-dispatch CONTINUE → RETURN_REREAD
  - Skip button available for reviewer to advance early
- RETURN_REREAD: story page with "His cozy burrow was nestled" highlighted, prefix dimmed; Yello listening
- ReadingProfile for Brian (age 6, grade 1, blending decoder, pauseThreshold=2, decodingThreshold=1) in `src/domain/profile.ts`
- `profileToPromptBlock()` ready for Stage 4 Anthropic prompt injection
- Reset works from any state, clears all timers
- Yello transcript driven from state transitions
- Local fallback classifier used until Stage 4 replaces it with /api/classify
- TypeScript clean (tsc --noEmit passes)

## What's next

**Stage 4 — Anthropic integration:**
- `src/server/prompt.ts` — versioned classifier prompt
- `src/server/schema.ts` — Zod schema for model output
- `src/server/classifier.ts` — SDK call with 5 s timeout + error handling
- `src/app/api/classify/route.ts` — wire classifier, return fallback on failure
- Replace local `classify()` in page.tsx with `POST /api/classify`

**Stage 5 — Fallback + evals:**
- `src/domain/fallback.ts` — deterministic local parser
- `src/evals/cases.ts` — 9 fixed input/expected pairs from CLAUDE.md
- `src/evals/runner.ts` — Node script, reports pass/fail
- Verify: invalid model output blocked, API failure uses fallback, secrets absent from client

**Stage 6 — Polish:**
- Match Figma spacing, typography, Yello position across all screens
- Verify word pulse does not shift surrounding text
- Test escalation timer cleanup (no ghost transitions)
- Test reset clears state, timers, input, transcript
- ReviewerDiagnostics.tsx (optional — event, confidence, source, latency)

---

## Known deviations from PLAN.md

- `WordOffer.tsx`, `CompanionOffer.tsx`, and `ReturnReread.tsx` were not created as separate files; all three states are handled via props on `StoryPage.tsx` (avoids duplicating chrome)
- `fallback.ts` stub exists in domain layer but the full deterministic parser is not yet implemented (Stage 5)
- `ReviewerDiagnostics.tsx` deferred to Stage 6 (nice-to-have, not blocking demo)
- MEANING_ACTIVITY Yello pose uses `yello-looking-up.svg` as a stand-in; will update when the correct asset (happy/waving pose) is provided
