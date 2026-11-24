import type { GarmentId } from '../../../data/site'

/**
 * The three trench coats of the home rack, drawn as gold-hairline "technical flats" on their
 * hangers: the Ivory Trench (Styling), the Burgundy Trench (The Collection) and the Camel Trench
 * (Custom Services, chalked and pinned for a fitting). The cloth colours match the 3D coats
 * (src/three/garmentModel.ts).
 *
 * viewBox 0 0 200 300 — the hook's crown sits at y≈7 so it rests on the HTML rail
 * (see `.hs-fin__rail` in Finale.css). The outline is `currentColor` (the section accent), so it
 * re-inks with the hover flood; details on the cloth use the coat's own `detail` colour.
 * The coat geometry is the croquis trench of LookFigure, re-proportioned for a hanger.
 * Decorative (aria-hidden): the adjacent copy carries the meaning.
 */

const HANGER = 'M100 37V27c0-5 5-6.5 7-10.5S106 7 100.5 7C96 7 94 10 94 13M100 37C84 42 62 51 46 58c-4 1.8-4 4.6.6 5.2M100 37c16 5 38 14 54 21 4 1.8 4 4.6-.6 5.2'

/* ── shared trench geometry ── */
const BODY =
  'M82.5 44L55 50.3C57.5 71.3 65 100.7 67.5 123.8C62.5 176.3 52.5 230.9 45 283.4Q100 292.9 155 283.4C147.5 230.9 137.5 176.3 132.5 123.8C135 100.7 142.5 71.3 145 50.3L117.5 44Z'
const SLEEVE_L = 'M55 50.3C45 53.5 40.6 65 40.6 81.8L36.3 195.2L57.5 197.3L63.1 90.2C63.1 73.4 60.6 58.7 55 50.3Z'
const SLEEVE_R = 'M145 50.3C155 53.5 159.4 65 159.4 81.8L163.7 195.2L142.5 197.3L136.9 90.2C136.9 73.4 139.4 58.7 145 50.3Z'
const CUFFS = 'M37 178.1L58.2 180.7M36.8 183.8L58 186.5M141.8 180.7L163 178.1M142 186.5L163.2 183.8'
const COLLAR = 'M82.5 44C81.2 33.5 88.8 27.7 100 28.2C111.2 27.7 118.8 33.5 117.5 44Z'
const COLLAR_UP = 'M80.6 47.2C78.1 30.4 86.9 22 100 23C113.1 22 121.9 30.4 119.4 47.2Z'
/** the inside back of the neck and the V between the lapels */
const INSIDE = 'M83.1 43.5C84.5 36.5 91 32.5 100 32.5C109 32.5 115.5 36.5 116.9 43.5L100 100.7Z'
const LAPEL_L = 'M83.1 43.5L70 64.2L78.8 69.5L99.4 101.5Z'
const LAPEL_R = 'M116.9 43.5L130 64.2L121.2 69.5L100.6 101.5Z'
const NOTCHES = 'M70 64.2L76.2 60.2M130 64.2L123.8 60.2'
const STORM_FLAP = 'M56.9 51.4L63.1 88.1L85.6 85.4'
const EPAULETTES = 'M55.6 50.8L80 45.6L81.2 50.1L57.5 55.5ZM144.4 50.8L120 45.6L118.8 50.1L142.5 55.5Z'
const RAGLAN = 'M83.1 44C72.5 56.6 66.2 71.3 63.8 88.1M116.9 44C127.5 56.6 133.8 71.3 136.2 88.1'
const POCKETS = 'M69.4 174.2L74.4 172.6L84.4 203.6L79.4 205.2ZM130.6 174.2L125.6 172.6L115.6 203.6L120.6 205.2Z'
const HEM_STITCH = 'M48.1 275.5Q100 285 151.9 275.5'
const FRONT_DB = 'M100.6 101.2C102.5 166.3 104.4 229.3 106 288'
const FRONT_SB = 'M100 101.2V288'
const BELT = 'M66.9 118.6Q100 123.3 133.1 118.6L132.9 130.1Q100 134.8 67.1 130.1Z'
const BUCKLE = 'M84.4 119.8h11.8v12.2H84.4ZM90.3 119.8V132'
const KNOT = 'M94.4 120.8h11.2v11.6H94.4Z'
const TAILS = 'M96.2 132.6L90.6 173.1L98.1 172.1L101.2 132.6ZM103.8 132.4L111.9 168.9L118.8 165.8L105.6 132Z'
const LOOPS = 'M70 116.6v15.6M130 116.6v15.6'

interface TrenchSpec {
  cloth: string
  /** the inside of the coat (back neck, between the lapels) */
  lining: string
  /** seams and topstitching drawn on the cloth */
  detail: string
  button: string
  belt: 'buckle' | 'tied'
  doubleBreasted: boolean
  collarUp: boolean
  epaulettes: boolean
  /** the made-to-measure coat: chalk marks, pins and a measuring tag */
  fitting?: boolean
}

const SPECS: Record<GarmentId, TrenchSpec> = {
  styling: {
    cloth: '#f4ede0',
    lining: '#ddd0b6',
    detail: '#a9853f',
    button: '#c9a55c',
    belt: 'buckle',
    doubleBreasted: true,
    collarUp: false,
    epaulettes: true,
  },
  collection: {
    cloth: '#5a1424',
    lining: '#34080f',
    detail: '#d4b36f',
    button: '#e3c88a',
    belt: 'tied',
    doubleBreasted: true,
    collarUp: true,
    epaulettes: true,
  },
  custom: {
    cloth: '#b5895a',
    lining: '#8f6a42',
    detail: '#5c3f1f',
    button: '#e3c88a',
    belt: 'buckle',
    doubleBreasted: false,
    collarUp: false,
    epaulettes: false,
    fitting: true,
  },
}

