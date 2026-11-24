import { useRef } from 'react'
import { gsap, useGSAP } from '../../../lib/motion'
import { Eyebrow, SplitReveal } from '../../../components/Reveal'
import Button from '../../../components/Button'
import { TIERS } from '../../../data/site'
import { MQ, chapter } from './constants'
import './Tiers.css'

const CH = chapter('hs-tiers')

interface TierDress {
  numeral: string
  kicker: string
  forWhom: string
  cta: { label: string; to: string; variant: 'gold' | 'outline'; cursor: string }
}

const DRESS: Record<string, TierDress> = {
  core: {
    numeral: 'I',
    kicker: 'Ready-to-wear',
    forWhom: 'Office formal wear that isn’t occasion wear — authority, straight off the rail.',
    cta: { label: 'Shop ready-to-wear', to: '/collection', variant: 'outline', cursor: 'Shop' },
  },
  mtm: {
    numeral: 'II',
    kicker: 'The signature',
    forWhom: 'For the fit no rack has ever offered — measured once, remembered for every order after.',
    cta: { label: 'Book a measuring', to: '/custom#book', variant: 'gold', cursor: 'Book' },
  },
  consult: {
    numeral: 'III',
    kicker: 'A service, not a product',
    forWhom: 'For the leader whose calendar leaves no room for the morning decision.',
    cta: { label: 'Book a consultation', to: '/custom#book', variant: 'outline', cursor: 'Book' },
  },
}

/** "From PKR 4,500" → { from, amount }; a range is set closed-up, "PKR 12,000–25,000" (Deliverable 3). */
const splitPrice = (price: string) => {
  const tidy = price.replace(/(\d)\s*[–-]\s*(\d)/g, '$1–$2')
  const m = tidy.match(/^(From)\s+(.*)$/i)
  return m ? { from: m[1], amount: m[2] } : { from: '', amount: tidy }
}

/**
 * V — The house tiers (Deliverable 3, Appendix 4A/4B): three tall editorial columns divided by
 * gold hairlines that draw down the page as the columns rise into place. One honest price per
 * tier — no sales, no discount codes, no instalments.
 */
export default function Tiers() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const el = root.current
      if (!el) return
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        const q = gsap.utils.selector(el)
        const cols = q('.hs-tier')
        gsap
          .timeline({ scrollTrigger: { trigger: q('.hs-tiers__cols')[0], start: 'top 80%' } })
          .fromTo(q('.hs-tier__rule'), { scaleY: 0 }, { scaleY: 1, duration: 1.8, ease: 'silk', stagger: 0.15 })
          .from(cols, { opacity: 0, y: 60, duration: 1.4, ease: 'lux', stagger: 0.14 }, 0.1)
          .from(q('.hs-tier__list li'), { opacity: 0, x: -12, duration: 0.9, ease: 'lux', stagger: 0.04 }, 0.6)
        gsap.from(q('.hs-tiers__aside > *'), {
          opacity: 0,
          y: 24,
          duration: 1.2,
          ease: 'lux',
          stagger: 0.1,
          scrollTrigger: { trigger: q('.hs-tiers__head')[0], start: 'top 80%' },
        })
        gsap.from(q('.hs-tiers__also-item'), {
          opacity: 0,
          y: 20,
          duration: 1.1,
          ease: 'lux',
          stagger: 0.1,
          scrollTrigger: { trigger: q('.hs-tiers__also')[0], start: 'top 92%' },
        })
        // The signature numeral drifts against the scroll.
        gsap.fromTo(q('.hs-tier__numeral'), { yPercent: 18 }, {
          yPercent: -18,
          ease: 'none',
          scrollTrigger: { trigger: q('.hs-tiers__cols')[0], start: 'top bottom', end: 'bottom top', scrub: true },
        })
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section ref={root} id={CH.id} className="hs-tiers" data-theme={CH.theme} aria-label="The house tiers and prices">
      <div className="container">
        <header className="hs-tiers__head">
          <div className="hs-tiers__head-main">
            <Eyebrow numeral={CH.numeral}>The house tiers</Eyebrow>
            <SplitReveal as="h2" className="hs-tiers__title" by="lines">
              Three ways into <em>the house.</em>
            </SplitReveal>
          </div>
          <div className="hs-tiers__aside">
            <p className="hs-tiers__lead">
              Begin with ready-to-wear in consistent sizing per body shape; have the same designs cut to your
              measurements; or let us build the whole working wardrobe around you.
            </p>
            <p className="label-sm hs-tiers__note">
              Prices in PKR <span className="hs-dia" aria-hidden /> No sales, no discount codes — one honest price
            </p>
          </div>
        </header>

        <ol className="hs-tiers__cols">
          {TIERS.map((t, i) => {
            const d = DRESS[t.id]
            const p = splitPrice(t.price)
            return (
              <li key={t.id} className={`hs-tier hs-tier--${t.id}`}>
                {i > 0 && <span className="hs-tier__rule" aria-hidden />}
                <span className="hs-tier__sweep" aria-hidden />
                <div className="hs-tier__top">
                  <span className="hs-tier__numeral numeral" aria-hidden>
                    {d.numeral}
                  </span>
                  <span className="label-sm hs-tier__kicker">{d.kicker}</span>
                </div>

                <h3 id={`hs-tier-${t.id}`} className="hs-tier__name">
                  {t.name}
                </h3>
                <p className="label-sm hs-tier__audience">For {t.audience}</p>
                <div className="hs-tier__pricing">
                  <p className="hs-tier__price">
                    {p.from && <span className="label-sm hs-tier__from">{p.from}</span>}
                    <span className="hs-tier__amount">{p.amount}</span>
                  </p>
                  <p className="hs-tier__note">{t.priceNote}</p>
                </div>
                <p className="hs-tier__blurb">{t.blurb}</p>

                <div className="hs-tier__includes">
                  <p className="label-sm">Includes</p>
                  <ul className="hs-tier__list">
                    {t.includes.map((inc) => (
                      <li key={inc}>{inc}</li>
                    ))}
                  </ul>
                </div>

                <p className="hs-tier__for">{d.forWhom}</p>

                <div className="hs-tier__cta">
                  <Button variant={d.cta.variant} to={d.cta.to} cursor={d.cta.cursor}>
                    {d.cta.label}
                  </Button>
                </div>
              </li>
            )
          })}
        </ol>

        <dl className="hs-tiers__also">
          <div className="hs-tiers__also-item">
            <dt className="label-sm">Capsule bundles</dt>
            <dd>Core pieces sold as a set, with the how-to-wear card that shows one piece worn three ways.</dd>
          </div>
          <div className="hs-tiers__also-item">
            <dt className="label-sm">Corporate programmes</dt>
            <dd>
              “Dress for the Position You Hold” — leadership-presence workshops for banks, telcos and tech, quoted per
              programme.
            </dd>
          </div>
        </dl>
      </div>
    </section>
  )
}
