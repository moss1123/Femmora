import { Suspense, useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, MeshReflectorMaterial, Sparkles, Text } from '@react-three/drei'
import Garment, { NECK_Y, RAIL_Y, type GarmentRegistry } from './Garment'
import Rack from './Rack'
import { makeGlowTexture } from './textures'
import { heroScroll } from './scrollState'
import { pageById, type GarmentId } from '../data/site'
import { useExperience } from '../store/experience'
import { useTransition } from '../store/transition'
import { gsap, getLenis, prefersReducedMotion } from '../lib/motion'

const ORDER: GarmentId[] = ['styling', 'collection', 'custom']
const FOV = 35
const TAN = Math.tan(THREE.MathUtils.degToRad(FOV / 2))

/* --------------------------------- layout --------------------------------- */

export function useLayout() {
  const size = useThree((s) => s.size)
  return useMemo(() => {
    const aspect = size.width / Math.max(1, size.height)
    const compact = aspect < 0.95
    const spacing = compact ? 0.74 : 1.42
    const yaw = compact ? 0.62 : 0
    const half = compact ? 1.32 : 2.42
    const needHalfW = compact ? 1.2 : 2.02
    const dist = THREE.MathUtils.clamp(needHalfW / (TAN * aspect), compact ? 6 : 4.7, compact ? 10.5 : 8.5)
    const camY = compact ? 1.62 : 1.52
    const targetY = compact ? 1.32 : 1.34
    return {
      aspect,
      compact,
      half,
      dist,
      camY,
      targetY,
      rest: ORDER.map((id, i) => ({ id, x: (i - 1) * spacing, yaw: (i - 1) * -yaw })),
    }
  }, [size.width, size.height])
}

/* ------------------------------- camera rig -------------------------------- */

interface RigState {
  pos: THREE.Vector3
  look: THREE.Vector3
  fov: number
  /** 0 = pointer parallax + scroll drift off (during cinematics) */
  freedom: number
}

function CameraRig({ rig }: { rig: React.MutableRefObject<RigState> }) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  const pointer = useThree((s) => s.pointer)
  const par = useRef(new THREE.Vector2())
  const tmp = useMemo(() => new THREE.Vector3(), [])
  useFrame((_, dt) => {
    const r = rig.current
    const d = Math.min(dt, 1 / 30)
    par.current.x = THREE.MathUtils.damp(par.current.x, pointer.x * r.freedom, 2.2, d)
    par.current.y = THREE.MathUtils.damp(par.current.y, pointer.y * r.freedom, 2.2, d)
    const p = heroScroll.progress * r.freedom
    camera.position.set(r.pos.x + par.current.x * 0.32, r.pos.y + par.current.y * 0.14 + p * 0.55, r.pos.z + p * 1.4)
    tmp.copy(r.look)
    tmp.y -= p * 0.15
    camera.lookAt(tmp)
    if (Math.abs(camera.fov - r.fov) > 0.01) {
      camera.fov = r.fov
      camera.updateProjectionMatrix()
    }
  })
  return null
}

/* -------------------------------- director --------------------------------- */

