/* Content for the Custom Services page (/custom) — Deliverable 3.
   Prices, tiers and places come from data/site (TIERS, BRAND); this file holds only what is particular to this page.
   Copy: British spelling, PKR, quietly confident. No sales, no discount codes, no instalments. */

import { BRAND } from '../../data/site'

export type ServiceId = 'mtm' | 'consult' | 'colour' | 'corporate'

/** Sent from any section to the booking form: preselects a service (and optionally pre-fills notes). */
export interface BookingPreset {
  service: ServiceId
  note?: string
  nonce: number
}

export const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']

/* ── I · Tiers comparison (prices + inclusions live in TIERS) ────────────── */

export interface TierDetail {
  numeral: string
  timeline: string
  timelineNote: string
  bestFor: string
  cta: { label: string; to?: string; service?: ServiceId }
}

export const TIER_DETAILS: Record<string, TierDetail> = {
  core: {
    numeral: 'I',
    timeline: '3–5 days',
    timelineNote: 'Delivered nationwide in a rigid box',
    bestFor: 'A first formal wardrobe — consistent sizing per body shape, and capsule bundles that arrive with the how-to-wear card.',
    cta: { label: 'Shop the collection', to: '/collection' },
  },
  mtm: {
    numeral: 'II',
    timeline: '14 days',
    timelineNote: 'Measurements to rigid-box delivery — then kept on file',
    bestFor: 'A pitch, a board seat, a promotion — or a body that standard sizes never quite agreed with.',
    cta: { label: 'Book a fitting', service: 'mtm' },
  },
  consult: {
    numeral: 'III',
    timeline: '4–6 weeks',
    timelineNote: 'The styling session first, then the capsule in two drops',
    bestFor: 'Leaders who want the morning decision gone — colour, silhouette, workwear and occasion dressing, planned around the calendar.',
    cta: { label: 'Book a consultation', service: 'consult' },
  },
}

/* ── II · The atelier process ───────────────────────────────────────────── */

export const PROCESS = [
  {
    title: 'Consultation',
    body: 'A conversation before any tape comes out: your calendar, your climate, the rooms you walk into — and the formality each one asks for.',
    meta: 'Day 1 · 45 min',
  },
  {
    title: 'Colour analysis & measurements',
    body: 'Your palette read in daylight against the cloth, then measured by hand — with the notes no tape records, like how you sit at a long table.',
    meta: 'Day 1 · 45 min',
  },
  {
    title: 'Toile & first fitting',
    body: 'Your piece is cut first in calico, then pinned and chalked on you until shoulder, sleeve and hem sit exactly where they should.',
    meta: 'Day 6 · 45 min',
  },
  {
    title: 'Finishing',
    body: 'Cut in your chosen cloth and finished properly: bound seams, non-sheer plackets, real pockets deep enough for a phone.',
    meta: 'Days 7–13',
  },
  {
    title: 'Rigid-box delivery',
    body: 'Pressed and boxed with the how-to-wear card — one piece, worn three ways across your week. Your measurements stay on file for the next order.',
    meta: 'Day 14',
  },
]

/* ── III · Fit profile ──────────────────────────────────────────────────── */

export type MeasureId = 'shoulder' | 'bust' | 'waist' | 'hip' | 'sleeve' | 'back' | 'inseam'

export interface Measure {
  id: MeasureId
  label: string
  how: string
  /** valid range in centimetres */
  min: number
  max: number
  /** guide line drawn on the silhouette (viewBox -20 0 340 660) */
  guide: string
  /** whether the guide is measured around the body (dashed behind) */
  around?: boolean
  dot: [number, number]
  /** dimension tag position + text-anchor */
  tag: [number, number, 'start' | 'end']
}

