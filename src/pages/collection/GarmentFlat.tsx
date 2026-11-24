import { useId, type ReactNode } from 'react'
import type { GarmentKind, Texture } from '../../data/products'
import './GarmentFlat.css'

/* ==========================================================================
   GarmentFlat — gold-hairline "technical flats" drawn in SVG.
   Every silhouette hangs from a gold hanger (the rack motif), is filled with
   the selected colour, and carries gold stitching, buttons and a woven/knitted
   surface (gabardine twill, cable knit, damask, foulard…).
   viewBox 0 0 300 400 — centre-front at x = 150.
   ========================================================================== */

type Pt = [number, number]
type Seg = [number, number] | [number, number, number, number] | [number, number, number, number, number, number]

const mx = (x: number) => +(300 - x).toFixed(2)

/** Builds a closed, left/right-symmetric path from the left half (centre → around → centre). */
function sym(start: Pt, segs: Seg[]): string {
  let d = `M${start[0]} ${start[1]}`
  const pts: Pt[] = [start]
  for (const s of segs) {
    if (s.length === 2) d += ` L${s[0]} ${s[1]}`
    else if (s.length === 4) d += ` Q${s[0]} ${s[1]} ${s[2]} ${s[3]}`
    else d += ` C${s[0]} ${s[1]} ${s[2]} ${s[3]} ${s[4]} ${s[5]}`
    pts.push([s[s.length - 2], s[s.length - 1]])
  }
  for (let i = segs.length - 1; i >= 0; i--) {
    const s = segs[i]
    const [px, py] = pts[i]
    if (s.length === 2) d += ` L${mx(px)} ${py}`
    else if (s.length === 4) d += ` Q${mx(s[0])} ${s[1]} ${mx(px)} ${py}`
    else d += ` C${mx(s[2])} ${s[3]} ${mx(s[0])} ${s[1]} ${mx(px)} ${py}`
  }
  return `${d} Z`
}

interface Ctx {
  fill: string
  /** woven / knitted surface overlay (pattern url) */
  tex?: string
  /** rib-knit overlay for knit bands (pattern url) */
  rib?: string
  ink: string
  stitch: string
  shade: string
  sheen: string
  under: string
  gold: string
  goldDeep: string
  pearl: string
  sw: number
  mini: boolean
  glossy: boolean
}

