import type { ReactNode } from 'react'
import { motion, useReducedMotion, type Variants } from 'motion/react'

/* ==========================================================================
   Gold-hairline construction details for "Why it's built like this".
   Each drawing is a technical close-up: collar & placket (structured cuts),
   the breathable weave, the 17 cm pocket, and the dress form measured once.
   viewBox 0 0 320 320.
   ========================================================================== */

export type DetailKind = 'collar' | 'weave' | 'pocket' | 'measure'

const SILK = [0.65, 0, 0.35, 1] as const
const LUX = [0.22, 1, 0.36, 1] as const

const draw: Variants = {
  off: { pathLength: 0, opacity: 0 },
  on: (i: number = 0) => ({
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 1.5, ease: SILK, delay: i * 0.12 },
      opacity: { duration: 0.15, delay: i * 0.12 },
    },
  }),
}
const fade: Variants = {
  off: { opacity: 0 },
  on: (i: number = 0) => ({ opacity: 1, transition: { duration: 0.9, ease: LUX, delay: 0.7 + i * 0.1 } }),
}
const pop: Variants = {
  off: { opacity: 0, scale: 0.4 },
  on: (i: number = 0) => ({ opacity: 1, scale: 1, transition: { duration: 0.7, ease: LUX, delay: 1 + i * 0.1 } }),
}

const P = ({ d, i = 0, w = 1, className }: { d: string; i?: number; w?: number; className?: string }) => (
  <motion.path d={d} custom={i} variants={draw} strokeWidth={w} className={className} />
)
const Stitch = ({ d, i = 0 }: { d: string; i?: number }) => (
  <motion.path d={d} custom={i} variants={fade} strokeDasharray="3 4" strokeWidth={0.9} className="col-why__stitch" />
)
const Btn = ({ cx, cy, r = 4.5, i = 0 }: { cx: number; cy: number; r?: number; i?: number }) => (
  <motion.circle
    cx={cx}
    cy={cy}
    r={r}
    custom={i}
    variants={pop}
    className="col-why__btn"
    style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
  />
)
const Label = ({ x, y, children, anchor = 'middle', i = 0 }: { x: number; y: number; children: ReactNode; anchor?: 'start' | 'middle' | 'end'; i?: number }) => (
  <motion.text x={x} y={y} textAnchor={anchor} custom={i} variants={fade} className="col-why__svg-label">
    {children}
  </motion.text>
)

/* ---------- 1 · structured cuts — status in the cut ---------- */
function Collar() {
  return (
    <>
      <P d="M30 268 L30 180 Q30 150 62 138 L126 112 Q160 126 194 112 L258 138 Q290 150 290 180 L290 268" />
      <P d="M126 112 L127 80 Q160 94 193 80 L194 112" i={2} w={1.2} />
      <Stitch d="M131 105 Q160 118 189 105" i={1} />
      <Stitch d="M131 88 Q160 101 189 88" i={2} />
      <P d="M151 120 L151 268 M169 120 L169 268" i={3} />
      <Stitch d="M62 138 Q76 200 68 268 M258 138 Q244 200 252 268" i={3} />
      {[146, 180, 214, 248].map((y, i) => (
        <Btn key={y} cx={160} cy={y} i={i} />
      ))}
      {/* shoulder dimension */}
      <motion.path d="M62 54 L258 54 M62 46 L62 62 M258 46 L258 62" custom={4} variants={fade} strokeWidth={0.8} />
      <motion.path d="M62 66 L62 130 M258 66 L258 130" custom={4} variants={fade} strokeWidth={0.6} strokeDasharray="2 4" />
      <Label x={160} y={44} i={5}>
        STRUCTURE, NOT EMBELLISHMENT
      </Label>
    </>
  )
}

/* ---------- 2 · breathable fabric — eight months of heat ---------- */
function Weave() {
  const warp = [100, 130, 160, 190, 220]
  const weft = [110, 140, 170, 200, 230]
  return (
    <>
      <P d="M70 80 L250 80 L250 260 L70 260 Z" w={1.1} />
      {warp.map((x, i) => (
        <P key={x} d={`M${x} 80 L${x} 260`} i={1 + i * 0.4} w={0.8} />
      ))}
      {weft.map((y, i) => (
        <P
          key={y}
          d={`M70 ${y} Q85 ${y - 6} 100 ${y} T130 ${y} T160 ${y} T190 ${y} T220 ${y} T250 ${y}`}
          i={2 + i * 0.4}
          w={0.8}
        />
      ))}
      {/* air passing through the cloth */}
      {['M98 304 C88 252 122 222 110 172 S122 92 142 26', 'M168 304 C158 252 192 222 180 172 S192 92 212 26', 'M236 304 C228 262 254 230 246 190'].map(
        (d, i) => (
          <motion.path key={d} d={d} custom={i} variants={fade} className="col-why__air" strokeWidth={0.9} />
        ),
      )}
      {/* sun */}
      <motion.g custom={3} variants={fade}>
        <circle cx={272} cy={44} r={14} strokeWidth={0.9} />
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i * Math.PI) / 4
          const x1 = 272 + Math.cos(a) * 20
          const y1 = 44 + Math.sin(a) * 20
          const x2 = 272 + Math.cos(a) * 27
          const y2 = 44 + Math.sin(a) * 27
          return <path key={i} d={`M${x1.toFixed(1)} ${y1.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)}`} strokeWidth={0.9} />
        })}
      </motion.g>
      <Label x={70} y={290} anchor="start" i={4}>
        UNLINED · BREATHABLE
      </Label>
    </>
  )
}

