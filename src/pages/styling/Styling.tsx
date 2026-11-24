import { useEffect, useRef } from 'react'
import { MotionConfig } from 'motion/react'
import { ScrollTrigger } from '../../lib/motion'
import StylingHero from './StylingHero'
import ThreeWays from './ThreeWays'
import Occasions from './Occasions'
import Colour from './Colour'
import Capsule from './Capsule'
import Rules from './Rules'
import StylingCTA from './StylingCTA'
import './Styling.css'

/**
 * I — Styling. The "Dress the Woman You're Becoming" consultation campaign, and the self-styling
 * notes our stylists give every client. House look: burgundy + gold on ivory.
 * Theme rhythm: ivory hero (#f3ede2 = the Ivory Trench's flood colour) → wine → ivory → noir → ivory → wine → parchment.
 * No photography anywhere: every visual is a gold-hairline flat, a painted swatch or a woven CSS texture.
 */
export default function Styling() {
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const prev = document.title
    document.title = 'Styling — Dress the woman you’re becoming · Femmora'
    return () => {
      document.title = prev
    }
  }, [])

  // Tabs, the capsule and the colour stories change the page height — keep ScrollTrigger positions honest.
  useEffect(() => {
    const el = root.current
    if (!el || typeof ResizeObserver === 'undefined') return
    let last = el.offsetHeight
    let t: number | undefined
    const ro = new ResizeObserver(() => {
      const h = el.offsetHeight
      if (Math.abs(h - last) < 2) return
      last = h
      window.clearTimeout(t)
      t = window.setTimeout(() => ScrollTrigger.refresh(), 260)
    })
    ro.observe(el)
    return () => {
      ro.disconnect()
      window.clearTimeout(t)
    }
  }, [])

  return (
    // reducedMotion="user": motion skips transform and layout animation for visitors who ask for less movement
    <MotionConfig reducedMotion="user">
      <div ref={root} className="page sty" data-theme="ivory">
        <StylingHero />
        <ThreeWays />
        <Occasions />
        <Colour />
        <Capsule />
        <Rules />
        <StylingCTA />
      </div>
    </MotionConfig>
  )
}
