import { useRef, type ComponentType } from 'react'
import { gsap, useGSAP, scrollToTarget } from '../../../lib/motion'
import { Eyebrow } from '../../../components/Reveal'
import Button from '../../../components/Button'
import { BRAND, DIFFERENTIATORS } from '../../../data/site'
import { CapsuleArt, KurtaArt, PocketArt, TapeArt } from './PromiseArt'
import { FitCardPlate, FormalityPlate, PalettePlate, TwillPlate } from './PromisePlates'
import { MQ, chapter, type MQConditions } from './constants'
import './Promises.css'

const CH = chapter('hs-promises')

type Shape = 'rect' | 'arch' | 'circle' | 'square'

interface PromiseExtra {
  ends: string[]
  /** the designed plate inside the shaped mask */
  Plate: ComponentType<{ className?: string }>
  shape: Shape
  /** gold hairline technical drawing that overlaps the plate */
  Art: ComponentType<{ className?: string }>
  fig: string
}

/** Visual + "what it ends" for each of the four differentiators (DIFFERENTIATORS order). */
const EXTRA: PromiseExtra[] = [
  {
    ends: ['Boxy, borrowed cuts', 'Sizing that changes from shop to shop', 'Starting from zero at every order'],
    Plate: FitCardPlate,
    shape: 'rect',
    Art: TapeArt,
    fig: 'Fig. 1 — Cut to her measurements, then kept on file',
  },
  {
    ends: ['Cloth that wilts by noon', 'Pockets that are only for show', 'Decoration in place of structure'],
    Plate: TwillPlate,
    shape: 'arch',
    Art: PocketArt,
    fig: 'Fig. 2 — A pocket deep enough for a phone, a pen and a card',
  },
  {
    ends: ['Guessing what counts as formal', 'Too festive for the boardroom'],
    Plate: FormalityPlate,
    shape: 'circle',
    Art: KurtaArt,
    fig: 'Fig. 3 — The power kurta, with its formality level on the label',
  },
  {
    ends: ['Shopping alone and second-guessing', 'The seven o’clock wardrobe decision'],
    Plate: PalettePlate,
    shape: 'square',
    Art: CapsuleArt,
    fig: 'Fig. 4 — Styled in person: three tops, three bottoms, nine looks',
  },
]

/**
 * III — The four promises (the four differentiators). On desktop the stage pins and the
 * track scrolls sideways (1:1 with the wheel); each panel drives its own numeral drift, plate
 * unveil, line-art wipe and "it ends" strike-throughs off the horizontal tween via `containerAnimation`.
 * Below 768px (or with reduced motion) the panels simply stack.
 */
