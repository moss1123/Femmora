/* Femmora — "Beyond the Silhouette", Chapter One. The collection catalogue (demo data).
   Source: Group 1, MKTG 201, Deliverable 3 — Western, equestrian / country-club ("old-money")
   formal workwear led by the trench coat, plus kurtas and fusion wear with clear formality levels.
   Prices per Appendix 4A/4B: Core ready-to-wear from PKR 4,500 per piece (structured pieces above
   it); Made-to-Measure PKR 12,000–25,000 per piece, measurements kept on file. No sales, no
   discount codes, no instalments. */

export type Category = 'Outerwear' | 'Tailoring' | 'Knitwear' | 'Shirts' | 'Trousers' | 'Fusion' | 'Accessories'

export const CATEGORIES: Category[] = ['Outerwear', 'Tailoring', 'Knitwear', 'Shirts', 'Trousers', 'Fusion', 'Accessories']

/** Silhouette drawn by the SVG technical flat (pages/collection/GarmentFlat). */
export type GarmentKind =
  | 'trench'
  | 'long-coat'
  | 'blazer'
  | 'riding-blazer'
  | 'cable-crew'
  | 'cable-cardigan'
  | 'silk-shirt'
  | 'poplin-shirt'
  | 'trouser'
  | 'wide-trouser'
  | 'kurta'
  | 'long-vest'
  | 'scarf'
  | 'belt'

/** Surface treatment drawn over the flat. */
export type Texture =
  | 'gabardine'
  | 'wool'
  | 'twill'
  | 'linen'
  | 'cable'
  | 'silk'
  | 'poplin'
  | 'crepe'
  | 'damask'
  | 'foulard'
  | 'leather'

/** Colour families used by the filter bar. Navy survives only as a product colour. */
export type ColourFamily = 'burgundy' | 'ivory' | 'camel' | 'noir' | 'charcoal' | 'navy' | 'emerald'

export const COLOUR_FAMILIES: { id: ColourFamily; name: string; hex: string }[] = [
  { id: 'burgundy', name: 'Burgundy', hex: '#6e1423' },
  { id: 'ivory', name: 'Ivory', hex: '#efe7d8' },
  { id: 'camel', name: 'Camel', hex: '#b08d63' },
  { id: 'noir', name: 'Noir', hex: '#141418' },
  { id: 'charcoal', name: 'Charcoal', hex: '#3a3a3e' },
  { id: 'navy', name: 'Navy', hex: '#1d2a4a' },
  { id: 'emerald', name: 'Emerald', hex: '#1f4d3a' },
]

export interface Colourway {
  name: string
  hex: string
  family: ColourFamily
}

/* ---------- formality — Differentiator III: clear formality levels ---------- */

export type FormalityLevel = 1 | 2 | 3 | 4

export const FORMALITY_LEVELS: FormalityLevel[] = [1, 2, 3, 4]

export const FORMALITY: Record<FormalityLevel, { numeral: string; label: string; when: string }> = {
  1: { numeral: 'I', label: 'Smart casual', when: 'Desk days, Fridays, travel' },
  2: { numeral: 'II', label: 'Business', when: 'Every office day, client lunches' },
  3: { numeral: 'III', label: 'Boardroom', when: 'Pitches, board meetings, presentations' },
  4: { numeral: 'IV', label: 'Formal', when: 'Ceremonies, awards, formal dinners' },
}

export interface Product {
  id: string
  /** catalogue number, shown as "No. 01" */
  no: string
  name: string
  /** one-line descriptor under the name */
  short: string
  category: Category
  /** PKR per piece, Core ready-to-wear */
  price: number
  /** PKR per piece when cut to her measurements (12,000–25,000); undefined → not offered */
  mtmPrice?: number
  formality: FormalityLevel
  /** how the piece moves up or down a level */
  formalityNote: string
  /** sized XS–XXL, or a single adjustable size (accessories) */
  sizing: 'sized' | 'one-size'
  /** colours[0] is the default */
  colours: Colourway[]
  /** short cloth name for swatch captions, e.g. "Wool gabardine" */
  cloth: string
  fabric: string
  care: string[]
  features: string[]
  description: string
  garment: GarmentKind
  texture: Texture
  /** the moodboard line the piece belongs to */
  mood: 'The Modern Founder' | 'The Executive' | 'The Equestrian'
  /** editorial order for "Featured" sort */
  featured: number
}

