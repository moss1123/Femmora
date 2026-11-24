import { useRef } from 'react'
import { gsap, useGSAP, prefersReducedMotion } from '../../lib/motion'
import { Eyebrow, Reveal, SplitReveal } from '../../components/Reveal'
import Button from '../../components/Button'
import { B2B_COLUMNS, ROMAN, SEATS, SECTORS } from './data'
import './Organisations.css'

/* ── The boardroom, drawn from above (viewBox 0 0 400 500, an arch of radius 200) ──
   Thirty seats — 3.3% of full-time corporate roles in Pakistan are held by women, roughly one in thirty —
   and the one picked out in gold is at the head of the table. */
const ARCH = 'M0,500 V200 A200,200 0 0 1 400,200 V500 Z'
const TABLE = { x: 170, y: 104, w: 60, h: 312 }
const PER_SIDE = (SEATS - 2) / 2
const FIRST = 118
const STEP = (402 - FIRST) / (PER_SIDE - 1)
const SIDE_Y = Array.from({ length: PER_SIDE }, (_, i) => FIRST + i * STEP)
const HEAD: [number, number] = [200, 88]
const FOOT: [number, number] = [200, 432]
const LAMPS = [180, 260, 340]

/** One chair, seen from above: a seat and its curved back. `side` is where the back faces. */
function Chair({ x, y, side, className = 'cus-room__chair' }: { x: number; y: number; side: 'l' | 'r' | 't' | 'b'; className?: string }) {
  const s = 6.5
  const back = {
    l: `M${x - s - 4},${y - s} Q${x - s - 8},${y} ${x - s - 4},${y + s}`,
    r: `M${x + s + 4},${y - s} Q${x + s + 8},${y} ${x + s + 4},${y + s}`,
    t: `M${x - s},${y - s - 4} Q${x},${y - s - 8} ${x + s},${y - s - 4}`,
    b: `M${x - s},${y + s + 4} Q${x},${y + s + 8} ${x + s},${y + s + 4}`,
  }[side]
  return (
    <g className={className}>
      <rect x={x - s} y={y - s} width={s * 2} height={s * 2} rx="2" className="cus-room__seat" />
      <path d={back} className="cus-room__back" />
    </g>
  )
}

