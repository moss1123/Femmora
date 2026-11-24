import { useId, useRef, type CSSProperties } from 'react'
import { motion, useInView, useReducedMotion } from 'motion/react'
import { usePageReady } from '../../hooks/useGo'
import { HUES, PALETTE_CARD, type HueKey } from './content'
import { EASE_LUX } from './motionPresets'

/** One brush-stroke silhouette per row, so the card reads as painted by hand rather than generated. */
const STROKES = [
  { body: 'M14 24 C 62 13, 128 31, 196 19 S 268 27, 284 21', tail: 'M262 22 C 276 20, 290 24, 300 22', w: 24 },
  { body: 'M18 21 C 74 29, 132 12, 204 22 S 262 15, 280 20', tail: 'M256 19 C 274 21, 288 17, 298 19', w: 22 },
  { body: 'M12 22 C 58 16, 140 28, 210 20 S 270 24, 286 22', tail: 'M266 23 C 280 22, 292 25, 302 23', w: 25 },
  { body: 'M16 20 C 70 26, 120 15, 190 23 S 258 18, 278 22', tail: 'M252 21 C 270 23, 284 19, 296 21', w: 23 },
  { body: 'M13 23 C 66 15, 136 27, 200 19 S 266 25, 282 20', tail: 'M260 21 C 274 19, 290 23, 300 21', w: 24 },
]

/** thin dry-brush streaks laid along each stroke (offsets from its centre line) */
const STREAKS = [-6.5, -2, 3.5, 7]

const GOLD = ['#8a6a2f', '#c9a55c', '#f1dfb2', '#c9a55c', '#9c7a3c']

/** The painted palette card a client takes home from the colour analysis — five strokes, five roles. */
export default function PaletteCard({ className = '' }: { className?: string }) {
  const uid = useId().replace(/[^\w-]/g, '')
  const brush = `sty-brush-${uid}`
  const gold = `sty-gold-${uid}`
  const ref = useRef<HTMLDivElement>(null)
  const ready = usePageReady()
  const inView = useInView(ref, { once: true, amount: 0.35 })
  const reduce = useReducedMotion()
  const show = ready && inView

  const paint = (key: HueKey): CSSProperties => ({ stroke: key === 'gold' ? `url(#${gold})` : HUES[key].css })

  return (
    <div ref={ref} className={`sty-pcard ${show ? 'is-in' : ''} ${className}`}>
      <span className="sty-pcard__frame" aria-hidden />
      <div className="sty-pcard__bar">
        <span className="label-sm">Femmora — your palette</span>
        <span className="label-sm sty-pcard__kind">Colour analysis</span>
      </div>

      {/* shared paint: a displacement filter roughens every edge like bristles on cotton paper */}
      <svg className="sty-pcard__defs" width="0" height="0" aria-hidden focusable="false">
        <defs>
          <filter id={brush} x="-4%" y="-40%" width="108%" height="180%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.035 0.75" numOctaves="2" seed="7" result="grain" />
            <feDisplacementMap in="SourceGraphic" in2="grain" scale="6" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <linearGradient id={gold} x1="0" y1="0" x2="1" y2="0.15">
            {GOLD.map((c, i) => (
              <stop key={i} offset={`${(i / (GOLD.length - 1)) * 100}%`} style={{ stopColor: c }} />
            ))}
          </linearGradient>
        </defs>
      </svg>

      <ol className="sty-pcard__list">
        {PALETTE_CARD.map((row, i) => {
          const s = STROKES[i % STROKES.length]
          const hue = HUES[row.hue]
          const delay = reduce ? 0 : 0.25 + i * 0.22
          const dur = reduce ? 0 : 1.15
          const stroke = paint(row.hue)
          return (
            <li key={row.hue} className="sty-pcard__row">
              <svg className="sty-pcard__stroke" viewBox="0 0 312 44" aria-hidden focusable="false">
                <g filter={`url(#${brush})`} fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <motion.path
                    d={s.body}
                    style={stroke}
                    strokeWidth={s.w}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={show ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
                    transition={{ pathLength: { duration: dur, delay, ease: EASE_LUX }, opacity: { duration: dur ? 0.15 : 0, delay } }}
                  />
                  <motion.path
                    d={s.tail}
                    style={stroke}
                    strokeWidth={s.w * 0.42}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={show ? { pathLength: 1, opacity: 0.85 } : { pathLength: 0, opacity: 0 }}
                    transition={{ pathLength: { duration: dur * 0.4, delay: delay + dur * 0.78, ease: EASE_LUX }, opacity: { duration: 0, delay: delay + dur * 0.78 } }}
                  />
                  {STREAKS.map((off, k) => (
                    // the offset lives on a plain <g>, so motion never touches an SVG transform attribute
                    <g key={k} transform={`translate(${k * 3} ${off})`}>
                      <motion.path
                        d={s.body}
                        className={`sty-pcard__streak sty-pcard__streak--${hue.ink}`}
                        strokeWidth={k % 2 ? 0.9 : 1.4}
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: show ? 0.62 + k * 0.08 : 0 }}
                        transition={{ duration: dur, delay: delay + 0.06 * k, ease: EASE_LUX }}
                      />
                    </g>
                  ))}
                </g>
              </svg>
              <span className="sty-pcard__role">
                <span className="label-sm">{row.role}</span>
                <span className="sty-pcard__hue">{hue.name}</span>
              </span>
            </li>
          )
        })}
      </ol>

      <div className="sty-pcard__foot">
        <span className="numeral sty-pcard__ratio">70 · 25 · 5</span>
        <span className="sty-pcard__note">Kept on file with your measurements, so every new piece is chosen from it.</span>
      </div>
    </div>
  )
}
