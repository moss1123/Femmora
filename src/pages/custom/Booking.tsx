import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { gsap, useGSAP, prefersReducedMotion, scrollToTarget } from '../../lib/motion'
import { Eyebrow, Reveal, SplitReveal } from '../../components/Reveal'
import Button from '../../components/Button'
import { BRAND } from '../../data/site'
import { COMING_SOON, LOCATIONS, ROMAN, SERVICES, type BookingPreset, type LocationId, type ServiceId } from './data'
import {
  DURATION_MIN,
  bookingRef,
  daysFor,
  endTime,
  flagshipPreOpening,
  isEmail,
  monthSpan,
  normalisePhone,
  partOfDay,
  slotsFor,
  type Day,
} from './schedule'
import ErrorText from './ErrorText'
import JoinList from './JoinList'
import './Booking.css'

const EASE = [0.22, 1, 0.36, 1] as const
const STEPS = ['Service', 'Place & time', 'Your details'] as const
const NOTES_MAX = 600
const LOCATION_IDS: LocationId[] = ['flagship', 'private']

type StepIndex = 0 | 1 | 2
type Status = 'form' | 'sending' | 'done'

interface FormState {
  service: ServiceId | null
  location: LocationId | null
  date: string | null
  time: string | null
  name: string
  phone: string
  email: string
  org: string
  notes: string
}
type TextKey = 'name' | 'phone' | 'email' | 'org' | 'notes'
type Errors = Partial<Record<keyof FormState, string>>

interface Confirmation {
  ref: string
  first: string
  service: string
  place: string
  date: string
  time: string
  phone: string
  email: string
  /** flagship dates before opening are preferences — the Concierge confirms the exact hour */
  preferred: boolean
}

const EMPTY: FormState = { service: null, location: null, date: null, time: null, name: '', phone: '', email: '', org: '', notes: '' }
const TEXT_KEYS: TextKey[] = ['name', 'phone', 'email', 'org', 'notes']

/* ── helpers ──────────────────────────────────────────────────────────── */

/** A date or hour that no longer exists for the chosen place is released (each place keeps its own calendar). */
function reconcile(f: FormState): FormState {
  const day = f.location ? daysFor(f.location).find((d) => d.iso === f.date && !d.closed) : undefined
  const date = day ? f.date : null
  const time = day && f.time && slotsFor(day, f.location).some((s) => s.time === f.time && !s.taken) ? f.time : null
  return date === f.date && time === f.time ? f : { ...f, date, time }
}

function placeShort(location: LocationId | null, service: ServiceId | null) {
  if (!location) return null
  if (location === 'flagship') return `${BRAND.stores[0].place}, ${BRAND.stores[0].city}`
  return service === 'corporate' ? 'Your offices' : 'Home or office'
}

function mergeNote(current: string, incoming: string) {
  const tag = incoming.split('—')[0]
  const kept = current
    .split('\n')
    .filter((l) => l.trim() && !(tag.trim() && l.startsWith(tag)))
    .join('\n')
  return kept ? `${kept}\n${incoming}` : incoming
}

function validate(step: StepIndex, f: FormState): Errors {
  const e: Errors = {}
  if (step === 0 && !f.service) e.service = 'Choose a service to continue.'
  if (step === 1) {
    // one question at a time: place, then date, then hour
    if (!f.location) e.location = 'Choose where we should meet.'
    else if (!f.date) e.date = 'Choose a date — any day except Sunday.'
    else if (!f.time) e.time = 'Choose one of the open hours.'
  }
  if (step === 2) {
    if (f.name.trim().replace(/[^\p{L}]/gu, '').length < 2) e.name = 'Tell us your name — the one you’d like us to use.'
    if (!f.phone.trim()) e.phone = 'Add a WhatsApp number — this is how we confirm.'
    else if (!normalisePhone(f.phone)) e.phone = 'That number doesn’t look complete. Try 0300 1234567 or +92 300 1234567.'
    if (!f.email.trim()) e.email = 'Add an email address for your appointment card.'
    else if (!isEmail(f.email)) e.email = 'Check the email address — for example name@company.com.'
    if (f.service === 'corporate' && f.org.trim().length < 2) e.org = 'Add your organisation so we can prepare the right programme outline.'
    if (f.notes.length > NOTES_MAX) e.notes = `Keep notes under ${NOTES_MAX} characters — we’ll talk through the rest.`
  }
  return e
}

/* ── small pieces ─────────────────────────────────────────────────────── */

