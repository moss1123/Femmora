import { useRef, type CSSProperties } from 'react'
import { motion } from 'motion/react'
import GarmentFlat from './GarmentFlat'
import TLink from '../../components/TLink'
import { gsap, SplitText, useGSAP, prefersReducedMotion } from '../../lib/motion'
import { usePageReady } from '../../hooks/useGo'
import { formatPKR } from '../../store/cart'
import { BRAND, pageById } from '../../data/site'
import { FORMALITY_LEVELS, MTM_COUNT, PRICE_FROM, PRODUCTS, productById } from '../../data/products'
import './CollectionHero.css'

const EASE = [0.22, 1, 0.36, 1] as const
const pad = (n: number) => String(n).padStart(2, '0')

const FACTS = [
  { k: 'Pieces', v: pad(PRODUCTS.length), note: 'one interchangeable chapter' },
  { k: 'Formality levels', v: pad(FORMALITY_LEVELS.length), note: 'from smart casual to formal' },
  { k: 'Made to measure', v: pad(MTM_COUNT), note: 'pieces — measurements kept on file' },
]

/* The three trenches of the home rack, hung again on this page's rail — Burgundy in front. */
const TRIO = [
  { id: 'camel-trench', pos: 'l', delay: 0.35 },
  { id: 'burgundy-trench', pos: 'c', delay: 0 },
  { id: 'ivory-trench', pos: 'r', delay: 0.5 },
] as const

const FLAGSHIP = BRAND.stores[0]
const HERO = pageById('collection')

/**
 * "Beyond the Silhouette — Chapter One". Background is exactly the 3D flood colour (#2a0a12) so
 * the hand-off from the rack's Burgundy Trench is seamless; nothing draws until the cover lifts.
 */
