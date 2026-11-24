import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'motion/react'
import ProductCard, { type QuickTarget } from './ProductCard'
import { EASE, cap, pad, word } from './format'
import { Eyebrow, Reveal, SplitReveal } from '../../components/Reveal'
import { Flip, gsap, ScrollTrigger, prefersReducedMotion } from '../../lib/motion'
import {
  CATEGORIES,
  COLOUR_FAMILIES,
  FORMALITY,
  FORMALITY_LEVELS,
  PRODUCTS,
  isMtm,
  type Category,
  type ColourFamily,
  type FormalityLevel,
  type Product,
} from '../../data/products'
import './CollectionShop.css'

type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'formality'
type CatKey = 'All' | Category

const SORTS: { id: SortKey; label: string; long: string }[] = [
  { id: 'featured', label: 'Featured', long: 'Featured' },
  { id: 'price-asc', label: 'Price ↑', long: 'Price, low to high' },
  { id: 'price-desc', label: 'Price ↓', long: 'Price, high to low' },
  { id: 'formality', label: 'Formality', long: 'Formality, most formal first' },
]

const CAT_COUNT: Record<CatKey, number> = {
  All: PRODUCTS.length,
  ...(Object.fromEntries(CATEGORIES.map((c) => [c, PRODUCTS.filter((p) => p.category === c).length])) as Record<Category, number>),
}

type FlipState = ReturnType<typeof Flip.getState>

