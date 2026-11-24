import { useRef, useState } from 'react'
import { gsap, useGSAP, prefersReducedMotion } from '../../lib/motion'
import { Eyebrow, Reveal, SplitReveal } from '../../components/Reveal'
import Button from '../../components/Button'
import { CIRCLE, CIRCLE_NEXT, ROMAN } from './data'
import './Circle.css'

/* The ring (viewBox -24 -24 368 368, centre 160,160): an engraved band of text that turns with the scroll,
   and four gold stations — one per privilege — that answer the list beside it. */
const C = 160
const R_TEXT = 126
const R_RING = 150
const NODES = [-90, 0, 90, 180].map((deg) => {
  const a = (deg * Math.PI) / 180
  return { x: C + R_RING * Math.cos(a), y: C + R_RING * Math.sin(a), lx: C + (R_RING + 17) * Math.cos(a), ly: C + (R_RING + 17) * Math.sin(a) }
})
const RING_TEXT = `The Femmora Circle · ${CIRCLE.map((c) => c.short).join(' · ')} · `

/** The Femmora Circle — the retention programme: early access, private previews, styling notes, founder events. */
export default function Circle({ onBegin }: { onBegin: () => void }) {
  const root = useRef<HTMLElement>(null)
  const [active, setActive] = useState<number | null>(null)

  useGSAP(
    () => {
      const el = root.current
      if (!el || prefersReducedMotion()) return
      const q = gsap.utils.selector(el)

      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 75%', once: true } })
      tl.fromTo(q('.cus-ring__draw'), { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 2, ease: 'silk', stagger: 0.15 })
        .fromTo(q('.cus-ring__text, .cus-ring__mono'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.2, ease: 'lux', stagger: 0.15 }, 0.6)
        .fromTo(q('.cus-ring__node'), { autoAlpha: 0, scale: 0.3, transformOrigin: '50% 50%' }, { autoAlpha: 1, scale: 1, duration: 0.7, ease: 'back.out(2.2)', stagger: 0.12 }, 1)
        .fromTo(q('.cus-circle__item'), { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 1, ease: 'lux', stagger: 0.1 }, 0.4)

      // the engraved band turns as the section passes
      gsap.fromTo(
        q('.cus-ring__spin'),
        { rotation: -40, svgOrigin: `${C} ${C}` },
        { rotation: 50, svgOrigin: `${C} ${C}`, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.6 } },
      )
    },
    { scope: root },
  )

  return (
    <section ref={root} className="cus-circle" data-theme="wine" aria-label="The Femmora Circle">
      <div className="container cus-circle__inner">
        <div className="cus-circle__art" aria-hidden>
          <svg className="cus-ring" viewBox="-24 -24 368 368" focusable="false">
            <defs>
              <path id="cus-ring-path" d={`M${C},${C} m-${R_TEXT},0 a${R_TEXT},${R_TEXT} 0 1,1 ${R_TEXT * 2},0 a${R_TEXT},${R_TEXT} 0 1,1 -${R_TEXT * 2},0`} />
              <linearGradient id="cus-ring-foil" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#8a6a2f" />
                <stop offset="30%" stopColor="#c9a55c" />
                <stop offset="52%" stopColor="#f1dfb2" />
                <stop offset="74%" stopColor="#c9a55c" />
                <stop offset="100%" stopColor="#9c7a3c" />
              </linearGradient>
            </defs>

            <circle cx={C} cy={C} r={R_RING} pathLength={1} className="cus-ring__draw cus-ring__outer" />
            <circle cx={C} cy={C} r={R_TEXT - 16} pathLength={1} className="cus-ring__draw cus-ring__inner" />
            <circle cx={C} cy={C} r={R_TEXT + 13} className="cus-ring__hair" />

            <g className="cus-ring__spin">
              <text className="cus-ring__text" textLength={Math.round(2 * Math.PI * R_TEXT)} lengthAdjust="spacing">
                <textPath href="#cus-ring-path">{RING_TEXT}</textPath>
              </text>
            </g>

            <text x={C} y={C} dy="0.34em" className="cus-ring__mono" fill="url(#cus-ring-foil)">
              F
            </text>

            {NODES.map((n, i) => (
              <g key={i} className={`cus-ring__node ${active === i ? 'is-on' : ''}`}>
                <circle cx={n.x} cy={n.y} r="9" className="cus-ring__node-halo" />
                <circle cx={n.x} cy={n.y} r="4.5" className="cus-ring__node-dot" />
                <text x={n.lx} y={n.ly} dy="0.35em" className="cus-ring__node-n">
                  {ROMAN[i]}
                </text>
              </g>
            ))}
          </svg>
        </div>

        <div className="cus-circle__copy">
          <Eyebrow>Membership</Eyebrow>
          <SplitReveal as="h2" className="h2 cus-circle__title">
            The Femmora Circle.
          </SplitReveal>
          <Reveal delay={0.1}>
            <p className="lead cus-circle__lead">
              For the women we dress. Membership begins with your first fitting or consultation — less a loyalty scheme than a standing
              invitation.
            </p>
          </Reveal>

          <ol className="cus-circle__list">
            {CIRCLE.map((c, i) => (
              <li
                key={c.title}
                className={`cus-circle__item ${active === i ? 'is-on' : ''}`}
                onPointerEnter={() => setActive(i)}
                onPointerLeave={() => setActive((a) => (a === i ? null : a))}
              >
                <span className="cus-circle__n numeral" aria-hidden>
                  {ROMAN[i]}
                </span>
                <h3 className="cus-circle__t">{c.title}</h3>
                <p className="cus-circle__b">{c.body}</p>
              </li>
            ))}
          </ol>

          <Reveal delay={0.1} className="cus-circle__foot">
            <p className="cus-circle__next">
              <span className="label-sm">Coming next</span>
              <span className="cus-circle__next-t">{CIRCLE_NEXT}</span>
            </p>
            <Button variant="gold" onClick={onBegin} cursor="Book">
              Begin with a fitting
            </Button>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
