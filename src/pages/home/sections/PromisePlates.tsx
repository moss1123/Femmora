/**
 * The four "plates" of the promises chapter — designed panels that sit inside each promise's
 * shaped mask (rect · arch · circle · square). Pure SVG: no photographs.
 * Decorative (aria-hidden): the adjacent copy carries the meaning.
 * Pattern ids are static and prefixed `hs-plate-` (each plate renders once, on the home page).
 */

const C = {
  wine950: '#14050a',
  wine900: '#2a0a12',
  wine800: '#45111e',
  wine700: '#5c1626',
  burgundy: '#6e1423',
  ivory: '#efe7d8',
  ivory100: '#f8f4ec',
  champagne: '#e6d6b3',
  camel: '#b08d63',
  camelDeep: '#9c7a51',
  noir: '#1a0b10',
  emerald: '#1f4d3a',
  gold200: '#f1dfb2',
  gold300: '#e3c88a',
  gold500: '#c9a55c',
  gold700: '#84662e',
}

const SANS = { fontFamily: 'var(--font-sans)' }
const SERIF = { fontFamily: 'var(--font-serif)', fontStyle: 'italic' as const }
const DISPLAY = { fontFamily: 'var(--font-display)', fontStyle: 'italic' as const }

/* I — Measurement-led: a tailor's tape across burgundy twill, and the fit profile kept on file. */
export function FitCardPlate({ className = '' }: { className?: string }) {
  const UNIT = 24 // one centimetre on the tape
  const FIRST = 80
  const ticks: string[] = []
  const nums: { x: number; n: number }[] = []
  for (let i = 0; i <= 13 * 10; i++) {
    const x = -36 + i * (UNIT / 10)
    const cm = i % 10 === 0
    const half = i % 5 === 0
    ticks.push(`M${x.toFixed(1)} 80v${cm ? 11 : half ? 7.5 : 4.5}`)
    if (cm) nums.push({ x, n: FIRST + i / 10 - 1 })
  }
  const at86 = -36 + (86 - FIRST + 1) * UNIT
  return (
    <svg className={`hs-plate ${className}`} viewBox="0 0 240 200" preserveAspectRatio="xMidYMid slice" aria-hidden focusable="false">
      <defs>
        <pattern id="hs-plate-twill-wine" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(-58)">
          <path d="M0 0v4" stroke="rgba(248,244,236,0.07)" strokeWidth="1.2" />
        </pattern>
      </defs>
      <rect width="240" height="200" fill={C.wine800} />
      <rect width="240" height="200" fill="url(#hs-plate-twill-wine)" />

      <g transform="rotate(-13 120 96)">
        <rect x="-40" y="80" width="320" height="30" fill={C.champagne} />
        <path d="M-40 80h320M-40 110h320" stroke={C.gold700} strokeWidth="0.6" />
        <path d={ticks.join('')} stroke={C.wine900} strokeWidth="0.55" />
        {nums.map(({ x, n }) => (
          <text key={n} x={x + 1.6} y="105" fontSize="7.5" fill={n === 86 ? C.burgundy : C.wine900} style={SANS} letterSpacing="0.4">
            {n}
          </text>
        ))}
        {/* the reading — a gold pin through 86 */}
        <path d={`M${at86} 66v52`} stroke={C.gold500} strokeWidth="0.9" />
        <circle cx={at86} cy="64" r="3.2" fill={C.gold300} stroke={C.gold700} strokeWidth="0.5" />
      </g>

      <g>
        <text x="20" y="146" fontSize="6.4" letterSpacing="2.2" fill={C.gold300} style={SANS}>
          FIT PROFILE · Nº 0142
        </text>
        <path d="M20 152h96" stroke={C.gold500} strokeWidth="0.5" opacity="0.7" />
        <text x="20" y="170" fontSize="13" fill={C.ivory100} style={SERIF}>
          Bust 86 · Waist 70 · Hip 96
        </text>
        <text x="20" y="186" fontSize="5.8" letterSpacing="1.8" fill={C.gold200} opacity="0.85" style={SANS}>
          KEPT ON FILE FOR THE NEXT ORDER
        </text>
      </g>
      <rect x="7.5" y="7.5" width="225" height="185" fill="none" stroke={C.gold500} strokeOpacity="0.45" strokeWidth="0.6" />
    </svg>
  )
}

