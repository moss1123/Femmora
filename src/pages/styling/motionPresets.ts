import type { Transition } from 'motion/react'

/** House curves, mirrored from the CSS tokens --ease-lux / --ease-silk. */
export const EASE_LUX = [0.22, 1, 0.36, 1] as const
export const EASE_SILK = [0.65, 0, 0.35, 1] as const

/** Critically damped springs: silky, settled, never bouncy. */
export const SILK: Transition = { type: 'spring', visualDuration: 0.7, bounce: 0 }
export const GLIDE: Transition = { type: 'spring', visualDuration: 1.05, bounce: 0 }
export const SNAP: Transition = { type: 'spring', visualDuration: 0.42, bounce: 0 }

/** Staggered fade-rise used for panels whose content swaps. */
export const panelVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.85, delay: 0.05 + i * 0.06, ease: EASE_LUX },
  }),
  exit: { opacity: 0, y: -10, transition: { duration: 0.32, ease: EASE_SILK } },
}

export const pad2 = (n: number) => String(Math.max(0, Math.round(n))).padStart(2, '0')
