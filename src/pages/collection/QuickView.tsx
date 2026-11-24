import { useCallback, useEffect, useId, useRef, useState, type CSSProperties, type MouseEvent, type PointerEvent } from 'react'
import { createPortal } from 'react-dom'
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'motion/react'
import GarmentFlat, { FabricSwatch } from './GarmentFlat'
import FormalityMeter from './FormalityMeter'
import Button from '../../components/Button'
import TLink from '../../components/TLink'
import { useDialog } from './dialog'
import { EASE, EASE_IN, ROMAN } from './format'
import { useGo } from '../../hooks/useGo'
import { formatPKR, useCart } from '../../store/cart'
import { BRAND } from '../../data/site'
import { FORMALITY, SIZES, SIZE_GUIDE, isMtm, pairsFor, productById, type Product } from '../../data/products'
import type { QuickTarget } from './ProductCard'
import './QuickView.css'

const MTM = 'mtm' as const
const ONE_SIZE = 'One size'
const FLAGSHIP = BRAND.stores[0]

interface Props {
  target: QuickTarget | null
  onClose: () => void
  /** swap the open piece (from "Wear it with") */
  onSwitch: (t: QuickTarget) => void
}

/**
 * Quick view — an accessible modal dialog rendered into <body> (above the nav).
 * Locks Lenis, traps focus, closes on Escape / scrim / close button and restores focus to the
 * card — unless "Add to bag" opened the bag drawer, which then takes focus.
 */
export default function QuickView({ target, onClose, onSwitch }: Props) {
  const product = target ? productById(target.id) : undefined
  const open = !!product
  const panelRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const [switched, setSwitched] = useState(false)
  const reduced = useReducedMotion()

  const close = useCallback(() => {
    setSwitched(false)
    onClose()
  }, [onClose])

  const switchTo = useCallback(
    (t: QuickTarget) => {
      setSwitched(true)
      onSwitch(t)
    },
    [onSwitch],
  )

  useDialog(open, panelRef, close, {
    initialFocus: closeRef,
    shouldRestore: () => !useCart.getState().open,
  })

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {product && target && (
        <motion.div
          key="col-qv"
          className="col-qv"
          data-theme="wine"
          initial={{ opacity: 1 }}
          exit={{ opacity: 1, transition: { duration: 0.55 } }}
        >
          <motion.div
            className="col-qv__scrim"
            aria-hidden
            data-cursor="Close"
            onClick={close}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.45, delay: 0.1 } }}
            transition={{ duration: 0.7, ease: EASE }}
          />
          <motion.div
            ref={panelRef}
            className="col-qv__panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`col-qv-title-${product.id}`}
            aria-describedby={`col-qv-desc-${product.id}`}
            tabIndex={-1}
            data-lenis-prevent
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 56, clipPath: 'inset(7% 5% 7% 5%)' }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0, clipPath: 'inset(0% 0% 0% 0%)' }}
            exit={
              reduced
                ? { opacity: 0, transition: { duration: 0.2 } }
                : { opacity: 0, y: 28, clipPath: 'inset(3% 2% 3% 2%)', transition: { duration: 0.42, ease: EASE_IN } }
            }
            transition={{ duration: 1, ease: EASE }}
          >
            <button ref={closeRef} type="button" className="col-qv__close" onClick={close} aria-label="Close quick view" data-cursor="Close">
              <svg viewBox="0 0 20 20" aria-hidden>
                <path d="M3 3 17 17M17 3 3 17" fill="none" stroke="currentColor" strokeWidth="1" />
              </svg>
            </button>

            <AnimatePresence mode="wait" initial={false}>
              <Content
                key={product.id}
                product={product}
                initialColour={target.colour}
                focusOnMount={switched}
                onClose={close}
                onSwitch={switchTo}
              />
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

/* ==========================================================================
   Content — keyed by product so its state resets when a pairing is opened
   ========================================================================== */

