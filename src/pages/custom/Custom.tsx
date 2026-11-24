import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { MotionConfig } from 'motion/react'
import { ScrollTrigger, getLenis, scrollToTarget } from '../../lib/motion'
import { usePageReady } from '../../hooks/useGo'
import Marquee from '../../components/Marquee'
import Hero from './Hero'
import Tiers from './Tiers'
import Process from './Process'
import FitProfile from './FitProfile'
import Organisations from './Organisations'
import Booking from './Booking'
import Circle from './Circle'
import Faq from './Faq'
import type { BookingPreset, ServiceId } from './data'
import './Custom.css'

/* An even count, always: the band alternates wine / gold by nth-child, and the Marquee repeats the list once — with an
   odd count the copy would start on the other colour and every phrase would flip colour at the loop seam. */
const BAND = ['Made to measure', 'Made to lead', 'Beyond the Silhouette', 'Power in every detail', 'Kept on file', 'A wardrobe for every chapter']

const PROGRAMME_NOTE =
  'Programme outline requested — please send the “Dress for the Position You Hold” outline and group pricing for our organisation.'

/**
 * III · Custom Services — Made-to-Measure, the Premium Wardrobe Consultation, corporate programmes and the Femmora Circle.
 * Hero background is var(--parchment) (#e8dcc2) so the Camel Trench's flood colour hands off seamlessly.
 */
export default function Custom() {
  const root = useRef<HTMLDivElement>(null)
  const [preset, setPreset] = useState<BookingPreset | null>(null)
  const { hash } = useLocation()
  const ready = usePageReady()

  /** Any "Book" button on the page: optionally preselect a service / pre-fill notes, then glide to the form. */
  const book = useCallback((service?: ServiceId, note?: string) => {
    if (service) setPreset({ service, note, nonce: Date.now() })
    scrollToTarget('#book', 0)
  }, [])

  // Deep links (/custom#book). The transition layer normally lands us there behind the cover; this covers fresh loads.
  useEffect(() => {
    if (!ready || !hash) return
    const t = window.setTimeout(() => {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)))
      if (!el || Math.abs(el.getBoundingClientRect().top) <= 120) return
      const lenis = getLenis()
      if (lenis) lenis.scrollTo(el, { immediate: true, force: true })
      else el.scrollIntoView()
      ScrollTrigger.update()
    }, 380)
    return () => window.clearTimeout(t)
  }, [ready, hash])

  // Accordions, form steps and validation messages change the page height — keep ScrollTrigger positions honest.
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
    // reducedMotion="user": every motion/react transform on this page (Reveal rises, step slides, layout moves) is
    // dropped for visitors who ask for reduced motion; opacity fades remain.
    <MotionConfig reducedMotion="user">
      <div ref={root} className="page cus" data-theme="parchment">
        <Hero onBook={() => book('mtm')} />
        <Tiers onBook={(s) => book(s)} />

        <div className="cus-band" data-theme="parchment">
          <hr className="rule-gold" />
          <Marquee items={BAND} speed={34} className="cus-band__mq" />
          <hr className="rule-gold" />
        </div>

        <Process />
        <FitProfile onUse={(note) => book('mtm', note)} />
        <Organisations onRequest={() => book('corporate', PROGRAMME_NOTE)} />
        <Booking preset={preset} />
        <Circle onBegin={() => book('mtm')} />
        {/* "Book a fitting" — a Made-to-Measure fitting, like every other fitting button on the page */}
        <Faq onBook={() => book('mtm')} />
      </div>
    </MotionConfig>
  )
}
