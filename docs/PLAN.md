# Implementation Plan — Ello Vocabulary Rescue Prototype

## Smallest vertical slice

The minimum demonstrable loop:

1. Story page renders with `burrow` as a tappable span
2. Reviewer submits `his cozy burrow......`
3. Server calls classifier → returns `MEANING_STALL`
4. Word pulses (CSS animation, no layout shift)
5. Reviewer taps `burrow`
6. Teaching layer appears with fixed visual + Yello transcript line
7. Reviewer clicks continue
8. Story returns to `"His cozy burrow was nestled…"` with `burrow` briefly highlighted

---

## State machine

```
State           │ Event                │ Next state
────────────────┼──────────────────────┼──────────────────
READING         │ MEANING_STALL        │ WORD_OFFER
READING         │ DECODING_INCOMPLETE  │ READING (no-op)
READING         │ READING_RESUMED      │ READING (no-op)
READING         │ NO_RELEVANT_SIGNAL   │ READING (no-op)
WORD_OFFER      │ tap(burrow)          │ MEANING_ACTIVITY
WORD_OFFER      │ timer_expired        │ COMPANION_OFFER
WORD_OFFER      │ READING_RESUMED      │ READING
COMPANION_OFFER │ tap(burrow|glass)    │ MEANING_ACTIVITY
COMPANION_OFFER │ READING_RESUMED      │ READING
MEANING_ACTIVITY│ continue             │ RETURN_REREAD
RETURN_REREAD   │ reset                │ READING
```

Invalid events are silently ignored — no crash.

The escalation timer (`WORD_OFFER → COMPANION_OFFER`) is a 3s `setTimeout` inside a `useEffect`, cancelled on any state change.

---

## File structure

```
src/
  app/
    page.tsx                      # Reviewer shell layout
    api/classify/route.ts         # POST endpoint — Anthropic call, schema validation, fallback
  components/
    MobileViewport.tsx            # Frames the child-facing 390px column
    StoryPage.tsx                 # Story text; burrow rendered as tappable span
    WordOffer.tsx                 # Pulse animation wrapper around burrow
    CompanionOffer.tsx            # Yello character + magnifying glass tap target
    MeaningActivity.tsx           # Teaching overlay: visual + transcript line
    ReturnReread.tsx              # Restored story phrase + highlight
    YelloTranscript.tsx           # Reviewer-facing transcript (Yello's lines)
    SimulatedSpeechInput.tsx      # Labeled text input + submit button
    ReviewerDiagnostics.tsx       # Event, confidence, source, latency
  domain/
    types.ts                      # UIState, ReadingEvent, ClassifierOutput
    machine.ts                    # transition(state, event) → state (pure function)
    content.ts                    # Fixed copy — story, definition, prompts
    fallback.ts                   # Deterministic local interpreter
  server/
    classifier.ts                 # Anthropic SDK call, timeout, error handling
    schema.ts                     # Zod schema for model output
    prompt.ts                     # Versioned classifier prompt
  evals/
    cases.ts                      # 9 fixed input/expected-event pairs
    runner.ts                     # Node script: runs cases, reports pass/fail
```

---

## Dependencies

| Package | Why |
|---|---|
| `next` | Framework (App Router, API routes) |
| `react` / `react-dom` | UI |
| `typescript` | Required by CLAUDE.md |
| `@anthropic-ai/sdk` | Anthropic API |
| `zod` | Schema validation of model output |

No UI component library, no animation library, no state manager beyond `useState` + `useReducer`.

---

## API boundary

**`POST /api/classify`**

Request:
```ts
{ utterance: string }
```

Response:
```ts
{
  event: "MEANING_STALL" | "DECODING_INCOMPLETE" | "READING_RESUMED" | "NO_RELEVANT_SIGNAL",
  confidence: "low" | "medium" | "high",
  reasonCode: string,
  evidence: string,
  source: "model" | "fallback"
}
```

- Timeout: 5s
- On timeout / bad output / network error → local fallback runs server-side, same response shape
- Client never knows which path ran (except via reviewer diagnostics)
- `ANTHROPIC_API_KEY` and `ANTHROPIC_MODEL` are env vars, never in client bundle

---

## Cut list

- Audio / TTS
- Speaking invitation / repeat-after-me phase
- Pronunciation classification
- True origin-point collapse animation (use CSS fade/scale instead; document the simplification)
- Third escalation state
- Database, auth, sessions
- Rewards, badges, confetti
- Multi-story or multi-word support

---

## Build stages

| Stage | Task | Budget |
|---|---|---|
| 0 | `npx create-next-app`, install deps, scaffold file structure | 10 min |
| 1 | Figma inspection via MCP (typography, colors, Yello asset, burrow visual, mobile frame) | 20 min |
| 2 | Domain layer: `types.ts`, `machine.ts`, `content.ts`; pure unit tests | 15 min |
| 3 | Reviewer shell + 5 UI states wired to mocked events; escalation timer; reset | 35 min |
| 4 | `prompt.ts`, `schema.ts`, `classifier.ts`, `route.ts`; fallback | 15 min |
| 5 | Eval runner; verify all 9 cases pass | 10 min |
| 6 | Figma polish: spacing, typography, Yello position, word pulse, teaching layer | 15 min |
| **Total** | | **~2h** |

---

## Risks

1. **Burrow visual.** If not present as a Figma asset, sourcing an appropriate image burns unbudgeted time. Fallback: placeholder image, documented as missing asset.
2. **Word pulse without layout shift.** Use `transform: scale()` + `display: inline-block` on the target span. Verify it does not reflow surrounding text. Address early in Stage 3.
3. **Teaching layer collapse animation.** A true origin-point animation requires `getBoundingClientRect` and is a time sink. Use a CSS fade/scale from center; document the simplification in the Stage 6 summary.
4. **Escalation timer cleanup.** The `setTimeout` for `WORD_OFFER → COMPANION_OFFER` must be cancelled on every state change. A missed `clearTimeout` causes a ghost transition after the child has accepted help. Test this path explicitly.