export const MEASURES: Measure[] = [
  {
    id: 'shoulder',
    label: 'Shoulder',
    how: 'Stand relaxed. Measure across the back from the edge of one shoulder bone to the other, following the natural curve.',
    min: 32,
    max: 52,
    guide: 'M96,117 Q150,108 204,117',
    dot: [204, 117],
    tag: [214, 110, 'start'],
  },
  {
    id: 'bust',
    label: 'Bust',
    how: 'Around the fullest part of the bust, tape level under the arms and across the back. Wear the bra you would wear to work.',
    min: 72,
    max: 150,
    guide: 'M107,198 Q150,214 193,198',
    around: true,
    dot: [193, 198],
    tag: [203, 196, 'start'],
  },
  {
    id: 'waist',
    label: 'Waist',
    how: 'Find your natural waist — the narrowest point, usually just above the navel — and measure around it with one finger under the tape.',
    min: 56,
    max: 140,
    guide: 'M119,258 Q150,270 181,258',
    around: true,
    dot: [181, 258],
    tag: [191, 258, 'start'],
  },
  {
    id: 'hip',
    label: 'Hip',
    how: 'Feet together, measure around the fullest part of the hips and seat, keeping the tape parallel to the floor.',
    min: 78,
    max: 160,
    guide: 'M103,344 Q150,360 197,344',
    around: true,
    dot: [197, 344],
    tag: [207, 350, 'start'],
  },
  {
    id: 'sleeve',
    label: 'Sleeve',
    how: 'Arm relaxed and slightly bent: from the shoulder point, over the elbow, down to the wrist bone.',
    min: 48,
    max: 68,
    guide: 'M206,116 C219,121 225,138 225,156 C226,190 229,220 231,250 C233,285 235,315 235,342',
    dot: [235, 342],
    tag: [243, 392, 'start'],
  },
  {
    id: 'back',
    label: 'Back length',
    how: 'From the bone at the base of the neck straight down the spine to your natural waist. Easiest with a second pair of hands.',
    min: 34,
    max: 50,
    guide: 'M150,94 L150,262',
    dot: [150, 94],
    tag: [143, 150, 'end'],
  },
  {
    id: 'inseam',
    label: 'Inseam',
    how: 'Standing straight in flat shoes, from the top of the inner thigh down to the ankle bone.',
    min: 62,
    max: 92,
    guide: 'M147,370 C146,430 145,470 145,500 C144,540 145,580 144,610',
    dot: [147, 370],
    tag: [100, 500, 'end'],
  },
]

export const ADAPTIVE = [
  { id: 'elastic', label: 'Concealed elastic back', note: 'Flat-front trousers with a hidden elasticated back waist.' },
  { id: 'wrap', label: 'Adjustable wrap', note: 'Wrap silhouettes that move a full size either way.' },
  { id: 'maternity', label: 'Maternity', note: 'Extendable side seams and a raised, adjustable waist.' },
  { id: 'postpartum', label: 'Postpartum & nursing', note: 'Concealed nursing openings and soft, adjustable shaping.' },
  { id: 'modest', label: 'Modest lengths', note: 'Longer sleeves, higher necklines, ankle-length hems.' },
] as const

export type AdaptiveId = (typeof ADAPTIVE)[number]['id']

/** Femmora ready-to-wear size chart (cm). Index = size. */
export const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
export const SIZE_LIMITS: Partial<Record<MeasureId, number[]>> = {
  bust: [82, 88, 94, 100, 108],
  waist: [64, 70, 76, 84, 92],
  hip: [88, 94, 100, 106, 114],
}

/* ── IV · Organisations — “Dress for the Position You Hold” ─────────────── */

