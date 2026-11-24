import { useId, useRef, useState, type KeyboardEvent } from 'react'
import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react'
import { Reveal } from '../../components/Reveal'
import Button from '../../components/Button'
import { usePageReady } from '../../hooks/useGo'
import { gsap, useGSAP, prefersReducedMotion } from '../../lib/motion'
import SectionHead from './SectionHead'
import Flat from './Flat'
import { FLATS } from './flats'
import { FORMALITY, OCCASIONS, ROMAN } from './content'
import { EASE_LUX, EASE_SILK, SILK, panelVariants } from './motionPresets'
import './Occasions.css'

const FORMULAS = [
  { key: 'western', label: 'Western' },
  { key: 'fusion', label: 'Fusion' },
] as const

/**
 * The occasion guide: an accessible tablist of five rooms. Each room carries a formality level (I–IV),
 * one Western and one fusion formula at that level, notes, and the short list of pieces that does the work.
 */
export default function Occasions() {
  const uid = useId()
  const [active, setActive] = useState(0)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  const root = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const ready = usePageReady()
  const reduce = useReducedMotion()
  const inView = useInView(stage, { once: true, amount: 0.2 })
  const show = ready && inView
  const occ = OCCASIONS[active]
  const level = FORMALITY[occ.level - 1]
  const n = OCCASIONS.length

  const select = (i: number, focus = false) => {
    const next = (i + n) % n
    setActive(next)
    if (focus) tabs.current[next]?.focus()
  }

  // WAI-ARIA tabs pattern: roving tabindex, arrows move & activate, Home / End jump.
  const onKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const map: Record<string, number> = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: n - 1 }
    if (!(e.key in map)) return
    e.preventDefault()
    select(map[e.key], true)
  }

  // Scroll choreography: the outlined numeral and the arch drift at different speeds (desktop only).
  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const q = gsap.utils.selector(root)
      const mm = gsap.matchMedia()
      mm.add('(min-width: 900px)', () => {
        // a fresh vars object per tween: ScrollTrigger keeps a reference to the one it is given
        const st = () => ({ trigger: stage.current, start: 'top bottom', end: 'bottom top', scrub: 0.8 })
        gsap.fromTo(q('.sty-occ__ghost'), { yPercent: 18 }, { yPercent: -22, ease: 'none', scrollTrigger: st() })
        gsap.fromTo(q('.sty-occ__arch'), { y: 40 }, { y: -40, ease: 'none', scrollTrigger: st() })
      })
      gsap.fromTo(
        q('.sty-occ__tabline-base'),
        { scaleX: 0 },
        { scaleX: 1, duration: 1.6, ease: 'silk', scrollTrigger: { trigger: q('.sty-occ__tabs')[0], start: 'top 88%', once: true } },
      )
      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section id="sty-occasions" ref={root} className="section sty-occ" data-theme="ivory" aria-labelledby={`${uid}-title`}>
      <div className="container">
        <SectionHead
          id={`${uid}-title`}
          className="sty-head--wide"
          numeral="02"
          eyebrow="The occasion guide"
          label="The occasion guide"
          title={
            <>
              Dress for the room <span className="sty-em">you are walking into.</span>
            </>
          }
          lead="Every room has a formality level, from I at the desk to IV at the board table. For each, one Western formula and one fusion formula at the same level — so a kurta is never a guess, and a trench is never too much."
        />

        <Reveal className="sty-occ__tabs-wrap">
          <div className="sty-occ__tabs" role="tablist" aria-label="Choose an occasion">
            {OCCASIONS.map((o, i) => {
              const on = i === active
              return (
                <button
                  key={o.id}
                  ref={(el) => {
                    tabs.current[i] = el
                  }}
                  type="button"
                  role="tab"
                  id={`${uid}-tab-${o.id}`}
                  aria-selected={on}
                  aria-controls={`${uid}-panel`}
                  tabIndex={on ? 0 : -1}
                  className={`sty-occ__tab ${on ? 'is-on' : ''}`}
                  onClick={() => select(i)}
                  onKeyDown={(e) => onKey(e, i)}
                  data-cursor=""
                >
                  <span className="sty-occ__tab-num">
                    <span className="sr-only">Level </span>
                    <span className="numeral">{ROMAN[o.level - 1]}</span>
                  </span>
                  <span className="sty-occ__tab-label">{o.label}</span>
                  {on && <motion.span layoutId={`${uid}-tabline`} className="sty-occ__tab-line" transition={SILK} />}
                </button>
              )
            })}
          </div>
          <span className="sty-occ__tabline-base" aria-hidden />
        </Reveal>

        <div
          ref={stage}
          id={`${uid}-panel`}
          role="tabpanel"
          aria-labelledby={`${uid}-tab-${occ.id}`}
          tabIndex={0}
          className="sty-occ__panel"
        >
          {/* ── Visual: the level numeral in outline + the room's signature piece in an arch ── */}
          <div className="sty-occ__visual" aria-hidden>
            <div className="sty-occ__ghost">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={occ.level}
                  className="numeral sty-occ__ghost-num"
                  initial={{ opacity: 0, y: reduce ? 0 : 60, filter: 'blur(10px)' }}
                  animate={{ opacity: show ? 1 : 0, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: reduce ? 0 : -40, filter: 'blur(8px)', transition: { duration: 0.45, ease: EASE_SILK } }}
                  transition={{ duration: reduce ? 0 : 1.1, ease: EASE_LUX }}
                >
                  {ROMAN[occ.level - 1]}
                </motion.span>
              </AnimatePresence>
            </div>
            <div className="sty-occ__arch">
              <span className="sty-occ__arch-line" />
              <div className="sty-occ__arch-art">
                <AnimatePresence mode="wait" initial={false}>
                  <Flat key={occ.mark} id={occ.mark} state={show ? 'visible' : 'hidden'} weight={1.15} speed={1.2} />
                </AnimatePresence>
              </div>
              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={occ.mark}
                  className="label-sm sty-occ__arch-cap"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: show ? 1 : 0, y: 0 }}
                  exit={{ opacity: 0, y: -6, transition: { duration: 0.2 } }}
                  transition={{ ...SILK, delay: 0.35 }}
                >
                  {FLATS[occ.mark].name}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>

          <div className="sty-occ__main">
            {/* ── The formality scale: persistent, so the gold fill climbs or falls between rooms ── */}
            <div className="sty-occ__scale">
              <p className="label-sm sty-occ__label">The Femmora formality scale</p>
              <ol className="sty-occ__rungs">
                {FORMALITY.map((f) => {
                  const reached = f.level <= occ.level
                  const here = f.level === occ.level
                  return (
                    <li
                      key={f.level}
                      className={`sty-occ__rung ${reached ? 'is-reached' : ''} ${here ? 'is-here' : ''}`}
                      aria-current={here ? 'step' : undefined}
                    >
                      <span className="sty-occ__rung-bar" aria-hidden>
                        <span className="sty-occ__rung-fill" style={{ transitionDelay: `${(reached ? f.level - 1 : 4 - f.level) * 70}ms` }} />
                      </span>
                      <span className="numeral sty-occ__rung-num">{ROMAN[f.level - 1]}</span>
                      <span className="sty-occ__rung-name">{f.name}</span>
                    </li>
                  )
                })}
              </ol>
              <p className="sty-occ__rooms">
                <span className="sr-only">{`Level ${ROMAN[occ.level - 1]}, ${level.name}: `}</span>
                {level.rooms}.
              </p>
            </div>

            {/* ── Copy ── */}
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={occ.id}
                className="sty-occ__copy"
                initial="hidden"
                animate={show ? 'visible' : 'hidden'}
                exit="exit"
              >
                <motion.p className="label-sm sty-occ__kicker" variants={panelVariants} custom={0}>
                  <span className="numeral">{ROMAN[occ.level - 1]}</span>
                  <span className="sty-occ__kicker-rule" aria-hidden />
                  {occ.label}
                </motion.p>
                <motion.h3 className="h2 sty-occ__title" variants={panelVariants} custom={1}>
                  {occ.title}
                </motion.h3>

                <motion.div className="sty-occ__formulas" variants={panelVariants} custom={2}>
                  <p className="label-sm sty-occ__label">Two formulas, one level</p>
                  <dl className="sty-occ__formula-list">
                    {FORMULAS.map((f) => (
                      <div key={f.key} className="sty-occ__formula">
                        <dt className="label-sm sty-occ__formula-kind">{f.label}</dt>
                        <dd className="sty-occ__formula-line">
                          {occ[f.key].map((part, i) => (
                            <span key={part} className="sty-occ__part">
                              {i > 0 && (
                                <span className="sty-occ__plus" aria-hidden>
                                  +
                                </span>
                              )}
                              <span className="sty-occ__part-text">
                                {i > 0 && <span className="sr-only">, plus </span>}
                                {part}
                              </span>
                            </span>
                          ))}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </motion.div>

                <div className="sty-occ__notes">
                  <motion.div className="sty-occ__col" variants={panelVariants} custom={3}>
                    <p className="label-sm sty-occ__label sty-occ__label--do">
                      <svg viewBox="0 0 16 12" aria-hidden focusable="false">
                        <path d="M1 6.5 L5.6 11 L15 1" fill="none" stroke="currentColor" strokeWidth="1.1" />
                      </svg>
                      Do
                    </p>
                    <ul className="sty-occ__list">
                      {occ.dos.map((d) => (
                        <li key={d}>
                          <span className="sty-diamond" aria-hidden />
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                  <motion.div className="sty-occ__col sty-occ__col--avoid" variants={panelVariants} custom={4}>
                    <p className="label-sm sty-occ__label sty-occ__label--avoid">
                      <svg viewBox="0 0 12 12" aria-hidden focusable="false">
                        <path d="M1 1 L11 11 M11 1 L1 11" fill="none" stroke="currentColor" strokeWidth="1.1" />
                      </svg>
                      Avoid
                    </p>
                    <ul className="sty-occ__list">
                      {occ.donts.map((d) => (
                        <li key={d}>
                          <span className="sty-occ__cross" aria-hidden />
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                </div>

                <motion.aside className="sty-occ__note" variants={panelVariants} custom={5}>
                  <p className="label-sm sty-occ__label">{occ.note.label}</p>
                  <p className="sty-occ__note-body">{occ.note.body}</p>
                </motion.aside>

                <motion.div className="sty-occ__kit" variants={panelVariants} custom={6}>
                  <p className="label-sm sty-occ__label">The short list</p>
                  <ul className="sty-occ__kit-list">
                    {occ.kit.map((k, i) => (
                      <li key={k.id} className="sty-occ__kit-item">
                        <span className="sty-occ__kit-art" aria-hidden>
                          <Flat id={k.id} delay={0.35 + i * 0.12} speed={1} weight={1} />
                        </span>
                        <span className="sty-occ__kit-name">{k.name}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* ── For organisations: the corporate campaign, where the boardroom guidance comes from ── */}
        <Reveal className="sty-occ__corp">
          <div className="sty-occ__corp-inner">
            <p className="label-sm sty-occ__corp-kicker">For organisations</p>
            <h3 className="h3 sty-occ__corp-title">
              Dress for the <span className="sty-em">Position You Hold.</span>
            </h3>
            <p className="body sty-occ__corp-body">
              This guide is the backbone of our corporate workshops for banks, telcos and tech teams: formality levels decoded for
              Western, fusion and kurta, held at your offices. Quoted per programme.
            </p>
            <div className="sty-occ__corp-cta">
              <Button variant="ghost" to="/custom#book" cursor="Enquire">
                Enquire about a workshop
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
