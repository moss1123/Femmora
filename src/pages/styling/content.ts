/* Styling page copy & data (Deliverable 3). Voice: quietly confident, editorial, British spelling. */
import type { FlatId } from './flats'

/* ───────────────────────── Formality levels ───────────────────────── */

export type Level = 1 | 2 | 3 | 4

export const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'] as const

/** The Femmora formality scale: every trench, blazer, kurta and fusion piece carries one of four levels. */
export const FORMALITY: { level: Level; name: string; rooms: string }[] = [
  { level: 1, name: 'Everyday office', rooms: 'Desk days, internal meetings, the first job' },
  { level: 2, name: 'Client-facing', rooms: 'Client meetings, site visits, travel days' },
  { level: 3, name: 'Presentation', rooms: 'Investor pitches, panels, interviews' },
  { level: 4, name: 'Boardroom & press', rooms: 'Board meetings, press features, formal dinners' },
]

export const levelName = (l: Level) => FORMALITY[l - 1].name

/* ───────────────────────── Colour ───────────────────────── */

export type HueKey = 'burgundy' | 'ivory' | 'gold' | 'camel' | 'emerald' | 'navy' | 'charcoal' | 'black'

export interface Hue {
  key: HueKey
  name: string
  /** CSS colour (design tokens where they exist) */
  css: string
  /** text tone that reads on top of this colour */
  ink: 'light' | 'dark'
  /** a short subtitle for the swatch */
  note: string
  /** part of the house signature (burgundy + gold) */
  house?: true
}

export const HUES: Record<HueKey, Hue> = {
  burgundy: { key: 'burgundy', name: 'Burgundy', css: 'var(--wine-600)', ink: 'light', note: 'The house colour', house: true },
  ivory: { key: 'ivory', name: 'Ivory', css: 'var(--ivory-100)', ink: 'dark', note: 'Light at the face' },
  gold: { key: 'gold', name: 'Gold', css: 'var(--gold-500)', ink: 'dark', note: 'The house metal', house: true },
  camel: { key: 'camel', name: 'Camel', css: 'var(--camel)', ink: 'dark', note: 'The trench colour' },
  emerald: { key: 'emerald', name: 'Emerald', css: 'var(--emerald)', ink: 'light', note: 'The equestrian' },
  navy: { key: 'navy', name: 'Navy', css: 'var(--navy)', ink: 'light', note: 'Cool clarity' },
  charcoal: { key: 'charcoal', name: 'Charcoal', css: 'var(--charcoal)', ink: 'light', note: 'The modern neutral' },
  black: { key: 'black', name: 'Black', css: '#0a0a0c', ink: 'light', note: 'The evening absolute' },
}

export const HUE_ORDER: HueKey[] = ['burgundy', 'gold', 'ivory', 'camel', 'emerald', 'navy', 'charcoal', 'black']

export interface Pairing {
  with: HueKey
  title: string
  body: string
  bestFor: string
}

export interface ColourStory {
  base: HueKey
  description: string
  pairings: [Pairing, Pairing, Pairing]
  /** the house 70 · 25 · 5 proportion for this base */
  ratio: [HueKey, HueKey, HueKey]
  ratioNote: string
}

