import { useRef } from 'react'
import { gsap, useGSAP, prefersReducedMotion, scrollToTarget } from '../../lib/motion'
import { usePageReady } from '../../hooks/useGo'
import { Eyebrow } from '../../components/Reveal'
import Button from '../../components/Button'
import { BRAND, TIERS } from '../../data/site'
import { TIER_DETAILS } from './data'
import TrenchSpec from './TrenchSpec'
import './Hero.css'

/** Centre-line of the tape (viewBox 0 0 1600 320). 10 units = 1 cm. */
const TAPE = 'M-60,214 C170,258 380,118 640,148 C900,178 1010,268 1230,232 C1330,216 1380,170 1430,158'
const LABELS = Array.from({ length: 15 }, (_, i) => (i + 1) * 100)
const CASE_R = 34

const FLAGSHIP = BRAND.stores[0]
const MTM = TIERS.find((t) => t.id === 'mtm')

function Word({ children, gold = false }: { children: string; gold?: boolean }) {
  return (
    <span className="cus-hero__w">
      <span className={gold ? 'cus-hero__gold' : undefined}>{children}</span>
    </span>
  )
}

export default function Hero({ onBook }: { onBook: () => void }) {
  const root = useRef<HTMLElement>(null)
  const ready = usePageReady()

  /* Intro choreography — waits for the transition cover to lift. */
  useGSAP(
    () => {
      const el = root.current
      if (!el) return
      const q = gsap.utils.selector(el)
      const reveal = el.querySelector<SVGPathElement>('.cus-tape__reveal')
      const centre = el.querySelector<SVGPathElement>('.cus-tape__centre')
      const tapeCase = el.querySelector<SVGGElement>('.cus-tape__case')
      const caseIn = el.querySelector<SVGGElement>('.cus-tape__case-in')
      if (!reveal || !centre || !tapeCase || !caseIn) return
      const L = centre.getTotalLength()

      const placeCase = (t: number) => {
        const d = t * L
        const p = centre.getPointAtLength(d)
        const roll = ((d / CASE_R) * 180) / Math.PI
        tapeCase.setAttribute('transform', `translate(${p.x.toFixed(2)} ${p.y.toFixed(2)}) rotate(${roll.toFixed(2)})`)
      }

      if (prefersReducedMotion()) {
        placeCase(1)
        gsap.set(caseIn, { autoAlpha: 1 })
        return
      }

      const words = q('.cus-hero__w > span')
      const intro = [q('.cus-hero__top > *'), q('.cus-hero__foot > *')]
      const lines = gsap.utils.toArray<SVGPathElement>('.cus-coat__draw', el)
      const coatSoft = q('.cus-coat__fills, .cus-coat__soft, .cus-hero__coat-cap > *')

      gsap.set(reveal, { strokeDasharray: L + 4, strokeDashoffset: L + 4 })
      lines.forEach((p) => {
        const len = p.getTotalLength() + 2
        gsap.set(p, { strokeDasharray: len, strokeDashoffset: len })
      })
      placeCase(0)

      if (!ready) {
        gsap.set(words, { yPercent: 118 })
        gsap.set([...intro, caseIn, coatSoft], { autoAlpha: 0 })
        return
      }

      const roll = { t: 0 }
      const tl = gsap.timeline({ defaults: { ease: 'lux' } })
      tl.fromTo(intro[0], { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.1 }, 0.05)
        .fromTo(words, { yPercent: 118, rotate: 4 }, { yPercent: 0, rotate: 0, duration: 1.35, stagger: 0.075 }, 0.15)
        .to(lines, { strokeDashoffset: 0, duration: 2.1, ease: 'silk', stagger: 0.03 }, 0.3)
        .fromTo(q('.cus-coat__fills'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.4 }, 1.05)
        .fromTo(q('.cus-coat__soft'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 1, stagger: 0.12 }, 1.6)
        .fromTo(q('.cus-hero__coat-cap > *'), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.08 }, 1.8)
        .fromTo(caseIn, { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, transformOrigin: '50% 50%', duration: 0.6, ease: 'power2.out' }, 0.55)
        .to(reveal, { strokeDashoffset: 0, duration: 2.6, ease: 'drape' }, 0.6)
        .to(roll, { t: 1, duration: 2.6, ease: 'drape', onUpdate: () => placeCase(roll.t) }, 0.6)
        .fromTo(intro[1], { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 1.1, stagger: 0.12 }, 1.25)
    },
    { scope: root, dependencies: [ready], revertOnUpdate: true },
  )

  /* Scroll choreography — gentle depth as the hero leaves (title, coat and tape drift at different rates). */
  useGSAP(
    () => {
      const el = root.current
      if (!el || prefersReducedMotion()) return
      // one timeline, one ScrollTrigger: the three layers stay in lockstep and revert together
      const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true } })
      tl.to(el.querySelector('.cus-hero__title'), { y: -60 }, 0)
        .to(el.querySelector('.cus-hero__coat'), { y: -30 }, 0)
        .to(el.querySelector('.cus-hero__tape'), { y: -110, rotate: -1.5 }, 0)
    },
    { scope: root },
  )

  return (
    <section ref={root} className="cus-hero" data-theme="parchment" aria-labelledby="cus-hero-title">
      <div className="container cus-hero__inner">
        <div className="cus-hero__top">
          <Eyebrow numeral="III">Custom Services</Eyebrow>
          <p className="cus-hero__where">
            <span className="label-sm">Flagship</span>
            <span className="serif-italic">
              {FLAGSHIP.place}, {FLAGSHIP.city} — opening January 2027 · private appointments now
            </span>
          </p>
        </div>

        <div className="cus-hero__stage">
          <h1 id="cus-hero-title" className="cus-hero__title h-hero">
            <span className="cus-hero__line">
              <Word>Made</Word> <Word>to</Word> <Word>measure.</Word>
            </span>
            <span className="cus-hero__line cus-hero__line--2">
              <Word>Made</Word> <Word>to</Word> <Word gold>lead.</Word>
            </span>
          </h1>

          <figure className="cus-hero__coat">
            <figcaption className="cus-hero__coat-cap">
              <span className="label-sm">
                <span className="numeral">Nº III</span> The Camel Trench
              </span>
              <span className="serif-italic">Cotton gabardine, cut to her measurements</span>
            </figcaption>
            <TrenchSpec />
          </figure>
        </div>
      </div>

      {/* The measuring tape — unrolls across the hero (stroke-dashoffset mask). */}
      <div className="cus-hero__tape" aria-hidden>
        <svg className="cus-tape" viewBox="0 0 1600 320" preserveAspectRatio="xMidYMid slice" focusable="false">
          <defs>
            <mask id="cus-tape-reveal" maskUnits="userSpaceOnUse" x="-120" y="-120" width="1840" height="560">
              <path className="cus-tape__reveal" d={TAPE} fill="none" stroke="#fff" strokeWidth="96" strokeLinecap="butt" />
            </mask>
            <mask id="cus-tape-edge-minor" maskUnits="userSpaceOnUse" x="-120" y="-120" width="1840" height="560">
              <path d={TAPE} fill="none" stroke="#fff" strokeWidth="44" />
              <path d={TAPE} fill="none" stroke="#000" strokeWidth="29" />
            </mask>
            <mask id="cus-tape-edge-major" maskUnits="userSpaceOnUse" x="-120" y="-120" width="1840" height="560">
              <path d={TAPE} fill="none" stroke="#fff" strokeWidth="44" />
              <path d={TAPE} fill="none" stroke="#000" strokeWidth="17" />
            </mask>
          </defs>

          <g mask="url(#cus-tape-reveal)">
            <path className="cus-tape__edge" d={TAPE} />
            <path className="cus-tape__body" d={TAPE} />
            <path className="cus-tape__ticks" d={TAPE} strokeDasharray="1 9" mask="url(#cus-tape-edge-minor)" />
            <path className="cus-tape__ticks cus-tape__ticks--major" d={TAPE} strokeDasharray="1.6 48.4" mask="url(#cus-tape-edge-major)" />
            <path id="cus-tape-path" className="cus-tape__centre" d={TAPE} />
            <text className="cus-tape__nums" dy="0.35em">
              {LABELS.map((o) => (
                <textPath key={o} href="#cus-tape-path" startOffset={o} textAnchor="middle">
                  {o / 10}
                </textPath>
              ))}
            </text>
          </g>

          {/* tape case — rolls along as the tape pays out */}
          <g className="cus-tape__case">
            <g className="cus-tape__case-in" style={{ opacity: 0 }}>
              <circle r={CASE_R} className="cus-tape__case-shell" />
              <circle r={CASE_R - 8} className="cus-tape__case-ring" />
              <circle r={CASE_R - 13} className="cus-tape__case-ring cus-tape__case-ring--dash" />
              <path d="M0,-34 L0,-26" className="cus-tape__case-notch" />
              <text className="cus-tape__case-f" dy="0.36em">
                F
              </text>
            </g>
          </g>
        </svg>
      </div>

      <div className="container cus-hero__foot">
        <p className="lead cus-hero__lead">
          The same Femmora designs — trench coats, blazers, kurtas — cut to your measurements and kept on file, so every reorder fits like the
          first. The fit is our craft; the confidence of wearing it is the point.
        </p>
        <dl className="cus-hero__facts">
          <div>
            <dt className="label-sm">Fittings</dt>
            <dd>Flagship or private appointment</dd>
          </div>
          <div>
            <dt className="label-sm">Made-to-measure</dt>
            <dd>{MTM ? `${MTM.price} / piece` : 'Per piece'}</dd>
          </div>
          <div>
            <dt className="label-sm">Turnaround</dt>
            <dd>
              <span className="numeral">{TIER_DETAILS.mtm.timeline.split(' ')[0]}</span> days, tape to rigid box
            </dd>
          </div>
        </dl>
        <div className="cus-hero__ctas">
          <Button variant="gold" onClick={onBook} cursor="Book">
            Book a fitting
          </Button>
          <Button variant="ghost" onClick={() => scrollToTarget('#services', -20)}>
            Compare the services
          </Button>
        </div>
      </div>
    </section>
  )
}
