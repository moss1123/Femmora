/**
 * Home story — shared constants.
 *
 * MQ strings are mirrored 1:1 in the section CSS files: the pinned (desktop) layouts only
 * apply under `MQ.pin`, so the JS choreography and the CSS layout always agree.
 * If you change one, change the matching `@media` blocks too.
 */
export const MQ = {
  /** any device that accepts motion */
  motion: '(prefers-reduced-motion: no-preference)',
  /** large enough to pin full-screen stages without hurting UX */
  pin: '(min-width: 768px) and (min-height: 560px) and (prefers-reduced-motion: no-preference)',
} as const

export interface MQConditions {
  motion: boolean
  pin: boolean
}

export type StoryTheme = 'wine' | 'ivory' | 'noir' | 'parchment'

export interface Chapter {
  id: string
  numeral: string
  title: string
  theme: StoryTheme
}

/** The nine chapters of the home story, in scroll order. Keep ChapterRail.css delays in step. */
export const CHAPTERS: Chapter[] = [
  { id: 'hs-manifesto', numeral: 'I', title: 'The manifesto', theme: 'wine' },
  { id: 'hs-bind', numeral: 'II', title: 'The double bind', theme: 'ivory' },
  { id: 'hs-promises', numeral: 'III', title: 'Four promises', theme: 'noir' },
  { id: 'hs-looks', numeral: 'IV', title: 'The looks', theme: 'parchment' },
  { id: 'hs-tiers', numeral: 'V', title: 'The house tiers', theme: 'wine' },
  { id: 'hs-textures', numeral: 'VI', title: 'Textures that speak', theme: 'ivory' },
  { id: 'hs-voices', numeral: 'VII', title: 'My Femmora, My Story', theme: 'noir' },
  { id: 'hs-launch', numeral: 'VIII', title: 'Beyond the Silhouette — the launch', theme: 'wine' },
  { id: 'hs-finale', numeral: 'IX', title: 'Choose your chapter', theme: 'parchment' },
]

export const chapter = (id: string) => CHAPTERS.find((c) => c.id === id)!

/**
 * Formality levels — Deliverable 3, differentiator III. Every trench, blazer, kurta and
 * fusion piece carries one, so "what counts as formal" is never a guess.
 */
export const FORMALITY = [
  { numeral: 'I', name: 'Office', note: 'The working day' },
  { numeral: 'II', name: 'Boardroom', note: 'Pitches, clients, the board' },
  { numeral: 'III', name: 'Evening', note: 'Dinners, galas, occasions' },
] as const

export type FormalityLevel = 0 | 1 | 2
