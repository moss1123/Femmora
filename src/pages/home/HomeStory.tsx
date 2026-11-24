import { useEffect, useRef } from 'react'
import { ScrollTrigger } from '../../lib/motion'
import Manifesto from './sections/Manifesto'
import DoubleBind from './sections/DoubleBind'
import Promises from './sections/Promises'
import Looks from './sections/Looks'
import Tiers from './sections/Tiers'
import Textures from './sections/Textures'
import Voices from './sections/Voices'
import Launch from './sections/Launch'
import Finale from './sections/Finale'
import ChapterRail from './sections/ChapterRail'
import './sections/story.css'

/**
 * The home scroll story — everything below the full-screen 3D trench-coat rack.
 * The house look is burgundy, gold and ivory (Deliverable 3); every visual is drawn
 * (SVG gold-hairline flats, typographic plates, CSS/SVG cloth) — there are no photographs.
 *
 *   I    Beyond the silhouette  wine       pinned · words light up with scroll, the four tenets
 *   II   The double bind        ivory      pinned · two claims collide into "Western structure, modest by design"
 *   III  Four promises          noir       pinned · horizontal gallery of the four differentiators (stacked on mobile)
 *   IV   The looks              parchment  pinned · one trench look grows full-bleed, then four fan out
 *   V    The house tiers        wine       three tall editorial columns (Core · MTM · Consultation)
 *   VI   Textures that speak    ivory      velocity marquee + drawn cloth swatches + palette
 *   VII  My Femmora, My Story   noir       crossfading carousel of illustrative stories (labelled as such)
 *   VIII The launch             wine       roadmap, Dolmen Mall flagship and the Private List
 *   IX   Choose your chapter    parchment  three trench coats on a rail — one link per page
 *
 * Every section owns its own ScrollTriggers inside useGSAP + gsap.matchMedia, so all pins
 * revert on unmount (route change) and re-create per breakpoint. Sections are rendered in
 * document order, so their pins are created (and refreshed) top-to-bottom.
 */
export default function HomeStory() {
  const root = useRef<HTMLDivElement>(null)

  // Web fonts change line heights; re-measure every trigger once they have settled.
  useEffect(() => {
    let alive = true
    document.fonts?.ready.then(() => {
      if (alive) ScrollTrigger.refresh()
    })
    return () => {
      alive = false
    }
  }, [])

  return (
    <div ref={root} className="hs">
      <Manifesto />
      <DoubleBind />
      <Promises />
      <Looks />
      <Tiers />
      <Textures />
      <Voices />
      <Launch />
      <Finale />
      <ChapterRail storyRef={root} />
    </div>
  )
}
