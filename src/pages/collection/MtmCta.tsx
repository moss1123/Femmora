import { useRef } from 'react'
import { motion, useReducedMotion, type Variants } from 'motion/react'
import GarmentFlat from './GarmentFlat'
import { cap, word } from './format'
import Button from '../../components/Button'
import { Eyebrow, Reveal, SplitReveal } from '../../components/Reveal'
import { gsap, useGSAP } from '../../lib/motion'
import { BRAND, TIERS } from '../../data/site'
import { MTM_COUNT, MTM_RANGE, PRODUCTS, productById } from '../../data/products'
import { formatPKR } from '../../store/cart'
import './MtmCta.css'

const FLAGSHIP = BRAND.stores[0]
const CONSULT = TIERS.find((t) => t.id === 'consult')
const COAT = productById('camel-trench')

const STEPS = [
  {
    n: 'I',
    t: 'Measure',
    d: `In store at ${FLAGSHIP.place}, ${FLAGSHIP.city} — from ${FLAGSHIP.when.replace('Flagship · ', '')} — or by appointment, booked through the ${BRAND.whatsapp}.`,
  },
  { n: 'II', t: 'Fit', d: 'One fitting, one final: shoulder, sleeve, length and ease, adjusted on you.' },
  {
    n: 'III',
    t: 'Kept on file',
    d: 'Your measurements stay on file, so every repeat order is cut to you — and arrives in its rigid box with a how-to-wear card.',
  },
]

/** An illustrative client file — the size M row of the Femmora chart, plus the coat's own lines. */
const FILE = [
  { k: 'Bust', v: '36' },
  { k: 'Waist', v: '30' },
  { k: 'Hip', v: '39' },
  { k: 'Shoulder', v: '15' },
  { k: 'Sleeve', v: '23½' },
  { k: 'Length', v: '44' },
]

/* the tape's centre line, and where its numbers sit */
const TAPE = 'M-40 168 C 240 52, 520 238, 820 138 S 1360 36, 1660 118'
const NUMBERS = Array.from({ length: 15 }, (_, i) => i + 1)

const line: Variants = {
  off: { pathLength: 0, opacity: 0 },
  on: (i: number = 0) => ({
    pathLength: 1,
    opacity: 1,
    transition: { pathLength: { duration: 1.4, ease: [0.65, 0, 0.35, 1], delay: 0.3 + i * 0.2 }, opacity: { duration: 0.2, delay: 0.3 + i * 0.2 } },
  }),
}
const fade: Variants = {
  off: { opacity: 0 },
  on: (i: number = 0) => ({ opacity: 1, transition: { duration: 0.8, delay: 1.2 + i * 0.15 } }),
}

/**
 * IV — Made-to-measure call to action. Theme: parchment (the /custom flood colour), so the
 * hand-off to Custom Services feels like turning a page.
 */