export const COLOUR_STORIES: Record<HueKey, ColourStory> = {
  burgundy: {
    base: 'burgundy',
    description: 'The Femmora colour. Deep enough to read as authority across a long table, warm enough to stay personal — and kind to every skin tone.',
    pairings: [
      { with: 'gold', title: 'The house signature', body: 'Gold on burgundy is the Femmora mark: heritage without a single ornament. Keep the gold to a button, a buckle or a watch.', bestFor: 'Board meeting' },
      { with: 'ivory', title: 'Statement and space', body: 'Ivory gives burgundy room to breathe and lifts it near the face — the clearest way to wear the house colour by day.', bestFor: 'Investor pitch' },
      { with: 'camel', title: 'Claret and saddle', body: 'Two warm, earthy tones straight from the equestrian board. Polished, grounded, quietly old-money.', bestFor: 'Client & travel' },
    ],
    ratio: ['burgundy', 'ivory', 'gold'],
    ratioNote: 'Burgundy carries the look, ivory brings light to the face, gold is the full stop.',
  },
  gold: {
    base: 'gold',
    description: 'Our accent, never our base. Gold belongs at the wrist, the ear or a single button — about five per cent of the look.',
    pairings: [
      { with: 'burgundy', title: 'The house signature', body: 'Gold on burgundy is the Femmora mark. One point of it, and the whole look reads as considered.', bestFor: 'Board meeting' },
      { with: 'black', title: 'Evening gravitas', body: 'One gold point against black does more than any amount of embellishment.', bestFor: 'Press & evening' },
      { with: 'ivory', title: 'Light catching light', body: 'Soft and luminous. Keep the gold matte so that it whispers rather than shines.', bestFor: 'Everyday office' },
    ],
    ratio: ['burgundy', 'ivory', 'gold'],
    ratioNote: 'Gold never leads. Let burgundy and ivory carry the look and keep gold to five per cent.',
  },
  ivory: {
    base: 'ivory',
    description: 'Light near the face and clean on camera — the canvas that makes every other colour look intentional.',
    pairings: [
      { with: 'burgundy', title: 'Ink on paper', body: 'The house signature, reversed: an ivory trench leads and burgundy grounds it at the ankle or the collar.', bestFor: 'Press & evening' },
      { with: 'camel', title: 'Tonal ease', body: 'Ivory sheen against matte camel — the quietest possible way to look expensive.', bestFor: 'Client & travel' },
      { with: 'navy', title: 'Cool clarity', body: 'Navy works as a single product colour against ivory: crisp, cool and very clearly chosen.', bestFor: 'Everyday office' },
    ],
    ratio: ['ivory', 'camel', 'gold'],
    ratioNote: 'Keep ivory nearest the face, where it lifts and brightens.',
  },
  camel: {
    base: 'camel',
    description: 'The colour of the classic trench. Warm, neutral and quietly expensive — it makes any palette feel softer and more personal.',
    pairings: [
      { with: 'ivory', title: 'Tonal ease', body: 'Matte camel against ivory: understated, polished and easy to repeat all week.', bestFor: 'Everyday office' },
      { with: 'burgundy', title: 'Claret and saddle', body: 'Burgundy gives camel its spine; camel brings burgundy closer. The country-club palette, tailored for work.', bestFor: 'Investor pitch' },
      { with: 'black', title: 'Sharp contrast', body: 'Black sharpens camel into evening without a single embellishment.', bestFor: 'Press & evening' },
    ],
    ratio: ['camel', 'ivory', 'gold'],
    ratioNote: 'A tonal story: camel and ivory, with the gold kept matte.',
  },
  emerald: {
    base: 'emerald',
    description: 'The equestrian’s colour: grace, heritage and discipline. Rich without ever being loud.',
    pairings: [
      { with: 'ivory', title: 'Crisp and assured', body: 'Emerald against ivory is fresh and confident, and holds its own in any photograph.', bestFor: 'Press & evening' },
      { with: 'camel', title: 'The riding jacket', body: 'Emerald with camel recalls the stable yard: heritage, translated into tailoring.', bestFor: 'Client & travel' },
      { with: 'burgundy', title: 'Two jewels, one decision', body: 'Deep green and claret, worn as two solid pieces, read as old-money rather than festive.', bestFor: 'Press & evening' },
    ],
    ratio: ['emerald', 'ivory', 'gold'],
    ratioNote: 'Emerald as the statement, ivory to keep it fresh, gold to finish.',
  },
  navy: {
    base: 'navy',
    description: 'A product colour, not a house colour: one navy piece reads crisp and cool, and partners every neutral in the wardrobe.',
    pairings: [
      { with: 'ivory', title: 'The classic contract', body: 'Maximum clarity, no noise. Navy and ivory read as decisive from the far end of a long table.', bestFor: 'Board meeting' },
      { with: 'camel', title: 'Warm authority', body: 'A camel trench softens navy’s edge without losing its weight — approachable, and plainly in charge.', bestFor: 'Investor pitch' },
      { with: 'burgundy', title: 'After-hours depth', body: 'Two deep tones read rich in low light. Let the burgundy be velvet.', bestFor: 'Press & evening' },
    ],
    ratio: ['navy', 'ivory', 'gold'],
    ratioNote: 'Navy as the single cool piece, ivory near the face, gold as the full stop.',
  },
  charcoal: {
    base: 'charcoal',
    description: 'The quiet power neutral — less severe than black, more modern than grey.',
    pairings: [
      { with: 'ivory', title: 'Crisp and current', body: 'Clean contrast with a softer edge than black and white.', bestFor: 'Everyday office' },
      { with: 'burgundy', title: 'Measured warmth', body: 'Charcoal steadies burgundy for daytime, so the colour reads as a decision rather than a flourish.', bestFor: 'Board meeting' },
      { with: 'camel', title: 'Soft structure', body: 'Two neutrals with depth. Add a point of gold and it turns to evening.', bestFor: 'Client & travel' },
    ],
    ratio: ['charcoal', 'ivory', 'gold'],
    ratioNote: 'Charcoal as the frame, ivory as the light, gold as the signature.',
  },
  black: {
    base: 'black',
    description: 'The evening absolute. Wear it for its edge, and let texture stop it from falling flat.',
    pairings: [
      { with: 'ivory', title: 'Pure contrast', body: 'The sharpest pairing there is. Keep the lines clean and the fit exact.', bestFor: 'Press & evening' },
      { with: 'gold', title: 'Evening gravitas', body: 'Black and a single point of gold: the simplest formula for after dark.', bestFor: 'Press & evening' },
      { with: 'burgundy', title: 'Velvet conviction', body: 'Burgundy velvet glows against black. One piece of each, nothing else.', bestFor: 'Press & evening' },
    ],
    ratio: ['black', 'ivory', 'gold'],
    ratioNote: 'Black for edge, ivory at the collar, gold as the only ornament.',
  },
}

