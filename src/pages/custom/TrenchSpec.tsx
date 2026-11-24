/* The Camel Trench — a gold-hairline technical flat with its made-to-measure dimensions marked.
   This is the coat that represents Custom Services on the home rack, so the flood hand-off lands on it.
   viewBox 0 -40 400 660, centre-front at x = 200. Animated by Hero (classes .cus-coat__draw / __fills / __soft). */

const MIRROR = 'matrix(-1 0 0 1 400 0)'

const P = {
  collar: 'M172,47 C176,30 224,30 228,47 C214,41 186,41 172,47 Z',
  body: 'M176,44 C188,39 212,39 224,44 L282,66 C276,96 270,124 268,150 L264,262 L300,590 C262,600 138,600 100,590 L136,262 L132,150 C130,124 124,96 118,66 Z',
  shirt: 'M180,46 C190,53 210,53 220,46 L236,196 Z',
  sleeve: 'M118,66 C100,90 92,140 88,200 L80,350 L119,354 L124,240 C126,200 128,172 132,150 C130,124 124,96 118,66 Z',
  cuff: 'M82,314 L121,318 L121,327 L81,323 Z',
  cuffBuckle: 'M97,313.5 h8 v12 h-8 Z',
  flap: 'M120,70 L152,60 L154,122 C143,135 131,139 121,137 Z',
  epaulette: 'M124,62 L171,45 L173,52 L126,69 Z',
  lapelL: 'M180,46 L148,86 L162,93 L140,108 C166,146 210,180 236,196 Z',
  lapelR: 'M220,46 L252,86 L238,93 L260,108 C258,140 248,172 236,196 Z',
  belt: 'M136,262 L264,262 L266,280 L134,280 Z',
  loop: 'M139,257 h7 v28 h-7 Z',
  buckle: 'M158,256 h26 v30 h-26 Z M163,261 h16 v20 h-16 Z',
  tail: 'M164,286 L158,336 C160,339 168,340 170,337 L176,286 Z',
  edge: 'M236,196 L245,596',
  pocketL: 'M150,324 L160,322 L150,378 L140,380 Z',
  pocketR: 'M252,322 L262,324 L272,380 L262,378 Z',
  hanger: 'M200,33 L200,6 C200,-4 210,-8 210,-18 C210,-28 203,-34 196,-32 C191,-30 189,-26 190,-22',
}

const BUTTONS: [number, number][] = [
  [180, 214],
  [220, 214],
  [180, 242],
  [220, 242],
  [180, 306],
  [220, 306],
  [180, 350],
  [220, 350],
]

