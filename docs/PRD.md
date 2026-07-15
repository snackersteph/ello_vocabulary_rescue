# Product Requirements Document

## Ello Vocabulary Rescue

**Status:** Prototype MVP — Revised
**Owner:** Product
**Target age:** 4–8
**Primary prototype persona:** Brian, age 6
**Target experience:** Ello reading experience on a family device
**Prototype presentation format:** Mobile reading experience inside a reviewer-facing desktop shell
**AI provider:** Anthropic API
**Design source of truth:** Figma, accessed through the Figma MCP
**Target implementation time:** Approximately two hours
**Target vocabulary word:** **burrow**

---

# 1. Product summary

Vocabulary Rescue is a brief, page-anchored intervention that helps a child understand an unfamiliar word after successfully decoding it but failing to connect it to meaning.

Within this PRD:

* **Ello** refers to the underlying AI system.
* **Yello** refers to the reading companion character visible in the experience.

Ello interprets a simulated reading attempt, identifies a likely post-decoding meaning stall, and triggers a progressive offer of help.

The interaction follows this sequence:

> **Interpret → Offer → Accept → Teach → Return**

The experience begins with a subtle pulse on the unfamiliar word. If the child does not respond or resume reading, Yello provides a clearer visual offer. After the child accepts, Yello teaches the meaning using a concrete image and a short explanation. The child is then returned to the smallest meaningful part of the sentence needed to restore comprehension.

The story remains the primary experience. Vocabulary Rescue should feel like a child briefly got unstuck, not like they left the story to complete a vocabulary lesson.

For the prototype, the experience teaches one concrete noun:

> **burrow**

The prototype story is:

> “High above Earth on the red planet Mars, lived a small, friendly hedgehog named Slash. His cozy burrow was nestled between rust-colored rocks and sparkly Martian crystals. Slash spent time collecting shiny space pebbles and watching the two moons dance across the sky.”

---

# 2. Prototype presentation format

The prototype will be presented inside a reviewer-facing desktop layout containing three primary regions.

## 2.1 Mobile experience

The central mobile viewport displays the child-facing Ello reading experience.

It includes:

* The story page
* The highlighted target word
* Yello
* The teaching visual
* The return-to-reading interaction

The mobile viewport should reproduce the approved Figma designs as accurately as possible.

## 2.2 Simulated speech input

A text input appears below the mobile viewport.

The reviewer uses this input to simulate what Brian says while reading.

The text input represents speech rather than a chat message. Letters, words, punctuation, repetition, and periods communicate the pattern of the child’s reading.

For example:

> `his cozy b-u-r-r-o-w...burrow......`

This represents Brian sounding out the word, successfully saying it, and then pausing.

The text input must be clearly labeled as a prototype simulation control. It is not part of the child-facing production experience.

## 2.3 Yello transcript area

A transcript area appears below the mobile viewport near the simulated speech input.

All verbal responses from Yello are displayed in this area.

For example:

> **Yello:** “A burrow is a hole or tunnel in the ground where an animal lives.”

The transcript area replaces runtime audio for the prototype.

No text-to-speech system is required.

The transcript should make the intended verbal interaction clear to reviewers without placing unnecessary text inside the child-facing mobile design.

---

# 3. Problem

Beginning readers must connect three representations of a word:

1. The printed word
2. Its spoken form
3. Its meaning

A child may successfully sound out a printed word without knowing what the spoken word means.

Brian can decode *burrow*, but the word may not activate an existing concept in his English vocabulary. When this happens, the sentence stops making sense and his reading momentum breaks.

Ello must distinguish this moment from ordinary slow decoding.

The system should not:

* Reteach phonics when Brian has already decoded the word
* Correct Brian unnecessarily
* Treat a pause as automatic evidence of failure
* Pull Brian into a long lesson
* Require Brian to pronounce the word again
* Make the experience feel like a test

The product problem is:

> How might Ello help a child connect an unfamiliar printed word to its meaning quickly enough that the child can return to the story without losing confidence, context, or momentum?

---

# 4. Product hypothesis

> A short, permission-based vocabulary intervention anchored to the unfamiliar word will help a child understand it while causing less disruption than automatically launching a separate vocabulary lesson.

The offer should begin with the smallest cue likely to work and become more explicit only if the child continues to appear stuck.

For the prototype, a bounded AI interpretation step will make the experience feel responsive while deterministic product logic ensures that the interaction remains reliable.

---

# 5. Goals

## 5.1 Primary goal

Help the child resolve a meaning stall and return to reading with enough understanding to make sense of the sentence.

## 5.2 Supporting goals

* Preserve the child’s sense of competence.
* Recognize that the child successfully decoded the word.
* Make help available without forcing it.
* Connect the printed word, spoken word, and concept.
* Avoid turning pronunciation into a separate task.
* Handle silence or inactivity without creating a failure state.
* Preserve the child’s exact place in the story.
* Keep the intervention brief.
* Demonstrate a believable AI-native interaction.
* Make the simulated behavior understandable to prototype reviewers.