export default function CollectionHero() {
  const root = useRef<HTMLElement>(null)
  const ready = usePageReady()

  // Title: masked character rise, then the chapter line by words.
  useGSAP(
    () => {
      const el = root.current
      if (!el) return
      const l0 = el.querySelector<HTMLElement>('.col-hero__l0')
      const l1 = el.querySelector<HTMLElement>('.col-hero__l1')
      const l2 = el.querySelector<HTMLElement>('.col-hero__l2')
      const rule = el.querySelector<HTMLElement>('.col-hero__rule')
      if (!l0 || !l1 || !l2 || !rule) return
      if (prefersReducedMotion()) {
        gsap.set([l0, l1, l2], { autoAlpha: 1 })
        gsap.set(rule, { scaleX: 1 })
        return
      }
      if (!ready) {
        gsap.set([l0, l1, l2], { autoAlpha: 0 })
        gsap.set(rule, { scaleX: 0 })
        return
      }
      gsap.set([l0, l1, l2], { autoAlpha: 1 })
      const s0 = SplitText.create(l0, {
        type: 'lines,words',
        mask: 'lines',
        linesClass: 'col-hero__mask',
        autoSplit: true,
        onSplit: (self) => gsap.from(self.words, { yPercent: 110, duration: 1.2, ease: 'lux', stagger: 0.08, delay: 0.05 }),
      })
      const s1 = SplitText.create(l1, {
        type: 'lines,chars',
        mask: 'lines',
        linesClass: 'col-hero__mask',
        autoSplit: true,
        onSplit: (self) =>
          gsap.from(self.chars, { yPercent: 118, rotate: 6, duration: 1.5, ease: 'lux', stagger: 0.04, delay: 0.2 }),
      })
      const s2 = SplitText.create(l2, {
        type: 'lines,words',
        mask: 'lines',
        linesClass: 'col-hero__mask',
        autoSplit: true,
        onSplit: (self) => gsap.from(self.words, { yPercent: 110, duration: 1.3, ease: 'lux', stagger: 0.09, delay: 0.7 }),
      })
      gsap.fromTo(rule, { scaleX: 0 }, { scaleX: 1, duration: 1.8, ease: 'silk', delay: 0.4 })
      return () => {
        s0.revert()
        s1.revert()
        s2.revert()
      }
    },
    { scope: root, dependencies: [ready] },
  )

  // Scroll choreography: the title lifts away, the coats drift and turn, the numeral sinks.
  useGSAP(
    () => {
      const el = root.current
      if (!el || !ready) return
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const st = { trigger: el, start: 'top top', end: 'bottom top', scrub: true }
        gsap.to('.col-hero__title', { yPercent: -22, ease: 'none', scrollTrigger: st })
        gsap.to('.col-hero__drift', { y: 120, rotate: 2.5, ease: 'none', scrollTrigger: st })
        gsap.to('.col-hero__numeral-drift', { yPercent: 18, ease: 'none', scrollTrigger: st })
        gsap.to('.col-hero__foot', { y: -40, autoAlpha: 0.2, ease: 'none', scrollTrigger: { ...st, start: 'center center' } })
      })
      return () => mm.revert()
    },
    { scope: root, dependencies: [ready] },
  )

  const show = (delay: number, y = 18) => ({
    initial: { opacity: 0, y },
    animate: ready ? { opacity: 1, y: 0 } : { opacity: 0, y },
    transition: { duration: 1.2, delay, ease: EASE },
  })

  return (
    <section ref={root} className="col-hero" data-theme="wine" aria-labelledby="col-hero-title">
      <motion.span className="col-hero__numeral" aria-hidden {...show(0.9, 0)}>
        <span className="col-hero__numeral-drift">II</span>
      </motion.span>

      {/* the rack rail the trenches hang from */}
      <span className="col-hero__rail" aria-hidden>
        <span className="col-hero__rule" />
      </span>

      <motion.div className="col-hero__rack" aria-hidden {...show(0.5, -24)}>
        <div className="col-hero__drift">
          {TRIO.map((t) => {
            const p = productById(t.id)
            if (!p) return null
            return (
              <div
                key={t.id}
                className={`col-hero__coat col-hero__coat--${t.pos}`}
                style={{ '--gf-delay': `${t.delay}s` } as CSSProperties}
              >
                <div className="col-hero__sway">
                  <GarmentFlat kind={p.garment} colour={p.colours[0].hex} texture={p.texture} draw={ready} />
                </div>
              </div>
            )
          })}
          <p className="col-hero__piece-cap label-sm">
            <span className="numeral">No. 01</span> {HERO.garment}
          </p>
        </div>
      </motion.div>

      <div className="container col-hero__inner">
        <motion.div className="col-hero__top" {...show(0.15)}>
          <div className="col-hero__eyebrow">
            <span className="numeral">II</span>
            <span className="col-hero__eyebrow-line" />
            <span className="label">The Collection</span>
          </div>
          <p className="label-sm col-hero__season">
            Chapter One · {FLAGSHIP.place}, {FLAGSHIP.city} — {FLAGSHIP.when}
          </p>
        </motion.div>

        <h1 id="col-hero-title" className="col-hero__title">
          <span className="col-hero__l0">Beyond the</span>
          <span className="col-hero__l1">Silhouette</span>
          <span className="col-hero__l2">
            <span className="col-hero__dash">—</span> Chapter <span className="gold-text">One</span>
          </span>
        </h1>

        <div className="col-hero__foot">
          <motion.p className="lead col-hero__lead" {...show(0.85)}>
            Formal workwear for the rooms where decisions are made: trench coats, tailoring and cable knits in the
            equestrian, old-money tradition — with structured kurtas and fusion alongside. Every piece carries a clear
            formality level.
          </motion.p>

          <motion.dl className="col-hero__facts" {...show(1)}>
            {FACTS.map((f) => (
              <div key={f.k} className="col-hero__fact">
                <dt className="label-sm">{f.k}</dt>
                <dd>
                  <span className="numeral col-hero__fact-v">{f.v}</span>
                  <span className="col-hero__fact-note">{f.note}</span>
                </dd>
              </div>
            ))}
            <div className="col-hero__fact">
              <dt className="label-sm">From</dt>
              <dd>
                <span className="numeral col-hero__fact-v col-hero__fact-v--price">{formatPKR(PRICE_FROM)}</span>
                <span className="col-hero__fact-note">per piece · Core ready-to-wear</span>
              </dd>
            </div>
          </motion.dl>
        </div>
      </div>

      <motion.div className="col-hero__cue" {...show(1.3, 0)}>
        <TLink to="/collection#collection-grid" cursor="Scroll">
          <span className="label-sm">The pieces</span>
          <span className="col-hero__cue-line" aria-hidden />
        </TLink>
      </motion.div>
    </section>
  )
}
