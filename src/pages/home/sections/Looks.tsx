import { useRef, type CSSProperties } from 'react'
import { gsap, useGSAP, scrollToTarget } from '../../../lib/motion'
import { Eyebrow } from '../../../components/Reveal'
import TLink from '../../../components/TLink'
import { pageById } from '../../../data/site'
import LookFigure, { type LookPalette, type LookStyle } from './LookFigure'
import { FORMALITY, MQ, chapter, type FormalityLevel, type MQConditions } from './constants'
import './Looks.css'

const CH = chapter('hs-looks')
const COLLECTION = pageById('collection')

interface Look {
  id: string
  numeral: string
  name: string
  coat: string
  pieces: string
  level: FormalityLevel
  /** accessible description of the drawing */
  label: string
  /** card ground + the ink used for the small labels printed on it */
  ink: string
  palette: LookPalette
  style: LookStyle
}

/**
 * Four trench-led looks, one per colourway. The ivory, burgundy and camel coats are the
 * three hanging on the home rack (same cloth colours as src/three/garmentModel.ts);
 * noir completes the line-up. Panels alternate dark / light so each coat reads against its ground.
 */
const LOOKS: Look[] = [
  {
    id: 'ivory',
    numeral: 'I',
    name: 'The Equestrian',
    coat: 'The Ivory Trench',
    pieces: 'Ivory cotton-gabardine trench · camel cable knit · wide charcoal trouser',
    level: 0,
    label:
      'Line drawing of a woman in a belted, double-breasted ivory trench coat with epaulettes, over a camel cable-knit roll-neck and wide charcoal trousers.',
    ink: '#e3c88a',
    palette: {
      panel: '#45111e',
      contour: '#e3c88a',
      hair: '#1a0b10',
      coat: '#e8ddc8',
      line: '#a9853f',
      inner: '#b08d63',
      innerLine: '#6f5233',
      trouser: '#2d2d2f',
      trouserLine: '#c9a55c',
      shoe: '#14050a',
      gold: '#d4b36f',
    },
    style: { belt: 'buckle', open: false, doubleBreasted: true, stormFlap: true, epaulettes: true, collarUp: false, inner: 'knit', trouser: 'wide' },
  },
  {
    id: 'burgundy',
    numeral: 'II',
    name: 'The Chair',
    coat: 'The Burgundy Trench',
    pieces: 'Burgundy wool-gabardine trench · ivory silk shirt · straight noir trouser',
    level: 1,
    label:
      'Line drawing of a woman in a burgundy double-breasted trench coat, collar turned up and belt knotted, over an ivory silk shirt and straight dark trousers.',
    ink: '#84662e',
    palette: {
      panel: '#f8f4ec',
      contour: '#84662e',
      hair: '#2a0a12',
      coat: '#5a1424',
      line: '#c9a55c',
      inner: '#f3ede2',
      innerLine: '#a9853f',
      trouser: '#14050a',
      trouserLine: '#a9853f',
      shoe: '#2a0a12',
      gold: '#c9a55c',
    },
    style: { belt: 'tied', open: false, doubleBreasted: true, stormFlap: true, epaulettes: true, collarUp: true, inner: 'shirt', trouser: 'straight' },
  },
  {
    id: 'camel',
    numeral: 'III',
    name: 'The Modern Founder',
    coat: 'The Camel Trench',
    pieces: 'Camel trench worn open · ivory power kurta · cigarette trouser',
    level: 1,
    label:
      'Line drawing of a woman in an open camel trench coat with its belt hanging loose, over a long ivory power kurta with a mandarin collar and slim ivory trousers.',
    ink: '#e3c88a',
    palette: {
      panel: '#14050a',
      contour: '#e3c88a',
      hair: '#2a0a12',
      coat: '#b5895a',
      line: '#5c3f1f',
      inner: '#efe7d8',
      innerLine: '#a9853f',
      trouser: '#e6dcc8',
      trouserLine: '#a9853f',
      shoe: '#45111e',
      gold: '#e3c88a',
    },
    style: { belt: 'loose', open: true, doubleBreasted: false, stormFlap: false, epaulettes: false, collarUp: false, inner: 'kurta', trouser: 'slim' },
  },
  {
    id: 'noir',
    numeral: 'IV',
    name: 'The Executive',
    coat: 'The Noir Trench',
    pieces: 'Noir single-breasted trench · burgundy satin bow blouse · wide trouser',
    level: 2,
    label:
      'Line drawing of a woman in a belted, single-breasted black trench coat with the collar up, over a burgundy satin bow blouse and wide dark trousers.',
    // deeper antique gold: the printed tags stay ≥ 4.5:1 on this darker ivory panel
    ink: '#735928',
    palette: {
      panel: '#ebe2d2',
      contour: '#84662e',
      hair: '#14050a',
      coat: '#1c0a10',
      line: '#a9853f',
      inner: '#7a1f33',
      innerLine: '#e3c88a',
      trouser: '#2a0a12',
      trouserLine: '#84662e',
      shoe: '#14050a',
      gold: '#c9a55c',
    },
    style: { belt: 'buckle', open: false, doubleBreasted: false, stormFlap: false, epaulettes: false, collarUp: true, inner: 'blouse', trouser: 'wide' },
  },
]