export const B2B_COLUMNS = [
  {
    title: 'The workshop',
    kicker: 'Corporate styling',
    items: [
      'Styling workshops at your offices or our flagship',
      'Dressing for the room: boardroom, client floor, conference stage',
      'Formality levels decoded for Western, fusion and kurta',
      'Colour analysis in small groups',
    ],
  },
  {
    title: 'The programme',
    kicker: 'Women’s leadership',
    items: [
      'For women leaders and high-potential talent',
      'Presence, posture and body language — alongside the wardrobe',
      'One-to-one wardrobe consultations for senior women',
      'Made-to-measure fittings, measurements kept on file',
    ],
  },
  {
    title: 'The practicalities',
    kicker: 'Quoted per programme',
    items: [
      'Group pricing, quoted per programme',
      'Sized to your cohort — a team, a floor or a leadership intake',
      'Lahore first — at your offices or the Dolmen Mall flagship',
      'One consolidated invoice for procurement',
    ],
  },
]

export const SECTORS = ['Banking & finance', 'Telecommunications', 'Technology']

/** 3.3% of full-time corporate roles in Pakistan are held by women — roughly one seat in thirty. */
export const SEATS = 30

/* ── V · Booking ────────────────────────────────────────────────────────── */

export const SERVICES: { id: ServiceId; name: string; short: string; duration: string; price: string; desc: string; signature?: boolean }[] = [
  {
    id: 'mtm',
    name: 'Made-to-Measure fitting',
    short: 'Made-to-Measure fitting',
    duration: '60 minutes',
    price: 'PKR 12,000 – 25,000 per piece',
    desc: 'Measurements, cloth and colour for one piece or several — kept on file for every repeat order.',
  },
  {
    id: 'consult',
    name: 'Premium Wardrobe Consultation',
    short: 'Wardrobe Consultation',
    duration: '90-minute styling session',
    price: 'From PKR 110,000',
    desc: 'Your styling session and a capsule of 8 to 12 pieces — one price for both.',
    signature: true,
  },
  {
    id: 'colour',
    name: 'Colour analysis workshop',
    short: 'Colour analysis',
    duration: '75 minutes',
    price: 'Fee confirmed on WhatsApp',
    desc: 'Your palette, read in daylight against the cloth — alone or with friends. Included in every consultation.',
  },
  {
    id: 'corporate',
    name: 'Corporate programme',
    short: 'Corporate programme',
    duration: '30-minute discovery call',
    price: 'Quoted per programme',
    desc: 'For HR and L&D teams planning “Dress for the Position You Hold” workshops or a women’s leadership programme.',
  },
]

export type LocationId = 'flagship' | 'private'

/** Where an appointment can be held today. Corporate programmes swap in their own wording. */
export const LOCATIONS: Record<
  LocationId,
  { title: string; corpTitle: string; where: string; note: string; corpNote: string; place: string; corpPlace: string }
> = {
  flagship: {
    title: 'The Femmora flagship',
    corpTitle: 'At the flagship',
    where: `${BRAND.stores[0].place}, ${BRAND.stores[0].city} · opening January 2027`,
    note: 'A private fitting room, the full cloth library and a stylist at your side. Choose a preferred hour in the opening fortnight.',
    corpNote: 'A private room at the flagship, with the programme outline and the cloth library laid out.',
    place: `Femmora flagship, ${BRAND.stores[0].place} ${BRAND.stores[0].city}`,
    corpPlace: `Femmora flagship, ${BRAND.stores[0].place} ${BRAND.stores[0].city}`,
  },
  private: {
    title: 'Private appointment',
    corpTitle: 'At your offices',
    where: 'At home or the office · available now',
    note: 'We come to you — with the tape, the cloth library and the sketchbook.',
    corpNote: 'We come to your HR or L&D team, with samples and a draft programme.',
    place: 'Private appointment — home or office',
    corpPlace: 'At your offices',
  },
}

/** Karachi and Islamabad follow the Lahore flagship — shown as “coming soon / join the list”. */
export const COMING_SOON = BRAND.stores.filter((s) => s.city !== 'Lahore').map((s) => ({ city: s.city, place: s.place }))

export const WEEKDAY_SLOTS = ['11:00', '12:30', '14:00', '15:30', '17:00', '18:30']
export const SATURDAY_SLOTS = ['11:00', '12:30', '14:00', '15:30']