export default function CollectionShop({ onQuickView }: { onQuickView: (t: QuickTarget) => void }) {
  const [cat, setCat] = useState<CatKey>('All')
  const [fams, setFams] = useState<ColourFamily[]>([])
  const [level, setLevel] = useState<FormalityLevel | null>(null)
  const [mtm, setMtm] = useState(false)
  const [sort, setSort] = useState<SortKey>('featured')
  const [refine, setRefine] = useState(false)
  const [stuck, setStuck] = useState(false)
  const reduced = useReducedMotion()

  const gridRef = useRef<HTMLDivElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const flipState = useRef<FlipState | null>(null)
  const flipTl = useRef<gsap.core.Timeline | null>(null)

  /* ---------- derived ---------- */
  const ordered = useMemo(() => {
    const list = [...PRODUCTS]
    if (sort === 'price-asc') list.sort((a, b) => a.price - b.price || a.featured - b.featured)
    else if (sort === 'price-desc') list.sort((a, b) => b.price - a.price || a.featured - b.featured)
    else if (sort === 'formality') list.sort((a, b) => b.formality - a.formality || a.featured - b.featured)
    else list.sort((a, b) => a.featured - b.featured)
    return list
  }, [sort])

  const matches = useCallback(
    (p: Product) =>
      (cat === 'All' || p.category === cat) &&
      (fams.length === 0 || p.colours.some((c) => fams.includes(c.family))) &&
      (level === null || p.formality === level) &&
      (!mtm || isMtm(p)),
    [cat, fams, level, mtm],
  )

  const visible = ordered.filter(matches)
  const slotOf = new Map(visible.map((p, i) => [p.id, i]))
  const layoutKey = visible.map((p) => p.id).join('|')
  const activeCount =
    (cat !== 'All' ? 1 : 0) + fams.length + (level !== null ? 1 : 0) + (mtm ? 1 : 0) + (sort !== 'featured' ? 1 : 0)

  /* ---------- Flip: capture before the state changes, animate after layout ---------- */
  const change = useCallback((fn: () => void) => {
    const grid = gridRef.current
    if (grid && !prefersReducedMotion()) {
      flipTl.current?.progress(1).kill()
      flipTl.current = null
      flipState.current = Flip.getState(grid.querySelectorAll('.col-card'))
    }
    fn()
  }, [])

  useLayoutEffect(() => {
    const state = flipState.current
    const grid = gridRef.current
    flipState.current = null
    if (!state || !grid) return
    flipTl.current = Flip.from(state, {
      duration: 0.95,
      ease: 'lux',
      scale: true,
      absoluteOnLeave: true,
      stagger: 0.02,
      onEnter: (els) =>
        gsap.fromTo(
          els,
          { opacity: 0, scale: 0.94, y: 48 },
          { opacity: 1, scale: 1, y: 0, duration: 0.9, ease: 'lux', delay: 0.18, stagger: 0.06 },
        ),
      onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.94, duration: 0.4, ease: 'power2.in' }),
      onComplete: () => {
        gsap.set(grid.querySelectorAll('.col-card:not(.is-hidden)'), { opacity: 1 })
        ScrollTrigger.refresh()
      },
    })
  }, [layoutKey])

  // reduced motion: no Flip, but the sections below still moved
  useEffect(() => {
    if (prefersReducedMotion()) ScrollTrigger.refresh()
  }, [layoutKey])

  // never leave a half-run Flip behind on unmount. kill() only — completing it would fire
  // onComplete (gsap.set + ScrollTrigger.refresh) against a grid that has already left the DOM,
  // in the middle of the route transition.
  useEffect(
    () => () => {
      flipTl.current?.kill()
      flipTl.current = null
    },
    [],
  )

  /* ---------- sticky detection (rAF-throttled) ---------- */
  useEffect(() => {
    let raf = 0
    const check = () => {
      raf = 0
      const bar = barRef.current
      if (!bar) return
      const top = parseFloat(getComputedStyle(bar).top) || 0
      setStuck(bar.getBoundingClientRect().top <= top + 0.5)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check)
    }
    check()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  /* ---------- actions ---------- */
  const pickCat = (c: CatKey) => c !== cat && change(() => setCat(c))
  const toggleFam = (f: ColourFamily) =>
    change(() => setFams((cur) => (cur.includes(f) ? cur.filter((x) => x !== f) : [...cur, f])))
  const pickLevel = (l: FormalityLevel | null) => change(() => setLevel((cur) => (cur === l ? null : l)))
  const toggleMtm = () => change(() => setMtm((m) => !m))
  const pickSort = (s: SortKey) => s !== sort && change(() => setSort(s))
  const clearAll = () =>
    change(() => {
      setCat('All')
      setFams([])
      setLevel(null)
      setMtm(false)
      setSort('featured')
    })

  const preferredFor = (p: Product) => {
    if (!fams.length) return 0
    const i = p.colours.findIndex((c) => fams.includes(c.family))
    return i < 0 ? 0 : i
  }

  const summary =
    visible.length === PRODUCTS.length
      ? `All ${PRODUCTS.length} pieces`
      : `${visible.length} of ${PRODUCTS.length} ${PRODUCTS.length === 1 ? 'piece' : 'pieces'}`
  const lineTransition = reduced ? { duration: 0 } : { type: 'spring' as const, stiffness: 380, damping: 36 }

  return (
    <section className="col-shop" id="collection-grid" aria-label="The pieces" data-theme="wine">
      <div className="container col-shop__head">
        <div className="col-shop__head-l">
          <Eyebrow numeral="I">The pieces</Eyebrow>
          <SplitReveal as="h2" className="h1 col-shop__title">
            {cap(word(PRODUCTS.length))} pieces.
            <br />
            <em className="gold-text">One</em> wardrobe.
          </SplitReveal>
        </div>
        <Reveal className="col-shop__intro" delay={0.15}>
          <p className="body">
            Western, equestrian and old-money formal workwear — led by the trench coat — with structured kurtas and
            fusion alongside. Every piece interchanges with every other: the trench over a kurta, the long vest over
            wide trousers, the blazer over silk. Fewer decisions, more presence.
          </p>
          <p className="label-sm col-shop__hint">
            Filter by category, colour, formality level or made-to-measure — select any piece for a closer look.
          </p>
        </Reveal>
      </div>

      {/* ---------------- sticky filter bar ---------------- */}
      <div ref={barRef} className={`col-filter ${stuck ? 'is-stuck' : ''} ${refine ? 'is-refining' : ''}`}>
        <div className="container col-filter__inner" role="region" aria-label="Filter and sort the collection">
          <div className="col-filter__primary">
            <LayoutGroup id="col-cats">
              <motion.div className="col-filter__cats" role="group" aria-label="Category" layoutScroll>
                {(['All', ...CATEGORIES] as CatKey[]).map((c) => (
                  <button key={c} type="button" className="col-chip" aria-pressed={cat === c} onClick={() => pickCat(c)}>
                    <span className="col-chip__label">{c}</span>
                    <sup className="col-chip__count numeral">{CAT_COUNT[c]}</sup>
                    {cat === c && <motion.span layoutId="col-chip-line" className="col-chip__line" transition={lineTransition} />}
                  </button>
                ))}
              </motion.div>
            </LayoutGroup>
            <button
              type="button"
              className="col-filter__refine"
              aria-expanded={refine}
              aria-controls="col-filter-tools"
              onClick={() => setRefine((r) => !r)}
            >
              <span className="label-sm">Refine{activeCount > 0 ? ` (${activeCount})` : ''}</span>
              <svg viewBox="0 0 12 8" aria-hidden>
                <path d="M1 1.5 6 6.5 11 1.5" fill="none" stroke="currentColor" strokeWidth="1" />
              </svg>
            </button>
          </div>

          <div id="col-filter-tools" className="col-filter__tools">
            <div className="col-filter__group" role="group" aria-label="Colour">
              <span className="label-sm col-filter__legend" aria-hidden>
                Colour
              </span>
              <div className="col-swatches">
                {COLOUR_FAMILIES.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    className="col-swatch"
                    style={{ '--sw': f.hex } as CSSProperties}
                    aria-pressed={fams.includes(f.id)}
                    aria-label={f.name}
                    title={f.name}
                    onClick={() => toggleFam(f.id)}
                  />
                ))}
              </div>
            </div>

            <div className="col-filter__group" role="group" aria-label="Formality level">
              <span className="label-sm col-filter__legend" aria-hidden>
                Formality
              </span>
              <LayoutGroup id="col-levels">
                <div className="col-levels">
                  {FORMALITY_LEVELS.map((l) => (
                    <button
                      key={l}
                      type="button"
                      className="col-level"
                      aria-pressed={level === l}
                      aria-label={`Level ${FORMALITY[l].numeral} — ${FORMALITY[l].label}`}
                      title={`${FORMALITY[l].label} — ${FORMALITY[l].when}`}
                      onClick={() => pickLevel(l)}
                    >
                      <span className="numeral">{FORMALITY[l].numeral}</span>
                      {level === l && <motion.span layoutId="col-level-mark" className="col-level__mark" transition={lineTransition} />}
                    </button>
                  ))}
                </div>
              </LayoutGroup>
              <span className="col-filter__level-name" aria-hidden>
                {level === null ? 'Any level' : FORMALITY[level].label}
              </span>
            </div>

            <button type="button" role="switch" aria-checked={mtm} className="col-switch" onClick={toggleMtm}>
              <span className="col-switch__track" aria-hidden>
                <span className="col-switch__knob" />
              </span>
              <span className="label-sm">Made-to-measure eligible</span>
            </button>

            <div className="col-filter__group" role="group" aria-label="Sort by">
              <span className="label-sm col-filter__legend" aria-hidden>
                Sort
              </span>
              <div className="col-sort">
                {SORTS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className="col-sort__btn"
                    aria-pressed={sort === s.id}
                    aria-label={s.long}
                    onClick={() => pickSort(s.id)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <AnimatePresence initial={false}>
              {activeCount > 0 && (
                <motion.button
                  key="clear"
                  type="button"
                  className="col-filter__clear label-sm"
                  onClick={clearAll}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.35, ease: EASE }}
                >
                  Clear all
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          <p className="col-filter__count" aria-live="polite" aria-atomic="true">
            <span className="numeral">{pad(visible.length)}</span>
            <span className="label-sm"> / {summary}</span>
          </p>
        </div>
      </div>

      {/* ---------------- editorial grid ---------------- */}
      <div className="container">
        <div ref={gridRef} className="col-grid">
          {ordered.map((p) => {
            const i = slotOf.get(p.id)
            const hidden = i === undefined
            return (
              <ProductCard
                key={p.id}
                product={p}
                hidden={hidden}
                slot={hidden ? 0 : i % 5}
                alt={hidden ? 0 : i % 2}
                preferred={preferredFor(p)}
                onQuickView={onQuickView}
              />
            )
          })}
        </div>

        <AnimatePresence>
          {visible.length === 0 && (
            <motion.div
              key="empty"
              className="col-empty"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.35, duration: 0.9, ease: EASE } }}
              exit={{ opacity: 0, transition: { duration: 0.25 } }}
            >
              <p className="numeral col-empty__mark" aria-hidden>
                —
              </p>
              <p className="h3">Nothing in this chapter matches — yet.</p>
              <p className="body">
                Try another colour or formality level — or have the piece you have in mind made to measure, in exactly
                the shade you want.
              </p>
              <button type="button" className="col-empty__btn label" onClick={clearAll}>
                Clear all filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
