import { useRef } from 'react'
import { gsap, useGSAP } from '../../../lib/motion'
import { Eyebrow } from '../../../components/Reveal'
import { BRAND, ROADMAP } from '../../../data/site'
import { HOOK_Y, RackCoat } from './FinaleFlats'
import PrivateList from './PrivateList'
import { MQ, chapter } from './constants'
import './Launch.css'

const CH = chapter('hs-launch')
const ROMAN = ['I', 'II', 'III', 'IV', 'V']
const FLAGSHIP = BRAND.stores[0]

/* The flagship window: an arched shopfront with the rack's three trench coats on a gold rail. */
const W = 320
const H = 400
const RAIL_Y = 176
const COAT_W = 84
const COATS = [
  { id: 'styling', cx: 100 },
  { id: 'collection', cx: 160 },
  { id: 'custom', cx: 220 },
] as const
const GLASS = `M40 ${H - 12}V176A120 120 0 0 1 280 176V${H - 12}Z`

function FlagshipWindow() {
  return (
    <svg className="hs-launch__window" viewBox={`0 0 ${W} ${H}`} role="img" aria-labelledby="hs-launch-window-t">
      <title id="hs-launch-window-t">
        The Dolmen Mall flagship window: three trench coats — ivory, burgundy and camel — hang on a gold rail beneath
        the Femmora name.
      </title>
      <defs>
        <clipPath id="hs-launch-glass-clip">
          <path d={GLASS} />
        </clipPath>
        {/* user-space units: the rail is a horizontal line, and a zero-height bounding box would
            make an objectBoundingBox gradient (and so the whole stroke) silently disappear */}
        <linearGradient id="hs-launch-foil" gradientUnits="userSpaceOnUse" x1="62" y1={RAIL_Y} x2="258" y2={RAIL_Y}>
          <stop offset="0" stopColor="#8a6a2f" />
          <stop offset="0.3" stopColor="#c9a55c" />
          <stop offset="0.5" stopColor="#f1dfb2" />
          <stop offset="0.7" stopColor="#c9a55c" />
          <stop offset="1" stopColor="#9c7a3c" />
        </linearGradient>
      </defs>
      {/* glass, with one long reflection */}
      <path className="hs-launch__glass" d={GLASS} />
      <path d={`M214 40H246L118 ${H}H86Z`} className="hs-launch__shine" clipPath="url(#hs-launch-glass-clip)" />
      {/* the arch, double-lined, with a keystone */}
      <g className="hs-launch__arch" fill="none" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke">
        <path d={`M26 ${H - 12}V176A134 134 0 0 1 294 176V${H - 12}`} />
        <path d={`M40 ${H - 12}V176A120 120 0 0 1 280 176V${H - 12}`} opacity="0.6" />
        <path d="M160 36l5 6-5 6-5-6Z" />
        <path d={`M12 ${H - 12}H308`} />
        <path d={`M20 ${H - 6}H300`} opacity="0.5" />
      </g>
      {/* the name on the glass */}
      <g className="hs-launch__sign">
        <text x="160" y="104" textAnchor="middle" fontSize="15" letterSpacing="7.5" className="hs-launch__sign-name">
          FEMMORA
        </text>
        <path d="M128 116h64" stroke="currentColor" strokeWidth="0.6" opacity="0.7" />
        <text x="160" y="132" textAnchor="middle" fontSize="7" letterSpacing="3" className="hs-launch__sign-sub">
          Nº 01 · LAHORE
        </text>
      </g>
      {/* rail + finials */}
      <g className="hs-launch__rail">
        <path d={`M62 ${RAIL_Y}H258`} stroke="url(#hs-launch-foil)" strokeWidth="2" />
        <circle cx="58.5" cy={RAIL_Y} r="3.4" fill="none" stroke="currentColor" strokeWidth="0.8" />
        <circle cx="261.5" cy={RAIL_Y} r="3.4" fill="none" stroke="currentColor" strokeWidth="0.8" />
      </g>
      {COATS.map((c) => (
        <g key={c.id} className="hs-launch__coat">
          <RackCoat id={c.id} x={c.cx - COAT_W / 2} y={RAIL_Y - COAT_W * 1.5 * HOOK_Y} width={COAT_W} />
        </g>
      ))}
      {/* the plinth the window display stands on */}
      <path d={`M60 ${H - 44}H260`} stroke="currentColor" strokeWidth="0.6" opacity="0.45" />
      <text x="160" y={H - 26} textAnchor="middle" fontSize="6.4" letterSpacing="2.6" className="hs-launch__sign-sub">
        OPENING {FLAGSHIP.when.replace(/^.*·\s*/, '').toUpperCase()}
      </text>
    </svg>
  )
}

/**
 * VIII — Beyond the Silhouette: the launch. The Deliverable 3 roadmap (December 2026 →
 * expansion) on a gold hairline that draws with scroll, the Dolmen Mall flagship drawn as a
 * shop window holding the rack's three trench coats, the stores to follow, the WhatsApp
 * Concierge — and the Private List, a demo early-access form.
 */
