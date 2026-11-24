import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import Nav from './components/Nav'
import Footer from './components/Footer'
import Cursor from './components/Cursor'
import Grain from './components/Grain'
import TransitionLayer from './components/TransitionLayer'
import CartDrawer from './components/CartDrawer'
import SafeBoundary from './components/SafeBoundary'
import Home from './pages/home/Home'
import Styling from './pages/styling/Styling'
import Collection from './pages/collection/Collection'
import Custom from './pages/custom/Custom'
import { useExperience } from './store/experience'
import { initLenis, ScrollTrigger } from './lib/motion'

const Experience = lazy(() => import('./three/Experience'))

const TITLES: Record<string, string> = {
  '/': 'Femmora — For women who lead.',
  '/styling': 'Styling — Dress the woman you’re becoming · Femmora',
  '/collection': 'The Collection — Beyond the Silhouette, Chapter One · Femmora',
  '/custom': 'Custom Services — Made to measure. Made to lead. · Femmora',
}

function Shell() {
  const location = useLocation()
  const onHome = location.pathname === '/'
  const [mount3D, setMount3D] = useState(onHome)
  const prev = useRef(location.pathname)

  useEffect(() => {
    initLenis()
  }, [])

  // Keep the 3D phase in sync with the route.
  useEffect(() => {
    const exp = useExperience.getState()
    if (onHome) {
      setMount3D(true)
      if (!exp.webgl) exp.setPhase('idle')
      else if (!exp.introDone) exp.setPhase('intro')
      else if (prev.current !== '/' && exp.lastOpened) exp.setPhase('returning')
      else if (exp.phase === 'page') exp.setPhase('idle')
    } else {
      exp.setPhase('page')
      exp.clearSelection()
      exp.setHovered(null)
    }
    prev.current = location.pathname
    document.documentElement.dataset.route = location.pathname.replace('/', '') || 'home'
    document.title = TITLES[location.pathname] ?? TITLES['/']
    requestAnimationFrame(() => ScrollTrigger.refresh())
  }, [location.pathname, onHome])

  return (
    <>
      {mount3D && (
        <SafeBoundary
          onError={() => useExperience.setState({ webgl: false, phase: onHome ? 'idle' : 'page', introDone: true, sceneReady: true })}
          fallback={
            <div className={`xp-fallback ${onHome ? 'is-active' : ''}`} aria-hidden>
              <span>Femmora</span>
            </div>
          }
        >
          <Suspense fallback={null}>
            <Experience active={onHome} />
          </Suspense>
        </SafeBoundary>
      )}
      <Nav />
      <main id="main">
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/styling" element={<Styling />} />
          <Route path="/collection" element={<Collection />} />
          <Route path="/custom" element={<Custom />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <Footer />
      <CartDrawer />
      <TransitionLayer />
      <Cursor />
      <Grain />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '') || undefined}>
      <Shell />
    </BrowserRouter>
  )
}
