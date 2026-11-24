import { useId, useRef } from 'react'
import { motion, useReducedMotion, type Variants } from 'motion/react'
import TLink from '../../components/TLink'
import { BRAND } from '../../data/site'
import { gsap, SplitText, useGSAP, prefersReducedMotion } from '../../lib/motion'
import { usePageReady } from '../../hooks/useGo'
import Flat from './Flat'
import { SECTIONS } from './content'
import { EASE_LUX } from './motionPresets'
import './StylingHero.css'

const strip = (s: string) => s.replace(/[.\s]+$/, '')

/** The details called out on the drawing, in the trench flat's own 240 × 380 coordinates. */
const CALLOUTS = [
  { n: 1, x: 84, y: 80, label: 'Storm flap' },
  { n: 2, x: 90, y: 183, label: 'Belted waist' },
  { n: 3, x: 81, y: 240, label: 'Deep welt pockets' },
  { n: 4, x: 41, y: 231, label: 'Cuff straps' },
]

/** Rotating seal of type around the house numeral. */
function Seal() {
  const id = `sty-seal-${useId().replace(/[^\w-]/g, '')}`
  return (
    <svg className="sty-hero__seal" viewBox="0 0 120 120" aria-hidden focusable="false">
      <defs>
        <path id={`${id}-ring`} d="M60 60 m-46 0 a46 46 0 1 1 92 0 a46 46 0 1 1 -92 0" />
      </defs>
      <g className="sty-hero__seal-spin">
        <text>
          <textPath href={`#${id}-ring`} startOffset="0" textLength="286" lengthAdjust="spacing">
            {`${strip(BRAND.motto)} · ${strip(BRAND.tagline)} · `.toUpperCase()}
          </textPath>
        </text>
      </g>
      <circle cx="60" cy="60" r="31" fill="none" stroke="currentColor" strokeWidth="0.6" />
      <text x="60" y="71" textAnchor="middle" className="sty-hero__seal-num">
        I
      </text>
    </svg>
  )
}

/* — Hanger, dimension lines and numbered callouts (motion, gated on the page cover lifting).
     A negative cue means reduced motion: everything appears at once, nothing draws. — */
const draw: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: (d: number) => ({
    pathLength: 1,
    opacity: 1,
    transition: d < 0 ? { duration: 0 } : { pathLength: { duration: 1.4, delay: d, ease: EASE_LUX }, opacity: { duration: 0.2, delay: d } },
  }),
}
const pop: Variants = {
  hidden: { opacity: 0, scale: 0.6 },
  visible: (d: number) => ({ opacity: 1, scale: 1, transition: d < 0 ? { duration: 0 } : { duration: 0.8, delay: d, ease: EASE_LUX } }),
}
const fade: Variants = {
  hidden: { opacity: 0 },
  visible: (d: number) => ({ opacity: 1, transition: d < 0 ? { duration: 0 } : { duration: 0.9, delay: d, ease: EASE_LUX } }),
}

/** Hairline weight in the sheet's own units (the art box is drawn ~170–300 px wide). */
const HAIR = 0.85

