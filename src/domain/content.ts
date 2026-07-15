export const TARGET_WORD = 'burrow'

export const TARGET_SENTENCE =
  'His cozy burrow was nestled between rust-colored rocks and sparkly Martian crystals.'

export const STORY_PARAGRAPHS = [
  'High above Earth on the red planet Mars, lived a small, friendly hedgehog named Slash. His cozy burrow was nestled between rust-colored rocks and sparkly Martian crystals.',
  'Slash spent time collecting shiny space pebbles and watching the two moons dance across the sky.',
] as const

// All child-facing copy is fixed — never generate or rewrite at runtime.
export const COPY = {
  offer:        'Want to see what burrow means?',
  definition:   'A burrow is a hole or tunnel in the ground where an animal lives.',
  wordModel:    'Burrow.',
  returnPrompt: "Let's read it again and find out where Slash lived.",
  returnPhrase: 'His cozy burrow was nestled…',
} as const

// Words in the target sentence that follow the target word.
// A submission containing any of these after the target word signals reading resumed.
export const CONTINUATION_WORDS = [
  'was', 'nestled', 'between', 'rust', 'colored', 'rocks', 'sparkly', 'martian', 'crystals',
] as const
