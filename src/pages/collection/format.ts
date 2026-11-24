/* Small formatting helpers shared by the Collection page (prefix col-). */

export const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']

const WORDS = [
  'zero',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
  'eleven',
  'twelve',
  'thirteen',
  'fourteen',
  'fifteen',
  'sixteen',
  'seventeen',
  'eighteen',
  'nineteen',
  'twenty',
]

/** 16 → "sixteen" (falls back to digits past twenty). */
export const word = (n: number) => WORDS[n] ?? String(n)
export const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
/** 4 → "04" */
export const pad = (n: number) => String(n).padStart(2, '0')

export const EASE = [0.22, 1, 0.36, 1] as const
export const EASE_IN = [0.55, 0, 1, 0.45] as const
