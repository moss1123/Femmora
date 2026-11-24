import { useId, useRef, useState, type CSSProperties } from 'react'
import { AnimatePresence, LayoutGroup, motion, useInView } from 'motion/react'
import { Reveal } from '../../components/Reveal'
import Button from '../../components/Button'
import { usePageReady } from '../../hooks/useGo'
import SectionHead from './SectionHead'
import Flat from './Flat'
import InkWipe from './InkWipe'
import { flatAspect, type FlatId } from './flats'
import { HERO_PIECES, HUES, LOOK_OCCASIONS, ROMAN, levelName, type WayKey } from './content'
import { GLIDE, SILK, panelVariants } from './motionPresets'
import './ThreeWays.css'

/* The board is a 100 × 82 unit sheet; every placement is in those units. */
const BOARD_H = 82

interface Box {
  x: number
  y: number
  w: number
  h: number
}
interface Template {
  hero: Box
  slots: [Box, Box]
  acc: [Box, Box, Box]
}

/** Each occasion re-composes the card, so the hero piece glides to a new mark. */
const TEMPLATES: Record<WayKey, Template> = {
  boardroom: {
    hero: { x: 33, y: 3, w: 34, h: 54 },
    slots: [
      { x: 2, y: 8, w: 28, h: 44 },
      { x: 70, y: 8, w: 28, h: 44 },
    ],
    acc: [
      { x: 5, y: 61, w: 22, h: 16 },
      { x: 39, y: 61, w: 22, h: 16 },
      { x: 73, y: 61, w: 22, h: 16 },
    ],
  },
  fusion: {
    hero: { x: 3, y: 3, w: 36, h: 57 },
    slots: [
      { x: 42, y: 6, w: 27, h: 44 },
      { x: 71, y: 6, w: 27, h: 44 },
    ],
    acc: [
      { x: 43, y: 58, w: 17, h: 19 },
      { x: 62, y: 58, w: 17, h: 19 },
      { x: 81, y: 58, w: 17, h: 19 },
    ],
  },
  evening: {
    hero: { x: 61, y: 3, w: 36, h: 57 },
    slots: [
      { x: 3, y: 6, w: 27, h: 44 },
      { x: 31, y: 6, w: 27, h: 44 },
    ],
    acc: [
      { x: 3, y: 58, w: 17, h: 19 },
      { x: 22, y: 58, w: 17, h: 19 },
      { x: 41, y: 58, w: 17, h: 19 },
    ],
  },
}

/** which accessory marks to use for 1, 2 or 3 accessories (keeps the card balanced) */
const ACC_MARKS: Record<number, number[]> = { 1: [1], 2: [0, 2], 3: [0, 1, 2] }

/** Fit a drawing of the given aspect inside a box, centred — keeps scale uniform while it glides. */
function fit(box: Box, aspect: number): Box {
  let w = box.w
  let h = w / aspect
  if (h > box.h) {
    h = box.h
    w = h * aspect
  }
  return { x: box.x + (box.w - w) / 2, y: box.y + (box.h - h) / 2, w, h }
}

const place = (b: Box): CSSProperties => ({
  left: `${b.x}%`,
  top: `${(b.y / BOARD_H) * 100}%`,
  width: `${b.w}%`,
  height: `${(b.h / BOARD_H) * 100}%`,
})

interface BoardItem {
  id: FlatId
  n: number
  box: Box
}