export default function TrenchSpec() {
  return (
    <svg
      className="cus-coat"
      viewBox="0 -40 400 660"
      role="img"
      aria-labelledby="cus-coat-title"
      focusable="false"
    >
      <title id="cus-coat-title">
        Technical drawing of the Camel Trench, a double-breasted belted trench coat, with its shoulder, sleeve and length measurements marked
      </title>
      <defs>
        {/* cotton gabardine: a fine steep twill, reversed on the facings */}
        <pattern id="cus-coat-gab" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(-38)">
          <rect width="4" height="4" className="cus-coat__cloth" />
          <path d="M0 0.6 H4" className="cus-coat__twill" />
        </pattern>
        <pattern id="cus-coat-gab-r" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(38)">
          <rect width="4" height="4" className="cus-coat__cloth cus-coat__cloth--facing" />
          <path d="M0 0.6 H4" className="cus-coat__twill" />
        </pattern>
      </defs>

      {/* ── cloth ── */}
      <g className="cus-coat__fills" aria-hidden>
        <path d={P.body} fill="url(#cus-coat-gab)" />
        <path d={P.shirt} className="cus-coat__shirt" />
        <path d={P.collar} fill="url(#cus-coat-gab-r)" />
        <path d={P.sleeve} fill="url(#cus-coat-gab)" />
        <path d={P.sleeve} transform={MIRROR} fill="url(#cus-coat-gab)" />
        <path d={P.flap} fill="url(#cus-coat-gab-r)" />
        <path d={P.lapelR} fill="url(#cus-coat-gab-r)" />
        <path d={P.lapelL} fill="url(#cus-coat-gab-r)" />
        <path d={P.epaulette} fill="url(#cus-coat-gab-r)" />
        <path d={P.epaulette} transform={MIRROR} fill="url(#cus-coat-gab-r)" />
        <path d={P.belt} fill="url(#cus-coat-gab-r)" />
        <path d={P.tail} fill="url(#cus-coat-gab-r)" />
        <path d={P.cuff} fill="url(#cus-coat-gab-r)" />
        <path d={P.cuff} transform={MIRROR} fill="url(#cus-coat-gab-r)" />
        <path d={P.pocketL} fill="url(#cus-coat-gab-r)" />
        <path d={P.pocketR} fill="url(#cus-coat-gab-r)" />
        <path d={P.buckle} className="cus-coat__metal" fillRule="evenodd" />
        <path d={P.cuffBuckle} className="cus-coat__metal" />
        <path d={P.cuffBuckle} transform={MIRROR} className="cus-coat__metal" />
      </g>

      {/* ── hairlines (drawn in) ── */}
      <g className="cus-coat__lines" aria-hidden>
        <path className="cus-coat__draw cus-coat__hanger" d={P.hanger} />
        <path className="cus-coat__draw" d={P.body} />
        <path className="cus-coat__draw" d={P.sleeve} />
        <path className="cus-coat__draw" d={P.sleeve} transform={MIRROR} />
        <path className="cus-coat__draw" d={P.collar} />
        <path className="cus-coat__draw cus-coat__fine" d={P.flap} />
        <path className="cus-coat__draw" d={P.lapelR} />
        <path className="cus-coat__draw" d={P.lapelL} />
        <path className="cus-coat__draw cus-coat__fine" d={P.epaulette} />
        <path className="cus-coat__draw cus-coat__fine" d={P.epaulette} transform={MIRROR} />
        <path className="cus-coat__draw" d={P.edge} />
        <path className="cus-coat__draw" d={P.belt} />
        <path className="cus-coat__draw cus-coat__fine" d={P.loop} />
        <path className="cus-coat__draw cus-coat__fine" d={P.loop} transform={MIRROR} />
        <path className="cus-coat__draw cus-coat__fine" d={P.tail} />
        <path className="cus-coat__draw cus-coat__fine" d={P.buckle} />
        <path className="cus-coat__draw cus-coat__fine" d={P.cuff} />
        <path className="cus-coat__draw cus-coat__fine" d={P.cuff} transform={MIRROR} />
        <path className="cus-coat__draw cus-coat__fine" d={P.pocketL} />
        <path className="cus-coat__draw cus-coat__fine" d={P.pocketR} />
      </g>

      {/* ── stitching, buttons, dimensions (fade in) ── */}
      <g className="cus-coat__soft" aria-hidden>
        <path className="cus-coat__stitch" d="M230,206 L238.6,592" />
        <path className="cus-coat__stitch" d="M104,580 C142,589 258,589 296,580" />
        <path className="cus-coat__stitch" d="M139,268 H261 M138,274 H262" />
        <path className="cus-coat__stitch" d="M86,306 L122,309" />
        <path className="cus-coat__stitch" d="M86,306 L122,309" transform={MIRROR} />
      </g>
      <g className="cus-coat__soft" aria-hidden>
        {BUTTONS.map(([x, y]) => (
          <g key={`${x}-${y}`} transform={`translate(${x} ${y})`}>
            <circle r="5" className="cus-coat__btn" />
            <circle r="1" cx="-1.6" className="cus-coat__btn-eye" />
            <circle r="1" cx="1.6" className="cus-coat__btn-eye" />
          </g>
        ))}
        <circle cx="163" cy="50.5" r="2.6" className="cus-coat__btn" />
        <circle cx="237" cy="50.5" r="2.6" className="cus-coat__btn" />
        <circle cx="153.4" cy="333" r="3" className="cus-coat__btn" />
        <circle cx="258.8" cy="333" r="3" className="cus-coat__btn" />
      </g>
      <g className="cus-coat__soft cus-coat__dims" aria-hidden>
        {/* shoulder */}
        <path className="cus-coat__dim" d="M118,8 H190 M210,8 H282 M118,2 V14 M282,2 V14" />
        <path className="cus-coat__ext" d="M118,14 V58 M282,14 V58" />
        {/* label and value sit either side of the hanger hook (x 190–210), never across it */}
        <text className="cus-coat__dim-t" x="186" y="-4" textAnchor="end">
          Shoulder
        </text>
        <text className="cus-coat__dim-t" x="216" y="-4">
          39.5 cm
        </text>
        {/* sleeve */}
        <path className="cus-coat__dim" d="M98.2,63.4 L60.2,347.4 M104.1,64.1 L92.3,62.6 M66.1,348.1 L54.3,346.6" />
        <text className="cus-coat__dim-t" x="66" y="204" textAnchor="middle" transform="rotate(-82.4 66 204)">
          Sleeve 60 cm
        </text>
        {/* length */}
        <path className="cus-coat__dim" d="M352,44 V596 M346,44 H358 M346,596 H358" />
        <path className="cus-coat__ext" d="M232,44 H346 M304,596 H346" />
        <text className="cus-coat__dim-t" x="368" y="320" textAnchor="middle" transform="rotate(-90 368 320)">
          Length 112 cm
        </text>
      </g>
    </svg>
  )
}