interface ContentProps {
  product: Product
  initialColour: number
  focusOnMount: boolean
  onClose: () => void
  onSwitch: (t: QuickTarget) => void
}

function Content({ product: p, initialColour, focusOnMount, onClose, onSwitch }: ContentProps) {
  const start = Math.min(Math.max(initialColour, 0), p.colours.length - 1)
  const [colour, setColour] = useState(start)
  // a one-size piece has nothing to choose — don't make her pick the only option
  const [size, setSize] = useState<string | null>(p.sizing === 'one-size' ? ONE_SIZE : null)
  const [error, setError] = useState(false)
  const [guide, setGuide] = useState(false)
  const [care, setCare] = useState(false)
  const add = useCart((s) => s.add)
  const go = useGo()
  const reduced = useReducedMotion()

  const titleRef = useRef<HTMLHeadingElement>(null)
  const sizesRef = useRef<HTMLFieldSetElement>(null)
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const ids = {
    title: `col-qv-title-${p.id}`,
    desc: `col-qv-desc-${p.id}`,
    guide: `col-qv-guide-${uid}`,
    care: `col-qv-care-${uid}`,
    err: `col-qv-err-${uid}`,
    hint: `col-qv-hint-${uid}`,
  }

  useEffect(() => {
    if (focusOnMount) titleRef.current?.focus({ preventScroll: true })
  }, [focusOnMount])

  const c = p.colours[colour]
  const sized = p.sizing === 'sized'
  const sizeOptions: string[] = sized ? [...SIZES] : [ONE_SIZE]
  const mtmAllowed = isMtm(p) && p.mtmPrice !== undefined
  const mtmSel = size === MTM && mtmAllowed
  const price = mtmSel && p.mtmPrice !== undefined ? p.mtmPrice : p.price
  const level = FORMALITY[p.formality]
  const pairs = pairsFor(p.id)

  /* — pointer tilt on the flat (fine pointers only) — */
  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const sx = useSpring(px, { stiffness: 110, damping: 18, mass: 0.7 })
  const sy = useSpring(py, { stiffness: 110, damping: 18, mass: 0.7 })
  const rotY = useTransform(sx, [-0.5, 0.5], [-7, 7])
  const rotX = useTransform(sy, [-0.5, 0.5], [5, -5])
  const artX = useTransform(sx, [-0.5, 0.5], [-14, 14])
  const clothX = useTransform(sx, [-0.5, 0.5], [8, -8])
  const clothY = useTransform(sy, [-0.5, 0.5], [6, -6])

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (reduced || e.pointerType !== 'mouse') return
    const r = e.currentTarget.getBoundingClientRect()
    px.set((e.clientX - r.left) / r.width - 0.5)
    py.set((e.clientY - r.top) / r.height - 0.5)
  }
  const onLeave = () => {
    px.set(0)
    py.set(0)
  }

  const pickSize = (s: string) => {
    setSize(s)
    setError(false)
  }

  const onAdd = () => {
    if (!size) {
      setError(true)
      sizesRef.current?.querySelector<HTMLInputElement>('input:not(:disabled)')?.focus()
      return
    }
    add({
      productId: p.id,
      name: p.name,
      price,
      size: mtmSel ? 'Made to measure' : size,
      fit: mtmSel ? 'made-to-measure' : 'standard',
      colour: c.name,
    })
    onClose() // the bag drawer opens itself (useCart.add sets open) and takes focus
  }

  const leaveTo = (to: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    onClose()
    // let the dialog release Lenis before the transition system takes over
    requestAnimationFrame(() => go(to))
  }

  return (
    <motion.div
      className="col-qv__content"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.5, ease: EASE } }}
      exit={{ opacity: 0, transition: { duration: 0.25 } }}
    >
      {/* ---------------- media: the flat on its rail, and a cut of the cloth ---------------- */}
      <div className="col-qv__media" onPointerMove={onMove} onPointerLeave={onLeave}>
        <span className="col-qv__no numeral" aria-hidden>
          No. {p.no}
        </span>
        <span className="col-qv__mood-label label-sm" aria-hidden>
          {p.mood}
        </span>
        <span className="col-qv__rail" aria-hidden />
        <div className="col-qv__stage">
          <motion.div className="col-qv__art" style={{ rotateX: rotX, rotateY: rotY, x: artX }}>
            <GarmentFlat
              kind={p.garment}
              colour={c.hex}
              texture={p.texture}
              draw
              title={`Technical flat of ${p.name} in ${c.name}`}
            />
          </motion.div>
        </div>

        <motion.div
          className="col-qv__cloth"
          aria-hidden
          style={{ x: clothX, y: clothY }}
          initial={reduced ? false : { opacity: 0, rotate: -10, scale: 0.9 }}
          animate={{ opacity: 1, rotate: -4, scale: 1 }}
          transition={{ duration: 1.1, ease: EASE, delay: 0.8 }}
        >
          <span className="col-qv__cloth-art">
            <FabricSwatch colour={c.hex} texture={p.texture} />
          </span>
          <span className="col-qv__cloth-cap">
            <span className="label-sm">The cloth</span>
            <span className="col-qv__cloth-name">{p.cloth}</span>
          </span>
        </motion.div>

        <p className="col-qv__flat-cap label-sm" aria-hidden>
          Technical flat · {c.name}
        </p>
      </div>

      {/* ---------------- details ---------------- */}
      <div className="col-qv__details">
        <motion.div
          className="col-qv__details-inner"
          initial={reduced ? false : 'off'}
          animate="on"
          variants={{ on: { transition: { staggerChildren: 0.06, delayChildren: 0.25 } } }}
        >
          <motion.p className="col-qv__kicker label-sm" variants={rise}>
            <span>{p.category}</span>
            <span className="col-qv__dot" aria-hidden />
            <span>{mtmAllowed ? 'Core ready-to-wear · Made-to-Measure' : 'Core ready-to-wear'}</span>
          </motion.p>

          <motion.h2 ref={titleRef} id={ids.title} className="col-qv__name" tabIndex={-1} variants={rise}>
            {p.name}
          </motion.h2>
          <motion.p className="col-qv__short" variants={rise}>
            {p.short}
          </motion.p>

          <motion.div className="col-qv__price" variants={rise}>
            <span className="col-qv__price-v" aria-live="polite">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={price}
                  initial={{ y: '100%', opacity: 0 }}
                  animate={{ y: '0%', opacity: 1 }}
                  exit={{ y: '-100%', opacity: 0 }}
                  transition={{ duration: 0.55, ease: EASE }}
                >
                  {formatPKR(price)}
                </motion.span>
              </AnimatePresence>
            </span>
            <span className="col-qv__price-note">
              {mtmSel ? 'per piece, made to measure — measurements kept on file' : 'per piece · Core ready-to-wear'}
            </span>
          </motion.div>

          <motion.p id={ids.desc} className="col-qv__desc" variants={rise}>
            {p.description}
          </motion.p>

          {/* formality — Differentiator III */}
          <motion.div className="col-qv__formality" variants={rise}>
            <div className="col-qv__formality-top">
              <p className="col-qv__legend label-sm">Formality level</p>
              <FormalityMeter level={p.formality} size="lg" />
            </div>
            <p className="col-qv__formality-when">{level.when}</p>
            <p className="col-qv__formality-note">{p.formalityNote}</p>
          </motion.div>

          {/* colour */}
          <motion.fieldset className="col-qv__field" variants={rise}>
            <legend className="col-qv__legend label-sm">
              Colour <span className="col-qv__legend-v">— {c.name}</span>
            </legend>
            <LayoutGroup id={`qv-colour-${uid}`}>
              <div className="col-qv__swatches">
                {p.colours.map((cw, i) => (
                  <label key={cw.name} className="col-qv__swatch" style={{ '--sw': cw.hex } as CSSProperties} title={cw.name}>
                    <input
                      type="radio"
                      className="sr-only"
                      name={`col-qv-colour-${uid}`}
                      checked={i === colour}
                      onChange={() => setColour(i)}
                    />
                    <span className="sr-only">{cw.name}</span>
                    <span className="col-qv__swatch-dot" aria-hidden />
                    {i === colour && (
                      <motion.span
                        layoutId="col-qv-ring"
                        className="col-qv__swatch-ring"
                        aria-hidden
                        transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 34 }}
                      />
                    )}
                  </label>
                ))}
              </div>
            </LayoutGroup>
          </motion.fieldset>

          {/* size */}
          <motion.fieldset
            ref={sizesRef}
            className={`col-qv__field ${error ? 'has-error' : ''}`}
            aria-describedby={`${ids.err} ${ids.hint}`}
            variants={rise}
          >
            <legend className="col-qv__legend label-sm">
              Size {size && <span className="col-qv__legend-v">— {mtmSel ? 'Made-to-Measure' : size}</span>}
            </legend>
            {sized && (
              <button
                type="button"
                className="col-qv__guide-btn label-sm"
                aria-expanded={guide}
                aria-controls={ids.guide}
                onClick={() => setGuide((g) => !g)}
              >
                Size guide
              </button>
            )}

            <AnimatePresence initial={false}>
              {sized && guide && (
                <motion.div
                  key="guide"
                  id={ids.guide}
                  className="col-qv__guide"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.45, ease: EASE }}
                >
                  <table>
                    <caption className="label-sm">Body measurements, inches</caption>
                    <thead>
                      <tr>
                        <th scope="col">Size</th>
                        <th scope="col">Bust</th>
                        <th scope="col">Waist</th>
                        <th scope="col">Hip</th>
                      </tr>
                    </thead>
                    <tbody>
                      {SIZES.map((s) => (
                        <tr key={s} className={size === s ? 'is-sel' : ''}>
                          <th scope="row">{s}</th>
                          <td>{SIZE_GUIDE[s].bust}</td>
                          <td>{SIZE_GUIDE[s].waist}</td>
                          <td>{SIZE_GUIDE[s].hip}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="col-qv__guide-note">
                    One consistent Femmora size chart across every piece. Between sizes? Size up — or have it cut to you.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <LayoutGroup id={`qv-size-${uid}`}>
              <div className={`col-qv__sizes ${sized ? '' : 'is-single'}`}>
                {sizeOptions.map((s) => (
                  <label key={s} className="col-qv__size">
                    <input
                      type="radio"
                      className="sr-only"
                      name={`col-qv-size-${uid}`}
                      value={s}
                      checked={size === s}
                      onChange={() => pickSize(s)}
                    />
                    <span className="col-qv__size-t">{s}</span>
                    {size === s && (
                      <motion.span
                        layoutId="col-qv-size"
                        className="col-qv__size-mark"
                        aria-hidden
                        transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 36 }}
                      />
                    )}
                  </label>
                ))}
              </div>
            </LayoutGroup>

            {mtmAllowed && p.mtmPrice !== undefined ? (
              <label className={`col-qv__mtm ${mtmSel ? 'is-sel' : ''}`}>
                <input
                  type="radio"
                  className="sr-only"
                  name={`col-qv-size-${uid}`}
                  value={MTM}
                  checked={mtmSel}
                  onChange={() => pickSize(MTM)}
                />
                <span className="col-qv__mtm-radio" aria-hidden />
                <span className="col-qv__mtm-text">
                  <span className="col-qv__mtm-title">Made-to-Measure — {formatPKR(p.mtmPrice)}</span>
                  <span className="col-qv__mtm-sub">
                    The same design, cut to your measurements — kept on file, so every order after is re-cut from
                    them.
                  </span>
                </span>
              </label>
            ) : (
              <p className="col-qv__mtm-none">
                {sized
                  ? 'Offered in Core ready-to-wear — one consistent Femmora size chart.'
                  : 'One size — no fitting needed.'}
              </p>
            )}

            <p id={ids.err} className="col-qv__error" role="alert">
              {error ? (mtmAllowed ? 'Choose a size — or Made-to-Measure.' : 'Choose a size to continue.') : ''}
            </p>
            <p id={ids.hint} className={`col-qv__hint ${mtmSel ? 'is-on' : ''}`}>
              {mtmSel
                ? `After checkout, the WhatsApp Concierge books your measuring — at our ${FLAGSHIP.place}, ${FLAGSHIP.city} flagship (opening ${FLAGSHIP.when.replace('Flagship · ', '')}) or by appointment.`
                : ''}
            </p>
          </motion.fieldset>

          <motion.div className="col-qv__actions" variants={rise}>
            <Button variant="gold" type="button" className="col-qv__add" onClick={onAdd} cursor="Add">
              Add to bag · {formatPKR(price)}
            </Button>
            <TLink to="/custom#book" className="col-qv__book label-sm" onClick={leaveTo('/custom#book')} cursor="Book">
              Or book a fitting with Custom Services
            </TLink>
          </motion.div>
          <motion.p className="col-qv__assure" variants={rise}>
            Rigid-box delivery nationwide, with a how-to-wear card · No sales, no discount codes — ever.
          </motion.p>

          {/* built in */}
          <motion.div className="col-qv__block" variants={rise}>
            <h3 className="col-qv__block-title label-sm">Built in</h3>
            <ol className="col-qv__features">
              {p.features.map((f, i) => (
                <li key={f}>
                  <span className="numeral" aria-hidden>
                    {ROMAN[i]}
                  </span>
                  <span>{f}</span>
                </li>
              ))}
            </ol>
          </motion.div>

          {/* fabric & care */}
          <motion.div className="col-qv__acc" variants={rise}>
            <h3 className="col-qv__acc-h">
              <button type="button" className="col-qv__acc-btn" aria-expanded={care} aria-controls={ids.care} onClick={() => setCare((v) => !v)}>
                <span className="label-sm">Fabric &amp; care</span>
                <span className="col-qv__acc-icon" aria-hidden />
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {care && (
                <motion.div
                  key="care"
                  id={ids.care}
                  role="region"
                  aria-label="Fabric and care"
                  className="col-qv__acc-panel"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.45, ease: EASE }}
                >
                  <p className="col-qv__fabric">{p.fabric}</p>
                  <ul className="col-qv__care">
                    {p.care.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* wear it with */}
          {pairs.length > 0 && (
            <motion.div className="col-qv__block" variants={rise}>
              <h3 className="col-qv__block-title label-sm">Wear it with</h3>
              <ul className="col-qv__pairs">
                {pairs.map((q) => (
                  <li key={q.id}>
                    <button
                      type="button"
                      className="col-qv__pair"
                      onClick={() => onSwitch({ id: q.id, colour: 0 })}
                      aria-label={`View ${q.name}, ${formatPKR(q.price)}`}
                      data-cursor="View"
                    >
                      <span className="col-qv__pair-art" aria-hidden>
                        <GarmentFlat kind={q.garment} colour={q.colours[0].hex} mini />
                      </span>
                      <span className="col-qv__pair-name" aria-hidden>
                        {q.name}
                      </span>
                      <span className="col-qv__pair-price" aria-hidden>
                        {formatPKR(q.price)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              <p className="col-qv__capsule">
                Every piece in this chapter interchanges with every other — the capsule principle behind our{' '}
                <TLink to="/styling" onClick={leaveTo('/styling')}>
                  styling service
                </TLink>
                .
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}

const rise = {
  off: { opacity: 0, y: 18 },
  on: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
}