function TrenchSheet({ ready }: { ready: boolean }) {
  const reduce = useReducedMotion()
  const state = ready ? 'visible' : 'hidden'
  const t = (d: number) => (reduce ? -1 : d)

  return (
    <div className="sty-hero__art">
      {/* the hanger hangs behind the coat, so the coat's wash covers its arms */}
      <motion.svg
        className="sty-hero__sheet sty-hero__sheet--back"
        viewBox="0 0 240 380"
        aria-hidden
        focusable="false"
        initial="hidden"
        animate={state}
      >
        <g fill="none" stroke="currentColor" strokeWidth={HAIR * 1.2} strokeLinecap="round" strokeLinejoin="round">
          <motion.path
            d="M120 18 L120 -6 C120 -12 114 -16 110 -22 C106 -28 110 -36 118 -36 C126 -36 130 -30 128 -24"
            variants={draw}
            custom={t(0.35)}
          />
          <motion.path d="M120 -4 L66 34 Q62 38 67 40 M120 -4 L174 34 Q178 38 173 40" variants={draw} custom={t(0.55)} />
        </g>
      </motion.svg>

      <Flat
        id="trench"
        className="sty-hero__trench"
        state={ready ? 'visible' : 'hidden'}
        delay={0.7}
        speed={1.3}
        weight={1.05}
        tint="var(--ivory-50)"
        label="Technical drawing of the Ivory Trench on a hanger: a belted, double-breasted cotton gabardine coat with storm flap, epaulettes, cuff straps and deep welt pockets."
      />

      <motion.svg
        className="sty-hero__sheet sty-hero__sheet--front"
        viewBox="0 0 240 380"
        aria-hidden
        focusable="false"
        initial="hidden"
        animate={state}
      >
        {/* length: shoulder to hem — cut to her measurements */}
        <g fill="none" stroke="currentColor" strokeWidth={HAIR} strokeLinecap="round">
          <motion.path d="M228 17 V364" variants={draw} custom={t(2.1)} />
          <motion.path d="M224 17 H232 M224 364 H232" variants={draw} custom={t(2.3)} />
          <motion.path d="M30 67 L16 251" variants={draw} custom={t(2.25)} />
          <motion.path d="M26 66.7 L34 67.3 M12 250.7 L20 251.3" variants={draw} custom={t(2.45)} />
        </g>
        {/* rotation lives on a plain <g>, so motion's CSS transform never fights the SVG attribute */}
        <g transform="translate(238 190) rotate(90)">
          <motion.text className="sty-hero__dim" textAnchor="middle" variants={fade} custom={t(2.6)}>
            Your length
          </motion.text>
        </g>
        <g transform="translate(15 159) rotate(-85.6)">
          <motion.text className="sty-hero__dim" textAnchor="middle" variants={fade} custom={t(2.7)}>
            Your sleeve
          </motion.text>
        </g>

        {CALLOUTS.map((c, i) => (
          <motion.g key={c.n} className="sty-hero__pin" variants={pop} custom={t(2.4 + i * 0.12)}>
            <circle cx={c.x} cy={c.y} r="7" />
            <text x={c.x} y={c.y + 2.6} textAnchor="middle">
              {c.n}
            </text>
          </motion.g>
        ))}
      </motion.svg>
    </div>
  )
}