/** The palette card from the colour analysis workshop: five painted strokes. */
export const PALETTE_CARD: { hue: HueKey; role: string }[] = [
  { hue: 'burgundy', role: 'Your depth' },
  { hue: 'gold', role: 'Your metal' },
  { hue: 'ivory', role: 'Your light' },
  { hue: 'camel', role: 'Your neutral' },
  { hue: 'emerald', role: 'Your jewel' },
]

export const WORKSHOP_STEPS: { title: string; body: string }[] = [
  { title: 'Drape', body: 'Fabrics held to the face in daylight — gabardine, silk, velvet, cable knit.' },
  { title: 'Read', body: 'Your stylist notes undertone, contrast and depth, and what each does to your face.' },
  { title: 'Keep', body: 'A painted palette card and a 70 · 25 · 5 plan that every capsule piece follows.' },
]

/* ───────────────────────── One piece, three ways ───────────────────────── */

export type WayKey = 'boardroom' | 'fusion' | 'evening'

export const LOOK_OCCASIONS: { key: WayKey; label: string; time: string }[] = [
  { key: 'boardroom', label: 'Boardroom', time: '09:00' },
  { key: 'fusion', label: 'Over a kurta', time: '13:00' },
  { key: 'evening', label: 'After dark', time: '20:30' },
]

export interface LookPiece {
  id: FlatId
  name: string
}

export interface Look {
  title: string
  heroNote: string
  level: Level
  companions: [LookPiece, LookPiece]
  accessories: LookPiece[]
  why: string
  colours: [HueKey, HueKey, HueKey, HueKey]
}

export interface HeroPiece {
  id: 'ivory-trench' | 'burgundy-trench' | 'camel-trench'
  flat: FlatId
  numeral: string
  name: string
  fabric: string
  /** fabric wash for the drawing */
  tint: string
  /** line colour on top of the wash (defaults to the theme accent) */
  ink?: string
  looks: Record<WayKey, Look>
}

