import {
  Fragment,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type PointerEvent,
} from 'react'
import { MotionConfig, motion, useInView, type Variants } from 'motion/react'
import { gsap, useGSAP, prefersReducedMotion } from '../../../lib/motion'
import { Eyebrow } from '../../../components/Reveal'
import { TESTIMONIALS } from '../../../data/site'
import { MQ, chapter } from './constants'
import './Voices.css'

const CH = chapter('hs-voices')
const COUNT = TESTIMONIALS.length
/** seconds each voice is held before the next one fades in */
const DWELL = 7.5
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI']
const LUX = [0.22, 1, 0.36, 1] as const
const SILK = [0.65, 0, 0.35, 1] as const

const slideVariants: Variants = {
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 1.1, ease: LUX, staggerChildren: 0.026, delayChildren: 0.18 },
  },
  hide: (dir: number) => ({
    opacity: 0,
    y: -16 * dir,
    filter: 'blur(6px)',
    transition: { duration: 0.55, ease: SILK },
  }),
}

const wordVariants: Variants = {
  show: { opacity: 1, y: '0em', transition: { duration: 0.9, ease: LUX } },
  hide: { opacity: 0, y: '0.38em', transition: { duration: 0.3, ease: SILK } },
}

const numeralVariants: Variants = {
  show: { opacity: 1, y: '0%', transition: { duration: 1.2, ease: LUX } },
  hide: (dir: number) => ({ opacity: 0, y: `${-24 * dir}%`, transition: { duration: 0.5, ease: SILK } }),
}

/** Split a quote into words (spaces are re-inserted between the inline-block word spans). */
const toWords = (s: string) => s.split(/\s+/).filter(Boolean)

function PauseIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden>
      <path d="M5.5 3v10M10.5 3v10" fill="none" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  )
}
function PlayIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden>
      <path d="M5 3.2v9.6L12.6 8Z" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
    </svg>
  )
}
function Arrow({ dir }: { dir: 'prev' | 'next' }) {
  return (
    <svg className={`hs-voices__arrow hs-voices__arrow--${dir}`} viewBox="0 0 28 10" width="28" height="10" aria-hidden>
      <path d="M0 5h26M22 1l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1" />
    </svg>
  )
}

/**
 * VII — My Femmora, My Story. A slow, crossfading carousel (WAI-ARIA APG pattern) of the
 * ILLUSTRATIVE stories written for the user-generated campaign — sample copy, never presented
 * as real reviews; the section says so in its eyebrow, its note and every caption.
 *
 *  - auto-advances every DWELL seconds; a gold progress line fills under the active voice
 *  - pauses on hover and while off-screen; stops for good when keyboard focus enters
 *    (resume with the play button); off by default with reduced motion
 *  - ← / → keys, prev/next buttons, a named picker, and touch swipe
 * Progress is JS-driven (rAF), so the global reduced-motion CSS can never fast-forward it.
 */
