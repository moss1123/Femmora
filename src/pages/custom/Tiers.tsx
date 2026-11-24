import { useRef } from 'react'
import { gsap, useGSAP, prefersReducedMotion } from '../../lib/motion'
import { TIERS } from '../../data/site'
import { Eyebrow, Reveal, SplitReveal } from '../../components/Reveal'
import Button from '../../components/Button'
import { TIER_DETAILS, type ServiceId } from './data'
import './Tiers.css'

const ROWS = ['Investment', 'What’s included', 'Timeline', 'Best for'] as const
const fmt = new Intl.NumberFormat('en-US')

/** "From PKR 4,500" → { prefix: 'From', values: [4500] }; "PKR 12,000 – 25,000" → { prefix: '', values: [12000, 25000] }. */
function priceParts(price: string) {
  const at = price.indexOf('PKR')
  const prefix = (at >= 0 ? price.slice(0, at) : '').trim()
  const values = (price.slice(Math.max(at, 0)).match(/\d[\d,]*/g) ?? []).map((n) => Number(n.replace(/,/g, '')))
  return { prefix, values }
}

export default function Tiers({ onBook }: { onBook: (s: ServiceId) => void }) {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const el = root.current
      if (!el || prefersReducedMotion()) return
      const q = gsap.utils.selector(el)
      const grid = el.querySelector('.cus-tiers__grid')

      // opacity, not autoAlpha: the columns hold buttons, and visibility:hidden would drop them from the tab order and
      // the accessibility tree until the reveal fires.
      gsap.fromTo(
        q('.cus-tier'),
        { y: 70, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.4, ease: 'lux', stagger: 0.13, scrollTrigger: { trigger: grid, start: 'top 82%', once: true } },
      )
      gsap.fromTo(
        q('.cus-tier__row, .cus-tiers__label'),
        { '--rule': 0 },
        { '--rule': 1, duration: 1.6, ease: 'silk', stagger: 0.025, scrollTrigger: { trigger: grid, start: 'top 75%', once: true } },
      )

      // prices count up as they arrive (the visible digits are aria-hidden; the full price is in an sr-only span)
      q('[data-count]').forEach((node) => {
        const target = Number((node as HTMLElement).dataset.count)
        const final = fmt.format(target)
        const o = { v: 0 }
        node.textContent = '0'
        gsap.to(o, {
          v: target,
          duration: 2,
          ease: 'power3.out',
          scrollTrigger: { trigger: node, start: 'top 92%', once: true },
          onUpdate: () => {
            node.textContent = fmt.format(Math.round(o.v / 100) * 100)
          },
          onComplete: () => {
            node.textContent = final
          },
        })
      })

      // the signature column floats a little higher than its neighbours
      const mm = gsap.matchMedia()
      mm.add('(min-width: 1100px)', () => {
        gsap.fromTo(
          q('.cus-tier--signature'),
          { yPercent: 3 },
          { yPercent: -3, ease: 'none', scrollTrigger: { trigger: grid, start: 'top bottom', end: 'bottom top', scrub: true } },
        )
      })
      return () => {
        mm.revert()
        // never leave a half-counted price behind when the context reverts
        q('[data-count]').forEach((node) => {
          node.textContent = fmt.format(Number((node as HTMLElement).dataset.count))
        })
      }
    },
    { scope: root },
  )

  return (
    <section ref={root} id="services" className="section cus-tiers" data-theme="parchment" aria-label="The services — three ways to wear Femmora">
      <div className="container">
        <header className="cus-head">
          <div className="cus-head__l">
            <Eyebrow numeral="I">The services</Eyebrow>
            <SplitReveal as="h2" className="h2 cus-head__title">
              Three ways to wear Femmora.
            </SplitReveal>
          </div>
          <Reveal className="cus-head__r" delay={0.15}>
            <p className="lead">
              Signature ready-to-wear, the same designs cut to you, or a whole working wardrobe planned with you. Every tier shares the same
              cut logic, the same breathable cloth and the same real pockets — what changes is how closely we tailor to you.
            </p>
          </Reveal>
        </header>

        <div className="cus-tiers__grid">
          <div className="cus-tiers__labels" aria-hidden>
            <span className="cus-tiers__label cus-tiers__label--head">
              <span className="serif-italic">Compare</span>
            </span>
            {ROWS.map((r) => (
              <span key={r} className="cus-tiers__label label-sm">
                {r}
              </span>
            ))}
            <span className="cus-tiers__label cus-tiers__label--cta" />
          </div>

          {TIERS.map((t) => {
            const d = TIER_DETAILS[t.id]
            if (!d) return null
            const signature = t.id === 'consult'
            const { prefix, values } = priceParts(t.price)
            return (
              <article
                key={t.id}
                className={`cus-tier ${signature ? 'cus-tier--signature' : ''}`}
                data-theme={signature ? 'wine' : undefined}
                aria-labelledby={`cus-tier-${t.id}`}
              >
                <header className="cus-tier__head">
                  {signature && (
                    <p className="cus-tier__badge label-sm">The signature service</p>
                  )}
                  <span className="cus-tier__numeral numeral" aria-hidden>
                    {d.numeral}
                  </span>
                  <h3 id={`cus-tier-${t.id}`} className="h3 cus-tier__name">
                    {t.name}
                  </h3>
                  <p className="cus-tier__for label-sm">
                    <span className="cus-tier__for-k">For</span> {t.audience}
                  </p>
                  <p className="cus-tier__blurb">{t.blurb}</p>
                </header>

                <div className="cus-tier__row cus-tier__price">
                  <span className="cus-tier__k label-sm">{ROWS[0]}</span>
                  <p className="cus-tier__figure">
                    <span className="sr-only">{t.price}</span>
                    <span className="cus-tier__figure-v" aria-hidden>
                      {prefix && <span className="cus-tier__from serif-italic">{prefix}</span>}
                      <span className="cus-tier__pkr label-sm">PKR</span>
                      {values.map((v, i) => (
                        <span key={i} className="cus-tier__amt">
                          {i > 0 && <span className="cus-tier__dash">–</span>}
                          <span className="cus-tier__amount numeral" data-count={v}>
                            {fmt.format(v)}
                          </span>
                        </span>
                      ))}
                    </span>
                  </p>
                  <p className="cus-tier__pnote">{t.priceNote}</p>
                </div>

                <div className="cus-tier__row">
                  <span className="cus-tier__k label-sm">{ROWS[1]}</span>
                  <ul className="cus-tier__list">
                    {t.includes.map((inc) => (
                      <li key={inc}>
                        <svg viewBox="0 0 12 12" aria-hidden>
                          <path d="M6 0 L7 5 L12 6 L7 7 L6 12 L5 7 L0 6 L5 5 Z" />
                        </svg>
                        {inc}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="cus-tier__row">
                  <span className="cus-tier__k label-sm">{ROWS[2]}</span>
                  <p className="cus-tier__time numeral">{d.timeline}</p>
                  <p className="cus-tier__note">{d.timelineNote}</p>
                </div>

                <div className="cus-tier__row">
                  <span className="cus-tier__k label-sm">{ROWS[3]}</span>
                  <p className="cus-tier__best serif-italic">{d.bestFor}</p>
                </div>

                <div className="cus-tier__cta">
                  {d.cta.to ? (
                    <Button variant="outline" to={d.cta.to} cursor="Shop">
                      {d.cta.label}
                    </Button>
                  ) : (
                    <Button
                      variant={signature ? 'gold' : 'outline'}
                      onClick={() => d.cta.service && onBook(d.cta.service)}
                      cursor="Book"
                    >
                      {d.cta.label}
                    </Button>
                  )}
                </div>
              </article>
            )
          })}
        </div>

        <Reveal className="cus-tiers__terms" delay={0.1}>
          <p>
            <span className="label-sm">One honest price</span>
            <span className="cus-tiers__terms-t">No sales, no discount codes, no instalments — the price is the same all year, for everyone.</span>
          </p>
          <p>
            <span className="label-sm">Capsule bundles</span>
            <span className="cus-tiers__terms-t">Core pieces sold as a set, with the how-to-wear card in the box.</span>
          </p>
          <p>
            <span className="label-sm">Organisations</span>
            <span className="cus-tiers__terms-t">Workshops and leadership programmes, quoted per programme.</span>
          </p>
        </Reveal>
      </div>
    </section>
  )
}