export const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const
export type Size = (typeof SIZES)[number]

/** Core ready-to-wear entry price, per piece (Appendix 4A). */
export const CORE_FROM = 4500
/** Made-to-measure price band, per piece (Appendix 4A). */
export const MTM_RANGE = { min: 12000, max: 25000 } as const

const C = {
  burgundy: { name: 'Burgundy', hex: '#6e1423', family: 'burgundy' },
  oxblood: { name: 'Oxblood', hex: '#4e0d18', family: 'burgundy' },
  ivory: { name: 'Ivory', hex: '#efe7d8', family: 'ivory' },
  champagne: { name: 'Champagne', hex: '#e2cfa6', family: 'ivory' },
  camel: { name: 'Camel', hex: '#b08d63', family: 'camel' },
  tobacco: { name: 'Tobacco', hex: '#86603c', family: 'camel' },
  cognac: { name: 'Cognac', hex: '#8f5a32', family: 'camel' },
  noir: { name: 'Noir', hex: '#141418', family: 'noir' },
  charcoal: { name: 'Charcoal', hex: '#3a3a3e', family: 'charcoal' },
  navy: { name: 'Navy', hex: '#1d2a4a', family: 'navy' },
  emerald: { name: 'Emerald', hex: '#1f4d3a', family: 'emerald' },
} satisfies Record<string, Colourway>

const TRENCH_CARE = ['Dry clean only', 'Brush after wear; steam to refresh', 'Rest on a broad-shouldered hanger, belt fastened']

