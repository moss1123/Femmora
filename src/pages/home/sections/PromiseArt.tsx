/**
 * Gold hairline "technical flats" for the four promises (Deliverable 3 differentiators).
 * Stroke = currentColor, so they take the section's accent. Decorative (aria-hidden):
 * the adjacent copy carries the meaning.
 */

type P = [number, number]

const bez = (a: P, b: P, c: P, d: P, t: number): P => {
  const u = 1 - t
  return [
    u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0],
    u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1],
  ]
}

const f = (n: number) => n.toFixed(1)

/* I — Measurement-led: a dress form with a tailor's tape at the waist. */
export function TapeArt({ className = '' }: { className?: string }) {
  // tape ribbon (two parallel edges) falling from the waist
  const inner: [P, P, P, P] = [[135, 137], [150, 151], [156, 176], [150, 205]]
  const outer: [P, P, P, P] = [[141, 134], [157, 150], [163, 176], [157, 205]]
  const rungs = Array.from({ length: 11 }, (_, i) => {
    const t = (i + 1) / 12
    const a = bez(...inner, t)
    const b = bez(...outer, t)
    const short = i % 2 === 1
    const end: P = short ? [a[0] + (b[0] - a[0]) * 0.5, a[1] + (b[1] - a[1]) * 0.5] : b
    return `M${f(a[0])} ${f(a[1])}L${f(end[0])} ${f(end[1])}`
  }).join('')
  const front: [P, P, P, P] = [[65, 136], [80, 146], [120, 146], [135, 136]]
  const ticks = Array.from({ length: 9 }, (_, i) => {
    const p = bez(...front, (i + 1) / 10)
    return `M${f(p[0])} ${f(p[1])}v${i % 2 ? 2.2 : 3.6}`
  }).join('')

  return (
    <svg className={`hs-art ${className}`} viewBox="0 0 200 262" aria-hidden focusable="false">
      <g fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="100" cy="20" rx="13" ry="3.5" />
        <path d="M88 21 87 38M112 21l1 17" />
        <path d="M87 38C70 41 56 47 50 58c-5 11-3 22 1 35 4 14 7 27 15 45-7 14-12 28-10 44l4 14h80l4-14c2-16-3-30-10-44 8-18 11-31 15-45 4-13 6-24 1-35-6-11-20-17-37-20Z" />
        <path d="M80 40c-3 30 2 60 4 98-2 22-4 40-2 58M120 40c3 30-2 60-4 98 2 22 4 40 2 58" strokeDasharray="2 3" opacity=".55" />
        <path d="M94 196h12v7H94z" />
        <path d="M100 203v31m0 0-26 18m26-18 26 18m-26-18v20" />
        <path d="M65 136c15-8 55-8 70 0" strokeDasharray="1.5 3" opacity=".5" />
        <path d="M65 136c15 10 55 10 70 0" strokeWidth="1.25" />
        <path d={ticks} opacity=".8" />
        <path d="M135 137c15 14 21 39 15 68-3 17 2 31 10 41M141 134c16 16 22 42 16 71-3 16 2 29 9 39" />
        <path d={rungs} opacity=".75" />
        <path d="m159 245 6-2 3 5-6 2z" />
        <circle cx="100" cy="58" r="1.6" />
      </g>
    </svg>
  )
}

/* III — Clear formality levels: the power kurta, mandarin collar and structured shoulder. */
export function KurtaArt({ className = '' }: { className?: string }) {
  return (
    <svg className={`hs-art ${className}`} viewBox="0 0 200 262" aria-hidden focusable="false">
      <g fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M86 20c6-3 22-3 28 0v8c-6-3-22-3-28 0Z" />
        <path d="M86 26 60 34c-6 2-9 6-11 12l-13 70 14 4 14-50 2 134-4 36h76l-4-36 2-134 14 50 14-4-13-70c-2-6-5-10-11-12l-26-8" />
        <path d="M100 26v68" />
        <path d="M62 36c8 6 10 16 8 26M138 36c-8 6-10 16-8 26" strokeDasharray="2 3" opacity=".6" />
        <path d="M38 107l14 4M162 107l-14 4" />
        <path d="M66 204c2 12 4 24 6 36M134 204c-2 12-4 24-6 36" opacity=".8" />
        <path d="M64 230h72" strokeDasharray="1.5 3" opacity=".5" />
        <path d="M134 138c-8 9-8 27 0 36" strokeDasharray="2 3" opacity=".7" />
        <path d="M84 70c4 8 4 22 2 34M116 70c-4 8-4 22-2 34" opacity=".35" />
      </g>
      <g fill="currentColor">
        <circle cx="100" cy="38" r="1.7" />
        <circle cx="100" cy="52" r="1.7" />
        <circle cx="100" cy="66" r="1.7" />
        <circle cx="100" cy="80" r="1.7" />
      </g>
    </svg>
  )
}

