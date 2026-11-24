import { useId, useRef } from 'react'
import { useInView } from 'motion/react'
import TLink from '../../components/TLink'
import { Reveal } from '../../components/Reveal'
import { BRAND, TESTIMONIALS, TIERS } from '../../data/site'
import { gsap, useGSAP, prefersReducedMotion } from '../../lib/motion'
import { usePageReady } from '../../hooks/useGo'
import SectionHead from './SectionHead'
import Flat from './Flat'
import './StylingCTA.css'

/** A tailor's tape, drawn as hairline ticks — numbered every ten, long enough to span a 2,400 px screen at 1:1. */
const TAPE_CM = 240
function Tape() {
  const ticks: string[] = []
  const labels: { x: number; n: number }[] = []
  for (let i = 0; i <= TAPE_CM; i++) {
    const x = i * 10 + 0.5
    const h = i % 10 === 0 ? 16 : i % 5 === 0 ? 11 : 6
    ticks.push(`M${x} 1V${1 + h}`)
    if (i % 10 === 0 && i > 0) labels.push({ x, n: i })
  }
  const w = TAPE_CM * 10 + 1
  return (
    <svg className="sty-cta__tape-svg" viewBox={`0 0 ${w} 44`} preserveAspectRatio="xMinYMin slice" aria-hidden focusable="false">
      <path d={`M0 0.5H${w}M0 43.5H${w}`} stroke="currentColor" strokeWidth="1" fill="none" opacity="0.6" />
      <path d={ticks.join('')} stroke="currentColor" strokeWidth="1" fill="none" />
      {labels.map((l) => (
        <text key={l.n} x={l.x} y={33} textAnchor="middle">
          {l.n}
        </text>
      ))}
    </svg>
  )
}

const CONSULT = TIERS.find((t) => t.id === 'consult')!
const CORE = TIERS.find((t) => t.id === 'core')!
const MTM = TIERS.find((t) => t.id === 'mtm')!
const QUOTE = TESTIMONIALS[2]
const FLAGSHIP = BRAND.stores[0]
const lower = (price: string) => price.replace(/^From /, 'from ')
/** house style for ranges: "PKR 12,000–25,000" (closed en dash) */
const range = (price: string) => price.replace(/\s*[–-]\s*/, '–')

/**
 * Closing band of the "Dress the Woman You're Becoming" campaign: two doors — the Premium Wardrobe
 * Consultation, or the pieces themselves — then Made-to-Measure and where to find us.
 */