---

# 6. Non-goals

The prototype is not intended to:

* Reliably detect real comprehension stalls from audio.
* Perform speech transcription.
* Grade pronunciation.
* Teach phonics.
* Ask the child to repeat the word.
* Support every type of vocabulary word.
* Generate child-facing definitions dynamically.
* Provide a dictionary experience.
* Measure long-term vocabulary retention.
* Build a vocabulary collection or review system.
* Personalize instruction across sessions.
* Support open-ended conversation.
* Replace the story with a game.
* Demonstrate production-ready agent orchestration.
* Implement production analytics infrastructure.
* Implement production accessibility settings.
* Reproduce every possible edge case.
* Support multiple stories or target words.

---

# 7. Target persona

## Brian

Brian is six years old and lives in Nairobi. He is learning to read in English, his second language, and uses Ello independently at home.

Brian understands basic letter-sound relationships and can slowly sound out unfamiliar words. His spoken English vocabulary is still developing, so he may decode a word correctly without knowing what it means.

## Relevant characteristics

* Reads slowly and may sound out many words.
* Can decode simple unfamiliar words.
* May not know whether his difficulty is pronunciation or meaning.
* May pause, repeat a word, restart a sentence, or wait silently.
* May not independently ask for help.
* Is still building confidence speaking unfamiliar English words.
* Benefits from clear images and short explanations.
* May be reading in a noisy environment.
* May use a small shared device.
* Can lose his place when taken away from the story.
* Wants to continue the story rather than complete a lesson.

## Persona principle

Design for Brian’s needs without creating a Kenya-specific interaction.

The feature should also be understandable and supportive for:

* A fluent English-speaking beginning reader
* A multilingual learner
* A child with attention differences
* A child with speech differences
* A child reading in a noisy household

---

# 8. Jobs to be done

## Primary job

> When I can sound out a word but do not know what it means, help me understand it quickly so I can make sense of the sentence and continue my story.

## Functional jobs

* Let me know help is available.
* Let me choose whether to receive help.
* Show me what the word means.
* Connect the image to the printed word.
* Let me hear or understand how the whole word is said.
* Return me to the exact place where I stopped.
* Help me reconnect the word to the sentence.

## Emotional jobs

* Recognize that I successfully sounded out the word.
* Do not make me feel wrong, slow, or tested.
* Make receiving help feel normal.
* Keep me in control of the interaction.
* Preserve my confidence as a reader.
* Help me feel successful when I return to the story.

## Identity job

> Help me feel like a reader who can work through difficult words.

---

# 9. Experience principles

## 9.1 The story pauses but never disappears

The vocabulary intervention must remain visually and conceptually connected to the original page.

The child should not feel that they navigated to a separate activity.

## 9.2 Get permission before teaching

Ello should offer help rather than immediately displaying a definition.

Stall interpretation is uncertain, and normal decoding should not automatically trigger instruction.

## 9.3 Start with the smallest interruption that might work

The first offer is a restrained animation on the target word.

The companion appears only if the child does not respond or resume reading.

## 9.4 Meaning is the goal

Brian has already decoded the word.

The intervention should connect *burrow* to a concrete concept rather than begin a phonics or pronunciation lesson.

## 9.5 Do not require speech to progress

The prototype interprets simulated speech input, but the teaching experience does not require Brian to repeat the word.

No pronunciation scoring or rejection state should appear.

## 9.6 Use motion to point, not entertain

Animation should direct attention to the unfamiliar word or its associated help affordance.

It should not compete with the story.

## 9.7 Continuation is the reward

The successful outcome is returning to the story with understanding.

Do not add:

* Coins
* Badges
* Confetti
* Completion screens
* Unrelated praise animations
* Vocabulary scores

## 9.8 The model interprets; the product decides

The Anthropic model may classify the simulated reading behavior.

It must not:

* Generate the user journey
* Select arbitrary screens
* Control animation timing
* Write child-facing dialogue
* Decide how to teach the word
* Create new actions at runtime

---

# 10. Product approach

The product follows five phases:

> **Interpret → Offer → Accept → Teach → Return**

## Interpret

Ello interprets the reviewer’s simulated speech input and determines whether it represents:

* A likely meaning stall
* Incomplete decoding
* Continued reading
* No relevant signal

## Offer

The target word pulses.

If Brian does not respond, Yello appears with a magnifying glass and provides a clearer offer.

## Accept

Brian taps either:

* The target word
* Yello’s magnifying glass

Both actions produce the same result.

## Teach

The experience shows a concrete visual of a burrow while Yello’s explanation appears in the transcript area.

## Return

