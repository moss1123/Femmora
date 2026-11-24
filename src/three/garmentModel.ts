import * as THREE from 'three'
import type { GarmentId } from '../data/site'
import { makeWeaveNormal, type FabricKind } from './textures'

/* ---------------------------------------------------------------------------
   Procedural garments.
   A garment = front + back shells cut from a 2D pattern (silhouette). Each shell
   is a dense grid displaced by a distance field of the pattern, so edges meet
   and the body puffs out like cloth over a hanger; drape folds deepen toward
   the hem. Garment space: x right, y up, origin at the neck point (top centre),
   the garment hangs into −y.
   --------------------------------------------------------------------------- */

type Pt = [number, number]
type Shape = { pts: Pt[]; hole?: boolean }

export interface TrenchColours {
  base: string
  /** seams / shadows */
  seam: string
  /** topstitching thread */
  stitch: string
  /** lapel & flap highlight */
  lift: string
  lining: string
  sheen: string
  /** belt (same cloth, a touch darker) */
  belt: string
}

export interface GarmentSpec {
  id: GarmentId
  kind: 'trench'
  fabric: FabricKind
  width: number
  height: number
  shapes: Shape[]
  /** paints colour + seams into the FRONT surface canvas (garment-space helpers provided) */
  paint: (p: Painter) => void
  /** paints the BACK surface (yoke, vent, belt loops) */
  paintBack: (p: Painter) => void
  colours: TrenchColours
  /** front shell fullness (m), edge roundness (m), fold amplitude (m) */
  depth: number
  round: number
  folds: number
  roughness: number
  sheen: number
  /** points (garment space) where gold buttons sit */
  buttons: Pt[]
  /** y of the belt (garment space) */
  beltY: number
}

export interface Painter {
  ctx: CanvasRenderingContext2D
  W: number
  H: number
  /** garment-space → canvas pixels */
  X: (x: number) => number
  Y: (y: number) => number
  /** metres → pixels */
  S: (m: number) => number
  fillShapes: (style: string) => void
  line: (pts: Pt[], style: string, widthM: number, dash?: number[]) => void
  /** smooth filled region in garment space */
  area: (pts: Pt[], style: string) => void
}

/* ------------------------------- patterns -------------------------------- */

const mirror = (pts: Pt[]): Pt[] => pts.map(([x, y]) => [-x, y] as Pt).reverse()
const flipX = (pts: Pt[]): Pt[] => pts.map(([x, y]) => [-x, y] as Pt)

// Double-breasted, belted trench — raglan sleeves, wide lapels, knee length.
const trenchBody: Pt[] = [
  [-0.078, 0.0],
  [0.078, 0.0],
  [0.214, -0.05],
  [0.225, -0.074],
  [0.217, -0.16],
  [0.214, -0.26],
  [0.21, -0.36],
  [0.197, -0.44],
  [0.212, -0.52],
  [0.236, -0.68],
  [0.262, -0.9],
  [0.294, -1.17],
  [0.15, -1.18],
  [0.0, -1.182],
  [-0.15, -1.18],
  [-0.294, -1.17],
  [-0.262, -0.9],
  [-0.236, -0.68],
  [-0.212, -0.52],
  [-0.197, -0.44],
  [-0.21, -0.36],
  [-0.214, -0.26],
  [-0.217, -0.16],
  [-0.225, -0.074],
  [-0.214, -0.05],
]
const trenchSleeve: Pt[] = [
  [0.204, -0.048],
  [0.262, -0.095],
  [0.302, -0.2],
  [0.332, -0.38],
  [0.35, -0.56],
  [0.361, -0.74],
  [0.364, -0.79],
  [0.289, -0.795],
  [0.284, -0.74],
  [0.27, -0.58],
  [0.25, -0.42],
  [0.229, -0.28],
  [0.219, -0.16],
  [0.212, -0.1],
]
const trenchV: Pt[] = [
  [-0.078, 0.03],
  [-0.07, -0.06],
  [-0.046, -0.17],
  [-0.014, -0.29],
  [0.0, -0.31],
  [0.014, -0.29],
  [0.046, -0.17],
  [0.07, -0.06],
  [0.078, 0.03],
]

