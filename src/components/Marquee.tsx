import { useRef } from 'react'
import { gsap, useGSAP, prefersReducedMotion } from '../lib/motion'

/** Infinite italic marquee; speeds up / reverses with scroll velocity. */
export default function Marquee({ items, speed = 40, className = '' }: { items: string[]; speed?: number; className?: string }) {
  const root = useRef<HTMLDivElement>(null)
  useGSAP(
    () => {
      const track = root.current?.querySelector<HTMLDivElement>('.mq__track')
      if (!track || prefersReducedMotion()) return
      const half = track.scrollWidth / 2
      const tween = gsap.to(track, { x: -half, duration: half / speed, ease: 'none', repeat: -1 })
      let last = window.scrollY
      const onScroll = () => {
        const v = window.scrollY - last
        last = window.scrollY
        gsap.to(tween, { timeScale: gsap.utils.clamp(-4, 4, 1 + v * 0.08), duration: 0.3, overwrite: true })
        gsap.to(tween, { timeScale: 1, duration: 1.2, delay: 0.3, overwrite: false })
      }
      window.addEventListener('scroll', onScroll, { passive: true })
      return () => window.removeEventListener('scroll', onScroll)
    },
    { scope: root },
  )
  const row = [...items, ...items]
  return (
    <div ref={root} className={`mq ${className}`} role="marquee" style={{ overflow: 'hidden', whiteSpace: 'nowrap' }} aria-label={items.join(', ')}>
      <div className="mq__track" style={{ display: 'inline-flex', willChange: 'transform' }}>
        {row.map((t, i) => (
          <span
            key={i}
            aria-hidden={i >= items.length}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '2.5rem', paddingRight: '2.5rem' }}
          >
            <span className="h2" style={{ whiteSpace: 'nowrap' }}>{t}</span>
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden style={{ color: 'var(--accent)' }}>
              <path d="M9 0 L10.6 7.4 L18 9 L10.6 10.6 L9 18 L7.4 10.6 L0 9 L7.4 7.4 Z" fill="currentColor" />
            </svg>
          </span>
        ))}
      </div>
    </div>
  )
}
