import { useRef, type CSSProperties } from 'react'
import { gsap, useGSAP } from '../../../lib/motion'
import { Eyebrow, SplitReveal } from '../../../components/Reveal'
import Marquee from '../../../components/Marquee'
import { FabricSwatch, type FabricId } from './FabricSwatches'
import { MQ, chapter } from './constants'
import './Textures.css'

const CH = chapter('hs-textures')

const FABRICS = ['Gabardine', 'Cable knit', 'Wool', 'Satin', 'Jacquard', 'Silk', 'Linen', 'Velvet']

type TileShape = 'pill' | 'arch' | 'circle' | 'rect'

interface Tile {
  fabric: FabricId
  /** drawing size — tiles never render wider than ~1.4× this */
  w: number
  h: number
  shape: TileShape
  caption: string
  note: string
  /** parallax drift in yPercent across the viewport */
  speed: number
}

const TILES: Tile[] = [
  { fabric: 'gabardine', w: 205, h: 394, shape: 'pill', caption: 'Wool gabardine', note: 'The trench · 63° twill', speed: -16 },
  { fabric: 'cable', w: 337, h: 372, shape: 'arch', caption: 'Cable knit', note: 'Merino · the country-club layer', speed: 8 },
  { fabric: 'satin', w: 143, h: 146, shape: 'circle', caption: 'Silk satin', note: 'For the evening level', speed: -24 },
  { fabric: 'herringbone', w: 175, h: 394, shape: 'rect', caption: 'Herringbone wool', note: 'Long coats · blazers', speed: 12 },
  { fabric: 'jacquard', w: 166, h: 394, shape: 'pill', caption: 'Jacquard', note: 'Pattern without print', speed: -10 },
]

const FACTS = [
  { n: 'i.', title: 'Breathable', body: 'Open, lightweight weaves for a Pakistani summer — a trench you can wear eight months of the year.' },
  { n: 'ii.', title: 'Anti-crease', body: 'Cloth that holds its line through the commute, the boardroom and the drive home.' },
  { n: 'iii.', title: 'Considered', body: 'Non-sheer plackets. Real, deep pockets. Every time.' },
]

interface Swatch {
  name: string
  bg: string
}

/** The house colours (Deliverable 3: burgundy and gold, on ivory) … */
const HOUSE: Swatch[] = [
  { name: 'Burgundy', bg: 'var(--burgundy)' },
  { name: 'Gold', bg: 'var(--gold-gradient)' },
  { name: 'Ivory', bg: 'var(--ivory-50)' },
]
/** … and the colours the pieces come in. */
const PIECES: Swatch[] = [
  { name: 'Camel', bg: 'var(--camel)' },
  { name: 'Noir', bg: 'var(--wine-950)' },
  { name: 'Emerald', bg: 'var(--emerald)' },
  { name: 'Charcoal', bg: 'var(--charcoal)' },
  { name: 'Navy', bg: 'var(--navy)' },
]

function SwatchList({ items, label }: { items: Swatch[]; label: string }) {
  return (
    <ul className="hs-tex__swatches" aria-label={label}>
      {items.map((s) => (
        <li key={s.name} className="hs-tex__swatch">
          <span className="hs-tex__chip" style={{ background: s.bg }} aria-hidden />
          <span className="label-sm">{s.name}</span>
        </li>
      ))}
    </ul>
  )
}

/**
 * VI — Textures that speak. A scroll-velocity marquee of cloth names, a masked mosaic of
 * drawn cloth swatches drifting at different depths, three fabric facts and the palette —
 * the house colours first, then the colours the pieces come in.
 */
