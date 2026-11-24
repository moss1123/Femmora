import { useRef, useState, type FormEvent, type Ref } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import Button from '../../components/Button'
import { BRAND } from '../../data/site'
import { COMING_SOON } from './data'
import { normaliseContact } from './schedule'
import ErrorText from './ErrorText'

const EASE = [0.22, 1, 0.36, 1] as const

const andList = (xs: string[]) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`)

interface Joined {
  cities: string[]
  kind: 'whatsapp' | 'email'
  value: string
}

/**
 * Karachi (Dolmen Mall) and Islamabad (Centaurus) follow the Lahore flagship.
 * A small demo form that puts her on the Femmora Private List for either city — nothing is sent.
 */
export default function JoinList({ focusRef }: { focusRef?: Ref<HTMLButtonElement> }) {
  const reduce = !!useReducedMotion()
  const [cities, setCities] = useState<string[]>([])
  const [contact, setContact] = useState('')
  const [touched, setTouched] = useState(false)
  const [tried, setTried] = useState(false)
  const [joined, setJoined] = useState<Joined | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  /** The form and the confirmation swap with mode="wait", so the next node only exists after the exit — focus it on mount. */
  const focusOnMount = useRef<'done' | 'input' | null>(null)

  const setInput = (n: HTMLInputElement | null) => {
    inputRef.current = n
    if (n && focusOnMount.current === 'input') {
      focusOnMount.current = null
      n.focus()
    }
  }
  const setDoneText = (n: HTMLParagraphElement | null) => {
    if (n && focusOnMount.current === 'done') {
      focusOnMount.current = null
      n.focus({ preventScroll: true })
    }
  }

  const parsed = normaliseContact(contact)
  const cityErr = cities.length ? null : 'Choose Karachi, Islamabad or both.'
  const contactErr = !contact.trim()
    ? 'Add a WhatsApp number or an email address.'
    : parsed
      ? null
      : 'That doesn’t look like a WhatsApp number or an email — try 0300 1234567 or name@company.com.'
  const showCityErr = tried ? cityErr : null
  const showContactErr = tried || (touched && contact.trim()) ? contactErr : null

  const toggle = (city: string) => setCities((c) => (c.includes(city) ? c.filter((x) => x !== city) : [...c, city]))

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    setTried(true)
    if (cityErr || !parsed) {
      requestAnimationFrame(() => {
        if (cityErr) document.getElementById('cus-join-city-0')?.focus()
        else inputRef.current?.focus()
      })
      return
    }
    // keep the order the cities open in, not the order they were tapped
    focusOnMount.current = 'done'
    setJoined({ cities: COMING_SOON.map((s) => s.city).filter((c) => cities.includes(c)), ...parsed })
  }

  const edit = () => {
    focusOnMount.current = 'input'
    setJoined(null)
    setTried(false)
  }

  const fade = {
    initial: { opacity: 0, y: reduce ? 0 : 12 },
    animate: { opacity: 1, y: 0, transition: { duration: reduce ? 0 : 0.55, ease: EASE } },
    exit: { opacity: 0, y: reduce ? 0 : -8, transition: { duration: reduce ? 0 : 0.25, ease: EASE } },
  }

  return (
    <div id="cus-join" className="cus-join" role="group" aria-labelledby="cus-join-title">
      <div className="cus-join__intro">
        <p className="label-sm cus-join__k">Coming soon · The Femmora Private List</p>
        <h3 id="cus-join-title" className="cus-join__title">
          Karachi and Islamabad, next.
        </h3>
        <p className="cus-join__lead">
          After the Lahore flagship, Femmora opens at {andList(COMING_SOON.map((s) => `${s.place} ${s.city}`))}. Join the list and you hear first.
        </p>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {joined ? (
          <motion.div key="done" className="cus-join__done" {...fade}>
            <svg className="cus-join__seal" viewBox="0 0 40 40" aria-hidden>
              <circle cx="20" cy="20" r="18.5" />
              <path d="M12.5 20.5 L17.5 25.5 L27.5 14.5" />
            </svg>
            <div>
              <p ref={setDoneText} tabIndex={-1} className="cus-join__done-t" role="status">
                You’re on the Private List for {andList(joined.cities)}.
              </p>
              <p className="cus-join__done-s">
                We’ll write {joined.kind === 'whatsapp' ? 'on WhatsApp' : 'by email'} to <span className="cus-join__v">{joined.value}</span> the moment{' '}
                {joined.cities.length > 1 ? 'each store opens' : 'the store opens'}.
              </p>
              <p className="cus-fine">Demo storefront — nothing has been sent or stored.</p>
              {/* once she has joined, "Join the list" elsewhere on the page lands here instead of on a city that no longer exists */}
              <button ref={focusRef} type="button" className="cus-join__edit label-sm" onClick={edit}>
                Change cities or contact
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.form key="form" className="cus-join__form" noValidate onSubmit={onSubmit} aria-label="Join the Private List" {...fade}>
            <fieldset className="cus-join__cities" aria-describedby={showCityErr ? 'cus-join-city-err' : undefined}>
              <legend className="sr-only">Which cities?</legend>
              {COMING_SOON.map((s, i) => {
                const on = cities.includes(s.city)
                return (
                  <button
                    key={s.city}
                    ref={i === 0 ? focusRef : undefined}
                    id={`cus-join-city-${i}`}
                    type="button"
                    className={`cus-join__city ${on ? 'is-on' : ''}`}
                    aria-pressed={on}
                    onClick={() => toggle(s.city)}
                  >
                    <span className="cus-join__box" aria-hidden>
                      <svg viewBox="0 0 16 16">
                        <path d="M3 8.5 L6.5 12 L13 4.5" />
                      </svg>
                    </span>
                    <span className="cus-join__city-n">{s.city}</span>
                    <span className="cus-join__city-p label-sm">{s.place} · coming soon</span>
                  </button>
                )
              })}
              <ErrorText id="cus-join-city-err">{showCityErr}</ErrorText>
            </fieldset>

            <div className={`cus-field cus-join__field ${showContactErr ? 'is-error' : ''}`}>
              <label htmlFor="cus-join-contact" className="cus-field__label">
                WhatsApp or email
              </label>
              <input
                ref={setInput}
                id="cus-join-contact"
                name="contact"
                type="text"
                autoComplete="email"
                spellCheck={false}
                placeholder="0300 1234567 or name@company.com"
                value={contact}
                aria-invalid={showContactErr ? true : undefined}
                aria-describedby={`cus-join-hint${showContactErr ? ' cus-join-contact-err' : ''}`}
                onChange={(e) => setContact(e.target.value)}
                onBlur={() => setTouched(true)}
              />
              <p id="cus-join-hint" className="cus-field__hint">
                One message when the doors open — from the {BRAND.whatsapp}, never a bot.
              </p>
              <ErrorText id="cus-join-contact-err">{showContactErr}</ErrorText>
            </div>

            <Button variant="outline" type="submit" cursor="Join">
              Join the list
            </Button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  )
}