export const HERO_PIECES: HeroPiece[] = [
  {
    id: 'ivory-trench',
    flat: 'trench',
    numeral: 'I',
    name: 'The Ivory Trench',
    fabric: 'Cotton gabardine · storm flap, deep welt pockets',
    tint: '#f4ecdc',
    looks: {
      boardroom: {
        title: 'Quiet authority',
        heroNote: 'Belted and buttoned, collar laid flat',
        level: 4,
        companions: [
          { id: 'shirt', name: 'The Poplin Shirt, ivory' },
          { id: 'cigarette-trouser', name: 'The Cigarette Trouser, burgundy' },
        ],
        accessories: [
          { id: 'loafers', name: 'Leather loafers, camel' },
          { id: 'watch', name: 'A slim gold watch' },
        ],
        why: 'Ivory from collar to knee reads as light and decisive along a long table, and the belted waist keeps the line structured when you stand to speak. Burgundy at the ankle grounds it — the house colours, worn quietly.',
        colours: ['ivory', 'burgundy', 'camel', 'gold'],
      },
      fusion: {
        title: 'The bridge between two wardrobes',
        heroNote: 'Worn open, belt knotted at the back',
        level: 3,
        companions: [
          { id: 'power-kurta', name: 'The Power Kurta, emerald' },
          { id: 'cigarette-trouser', name: 'The Cigarette Trouser, ivory' },
        ],
        accessories: [
          { id: 'drops', name: 'Small gold drops' },
          { id: 'tote', name: 'The structured tote, camel' },
        ],
        why: 'Too Western reads as too bold; too traditional reads as non-corporate. A trench over a structured kurta answers both: the coat brings Western authority, the kurta keeps modesty without compromise — and its hem shows a hand’s width below the coat.',
        colours: ['ivory', 'emerald', 'camel', 'gold'],
      },
      evening: {
        title: 'Draped, not dressed up',
        heroNote: 'Over the shoulders, sleeves left free',
        level: 4,
        companions: [
          { id: 'bow-blouse', name: 'The Bow Blouse, black silk' },
          { id: 'pencil-skirt', name: 'The Midi Pencil Skirt, burgundy velvet' },
        ],
        accessories: [
          { id: 'drops', name: 'Statement gold drops' },
          { id: 'clutch', name: 'The envelope clutch, black' },
        ],
        why: 'Evening asks for texture, not volume. Worn over the shoulders, the trench frames velvet and silk without hiding them — and comes off in one movement when the room is warm.',
        colours: ['ivory', 'burgundy', 'black', 'gold'],
      },
    },
  },
  {
    id: 'burgundy-trench',
    flat: 'trench',
    numeral: 'II',
    name: 'The Burgundy Trench',
    fabric: 'Wool gabardine · horn buttons, throat latch',
    tint: 'var(--wine-600)',
    ink: 'var(--gold-300)',
    looks: {
      boardroom: {
        title: 'The house colour, at the head of the table',
        heroNote: 'Buttoned to the throat, belt buckled',
        level: 4,
        companions: [
          { id: 'bow-blouse', name: 'The Bow Blouse, ivory silk' },
          { id: 'cigarette-trouser', name: 'The Cigarette Trouser, charcoal' },
        ],
        accessories: [
          { id: 'pumps', name: 'Pointed pumps, black' },
          { id: 'watch', name: 'A slim gold watch' },
        ],
        why: 'Burgundy and gold are the Femmora mark. One burgundy piece reads as a decision rather than a flourish; charcoal beneath keeps it daytime, and the ivory bow brings light to your face when you speak.',
        colours: ['burgundy', 'ivory', 'charcoal', 'gold'],
      },
      fusion: {
        title: 'Heritage, tailored',
        heroNote: 'Worn open over the kurta’s full length',
        level: 3,
        companions: [
          { id: 'power-kurta', name: 'The Power Kurta, ivory' },
          { id: 'wide-trouser', name: 'The Wide-leg Trouser, ivory' },
        ],
        accessories: [
          { id: 'silk-square', name: 'The silk square, gold' },
          { id: 'loafers', name: 'Leather loafers, camel' },
        ],
        why: 'An ivory column under burgundy is the house palette at its most modest and most assured. The silk square at the throat finishes the neckline the way a tie would — without borrowing from his wardrobe.',
        colours: ['burgundy', 'ivory', 'camel', 'gold'],
      },
      evening: {
        title: 'One jewel, one glint',
        heroNote: 'Belted over a black column',
        level: 4,
        companions: [
          { id: 'shell', name: 'The Fine-knit Shell, black' },
          { id: 'cigarette-trouser', name: 'The Cigarette Trouser, black' },
        ],
        accessories: [
          { id: 'brooch', name: 'A gold brooch at the lapel' },
          { id: 'pumps', name: 'Pointed pumps, charcoal suede' },
          { id: 'clutch', name: 'The envelope clutch, black' },
        ],
        why: 'The coat is already formal; evening simply asks it to glow. A black column underneath, one piece of gold at the lapel — then stop.',
        colours: ['burgundy', 'black', 'charcoal', 'gold'],
      },
    },
  },
  {
    id: 'camel-trench',
    flat: 'trench',
    numeral: 'III',
    name: 'The Camel Trench',
    fabric: 'Cotton twill · cut to your measurements',
    tint: 'var(--camel)',
    ink: 'var(--wine-800)',
    looks: {
      boardroom: {
        title: 'Warm authority',
        heroNote: 'Belted, cuff straps closed',
        level: 4,
        companions: [
          { id: 'shirt', name: 'The Poplin Shirt, ivory' },
          { id: 'wide-trouser', name: 'The Wide-leg Trouser, navy' },
        ],
        accessories: [
          { id: 'loafers', name: 'Leather loafers, burgundy' },
          { id: 'tote', name: 'The structured tote, burgundy' },
        ],
        why: 'Camel softens authority without losing its weight. Cut to measure, the shoulders sit exactly at yours — the detail that reads as expensive from across the room, long before anyone sees a label.',
        colours: ['camel', 'ivory', 'navy', 'burgundy'],
      },
      fusion: {
        title: 'The country-club column',
        heroNote: 'Worn open, belt left hanging',
        level: 2,
        companions: [
          { id: 'power-kurta', name: 'The Power Kurta, emerald' },
          { id: 'cigarette-trouser', name: 'The Cigarette Trouser, ivory' },
        ],
        accessories: [
          { id: 'silk-square', name: 'The silk square, emerald and gold' },
          { id: 'loafers', name: 'Leather loafers, burgundy' },
        ],
        why: 'Emerald with camel recalls the stable yard: heritage, translated into tailoring. Left open, the coat turns a structured kurta into a client-facing look in one movement.',
        colours: ['camel', 'emerald', 'ivory', 'burgundy'],
      },
      evening: {
        title: 'The club dinner',
        heroNote: 'Belted over a cable knit, sleeves eased up',
        level: 2,
        companions: [
          { id: 'cable-knit', name: 'The Cable Knit, ivory' },
          { id: 'pencil-skirt', name: 'The Midi Pencil Skirt, burgundy' },
        ],
        accessories: [
          { id: 'riding-boot', name: 'Riding boots, black leather' },
          { id: 'drops', name: 'Small gold drops' },
        ],
        why: 'The equestrian wardrobe at its most relaxed: a cable knit, a midi skirt and riding boots under camel. Polished enough for the club dinner, warm enough for a Lahore winter.',
        colours: ['camel', 'ivory', 'burgundy', 'black'],
      },
    },
  },
]

