import { useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { gsap, useGSAP, prefersReducedMotion } from '../../lib/motion'
import { Eyebrow, Reveal, SplitReveal } from '../../components/Reveal'
import Button from '../../components/Button'
import { ADAPTIVE, MEASURES, ROMAN, SIZE_LIMITS, SIZES, type AdaptiveId, type MeasureId } from './data'
import './FitProfile.css'

type Unit = 'cm' | 'in'
const CM_PER_IN = 2.54
const EASE = [0.22, 1, 0.36, 1] as const

const EXAMPLES: Record<MeasureId, number> = { shoulder: 38, bust: 88, waist: 72, hip: 98, sleeve: 58, back: 40, inseam: 76 }
const EMPTY: Record<MeasureId, string> = { shoulder: '', bust: '', waist: '', hip: '', sleeve: '', back: '', inseam: '' }

/* Silhouette: left half drawn once, mirrored for the right. viewBox -20 0 340 660, centre line x = 150. */
const HALF =
  'M140,86 C140,96 139,104 136,110 C126,116 108,118 96,124 C88,128 84,140 84,156 C83,190 80,220 78,250 C76,285 74,315 74,340 ' +
  'C73,352 70,366 74,374 C78,380 86,378 88,368 C90,356 90,346 90,338 C92,310 96,280 98,252 C100,220 104,190 110,168 ' +
  'C110,190 107,205 111,222 C115,240 120,250 120,262 C120,280 110,300 106,320 C103,340 103,356 106,368 C108,420 112,460 116,490 ' +
  'C114,505 110,540 116,570 C118,580 121,588 122,594 C124,604 120,612 116,620 C114,626 122,630 134,629 C140,628 142,622 141,612 ' +
  'C140,590 141,560 140,540 C139,515 141,500 142,488 C144,450 147,420 148,400 C149,385 150,372 150,364'

type Parsed = { state: 'empty' } | { state: 'nan' } | { state: 'range'; cm: number } | { state: 'ok'; cm: number }

const toUnit = (cm: number, u: Unit) => (u === 'cm' ? cm : cm / CM_PER_IN)
const fmtNum = (n: number, u: Unit) => {
  const r = u === 'cm' ? Math.round(n * 2) / 2 : Math.round(n * 4) / 4
  return String(Number(r.toFixed(2)))
}
/** A recorded measurement as shown on the figure, the card and the booking note — "86,50 " becomes "86.5". */
const tidy = (cm: number, u: Unit) => String(Number(toUnit(cm, u).toFixed(u === 'cm' ? 1 : 2)))

function parse(raw: string, u: Unit, m: (typeof MEASURES)[number]): Parsed {
  const t = raw.trim().replace(',', '.')
  if (!t) return { state: 'empty' }
  const n = Number(t)
  if (!Number.isFinite(n) || n <= 0) return { state: 'nan' }
  const cm = u === 'in' ? n * CM_PER_IN : n
  if (cm < m.min || cm > m.max) return { state: 'range', cm }
  return { state: 'ok', cm }
}

function sizeIndex(id: MeasureId, cm: number) {
  const lim = SIZE_LIMITS[id]
  if (!lim) return null
  const i = lim.findIndex((l) => cm <= l)
  return i === -1 ? SIZES.length - 1 : i
}

export default function FitProfile({ onUse }: { onUse: (note: string) => void }) {
  const root = useRef<HTMLElement>(null)
  const [unit, setUnit] = useState<Unit>('cm')
  const [values, setValues] = useState<Record<MeasureId, string>>(EMPTY)
  const [touched, setTouched] = useState<Partial<Record<MeasureId, boolean>>>({})
  const [active, setActive] = useState<MeasureId>('bust')
  const [adaptive, setAdaptive] = useState<AdaptiveId[]>([])
  const inputs = useRef<Partial<Record<MeasureId, HTMLInputElement | null>>>({})

  const parsed = useMemo(() => {
    const out = {} as Record<MeasureId, Parsed>
    MEASURES.forEach((m) => (out[m.id] = parse(values[m.id], unit, m)))
    return out
  }, [values, unit])

  const done = MEASURES.filter((m) => parsed[m.id].state === 'ok')
  const activeMeasure = MEASURES.find((m) => m.id === active) ?? MEASURES[0]
  const recorded = (id: MeasureId) => {
    const p = parsed[id]
    return p.state === 'ok' ? tidy(p.cm, unit) : ''
  }

  const size = useMemo(() => {
    const idx: number[] = []
    ;(['bust', 'waist', 'hip'] as MeasureId[]).forEach((id) => {
      const p = parsed[id]
      if (p.state === 'ok') {
        const i = sizeIndex(id, p.cm)
        if (i !== null) idx.push(i)
      }
    })
    if (!idx.length) return null
    const lo = Math.min(...idx)
    const hi = Math.max(...idx)
    return { label: lo === hi ? SIZES[lo] : `${SIZES[lo]}–${SIZES[hi]}`, split: lo !== hi, lo: SIZES[lo], hi: SIZES[hi] }
  }, [parsed])

  const errorFor = (m: (typeof MEASURES)[number]) => {
    const p = parsed[m.id]
    if (!touched[m.id]) return null
    if (p.state === 'nan') return 'Use numbers only — for example 86 or 86.5.'
    if (p.state === 'range')
      return `${m.label} usually measures between ${fmtNum(toUnit(m.min, unit), unit)} and ${fmtNum(toUnit(m.max, unit), unit)} ${unit}. Worth measuring once more.`
    return null
  }

  const switchUnit = (next: Unit) => {
    if (next === unit) return
    setValues((prev) => {
      const out = { ...prev }
      MEASURES.forEach((m) => {
        const p = parse(prev[m.id], unit, m)
        if (p.state === 'ok' || p.state === 'range') out[m.id] = fmtNum(toUnit(p.cm, next), next)
      })
      return out
    })
    setUnit(next)
  }
  const onUnitKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
      e.preventDefault()
      const next: Unit = unit === 'cm' ? 'in' : 'cm'
      switchUnit(next)
      requestAnimationFrame(() => root.current?.querySelector<HTMLButtonElement>(`[data-unit="${next}"]`)?.focus())
    }
  }

  const toggleAdaptive = (id: AdaptiveId) => setAdaptive((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]))

  const buildNote = () => {
    const parts = done.map((m) => `${m.label} ${recorded(m.id)} ${unit}`)
    const adapt = ADAPTIVE.filter((a) => adaptive.includes(a.id)).map((a) => a.label)
    let note = parts.length ? `Fit profile — ${parts.join(' · ')}.` : 'Fit profile — measurements to be taken at the fitting.'
    if (size) note += ` Closest ready-to-wear size: ${size.label}.`
    if (adapt.length) note += ` Adaptive options: ${adapt.join(', ')}.`
    return note
  }

  /* scroll choreography: the figure draws itself in, the grid lines settle */
  useGSAP(
    () => {
      const el = root.current
      if (!el || prefersReducedMotion()) return
      const lines = gsap.utils.toArray<SVGPathElement | SVGEllipseElement>('.cus-fit__body > *', el)
      lines.forEach((ln) => {
        const len = (ln as SVGGeometryElement).getTotalLength?.() ?? 0
        if (len) gsap.set(ln, { strokeDasharray: len, strokeDashoffset: len })
      })
      const tl = gsap.timeline({ scrollTrigger: { trigger: el.querySelector('.cus-fit__figure'), start: 'top 78%', once: true } })
      tl.to(lines, { strokeDashoffset: 0, duration: 2.6, ease: 'silk', stagger: 0.08 })
        .fromTo(el.querySelectorAll('.cus-fit__dot-in'), { autoAlpha: 0, scale: 0.4, transformOrigin: '50% 50%' }, { autoAlpha: 1, scale: 1, duration: 0.7, ease: 'back.out(2)', stagger: 0.07 }, 1.2)
        .fromTo(el.querySelectorAll('.cus-fit__level'), { scaleX: 0, transformOrigin: '0% 50%' }, { scaleX: 1, duration: 1.4, ease: 'lux', stagger: 0.06 }, 0.4)
    },
    { scope: root },
  )

  const pct = done.length / MEASURES.length

  return (
    <section ref={root} className="section cus-fit" data-theme="ivory" aria-label="Your fit profile">
      <div className="container">
        <header className="cus-head">
          <div className="cus-head__l">
            <Eyebrow numeral="III">Your fit profile</Eyebrow>
            <SplitReveal as="h2" className="h2 cus-head__title">
              Twenty-two measurements begin with seven.
            </SplitReveal>
          </div>
          <Reveal className="cus-head__r" delay={0.15}>
            <p className="lead">
              A tape, a mirror and five quiet minutes. Hover or tap a point on the figure to see how we measure it — your profile builds as you
              go, travels with you to your first fitting, and is kept on file for every order after it. Adaptive options are built in, not
              added on.
            </p>
          </Reveal>
        </header>

        <div className="cus-fit__grid">
          {/* ── the figure ── */}
          <div className="cus-fit__figure">
            <svg className="cus-fit__svg" viewBox="-20 0 340 660" role="img" aria-labelledby="cus-fit-svg-title" focusable="false">
              <title id="cus-fit-svg-title">Body silhouette with seven measurement points</title>
              <g className="cus-fit__levels" aria-hidden>
                {[117, 198, 258, 344].map((y) => (
                  <line key={y} className="cus-fit__level" x1="-12" x2="312" y1={y} y2={y} />
                ))}
                <line className="cus-fit__plumb" x1="150" x2="150" y1="10" y2="650" />
              </g>

              <g className="cus-fit__body" aria-hidden>
                <ellipse cx="150" cy="56" rx="24" ry="30" />
                <path d="M127,60 C123,36 137,22 152,23 C168,24 179,38 175,62" className="cus-fit__hair" />
                <path d={HALF} />
                <path d={HALF} transform="matrix(-1 0 0 1 300 0)" />
                <path d="M118,206 C126,216 140,216 147,208" className="cus-fit__detail" />
                <path d="M182,206 C174,216 160,216 153,208" className="cus-fit__detail" />
              </g>

              {MEASURES.map((m) => {
                const p = parsed[m.id]
                const isActive = active === m.id
                const ok = p.state === 'ok'
                return (
                  <g key={m.id} className={`cus-fit__m ${isActive ? 'is-active' : ''} ${ok ? 'is-done' : ''} ${m.around ? 'is-around' : ''}`}>
                    <path className="cus-fit__guide-base" d={m.guide} />
                    <path className="cus-fit__guide" d={m.guide} pathLength={1} />
                    <g
                      className="cus-fit__dot"
                      transform={`translate(${m.dot[0]} ${m.dot[1]})`}
                      onPointerEnter={() => setActive(m.id)}
                      onClick={() => inputs.current[m.id]?.focus()}
                      data-cursor="Measure"
                    >
                      <g className="cus-fit__dot-in">
                        <circle className="cus-fit__dot-hit" r="17" />
                        <circle className="cus-fit__dot-ring" r="9" />
                        <circle className="cus-fit__dot-core" r="4" />
                      </g>
                    </g>
                    {ok && (
                      <text className="cus-fit__tag" x={m.tag[0]} y={m.tag[1]} textAnchor={m.tag[2]}>
                        {recorded(m.id)} {unit}
                      </text>
                    )}
                  </g>
                )
              })}
            </svg>

            <div className="cus-fit__how">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={activeMeasure.id}
                  initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
                  transition={{ duration: 0.45, ease: EASE }}
                >
                  <p className="cus-fit__how-k label-sm">
                    <span className="numeral">{ROMAN[MEASURES.indexOf(activeMeasure)]}</span> How to measure · {activeMeasure.label}
                  </p>
                  <p className="cus-fit__how-t">{activeMeasure.how}</p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* ── the inputs ── */}
          <div className="cus-fit__form">
            <div className="cus-fit__bar">
              <p className="label-sm cus-fit__bar-k" id="cus-unit-label">
                Units
              </p>
              <div className="cus-unit" role="radiogroup" aria-labelledby="cus-unit-label">
                {(['cm', 'in'] as const).map((u) => (
                  <button
                    key={u}
                    type="button"
                    role="radio"
                    aria-checked={unit === u}
                    tabIndex={unit === u ? 0 : -1}
                    data-unit={u}
                    className={`cus-unit__opt ${unit === u ? 'is-on' : ''}`}
                    onClick={() => switchUnit(u)}
                    onKeyDown={onUnitKey}
                  >
                    {unit === u && <motion.span layoutId="cus-unit-thumb" className="cus-unit__thumb" transition={{ duration: 0.5, ease: EASE }} />}
                    <span className="cus-unit__txt">{u === 'cm' ? 'Centimetres' : 'Inches'}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="cus-fit__fields">
              {MEASURES.map((m, i) => {
                const err = errorFor(m)
                const ok = parsed[m.id].state === 'ok'
                const id = `cus-m-${m.id}`
                return (
                  <div
                    key={m.id}
                    className={`cus-fit__field ${active === m.id ? 'is-active' : ''} ${err ? 'is-error' : ''} ${ok ? 'is-ok' : ''}`}
                    onMouseEnter={() => setActive(m.id)}
                  >
                    <label htmlFor={id} className="cus-fit__label">
                      <span className="numeral">{ROMAN[i]}</span>
                      {m.label}
                    </label>
                    <div className="cus-fit__input">
                      <input
                        ref={(n) => {
                          inputs.current[m.id] = n
                        }}
                        id={id}
                        name={m.id}
                        type="text"
                        inputMode="decimal"
                        autoComplete="off"
                        spellCheck={false}
                        placeholder={fmtNum(toUnit(EXAMPLES[m.id], unit), unit)}
                        value={values[m.id]}
                        aria-invalid={err ? true : undefined}
                        aria-describedby={`${id}-help${err ? ` ${id}-err` : ''}`}
                        onFocus={() => setActive(m.id)}
                        onChange={(e) => setValues((v) => ({ ...v, [m.id]: e.target.value }))}
                        onBlur={() => setTouched((t) => ({ ...t, [m.id]: true }))}
                      />
                      <span className="cus-fit__unit" aria-hidden>
                        {unit}
                      </span>
                      <svg className="cus-fit__tick" viewBox="0 0 16 16" aria-hidden>
                        <path d="M3 8.5 L6.5 12 L13 4.5" />
                      </svg>
                    </div>
                    <p id={`${id}-help`} className="cus-fit__help">
                      {m.how}
                    </p>
                    <AnimatePresence initial={false}>
                      {err && (
                        <motion.p
                          key="err"
                          id={`${id}-err`}
                          className="cus-fit__err"
                          role="alert"
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.35, ease: EASE }}
                        >
                          {err}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>

            <fieldset className="cus-fit__adaptive">
              <legend className="cus-fit__adaptive-legend">
                <span className="label-sm gold">Built for every chapter</span>
                <span className="cus-fit__adaptive-copy">
                  Bodies change — across a pregnancy, a promotion, a year. Any made-to-measure piece can be built to move with you.
                </span>
              </legend>
              <div className="cus-adapt">
                {ADAPTIVE.map((a) => {
                  const on = adaptive.includes(a.id)
                  return (
                    <button
                      key={a.id}
                      type="button"
                      className={`cus-adapt__opt ${on ? 'is-on' : ''}`}
                      aria-pressed={on}
                      onClick={() => toggleAdaptive(a.id)}
                    >
                      <span className="cus-adapt__mark" aria-hidden>
                        <svg viewBox="0 0 16 16">
                          <path d="M3 8.5 L6.5 12 L13 4.5" />
                        </svg>
                      </span>
                      <span className="cus-adapt__label">{a.label}</span>
                      <span className="cus-adapt__note">{a.note}</span>
                    </button>
                  )
                })}
              </div>
            </fieldset>
          </div>

          {/* ── live summary ── */}
          <aside className="cus-fit__card" data-theme="wine" aria-label="Fit profile summary">
            <div className="cus-fit__card-top">
              <span className="label-sm">Fit profile</span>
              <span className="label-sm cus-fit__card-no">Atelier copy</span>
            </div>
            <p className="cus-fit__card-title">Your measurements</p>

            <div className="cus-fit__progress">
              <p className="cus-fit__count" aria-live="polite">
                <span className="numeral">{done.length}</span> of {MEASURES.length} recorded
              </p>
              <span className="cus-fit__meter" aria-hidden>
                <span style={{ transform: `scaleX(${pct})` }} />
              </span>
            </div>

            <dl className="cus-fit__list">
              {MEASURES.map((m) => {
                const p = parsed[m.id]
                return (
                  <div key={m.id} className={`${p.state === 'ok' ? 'is-ok' : ''} ${active === m.id ? 'is-active' : ''}`}>
                    <dt>{m.label}</dt>
                    <dd>
                      <AnimatePresence mode="popLayout" initial={false}>
                        <motion.span
                          key={p.state === 'ok' ? `${recorded(m.id)}${unit}` : p.state}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.35, ease: EASE }}
                        >
                          {p.state === 'ok' ? `${recorded(m.id)} ${unit}` : p.state === 'empty' ? '—' : 'Check'}
                        </motion.span>
                      </AnimatePresence>
                    </dd>
                  </div>
                )
              })}
            </dl>

            <div className="cus-fit__size">
              <p className="label-sm">Closest ready-to-wear size</p>
              <p className="cus-fit__size-v numeral">{size ? size.label : '—'}</p>
              <p className="cus-fit__size-note">
                {!size
                  ? 'Add bust, waist or hip to see where you sit on our size chart.'
                  : size.split
                    ? `Your measurements sit across ${size.lo} and ${size.hi} — exactly why made-to-measure exists.`
                    : 'A starting point for ready-to-wear. Made-to-measure takes it from here.'}
              </p>
            </div>

            <div className="cus-fit__built">
              <p className="label-sm">Built in</p>
              <p className="cus-fit__built-v">
                {adaptive.length ? ADAPTIVE.filter((a) => adaptive.includes(a.id)).map((a) => a.label).join(' · ') : 'Standard Femmora block'}
              </p>
            </div>

            <Button variant="gold" className="cus-fit__cta" onClick={() => onUse(buildNote())} cursor="Book">
              {done.length ? 'Book with this profile' : 'Book a measuring session'}
            </Button>
            <p className="cus-fit__fine">Nothing leaves this page — your profile is only shared when you book.</p>
          </aside>
        </div>
      </div>
    </section>
  )
}
