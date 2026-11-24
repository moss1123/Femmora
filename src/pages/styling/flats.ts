/*
 * Femmora technical flats — gold hairline line-art of the house silhouettes.
 * Every garment is drawn front-on in its own viewBox. `lines` are drawn on with
 * pathLength, `details` (stitching, seams, creases, purl channels) fade in as dashed
 * hairlines, `dots` are buttons / studs, filled. `fill` is an optional closed
 * silhouette that can be washed with a fabric colour (the three trench coats).
 */

export type FlatId =
  | 'trench'
  | 'cable-knit'
  | 'bow-blouse'
  | 'power-kurta'
  | 'long-vest'
  | 'blazer'
  | 'shirt'
  | 'shell'
  | 'wide-trouser'
  | 'cigarette-trouser'
  | 'pencil-skirt'
  | 'duster'
  | 'stole'
  | 'silk-square'
  | 'pumps'
  | 'loafers'
  | 'riding-boot'
  | 'tote'
  | 'clutch'
  | 'drops'
  | 'watch'
  | 'belt'
  | 'brooch'

export interface FlatDef {
  name: string
  /** viewBox width, height */
  vb: [number, number]
  lines: string[]
  details?: string[]
  dots?: [number, number, number][]
  /** closed silhouette used for an optional colour wash */
  fill?: string
}

/** circle as two arcs so it can be drawn with pathLength */
const ring = (cx: number, cy: number, r: number) =>
  `M${cx - r} ${cy} a${r} ${r} 0 1 0 ${r * 2} 0 a${r} ${r} 0 1 0 ${-r * 2} 0`

/** a flower of `n` almond petals radiating from (cx, cy) */
const petals = (cx: number, cy: number, n: number, len: number, width: number) =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2
    const p = (r: number, off: number) => {
      const x = cx + Math.cos(a) * r - Math.sin(a) * off
      const y = cy + Math.sin(a) * r + Math.cos(a) * off
      return `${x.toFixed(1)} ${y.toFixed(1)}`
    }
    return `M${p(9, 0)} Q${p(len * 0.62, width)} ${p(len, 0)} Q${p(len * 0.62, -width)} ${p(9, 0)}`
  }).join(' ')

/** Two strands twisting round each other — a knitted cable, from y0 down to y1. */
const cable = (cx: number, y0: number, y1: number, w: number, step: number): [string, string] => {
  const n = Math.floor((y1 - y0) / step)
  let a = `M${cx - w} ${y0}`
  let b = `M${cx + w} ${y0}`
  for (let i = 0; i < n; i++) {
    const m = y0 + i * step + step / 2
    const e = y0 + (i + 1) * step
    const [from, to] = i % 2 === 0 ? [cx - w, cx + w] : [cx + w, cx - w]
    a += ` C${from} ${m} ${to} ${m} ${to} ${e}`
    b += ` C${to} ${m} ${from} ${m} ${from} ${e}`
  }
  return [a, b]
}

/** a row of short vertical rib lines (knitted welts) */
const ribs = (x0: number, x1: number, y0: number, y1: number, gap: number) => {
  let d = ''
  for (let x = x0; x <= x1; x += gap) d += `M${x} ${y0}V${y1}`
  return d
}

const CABLE_C = cable(120, 54, 216, 7, 18)
const CABLE_L = cable(89, 60, 216, 5.5, 15.6)
const CABLE_R = cable(151, 60, 216, 5.5, 15.6)

