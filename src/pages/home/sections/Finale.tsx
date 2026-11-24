import { useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP, scrollToTarget } from '../../../lib/motion'
import { Eyebrow, SplitReveal } from '../../../components/Reveal'
import TLink from '../../../components/TLink'
import Button from '../../../components/Button'
import { PAGES, type GarmentId } from '../../../data/site'
import { GarmentFlat } from './FinaleFlats'
import { MQ, chapter } from './constants'
import './Finale.css'

const CH = chapter('hs-finale')

const NOTES: Record<GarmentId, { verb: string; line: string }> = {
  styling: {
    verb: 'Learn the formulas',
    line: 'Colour analysis, silhouette guidance — and the art of wearing one trench three ways.',
  },
  collection: {
    verb: 'Shop the pieces',
    line: 'Trench coats, blazers, cable knits, trousers and kurtas — each with its formality level on the label.',
  },
  custom: {
    verb: 'Book a fitting',
    line: 'Made-to-measure and the wardrobe consultation — at the Dolmen Mall flagship, Lahore, from January 2027.',
  },
}

/** Entrance tilt per garment, so each one swings onto the rail a little differently. */
const TILT = [-9, 7, -6]
/** How strongly each garment answers scroll velocity (heavier cloth sways less). */
const SWAY = [1.1, 0.75, 0.95]

/**
 * IX — Choose your chapter. The story ends where it began: on the rack.
 * The three trench coats of the 3D rack — ivory, burgundy, camel — are drawn as flats and hung
 * on a gold rail (they swing into place, then sway with scroll velocity). Each column is a page
 * link — hover lifts the coat off its hanger and floods the column with burgundy ink,
 * previewing the transition.
 */
