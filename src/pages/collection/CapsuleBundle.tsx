import { useId, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'motion/react'
import GarmentFlat from './GarmentFlat'
import { EASE, ROMAN, cap, pad, word } from './format'
import Button from '../../components/Button'
import { Eyebrow, Reveal, SplitReveal } from '../../components/Reveal'
import { formatPKR, useCart } from '../../store/cart'
import {
  CAPSULES,
  FORMALITY,
  SIZES,
  capsulePrice,
  productById,
  type Capsule,
  type FormalityLevel,
  type Product,
} from '../../data/products'
import './CapsuleBundle.css'

const shortName = (p: Product) => p.name.replace(/^The /, '')
/* every capsule is five pieces worn eight ways — the headline is set once, from the first */
const HEAD_PIECES = CAPSULES[0].pieces.length
const HEAD_LOOKS = CAPSULES[0].looks.length

/**
 * II — Capsule bundles. Core pieces sold as a set with the printed how-to-wear card —
 * one set, one price (the Core prices added together, never discounted).
 * Tabs switch between the Western and the Fusion capsule; each look on the card lights
 * up the pieces it is made from.
 */
export default function CapsuleBundle() {
  const [tab, setTab] = useState(0)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  const reduced = useReducedMotion()
  const capsule = CAPSULES[tab]

  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    const last = CAPSULES.length - 1
    let next = tab
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = tab === last ? 0 : tab + 1
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = tab === 0 ? last : tab - 1
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = last
    else return
    e.preventDefault()
    setTab(next)
    tabs.current[next]?.focus()
  }

  return (
    <section className="section col-cap" data-theme="noir" aria-label="Capsule bundles" id="capsule-bundles">
      <div className="container">
        <div className="col-cap__head">
          <div>
            <Eyebrow numeral="II">Capsule bundles</Eyebrow>
            <SplitReveal as="h2" className="h1 col-cap__title">
              {cap(word(HEAD_PIECES))} pieces. <em className="gold-text">{cap(word(HEAD_LOOKS))}</em> outfits.
              <br />
              One card in the box.
            </SplitReveal>
          </div>
          <Reveal className="col-cap__intro" delay={0.1}>
            <p className="body">
              Core pieces sold as a set, with the printed how-to-wear card in the rigid box. One set, one price — simply
              the Core prices added together. Choose a capsule, then any look on the card to see which pieces make it.
            </p>
            <p className="col-cap__promise label-sm">No sales · No discount codes · Ever</p>
          </Reveal>
        </div>

        <LayoutGroup id="col-cap-tabs">
          <div className="col-cap__tabs" role="tablist" aria-label="Choose a capsule">
            {CAPSULES.map((c, i) => (
              <button
                key={c.id}
                ref={(el) => {
                  tabs.current[i] = el
                }}
                type="button"
                role="tab"
                id={`col-cap-tab-${c.id}`}
                aria-selected={i === tab}
                aria-controls={`col-cap-panel-${c.id}`}
                tabIndex={i === tab ? 0 : -1}
                className="col-cap__tab"
                onClick={() => setTab(i)}
                onKeyDown={onTabKey}
              >
                <span className="numeral col-cap__tab-n" aria-hidden>
                  {ROMAN[i]}
                </span>
                <span className="col-cap__tab-t">{c.name}</span>
                <span className="col-cap__tab-s label-sm">{c.short}</span>
                {i === tab && (
                  <motion.span
                    layoutId="col-cap-tab-line"
                    className="col-cap__tab-line"
                    transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 360, damping: 36 }}
                  />
                )}
              </button>
            ))}
          </div>
        </LayoutGroup>

        <AnimatePresence mode="wait" initial={false}>
          <CapsulePanel key={capsule.id} capsule={capsule} reduced={!!reduced} />
        </AnimatePresence>
      </div>
    </section>
  )
}

/* ==========================================================================
   One capsule: the set on its rail · the how-to-wear card
   ========================================================================== */