/** The look that grows to the full-bleed moment before the others fan out around it. */
const HERO = 1

/**
 * The pinned choreography needs four legible cards plus captions in one viewport, so this
 * chapter pins on a taller query than MQ.pin — and below 1024px wide (where the head wraps and
 * the captions run long) only on tall, portrait-tablet screens. Mirrored in Looks.css.
 */
const PIN =
  '(min-width: 1024px) and (min-height: 680px) and (prefers-reduced-motion: no-preference), ' +
  '(min-width: 768px) and (min-height: 900px) and (prefers-reduced-motion: no-preference)'

const levelOf = (l: Look) => FORMALITY[l.level]

/**
 * IV — The looks. The house's hero piece, the trench, in four colourways — each drawn, not
 * photographed, and each carrying its formality level. Pinned on desktop:
 *  1. a single card (the Burgundy Trench) waits at the centre of the stage,
 *  2. it scales up while the stage floods edge-to-edge with its burgundy gabardine (Apple-style),
 *  3. a caption names the look,
 *  4. the card settles back into an editorial row as the other three fan out from behind it.
 * All geometry is measured from layout (offset*), so it survives resizes via invalidateOnRefresh.
 * Outside PIN (phones, short or narrow windows, reduced motion) the cards simply flow in a grid.
 */