function Director({
  registry,
  rig,
  layout,
  wordmark,
}: {
  registry: React.MutableRefObject<GarmentRegistry>
  rig: React.MutableRefObject<RigState>
  layout: ReturnType<typeof useLayout>
  wordmark: React.MutableRefObject<THREE.Group | null>
}) {
  const phase = useExperience((s) => s.phase)
  const selected = useExperience((s) => s.selected)
  const sceneReady = useExperience((s) => s.sceneReady)
  const coverVisible = useTransition((s) => s.cover.visible)
  const tl = useRef<gsap.core.Timeline | null>(null)
  const layoutRef = useRef(layout)
  layoutRef.current = layout

  const homeRig = () => {
    const L = layoutRef.current
    return { pos: new THREE.Vector3(0, L.camY, L.dist), look: new THREE.Vector3(0, L.targetY, 0) }
  }

  // keep resting rig in sync with layout while idle
  useEffect(() => {
    const { phase: ph } = useExperience.getState()
    if (ph === 'idle' || ph === 'page') {
      const h = homeRig()
      rig.current.pos.copy(h.pos)
      rig.current.look.copy(h.look)
      for (const r of layout.rest) {
        const g = registry.current[r.id]
        if (g) g.outer.position.set(r.x, RAIL_Y, 0)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout])

  useEffect(() => {
    const reduce = prefersReducedMotion()
    const L = layoutRef.current
    const handles = () => ORDER.map((id) => registry.current[id]).filter(Boolean) as NonNullable<GarmentRegistry[GarmentId]>[]
    const restOf = (id: GarmentId) => L.rest.find((r) => r.id === id)!

    /* ---------- INTRO: garments glide along the rail into place ---------- */
    if (phase === 'intro') {
      if (!sceneReady || coverVisible) return
      tl.current?.kill()
      const h = homeRig()
      const t = gsap.timeline({
        onComplete: () => useExperience.setState({ phase: 'idle', introDone: true }),
      })
      tl.current = t
      if (reduce) {
        rig.current.pos.copy(h.pos)
        rig.current.look.copy(h.look)
        handles().forEach((g) => g.outer.position.set(restOf(g.id).x, RAIL_Y, 0))
        t.to({}, { duration: 0.01 })
        return
      }
      rig.current.freedom = 0
      rig.current.pos.set(0, h.pos.y + 0.55, h.pos.z + 2.6)
      rig.current.look.set(0, h.look.y + 0.35, 0)
      t.to(rig.current.pos, { x: h.pos.x, y: h.pos.y, z: h.pos.z, duration: 3.2, ease: 'silk' }, 0)
      t.to(rig.current.look, { x: h.look.x, y: h.look.y, z: h.look.z, duration: 3.2, ease: 'silk' }, 0)
      t.to(rig.current, { freedom: 1, duration: 1.2 }, 2.6)
      if (wordmark.current) {
        t.fromTo(wordmark.current.position, { y: 1.2 }, { y: 1.62, duration: 2.6, ease: 'lux' }, 0.2)
        const mat = (wordmark.current.children[0] as THREE.Mesh | undefined)?.material as THREE.MeshStandardMaterial | undefined
        if (mat) t.fromTo(mat, { opacity: 0 }, { opacity: 1, duration: 2.2, ease: 'power2.out' }, 0.2)
      }
      handles().forEach((g, i) => {
        const r = restOf(g.id)
        g.outer.position.set(r.x + L.half * 2 + 1.5 + i * 0.6, RAIL_Y, 0)
        g.presence.value = 0
        t.to(g.outer.position, {
          x: r.x,
          duration: 2.1,
          ease: 'expo.out',
          onComplete: () => g.kick(-1.9),
        }, 0.5 + (2 - i) * 0.22)
        t.to(g.presence, { value: 1, duration: 1.6, ease: 'power2.out' }, 1.1 + (2 - i) * 0.22)
      })
      return
    }

    /* ---------- SELECTING: lift off → fly to camera → twirl → zoom in ---------- */
    if (phase === 'selecting' && selected) {
      tl.current?.kill()
      const page = pageById(selected)
      const sel = registry.current[selected]
      if (!sel) {
        useTransition.getState().start(page.path, { mode: 'flood', color: page.flood, label: page.title, numeral: page.numeral })
        return
      }
      getLenis()?.scrollTo(0, { duration: 0.9 })
      const h = homeRig()
      const H = sel.height
      const frontDist = (H + 0.2) / (2 * TAN) / 0.9
      // garment centre (origin.y + NECK_Y − H/2) lands on the camera's eye line
      const front = new THREE.Vector3(0, h.pos.y - NECK_Y + H / 2, h.pos.z - frontDist)
      const chestY = front.y + NECK_Y - Math.min(0.32, H * 0.3)
      const t = gsap.timeline()
      tl.current = t
      const D = reduce ? 0.35 : 1
      t.to(rig.current, { freedom: 0, duration: 0.6 * D }, 0)
      t.to(rig.current.look, { x: 0, y: h.pos.y, z: front.z - 1, duration: 1.6 * D, ease: 'silk' }, 0.3 * D)

      // the others step aside along the rail and fade back
      handles()
        .filter((g) => g.id !== selected)
        .forEach((g) => {
          const r = restOf(g.id)
          const dir = r.x === 0 ? 1 : Math.sign(r.x - restOf(selected).x) || 1
          t.to(g.outer.position, { x: r.x + dir * 0.95, duration: 1.0 * D, ease: 'power3.out', onStart: () => g.kick(dir * 1.2) }, 0.05)
          t.to(g.presence, { value: 0.25, duration: 0.8 * D }, 0.05)
        })

      // lift the hook clear of the rail
      t.to(sel.outer.position, { y: RAIL_Y + 0.3, duration: 0.55 * D, ease: 'power2.out', onStart: () => sel.kick(0.8) }, 0)
      // glide to the front of the stage with a full twirl
      t.to(sel.outer.position, { x: front.x, y: front.y, z: front.z, duration: 1.35 * D, ease: 'power3.inOut' }, 0.45 * D)
      t.fromTo(sel.outer.rotation, { y: 0 }, { y: reduce ? 0 : Math.PI * 2, duration: 1.45 * D, ease: 'power2.inOut' }, 0.4 * D)
      t.to(sel.presence, { value: 1.6, duration: 1 * D }, 0.4 * D)
      // push the camera into the fabric
      t.to(rig.current.pos, { x: 0, y: chestY, z: front.z + 0.42, duration: 1.0 * D, ease: 'power3.in' }, 1.7 * D)
      t.to(rig.current.look, { x: 0, y: chestY - 0.02, z: front.z, duration: 1.0 * D, ease: 'power2.inOut' }, 1.7 * D)
      t.to(rig.current, { fov: 24, duration: 1.0 * D, ease: 'power2.in' }, 1.7 * D)
      t.call(
        () => useTransition.getState().start(page.path, { mode: 'flood', color: page.flood, label: page.title, numeral: page.numeral }),
        [],
        2.15 * D,
      )
      return
    }

    /* ---------- RETURNING: the garment glides back onto the rail ---------- */
    if (phase === 'returning') {
      if (coverVisible) return
      tl.current?.kill()
      const { lastOpened } = useExperience.getState()
      const h = homeRig()
      rig.current.pos.copy(h.pos)
      rig.current.look.copy(h.look)
      rig.current.fov = FOV
      rig.current.freedom = 0
      const t = gsap.timeline({
        onComplete: () => useExperience.setState({ phase: 'idle', lastOpened: null }),
      })
      tl.current = t
      const D = reduce ? 0.3 : 1
      handles().forEach((g) => {
        const r = restOf(g.id)
        if (g.id === lastOpened) {
          const H = g.height
          const frontDist = (H + 0.2) / (2 * TAN) / 0.9
          g.outer.position.set(0, h.pos.y - (NECK_Y - H / 2), h.pos.z - frontDist)
          g.outer.rotation.y = 0
          g.presence.value = 1.4
          t.to(g.outer.position, { x: r.x, y: RAIL_Y + 0.3, z: 0, duration: 1.5 * D, ease: 'power3.inOut' }, 0.1)
          t.to(g.outer.rotation, { y: reduce ? 0 : -Math.PI * 2, duration: 1.5 * D, ease: 'power2.inOut' }, 0.1)
          t.set(g.outer.rotation, { y: 0 })
          t.to(g.outer.position, { y: RAIL_Y, duration: 0.55 * D, ease: 'back.out(2.2)', onComplete: () => g.kick(-1.4) }, 1.55 * D)
          t.to(g.presence, { value: 1, duration: 0.8 }, 1.4 * D)
        } else {
          const dir = Math.sign(r.x - (lastOpened ? restOf(lastOpened).x : 0)) || 1
          g.outer.position.set(r.x + dir * 0.95, RAIL_Y, 0)
          g.presence.value = 0.25
          t.to(g.outer.position, { x: r.x, duration: 1.1 * D, ease: 'power3.out', onComplete: () => g.kick(-dir * 1.1) }, 0.9 * D)
          t.to(g.presence, { value: 1, duration: 0.9 }, 0.9 * D)
        }
      })
      t.to(rig.current, { freedom: 1, duration: 1 }, 1.4 * D)
      return
    }

    /* ---------- PAGE: park everything at rest (canvas is paused) ---------- */
    if (phase === 'page') {
      // leave the frozen frame as is; positions are reset when returning
      return
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, selected, sceneReady, coverVisible])

  useEffect(() => () => void tl.current?.kill(), [])
  return null
}

/* --------------------------------- staging --------------------------------- */

function Stage({ half }: { half: number }) {
  const glow = useMemo(() => makeGlowTexture('rgba(138, 34, 56, 0.55)'), [])
  const warm = useMemo(() => makeGlowTexture('rgba(201, 165, 92, 0.14)'), [])
  useEffect(() => () => {
    glow.dispose()
    warm.dispose()
  }, [glow, warm])
  return (
    <>
      {/* back-wall light pool */}
      <mesh position={[0, 2.1, -4.2]}>
        <planeGeometry args={[13, 7.5]} />
        <meshBasicMaterial map={glow} transparent depthWrite={false} toneMapped={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh position={[0, 0.9, -1.2]}>
        <planeGeometry args={[half * 2.8, 2.6]} />
        <meshBasicMaterial map={warm} transparent depthWrite={false} toneMapped={false} blending={THREE.AdditiveBlending} opacity={0.55} />
      </mesh>
      {/* polished floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[40, 40]} />
        <MeshReflectorMaterial
          blur={[420, 120]}
          resolution={512}
          mixBlur={1}
          mixStrength={3.2}
          roughness={0.9}
          depthScale={1.1}
          minDepthThreshold={0.3}
          maxDepthThreshold={1.3}
          color="#1c070d"
          metalness={0.55}
          mirror={0.55}
        />
      </mesh>
    </>
  )
}

function Wordmark({ groupRef }: { groupRef: React.MutableRefObject<THREE.Group | null> }) {
  return (
    <group ref={groupRef} position={[0, 1.62, -2.7]}>
      <Text
        font={`${import.meta.env.BASE_URL}fonts/bodoni-italic.woff`}
        fontSize={1.3}
        letterSpacing={-0.035}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0}
      >
        Femmora
        <meshStandardMaterial color="#c9a55c" emissive="#5c4219" emissiveIntensity={0.35} metalness={0.9} roughness={0.28} envMapIntensity={1.1} transparent />
      </Text>
    </group>
  )
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.2} color="#f0cfc2" />
      <directionalLight position={[-3, 5, 4]} intensity={0.55} color="#fff1da" />
      <directionalLight position={[4, 3, -3]} intensity={0.4} color="#c26a7c" />
      <Environment resolution={256} frames={1}>
        <color attach="background" args={['#14050a']} />
        <Lightformer form="rect" intensity={2.2} color="#fff4e2" position={[0, 6, 2]} rotation-x={Math.PI / 2} scale={[8, 3, 1]} />
        <Lightformer form="rect" intensity={1.6} color="#ffd9a0" position={[-6, 2, 1]} rotation-y={Math.PI / 2} scale={[4, 6, 1]} />
        <Lightformer form="rect" intensity={1.1} color="#f2b9a6" position={[6, 2, -1]} rotation-y={-Math.PI / 2} scale={[4, 6, 1]} />
        <Lightformer form="ring" intensity={1.4} color="#f1dfb2" position={[0, 2, 6]} scale={3} />
        <Lightformer form="rect" intensity={0.6} color="#7a1f33" position={[0, -2, -5]} scale={[12, 3, 1]} />
      </Environment>
    </>
  )
}

/** Marks the scene ready once a few frames have been drawn (shaders compiled). */
function ReadySignal() {
  const frames = useRef(0)
  useFrame(() => {
    frames.current++
    if (frames.current === 4) {
      const done = () => useExperience.setState({ sceneReady: true })
      if (document.fonts?.ready) document.fonts.ready.then(done)
      else done()
    }
  })
  return null
}

/* ---------------------------------- scene ---------------------------------- */

export default function Scene() {
  const layout = useLayout()
  const registry = useRef<GarmentRegistry>({})
  const wordmark = useRef<THREE.Group | null>(null)
  const rig = useRef<RigState>({
    pos: new THREE.Vector3(0, layout.camY + 0.55, layout.dist + 2.6),
    look: new THREE.Vector3(0, layout.targetY + 0.35, 0),
    fov: FOV,
    freedom: 0,
  })
  useEffect(() => {
    if (import.meta.env.DEV) (window as unknown as { __fm: unknown }).__fm = { rig: rig.current, registry: registry.current }
  }, [])

  return (
    <>
      <color attach="background" args={['#14050a']} />
      <fog attach="fog" args={['#14050a', 6.5, 17]} />
      <Lights />
      <CameraRig rig={rig} />
      <Suspense fallback={null}>
        <Wordmark groupRef={wordmark} />
        <Stage half={layout.half} />
        <Rack half={layout.half} />
        {layout.rest.map((r) => (
          <Garment key={r.id} id={r.id} rest={{ x: r.x, yaw: r.yaw }} registry={registry} />
        ))}
        <Sparkles count={70} scale={[layout.half * 2.4, 3.2, 3]} position={[0, 1.6, 0.4]} size={1.6} speed={0.18} opacity={0.45} color="#e3c88a" noise={0.6} />
        <Director registry={registry} rig={rig} layout={layout} wordmark={wordmark} />
        <ReadySignal />
      </Suspense>
    </>
  )
}

