import { useCallback, useEffect, useRef, useState, type MouseEvent, type Ref } from 'react'
import { useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import TLink from './TLink'
import Button from './Button'
import GarmentFlat from '../pages/collection/GarmentFlat'
import { useDialog } from '../pages/collection/dialog'
import { useGo } from '../hooks/useGo'
import { cartCount, cartTotal, formatPKR, useCart, type CartItem } from '../store/cart'
import { capsuleById, productById, type Capsule, type Product } from '../data/products'
import { BRAND } from '../data/site'
import './CartDrawer.css'

const EASE = [0.22, 1, 0.36, 1] as const
const CURTAIN = [0.76, 0, 0.24, 1] as const

interface OrderLine {
  key: string
  name: string
  detail: string
  qty: number
  total: number
}
interface Order {
  ref: string
  count: number
  total: number
  lines: OrderLine[]
  mtm: boolean
}

const detailOf = (i: CartItem) => `${i.colour} · ${i.fit === 'made-to-measure' ? 'Made-to-Measure' : `Size ${i.size}`}`

/**
 * The global bag: a right-hand slide-out over a dimmed page. Opened by the nav bag button
 * and by "Add to bag" (useCart.add sets `open`). Escape / scrim / close button dismiss it;
 * Lenis is stopped while it is open and the list scrolls natively (data-lenis-prevent).
 * Checkout is a demo: it shows an order confirmation and takes no payment.
 */
export default function CartDrawer() {
  const open = useCart((s) => s.open)
  const items = useCart((s) => s.items)
  const setOpen = useCart((s) => s.setOpen)
  const setQty = useCart((s) => s.setQty)
  const remove = useCart((s) => s.remove)
  const { pathname } = useLocation()
  const go = useGo()
  const reduced = useReducedMotion()

  const panelRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const timer = useRef(0)
  const raf = useRef(0)
  const [stage, setStage] = useState<'bag' | 'processing' | 'placed'>('bag')
  const [order, setOrder] = useState<Order | null>(null)

  const close = useCallback(() => setOpen(false), [setOpen])
  /* the confirmation mounts only after the list's exit (AnimatePresence mode="wait"),
     so it takes focus from its own (stable) ref callback rather than a timed guess */
  const focusDone = useCallback((el: HTMLHeadingElement | null) => {
    if (el) raf.current = requestAnimationFrame(() => el.focus({ preventScroll: true }))
  }, [])

  useDialog(open, panelRef, close, {
    initialFocus: closeRef,
    fallbackFocus: () => document.querySelector<HTMLElement>('.nav__bag'),
  })

  // a new page never opens with the bag still out
  useEffect(() => {
    useCart.getState().setOpen(false)
  }, [pathname])

  // closing mid-checkout abandons it
  useEffect(() => {
    if (!open) {
      window.clearTimeout(timer.current)
      cancelAnimationFrame(raf.current)
    }
  }, [open])
  useEffect(
    () => () => {
      window.clearTimeout(timer.current)
      cancelAnimationFrame(raf.current)
    },
    [],
  )

  const count = cartCount(items)
  const total = cartTotal(items)
  const hasMtm = items.some((i) => i.fit === 'made-to-measure')

  const reset = () => {
    window.clearTimeout(timer.current)
    setStage('bag')
    setOrder(null)
  }

  const checkout = () => {
    if (stage !== 'bag' || items.length === 0) return
    setStage('processing')
    timer.current = window.setTimeout(() => {
      const placed = useCart.getState().items
      if (placed.length === 0) {
        setStage('bag')
        return
      }
      const year = String(new Date().getFullYear()).slice(2)
      setOrder({
        ref: `FM-${year}-${String(Math.floor(1000 + Math.random() * 9000))}`,
        count: cartCount(placed),
        total: cartTotal(placed),
        lines: placed.map((i) => ({ key: i.key, name: i.name, detail: detailOf(i), qty: i.qty, total: i.qty * i.price })),
        mtm: placed.some((i) => i.fit === 'made-to-measure'),
      })
      setStage('placed')
      useCart.getState().clear()
      // the footer (with the focused Checkout button) is about to leave: park focus on the
      // dialog title until the confirmation heading mounts and takes it (focusDone)
      titleRef.current?.focus({ preventScroll: true })
    }, 1400)
  }

  const removeItem = (key: string) => {
    remove(key)
    // the focused control has gone — keep focus inside the dialog
    raf.current = requestAnimationFrame(() => titleRef.current?.focus({ preventScroll: true }))
  }

  /** close first so the dialog releases Lenis, then hand over to the transition system */
  const leaveTo = (to: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    close()
    requestAnimationFrame(() => go(to))
  }
  const toCollection = pathname === '/collection' ? '/collection#collection-grid' : '/collection'

  const view = order && stage === 'placed' ? 'done' : items.length === 0 ? 'empty' : 'list'

  return (
    <AnimatePresence onExitComplete={reset}>
      {open && (
        <motion.div key="bag" className="bag" initial={{ opacity: 1 }} exit={{ opacity: 1, transition: { duration: 0.8 } }}>
          <motion.div
            className="bag__scrim"
            aria-hidden
            data-cursor="Close"
            onClick={close}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.5, delay: 0.15 } }}
            transition={{ duration: 0.7, ease: EASE }}
          />

          <motion.div
            ref={panelRef}
            className="bag__panel"
            data-theme="ivory"
            role="dialog"
            aria-modal="true"
            aria-labelledby="bag-title"
            tabIndex={-1}
            initial={reduced ? { opacity: 0 } : { x: '100%' }}
            animate={reduced ? { opacity: 1 } : { x: '0%' }}
            exit={reduced ? { opacity: 0 } : { x: '100%', transition: { duration: 0.65, ease: CURTAIN } }}
            transition={{ duration: 0.95, ease: CURTAIN }}
          >
            {/* ---------- header ---------- */}
            <header className="bag__head">
              <div className="bag__head-l">
                <p className="label-sm bag__eyebrow">Femmora · Chapter One</p>
                <h2 id="bag-title" ref={titleRef} className="bag__title" tabIndex={-1}>
                  Your bag
                  <span className="sr-only">
                    , {count} {count === 1 ? 'piece' : 'pieces'}
                  </span>
                  <span className="bag__count numeral" aria-hidden>
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.span
                        key={count}
                        initial={{ y: '90%', opacity: 0 }}
                        animate={{ y: '0%', opacity: 1 }}
                        exit={{ y: '-90%', opacity: 0 }}
                        transition={{ duration: 0.5, ease: EASE }}
                      >
                        ({String(count).padStart(2, '0')})
                      </motion.span>
                    </AnimatePresence>
                  </span>
                </h2>
              </div>
              <button ref={closeRef} type="button" className="bag__close" onClick={close} aria-label="Close bag" data-cursor="Close">
                <svg viewBox="0 0 20 20" aria-hidden>
                  <path d="M3 3 17 17M17 3 3 17" fill="none" stroke="currentColor" strokeWidth="1" />
                </svg>
              </button>
            </header>
            <div className="bag__rule" aria-hidden />

            {/* ---------- body ---------- */}
            <div className="bag__body" data-lenis-prevent>
              <AnimatePresence mode="wait" initial={false}>
                {view === 'list' && (
                  <motion.div
                    key="list"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.3 } }}
                  >
                    <p className="bag__perk">
                      <span className="bag__perk-mark" aria-hidden />
                      Delivered nationwide in a rigid box, with a how-to-wear card
                    </p>
                    <ul className="bag__list" aria-label="Pieces in your bag">
                      <AnimatePresence mode="popLayout" initial={true}>
                        {items.map((item, i) => (
                          <BagRow
                            key={item.key}
                            item={item}
                            index={i}
                            reduced={!!reduced}
                            onQty={(q) => setQty(item.key, q)}
                            onRemove={() => removeItem(item.key)}
                          />
                        ))}
                      </AnimatePresence>
                    </ul>
                  </motion.div>
                )}

                {view === 'empty' && (
                  <motion.div
                    key="empty"
                    className="bag-empty"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE, delay: 0.2 } }}
                    exit={{ opacity: 0, transition: { duration: 0.25 } }}
                  >
                    <div className="bag-empty__art" aria-hidden>
                      <span className="bag-empty__rail" />
                      <GarmentFlat kind="trench" colour="#6e1423" texture="gabardine" draw />
                    </div>
                    <p className="bag-empty__title">Your bag is empty.</p>
                    <p className="bag-empty__body">
                      Begin with the piece that leads Chapter One — the Burgundy Trench — or let us build the whole
                      wardrobe with you.
                    </p>
                    <div className="bag-empty__links">
                      <TLink to={toCollection} className="bag-link" onClick={leaveTo(toCollection)} cursor="Shop">
                        <span>Explore the collection</span>
                        <svg viewBox="0 0 28 10" aria-hidden>
                          <path d="M0 5h26M22 1l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1" />
                        </svg>
                      </TLink>
                      <TLink to="/custom" className="bag-link bag-link--quiet" onClick={leaveTo('/custom')} cursor="Custom">
                        <span>Book a wardrobe consultation</span>
                      </TLink>
                    </div>
                  </motion.div>
                )}

                {view === 'done' && order && (
                  <motion.div
                    key="done"
                    className="bag-done"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE } }}
                    exit={{ opacity: 0 }}
                  >
                    <svg className="bag-done__seal" viewBox="0 0 120 120" aria-hidden>
                      <motion.circle
                        cx="60"
                        cy="60"
                        r="54"
                        initial={{ pathLength: reduced ? 1 : 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.4, ease: [0.65, 0, 0.35, 1] }}
                      />
                      <circle cx="60" cy="60" r="46" className="bag-done__seal-inner" />
                      <motion.path
                        d="M40 61 L54 75 L81 46"
                        initial={{ pathLength: reduced ? 1 : 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.8, ease: EASE, delay: 0.9 }}
                      />
                    </svg>
                    <p className="label-sm bag-done__ref">Demo order · {order.ref}</p>
                    <h3 ref={focusDone} tabIndex={-1} className="bag-done__title">
                      Thank you.
                    </h3>
                    <p className="bag-done__lead">
                      This is a demo storefront — no payment has been taken and nothing will be shipped.
                    </p>

                    <div className="bag-receipt">
                      <ul className="bag-receipt__lines" aria-label="Order summary">
                        {order.lines.map((l) => (
                          <li key={l.key}>
                            <span className="bag-receipt__name">
                              {l.name}
                              {l.qty > 1 && <span className="bag-receipt__qty"> × {l.qty}</span>}
                              <span className="bag-receipt__detail">{l.detail}</span>
                            </span>
                            <span className="bag-receipt__price">{formatPKR(l.total)}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="bag-receipt__total">
                        <span className="label-sm">
                          {order.count} {order.count === 1 ? 'piece' : 'pieces'}
                        </span>
                        <span className="bag-receipt__price">{formatPKR(order.total)}</span>
                      </p>
                    </div>

                    <p className="bag-done__body">
                      In the real house, your order would leave in its rigid box with a printed how-to-wear card.
                      {order.mtm &&
                        ` For your made-to-measure pieces, the ${BRAND.whatsapp} would message you to book a measuring — and keep your measurements on file for every order after.`}
                    </p>
                    <p className="bag-done__promise label-sm">No sales, no discount codes — ever.</p>
                    <Button variant="outline" type="button" onClick={close} className="bag-done__btn">
                      Continue browsing
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ---------- footer ---------- */}
            <AnimatePresence initial={false}>
              {view === 'list' && (
                <motion.footer
                  key="foot"
                  className="bag__foot"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE, delay: 0.25 } }}
                  exit={{ opacity: 0, y: 16, transition: { duration: 0.25 } }}
                >
                  <div className="bag__total">
                    <span className="label-sm">Subtotal</span>
                    <span className="bag__total-v" aria-live="polite">
                      <AnimatePresence mode="popLayout" initial={false}>
                        <motion.span
                          key={total}
                          initial={{ y: '100%', opacity: 0 }}
                          animate={{ y: '0%', opacity: 1 }}
                          exit={{ y: '-100%', opacity: 0 }}
                          transition={{ duration: 0.5, ease: EASE }}
                        >
                          {formatPKR(total)}
                        </motion.span>
                      </AnimatePresence>
                    </span>
                  </div>
                  <p className="bag__promise">
                    <span className="bag__promise-mark" aria-hidden />
                    No sales, no discount codes — ever.
                  </p>

                  <div className="bag__pack">
                    <svg viewBox="0 0 40 32" aria-hidden className="bag__pack-icon">
                      <path d="M4 12 L20 6 L36 12 L36 26 L20 30 L4 26 Z" fill="none" stroke="currentColor" strokeWidth="0.9" strokeLinejoin="round" />
                      <path d="M4 12 L20 17 L36 12 M20 17 L20 30" fill="none" stroke="currentColor" strokeWidth="0.9" />
                      <path d="M12 9 L28 14.6" fill="none" stroke="currentColor" strokeWidth="0.9" strokeDasharray="1.6 1.6" />
                    </svg>
                    <p>
                      Every order arrives in a rigid box with a printed how-to-wear card — one piece, worn three ways.
                      {hasMtm && ' Made-to-measure pieces begin with a WhatsApp Concierge message to book your measuring.'}
                    </p>
                  </div>

                  {/* aria-disabled, not disabled: disabling the focused button would drop focus to
                      <body>; checkout() already ignores clicks while processing */}
                  <Button
                    variant="gold"
                    type="button"
                    className={`bag__checkout ${stage === 'processing' ? 'is-busy' : ''}`}
                    onClick={checkout}
                    aria-disabled={stage === 'processing'}
                    aria-busy={stage === 'processing'}
                    arrow={stage !== 'processing'}
                    cursor="Checkout"
                  >
                    {stage === 'processing' ? 'Placing your demo order…' : 'Checkout'}
                  </Button>
                  <p className="bag__fine">Prices in PKR, per piece · Demo storefront — no payment is taken</p>
                </motion.footer>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ==========================================================================
   One line in the bag
   ========================================================================== */

interface RowProps {
  item: CartItem
  index: number
  reduced: boolean
  onQty: (qty: number) => void
  onRemove: () => void
}

const MAX_QTY = 9

/** The capsule's pieces, fanned out like a set on a hanger. */
function CapsuleThumb({ capsule }: { capsule: Capsule }) {
  const fan = capsule.pieces
    .map((pc) => {
      const p = productById(pc.id)
      return p ? { p, hex: (p.colours[pc.colour] ?? p.colours[0]).hex } : null
    })
    .filter((x): x is { p: Product; hex: string } => !!x)
    .slice(0, 3)
  return (
    <span className="bag-item__fan">
      {fan.map(({ p, hex }, i) => (
        <span key={p.id} className={`bag-item__fan-piece bag-item__fan-piece--${i}`}>
          <GarmentFlat kind={p.garment} colour={hex} mini />
        </span>
      ))}
    </span>
  )
}

function BagRow({ item, index, reduced, onQty, onRemove, ref }: RowProps & { ref?: Ref<HTMLLIElement> }) {
  const product = productById(item.productId)
  const capsule = product ? undefined : capsuleById(item.productId)
  const hex = product?.colours.find((c) => c.name === item.colour)?.hex ?? '#6e1423'
  const mtm = item.fit === 'made-to-measure'
  const incRef = useRef<HTMLButtonElement>(null)
  const decrease = () => {
    onQty(item.qty - 1)
    // the minus button is about to disable itself — keep focus on the quantity control
    if (item.qty - 1 <= 1) incRef.current?.focus()
  }
  const swatches = capsule
    ? capsule.pieces.map((pc) => {
        const p = productById(pc.id)
        return p ? (p.colours[pc.colour] ?? p.colours[0]).hex : '#6e1423'
      })
    : [hex]

  return (
    <motion.li
      ref={ref}
      layout={reduced ? false : 'position'}
      className="bag-item"
      initial={reduced ? { opacity: 0 } : { opacity: 0, x: 28 }}
      animate={{ opacity: 1, x: 0, transition: { duration: 0.75, ease: EASE, delay: 0.3 + index * 0.06 } }}
      exit={{ opacity: 0, x: 36, transition: { duration: 0.35, ease: [0.55, 0, 1, 0.45] } }}
    >
      <div className="bag-item__thumb" aria-hidden>
        {product ? (
          <span className="bag-item__flat">
            <GarmentFlat kind={product.garment} colour={hex} mini />
          </span>
        ) : capsule ? (
          <CapsuleThumb capsule={capsule} />
        ) : null}
      </div>

      <div className="bag-item__main">
        <div className="bag-item__top">
          <p className="bag-item__name">{item.name}</p>
          <p className="bag-item__price">{formatPKR(item.price * item.qty)}</p>
        </div>
        <p className="bag-item__meta">
          <span className="bag-item__swatches" aria-hidden>
            {swatches.map((s, i) => (
              <span key={i} className="bag-item__swatch" style={{ background: s }} />
            ))}
          </span>
          {item.colour}
          <span className="bag-item__sep" aria-hidden>
            ·
          </span>
          {mtm ? 'Made-to-Measure' : `Size ${item.size}`}
        </p>
        {mtm && <p className="bag-item__note">Cut to your measurements · kept on file for every order after</p>}
        {capsule && (
          <p className="bag-item__note">
            A set of {capsule.pieces.length} Core pieces · {capsule.looks.length} outfits on the how-to-wear card
          </p>
        )}
        {item.qty > 1 && <p className="bag-item__each">{formatPKR(item.price)} each</p>}

        <div className="bag-item__actions">
          <div className="bag-qty" role="group" aria-label={`Quantity of ${item.name}`}>
            <button
              type="button"
              className="bag-qty__btn"
              onClick={decrease}
              disabled={item.qty <= 1}
              aria-label={`Decrease quantity of ${item.name}`}
            >
              <svg viewBox="0 0 12 12" aria-hidden>
                <path d="M2 6h8" stroke="currentColor" strokeWidth="1" />
              </svg>
            </button>
            <output className="bag-qty__v numeral" aria-live="polite" aria-label={`Quantity ${item.qty}`}>
              {item.qty}
            </output>
            <button
              ref={incRef}
              type="button"
              className="bag-qty__btn"
              onClick={() => onQty(item.qty + 1)}
              disabled={item.qty >= MAX_QTY}
              aria-label={`Increase quantity of ${item.name}`}
            >
              <svg viewBox="0 0 12 12" aria-hidden>
                <path d="M2 6h8M6 2v8" stroke="currentColor" strokeWidth="1" />
              </svg>
            </button>
          </div>
          <button type="button" className="bag-item__remove label-sm" onClick={onRemove} aria-label={`Remove ${item.name} from your bag`}>
            Remove
          </button>
        </div>
      </div>
    </motion.li>
  )
}