export default function MtmCta() {
  const root = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()

  useGSAP(
    () => {
      const el = root.current
      if (!el) return
      const tape = el.querySelector('.col-mtm__tape')
      const tapeIn = el.querySelector('.col-mtm__tape-in')
      const file = el.querySelector('.col-mtm__file')
      if (!tape || !tapeIn || !file) return
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // the tape unrolls with scroll…
        gsap.fromTo(
          tape,
          { clipPath: 'inset(0% 100% 0% 0%)' },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            ease: 'none',
            scrollTrigger: { trigger: el, start: 'top 85%', end: 'center 50%', scrub: 0.6 },
          },
        )
        // …and keeps drifting gently as you pass
        gsap.fromTo(
          tapeIn,
          { xPercent: 4 },
          { xPercent: -5, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } },
        )
        gsap.fromTo(
          file,
          { y: 40 },
          { y: -30, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } },
        )
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section ref={root} className="section col-mtm" data-theme="parchment" aria-label="Made to measure">
      <div className="col-mtm__tape" aria-hidden>
        <div className="col-mtm__tape-in">
          <svg viewBox="0 0 1600 260" preserveAspectRatio="xMidYMid slice" focusable="false">
            <defs>
              <path id="col-mtm-tape" d={TAPE} />
              <path id="col-mtm-tape-edge" d={TAPE} transform="translate(0 -23)" />
              <path id="col-mtm-tape-num" d={TAPE} transform="translate(0 9)" />
            </defs>
            {/* body + gilt edges */}
            <use href="#col-mtm-tape" className="col-mtm__tape-edge" />
            <use href="#col-mtm-tape" className="col-mtm__tape-body" />
            {/* millimetre ticks + centimetre ticks */}
            <use href="#col-mtm-tape-edge" className="col-mtm__tape-mm" />
            <use href="#col-mtm-tape-edge" className="col-mtm__tape-cm" transform="translate(0 4)" />
            {NUMBERS.map((n) => (
              <text key={n} className="col-mtm__tape-num">
                <textPath href="#col-mtm-tape-num" startOffset={n * 110}>
                  {n}
                </textPath>
              </text>
            ))}
          </svg>
        </div>
      </div>

      <div className="container col-mtm__grid">
        <div className="col-mtm__copy">
          <Eyebrow numeral="IV">Made to measure</Eyebrow>
          <SplitReveal as="h2" className="col-mtm__title">
            Cut to <em>you</em>,
            <br />
            not to a size chart.
          </SplitReveal>
          <Reveal delay={0.1}>
            <p className="lead col-mtm__lead">
              {cap(word(MTM_COUNT))} of the {word(PRODUCTS.length)} pieces in this chapter can be cut to your
              measurements — the same designs, from{' '}
              <span className="col-mtm__price">
                {formatPKR(MTM_RANGE.min)} – {MTM_RANGE.max.toLocaleString('en-PK')}
              </span>{' '}
              per piece, with your measurements kept on file for every order after.
            </p>
          </Reveal>
          <Reveal delay={0.18} className="col-mtm__actions">
            <Button variant="gold" to="/custom#book" cursor="Book">
              Book a fitting
            </Button>
            <Button variant="ghost" to="/custom" cursor="Custom">
              Explore custom services
            </Button>
          </Reveal>
          {CONSULT && (
            <Reveal delay={0.24} className="col-mtm__consult">
              <p className="label-sm col-mtm__consult-k">Or the whole wardrobe</p>
              <p className="col-mtm__consult-v">
                {CONSULT.name} — {CONSULT.blurb.charAt(0).toLowerCase() + CONSULT.blurb.slice(1)}{' '}
                <span className="col-mtm__price">{CONSULT.price}</span> per engagement.
              </p>
            </Reveal>
          )}
        </div>

        <div className="col-mtm__side">
          <figure className="col-mtm__file">
            <motion.div
              className="col-mtm__card"
              initial={reduced ? 'on' : 'off'}
              whileInView="on"
              viewport={{ once: true, amount: 0.35 }}
            >
              <div className="col-mtm__card-head">
                <span className="label-sm">Sample client file</span>
                <span className="numeral col-mtm__card-no">No. 0417</span>
              </div>
              <div className="col-mtm__card-body">
                <div className="col-mtm__coat" aria-hidden>
                  {COAT && <GarmentFlat kind={COAT.garment} colour={COAT.colours[0].hex} texture={COAT.texture} />}
                  {/* the coat's own lines, measured */}
                  <svg className="col-mtm__dims" viewBox="0 0 300 400" focusable="false">
                    <motion.path d="M88 58 L88 2 M212 58 L212 2" variants={fade} custom={0} className="col-mtm__dim-ext" />
                    <motion.path d="M88 6 L212 6 M88 0 L88 12 M212 0 L212 12" variants={line} custom={0} />
                    <motion.text x={150} y={-4} variants={fade} custom={1} className="col-mtm__dim-t">
                      15″
                    </motion.text>
                    <motion.path d="M168 47 L284 47 M228 389 L284 389" variants={fade} custom={1} className="col-mtm__dim-ext" />
                    <motion.path d="M276 47 L276 389 M270 47 L282 47 M270 389 L282 389" variants={line} custom={1} />
                    <motion.text x={290} y={222} variants={fade} custom={2} className="col-mtm__dim-t col-mtm__dim-t--v">
                      44″
                    </motion.text>
                  </svg>
                </div>
                <dl className="col-mtm__measures">
                  {FILE.map((m, i) => (
                    <motion.div key={m.k} className="col-mtm__measure" variants={fade} custom={i * 0.6}>
                      <dt className="label-sm">{m.k}</dt>
                      <dd>
                        <span className="numeral">{m.v}</span>
                        <span className="col-mtm__unit">in</span>
                      </dd>
                    </motion.div>
                  ))}
                </dl>
              </div>
              <p className="col-mtm__card-foot">
                <span className="col-mtm__seal" aria-hidden />
                Kept on file · re-cut for every order after
              </p>
            </motion.div>
            <figcaption className="col-mtm__figcap">
              <span className="label-sm">{COAT?.name ?? 'The Camel Trench'}</span>
              <span>Measured once. Power in every detail.</span>
            </figcaption>
          </figure>

          <ol className="col-mtm__steps">
            {STEPS.map((s, i) => (
              <Reveal as="li" key={s.n} className="col-mtm__step" delay={0.08 * i}>
                <span className="numeral col-mtm__step-n" aria-hidden>
                  {s.n}
                </span>
                <div>
                  <h3 className="col-mtm__step-t">{s.t}</h3>
                  <p className="col-mtm__step-d">{s.d}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
