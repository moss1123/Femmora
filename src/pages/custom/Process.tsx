import { useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '../../lib/motion'
import { Eyebrow, SplitReveal } from '../../components/Reveal'
import { PROCESS, ROMAN } from './data'
import './Process.css'

/* Horizontal thread (viewBox 0 0 1000 200): the five stations sit exactly on its crests and troughs. */
const NODES: [number, number][] = [
  [100, 132],
  [300, 68],
  [500, 132],
  [700, 68],
  [900, 132],
]
const THREAD_H =
  'M0,98 C45,98 55,132 100,132 C190,132 210,68 300,68 C390,68 410,132 500,132 C590,132 610,68 700,68 C790,68 810,132 900,132 C945,132 955,104 1000,104'
/* Vertical thread for small screens (viewBox 0 0 40 1000, stretched to the list height). */
const THREAD_V = 'M20,0 C26,60 14,140 20,200 C26,260 14,340 20,400 C26,460 14,540 20,600 C26,660 14,740 20,800 C26,860 14,940 20,1000'

export default function Process() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const el = root.current
      if (!el) return
      const items = gsap.utils.toArray<HTMLElement>('.cus-step', el)
      const stages = gsap.utils.toArray<HTMLElement>('.cus-stage__item', el)
      const countEl = el.querySelector<HTMLElement>('.cus-process__count-n')
      const bar = el.querySelector<HTMLElement>('.cus-process__bar span')
      let current = -2

      const setActive = (idx: number) => {
        if (idx === current) return
        current = idx
        items.forEach((it, i) => {
          it.classList.toggle('is-on', i <= idx)
          it.classList.toggle('is-current', i === idx)
        })
        stages.forEach((s, i) => s.classList.toggle('is-current', i === Math.max(idx, 0)))
        if (countEl) {
          countEl.textContent = ROMAN[Math.max(idx, 0)]
          gsap.fromTo(countEl, { yPercent: 60, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.7, ease: 'lux', overwrite: true })
        }
      }
      const clear = () => {
        current = -2
        items.forEach((it) => it.classList.remove('is-on', 'is-current'))
        stages.forEach((s) => s.classList.remove('is-current'))
      }

      const mm = gsap.matchMedia()
      mm.add(
        {
          desktop: '(min-width: 1024px) and (prefers-reduced-motion: no-preference)',
          mobile: '(max-width: 1023.98px) and (prefers-reduced-motion: no-preference)',
          reduce: '(prefers-reduced-motion: reduce)',
        },
        (ctx) => {
          const { desktop, mobile } = ctx.conditions as { desktop: boolean; mobile: boolean; reduce: boolean }

          if (desktop) {
            const path = el.querySelector<SVGPathElement>('.cus-thread__draw--h')
            const needle = el.querySelector<SVGGElement>('.cus-needle')
            const pin = el.querySelector<HTMLElement>('.cus-process__pin')
            if (!path || !needle || !pin) return
            const L = path.getTotalLength()

            const follow = (p: number) => {
              const d = Math.max(0.001, p * L)
              const a = path.getPointAtLength(d)
              const b = path.getPointAtLength(Math.max(0, d - 3))
              const ang = (Math.atan2(a.y - b.y, a.x - b.x) * 180) / Math.PI
              needle.setAttribute('transform', `translate(${a.x.toFixed(2)} ${a.y.toFixed(2)}) rotate(${ang.toFixed(2)})`)
              let idx = 0
              NODES.forEach(([x], i) => {
                if (a.x >= x - 1.5) idx = i
              })
              setActive(idx)
              if (bar) bar.style.transform = `scaleX(${p.toFixed(4)})`
            }

            gsap.set(path, { strokeDasharray: L, strokeDashoffset: L })
            follow(0)

            const tl: gsap.core.Timeline = gsap.timeline({
              onUpdate: () => follow(Math.min(1, tl.time())),
              scrollTrigger: {
                trigger: pin,
                start: 'top top',
                end: () => `+=${Math.round(window.innerHeight * 2.8)}`,
                pin: true,
                pinSpacing: true,
                scrub: 0.9,
                anticipatePin: 1,
                invalidateOnRefresh: true,
              },
            })
            tl.fromTo(
              path,
              { strokeDashoffset: L },
              { strokeDashoffset: 0, ease: 'none', duration: 1 },
            )
            // the header recedes slightly as the thread travels
            tl.fromTo(el.querySelector('.cus-process__ghost'), { xPercent: 0 }, { xPercent: -18, ease: 'none', duration: 1.2 }, 0)
            // a short hold on the final station before the section releases
            tl.to({}, { duration: 0.2 })
            return clear
          }

          if (mobile) {
            const path = el.querySelector<SVGPathElement>('.cus-thread__draw--v')
            const list = el.querySelector<HTMLElement>('.cus-process__list')
            if (!path || !list) return
            const L = path.getTotalLength()
            gsap.set(path, { strokeDasharray: L, strokeDashoffset: L })
            gsap.to(path, {
              strokeDashoffset: 0,
              ease: 'none',
              scrollTrigger: { trigger: list, start: 'top 72%', end: 'bottom 62%', scrub: 0.6 },
            })
            setActive(-1)
            items.forEach((it, i) => {
              ScrollTrigger.create({
                trigger: it,
                start: 'top 66%',
                onEnter: () => setActive(i),
                onLeaveBack: () => setActive(i - 1),
              })
            })
            return clear
          }

          // reduced motion: static vertical layout, every step visible, thread fully drawn
          el.classList.add('is-static')
          setActive(items.length - 1)
          return () => {
            el.classList.remove('is-static')
            clear()
          }
        },
      )
      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section ref={root} className="cus-process" data-theme="wine" aria-label="The atelier process">
      <div className="cus-process__pin">
        <span className="cus-process__ghost" aria-hidden>
          Atelier
        </span>

        <div className="container cus-process__inner">
          <header className="cus-process__head">
            <div>
              <Eyebrow numeral="II">The atelier process</Eyebrow>
              <SplitReveal as="h2" className="h2 cus-process__title">
                Five steps, from first conversation to rigid box.
              </SplitReveal>
            </div>
            <div className="cus-process__count" aria-hidden>
              <span className="cus-process__count-n numeral">I</span>
              <span className="cus-process__count-of">
                <span className="label-sm">of</span>
                <span className="numeral">V</span>
              </span>
            </div>
          </header>

          <div className="cus-process__track">
            {/* horizontal thread — desktop */}
            <svg className="cus-thread cus-thread--h" viewBox="0 0 1000 200" aria-hidden focusable="false">
              <path className="cus-thread__base" d={THREAD_H} />
              <path className="cus-thread__draw cus-thread__draw--h" d={THREAD_H} />
              <g className="cus-needle">
                <path className="cus-needle__body" d="M-5,0 C-5,-2.3 -1,-2.7 3,-2.1 L46,0 L3,2.1 C-1,2.7 -5,2.3 -5,0 Z" />
                <ellipse className="cus-needle__eye" cx="-0.6" cy="0" rx="2.6" ry="0.85" />
              </g>
            </svg>

            {/* vertical thread — mobile */}
            <svg className="cus-thread cus-thread--v" viewBox="0 0 40 1000" preserveAspectRatio="none" aria-hidden focusable="false">
              <path className="cus-thread__base" d={THREAD_V} />
              <path className="cus-thread__draw cus-thread__draw--v" d={THREAD_V} />
            </svg>

            <ol className="cus-process__list">
              {PROCESS.map((s, i) => (
                <li
                  key={s.title}
                  className={`cus-step ${NODES[i][1] < 100 ? 'cus-step--up' : 'cus-step--down'}`}
                  style={{ ['--x' as string]: `${NODES[i][0] / 10}%`, ['--y' as string]: `${NODES[i][1] / 2}%` }}
                >
                  <span className="cus-step__dot" aria-hidden />
                  <div className="cus-step__card">
                    <span className="cus-step__n numeral" aria-hidden>
                      {ROMAN[i]}
                    </span>
                    <span className="cus-step__meta label-sm">{s.meta}</span>
                    <h3 className="cus-step__title">{s.title}</h3>
                    <p className="cus-step__body">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* desktop "stage": the current step, told in full */}
          <div className="cus-stage" aria-hidden>
            <div className="cus-stage__items">
              {PROCESS.map((s, i) => (
                <div key={s.title} className="cus-stage__item">
                  <span className="cus-stage__n numeral">{ROMAN[i]}.</span>
                  <p className="cus-stage__body">{s.body}</p>
                </div>
              ))}
            </div>
            <div className="cus-process__progress">
              <span className="label-sm">Follow the thread</span>
              <span className="cus-process__bar">
                <span />
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
