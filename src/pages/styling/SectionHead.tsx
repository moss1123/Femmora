import type { ReactNode } from 'react'
import { Eyebrow, Reveal, SplitReveal } from '../../components/Reveal'

/**
 * Editorial section header used across the Styling page.
 * The real heading is an sr-only <h2> (so assistive tech hears the clean title once);
 * the visual title is a masked SplitText reveal, hidden from the accessibility tree.
 */
export default function SectionHead({
  id,
  numeral,
  eyebrow,
  label,
  title,
  lead,
  className = '',
}: {
  /** id for the sr-only heading — reference it from the section's aria-labelledby */
  id: string
  numeral?: string
  eyebrow: string
  /** plain-text title for the accessible heading */
  label: string
  /** visual title (may contain .sty-em spans) */
  title: ReactNode
  lead?: ReactNode
  className?: string
}) {
  return (
    <header className={`sty-head ${className}`}>
      <Reveal className="sty-head__eyebrow">
        <Eyebrow numeral={numeral}>{eyebrow}</Eyebrow>
      </Reveal>
      <h2 id={id} className="sr-only">
        {label}
      </h2>
      <div className="sty-head__title" aria-hidden="true">
        <SplitReveal as="p" className="h1">
          {title}
        </SplitReveal>
      </div>
      {lead && (
        <Reveal delay={0.12} className="sty-head__lead">
          <p className="lead">{lead}</p>
        </Reveal>
      )}
    </header>
  )
}
