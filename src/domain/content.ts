export const TARGET_WORD = 'burrow'

export const TARGET_SENTENCE =
  'His cozy burrow was nestled between rust-colored rocks and sparkly Martian crystals.'

export const STORY_PARAGRAPHS = [
  'High above Earth on the red planet Mars, lived a small, friendly hedgehog named Slash. His cozy burrow was nestled between rust-colored rocks and sparkly Martian crystals.',
  'Slash spent time collecting shiny space pebbles and watching the two moons dance across the sky.',
] as const

// All child-facing copy is fixed — never generate or rewrite at runtime.
export const COPY = {
  offer: 'Want to see what a burrow is? Tap the word or my magnifying glass to take a look!',
  offer2: "Or we can keep reading to find out where Slash lived.",
  definition: 'A burrow is a hole or tunnel in the ground where an animal lives.',
  wordModel: 'Burrow.',
  returnPrompt: "Let's read it again and find out where Slash lived.",
  returnPhrase: 'His cozy burrow was nestled…',
} as const

// Flat ordered list of every display token in the story (space-split, punctuation preserved).
// Used for word-by-word reading progress tracking.
export const STORY_TOKENS: readonly string[] = [
  // Paragraph 1 (indices 0–26)
  'High', 'above', 'Earth', 'on', 'the', 'red', 'planet', 'Mars,',
  'lived', 'a', 'small,', 'friendly', 'hedgehog', 'named', 'Slash.',
  'His', 'cozy', 'burrow', 'was', 'nestled', 'between', 'rust-colored',
  'rocks', 'and', 'sparkly', 'Martian', 'crystals.',
  // Paragraph 2 (indices 27–42)
  'Slash', 'spent', 'time', 'collecting', 'shiny', 'space', 'pebbles',
  'and', 'watching', 'the', 'two', 'moons', 'dance', 'across', 'the', 'sky.',
] as const

export const TARGET_WORD_INDEX    = 17 // index of 'burrow' in STORY_TOKENS
export const RETURN_REREAD_START_INDEX = 15 // index of 'His' in the return phrase
export const PARAGRAPH_BREAK_INDEX = 27 // index where the second paragraph begins

// Words in the target sentence that follow the target word.
// A submission containing any of these after the target word signals reading resumed.
export const CONTINUATION_WORDS = [
  'was', 'nestled', 'between', 'rust', 'colored', 'rocks', 'sparkly', 'martian', 'crystals',
] as const