function Boardroom() {
  return (
    <svg className="cus-room" viewBox="0 0 400 500" role="img" aria-labelledby="cus-room-title" focusable="false">
      <title id="cus-room-title">
        A boardroom table drawn from above with thirty seats. One, at the head of the table, is picked out in gold — 3.3% of full-time
        corporate roles in Pakistan are held by women, roughly one seat in thirty.
      </title>
      <defs>
        <clipPath id="cus-room-clip">
          <path d={ARCH} />
        </clipPath>
        {/* a parquet chevron for the floor */}
        <pattern id="cus-room-floor" width="18" height="9" patternUnits="userSpaceOnUse">
          <path d="M0,9 L9,0 L18,9" className="cus-room__parquet" />
        </pattern>
        <radialGradient id="cus-room-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#e3c88a" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#e3c88a" stopOpacity="0" />
        </radialGradient>
      </defs>

      <g clipPath="url(#cus-room-clip)" aria-hidden>
        <rect width="400" height="500" className="cus-room__ground" />
        <rect width="400" height="500" fill="url(#cus-room-floor)" />
        {/* light falling on the table from three pendants */}
        {LAMPS.map((y) => (
          <circle key={y} cx="200" cy={y} r="58" fill="url(#cus-room-glow)" className="cus-room__pool" />
        ))}
      </g>

      <g aria-hidden>
        {/* the table */}
        <rect x={TABLE.x} y={TABLE.y} width={TABLE.w} height={TABLE.h} rx="3" className="cus-room__table" />
        <rect
          x={TABLE.x}
          y={TABLE.y}
          width={TABLE.w}
          height={TABLE.h}
          rx="3"
          pathLength={1}
          className="cus-room__table-line"
        />
        <rect x={TABLE.x + 5} y={TABLE.y + 5} width={TABLE.w - 10} height={TABLE.h - 10} rx="1.5" className="cus-room__inlay" />
        <path d={`M200,${TABLE.y + 16} V${TABLE.y + TABLE.h - 16}`} className="cus-room__runner" />
        {LAMPS.map((y) => (
          <circle key={y} cx="200" cy={y} r="7" className="cus-room__lamp" />
        ))}
        {/* a notepad at every place */}
        {SIDE_Y.map((y) => (
          <g key={y} className="cus-room__pads">
            <rect x={TABLE.x + 7} y={y - 4} width="7" height="8" />
            <rect x={TABLE.x + TABLE.w - 14} y={y - 4} width="7" height="8" />
          </g>
        ))}

        {/* twenty-nine seats, from the foot of the table up */}
        <Chair x={FOOT[0]} y={FOOT[1]} side="b" />
        {[...SIDE_Y].reverse().map((y) => (
          <g key={y}>
            <Chair x={TABLE.x - 14.5} y={y} side="l" />
            <Chair x={TABLE.x + TABLE.w + 14.5} y={y} side="r" />
          </g>
        ))}

        {/* hers */}
        <g className="cus-room__her">
          <circle cx={HEAD[0]} cy={HEAD[1]} r="15" className="cus-room__pulse" />
          <circle cx={HEAD[0]} cy={HEAD[1]} r="15" className="cus-room__halo" />
          <Chair x={HEAD[0]} y={HEAD[1]} side="t" className="cus-room__chair cus-room__chair--her" />
          <path d={`M${HEAD[0] + 17},${HEAD[1]} H${HEAD[0] + 28}`} className="cus-room__lead" />
          <text x={HEAD[0] + 32} y={HEAD[1] + 4} className="cus-room__tag">
            one seat in thirty
          </text>
        </g>
      </g>

      <path d={ARCH} className="cus-room__arch" aria-hidden />
    </svg>
  )
}