/* II — Built for the office day: camel gabardine, a patch pocket deep enough for a pen and a card. */
export function TwillPlate({ className = '' }: { className?: string }) {
  return (
    <svg className={`hs-plate ${className}`} viewBox="0 0 180 300" preserveAspectRatio="xMidYMid slice" aria-hidden focusable="false">
      <defs>
        <pattern id="hs-plate-gab-light" width="3.2" height="3.2" patternUnits="userSpaceOnUse" patternTransform="rotate(-63)">
          <path d="M0 0v3.2" stroke="rgba(255,248,232,0.16)" strokeWidth="0.8" />
        </pattern>
        <pattern id="hs-plate-gab-dark" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(-63)">
          <path d="M2.5 0v5" stroke="rgba(70,40,15,0.16)" strokeWidth="0.9" />
        </pattern>
      </defs>
      <rect width="180" height="300" fill={C.camel} />
      <rect width="180" height="300" fill="url(#hs-plate-gab-light)" />
      <rect width="180" height="300" fill="url(#hs-plate-gab-dark)" />

      {/* the working day */}
      <text x="90" y="84" textAnchor="middle" fontSize="7" letterSpacing="2.6" fill={C.wine900} style={SANS}>
        09:00 — 21:00
      </text>
      <path d="M58 92h64" stroke={C.wine900} strokeWidth="0.5" opacity="0.6" />

      {/* a pen and a card, waiting in the pocket */}
      <g transform="rotate(-8 70 150)">
        <rect x="64" y="112" width="7" height="70" rx="3.5" fill={C.noir} />
        <path d="M71 116v26" stroke={C.gold300} strokeWidth="1.4" strokeLinecap="round" />
      </g>
      <g transform="rotate(6 112 150)">
        <rect x="88" y="124" width="46" height="30" fill={C.ivory100} stroke={C.gold700} strokeWidth="0.5" />
        <text x="111" y="143" textAnchor="middle" fontSize="11" fill={C.burgundy} style={DISPLAY}>
          F
        </text>
      </g>

      {/* open patch pocket with a gold topstitch */}
      <path d="M40 150h100v86c0 9-6 15-15 15H55c-9 0-15-6-15-15Z" fill={C.camelDeep} />
      <path d="M40 150h100v86c0 9-6 15-15 15H55c-9 0-15-6-15-15Z" fill="url(#hs-plate-gab-light)" />
      <path
        d="M45 155h90v80c0 7-5 11-11 11H56c-6 0-11-4-11-11Z"
        fill="none"
        stroke={C.gold200}
        strokeWidth="0.7"
        strokeDasharray="2.4 2"
      />
      <path d="M40 150h100" stroke={C.wine900} strokeOpacity="0.4" strokeWidth="0.6" />

      <text x="90" y="274" textAnchor="middle" fontSize="6" letterSpacing="2.4" fill={C.wine900} style={SANS}>
        DEEP · REAL · EVERY TIME
      </text>
    </svg>
  )
}

/* III — Clear formality levels: three bands, from office to evening, read like a swatch. */
const BANDS = [
  { n: 'III', name: 'EVENING', fill: C.burgundy, ink: C.gold300 },
  { n: 'II', name: 'BOARDROOM', fill: C.camel, ink: C.wine950 },
  { n: 'I', name: 'OFFICE', fill: C.ivory, ink: C.wine900 },
]

export function FormalityPlate({ className = '' }: { className?: string }) {
  const h = 240 / BANDS.length
  return (
    <svg className={`hs-plate ${className}`} viewBox="0 0 240 240" preserveAspectRatio="xMidYMid slice" aria-hidden focusable="false">
      {BANDS.map((b, i) => (
        <g key={b.n}>
          <rect x="0" y={i * h} width="240" height={h} fill={b.fill} />
          <text x="68" y={i * h + h / 2 + 10} textAnchor="end" fontSize="28" fill={b.ink} style={DISPLAY}>
            {b.n}
          </text>
          <path d={`M80 ${i * h + h / 2}h22`} stroke={b.ink} strokeWidth="0.6" opacity="0.7" />
          <text x="110" y={i * h + h / 2 + 2.6} fontSize="7.6" letterSpacing="2.6" fill={b.ink} style={SANS}>
            {b.name}
          </text>
        </g>
      ))}
      <path d={`M0 ${h}h240M0 ${h * 2}h240`} stroke={C.gold500} strokeWidth="0.8" />
      <circle cx="120" cy="120" r="111" fill="none" stroke={C.gold500} strokeOpacity="0.55" strokeWidth="0.6" />
    </svg>
  )
}

/* IV — Personal in-store help: a colour reading, with the shade she was matched to framed in gold. */
const PALETTE = [
  { name: 'Burgundy', fill: C.burgundy, ink: C.gold200 },
  { name: 'Ivory', fill: C.ivory, ink: C.wine900 },
  { name: 'Camel', fill: C.camel, ink: C.wine950 },
  { name: 'Noir', fill: C.noir, ink: C.gold300 },
  { name: 'Emerald', fill: C.emerald, ink: C.gold200 },
  { name: 'Champagne', fill: C.champagne, ink: C.wine900 },
]

export function PalettePlate({ className = '' }: { className?: string }) {
  const W = 240
  const H = 208
  const top = 30
  const cw = W / 3
  const ch = (H - top) / 2
  return (
    <svg className={`hs-plate ${className}`} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" aria-hidden focusable="false">
      <rect width={W} height={H} fill={C.wine900} />
      <text x="14" y="19" fontSize="6.2" letterSpacing="2.2" fill={C.gold300} style={SANS}>
        YOUR COLOURS · READ IN PERSON
      </text>
      {PALETTE.map((p, i) => {
        const x = (i % 3) * cw
        const y = top + Math.floor(i / 3) * ch
        return (
          <g key={p.name}>
            <rect x={x} y={y} width={cw} height={ch} fill={p.fill} />
            <text x={x + 9} y={y + ch - 10} fontSize="9.5" fill={p.ink} style={SERIF}>
              {p.name}
            </text>
          </g>
        )
      })}
      <path d={`M${cw} ${top}V${H}M${cw * 2} ${top}V${H}M0 ${top + ch}H${W}M0 ${top}H${W}`} stroke={C.gold500} strokeWidth="0.6" opacity="0.8" />
      {/* the recommendation */}
      <rect x="5" y={top + 5} width={cw - 10} height={ch - 10} fill="none" stroke={C.gold300} strokeWidth="1" />
      <text x={cw - 10} y={top + 17} textAnchor="end" fontSize="5.4" letterSpacing="1.6" fill={C.gold200} style={SANS}>
        YOURS
      </text>
    </svg>
  )
}