The teaching layer collapses back toward the word, and Brian is returned to the shortest meaningful phrase that restores context.

---

# 11. Prototype MVP scope

## In scope

* One persona: Brian
* One story page
* One target sentence
* One target word: *burrow*
* One typed simulated-speech input
* AI interpretation of the typed input
* Local fallback interpretation
* One word-pulse offer
* One companion escalation
* Tap word or companion to accept
* One concrete teaching visual
* One fixed child-friendly explanation
* A transcript area for Yello’s responses
* Exact return to the relevant sentence phrase
* Sentence reread
* Reviewer-visible model diagnostics
* A manual prototype reset

## Simulated

* Child speech
* Pause duration
* Reading-state tracking
* Meaning-stall detection
* Voice intent
* Spoken responses from Yello

## Out of scope

* Live microphone input
* Audio transcription
* Real pause timing
* Real pronunciation analysis
* Dynamic vocabulary content
* Multiple stories
* Multiple target words
* Multiple word categories
* Long-term review
* Cross-session adaptation
* Open-ended child conversation
* Production telemetry
* Multi-agent runtime orchestration

---

# 12. Typed speech simulation convention

The reviewer types what Brian is intended to have said.

The input should be interpreted as a synthetic representation of oral reading.

## 12.1 Character conventions

| Typed pattern           | Intended meaning                     |
| ----------------------- | ------------------------------------ |
| Letters and words       | What Brian attempted to say          |
| Hyphens between letters | Deliberate letter-by-letter decoding |
| Repeated word           | Brian tries the word again           |
| One or two periods      | Brief hesitation                     |
| Three to five periods   | Noticeable pause                     |
| Six or more periods     | Strong or sustained stall            |
| Question mark           | Questioning or uncertain intonation  |
| Words after *burrow*    | Brian continued reading              |

## 12.2 Example: likely meaning stall

> `his cozy b-u-r-r-o-w...burrow......`

Interpretation:

* Brian completed the target word.
* Brian may have repeated it.
* Brian did not continue the sentence.
* A meaning stall is likely.

## 12.3 Example: reading resumed

> `his cozy burrow...was nestled between the rocks`

Interpretation:

* Brian completed the target word.
* Brian briefly hesitated.
* Brian continued reading.
* The vocabulary offer should not appear or should be dismissed.

## 12.4 Example: decoding incomplete

> `his cozy b-u-r......`

Interpretation:

* Brian did not complete the target word.
* This may be a decoding difficulty.
* Vocabulary Rescue should not launch.

## 12.5 Submission behavior

The model interpretation should run after the reviewer submits the simulated utterance.

It should not run after every typed character.

The input area should support repeated submissions as the child continues reading through the flow.

---

# 13. Core interaction states

The prototype contains five child-facing states.

## State 1: Reading

The story page is visible.

The simulated speech input is available below the mobile viewport.

Yello is in the normal listening state defined by the Figma design.

## State 2: Word offer

The target word *burrow*:

* Is highlighted
* Slightly increases in visual emphasis
* Gains a restrained shadow or equivalent treatment
* Pulses twice within one non-looping animation cycle
* Does not shift surrounding text

No spoken prompt is shown yet.

### Available actions

* Tap *burrow* to accept help.
* Submit continued reading to dismiss the offer.
* Wait for the scripted companion escalation.

## State 3: Companion offer

If Brian neither taps the word nor resumes reading, Yello presents the magnifying glass.

The magnifying glass and target word remain visually connected.

The Yello transcript area displays:

> **Yello:** “Want to see what *burrow* means?”

### Available actions

* Tap *burrow*.
* Tap the magnifying glass.
* Submit continued reading to dismiss the offer.

The prototype does not include a third escalation.

## State 4: Meaning activity

The teaching layer opens from the target-word location.

The original story page remains visible or spatially preserved in the background.

The child sees:

* The printed word *burrow*
* A clear visual of an animal burrow
* Yello connected to the teaching moment

The transcript area displays:

> **Yello:** “A burrow is a hole or tunnel in the ground where an animal lives.”

The transcript may then display:

> **Yello:** “Burrow.”

The child is not asked to repeat the word.

The prototype may use a clear continue action defined by the Figma design, or advance according to the approved interaction represented in Figma.

## State 5: Return and reread

The teaching layer collapses back toward the target word.

The story returns to the phrase:

> “His cozy burrow was nestled…”

The transcript area displays:

> **Yello:** “Let’s read it again and find out where Slash lived.”

Ello returns to listening mode.

The reviewer submits Brian’s continued reading through the simulated speech input.

---

# 14. Detailed user journey

## Stage 1: Read

Brian reads:

> “High above Earth on the red planet Mars, lived a small, friendly hedgehog named Slash.”

He continues:

> “His cozy b-u-r-r-o-w...burrow......”

### Emotional state

Focused and effortful.

### Product behavior