// right lapel (viewer's right); the left is mirrored
const lapelR: Pt[] = [
  [0.078, 0.0],
  [0.124, -0.036],
  [0.168, -0.07],
  [0.15, -0.088],
  [0.182, -0.112],
  [0.15, -0.18],
  [0.104, -0.25],
  [0.06, -0.3],
  [0.016, -0.322],
  [0.012, -0.29],
  [0.044, -0.17],
  [0.068, -0.06],
]
// storm (gun) flap over the viewer's left chest
const stormFlap: Pt[] = [
  [-0.2, -0.062],
  [-0.21, -0.17],
  [-0.21, -0.27],
  [-0.16, -0.288],
  [-0.1, -0.282],
  [-0.12, -0.2],
  [-0.15, -0.115],
  [-0.17, -0.078],
]

function paintTwill(p: Painter, c: TrenchColours) {
  // faint diagonal gabardine wale, baked into colour so it reads at a distance
  const { ctx, W, H } = p
  ctx.save()
  ctx.globalAlpha = 0.07
  ctx.strokeStyle = c.seam
  ctx.lineWidth = 1
  for (let k = -H; k < W + H; k += 5) {
    ctx.beginPath()
    ctx.moveTo(k, 0)
    ctx.lineTo(k + H * 0.55, H)
    ctx.stroke()
  }
  ctx.restore()
}

function paintSleeves(p: Painter, c: TrenchColours) {
  for (const s of [1, -1]) {
    // raglan seam from collar to underarm
    p.line([[s * 0.084, -0.006], [s * 0.15, -0.12], [s * 0.214, -0.26]], c.seam, 0.003)
    p.line([[s * 0.09, -0.004], [s * 0.156, -0.118], [s * 0.219, -0.255]], c.stitch, 0.0014, [4, 4])
    // sleeve strap at the cuff
    const y0 = -0.672
    p.area([[s * 0.276, y0], [s * 0.358, y0 - 0.004], [s * 0.36, y0 - 0.032], [s * 0.278, y0 - 0.028]], c.lift)
    p.line([[s * 0.276, y0], [s * 0.358, y0 - 0.004]], c.seam, 0.0022)
    p.line([[s * 0.278, y0 - 0.028], [s * 0.36, y0 - 0.032]], c.seam, 0.0022)
    p.line([[s * 0.279, y0 - 0.006], [s * 0.356, y0 - 0.01]], c.stitch, 0.0012, [3, 3])
    p.line([[s * 0.28, y0 - 0.022], [s * 0.357, y0 - 0.026]], c.stitch, 0.0012, [3, 3])
    // cuff hem
    p.line([[s * 0.289, -0.78], [s * 0.363, -0.776]], c.stitch, 0.0013, [4, 4])
    // epaulette
    p.area([[s * 0.086, -0.018], [s * 0.222, -0.058], [s * 0.226, -0.084], [s * 0.09, -0.044]], c.lift)
    p.line([[s * 0.086, -0.018], [s * 0.222, -0.058]], c.seam, 0.0022)
    p.line([[s * 0.09, -0.044], [s * 0.226, -0.084]], c.seam, 0.0022)
    p.line([[s * 0.094, -0.024], [s * 0.218, -0.063]], c.stitch, 0.0012, [3, 3])
    // side seam
    p.line([[s * 0.214, -0.26], [s * 0.21, -0.36], [s * 0.198, -0.44], [s * 0.212, -0.52], [s * 0.236, -0.68], [s * 0.262, -0.9], [s * 0.294, -1.17]], c.seam, 0.0025)
    // belt loop
    p.area([[s * 0.19, -0.405], [s * 0.21, -0.405], [s * 0.21, -0.478], [s * 0.19, -0.478]], c.lift)
  }
}