export default function Finale() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const el = root.current
      if (!el) return
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        const q = gsap.utils.selector(el)
        const rack = q('.hs-fin__rack')[0] as HTMLElement
        const drops = q('.hs-fin__drop') as HTMLElement[]
        const swings = q('.hs-fin__swing') as HTMLElement[]
        const items = q('.hs-fin__item') as HTMLElement[]

        gsap.from(q('.hs-fin__lead, .hs-fin__head .eyebrow'), {
          opacity: 0,
          y: 22,
          duration: 1.2,
          ease: 'lux',
          stagger: 0.1,
          scrollTrigger: { trigger: q('.hs-fin__head')[0], start: 'top 82%' },
        })

        // The rail draws across, finials land, then the garments are hung one by one.
        gsap.fromTo(
          q('.hs-fin__rail'),
          { scaleX: 0 },
          { scaleX: 1, ease: 'none', scrollTrigger: { trigger: rack, start: 'top 88%', end: 'top 50%', scrub: 0.6 } },
        )
        gsap.from(q('.hs-fin__finial'), {
          scale: 0,
          duration: 0.9,
          ease: 'back.out(2.2)',
          scrollTrigger: { trigger: rack, start: 'top 55%' },
        })

        gsap
          .timeline({ scrollTrigger: { trigger: rack, start: 'top 68%' } })
          .from(drops, { y: -64, opacity: 0, duration: 1.2, ease: 'power3.out', stagger: 0.16 }, 0)
          .from(drops, { rotation: (i: number) => TILT[i % TILT.length], duration: 2.6, ease: 'elastic.out(1, 0.3)', stagger: 0.16 }, 0)

        items.forEach((item, i) => {
          gsap.from(item.querySelectorAll('.hs-fin__meta, .hs-fin__name, .hs-fin__kicker, .hs-fin__line, .hs-fin__foot'), {
            opacity: 0,
            y: 26,
            duration: 1.2,
            ease: 'lux',
            stagger: 0.06,
            delay: 0.15 + i * 0.12,
            scrollTrigger: { trigger: rack, start: 'top 62%' },
          })
        })

        // Cloth answers the scroll: garments lean against the direction of travel, then settle.
        const settle = gsap.delayedCall(0.16, () => {
          swings.forEach((s) => gsap.to(s, { rotation: 0, duration: 2.4, ease: 'elastic.out(1, 0.28)', overwrite: true }))
        })
        settle.pause()
        ScrollTrigger.create({
          trigger: rack,
          start: 'top bottom',
          end: 'bottom top',
          onUpdate(self) {
            const lean = gsap.utils.clamp(-5, 5, -self.getVelocity() / 260)
            swings.forEach((s, i) =>
              gsap.to(s, { rotation: lean * SWAY[i % SWAY.length], duration: 0.8, ease: 'power3.out', overwrite: true }),
            )
            settle.restart(true)
          },
        })

        gsap.from(q('.hs-fin__coda > *'), {
          opacity: 0,
          y: 24,
          duration: 1.2,
          ease: 'lux',
          stagger: 0.1,
          scrollTrigger: { trigger: q('.hs-fin__coda')[0], start: 'top 90%' },
        })

        // The sway tweens are born in onUpdate, outside this context's recording, so the
        // revert cannot undo them: kill them and drop the lean when the context reverts
        // (route change, or reduced motion switched on mid-visit).
        return () => {
          gsap.killTweensOf(swings)
          gsap.set(swings, { clearProps: 'transform' })
        }
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section ref={root} id={CH.id} className="hs-fin" data-theme={CH.theme} aria-label="Choose your chapter">
      <div className="container">
        <header className="hs-fin__head">
          <div className="hs-fin__head-main">
            <Eyebrow numeral={CH.numeral}>Choose your chapter</Eyebrow>
            <SplitReveal as="h2" className="hs-fin__title" by="lines">
              A wardrobe for <em>every chapter.</em>
            </SplitReveal>
          </div>
          <p className="hs-fin__lead">
            Three rooms of the house, three trench coats on the rail. Take one down — the house will open around it.
          </p>
        </header>

        <div className="hs-fin__rack">
          <span className="hs-fin__rail" aria-hidden>
            <span className="hs-fin__finial hs-fin__finial--l" />
            <span className="hs-fin__finial hs-fin__finial--r" />
          </span>

          <ul className="hs-fin__list">
            {PAGES.map((p) => (
              <li key={p.id} className={`hs-fin__item hs-fin__item--${p.id}`}>
                <TLink
                  to={p.path}
                  className="hs-fin__link"
                  cursor={p.title}
                  aria-label={`${p.title} — ${p.kicker}. ${NOTES[p.id].verb}`}
                >
                  <span className="hs-fin__ink" aria-hidden />
                  <span className="hs-fin__drop" aria-hidden>
                    <span className="hs-fin__swing">
                      <GarmentFlat id={p.id} className="hs-fin__flat" />
                    </span>
                  </span>

                  <span className="hs-fin__meta">
                    <span className="hs-fin__num numeral">{p.numeral}</span>
                    <span className="label-sm hs-fin__chapter">Chapter {p.numeral}</span>
                  </span>
                  <span className="hs-fin__name">{p.title}</span>
                  <span className="hs-fin__kicker">{p.kicker}</span>
                  <span className="hs-fin__line">{NOTES[p.id].line}</span>
                  <span className="hs-fin__foot">
                    <span className="label-sm hs-fin__garment">{p.garment}</span>
                    <span className="hs-fin__enter">
                      <span className="label">{NOTES[p.id].verb}</span>
                      <svg viewBox="0 0 40 10" width="40" height="10" aria-hidden>
                        <path d="M0 5h38M34 1l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1" />
                      </svg>
                    </span>
                  </span>
                </TLink>
              </li>
            ))}
          </ul>
        </div>

        <div className="hs-fin__coda">
          <p className="hs-fin__coda-text">
            Not sure where to begin? <em>Begin with a conversation.</em>
          </p>
          <div className="hs-fin__coda-actions">
            <Button variant="outline" to="/custom#book" cursor="Book">
              Book a consultation
            </Button>
            <button type="button" className="hs-fin__top" onClick={() => scrollToTarget(0, 0)} data-cursor="Rack">
              <svg viewBox="0 0 10 28" width="10" height="28" aria-hidden>
                <path d="M5 28V2M1 6l4-4 4 4" fill="none" stroke="currentColor" strokeWidth="1" />
              </svg>
              <span className="label">Back to the rack</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