function CapsulePanel({ capsule, reduced }: { capsule: Capsule; reduced: boolean }) {
  const [look, setLook] = useState(0)
  const [size, setSize] = useState<string | null>(null)
  const [error, setError] = useState(false)
  const sizesRef = useRef<HTMLDivElement>(null)
  const add = useCart((s) => s.add)
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')

  const pieces = capsule.pieces
    .map((pc) => {
      const p = productById(pc.id)
      return p ? { p, colour: p.colours[pc.colour] ?? p.colours[0] } : null
    })
    .filter((x): x is { p: Product; colour: Product['colours'][number] } => !!x)
  const price = capsulePrice(capsule)
  const active = capsule.looks[look]
  const pieceOf = (id: string) => pieces.find((x) => x.p.id === id)
  const levels = capsule.looks.map((l) => l.formality)
  const lowest = FORMALITY[Math.min(...levels) as FormalityLevel].label
  const highest = FORMALITY[Math.max(...levels) as FormalityLevel].label

  const onAdd = () => {
    if (!size) {
      setError(true)
      sizesRef.current?.querySelector<HTMLInputElement>('input')?.focus()
      return
    }
    add({
      productId: capsule.id,
      name: capsule.name,
      price,
      size,
      fit: 'standard',
      colour: capsule.colourway,
    })
  }

  return (
    <motion.div
      role="tabpanel"
      id={`col-cap-panel-${capsule.id}`}
      aria-labelledby={`col-cap-tab-${capsule.id}`}
      tabIndex={0}
      className="col-cap__panel"
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } }}
      exit={{ opacity: 0, y: reduced ? 0 : -12, transition: { duration: 0.28 } }}
    >
      {/* ---------- the set ---------- */}
      <div className="col-cap__set">
        <div className="col-cap__rail-wrap">
          <span className="col-cap__rail" aria-hidden />
          <ul className="col-cap__pieces" aria-label={`The ${pieces.length} pieces in ${capsule.name}`}>
            {pieces.map(({ p, colour }, i) => {
              const lit = active.pieces.includes(p.id)
              return (
                <motion.li
                  key={p.id}
                  className={`col-cap__piece ${lit ? 'is-lit' : ''}`}
                  animate={{ opacity: lit ? 1 : 0.34, y: lit && !reduced ? -6 : 0 }}
                  transition={{ duration: 0.6, ease: EASE }}
                >
                  <span className="col-cap__piece-art" aria-hidden style={{ '--d': `${i * 0.08}s` } as CSSProperties}>
                    <GarmentFlat kind={p.garment} colour={colour.hex} texture={p.texture} />
                  </span>
                  <span className="col-cap__piece-name">{shortName(p)}</span>
                  <span className="col-cap__piece-meta">
                    {colour.name} · {formatPKR(p.price)}
                  </span>
                  {lit && <span className="sr-only"> — in the selected look</span>}
                </motion.li>
              )
            })}
          </ul>
        </div>

        <dl className="col-cap__sum">
          <div>
            <dt className="label-sm">Pieces</dt>
            <dd className="numeral">{pad(pieces.length)}</dd>
          </div>
          <div>
            <dt className="label-sm">Outfits</dt>
            <dd className="numeral">{pad(capsule.looks.length)}</dd>
          </div>
          <div className="col-cap__sum-price">
            <dt className="label-sm">The set · one price</dt>
            <dd>
              <span className="col-cap__price">{formatPKR(price)}</span>
              <span className="col-cap__price-note">the {word(pieces.length)} Core prices, added together</span>
            </dd>
          </div>
        </dl>

        <fieldset className={`col-cap__size ${error ? 'has-error' : ''}`} aria-describedby={`col-cap-err-${uid}`}>
          <legend className="label-sm">Size for the set</legend>
          <div ref={sizesRef} className="col-cap__sizes">
            {SIZES.map((s) => (
              <label key={s} className="col-cap__size-opt">
                <input
                  type="radio"
                  className="sr-only"
                  name={`col-cap-size-${uid}`}
                  value={s}
                  checked={size === s}
                  onChange={() => {
                    setSize(s)
                    setError(false)
                  }}
                />
                <span>{s}</span>
              </label>
            ))}
          </div>
          <p id={`col-cap-err-${uid}`} className="col-cap__error" role="alert">
            {error ? 'Choose a size for the set.' : ''}
          </p>
        </fieldset>

        <div className="col-cap__actions">
          <Button variant="gold" type="button" className="col-cap__add" onClick={onAdd} cursor="Add">
            Add the set to bag · {formatPKR(price)}
          </Button>
          <p className="col-cap__fine">
            Arrives in one rigid box with its how-to-wear card. Different sizes for top and trouser? Tell the WhatsApp
            Concierge after checkout.
          </p>
        </div>
      </div>

      {/* ---------- the rigid box, and the card inside it ---------- */}
      <div className="col-cap__box">
        <span className="col-cap__box-label label-sm" aria-hidden>
          Femmora · Rigid box
        </span>
        <div className="col-cap__card" data-theme="ivory">
          <div className="col-cap__card-head">
            <p className="col-cap__wordmark">Femmora</p>
            <p className="label-sm col-cap__card-k">How to wear</p>
            <h3 className="col-cap__card-title">{capsule.name}</h3>
            <p className="col-cap__card-sub">
              {cap(word(pieces.length))} pieces, worn {word(capsule.looks.length)} ways — from {lowest} to {highest}.
            </p>
          </div>
          <ol className="col-cap__looks">
            {capsule.looks.map((l, i) => {
              const f = FORMALITY[l.formality]
              return (
                <li key={l.name}>
                  <button
                    type="button"
                    className="col-cap__look"
                    aria-pressed={i === look}
                    onClick={() => setLook(i)}
                    onMouseEnter={() => setLook(i)}
                    onFocus={() => setLook(i)}
                  >
                    <span className="numeral col-cap__look-n" aria-hidden>
                      {ROMAN[i]}
                    </span>
                    <span className="col-cap__look-main">
                      <span className="col-cap__look-name">{l.name}</span>
                      <span className="col-cap__look-when">{l.when}</span>
                      <span className="sr-only">
                        : {l.pieces.map((id) => {
                          const x = pieceOf(id)
                          return x ? shortName(x.p) : id
                        }).join(', ')}.
                      </span>
                    </span>
                    <span className="col-cap__chips" aria-hidden>
                      {l.pieces.map((id) => (
                        <span key={id} className="col-cap__chip" style={{ '--c': pieceOf(id)?.colour.hex ?? '#6e1423' } as CSSProperties} />
                      ))}
                    </span>
                    <span className="col-cap__look-level">
                      <span className="sr-only">Formality </span>
                      <span className="numeral">{f.numeral}</span> {f.label}
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>
          <p className="col-cap__card-foot">Printed on heavy card · kept in the lid of the box</p>
        </div>
      </div>
    </motion.div>
  )
}
