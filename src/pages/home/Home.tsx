import { useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import HomeStory from './HomeStory'
import TLink from '../../components/TLink'
import { PAGES } from '../../data/site'
import { useExperience } from '../../store/experience'
import { usePageReady } from '../../hooks/useGo'
import { heroScroll } from '../../three/scrollState'
import './Home.css'

const EASE = [0.22, 1, 0.36, 1] as const

function HomeHero() {
  const ref = useRef<HTMLElement>(null)
  const phase = useExperience((s) => s.phase)
  const hovered = useExperience((s) => s.hovered)
  const setHeroVisible = useExperience((s) => s.setHeroVisible)
  const ready = usePageReady()
  const show = ready && (phase === 'idle' || phase === 'returning')
  const hidden = phase === 'selecting'

  // Visibility → pause the WebGL loop when scrolled away. Scroll progress → camera drift.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setHeroVisible(e.isIntersecting), { threshold: 0 })
    io.observe(el)
    const onScroll = () => {
      const h = el.offsetHeight || window.innerHeight
      heroScroll.progress = Math.min(1, Math.max(0, window.scrollY / h))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      io.disconnect()
      window.removeEventListener('scroll', onScroll)
      setHeroVisible(true)
    }
  }, [setHeroVisible])

  return (
    <section ref={ref} className={`hero ${hidden ? 'is-leaving' : ''}`} data-theme="noir" aria-label="Femmora — the rack">
      <h1 className="sr-only">Femmora — premium formal workwear and trench coats for women who lead</h1>

      <motion.div
        className="hero__corner hero__corner--tl"
        initial={{ opacity: 0, y: 10 }}
        animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
        transition={{ duration: 1, delay: 0.2, ease: EASE }}
      >
        <span className="label-sm">Beyond the Silhouette</span>
        <span className="hero__est serif-italic">Lahore — Est. 2026</span>
      </motion.div>

      <motion.div
        className="hero__corner hero__corner--tr"
        initial={{ opacity: 0, y: 10 }}
        animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
        transition={{ duration: 1, delay: 0.3, ease: EASE }}
      >
        <span className="hero__tag">For women who lead.</span>
      </motion.div>

      <motion.nav
        className="hero__index"
        aria-label="Choose a garment"
        initial={{ opacity: 0, y: 16 }}
        animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
        transition={{ duration: 1.1, delay: 0.45, ease: EASE }}
      >
        <p className="label-sm hero__hint">
          <span className="hero__hint-dot" /> Select a garment from the rack
        </p>
        <ul>
          {PAGES.map((p) => (
            <li key={p.id} className={hovered === p.id ? 'is-hot' : ''}>
              <TLink to={p.path} cursor={p.title}>
                <span className="numeral">{p.numeral}</span>
                <span className="hero__index-title">{p.title}</span>
                <span className="hero__index-kicker label-sm">{p.garment}</span>
              </TLink>
            </li>
          ))}
        </ul>
      </motion.nav>

      <motion.div
        className="hero__scroll"
        initial={{ opacity: 0 }}
        animate={show ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 1, delay: 0.8 }}
        aria-hidden
      >
        <span className="label-sm">Scroll</span>
        <span className="hero__scroll-line" />
      </motion.div>
    </section>
  )
}

export default function Home() {
  return (
    <div className="home">
      <HomeHero />
      <div className="home__story">
        <HomeStory />
      </div>
    </div>
  )
}
