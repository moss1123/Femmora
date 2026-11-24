import { useEffect, useId, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import Button from '../../../components/Button'
import { BRAND, CAMPAIGNS } from '../../../data/site'

const EASE = [0.22, 1, 0.36, 1] as const
/** "early collection access, private previews, …" — the Femmora Circle's perks, from the campaign data */
const CIRCLE_PERKS =
  CAMPAIGNS.find((c) => c.name === 'The Femmora Circle')
    ?.role.replace(/^[^—]*—\s*/, '')
    .replace(/\.$/, '') ?? 'early collection access, private previews and styling recommendations'

type Channel = 'email' | 'whatsapp'
type Field = 'name' | 'contact' | 'city'

interface FormState {
  name: string
  channel: Channel
  email: string
  phone: string
  city: string
  interests: string[]
}

const EMPTY: FormState = { name: '', channel: 'email', email: '', phone: '', city: '', interests: [] }

const CITIES = ['Lahore', 'Karachi', 'Islamabad', 'Elsewhere in Pakistan']
const INTERESTS = ['Ready-to-wear', 'Made-to-measure', 'Wardrobe consultation', 'Corporate programmes']

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
/** Pakistani mobile: 03xx xxxxxxx, +92 3xx xxxxxxx or 0092 3xx xxxxxxx (spaces, dashes and brackets ignored). */
const PK_MOBILE_RE = /^(?:\+92|0092|0)3\d{9}$/
const digitsOf = (s: string) => s.replace(/[\s\-().]/g, '')

function validate(f: FormState): Partial<Record<Field, string>> {
  const e: Partial<Record<Field, string>> = {}
  if (f.name.trim().length < 2) e.name = 'Please tell us your name.'
  if (f.channel === 'email') {
    if (!f.email.trim()) e.contact = 'Add the email address we should write to.'
    else if (!EMAIL_RE.test(f.email.trim())) e.contact = 'That email doesn’t look complete — for example, name@company.pk.'
  } else {
    if (!f.phone.trim()) e.contact = 'Add the WhatsApp number we should message.'
    else if (!PK_MOBILE_RE.test(digitsOf(f.phone))) e.contact = 'Use a Pakistani mobile number — for example, 0300 1234567 or +92 300 1234567.'
  }
  if (!f.city) e.city = 'Choose the city nearest you.'
  return e
}

/** A stable, friendly list number for the confirmation card (demo only). */
function memberNo(f: FormState) {
  const key = `${f.name.trim().toLowerCase()}|${f.channel === 'email' ? f.email.trim().toLowerCase() : digitsOf(f.phone)}`
  let h = 7
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0
  return `Nº 0${100 + (h % 900)}`
}

function masked(f: FormState) {
  if (f.channel === 'email') {
    const [user, domain] = f.email.trim().split('@')
    return `${user.slice(0, 1)}•••@${domain}`
  }
  const d = digitsOf(f.phone)
  return `WhatsApp ••• ${d.slice(-4)}`
}

/**
 * The Femmora Private List — early access to the launch (Deliverable 3, Phase I).
 * A demo form: validated in the browser (on blur, then live once a field has been touched,
 * and on submit — focus moves to the first problem), then an elegant confirmation. Nothing
 * is sent anywhere; the copy says so.
 */
export default function PrivateList() {
  const uid = useId()
  const ids = {
    title: `${uid}-title`,
    name: `${uid}-name`,
    nameErr: `${uid}-name-err`,
    contact: `${uid}-contact`,
    contactHint: `${uid}-contact-hint`,
    contactErr: `${uid}-contact-err`,
    city: `${uid}-city`,
    cityErr: `${uid}-city-err`,
    note: `${uid}-note`,
  }

  const [form, setForm] = useState<FormState>(EMPTY)
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({})
  const [attempted, setAttempted] = useState(false)
  const [status, setStatus] = useState<'idle' | 'sending' | 'done'>('idle')
  const [returning, setReturning] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  const nameRef = useRef<HTMLInputElement>(null)
  const contactRef = useRef<HTMLInputElement>(null)
  const cityRef = useRef<HTMLSelectElement>(null)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const errors = validate(form)
  const show = (f: Field) => (attempted || touched[f] ? errors[f] : undefined)

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((s) => ({ ...s, [k]: v }))
  const blur = (f: Field) => () => setTouched((t) => ({ ...t, [f]: true }))

  const setChannel = (c: Channel) => {
    set('channel', c)
    setTouched((t) => ({ ...t, contact: false }))
  }

  const toggleInterest = (e: ChangeEvent<HTMLInputElement>) => {
    const { value: v, checked } = e.target
    // functional update: never toggles against a stale list
    setForm((s) => ({
      ...s,
      interests: checked ? (s.interests.includes(v) ? s.interests : [...s.interests, v]) : s.interests.filter((i) => i !== v),
    }))
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (status === 'sending') return
    setAttempted(true)
    const errs = validate(form)
    const first = (['name', 'contact', 'city'] as Field[]).find((f) => errs[f])
    if (first) {
      ;({ name: nameRef, contact: contactRef, city: cityRef })[first].current?.focus()
      return
    }
    setStatus('sending')
    timer.current = window.setTimeout(() => setStatus('done'), 900)
  }

  const edit = () => {
    setReturning(true)
    setStatus('idle')
  }

  const email = form.channel === 'email'
  const nameErr = show('name')
  const contactErr = show('contact')
  const cityErr = show('city')
  const describe = (...parts: (string | false | undefined)[]) => parts.filter(Boolean).join(' ') || undefined

  return (
    <MotionConfig reducedMotion="user">
      <div className="hs-pl" id="hs-private-list">
        <span className="hs-pl__frame" aria-hidden />
        <AnimatePresence mode="wait" initial={false}>
          {status !== 'done' ? (
            <motion.div
              key="form"
              className="hs-pl__panel"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
              transition={{ duration: 0.55, ease: EASE }}
              onAnimationComplete={() => {
                if (returning) {
                  nameRef.current?.focus({ preventScroll: true })
                  setReturning(false)
                }
              }}
            >
              <p className="label-sm hs-pl__kicker">Early access</p>
              <h3 id={ids.title} className="hs-pl__title">
                Join the <em>Private List.</em>
              </h3>
              <p className="hs-pl__lead">
                Be first through the door — early access to Chapter One, a private preview of the flagship before it
                opens, and an invitation to the launch.
              </p>

              <form className="hs-pl__form" noValidate onSubmit={onSubmit} aria-labelledby={ids.title} aria-describedby={ids.note}>
                <div className={`hs-pl__field ${nameErr ? 'is-invalid' : ''}`}>
                  <label className="label-sm hs-pl__label" htmlFor={ids.name}>
                    Your name <span aria-hidden>*</span>
                  </label>
                  <input
                    ref={nameRef}
                    id={ids.name}
                    className="hs-pl__input"
                    type="text"
                    name="name"
                    autoComplete="name"
                    required
                    aria-required="true"
                    aria-invalid={nameErr ? true : undefined}
                    aria-describedby={describe(nameErr && ids.nameErr)}
                    value={form.name}
                    onChange={(e) => set('name', e.target.value)}
                    onBlur={blur('name')}
                  />
                  {nameErr && (
                    <p id={ids.nameErr} className="hs-pl__error">
                      {nameErr}
                    </p>
                  )}
                </div>

                <fieldset className="hs-pl__field hs-pl__channel">
                  <legend className="label-sm hs-pl__label">Reach me on</legend>
                  <div className="hs-pl__seg">
                    {(
                      [
                        ['email', 'Email'],
                        ['whatsapp', 'WhatsApp'],
                      ] as [Channel, string][]
                    ).map(([v, label]) => (
                      <label key={v} className={`hs-pl__seg-opt ${form.channel === v ? 'is-on' : ''}`}>
                        <input
                          type="radio"
                          name={`${uid}-channel`}
                          value={v}
                          checked={form.channel === v}
                          onChange={() => setChannel(v)}
                        />
                        <span className="hs-pl__seg-text label-sm">{label}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <div className={`hs-pl__field ${contactErr ? 'is-invalid' : ''}`}>
                  <label className="label-sm hs-pl__label" htmlFor={ids.contact}>
                    {email ? 'Email address' : 'WhatsApp number'} <span aria-hidden>*</span>
                  </label>
                  <input
                    ref={contactRef}
                    key={form.channel}
                    id={ids.contact}
                    className="hs-pl__input"
                    type={email ? 'email' : 'tel'}
                    name={email ? 'email' : 'tel'}
                    inputMode={email ? 'email' : 'tel'}
                    autoComplete={email ? 'email' : 'tel'}
                    placeholder={email ? 'name@company.pk' : '0300 1234567'}
                    required
                    aria-required="true"
                    aria-invalid={contactErr ? true : undefined}
                    aria-describedby={describe(ids.contactHint, contactErr && ids.contactErr)}
                    value={email ? form.email : form.phone}
                    onChange={(e) => set(email ? 'email' : 'phone', e.target.value)}
                    onBlur={blur('contact')}
                  />
                  <p id={ids.contactHint} className="hs-pl__hint">
                    {email
                      ? 'We write only about early access and the opening.'
                      : `A message from the ${BRAND.whatsapp} — never a broadcast.`}
                  </p>
                  {contactErr && (
                    <p id={ids.contactErr} className="hs-pl__error">
                      {contactErr}
                    </p>
                  )}
                </div>

                <div className={`hs-pl__field ${cityErr ? 'is-invalid' : ''}`}>
                  <label className="label-sm hs-pl__label" htmlFor={ids.city}>
                    Nearest city <span aria-hidden>*</span>
                  </label>
                  <div className="hs-pl__select">
                    <select
                      ref={cityRef}
                      id={ids.city}
                      className="hs-pl__input"
                      name="city"
                      required
                      aria-required="true"
                      aria-invalid={cityErr ? true : undefined}
                      aria-describedby={describe(cityErr && ids.cityErr)}
                      value={form.city}
                      onChange={(e) => {
                        set('city', e.target.value)
                        setTouched((t) => ({ ...t, city: true }))
                      }}
                      onBlur={blur('city')}
                    >
                      <option value="" disabled>
                        Choose a city
                      </option>
                      {CITIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <svg viewBox="0 0 12 8" width="12" height="8" aria-hidden>
                      <path d="M1 1.5l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1" />
                    </svg>
                  </div>
                  {cityErr && (
                    <p id={ids.cityErr} className="hs-pl__error">
                      {cityErr}
                    </p>
                  )}
                </div>

                <fieldset className="hs-pl__field hs-pl__interests">
                  <legend className="label-sm hs-pl__label">
                    I’m interested in <span className="hs-pl__optional">(optional)</span>
                  </legend>
                  <div className="hs-pl__checks">
                    {INTERESTS.map((i) => (
                      <label key={i} className="hs-pl__check">
                        <input type="checkbox" value={i} checked={form.interests.includes(i)} onChange={toggleInterest} />
                        <span className="hs-pl__box" aria-hidden />
                        <span>{i}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <div className="hs-pl__actions">
                  <Button variant="gold" type="submit" disabled={status === 'sending'} cursor="Join">
                    {status === 'sending' ? 'Adding you…' : 'Join the Private List'}
                  </Button>
                  <p id={ids.note} className="hs-pl__note">
                    A demonstration — nothing is sent. No sales and no discount codes, ever.
                  </p>
                </div>
                <p className="sr-only" role="status">
                  {status === 'sending' ? 'Adding you to the Private List…' : ''}
                </p>
              </form>
            </motion.div>
          ) : (
            <Confirmation key="done" form={form} onEdit={edit} />
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  )
}

function Confirmation({ form, onEdit }: { form: FormState; onEdit: () => void }) {
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    heading.current?.focus({ preventScroll: true })
  }, [])
  const first = form.name.trim().split(/\s+/)[0]

  return (
    <motion.div
      className="hs-pl__panel hs-pl__done"
      initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.8, ease: EASE }}
    >
      <div className="hs-pl__card">
        <svg className="hs-pl__seal" viewBox="0 0 64 64" aria-hidden>
          <circle cx="32" cy="32" r="30" fill="none" stroke="currentColor" strokeWidth="0.8" />
          <circle cx="32" cy="32" r="25" fill="none" stroke="currentColor" strokeWidth="0.6" strokeDasharray="1.5 2.5" />
          <text x="32" y="40.5" textAnchor="middle" fontSize="24" fill="currentColor" className="hs-pl__seal-f">
            F
          </text>
        </svg>
        <p className="label-sm hs-pl__kicker">The Femmora Private List</p>
        <p className="hs-pl__no numeral">{memberNo(form)}</p>
        <h3 ref={heading} tabIndex={-1} className="hs-pl__title">
          Welcome to the list, <em>{first}.</em>
        </h3>
        <p className="hs-pl__lead">
          Your place is held: first access to Chapter One — <em>{BRAND.motto.replace(/\.$/, '')}</em> — a private preview
          of the Dolmen Mall flagship in Lahore before it opens in January 2027, and early word on Karachi and Islamabad.
        </p>
        <dl className="hs-pl__facts">
          <div>
            <dt className="label-sm">We’ll reach you</dt>
            <dd>{masked(form)}</dd>
          </div>
          <div>
            <dt className="label-sm">Nearest house</dt>
            <dd>{form.city === 'Elsewhere in Pakistan' ? 'Rigid-box delivery, nationwide' : form.city}</dd>
          </div>
          {form.interests.length > 0 && (
            <div>
              <dt className="label-sm">Interested in</dt>
              <dd>{form.interests.join(' · ')}</dd>
            </div>
          )}
        </dl>
        <p className="hs-pl__circle">
          <span className="label-sm">Then, the Femmora Circle</span>
          Your first piece makes you a member — {CIRCLE_PERKS}.
        </p>
      </div>
      <div className="hs-pl__actions">
        <Button variant="ghost" onClick={onEdit} arrow={false}>
          Edit my details
        </Button>
        <p className="hs-pl__note">A demonstration — nothing was sent; your details never left this page.</p>
      </div>
    </motion.div>
  )
}