export default function Voices() {
  const root = useRef<HTMLElement>(null)
  const carousel = useRef<HTMLDivElement>(null)
  const fills = useRef<(HTMLSpanElement | null)[]>([])
  const elapsed = useRef(0)
  const swipe = useRef<{ x: number; y: number } | null>(null)
  const slidesId = useId()

  const [index, setIndex] = useState(0)
  const [dir, setDir] = useState<1 | -1>(1)
  const [cycle, setCycle] = useState(0)
  const [stopped, setStopped] = useState(() => prefersReducedMotion())
  const [hover, setHover] = useState(false)
  const [announce, setAnnounce] = useState('')

  const inView = useInView(carousel, { amount: 0.35 })
  const revealed = useInView(carousel, { amount: 0.4, once: true })
  const playing = !stopped && !hover && inView && revealed

  const go = useCallback((next: number, d: 1 | -1, byUser = false) => {
    const n = (next + COUNT) % COUNT
    setDir(d)
    setIndex(n)
    setCycle((c) => c + 1)
    if (byUser) {
      const t = TESTIMONIALS[n]
      setAnnounce(`Illustrative story ${n + 1} of ${COUNT}. ${t.quote} — ${t.name}, ${t.role}.`)
    }
  }, [])

  // Reset the progress lines whenever the voice changes: earlier voices full, later ones empty.
  useEffect(() => {
    elapsed.current = 0
    fills.current.forEach((f, i) => {
      if (f) f.style.transform = `scaleX(${i < index ? 1 : 0})`
    })
  }, [index, cycle])

  // Drive the active progress line; advance when it completes.
  useEffect(() => {
    if (!playing) return
    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      elapsed.current += Math.min(0.1, (now - last) / 1000)
      last = now
      const p = Math.min(1, elapsed.current / DWELL)
      const f = fills.current[index]
      if (f) f.style.transform = `scaleX(${p})`
      if (p >= 1) {
        go(index + 1, 1)
        return
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing, index, cycle, go])

  // Scroll choreography (GSAP): hairline draws, the great quote mark drifts.
  useGSAP(
    () => {
      const el = root.current
      if (!el) return
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        const q = gsap.utils.selector(el)
        gsap.from(q('.hs-voices__head > *'), {
          opacity: 0,
          y: 24,
          duration: 1.2,
          ease: 'lux',
          stagger: 0.1,
          scrollTrigger: { trigger: el, start: 'top 75%' },
        })
        gsap.fromTo(
          q('.hs-voices__rule'),
          { scaleX: 0 },
          { scaleX: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top 80%', end: 'top 30%', scrub: true } },
        )
        gsap.fromTo(
          q('.hs-voices__glyph'),
          { yPercent: -14, rotate: -5 },
          { yPercent: 14, rotate: 3, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } },
        )
        gsap.from(q('.hs-voices__corner'), {
          scale: 0,
          opacity: 0,
          duration: 1.2,
          ease: 'lux',
          stagger: 0.08,
          scrollTrigger: { trigger: q('.hs-voices__panel')[0], start: 'top 80%' },
        })
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  const onFocus = (e: FocusEvent<HTMLElement>) => {
    const t = e.target as HTMLElement
    if (t.closest('[data-rotation]')) return
    // APG: rotation stops when keyboard focus enters — mouse clicks keep their own logic.
    let keyboard = true
    try {
      keyboard = t.matches(':focus-visible')
    } catch {
      /* very old engines: treat any focus as keyboard focus */
    }
    if (keyboard) setStopped(true)
  }
  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      go(index + 1, 1, true)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      go(index - 1, -1, true)
    }
  }
  const onPointerDown = (e: PointerEvent<HTMLElement>) => {
    if (e.pointerType === 'mouse') return
    swipe.current = { x: e.clientX, y: e.clientY }
  }
  const onPointerUp = (e: PointerEvent<HTMLElement>) => {
    const s = swipe.current
    swipe.current = null
    if (!s) return
    const dx = e.clientX - s.x
    const dy = e.clientY - s.y
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.4) go(index + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1, true)
  }

  return (
    <MotionConfig reducedMotion="user">
      <section ref={root} id={CH.id} className="hs-voices" data-theme={CH.theme} aria-labelledby="hs-voices-title">
        <div className="container">
          <header className="hs-voices__head">
            <Eyebrow numeral={CH.numeral}>My Femmora, My Story</Eyebrow>
            <h2 id="hs-voices-title" className="hs-voices__title">
              Said in the room <em>that matters.</em>
            </h2>
            <p className="label-sm hs-voices__where">
              Illustrative <span aria-hidden>—</span> My Femmora, My Story
            </p>
          </header>
          <span className="hs-voices__rule" aria-hidden />

          <div
            ref={carousel}
            className={`hs-voices__stage ${playing ? 'is-playing' : ''}`}
            role="region"
            aria-roledescription="carousel"
            aria-label="Illustrative stories — My Femmora, My Story"
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            onFocus={onFocus}
            onKeyDown={onKeyDown}
          >
            <div className="hs-voices__aside">
              <span className="hs-voices__glyph gold-text" aria-hidden>
                “
              </span>
              <div className="hs-voices__numerals" aria-hidden>
                {TESTIMONIALS.map((t, i) => (
                  <motion.span
                    key={t.name}
                    className="hs-voices__numeral gold-text"
                    initial="hide"
                    animate={i === index && revealed ? 'show' : 'hide'}
                    custom={dir}
                    variants={numeralVariants}
                  >
                    {ROMAN[i]}
                  </motion.span>
                ))}
              </div>

              <div className="hs-voices__controls">
                <button
                  type="button"
                  className="hs-voices__btn hs-voices__btn--rotation"
                  data-rotation
                  aria-label={stopped ? 'Start rotating the stories' : 'Stop rotating the stories'}
                  data-cursor={stopped ? 'Play' : 'Pause'}
                  onClick={() => setStopped((s) => !s)}
                >
                  {stopped ? <PlayIcon /> : <PauseIcon />}
                </button>
                <span className="hs-voices__divider" aria-hidden />
                <button
                  type="button"
                  className="hs-voices__btn"
                  aria-label="Previous story"
                  aria-controls={slidesId}
                  data-cursor="Previous"
                  onClick={() => go(index - 1, -1, true)}
                >
                  <Arrow dir="prev" />
                </button>
                <p className="hs-voices__count" aria-hidden>
                  <span className="numeral">{String(index + 1).padStart(2, '0')}</span>
                  <span className="hs-voices__count-of">/ {String(COUNT).padStart(2, '0')}</span>
                </p>
                <button
                  type="button"
                  className="hs-voices__btn"
                  aria-label="Next story"
                  aria-controls={slidesId}
                  data-cursor="Next"
                  onClick={() => go(index + 1, 1, true)}
                >
                  <Arrow dir="next" />
                </button>
              </div>
              <p className="label-sm hs-voices__hint" aria-hidden>
                {stopped ? 'Paused' : hover ? 'Held while you read' : 'Advancing slowly'}
              </p>
            </div>

            <div className="hs-voices__panel" onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerCancel={() => (swipe.current = null)}>
              <span className="hs-voices__corner hs-voices__corner--tl" aria-hidden />
              <span className="hs-voices__corner hs-voices__corner--tr" aria-hidden />
              <span className="hs-voices__corner hs-voices__corner--bl" aria-hidden />
              <span className="hs-voices__corner hs-voices__corner--br" aria-hidden />

              <div id={slidesId} className="hs-voices__slides">
                {TESTIMONIALS.map((t, i) => {
                  const active = i === index
                  return (
                    <motion.figure
                      key={t.name}
                      className={`hs-voice ${active ? 'is-active' : ''}`}
                      role="group"
                      aria-roledescription="slide"
                      aria-label={`${i + 1} of ${COUNT}`}
                      aria-hidden={!active}
                      inert={!active}
                      initial="hide"
                      animate={active && revealed ? 'show' : 'hide'}
                      custom={dir}
                      variants={slideVariants}
                    >
                      <blockquote className="hs-voice__quote">
                        <p>
                          {toWords(t.quote).map((w, k) => (
                            <Fragment key={k}>
                              {k > 0 && ' '}
                              <motion.span className="hs-voice__word" variants={wordVariants}>
                                {w}
                              </motion.span>
                            </Fragment>
                          ))}
                        </p>
                      </blockquote>
                      <figcaption className="hs-voice__by">
                        <span className="hs-voice__rule" aria-hidden />
                        <span className="hs-voice__name">{t.name}</span>
                        <span className="label-sm hs-voice__role">{t.role}</span>
                      </figcaption>
                    </motion.figure>
                  )
                })}
              </div>

              <ol className="hs-voices__picker">
                {TESTIMONIALS.map((t, i) => (
                  <li key={t.name}>
                    <button
                      type="button"
                      className={`hs-voices__pick ${i === index ? 'is-active' : ''}`}
                      aria-label={`Show story ${i + 1} of ${COUNT}: ${t.name}`}
                      aria-current={i === index ? 'true' : undefined}
                      aria-controls={slidesId}
                      data-cursor=""
                      onClick={() => i !== index && go(i, i > index ? 1 : -1, true)}
                    >
                      <span className="label-sm hs-voices__pick-name">{t.name}</span>
                      <span className="hs-voices__seg" aria-hidden>
                        <span
                          className="hs-voices__fill"
                          ref={(n) => {
                            fills.current[i] = n
                          }}
                        />
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <p className="hs-voices__disclaimer">
            <span className="hs-dia" aria-hidden />
            <span>
              <span className="label-sm">Illustrative</span> These stories are sample copy written for the{' '}
              <em>My Femmora, My Story</em> campaign — not customer reviews. When the house opens, the stories here will
              be our clients’ own.
            </span>
          </p>

          <p className="sr-only" aria-live="polite" aria-atomic="true">
            {announce}
          </p>
        </div>
      </section>
    </MotionConfig>
  )
}
