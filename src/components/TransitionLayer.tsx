import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { useTransition } from '../store/transition'
import { resetScroll, ScrollTrigger } from '../lib/motion'
import './TransitionLayer.css'

const EASE = [0.76, 0, 0.24, 1] as const

/**
 * Full-screen cover used for every route change.
 *  flood   – the garment's fabric colour blooms from the centre (WebGL → page hand-off)
 *  curtain – a navy curtain with a gold hairline rises, names the destination, then lifts away
 */
export default function TransitionLayer() {
  const navigate = useNavigate()
  const cover = useTransition((s) => s.cover)
  const pending = useTransition((s) => s.pending)
  const timer = useRef<number | undefined>(undefined)
  const coveredFor = useRef<string | null>(null)

  const onCovered = () => {
    const { pending: path } = useTransition.getState()
    if (!path) return
    const [p, hash] = path.split('#')
    navigate(p || '/')
    resetScroll()
    window.clearTimeout(timer.current)
    // Let the new route mount + measure, then lift the cover.
    timer.current = window.setTimeout(() => {
      ScrollTrigger.refresh()
      if (hash) {
        const el = document.getElementById(hash)
        if (el) el.scrollIntoView()
      }
      useTransition.getState().coverDone()
    }, cover.mode === 'flood' ? 520 : 420)
  }

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const isLight = isLightColor(cover.color)

  return (
    <AnimatePresence
      mode="wait"
      onExitComplete={() => {
        coveredFor.current = null
        useTransition.getState().revealed()
      }}
    >
      {cover.visible && pending !== null && (
        <motion.div
          key={cover.mode + pending}
          className={`tl tl--${cover.mode} ${isLight ? 'tl--light' : 'tl--dark'}`}
          style={{ backgroundColor: cover.color }}
          initial={cover.mode === 'flood' ? { clipPath: 'circle(0% at 50% 46%)', opacity: 0.6 } : { clipPath: 'inset(100% 0% 0% 0%)' }}
          animate={cover.mode === 'flood' ? { clipPath: 'circle(150% at 50% 46%)', opacity: 1 } : { clipPath: 'inset(0% 0% 0% 0%)' }}
          exit={cover.mode === 'flood' ? { opacity: 0 } : { clipPath: 'inset(0% 0% 100% 0%)' }}
          transition={{ duration: cover.mode === 'flood' ? 0.75 : 0.85, ease: EASE }}
          onAnimationComplete={() => {
            // fires for enter and exit — act only once, on enter, while the cover is meant to be down
            const s = useTransition.getState()
            if (s.cover.visible && s.pending && coveredFor.current !== s.pending) {
              coveredFor.current = s.pending
              onCovered()
            }
          }}
          aria-hidden
        >
          <div className="tl__inner">
            <motion.span
              className="tl__rule"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.9, delay: 0.15, ease: EASE }}
            />
            {cover.numeral ? (
              <motion.span
                className="tl__numeral label"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.25, ease: EASE }}
              >
                {cover.numeral}
              </motion.span>
            ) : null}
            {cover.label ? (
              <motion.span
                className="tl__label"
                initial={{ opacity: 0, y: '0.6em', filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
              >
                {cover.label}
              </motion.span>
            ) : null}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function isLightColor(hex: string) {
  const h = hex.replace('#', '')
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16)
  const r = (n >> 16) & 255,
    g = (n >> 8) & 255,
    b = n & 255
  return (r * 299 + g * 587 + b * 114) / 1000 > 150
}