function paintTrenchFront(p: Painter, c: TrenchColours) {
  p.fillShapes(c.base)
  paintTwill(p, c)
  paintSleeves(p, c)
  // storm flap
  p.area(stormFlap, c.lift)
  p.line([...stormFlap.slice(1), stormFlap[0]], c.seam, 0.0028)
  p.line(stormFlap.slice(1, 6).map(([x, y]) => [x + 0.008, y + 0.006] as Pt), c.stitch, 0.0013, [4, 4])
  // lapels: highlight face, shadow under the outer edge, topstitch
  for (const lap of [lapelR, mirror(lapelR)]) {
    p.area(lap, c.lift)
    const outer = lap.slice(0, 9)
    p.line(outer.map(([x, y]) => [x * 1.04, y - 0.006] as Pt), c.seam, 0.006)
    p.line(outer, c.seam, 0.0022)
    p.line(outer.map(([x, y]) => [x * 0.95, y + 0.004] as Pt), c.stitch, 0.0013, [4, 4])
  }
  // notch shadows
  p.line([[0.15, -0.088], [0.168, -0.07]], c.seam, 0.003)
  p.line([[-0.15, -0.088], [-0.168, -0.07]], c.seam, 0.003)
  // overlapping front edge (double-breasted) + hem
  p.line([[0.03, -0.31], [0.034, -0.7], [0.04, -1.18]], c.seam, 0.003)
  p.line([[0.04, -0.33], [0.045, -0.7], [0.05, -1.16]], c.stitch, 0.0013, [4, 4])
  p.line([[-0.29, -1.145], [-0.15, -1.153], [0, -1.155], [0.15, -1.153], [0.29, -1.145]], c.stitch, 0.0014, [4, 4])
  // slanted welt pockets
  for (const s of [1, -1]) {
    p.area([[s * 0.11, -0.585], [s * 0.128, -0.58], [s * 0.19, -0.7], [s * 0.172, -0.705]], c.lift)
    p.line([[s * 0.11, -0.585], [s * 0.172, -0.705]], c.seam, 0.0035)
    p.line([[s * 0.128, -0.58], [s * 0.19, -0.7]], c.seam, 0.0022)
  }
  // belt shadow (3D belt sits on top)
  p.line([[-0.2, -0.468], [0.2, -0.468]], c.seam, 0.006)
}

function paintTrenchBack(p: Painter, c: TrenchColours) {
  p.fillShapes(c.base)
  paintTwill(p, c)
  paintSleeves(p, c)
  // back storm yoke
  const yoke: Pt[] = [
    [-0.21, -0.07],
    [-0.214, -0.2],
    [-0.1, -0.23],
    [0, -0.24],
    [0.1, -0.23],
    [0.214, -0.2],
    [0.21, -0.07],
    [0.08, -0.004],
    [-0.08, -0.004],
  ]
  p.area(yoke, c.lift)
  p.line([[-0.214, -0.2], [-0.1, -0.23], [0, -0.24], [0.1, -0.23], [0.214, -0.2]], c.seam, 0.003)
  p.line([[-0.21, -0.19], [-0.1, -0.219], [0, -0.229], [0.1, -0.219], [0.21, -0.19]], c.stitch, 0.0013, [4, 4])
  // centre back seam and vent
  p.line([[0, -0.24], [0, -0.82]], c.seam, 0.0025)
  p.area([[0, -0.82], [0.03, -0.84], [0.03, -1.18], [0, -1.182]], c.lift)
  p.line([[0.03, -0.84], [0.03, -1.18]], c.seam, 0.003)
  p.line([[0, -0.82], [0.03, -0.84]], c.stitch, 0.0013, [3, 3])
  p.line([[-0.29, -1.145], [0, -1.155], [0.29, -1.145]], c.stitch, 0.0014, [4, 4])
  p.line([[-0.2, -0.468], [0.2, -0.468]], c.seam, 0.006)
}

const TRENCH_COLOURS: Record<GarmentId, TrenchColours> = {
  styling: {
    base: '#e8ddc8',
    seam: 'rgba(92, 64, 40, 0.42)',
    stitch: 'rgba(120, 92, 60, 0.55)',
    lift: '#efe6d4',
    lining: '#5c1626',
    sheen: '#fff6e6',
    belt: '#ded2bb',
  },
  collection: {
    base: '#5a1424',
    seam: 'rgba(20, 3, 8, 0.6)',
    stitch: 'rgba(214, 178, 104, 0.9)',
    lift: '#651a2b',
    lining: '#d8c39a',
    sheen: '#b5596c',
    belt: '#4f101e',
  },
  custom: {
    base: '#b5895a',
    seam: 'rgba(70, 44, 18, 0.5)',
    stitch: 'rgba(240, 214, 168, 0.75)',
    lift: '#bf9465',
    lining: '#5c1626',
    sheen: '#f6d8ab',
    belt: '#a97f50',
  },
}

