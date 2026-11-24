/* Shared brand + routing data. Source: Group 1 MKTG 201 Deliverables 1, 2 and 3 (final marketing strategy). */

export type GarmentId = 'styling' | 'collection' | 'custom'

export interface RoutePage {
  id: GarmentId
  path: string
  numeral: string
  title: string
  /** short italic subtitle for rack labels / transitions */
  kicker: string
  /** the trench coat hanging on the rack that represents this page */
  garment: string
  /** colour the screen floods to when the coat zooms in (= page hero background) */
  flood: string
  /** page theme scope */
  theme: 'ivory' | 'wine' | 'parchment'
}

export const PAGES: RoutePage[] = [
  {
    id: 'styling',
    path: '/styling',
    numeral: 'I',
    title: 'Styling',
    kicker: 'Dress the woman you’re becoming',
    garment: 'The Ivory Trench — cotton gabardine',
    flood: '#f3ede2',
    theme: 'ivory',
  },
  {
    id: 'collection',
    path: '/collection',
    numeral: 'II',
    title: 'The Collection',
    kicker: 'Beyond the Silhouette — Chapter One',
    garment: 'The Burgundy Trench — wool gabardine',
    flood: '#2a0a12',
    theme: 'wine',
  },
  {
    id: 'custom',
    path: '/custom',
    numeral: 'III',
    title: 'Custom Services',
    kicker: 'Made to measure. Made to lead.',
    garment: 'The Camel Trench — made to measure',
    flood: '#e8dcc2',
    theme: 'parchment',
  },
]

export const pageById = (id: GarmentId) => PAGES.find((p) => p.id === id)!
export const pageByPath = (path: string) => PAGES.find((p) => p.path === path)

export const BRAND = {
  name: 'Femmora',
  tagline: 'For women who lead.',
  /** launch campaign (Deliverable 3) */
  motto: 'Beyond the Silhouette.',
  promise: 'Dress the woman you’re becoming.',
  madeBy: 'Made by Women, For Women',
  positioning:
    'Femmora sells the confidence of wearing it. Where others sell clothes that fit a professional setting, Femmora is formal workwear built around fit, comfort and a styling service — so that both a first-job professional and a founder can dress for the position she holds.',
  personaQuote: '“My clothes should say I’m competent, and still say I’m me.”',
  personaName: 'Sana, 32 — founder',
  cities: ['Lahore', 'Karachi', 'Islamabad'],
  studio: 'Flagship · Dolmen Mall, Lahore — opening January 2027',
  stores: [
    { city: 'Lahore', place: 'Dolmen Mall', when: 'Flagship · January 2027' },
    { city: 'Karachi', place: 'Dolmen Mall', when: 'Next' },
    { city: 'Islamabad', place: 'Centaurus', when: 'Planned' },
  ],
  whatsapp: 'WhatsApp Concierge',
  instagram: '@femmora',
  email: 'concierge@femmora.pk',
}

/** The four core tenets of Femmora (Deliverable 3, 3c). */
export const TENETS = ['Empowerment', 'Timelessness', 'Confidence & Ambition', 'Modesty without Compromise']

/** How Femmora differs — Deliverable 3, product differentiation. */
export const DIFFERENTIATORS = [
  {
    numeral: 'I',
    title: 'Measurement-led',
    body: 'Not one-size-fits-all — the most repeated complaint in our research. Every design can be cut to your measurements and kept on file for the next order.',
  },
  {
    numeral: 'II',
    title: 'Built for the office day',
    body: 'Real pockets, breathable fabric and structured cuts — not decoration. Pieces that see you from a nine o’clock pitch to a nine o’clock dinner.',
  },
  {
    numeral: 'III',
    title: 'Clear formality levels',
    body: 'Every trench, blazer, kurta and fusion piece carries a clear formality level, so you never have to guess what counts as formal.',
  },
  {
    numeral: 'IV',
    title: 'Personal in-store help',
    body: 'Styling help in person, because it earned the warmest reviews in our research — at our flagship in Dolmen Mall, Lahore, and by appointment.',
  },
]