/* ---------- 3 · real pockets ---------- */
function Pocket() {
  return (
    <>
      <P d="M118 30 Q112 160 104 300" w={1.2} />
      <P d="M118 30 L234 30 L240 300" i={1} />
      <Stitch d="M120 42 L232 42" i={0} />
      {/* opening, reinforced */}
      <P d="M116 82 L110 164" i={2} w={2} />
      <motion.path d="M108 82 L124 82 M103 164 L119 164" custom={1} variants={fade} strokeWidth={1.4} />
      {/* pocket bag */}
      <motion.path
        d="M116 82 C170 86 212 112 212 170 L208 236 Q170 262 108 242"
        custom={2}
        variants={fade}
        strokeDasharray="4 5"
        strokeWidth={0.9}
      />
      {/* phone & pen inside */}
      <P d="M146 128 L184 122 Q190 121 191 127 L201 199 Q202 205 196 206 L158 212 Q152 213 151 207 L141 135 Q140 129 146 128 Z" i={3} w={0.9} />
      <motion.path d="M160 132 L176 130" custom={3} variants={fade} strokeWidth={0.9} />
      <P d="M200 104 L184 228" i={4} w={1.1} />
      <motion.path d="M200 104 L204 122 L198 124" custom={4} variants={fade} strokeWidth={0.9} />
      {/* depth dimension */}
      <motion.path d="M262 82 L262 242 M254 82 L270 82 M254 242 L270 242" custom={4} variants={fade} strokeWidth={0.9} />
      <motion.text x={276} y={168} custom={5} variants={fade} className="col-why__svg-num">
        17
      </motion.text>
      <Label x={276} y={186} anchor="start" i={5}>
        CM
      </Label>
    </>
  )
}

/* ---------- 4 · measurement-led ---------- */
const FORM =
  'M148 34 L146 58 C124 62 106 66 94 74 Q84 80 92 96 C94 112 88 124 92 136 C98 162 116 184 116 202 ' +
  'C116 222 88 240 90 262 Q92 276 100 286 L220 286 Q228 276 230 262 C232 240 204 222 204 202 ' +
  'C204 184 222 162 228 136 C232 124 226 112 228 96 Q236 80 226 74 C214 66 196 62 174 58 L172 34'
/** bust · waist · hip — the size M row of the Femmora size chart */
const TAPES = [
  { y: 136, l: 92, r: 228, sag: 18, name: 'BUST', v: '36' },
  { y: 202, l: 116, r: 204, sag: 13, name: 'WAIST', v: '30' },
  { y: 262, l: 90, r: 230, sag: 18, name: 'HIP', v: '39' },
]
function Measure() {
  return (
    <>
      {/* the dress form */}
      <P d={FORM} w={1.1} />
      <motion.ellipse cx={160} cy={34} rx={12} ry={3} custom={0} variants={fade} strokeWidth={1} />
      <Stitch d="M160 60 L160 284" i={1} />
      <Stitch d="M128 64 C118 120 132 170 134 202 C136 236 120 262 122 284" i={1} />
      <Stitch d="M192 64 C202 120 188 170 186 202 C184 236 200 262 198 284" i={1} />
      <P d="M160 286 L160 306 M130 306 L190 306" i={1} w={1.1} />
      {/* the tape, front solid and back dashed, with a leader to each measurement */}
      {TAPES.map((t, i) => (
        <g key={t.name}>
          <motion.path
            d={`M${t.l} ${t.y} Q160 ${t.y - t.sag} ${t.r} ${t.y}`}
            custom={2 + i}
            variants={fade}
            strokeWidth={0.8}
            strokeDasharray="2 4"
          />
          <P d={`M${t.l} ${t.y} Q160 ${t.y + t.sag} ${t.r} ${t.y}`} i={2 + i * 0.6} w={2.2} className="col-why__tape" />
          <motion.path
            d={`M${t.l} ${t.y} Q160 ${t.y + t.sag} ${t.r} ${t.y}`}
            custom={3 + i}
            variants={fade}
            strokeWidth={4}
            strokeDasharray="0.6 5.4"
            className="col-why__tape-ticks"
          />
          <motion.path d={`M${t.r + 4} ${t.y} L262 ${t.y}`} custom={3 + i} variants={fade} strokeWidth={0.7} />
          <motion.text x={266} y={t.y + 4} custom={4 + i} variants={fade} className="col-why__svg-num col-why__svg-num--sm">
            {t.v}
          </motion.text>
          <Label x={266} y={t.y + 16} anchor="start" i={4 + i}>
            {t.name}
          </Label>
        </g>
      ))}
      <Label x={160} y={16} i={6}>
        MEASURED ONCE · KEPT ON FILE
      </Label>
    </>
  )
}

const DRAWINGS: Record<DetailKind, () => ReactNode> = {
  collar: Collar,
  weave: Weave,
  pocket: Pocket,
  measure: Measure,
}

/**
 * `mode="mount"` draws as soon as it mounts (sticky panel, keyed per finding);
 * `mode="view"` draws once when scrolled into view (mobile, inline).
 */
export default function WhyDetail({ kind, mode = 'mount', className = '' }: { kind: DetailKind; mode?: 'mount' | 'view'; className?: string }) {
  const reduced = useReducedMotion()
  const Drawing = DRAWINGS[kind]
  const trigger =
    mode === 'mount'
      ? { animate: 'on' as const }
      : { whileInView: 'on' as const, viewport: { once: true, amount: 0.45 } }
  return (
    <motion.svg
      className={`col-why__svg ${className}`}
      viewBox="0 0 320 320"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable="false"
      initial={reduced ? 'on' : 'off'}
      {...trigger}
    >
      <Drawing />
    </motion.svg>
  )
}
