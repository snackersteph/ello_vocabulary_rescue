# Architecture

Vocabulary Rescue is a bounded prototype with one story, one target word, and one vocabulary intervention. The core contract is:

```text
Typed reading input -> server-side classifier -> validated event -> deterministic state machine -> UI
```

The model can classify typed speech, but it does not choose screens, trigger animations, set timers, generate teaching copy, or navigate the child-facing experience.

## Runtime Shape

- `src/app/page.tsx` owns the reviewer shell, current UI state, typed utterance, transcript, reading progress, and burrow attempt count.
- `src/components/MobileViewport.tsx` frames the child-facing 393 px mobile screen inside the reviewer shell.
- `src/components/StoryPage.tsx` renders the reading screen, word offer, companion offer, and return-reread view through props.
- `src/components/MeaningActivity.tsx` renders the teaching overlay with the burrow illustration and Yello pose.
- `src/components/SimulatedSpeechInput.tsx` and `src/components/YelloTranscript.tsx` are reviewer-only controls outside the mobile viewport.

## Domain Layer

- `src/domain/types.ts` defines the five UI states, classifier events, UI events, and classifier result shape.
- `src/domain/machine.ts` exposes the pure `transition(state, event)` function.
- `src/domain/content.ts` centralizes fixed story text, target-word metadata, Yello copy, and continuation words.
- `src/domain/profile.ts` hardcodes Brian's prototype reading profile.
- `src/domain/fallback.ts` provides deterministic local classification for failure and eval paths.

## Server Boundary

`POST /api/classify` accepts:

```ts
{ utterance: string }
```

It returns a schema-validated event:

```ts
{
  event: 'MEANING_STALL' | 'DECODING_INCOMPLETE' | 'READING_RESUMED' | 'NO_RELEVANT_SIGNAL'
  confidence: 'HIGH' | 'MEDIUM' | 'LOW'
  reasonCode: string
  evidence: string
  source: 'model' | 'fallback'
}
```

`POST /api/classify-attempt` accepts:

```ts
{ utterance: string, attemptCount: number }
```

It returns whether Brian's current attempt at `burrow` is valid, plus an optional Yello response for invalid attempts.

Both routes run Anthropic only on the server, validate model output with Zod, and fall back to deterministic local logic on model errors, invalid output, timeout, or request failure.

## Client Flow

1. The reviewer types simulated speech and submits it.
2. While Brian is before `burrow`, the app only advances local word progress.
3. At `burrow`, the app first calls `/api/classify-attempt`.
4. If the attempt is invalid, Yello responds in the transcript and the UI stays in `READING`.
5. If the attempt is valid, the app advances past `burrow` and calls `/api/classify`.
6. A validated classifier event is dispatched into the deterministic state machine.
7. During active offers, `/api/classify` is used to detect `READING_RESUMED` and dismiss the offer.

## Fixed Constraints

- Child-facing copy is fixed in source and is never generated at runtime.
- API keys live in environment variables and are not exposed to client code.
- Silence, unclear input, invalid input, incomplete decoding, and API failure must not create child-facing errors.
- The prototype has no database, auth, analytics, audio, TTS, scoring, rewards, or multi-story support.
