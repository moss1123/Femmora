import { useState, type CSSProperties } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { EASE_SILK } from './motionPresets'

const FROM = {
  right: 'inset(0% 100% 0% 0%)',
  left: 'inset(0% 0% 0% 100%)',
  up: 'inset(100% 0% 0% 0%)',
  down: 'inset(0% 0% 100% 0%)',
} as const

/**
 * A block of colour that changes like ink drawn across paper: the new colour
 * wipes over the old one with a clip-path, so only clip-path is ever animated.
 */
export default function InkWipe({
  colour,
  className = '',
  style,
  delay = 0,
  duration = 0.95,
  from = 'right',
}: {
  colour: string
  className?: string
  style?: CSSProperties
  delay?: number
  duration?: number
  from?: keyof typeof FROM
}) {
  const reduce = useReducedMotion()
  // Derived state from the previous render: what was showing becomes the layer underneath.
  const [layers, setLayers] = useState({ under: colour, over: colour, n: 0 })
  if (layers.over !== colour) setLayers({ under: layers.over, over: colour, n: layers.n + 1 })

  return (
    <span className={`sty-ink ${className}`} style={style} aria-hidden>
      <span className="sty-ink__layer" style={{ background: layers.under }} />
      <motion.span
        key={layers.n}
        className="sty-ink__layer"
        style={{ background: layers.over }}
        initial={layers.n === 0 ? false : { clipPath: FROM[from] }}
        animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
        transition={{ duration: reduce ? 0 : duration, delay: reduce ? 0 : delay, ease: EASE_SILK }}
      />
    </span>
  )
}