function hexLum(hex: string) {
  const h = hex.replace('#', '')
  const n = parseInt(h.length === 3 ? h.replace(/(.)/g, '$1$1') : h, 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  const lin = (v8: number) => {
    const v = v8 / 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

/* ---------- primitives ---------- */

/** A fabric panel: colour fill, surface overlay, gold outline. */
function Panel({ d, c, tone = 'base' }: { d: string; c: Ctx; tone?: 'base' | 'facing' | 'under' | 'rib' }) {
  const fill = tone === 'under' ? c.under : c.fill
  const overlay = tone === 'rib' ? c.rib ?? c.tex : tone === 'under' ? undefined : c.tex
  return (
    <>
      <path className="col-gf__fill" d={d} fill={fill} />
      {overlay && <path className="col-gf__fill" d={d} fill={overlay} />}
      {tone === 'facing' && <path className="col-gf__fill" d={d} fill={c.sheen} />}
      <path
        className="col-gf__ink"
        d={d}
        fill="none"
        stroke={c.ink}
        strokeWidth={c.sw}
        strokeLinejoin="round"
        strokeLinecap="round"
        pathLength={1}
      />
    </>
  )
}

function Line({ d, c, w = 1, o = 1, gold = false }: { d: string; c: Ctx; w?: number; o?: number; gold?: boolean }) {
  return (
    <path
      className="col-gf__ink"
      d={d}
      fill="none"
      stroke={gold ? c.gold : c.ink}
      strokeWidth={c.sw * w}
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={o}
      pathLength={1}
    />
  )
}

function Stitch({ d, c, o = 0.9 }: { d: string; c: Ctx; o?: number }) {
  if (c.mini) return null
  return (
    <path
      className="col-gf__stitch"
      d={d}
      fill="none"
      stroke={c.stitch}
      strokeWidth={0.75}
      strokeDasharray="2.2 2.4"
      strokeLinecap="round"
      strokeOpacity={o}
    />
  )
}

function Shade({ d, c, o = 1 }: { d: string; c: Ctx; o?: number }) {
  return <path className="col-gf__fill" d={d} fill={c.shade} fillOpacity={o} />
}

function Sheen({ paths, c }: { paths: string[]; c: Ctx }) {
  if (!c.glossy || c.mini) return null
  return (
    <g className="col-gf__fill" fill="none" stroke="#fff" strokeLinecap="round">
      {paths.map((d, i) => (
        <g key={i}>
          <path d={d} strokeWidth={14} opacity={0.035} />
          <path d={d} strokeWidth={4} opacity={0.09} />
        </g>
      ))}
    </g>
  )
}

/** Gold-tone (or mother-of-pearl-effect) button. */
function Btn({ x, y, r = 3, c, pearl = false }: { x: number; y: number; r?: number; c: Ctx; pearl?: boolean }) {
  return (
    <g className="col-gf__fill">
      <circle cx={x} cy={y} r={r} fill={pearl ? c.pearl : c.gold} stroke={pearl ? c.ink : c.goldDeep} strokeWidth={0.6} />
      {!c.mini && pearl && <circle cx={x} cy={y} r={r * 0.45} fill="none" stroke={c.ink} strokeWidth={0.35} opacity={0.6} />}
      {!c.mini && <circle cx={x - r * 0.3} cy={y - r * 0.3} r={r * 0.35} fill="#fff" opacity={pearl ? 0.7 : 0.45} />}
    </g>
  )
}

/** Gold-tone buckle frame with a centre bar. */
function Buckle({ x, y, w, h, c, bar = 'v' }: { x: number; y: number; w: number; h: number; c: Ctx; bar?: 'v' | 'h' }) {
  const d = bar === 'v' ? `M${x + w / 2} ${y} L${x + w / 2} ${y + h}` : `M${x} ${y + h / 2} L${x + w} ${y + h / 2}`
  return (
    <>
      <rect
        className="col-gf__ink"
        x={x}
        y={y}
        width={w}
        height={h}
        rx={Math.min(w, h) * 0.14}
        fill="none"
        stroke={c.gold}
        strokeWidth={c.sw * 2}
        pathLength={1}
      />
      <path className="col-gf__ink" d={d} stroke={c.gold} strokeWidth={c.sw * 1.3} fill="none" pathLength={1} />
    </>
  )
}

function Mirror({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <g transform="matrix(-1 0 0 1 300 0)">{children}</g>
    </>
  )
}

/**
 * A two-strand cable (rope) running down a knit. Every crossing is a left-cross:
 * the strand travelling left→right passes over, the other is broken where it dives under.
 */
function Cable({ cx, w, y0, y1, period, c }: { cx: number; w: number; y0: number; y1: number; period: number; c: Ctx }) {
  if (c.mini) return null
  const xl = cx - w / 2
  const xr = cx + w / 2
  const h = period / 2
  const over: string[] = []
  const under: string[] = []
  for (let y = y0; y + h <= y1 + 0.01; y += h) {
    const m = y + h / 2
    over.push(`M${xl} ${y} C${xl} ${m} ${xr} ${m} ${xr} ${y + h}`)
    under.push(`M${xr} ${y} C${xr} ${m} ${xl} ${m} ${xl} ${y + h}`)
  }
  return (
    <g className="col-gf__stitch" fill="none" stroke={c.stitch} strokeLinecap="round">
      <rect x={xl - 1.5} y={y0} width={w + 3} height={y1 - y0} fill={c.sheen} stroke="none" />
      <path d={`M${xl - 4} ${y0} L${xl - 4} ${y1} M${xr + 4} ${y0} L${xr + 4} ${y1}`} strokeWidth={0.7} strokeDasharray="0.6 2.2" strokeOpacity={0.85} />
      {under.map((d) => (
        <path key={`u${d}`} d={d} pathLength={1} strokeDasharray="0.34 0.32 0.34" strokeWidth={0.9} strokeOpacity={0.7} />
      ))}
      {over.map((d) => (
        <path key={`o${d}`} d={d} strokeWidth={0.95} />
      ))}
    </g>
  )
}

/* ---------- hangers ---------- */

function ShoulderHanger({ c }: { c: Ctx }) {
  return (
    <g className="col-gf__hanger" fill="none" stroke={c.gold} strokeLinecap="round" strokeLinejoin="round">
      <path className="col-gf__ink" d="M150 36 L150 25 C150 15 160 11 165 16 C169 21 166 27 160 28" strokeWidth={c.sw * 1.3} pathLength={1} />
      <path className="col-gf__ink" d="M150 36 L98 60 M150 36 L202 60" strokeWidth={c.sw * 1.6} pathLength={1} />
    </g>
  )
}

function BarHanger({ c, clips = true }: { c: Ctx; clips?: boolean }) {
  return (
    <g className="col-gf__hanger" fill="none" stroke={c.gold} strokeLinecap="round" strokeLinejoin="round">
      <path className="col-gf__ink" d="M150 30 L150 20 C150 10 160 6 165 11 C169 16 166 22 160 23" strokeWidth={c.sw * 1.3} pathLength={1} />
      <path className="col-gf__ink" d="M150 30 L96 44 L204 44 Z" strokeWidth={c.sw * 1.4} pathLength={1} />
      {clips && <path className="col-gf__ink" d="M110 44 L110 58 M190 44 L190 58" strokeWidth={c.sw * 2.4} pathLength={1} />}
    </g>
  )
}

function Hook({ c }: { c: Ctx }) {
  return (
    <g className="col-gf__hanger" fill="none" stroke={c.gold} strokeLinecap="round" strokeLinejoin="round">
      <circle className="col-gf__ink" cx={150} cy={12} r={4} strokeWidth={c.sw * 1.2} pathLength={1} />
      <path className="col-gf__ink" d="M150 16 L150 54 Q150 64 158 62" strokeWidth={c.sw * 1.8} pathLength={1} />
    </g>
  )
}

/* ==========================================================================
   Silhouettes
   ========================================================================== */

/* — Trench coat: double-breasted, storm flap, epaulettes, belted, buckled cuffs — */
const TRENCH_BODY = sym(
  [150, 50],
  [
    [140, 50, 130, 45],
    [88, 62],
    [93, 98, 92, 136],
    [97, 204],
    [74, 388],
    [112, 393, 150, 393],
  ],
)
const TRENCH_SLEEVE = 'M90 60 Q62 68 56 108 L48 290 L78 294 L86 172 Q90 150 94 136 Z'

function Trench({ c }: { c: Ctx }) {
  return (
    <>
      <ShoulderHanger c={c} />
      <Mirror>
        <Panel d={TRENCH_SLEEVE} c={c} />
        <Shade d="M86 172 L78 294 L69 293 L78 170 Q82 148 92 136 Z" c={c} o={0.8} />
        <Stitch d="M49 283 L78 287" c={c} />
        {/* buckled cuff strap */}
        <Panel d="M50.5 256 L81 260 L80.5 271 L49.5 267 Z" c={c} tone="facing" />
        <Buckle x={55} y={256.5} w={8} h={11.5} c={c} />
      </Mirror>
      <Panel d={TRENCH_BODY} c={c} />
      <Mirror>
        <Shade d="M92 138 L97 204 L76 386 L92 388 L110 204 L106 142 Z" c={c} />
        <Stitch d="M78 381 Q114 386 150 386" c={c} />
        <Stitch d="M79 375 Q114 380 150 380" c={c} o={0.55} />
        {/* slanted flap pockets */}
        <Panel d="M100 250 L110 248 L122 290 L112 292 Z" c={c} tone="facing" />
        <Stitch d="M103.5 254 L114.5 288" c={c} o={0.6} />
      </Mirror>
      {/* what is worn beneath, seen in the open neck */}
      <path className="col-gf__fill" d="M135 47 Q150 53 165 47 L186 152 Z" fill={c.under} />
      <path className="col-gf__fill" d="M135 47 Q150 53 165 47 L186 152 Z" fill={c.shade} fillOpacity={0.4} />
      {/* storm flap — the gun flap on the right shoulder */}
      <Panel d="M126 51 L90 63 Q95 94 97 122 L133 116 Z" c={c} tone="facing" />
      <Stitch d="M95 70 Q99 96 100.5 117.5 L130 112.5" c={c} o={0.75} />
      <Btn x={102} y={116} r={2.3} c={c} />
      {/* epaulettes */}
      <Mirror>
        <Panel d="M128 50 L93 64 L95.5 71 L130 57 Z" c={c} tone="facing" />
        <Btn x={99.5} y={66.5} r={2.1} c={c} />
      </Mirror>
      {/* under lapel (left front) */}
      <Panel d="M165 47 L187 56 L190 80 L180 85 L203 98 Q197 128 184 150 Q172 96 165 47 Z" c={c} tone="facing" />
      <Stitch d="M199 101 Q193 125 183 144 M186.5 59 L188.5 78" c={c} />
      {/* top lapel (right front, crossing over) */}
      <Panel d="M135 47 L113 56 L110 80 L120 85 L97 98 Q126 134 184 150 Q152 94 135 47 Z" c={c} tone="facing" />
      <Stitch d="M101.5 100.5 Q128 131 174 145.5 M113.5 59 L111.5 78" c={c} />
      {/* double-breasted front edge */}
      <Line d="M184 150 L188 392" c={c} />
      <Stitch d="M179.5 157 L183.5 387" c={c} o={0.6} />
      {/* belt, loops, buckle */}
      <Panel d="M96 203 L204 203 L204 217 L96 217 Z" c={c} tone="facing" />
      <Stitch d="M98 206 L202 206 M98 214 L202 214" c={c} o={0.6} />
      <Mirror>
        <Panel d="M101 198.5 L108.5 198.5 L108.5 221.5 L101 221.5 Z" c={c} tone="facing" />
      </Mirror>
      <Panel d="M162 204.5 L178 204.5 L183 210 L178 215.5 L162 215.5 Z" c={c} tone="facing" />
      <Buckle x={139} y={200.5} w={22} h={19} c={c} />
      {[168, 190, 238, 264].map((y) => (
        <g key={y}>
          <Btn x={128} y={y} r={3.3} c={c} />
          <Btn x={172} y={y} r={3.3} c={c} />
        </g>
      ))}
      <Sheen c={c} paths={['M118 236 Q114 300 110 370', 'M66 120 Q60 190 56 250']} />
    </>
  )
}

/* — Long coat: single-breasted, wide notch lapel, long-line — */
const COAT_BODY = sym(
  [150, 50],
  [
    [140, 50, 128, 45],
    [88, 62],
    [92, 98, 92, 134],
    [94, 196],
    [86, 300],
    [78, 384],
    [114, 389, 150, 389],
  ],
)

function LongCoat({ c }: { c: Ctx }) {
  return (
    <>
      <ShoulderHanger c={c} />
      <Mirror>
        <Panel d="M90 60 Q64 68 58 106 L50 288 L78 292 L86 170 Q90 148 94 134 Z" c={c} />
        <Shade d="M86 170 L78 292 L69 291 L78 168 Q82 146 92 134 Z" c={c} o={0.8} />
        <Stitch d="M51 278 L79 282" c={c} />
      </Mirror>
      <Panel d={COAT_BODY} c={c} />
      <path className="col-gf__fill" d="M137 49 Q150 56 163 49 L150 200 Z" fill={c.under} />
      <Mirror>
        <Shade d="M94 136 L96 196 L88 300 L80 386 L96 387 L104 300 L110 196 L106 140 Z" c={c} />
        <Panel d="M135 48 L120 60 L121 92 L112 96 L104 104 Q122 160 150 198 Q138 110 135 48 Z" c={c} tone="facing" />
        <Stitch d="M108 108 Q124 156 146 190 M123 64 L123 89" c={c} />
        <Panel d="M101 262 L131 259 L131 271 L102 274 Z" c={c} tone="facing" />
        <Stitch d="M83 378 Q116 383 150 383" c={c} />
      </Mirror>
      <Line d="M164 132 L186 128" c={c} w={1.2} />
      <Line d="M150 198 L150 389" c={c} />
      <Btn x={150} y={214} r={3.8} c={c} />
      <Btn x={150} y={252} r={3.8} c={c} />
      <Sheen c={c} paths={['M124 230 Q118 300 114 370']} />
    </>
  )
}

/* — Blazer (notch lapel, single gold button) — */
const BLAZER_BODY = sym(
  [150, 52],
  [
    [140, 51, 130, 47],
    [92, 62],
    [96, 96, 96, 128],
    [95, 196],
    [101, 214, 99, 234],
    [94, 290],
    [122, 297, 150, 300],
  ],
)
const BLAZER_SLEEVE = 'M94 60 Q68 66 63 102 L57 268 L84 271 L90 162 Q94 142 98 128 Z'

function Blazer({ c }: { c: Ctx }) {
  return (
    <>
      <ShoulderHanger c={c} />
      <Mirror>
        <Panel d={BLAZER_SLEEVE} c={c} />
        <Shade d="M90 162 L84 271 L75 270 L82 160 Q86 140 96 128 Z" c={c} o={0.8} />
        <Stitch d="M58 256 L84 259" c={c} />
        {[64, 70, 76].map((x) => (
          <Btn key={x} x={x} y={262} r={1.5} c={c} />
        ))}
      </Mirror>
      <Panel d={BLAZER_BODY} c={c} />
      {/* shirt beneath */}
      <path className="col-gf__fill" d="M137 50 Q150 57 163 50 L150 198 Z" fill={c.under} />
      <Mirror>
        <Shade d="M98 130 L96 196 L101 232 L96 290 L110 292 L114 232 L110 196 L108 140 Z" c={c} />
        <Panel d="M136 50 L124 60 L125 86 L118 89 L112 95 Q124 150 150 196 Q139 118 136 50 Z" c={c} tone="facing" />
        <Stitch d="M127 64 L127 84 M116 98 Q127 146 146 186" c={c} />
        <Panel d="M102 238 L134 235 L134 246 L103 249 Z" c={c} tone="facing" />
        <Stitch d="M98 284 Q122 290 148 292" c={c} />
        <Stitch d="M120 140 L118 232" c={c} o={0.4} />
      </Mirror>
      <Line d="M164 122 L186 118" c={c} w={1.2} />
      <Line d="M150 200 L150 297" c={c} />
      <Btn x={150} y={204} r={3.8} c={c} />
      <Sheen c={c} paths={['M126 110 Q120 180 118 250', 'M70 110 Q64 180 63 240']} />
    </>
  )
}

/* — Equestrian (hacking) blazer: high stance, three crest buttons, flared skirt — */
const RIDING_BODY = sym(
  [150, 52],
  [
    [140, 51, 130, 47],
    [94, 62],
    [98, 96, 97, 128],
    [102, 198],
    [96, 252, 80, 314],
    [116, 320, 150, 318],
  ],
)

function RidingBlazer({ c }: { c: Ctx }) {
  return (
    <>
      <ShoulderHanger c={c} />
      <Mirror>
        <Panel d={BLAZER_SLEEVE} c={c} />
        <Shade d="M90 162 L84 271 L75 270 L82 160 Q86 140 96 128 Z" c={c} o={0.8} />
        <Stitch d="M58 256 L84 259" c={c} />
      </Mirror>
      <Panel d={RIDING_BODY} c={c} />
      <path className="col-gf__fill" d="M138 51 Q150 57 162 51 L150 142 Z" fill={c.under} />
      <Mirror>
        <Shade d="M99 130 L103 198 L98 250 L84 312 L100 314 L112 250 L116 198 L110 140 Z" c={c} />
        <Panel d="M136 50 L125 60 L126 80 L119 83 L114 88 Q128 116 150 142 Q138 100 136 50 Z" c={c} tone="facing" />
        <Stitch d="M118 92 Q130 114 146 134" c={c} />
        {/* slanted hacking pocket */}
        <Panel d="M100 238 L131 231 L132 241 L101 248 Z" c={c} tone="facing" />
        <Stitch d="M120 134 Q124 200 116 300" c={c} o={0.45} />
        <Stitch d="M86 306 Q118 313 148 312" c={c} />
      </Mirror>
      {/* ticket pocket */}
      <Panel d="M168 214 L186 210 L186.5 217 L168.5 221 Z" c={c} tone="facing" />
      <Line d="M150 146 L150 316" c={c} />
      {[150, 180, 210].map((y) => (
        <Btn key={y} x={150} y={y} r={3.8} c={c} />
      ))}
      <Sheen c={c} paths={['M126 120 Q122 180 118 240']} />
    </>
  )
}

/* — Cable knits: drop shoulder, ribbed bands — */
const CREW_BODY = sym(
  [150, 58],
  [
    [140, 58, 131, 51],
    [96, 62],
    [90, 86],
    [94, 262],
    [150, 262],
  ],
)
const CARDI_BODY = sym(
  [150, 54],
  [
    [141, 54, 131, 49],
    [96, 62],
    [90, 86],
    [94, 262],
    [150, 262],
  ],
)
const KNIT_SLEEVE = 'M96 62 Q70 66 62 100 L50 248 L78 252 L90 140 L90 86 Z'
const KNIT_HEM = 'M95 262 L205 262 L203 288 L97 288 Z'

function KnitSleeves({ c }: { c: Ctx }) {
  return (
    <Mirror>
      <Panel d={KNIT_SLEEVE} c={c} />
      <Shade d="M90 140 L78 252 L70 251 L84 142 Z" c={c} o={0.7} />
      <Panel d="M50 248 L78 252 L77 276 L51 272 Z" c={c} tone="rib" />
      <Line d="M96 62 Q92 74 90 86" c={c} o={0.5} />
    </Mirror>
  )
}

function CableCrew({ c }: { c: Ctx }) {
  return (
    <>
      <ShoulderHanger c={c} />
      <KnitSleeves c={c} />
      <Panel d={CREW_BODY} c={c} />
      <Mirror>
        <Shade d="M91 90 L94 262 L106 262 L103 96 Z" c={c} o={0.8} />
      </Mirror>
      <Cable cx={150} w={18} y0={72} y1={258} period={26} c={c} />
      <Cable cx={118} w={10} y0={80} y1={258} period={16} c={c} />
      <Cable cx={182} w={10} y0={80} y1={258} period={16} c={c} />
      <Panel d={KNIT_HEM} c={c} tone="rib" />
      {/* crew neck: inside back neck, then the ribbed front band */}
      <path className="col-gf__fill" d="M134 49 Q150 43 166 49 Q150 55 134 49 Z" fill={c.shade} />
      <Panel d="M128 50 Q150 70 172 50 L165 47 Q150 60 135 47 Z" c={c} tone="rib" />
    </>
  )
}

function CableCardigan({ c }: { c: Ctx }) {
  return (
    <>
      <ShoulderHanger c={c} />
      <KnitSleeves c={c} />
      <Panel d={CARDI_BODY} c={c} />
      <path className="col-gf__fill" d="M135 49 Q150 54 165 49 L150 146 Z" fill={c.under} />
      <path className="col-gf__fill" d="M135 49 Q150 54 165 49 L150 146 Z" fill={c.shade} fillOpacity={0.3} />
      <Mirror>
        <Shade d="M91 90 L94 262 L106 262 L103 96 Z" c={c} o={0.8} />
        {/* patch pocket with ribbed top */}
        <Panel d="M99 210 L121 210 L121 240 L99 240 Z" c={c} />
        <Panel d="M99 210 L121 210 L121 216 L99 216 Z" c={c} tone="rib" />
        {/* ribbed V band */}
        <Panel d="M127 50 L144 152 L150 152 L150 141 L136 49 Z" c={c} tone="rib" />
      </Mirror>
      <Cable cx={132} w={10} y0={132} y1={258} period={16} c={c} />
      <Cable cx={168} w={10} y0={132} y1={258} period={16} c={c} />
      <Panel d={KNIT_HEM} c={c} tone="rib" />
      <Panel d="M144 150 L156 150 L156 288 L144 288 Z" c={c} tone="rib" />
      <Line d="M150 152 L150 288" c={c} o={0.5} />
      {[160, 184, 208, 232, 256].map((y) => (
        <Btn key={y} x={150} y={y} r={3} c={c} />
      ))}
    </>
  )
}

/* — Shirts: silk (open point collar, concealed placket) and poplin (classic collar, pearl buttons) — */
const SHIRT_BODY = sym(
  [150, 54],
  [
    [141, 54, 133, 48],
    [98, 62],
    [102, 96, 100, 128],
    [98, 236],
    [98, 254],
    [110, 262, 124, 262],
    [140, 264, 150, 274],
  ],
)
const SHIRT_SLEEVE = 'M98 62 Q70 68 64 108 Q54 170 56 228 Q58 240 66 244 L88 246 Q96 236 94 200 Q94 160 100 130 Z'

function ShirtBase({ c, poplin = false }: { c: Ctx; poplin?: boolean }) {
  return (
    <>
      <ShoulderHanger c={c} />
      <Mirror>
        <Panel d={SHIRT_SLEEVE} c={c} />
        <Shade d="M94 200 Q96 236 88 246 L78 245 Q86 228 86 196 Q86 160 96 132 L100 130 Q94 160 94 200 Z" c={c} o={0.8} />
        {poplin ? (
          <>
            <Panel d="M65 244 L88 246 L88 262 L64 260 Z" c={c} tone="facing" />
            <Btn x={82} y={253} r={1.8} c={c} pearl />
          </>
        ) : (
          <>
            <Panel d="M65 244 L88 246 L88 270 L64 268 Z" c={c} tone="facing" />
            <Btn x={82} y={252} r={1.7} c={c} />
            <Btn x={82} y={262} r={1.7} c={c} />
          </>
        )}
      </Mirror>
      <Panel d={SHIRT_BODY} c={c} />
      {poplin ? (
        <path className="col-gf__fill" d="M140 51 L150 66 L160 51 Q150 55 140 51 Z" fill={c.shade} />
      ) : (
        <path className="col-gf__fill" d="M136 52 L150 94 L164 52 Q150 58 136 52 Z" fill={c.shade} />
      )}
      <Mirror>
        <Shade d="M100 130 L98 236 L98 254 L110 260 L110 236 L108 138 Z" c={c} />
        <Stitch d="M101 250 Q112 257 124 257 Q140 259 148 268" c={c} />
        <Stitch d="M100 66 Q116 72 132 66" c={c} o={0.5} />
        {poplin ? (
          <>
            <Panel d="M134 48 L120 56 L124 79 L148 66 Q141 58 134 48 Z" c={c} tone="facing" />
            <Stitch d="M123 59 L126 76" c={c} />
          </>
        ) : (
          <>
            <Panel d="M133 48 L118 56 L127 86 L147 72 Q140 60 133 48 Z" c={c} tone="facing" />
            <Stitch d="M121 59 L129 81" c={c} />
          </>
        )}
      </Mirror>
      {poplin ? (
        <>
          <Line d="M146 68 L146 270 M154 68 L154 268" c={c} o={0.9} />
          {[72, 104, 136, 168, 200, 232].map((y) => (
            <Btn key={y} x={150} y={y} r={2.3} c={c} pearl />
          ))}
          {/* chest pocket */}
          <Panel d="M164 128 L186 128 L186 152 Q175 158 164 152 Z" c={c} />
          <Stitch d="M166 132 L184 132" c={c} o={0.6} />
        </>
      ) : (
        <>
          <Line d="M146 94 L146 270 M154 94 L154 268" c={c} o={0.9} />
          <Stitch d="M150 100 L150 262" c={c} o={0.5} />
        </>
      )}
      <Sheen c={c} paths={['M70 112 Q58 170 62 232', 'M124 120 Q120 180 122 250', 'M230 112 Q240 170 236 226']} />
    </>
  )
}

const SilkShirt = ({ c }: { c: Ctx }) => <ShirtBase c={c} />
const PoplinShirt = ({ c }: { c: Ctx }) => <ShirtBase c={c} poplin />

/* — Flat-front trouser (concealed elastic back, pressed crease) — */
const TROUSER_BODY = sym(
  [150, 58],
  [
    [104, 58],
    [101, 122],
    [104, 386],
    [146, 386],
    [150, 168],
  ],
)

function Trouser({ c }: { c: Ctx }) {
  return (
    <>
      <BarHanger c={c} />
      <Panel d={TROUSER_BODY} c={c} />
      <Mirror>
        <Shade d="M150 168 L146 386 L134 386 L140 176 Z" c={c} />
        <Line d="M104 74 L150 74" c={c} />
        <Line d="M124 74 L103 114" c={c} />
        <Stitch d="M127 77 L106 116" c={c} o={0.6} />
        <path className="col-gf__ink" d="M125 116 L125 384" stroke={c.ink} strokeWidth={c.sw * 0.7} opacity={0.55} fill="none" pathLength={1} />
        <Stitch d="M106 379 L144 379" c={c} />
        {/* concealed elastic back — shirring hint at the waistband sides */}
        <Stitch d="M106 62 L106 71 M109 62 L109 71 M112 62 L112 71" c={c} o={0.7} />
        <rect className="col-gf__ink" x={115} y={56} width={4} height={20} fill="none" stroke={c.ink} strokeWidth={c.sw * 0.8} pathLength={1} />
      </Mirror>
      <Stitch d="M158 76 L158 138 Q158 150 150 154" c={c} />
      <Btn x={150} y={66} r={2.6} c={c} />
      <Sheen c={c} paths={['M118 140 Q116 260 118 370']} />
    </>
  )
}

/* — Wide-leg pleated trouser (high rise, double pleats) — */
const WIDE_BODY = sym(
  [150, 48],
  [
    [106, 48],
    [102, 112],
    [90, 250, 72, 386],
    [146, 386],
    [150, 176],
  ],
)

function WideTrouser({ c }: { c: Ctx }) {
  return (
    <>
      <BarHanger c={c} />
      <Panel d={WIDE_BODY} c={c} />
      <Mirror>
        <Shade d="M150 176 L146 386 L128 386 L138 184 Z" c={c} />
        <Shade d="M102 112 Q90 250 72 386 L86 386 Q100 250 108 120 Z" c={c} o={0.6} />
        <Line d="M104 68 L150 68" c={c} />
        <Line d="M126 68 Q125 100 122 150" c={c} />
        <Line d="M136 68 Q136 90 134 118" c={c} o={0.8} />
        <path className="col-gf__ink" d="M122 150 L108 384" stroke={c.ink} strokeWidth={c.sw * 0.7} opacity={0.5} fill="none" pathLength={1} />
        <Stitch d="M105 76 L103 122" c={c} o={0.7} />
        <Stitch d="M76 379 L144 379" c={c} />
      </Mirror>
      <Panel d="M150 48 L170 48 L170 68 L150 68 Z" c={c} tone="facing" />
      <Btn x={163} y={58} r={2.8} c={c} />
      <Stitch d="M156 70 L156 140 Q156 152 150 158" c={c} />
      <Sheen c={c} paths={['M116 160 Q106 270 96 370']} />
    </>
  )
}

/* — Structured kurta (mandarin collar, gold-button placket, side slits) — */
const KURTA_BODY = sym(
  [150, 58],
  [
    [142, 58, 134, 53],
    [96, 66],
    [100, 98, 98, 128],
    [93, 250],
    [85, 364],
    [118, 369, 150, 369],
  ],
)
const KURTA_SLEEVE = 'M98 64 Q72 72 66 108 L56 262 L81 265 L88 162 Q92 142 100 130 Z'

function Kurta({ c }: { c: Ctx }) {
  return (
    <>
      <ShoulderHanger c={c} />
      <Mirror>
        <Panel d={KURTA_SLEEVE} c={c} />
        <Shade d="M88 162 L81 265 L72 264 L80 160 Q84 140 94 128 Z" c={c} o={0.8} />
        <Stitch d="M57 251 L82 254" c={c} />
      </Mirror>
      <Panel d={KURTA_BODY} c={c} />
      <Mirror>
        <Shade d="M98 130 L94 250 L87 362 L101 363 L106 250 L106 140 Z" c={c} />
        <Stitch d="M89 357 Q118 361 150 361" c={c} />
        <Line d="M89 300 L97 300" c={c} />
        <Stitch d="M96 206 Q110 208 114 220 L113 262 Q104 266 95 262" c={c} o={0.55} />
      </Mirror>
      <Sheen c={c} paths={['M126 150 Q122 240 118 340', 'M70 120 Q64 190 62 240']} />
      <Panel d="M144.5 58 L144.5 178 L155.5 178 L155.5 58 Z" c={c} tone="facing" />
      <Stitch d="M147 64 L147 175" c={c} o={0.6} />
      {[72, 94, 116, 138, 160].map((y) => (
        <Btn key={y} x={150} y={y} r={2.9} c={c} />
      ))}
      <Panel d="M133 54 Q150 62 167 54 L166 41 Q150 48 134 41 Z" c={c} tone="facing" />
      <Stitch d="M136 51 Q150 57 164 51" c={c} />
    </>
  )
}

/* — Tailored long vest (sleeveless, open shawl front) — */
const VEST_BODY = sym(
  [150, 48],
  [
    [140, 48, 128, 46],
    [102, 58],
    [114, 78, 116, 124, 100, 146],
    [94, 300],
    [90, 374],
    [120, 377, 150, 377],
  ],
)

function LongVest({ c }: { c: Ctx }) {
  return (
    <>
      <ShoulderHanger c={c} />
      <Panel d={VEST_BODY} c={c} />
      <path className="col-gf__fill" d="M128 46 Q150 54 172 46 L150 174 Z" fill={c.under} />
      <path className="col-gf__fill" d="M128 46 Q150 54 172 46 L150 174 Z" fill={c.shade} fillOpacity={0.35} />
      <Mirror>
        <Panel d="M128 46 L150 174 L141 174 Q124 120 119 52 Z" c={c} tone="facing" />
        <Stitch d="M123 54 Q128 118 144 168" c={c} />
        <Shade d="M100 146 L95 300 L91 374 L104 374 L108 300 L110 150 Z" c={c} />
        <Stitch d="M104 64 C114 84 114 120 104 142" c={c} />
        <Stitch d="M93 368 Q120 371 150 371" c={c} />
        <Line d="M93 318 L100 318" c={c} />
        <Line d="M110 264 L134 260" c={c} w={1.2} />
        <Stitch d="M110 268 L134 264" c={c} o={0.6} />
      </Mirror>
      <Line d="M150 174 L150 377" c={c} />
      <Btn x={150} y={180} r={3.6} c={c} />
      <Sheen c={c} paths={['M126 200 Q124 280 120 360']} />
    </>
  )
}

/* — Silk scarf, folded over the bar of a hanger — */
const SCARF_BACK = 'M150 46 Q153 170 156 292 L192 304 Q195 172 190 46 Z'
const SCARF_FRONT = 'M110 46 Q107 200 112 350 L150 366 Q153 200 150 46 Z'

function Scarf({ c }: { c: Ctx }) {
  return (
    <>
      <BarHanger c={c} clips={false} />
      <Panel d={SCARF_BACK} c={c} />
      <Shade d={SCARF_BACK} c={c} o={0.6} />
      <Stitch d="M154 54 Q157 172 160 289 M186 54 Q190 172 188 299" c={c} o={0.7} />
      <Line d="M156.5 283 L191.5 295 M156.5 278 L191.5 290" c={c} w={0.8} o={0.85} gold />
      <Panel d={SCARF_FRONT} c={c} />
      <Shade d="M128 60 Q125 200 128 352 L134 354 Q131 200 133 60 Z" c={c} o={0.45} />
      <Stitch d="M114 54 Q111 200 116 346 M146 54 Q149 200 146 360" c={c} o={0.7} />
      <Line d="M112.5 340 L150 356 M112.5 334 L150 350" c={c} w={0.8} o={0.85} gold />
      {/* the wrap over the bar */}
      <Panel d="M107 40 Q150 30 193 40 L193 50 Q150 42 107 50 Z" c={c} tone="facing" />
      <Sheen c={c} paths={['M120 70 Q117 200 121 330', 'M170 70 Q173 180 174 280']} />
    </>
  )
}

/* — Calf-leather belt with a gold-tone harness buckle, folded over a hook — */
const BELT = 'M118 296 L118 74 C118 40 182 40 182 74 L182 326 L173 342 L164 326 L164 74 C164 58 136 58 136 74 L136 296 Z'

function Belt({ c }: { c: Ctx }) {
  return (
    <>
      <Hook c={c} />
      <Panel d={BELT} c={c} />
      <Stitch d="M121 294 L121 74 C121 46 179 46 179 74 L179 325 L173 336 L167 325 L167 74 C167 62 133 62 133 74 L133 294" c={c} o={0.75} />
      {/* keeper loop and the strap folded around the buckle bar */}
      <Panel d="M114 274 L140 274 L140 283 L114 283 Z" c={c} tone="facing" />
      <Panel d="M118 296 L136 296 L136 306 L118 306 Z" c={c} tone="facing" />
      <Buckle x={110} y={294} w={34} h={24} c={c} bar="h" />
      <path className="col-gf__ink" d="M127 306 L127 325" stroke={c.gold} strokeWidth={c.sw * 1.6} strokeLinecap="round" fill="none" pathLength={1} />
      {[262, 276, 290, 304, 318].map((y) => (
        <circle key={y} className="col-gf__fill" cx={173} cy={y} r={c.mini ? 2.4 : 1.7} fill={c.shade} stroke={c.ink} strokeWidth={0.5} />
      ))}
      <Sheen c={c} paths={['M124 90 L124 270', 'M170 90 L170 250']} />
    </>
  )
}

const DRAW: Record<GarmentKind, (p: { c: Ctx }) => ReactNode> = {
  trench: Trench,
  'long-coat': LongCoat,
  blazer: Blazer,
  'riding-blazer': RidingBlazer,
  'cable-crew': CableCrew,
  'cable-cardigan': CableCardigan,
  'silk-shirt': SilkShirt,
  'poplin-shirt': PoplinShirt,
  trouser: Trouser,
  'wide-trouser': WideTrouser,
  kurta: Kurta,
  'long-vest': LongVest,
  scarf: Scarf,
  belt: Belt,
}

/* ---------- surfaces ---------- */

function TexturePattern({ id, texture, light }: { id: string; texture: Texture; light: boolean }) {
  const ink = light ? '#5c4520' : '#ffffff'
  const goldInk = light ? '#84662e' : '#d4b36f'
  switch (texture) {
    case 'gabardine':
      // steep, tight twill — the trench cloth
      return (
        <pattern id={id} width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(-62)">
          <path d="M0 1.5 L3 1.5" stroke={ink} strokeWidth="0.5" opacity={light ? 0.11 : 0.085} />
        </pattern>
      )
    case 'twill':
      return (
        <pattern id={id} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <path d="M0 2.5 L5 2.5" stroke={ink} strokeWidth="0.55" opacity={light ? 0.08 : 0.07} />
        </pattern>
      )
    case 'wool':
      return (
        <pattern id={id} width="6" height="6" patternUnits="userSpaceOnUse">
          <path d="M0 6 L3 0 L6 6" fill="none" stroke={ink} strokeWidth="0.3" opacity={0.05} />
        </pattern>
      )
    case 'linen':
      return (
        <pattern id={id} width="4" height="4" patternUnits="userSpaceOnUse">
          <path d="M0 1 L4 1" stroke={ink} strokeWidth="0.35" opacity={0.07} />
          <path d="M2.6 0 L2.6 4" stroke={ink} strokeWidth="0.3" opacity={0.05} />
        </pattern>
      )
    case 'cable':
      // stockinette: rows of tiny V stitches
      return (
        <pattern id={id} width="4" height="4" patternUnits="userSpaceOnUse">
          <path d="M0.4 0.6 L2 3.2 L3.6 0.6" fill="none" stroke={ink} strokeWidth="0.35" opacity={light ? 0.12 : 0.09} />
        </pattern>
      )
    case 'poplin':
      return (
        <pattern id={id} width="2.4" height="2.4" patternUnits="userSpaceOnUse">
          <path d="M0 1.2 L2.4 1.2" stroke={ink} strokeWidth="0.25" opacity={0.06} />
          <path d="M1.2 0 L1.2 2.4" stroke={ink} strokeWidth="0.2" opacity={0.04} />
        </pattern>
      )
    case 'crepe':
      return (
        <pattern id={id} width="7" height="7" patternUnits="userSpaceOnUse">
          <g fill={ink} opacity={light ? 0.1 : 0.075}>
            <circle cx="1" cy="2" r="0.38" />
            <circle cx="4.6" cy="5" r="0.32" />
            <circle cx="5.6" cy="1.2" r="0.26" />
            <circle cx="2.6" cy="6" r="0.3" />
          </g>
        </pattern>
      )
    case 'damask':
      // tone-on-tone lattice-and-lotus — texture, never embellishment
      return (
        <pattern id={id} width="22" height="22" patternUnits="userSpaceOnUse">
          <path d="M11 1 L21 11 L11 21 L1 11 Z" fill="none" stroke={light ? '#84662e' : '#ffffff'} strokeWidth="0.6" opacity={light ? 0.3 : 0.12} />
          <path d="M11 6 Q14.5 11 11 16 Q7.5 11 11 6 Z" fill={light ? '#84662e' : '#ffffff'} opacity={light ? 0.18 : 0.08} />
          <circle cx="0" cy="0" r="1.2" fill={light ? '#84662e' : '#ffffff'} opacity={light ? 0.25 : 0.1} />
          <circle cx="22" cy="22" r="1.2" fill={light ? '#84662e' : '#ffffff'} opacity={light ? 0.25 : 0.1} />
        </pattern>
      )
    case 'foulard':
      // stirrup-and-bit foulard print
      return (
        <pattern id={id} width="22" height="22" patternUnits="userSpaceOnUse">
          <g fill="none" stroke={goldInk} strokeLinecap="round" opacity={0.75}>
            <path d="M3.5 3 Q3.5 10.5 7.5 10.5 Q11.5 10.5 11.5 3" strokeWidth="0.9" />
            <path d="M2.5 3 L4.5 3 M10.5 3 L12.5 3" strokeWidth="0.9" />
            <circle cx="14.5" cy="16.5" r="1.8" strokeWidth="0.7" />
            <circle cx="20" cy="16.5" r="1.8" strokeWidth="0.7" />
            <path d="M16.3 16.5 L18.2 16.5" strokeWidth="0.7" />
          </g>
        </pattern>
      )
    case 'leather':
      return (
        <pattern id={id} width="6" height="6" patternUnits="userSpaceOnUse">
          <g fill={ink} opacity={light ? 0.1 : 0.07}>
            <circle cx="1" cy="1" r="0.3" />
            <circle cx="4" cy="3.5" r="0.25" />
            <circle cx="2.5" cy="5.1" r="0.22" />
          </g>
        </pattern>
      )
    default:
      return null
  }
}

function RibPattern({ id, light }: { id: string; light: boolean }) {
  return (
    <pattern id={id} width="2.8" height="6" patternUnits="userSpaceOnUse">
      <path d="M1.4 0 L1.4 6" stroke={light ? '#5c4520' : '#ffffff'} strokeWidth="0.55" opacity={light ? 0.16 : 0.12} />
    </pattern>
  )
}

/* ---------- fabric swatch (pinking-shear edges, gold pin) ---------- */

/** Zig-zag "pinked" square from (a, a) to (b, b) with teeth of size t. */
function pinked(a: number, b: number, t: number) {
  const n = Math.round((b - a) / (t * 2))
  const step = (b - a) / n
  const pts: string[] = []
  for (let i = 0; i < n; i++) pts.push(`${a + i * step} ${a}`, `${a + i * step + step / 2} ${a + t}`)
  for (let i = 0; i < n; i++) pts.push(`${b} ${a + i * step}`, `${b - t} ${a + i * step + step / 2}`)
  for (let i = 0; i < n; i++) pts.push(`${b - i * step} ${b}`, `${b - i * step - step / 2} ${b - t}`)
  for (let i = 0; i < n; i++) pts.push(`${a} ${b - i * step}`, `${a + t} ${b - i * step - step / 2}`)
  return `M${pts.join(' L')} Z`
}
const SWATCH = pinked(8, 112, 2.6)

/**
 * A cut cloth swatch in any colour, woven with the piece's surface (gabardine twill, cable knit,
 * damask…). Used beside the technical flat in the quick view.
 */
export function FabricSwatch({ colour, texture, className = '' }: { colour: string; texture?: Texture; className?: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const lum = hexLum(colour)
  const light = lum > 0.38
  const mid = !light && lum > 0.2 // camel: gold would vanish on it (see GarmentFlat)
  const texId = `gf-sw-${uid}`
  const clipId = `gf-sw-clip-${uid}`
  const hasPattern = !!texture && texture !== 'silk'
  const glossy = texture === 'silk' || texture === 'foulard' || texture === 'leather'
  const gold = light ? '#84662e' : mid ? '#5c4520' : '#d4b36f'
  return (
    <svg className={`col-gf-swatch ${className}`} viewBox="0 0 120 120" aria-hidden focusable="false">
      <defs>
        {hasPattern && texture && <TexturePattern id={texId} texture={texture} light={light} />}
        <clipPath id={clipId}>
          <path d={SWATCH} />
        </clipPath>
      </defs>
      <path d={SWATCH} fill={colour} />
      {/* surface layers stay inside the pinked edge (the svg itself is overflow: visible) */}
      <g clipPath={`url(#${clipId})`}>
        {/* the weave, drawn at twice the garment scale so it reads up close */}
        {hasPattern && (
          <g transform="translate(60 60) scale(2) translate(-60 -60)">
            <rect x={8} y={8} width={104} height={104} fill={`url(#${texId})`} />
          </g>
        )}
        {texture === 'cable' && (
          <g fill="none" stroke={gold} strokeLinecap="round" opacity={0.85}>
            <path d="M44 14 L44 106 M76 14 L76 106" strokeWidth={0.7} strokeDasharray="0.6 2.4" />
            {[14, 37, 60, 83].map((y) => (
              <g key={y}>
                <path d={`M50 ${y} C50 ${y + 11.5} 70 ${y + 11.5} 70 ${y + 23}`} strokeWidth={1.2} />
                <path d={`M70 ${y} C70 ${y + 11.5} 50 ${y + 11.5} 50 ${y + 23}`} strokeWidth={1} pathLength={1} strokeDasharray="0.36 0.28 0.36" />
              </g>
            ))}
          </g>
        )}
        {glossy && (
          <g fill="none" stroke="#fff" strokeLinecap="round">
            <path d="M20 96 Q60 50 100 24" strokeWidth={16} opacity={0.05} />
            <path d="M26 100 Q62 58 102 32" strokeWidth={4} opacity={0.1} />
          </g>
        )}
      </g>
      <path d={SWATCH} fill="none" stroke={gold} strokeWidth={0.6} strokeOpacity={0.7} />
      {/* gold dressmaker's pin */}
      <g stroke={gold} strokeLinecap="round">
        <path d="M86 20 L106 4" strokeWidth={1} />
      </g>
      <circle cx={84.5} cy={21.5} r={3.4} fill="#d4b36f" stroke="#84662e" strokeWidth={0.6} />
      <circle cx={83.4} cy={20.4} r={1} fill="#fff" opacity={0.6} />
    </svg>
  )
}

export interface GarmentFlatProps {
  kind: GarmentKind
  colour: string
  texture?: Texture
  /** small thumbnails: thicker lines, no stitching or texture */
  mini?: boolean
  /** false → lines hidden, true → lines draw on and fills fade in (one-shot) */
  draw?: boolean
  className?: string
  /** accessible label; omit for decorative use */
  title?: string
}

/** Gold-hairline technical flat of a Femmora garment, in any colour. */
export default function GarmentFlat({ kind, colour, texture, mini = false, draw, className = '', title }: GarmentFlatProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const lum = hexLum(colour)
  const light = lum > 0.38
  /* mid-tones (camel) sit at the same luminance as gold — a gold line would vanish on them,
     so they take a deep bronze line and a pale-gold stitch instead */
  const mid = !light && lum > 0.2
  const texId = `gf-tex-${uid}`
  const ribId = `gf-rib-${uid}`
  const hasPattern = !mini && !!texture && texture !== 'silk'
  const hasRib = !mini && texture === 'cable'

  const c: Ctx = {
    fill: colour,
    tex: hasPattern ? `url(#${texId})` : undefined,
    rib: hasRib ? `url(#${ribId})` : undefined,
    ink: light ? '#a9853f' : mid ? '#5c4520' : '#c9a55c',
    stitch: light ? '#a9853f' : mid ? '#f1dfb2' : '#e3c88a',
    shade: light ? 'rgba(92, 69, 32, 0.13)' : mid ? 'rgba(60, 40, 15, 0.2)' : 'rgba(0, 0, 0, 0.26)',
    sheen: light ? 'rgba(255, 255, 255, 0.28)' : mid ? 'rgba(255, 255, 255, 0.14)' : 'rgba(255, 255, 255, 0.06)',
    under: light ? '#45111e' : '#efe7d8',
    gold: '#d4b36f',
    goldDeep: '#84662e',
    pearl: '#f6f1e6',
    sw: mini ? 2.6 : 1,
    mini,
    glossy: texture === 'silk' || texture === 'foulard' || texture === 'leather',
  }
  const Draw = DRAW[kind]
  const drawCls = draw === undefined ? '' : draw ? 'col-gf--draw' : 'col-gf--pre'

  return (
    <svg
      className={`col-gf ${drawCls} ${className}`}
      viewBox="0 0 300 400"
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {(hasPattern || hasRib) && texture && (
        <defs>
          {hasPattern && <TexturePattern id={texId} texture={texture} light={light} />}
          {hasRib && <RibPattern id={ribId} light={light} />}
        </defs>
      )}
      <g className="col-gf__hang">
        <Draw c={c} />
      </g>
    </svg>
  )
}