export const PRODUCTS: Product[] = [
  {
    id: 'burgundy-trench',
    no: '01',
    name: 'The Burgundy Trench',
    short: 'Wool gabardine, double-breasted, belted',
    category: 'Outerwear',
    price: 18500,
    mtmPrice: 24500,
    formality: 3,
    formalityNote: 'Boardroom over tailoring. Worn open over a cable knit, it settles to Business.',
    sizing: 'sized',
    colours: [C.burgundy, C.oxblood],
    cloth: 'Wool gabardine',
    fabric: 'Wool gabardine, tightly twilled and showerproofed; half-lined in breathable cupro.',
    care: TRENCH_CARE,
    features: [
      'Double-breasted front with gold-tone buttons',
      'Storm flap, epaulettes and buckled cuff straps',
      'Belted waist with a gold-tone buckle',
      'Deep slash pockets — phone-and-pen deep',
      'Breathable cupro half lining',
    ],
    description:
      'The piece that leads Chapter One. A double-breasted trench in burgundy wool gabardine — storm flap, epaulettes, a belt that sets the waist — cut with structure at the shoulder and room through the body to go over a blazer or a kurta. It doesn’t decorate. It decides.',
    garment: 'trench',
    texture: 'gabardine',
    mood: 'The Executive',
    featured: 1,
  },
  {
    id: 'ivory-trench',
    no: '02',
    name: 'The Ivory Trench',
    short: 'Cotton gabardine, double-breasted, belted',
    category: 'Outerwear',
    price: 16500,
    mtmPrice: 22000,
    formality: 2,
    formalityNote: 'Business by day. Belted over the Silk Shirt and tailored trousers, it reaches Boardroom.',
    sizing: 'sized',
    colours: [C.ivory, C.champagne],
    cloth: 'Cotton gabardine',
    fabric: 'Tightly woven cotton gabardine with a water-repellent finish; unlined body, cupro-lined sleeves.',
    care: TRENCH_CARE,
    features: [
      'Double-breasted front with gold-tone buttons',
      'Storm flap and epaulettes',
      'Unlined body — light enough for spring and an air-conditioned office',
      'Deep slash pockets',
      'Belt with a gold-tone buckle',
    ],
    description:
      'The lightest of the three trenches — cotton gabardine in ivory, made for the short spring and the long, air-conditioned office. Belted for a waist, open for a line, and the easiest way to make a poplin shirt and trousers look like a decision.',
    garment: 'trench',
    texture: 'gabardine',
    mood: 'The Executive',
    featured: 2,
  },
  {
    id: 'camel-trench',
    no: '03',
    name: 'The Camel Trench',
    short: 'Wool-cotton gabardine, the one we cut to measure',
    category: 'Outerwear',
    price: 19500,
    mtmPrice: 25000,
    formality: 3,
    formalityNote: 'Boardroom over a blazer. Over the Cable-Knit Crew, it is Smart casual for the weekend.',
    sizing: 'sized',
    colours: [C.camel, C.tobacco],
    cloth: 'Wool-cotton gabardine',
    fabric: 'Wool-cotton gabardine, showerproofed; half-lined in breathable cupro.',
    care: TRENCH_CARE,
    features: [
      'Deep storm flap and throat latch',
      'Double-breasted front with gold-tone buttons',
      'Buckled cuff straps and epaulettes',
      'Belted waist with a gold-tone buckle',
      'Most often made to measure — your pattern kept on file',
    ],
    description:
      'The trench of the Custom Services chapter, and the one we most often cut to measure. Camel wool-cotton gabardine with a deep storm flap and buckled cuffs, after the riding coats of the country-club set — measured once, kept on file, re-cut for every order after.',
    garment: 'trench',
    texture: 'gabardine',
    mood: 'The Equestrian',
    featured: 3,
  },
  {
    id: 'noir-long-coat',
    no: '04',
    name: 'The Noir Long Coat',
    short: 'Wool crêpe, single-breasted, long-line',
    category: 'Outerwear',
    price: 19500,
    mtmPrice: 25000,
    formality: 4,
    formalityNote: 'Formal over the Structured Kurta and Tailored Long Vest. Over a blazer, Boardroom.',
    sizing: 'sized',
    colours: [C.noir, C.charcoal, C.navy],
    cloth: 'Wool crêpe',
    fabric: 'Lightweight wool crêpe, half-lined in breathable cupro.',
    care: ['Dry clean only', 'Brush after wear', 'Rest on a broad-shouldered hanger'],
    features: [
      'Floats over a kurta or a blazer without bulk',
      'Wide notch lapel, two gold-tone buttons',
      'Flap pockets, hands-in deep',
      'Breathable half lining for a Lahore winter — and an air-conditioned office',
    ],
    description:
      'The coat for the walk from the car to the room. Long, fluid and quietly severe, in a crêpe light enough to layer over a kurta and a long vest without adding weight — the one Formal piece you will also wear on a Tuesday.',
    garment: 'long-coat',
    texture: 'crepe',
    mood: 'The Modern Founder',
    featured: 4,
  },
  {
    id: 'equestrian-blazer',
    no: '05',
    name: 'The Equestrian Blazer',
    short: 'Wool-cotton twill, hacking cut, gold crest buttons',
    category: 'Tailoring',
    price: 14500,
    mtmPrice: 23000,
    formality: 2,
    formalityNote: 'Business with trousers. Over the Silk Shirt and Wide-Leg Pleated Trouser, Boardroom.',
    sizing: 'sized',
    colours: [C.emerald, C.navy, C.noir],
    cloth: 'Wool-cotton twill',
    fabric: 'Wool-cotton twill, half-lined, with breathable underarm gussets.',
    care: ['Dry clean only', 'Brush with the nap', 'Store buttoned on a shaped hanger'],
    features: [
      'Three gold-tone crest buttons',
      'Fitted waist with a flared riding skirt',
      'Slanted hacking pockets and a ticket pocket',
      'Breathable underarm gussets',
    ],
    description:
      'Grace, heritage, discipline. A hacking jacket from the hunt field and the polo ground — fitted waist, flared skirt, slanted pockets — re-cut in a breathable wool-cotton twill and closed with three gold crest buttons. Wear it with ivory trousers and the room straightens up.',
    garment: 'riding-blazer',
    texture: 'twill',
    mood: 'The Equestrian',
    featured: 5,
  },
  {
    id: 'boardroom-blazer',
    no: '06',
    name: 'The Boardroom Blazer',
    short: 'Breathable wool-linen, unlined',
    category: 'Tailoring',
    price: 12500,
    mtmPrice: 21500,
    formality: 3,
    formalityNote: 'Boardroom with matching trousers. Over the Cable-Knit Crew, Business.',
    sizing: 'sized',
    colours: [C.charcoal, C.burgundy, C.navy, C.ivory],
    cloth: 'Wool-linen suiting',
    fabric: 'Wool-linen suiting (55/45), unlined, with bound inner seams.',
    care: ['Dry clean', 'Steam to refresh between wears', 'Rest a day between wears'],
    features: [
      'Unlined for heat — wearable twelve months of the year',
      'Single gold-tone button',
      'Real flap pockets, stitched open',
      'Soft-canvas shoulder, no padding',
    ],
    description:
      'A heavy Western blazer is unwearable eight months of the year here, so we kept the authority of suiting and lost the weight: unlined wool-linen, a sharp notch lapel, one gold button and flap pockets you can actually use.',
    garment: 'blazer',
    texture: 'linen',
    mood: 'The Executive',
    featured: 6,
  },
  {
    id: 'cable-knit-crew',
    no: '07',
    name: 'The Cable-Knit Crew',
    short: 'Merino-cotton cable knit, crew neck',
    category: 'Knitwear',
    price: 7500,
    formality: 1,
    formalityNote: 'Smart casual on its own. Under the Equestrian Blazer, Business.',
    sizing: 'sized',
    colours: [C.ivory, C.camel, C.burgundy, C.charcoal],
    cloth: 'Merino-cotton cable knit',
    fabric: 'Breathable merino-cotton (60/40), fully fashioned.',
    care: ['Cool hand wash', 'Dry flat, reshaped', 'Fold — never hang'],
    features: [
      'Central cable with flanking ropes',
      'Breathable merino-cotton — no itch, no overheating',
      'Ribbed crew neck, cuffs and hem',
      'Fully fashioned — knitted to shape, not cut',
    ],
    description:
      'The country-club staple, built for an office with the air-conditioning on. A crew-neck cable knit in breathable merino-cotton, with a central cable and two flanking ropes — over a poplin collar on a desk day, under the Ivory Trench on the way home.',
    garment: 'cable-crew',
    texture: 'cable',
    mood: 'The Equestrian',
    featured: 7,
  },
  {
    id: 'cable-knit-cardigan',
    no: '08',
    name: 'The Cable-Knit Cardigan',
    short: 'V-neck cable cardigan, gold-tone buttons',
    category: 'Knitwear',
    price: 8500,
    formality: 2,
    formalityNote: 'Business over the Silk Shirt. Over the Poplin Shirt with open collar, Smart casual.',
    sizing: 'sized',
    colours: [C.camel, C.ivory, C.emerald, C.noir],
    cloth: 'Merino-cotton cable knit',
    fabric: 'Breathable merino-cotton (60/40), fully fashioned.',
    care: ['Cool hand wash', 'Dry flat, reshaped', 'Fold — never hang'],
    features: [
      'Twin cables either side of the button band',
      'Five gold-tone buttons',
      'Two patch pockets',
      'Ribbed band that holds its line',
    ],
    description:
      'Softer than a blazer and every bit as considered. A V-neck cardigan in merino-cotton with twin cables, gold-tone buttons and a ribbed band that keeps its line — the layer for a long day at the desk and a cold boardroom after.',
    garment: 'cable-cardigan',
    texture: 'cable',
    mood: 'The Equestrian',
    featured: 8,
  },
  {
    id: 'silk-shirt',
    no: '09',
    name: 'The Silk Shirt',
    short: 'Weighted silk crêpe de Chine, never sheer',
    category: 'Shirts',
    price: 6500,
    mtmPrice: 13500,
    formality: 3,
    formalityNote: 'Boardroom under a blazer. Tucked into the Flat-Front Trouser, Business.',
    sizing: 'sized',
    colours: [C.ivory, C.burgundy, C.emerald, C.noir],
    cloth: 'Silk crêpe de Chine',
    fabric: 'Weighted silk crêpe de Chine, 22 momme — opaque, never sheer.',
    care: ['Dry clean or cool hand wash', 'Roll in a towel; never wring', 'Cool iron on the reverse'],
    features: [
      'Opaque weighted silk — for a glass-walled office',
      'Concealed placket that never gapes',
      'Softened point collar, worn open or closed',
      'Long cuffs with gold-tone buttons',
    ],
    description:
      'Soft where the blazer is sharp. A weighted silk shirt with a softened point collar and a concealed placket — opaque enough for a glass-walled office, fluid enough for a twelve-hour day.',
    garment: 'silk-shirt',
    texture: 'silk',
    mood: 'The Modern Founder',
    featured: 9,
  },
  {
    id: 'poplin-shirt',
    no: '10',
    name: 'The Poplin Shirt',
    short: 'Crisp cotton poplin, classic collar',
    category: 'Shirts',
    price: 4500,
    mtmPrice: 12000,
    formality: 2,
    formalityNote: 'Business tucked in. Under the Cable-Knit Crew, Smart casual.',
    sizing: 'sized',
    colours: [C.ivory, C.navy, C.noir],
    cloth: 'Two-ply cotton poplin',
    fabric: 'Crisp, breathable two-ply cotton poplin.',
    care: ['Machine wash at 30°', 'Hang to dry', 'Iron while slightly damp'],
    features: [
      'Collar interfaced to stand under tailoring',
      'Non-sheer placket that never gapes',
      'Barrel cuffs and a single chest pocket',
      'Breathable two-ply cotton',
    ],
    description:
      'The entry to the house, and the shirt everything else is built around. Crisp cotton poplin with a collar interfaced to stand under a blazer and a placket that stays closed — from PKR 4,500, and finished like the rest of the chapter.',
    garment: 'poplin-shirt',
    texture: 'poplin',
    mood: 'The Executive',
    featured: 10,
  },
  {
    id: 'flat-front-trouser',
    no: '11',
    name: 'The Flat-Front Trouser',
    short: 'Concealed elastic back, pressed crease',
    category: 'Trousers',
    price: 5500,
    mtmPrice: 12500,
    formality: 2,
    formalityNote: 'Business on its own. With the Boardroom Blazer in the same colour, Boardroom.',
    sizing: 'sized',
    colours: [C.charcoal, C.noir, C.navy, C.ivory],
    cloth: 'Stretch wool suiting',
    fabric: 'Stretch wool-blend suiting with recovery; breathable.',
    care: ['Cool machine wash', 'Hang to dry', 'Press along the crease'],
    features: [
      'Concealed elastic back — flat front, forgiving back',
      'Deep slant pockets',
      'Pressed crease that holds',
      'Machine-washable',
    ],
    description:
      'The trouser we were asked for most. Flat and tailored at the front, with an elastic back hidden inside the waistband — for long days, for working mothers, for bodies that change. No one sees it; you feel it at six in the evening.',
    garment: 'trouser',
    texture: 'wool',
    mood: 'The Executive',
    featured: 11,
  },
  {
    id: 'wide-leg-pleated-trouser',
    no: '12',
    name: 'The Wide-Leg Pleated Trouser',
    short: 'Fluid cotton-silk twill, high rise',
    category: 'Trousers',
    price: 6500,
    mtmPrice: 13500,
    formality: 3,
    formalityNote: 'Boardroom with a blazer. With the Cable-Knit Cardigan, Business.',
    sizing: 'sized',
    colours: [C.ivory, C.camel, C.burgundy, C.noir],
    cloth: 'Cotton-silk twill',
    fabric: 'Fluid cotton-silk twill; breathable and opaque.',
    care: ['Cool machine wash, delicate cycle', 'Hang to dry', 'Press along the crease'],
    features: [
      'Double forward pleats',
      'High rise with an extended tab',
      'Deep side pockets',
      'Length cut for heels or flats',
    ],
    description:
      'A long, liquid line from waist to floor. Double forward pleats, a high rise and a hem that skims the shoe — the trouser that makes a silk shirt look like a decision.',
    garment: 'wide-trouser',
    texture: 'twill',
    mood: 'The Executive',
    featured: 12,
  },
  {
    id: 'structured-kurta',
    no: '13',
    name: 'The Structured Kurta',
    short: 'Fusion kurta, mandarin collar, gold-button placket',
    category: 'Fusion',
    price: 7500,
    mtmPrice: 15500,
    formality: 3,
    formalityNote: 'Boardroom with the Flat-Front Trouser. Add the Tailored Long Vest — or the Noir Long Coat — for Formal.',
    sizing: 'sized',
    colours: [C.burgundy, C.ivory, C.emerald, C.noir],
    cloth: 'Anti-crease cotton-silk',
    fabric: 'Anti-crease cotton-silk with 2% stretch; cotton-silk facing at the yoke.',
    care: ['Cool machine wash, delicate cycle', 'Hang to dry', 'Steam, never press hard'],
    features: [
      'Mandarin collar, interfaced to stand all day',
      'Gold-tone buttons on a non-sheer double placket',
      'Deep side-seam pockets — 17 cm, phone-and-pen deep',
      'Side slits for a full stride',
    ],
    description:
      'Modest and authoritative at once — our answer to the double bind. A long, structured kurta with a standing mandarin collar and a column of gold buttons, cut close through the shoulder and straight through the body, so it reads as tailoring in any boardroom and as unmistakably yours everywhere else.',
    garment: 'kurta',
    texture: 'silk',
    mood: 'The Modern Founder',
    featured: 13,
  },
  {
    id: 'tailored-long-vest',
    no: '14',
    name: 'The Tailored Long Vest',
    short: 'Sleeveless long-line, tone-on-tone damask',
    category: 'Fusion',
    price: 9500,
    mtmPrice: 18500,
    formality: 3,
    formalityNote: 'Boardroom over trousers. Worn open over the Structured Kurta, Formal.',
    sizing: 'sized',
    colours: [C.ivory, C.noir, C.emerald],
    cloth: 'Tone-on-tone damask',
    fabric: 'Tone-on-tone damask jacquard; half-lined in breathable cupro.',
    care: ['Dry clean only', 'Steam lightly from inside', 'Store folded in tissue'],
    features: [
      'Long-line, worn open over kurtas or trousers',
      'Concealed inner pockets on both fronts',
      'Structured shoulder with no padding',
      'Breathable cupro half lining',
    ],
    description:
      'A sleeveless layer that gives any outfit a shoulder line. Worn open over the Structured Kurta for the board meeting; over the Silk Shirt and wide trousers for the dinner after. Tone-on-tone damask, so it reads as texture — never as embellishment.',
    garment: 'long-vest',
    texture: 'damask',
    mood: 'The Executive',
    featured: 14,
  },
  {
    id: 'silk-scarf',
    no: '15',
    name: 'The Silk Scarf',
    short: 'Silk twill, stirrup foulard, hand-rolled edges',
    category: 'Accessories',
    price: 4500,
    formality: 2,
    formalityNote: 'Lifts any look by one level — knotted at the neck under a trench, or tied at the waist.',
    sizing: 'one-size',
    colours: [C.burgundy, C.navy, C.emerald],
    cloth: 'Silk twill foulard',
    fabric: 'Pure silk twill, 180 × 25 cm, printed with a gold stirrup-and-bit foulard.',
    care: ['Dry clean', 'Cool iron on the reverse', 'Store rolled, never folded'],
    features: [
      'Pure silk twill',
      'Gold stirrup-and-bit foulard print',
      'Hand-rolled edges',
      '180 × 25 cm — long enough to knot twice',
    ],
    description:
      'The finishing note, never the headline. Silk twill printed with a small gold stirrup-and-bit foulard and hand-rolled at the edges — knotted at the neck under the Ivory Trench, or tied through the belt loops of the Wide-Leg Pleated Trouser.',
    garment: 'scarf',
    texture: 'foulard',
    mood: 'The Equestrian',
    featured: 15,
  },
  {
    id: 'gold-buckle-belt',
    no: '16',
    name: 'The Gold-Buckle Belt',
    short: 'Calf leather, gold-tone harness buckle',
    category: 'Accessories',
    price: 5500,
    formality: 3,
    formalityNote: 'Boardroom at the waist of a trouser or a kurta; Smart casual on the hip over a knit.',
    sizing: 'one-size',
    colours: [C.noir, C.burgundy, C.cognac],
    cloth: 'Full-grain calf leather',
    fabric: 'Full-grain calf leather, 2.5 cm wide; solid brass buckle with a gold-tone finish.',
    care: ['Wipe clean with a dry cloth', 'Condition twice a year', 'Store flat or rolled'],
    features: [
      'Full-grain calf leather, edge-painted by hand',
      'Gold-tone harness buckle and keeper',
      'Five holes — set at the waist or on the hip',
      'Narrow 2.5 cm width for trousers and kurtas alike',
    ],
    description:
      'A narrow calf-leather belt with a gold-tone harness buckle — the detail that makes a trouser and a knit look finished. Five holes, set to sit at the waist or on the hip.',
    garment: 'belt',
    texture: 'leather',
    mood: 'The Equestrian',
    featured: 16,
  },
]

