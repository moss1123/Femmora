/**
 * A faceless fashion croquis wearing the Femmora trench — drawn, not photographed.
 * One parametric drawing (viewBox 0 0 200 420) renders all four looks: the coat's colourway,
 * how it is worn (belted / open, single- or double-breasted, storm flap, collar up), what is
 * worn beneath it (cable knit, silk shirt, power kurta, satin bow blouse) and the trouser cut.
 *
 * Head, neck and hands are filled with the panel colour, so the woman reads as negative space
 * outlined in gold; the garments carry the colour. Strokes scale with the card (no
 * non-scaling-stroke), so the hero card can grow to full height and stay in proportion.
 */

export type Inner = 'knit' | 'shirt' | 'kurta' | 'blouse'
export type TrouserCut = 'wide' | 'straight' | 'slim'

export interface LookPalette {
  /** card ground */
  panel: string
  /** outline of the figure (head, hands, hair) and the floor */
  contour: string
  hair: string
  coat: string
  /** seams and details on the coat */
  line: string
  inner: string
  innerLine: string
  trouser: string
  trouserLine: string
  shoe: string
  /** earrings and buttons */
  gold: string
}

export interface LookStyle {
  /** belt: buckled, tied in a knot, or left hanging from its loops (open coat) */
  belt: 'buckle' | 'tied' | 'loose'
  open: boolean
  doubleBreasted: boolean
  stormFlap: boolean
  epaulettes: boolean
  collarUp: boolean
  inner: Inner
  trouser: TrouserCut
}

/* ── coat geometry (left side drawn explicitly, right side mirrored by hand for precision) ── */

const BODY_BELTED =
  'M86 74 L64 80 C66 100 72 128 74 150 C70 200 62 252 56 302 Q100 311 144 302 C138 252 130 200 126 150 C128 128 134 100 136 80 L114 74 Z'
const BODY_OPEN =
  'M86 74 L64 80 C66 100 70 128 71 150 C68 200 61 252 55 302 Q100 311 145 302 C139 252 132 200 129 150 C130 128 134 100 136 80 L114 74 Z'

const SLEEVE_L = 'M64 80 C56 83 52.5 94 52.5 110 L49 218 L66 220 L70.5 118 C70.5 102 68.5 88 64 80 Z'
const SLEEVE_R = 'M136 80 C144 83 147.5 94 147.5 110 L151 218 L134 220 L129.5 118 C129.5 102 131.5 88 136 80 Z'

const HAND_L = 'M50.5 219 C49 228 51 237 56 241 C60 243 64 238 65 220 Z'
const HAND_R = 'M149.5 219 C151 228 149 237 144 241 C140 243 136 238 135 220 Z'

const CUFFS = 'M49.6 202 L66.6 204.5 M49.4 207.5 L66.4 210 M133.4 204.5 L150.4 202 M133.6 210 L150.6 207.5'

const COLLAR = 'M86 74 C85 64 91 58.5 100 59 C109 58.5 115 64 114 74 Z'
const COLLAR_UP = 'M84.5 77 C82.5 61 89.5 53 100 54 C110.5 53 117.5 61 115.5 77 Z'

const LAPEL_L = 'M86.5 73.5 L76 93 L83 98 L99.5 128.5 Z'
const LAPEL_R = 'M113.5 73.5 L124 93 L117 98 L100.5 128.5 Z'
const NOTCHES = 'M76 93 L81 89.2 M124 93 L119 89.2'

const V_CLOSED = 'M86.5 73.5 L113.5 73.5 L100 128 Z'
const V_OPEN = 'M86.5 73.5 L113.5 73.5 L113 130 C115 190 117 250 119.5 306.5 Q100 309.5 80.5 306.5 C83 250 85 190 87 130 Z'

const STORM_FLAP = 'M65.5 81 L70.5 116 L88.5 113.5'
const EPAULETTES = 'M64.5 80.5 L84 75.5 L85 79.8 L66 85 Z M135.5 80.5 L116 75.5 L115 79.8 L134 85 Z'
const RAGLAN = 'M86.5 74 C78 86 73 100 71 116 M113.5 74 C122 86 127 100 129 116'