export default function StylingCTA() {
  const uid = useId()
  const root = useRef<HTMLElement>(null)
  const doors = useRef<HTMLDivElement>(null)
  const ready = usePageReady()
  const inView = useInView(doors, { once: true, amount: 0.3 })
  const draw = ready && inView ? 'visible' : 'hidden'

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.fromTo(
        '.sty-cta__tape',
        { clipPath: 'inset(0% 100% 0% 0%)' },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top 92%', end: 'top 30%', scrub: 0.8 },
        },
      )
      // opacity, not autoAlpha: the doors are links and must stay in the tab order before they have animated in
      gsap.fromTo(
        '.sty-cta__door',
        { y: 80, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.5,
          ease: 'lux',
          stagger: 0.14,
          scrollTrigger: { trigger: doors.current, start: 'top 85%', once: true },
        },
      )
    },
    { scope: root },
  )

  return (
    <section id="sty-consult" ref={root} className="section sty-cta" data-theme="parchment" aria-labelledby={`${uid}-title`}>
      <div className="sty-cta__tape" aria-hidden>
        <Tape />
      </div>

      <div className="container">
        <SectionHead
          id={`${uid}-title`}
          className="sty-head--center"
          eyebrow="Dress the woman you’re becoming"
          label="Style it yourself, or let us style it with you"
          title={
            <>
              Style it yourself — <span className="sty-em">or let us, with you.</span>
            </>
          }
          lead="Everything on this page is what our stylists do with you, in person: colour, silhouette, workwear, occasion and the capsule itself. Begin with a consultation, or with a single piece."
        />

        <div className="sty-cta__doors" ref={doors}>
          <TLink
            to="/custom#book"
            className="sty-cta__door sty-cta__door--consult"
            cursor="Book"
            aria-labelledby={`${uid}-consult-title ${uid}-consult-price ${uid}-consult-cta`}
          >
            <span className="sty-cta__arch" aria-hidden />
            <span className="sty-cta__door-art" aria-hidden>
              <Flat id="trench" tint="var(--ivory-50)" state={draw} weight={1} speed={1.4} delay={0.5} />
            </span>
            <span className="sty-cta__door-body">
              <span className="label-sm sty-cta__door-kicker">
                <span className="numeral">i.</span> The service
              </span>
              <span id={`${uid}-consult-title`} className="h3 sty-cta__door-title">
                {CONSULT.name}
              </span>
              <span className="sty-cta__door-price">
                <span id={`${uid}-consult-price`} className="numeral">
                  {lower(CONSULT.price)}
                </span>
                <span className="label-sm">per engagement · session + 8–12 pieces</span>
              </span>
              <span className="sty-cta__door-text">{CONSULT.blurb}</span>
              <span className="sty-cta__door-list">
                {CONSULT.includes.map((item) => (
                  <span key={item} className="sty-cta__door-item">
                    <span className="sty-diamond" aria-hidden />
                    {item}
                  </span>
                ))}
              </span>
              <span id={`${uid}-consult-cta`} className="sty-cta__door-cta label">
                Book a consultation
                <svg viewBox="0 0 28 10" aria-hidden focusable="false">
                  <path d="M0 5h26M22 1l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1" />
                </svg>
              </span>
            </span>
          </TLink>

          <TLink
            to="/collection"
            className="sty-cta__door sty-cta__door--shop"
            data-theme="wine"
            cursor="Shop"
            aria-labelledby={`${uid}-shop-title ${uid}-shop-price ${uid}-shop-cta`}
          >
            <span className="sty-cta__arch" aria-hidden />
            <span className="sty-cta__door-art" aria-hidden>
              <Flat id="trench" tint="var(--wine-600)" ink="var(--gold-300)" state={draw} weight={1} speed={1.4} delay={0.7} />
            </span>
            <span className="sty-cta__door-body">
              <span className="label-sm sty-cta__door-kicker">
                <span className="numeral">ii.</span> The collection
              </span>
              <span id={`${uid}-shop-title`} className="h3 sty-cta__door-title">
                Shop the pieces
              </span>
              <span className="sty-cta__door-price">
                <span id={`${uid}-shop-price`} className="numeral">
                  {lower(CORE.price)}
                </span>
                <span className="label-sm">per piece · {CORE.name}</span>
              </span>
              <span className="sty-cta__door-text">
                The trench, the cable knit, the power kurta — every piece on this page, in consistent sizing per body shape, with
                structured pieces such as trench coats, blazers and long vests priced above the entry piece. Capsule bundles arrive in
                a rigid box with the how-to-wear card. One honest price: no sales, no discount codes, no instalments.
              </span>
              <span id={`${uid}-shop-cta`} className="sty-cta__door-cta label">
                Shop the collection
                <svg viewBox="0 0 28 10" aria-hidden focusable="false">
                  <path d="M0 5h26M22 1l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1" />
                </svg>
              </span>
            </span>
          </TLink>
        </div>

        {/* ── Made-to-Measure, and where to find us ── */}
        <Reveal className="sty-cta__more">
          <div className="sty-cta__more-item">
            <span className="label-sm sty-cta__more-kicker">{MTM.name}</span>
            <p className="sty-cta__more-text">
              Prefer it cut to you? The same designs at <span className="sty-cta__more-price">{range(MTM.price)}</span> per piece, with
              your measurements kept on file for every repeat order.
            </p>
            <TLink to="/custom" className="sty-cta__more-link label-sm" cursor="Measure">
              Explore Made-to-Measure
            </TLink>
          </div>
          <div className="sty-cta__more-item">
            <span className="label-sm sty-cta__more-kicker">In person</span>
            <p className="sty-cta__more-text">
              Our flagship opens at {FLAGSHIP.place}, {FLAGSHIP.city} in January 2027, followed by Dolmen Mall Karachi and Centaurus
              Islamabad. Until then, a stylist is one message away on the {BRAND.whatsapp} — and the Femmora Private List hears
              about every new chapter first.
            </p>
            <TLink to="/custom#book" className="sty-cta__more-link label-sm" cursor="Book">
              Book an appointment
            </TLink>
          </div>
        </Reveal>

        <Reveal className="sty-cta__quote">
          <figure>
            <p className="label-sm sty-cta__quote-tag">My Femmora, My Story · an illustrative story, not a customer review</p>
            <blockquote>
              <p>{QUOTE.quote}</p>
            </blockquote>
            <figcaption>
              <span className="sty-cta__quote-name">{QUOTE.name}</span>
              <span className="label-sm">{QUOTE.role}</span>
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  )
}
