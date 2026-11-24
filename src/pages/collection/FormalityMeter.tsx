import { FORMALITY, FORMALITY_LEVELS, type FormalityLevel } from '../../data/products'
import './FormalityMeter.css'

/**
 * Differentiator III — a clear formality level on every piece.
 * Four gold hairline bars (I Smart casual → IV Formal) with the level's numeral and name.
 */
export default function FormalityMeter({
  level,
  size = 'sm',
  className = '',
}: {
  level: FormalityLevel
  size?: 'sm' | 'lg'
  className?: string
}) {
  const f = FORMALITY[level]
  return (
    <span className={`col-fm col-fm--${size} ${className}`}>
      <span className="col-fm__bars" aria-hidden>
        {FORMALITY_LEVELS.map((l) => (
          <span key={l} className={`col-fm__bar ${l <= level ? 'is-on' : ''}`} />
        ))}
      </span>
      <span className="col-fm__text">
        <span className="sr-only">Formality level </span>
        <span className="numeral col-fm__n">{f.numeral}</span>
        <span className="sr-only"> of IV,</span>
        <span className="col-fm__label">{f.label}</span>
      </span>
    </span>
  )
}