export const FLATS: Record<FlatId, FlatDef> = {
  /* The hero piece — a belted, double-breasted trench: storm flap, epaulettes, cuff straps, welt pockets. */
  trench: {
    name: 'The Femmora Trench',
    vb: [240, 380],
    lines: [
      'M98 30 L64 40 C52 44 44 54 42 68 L28 252 L50 256 L66 124 L68 176',
      'M142 30 L176 40 C188 44 196 54 198 68 L212 252 L190 256 L174 124 L172 176',
      'M68 190 C62 240 54 300 46 360 Q120 370 194 360 C186 300 178 240 172 190',
      'M66 176 L174 176 L174 190 L66 190 Z',
      'M98 30 L92 17 Q120 11 148 17 L142 30',
      'M142 128 L72 72 L86 62 L98 30',
      'M142 128 L106 38',
      'M142 128 L168 72 L156 62 L142 30',
      'M142 128 L136 38',
      'M142 128 L144 176',
      'M144 190 L148 364',
      'M66 46 L70 104 L106 99',
      'M92 31 L65 40 L67 46 L94 37 Z',
      'M148 31 L175 40 L173 46 L146 37 Z',
      'M110 172 L130 172 L130 194 L110 194 Z',
      'M114 177 L126 177 L126 189 L114 189 Z',
      'M128 194 L130 220 L137 219 L134 194',
      'M72 173 V193 M168 173 V193',
      'M66 240 L94 232 L96 239 L68 247 Z',
      'M152 232 L175 240 L173 247 L150 239 Z',
      'M30 226 L53 231 L52 237 L29 232 Z',
      'M210 226 L187 231 L188 237 L211 232 Z',
    ],
    details: [
      'M64 40 C62 72 64 100 66 124',
      'M176 40 C178 72 176 100 174 124',
      'M52 352 Q120 362 188 352',
      'M139 192 L143 360',
      'M70 52 L73 100 L101 96',
      'M96 22 Q120 16 144 22',
    ],
    dots: [
      [108, 140, 2.4],
      [134, 140, 2.4],
      [108, 162, 2.4],
      [134, 162, 2.4],
      [108, 204, 2.4],
      [134, 204, 2.4],
      [108, 224, 2.4],
      [134, 224, 2.4],
      [88, 35, 1.5],
      [152, 35, 1.5],
      [71, 51, 1.5],
    ],
    fill: 'M98 30 L92 17 Q120 11 148 17 L142 30 L176 40 C188 44 196 54 198 68 L212 252 L190 256 L174 124 L172 176 L174 176 L174 190 L172 190 C178 240 186 300 194 360 Q120 370 46 360 C54 300 62 240 68 190 L66 190 L66 176 L68 176 L66 124 L50 256 L28 252 L42 68 C44 54 52 44 64 40 Z',
  },

  /* Country-club cable knit: crew neck, three cables, ribbed welts. */
  'cable-knit': {
    name: 'The Cable Knit',
    vb: [240, 270],
    lines: [
      'M98 30 Q120 46 142 30 L176 40 C190 46 196 58 198 72 L214 224 L190 230 L176 112 L176 236 L64 236 L64 112 L50 230 L26 224 L42 72 C44 58 50 46 64 40 Z',
      'M103 29 Q120 40 137 29',
      'M98 30 Q120 21 142 30',
      'M64 222 L176 222',
      'M27.5 210 L51.5 216',
      'M212.5 210 L188.5 216',
      ...CABLE_C,
      ...CABLE_L,
      ...CABLE_R,
      ribs(70, 170, 224, 234, 6),
    ],
    details: ['M104 56 V214', 'M136 56 V214', 'M76 62 V214', 'M164 62 V214'],
  },

  'bow-blouse': {
    name: 'The Bow Blouse',
    vb: [240, 300],
    lines: [
      'M100 32 L62 43 C49 47 41 56 38 70 L22 232 L44 238 L64 116 L65 268 Q120 276 175 268 L176 116 L196 238 L218 232 L202 70 C199 56 191 47 178 43 L140 32',
      'M100 32 Q120 38 140 32',
      'M100 32 Q108 56 120 76 Q132 56 140 32',
      'M114 79 Q120 74 126 79 Q128 87 120 91 Q112 87 114 79 Z',
      'M114 82 C99 67 82 73 88 87 C92 97 106 93 114 86',
      'M126 82 C141 67 158 73 152 87 C148 97 134 93 126 86',
      'M116 90 C110 113 103 135 96 159 L104 162 C110 139 116 115 119 91',
      'M124 90 C130 113 137 135 144 159 L136 162 C130 139 124 115 121 91',
      'M24 214 L46 220',
      'M216 214 L194 220',
    ],
    details: [
      'M120 94 L120 266',
      'M69 258 Q120 266 171 258',
      'M62 43 C60 70 62 95 64 116',
      'M178 43 C180 70 178 95 176 116',
    ],
    dots: [
      [35, 226, 1.6],
      [205, 226, 1.6],
    ],
  },

  'power-kurta': {
    name: 'The Power Kurta',
    vb: [240, 340],
    lines: [
      'M102 30 L64 41 C52 45 46 53 44 64 L30 200 L50 205 L68 110 L67 262 L60 322 Q120 330 180 322 L173 262 L172 110 L190 205 L210 200 L196 64 C194 53 188 45 176 41 L138 30',
      'M102 30 L102 19 Q120 24 138 19 L138 30 Q120 35 102 30 Z',
      'M115 33 L115 152 L125 152 L125 33',
      'M67 262 L75 322',
      'M173 262 L165 322',
      'M69 180 L81 212',
      'M171 180 L159 212',
      'M32 186 L51 191',
      'M208 186 L189 191',
    ],
    details: [
      'M64 313 Q120 321 176 313',
      'M64 41 C62 70 66 92 68 110',
      'M176 41 C178 70 174 92 172 110',
      'M104 25 Q120 30 136 25',
    ],
    dots: [
      [120, 50, 2],
      [120, 76, 2],
      [120, 102, 2],
      [120, 128, 2],
    ],
  },

  'long-vest': {
    name: 'The Atelier Long Vest',
    vb: [220, 360],
    lines: [
      'M88 24 L58 34 C56 62 60 84 70 100 C64 160 60 250 56 344 Q82 349 109 348 L110 158',
      'M132 24 L162 34 C164 62 160 84 150 100 C156 160 160 250 164 344 Q138 349 111 348 L110 158',
      'M110 158 L74 66 L86 56 L88 24',
      'M110 158 L146 66 L134 56 L132 24',
      'M110 158 L97 40',
      'M110 158 L123 40',
      'M88 24 Q110 31 132 24',
      'M68 214 L95 211 L95 216 L68 219 Z',
      'M125 211 L152 214 L152 219 L125 216 Z',
    ],
    details: [
      'M80 104 Q86 220 82 344',
      'M140 104 Q134 220 138 344',
      'M60 336 Q110 341 160 336',
    ],
    dots: [[110, 168, 2.6]],
  },

  blazer: {
    name: 'The Structured Blazer',
    vb: [240, 300],
    lines: [
      'M98 26 L60 38 C48 42 40 52 38 66 L24 238 L46 243 L62 122 L63 262 Q90 268 119 266 L120 156',
      'M142 26 L180 38 C192 42 200 52 202 66 L216 238 L194 243 L178 122 L177 262 Q150 268 121 266 L120 156',
      'M120 156 L82 72 L94 62 L98 26',
      'M120 156 L158 72 L146 62 L142 26',
      'M120 156 L105 40',
      'M120 156 L135 40',
      'M98 26 Q120 32 142 26',
      'M70 198 L102 196 L102 206 L70 208 Z',
      'M138 196 L170 198 L170 208 L138 206 Z',
      'M140 108 L162 105',
      'M26 222 L47 227',
      'M214 222 L193 227',
    ],
    details: [
      'M60 38 C58 70 60 98 62 122',
      'M180 38 C182 70 180 98 178 122',
      'M66 255 Q92 260 116 258',
      'M124 258 Q148 260 174 255',
    ],
    dots: [
      [120, 168, 2.6],
      [33, 233, 1.3],
      [39, 234, 1.3],
      [207, 233, 1.3],
      [201, 234, 1.3],
    ],
  },

  shirt: {
    name: 'The Poplin Shirt',
    vb: [240, 300],
    lines: [
      'M100 30 L62 42 C49 46 41 55 38 69 L22 230 L44 236 L64 114 L64 262 C90 274 150 274 176 262 L176 114 L196 236 L218 230 L202 69 C199 55 191 46 178 42 L140 30',
      'M100 30 Q120 36 140 30',
      'M100 30 L90 52 L117 62 L120 44 L123 62 L150 52 L140 30',
      'M116 62 L116 270',
      'M124 62 L124 270',
      'M24 212 L46 218',
      'M216 212 L194 218',
    ],
    details: [
      'M68 254 C92 264 148 264 172 254',
      'M62 42 C60 68 62 92 64 114',
      'M178 42 C180 68 178 92 176 114',
    ],
    dots: [
      [120, 78, 1.7],
      [120, 106, 1.7],
      [120, 134, 1.7],
      [120, 162, 1.7],
      [120, 190, 1.7],
      [120, 218, 1.7],
      [120, 246, 1.7],
    ],
  },

  shell: {
    name: 'The Fine-knit Shell',
    vb: [220, 240],
    lines: [
      'M84 22 Q110 42 136 22 L160 32 C155 54 158 76 170 92 L172 222 Q110 230 48 222 L50 92 C62 76 65 54 60 32 Z',
      'M89 27 Q110 47 131 27',
    ],
    details: [
      'M50 210 Q110 218 170 210',
      'M65 35 C61 56 63 76 56 90',
      'M155 35 C159 56 157 76 164 90',
    ],
  },

  'wide-trouser': {
    name: 'The Wide-leg Trouser',
    vb: [200, 320],
    lines: [
      'M56 14 L144 14 L144 30 L56 30 Z',
      'M56 30 L38 306 L96 309 L100 112 L104 309 L162 306 L144 30',
      'M60 32 L76 72',
      'M140 32 L124 72',
      'M72 14 L72 30',
      'M128 14 L128 30',
    ],
    details: [
      'M74 42 L67 302',
      'M126 42 L133 302',
      'M100 34 L108 34 L108 92 Q108 102 100 104',
    ],
    dots: [[100, 22, 2]],
  },

  'cigarette-trouser': {
    name: 'The Cigarette Trouser',
    vb: [200, 320],
    lines: [
      'M64 14 L136 14 L136 28 L64 28 Z',
      'M64 28 L58 308 L95 310 L100 108 L105 310 L142 308 L136 28',
      'M66 30 L77 62',
      'M134 30 L123 62',
      'M78 14 L78 28',
      'M122 14 L122 28',
    ],
    details: [
      'M79 40 L77 304',
      'M121 40 L123 304',
      'M100 32 L107 32 L107 88 Q107 98 100 100',
    ],
    dots: [[100, 21, 1.8]],
  },

  'pencil-skirt': {
    name: 'The Midi Pencil Skirt',
    vb: [200, 260],
    lines: [
      'M62 14 L138 14 L138 28 L62 28 Z',
      'M62 28 C54 80 56 170 62 244 Q100 249 138 244 C144 170 146 80 138 28',
      'M100 206 L100 247',
    ],
    details: [
      'M82 30 L84 70',
      'M118 30 L116 70',
      'M64 236 Q100 241 136 236',
    ],
    dots: [[131, 21, 1.6]],
  },

  duster: {
    name: 'The Linen Duster',
    vb: [240, 360],
    lines: [
      'M98 24 L62 36 C50 40 42 50 40 64 L26 252 L48 256 L64 124 L60 344 Q89 350 118 348 L120 150',
      'M142 24 L178 36 C190 40 198 50 200 64 L214 252 L192 256 L176 124 L180 344 Q151 350 122 348 L120 150',
      'M98 24 C86 64 98 108 120 150',
      'M142 24 C154 64 142 108 120 150',
      'M98 24 Q120 30 142 24',
      'M64 160 L176 160',
      'M64 170 L176 170',
      'M112 170 L102 214 L110 216 L117 172',
      'M126 170 L136 212 L128 214 L121 172',
      'M72 226 L102 226 L102 262 L72 262 Z',
      'M138 226 L168 226 L168 262 L138 262 Z',
      'M28 236 L49 241',
      'M212 236 L191 241',
    ],
    details: [
      'M62 36 C60 72 62 100 64 124',
      'M178 36 C180 72 178 100 176 124',
      'M64 336 Q90 341 116 340',
      'M124 340 Q150 341 176 336',
    ],
  },

  stole: {
    name: 'The Silk Stole',
    vb: [120, 320],
    lines: [
      'M34 12 C22 80 44 150 30 290 L78 300 C90 160 66 90 84 14 Z',
      'M48 26 C40 92 58 160 46 286',
      'M68 22 C60 96 76 176 64 296',
      'M32 292 L30 308',
      'M41 294 L40 310',
      'M50 295 L50 311',
      'M59 297 L60 313',
      'M68 298 L70 314',
      'M76 299 L79 314',
    ],
  },

  /* Equestrian silk square, folded on the bias, a stirrup at its heart. */
  'silk-square': {
    name: 'The silk square',
    vb: [120, 120],
    lines: [
      'M60 4 L116 60 L60 116 L4 60 Z',
      'M60 17 L103 60 L60 103 L17 60 Z',
      'M48 72 C44 54 50 43 60 43 C70 43 76 54 72 72',
      'M44 72 L76 72 L76 77 L44 77 Z',
      'M60 43 L60 33',
    ],
    details: ['M60 10 L110 60 L60 110 L10 60 Z'],
    dots: [[60, 31, 1.8]],
  },

  pumps: {
    name: 'Pointed pumps',
    vb: [180, 112],
    lines: [
      'M8 88 C28 84 50 76 68 64 C84 70 104 66 118 54 C130 46 142 38 152 34 C158 44 158 56 154 66 L150 104 L146 104 L142 72 C126 74 110 82 96 92 C80 100 40 100 14 98 C6 97 4 92 8 88 Z',
      'M68 64 C74 70 76 78 72 86',
    ],
    details: ['M16 94 C40 96 78 94 96 88'],
  },

  loafers: {
    name: 'Leather loafers',
    vb: [180, 100],
    lines: [
      'M10 74 C20 60 44 54 70 54 C84 54 92 48 104 44 C124 38 150 40 164 48 C172 54 172 72 168 82 L18 84 C10 84 6 80 10 74 Z',
      'M18 84 L168 82 L168 90 L20 92 Z',
      'M60 58 C78 66 98 62 108 46',
      'M72 60 L74 70 L98 68 L96 56',
    ],
    details: ['M30 78 L160 76'],
  },

  /* Tall riding boot, toe to the right. */
  'riding-boot': {
    name: 'Riding boots',
    vb: [120, 200],
    lines: [
      'M30 8 L80 10 C80 60 80 110 80 140 C84 154 98 160 110 166 C118 170 118 184 110 186 L42 186 L42 194 L26 194 L28 160 C28 110 30 60 30 8 Z',
      'M30 21 Q55 25 80 22',
      'M42 186 L110 186',
    ],
    details: ['M46 181 L106 181', 'M80 141 C70 147 56 147 42 143', 'M34 30 L32 150'],
  },

  tote: {
    name: 'The structured tote',
    vb: [160, 150],
    lines: [
      'M24 56 L136 56 L148 140 L12 140 Z',
      'M50 56 C50 18 110 18 110 56',
      'M60 56 C60 30 100 30 100 56',
      'M72 64 L88 64 L88 76 L72 76 Z',
    ],
    details: ['M28 62 L132 62', 'M16 132 L144 132'],
  },

  clutch: {
    name: 'The envelope clutch',
    vb: [160, 100],
    lines: ['M10 28 L150 28 L150 90 L10 90 Z', 'M10 28 L80 62 L150 28'],
    details: ['M16 84 L144 84'],
    dots: [[80, 62, 3]],
  },

  drops: {
    name: 'Gold drop earrings',
    /* the drawing spans y 12–104: a 116-high sheet keeps it optically centred in its slot */
    vb: [120, 116],
    lines: [
      ring(36, 18, 6),
      'M36 24 L36 46',
      'M36 46 C22 70 22 92 36 104 C50 92 50 70 36 46 Z',
      ring(84, 18, 6),
      'M84 24 L84 46',
      'M84 46 C70 70 70 92 84 104 C98 92 98 70 84 46 Z',
    ],
    details: ['M36 60 C29 74 29 88 36 96', 'M84 60 C77 74 77 88 84 96'],
  },

  watch: {
    name: 'A slim gold watch',
    vb: [100, 170],
    lines: [
      'M38 6 L62 6 L60 58 L40 58 Z',
      'M40 112 L60 112 L62 164 L38 164 Z',
      ring(50, 85, 27),
      ring(50, 85, 21),
      'M50 85 L50 70',
      'M50 85 L61 91',
      'M77 82 L82 82 L82 88 L77 88',
    ],
    dots: [
      [50, 132, 1.5],
      [50, 144, 1.5],
    ],
  },

  belt: {
    name: 'A fine leather belt',
    vb: [220, 60],
    lines: [
      'M6 22 L84 22 M110 22 L214 22 L214 38 L110 38 M84 38 L6 38 L6 22',
      'M84 14 L110 14 L110 46 L84 46 Z',
      'M90 20 L104 20 L104 40 L90 40 Z',
    ],
    dots: [
      [140, 30, 1.4],
      [154, 30, 1.4],
      [168, 30, 1.4],
    ],
  },

  brooch: {
    name: 'A gold brooch',
    vb: [100, 100],
    lines: [petals(50, 50, 6, 38, 13), ring(50, 50, 8)],
    dots: [[50, 50, 2.4]],
  },
}

export const flatAspect = (id: FlatId) => FLATS[id].vb[0] / FLATS[id].vb[1]
