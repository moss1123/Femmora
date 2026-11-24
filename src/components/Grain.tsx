/** Fixed film-grain overlay — the "paper" of the whole site. */
export default function Grain() {
  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        inset: '-50%',
        zIndex: 850,
        pointerEvents: 'none',
        opacity: 0.055,
        mixBlendMode: 'overlay',
        backgroundImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1.4 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        animation: 'grain-shift 1.2s steps(6) infinite',
      }}
    >
      <style>{`@keyframes grain-shift{0%{transform:translate(0,0)}20%{transform:translate(-3%,2%)}40%{transform:translate(2%,-3%)}60%{transform:translate(-2%,-1%)}80%{transform:translate(3%,3%)}100%{transform:translate(0,0)}}@media (prefers-reduced-motion: reduce){[aria-hidden][style*="grain-shift"]{animation:none!important}}`}</style>
    </div>
  )
}
