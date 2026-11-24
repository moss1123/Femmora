import { useRef } from 'react'
import { gsap, useGSAP } from '../../../lib/motion'
import { Eyebrow } from '../../../components/Reveal'
import { FORMALITY, MQ, chapter, type MQConditions } from './constants'
import './DoubleBind.css'

const CH = chapter('hs-bind')
const STAT = 3.3

/* Boardroom seen from above: ten hairline seats and one gold seat, at the head. */
const SEATS_X = [78, 104, 130, 156, 182]

function BoardroomTable() {
  return (
    <svg className="hs-bind__svg" viewBox="0 0 260 170" role="img" aria-labelledby="hs-bind-svg-t">
      <title id="hs-bind-svg-t">A boardroom table seen from above: eleven hairline seats, and a single gold seat at its head.</title>
      <g className="hs-bind__tabletop" fill="none" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke">
        <rect x="56" y="58" width="148" height="54" rx="27" />
        <rect x="64" y="66" width="132" height="38" rx="19" strokeDasharray="2 4" opacity="0.55" />
      </g>
      <g className="hs-bind__seats" fill="none" stroke="currentColor" strokeWidth="1">
        {SEATS_X.map((x) => (
          <rect key={`t${x}`} className="hs-bind__seat" x={x - 9} y={35} width={18} height={11} rx={3} />
        ))}
        {SEATS_X.map((x) => (
          <rect key={`b${x}`} className="hs-bind__seat" x={x - 9} y={124} width={18} height={11} rx={3} />
        ))}
        <rect className="hs-bind__seat" x={218.5} y={76} width={11} height={18} rx={3} />
      </g>
      <g className="hs-bind__her">
        <circle className="hs-bind__halo" cx="36" cy="85" r="17" fill="none" stroke="currentColor" strokeWidth="0.75" />
        <rect className="hs-bind__her-seat" x={30.5} y={76} width={11} height={18} rx={3} fill="currentColor" />
      </g>
    </svg>
  )
}

/**
 * II — The double bind. Pinned + scrubbed on desktop:
 * "Too Western" slides in from the left, "Too traditional" from the right, the boardroom
 * statistic counts up, then both claims collide and dissolve into the resolution —
 * Western structure, modest by design, and fusion with clear formality levels.
 */
