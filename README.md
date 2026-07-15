# Ello Vocabulary Rescue

Ello Vocabulary Rescue is a Next.js prototype for a single AI-assisted reading moment. It follows Brian as he reads a short story, gets stuck on the word `burrow`, receives gentle support from Yello, learns the word's meaning, and then returns to reread the sentence in context.

The prototype is designed as a reviewer-facing demo of the interaction model, not a production reading app. It shows how the tutor can distinguish between a meaning stall, an incomplete decoding attempt, a close-enough spoken approximation, and a resumed reading flow.

## What it does

- Presents a story-reading screen where Brian types or speaks the next words in the sentence.
- Detects when Brian stalls on `burrow` and offers help without interrupting successful reading.
- Accepts close spoken attempts like `burry`, `burroe`, and `burrroe` as good-enough progress.
- Escalates from a subtle word offer to a companion offer if Brian does not continue.
- Shows a short meaning activity explaining that a burrow is an underground animal home.
- Returns Brian to the original sentence and highlights the phrase to reread.
- Includes reviewer diagnostics for classifier event, source, confidence, reason code, and latency.

## Run

```bash
npm run dev
```

Open http://localhost:3000.

## Verify

```bash
npm test
npm run eval
npx tsc --noEmit
npm run build
npm run smoke:client-bundle-security
```

## Notes

- Current status: see `docs/STATUS.md`.
- Eval coverage: see `docs/EVALS.md`.
- Original implementation plan: see `docs/PLAN.md`.
- Anthropic calls run only from server routes; client-side UI is driven by validated events and deterministic state transitions.
