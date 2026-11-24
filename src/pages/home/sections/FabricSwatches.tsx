/**
 * Drawn cloth for "Textures that speak" — five swatches rendered as SVG weaves, not photographs:
 * burgundy wool gabardine, an ecru cable knit, noir silk satin, camel herringbone wool and an
 * emerald jacquard. Each fills its tile (`preserveAspectRatio="xMidYMid slice"`), so the
 * shaped mask (pill · arch · circle · rect) crops it like a cut swatch.
 *
 * Decorative (aria-hidden): the tile's figcaption names the cloth. Pattern ids are static and
 * prefixed `hs-tex-` (each swatch renders once, on the home page).
 */

import type { JSX } from 'react'

export type FabricId = 'gabardine' | 'cable' | 'satin' | 'herringbone' | 'jacquard'

interface SwatchProps {
  w: number
  h: number
  className?: string
}

const SANS = { fontFamily: 'var(--font-sans)' }

/** Soft vertical drape folds so a flat weave reads as hanging cloth. */
function Folds({ id, dark = 'rgba(10,0,4,0.34)', light = 'rgba(255,236,226,0.08)' }: { id: string; dark?: string; light?: string }) {
  return (
    <linearGradient id={id} x1="0" y1="0" x2="1" y2="0.08">
      <stop offset="0" stopColor={dark} />
      <stop offset="0.14" stopColor="rgba(0,0,0,0)" />
      <stop offset="0.32" stopColor={light} />
      <stop offset="0.47" stopColor={dark} stopOpacity="0.6" />
      <stop offset="0.62" stopColor="rgba(0,0,0,0)" />
      <stop offset="0.8" stopColor={light} />
      <stop offset="1" stopColor={dark} />
    </linearGradient>
  )
}

/* I — Burgundy wool gabardine: the trench cloth. A steep 63° twill, a placket with gold topstitching. */
function Gabardine({ w, h, className }: SwatchProps) {
  const x = w * 0.72
  return (
    <svg className={className} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid slice" aria-hidden focusable="false">
      <defs>
        <pattern id="hs-tex-gab-warp" width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(27)">
          <path d="M0.5 0V3" stroke="rgba(255,226,218,0.11)" strokeWidth="0.8" />
        </pattern>
        <pattern id="hs-tex-gab-weft" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(27)">
          <path d="M2.5 0V5" stroke="rgba(10,0,4,0.3)" strokeWidth="1.1" />
        </pattern>
        <Folds id="hs-tex-gab-fold" />
      </defs>
      <rect width={w} height={h} fill="#5a1424" />
      <rect width={w} height={h} fill="url(#hs-tex-gab-warp)" />
      <rect width={w} height={h} fill="url(#hs-tex-gab-weft)" />
      {/* the front placket: a turned edge, two rows of gold topstitching, two tonal horn buttons */}
      <rect x={x} width={w - x} height={h} fill="rgba(10,0,4,0.12)" />
      <path d={`M${x} 0V${h}`} stroke="rgba(10,0,4,0.5)" strokeWidth="1.2" />
      <path d={`M${x - 6} 0V${h}M${x + 7} 0V${h}`} stroke="rgba(227,200,138,0.62)" strokeWidth="0.8" strokeDasharray="4 3" />
      {[h * 0.36, h * 0.66].map((y) => (
        <g key={y}>
          <circle cx={x + 22} cy={y} r="10.5" fill="#3a0d18" stroke="rgba(227,200,138,0.45)" strokeWidth="0.8" />
          <circle cx={x + 22} cy={y} r="7" fill="none" stroke="rgba(10,0,4,0.45)" strokeWidth="0.8" />
          <g fill="rgba(10,0,4,0.7)">
            <circle cx={x + 19.6} cy={y - 2.4} r="1.1" />
            <circle cx={x + 24.4} cy={y - 2.4} r="1.1" />
            <circle cx={x + 19.6} cy={y + 2.4} r="1.1" />
            <circle cx={x + 24.4} cy={y + 2.4} r="1.1" />
          </g>
        </g>
      ))}
      <rect width={w} height={h} fill="url(#hs-tex-gab-fold)" />
    </svg>
  )
}