const POCKETS = 'M75.5 198 L79.5 196.5 L87.5 226 L83.5 227.5 Z M124.5 198 L120.5 196.5 L112.5 226 L116.5 227.5 Z'
const POCKETS_OPEN = 'M71.5 198 L75.5 196.5 L83 226 L79 227.5 Z M128.5 198 L124.5 196.5 L117 226 L121 227.5 Z'

const HEM_STITCH = 'M58.5 294.5 Q100 303.5 141.5 294.5'

const BELT = 'M73.5 145 Q100 149.5 126.5 145 L126.3 156 Q100 160.5 73.7 156 Z'
const BELT_KNOT = 'M95.5 147.2 h9 v11 h-9 Z'
const BELT_TAILS = 'M97 158.4 L92.5 197 L98.5 196 L101 158.4 Z M103 158.2 L109.5 193 L115 190 L104.5 157.8 Z'
const BELT_LOOSE = 'M70.5 150 L73.5 238 L78.5 237.6 L75.5 150 Z M129.5 150 L126.5 238 L121.5 237.6 L124.5 150 Z'

/* ── beneath the coat ── */

const TROUSERS: Record<TrouserCut, string> = {
  wide: 'M80 280 L73.5 392 L97.5 392 L99.6 280 Z M120 280 L126.5 392 L102.5 392 L100.4 280 Z',
  straight: 'M82 280 L80 392 L97.5 392 L99.6 280 Z M118 280 L120 392 L102.5 392 L100.4 280 Z',
  slim: 'M83 280 L85 387 L95.5 387 L99.6 280 Z M117 280 L115 387 L104.5 387 L100.4 280 Z',
}
const CREASES: Record<TrouserCut, string> = {
  wide: 'M87.6 312 L86 389 M112.4 312 L114 389',
  straight: 'M89.2 312 L88.8 389 M110.8 312 L111.2 389',
  slim: 'M90.4 312 L90.2 384 M109.6 312 L109.8 384',
}
const SHOES: Record<TrouserCut, string> = {
  wide: 'M74.5 390.5 L97 390.5 L97 397 Q86 399.5 71.5 397.5 Q69.5 394 74.5 390.5 Z M125.5 390.5 L103 390.5 L103 397 Q114 399.5 128.5 397.5 Q130.5 394 125.5 390.5 Z',
  straight: 'M80.5 390.5 L97 390.5 L97 397 Q88 399.5 76.5 397.5 Q74.5 394 80.5 390.5 Z M119.5 390.5 L103 390.5 L103 397 Q112 399.5 123.5 397.5 Q125.5 394 119.5 390.5 Z',
  slim: 'M85 386 L95.5 386 L96.5 397.5 Q88 400 79 398.2 Q76.5 395 85 389.5 Z M115 386 L104.5 386 L103.5 397.5 Q112 400 121 398.2 Q123.5 395 115 389.5 Z',
}