Ello does not interrupt while Brian is still decoding.

The system waits until the simulated utterance is submitted.

---

## Stage 2: Interpret the stall

The Anthropic interpretation layer evaluates the submitted input.

It determines that:

* Brian completed *burrow*.
* Brian did not continue the sentence.
* The long pause indicates uncertainty.
* A likely meaning stall occurred.

### Emotional state

Uncertain and beginning to feel confused.

### Product behavior

The state machine transitions from Reading to Word Offer.

The model does not directly render or select the word animation.

---

## Stage 3A: Minimal offer

The word *burrow* pulses twice in one restrained cycle.

No separate screen appears.

No Yello transcript appears yet.

### Child options

* Tap *burrow* to receive help.
* Continue reading to dismiss the offer.
* Do nothing and allow the companion to appear.

### Emotional state

Cautiously supported and still in control.

---

## Stage 3B: Companion escalation

If Brian does not respond after a short scripted interval, Yello presents a magnifying glass.

The target word and magnifying glass are visually linked.

The transcript displays:

> **Yello:** “Want to see what *burrow* means?”

### Child options

* Tap the magnifying glass.
* Tap *burrow*.
* Continue reading to dismiss the offer.

### Emotional state

Reassured by a clearer invitation.

---

## Stage 4: Accept help

Brian taps the word or the magnifying glass.

### Product behavior

The teaching layer opens directly from the target word.

The page remains visible in the background.

Yello does not ask for confirmation again.

Both tap targets transition to the same Meaning Activity state.

---

## Stage 5: Understand the word

Brian sees an age-appropriate visual showing a burrow in context.

The transcript displays:

> **Yello:** “A burrow is a hole or tunnel in the ground where an animal lives.”

The experience may then display:

> **Yello:** “Burrow.”

The intervention links:

* The printed word *burrow*
* Its whole spoken form as represented in the transcript
* A recognizable image
* The concept of an animal’s underground home

Because Brian already decoded the word, the experience does not ask him to repeat it.

### Emotional state

Curious and beginning to feel capable.

---

## Stage 6: Return

The teaching layer collapses back toward *burrow*.

The experience restores the relevant part of the story rather than restarting the entire page.

The transcript displays:

> **Yello:** “Let’s read it again and find out where Slash lived.”

### Emotional state

Reoriented.

---

## Stage 7: Reread

Brian continues:

> “His cozy burrow was nestled between rust-colored rocks and sparkly Martian crystals.”

### Emotional state

Confident and re-engaged.

### Production principle

Return the child to the beginning of the shortest meaningful phrase or clause that restores context.

Do not restart a long sentence when a shorter contextual unit is sufficient.

---

# 15. AI-native system architecture

The prototype should use one narrowly scoped AI interpretation step inside a deterministic product architecture.

## 15.1 High-level architecture

> **Typed speech simulation → Server-side Anthropic interpretation → Structured reading event → Deterministic state machine → UI transition**

## 15.2 Model responsibility

The Anthropic model is responsible only for interpreting the simulated reading input.

It answers:

> What reading event does this synthetic utterance most likely represent?

The model may return one of four events:

* `MEANING_STALL`
* `DECODING_INCOMPLETE`
* `READING_RESUMED`
* `NO_RELEVANT_SIGNAL`

## 15.3 Application responsibility

The application owns:

* Current state
* Transition rules
* Animation timing
* Offer escalation timing
* Tap behavior
* Teaching content
* Child-facing copy
* Return position
* Transcript rendering
* Error behavior
* Reset behavior

## 15.4 No multi-agent runtime

The product does not require separate runtime agents for:

* Planning
* Pedagogy
* Content generation
* UI control
* Conversation
* Evaluation

A multi-agent runtime would add unnecessary latency and unpredictability to a five-state prototype.

Development may use a separate Claude Code review pass, but the product runtime should contain only one bounded model call.

---

# 16. Model input and output requirements

## 16.1 Model input

The server-side interpretation request should include only the information needed for classification:

* Target word
* Target sentence
* Submitted simulated utterance
* Current interaction state
* Typed-input convention
* Allowed reading events
* Prompt version

The request should not include unnecessary personal information about Brian.

## 16.2 Structured output

The model response must conform to a fixed schema.

Required fields:

* `event`
* `confidence`
* `reason_code`
* `evidence`

## 16.3 Allowed event values

### `MEANING_STALL`

Use when:

* The complete target word was attempted successfully.
* The child did not meaningfully continue.
* Repetition, questioning, or a sustained pause suggests uncertainty.

### `DECODING_INCOMPLETE`

Use when:

* The target word was not completed.
* The input indicates difficulty producing the word.
* There is not enough evidence that the meaning is the problem.

### `READING_RESUMED`

Use when:

* The child continues with words following the target.
* A brief pause is followed by meaningful reading.
* An active offer should be dismissed.