/* II — Ecru merino cable knit: rope cables between knit-stitch ribs. */
function Cable({ w, h, className }: SwatchProps) {
  // One 60 × 44 repeat: rib | rope cable | rib. Strand P always crosses over Q (a rope cable);
  // P ends where Q begins in the next repeat, so the two strands run continuously down the column.
  const P = 'M22 0C22 14 38 30 38 44'
  const Q = 'M38 0C38 14 22 30 22 44'
  const ribs = Array.from({ length: 8 }, (_, i) => {
    const y = i * 5.5
    return `M2 ${y}l3 4 3-4M52 ${y}l3 4 3-4`
  }).join('')
  return (
    <svg className={className} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid slice" aria-hidden focusable="false">
      <defs>
        <pattern id="hs-tex-cable" width="60" height="44" patternUnits="userSpaceOnUse" patternTransform="translate(-4 0) scale(1.15)">
          <rect width="60" height="44" fill="#e4d6bc" />
          <rect x="11" width="38" height="44" fill="rgba(120,90,50,0.1)" />
          <path d="M10.5 0V44M49.5 0V44" stroke="rgba(110,80,40,0.32)" strokeWidth="2.2" />
          <path d={ribs} fill="none" stroke="rgba(110,80,40,0.38)" strokeWidth="1.1" strokeLinejoin="round" />
          <path d={ribs} fill="none" stroke="rgba(255,250,240,0.55)" strokeWidth="0.6" transform="translate(0 -0.8)" />
          <g fill="none" strokeLinecap="butt">
            <path d={Q} stroke="#c9b48e" strokeWidth="12" />
            <path d={Q} stroke="#e9dcc3" strokeWidth="8.5" />
            <path d={Q} stroke="rgba(110,80,40,0.35)" strokeWidth="1" strokeDasharray="2 2.4" />
            <path d={P} stroke="rgba(90,62,28,0.32)" strokeWidth="16" />
            <path d={P} stroke="#cdb994" strokeWidth="12" />
            <path d={P} stroke="#f1e7d4" strokeWidth="8.5" />
            <path d={P} stroke="rgba(255,252,246,0.75)" strokeWidth="2.4" transform="translate(-1.4 0)" />
            <path d={P} stroke="rgba(110,80,40,0.32)" strokeWidth="1" strokeDasharray="2 2.4" transform="translate(1.6 0)" />
          </g>
        </pattern>
        <Folds id="hs-tex-cable-fold" dark="rgba(90,62,28,0.24)" light="rgba(255,252,246,0.2)" />
      </defs>
      <rect width={w} height={h} fill="url(#hs-tex-cable)" />
      <rect width={w} height={h} fill="url(#hs-tex-cable-fold)" />
    </svg>
  )
}

/* III — Noir silk satin: a warp-faced weave, read entirely through its light. */
function Satin({ w, h, className }: SwatchProps) {
  return (
    <svg className={className} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid slice" aria-hidden focusable="false">
      <defs>
        <linearGradient id="hs-tex-satin-sheen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1d080e" />
          <stop offset="0.2" stopColor="#3b1520" />
          <stop offset="0.33" stopColor="#8f6060" />
          <stop offset="0.42" stopColor="#4a1b27" />
          <stop offset="0.57" stopColor="#1d080e" />
          <stop offset="0.72" stopColor="#552632" />
          <stop offset="0.8" stopColor="#a57c72" />
          <stop offset="0.87" stopColor="#4a1b27" />
          <stop offset="1" stopColor="#1d080e" />
        </linearGradient>
        <pattern id="hs-tex-satin-float" width="1.6" height="1.6" patternUnits="userSpaceOnUse" patternTransform="rotate(-8)">
          <path d="M0 0.4H1.6" stroke="rgba(255,240,232,0.05)" strokeWidth="0.5" />
        </pattern>
        <filter id="hs-tex-satin-soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>
      <rect width={w} height={h} fill="url(#hs-tex-satin-sheen)" />
      <g filter="url(#hs-tex-satin-soft)" fill="none" strokeLinecap="round">
        <path d={`M${-w * 0.1} ${h * 0.28}C${w * 0.3} ${h * 0.12} ${w * 0.55} ${h * 0.52} ${w * 1.1} ${h * 0.34}`} stroke="rgba(236,196,180,0.32)" strokeWidth="12" />
        <path d={`M${-w * 0.1} ${h * 0.5}C${w * 0.35} ${h * 0.36} ${w * 0.6} ${h * 0.74} ${w * 1.1} ${h * 0.58}`} stroke="rgba(8,0,3,0.5)" strokeWidth="18" />
        <path d={`M${-w * 0.1} ${h * 0.78}C${w * 0.3} ${h * 0.64} ${w * 0.62} ${h * 0.98} ${w * 1.1} ${h * 0.82}`} stroke="rgba(236,196,180,0.22)" strokeWidth="10" />
      </g>
      <rect width={w} height={h} fill="url(#hs-tex-satin-float)" />
    </svg>
  )
}