function Neckline({ inner, open, p }: { inner: Inner; open: boolean; p: LookPalette }) {
  const s = { fill: 'none', stroke: p.innerLine, strokeWidth: 0.6 }
  switch (inner) {
    case 'knit':
      return (
        <g>
          <path d="M96 80 q2.4 3 0 6 q-2.4 3 0 6 q2.4 3 0 6 q-2.4 3 0 6 M104 80 q-2.4 3 0 6 q2.4 3 0 6 q-2.4 3 0 6 q2.4 3 0 6" {...s} />
          <path d="M93.6 61.5 C93.6 69.5 106.4 69.5 106.4 61.5 L106.9 71.5 C106.4 77.5 93.6 77.5 93.1 71.5 Z" fill={p.inner} stroke={p.innerLine} strokeWidth="0.6" />
          <path d="M93.4 66.5 C96 70.5 104 70.5 106.6 66.5" {...s} opacity="0.7" />
        </g>
      )
    case 'shirt':
      return (
        <g>
          <path d="M100 84 V126" {...s} />
          <path d="M94.5 68.5 L91.5 80 L100 84.5 L108.5 80 L105.5 68.5" fill={p.inner} stroke={p.innerLine} strokeWidth="0.6" />
          <g fill={p.innerLine}>
            <circle cx="100" cy="95" r="0.9" />
            <circle cx="100" cy="108" r="0.9" />
            <circle cx="100" cy="120" r="0.9" />
          </g>
        </g>
      )
    case 'kurta':
      return (
        <g>
          <path d={open ? 'M100 72 V168' : 'M100 72 V126'} {...s} />
          {open && <path d="M89.5 268 V304 M110.5 268 V304" {...s} opacity="0.7" />}
          <path d="M93.8 65.5 h12.4 v6.6 h-12.4 Z" fill={p.inner} stroke={p.innerLine} strokeWidth="0.6" />
          <g fill={p.innerLine}>
            {[82, 95, 108, 121, ...(open ? [134, 147, 160] : [])].map((y) => (
              <circle key={y} cx="100" cy={y} r="1" />
            ))}
          </g>
        </g>
      )
    case 'blouse':
      return (
        <g>
          <path d="M99.2 73.5 L94 96 M100.8 73.5 L106.5 93.5" {...s} />
          <path
            d="M100 72.5 c-6 -5 -13.5 -2.4 -9.4 3.2 c2.2 2.4 6.4 1.4 9.4 -3.2 Z M100 72.5 c6 -5 13.5 -2.4 9.4 3.2 c-2.2 2.4 -6.4 1.4 -9.4 -3.2 Z"
            fill={p.inner}
            stroke={p.innerLine}
            strokeWidth="0.6"
          />
          <circle cx="100" cy="72.8" r="1.7" fill={p.inner} stroke={p.innerLine} strokeWidth="0.6" />
        </g>
      )
  }
}

