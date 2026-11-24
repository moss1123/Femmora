import { useEffect, useId, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView } from 'motion/react'
import Button from '../../components/Button'
import { TIERS } from '../../data/site'
import { usePageReady } from '../../hooks/useGo'
import { gsap, useGSAP, prefersReducedMotion } from '../../lib/motion'
import SectionHead from './SectionHead'
import Flat from './Flat'
import type { FlatId } from './flats'
import { BUNDLES, CAPSULE, CAPSULE_GROUPS, type Bundle, type CapsuleGroup, type CapsulePiece } from './content'
import { EASE_LUX, SILK, SNAP, pad2 } from './motionPresets'
import './Capsule.css'

type Outfit = Record<CapsuleGroup, FlatId>

const GROUPS = CAPSULE_GROUPS.map((g) => ({ ...g, pieces: CAPSULE.filter((p) => p.group === g.key) }))
const nameOf = (id: FlatId) => CAPSULE.find((p) => p.id === id)?.name ?? ''
const CONSULT = TIERS.find((t) => t.id === 'consult')!

const sameSet = (a: FlatId[], b: FlatId[]) => a.length === b.length && a.every((x) => b.includes(x))
/** outfits a set of pieces makes: tops × bottoms × layers */
const outfitsOf = (pieces: FlatId[]) =>
  CAPSULE_GROUPS.reduce((n, g) => n * CAPSULE.filter((p) => p.group === g.key && pieces.includes(p.id)).length, 1)

/** Pick a random item, avoiding `avoid` when there is any other choice. */
function draw<T>(list: T[], avoid?: T): T {
  const pool = list.length > 1 && avoid !== undefined ? list.filter((x) => x !== avoid) : list
  return pool[Math.floor(Math.random() * pool.length)]
}

/**
 * The capsule: the consultation's ten interchangeable pieces (or a Core bundle as a starting point),
 * a live outfit count and a "decide for me" draw.
 */
