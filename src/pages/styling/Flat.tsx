import { useLayoutEffect, useRef, useState, type CSSProperties, type RefObject } from 'react'
import { motion, useReducedMotion, type Variants } from 'motion/react'
import { FLATS, type FlatId } from './flats'
import { EASE_LUX, EASE_SILK } from './motionPresets'

interface Cue {
  delay: number
  dur: number
}

const lineVariants: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: ({ delay, dur }: Cue) => ({
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: dur, delay, ease: EASE_LUX },
      opacity: { duration: dur ? 0.2 : 0, delay },
    },
  }),
  exit: ({ dur }: Cue) => ({
    pathLength: 0,
    opacity: 0,
    transition: {
      pathLength: { duration: dur ? 0.5 : 0, ease: EASE_SILK },
      opacity: { duration: dur ? 0.2 : 0, delay: dur ? 0.32 : 0 },
    },
  }),
}

const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: ({ delay, dur }: Cue) => ({ opacity: 1, transition: { duration: dur ? 0.8 : 0, delay, ease: EASE_LUX } }),
  exit: ({ dur }: Cue) => ({ opacity: 0, transition: { duration: dur ? 0.25 : 0 } }),
}

/** The colour wash soaks in slowly once the outline has begun to draw — like dye taking to cloth. */
const washVariants: Variants = {
  hidden: { opacity: 0 },
  visible: ({ delay, dur }: Cue) => ({ opacity: 1, transition: { duration: dur ? 1.1 : 0, delay: dur ? delay + 0.45 : 0, ease: EASE_LUX } }),
  exit: ({ dur }: Cue) => ({ opacity: 0, transition: { duration: dur ? 0.3 : 0, ease: EASE_SILK } }),
}

/** Keeps the line a true hairline (in screen px) whatever size the flat is drawn at. */
function useHairline(ref: RefObject<SVGSVGElement | null>, vbW: number, vbH: number, weight: number) {
  const [stroke, setStroke] = useState(weight)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      if (!width || !height) return
      const scale = Math.min(width / vbW, height / vbH)
      setStroke(Math.round((weight / scale) * 1000) / 1000)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref, vbW, vbH, weight])
  return stroke
}

export interface FlatProps {
  id: FlatId
  className?: string
  style?: CSSProperties
  /** on-screen stroke width in px */
  weight?: number
  /** seconds before the first line starts drawing */
  delay?: number
  /** seconds each line takes to draw */
  speed?: number
  /** drive the flat directly. Omit to inherit variants ("hidden" | "visible" | "exit") from a motion parent. */
  state?: 'hidden' | 'visible'
  /** accessible name; when omitted the drawing is decorative */
  label?: string
  /** fabric colour washed into the silhouette (only flats that define a `fill`) */
  tint?: string
  /** line colour override (defaults to the theme accent) */
  ink?: string
}

/** A gold hairline technical flat that draws itself on. */
export default function Flat({ id, className = '', style, weight = 1.1, delay = 0, speed = 1.25, state, label, tint, ink }: FlatProps) {
  const def = FLATS[id]
  const [vbW, vbH] = def.vb
  const ref = useRef<SVGSVGElement>(null)
  const stroke = useHairline(ref, vbW, vbH, weight)
  const reduce = useReducedMotion()
  const dur = reduce ? 0 : speed
  const cue = (i: number): Cue => ({ delay: reduce ? 0 : delay + i * 0.07, dur })
  const lastLine = def.lines.length

  const driven = state ? { initial: 'hidden' as const, animate: state, exit: 'exit' as const } : {}

  return (
    <motion.svg
      ref={ref}
      viewBox={`0 0 ${vbW} ${vbH}`}
      className={`sty-flat ${className}`}
      style={ink ? { ...style, color: ink } : style}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      {...driven}
    >
      {tint && def.fill && (
        // fill via style, not the attribute: tints are often CSS custom properties, and var() is not reliable in SVG presentation attributes
        <motion.path d={def.fill} style={{ fill: tint }} stroke="none" className="sty-flat__wash" variants={washVariants} custom={cue(0)} />
      )}
      <g fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
        {def.lines.map((d, i) => (
          <motion.path key={i} d={d} variants={lineVariants} custom={cue(i)} />
        ))}
        {def.details?.map((d, i) => (
          <motion.path
            key={`d${i}`}
            d={d}
            className="sty-flat__detail"
            strokeWidth={stroke * 0.8}
            strokeDasharray={`${stroke * 2.6} ${stroke * 3.2}`}
            variants={fadeVariants}
            custom={cue(lastLine + i)}
          />
        ))}
      </g>
      {def.dots?.map(([cx, cy, r], i) => (
        <motion.circle
          key={`o${i}`}
          cx={cx}
          cy={cy}
          r={r}
          fill="currentColor"
          variants={fadeVariants}
          custom={cue(lastLine + i * 0.5)}
        />
      ))}
    </motion.svg>
  )
}
