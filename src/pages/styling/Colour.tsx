import { useId, useRef, useState, type CSSProperties } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import Marquee from '../../components/Marquee'
import Button from '../../components/Button'
import { Reveal } from '../../components/Reveal'
import { gsap, useGSAP, prefersReducedMotion } from '../../lib/motion'
import SectionHead from './SectionHead'
import InkWipe from './InkWipe'
import PaletteCard from './PaletteCard'
import { COLOUR_STORIES, HUES, HUE_ORDER, WORKSHOP_STEPS, type HueKey } from './content'
import { SILK, pad2, panelVariants } from './motionPresets'
import './Colour.css'

const RATIO = [70, 25, 5] as const
const ROMAN = ['I', 'II', 'III']

/**
 * Intentional colour: the house signature (burgundy + gold), a base-colour explorer with three pairings and
 * the 70 · 25 · 5 rule, and a teaser for the colour analysis workshop with its painted palette card.
 */
export default function Colour() {
  const uid = useId()
  const root = useRef<HTMLElement>(null)
  const [base, setBase] = useState<HueKey>('burgundy')
  const story = COLOUR_STORIES[base]
  const hue = HUES[base]

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const q = gsap.utils.selector(root)
      // Bolts of cloth unroll one after another as the palette arrives. The clip sits on the bolt itself (not its wrapper),
      // so it travels with the bolt's lift when selected, and is cleared afterwards.
      gsap.fromTo(
        q('.sty-col__bolt'),
        { clipPath: 'inset(100% 0% 0% 0%)' },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          duration: 1.5,
          ease: 'silk',
          stagger: 0.07,
          clearProps: 'clipPath',
          scrollTrigger: { trigger: q('.sty-col__swatches')[0], start: 'top 82%', once: true },
        },
      )
      // The ratio bar is drawn left to right, scrubbed with the scroll.
      gsap.fromTo(
        q('.sty-col__ratio-bar'),
        { clipPath: 'inset(0% 100% 0% 0%)' },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          ease: 'none',
          scrollTrigger: { trigger: q('.sty-col__ratio')[0], start: 'top 90%', end: 'top 55%', scrub: 0.6 },
        },
      )
      // The palette card settles a breath slower than the copy beside it (desktop only).
      const mm = gsap.matchMedia()
      mm.add('(min-width: 1024px)', () => {
        gsap.fromTo(
          q('.sty-col__workshop-card'),
          { y: 50, rotate: -1.6 },
          { y: -30, rotate: 0.6, ease: 'none', scrollTrigger: { trigger: q('.sty-col__workshop')[0], start: 'top bottom', end: 'bottom top', scrub: true } },
        )
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section id="sty-colour" ref={root} className="section sty-col" data-theme="noir" aria-labelledby={`${uid}-title`}>
      <div className="sty-col__marquee" aria-hidden>
        <Marquee
          items={['Intentional colour', 'Burgundy & gold', 'Textures that speak', 'Power in every detail', 'A wardrobe for every chapter']}
          speed={34}
        />
      </div>

      <div className="container">
        <SectionHead
          id={`${uid}-title`}
          className="sty-head--wide"
          numeral="03"
          eyebrow="Intentional colour"
          label="Intentional colour"
          title={
            <>
              Colour, <span className="sty-em">chosen on purpose.</span>
            </>
          }
          lead="Burgundy and gold are the house signature. The rest of the palette is yours to find — choose a base to see the three partners our stylists reach for first, and why each one works."
        />

        <div className="sty-col__layout">
          {/* ── Palette ── */}
          <fieldset className="sty-col__palette">
            <legend className="label-sm sty-col__legend">
              <span className="numeral">a.</span> Choose a base colour
            </legend>
            <div className="sty-col__swatches">
              {HUE_ORDER.map((k, i) => {
                const h = HUES[k]
                const on = k === base
                return (
                  <label
                    key={k}
                    className={`sty-col__swatch ${on ? 'is-on' : ''}`}
                    data-cursor={h.name}
                    style={{ '--sw': h.css } as CSSProperties}
                  >
                    <input
                      type="radio"
                      className="sty-radio"
                      name={`${uid}-base`}
                      value={k}
                      checked={on}
                      onChange={() => setBase(k)}
                    />
                    <span className="sty-col__bolt-wrap" aria-hidden>
                      <span className={`sty-col__bolt sty-col__bolt--${h.ink} ${h.house ? 'is-house' : ''}`}>
                        <span className="numeral sty-col__bolt-n">{pad2(i + 1)}</span>
                        {h.house && <span className="label-sm sty-col__bolt-house">House</span>}
                      </span>
                    </span>
                    <span className="sty-col__swatch-name">
                      {h.name}
                      {h.house && <span className="sr-only">, house signature</span>}
                    </span>
                    {on && <motion.span layoutId={`${uid}-ring`} className="sty-col__swatch-ring" transition={SILK} aria-hidden />}
                  </label>
                )
              })}
            </div>
          </fieldset>

          {/* ── Story: the base, its description and the 70 · 25 · 5 rule ── */}
          <div className="sty-col__story">
            <p className="sr-only" aria-live="polite">
              {`${hue.name} selected. Pairs with ${story.pairings.map((p) => HUES[p.with].name).join(', ')}.`}
            </p>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={base} initial="hidden" animate="visible" exit="exit" className="sty-col__story-text">
                <motion.p className="label-sm sty-col__story-kicker" variants={panelVariants} custom={0}>
                  Base colour <span aria-hidden>·</span> {hue.name}
                </motion.p>
                <motion.h3 className="h2 sty-col__story-title" variants={panelVariants} custom={1}>
                  {hue.note}
                </motion.h3>
                <motion.p className="lead sty-col__story-desc" variants={panelVariants} custom={2}>
                  {story.description}
                </motion.p>
              </motion.div>
            </AnimatePresence>

            <div className="sty-col__ratio">
              <p className="label-sm sty-col__ratio-label">The house proportion</p>
              <div className="sty-col__ratio-bar" aria-hidden>
                {story.ratio.map((k, i) => (
                  <span key={i} className="sty-col__ratio-seg" style={{ flexGrow: RATIO[i] }}>
                    <InkWipe colour={HUES[k].css} from="right" delay={i * 0.09} className="sty-col__ratio-ink" />
                  </span>
                ))}
              </div>
              <ol className="sty-col__ratio-keys">
                {story.ratio.map((k, i) => (
                  <li key={i} style={{ flexGrow: RATIO[i] }}>
                    <span className="numeral">{RATIO[i]}</span>
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.span
                        key={k}
                        className="label-sm"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6, transition: { duration: 0.18 } }}
                        transition={{ ...SILK, delay: i * 0.06 }}
                      >
                        {HUES[k].name}
                      </motion.span>
                    </AnimatePresence>
                  </li>
                ))}
              </ol>
              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={base}
                  className="body sty-col__ratio-note"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { duration: 0.7, delay: 0.25 } }}
                  exit={{ opacity: 0, transition: { duration: 0.2 } }}
                >
                  {story.ratioNote}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>

          {/* ── Three pairings ── */}
          <div className="sty-col__pairs-wrap">
            <p className="label-sm sty-col__legend">
              <span className="numeral">b.</span> Three partners for {hue.name.toLowerCase()}
            </p>
            <ol className="sty-col__pairs">
              {story.pairings.map((p, i) => (
                <li key={i} className="sty-col__pair">
                  <div className="sty-col__duo" aria-hidden>
                    <InkWipe colour={hue.css} from="down" delay={0.05 + i * 0.1} className="sty-col__disc" />
                    <InkWipe colour={HUES[p.with].css} from="up" delay={0.15 + i * 0.1} className="sty-col__disc sty-col__disc--b" />
                  </div>
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={`${base}-${p.with}`}
                      className="sty-col__pair-text"
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true, amount: 0.4 }}
                      exit="exit"
                    >
                      <motion.p className="label-sm sty-col__pair-kicker" variants={panelVariants} custom={i * 0.6}>
                        <span className="numeral">{ROMAN[i]}</span>
                        {hue.name} with {HUES[p.with].name}
                      </motion.p>
                      <motion.h3 className="h3 sty-col__pair-title" variants={panelVariants} custom={0.6 + i * 0.6}>
                        {p.title}
                      </motion.h3>
                      <motion.p className="body sty-col__pair-body" variants={panelVariants} custom={1.2 + i * 0.6}>
                        {p.body}
                      </motion.p>
                      <motion.p className="label-sm sty-col__pair-best" variants={panelVariants} custom={1.8 + i * 0.6}>
                        Best for <span aria-hidden>·</span> {p.bestFor}
                      </motion.p>
                    </motion.div>
                  </AnimatePresence>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* ── The colour analysis workshop (Dress the Woman You're Becoming) ── */}
        <div className="sty-col__workshop">
          <div className="sty-col__workshop-copy">
            <Reveal>
              <p className="label-sm sty-col__workshop-kicker">
                <span className="numeral">c.</span> The colour analysis
              </p>
            </Reveal>
            <Reveal delay={0.06}>
              <h3 className="h2 sty-col__workshop-title">
                Find the colours that are <span className="sty-em">already yours.</span>
              </h3>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="lead sty-col__workshop-lead">
                Part of every Premium Wardrobe Consultation, and of our corporate workshops in small groups: a stylist holds cloth to
                your face in daylight and reads what each colour does for you.
              </p>
            </Reveal>
            <ol className="sty-col__steps">
              {WORKSHOP_STEPS.map((st, i) => (
                <Reveal as="li" key={st.title} delay={0.16 + i * 0.08} className="sty-col__step">
                  <span className="numeral sty-col__step-n">{ROMAN[i]}</span>
                  <span className="sty-col__step-text">
                    <span className="h3 sty-col__step-title">{st.title}</span>
                    <span className="body sty-col__step-body">{st.body}</span>
                  </span>
                </Reveal>
              ))}
            </ol>
            <Reveal delay={0.3} className="sty-col__workshop-cta">
              <Button variant="outline" to="/custom#book" cursor="Book">
                Book a colour analysis
              </Button>
            </Reveal>
          </div>

          <figure className="sty-col__workshop-card">
            <PaletteCard />
            <figcaption className="sty-col__workshop-cap">
              <span className="numeral">Fig. ii</span>
              <span className="label-sm">The palette card every client takes home — painted, not printed</span>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  )
}
