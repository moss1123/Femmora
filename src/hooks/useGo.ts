import { useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { useExperience } from '../store/experience'
import { useTransition } from '../store/transition'
import { pageByPath } from '../data/site'
import { scrollToTarget } from '../lib/motion'

/**
 * The ONE way to navigate inside Femmora.
 *  - Same page  → smooth-scrolls (to #hash if given, else to top)
 *  - On the home rack, heading to Styling / Collection / Custom → the garment comes off the rack (3D)
 *  - Otherwise → gold-lined navy curtain transition
 */
export function useGo() {
  const location = useLocation()
  return useCallback(
    (to: string) => {
      const [rawPath, hash] = to.split('#')
      const path = rawPath || location.pathname
      if (path === location.pathname) {
        scrollToTarget(hash ? `#${hash}` : 0)
        return
      }
      const exp = useExperience.getState()
      const tr = useTransition.getState()
      if (tr.busy || exp.phase === 'selecting') return
      const page = pageByPath(path)
      if (location.pathname === '/' && page && exp.webgl && exp.heroVisible && (exp.phase === 'idle' || exp.phase === 'intro')) {
        exp.select(page.id) // the rack takes it from here
        return
      }
      const dest = page ?? (path === '/' ? { title: 'Femmora', numeral: '' } : { title: '', numeral: '' })
      tr.start(to, { mode: 'curtain', color: '#2a0a12', label: dest.title, numeral: dest.numeral })
    },
    [location.pathname],
  )
}

/** Becomes true once the transition cover has lifted on the current page. Use to start hero intros. */
export function usePageReady() {
  const busy = useTransition((s) => s.busy)
  const visible = useTransition((s) => s.cover.visible)
  return !busy && !visible
}
