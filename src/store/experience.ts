import { create } from 'zustand'
import type { GarmentId } from '../data/site'

/**
 * Shared state between the DOM and the 3D rack.
 *
 * phase:
 *  intro      – first load, garments sliding onto the rail
 *  idle       – rack is interactive
 *  selecting  – a garment is coming off the rack → zooming to its page
 *  page       – a non-home page is showing (canvas paused)
 *  returning  – back on home, the last garment glides back onto the rail
 */
export type Phase = 'intro' | 'idle' | 'selecting' | 'page' | 'returning'

interface ExperienceState {
  phase: Phase
  hovered: GarmentId | null
  selected: GarmentId | null
  /** id of the garment that was last opened (used for the return animation) */
  lastOpened: GarmentId | null
  /** the 3D hero is in view (canvas renders only when true) */
  heroVisible: boolean
  /** first frames rendered + fonts ready (preloader can lift) */
  sceneReady: boolean
  /** the rack's entrance has played once */
  introDone: boolean
  /** false when the WebGL layer failed (no WebGL, chunk failed to load) — fall back to plain transitions */
  webgl: boolean
  /** full-screen colour flood used to hand off from WebGL to the page */
  flood: { color: string; visible: boolean; label?: string }
  setPhase: (p: Phase) => void
  setHovered: (id: GarmentId | null) => void
  select: (id: GarmentId) => void
  clearSelection: () => void
  setHeroVisible: (v: boolean) => void
  setFlood: (f: Partial<ExperienceState['flood']>) => void
}

export const useExperience = create<ExperienceState>((set) => ({
  phase: 'intro',
  hovered: null,
  selected: null,
  lastOpened: null,
  heroVisible: true,
  sceneReady: false,
  introDone: false,
  webgl: true,
  flood: { color: '#2a0a12', visible: false },
  setPhase: (phase) => set({ phase }),
  setHovered: (hovered) => set({ hovered }),
  select: (id) => set({ selected: id, lastOpened: id, phase: 'selecting', hovered: null }),
  clearSelection: () => set({ selected: null }),
  setHeroVisible: (heroVisible) => set({ heroVisible }),
  setFlood: (f) => set((s) => ({ flood: { ...s.flood, ...f } })),
}))
