import { useRef, type CSSProperties, type ElementType, type ReactNode } from 'react'
import { motion, useInView } from 'motion/react'
import { gsap, SplitText, useGSAP, prefersReducedMotion } from '../lib/motion'
import { usePageReady } from '../hooks/useGo'

const EASE = [0.22, 1, 0.36, 1] as const

/** Fade/rise into view once. Use for paragraphs, cards, images. */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
  style,
  as = 'div',
  amount = 0.25,
}: {
  children: ReactNode
  delay?: number
  y?: number
  className?: string
  style?: CSSProperties
  as?: 'div' | 'section' | 'li' | 'span' | 'p' | 'figure' | 'article'
  amount?: number
}) {
  const ref = useRef<HTMLElement>(null)
  const ready = usePageReady()
  const inView = useInView(ref, { once: true, amount })
  const show = inView && ready
  const M = motion[as] as typeof motion.div
  return (
    <M
      ref={ref as never}
      className={className}
      style={style}
      initial={{ opacity: 0, y }}
      animate={show ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 1.1, delay, ease: EASE }}
    >
      {children}
    </M>
  )
}

/**
 * Headline that reveals line-by-line (GSAP SplitText, masked lines).
 * `trigger="load"` plays once the page cover lifts; `"scroll"` plays when scrolled into view.
 */
export function SplitReveal({
  children,
  as: Tag = 'h2',
  className = '',
  trigger = 'scroll',
  delay = 0,
  stagger = 0.09,
  by = 'lines',
}: {
  children: ReactNode
  as?: ElementType
  className?: string
  trigger?: 'scroll' | 'load'
  delay?: number
  stagger?: number
  by?: 'lines' | 'words' | 'chars'
}) {
  const ref = useRef<HTMLElement>(null)
  const ready = usePageReady()

  useGSAP(
    () => {
      const el = ref.current
      if (!el) return
      if (prefersReducedMotion()) {
        gsap.set(el, { autoAlpha: 1 })
        return
      }
      if (trigger === 'load' && !ready) {
        gsap.set(el, { autoAlpha: 0 })
        return
      }
      gsap.set(el, { autoAlpha: 1 })
      const split = SplitText.create(el, {
        type: by === 'lines' ? 'lines' : by === 'words' ? 'lines,words' : 'lines,words,chars',
        mask: 'lines',
        linesClass: 'split-line',
        autoSplit: true,
        onSplit(self) {
          const targets = by === 'lines' ? self.lines : by === 'words' ? self.words : self.chars
          return gsap.from(targets, {
            yPercent: 115,
            rotate: by === 'chars' ? 4 : 1.5,
            duration: 1.25,
            ease: 'lux',
            stagger,
            delay,
            scrollTrigger: trigger === 'scroll' ? { trigger: el, start: 'top 88%', once: true } : undefined,
          })
        },
      })
      return () => split.revert()
    },
    { dependencies: [ready, trigger], scope: ref },
  )

  return (
    <Tag ref={ref} className={className} style={{ visibility: 'hidden' }}>
      {children}
    </Tag>
  )
}

/** Image that unveils with a clip-path wipe and drifts with scroll (parallax). */
export function ImageReveal({
  src,
  alt,
  className = '',
  style,
  parallax = 8,
  from = 'bottom',
  delay = 0,
  imgStyle,
}: {
  src: string
  alt: string
  className?: string
  style?: CSSProperties
  parallax?: number
  from?: 'bottom' | 'top' | 'left' | 'right'
  delay?: number
  imgStyle?: CSSProperties
}) {
  const wrap = useRef<HTMLDivElement>(null)
  const ready = usePageReady()
  useGSAP(
    () => {
      const el = wrap.current
      if (!el || !ready) return
      const img = el.querySelector('img')
      const clipFrom = {
        bottom: 'inset(100% 0% 0% 0%)',
        top: 'inset(0% 0% 100% 0%)',
        left: 'inset(0% 100% 0% 0%)',
        right: 'inset(0% 0% 0% 100%)',
      }[from]
      if (prefersReducedMotion()) return
      gsap.fromTo(
        el,
        { clipPath: clipFrom },
        { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'silk', delay, scrollTrigger: { trigger: el, start: 'top 85%', once: true } },
      )
      gsap.fromTo(img, { scale: 1.18 }, { scale: 1, duration: 2.2, ease: 'lux', delay, scrollTrigger: { trigger: el, start: 'top 85%', once: true } })
      if (parallax) {
        gsap.fromTo(
          img,
          { yPercent: -parallax / 2 },
          { yPercent: parallax / 2, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } },
        )
      }
    },
    { dependencies: [ready], scope: wrap },
  )
  return (
    <div ref={wrap} className={`frame ${className}`} style={{ clipPath: 'inset(100% 0% 0% 0%)', ...style }}>
      <img src={src} alt={alt} loading="lazy" style={{ height: `${100 + parallax}%`, ...imgStyle }} />
    </div>
  )
}

/** Small uppercase label with a gold hairline — use above section headings. */
export function Eyebrow({ children, numeral, className = '' }: { children: ReactNode; numeral?: string; className?: string }) {
  return (
    <div className={`eyebrow ${className}`} style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--accent)' }}>
      {numeral && <span className="numeral" style={{ fontSize: '1.1rem', letterSpacing: 0 }}>{numeral}</span>}
      <span style={{ width: '2.75rem', height: 1, background: 'currentColor', opacity: 0.7 }} />
      <span className="label">{children}</span>
    </div>
  )
}