/* ───────────────────────── Occasion guide ───────────────────────── */

export interface Occasion {
  id: string
  label: string
  level: Level
  title: string
  western: string[]
  fusion: string[]
  dos: string[]
  donts: string[]
  note: { label: string; body: string }
  kit: LookPiece[]
  mark: FlatId
}

export const OCCASIONS: Occasion[] = [
  {
    id: 'desk',
    label: 'Everyday office',
    level: 1,
    title: 'The ordinary day, done well.',
    western: ['A fine knit or poplin shirt', 'a pressed trouser', 'leather loafers'],
    fusion: ['A straight cotton kurta', 'a cigarette trouser', 'one fine piece of gold'],
    dos: [
      'Build the week from three colours. Ivory, camel and one deep tone repeat without anyone noticing — that is the point.',
      'Choose breathable, anti-crease weaves. The desk day is long and the air-conditioning unpredictable.',
      'Keep a long vest or your trench on the back of the chair. It lifts any desk look to Level II in one movement.',
    ],
    donts: [
      'Occasion wear on an ordinary Tuesday. Heavy threadwork reads as a wedding, not a workday.',
      'Anything you will need to adjust at your desk — sheer plackets, slipping necklines, sleeves that ride up.',
      'A new outfit every morning. A short list of formulas saves the decision for work that matters.',
    ],
    note: {
      label: 'Designed for real bodies',
      body: 'Our adaptive fits — flat-front trousers with concealed elastic backs, adjustable wrap silhouettes — were designed with working mothers and postpartum bodies in mind.',
    },
    kit: [
      { id: 'cable-knit', name: 'Cable knit' },
      { id: 'cigarette-trouser', name: 'Cigarette trouser' },
      { id: 'loafers', name: 'Leather loafers' },
    ],
    mark: 'cable-knit',
  },
  {
    id: 'travel',
    label: 'Client & travel',
    level: 2,
    title: 'Land ready.',
    western: ['A breathable shirt', 'the trench', 'flat-front trousers with a concealed elastic back'],
    fusion: ['A structured kurta', 'a tailored long vest', 'deep, secure pockets'],
    dos: [
      'Travel in what you will walk into the meeting in. Anti-crease weaves arrive looking as if they have just left the hanger.',
      'Choose breathable cottons and gabardine for the swing between a Lahore winter and a Karachi afternoon.',
      'Keep your passport, phone and boarding pass in deep, secure pockets — not a bag you have to set down.',
    ],
    donts: [
      'Silk you will have to steam at the other end.',
      'Heels through security. Carry them and change in the car.',
      'A separate outfit for every meeting. Pack three pieces that combine six ways.',
    ],
    note: {
      label: 'Stylist’s note',
      body: 'A trench is the most useful piece you can travel in: your coat on the plane, your jacket in the meeting and your layer at dinner.',
    },
    kit: [
      { id: 'trench', name: 'The trench' },
      { id: 'cigarette-trouser', name: 'Cigarette trouser' },
      { id: 'tote', name: 'Structured tote' },
    ],
    mark: 'trench',
  },
  {
    id: 'pitch',
    label: 'Investor pitch',
    level: 3,
    title: 'Built for standing up.',
    western: ['The trench or a blazer, worn open', 'an open neckline', 'pockets that hold the clicker'],
    fusion: ['A power kurta, collar open', 'a tonal cigarette trouser', 'a long vest that moves with you'],
    dos: [
      'Dress for movement. You will stand, gesture and walk the room — a long vest or an open trench moves with you; a stiff jacket shrugs.',
      'Bring the eye to your face. A lighter colour near the neckline keeps you open and approachable.',
      'Use real pockets for the clicker, your notes and a pen. Hold nothing you do not need.',
      'Rehearse in the outfit, including the walk to the screen.',
    ],
    donts: [
      'New shoes. A pitch is not the day to break them in.',
      'Busy prints on camera. Investors on a video call see a small, compressed version of you.',
      'Anything that creases at the hip after the drive over. Choose an anti-crease weave.',
    ],
    note: {
      label: 'Stylist’s note',
      body: 'In our research, the women we design for buy workwear two to four times a year — almost always before a pitch or a board meeting. Build the pitch outfit first; every other look in the capsule can borrow from it.',
    },
    kit: [
      { id: 'long-vest', name: 'Atelier long vest' },
      { id: 'shell', name: 'Fine-knit shell' },
      { id: 'tote', name: 'Structured tote' },
    ],
    mark: 'long-vest',
  },
  {
    id: 'board',
    label: 'Board meeting',
    level: 4,
    title: 'Authority, quietly stated.',
    western: ['A structured shoulder', 'a tonal column', 'one point of gold'],
    fusion: ['A power kurta, mandarin collar closed', 'a tonal trouser', 'the trench, belted, over both'],
    dos: [
      'Choose structure over surface. A sharp collar, clean seams and a fabric with weight say more than any embellishment.',
      'Wear one colour from collar to hem — burgundy, charcoal or ivory — to lengthen your line at a long table.',
      'Keep jewellery to a single point of gold: a watch or small drops, never both at full volume.',
      'Sit down in the outfit before the day. A tailored kurta or vest should not ride up or gape.',
    ],
    donts: [
      'Heavy threadwork, glitter or mirror work. It reads as occasion wear and pulls focus from what you are saying.',
      'A heavy wool blazer in July. If you are uncomfortable by eleven, the room will notice.',
      'Sheer plackets, or anything you will need to adjust while you present.',
    ],
    note: {
      label: 'Dress for the Position You Hold',
      body: 'Women hold just 3.3% of full-time corporate roles in Pakistan, so you may well be the only woman at the table. Our corporate workshop of the same name helps teams make that a statement of presence, not a question.',
    },
    kit: [
      { id: 'blazer', name: 'Structured blazer' },
      { id: 'cigarette-trouser', name: 'Cigarette trouser' },
      { id: 'watch', name: 'Slim gold watch' },
    ],
    mark: 'blazer',
  },
  {
    id: 'evening',
    label: 'Press & evening',
    level: 4,
    title: 'Dressed for the photograph — and after.',
    western: ['One decisive colour', 'texture that reads on camera', 'the trench over the shoulders'],
    fusion: ['A velvet power kurta', 'a silk stole', 'one jewel, nothing more'],
    dos: [
      'Choose one decisive colour. Burgundy, emerald or deep camel photograph richly and hold against any backdrop.',
      'Let texture do the work — velvet, jacquard or satin adds depth without pattern.',
      'For a client dinner, keep your day base and change one layer: blazer off, velvet or a silk stole on.',
      'Check the outfit seated and in profile; most editorial portraits are three-quarter.',
    ],
    donts: [
      'Fine stripes or small checks. They shimmer on camera.',
      'Glitter or high shine under studio lights. It photographs as glare, not luxury.',
      'Switching to full occasion wear. Heavy embellishment moves the evening from business to wedding season.',
    ],
    note: {
      label: 'The double bind',
      body: 'Too Western reads as too bold; too traditional reads as non-corporate. A structured fusion silhouette in a single strong colour answers both in one frame.',
    },
    kit: [
      { id: 'power-kurta', name: 'Power kurta' },
      { id: 'stole', name: 'Silk stole' },
      { id: 'drops', name: 'Gold drops' },
    ],
    mark: 'power-kurta',
  },
]