function TrenchFlat({ s }: { s: TrenchSpec }) {
  const d = { fill: 'none', stroke: s.detail, strokeWidth: 0.8 }
  const buttons: [number, number][] = s.doubleBreasted
    ? [107, 147, 170].flatMap((y) => [
        [90.6, y] as [number, number],
        [113.1, y] as [number, number],
      ])
    : [
        [100, 109],
        [100, 151],
        [100, 174],
      ]
  return (
    <>
      <path className="hs-flat__hanger" d={HANGER} />

      {/* the coat */}
      <path d={BODY} fill={s.cloth} />
      <path d={HEM_STITCH} {...d} strokeDasharray="1.8 2.2" opacity="0.8" />
      <path d={POCKETS} fill={s.cloth} />
      <path d={s.collarUp ? COLLAR_UP : COLLAR} fill={s.cloth} />
      <path d={INSIDE} fill={s.lining} />
      {/* the woven house label in the back neck */}
      <path d="M95 35.4h10v4.6H95Z" fill={s.button} stroke="none" />
      <path d={LAPEL_L} fill={s.cloth} />
      <path d={LAPEL_R} fill={s.cloth} />
      <path d={NOTCHES} />
      <path d={s.doubleBreasted ? FRONT_DB : FRONT_SB} {...d} strokeWidth="1" />
      {s.epaulettes ? (
        <>
          <path d={STORM_FLAP} {...d} />
          <path d={EPAULETTES} fill={s.cloth} />
          <g fill={s.button} stroke="none">
            <circle cx="78.2" cy="48.3" r="1.3" />
            <circle cx="121.8" cy="48.3" r="1.3" />
          </g>
        </>
      ) : (
        <path d={RAGLAN} {...d} opacity="0.85" />
      )}

      {/* the belt, through its loops */}
      <path d={LOOPS} {...d} />
      <path d={BELT} fill={s.cloth} />
      {s.belt === 'buckle' ? (
        <path d={BUCKLE} fill="none" stroke={s.button} strokeWidth="1.1" />
      ) : (
        <>
          <path d={TAILS} fill={s.cloth} />
          <path d={KNOT} fill={s.cloth} />
        </>
      )}
      <g fill={s.button} stroke="none">
        {buttons.map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="2" />
        ))}
      </g>

      {/* sleeves and cuff straps */}
      <path d={SLEEVE_L} fill={s.cloth} />
      <path d={SLEEVE_R} fill={s.cloth} />
      <path d={CUFFS} {...d} />

      {s.fitting && (
        <g className="hs-flat__fitting">
          {/* tailor's chalk: the new waist, the shortened sleeve and the hem to take up */}
          <g fill="none" stroke="#fbf6ec" strokeWidth="1.1" strokeDasharray="3.2 2.4" strokeLinecap="round" opacity="0.92">
            <path d="M66 146Q100 151 134 146" />
            <path d="M38.6 170.4L59 172.8" />
            <path d="M50 262Q100 271 150 262" />
          </g>
          <g fill="none" stroke="#fbf6ec" strokeWidth="1.1" strokeLinecap="round" opacity="0.92">
            <path d="M62 141l4 4m0-4l-4 4M134 141l4 4m0-4l-4 4" />
          </g>
          {/* two dressmaker's pins at the side seam */}
          <g stroke={s.detail} strokeWidth="0.8" strokeLinecap="round">
            <path d="M126 196l14-5M124 214l14-3" />
          </g>
          <g fill={s.button} stroke="none">
            <circle cx="140.6" cy="190.8" r="1.8" />
            <circle cx="138.6" cy="210.7" r="1.8" />
          </g>
          {/* the measurement tag, tied to the belt */}
          <path d="M116 131c3 10 6 16 10 20" fill="none" stroke={s.detail} strokeWidth="0.7" />
          <g transform="rotate(-8 132 160)">
            <path d="M121 151h22v17h-22Z" fill="#fbf6ec" stroke={s.detail} strokeWidth="0.6" />
            <circle cx="125" cy="154.5" r="1" fill="none" stroke={s.detail} strokeWidth="0.6" />
            <text x="132.6" y="163.4" textAnchor="middle" fontSize="6" fill={s.detail} stroke="none" className="hs-flat__tag">
              Nº 14
            </text>
          </g>
        </g>
      )}
    </>
  )
}

export function GarmentFlat({ id, className = '' }: { id: GarmentId; className?: string }) {
  return (
    <svg className={`hs-flat ${className}`} viewBox="0 0 200 300" aria-hidden focusable="false">
      <g fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <TrenchFlat s={SPECS[id]} />
      </g>
    </svg>
  )
}

/**
 * A rack coat nested inside another SVG (e.g. the flagship window in Launch): `width` in the
 * parent's units, height follows the 2:3 drawing. Its hook's crown sits at HOOK_Y of its height.
 */
export function RackCoat({ id, x, y, width }: { id: GarmentId; x: number; y: number; width: number }) {
  return (
    <svg className="hs-flat" x={x} y={y} width={width} height={width * 1.5} viewBox="0 0 200 300" overflow="visible">
      <g fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <TrenchFlat s={SPECS[id]} />
      </g>
    </svg>
  )
}

/** Fraction of a coat's height at which its hook's crown sits (rest it on a rail there). */
export const HOOK_Y = 7 / 300