### `NO_RELEVANT_SIGNAL`

Use when:

* The input is empty.
* The target word is absent.
* The utterance cannot support another classification.
* The input does not materially change the current experience.

## 16.4 Confidence values

Allowed values:

* `low`
* `medium`
* `high`

Confidence is visible only in the reviewer diagnostics.

It does not affect Brian’s child-facing experience unless explicitly mapped through deterministic application rules.

## 16.5 Evidence

Evidence should be a short excerpt from the submitted text.

The model should not return hidden reasoning, educational advice, or generated dialogue.

---

# 17. Local fallback interpretation

The prototype must continue to function if:

* The Anthropic request times out
* The API is unavailable
* The response is invalid
* The structured output cannot be parsed

The local fallback should use the same four-event contract.

## Minimum fallback rules

* Normalize capitalization and punctuation.
* Detect whether *burrow* was completed.
* Detect whether words following *burrow* were submitted.
* Treat a complete target followed by six or more periods as a likely meaning stall.
* Treat an incomplete letter sequence as incomplete decoding.
* Treat meaningful continuation after the target as reading resumed.
* Otherwise return no relevant signal.

The UI should not need to know whether the event came from the model or fallback.

A reviewer-only diagnostic may indicate the source.

---

# 18. Functional requirements

## FR1: Story presentation

The prototype must display the approved story content in the mobile viewport.

## FR2: Simulated speech input

The prototype must provide a text input below the mobile viewport for simulated child speech.

The input must support:

* Letters
* Spaces
* Hyphens
* Repeated words
* Periods
* Question marks

## FR3: Input submission

The reviewer must be able to submit a simulated utterance.

The system must prevent accidental duplicate submissions while interpretation is in progress.

## FR4: AI interpretation

The server must send the submitted input to the Anthropic model and request a structured reading event.

## FR5: Fallback interpretation

The system must provide a deterministic local fallback if the model call fails.

## FR6: Word pulse

After a `MEANING_STALL` event, *burrow* must pulse twice within one non-looping animation cycle.

The animation must:

* Be noticeable but restrained
* Affect only the target word
* Preserve legibility
* Avoid shifting the text layout
* Stop automatically

## FR7: Companion escalation

If the word is not tapped and the child does not resume reading within the scripted interval, Yello must present the magnifying glass.

The companion must:

* Not cover story text
* Provide a large tap target
* Remain visually linked to *burrow*
* Avoid continuous animation
* Disappear if the child resumes reading

## FR8: Offer transcript

When the companion offer appears, the transcript area must display:

> “Want to see what *burrow* means?”

## FR9: Acceptance

The prototype must support:

* Tapping *burrow*
* Tapping Yello’s magnifying glass

Both actions must open the same teaching state.

No second confirmation should appear.

## FR10: Teaching visual

The activity must show a clear, age-appropriate burrow in context.

The image should make it evident that the burrow is:

* In or under the ground
* A place where an animal lives
* A hole or tunnel rather than a freestanding object

## FR11: Child-friendly explanation

The transcript area must display:

> “A burrow is a hole or tunnel in the ground where an animal lives.”

The copy must remain static and must not be generated at runtime.

## FR12: Whole-word model

The transcript may display:

> “Burrow.”

No response or repetition from the child is required.

## FR13: Return animation

The teaching layer must visually collapse back toward the target word rather than navigate to a separate page.

## FR14: Return prompt

The transcript must display:

> “Let’s read it again and find out where Slash lived.”

## FR15: Reread position

The child must return to:

> “His cozy burrow was nestled…”

The prototype should not restart the entire story.

## FR16: Resume-reading dismissal

If the system receives `READING_RESUMED` while an offer is active, it must dismiss:

* The target-word emphasis
* The companion
* The transcript offer

## FR17: Reset

The reviewer must be able to reset the prototype to the initial Reading state.

Reset must clear:

* Timers
* Animations
* Teaching overlays
* Transcript responses
* Simulated speech input
* Model diagnostics
* Active highlights

---

# 19. Content requirements

## Target word

**burrow**

## Story sentence

> “His cozy burrow was nestled between rust-colored rocks and sparkly Martian crystals.”

## Child-friendly definition

> “A burrow is a hole or tunnel in the ground where an animal lives.”

## Whole-word model

> “Burrow.”

## Companion offer

> “Want to see what *burrow* means?”

## Return prompt

> “Let’s read it again and find out where Slash lived.”

## Return phrase

> “His cozy burrow was nestled…”

All child-facing content is fixed for the prototype.

The model may not rewrite, extend, or personalize it.

---

# 20. Figma implementation requirements

The approved Figma file is the visual source of truth.

The implementation must use the Figma MCP to inspect and retrieve relevant design details.

## 20.1 Figma MCP responsibilities

Use the Figma MCP to obtain:

* Relevant page and frame structure
* Mobile viewport dimensions
* Component hierarchy
* Typography
* Spacing
* Color values
* Border radii
* Shadows
* Icons
* Character assets
* Burrow visual assets
* Interaction-state designs
* Layer positioning
* Responsive constraints where present

## 20.2 Implementation principle

The development task is to implement the approved design, not redesign it.

Do not introduce new:

* Visual systems
* Fonts
* Character poses
* Color palettes
* Layout structures
* Teaching cards
* Animations
* Icons

unless required to complete a missing functional state.

## 20.3 Missing-state behavior

When a required interaction state is not explicitly represented in Figma:

1. Reuse existing components.
2. Preserve established spacing and hierarchy.
3. Make the smallest reasonable extension.
4. Document the extension for review.
5. Avoid creating a new design pattern.

## 20.4 Asset handling

Prefer assets retrieved from or referenced by Figma.

Do not replace approved assets with unrelated stock imagery when a suitable Figma asset exists.

## 20.5 Prototype shell

The reviewer-facing input and transcript shell should follow the approved Figma design when those elements are included.

When the shell is not fully specified, it should remain visually secondary to the mobile experience.

---

# 21. UX requirements

## 21.1 Visual hierarchy

* The target word remains the primary visual anchor.
* Only one element should animate at a time.
* Yello remains secondary to the word.
* The story remains visible or spatially preserved.
* Reviewer controls remain visually separate from the child-facing experience.

## 21.2 Interaction simplicity

* One primary child-facing action per state
* No menus
* No written instructions that Brian must decode
* No multiple-choice question
* No pronunciation task
* No close button required
* No confirmation after accepting help
* No visible error after an imprecise tap

## 21.3 Motion

* Motion should be brief.
* Motion should not loop indefinitely.
* Motion should not cause layout shifts.
* Motion should not occur simultaneously in multiple areas.
* The return animation should reinforce spatial continuity.

## 21.4 Transcript behavior

* Yello’s latest response must be easy for reviewers to identify.
* Child input and Yello responses must be visually distinguishable.
* The transcript should not resemble an open-ended chatbot.
* The transcript should display only approved lines.
* Internal model evidence must not appear in the Yello transcript.

---

# 22. Accessibility and inclusion

* Use a large invisible touch target around *burrow*.
* Provide a large touch target for the magnifying glass.
* Do not depend on color alone.
* Do not require precise speech.
* Do not require audio.
* Avoid rapid or looping motion.
* Keep spoken language concrete and short.
* Avoid culturally specific prior knowledge.
* Preserve the child’s location on the page.
* Ensure the experience conceptually works in a noisy home.
* Keep reviewer controls keyboard accessible where practical.
* Maintain readable contrast according to the approved Figma designs.

---

# 23. ADHD-inclusive design

* Use motion once to direct attention.
* Avoid simultaneous animations.
* Keep prompts short.
* Make the sequence predictable.
* Preserve the child’s place.
* Remove Yello’s offer when it is no longer needed.
* Avoid reward animations.
* Avoid unnecessary waiting.
* Avoid multiple prompts in the teaching state.
* Return quickly to the story.

---

# 24. Error and fallback behavior

## Child ignores the word pulse

Escalate to the companion after the scripted interval.

## Child ignores the companion

Keep the companion visible briefly.

Do not introduce a third escalation.

## Child resumes reading

Dismiss the offer automatically.

## Child submits incomplete decoding

Remain in Reading.

Do not launch Vocabulary Rescue.

## Child taps outside the target

Show no visible error.

The child may try again.

## Anthropic request is slow

Display a restrained reviewer-facing loading state.

Do not change the child-facing screen until an event is available.

## Anthropic request fails

Use the local fallback interpreter.

## Model output is invalid

Reject the output and use the local fallback.

## Transcript is unavailable

The interaction may still advance, but the missing transcript must be treated as a prototype defect because it represents Yello’s verbal explanation.

## Child wants to exit the meaning activity

Returning to the story should always be possible.

Tapping outside the activity to return is optional unless represented in the Figma design.

---

# 25. Emotional journey

| Stage            | Intended emotional state |
| ---------------- | ------------------------ |
| Reading          | Focused                  |
| Decoding         | Effortful but persistent |
| Meaning stall    | Uncertain                |
| Word offer       | Cautiously supported     |
| Companion offer  | Reassured                |
| Meaning activity | Curious                  |
| Explanation      | Capable                  |
| Return           | Reoriented               |
| Reread           | Confident and re-engaged |

The intended arc is:

> **Focused → uncertain → supported → curious → capable → confident**

The experience must avoid:

> **Uncertain → corrected → tested → dependent**

---

# 26. Success metrics

## Primary product metric

### Sentence recovery rate

The percentage of interventions after which the child successfully rereads or continues the relevant sentence or phrase.