/* ───────────────────────── Capsule ───────────────────────── */

export type CapsuleGroup = 'tops' | 'bottoms' | 'layers'

export interface CapsulePiece {
  id: FlatId
  group: CapsuleGroup
  name: string
  detail: string
}

export const CAPSULE_GROUPS: { key: CapsuleGroup; label: string; singular: string; plural: string }[] = [
  { key: 'tops', label: 'Tops', singular: 'top', plural: 'tops' },
  { key: 'bottoms', label: 'Bottoms', singular: 'bottom', plural: 'bottoms' },
  { key: 'layers', label: 'Layers', singular: 'layer', plural: 'layers' },
]

export const CAPSULE: CapsulePiece[] = [
  { id: 'shirt', group: 'tops', name: 'The Poplin Shirt', detail: 'Anti-crease cotton' },
  { id: 'bow-blouse', group: 'tops', name: 'The Bow Blouse', detail: 'Silk crêpe · non-sheer' },
  { id: 'cable-knit', group: 'tops', name: 'The Cable Knit', detail: 'Breathable merino' },
  { id: 'power-kurta', group: 'tops', name: 'The Power Kurta', detail: 'Deep in-seam pockets' },
  { id: 'cigarette-trouser', group: 'bottoms', name: 'The Cigarette Trouser', detail: 'Concealed elastic back' },
  { id: 'wide-trouser', group: 'bottoms', name: 'The Wide-leg Trouser', detail: 'Flat front · pressed crease' },
  { id: 'pencil-skirt', group: 'bottoms', name: 'The Midi Pencil Skirt', detail: 'Walking vent · lined' },
  { id: 'trench', group: 'layers', name: 'The Ivory Trench', detail: 'Cotton gabardine · belted' },
  { id: 'blazer', group: 'layers', name: 'The Structured Blazer', detail: 'Lightweight wool' },
  { id: 'long-vest', group: 'layers', name: 'The Atelier Long Vest', detail: 'Jacquard · sleeveless' },
]

