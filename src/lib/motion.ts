/**
 * Central animation setup: GSAP plugins + Lenis smooth scroll, kept in sync.
 * Import { gsap, ScrollTrigger, SplitText } from here so plugins are always registered.
 */
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { CustomEase } from 'gsap/CustomEase'
import { Flip } from 'gsap/Flip'
import { useGSAP } from '@gsap/react'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase, Flip, useGSAP)

// House eases
CustomEase.create('lux', '0.22, 1, 0.36, 1')
CustomEase.create('silk', '0.65, 0, 0.35, 1')
CustomEase.create('drape', 'M0,0 C0.25,0.1 0.2,1 1,1')

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

let lenis: Lenis | null = null

export function initLenis() {
  if (lenis || typeof window === 'undefined') return lenis
  lenis = new Lenis({
    duration: 1.25,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: !prefersReducedMotion(),
    wheelMultiplier: 0.95,
    touchMultiplier: 1.4,
  })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((time) => lenis?.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)
  return lenis
}

export const getLenis = () => lenis

/** Jump to top instantly (used behind the transition curtain). */
export function resetScroll() {
  if (lenis) lenis.scrollTo(0, { immediate: true, force: true })
  else window.scrollTo(0, 0)
}

export function scrollToTarget(target: string | HTMLElement | number, offset = -40) {
  if (lenis) lenis.scrollTo(target as never, { offset, duration: 1.6 })
  else if (typeof target === 'number') window.scrollTo({ top: target, behavior: 'smooth' })
  else {
    const el = typeof target === 'string' ? document.querySelector(target) : target
    el?.scrollIntoView({ behavior: 'smooth' })
  }
}

export { gsap, ScrollTrigger, SplitText, Flip, useGSAP }