export default function Looks() {
  const root = useRef<HTMLElement>(null)
  const hero = LOOKS[HERO]

  useGSAP(
    () => {
      const el = root.current
      if (!el) return
      const mm = gsap.matchMedia()

      mm.add({ motion: MQ.motion, pin: PIN }, (ctx) => {
        const { pin } = ctx.conditions as unknown as MQConditions
        const q = gsap.utils.selector(el)
        const stage = q('.hs-looks__stage')[0] as HTMLElement
        const row = q('.hs-looks__row')[0] as HTMLElement
        const figs = q('.hs-look') as HTMLElement[]
        const frames = q('.hs-look__frame') as HTMLElement[]
        const captions = q('.hs-look__caption')
        const head = q('.hs-looks__head > *')

        if (!pin) {
          gsap.from(head, {
            opacity: 0,
            y: 28,
            duration: 1.2,
            ease: 'lux',
            stagger: 0.1,
            scrollTrigger: { trigger: q('.hs-looks__head')[0], start: 'top 82%' },
          })
          figs.forEach((fig, i) => {
            gsap
              .timeline({ scrollTrigger: { trigger: fig, start: 'top 88%' }, delay: (i % 2) * 0.12 })
              .fromTo(fig.querySelector('.hs-look__frame'), { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'silk' })
              .fromTo(fig.querySelector('.hs-look__art'), { scale: 1.14, yPercent: 4 }, { scale: 1, yPercent: 0, duration: 1.8, ease: 'lux' }, 0)
              .from(fig.querySelectorAll('.hs-look__tag'), { opacity: 0, duration: 0.9, ease: 'lux', stagger: 0.08 }, 0.6)
              .from(fig.querySelector('.hs-look__caption'), { opacity: 0, y: 16, duration: 1, ease: 'lux' }, 0.5)
          })
          return
        }

        const heroFig = figs[HERO]
        const heroFrame = frames[HERO]
        const others = frames.filter((_, i) => i !== HERO)
        const backdrop = q('.hs-looks__backdrop')[0]
        const heroCaptionBox = q('.hs-looks__hero-caption')[0] as HTMLElement
        const heroCaption = q('.hs-looks__hero-caption > *')
        const ctaBox = q('.hs-looks__cta')[0] as HTMLElement
        const cta = [ctaBox]

        const S0 = 0.62 // the small waiting card, relative to its row size
        const FAN = [-7, 0, 5, 10] // fanned rotation of the cards hiding behind the hero

        // Geometry (layout space, independent of current transforms). The frame's own offset
        // inside its <li> counts: in the pinned layout the card is centred vertically in its cell.
        const centreDelta = (fig: HTMLElement) => {
          const frame = fig.querySelector<HTMLElement>('.hs-look__frame')!
          return {
            x: stage.clientWidth / 2 - (row.offsetLeft + fig.offsetLeft + frame.offsetLeft + frame.offsetWidth / 2),
            y: stage.clientHeight / 2 - (row.offsetTop + fig.offsetTop + frame.offsetTop + frame.offsetHeight / 2),
          }
        }
        // Grow to 84% of the stage height — but never under the hero caption at the left
        // (on a portrait tablet the height-led size would run the ivory card beneath it).
        const bigScale = () => {
          const byHeight = (stage.clientHeight * 0.84) / heroFrame.offsetHeight
          const reserve = heroCaptionBox.offsetLeft + heroCaptionBox.offsetWidth + 24
          const byWidth = (stage.clientWidth - 2 * reserve) / heroFrame.offsetWidth
          return Math.max(1, Math.min(byHeight, byWidth))
        }
        const smallInset = () => {
          const w = heroFrame.offsetWidth * S0
          const h = heroFrame.offsetHeight * S0
          const t = (stage.clientHeight - h) / 2
          const l = (stage.clientWidth - w) / 2
          return `inset(${t}px ${l}px ${t}px ${l}px)`
        }

        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: stage,
            start: 'top top',
            end: '+=280%',
            pin: true,
            scrub: 0.8,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        })

        // Map an index within `others` back to its index in the row.
        const rowIndex = (i: number) => (i >= HERO ? i + 1 : i)

        // 1 → 2: the card grows; its cloth floods the stage edge to edge.
        tl.fromTo(
          heroFrame,
          { x: () => centreDelta(heroFig).x, y: () => centreDelta(heroFig).y, scale: S0 },
          { x: () => centreDelta(heroFig).x, y: () => centreDelta(heroFig).y, scale: bigScale, duration: 1, ease: 'power1.inOut' },
          0,
        )
          .fromTo(
            backdrop,
            { clipPath: smallInset, autoAlpha: 1 },
            { clipPath: 'inset(0px 0px 0px 0px)', autoAlpha: 1, duration: 1, ease: 'power1.inOut' },
            0,
          )
          .fromTo(q('.hs-looks__cloth'), { scale: 1.45 }, { scale: 1.08, duration: 1.2 }, 0)
          .fromTo(q('.hs-looks__aura-word'), { opacity: 0, yPercent: 12 }, { opacity: 1, yPercent: 0, duration: 0.6 }, 0.5)
          // 3: name the look over the full-bleed moment
          .fromTo(heroCaption, { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.35, stagger: 0.06 }, 0.78)
          .to(heroCaption, { opacity: 0, y: -18, duration: 0.3, stagger: 0.04 }, 1.55)
          // 4: settle into the row; the others fan out from behind it
          .addLabel('fan', 1.7)
          .to(heroFrame, { x: 0, y: 0, scale: 1, duration: 1, ease: 'power2.inOut' }, 'fan')
          .to(backdrop, { autoAlpha: 0, duration: 0.6 }, 'fan+=0.25')
          .fromTo(others, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25, stagger: 0.05, immediateRender: true }, 'fan+=0.08')
          .fromTo(
            others,
            {
              x: (i: number) => centreDelta(figs[rowIndex(i)]).x,
              y: (i: number) => centreDelta(figs[rowIndex(i)]).y,
              scale: S0 * 0.94,
              rotation: (i: number) => FAN[rowIndex(i)],
            },
            { x: 0, y: 0, scale: 1, rotation: 0, duration: 1, ease: 'power2.inOut', stagger: 0.06, immediateRender: true },
            'fan+=0.05',
          )
          .fromTo(captions, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.07, immediateRender: true }, 'fan+=0.85')
          .fromTo(cta, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.4, immediateRender: true }, 'fan+=1.15')
          .to({}, { duration: 0.45 })

        gsap.from(head, {
          opacity: 0,
          y: 24,
          duration: 1.2,
          ease: 'lux',
          stagger: 0.1,
          scrollTrigger: { trigger: stage, start: 'top 70%', toggleActions: 'play none none reverse' },
        })

        // Keyboard: the CTA only appears at the end of the choreography. If it is focused before
        // then (Tab from the previous chapter), glide to the end of the pin so the row is settled.
        const onFocusIn = () => {
          const st = tl.scrollTrigger
          if (st && st.progress < 0.999) scrollToTarget(st.end, 0)
        }
        ctaBox.addEventListener('focusin', onFocusIn)
        return () => ctaBox.removeEventListener('focusin', onFocusIn)
      })

      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section ref={root} id={CH.id} className="hs-looks" data-theme={CH.theme} aria-labelledby="hs-looks-title">
      <div className="hs-looks__stage">
        {/* The full-bleed flood: the hero coat's own burgundy gabardine. data-theme lets the fixed nav invert over it. */}
        <div className="hs-looks__backdrop" data-theme="wine" aria-hidden>
          <span className="hs-looks__cloth" />
          <span className="hs-looks__veil" />
          <span className="hs-looks__aura-word">{COLLECTION.kicker}</span>
        </div>

        <header className="hs-looks__head">
          <div className="hs-looks__head-main">
            <Eyebrow numeral={CH.numeral}>The looks</Eyebrow>
            <h2 id="hs-looks-title" className="hs-looks__title">
              One trench, <em>four women.</em>
            </h2>
          </div>
          <p className="hs-looks__intro">
            The house’s hero piece in ivory, burgundy, camel and noir — each look styled to a clear formality level, from
            the office day to the evening.
          </p>
        </header>

        <ol className="hs-looks__row">
          {LOOKS.map((l, i) => {
            const lv = levelOf(l)
            return (
              <li
                key={l.id}
                className={`hs-look hs-look--${l.id} ${i === HERO ? 'is-hero' : ''}`}
                style={{ '--panel': l.palette.panel, '--ink': l.ink } as CSSProperties}
              >
                <figure>
                  <div className="hs-look__frame">
                    <LookFigure className="hs-look__art" palette={l.palette} look={l.style} label={l.label} />
                    <span className="hs-look__tag hs-look__tag--look" aria-hidden>
                      Look {l.numeral}
                    </span>
                    <span className="hs-look__tag hs-look__tag--level" aria-hidden>
                      <span className="hs-look__pips">
                        {FORMALITY.map((f, k) => (
                          <span key={f.numeral} className={k <= l.level ? 'is-on' : ''} />
                        ))}
                      </span>
                      {lv.name}
                    </span>
                  </div>
                  <figcaption className="hs-look__caption">
                    <span className="numeral hs-look__num">{l.numeral}</span>
                    <span className="hs-look__name">{l.name}</span>
                    <span className="hs-look__coat">{l.coat}</span>
                    <span className="label-sm hs-look__pieces">{l.pieces}</span>
                    <span className="label-sm hs-look__level">
                      Formality {lv.numeral} <span aria-hidden>·</span> {lv.name}
                    </span>
                  </figcaption>
                </figure>
              </li>
            )
          })}
        </ol>

        <div className="hs-looks__hero-caption" aria-hidden>
          <p className="label-sm">
            Look {hero.numeral} <span>·</span> {hero.coat}
          </p>
          <p className="hs-looks__hero-name">{hero.name}</p>
          <p className="hs-looks__hero-pieces">{hero.pieces}</p>
          <p className="label-sm hs-looks__hero-level">
            Formality {levelOf(hero).numeral} <span>·</span> {levelOf(hero).name} — {levelOf(hero).note}
          </p>
        </div>

        <div className="hs-looks__cta">
          <TLink to={COLLECTION.path} className="hs-looks__link" cursor="Shop">
            <span className="label">Shop the collection</span>
            <svg viewBox="0 0 40 10" width="40" height="10" aria-hidden>
              <path d="M0 5h38M34 1l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1" />
            </svg>
          </TLink>
        </div>
      </div>
    </section>
  )
}
