import { memo, useRef, useState, type CSSProperties } from 'react'
import { motion, useInView } from 'motion/react'
import GarmentFlat from './GarmentFlat'
import FormalityMeter from './FormalityMeter'
import { EASE } from './format'
import { usePageReady } from '../../hooks/useGo'
import { prefersReducedMotion } from '../../lib/motion'
import { formatPKR } from '../../store/cart'
import { isMtm, type Product } from '../../data/products'

export interface QuickTarget {
  id: string
  colour: number
}

interface Props {
  product: Product
  hidden: boolean
  /** position among visible cards → editorial slot (0–4) */
  slot: number
  /** alternation among visible cards (0 | 1) for tablet / mobile stagger */
  alt: number
  /** colourway to show by default (first match for the active colour filter) */
  preferred: number
  onQuickView: (t: QuickTarget) => void
}

/**
 * One piece in the editorial grid: a gold-hairline technical flat hanging from the rail,
 * re-coloured live from the colour dots. The whole media area opens the quick view.
 */
function ProductCard({ product: p, hidden, slot, alt, preferred, onQuickView }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const ready = usePageReady()
  const inView = useInView(ref, { once: true, amount: 0.12 })
  // a dot picked under one colour filter is forgotten when the filter changes
  const [pick, setPick] = useState<{ i: number; under: number } | null>(null)
  const sel = pick && pick.under === preferred ? pick.i : preferred
  const colour = p.colours[sel] ?? p.colours[0]
  const reduced = prefersReducedMotion()
  const mtm = isMtm(p)
  const titleId = `col-card-${p.id}`

  return (
    <article
      className={`col-card ${hidden ? 'is-hidden' : ''}`}
      data-slot={slot}
      data-alt={alt}
      data-flip-id={p.id}
      aria-labelledby={titleId}
    >
      <motion.div
        ref={ref}
        className="col-card__inner"
        initial={reduced ? false : { opacity: 0, y: 64 }}
        animate={inView && ready ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 1.25, ease: EASE, delay: (slot % 3) * 0.08 }}
      >
        <button
          type="button"
          className="col-card__media"
          onClick={() => onQuickView({ id: p.id, colour: sel })}
          aria-haspopup="dialog"
          aria-label={`Quick view — ${p.name}, ${colour.name}`}
          data-cursor="View"
        >
          <span className="col-card__rail" aria-hidden />
          <span className="col-card__flat-art" aria-hidden>
            <GarmentFlat kind={p.garment} colour={colour.hex} texture={p.texture} />
          </span>
          <span className="col-card__no numeral" aria-hidden>
            No. {p.no}
          </span>
          {mtm && (
            <span className="col-card__tag label-sm" aria-hidden>
              Made to measure
            </span>
          )}
          <span className="col-card__mood label-sm" aria-hidden>
            {p.mood}
          </span>
          <span className="col-card__frame" aria-hidden />
          <span className="col-card__qv label-sm" aria-hidden>
            <span>Quick view</span>
            <svg viewBox="0 0 28 10" aria-hidden>
              <path d="M0 5h26M22 1l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1" />
            </svg>
          </span>
        </button>

        <div className="col-card__info">
          <div className="col-card__row">
            <p className="label-sm col-card__cat">{p.category}</p>
            <div className="col-card__dots" role="group" aria-label={`Colours — ${p.name}`}>
              {p.colours.map((c, i) => (
                <button
                  key={c.name}
                  type="button"
                  className="col-dot"
                  style={{ '--dot': c.hex } as CSSProperties}
                  aria-pressed={i === sel}
                  aria-label={c.name}
                  title={c.name}
                  onClick={() => setPick({ i, under: preferred })}
                />
              ))}
            </div>
          </div>
          <h3 id={titleId} className="col-card__name">
            {p.name}
          </h3>
          <p className="col-card__short">
            {p.short} <span className="col-card__colour">— {colour.name}</span>
          </p>
          <div className="col-card__foot">
            <p className="col-card__price">
              <span>{formatPKR(p.price)}</span>
              {mtm && p.mtmPrice !== undefined && (
                <span className="col-card__price-note">Made to measure · {formatPKR(p.mtmPrice)}</span>
              )}
            </p>
            <FormalityMeter level={p.formality} className="col-card__fm" />
          </div>
        </div>
      </motion.div>
    </article>
  )
}

export default memo(ProductCard)