export default function LookFigure({
  palette: p,
  look: l,
  label,
  className = '',
}: {
  palette: LookPalette
  look: LookStyle
  /** accessible description of the drawing */
  label: string
  className?: string
}) {
  const coatStroke = { stroke: p.line, strokeWidth: 0.6, fill: 'none' }
  const db = l.doubleBreasted
  const buttons = db
    ? [134, 172, 194].flatMap((y) => [
        [92.5, y],
        [110.5, y],
      ])
    : l.open
      ? []
      : [
          [100, 136],
          [100, 176],
          [100, 198],
        ]

  return (
    <svg className={`hs-fig ${className}`} viewBox="0 0 200 420" preserveAspectRatio="xMidYMax meet" role="img" aria-label={label} focusable="false">
      <g strokeLinecap="round" strokeLinejoin="round">
        {/* floor */}
        <ellipse cx="100" cy="401" rx="44" ry="3.2" fill={p.contour} opacity="0.14" />
        <path d="M30 401.5H170" stroke={p.contour} strokeWidth="0.5" opacity="0.4" />

        {/* shoes + trousers (beneath the coat) */}
        <path d={SHOES[l.trouser]} fill={p.shoe} stroke={p.contour} strokeWidth="0.6" />
        <path d={TROUSERS[l.trouser]} fill={p.trouser} stroke={p.trouserLine} strokeWidth="0.7" />
        <path d={CREASES[l.trouser]} stroke={p.trouserLine} strokeWidth="0.5" opacity="0.55" fill="none" />

        {/* low chignon, behind the head */}
        <ellipse cx="110.5" cy="54.5" rx="6.2" ry="5" fill={p.hair} stroke={p.contour} strokeWidth="0.5" />

        {/* the coat */}
        <path d={l.open ? BODY_OPEN : BODY_BELTED} fill={p.coat} stroke={p.line} strokeWidth="0.85" />
        <path d={HEM_STITCH} {...coatStroke} strokeDasharray="1.6 1.8" opacity="0.75" />
        <path d={l.open ? POCKETS_OPEN : POCKETS} fill={p.coat} stroke={p.line} strokeWidth="0.6" />
        <path d={l.collarUp ? COLLAR_UP : COLLAR} fill={p.coat} stroke={p.line} strokeWidth="0.7" />

        {/* what she wears beneath */}
        <path d={l.open ? V_OPEN : V_CLOSED} fill={p.inner} stroke={p.line} strokeWidth="0.6" />

        {/* neck + head */}
        <path d="M95 55 L95 72 Q100 75.5 105 72 L105 55 Z" fill={p.panel} stroke={p.contour} strokeWidth="0.6" />
        <Neckline inner={l.inner} open={l.open} p={p} />
        <ellipse cx="100" cy="43" rx="12" ry="15.5" fill={p.panel} stroke={p.contour} strokeWidth="0.7" />
        <path
          d="M88 47 C86 31 93 25.5 100 25.5 C107 25.5 114 31 112 47 C110.5 39 106 34.5 100 35 C94 34.5 89.5 39 88 47 Z"
          fill={p.hair}
          stroke={p.contour}
          strokeWidth="0.5"
        />
        <g fill={p.gold}>
          <circle cx="88.4" cy="50.5" r="1.3" />
          <circle cx="111.6" cy="50.5" r="1.3" />
        </g>

        {/* lapels, flap, epaulettes, seams */}
        <path d={LAPEL_L} fill={p.coat} stroke={p.line} strokeWidth="0.7" />
        <path d={LAPEL_R} fill={p.coat} stroke={p.line} strokeWidth="0.7" />
        <path d={NOTCHES} {...coatStroke} />
        {l.stormFlap && <path d={STORM_FLAP} {...coatStroke} />}
        {l.epaulettes ? (
          <>
            <path d={EPAULETTES} fill={p.coat} stroke={p.line} strokeWidth="0.6" />
            <g fill={p.gold}>
              <circle cx="82.6" cy="78.1" r="1.1" />
              <circle cx="117.4" cy="78.1" r="1.1" />
            </g>
          </>
        ) : (
          <path d={RAGLAN} {...coatStroke} opacity="0.7" />
        )}
        {!l.open && <path d={db ? 'M100.5 128.5 C102 190 103.5 250 105 307' : 'M100 128.5 V308'} {...coatStroke} />}
        {l.open && <path d="M87 130 C85 190 83 250 80.5 306.5 M113 130 C115 190 117 250 119.5 306.5" {...coatStroke} strokeWidth="0.75" />}

        {/* the belt */}
        {l.belt !== 'loose' && <path d={BELT} fill={p.coat} stroke={p.line} strokeWidth="0.65" />}
        {l.belt === 'buckle' && (
          <path d="M87.5 146.2 h9.4 v11.6 h-9.4 Z M92.2 146.2 V157.8" fill="none" stroke={p.gold} strokeWidth="0.8" />
        )}
        {l.belt === 'tied' && (
          <>
            <path d={BELT_TAILS} fill={p.coat} stroke={p.line} strokeWidth="0.6" />
            <path d={BELT_KNOT} fill={p.coat} stroke={p.line} strokeWidth="0.65" />
          </>
        )}
        {l.belt === 'loose' && <path d={BELT_LOOSE} fill={p.coat} stroke={p.line} strokeWidth="0.6" />}

        <g fill={p.gold}>
          {buttons.map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="1.6" />
          ))}
        </g>

        {/* sleeves, cuff straps and hands */}
        <path d={SLEEVE_L} fill={p.coat} stroke={p.line} strokeWidth="0.85" />
        <path d={SLEEVE_R} fill={p.coat} stroke={p.line} strokeWidth="0.85" />
        <path d={CUFFS} {...coatStroke} />
        <path d={HAND_L} fill={p.panel} stroke={p.contour} strokeWidth="0.6" />
        <path d={HAND_R} fill={p.panel} stroke={p.contour} strokeWidth="0.6" />
      </g>
    </svg>
  )
}