/* IV — Camel herringbone wool: broken twill chevrons, with the mill's selvedge along one edge. */
function Herringbone({ w, h, className }: SwatchProps) {
  const sx = w - 12
  return (
    <svg className={className} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid slice" aria-hidden focusable="false">
      <defs>
        <pattern id="hs-tex-hb" width="8" height="8" patternUnits="userSpaceOnUse">
          <path d="M0 4L4 0M0 8L4 4M4 0L8 4M4 4L8 8" stroke="rgba(70,42,16,0.34)" strokeWidth="1.5" strokeLinecap="square" />
          <path d="M0 5.4L4 1.4M4 1.4L8 5.4" stroke="rgba(255,238,210,0.16)" strokeWidth="0.7" />
        </pattern>
        <Folds id="hs-tex-hb-fold" dark="rgba(60,34,12,0.32)" light="rgba(255,240,215,0.12)" />
      </defs>
      <rect width={w} height={h} fill="#b08d63" />
      <rect width={sx} height={h} fill="url(#hs-tex-hb)" />
      {/* selvedge: a tighter, darker edge with its woven legend and pin holes from the stenter */}
      <rect x={sx} width="12" height={h} fill="#9c7a51" />
      <path d={`M${sx} 0V${h}`} stroke="rgba(60,34,12,0.4)" strokeWidth="0.8" />
      <g fill="rgba(60,34,12,0.5)">
        {Array.from({ length: Math.floor(h / 22) }, (_, i) => (
          <circle key={i} cx={sx + 9} cy={11 + i * 22} r="0.9" />
        ))}
      </g>
      <text
        x={sx + 4.5}
        y={h * 0.12}
        transform={`rotate(90 ${sx + 4.5} ${h * 0.12})`}
        fontSize="5.2"
        letterSpacing="2.2"
        fill="rgba(255,240,215,0.78)"
        style={SANS}
      >
        FEMMORA · PURE WOOL · HERRINGBONE · 340 G
      </text>
      <rect width={w} height={h} fill="url(#hs-tex-hb-fold)" />
    </svg>
  )
}

/* V — Emerald jacquard: an ogee medallion woven tone-on-tone — pattern without print. */
function Jacquard({ w, h, className }: SwatchProps) {
  const petal = 'M20 28C17 23 17 19 20 15.5C23 19 23 23 20 28Z'
  return (
    <svg className={className} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid slice" aria-hidden focusable="false">
      <defs>
        <pattern id="hs-tex-jac-ground" width="2" height="2" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <path d="M0 0.5H2" stroke="rgba(0,0,0,0.14)" strokeWidth="0.6" />
        </pattern>
        <pattern id="hs-tex-jac" width="40" height="56" patternUnits="userSpaceOnUse" patternTransform="translate(3 0) scale(1.1)">
          {/* the ogee lattice: each repeat is one medallion, touching its neighbours at the edges */}
          <path
            d="M20 0C28 8 40 16 40 28C40 40 28 48 20 56M20 0C12 8 0 16 0 28C0 40 12 48 20 56"
            fill="none"
            stroke="rgba(0,0,0,0.22)"
            strokeWidth="2.4"
          />
          <path
            d="M20 0C28 8 40 16 40 28C40 40 28 48 20 56M20 0C12 8 0 16 0 28C0 40 12 48 20 56"
            fill="none"
            stroke="rgba(241,223,178,0.17)"
            strokeWidth="1.1"
          />
          {/* the four-petal flower, its floats catching the light */}
          <g fill="rgba(241,223,178,0.15)" stroke="rgba(241,223,178,0.12)" strokeWidth="0.5">
            {[0, 90, 180, 270].map((r) => (
              <path key={r} d={petal} transform={`rotate(${r} 20 28)`} />
            ))}
          </g>
          <circle cx="20" cy="28" r="2" fill="#1f4d3a" stroke="rgba(241,223,178,0.3)" strokeWidth="0.6" />
          <g fill="rgba(241,223,178,0.22)">
            <circle cx="20" cy="0" r="1.4" />
            <circle cx="20" cy="56" r="1.4" />
            <circle cx="0" cy="28" r="1.4" />
            <circle cx="40" cy="28" r="1.4" />
          </g>
        </pattern>
        <Folds id="hs-tex-jac-fold" dark="rgba(0,10,6,0.36)" light="rgba(241,223,178,0.07)" />
      </defs>
      <rect width={w} height={h} fill="#1f4d3a" />
      <rect width={w} height={h} fill="url(#hs-tex-jac-ground)" />
      <rect width={w} height={h} fill="url(#hs-tex-jac)" />
      <rect width={w} height={h} fill="url(#hs-tex-jac-fold)" />
    </svg>
  )
}

const SWATCHES = {
  gabardine: Gabardine,
  cable: Cable,
  satin: Satin,
  herringbone: Herringbone,
  jacquard: Jacquard,
} satisfies Record<FabricId, (p: SwatchProps) => JSX.Element>

export function FabricSwatch({ id, ...rest }: SwatchProps & { id: FabricId }) {
  const S = SWATCHES[id]
  return <S {...rest} />
}