const trenchSpec = (id: GarmentId): GarmentSpec => {
  const c = TRENCH_COLOURS[id]
  return {
    id,
    kind: 'trench',
    fabric: 'gabardine',
    width: 0.78,
    height: 1.182,
    shapes: [{ pts: trenchBody }, { pts: trenchSleeve }, { pts: flipX(trenchSleeve) }, { pts: trenchV, hole: true }],
    colours: c,
    depth: 0.052,
    round: 0.045,
    folds: id === 'styling' ? 0.012 : 0.01,
    roughness: id === 'collection' ? 0.68 : 0.62,
    sheen: id === 'collection' ? 0.55 : 0.4,
    buttons: [
      [-0.075, -0.34],
      [0.075, -0.34],
      [-0.075, -0.53],
      [0.075, -0.53],
      [-0.075, -0.63],
      [0.075, -0.63],
      // epaulettes
      [-0.1, -0.031],
      [0.1, -0.031],
      // storm flap
      [-0.115, -0.25],
    ],
    beltY: -0.44,
    paint: (p) => paintTrenchFront(p, c),
    paintBack: (p) => paintTrenchBack(p, c),
  }
}

export const GARMENT_SPECS: Record<GarmentId, GarmentSpec> = {
  styling: trenchSpec('styling'),
  collection: trenchSpec('collection'),
  custom: trenchSpec('custom'),
}

/* --------------------------- building blocks ---------------------------- */

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

function tracePath(ctx: CanvasRenderingContext2D, pts: Pt[], X: (x: number) => number, Y: (y: number) => number) {
  // smooth closed curve through midpoints (soft fabric corners)
  const n = pts.length
  const mid = (a: Pt, b: Pt): Pt => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
  const m0 = mid(pts[n - 1], pts[0])
  ctx.moveTo(X(m0[0]), Y(m0[1]))
  for (let i = 0; i < n; i++) {
    const p = pts[i]
    const m = mid(p, pts[(i + 1) % n])
    ctx.quadraticCurveTo(X(p[0]), Y(p[1]), X(m[0]), Y(m[1]))
  }
  ctx.closePath()
}

export interface BuiltGarment {
  spec: GarmentSpec
  front: THREE.BufferGeometry
  back: THREE.BufferGeometry
  mask: THREE.CanvasTexture
  /** silhouette for the back shell (no neckline cut-outs) */
  maskBack: THREE.CanvasTexture
  surface: THREE.CanvasTexture
  surfaceBack: THREE.CanvasTexture
  weave: THREE.Texture
  /** world z of the front shell at garment-space (x, y) */
  frontZ: (x: number, y: number) => number
  /** world z of the back shell at garment-space (x, y) (negative) */
  backZ: (x: number, y: number) => number
  dispose: () => void
}

const cache = new Map<GarmentId, BuiltGarment>()