function LocationIcon({ id, corporate }: { id: LocationId; corporate: boolean }) {
  if (id === 'flagship')
    return (
      <svg viewBox="0 0 40 40" aria-hidden>
        <path d="M9 36V17a11 11 0 0 1 22 0v19" />
        <path d="M14 36V18.5a6 6 0 0 1 12 0V36" />
        <path d="M5 36h30M20 3.5v2.5" />
      </svg>
    )
  if (corporate)
    return (
      <svg viewBox="0 0 40 40" aria-hidden>
        <path d="M11 36V6h18v30" />
        <path d="M5 36h30M16 12h2M22 12h2M16 18h2M22 18h2M16 24h2M22 24h2M18 36v-6h4v6" />
      </svg>
    )
  return (
    <svg viewBox="0 0 40 40" aria-hidden>
      <path d="M7 19 20 8l13 11" />
      <path d="M10 17v19h20V17" />
      <path d="M5 36h30M17 36v-9h6v9" />
    </svg>
  )
}

/** The live appointment card beside the form (desktop). */
function Ticket({ form, day, status, refCode }: { form: FormState; day: Day | undefined; status: Status; refCode?: string }) {
  const svc = SERVICES.find((s) => s.id === form.service)
  const preferred = form.location === 'flagship' && flagshipPreOpening()
  const rows: [string, string | null][] = [
    ['Service', svc ? svc.short : null],
    ['Place', placeShort(form.location, form.service)],
    [preferred ? 'Preferred date' : 'Date', day ? day.long : null],
    ['Time', form.time && form.service ? `${form.time} – ${endTime(form.time, DURATION_MIN[form.service])}` : form.time],
  ]
  const filled = rows.filter(([, v]) => v).length
  const state = status === 'done' ? 'Requested' : filled === rows.length ? 'Ready' : 'Draft'
  return (
    <aside className={`cus-ticket ${status === 'done' ? 'is-held' : ''}`} data-theme="wine" aria-label="Your appointment so far">
      <div className="cus-ticket__top">
        <span className="label-sm">Appointment card</span>
        <span className="label-sm cus-ticket__state">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={state}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              {state}
            </motion.span>
          </AnimatePresence>
        </span>
      </div>
      <p className="cus-ticket__brand">Femmora</p>
      <p className="cus-ticket__sub serif-italic">Fittings &amp; consultations · by appointment</p>

      <dl className="cus-ticket__rows">
        {rows.map(([k, v], i) => (
          <div key={i} className={v ? 'is-set' : ''}>
            <dt>{k}</dt>
            <dd>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={v ?? 'empty'}
                  initial={{ opacity: 0, y: 10, filter: 'blur(3px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -10, filter: 'blur(3px)' }}
                  transition={{ duration: 0.45, ease: EASE }}
                >
                  {v ?? '—'}
                </motion.span>
              </AnimatePresence>
            </dd>
          </div>
        ))}
      </dl>

      <div className="cus-ticket__foot">
        <span className="cus-ticket__meter" aria-hidden>
          <span style={{ transform: `scaleX(${status === 'done' ? 1 : filled / rows.length})` }} />
        </span>
        <span className="label-sm cus-ticket__ref">{refCode ?? 'FM — pending'}</span>
      </div>
    </aside>
  )
}

/** Gold seal for the confirmation. */
function Seal({ reduce }: { reduce: boolean }) {
  return (
    <svg className="cus-seal" viewBox="0 0 120 120" aria-hidden>
      <defs>
        <path id="cus-seal-ring" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" />
      </defs>
      <motion.circle
        cx="60"
        cy="60"
        r="56"
        className="cus-seal__outer"
        initial={{ pathLength: reduce ? 1 : 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.6, ease: EASE, delay: 0.2 }}
      />
      <motion.circle
        cx="60"
        cy="60"
        r="33"
        className="cus-seal__inner"
        initial={{ pathLength: reduce ? 1 : 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.3, ease: EASE, delay: 0.5 }}
      />
      <g className="cus-seal__spin">
        <text className="cus-seal__text">
          <textPath href="#cus-seal-ring">Femmora · Made to measure · Lahore · MMXXVII ·</textPath>
        </text>
      </g>
      <motion.text
        x="60"
        y="60"
        dy="0.36em"
        className="cus-seal__f"
        initial={{ opacity: reduce ? 1 : 0, scale: reduce ? 1 : 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.9 }}
        // motion defaults SVG transforms to transform-box: fill-box, which would read 60px 60px from the glyph's own corner;
        // view-box keeps the origin at the seal's centre
        style={{ transformBox: 'view-box', transformOrigin: '60px 60px' }}
      >
        F
      </motion.text>
    </svg>
  )
}

/* ── the section ──────────────────────────────────────────────────────── */

export default function Booking({ preset }: { preset: BookingPreset | null }) {
  const root = useRef<HTMLElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const joinFocus = useRef<HTMLButtonElement>(null)
  const focusNext = useRef(false)
  const timer = useRef<number | undefined>(undefined)
  const reduce = !!useReducedMotion()

  const [form, setForm] = useState<FormState>(EMPTY)
  const [step, setStep] = useState<StepIndex>(0)
  const [dir, setDir] = useState(1)
  const [status, setStatus] = useState<Status>('form')
  const [attempted, setAttempted] = useState<[boolean, boolean, boolean]>([false, false, false])
  const [touched, setTouched] = useState<Partial<Record<TextKey, boolean>>>({})
  const [picked, setPicked] = useState<ServiceId | null>(null)
  const [done, setDone] = useState<Confirmation | null>(null)

  const days = useMemo(() => (form.location ? daysFor(form.location) : []), [form.location])
  const day = days.find((d) => d.iso === form.date)
  const slots = useMemo(() => slotsFor(day, form.location), [day, form.location])
  const preferred = form.location === 'flagship' && flagshipPreOpening()
  const corporate = form.service === 'corporate'

  const allErrors = validate(step, form)
  const shown: Errors = {}
  ;(Object.keys(allErrors) as (keyof FormState)[]).forEach((k) => {
    const textKey = (TEXT_KEYS as string[]).includes(k)
    if (attempted[step] || (textKey && touched[k as TextKey])) shown[k] = allErrors[k]
  })

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => {
      const next = { ...f, [k]: v }
      return k === 'location' || k === 'date' ? reconcile(next) : next
    })

  /** A choice on steps I–II answers the error that was showing; the next missing piece is only raised on the next
   *  "Continue" — so picking a place never fires an instant "choose a date" alert at her. */
  const choose = <K extends 'service' | 'location' | 'date' | 'time'>(k: K, v: FormState[K]) => {
    set(k, v)
    setAttempted((a) => (a[0] || a[1] ? [false, false, a[2]] : a))
  }

  // A preset from elsewhere on the page (hero, tiers, fit profile, organisations, the Circle, FAQ): start again at the
  // service step — and move focus with the scroll, so keyboard and screen-reader users land on the form, not behind it.
  useEffect(() => {
    if (!preset) return
    // leaving another step (or the confirmation) re-mounts the stage, which focuses its heading as it arrives;
    // already on step I, the heading is right there to focus.
    const remounts = status !== 'form' || step !== 0
    window.clearTimeout(timer.current)
    setStatus('form')
    setDone(null)
    setDir(-1)
    setStep(0)
    setAttempted([false, false, false])
    setForm((f) => ({ ...f, service: preset.service, notes: preset.note ? mergeNote(f.notes, preset.note) : f.notes }))
    setPicked(preset.service)
    focusNext.current = remounts
    if (remounts) return
    const raf = requestAnimationFrame(() => heading.current?.focus({ preventScroll: true }))
    return () => cancelAnimationFrame(raf)
    // deliberately keyed on the preset alone (a fresh nonce per click); status and step are read as of that moment
  }, [preset])

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const ensurePanelVisible = () => {
    const el = panel.current
    if (!el) return
    const top = el.getBoundingClientRect().top
    if (top < 60 || top > window.innerHeight * 0.6) scrollToTarget(el, -110)
  }

  const go = (next: StepIndex) => {
    setDir(next > step ? 1 : -1)
    focusNext.current = true
    setStep(next)
    setPicked(null)
    ensurePanelVisible()
  }

  const toJoin = () => {
    scrollToTarget('#cus-join', -120)
    joinFocus.current?.focus({ preventScroll: true })
  }

  const focusFirstInvalid = () => {
    requestAnimationFrame(() => {
      const el = panel.current?.querySelector<HTMLElement>('[aria-invalid="true"], fieldset[data-invalid] input:not(:disabled)')
      el?.focus({ preventScroll: false })
    })
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (status !== 'form') return
    if (Object.keys(allErrors).length) {
      setAttempted((a) => {
        const n = [...a] as typeof a
        n[step] = true
        return n
      })
      focusFirstInvalid()
      return
    }
    if (step < 2) {
      go((step + 1) as StepIndex)
      return
    }
    const svc = SERVICES.find((s) => s.id === form.service)
    if (!svc || !form.location || !form.date || !form.time) return
    setStatus('sending')
    const loc = LOCATIONS[form.location]
    const confirmation: Confirmation = {
      ref: bookingRef(form.date),
      first: form.name.trim().split(/\s+/)[0],
      service: svc.name,
      place: corporate ? loc.corpPlace : loc.place,
      date: day?.long ?? '',
      time: `${form.time} – ${endTime(form.time, DURATION_MIN[svc.id])}`,
      phone: normalisePhone(form.phone) ?? form.phone,
      email: form.email.trim(),
      preferred,
    }
    timer.current = window.setTimeout(
      () => {
        setDone(confirmation)
        setStatus('done')
        focusNext.current = true
        ensurePanelVisible()
      },
      reduce ? 300 : 1500,
    )
  }

  const reset = () => {
    setForm((f) => ({ ...EMPTY, name: f.name, phone: f.phone, email: f.email }))
    setAttempted([false, false, false])
    setTouched({})
    setDone(null)
    setStatus('form')
    setDir(-1)
    focusNext.current = true
    setStep(0)
  }

  /** Steps crossfade (popLayout), so the outgoing heading unmounts after the new one mounts — never let it clear the ref. */
  const setHeading = (n: HTMLHeadingElement | null) => {
    if (n) heading.current = n
  }

  /** Fires for enter and exit alike — only the entering step ("center") takes focus. */
  const onStepShown = (definition: unknown) => {
    if (definition !== 'center' || !focusNext.current) return
    focusNext.current = false
    heading.current?.focus({ preventScroll: true })
  }

  /* scroll choreography */
  useGSAP(
    () => {
      const el = root.current
      if (!el || prefersReducedMotion()) return
      const q = gsap.utils.selector(el)
      const p = el.querySelector('.cus-book__panel')

      const tl = gsap.timeline({ scrollTrigger: { trigger: p, start: 'top 82%', once: true } })
      tl.fromTo(p, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'silk', clearProps: 'clipPath' })
        .fromTo(q('.cus-stitch--t'), { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: 'none' }, 0.75)
        .fromTo(q('.cus-stitch--r'), { scaleY: 0 }, { scaleY: 1, duration: 0.55, ease: 'none' }, '>')
        .fromTo(q('.cus-stitch--b'), { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: 'none' }, '>')
        .fromTo(q('.cus-stitch--l'), { scaleY: 0 }, { scaleY: 1, duration: 0.55, ease: 'power2.out' }, '>')
        // opacity, not autoAlpha: these hold the form's controls, which must stay focusable (a "Book" button elsewhere
        // moves focus here) and in the accessibility tree before the reveal has played
        .fromTo(q('.cus-steps__item'), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.9, ease: 'lux', stagger: 0.09 }, 0.55)
        .fromTo(q('.cus-book__stage'), { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1.1, ease: 'lux' }, 0.7)

      const ticket = el.querySelector('.cus-ticket')
      if (ticket) {
        gsap.fromTo(
          ticket,
          { autoAlpha: 0, y: 60, rotate: -2.5 },
          { autoAlpha: 1, y: 0, rotate: 0, duration: 1.5, ease: 'lux', scrollTrigger: { trigger: ticket, start: 'top 90%', once: true } },
        )
      }
      const join = el.querySelector('.cus-join')
      if (join) {
        gsap.fromTo(
          join.querySelectorAll('.cus-join__intro > *, .cus-join__city'),
          { opacity: 0, y: 22 },
          { opacity: 1, y: 0, duration: 1, ease: 'lux', stagger: 0.08, scrollTrigger: { trigger: join, start: 'top 85%', once: true } },
        )
      }
      gsap.fromTo(
        q('.cus-book__ghost'),
        { yPercent: -12 },
        { yPercent: 16, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } },
      )
    },
    { scope: root },
  )

  const layoutT = { duration: reduce ? 0 : 0.6, ease: EASE }
  const stepVariants = {
    enter: (d: number) => ({ opacity: 0, x: reduce ? 0 : d * 56, filter: reduce ? 'blur(0px)' : 'blur(6px)' }),
    center: { opacity: 1, x: 0, filter: 'blur(0px)', transition: { duration: reduce ? 0.01 : 0.6, ease: EASE } },
    exit: (d: number) => ({ opacity: 0, x: reduce ? 0 : d * -36, filter: reduce ? 'blur(0px)' : 'blur(6px)', transition: { duration: reduce ? 0.01 : 0.28, ease: EASE } }),
  }
  const swap = {
    initial: { opacity: 0, y: reduce ? 0 : 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: reduce ? 0 : -6 },
    transition: { duration: reduce ? 0 : 0.4, ease: EASE },
  }

  const svcName = SERVICES.find((s) => s.id === picked)?.short

  let stage: ReactNode
  if (status === 'done' && done) {
    stage = (
      <motion.div key="done" className="cus-done" custom={1} variants={stepVariants} initial="enter" animate="center" exit="exit" onAnimationComplete={onStepShown}>
        <div className="cus-done__head">
          <Seal reduce={reduce} />
          <div>
            <p className="label-sm cus-done__k">
              Request received · <span className="cus-done__ref">{done.ref}</span>
            </p>
            <h3 ref={setHeading} tabIndex={-1} className="cus-done__title">
              Thank you, {done.first}. {done.preferred ? 'Your preferred hour is noted.' : 'Your hour is held.'}
            </h3>
          </div>
        </div>
        <p className="cus-done__lead" role="status">
          The {BRAND.whatsapp} will message you at <span className="cus-done__num">{done.phone}</span> within 24 hours to confirm
          {done.preferred ? ' the exact day and hour as the flagship’s opening calendar is set' : ''}. Your appointment card follows by email.
        </p>
        <dl className="cus-done__list">
          {(
            [
              ['Service', done.service],
              ['Where', done.place],
              [done.preferred ? 'Preferred date' : 'Date', done.date],
              ['Time', done.time],
              ['WhatsApp', done.phone],
              ['Email', done.email],
            ] as const
          ).map(([k, v], i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: reduce ? 0 : 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE, delay: reduce ? 0 : 0.45 + i * 0.06 }}
            >
              <dt className="label-sm">{k}</dt>
              <dd>{v}</dd>
            </motion.div>
          ))}
        </dl>
        <div className="cus-done__actions">
          <Button variant="outline" type="button" onClick={reset}>
            Make another booking
          </Button>
          <Button variant="ghost" to="/collection" cursor="Shop">
            Browse the collection
          </Button>
        </div>
        <p className="cus-fine">Demo storefront — no request has been sent, and no details have left this page.</p>
      </motion.div>
    )
  } else if (step === 0) {
    stage = (
      <motion.div key="s0" custom={dir} variants={stepVariants} initial="enter" animate="center" exit="exit" onAnimationComplete={onStepShown}>
        <h3 ref={setHeading} tabIndex={-1} className="cus-book__q">
          Which service would you like?
        </h3>
        <AnimatePresence initial={false}>
          {svcName && (
            <motion.p
              key="picked"
              className="cus-book__picked label-sm"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              <span className="gold">Selected for you</span> · {svcName} — continue when you’re ready
            </motion.p>
          )}
        </AnimatePresence>
        <fieldset className="cus-group" data-invalid={shown.service ? true : undefined} aria-describedby={shown.service ? 'cus-err-service' : undefined}>
          <legend className="sr-only">Service</legend>
          <div className="cus-svc">
            {SERVICES.map((s, i) => {
              const on = form.service === s.id
              return (
                <label key={s.id} className={`cus-svc__opt ${on ? 'is-on' : ''}`} data-cursor="">
                  <input
                    type="radio"
                    className="sr-only"
                    name="cus-service"
                    value={s.id}
                    checked={on}
                    aria-invalid={shown.service ? true : undefined}
                    onChange={() => {
                      choose('service', s.id)
                      setPicked(null)
                    }}
                  />
                  <span className="cus-svc__box">
                    {on && <motion.span layoutId="cus-svc-hl" className="cus-svc__hl" transition={{ duration: reduce ? 0 : 0.6, ease: EASE }} />}
                    <span className="cus-svc__n numeral" aria-hidden>
                      {ROMAN[i]}
                    </span>
                    <span className="cus-svc__main">
                      <span className="cus-svc__name">
                        {s.name}
                        {s.signature && <span className="cus-svc__sig label-sm">Signature</span>}
                      </span>
                      <span className="cus-svc__desc">{s.desc}</span>
                    </span>
                    <span className="cus-svc__meta">
                      <span className="label-sm">{s.duration}</span>
                      <span className="cus-svc__price">{s.price}</span>
                    </span>
                    <span className="cus-radio" aria-hidden />
                  </span>
                </label>
              )
            })}
          </div>
          <ErrorText id="cus-err-service">{shown.service}</ErrorText>
        </fieldset>
      </motion.div>
    )
  } else if (step === 1) {
    stage = (
      <motion.div key="s1" custom={dir} variants={stepVariants} initial="enter" animate="center" exit="exit" onAnimationComplete={onStepShown}>
        <h3 ref={setHeading} tabIndex={-1} className="cus-book__q">
          Where and when?
        </h3>

        <fieldset className="cus-group" data-invalid={shown.location ? true : undefined} aria-describedby={shown.location ? 'cus-err-location' : undefined}>
          <legend className="cus-group__legend label-sm">Where shall we meet?</legend>
          <div className="cus-loc">
            {LOCATION_IDS.map((id) => {
              const on = form.location === id
              const L = LOCATIONS[id]
              return (
                <label key={id} className={`cus-loc__opt ${on ? 'is-on' : ''}`} data-cursor="">
                  <input type="radio" className="sr-only" name="cus-location" value={id} checked={on} onChange={() => choose('location', id)} />
                  <span className="cus-loc__box">
                    <span className="cus-loc__icon">
                      <LocationIcon id={id} corporate={corporate} />
                    </span>
                    <span className="cus-loc__title">{corporate ? L.corpTitle : L.title}</span>
                    <span className="cus-loc__where label-sm">{L.where}</span>
                    <span className="cus-loc__note">{corporate ? L.corpNote : L.note}</span>
                    <span className="cus-radio" aria-hidden />
                  </span>
                </label>
              )
            })}
          </div>

          <div className="cus-soon">
            <span className="cus-soon__k label-sm">Coming soon</span>
            <p className="cus-soon__t">
              {COMING_SOON.map((s, i) => (
                <span key={s.city}>
                  {i > 0 && <span className="cus-soon__sep" aria-hidden> · </span>}
                  {s.place} <em>{s.city}</em>
                </span>
              ))}
            </p>
            <button type="button" className="cus-soon__btn label-sm" onClick={toJoin}>
              Join the list
            </button>
          </div>
          <ErrorText id="cus-err-location">{shown.location}</ErrorText>
        </fieldset>

        <fieldset className="cus-group" data-invalid={shown.date ? true : undefined} aria-describedby={shown.date ? 'cus-err-date' : undefined}>
          <legend className="cus-group__legend label-sm">
            {preferred ? 'Preferred date' : 'Date'}
            {form.location && (
              <span className="cus-group__aside">
                {monthSpan(days)} · {preferred ? 'the flagship’s opening fortnight' : 'the next two weeks'}
              </span>
            )}
          </legend>
          <AnimatePresence mode="wait" initial={false}>
            {form.location ? (
              <motion.div key={`days-${form.location}`} {...swap}>
                <div className="cus-days">
                  {days.map((d) => {
                    const on = form.date === d.iso
                    return (
                      <label key={d.iso} className={`cus-day ${on ? 'is-on' : ''} ${d.closed ? 'is-closed' : ''}`}>
                        <input
                          type="radio"
                          className="sr-only"
                          name="cus-date"
                          value={d.iso}
                          checked={on}
                          disabled={d.closed}
                          onChange={() => choose('date', d.iso)}
                          aria-label={`${d.long}${d.closed ? ', closed' : ''}`}
                        />
                        <span className="cus-day__box" aria-hidden>
                          {on && <motion.span layoutId="cus-day-hl" className="cus-day__hl" transition={{ duration: reduce ? 0 : 0.55, ease: EASE }} />}
                          <span className="cus-day__wk">{d.wk}</span>
                          <span className="cus-day__d numeral">{d.d}</span>
                          <span className="cus-day__mon">{d.closed ? 'Closed' : d.monthStart ? d.mon : ' '}</span>
                        </span>
                      </label>
                    )
                  })}
                </div>
                {preferred && (
                  <p className="cus-note">
                    The flagship opens in January 2027. Choose the day that suits you — the {BRAND.whatsapp} confirms the exact hour on WhatsApp.
                  </p>
                )}
              </motion.div>
            ) : (
              <motion.p key="days-empty" className="cus-empty" {...swap}>
                Choose a place first — the flagship and private appointments keep separate calendars.
              </motion.p>
            )}
          </AnimatePresence>
          <ErrorText id="cus-err-date">{shown.date}</ErrorText>
        </fieldset>

        <fieldset className="cus-group" data-invalid={shown.time ? true : undefined} aria-describedby={shown.time ? 'cus-err-time' : undefined}>
          <legend className="cus-group__legend label-sm">
            Time{' '}
            {day && form.service && (
              <span className="cus-group__aside">
                {day.long} · {DURATION_MIN[form.service]} minutes
              </span>
            )}
          </legend>
          <AnimatePresence mode="wait" initial={false}>
            {slots.length ? (
              <motion.div key={`${form.date}-${form.location}`} className="cus-slots" {...swap}>
                {slots.map((s) => {
                  const on = form.time === s.time
                  return (
                    <label key={s.time} className={`cus-slot ${on ? 'is-on' : ''} ${s.taken ? 'is-taken' : ''}`}>
                      <input
                        type="radio"
                        className="sr-only"
                        name="cus-time"
                        value={s.time}
                        checked={on}
                        disabled={s.taken}
                        onChange={() => choose('time', s.time)}
                        aria-label={`${s.time}${s.taken ? ', already booked' : ''}`}
                      />
                      <span className="cus-slot__box" aria-hidden>
                        {on && <motion.span layoutId="cus-slot-hl" className="cus-slot__hl" transition={{ duration: reduce ? 0 : 0.5, ease: EASE }} />}
                        <span className="cus-slot__part">{s.taken ? 'Booked' : partOfDay(s.time)}</span>
                        <span className="cus-slot__t numeral">{s.time}</span>
                      </span>
                    </label>
                  )
                })}
              </motion.div>
            ) : (
              <motion.p key="slots-empty" className="cus-empty" {...swap}>
                Choose a date and we’ll show the hours still open that day.
              </motion.p>
            )}
          </AnimatePresence>
          <ErrorText id="cus-err-time">{shown.time}</ErrorText>
        </fieldset>
      </motion.div>
    )
  } else {
    const field = (
      k: TextKey,
      label: string,
      opts: { type?: string; auto?: string; mode?: 'tel' | 'email' | 'text'; hint?: string; placeholder?: string; optional?: boolean; wide?: boolean },
    ) => {
      const id = `cus-f-${k}`
      const err = shown[k]
      return (
        <div className={`cus-field ${opts.wide ? 'cus-field--wide' : ''} ${err ? 'is-error' : ''}`}>
          <label htmlFor={id} className="cus-field__label">
            {label}
            {opts.optional ? <span className="cus-field__opt">Optional</span> : <span className="cus-field__req" aria-hidden>*</span>}
          </label>
          <input
            id={id}
            name={k}
            type={opts.type ?? 'text'}
            inputMode={opts.mode}
            autoComplete={opts.auto}
            placeholder={opts.placeholder}
            value={form[k]}
            required={!opts.optional}
            aria-invalid={err ? true : undefined}
            aria-describedby={[opts.hint ? `${id}-hint` : '', err ? `${id}-err` : ''].filter(Boolean).join(' ') || undefined}
            onChange={(e) => set(k, e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, [k]: true }))}
          />
          {opts.hint && (
            <p id={`${id}-hint`} className="cus-field__hint">
              {opts.hint}
            </p>
          )}
          <ErrorText id={`${id}-err`}>{err}</ErrorText>
        </div>
      )
    }
    stage = (
      <motion.div key="s2" custom={dir} variants={stepVariants} initial="enter" animate="center" exit="exit" onAnimationComplete={onStepShown}>
        <h3 ref={setHeading} tabIndex={-1} className="cus-book__q">
          How shall we reach you?
        </h3>
        <div className="cus-fields">
          {field('name', 'Full name', { auto: 'name', placeholder: 'Sana Rahman', wide: true })}
          {field('phone', 'WhatsApp number', {
            type: 'tel',
            mode: 'tel',
            auto: 'tel',
            placeholder: '0300 1234567',
            hint: `The ${BRAND.whatsapp} confirms every booking personally.`,
          })}
          {field('email', 'Email', { type: 'email', mode: 'email', auto: 'email', placeholder: 'sana@company.com', hint: 'For your appointment card and fit notes.' })}
          {corporate &&
            field('org', 'Organisation', {
              auto: 'organization',
              placeholder: 'Bank, telco or technology firm',
              wide: true,
              hint: 'We’ll tailor the programme outline to your sector.',
            })}
          <div className={`cus-field cus-field--wide ${shown.notes ? 'is-error' : ''}`}>
            <label htmlFor="cus-f-notes" className="cus-field__label">
              Notes<span className="cus-field__opt">Optional</span>
            </label>
            <textarea
              id="cus-f-notes"
              name="notes"
              rows={4}
              data-lenis-prevent
              value={form.notes}
              placeholder="An occasion, a deadline, a piece you love the fit of…"
              aria-invalid={shown.notes ? true : undefined}
              aria-describedby={`cus-f-notes-count${shown.notes ? ' cus-f-notes-err' : ''}`}
              onChange={(e) => set('notes', e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, notes: true }))}
            />
            <p id="cus-f-notes-count" className={`cus-field__hint cus-field__count ${form.notes.length > NOTES_MAX ? 'is-over' : ''}`}>
              {form.notes.length} / {NOTES_MAX}
            </p>
            <ErrorText id="cus-f-notes-err">{shown.notes}</ErrorText>
          </div>
        </div>
      </motion.div>
    )
  }

  const sending = status === 'sending'
  const isDone = status === 'done'

  return (
    <section ref={root} id="book" className="section cus-book" data-theme="parchment" aria-label="Book an appointment">
      <span className="cus-book__ghost" aria-hidden>
        V
      </span>
      <div className="container">
        <header className="cus-head">
          <div className="cus-head__l">
            <Eyebrow numeral="V">Book an appointment</Eyebrow>
            <SplitReveal as="h2" className="h2 cus-head__title">
              Reserve an hour with a Femmora stylist.
            </SplitReveal>
          </div>
          <Reveal className="cus-head__r" delay={0.15}>
            <p className="lead">
              Choose a service, a place and a time — at our Dolmen Mall flagship in Lahore from January 2027, or privately, at home or the
              office, today.
              Every request is confirmed personally by the {BRAND.whatsapp}.
            </p>
          </Reveal>
        </header>

        <div className="cus-book__grid">
          <div className="cus-book__side">
            <Ticket form={form} day={day} status={status} refCode={done?.ref} />

            <Reveal delay={0.15} className="cus-book__direct">
              <p className="label-sm gold">Prefer to speak to someone?</p>
              <p className="cus-book__direct-t">
                Message the <span className="cus-book__direct-v">{BRAND.whatsapp}</span>
                <br />
                or write to <span className="cus-book__direct-v">{BRAND.email}</span>
              </p>
              <p className="cus-fine">Monday to Saturday · appointments from 11:00. A person replies — never a bot.</p>
            </Reveal>
          </div>

          <div ref={panel} className="cus-book__panel">
            {/* The panel's cloth: resizes between steps with a transform-only layout animation. */}
            <motion.span layout transition={layoutT} className="cus-book__bg" aria-hidden>
              <span className="cus-stitch cus-stitch--t" />
              <span className="cus-stitch cus-stitch--r" />
              <span className="cus-stitch cus-stitch--b" />
              <span className="cus-stitch cus-stitch--l" />
            </motion.span>

            <div className={`cus-steps ${isDone ? 'is-done' : ''}`}>
              <ol className="cus-steps__list" aria-label="Booking progress">
                {STEPS.map((label, i) => {
                  const state = isDone || i < step ? 'done' : i === step ? 'current' : 'todo'
                  return (
                    <li key={label} className={`cus-steps__item is-${state}`} aria-current={!isDone && i === step ? 'step' : undefined}>
                      <button type="button" className="cus-steps__btn" disabled={state !== 'done' || isDone || sending} onClick={() => go(i as StepIndex)}>
                        <span className="cus-steps__n numeral" aria-hidden>
                          {ROMAN[i]}
                        </span>
                        <span className="cus-steps__label label-sm">{label}</span>
                        <svg className="cus-steps__tick" viewBox="0 0 16 16" aria-hidden>
                          <path d="M3 8.5 L6.5 12 L13 4.5" />
                        </svg>
                        <span className="sr-only">
                          {state === 'done' ? (isDone ? ', complete' : ', complete — edit') : state === 'current' ? ', current step' : ', not started'}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ol>
              <span className="cus-steps__track" aria-hidden>
                <motion.span
                  className="cus-steps__fill"
                  initial={false}
                  animate={{ scaleX: isDone ? 1 : (step + 0.5) / STEPS.length }}
                  transition={{ duration: reduce ? 0 : 0.9, ease: EASE }}
                />
              </span>
            </div>

            <form className="cus-book__form" noValidate onSubmit={onSubmit} aria-label="Appointment request">
              <div className="cus-book__stage">
                <AnimatePresence mode="popLayout" custom={dir} initial={false}>
                  {stage}
                </AnimatePresence>
              </div>

              <AnimatePresence initial={false}>
                {!isDone && (
                  <motion.div
                    key="nav"
                    layout="position"
                    transition={layoutT}
                    exit={{ opacity: 0, transition: { duration: reduce ? 0 : 0.25 } }}
                    className="cus-book__nav"
                  >
                    <div className="cus-book__back">
                      {step > 0 && (
                        <Button variant="ghost" type="button" arrow={false} onClick={() => go((step - 1) as StepIndex)} disabled={sending}>
                          <span className="cus-book__back-in">
                            <svg viewBox="0 0 28 10" aria-hidden>
                              <path d="M28 5H2M6 1 2 5l4 4" fill="none" stroke="currentColor" strokeWidth="1" />
                            </svg>
                            Back
                          </span>
                        </Button>
                      )}
                    </div>
                    <p className="cus-book__count label-sm" aria-live="polite">
                      <span aria-hidden>
                        Step <span className="numeral">{ROMAN[step]}</span> of <span className="numeral">III</span>
                      </span>
                      <span className="sr-only">
                        Step {step + 1} of {STEPS.length}
                      </span>
                    </p>
                    <Button variant="gold" type="submit" disabled={sending} cursor={step === 2 ? 'Send' : 'Next'} className={sending ? 'is-sending' : ''}>
                      {step < 2 ? 'Continue' : sending ? 'Reserving your hour…' : 'Request appointment'}
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>
        </div>

        <JoinList focusRef={joinFocus} />
      </div>
    </section>
  )
}
