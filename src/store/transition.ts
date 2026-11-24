import { create } from 'zustand'

export type CoverMode = 'flood' | 'curtain'

interface TransitionState {
  /** path (may include #hash) to navigate to once the cover is fully on screen */
  pending: string | null
  cover: {
    visible: boolean
    mode: CoverMode
    color: string
    label?: string
    numeral?: string
  }
  /** increments every time a page is revealed (cover lifted) — pages key intro animations off this */
  revealCount: number
  /** true while the cover is down or animating */
  busy: boolean
  start: (path: string, opts?: Partial<TransitionState['cover']>) => void
  coverDone: () => void
  revealed: () => void
}

export const useTransition = create<TransitionState>((set, get) => ({
  pending: null,
  cover: { visible: false, mode: 'curtain', color: '#2a0a12' },
  revealCount: 1,
  busy: false,
  start: (path, opts = {}) => {
    if (get().busy) return
    set({
      pending: path,
      busy: true,
      cover: { visible: true, mode: opts.mode ?? 'curtain', color: opts.color ?? '#2a0a12', label: opts.label, numeral: opts.numeral },
    })
  },
  coverDone: () => set((s) => ({ cover: { ...s.cover, visible: false } })),
  revealed: () => set((s) => ({ busy: false, pending: null, revealCount: s.revealCount + 1 })),
}))