For the prototype, successful recovery is represented by a submitted utterance that meaningfully continues from:

> “His cozy burrow…”

## Prototype observation criteria

* Did the reviewer understand how to simulate Brian’s speech?
* Did the system distinguish incomplete decoding from a meaning stall?
* Did the word pulse appear at the correct moment?
* Was the word visibly tappable?
* Did the companion improve discoverability?
* Did the teaching visual clearly represent a burrow?
* Did the transcript make Yello’s intended speech clear?
* Did the explanation use understandable language?
* Did the experience avoid turning pronunciation into a test?
* Did the child return to the correct phrase?
* Did the full experience feel like a brief detour?
* Did the prototype continue functioning when the API was unavailable?

## Supporting future metrics

* Offer acceptance rate
* Offer dismissal rate
* Time from stall to return
* Pulse-to-companion escalation rate
* Reading continuation rate
* Repeat stall rate on the same word
* False-positive interruption rate
* Model/fallback disagreement rate
* Interpretation latency
* Invalid model-output rate

## Prototype duration target

The vocabulary detour should feel complete within approximately:

> **15–30 seconds**

This excludes reviewer typing time.

---

# 27. AI evaluation requirements

The AI interpreter must be evaluated against a small fixed dataset before the prototype is considered ready.

## Required test cases

| Scenario                           | Simulated input                          | Expected event        |
| ---------------------------------- | ---------------------------------------- | --------------------- |
| Clear meaning stall                | `his cozy burrow......`                  | `MEANING_STALL`       |
| Segmented decoding then stall      | `b-u-r-r-o-w...burrow......`             | `MEANING_STALL`       |
| Questioning repetition             | `burrow...burrow?......`                 | `MEANING_STALL`       |
| Normal continuation                | `burrow...was nestled between the rocks` | `READING_RESUMED`     |
| Brief hesitation then continuation | `burrow..was nestled`                    | `READING_RESUMED`     |
| Incomplete decoding                | `b-u-r......`                            | `DECODING_INCOMPLETE` |
| Incorrect word                     | `his cozy borrow......`                  | `DECODING_INCOMPLETE` |
| Pause before target                | `his cozy......burrow was nestled`       | `READING_RESUMED`     |
| Target absent                      | `his cozy......`                         | `NO_RELEVANT_SIGNAL`  |
| Empty submission                   | Empty input                              | `NO_RELEVANT_SIGNAL`  |
| Capitalization variation           | `His Cozy BURROW......`                  | `MEANING_STALL`       |
| Punctuation noise                  | `burrow!!!......`                        | `MEANING_STALL`       |

## Evaluation dimensions

Each test should verify:

* Correct event
* Valid structured output
* Allowed confidence value
* Relevant evidence
* No child-facing dialogue generated
* No UI instruction generated
* No confusion between decoding and meaning
* Stable result across repeated runs for critical cases

## Critical cases

The following cases must pass before visual polish is considered complete:

* Clear meaning stall
* Normal continuation
* Incomplete decoding
* Empty submission
* API failure fallback

---

# 28. Reviewer diagnostics

The prototype may display a reviewer-only diagnostics area outside the mobile screen.

It may show:

* Interpreted event
* Confidence
* Reason code
* Evidence excerpt
* Model or fallback source
* Prompt version
* Request status

The diagnostics must not appear inside the child-facing mobile viewport.

The diagnostics must not be styled as dialogue from Yello.

---

# 29. Prototype test script

## Scenario introduction

Tell the participant:

> “You’re reading a story with Ello. Read the words out loud like you normally would.”

For a reviewer-led demo, explain that the text box simulates what the child says.

Do not explain the vocabulary feature before the first run.

## Test sequence

1. Display the story page.
2. Enter a simulated utterance that stalls after *burrow*.
3. Submit the utterance.
4. Observe the word pulse.
5. Tap the word, or wait for the companion.
6. Observe the companion offer.
7. Tap the companion or word.
8. View the burrow visual.
9. Read Yello’s explanation in the transcript.
10. Continue to the return state.
11. Observe the restored phrase.
12. Submit continued reading.
13. Reset the prototype.
14. Repeat with an incomplete-decoding input.
15. Confirm that Vocabulary Rescue does not launch.
16. Repeat with continued reading.
17. Confirm that the offer is dismissed or never shown.
18. Disable or interrupt the Anthropic request.
19. Confirm that the fallback still completes the core flow.

## Moderator observations

* Did the participant understand the simulated speech convention?
* Did the word animation attract attention?
* What did the participant think the animation meant?
* Did they understand that the word was tappable?
* Did Yello clarify the offer?
* Did the image clearly communicate *burrow*?
* Was the transcript easy to associate with Yello?
* Did the explanation feel brief?
* Could the participant identify where reading should resume?
* Did the intervention feel integrated with the story?
* Was anything visually or behaviorally confusing?