export function buildGarment(id: GarmentId): BuiltGarment {
  const hit = cache.get(id)
  if (hit) return hit
  const spec = GARMENT_SPECS[id]
  const { width: w, height: h } = spec

  // ---- canvases ---------------------------------------------------------
  const CW = 1024
  const CH = Math.round((CW * h) / w)
  const X = (x: number) => ((x + w / 2) / w) * CW
  const Y = (y: number) => (-y / h) * CH
  const S = (m: number) => (m / w) * CW

  const drawShapes = (ctx: CanvasRenderingContext2D, fill: string, withHoles: boolean) => {
    for (const s of spec.shapes) {
      if (s.hole && !withHoles) continue
      ctx.globalCompositeOperation = s.hole ? 'destination-out' : 'source-over'
      ctx.fillStyle = fill
      ctx.beginPath()
      tracePath(ctx, s.pts, X, Y)
      ctx.fill()
    }
    ctx.globalCompositeOperation = 'source-over'
  }

  // silhouette layers (front has the neckline cut-outs; the back does not)
  const makeLayer = (withHoles: boolean) => {
    const c = document.createElement('canvas')
    c.width = CW
    c.height = CH
    drawShapes(c.getContext('2d')!, '#fff', withHoles)
    return c
  }
  const makeMask = (layer: HTMLCanvasElement) => {
    const c = document.createElement('canvas')
    c.width = CW
    c.height = CH
    const ctx = c.getContext('2d')!
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, CW, CH)
    ctx.drawImage(layer, 0, 0)
    const t = new THREE.CanvasTexture(c)
    t.anisotropy = 8
    return t
  }
  const hasHoles = spec.shapes.some((s) => s.hole)
  const layerFront = makeLayer(true)
  const layerBack = hasHoles ? makeLayer(false) : layerFront

  const makeSurface = (paint: (p: Painter) => void) => {
    const canvas = document.createElement('canvas')
    canvas.width = CW
    canvas.height = CH
    const sctx = canvas.getContext('2d')!
    const painter: Painter = {
      ctx: sctx,
      W: CW,
      H: CH,
      X,
      Y,
      S,
      fillShapes: (style) => {
        sctx.fillStyle = style
        sctx.fillRect(0, 0, CW, CH)
      },
      line: (pts, style, widthM, dash) => {
        sctx.save()
        sctx.strokeStyle = style
        sctx.lineWidth = Math.max(1, S(widthM))
        sctx.lineCap = 'round'
        sctx.lineJoin = 'round'
        if (dash) sctx.setLineDash(dash.map((d) => d * (CW / 1024) * 2))
        sctx.beginPath()
        pts.forEach(([x, y], i) => (i ? sctx.lineTo(X(x), Y(y)) : sctx.moveTo(X(x), Y(y))))
        sctx.stroke()
        sctx.restore()
      },
      area: (pts, style) => {
        sctx.save()
        sctx.fillStyle = style
        sctx.beginPath()
        tracePath(sctx, pts, X, Y)
        sctx.fill()
        sctx.restore()
      },
    }
    paint(painter)
    const t = new THREE.CanvasTexture(canvas)
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 8
    return t
  }
  const surface = makeSurface(spec.paint)
  const surfaceBack = makeSurface(spec.paintBack)

  // ---- distance field (metres to nearest edge) ---------------------------
  const GW = 240
  const GH = Math.round((GW * h) / w)
  const cell = w / GW
  const makeField = (layer: HTMLCanvasElement) => {
    const small = document.createElement('canvas')
    small.width = GW
    small.height = GH
    const smctx = small.getContext('2d')!
    smctx.drawImage(layer, 0, 0, GW, GH)
    const data = smctx.getImageData(0, 0, GW, GH).data
    const INF = 1e9
    const dist = new Float32Array(GW * GH)
    for (let i = 0; i < GW * GH; i++) dist[i] = data[i * 4 + 3] > 127 ? INF : 0
    const D1 = 1
    const D2 = Math.SQRT2
    const at = (x: number, y: number) => (x < 0 || y < 0 || x >= GW || y >= GH ? 0 : dist[y * GW + x])
    for (let y = 0; y < GH; y++)
      for (let x = 0; x < GW; x++) {
        const i = y * GW + x
        if (dist[i] === 0) continue
        dist[i] = Math.min(dist[i], at(x - 1, y) + D1, at(x, y - 1) + D1, at(x - 1, y - 1) + D2, at(x + 1, y - 1) + D2)
      }
    for (let y = GH - 1; y >= 0; y--)
      for (let x = GW - 1; x >= 0; x--) {
        const i = y * GW + x
        if (dist[i] === 0) continue
        dist[i] = Math.min(dist[i], at(x + 1, y) + D1, at(x, y + 1) + D1, at(x + 1, y + 1) + D2, at(x - 1, y + 1) + D2)
      }
    // relax the chamfer kinks (they read as terraced banding under raking light)
    const tmpD = new Float32Array(GW * GH)
    for (let pass = 0; pass < 3; pass++) {
      for (let y = 0; y < GH; y++)
        for (let x = 0; x < GW; x++) {
          const i = y * GW + x
          if (dist[i] === 0) {
            tmpD[i] = 0
            continue
          }
          let sum = 0
          for (let oy = -1; oy <= 1; oy++) for (let ox = -1; ox <= 1; ox++) sum += at(x + ox, y + oy)
          tmpD[i] = sum / 9
        }
      dist.set(tmpD)
    }
    return (x: number, y: number) => {
      const gx = ((x + w / 2) / w) * GW - 0.5
      const gy = (-y / h) * GH - 0.5
      const x0 = Math.floor(gx)
      const y0 = Math.floor(gy)
      const fx = gx - x0
      const fy = gy - y0
      const v = (xx: number, yy: number) => at(Math.min(GW - 1, Math.max(0, xx)), Math.min(GH - 1, Math.max(0, yy)))
      const a = v(x0, y0) * (1 - fx) + v(x0 + 1, y0) * fx
      const b = v(x0, y0 + 1) * (1 - fx) + v(x0 + 1, y0 + 1) * fx
      return Math.max(0, (a * (1 - fy) + b * fy - 0.35) * cell)
    }
  }
  const sampleFront = makeField(layerFront)
  const sampleBack = hasHoles ? makeField(layerBack) : sampleFront

  // ---- displacement -------------------------------------------------------
  const phaseSeed = id === 'styling' ? 0.7 : id === 'collection' ? 2.1 : 4.3
  const shellZ = (x: number, y: number, d: number, side: 1 | -1) => {
    const full = spec.depth * (side === 1 ? 1 : 0.82)
    const base = full * (1 - Math.exp(-d / spec.round))
    const vDown = Math.min(1, Math.max(0, -y / h))
    const fade = smoothstep(0, 0.03, d)
    const ph = phaseSeed + (side === 1 ? 0 : 1.7)
    const folds =
      spec.folds *
      Math.pow(vDown, 1.35) *
      (0.62 * Math.sin(x * 34 + ph + Math.sin(y * 5.5 + ph) * 1.3) + 0.38 * Math.sin(x * 15 - y * 2.6 + ph * 2.3))
    // drag lines from the hanger at the shoulders
    const drag = 0.0035 * Math.exp(-Math.pow((vDown - 0.08) / 0.07, 2)) * Math.sin(x * 70 + ph)
    // whole garment curves gently around an implied body
    const curve = 0.018 * (1 - Math.min(1, Math.pow(x / (w * 0.5), 2)))
    return side * (base + fade * (folds + drag)) + curve
  }

  const NX = 96
  const NY = Math.round((NX * h) / w)
  const buildShell = (side: 1 | -1) => {
    const verts = (NX + 1) * (NY + 1)
    const pos = new Float32Array(verts * 3)
    const uv = new Float32Array(verts * 2)
    const inside = new Uint8Array(verts)
    for (let iy = 0; iy <= NY; iy++) {
      for (let ix = 0; ix <= NX; ix++) {
        const i = iy * (NX + 1) + ix
        const x = (ix / NX - 0.5) * w
        const y = -(iy / NY) * h
        const d = side === 1 ? sampleFront(x, y) : sampleBack(x, y)
        inside[i] = d > 0 ? 1 : 0
        pos[i * 3] = x
        pos[i * 3 + 1] = y
        pos[i * 3 + 2] = shellZ(x, y, d, side)
        uv[i * 2] = ix / NX
        uv[i * 2 + 1] = 1 - iy / NY
      }
    }
    const index: number[] = []
    for (let iy = 0; iy < NY; iy++) {
      for (let ix = 0; ix < NX; ix++) {
        const a = ix + (NX + 1) * iy
        const b = ix + (NX + 1) * (iy + 1)
        const c = ix + 1 + (NX + 1) * (iy + 1)
        const dd = ix + 1 + (NX + 1) * iy
        if (!(inside[a] || inside[b] || inside[c] || inside[dd])) continue
        if (side === 1) index.push(a, b, dd, b, c, dd)
        else index.push(a, dd, b, b, dd, c)
      }
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('uv', new THREE.BufferAttribute(uv, 2))
    g.setIndex(index)
    g.computeVertexNormals()
    g.computeBoundingSphere()
    g.computeBoundingBox()
    return g
  }

  const front = buildShell(1)
  const back = buildShell(-1)

  const mask = makeMask(layerFront)
  const maskBack = hasHoles ? makeMask(layerBack) : mask
  const weave = makeWeaveNormal(spec.fabric)
  const reps = spec.fabric === 'velvet' ? 3 : spec.fabric === 'silk' ? 22 : spec.fabric === 'gabardine' ? 14 : 10
  weave.repeat.set(reps, (reps * h) / w)

  const built: BuiltGarment = {
    spec,
    front,
    back,
    mask,
    surface,
    surfaceBack,
    weave,
    maskBack,
    frontZ: (x, y) => shellZ(x, y, sampleFront(x, y), 1),
    backZ: (x, y) => shellZ(x, y, sampleBack(x, y), -1),
    dispose: () => {
      front.dispose()
      back.dispose()
      mask.dispose()
      maskBack.dispose()
      surface.dispose()
      surfaceBack.dispose()
      weave.dispose()
      cache.delete(id)
    },
  }
  cache.set(id, built)
  return built
}
