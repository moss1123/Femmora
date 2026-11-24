import TLink from './TLink'
import { BRAND, PAGES } from '../data/site'
import { Reveal } from './Reveal'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer" data-theme="noir">
      <div className="container">
        <div className="footer__top">
          <Reveal>
            <p className="footer__promise h2">{BRAND.promise}</p>
          </Reveal>
          <Reveal delay={0.1} className="footer__cta">
            <TLink to="/custom#book" className="footer__book" cursor="Book">
              <span className="label">Book a private fitting</span>
              <span className="footer__book-arrow" aria-hidden>
                →
              </span>
            </TLink>
          </Reveal>
        </div>

        <div className="rule-gold" />

        <div className="footer__grid">
          <div>
            <p className="label gold">The House</p>
            <ul>
              <li><TLink to="/">Home</TLink></li>
              {PAGES.map((p) => (
                <li key={p.id}>
                  <TLink to={p.path}>{p.title}</TLink>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="label gold">The Stores</p>
            <ul>
              {BRAND.stores.map((s) => (
                <li key={s.city}>
                  {s.place}, {s.city} <span className="footer__when">· {s.when}</span>
                </li>
              ))}
              <li>Private appointments on request</li>
            </ul>
          </div>
          <div>
            <p className="label gold">Correspond</p>
            <ul>
              <li>{BRAND.whatsapp}</li>
              <li>Instagram {BRAND.instagram}</li>
              <li>{BRAND.email}</li>
              <li>The Femmora Private List</li>
            </ul>
          </div>
          <div>
            <p className="label gold">Promises</p>
            <ul>
              <li>Measurements kept on file</li>
              <li>Rigid-box delivery with a how-to-wear card</li>
              <li>No sales. No discount codes. Ever.</li>
            </ul>
          </div>
        </div>

        <div className="footer__wordmark" aria-hidden>
          Femmora
        </div>

        <div className="footer__base">
          <span className="label-sm">© 2026 Femmora · {BRAND.motto} · {BRAND.madeBy}</span>
          <span className="label-sm">A demo storefront · MKTG 201 · Group 1</span>
        </div>
      </div>
    </footer>
  )
}
