# State Machine

The prototype uses exactly five UI states. Transitions are deterministic and implemented by `transition()` in `src/domain/machine.ts`.

## States

| State | Purpose |
|---|---|
| `READING` | Normal story page. The reviewer can advance simulated reading progress. |
| `WORD_OFFER` | The target word `burrow` pulses as the smallest offer of help. |
| `COMPANION_OFFER` | Yello makes the offer more explicit with the magnifying glass. |
| `MEANING_ACTIVITY` | A brief visual teaching overlay explains `burrow`. |
| `RETURN_REREAD` | The child returns to the smallest useful sentence fragment. |

## Events

Classifier events:

- `MEANING_STALL`
- `DECODING_INCOMPLETE`
- `READING_RESUMED`
- `NO_RELEVANT_SIGNAL`

UI events:

- `TAP_WORD`
- `TAP_GLASS`
- `TIMER_EXPIRED`
- `CONTINUE`
- `RESET`

## Transition Table

| Current state | Event | Next state |
|---|---|---|
| `READING` | `MEANING_STALL` | `WORD_OFFER` |
| `READING` | `DECODING_INCOMPLETE` | `READING` |
| `READING` | `READING_RESUMED` | `READING` |
| `READING` | `NO_RELEVANT_SIGNAL` | `READING` |
| `WORD_OFFER` | `TAP_WORD` | `MEANING_ACTIVITY` |
| `WORD_OFFER` | `TIMER_EXPIRED` | `COMPANION_OFFER` |
| `WORD_OFFER` | `READING_RESUMED` | `READING` |
| `COMPANION_OFFER` | `TAP_WORD` | `MEANING_ACTIVITY` |
| `COMPANION_OFFER` | `TAP_GLASS` | `MEANING_ACTIVITY` |
| `COMPANION_OFFER` | `READING_RESUMED` | `READING` |
| `MEANING_ACTIVITY` | `CONTINUE` | `RETURN_REREAD` |
| Any state | `RESET` | `READING` |

Invalid events are ignored and leave the current state unchanged, except for `RESET`, which is valid from every state.

## Timers

- `WORD_OFFER` starts a 7 s escalation timer.
- If the state changes before the timer fires, the timer is cleared.
- `MEANING_ACTIVITY` adds the return prompt after 3 s.
- `MEANING_ACTIVITY` automatically dispatches `CONTINUE` after 5.5 s.
- Both meaning-activity timers are cleared when the state changes.

## Product Rules

- `DECODING_INCOMPLETE` never launches vocabulary help.
- `NO_RELEVANT_SIGNAL` never changes the child-facing screen.
- `READING_RESUMED` dismisses `WORD_OFFER` and `COMPANION_OFFER`.
- Tapping `burrow` and tapping Yello's magnifying glass both accept help.
- The teaching screen returns to `His cozy burrow was nestled…`.