export default function ThreeWays() {
  const uid = useId()
  const gridId = `sty-grid-${uid.replace(/[^\w-]/g, '')}`
  const [heroIdx, setHeroIdx] = useState(0)
  const [occ, setOcc] = useState<WayKey>('boardroom')
  const hero = HERO_PIECES[heroIdx]
  const look = hero.looks[occ]
  const occIdx = LOOK_OCCASIONS.findIndex((o) => o.key === occ)
  const occMeta = LOOK_OCCASIONS[occIdx]
  const tpl = TEMPLATES[occ]

  const boardRef = useRef<HTMLDivElement>(null)
  const pickRef = useRef<HTMLDivElement>(null)
  const ready = usePageReady()
  const inView = useInView(boardRef, { once: true, amount: 0.3 })
  // on a phone the picker sits a screen above the card, so its thumbnails draw on their own cue
  const pickIn = useInView(pickRef, { once: true, amount: 0.4 })
  const show = ready && inView
  const drawState = show ? 'visible' : 'hidden'
  const thumbState = ready && (pickIn || inView) ? 'visible' : 'hidden'

  const items: BoardItem[] = [
    ...look.companions.map((c, i) => ({ id: c.id, n: i + 2, box: fit(tpl.slots[i], flatAspect(c.id)) })),
    ...look.accessories.map((a, i) => ({
      id: a.id,
      n: look.companions.length + i + 2,
      box: fit(tpl.acc[ACC_MARKS[look.accessories.length][i]], flatAspect(a.id)),
    })),
  ]

  return (
    <section id="sty-three" className="section sty-three" data-theme="wine" aria-labelledby={`${uid}-title`}>
      <div className="container">
        <SectionHead
          id={`${uid}-title`}
          className="sty-head--wide sty-three__head"
          numeral="01"
          eyebrow="The card in every box"
          label="One trench, three ways"
          title={
            <>
              One trench, <span className="sty-em">three ways.</span>
            </>
          }
          lead="Every Femmora order arrives in a rigid box with a printed card: one piece, worn three ways. This is that card, brought to life — choose a trench, choose the hour, and watch the outfit rebuild itself around it."
        />

        <LayoutGroup id="sty-three">
          <div className="sty-three__layout">
            {/* ── Controls ── */}
            <Reveal className="sty-three__controls" delay={0.05}>
              <fieldset className="sty-pick">
                <legend className="label-sm sty-three__legend">
                  <span className="numeral">a.</span> Choose a trench from the rack
                </legend>
                <div className="sty-pick__list" ref={pickRef}>
                  {HERO_PIECES.map((p, i) => {
                    const on = i === heroIdx
                    return (
                      <label key={p.id} className={`sty-pick__opt ${on ? 'is-on' : ''}`} data-cursor="">
                        <input
                          type="radio"
                          className="sty-radio"
                          name={`${uid}-piece`}
                          value={p.id}
                          checked={on}
                          onChange={() => setHeroIdx(i)}
                        />
                        <span className="numeral sty-pick__num">{p.numeral}</span>
                        <span className="sty-pick__text">
                          <span className="sty-pick__name">{p.name}</span>
                          <span className="label-sm sty-pick__fabric">{p.fabric}</span>
                        </span>
                        <span className="sty-pick__thumb" aria-hidden>
                          <Flat
                            id={p.flat}
                            tint={p.tint}
                            ink={p.ink}
                            state={thumbState}
                            delay={0.2 + i * 0.12}
                            weight={0.8}
                            speed={1}
                          />
                        </span>
                        {on && <motion.span layoutId="sty-pick-mark" className="sty-pick__mark" transition={SILK} />}
                      </label>
                    )
                  })}
                </div>
              </fieldset>

              <fieldset className="sty-seg">
                <legend className="label-sm sty-three__legend">
                  <span className="numeral">b.</span> Choose the hour
                </legend>
                <div className="sty-seg__track">
                  {LOOK_OCCASIONS.map((o) => {
                    const on = o.key === occ
                    return (
                      <label key={o.key} className={`sty-seg__opt ${on ? 'is-on' : ''}`} data-cursor="">
                        <input
                          type="radio"
                          className="sty-radio"
                          name={`${uid}-occ`}
                          value={o.key}
                          checked={on}
                          onChange={() => setOcc(o.key)}
                        />
                        {on && <motion.span layoutId="sty-seg-mark" className="sty-seg__mark" transition={SILK} />}
                        <span className="sty-seg__time label-sm">{o.time}</span>
                        <span className="sty-seg__label">{o.label}</span>
                      </label>
                    )
                  })}
                </div>
              </fieldset>
            </Reveal>

            {/* ── The card ── */}
            <div className="sty-three__stagecol">
              <div className={`sty-card ${show ? 'is-in' : ''}`}>
                <span className="sty-card__corner sty-card__corner--tl" aria-hidden />
                <span className="sty-card__corner sty-card__corner--tr" aria-hidden />
                <span className="sty-card__corner sty-card__corner--bl" aria-hidden />
                <span className="sty-card__corner sty-card__corner--br" aria-hidden />

                <div className="sty-card__bar">
                  <span className="label-sm">Femmora — how to wear it</span>
                  <span className="sty-card__ref">
                    <span className="numeral">{hero.numeral}</span>
                    <span className="sty-card__dot" aria-hidden />
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.span
                        key={occ}
                        className="label-sm"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={SILK}
                      >
                        {occMeta.label} · {occMeta.time}
                      </motion.span>
                    </AnimatePresence>
                  </span>
                </div>

                <div className="sty-board" ref={boardRef}>
                  <svg className="sty-board__grid" aria-hidden focusable="false">
                    <defs>
                      <pattern id={gridId} width="28" height="28" patternUnits="userSpaceOnUse">
                        <path d="M14 11v6M11 14h6" stroke="currentColor" strokeWidth="0.6" fill="none" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill={`url(#${gridId})`} />
                  </svg>

                  {/* the hero piece: same element across every look, so it glides between marks */}
                  <motion.div layout className="sty-board__piece is-hero" style={place(tpl.hero)} transition={{ layout: GLIDE }}>
                    <motion.span layout="position" className="sty-board__n numeral" transition={{ layout: GLIDE }} aria-hidden>
                      1
                    </motion.span>
                    <AnimatePresence mode="wait">
                      <Flat
                        key={hero.id}
                        id={hero.flat}
                        tint={hero.tint}
                        ink={hero.ink}
                        state={drawState}
                        weight={1.15}
                        speed={1.1}
                        label={`Drawing of ${hero.name}`}
                      />
                    </AnimatePresence>
                  </motion.div>

                  <AnimatePresence mode="popLayout">
                    {items.map((it, k) => (
                      <motion.div
                        key={it.id}
                        layout
                        className="sty-board__piece"
                        style={place(it.box)}
                        transition={{ layout: GLIDE }}
                      >
                        <motion.span
                          className="sty-board__n numeral"
                          aria-hidden
                          initial={{ opacity: 0 }}
                          animate={{ opacity: show ? 1 : 0 }}
                          exit={{ opacity: 0, transition: { duration: 0.2 } }}
                          transition={{ duration: 0.6, delay: 0.5 + k * 0.08 }}
                        >
                          {it.n}
                        </motion.span>
                        <Flat id={it.id} state={drawState} delay={0.25 + k * 0.1} weight={1.05} speed={1.15} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <div className="sty-card__foot">
                  <span className="label-sm">Worn</span>
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={`${hero.id}-${occ}`}
                      className="sty-card__note"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6, transition: { duration: 0.2 } }}
                      transition={SILK}
                    >
                      {look.heroNote}
                    </motion.span>
                  </AnimatePresence>
                  <span className="sty-card__level label-sm">
                    Level <span className="numeral">{ROMAN[look.level - 1]}</span>
                  </span>
                </div>
              </div>

              <div className="sty-strip" role="list" aria-label={`Colour story: ${look.colours.map((c) => HUES[c].name).join(', ')}`}>
                {look.colours.map((c, i) => (
                  <div key={i} className="sty-strip__chip" role="listitem">
                    <InkWipe colour={HUES[c].css} from="up" delay={i * 0.08} className="sty-strip__ink" />
                    <span className="sty-strip__name">
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.span
                          key={c}
                          className="label-sm"
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6, transition: { duration: 0.18 } }}
                          transition={{ ...SILK, delay: i * 0.05 }}
                        >
                          {HUES[c].name}
                        </motion.span>
                      </AnimatePresence>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── The formula ── */}
            <div className="sty-formula">
              <p className="sr-only" aria-live="polite">
                {`${hero.name}, ${occMeta.label.toLowerCase()}: ${look.title}. Formality level ${look.level}, ${levelName(look.level)}.`}
              </p>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={`${hero.id}-${occ}`} className="sty-formula__body" initial="hidden" animate="visible" exit="exit">
                  <motion.p className="label-sm sty-formula__kicker" variants={panelVariants} custom={0}>
                    Way {occIdx + 1} of 3 <span aria-hidden>·</span> {hero.name}
                  </motion.p>
                  <motion.h3 className="h2 sty-formula__title" variants={panelVariants} custom={1}>
                    {look.title}
                  </motion.h3>

                  <motion.p className="sty-formula__level" variants={panelVariants} custom={1.5}>
                    <span className="numeral">{ROMAN[look.level - 1]}</span>
                    <span>
                      <span className="label-sm">Formality level</span>
                      <span className="sty-formula__level-name">{levelName(look.level)}</span>
                    </span>
                  </motion.p>

                  <motion.div className="sty-formula__block" variants={panelVariants} custom={2}>
                    <p className="label-sm sty-formula__label">The formula</p>
                    <ol className="sty-formula__list">
                      <li>
                        <span className="numeral">1</span>
                        <span className="sty-formula__piece">
                          {hero.name}
                          <span className="sty-formula__how">{look.heroNote}</span>
                        </span>
                      </li>
                      {look.companions.map((c, i) => (
                        <li key={c.id}>
                          <span className="numeral">{i + 2}</span>
                          <span className="sty-formula__piece">{c.name}</span>
                        </li>
                      ))}
                    </ol>
                  </motion.div>

                  <motion.div className="sty-formula__block" variants={panelVariants} custom={3}>
                    <p className="label-sm sty-formula__label">Finish with</p>
                    <ol className="sty-formula__list sty-formula__list--acc">
                      {look.accessories.map((a, i) => (
                        <li key={a.id}>
                          <span className="numeral">{look.companions.length + i + 2}</span>
                          <span className="sty-formula__piece">{a.name}</span>
                        </li>
                      ))}
                    </ol>
                  </motion.div>

                  <motion.div className="sty-formula__block sty-formula__why" variants={panelVariants} custom={4}>
                    <p className="label-sm sty-formula__label">Why it works</p>
                    <p className="body">{look.why}</p>
                  </motion.div>
                </motion.div>
              </AnimatePresence>

              <div className="sty-formula__cta">
                <Button variant="ghost" to="/collection" cursor="Shop">
                  Shop the trench
                </Button>
              </div>
            </div>
          </div>
        </LayoutGroup>
      </div>
    </section>
  )
}