/** Starting points for the capsule: the consultation example, and Core bundles sold as a set with the how-to-wear card. */
export interface Bundle {
  id: string
  name: string
  kind: string
  /** one line under the name */
  note: string
  pieces: FlatId[]
}

export const BUNDLES: Bundle[] = [
  {
    id: 'consult',
    name: 'The consultation capsule',
    kind: 'Premium Wardrobe Consultation',
    note: 'Ten pieces chosen with your stylist — one example of the eight to twelve in every engagement.',
    pieces: CAPSULE.map((p) => p.id),
  },
  {
    id: 'office',
    name: 'The Office Starter',
    kind: 'Core bundle',
    note: 'Seven pieces for the first job: knit, shirt and kurta under a blazer or long vest.',
    pieces: ['shirt', 'cable-knit', 'power-kurta', 'cigarette-trouser', 'pencil-skirt', 'blazer', 'long-vest'],
  },
  {
    id: 'trench',
    name: 'The Trench Bundle',
    kind: 'Core bundle',
    note: 'The Ivory Trench and the five pieces it was cut to go over.',
    pieces: ['shirt', 'bow-blouse', 'cable-knit', 'cigarette-trouser', 'wide-trouser', 'trench'],
  },
  {
    id: 'fusion',
    name: 'The Fusion Bundle',
    kind: 'Core bundle',
    note: 'Kurta-led and modest without compromise, with a Western coat to bridge the two.',
    pieces: ['power-kurta', 'bow-blouse', 'cigarette-trouser', 'wide-trouser', 'long-vest', 'trench'],
  },
]

