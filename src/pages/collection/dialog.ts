import { useEffect, useRef, type RefObject } from 'react'
import { getLenis } from '../../lib/motion'

/* ==========================================================================
   Modal helpers shared by the Quick View and the global Bag drawer:
   ref-counted scroll lock (Lenis stop/start) and an accessible focus trap.
   ========================================================================== */

let locks = 0
let prevOverflow = ''

export function lockScroll() {
  locks += 1
  if (locks !== 1) return
  const lenis = getLenis()
  if (lenis) lenis.stop()
  else {
    prevOverflow = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
  }
}

export function unlockScroll() {
  if (locks === 0) return
  locks -= 1
  if (locks !== 0) return
  const lenis = getLenis()
  if (lenis) lenis.start()
  else document.documentElement.style.overflow = prevOverflow
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

const focusables = (root: HTMLElement) =>
  Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => el.getClientRects().length > 0 && !el.closest('[inert]') && el.getAttribute('aria-hidden') !== 'true',
  )

/** Topmost dialog handles keys; a stack keeps stacked dialogs well-behaved. */
const stack: symbol[] = []

interface DialogOptions {
  /** element to focus first (defaults to the first focusable inside the dialog) */
  initialFocus?: RefObject<HTMLElement | null>
  /** return false to skip restoring focus to the opener on close */
  shouldRestore?: () => boolean
  /** element to focus on close when the opener has gone */
  fallbackFocus?: () => HTMLElement | null
}

/**
 * Wires an open dialog: locks page scroll, traps Tab inside `ref`, closes on Escape,
 * and returns focus to whatever opened it.
 */
export function useDialog(active: boolean, ref: RefObject<HTMLElement | null>, onClose: () => void, opts: DialogOptions = {}) {
  const closeRef = useRef(onClose)
  const optsRef = useRef(opts)
  useEffect(() => {
    closeRef.current = onClose
    optsRef.current = opts
  })

  useEffect(() => {
    if (!active) return
    const id = Symbol('dialog')
    stack.push(id)
    const opener = document.activeElement as HTMLElement | null
    lockScroll()

    const focusFirst = () => {
      const root = ref.current
      if (!root) return
      const target = optsRef.current.initialFocus?.current ?? focusables(root)[0] ?? root
      target.focus({ preventScroll: true })
    }
    // wait two frames so the dialog is mounted & laid out (both ids kept so cleanup cancels either)
    let raf = requestAnimationFrame(() => {
      raf = requestAnimationFrame(focusFirst)
    })

    const onKey = (e: KeyboardEvent) => {
      if (stack[stack.length - 1] !== id) return
      if (e.key === 'Escape') {
        e.preventDefault()
        closeRef.current()
        return
      }
      if (e.key !== 'Tab') return
      const root = ref.current
      if (!root) return
      const els = focusables(root)
      if (els.length === 0) {
        e.preventDefault()
        root.focus()
        return
      }
      const first = els[0]
      const last = els[els.length - 1]
      const current = document.activeElement as HTMLElement | null
      const inside = current ? root.contains(current) : false
      if (e.shiftKey && (current === first || !inside)) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && (current === last || !inside)) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)

    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('keydown', onKey)
      const i = stack.indexOf(id)
      if (i >= 0) stack.splice(i, 1)
      unlockScroll()
      const { shouldRestore, fallbackFocus } = optsRef.current
      if (shouldRestore && !shouldRestore()) return
      const target = opener && opener.isConnected && opener !== document.body ? opener : fallbackFocus?.() ?? null
      target?.focus({ preventScroll: true })
    }
  }, [active, ref])
}