/* II — Built for the office day: a flat-front trouser with a genuinely deep pocket, and a breathable weave. */
export function PocketArt({ className = '' }: { className?: string }) {
  const weave = Array.from({ length: 13 }, (_, i) => {
    const v = 132 + i * 5
    return `M${v} 162v56M130 ${v + 30}h62`
  }).join('')
  return (
    <svg className={`hs-art ${className}`} viewBox="0 0 210 262" aria-hidden focusable="false">
      <defs>
        <clipPath id="hs-art-weave">
          <circle cx="161" cy="190" r="25" />
        </clipPath>
      </defs>
      <g fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M30 30h96v12H30z" />
        <path d="M46 30v12m6-12v12M104 30v12m6-12v12" opacity=".7" />
        <path d="M30 42c-2 78 2 148 6 208h70c2-50 4-100 12-132 6-14 8-36 8-76" />
        <path d="M74 42v208" strokeDasharray="2 3" opacity=".45" />
        <path d="M30 58c16 4 26 22 30 46" />
        <path d="M36 52c12 4 28 18 34 44l2 56c-4 10-20 12-30 6l-6-38" strokeDasharray="2 3" opacity=".75" />
        <path d="M90 56v100M86 56h8M86 156h8M87 61l3-5 3 5M87 151l3 5 3-5" />
        <g clipPath="url(#hs-art-weave)" opacity=".55">
          <path d={weave} />
        </g>
        <circle cx="161" cy="190" r="25" />
        <path d="M128 232c6-5 12 5 18 0s12 5 18 0 12 5 18 0" opacity=".7" />
        <path d="M136 244c6-5 12 5 18 0s12 5 18 0" opacity=".45" />
      </g>
      <text x="98" y="110" fill="currentColor" fontSize="7.5" letterSpacing="1.2" style={{ fontFamily: 'var(--font-sans)' }}>
        DEEP
      </text>
    </svg>
  )
}

/* IV — Personal in-store help: three tops × three bottoms = nine looks, styled in person. */
const TOPS_X = [40, 110, 180]
const BOTTOMS_X = [40, 110, 180]

function Top({ x, v }: { x: number; v: number }) {
  const y = 44
  if (v === 1) {
    // power kurta: longer, mandarin collar
    return <path d={`M${x - 7} ${y - 20}h14M${x - 7} ${y - 20}l-11 4-9 14 6 4 6-8v34h30v-34l6 8 6-4-9-14-11-4M${x} ${y - 20}v16`} />
  }
  if (v === 2) {
    // shirt with collar points
    return <path d={`M${x - 8} ${y - 18}l-10 4-8 12 6 4 6-6v26h28v-26l6 6 6-4-8-12-10-4-8 8z M${x} ${y - 10}v26`} />
  }
  // bow blouse
  return (
    <path
      d={`M${x - 8} ${y - 18}l-10 4-8 12 6 4 6-6v26h28v-26l6 6 6-4-8-12-10-4c-3 5-13 5-16 0Z M${x} ${y - 14}l-5 -2v5zM${x} ${y - 14}l5 -2v5zM${x} ${y - 14}l-3 10M${x} ${y - 14}l3 10`}
    />
  )
}

function Bottom({ x, v }: { x: number; v: number }) {
  const y = 214
  if (v === 1) return <path d={`M${x - 12} ${y - 24}h24l7 48H${x - 19}Z`} /> // A-line skirt
  if (v === 2) return <path d={`M${x - 13} ${y - 24}h26l5 50h-14l-4-34-4 34h-14z`} /> // wide-leg
  return <path d={`M${x - 12} ${y - 24}h24l2 50h-11l-3-36-3 36h-11z`} /> // flat-front trouser
}

export function CapsuleArt({ className = '' }: { className?: string }) {
  const links = TOPS_X.flatMap((tx) => BOTTOMS_X.map((bx) => `M${tx} 84L${bx} 186`)).join('')
  return (
    <svg className={`hs-art ${className}`} viewBox="0 0 220 262" aria-hidden focusable="false">
      <g fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        {TOPS_X.map((x, i) => (
          <Top key={`t${x}`} x={x} v={i} />
        ))}
        {BOTTOMS_X.map((x, i) => (
          <Bottom key={`b${x}`} x={x} v={i} />
        ))}
        <path d={links} opacity=".42" />
      </g>
      <g fill="currentColor">
        {TOPS_X.map((x) => (
          <circle key={`dt${x}`} cx={x} cy={84} r={2} />
        ))}
        {BOTTOMS_X.map((x) => (
          <circle key={`db${x}`} cx={x} cy={186} r={2} />
        ))}
      </g>
      <rect x="84" y="124" width="52" height="16" style={{ fill: 'var(--bg)' }} />
      <text
        x="110"
        y="135.5"
        textAnchor="middle"
        fill="currentColor"
        fontSize="10"
        style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}
      >
        nine looks
      </text>
    </svg>
  )
}
