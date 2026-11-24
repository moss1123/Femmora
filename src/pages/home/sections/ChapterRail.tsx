import { useEffect, useRef, useState, type RefObject } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { ScrollTrigger, useGSAP, scrollToTarget } from '../../../lib/motion'
import { CHAPTERS, type StoryTheme } from './constants'
import './ChapterRail.css'

const EASE = [0.22, 1, 0.36, 1] as const
/** the line in the viewport at which a chapter becomes "current" */
const LINE = 0.55

/** Extra offset so a jump lands on a chapter's content, not its feathered entrance edge. */
const anchorOffset = (el: HTMLElement) => el.querySelector<HTMLElement>(':scope > .hs-manifesto__edge')?.offsetHeight ?? 0

/**
 * A slim, fixed chapter index on the left edge (wide screens with a fine pointer only).
 * Nine hairline ticks; the current chapter's tick extends in gold beside its italic numeral.
 * Hover or focus opens the titles. Ticks are buttons that glide (Lenis) to their chapter.
 * The rail re-themes itself to whatever section sits beneath it, like the nav.
 *
 * The rail's triggers carry `refreshPriority: -1`. Any explicit priority makes ScrollTrigger
 * sort every trigger by page position on refresh, so a chapter whose pin is re-created by its
 * own gsap.matchMedia (e.g. on resize) is still measured before the triggers that follow it.
 */
export default function ChapterRail({ storyRef }: { storyRef: RefObject<HTMLElement | null> }) {
  const rail = useRef<HTMLElement>(null)
  const targets = useRef<number[]>([])
  const [active, setActive] = useState(0)
  const [visible, setVisible] = useState(false)
  const [tone, setTone] = useState<StoryTheme>('wine')

  // Scroll triggers: which chapter is current, where each one starts, and whether the story is on screen.
  useGSAP(
    () => {
      const story = storyRef.current
      if (!story) return
      const triggers: ScrollTrigger[] = []
      CHAPTERS.forEach((c, i) => {
        const el = document.getElementById(c.id)
        if (!el) return
        triggers.push(
          ScrollTrigger.create({
            trigger: el,
            start: () => `top+=${anchorOffset(el)} ${LINE * 100}%`,
            end: `bottom ${LINE * 100}%`,
            refreshPriority: -1,
            onToggle: (self) => {
              if (self.isActive) setActive(i)
            },
            onRefresh: (self) => {
              targets.current[i] = self.start + window.innerHeight * LINE
            },
          }),
        )
      })
      const first = document.getElementById(CHAPTERS[0].id)
      triggers.push(
        ScrollTrigger.create({
          trigger: story,
          start: () => `top+=${first ? anchorOffset(first) : 0} 45%`,
          end: 'bottom 55%',
          refreshPriority: -1,
          onToggle: (self) => setVisible(self.isActive),
        }),
      )
      return () => triggers.forEach((t) => t.kill())
    },
    { scope: storyRef },
  )

  // Re-theme to the section beneath the rail (handles inner overrides such as the Looks aura).
  useEffect(() => {
    let raf = 0
    const check = () => {
      raf = 0
      const r = rail.current
      if (!r) return
      const box = r.getBoundingClientRect()
      const x = Math.max(1, box.left + 6)
      const y = window.innerHeight / 2
      const hit = document
        .elementsFromPoint(x, y)
        .find((n) => !r.contains(n) && n.closest('[data-theme]'))
      const theme = hit?.closest<HTMLElement>('[data-theme]')?.dataset.theme as StoryTheme | undefined
      if (theme) setTone(theme)
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

  const jump = (i: number) => {
    const y = targets.current[i]
    if (typeof y === 'number') scrollToTarget(y + 2, 0)
    else scrollToTarget(`#${CHAPTERS[i].id}`, 0)
  }

  const current = CHAPTERS[active]

  return (
    <nav
      ref={rail}
      className={`hs-rail ${visible ? 'is-visible' : ''}`}
      data-theme={tone}
      aria-label="Story chapters"
      aria-hidden={!visible}
      inert={!visible}
    >
      <p className="hs-rail__now" aria-hidden>
        <MotionConfig reducedMotion="user">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={current.id}
              className="hs-rail__now-num"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.45, ease: EASE }}
            >
              {current.numeral}
            </motion.span>
          </AnimatePresence>
        </MotionConfig>
      </p>
      <ol className="hs-rail__list">
        {CHAPTERS.map((c, i) => (
          <li key={c.id}>
            <button
              type="button"
              className={`hs-rail__item ${i === active ? 'is-active' : ''}`}
              aria-current={i === active ? 'step' : undefined}
              aria-label={`Chapter ${c.numeral}: ${c.title}`}
              data-cursor=""
              onClick={() => jump(i)}
            >
              <span className="hs-rail__tick" aria-hidden />
              <span className="hs-rail__title" aria-hidden>
                <span className="numeral">{c.numeral}</span>
                <span className="label-sm">{c.title}</span>
              </span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  )
}