export default function Launch() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const el = root.current
      if (!el) return
      const mm = gsap.matchMedia()
      mm.add({ motion: MQ.motion, wide: '(min-width: 900px)' }, (ctx) => {
        const { motion, wide } = ctx.conditions as { motion: boolean; wide: boolean }
        if (!motion) return
        const q = gsap.utils.selector(el)
        const road = q('.hs-launch__road')[0]

        gsap.from(q('.hs-launch__head-main > *, .hs-launch__aside > *'), {
          opacity: 0,
          y: 26,
          duration: 1.2,
          ease: 'lux',
          stagger: 0.09,
          scrollTrigger: { trigger: q('.hs-launch__head')[0], start: 'top 82%' },
        })

        // The roadmap line draws across (or down, on a phone) with scroll; each phase lights as the line reaches it.
        gsap.fromTo(
          q('.hs-launch__fill'),
          { [wide ? 'scaleX' : 'scaleY']: 0 },
          {
            [wide ? 'scaleX' : 'scaleY']: 1,
            ease: 'none',
            scrollTrigger: { trigger: road, start: 'top 78%', end: wide ? 'top 38%' : 'bottom 62%', scrub: 0.6 },
          },
        )
        ;(q('.hs-launch__phase') as HTMLElement[]).forEach((phase, i) => {
          gsap
            .timeline({
              scrollTrigger: wide
                ? { trigger: road, start: `top ${74 - i * 9}%`, toggleActions: 'play none none reverse' }
                : { trigger: phase, start: 'top 72%', toggleActions: 'play none none reverse' },
            })
            .fromTo(phase.querySelector('.hs-launch__node'), { scale: 0 }, { scale: 1, duration: 0.6, ease: 'back.out(2.4)' })
            .from(phase.querySelectorAll('.hs-launch__when, .hs-launch__phase-name, .hs-launch__what'), { opacity: 0, y: 18, duration: 0.9, ease: 'lux', stagger: 0.07 }, 0.1)
        })

        // The window: the glass clears, the rail draws, the coats are hung one by one.
        const win = q('.hs-launch__window')[0]
        gsap
          .timeline({ scrollTrigger: { trigger: win, start: 'top 80%' } })
          .fromTo(win, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'silk' })
          .fromTo(q('.hs-launch__rail'), { scaleX: 0, transformOrigin: '50% 50%' }, { scaleX: 1, duration: 1.1, ease: 'lux' }, 0.5)
          .from(q('.hs-launch__coat'), { y: -26, opacity: 0, duration: 1.1, ease: 'power3.out', stagger: 0.14 }, 0.8)
          .from(q('.hs-launch__sign'), { opacity: 0, duration: 1.2, ease: 'lux' }, 0.6)

        gsap.from(q('.hs-launch__store'), {
          opacity: 0,
          x: -18,
          duration: 1,
          ease: 'lux',
          stagger: 0.1,
          scrollTrigger: { trigger: q('.hs-launch__stores')[0], start: 'top 85%' },
        })
        gsap.from(q('.hs-pl'), {
          opacity: 0,
          y: 40,
          duration: 1.3,
          ease: 'lux',
          scrollTrigger: { trigger: q('.hs-pl')[0], start: 'top 88%' },
        })
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section ref={root} id={CH.id} className="hs-launch" data-theme={CH.theme} aria-labelledby="hs-launch-title">
      <div className="container">
        <header className="hs-launch__head">
          <div className="hs-launch__head-main">
            <Eyebrow numeral={CH.numeral}>The launch</Eyebrow>
            <h2 id="hs-launch-title" className="hs-launch__title">
              Beyond the <em>Silhouette.</em>
            </h2>
          </div>
          <div className="hs-launch__aside">
            <p className="hs-launch__lead">
              Our launch campaign — and the value we add beyond the piece: the consultation, the colour analysis, the
              confidence. The house opens online first, then in a flagship you can walk into.
            </p>
            <p className="label-sm hs-launch__direct">
              Direct to you <span className="hs-dia" aria-hidden /> no marketplaces, no wholesale
            </p>
          </div>
        </header>

        <div className="hs-launch__roadwrap">
          <span className="hs-launch__track" aria-hidden>
            <span className="hs-launch__fill" />
          </span>
          <ol className="hs-launch__road" aria-label="The launch roadmap">
            {ROADMAP.map((r, i) => (
              <li key={r.phase} className={`hs-launch__phase ${i === 1 ? 'is-flagship' : ''}`}>
                <span className="hs-launch__node" aria-hidden />
                <p className="hs-launch__when">{r.when}</p>
                <h3 className="label-sm hs-launch__phase-name">{r.phase}</h3>
                <p className="hs-launch__what">{r.what}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="hs-launch__grid">
          <div className="hs-launch__flagship">
            <FlagshipWindow />
            <div className="hs-launch__stores">
              <p className="label-sm hs-launch__stores-label">The house, in person</p>
              <ol className="hs-launch__store-list">
                {BRAND.stores.map((s, i) => (
                  <li key={s.city} className={`hs-launch__store ${i === 0 ? 'is-first' : ''}`}>
                    <span className="numeral hs-launch__store-n" aria-hidden>
                      {ROMAN[i]}
                    </span>
                    <span className="hs-launch__store-place">
                      <span className="hs-launch__store-city">{s.city}</span>
                      <span className="hs-launch__store-mall">{s.place}</span>
                    </span>
                    <span className="label-sm hs-launch__store-when">{s.when}</span>
                  </li>
                ))}
              </ol>
              <p className="hs-launch__concierge">
                <span className="label-sm">{BRAND.whatsapp}</span>
                Until the doors open — and always — book a fitting, ask a styling question or reserve a piece on
                WhatsApp. Every order travels in its rigid box, nationwide.
              </p>
            </div>
          </div>

          <PrivateList />
        </div>
      </div>
    </section>
  )
}