export default function Capsule() {
  const uid = useId()
  const root = useRef<HTMLElement>(null)
  const meter = useRef<HTMLDivElement>(null)
  const numRef = useRef<HTMLSpanElement>(null)
  const rail = useRef<HTMLDivElement>(null)
  const ready = usePageReady()
  const railIn = useInView(rail, { once: true, amount: 0.12 })
  const show = ready && railIn

  const [owned, setOwned] = useState<FlatId[]>(() => CAPSULE.map((p) => p.id))
  const [outfit, setOutfit] = useState<Outfit | null>(null)
  const [hint, setHint] = useState<{ group: CapsuleGroup; text: string } | null>(null)

  const live = GROUPS.map((g) => ({ ...g, live: g.pieces.filter((p) => owned.includes(p.id)) }))
  const count = (k: CapsuleGroup) => live.find((g) => g.key === k)!.live.length
  const total = live.reduce((n, g) => n * g.live.length, 1)

  // Which outfit number (of `total`) the drawn combination is, in the capsule's own order.
  const outfitNo = outfit
    ? (() => {
        const [t, b, l] = live.map((g) => g.live.findIndex((p) => p.id === outfit[g.key]))
        return t * count('bottoms') * count('layers') + b * count('layers') + l + 1
      })()
    : 0

  const activeBundle = BUNDLES.find((b) => sameSet(b.pieces, owned))?.id ?? null

  const applyBundle = (b: Bundle) => {
    setHint(null)
    setOutfit(null)
    setOwned(b.pieces)
  }

  const toggle = (piece: CapsulePiece) => {
    const group = live.find((g) => g.key === piece.group)!
    const isIn = owned.includes(piece.id)
    if (isIn && group.live.length === 1) {
      setHint({ group: piece.group, text: `Keep at least one ${group.singular} — every outfit needs one.` })
      return
    }
    setHint(null)
    setOwned((o) => (isIn ? o.filter((id) => id !== piece.id) : [...o, piece.id]))
    if (isIn && outfit?.[piece.group] === piece.id) setOutfit(null)
  }

  const decide = () => {
    const pick = (k: CapsuleGroup) =>
      draw(
        live.find((g) => g.key === k)!.live.map((p) => p.id),
        outfit?.[k],
      )
    setHint(null)
    setOutfit({ tops: pick('tops'), bottoms: pick('bottoms'), layers: pick('layers') })
  }

  // The hint fades by itself.
  useEffect(() => {
    if (!hint) return
    const t = window.setTimeout(() => setHint(null), 3600)
    return () => window.clearTimeout(t)
  }, [hint])

  /* ── The counter: scrubbed up from 00 by the scroll, then eased to every new total ── */
  const counter = useRef({ p: 0, t: total })
  const paint = () => {
    const el = numRef.current
    if (el) el.textContent = pad2(counter.current.p * counter.current.t)
  }

  useGSAP(
    () => {
      const q = gsap.utils.selector(root)
      if (prefersReducedMotion()) {
        counter.current.p = 1
        paint()
        return
      }
      gsap.to(counter.current, {
        p: 1,
        ease: 'none',
        onUpdate: paint,
        scrollTrigger: { trigger: meter.current, start: 'top 88%', end: 'top 38%', scrub: 0.6 },
      })
      // the hairline under the total draws with the same scroll
      gsap.fromTo(
        q('.sty-cap__total-rule'),
        { scaleX: 0 },
        { scaleX: 1, ease: 'none', scrollTrigger: { trigger: meter.current, start: 'top 88%', end: 'top 38%', scrub: 0.6 } },
      )
      // group heads: the hairline sweeps in as each group arrives
      q('.sty-cap__group-head').forEach((el) => {
        gsap.fromTo(
          el,
          { '--sty-rule': 0 },
          { '--sty-rule': 1, duration: 1.4, ease: 'silk', scrollTrigger: { trigger: el, start: 'top 90%', once: true } },
        )
      })
    },
    { scope: root },
  )

  useGSAP(
    () => {
      if (prefersReducedMotion()) {
        gsap.killTweensOf(counter.current, 't')
        counter.current.t = total
        paint()
        return
      }
      gsap.to(counter.current, { t: total, duration: 0.9, ease: 'lux', overwrite: 'auto', onUpdate: paint })
    },
    { dependencies: [total], scope: root },
  )

  const announce = hint?.text ?? `${count('tops')} tops, ${count('bottoms')} bottoms and ${count('layers')} layers make ${total} outfits.`

  return (
    <section id="sty-capsule" ref={root} className="section sty-cap" data-theme="ivory" aria-labelledby={`${uid}-title`}>
      <div className="container sty-cap__layout">
        {/* ── Aside: the arithmetic ── */}
        <div className="sty-cap__aside">
          <SectionHead
            id={`${uid}-title`}
            numeral="04"
            eyebrow="The capsule"
            label="The capsule"
            title={
              <>
                Ten pieces, <span className="sty-em">decided once.</span>
              </>
            }
            lead="Every Premium Wardrobe Consultation ends in a capsule of eight to twelve pieces where every top works with every bottom and every layer works over both. Here are ten — the outfits multiply while the decisions disappear."
          />

          <div className="sty-cap__console">
          <div className="sty-cap__meter" ref={meter}>
            <p className="sty-cap__eq" aria-hidden>
              {live.map((g, i) => (
                <span key={g.key} className="sty-cap__term">
                  {i > 0 && <span className="sty-cap__op">×</span>}
                  <span className="sty-cap__term-n">
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.span
                        key={g.live.length}
                        className="numeral"
                        initial={{ opacity: 0, y: '60%' }}
                        animate={{ opacity: 1, y: '0%' }}
                        exit={{ opacity: 0, y: '-60%' }}
                        transition={SNAP}
                      >
                        {g.live.length}
                      </motion.span>
                    </AnimatePresence>
                  </span>
                  <span className="label-sm">{g.live.length === 1 ? g.singular : g.plural}</span>
                </span>
              ))}
            </p>

            <div className="sty-cap__total" aria-hidden>
              <span className="sty-cap__eqsign">=</span>
              <span className="numeral sty-cap__num" ref={numRef}>
                00
              </span>
              <span className="sty-cap__total-label">
                <span className="label-sm">outfits</span>
                <span className="sty-cap__total-sub">from {owned.length} pieces</span>
              </span>
            </div>
            <span className="sty-cap__total-rule" aria-hidden />
            <p className="sr-only" aria-live="polite">
              {announce}
            </p>
          </div>

          <p className="body sty-cap__copy">
            Select a piece to take it out of the capsule — or put it back — and watch the arithmetic change. Then let the
            capsule choose for you. That is the morning decision, removed.
          </p>

          <div className="sty-cap__actions">
            <Button variant="solid" type="button" onClick={decide} cursor="Decide">
              {outfit ? 'Decide again' : 'Decide for me'}
            </Button>
            <AnimatePresence>
              {outfit && (
                <motion.button
                  key="clear"
                  type="button"
                  className="sty-cap__clear label-sm"
                  onClick={() => setOutfit(null)}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={SILK}
                >
                  Clear
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          <div className="sty-cap__today" aria-live="polite">
            <AnimatePresence mode="wait" initial={false}>
              {outfit ? (
                <motion.div
                  key={`${outfit.tops}-${outfit.bottoms}-${outfit.layers}`}
                  className="sty-cap__today-card"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8, transition: { duration: 0.22 } }}
                  transition={{ duration: 0.7, ease: EASE_LUX }}
                >
                  <p className="label-sm sty-cap__today-kicker">
                    Today <span aria-hidden>·</span> outfit {outfitNo} of {total}
                  </p>
                  <ol className="sty-cap__today-list">
                    {GROUPS.map((g) => (
                      <li key={g.key}>
                        <span className="label-sm">{g.singular}</span>
                        <span className="sty-cap__today-name">{nameOf(outfit[g.key])}</span>
                      </li>
                    ))}
                  </ol>
                </motion.div>
              ) : (
                <motion.p
                  key="empty"
                  className="sty-cap__today-empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.2 } }}
                >
                  One top, one bottom, one layer — chosen for you from the pieces you keep.
                </motion.p>
              )}
            </AnimatePresence>
          </div>
          </div>
        </div>

        {/* ── Rail: start from a set, then the ten pieces ── */}
        <div className="sty-cap__rail" ref={rail}>
          <fieldset className="sty-cap__sets">
            <legend className="label-sm sty-cap__sets-legend">
              <span className="numeral">a.</span> Start from a set
            </legend>
            <div className="sty-cap__sets-list">
              {BUNDLES.map((b) => {
                const on = b.id === activeBundle
                const consult = b.id === 'consult'
                return (
                  <label key={b.id} className={`sty-cap__set ${on ? 'is-on' : ''} ${consult ? 'is-consult' : ''}`} data-cursor="">
                    <input
                      type="radio"
                      className="sty-radio"
                      name={`${uid}-set`}
                      value={b.id}
                      checked={on}
                      onChange={() => applyBundle(b)}
                    />
                    {on && <motion.span layoutId={`${uid}-set-mark`} className="sty-cap__set-mark" transition={SILK} aria-hidden />}
                    <span className="label-sm sty-cap__set-kind">{b.kind}</span>
                    <span className="sty-cap__set-name">{b.name}</span>
                    <span className="sty-cap__set-note">{b.note}</span>
                    <span className="sty-cap__set-dots" aria-hidden>
                      {CAPSULE.map((p) => (
                        <span key={p.id} className={b.pieces.includes(p.id) ? 'is-in' : ''} />
                      ))}
                    </span>
                    <span className="label-sm sty-cap__set-meta">
                      {b.pieces.length} pieces · {outfitsOf(b.pieces)} outfits
                      <span className="sty-cap__set-price">
                        {consult ? `${CONSULT.price} · styling session included` : 'Sold as a set · how-to-wear card'}
                      </span>
                    </span>
                  </label>
                )
              })}
            </div>
            <p className="sty-cap__sets-status">
              {activeBundle ? (
                <>
                  Showing <em>{BUNDLES.find((b) => b.id === activeBundle)!.name}</em>.
                </>
              ) : (
                <>
                  Your own edit — {owned.length} {owned.length === 1 ? 'piece' : 'pieces'}.
                </>
              )}
            </p>
          </fieldset>

          {live.map((g) => (
            <div key={g.key} className="sty-cap__group" role="group" aria-labelledby={`${uid}-${g.key}`}>
              <div className="sty-cap__group-head">
                <p id={`${uid}-${g.key}`} className="label sty-cap__group-title">
                  <span className="numeral sty-cap__group-n">{['b.', 'c.', 'd.'][CAPSULE_GROUPS.findIndex((x) => x.key === g.key)]}</span>
                  {g.label}
                </p>
                <p className="sty-cap__group-count">
                  <span className="numeral">{g.live.length}</span>
                  <span className="label-sm"> of {g.pieces.length} in the capsule</span>
                </p>
              </div>

              <ul className={`sty-cap__grid sty-cap__grid--${g.key}`}>
                {g.pieces.map((p) => {
                  const on = owned.includes(p.id)
                  const picked = outfit?.[g.key] === p.id
                  const order = CAPSULE.indexOf(p)
                  return (
                    <li key={p.id}>
                      <button
                        type="button"
                        className={`sty-cap__piece ${on ? 'is-on' : 'is-off'} ${picked ? 'is-picked' : ''}`}
                        aria-pressed={on}
                        onClick={() => toggle(p)}
                        data-cursor={on ? 'Remove' : 'Add'}
                      >
                        {picked && (
                          <motion.span layoutId={`${uid}-halo-${g.key}`} className="sty-cap__halo" transition={SILK} aria-hidden />
                        )}
                        <span className="sty-cap__fig" aria-hidden>
                          <Flat id={p.id} state={show ? 'visible' : 'hidden'} delay={0.1 + order * 0.08} weight={1.05} speed={1.1} />
                        </span>
                        <span className="sty-cap__name">{p.name}</span>
                        <span className="label-sm sty-cap__detail">{p.detail}</span>
                        <span className="sty-cap__mark" aria-hidden>
                          <svg viewBox="0 0 12 12" focusable="false">
                            {on ? (
                              <path d="M2.5 6.2 L5 8.6 L9.6 3.6" fill="none" stroke="currentColor" strokeWidth="1.1" />
                            ) : (
                              <path d="M6 2.5 V9.5 M2.5 6 H9.5" fill="none" stroke="currentColor" strokeWidth="1.1" />
                            )}
                          </svg>
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>

              <AnimatePresence>
                {hint?.group === g.key && (
                  <motion.p
                    key={`hint-${g.key}`}
                    className="sty-cap__hint"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4, transition: { duration: 0.2 } }}
                    transition={SILK}
                  >
                    <span className="sty-diamond" aria-hidden />
                    {hint.text}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