## Post-task questions

* “What happened when the word moved?”
* “Why did you tap it?”
* “What is a burrow?”
* “How did you know where to keep reading?”
* “Was anything confusing?”
* “What would you do next time you found a new word?”

---

# 30. Risks and mitigations

## Risk: The typed-speech convention is confusing

Reviewers may not understand how periods or hyphens represent speech.

**Mitigation:** Clearly label the control and provide a concise example near the input.

## Risk: The prototype resembles a chatbot

The input and response area may make the experience appear conversational.

**Mitigation:** Visually frame the input as simulated reading and the transcript as Yello’s scripted response, not an open-ended chat.

## Risk: The word pulse is too subtle

The child may not notice or understand it.

**Mitigation:** Use companion escalation.

## Risk: Yello becomes distracting

The child may focus on the character rather than the word.

**Mitigation:** Keep Yello visually secondary, temporary, and non-looping.

## Risk: The teaching moment feels like a quiz

The child may expect to be tested after the explanation.

**Mitigation:** Do not ask for repetition, pronunciation, or a multiple-choice response.

## Risk: The definition introduces unfamiliar language

Brian may not understand the explanation.

**Mitigation:** Use the fixed concrete definition and a clear visual.

## Risk: The child loses the sentence context

The teaching moment may consume working memory.

**Mitigation:** Preserve the page and return to the shortest meaningful phrase.

## Risk: The feature over-interrupts normal decoding

The model may interpret slow reading as a vocabulary need.

**Mitigation:** Require evidence that the target word was completed before allowing a meaning-stall classification.

## Risk: The Anthropic API introduces demo fragility

Latency or failure could interrupt the prototype.

**Mitigation:** Use a short timeout and deterministic local fallback.

## Risk: Dynamic generation produces inappropriate language

Generated definitions may be too complex or inconsistent.

**Mitigation:** Keep all child-facing copy static.

## Risk: The implementation drifts from Figma

Developers may approximate or redesign approved UI.

**Mitigation:** Use Figma MCP as the source of truth and document any missing-state extensions.

## Risk: Reviewers assume real speech recognition exists

The prototype may appear more technically complete than it is.

**Mitigation:** Clearly label the speech input as simulated and document the AI classification boundary.

---

# 31. Prototype acceptance criteria

The prototype is ready for demonstration when all of the following are true.

## Experience

* The approved story appears in the mobile viewport.
* *Burrow* is the only target word.
* The child-facing flow contains exactly five core states.
* A meaning stall triggers the word offer.
* The word pulse does not move surrounding text.
* The companion appears only after the scripted escalation.
* Continued reading dismisses the offer.
* Tapping the word and companion produce the same result.
* The teaching visual clearly represents a burrow.
* Yello’s explanation appears below the mobile screen.
* No pronunciation task appears.
* The story remains visually or spatially preserved.
* The experience returns to “His cozy burrow…”
* The full intervention feels brief.

## AI behavior

* The model returns only an allowed structured event.
* Incomplete decoding does not launch vocabulary help.
* Continued reading does not launch vocabulary help.
* A completed target followed by a sustained stall launches the offer.
* Invalid model output cannot directly affect the UI.
* API failure activates the local fallback.
* No model-generated child-facing text appears.

## Figma implementation

* Approved Figma components and assets are used.
* Typography and spacing match the source designs.
* Yello’s position and visual hierarchy match the source designs.
* The teaching layer matches the intended Figma state.
* Any missing-state extensions are minimal and documented.
* Reviewer controls remain visually secondary.

## Reviewer shell

* The simulated speech input is clearly labeled.
* Yello’s transcript is easy to identify.
* Reviewer diagnostics are separated from child-facing content.
* The prototype can be reset without refreshing the page.
* The flow can be demonstrated repeatedly.

---

# 32. Final product decisions

The prototype will use a progressive permission model:

1. Interpret the submitted simulated speech.
2. Confirm that the child completed *burrow* before treating the event as a meaning stall.
3. Begin with a restrained word pulse.
4. Escalate to Yello and the magnifying glass only if needed.
5. Teach only after the child accepts.
6. Display Yello’s verbal explanation in the transcript below the mobile screen.
7. Do not ask the child to repeat the word.
8. Return immediately to the shortest meaningful phrase.
9. Keep the model limited to structured interpretation.
10. Keep the experience deterministic after classification.
11. Use Figma MCP as the visual implementation source of truth.
12. Maintain a local fallback so the demo does not depend on API availability.

The central product principle is:

> **Start with the smallest interruption that might work. Escalate only when Brian’s need becomes clearer.**

The central architecture principle is:

> **Let the model interpret uncertainty, but let the product own the child’s experience.**

The feature succeeds when Brian does not feel that he completed a vocabulary activity.

He feels that he got unstuck and kept reading.