export default function DoubleBind() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const el = root.current
      if (!el) return
      const mm = gsap.matchMedia()

      mm.add({ motion: MQ.motion, pin: MQ.pin }, (ctx) => {
        const { pin } = ctx.conditions as unknown as MQConditions
        const q = gsap.utils.selector(el)
        const stage = q('.hs-bind__stage')[0]
        const west = q('.hs-bind__side--west')[0]
        const east = q('.hs-bind__side--east')[0]
        const table = q('.hs-bind__table')[0]
        const seats = q('.hs-bind__seat')
        const her = q('.hs-bind__her-seat')[0]
        const halo = q('.hs-bind__halo')[0]
        const tabletop = q('.hs-bind__tabletop')[0]
        const num = q('.hs-bind__num')[0] as HTMLElement
        const stat = q('.hs-bind__stat')[0]
        const caption = q('.hs-bind__stat-cap')
        const rule = q('.hs-bind__rule')[0]
        const lines = q('.hs-bind__line')
        const after = q('.hs-bind__label, .hs-bind__resolve-lead, .hs-bind__levels')

        const counter = { v: 0 }
        const writeCounter = () => {
          num.textContent = counter.v.toFixed(1)
        }

        if (pin) {
          const tl = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              trigger: stage,
              start: 'top top',
              end: '+=320%',
              pin: true,
              scrub: 0.7,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          })

          tl.fromTo(west, { xPercent: -55, opacity: 0, filter: 'blur(12px)' }, { xPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 1, ease: 'power2.out' })
            .fromTo(east, { xPercent: 55, opacity: 0, filter: 'blur(12px)' }, { xPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 1, ease: 'power2.out' }, 0.6)
            .fromTo(tabletop, { opacity: 0, scale: 0.9, transformOrigin: '50% 50%' }, { opacity: 1, scale: 1, duration: 0.6 }, 1.15)
            .fromTo(seats, { opacity: 0, scale: 0, transformOrigin: '50% 50%' }, { opacity: 1, scale: 1, duration: 0.3, stagger: 0.04 }, 1.3)
            .fromTo(stat, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.4 }, 1.3)
            .fromTo(counter, { v: 0 }, { v: STAT, duration: 0.9, ease: 'power1.out', onUpdate: writeCounter }, 1.35)
            .fromTo(caption, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5 }, 1.6)
            .fromTo(her, { opacity: 0, scale: 0.4, transformOrigin: '50% 50%' }, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2)' }, 2.05)
            .fromTo(halo, { opacity: 0, scale: 0.3, transformOrigin: '50% 50%' }, { opacity: 1, scale: 1, duration: 0.5 }, 2.15)
            .addLabel('collide', 2.9)
            .to(west, { x: () => window.innerWidth * 0.16, opacity: 0, filter: 'blur(14px)', duration: 0.9, ease: 'power2.in' }, 'collide')
            .to(east, { x: () => window.innerWidth * -0.16, opacity: 0, filter: 'blur(14px)', duration: 0.9, ease: 'power2.in' }, 'collide')
            .to(table, { opacity: 0, scale: 0.86, filter: 'blur(8px)', duration: 0.7, ease: 'power2.in' }, 'collide+=0.15')
            .fromTo(rule, { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: 'power2.inOut' }, 'collide+=0.65')
            .fromTo(lines, { yPercent: 112, rotate: 1.5 }, { yPercent: 0, rotate: 0, duration: 0.8, stagger: 0.16, ease: 'power3.out' }, 'collide+=0.85')
            .fromTo(after, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.12 }, 'collide+=1.2')
            .to({}, { duration: 0.6 })
        } else {
          // Flow layout: each beat reveals as it enters.
          const reveal = (targets: gsap.TweenTarget, from: gsap.TweenVars, trigger: Element) =>
            gsap.from(targets, {
              ...from,
              duration: 1.2,
              ease: 'lux',
              scrollTrigger: { trigger, start: 'top 85%', toggleActions: 'play none none none' },
            })
          reveal(west, { x: -48, opacity: 0 }, west)
          reveal(east, { x: 48, opacity: 0 }, east)
          reveal(seats, { opacity: 0, scale: 0, transformOrigin: '50% 50%', stagger: 0.04 }, table)
          reveal([her, halo], { opacity: 0, scale: 0.3, transformOrigin: '50% 50%', delay: 0.6 }, table)
          gsap.fromTo(counter, { v: 0 }, {
            v: STAT,
            duration: 1.6,
            ease: 'power2.out',
            onUpdate: writeCounter,
            scrollTrigger: { trigger: table, start: 'top 80%' },
          })
          reveal(rule, { scaleX: 0 }, rule)
          reveal(lines, { yPercent: 112, stagger: 0.14 }, rule)
          reveal(after, { opacity: 0, y: 18, stagger: 0.12 }, rule)
        }
        // The statistic counts up from zero — never show the final figure first, then jump back.
        writeCounter()

        return () => {
          num.textContent = STAT.toFixed(1)
        }
      })

      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section ref={root} id={CH.id} className="hs-bind" data-theme={CH.theme} aria-labelledby="hs-bind-title">
      <div className="hs-bind__stage">
        <div className="container hs-bind__inner">
          <header className="hs-bind__head">
            <Eyebrow numeral={CH.numeral}>The double bind</Eyebrow>
            <p className="label-sm hs-bind__head-note">What the women we interviewed told us</p>
          </header>

          <div className="hs-bind__side hs-bind__side--west">
            <p className="label-sm hs-bind__tag">The borrowed Western suit</p>
            <p className="hs-bind__claim">
              Too Western <span className="hs-bind__claim-sub">reads too <em>bold.</em></span>
            </p>
            <p className="hs-bind__note">
              Heavy blazers cut for London winters — unwearable eight months of our year — and short, sheer or
              clinging cuts that read as immodest in the room that matters.
            </p>
          </div>

          <div className="hs-bind__table">
            <BoardroomTable />
            <p className="hs-bind__stat">
              <span className="sr-only">{STAT.toFixed(1)}%</span>
              <span className="hs-bind__num" aria-hidden>
                {STAT.toFixed(1)}
              </span>
              <span className="hs-bind__pct" aria-hidden>
                %
              </span>
            </p>
            <p className="hs-bind__stat-cap">
              of full-time corporate roles in Pakistan are held by women. More often than not, she is the only woman
              at the table.
            </p>
          </div>

          <div className="hs-bind__side hs-bind__side--east">
            <p className="label-sm hs-bind__tag">The occasion kurta</p>
            <p className="hs-bind__claim">
              Too traditional <span className="hs-bind__claim-sub">reads <em>non-corporate.</em></span>
            </p>
            <p className="hs-bind__note">
              Threadwork and glitter belong to weddings — and no label says what counts as formal. In a boardroom,
              status is read in clean seams, sharp collars and the weight of the cloth.
            </p>
          </div>

          <div className="hs-bind__resolve">
            <span className="hs-bind__rule" aria-hidden />
            <p className="label hs-bind__label">Femmora — modesty without compromise</p>
            <h2 id="hs-bind-title" className="hs-bind__answer">
              <span className="hs-bind__mask">
                <span className="hs-bind__line">Western structure,</span>
              </span>
              <span className="hs-bind__mask">
                <span className="hs-bind__line">
                  modest <em>by design.</em>
                </span>
              </span>
            </h2>
            <p className="hs-bind__resolve-lead">
              Trench coats, long coats and blazers with equestrian discipline — longer lines, considered necklines,
              nothing sheer. And kurtas and fusion pieces that each carry a clear formality level.
            </p>
            <ol className="hs-bind__levels" aria-label="Formality levels">
              {FORMALITY.map((f) => (
                <li key={f.numeral} className="hs-bind__level">
                  <span className="numeral hs-bind__level-n" aria-hidden>
                    {f.numeral}
                  </span>
                  <span className="label-sm hs-bind__level-name">
                    <span className="sr-only">Level {f.numeral}: </span>
                    {f.name}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}
