import { useId, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from '../../lib/motion'
import SectionHead from './SectionHead'
import { RULES } from './content'
import { EASE_LUX, EASE_SILK, pad2 } from './motionPresets'
import './Rules.css'

/** The seven Femmora rules: a scroll-revealed list with a sticky numeral that keeps count. */
export default function Rules() {
  const uid = useId()
  const root = useRef<HTMLElement>(null)
  const list = useRef<HTMLOListElement>(null)
  const [active, setActive] = useState(0)
  const reduce = useReducedMotion()

  useGSAP(
    () => {
      const rows = Array.from(list.current?.querySelectorAll<HTMLElement>('.sty-rule') ?? [])

      // Which rule is being read: the one crossing the middle of the viewport.
      rows.forEach((row, i) => {
        ScrollTrigger.create({
          trigger: row,
          start: 'top 55%',
          end: 'bottom 55%',
          onToggle: (self) => {
            if (self.isActive) setActive(i)
          },
        })
      })

      if (prefersReducedMotion()) return

      // The gold thread fills as you read down the list.
      gsap.fromTo(
        '.sty-rules__fill',
        { scaleX: 0 },
        { scaleX: 1, ease: 'none', scrollTrigger: { trigger: list.current, start: 'top 55%', end: 'bottom 55%', scrub: 0.4 } },
      )

      rows.forEach((row) => {
        const num = row.querySelector('.sty-rule__num')
        const rule = row.querySelector('.sty-rule__rule')
        const text = row.querySelectorAll('.sty-rule__title, .sty-rule__body')
        gsap
          .timeline({ scrollTrigger: { trigger: row, start: 'top 86%', once: true }, defaults: { ease: 'lux' } })
          .fromTo(rule, { scaleX: 0 }, { scaleX: 1, duration: 1.5, ease: 'silk' }, 0)
          .fromTo(num, { yPercent: 70, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 1.4 }, 0.1)
          .fromTo(text, { y: 34, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.2, stagger: 0.09 }, 0.22)
        // numerals float a little slower than the copy
        gsap.fromTo(
          num,
          { y: 26 },
          { y: -26, ease: 'none', scrollTrigger: { trigger: row, start: 'top bottom', end: 'bottom top', scrub: true } },
        )
      })
    },
    { scope: root },
  )

  const current = RULES[active]

  return (
    <section id="sty-rules" ref={root} className="section sty-rules sty-weave" data-theme="wine" aria-labelledby={`${uid}-title`}>
      <div className="container sty-rules__layout">
        <div className="sty-rules__aside">
          <SectionHead
            id={`${uid}-title`}
            numeral="05"
            eyebrow="The Femmora rules"
            label="The Femmora rules"
            title={
              <>
                Seven rules, <span className="sty-em">kept quietly.</span>
              </>
            }
            lead="Learned at the board table and the riding school. Pin them inside the wardrobe door — every look on this page, and every capsule we build, follows them."
          />

          <div className="sty-rules__meter" aria-hidden>
            <div className="sty-rules__big">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={current.numeral}
                  className="numeral sty-rules__big-num"
                  initial={{ opacity: 0, y: reduce ? 0 : '45%', filter: 'blur(8px)' }}
                  animate={{ opacity: 1, y: '0%', filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: reduce ? 0 : '-35%', filter: 'blur(6px)', transition: { duration: 0.4, ease: EASE_SILK } }}
                  transition={{ duration: reduce ? 0 : 0.95, ease: EASE_LUX }}
                >
                  {current.numeral}
                </motion.span>
              </AnimatePresence>
            </div>
            <div className="sty-rules__progress">
              <span className="sty-rules__track">
                <span className="sty-rules__fill" />
              </span>
              <span className="label-sm sty-rules__count">
                {pad2(active + 1)} <span className="sty-rules__of">/ {pad2(RULES.length)}</span>
              </span>
            </div>
          </div>
        </div>

        <ol className="sty-rules__list" ref={list}>
          {RULES.map((r, i) => (
            <li key={r.numeral} className={`sty-rule ${i === active ? 'is-active' : ''}`}>
              <span className="sty-rule__rule" aria-hidden />
              <span className="numeral sty-rule__num" aria-hidden>
                {r.numeral}
              </span>
              <div className="sty-rule__text">
                <h3 className="h3 sty-rule__title">{r.title}</h3>
                <p className="body sty-rule__body">{r.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