export const productById = (id: string) => PRODUCTS.find((p) => p.id === id)
export const isMtm = (p: Product) => p.mtmPrice !== undefined

/** Body measurements (inches) behind Femmora's consistent ready-to-wear sizing. */
export const SIZE_GUIDE: Record<Size, { bust: number; waist: number; hip: number }> = {
  XS: { bust: 32, waist: 26, hip: 35 },
  S: { bust: 34, waist: 28, hip: 37 },
  M: { bust: 36, waist: 30, hip: 39 },
  L: { bust: 38, waist: 32, hip: 41 },
  XL: { bust: 40, waist: 34, hip: 43 },
  XXL: { bust: 42, waist: 36, hip: 45 },
}

/**
 * The capsule principle: every piece is cut to interchange with the others.
 * Used by the quick view's "Wear it with" row.
 */
const PAIRINGS: Record<string, string[]> = {
  'burgundy-trench': ['boardroom-blazer', 'flat-front-trouser', 'silk-scarf'],
  'ivory-trench': ['cable-knit-crew', 'wide-leg-pleated-trouser', 'silk-shirt'],
  'camel-trench': ['equestrian-blazer', 'cable-knit-crew', 'gold-buckle-belt'],
  'noir-long-coat': ['structured-kurta', 'tailored-long-vest', 'flat-front-trouser'],
  'equestrian-blazer': ['silk-shirt', 'wide-leg-pleated-trouser', 'gold-buckle-belt'],
  'boardroom-blazer': ['poplin-shirt', 'flat-front-trouser', 'burgundy-trench'],
  'cable-knit-crew': ['poplin-shirt', 'wide-leg-pleated-trouser', 'ivory-trench'],
  'cable-knit-cardigan': ['silk-shirt', 'flat-front-trouser', 'gold-buckle-belt'],
  'silk-shirt': ['boardroom-blazer', 'wide-leg-pleated-trouser', 'cable-knit-cardigan'],
  'poplin-shirt': ['boardroom-blazer', 'flat-front-trouser', 'cable-knit-crew'],
  'flat-front-trouser': ['structured-kurta', 'boardroom-blazer', 'poplin-shirt'],
  'wide-leg-pleated-trouser': ['silk-shirt', 'equestrian-blazer', 'gold-buckle-belt'],
  'structured-kurta': ['tailored-long-vest', 'flat-front-trouser', 'noir-long-coat'],
  'tailored-long-vest': ['structured-kurta', 'silk-shirt', 'wide-leg-pleated-trouser'],
  'silk-scarf': ['ivory-trench', 'poplin-shirt', 'wide-leg-pleated-trouser'],
  'gold-buckle-belt': ['cable-knit-crew', 'wide-leg-pleated-trouser', 'camel-trench'],
}