export default function Organisations({ onRequest }: { onRequest: () => void }) {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const el = root.current
      if (!el || prefersReducedMotion()) return
      const q = gsap.utils.selector(el)

      // 3.3% counts up as it arrives
      const n = el.querySelector<HTMLElement>('.cus-org__stat-n')
      if (n) {
        const o = { v: 0 }
        n.textContent = '0.0'
        gsap.to(o, {
          v: 3.3,
          duration: 2.2,
          ease: 'power3.out',
          scrollTrigger: { trigger: n, start: 'top 85%', once: true },
          onUpdate: () => {
            n.textContent = o.v.toFixed(1)
          },
          onComplete: () => {
            n.textContent = '3.3'
          },
        })
      }

      // the boardroom: table drawn, seats filled from the foot up, then hers lights at the head
      const room = el.querySelector('.cus-room')
      if (room) {
        const tl = gsap.timeline({ scrollTrigger: { trigger: room, start: 'top 78%', once: true } })
        tl.fromTo(q('.cus-room__table-line'), { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.6, ease: 'silk' })
          .fromTo(q('.cus-room__table, .cus-room__inlay, .cus-room__runner, .cus-room__lamp, .cus-room__pads'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 1, ease: 'lux', stagger: 0.04 }, 0.5)
          .fromTo(q('.cus-room__pool'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.4, ease: 'lux', stagger: 0.12 }, 0.6)
          .fromTo(
            q('.cus-room__chair:not(.cus-room__chair--her)'),
            { autoAlpha: 0, scale: 0.4, transformOrigin: '50% 50%' },
            { autoAlpha: 1, scale: 1, duration: 0.6, ease: 'back.out(2)', stagger: 0.035 },
            0.7,
          )
          .fromTo(q('.cus-room__her'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.9, ease: 'lux' }, '-=0.1')
          .fromTo(q('.cus-room__chair--her'), { scale: 0.4, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.9, ease: 'back.out(2.4)' }, '<')
      }

      // the three columns: hairline draws, then the bullets cascade (opacity only — the headings and lists stay in the
      // accessibility tree before the reveal plays)
      q('.cus-org__col').forEach((col, i) => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: col, start: 'top 82%', once: true }, delay: i * 0.12 })
        tl.fromTo(col.querySelector('.cus-org__col-rule'), { scaleX: 0 }, { scaleX: 1, duration: 1.3, ease: 'silk' })
          .fromTo(col.querySelectorAll('.cus-org__col-head > *'), { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.9, ease: 'lux', stagger: 0.08 }, 0.2)
          .fromTo(col.querySelectorAll('li'), { opacity: 0, x: -14 }, { opacity: 1, x: 0, duration: 0.8, ease: 'lux', stagger: 0.07 }, 0.4)
      })

      // the arch drifts gently against the copy (wide screens only — on phones it sits in the flow)
      const mm = gsap.matchMedia()
      mm.add('(min-width: 761px)', () => {
        gsap.fromTo(
          q('.cus-org__media'),
          { yPercent: 6 },
          { yPercent: -6, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } },
        )
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section ref={root} className="section cus-org" data-theme="noir" aria-label="For organisations — Dress for the Position You Hold">
      <div className="container">
        <div className="cus-org__top">
          <div className="cus-org__intro">
            <Eyebrow numeral="IV">For organisations</Eyebrow>
            <SplitReveal as="h2" className="h2 cus-org__title">
              Dress for the Position You Hold.
            </SplitReveal>
            <Reveal delay={0.1}>
              <p className="lead cus-org__lead">
                Corporate styling workshops and women’s leadership programmes for banks, telcos and technology firms — formality decoded for
                Western, fusion and kurta, presence built alongside the wardrobe, and made-to-measure fittings for every participant who wants
                one. Group pricing, quoted per programme.
              </p>
            </Reveal>
            <Reveal delay={0.2} className="cus-org__stat">
              <p className="cus-org__stat-v">
                <span className="sr-only">3.3%</span>
                <span className="cus-org__stat-n numeral" aria-hidden>
                  3.3
                </span>
                <span className="cus-org__stat-pc numeral" aria-hidden>
                  %
                </span>
              </p>
              <p className="cus-org__stat-t">
                of full-time corporate roles in Pakistan are held by women. She is often the only woman at the table — how she arrives is part of
                what she says.
              </p>
            </Reveal>
          </div>

          <figure className="cus-org__media">
            <div className="cus-org__arch">
              <Boardroom />
            </div>
            <figcaption className="cus-org__caption label-sm">
              <span className="numeral">IV</span> The boardroom — one seat in thirty, at the head of the table
            </figcaption>
          </figure>
        </div>

        <div className="cus-org__cols">
          {B2B_COLUMNS.map((c, i) => (
            <article key={c.title} className="cus-org__col" aria-labelledby={`cus-org-col-${i}`}>
              <span className="cus-org__col-rule" aria-hidden />
              <header className="cus-org__col-head">
                <span className="numeral cus-org__col-n" aria-hidden>
                  {ROMAN[i]}
                </span>
                <div>
                  <p className="label-sm cus-org__col-k">{c.kicker}</p>
                  <h3 id={`cus-org-col-${i}`} className="h3 cus-org__col-title">
                    {c.title}
                  </h3>
                </div>
              </header>
              <ul>
                {c.items.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="cus-org__foot">
          <div className="cus-org__for">
            <span className="label-sm cus-org__for-k">Built for</span>
            <ul className="cus-org__sectors" aria-label="Sectors the programmes are built for">
              {SECTORS.map((s) => (
                <li key={s} className="label-sm">
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <Button variant="gold" onClick={onRequest} cursor="Request">
            Request a programme outline
          </Button>
        </div>
      </div>
    </section>
  )
}
