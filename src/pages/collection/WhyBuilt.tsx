import { useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import WhyDetail, { type DetailKind } from './WhyDetails'
import { Eyebrow, Reveal, SplitReveal } from '../../components/Reveal'
import { gsap, ScrollTrigger, useGSAP } from '../../lib/motion'
import { productById } from '../../data/products'
import type { QuickTarget } from './ProductCard'
import { EASE, ROMAN, cap, word } from './format'
import './WhyBuilt.css'


interface Finding {
  title: string
  value: string
  unit: string
  caption: string
  heard: string
  built: string
  pieces: string[]
  detail: DetailKind
}

/* Each row ties a finding from Femmora's consumer research to a construction decision —
   the four things the collection is built around: structured cuts, breathable fabric,
   real pockets and a measurement-led fit (Deliverable 3, Differentiators I & II). */
const FINDINGS: Finding[] = [
  {
    title: 'Structured cuts',
    value: '3.3',
    unit: '%',
    caption: 'of full-time corporate jobs in Pakistan are held by women — so she is often the only woman at the table.',
    heard:
      'In a boardroom, heavy threadwork and glitter read as occasion wear. Authority is signalled quietly — through clean seams, sharp collars, structured silhouettes and the weight of the cloth. And the double bind is real: too Western reads too bold; too traditional reads non-corporate.',
    built:
      'Structure, not decoration: trench coats and blazers cut with a defined shoulder, a structured kurta and a tailored long vest that read as tailoring in any room, and interfaced collars that stand all day over plackets that never gape or show through.',
    pieces: ['burgundy-trench', 'structured-kurta', 'tailored-long-vest'],
    detail: 'collar',
  },
  {
    title: 'Breathable fabric',
    value: '8',
    unit: 'months',
    caption: 'of the year a heavy Western blazer is simply unwearable here.',
    heard:
      'Women told us the blazer is the most authoritative thing they own — and the least worn, because for most of the year the climate will not allow it.',
    built:
      'Unlined wool-linen suiting, cotton gabardine, merino-cotton knits and breathable cupro half linings with underarm gussets: the authority of tailoring without the weight, for a Lahore summer and an over-air-conditioned boardroom alike.',
    pieces: ['boardroom-blazer', 'ivory-trench', 'cable-knit-crew'],
    detail: 'weave',
  },
  {
    title: 'Real pockets',
    value: '17',
    unit: 'cm',
    caption: 'deep — a phone, a pen and an access card, with room to spare.',
    heard:
      'Almost no formal womenswear here has a pocket you can use. The phone, the pen and the access card end up in a hand — or in a handbag left at the desk.',
    built:
      'Deep side-seam pockets in every kurta and trouser, set into the seam so the line never breaks; deep slash pockets in every trench, and real flap pockets, stitched open, on every jacket.',
    pieces: ['structured-kurta', 'camel-trench', 'flat-front-trouser'],
    detail: 'pocket',
  },
  {
    title: 'Measurement-led',
    value: '1',
    unit: 'fitting',
    caption: 'One fitting, one final — then your measurements stay on file, and every repeat order is cut from them.',
    heard:
      'One-size-fits-all was the most repeated complaint in our research: boxy cuts, and sizing that changes from one brand to the next. Working mothers and postpartum bodies are rarely designed for at all.',
    built:
      'One consistent Femmora size chart for Core ready-to-wear — and Made-to-Measure: the same designs cut to your measurements, from PKR 12,000 to 25,000 per piece. Where a body changes, the fit adapts invisibly, like the concealed elastic back of the Flat-Front Trouser.',
    pieces: ['camel-trench', 'flat-front-trouser', 'equestrian-blazer'],
    detail: 'measure',
  },
]

export default function WhyBuilt({ onQuickView }: { onQuickView: (t: QuickTarget) => void }) {
  const root = useRef<HTMLElement>(null)
  const [active, setActive] = useState(0)
  const reduced = useReducedMotion()
  const f = FINDINGS[active]

  useGSAP(
    () => {
      const el = root.current
      if (!el) return
      const mm = gsap.matchMedia()
      mm.add('(min-width: 1024px)', () => {
        const rows = gsap.utils.toArray<HTMLElement>('.col-why__row', el)
        rows.forEach((row, i) => {
          ScrollTrigger.create({
            trigger: row,
            start: 'top 58%',
            end: 'bottom 58%',
            onToggle: (self) => {
              if (self.isActive) setActive(i)
            },
          })
        })
        const fill = el.querySelector('.col-why__progress-fill')
        const list = el.querySelector('.col-why__list')
        if (!fill || !list) return
        gsap.fromTo(
          fill,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: { trigger: list, start: 'top 58%', end: 'bottom 58%', scrub: 0.4 },
          },
        )
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  const slide = reduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { y: '105%', rotate: 2 },
        animate: { y: '0%', rotate: 0 },
        exit: { y: '-105%', rotate: -1 },
      }

  return (
    <section ref={root} className="section col-why" data-theme="ivory" aria-labelledby="col-why-title">
      <div className="container col-why__head">
        <div>
          <Eyebrow numeral="III">Why it’s built like this</Eyebrow>
          <h2 id="col-why-title" className="sr-only">
            Why it’s built like this
          </h2>
          <SplitReveal as="p" className="h1 col-why__title" by="lines">
            Every seam is an <em>answer</em>.
          </SplitReveal>
        </div>
        <Reveal className="col-why__intro" delay={0.1}>
          <p className="lead">
            Before we cut a single pattern, we listened — to founders, managers and partners in Lahore, Karachi and
            Islamabad. {cap(word(FINDINGS.length))} things came up again and again: pockets, breathable fabric,
            structured cuts and a fit taken from her, not from a chart. This is what we built in reply.
          </p>
        </Reveal>
      </div>

      <div className="container col-why__body">
        {/* sticky stat + drawing (desktop) */}
        <div className="col-why__aside" aria-hidden>
          <div className="col-why__sticky">
            <div className="col-why__aside-top">
              <span className="col-why__progress">
                <span className="col-why__progress-fill" />
              </span>
              <ol className="col-why__ticks">
                {FINDINGS.map((x, i) => (
                  <li key={x.title} className={i === active ? 'is-on' : ''}>
                    <span className="numeral">{ROMAN[i]}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="col-why__stat-mask">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.p key={active} className="col-why__stat" transition={{ duration: 0.9, ease: EASE }} {...slide}>
                  <span className="col-why__stat-v">{f.value}</span>
                  <span className="col-why__stat-u">{f.unit}</span>
                </motion.p>
              </AnimatePresence>
            </div>
            <div className="col-why__cap-wrap">
              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={active}
                  className="col-why__cap"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE, delay: 0.1 } }}
                  exit={{ opacity: 0, y: -8, transition: { duration: 0.25 } }}
                >
                  {f.caption}
                </motion.p>
              </AnimatePresence>
            </div>

            <div className="col-why__drawing">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={f.detail}
                  className="col-why__drawing-in"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.3 } }}
                >
                  <WhyDetail kind={f.detail} />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* the findings */}
        <ol className="col-why__list">
          {FINDINGS.map((x, i) => (
            <li key={x.title} className={`col-why__row ${i === active ? 'is-active' : ''}`}>
              <Reveal className="col-why__row-head">
                <span className="numeral col-why__row-num" aria-hidden>
                  {ROMAN[i]}
                </span>
                <h3 className="h3 col-why__row-title">{x.title}</h3>
              </Reveal>

              {/* inline stat: visible on mobile & tablet; for assistive tech everywhere */}
              <div className="col-why__inline">
                <p className="col-why__inline-stat">
                  <span className="col-why__inline-v">{x.value}</span>
                  <span className="col-why__inline-u">{x.unit}</span>
                </p>
                <p className="col-why__inline-cap">{x.caption}</p>
                <div className="col-why__inline-art">
                  <WhyDetail kind={x.detail} mode="view" />
                </div>
              </div>

              <Reveal className="col-why__copy" delay={0.08}>
                <p className="label-sm col-why__k">What we heard</p>
                <p className="col-why__heard">{x.heard}</p>
                <p className="label-sm col-why__k">So we built</p>
                <p className="body col-why__built">{x.built}</p>
              </Reveal>

              <Reveal className="col-why__seen" delay={0.14}>
                <p className="label-sm col-why__k">Seen in</p>
                <ul>
                  {x.pieces.map((id) => {
                    const p = productById(id)
                    if (!p) return null
                    return (
                      <li key={id}>
                        <button
                          type="button"
                          className="col-why__piece"
                          aria-haspopup="dialog"
                          onClick={() => onQuickView({ id, colour: 0 })}
                          data-cursor="View"
                        >
                          <span className="numeral col-why__piece-no">No. {p.no}</span>
                          <span className="col-why__piece-name">{p.name}</span>
                          <svg viewBox="0 0 28 10" aria-hidden>
                            <path d="M0 5h26M22 1l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1" />
                          </svg>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>

      <div className="container">
        <p className="col-why__source label-sm">
          Source — Femmora consumer research: interviews and a survey with working women in Lahore, Karachi and
          Islamabad
        </p>
      </div>
    </section>
  )
}