export const pairsFor = (id: string): Product[] =>
  (PAIRINGS[id] ?? []).map(productById).filter((p): p is Product => !!p)

export const MTM_COUNT = PRODUCTS.filter(isMtm).length
export const PRICE_FROM = Math.min(...PRODUCTS.map((p) => p.price))

/* ==========================================================================
   Capsule bundles — Core pieces sold as a set, with the printed how-to-wear card.
   One set, one price: the sum of the pieces at their Core price. Never discounted.
   ========================================================================== */

export interface CapsuleLook {
  name: string
  when: string
  /** product ids worn together */
  pieces: string[]
  formality: FormalityLevel
}

export interface Capsule {
  id: string
  name: string
  short: string
  /** the pieces and the colourway each comes in */
  pieces: { id: string; colour: number }[]
  /** colourway label used in the bag */
  colourway: string
  looks: CapsuleLook[]
}

const B = 'boardroom-blazer'
const SILK = 'silk-shirt'
const POP = 'poplin-shirt'
const FLAT = 'flat-front-trouser'
const WIDE = 'wide-leg-pleated-trouser'
const KURTA = 'structured-kurta'
const VEST = 'tailored-long-vest'

export const CAPSULES: Capsule[] = [
  {
    id: 'capsule-chapter-one',
    name: 'The Chapter One Capsule',
    short: 'Western workwear · five Core pieces · eight outfits',
    pieces: [
      { id: B, colour: 0 },
      { id: SILK, colour: 1 },
      { id: POP, colour: 0 },
      { id: FLAT, colour: 0 },
      { id: WIDE, colour: 0 },
    ],
    colourway: 'Charcoal, burgundy & ivory',
    // 2 shirts × 2 trousers × blazer on or off = 8 outfits — all printed on the card.
    looks: [
      { name: 'The pitch', when: 'Monday, 9 a.m.', pieces: [B, SILK, WIDE], formality: 3 },
      { name: 'The board meeting', when: 'Quarter end', pieces: [B, SILK, FLAT], formality: 3 },
      { name: 'The client day', when: 'Out of the office', pieces: [B, POP, FLAT], formality: 3 },
      { name: 'The first day', when: 'New team, new room', pieces: [B, POP, WIDE], formality: 2 },
      { name: 'The long day', when: 'Nine to nine', pieces: [SILK, FLAT], formality: 2 },
      { name: 'The dinner after', when: 'Blazer on the chair', pieces: [SILK, WIDE], formality: 2 },
      { name: 'The desk day', when: 'Heads down', pieces: [POP, FLAT], formality: 2 },
      { name: 'The Friday', when: 'Sleeves rolled', pieces: [POP, WIDE], formality: 1 },
    ],
  },
  {
    id: 'capsule-fusion',
    name: 'The Fusion Capsule',
    short: 'Kurta & fusion · five Core pieces · eight outfits',
    pieces: [
      { id: KURTA, colour: 0 },
      { id: VEST, colour: 1 },
      { id: SILK, colour: 0 },
      { id: FLAT, colour: 1 },
      { id: WIDE, colour: 0 },
    ],
    colourway: 'Burgundy, noir & ivory',
    // 2 tops × 2 trousers × long vest on or off = 8 outfits, from Smart casual to Formal.
    looks: [
      { name: 'The ceremony', when: 'Awards, formal dinners', pieces: [KURTA, VEST, FLAT], formality: 4 },
      { name: 'The reception', when: 'Evening, quietly formal', pieces: [KURTA, VEST, WIDE], formality: 4 },
      { name: 'The board meeting', when: 'Quarter end', pieces: [KURTA, FLAT], formality: 3 },
      { name: 'The pitch', when: 'Monday, 9 a.m.', pieces: [SILK, VEST, FLAT], formality: 3 },
      { name: 'The dinner after', when: 'Vest worn open', pieces: [SILK, VEST, WIDE], formality: 3 },
      { name: 'The client lunch', when: 'Out of the office', pieces: [KURTA, WIDE], formality: 2 },
      { name: 'The long day', when: 'Nine to nine', pieces: [SILK, FLAT], formality: 2 },
      { name: 'The Friday', when: 'Desk day', pieces: [SILK, WIDE], formality: 1 },
    ],
  },
]

export const capsuleById = (id: string) => CAPSULES.find((c) => c.id === id)
export const capsulePrice = (c: Capsule) =>
  c.pieces.reduce((sum, piece) => sum + (productById(piece.id)?.price ?? 0), 0)