/* ── VI · The Femmora Circle ────────────────────────────────────────────── */

export const CIRCLE = [
  { title: 'Early collection access', short: 'Early access', body: 'Each new chapter reaches the Circle before it reaches the website.' },
  { title: 'Private previews', short: 'Private previews', body: 'Quiet evenings at the flagship to see, try and reserve new pieces.' },
  { title: 'Styling recommendations', short: 'Styling notes', body: 'Notes from your stylist, built on the measurements and palette we keep on file.' },
  { title: 'Founder events', short: 'Founder events', body: 'Evenings with the founder and with women who run companies — the Circle, in one room.' },
]

export const CIRCLE_NEXT = 'Subscription styling — seasonal colour analysis, wardrobe guidance and AI-assisted styling, in the Femmora app.'

/* ── VII · FAQ ──────────────────────────────────────────────────────────── */

export const FAQ = [
  {
    q: 'How is Femmora priced?',
    a: 'Three tiers, one honest price each. Core Ready-to-Wear starts at PKR 4,500 a piece, with structured pieces such as trench coats, blazers and long vests priced above it. Made-to-Measure is PKR 12,000–25,000 a piece. The Premium Wardrobe Consultation starts at PKR 110,000 — one price for the styling session and a capsule of 8 to 12 pieces. Corporate programmes are quoted per programme.',
  },
  {
    q: 'Do you hold sales or offer discount codes?',
    a: 'No — no sales, no discount codes and no instalments. The price on a piece is the price all year, for everyone. We would rather earn your trust through fit, reviews and referrals.',
  },
  {
    q: 'Do I need to be measured every time?',
    a: 'Once. Your measurements are kept on file after your first fitting, so every repeat order is cut to you without another appointment. If your body changes — a pregnancy, a new routine, a year — we simply measure again.',
  },
  {
    q: 'How long does it take?',
    a: 'Made-to-measure takes about fourteen days from measurements to rigid-box delivery, including a toile fitting. Ready-to-wear arrives in 3–5 days nationwide. A consultation capsule is delivered over 4–6 weeks, in two considered drops.',
  },
  {
    q: 'What if something doesn’t fit perfectly?',
    a: 'Made-to-measure pieces are altered until they are right — that is what the fittings are for, and it costs you nothing. Ready-to-wear alterations are offered at the flagship and by private appointment.',
  },
  {
    q: 'Which fabrics do you work with?',
    a: 'Breathable cloth built for the office day and an eight-month summer: cotton gabardine for trench coats, cotton-linen and fluid crepe for kurtas and shirts, lightweight wool for air-conditioned rooms, and cable knits for winter. Every placket is lined, so nothing is sheer — and every piece has real pockets.',
  },
  {
    q: 'Can pieces be adapted for pregnancy or after birth?',
    a: 'Always. Concealed elastic backs, adjustable wraps, extendable side seams and discreet nursing openings can be built into any made-to-measure piece — and we re-fit as your body changes.',
  },
  {
    q: 'Can our organisation be invoiced?',
    a: 'Yes. Workshops and leadership programmes are quoted per programme and billed on one consolidated invoice with your NTN details, split by cost centre if you need it. We work to your procurement and vendor-onboarding process.',
  },
  {
    q: 'What is the Femmora Circle?',
    a: 'Our client circle. Membership begins with your first fitting or consultation: early access to each new collection, private previews at the flagship, styling recommendations and founder events. Subscription styling — with colour analysis, wardrobe guidance and AI-assisted styling — comes next.',
  },
  {
    q: 'Where can I be fitted?',
    a: 'At our flagship in Dolmen Mall, Lahore, from January 2027 — or by private appointment at home or at the office, available now. Dolmen Mall Karachi and Centaurus Islamabad follow; join the list and you will hear first.',
  },
]