export default function Textures() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const el = root.current
      if (!el) return
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        const q = gsap.utils.selector(el)
        ;(q('.hs-tex__tile') as HTMLElement[]).forEach((tile, i) => {
          const speed = Number(tile.dataset.speed || 0)
          gsap
            .timeline({ scrollTrigger: { trigger: tile, start: 'top 90%' }, delay: (i % 3) * 0.08 })
            .fromTo(tile.querySelector('.hs-tex__mask'), { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'silk' })
            .fromTo(tile.querySelector('.hs-tex__cloth'), { scale: 1.25 }, { scale: 1, duration: 2, ease: 'lux' }, 0)
            .from(tile.querySelector('figcaption'), { opacity: 0, y: 14, duration: 1, ease: 'lux' }, 0.6)
          gsap.fromTo(tile, { yPercent: -speed / 2 }, {
            yPercent: speed / 2,
            ease: 'none',
            scrollTrigger: { trigger: q('.hs-tex__mosaic')[0], start: 'top bottom', end: 'bottom top', scrub: true },
          })
        })
        gsap.from(q('.hs-tex__fact'), {
          opacity: 0,
          y: 30,
          duration: 1.2,
          ease: 'lux',
          stagger: 0.12,
          scrollTrigger: { trigger: q('.hs-tex__facts')[0], start: 'top 85%' },
        })
        gsap.from(q('.hs-tex__swatch'), {
          opacity: 0,
          y: 20,
          scale: 0.6,
          duration: 1,
          ease: 'back.out(1.6)',
          stagger: 0.06,
          scrollTrigger: { trigger: q('.hs-tex__palette')[0], start: 'top 88%' },
        })
        gsap.from(q('.hs-tex__head-aside > *'), {
          opacity: 0,
          y: 24,
          duration: 1.2,
          ease: 'lux',
          stagger: 0.1,
          scrollTrigger: { trigger: q('.hs-tex__head')[0], start: 'top 80%' },
        })
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section ref={root} id={CH.id} className="hs-tex" data-theme={CH.theme} aria-label="Textures that speak">
      <div className="container hs-tex__head">
        <div className="hs-tex__head-main">
          <Eyebrow numeral={CH.numeral}>The cloth</Eyebrow>
          <SplitReveal as="h2" className="hs-tex__title" by="words" stagger={0.06}>
            Textures that <em>speak.</em>
          </SplitReveal>
        </div>
        <div className="hs-tex__head-aside">
          <p className="hs-tex__lead">
            In a boardroom, status is never shouted. It is read — in the weight of a gabardine, the hand of a knit, a
            seam that lies perfectly flat.
          </p>
        </div>
      </div>

      <div className="hs-tex__marquee">
        <Marquee items={FABRICS} speed={34} />
      </div>

      <div className="container">
        <div className="hs-tex__mosaic">
          {TILES.map((t, i) => (
            <figure
              key={t.fabric}
              className={`hs-tex__tile hs-tex__tile--${i + 1} hs-tex__tile--${t.shape}`}
              data-speed={t.speed}
              style={{ '--w': `${Math.round(t.w * 1.4)}px`, '--ar': `${t.w} / ${t.h}` } as CSSProperties}
            >
              <div className="hs-tex__mask">
                <FabricSwatch id={t.fabric} w={t.w} h={t.h} className="hs-tex__cloth" />
              </div>
              <figcaption>
                <span className="hs-tex__cap">{t.caption}</span>
                <span className="label-sm hs-tex__note">{t.note}</span>
              </figcaption>
            </figure>
          ))}
        </div>

        <ol className="hs-tex__facts">
          {FACTS.map((f) => (
            <li key={f.title} className="hs-tex__fact">
              <span className="hs-tex__fact-n numeral" aria-hidden>
                {f.n}
              </span>
              <h3 className="hs-tex__fact-title">{f.title}</h3>
              <p className="hs-tex__fact-body">{f.body}</p>
            </li>
          ))}
        </ol>

        <div className="hs-tex__palette">
          <div className="hs-tex__palette-head">
            <p className="label">Intentional colour</p>
            <p className="hs-tex__palette-note">
              Burgundy and gold on ivory for the house; a disciplined set of colours for the pieces — every shade works
              with every other, so the capsule always composes.
            </p>
          </div>
          <div className="hs-tex__groups">
            <div className="hs-tex__group">
              <p className="label-sm hs-tex__group-label">The house</p>
              <SwatchList items={HOUSE} label="The house colours" />
            </div>
            <div className="hs-tex__group">
              <p className="label-sm hs-tex__group-label">The pieces</p>
              <SwatchList items={PIECES} label="Colours the pieces come in" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