export default function Promises() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const el = root.current
      if (!el) return
      const mm = gsap.matchMedia()

      mm.add({ motion: MQ.motion, pin: MQ.pin }, (ctx) => {
        const { pin } = ctx.conditions as unknown as MQConditions
        const q = gsap.utils.selector(el)
        const stage = q('.hs-promises__stage')[0] as HTMLElement
        const track = q('.hs-promises__track')[0] as HTMLElement
        const panels = q('.hs-promise') as HTMLElement[]

        if (pin) {
          const fill = q('.hs-promises__fill')[0]
          const count = q('.hs-promises__count')[0] as HTMLElement
          const countTitle = q('.hs-promises__count-title')[0] as HTMLElement
          const distance = () => Math.max(0, track.scrollWidth - stage.clientWidth)
          let current = -1

          const syncCounter = () => {
            const x = gsap.getProperty(track, 'x') as number
            const mid = stage.clientWidth / 2
            let best = 0
            let bestD = Infinity
            panels.forEach((p, i) => {
              const d = Math.abs(p.offsetLeft + x + p.offsetWidth / 2 - mid)
              if (d < bestD) {
                bestD = d
                best = i
              }
            })
            if (best !== current) {
              current = best
              count.textContent = DIFFERENTIATORS[best].numeral
              countTitle.textContent = DIFFERENTIATORS[best].title
            }
          }

          let horizontal: gsap.core.Tween | null = null
          const h = gsap.to(track, {
            x: () => -distance(),
            ease: 'none',
            onUpdate: () => {
              if (!horizontal) return
              gsap.set(fill, { scaleX: horizontal.progress() })
              syncCounter()
            },
            scrollTrigger: {
              trigger: stage,
              start: 'top top',
              end: () => `+=${distance()}`,
              pin: true,
              scrub: 0.8,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          })
          horizontal = h

          // Intro copy settles as the stage arrives.
          gsap.from(q('.hs-promises__intro > *'), {
            opacity: 0,
            y: 34,
            duration: 1.3,
            ease: 'lux',
            stagger: 0.1,
            scrollTrigger: { trigger: stage, start: 'top 65%', toggleActions: 'play none none reverse' },
          })

          panels.forEach((panel) => {
            const pq = gsap.utils.selector(panel)
            const inView = { trigger: panel, containerAnimation: h, scrub: true }

            gsap.fromTo(pq('.hs-promise__numeral'), { xPercent: 28 }, {
              xPercent: -28,
              ease: 'none',
              scrollTrigger: { ...inView, start: 'left right', end: 'right left' },
            })

            gsap
              .timeline({ defaults: { ease: 'none' }, scrollTrigger: { ...inView, start: 'left 85%', end: 'left 20%' } })
              .fromTo(pq('.hs-promise__reveal'), { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1 })
              .fromTo(pq('.hs-promise__plate'), { scale: 1.3 }, { scale: 1, duration: 1 }, 0)
              .fromTo(pq('.hs-promise__art'), { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9 }, 0.25)
              .fromTo(pq('.hs-promise__text > *, .hs-promise__fig'), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.07 }, 0.15)

            gsap.fromTo(pq('.hs-promise__strike'), { scaleX: 0 }, {
              scaleX: 1,
              ease: 'none',
              stagger: 0.2,
              scrollTrigger: { ...inView, start: 'left 30%', end: 'center 25%' },
            })
          })

          const outro = q('.hs-promises__outro')[0] as HTMLElement
          gsap.from(q('.hs-promises__outro > *'), {
            opacity: 0,
            y: 30,
            stagger: 0.1,
            ease: 'none',
            scrollTrigger: { trigger: outro, containerAnimation: h, start: 'left 85%', end: 'left 35%', scrub: true },
          })

          syncCounter()

          // Keyboard: the outro's link sits off-stage until the gallery has travelled. When it
          // receives focus early, glide to the end of the pin so the focused link is on screen.
          const onFocusIn = () => {
            const st = h.scrollTrigger
            if (st && st.progress < 0.999) scrollToTarget(st.end, 0)
          }
          outro.addEventListener('focusin', onFocusIn)
          return () => outro.removeEventListener('focusin', onFocusIn)
        } else {
          // Stacked flow: each panel unveils as it enters.
          const head = q('.hs-promises__intro > *')
          gsap.from(head, {
            opacity: 0,
            y: 30,
            duration: 1.2,
            ease: 'lux',
            stagger: 0.1,
            scrollTrigger: { trigger: q('.hs-promises__intro')[0], start: 'top 82%' },
          })
          panels.forEach((panel) => {
            const pq = gsap.utils.selector(panel)
            gsap
              .timeline({ defaults: { ease: 'lux' }, scrollTrigger: { trigger: panel, start: 'top 78%' } })
              .fromTo(pq('.hs-promise__reveal'), { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'silk' })
              .fromTo(pq('.hs-promise__plate'), { scale: 1.25 }, { scale: 1, duration: 1.8 }, 0)
              .fromTo(pq('.hs-promise__art'), { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'silk' }, 0.2)
              .from(pq('.hs-promise__numeral'), { opacity: 0, x: -30, duration: 1.4 }, 0)
              .from(pq('.hs-promise__text > *, .hs-promise__fig'), { opacity: 0, y: 26, duration: 1.1, stagger: 0.08 }, 0.2)
              .fromTo(pq('.hs-promise__strike'), { scaleX: 0 }, { scaleX: 1, duration: 0.9, stagger: 0.2, ease: 'power2.inOut' }, 0.9)
          })
        }
      })

      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section ref={root} id={CH.id} className="hs-promises" data-theme={CH.theme} aria-labelledby="hs-promises-title">
      <div className="hs-promises__stage">
        <div className="hs-promises__track">
          <header className="hs-promises__intro">
            <Eyebrow numeral={CH.numeral}>The house codes</Eyebrow>
            <h2 id="hs-promises-title" className="hs-promises__title">
              Four promises, <em>kept in every seam.</em>
            </h2>
            <p className="hs-promises__lead">
              Every Femmora piece answers a frustration we heard, again and again, from the women we interviewed — in
              boardrooms, banks and founders’ offices across Lahore, Karachi and Islamabad.
            </p>
            <p className="hs-promises__hint label-sm" aria-hidden>
              <span>Continue to scroll</span>
              <svg viewBox="0 0 40 10" width="40" height="10">
                <path d="M0 5h38M34 1l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1" />
              </svg>
            </p>
          </header>

          {DIFFERENTIATORS.map((d, i) => {
            const x = EXTRA[i]
            const Art = x.Art
            const Plate = x.Plate
            return (
              <article key={d.numeral} className={`hs-promise hs-promise--${x.shape}`} aria-labelledby={`hs-promise-${i}`}>
                <div className="hs-promise__visual">
                  <span className="hs-promise__numeral gold-text" aria-hidden>
                    {d.numeral}
                  </span>
                  <div className="hs-promise__reveal">
                    <div className="hs-promise__mask">
                      <Plate className="hs-promise__plate" />
                    </div>
                  </div>
                  <div className="hs-promise__art">
                    <Art />
                  </div>
                  <p className="hs-promise__fig label-sm">{x.fig}</p>
                </div>

                <div className="hs-promise__text">
                  <p className="label-sm hs-promise__count">
                    Promise {d.numeral} <span>of IV</span>
                  </p>
                  <h3 id={`hs-promise-${i}`} className="hs-promise__title">
                    {d.title}
                  </h3>
                  <p className="hs-promise__body">{d.body}</p>
                  <div className="hs-promise__ends">
                    <p className="label-sm">What it ends</p>
                    <ul>
                      {x.ends.map((e) => (
                        <li key={e}>
                          <span className="hs-promise__end">{e}</span>
                          <span className="hs-promise__strike" aria-hidden />
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            )
          })}

          <div className="hs-promises__outro">
            <p className="label-sm hs-promises__outro-label">The launch line</p>
            <p className="hs-promises__motto">{BRAND.motto}</p>
            <p className="hs-promises__outro-body">
              Clean seams, sharp collars, the right weight of cloth — and the help to wear them. Authority that is read
              before a word is spoken.
            </p>
            <Button variant="ghost" to="/custom" cursor="Atelier">
              Discover custom services
            </Button>
          </div>
        </div>

        <div className="hs-promises__progress" aria-hidden>
          <span className="hs-promises__count numeral">I</span>
          <span className="label-sm hs-promises__of">of IV</span>
          <span className="hs-promises__count-title label-sm">{DIFFERENTIATORS[0].title}</span>
          <span className="hs-promises__bar">
            <span className="hs-promises__fill" />
          </span>
        </div>
      </div>
    </section>
  )
}
