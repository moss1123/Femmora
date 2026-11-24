import { useCallback, useEffect, useState } from 'react'
import CollectionHero from './CollectionHero'
import CollectionShop from './CollectionShop'
import CapsuleBundle from './CapsuleBundle'
import WhyBuilt from './WhyBuilt'
import MtmCta from './MtmCta'
import QuickView from './QuickView'
import Marquee from '../../components/Marquee'
import type { QuickTarget } from './ProductCard'
import { BRAND, CAMPAIGNS, TENETS } from '../../data/site'
import './Collection.css'

/* the house codes: the four tenets, the launch campaign, the awareness line, tagline and promise
   (Deliverable 3). Keep the count EVEN: the band alternates filled / outlined words, and an odd
   count makes the duplicated second half alternate the other way, so the loop visibly jumps. */
const CODES = [...TENETS, CAMPAIGNS[0].name, BRAND.madeBy, BRAND.tagline, BRAND.promise].map((s) => s.replace(/\.$/, ''))
const HOUSE_CODES = CODES.length % 2 ? [...CODES, ...CODES] : CODES

/**
 * II — The Collection. "Beyond the Silhouette — Chapter One."
 * Hero (wine #2a0a12 = the rack's flood colour) → filterable editorial grid (wine) → capsule
 * bundles with the how-to-wear card (noir) → why it's built like this (ivory) → house codes
 * (wine) → made-to-measure (parchment, = /custom's flood). The bag drawer is global (App).
 */
export default function Collection() {
  const [target, setTarget] = useState<QuickTarget | null>(null)
  const close = useCallback(() => setTarget(null), [])

  useEffect(() => {
    const prev = document.title
    document.title = 'The Collection — Beyond the Silhouette, Chapter One · Femmora'
    return () => {
      document.title = prev
    }
  }, [])

  return (
    <div className="page col-page" data-theme="wine">
      <CollectionHero />
      <CollectionShop onQuickView={setTarget} />
      <CapsuleBundle />
      <WhyBuilt onQuickView={setTarget} />
      <section className="col-band" data-theme="wine" aria-label="Femmora house codes">
        <div className="col-band__rule" aria-hidden />
        <Marquee items={HOUSE_CODES} speed={34} className="col-band__mq" />
        <div className="col-band__rule" aria-hidden />
      </section>
      <MtmCta />
      <QuickView target={target} onClose={close} onSwitch={setTarget} />
    </div>
  )
}