/* ───────────────────────── Rules ───────────────────────── */

export const RULES: { numeral: string; title: string; body: string }[] = [
  {
    numeral: 'I',
    title: 'Structure speaks before you do.',
    body: 'In a boardroom, status is read in clean seams, a sharp collar and a fabric with weight — not in threadwork. A riding jacket is all cut and no ornament; spend on the cut, never on the decoration.',
  },
  {
    numeral: 'II',
    title: 'Fit is the first luxury.',
    body: 'A garment cut to your measurements will always look more expensive than a costlier one that almost fits. Begin with the shoulders and the hem — and keep your measurements on file, so the next piece fits the first time.',
  },
  {
    numeral: 'III',
    title: 'Build from the coat inward.',
    body: 'The old-money wardrobe starts with outerwear that outlasts every trend. Buy the trench before anything else: a cotton gabardine carries a blazer’s authority through the eight months a heavy wool jacket cannot.',
  },
  {
    numeral: 'IV',
    title: 'Pockets are not negotiable.',
    body: 'Your hands should be free to gesture, to shake and to sign. Insist on real, deep pockets, breathable fabric — and plackets that never gape or show through.',
  },
  {
    numeral: 'V',
    title: 'Know the level before you dress.',
    body: 'Every room has a formality level, from I at the desk to IV at the board table and in front of a camera. Match the level first, then choose between Western and fusion — never the other way round.',
  },
  {
    numeral: 'VI',
    title: 'Allow one point of gold.',
    body: 'Choose a single focal accent — a horsebit, a watch, a pair of drops, a brooch — and let everything else recede. Restraint reads as confidence.',
  },
  {
    numeral: 'VII',
    title: 'Dress the woman you are becoming.',
    body: 'Decide your capsule once, then dress for the room you are walking into next. Wear your heritage with structure, not apology — a kurta at the head of the table is a statement only you can make.',
  },
]

/* ───────────────────────── Page index ───────────────────────── */

export const SECTIONS: { id: string; n: string; title: string }[] = [
  { id: 'sty-three', n: '01', title: 'One trench, three ways' },
  { id: 'sty-occasions', n: '02', title: 'The occasion guide' },
  { id: 'sty-colour', n: '03', title: 'Intentional colour' },
  { id: 'sty-capsule', n: '04', title: 'The capsule' },
  { id: 'sty-rules', n: '05', title: 'The Femmora rules' },
  { id: 'sty-consult', n: '06', title: 'The consultation' },
]
