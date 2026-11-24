import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import TLink from './TLink'
import { PAGES } from '../data/site'
import { useCart, cartCount } from '../store/cart'
import { useExperience } from '../store/experience'
import { useTransition } from '../store/transition'
import './Nav.css'

const LIGHT_THEMES = new Set(['ivory', 'parchment'])

/** Detects which themed section sits beneath the nav so the nav can invert. */
function useUnderTheme(ref: React.RefObject<HTMLElement | null>) {
  const [tone, setTone] = useState<'light' | 'dark'>('dark')
  const loc = useLocation()
  const reveal = useTransition((s) => s.revealCount)
  useEffect(() => {
    let raf = 0
    const check = () => {
      raf = 0
      const nav = ref.current
      if (!nav) return
      const y = nav.getBoundingClientRect().height / 2
      const stack = document.elementsFromPoint(window.innerWidth / 2, y)
      const hit = stack.find((el) => !nav.contains(el) && !el.closest('.tl') && el.closest('[data-theme]'))
      const theme = hit?.closest<HTMLElement>('[data-theme]')?.dataset.theme
      setTone(theme && LIGHT_THEMES.has(theme) ? 'light' : 'dark')
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check)
    }
    check()
    const t = window.setTimeout(check, 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(raf)
      window.clearTimeout(t)
    }
  }, [ref, loc.pathname, reveal])
  return tone
}

export default function Nav() {
  const ref = useRef<HTMLElement>(null)
  const tone = useUnderTheme(ref)
  const loc = useLocation()
  const items = useCart((s) => s.items)
  const setCartOpen = useCart((s) => s.setOpen)
  const phase = useExperience((s) => s.phase)
  const [menu, setMenu] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const count = cartCount(items)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  useEffect(() => setMenu(false), [loc.pathname])

  const hidden = phase === 'selecting'

  return (
    <>
      <header
        ref={ref}
        className={`nav nav--${menu ? 'dark' : tone} ${scrolled ? 'is-scrolled' : ''} ${hidden ? 'is-hidden' : ''}`}
      >
        <nav className="nav__side nav__side--left" aria-label="Primary">
          {PAGES.map((p) => (
            <TLink
              key={p.id}
              to={p.path}
              className={`nav__link ${loc.pathname === p.path ? 'is-active' : ''}`}
              cursor={p.title}
            >
              <span className="nav__num numeral">{p.numeral}</span>
              <span className="label">{p.id === 'custom' ? 'Custom' : p.id === 'collection' ? 'Collection' : 'Styling'}</span>
            </TLink>
          ))}
        </nav>

        <TLink to="/" className="nav__brand" aria-label="Femmora — home" cursor="Home">
          <span className="nav__wordmark">Femmora</span>
          <span className="nav__tag label-sm">For women who lead</span>
        </TLink>

        <div className="nav__side nav__side--right">
          <TLink to="/custom#book" className="nav__link nav__cta" cursor="Book">
            <span className="label">Book a fitting</span>
          </TLink>
          <button className="nav__bag" onClick={() => setCartOpen(true)} aria-label={`Bag, ${count} items`} data-cursor="Bag">
            <svg viewBox="0 0 24 24" aria-hidden>
              <path d="M5 8h14l-1.2 12.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8L5 8Z" fill="none" stroke="currentColor" strokeWidth="1" />
              <path d="M9 8V6.5a3 3 0 0 1 6 0V8" fill="none" stroke="currentColor" strokeWidth="1" />
            </svg>
            <AnimatePresence>
              {count > 0 && (
                <motion.span
                  key={count}
                  className="nav__count"
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.4, opacity: 0 }}
                >
                  {count}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
          <button className="nav__burger" onClick={() => setMenu((m) => !m)} aria-expanded={menu} aria-label="Menu">
            <span />
            <span />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {menu && (
          <motion.div
            className="nav-menu"
            data-theme="wine"
            initial={{ clipPath: 'inset(0% 0% 100% 0%)' }}
            animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
            exit={{ clipPath: 'inset(0% 0% 100% 0%)' }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
            data-lenis-prevent
          >
            <ul>
              {[{ path: '/', title: 'Home', numeral: '—' }, ...PAGES].map((p, i) => (
                <motion.li
                  key={p.path}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + i * 0.07, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                >
                  <TLink to={p.path} onClick={() => setMenu(false)}>
                    <span className="numeral gold">{p.numeral}</span>
                    <span className="h2">{p.title}</span>
                  </TLink>
                </motion.li>
              ))}
            </ul>
            <p className="label-sm muted">Karachi · Lahore · Islamabad</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
