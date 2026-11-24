import { useRef, useState, type KeyboardEvent } from 'react'
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'motion/react'
import { gsap, useGSAP, prefersReducedMotion } from '../../lib/motion'
import { Eyebrow, Reveal, SplitReveal } from '../../components/Reveal'
import Button from '../../components/Button'
import { BRAND } from '../../data/site'
import { FAQ, ROMAN } from './data'
import './Faq.css'

const EASE = [0.22, 1, 0.36, 1] as const

export default function Faq({ onBook }: { onBook: () => void }) {
  const root = useRef<HTMLElement>(null)
  const buttons = useRef<(HTMLButtonElement | null)[]>([])
  const [open, setOpen] = useState<number | null>(0)
  const reduce = !!useReducedMotion()

  const toggle = (i: number) => setOpen((o) => (o === i ? null : i))

  /* WAI-ARIA accordion: arrows move between headers, Home / End jump to the ends. */
  const onKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const n = FAQ.length
    const to = { ArrowDown: (i + 1) % n, ArrowUp: (i - 1 + n) % n, Home: 0, End: n - 1 }[e.key]
    if (to === undefined) return
    e.preventDefault()
    buttons.current[to]?.focus()
  }

  useGSAP(
    () => {
      const el = root.current
      if (!el || prefersReducedMotion()) return
      const list = el.querySelector('.cus-faq__list')
      const tl = gsap.timeline({ scrollTrigger: { trigger: list, start: 'top 82%', once: true } })
      // opacity, not autoAlpha: the question buttons must stay reachable by Tab before the reveal has played
      tl.fromTo(el.querySelectorAll('.cus-faq__rule'), { scaleX: 0 }, { scaleX: 1, duration: 1.4, ease: 'silk', stagger: 0.07 })
        .fromTo(el.querySelectorAll('.cus-faq__h'), { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 1, ease: 'lux', stagger: 0.07 }, 0.15)
        .fromTo(el.querySelectorAll('.cus-faq__a-in'), { opacity: 0 }, { opacity: 1, duration: 0.8, ease: 'lux' }, 0.5)
      // the aside drifts against the list as the section passes
      const mm = gsap.matchMedia()
      mm.add('(min-width: 1024px)', () => {
        gsap.fromTo(
          el.querySelector('.cus-faq__mark'),
          { yPercent: -20, rotate: -8 },
          { yPercent: 25, rotate: 6, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } },
        )
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  const layoutT = { duration: reduce ? 0 : 0.6, ease: EASE }

  return (
    <section ref={root} className="section cus-faq" data-theme="ivory" aria-label="Frequently asked questions">
      <div className="container cus-faq__grid">
        <div className="cus-faq__aside">
          <Eyebrow numeral="VI">Questions, answered</Eyebrow>
          <SplitReveal as="h2" className="h2 cus-faq__title">
            Before your first fitting.
          </SplitReveal>
          <Reveal delay={0.1}>
            <p className="lead cus-faq__lead">Price, time, cloth and fit — the things women ask us most, answered plainly.</p>
          </Reveal>
          <Reveal delay={0.2} className="cus-faq__ask">
            <p className="label-sm gold">Something we haven’t covered?</p>
            <p className="cus-faq__ask-t">
              Message the <span className="cus-faq__ask-v">{BRAND.whatsapp}</span>, or write to <span className="cus-faq__ask-v">{BRAND.email}</span>. A
              person replies — never a bot.
            </p>
            <Button variant="ghost" onClick={onBook} cursor="Book">
              Book a fitting
            </Button>
          </Reveal>
          <svg className="cus-faq__mark" viewBox="0 0 120 160" aria-hidden>
            {/* a tailor's pin cushion of thread: a spool in gold hairline */}
            <path d="M30 20h60M30 140h60M36 20v120M84 20v120" />
            <path d="M36 34c16 6 32 6 48 0M36 52c16 6 32 6 48 0M36 70c16 6 32 6 48 0M36 88c16 6 32 6 48 0M36 106c16 6 32 6 48 0M36 124c16 6 32 6 48 0" />
            <path d="M84 70c14 4 22 18 18 34s-8 30 4 42" className="cus-faq__mark-tail" />
          </svg>
        </div>

        <LayoutGroup>
          <div className="cus-faq__wrap">
            <ul className="cus-faq__list">
              {FAQ.map((f, i) => {
                const isOpen = open === i
                const qid = `cus-faq-q-${i}`
                const aid = `cus-faq-a-${i}`
                return (
                  <motion.li key={f.q} layout="position" transition={layoutT} className={`cus-faq__item ${isOpen ? 'is-open' : ''}`}>
                    <span className="cus-faq__rule" aria-hidden />
                    <h3 className="cus-faq__h">
                      <button
                        ref={(n) => {
                          buttons.current[i] = n
                        }}
                        id={qid}
                        type="button"
                        className="cus-faq__btn"
                        aria-expanded={isOpen}
                        aria-controls={isOpen ? aid : undefined}
                        onClick={() => toggle(i)}
                        onKeyDown={(e) => onKey(e, i)}
                        data-cursor={isOpen ? 'Close' : 'Open'}
                      >
                        <span className="cus-faq__n numeral" aria-hidden>
                          {ROMAN[i]}
                        </span>
                        <span className="cus-faq__q">{f.q}</span>
                        <span className="cus-faq__icon" aria-hidden>
                          <span />
                          <span />
                        </span>
                      </button>
                    </h3>
                    <AnimatePresence initial={false} mode="popLayout">
                      {isOpen && (
                        <motion.div
                          key="a"
                          id={aid}
                          role="region"
                          aria-labelledby={qid}
                          className="cus-faq__a"
                          initial={{ opacity: 0, y: reduce ? 0 : -10, clipPath: 'inset(0% 0% 100% 0%)' }}
                          animate={{ opacity: 1, y: 0, clipPath: 'inset(0% 0% 0% 0%)', transition: { duration: reduce ? 0 : 0.7, ease: EASE, delay: reduce ? 0 : 0.08 } }}
                          exit={{ opacity: 0, clipPath: 'inset(0% 0% 100% 0%)', transition: { duration: reduce ? 0 : 0.3, ease: EASE } }}
                        >
                          <div className="cus-faq__a-in">
                            <p>{f.a}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.li>
                )
              })}
            </ul>
            <motion.span layout="position" transition={layoutT} className="cus-faq__end" aria-hidden />
          </div>
        </LayoutGroup>
      </div>
    </section>
  )
}
