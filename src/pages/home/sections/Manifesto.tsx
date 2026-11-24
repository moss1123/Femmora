import { useRef } from 'react'
import { gsap, SplitText, useGSAP } from '../../../lib/motion'
import { Eyebrow } from '../../../components/Reveal'
import { BRAND, TENETS } from '../../../data/site'
import { MQ, chapter, type MQConditions } from './constants'
import './Manifesto.css'

const CH = chapter('hs-manifesto')
const ROMAN = ['I', 'II', 'III', 'IV']

/**
 * The statement, tenets and quote must fit one viewport while pinned, so this chapter asks
 * for a little more height than MQ.pin. Mirrored in Manifesto.css.
 */
const PIN =
  '(min-width: 900px) and (min-height: 640px) and (prefers-reduced-motion: no-preference), ' +
  '(min-width: 768px) and (min-height: 720px) and (prefers-reduced-motion: no-preference)'

/** Each line: the key word lights gold, the rest lights ivory. Three of the four tenets, in the house voice. */
const LINES: [string, string][] = [
  ['Empowerment,', 'in every seam.'],
  ['Modesty,', 'without compromise.'],
  ['Ambition,', 'worn with ease.'],
]

/**
 * I — Beyond the silhouette. The first surface to rise over the fixed WebGL rack:
 * a feathered burgundy edge + gold horizon line, then a pinned statement whose words
 * light from faint to ivory/gold as you scroll; the four tenets settle beneath it and
 * the chapter closes on Sana's persona quote.
 */
export default function Manifesto() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const el = root.current
      if (!el) return
      const mm = gsap.matchMedia()

      mm.add({ motion: MQ.motion, pin: PIN }, (ctx) => {
        const { pin } = ctx.conditions as unknown as MQConditions
        const q = gsap.utils.selector(el)
        const stage = q('.hs-manifesto__stage')[0] as HTMLElement
        const statement = q('.hs-manifesto__statement')[0] as HTMLElement
        const horizon = q('.hs-manifesto__horizon')[0]
        const meta = q('.hs-manifesto__meta > *')
        const promise = q('.hs-manifesto__promise')
        const tenets = q('.hs-manifesto__tenet')
        const rule = q('.hs-manifesto__quote-rule')[0]
        const quote = q('.hs-manifesto__quote blockquote, .hs-manifesto__quote figcaption')
        const vertical = q('.hs-manifesto__vertical')[0]

        const split = SplitText.create(statement, { type: 'words', wordsClass: 'hs-manifesto__word' })

        // Entrance: the gold horizon draws from the centre as the section rises over the rack.
        gsap.fromTo(
          horizon,
          { scaleX: 0, opacity: 0 },
          {
            scaleX: 1,
            opacity: 1,
            ease: 'none',
            scrollTrigger: { trigger: el, start: 'top bottom', end: 'top 35%', scrub: true },
          },
        )
        gsap.from(meta, {
          opacity: 0,
          y: 18,
          duration: 1.2,
          ease: 'lux',
          stagger: 0.12,
          scrollTrigger: { trigger: stage, start: 'top 70%', toggleActions: 'play none none reverse' },
        })

        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: pin
            ? {
                trigger: stage,
                start: 'top top',
                end: '+=200%',
                pin: true,
                scrub: 0.6,
                anticipatePin: 1,
              }
            : { trigger: statement, start: 'top 82%', end: 'bottom 30%', scrub: 0.6 },
        })

        tl.fromTo(
          split.words,
          { opacity: 0.12, filter: 'blur(3px)' },
          { opacity: 1, filter: 'blur(0px)', duration: 0.55, stagger: 0.2 },
        )
          .fromTo(promise, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }, '-=0.2')
          .fromTo(tenets, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.12 }, '<0.15')
          .fromTo(rule, { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: 'power1.inOut' }, '-=0.2')
          .fromTo(quote, { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.18 }, '<0.2')

        if (vertical) tl.fromTo(vertical, { opacity: 0, yPercent: 20 }, { opacity: 1, yPercent: 0, duration: 1 }, 0)
        if (pin) tl.to({}, { duration: 0.5 }) // a beat of stillness before release

        return () => split.revert()
      })

      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section ref={root} id={CH.id} className="hs-manifesto" data-theme={CH.theme} aria-labelledby="hs-manifesto-title">
      <div className="hs-manifesto__edge" aria-hidden />
      <div className="hs-manifesto__stage">
        <span className="hs-manifesto__horizon" aria-hidden />
        <div className="container hs-manifesto__inner">
          <header className="hs-manifesto__meta">
            <Eyebrow numeral={CH.numeral}>The manifesto</Eyebrow>
            <p className="label-sm hs-manifesto__est">
              {BRAND.motto.replace(/\.$/, '')} <span aria-hidden>·</span> {BRAND.madeBy}
            </p>
          </header>

          <h2 id="hs-manifesto-title" className="hs-manifesto__statement">
            {LINES.map(([key, rest], i) => (
              <span key={key} className={`hs-manifesto__line hs-manifesto__line--${i + 1}`}>
                <span className="hs-manifesto__key">{key}</span> {rest}
              </span>
            ))}
          </h2>

          <div className="hs-manifesto__foot">
            <div className="hs-manifesto__creed">
              <p className="hs-manifesto__promise">
                Not clothes that merely fit the room — <em>the confidence of wearing them.</em>
              </p>
              <div className="hs-manifesto__tenets">
                <p className="label-sm hs-manifesto__tenets-label" id="hs-manifesto-tenets">
                  The four tenets
                </p>
                <ol className="hs-manifesto__tenet-list" aria-labelledby="hs-manifesto-tenets">
                  {TENETS.map((t, i) => (
                    <li key={t} className="hs-manifesto__tenet">
                      <span className="numeral hs-manifesto__tenet-n" aria-hidden>
                        {ROMAN[i]}
                      </span>
                      <span className="hs-manifesto__tenet-name">{t}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <figure className="hs-manifesto__quote">
              <span className="hs-manifesto__quote-rule" aria-hidden />
              <blockquote>
                <p>{BRAND.personaQuote}</p>
              </blockquote>
              <figcaption className="label-sm">{BRAND.personaName} · the woman we design for</figcaption>
            </figure>
          </div>
        </div>
        <p className="hs-manifesto__vertical label-sm" aria-hidden>
          {BRAND.motto} <span className="hs-manifesto__vertical-dot" /> {BRAND.tagline}
        </p>
      </div>
    </section>
  )
}