export default function StylingHero() {
  const root = useRef<HTMLElement>(null)
  const ready = usePageReady()

  useGSAP(
    () => {
      const el = root.current
      if (!el) return
      const q = gsap.utils.selector(el)
      const word = q('.sty-hero__word')
      const intro = q('[data-intro]')
      const arch = q('.sty-hero__arch-inner')
      const archline = q('.sty-hero__archline')
      const seal = q('.sty-hero__seal')
      const rule = q('.sty-hero__rule')
      const art = q('.sty-hero__art')

      if (prefersReducedMotion()) {
        gsap.set([word, intro, arch, archline, seal], { autoAlpha: 1 })
        return
      }
      if (!ready) {
        // Hold everything under the transition cover until it lifts.
        gsap.set([word, intro, arch, archline, seal], { autoAlpha: 0 })
        return
      }

      gsap.set(word, { autoAlpha: 1 })
      const split = SplitText.create(word, {
        type: 'chars',
        charsClass: 'sty-hero__char',
        autoSplit: true,
        onSplit(self) {
          return gsap.from(self.chars, {
            yPercent: 58,
            rotate: 5,
            autoAlpha: 0,
            filter: 'blur(14px)',
            duration: 1.7,
            ease: 'lux',
            stagger: { each: 0.06, from: 'start' },
            delay: 0.08,
            clearProps: 'filter',
          })
        },
      })

      const tl = gsap.timeline({ defaults: { ease: 'lux' } })
      tl.fromTo(arch, { autoAlpha: 1, clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.9, ease: 'silk' }, 0.1)
        .fromTo(art, { scale: 1.06 }, { scale: 1, duration: 2.6 }, 0.1)
        .fromTo(archline, { autoAlpha: 0, scale: 0.94 }, { autoAlpha: 1, scale: 1, duration: 1.8 }, 0.75)
        .fromTo(seal, { autoAlpha: 0, rotate: -40, scale: 0.85 }, { autoAlpha: 1, rotate: 0, scale: 1, duration: 2 }, 0.9)
        .fromTo(rule, { scaleX: 0 }, { scaleX: 1, duration: 1.5, ease: 'silk' }, 0.45)
        .fromTo(intro, { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 1.25, stagger: 0.065 }, 0.5)

      // Scroll choreography: the word sinks, the arch rises — a slow parting of layers.
      // a fresh vars object per tween: ScrollTrigger keeps a reference to the one it is given
      const st = () => ({ trigger: el, start: 'top top', end: 'bottom top', scrub: true })
      gsap.to(word, { yPercent: 26, ease: 'none', scrollTrigger: st() })
      gsap.to(q('.sty-hero__figure'), { yPercent: -10, ease: 'none', scrollTrigger: st() })
      gsap.to(archline, { y: 40, ease: 'none', scrollTrigger: st() })

      // Pointer: the coat sways a breath on its hanger, against the cursor.
      const media = window.matchMedia('(hover: hover) and (pointer: fine)')
      if (!media.matches) return () => split.revert()
      const xTo = gsap.quickTo(art, 'xPercent', { duration: 1.6, ease: 'power3' })
      const rTo = gsap.quickTo(art, 'rotation', { duration: 1.8, ease: 'power3' })
      const onMove = (e: PointerEvent) => {
        const r = el.getBoundingClientRect()
        const nx = (e.clientX - r.left) / r.width - 0.5
        xTo(nx * -2.2)
        rTo(nx * -1.4)
      }
      el.addEventListener('pointermove', onMove)
      return () => {
        el.removeEventListener('pointermove', onMove)
        split.revert()
      }
    },
    // revertOnUpdate: when the cover comes down again (leaving the page) everything is put back cleanly.
    { scope: root, dependencies: [ready], revertOnUpdate: true },
  )

  return (
    <section ref={root} className="sty-hero" data-theme="ivory" aria-labelledby="sty-hero-title">
      <div className="container sty-hero__grid">
        <div className="sty-hero__meta" data-intro>
          <span className="numeral sty-hero__num">I</span>
          <span className="sty-hero__tick" aria-hidden />
          <span className="label">The styling notes</span>
        </div>
        <p className="sty-hero__meta-r" data-intro>
          <span className="label-sm">The consultation campaign</span>
          <span className="sty-hero__meta-note">Self-styling &amp; the Premium Wardrobe Consultation</span>
        </p>

        <h1 id="sty-hero-title" className="sty-hero__title">
          <span className="sty-hero__word" style={{ visibility: 'hidden' }}>
            Styling
          </span>
          <span className="sty-hero__sub" data-intro>
            <span className="sr-only">: </span>Dress the woman <span className="sty-hero__sub-em">you’re becoming</span>
          </span>
        </h1>

        <figure className="sty-hero__figure">
          <span className="sty-hero__archline" aria-hidden />
          <div className="sty-hero__arch">
            <div className="sty-hero__arch-inner sty-twill">
              <TrenchSheet ready={ready} />
            </div>
          </div>
          <Seal />
          <figcaption className="sty-hero__cap" data-intro>
            <span className="sty-hero__cap-head">
              <span className="numeral">Fig. i</span>
              <span className="label-sm">The Ivory Trench — cotton gabardine</span>
            </span>
            <ol className="sty-hero__legend">
              {CALLOUTS.map((c) => (
                <li key={c.n}>
                  <span className="numeral" aria-hidden>
                    {c.n}
                  </span>
                  {c.label}
                </li>
              ))}
            </ol>
          </figcaption>
        </figure>

        <div className="sty-hero__intro">
          <span className="sty-hero__rule" aria-hidden />
          <p className="lead sty-hero__lead" data-intro>
            Power is rarely loud. It lives in a sharp collar, a clean seam, a colour chosen on purpose.
          </p>
          <p className="body sty-hero__body" data-intro>
            These are the notes our stylists give every client of the Premium Wardrobe Consultation — how to wear one trench
            three ways, read the formality of a room and choose your colours — so you can dress with intent on your own, and
            know exactly when to call us in.
          </p>
        </div>

        <nav className="sty-hero__index" aria-label="On this page">
          <p className="label-sm sty-hero__index-label" data-intro>
            In these notes
          </p>
          <ol>
            {SECTIONS.map((s) => (
              <li key={s.id} data-intro>
                <TLink to={`/styling#${s.id}`} cursor="Read">
                  <span className="numeral">{s.n}</span>
                  <span className="sty-hero__index-title">{s.title}</span>
                  <svg className="sty-hero__index-arrow" viewBox="0 0 28 10" aria-hidden focusable="false">
                    <path d="M0 5h26M22 1l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1" />
                  </svg>
                </TLink>
              </li>
            ))}
          </ol>
        </nav>
      </div>

      <div className="sty-hero__scroll" aria-hidden data-intro>
        <span className="label-sm">Scroll</span>
        <span className="sty-hero__scroll-line" />
      </div>
    </section>
  )
}
