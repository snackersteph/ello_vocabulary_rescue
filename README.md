# Ello Vocabulary Rescue

A Next.js prototype for a single Vocabulary Rescue flow: Brian reads a story, stalls on `burrow`, accepts Yello's help, sees a brief meaning activity, and returns to reread the sentence.

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
