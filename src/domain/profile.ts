export type DecodingStyle = 'blending' | 'letter-by-letter' | 'mixed'

export interface ReadingProfile {
  childName:          string
  age:                number           // years
  gradeLevel:         number           // 1 = first grade
  pauseThreshold:     number           // min consecutive dots that signal a real stall
  decodingThreshold:  number           // min hyphens in an attempt that signal decoding struggle
  decodingStyle:      DecodingStyle    // how the child attacks unfamiliar words
  knownVocabulary:    readonly string[] // words reliably within the child's sight vocabulary
  unknownVocabulary:  readonly string[] // words targeted for intervention / likely unfamiliar
}

// Production: fetched from the Ello reading-profile API.
// Prototype: hardcoded for the demo session.
export const BRIAN_PROFILE: ReadingProfile = {
  childName:         'Brian',
  age:               6,
  gradeLevel:        1,

  // 6+ consecutive dots = sustained stall, matching the CLAUDE.md typing convention.
  // 1-2 dots = brief hesitation, 3-5 = noticeable pause — neither triggers intervention.
  pauseThreshold:    6,

  // Brian blends sounds rather than decoding letter-by-letter, so a single hyphenated
  // attempt (e.g. "bur-row") is enough to signal he is working through the word.
  decodingThreshold: 1,
  decodingStyle:     'blending',

  // Grade-1 Dolch sight words + story words within first-grade range.
  knownVocabulary: [
    // Dolch pre-primer / primer / grade-1 sight words
    'a', 'and', 'away', 'big', 'blue', 'can', 'come', 'down', 'find', 'for',
    'funny', 'go', 'help', 'here', 'i', 'in', 'is', 'it', 'jump', 'little',
    'look', 'make', 'me', 'my', 'not', 'one', 'play', 'red', 'run', 'said',
    'see', 'the', 'three', 'to', 'two', 'up', 'we', 'where', 'you',
    'after', 'again', 'an', 'any', 'as', 'ask', 'by', 'could', 'every',
    'fly', 'from', 'give', 'going', 'had', 'has', 'her', 'him', 'his',
    'how', 'just', 'know', 'let', 'live', 'may', 'of', 'old', 'once',
    'open', 'over', 'put', 'round', 'some', 'stop', 'take', 'thank',
    'them', 'then', 'think', 'walk', 'were', 'when',
    // Story-specific words within first-grade range
    'above', 'earth', 'lived', 'small', 'named', 'was', 'between',
    'rocks', 'spent', 'time', 'dance', 'sky', 'on', 'planet', 'cozy',
    'shiny', 'two', 'moons', 'watching', 'collecting', 'pebbles',
  ],

  // Words above first-grade level likely to cause stalls or substitutions.
  unknownVocabulary: [
    'burrow',      // target intervention word for this session
    'nestled',     // ~grade-3 vocabulary
    'martian',     // proper adjective, likely unfamiliar
    'crystals',    // ~grade-2/3 vocabulary
    'hedgehog',    // compound, likely unfamiliar
    'rust-colored', // compound modifier, above grade level
  ],
}

/**
 * Serialise the profile into a compact block for the Anthropic classifier prompt.
 * Keeps the prompt concise — only include fields the model needs for classification.
 */
export function profileToPromptBlock(profile: ReadingProfile): string {
  return [
    `Child: ${profile.childName}, age ${profile.age}, grade ${profile.gradeLevel}`,
    `Decoding style: ${profile.decodingStyle} (not letter-by-letter)`,
    `Pause signal: ${profile.pauseThreshold}+ consecutive dots = real hesitation for this child`,
    `Decoding signal: ${profile.decodingThreshold}+ hyphens in an attempt = active decoding struggle`,
    `Known vocabulary (sample): ${profile.knownVocabulary.slice(0, 20).join(', ')}…`,
    `Unfamiliar / target vocabulary: ${profile.unknownVocabulary.join(', ')}`,
  ].join('\n')
}
