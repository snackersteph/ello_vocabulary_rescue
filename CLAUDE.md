# Ello Vocabulary Rescue

## Mission

Build a reliable **two-hour TypeScript prototype** with:

- One story
- One target word: `burrow`
- One vocabulary intervention
- One typed input that simulates child speech
- One transcript area for Yello’s responses

Do not expand scope without explicit approval.

The child should feel that they got unstuck and continued reading, not that they completed a separate vocabulary lesson.

## Conventional commits

All commit messages must follow the Conventional Commits specification.

Format:

```
<type>(<scope>): <short summary>

[optional body]

[optional footer]
```

### Types

| Type | Use for |
|---|---|
| `feat` | A new feature or user-visible behavior |
| `fix` | A bug fix |
| `refactor` | Code change that is neither a fix nor a feature |
| `test` | Adding or correcting tests or evals |
| `chore` | Scaffolding, deps, config, tooling |
| `docs` | Documentation only |
| `style` | Formatting, whitespace — no logic change |

### Scope

Use the file or domain area affected. Keep it short.

Examples: `machine`, `classifier`, `fallback`, `ui`, `evals`, `prompt`, `deps`

### Rules

- Summary line: imperative mood, lowercase, no period, max 72 characters
- Do not use `feat` for copy changes to fixed strings — use `chore` or `fix`
- Breaking changes: add `!` after the type/scope and a `BREAKING CHANGE:` footer
- Reference issues or PRD sections in the footer when relevant

### Examples

```
feat(machine): add COMPANION_OFFER state and timer transition
fix(fallback): treat punctuation-only input as NO_RELEVANT_SIGNAL
test(evals): add capitalization and punctuation noise cases
chore(deps): install @anthropic-ai/sdk and zod
docs(plan): add two-hour implementation plan
refactor(classifier): extract prompt into versioned prompt.ts
```

---

## Pull request template

When opening a pull request, use this template:

```markdown
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
```

---

## Non-negotiable rules

- Use TypeScript and the repository’s existing conventions.
- State transitions must be deterministic.
- The model may classify input but must never directly control the UI.
- Run Anthropic requests only from server-side code.
- Never expose API keys or secrets client-side.
- Schema-validate every model response before use.
- Provide a deterministic local fallback for API failure or invalid output.
- Silence, unclear input, invalid input, and incomplete decoding must never show a child-facing failure state.
- Avoid adding dependencies without clear justification.
- Run tests after each implementation stage.
- Do not add a database, authentication, persistence, analytics, or a multi-agent runtime.
- Do not add rewards, pronunciation scoring, repeat-after-me behavior, open-ended chat, or dynamic teaching content.

## Figma

The approved Figma file is the visual source of truth.

Use the Figma MCP to inspect and reuse frames, components, assets, typography, spacing, colors, shadows, and layout constraints. Implement the design rather than redesigning it.

When a required state is missing, make the smallest consistent extension and document it.

## Architecture

`Typed reading input → server-side classifier → validated event → deterministic state machine → UI`

The application owns all state, transitions, timers, animations, copy, and navigation.

The model must never:

- Select screens
- Trigger animations
- Set timers
- Navigate
- Generate child-facing copy
- Change teaching content

## Allowed model output

The classifier may return only:

- `MEANING_STALL`
- `DECODING_INCOMPLETE`
- `READING_RESUMED`
- `NO_RELEVANT_SIGNAL`

Required fields:

- `event`
- `confidence`
- `reasonCode`
- `evidence`

Never display model reasoning or evidence inside the child-facing experience.

## UI states

Use exactly:

1. `READING`
2. `WORD_OFFER`
3. `COMPANION_OFFER`
4. `MEANING_ACTIVITY`
5. `RETURN_REREAD`

Required transitions:

- `READING + MEANING_STALL → WORD_OFFER`
- `WORD_OFFER + tap → MEANING_ACTIVITY`
- `WORD_OFFER + timer → COMPANION_OFFER`
- `WORD_OFFER + READING_RESUMED → READING`
- `COMPANION_OFFER + tap → MEANING_ACTIVITY`
- `COMPANION_OFFER + READING_RESUMED → READING`
- `MEANING_ACTIVITY + continue → RETURN_REREAD`

Tapping `burrow` and tapping Yello’s magnifying glass must behave identically.

## Typed speech convention

- Letters and words represent what the child said.
- Hyphens represent sound-by-sound decoding.
- One or two periods represent a brief hesitation.
- Three to five periods represent a noticeable pause.
- Six or more periods represent a sustained stall.
- A question mark represents uncertainty.
- Words after `burrow` indicate resumed reading.

Examples:

- `his cozy b-u-r-r-o-w...burrow......` → `MEANING_STALL`
- `his cozy burrow...was nestled between the rocks` → `READING_RESUMED`
- `his cozy b-u-r......` → `DECODING_INCOMPLETE`

Interpret only after submission, never on each keystroke.

## Fixed child-facing copy

Never generate or rewrite this copy at runtime.

- Offer: “Want to see what a burrow is? Tap my magnifying glass to take a look!”
- Definition: “A burrow is a hole or tunnel in the ground where an animal lives.”
- Whole-word model: “Burrow.”
- Return prompt: “Let’s read it again and find out where Slash lived.”
- Return phrase: “His cozy burrow was nestled…”

Show Yello’s verbal responses in the transcript area below the mobile screen. No audio or text-to-speech is required.

## Interaction requirements

- Pulse `burrow` twice in one restrained, non-looping animation.
- Do not shift surrounding text.
- Animate only one element at a time.
- Do not let Yello cover story text.
- Keep the story visible or spatially preserved during teaching.
- Return the teaching layer visually toward the target word.
- Dismiss an active offer when reading resumes.
- Do not ask the child to repeat the word.
- Do not show child-facing errors.

Outside the mobile viewport, provide:

- Labeled simulated speech input
- Submit action
- Yello transcript
- Reset control
- Optional reviewer-only diagnostics

Keep diagnostics separate from child-facing UI.

## Implementation stages

Work one stage at a time. Run tests after every stage.

1. **Inspect:** Review the repository and relevant Figma frames. Identify reusable components and assets. Present a concise plan before editing.
2. **Deterministic UX:** Build the reviewer shell, five UI states, and state machine using mocked events.
3. **Anthropic integration:** Add the server-side classifier, strict schema validation, timeout, and error handling.
4. **Fallback and evals:** Add the local fallback and fixed tests for all four events, API failure, and invalid output.
5. **Polish:** Match Figma, verify layout and animations, test reset, test the intended viewport, and remove unused code.

After each stage, summarize what changed, what was tested, what remains, and any deviation from the PRD or Figma.

## Minimum evals

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

Also verify:

- Invalid model output cannot control the UI.
- API failure uses the fallback.
- Secrets are absent from client code.
- Resumed reading dismisses an offer.
- Reset clears state, timers, input, transcript, and diagnostics.

## Definition of done

The prototype is complete when the approved Figma experience is implemented; meaning stalls, incomplete decoding, and resumed reading behave correctly; Yello’s transcript appears below the mobile screen; the child returns to `His cozy burrow was nestled…`; all model output is validated; the fallback works; and the intervention can be demonstrated reliably in 15–30 seconds excluding reviewer typing time.