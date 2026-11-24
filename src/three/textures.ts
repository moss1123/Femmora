import * as THREE from 'three'

/* ---------------------------------------------------------------------------
   Procedural textures for the rack scene — no image files needed.
   --------------------------------------------------------------------------- */

export type FabricKind = 'silk' | 'velvet' | 'jacquard' | 'gabardine'

const canvas = (w: number, h: number) => {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return c
}

/** Tileable micro-weave normal map, generated from a height field. */
export function makeWeaveNormal(kind: FabricKind, size = 256) {
  const c = canvas(size, size)
  const ctx = c.getContext('2d')!
  const img = ctx.createImageData(size, size)
  const TAU = Math.PI * 2
  const height = (x: number, y: number) => {
    const u = x / size
    const v = y / size
    if (kind === 'silk') {
      // fine diagonal twill + faint slub
      return 0.5 * Math.sin(TAU * (u + v) * 48) + 0.12 * Math.sin(TAU * (u * 3 + Math.sin(TAU * v * 2) * 0.3) * 4)
    }
    if (kind === 'gabardine') {
      // steep, tight twill wale of a trench gabardine
      return 0.6 * Math.sin(TAU * (u * 2 + v) * 26) + 0.08 * Math.sin(TAU * (u * 5 + v * 3) * 2)
    }
    if (kind === 'velvet') {
      // crushed pile — soft low-frequency undulation
      return (
        0.55 * Math.sin(TAU * (u * 2 + v * 1)) * Math.cos(TAU * (v * 3 - u)) +
        0.3 * Math.sin(TAU * (u * 5 + Math.sin(TAU * v * 2) * 0.5)) +
        0.15 * Math.sin(TAU * (v * 9 + u * 2))
      )
    }
    // jacquard — basket weave
    const bx = Math.floor(u * 32) % 2
    const by = Math.floor(v * 32) % 2
    return bx === by ? Math.sin(TAU * u * 64) * 0.5 : Math.sin(TAU * v * 64) * 0.5
  }
  const strength = kind === 'velvet' ? 1.6 : kind === 'silk' ? 0.9 : kind === 'gabardine' ? 1.1 : 2.2
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = height(x + 1, y) - height(x - 1, y)
      const dy = height(x, y + 1) - height(x, y - 1)
      let nx = -dx * strength
      let ny = -dy * strength
      let nz = 1
      const l = Math.hypot(nx, ny, nz)
      nx /= l
      ny /= l
      nz /= l
      const i = (y * size + x) * 4
      img.data[i] = (nx * 0.5 + 0.5) * 255
      img.data[i + 1] = (ny * 0.5 + 0.5) * 255
      img.data[i + 2] = (nz * 0.5 + 0.5) * 255
      img.data[i + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.anisotropy = 8
  return t
}

/** Ogee-lattice damask, drawn straight into a garment's colour canvas. */
export function drawDamask(ctx: CanvasRenderingContext2D, W: number, H: number, base: string, motif: string, shade: string) {
  ctx.fillStyle = base
  ctx.fillRect(0, 0, W, H)
  const tw = W / 4.2
  const th = tw * 1.45
  ctx.lineCap = 'round'
  for (let row = -1; row < H / th + 1; row++) {
    for (let col = -1; col < W / tw + 1; col++) {
      const ox = col * tw + (row % 2 ? tw / 2 : 0)
      const oy = row * th
      // ogee frame
      ctx.strokeStyle = motif
      ctx.lineWidth = tw * 0.018
      ctx.beginPath()
      ctx.moveTo(ox + tw / 2, oy)
      ctx.bezierCurveTo(ox + tw * 0.05, oy + th * 0.22, ox + tw * 0.95, oy + th * 0.3, ox + tw / 2, oy + th / 2)
      ctx.bezierCurveTo(ox + tw * 0.05, oy + th * 0.7, ox + tw * 0.95, oy + th * 0.78, ox + tw / 2, oy + th)
      ctx.moveTo(ox + tw / 2, oy)
      ctx.bezierCurveTo(ox + tw * 0.95, oy + th * 0.22, ox + tw * 0.05, oy + th * 0.3, ox + tw / 2, oy + th / 2)
      ctx.bezierCurveTo(ox + tw * 0.95, oy + th * 0.7, ox + tw * 0.05, oy + th * 0.78, ox + tw / 2, oy + th)
      ctx.stroke()
      // flower
      const cx = ox + tw / 2
      const cy = oy + th / 4
      ctx.fillStyle = shade
      for (let p = 0; p < 6; p++) {
        ctx.save()
        ctx.translate(cx, cy)
        ctx.rotate((p / 6) * Math.PI * 2)
        ctx.beginPath()
        ctx.ellipse(0, -tw * 0.07, tw * 0.035, tw * 0.075, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }
      ctx.fillStyle = motif
      ctx.beginPath()
      ctx.arc(cx, cy, tw * 0.03, 0, Math.PI * 2)
      ctx.fill()
      // leaves on the lower node
      const ly = oy + th * 0.75
      ctx.strokeStyle = shade
      ctx.lineWidth = tw * 0.012
      for (const s of [-1, 1]) {
        ctx.beginPath()
        ctx.moveTo(cx, ly)
        ctx.quadraticCurveTo(cx + s * tw * 0.16, ly - th * 0.04, cx + s * tw * 0.22, ly + th * 0.03)
        ctx.quadraticCurveTo(cx + s * tw * 0.12, ly + th * 0.05, cx, ly)
        ctx.stroke()
      }
    }
  }
  // woven speckle
  const img = ctx.getImageData(0, 0, W, H)
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 14
    img.data[i] += n
    img.data[i + 1] += n
    img.data[i + 2] += n
  }
  ctx.putImageData(img, 0, 0)
}

/** Tailor's tape: cream ground, navy ticks, numbers every 10. */
export function makeTapeTexture() {
  const W = 48
  const H = 1536
  const c = canvas(W, H)
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#efd9a0'
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = '#c9a55c'
  ctx.fillRect(0, 0, 3, H)
  ctx.fillRect(W - 3, 0, 3, H)
  ctx.fillStyle = '#2a0a12'
  for (let i = 0; i < 160; i++) {
    const y = (i / 160) * H
    const long = i % 10 === 0
    const mid = i % 5 === 0
    ctx.fillRect(0, y, long ? W * 0.45 : mid ? W * 0.3 : W * 0.18, 1.5)
    if (long) {
      ctx.save()
      ctx.translate(W * 0.72, y + 2)
      ctx.rotate(Math.PI / 2)
      ctx.font = 'italic 15px Georgia, serif'
      ctx.fillText(String(i), 0, 0)
      ctx.restore()
    }
  }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  return t
}

/** Ivory hang-tag with a gold numeral and the page title. */
export function makeTagTexture(numeral: string, title: string) {
  const W = 360
  const H = 520
  const c = canvas(W, H)
  const ctx = c.getContext('2d')!
  const g = ctx.createLinearGradient(0, 0, W, H)
  g.addColorStop(0, '#fbf6ec')
  g.addColorStop(1, '#ece2cf')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)
  ctx.strokeStyle = '#b8954f'
  ctx.lineWidth = 3
  ctx.strokeRect(18, 18, W - 36, H - 36)
  ctx.lineWidth = 1
  ctx.strokeRect(28, 28, W - 56, H - 56)
  // eyelet
  ctx.fillStyle = '#c9a55c'
  ctx.beginPath()
  ctx.arc(W / 2, 62, 16, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#e9dfcb'
  ctx.beginPath()
  ctx.arc(W / 2, 62, 8, 0, Math.PI * 2)
  ctx.fill()
  ctx.textAlign = 'center'
  ctx.fillStyle = '#a9853f'
  ctx.font = 'italic 400 120px "Bodoni Moda Variable", "Bodoni Moda", Didot, Georgia, serif'
  ctx.fillText(numeral, W / 2, 240)
  ctx.fillStyle = '#2a0a12'
  ctx.font = 'italic 400 50px "Cormorant Garamond", Garamond, Georgia, serif'
  const words = title.split(' ')
  if (words.length > 1 && title.length > 10) {
    ctx.fillText(words.slice(0, -1).join(' '), W / 2, 330)
    ctx.fillText(words[words.length - 1], W / 2, 384)
  } else {
    ctx.fillText(title, W / 2, 350)
  }
  ctx.fillStyle = '#84662e'
  ctx.font = '500 17px "Jost Variable", Jost, Futura, sans-serif'
  ;(ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = '6px'
  ctx.fillText('FEMMORA', W / 2, 460)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  return t
}

/** Soft radial glow sprite (the light pool on the back wall). */
export function makeGlowTexture(inner = 'rgba(138, 34, 56, 0.55)', outer = 'rgba(20, 5, 10, 0)') {
  const S = 512
  const c = canvas(S, S)
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2)
  g.addColorStop(0, inner)
  g.addColorStop(0.45, inner.replace(/[\d.]+\)$/, '0.18)'))
  g.addColorStop(1, outer)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, S, S)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}
