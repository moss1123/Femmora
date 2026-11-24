import { useRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import TLink from './TLink'
import './Button.css'

type Variant = 'gold' | 'outline' | 'ghost' | 'solid'

interface Common {
  variant?: Variant
  children: ReactNode
  /** small arrow glyph after the label */
  arrow?: boolean
  magnetic?: boolean
  className?: string
  cursor?: string
}

type AsLink = Common & { to: string } & { onClick?: never; type?: never }
type AsButton = Common & { to?: undefined } & ButtonHTMLAttributes<HTMLButtonElement>

/**
 * Femmora button. `gold` = foil-gradient fill, `outline` = hairline gold border,
 * `ghost` = text + underline sweep, `solid` = navy/ivory inverse of the current theme.
 * Pass `to` to render a transition link.
 */
export default function Button(props: AsLink | AsButton) {
  const { variant = 'outline', children, arrow = true, magnetic = true, className = '', cursor } = props
  const ref = useRef<HTMLSpanElement>(null)

  const onMove = (e: React.MouseEvent) => {
    if (!magnetic || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    const x = (e.clientX - (r.left + r.width / 2)) * 0.18
    const y = (e.clientY - (r.top + r.height / 2)) * 0.28
    ref.current.style.transform = `translate3d(${x}px, ${y}px, 0)`
  }
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = ''
  }

  const inner = (
    <span className="fbtn__inner" ref={ref}>
      <span className="fbtn__label">{children}</span>
      {arrow && (
        <svg className="fbtn__arrow" viewBox="0 0 28 10" aria-hidden>
          <path d="M0 5h26M22 1l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>
      )}
    </span>
  )
  const cls = `fbtn fbtn--${variant} ${className}`

  if ('to' in props && props.to) {
    return (
      <TLink to={props.to} className={cls} onMouseMove={onMove} onMouseLeave={onLeave} cursor={cursor}>
        {inner}
      </TLink>
    )
  }
  const { variant: _v, arrow: _a, magnetic: _m, className: _c, cursor: _cur, children: _ch, to: _to, ...btn } = props as AsButton
  void _v, _a, _m, _c, _cur, _ch, _to
  return (
    <button className={cls} onMouseMove={onMove} onMouseLeave={onLeave} data-cursor={cursor} {...btn}>
      {inner}
    </button>
  )
}
