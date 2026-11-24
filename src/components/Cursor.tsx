import { useEffect, useRef, useState } from 'react'
import { useExperience } from '../store/experience'
import { pageById } from '../data/site'
import './Cursor.css'

/**
 * Gold ring cursor with lerp-follow. Grows and shows a label over any element with
 * `data-cursor="Label"` (or `data-cursor=""` for grow-only), and over 3D garments.
 */
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const [label, setLabel] = useState<string | null>(null)
  const [enabled, setEnabled] = useState(false)
  const hovered = useExperience((s) => s.hovered)

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    setEnabled(fine)
    if (!fine) return
    document.documentElement.classList.add('has-custom-cursor')
    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    const ringPos = { ...pos }
    let raf = 0
    const move = (e: PointerEvent) => {
      pos.x = e.clientX
      pos.y = e.clientY
      if (dot.current) dot.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`
      const t = (e.target as HTMLElement | null)?.closest<HTMLElement>('[data-cursor], a, button, [role="button"], input, select, textarea, label')
      if (!t) setLabel(null)
      else if (t.dataset.cursor !== undefined) setLabel(t.dataset.cursor)
      else setLabel('')
    }
    const loop = () => {
      ringPos.x += (pos.x - ringPos.x) * 0.16
      ringPos.y += (pos.y - ringPos.y) * 0.16
      if (ring.current) ring.current.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0)`
      raf = requestAnimationFrame(loop)
    }
    const leave = () => document.documentElement.classList.add('cursor-out')
    const enter = () => document.documentElement.classList.remove('cursor-out')
    window.addEventListener('pointermove', move, { passive: true })
    document.addEventListener('mouseleave', leave)
    document.addEventListener('mouseenter', enter)
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', move)
      document.removeEventListener('mouseleave', leave)
      document.removeEventListener('mouseenter', enter)
      document.documentElement.classList.remove('has-custom-cursor')
    }
  }, [])

  if (!enabled) return null
  const text = hovered ? pageById(hovered).title : label
  const active = hovered !== null || label !== null
  return (
    <>
      <div ref={ring} className={`cursor-ring ${active ? 'is-active' : ''} ${text ? 'has-label' : ''}`} aria-hidden>
        <span className="cursor-ring__circle" />
        <span className="cursor-ring__label">{text}</span>
      </div>
      <div ref={dot} className="cursor-dot" aria-hidden />
    </>
  )
}