/** Three tiers + pricing — Deliverable 3, Appendix 4A & 4B. No sales, no discount codes. */
export const TIERS = [
  {
    id: 'core',
    name: 'Core Ready-to-Wear',
    price: 'From PKR 4,500',
    priceNote: 'per piece · structured pieces such as trench coats, blazers and long vests priced above',
    blurb: 'Signature pieces in a consistent sizing per body shape — affordable office formal wear that isn’t occasion wear.',
    audience: 'Career Starters',
    includes: ['Signature pieces, sized per body shape', 'Pockets, breathable fabric, structured cuts', 'Capsule bundles with a how-to-wear card', 'Rigid-box delivery'],
  },
  {
    id: 'mtm',
    name: 'Made-to-Measure',
    price: 'PKR 12,000 – 25,000',
    priceNote: 'per piece · the premium pays for the fitting and the wait',
    blurb: 'The same designs cut to your measurements — and kept on file for every repeat order.',
    audience: 'Rising Leaders',
    includes: ['Measured in store or by appointment', 'Measurements kept on file', 'Colour & fabric selection', 'One fitting, one final'],
  },
  {
    id: 'consult',
    name: 'Premium Wardrobe Consultation',
    price: 'From PKR 110,000',
    priceNote: 'per engagement · one price for the session and the wardrobe',
    blurb: 'A styling session and a capsule wardrobe of 8 to 12 pieces — one price for a full working wardrobe, tailored to you.',
    audience: 'Rising Leaders',
    includes: ['Colour analysis', 'Body & silhouette guidance', 'A capsule of 8–12 pieces', 'Workwear & occasion styling'],
  },
]

/** Campaign architecture — Deliverable 3, Appendix 4D. */
export const CAMPAIGNS = [
  { name: 'Beyond the Silhouette', role: 'Brand introduction & positioning — the value we add beyond the piece: consultation, colour analysis, confidence.' },
  { name: 'Made by Women, For Women', role: 'Awareness — premium OOH on MM Alam Road, Gulberg, DHA Phase 6 and Dolmen Mall; Instagram, Meta, PR and the founder story.' },
  { name: 'Every Woman is a Femmora', role: 'Community — founder stories, professional women and campus ambassadors at LUMS, LSE and GIKI.' },
  { name: 'My Femmora, My Story', role: 'User-generated stories of identity, career, confidence, ambition and individual style.' },
  { name: 'Dress the Woman You’re Becoming', role: 'The B2C consultation campaign — colour analysis, silhouette guidance, wardrobe curation.' },
  { name: 'The Femmora Circle', role: 'Retention — early collection access, private previews, styling recommendations, founder events.' },
]

/** Launch roadmap — Deliverable 3, Appendix 1C (condensed). */
export const ROADMAP = [
  { when: 'December 2026', phase: 'Phase I — Launch', what: 'Instagram, Meta and the website go live; the “Beyond the Silhouette” campaign; 1,000+ followers in week one; the Femmora Private List.' },
  { when: 'January 2027', phase: 'Phase II — Penetration', what: '“The Femmora Woman”; campus ambassadors at LUMS, LSE and GIKI; wardrobe consultations; the Dolmen Mall Lahore flagship.' },
  { when: 'February 2027', phase: 'Phase III — Conversion', what: 'Corporate workshops — “Dress for the Position You Hold” — and the Founder/CEO wardrobe consultation.' },
  { when: 'March 2027 →', phase: 'Expansion', what: 'Karachi entry at Dolmen Mall, then Centaurus Islamabad; polo and equestrian partnerships in Lahore.' },
]

/** Illustrative voices for the “My Femmora, My Story” campaign — sample copy for the demo, not real reviews. */
export const TESTIMONIALS = [
  {
    quote: 'For the first time, my clothes walked into the boardroom before I did — and they spoke the right language.',
    name: 'The Founder',
    role: 'Illustrative story · co-founder, fintech',
  },
  {
    quote: 'Pockets. Real pockets. And a trench that stays crisp from a 9 a.m. pitch to a 9 p.m. dinner.',
    name: 'The Manager',
    role: 'Illustrative story · regional manager, banking',
  },
  {
    quote: 'The consultation gave me back twenty minutes every morning. I no longer decide — I simply dress.',
    name: 'The Partner',
    role: 'Illustrative story · partner, consultancy',
  },
]
