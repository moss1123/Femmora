import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from 'react'
import { useGo } from '../hooks/useGo'

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  to: string
  children: ReactNode
  /** label shown inside the custom cursor while hovering */
  cursor?: string
}

/** Internal link that always goes through Femmora's transition system. */
export default function TLink({ to, children, onClick, cursor, ...rest }: Props) {
  const go = useGo()
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e)
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
    e.preventDefault()
    go(to)
  }
  return (
    <a href={`${import.meta.env.BASE_URL.replace(/\/$/, '')}${to}`} onClick={handle} data-cursor={cursor} {...rest}>
      {children}
    </a>
  )
}
