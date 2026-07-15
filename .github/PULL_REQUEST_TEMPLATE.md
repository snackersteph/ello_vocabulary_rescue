## What

<!-- One or two sentences describing what changed. -->

## Why

<!-- The PRD requirement, bug, or decision driving this change. -->

## How

<!-- Only include if the approach is non-obvious. -->

## Test plan

- [ ] <!-- Specific thing verified -->
- [ ] <!-- Specific thing verified -->

## Checklist

- [ ] No API key or secret in client code
- [ ] Model output schema-validated before use
- [ ] Fallback path exercised
- [ ] All 5 UI states reachable after this change
- [ ] No child-facing error states introduced
- [ ] Eval cases pass (`npm run eval`)
- [ ] TypeScript clean (`npx tsc --noEmit`)
