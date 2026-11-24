import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { buildGarment, type BuiltGarment } from './garmentModel'
import { makeTagTexture } from './textures'
import { pageById, type GarmentId } from '../data/site'
import { useExperience } from '../store/experience'
import { useTransition } from '../store/transition'
import { goldMaterial } from './materials'

export const RAIL_Y = 2.0
export const NECK_Y = -0.115

/** Live handles the director animates. */
export interface GarmentHandle {
  id: GarmentId
  outer: THREE.Group
  sway: THREE.Group
  tag: THREE.Group
  light: THREE.SpotLight
  height: number
  /** add angular velocity to the hanger swing */
  kick: (v: number) => void
  /** 0..1 extra presence (used to dim the others during selection) */
  presence: { value: number }
  /** resting yaw on the rail (responsive layout) */
  rest: { x: number; yaw: number }
}

export type GarmentRegistry = Partial<Record<GarmentId, GarmentHandle>>

/* ----------------------------- small geometries ---------------------------- */

type P2 = [number, number]

/** A flat ribbon that follows a garment-space path, riding a shell surface (z from `zAt`). */
function ribbonGeometry(path: P2[], width: number, zAt: (x: number, y: number) => number, samples = 64) {
  const curve = new THREE.CatmullRomCurve3(path.map(([x, y]) => new THREE.Vector3(x, y, 0)))
  const pts = curve.getSpacedPoints(samples)
  const pos: number[] = []
  const uv: number[] = []
  const idx: number[] = []
  let len = 0
  const lens = [0]
  for (let i = 1; i < pts.length; i++) {
    len += pts[i].distanceTo(pts[i - 1])
    lens.push(len)
  }
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i]
    const t = curve.getTangentAt(i / samples)
    const nx = -t.y
    const ny = t.x
    for (const s of [-1, 1]) {
      const x = p.x + (nx * width * s) / 2
      const y = p.y + (ny * width * s) / 2
      pos.push(x, y, zAt(x, y))
      uv.push(s < 0 ? 0 : 1, 1 - lens[i] / len)
    }
    if (i < pts.length - 1) {
      const a = i * 2
      idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3)
    }
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
  g.setIndex(idx)
  g.computeVertexNormals()
  return g
}

function useHangerGeometries(barHalf: number) {
  return useMemo(() => {
    const hook = new THREE.CatmullRomCurve3(
      [
        [0, -0.112, 0.004],
        [0, -0.07, 0.02],
        [0, -0.03, 0.03],
        [0, 0.008, 0.03],
        [0, 0.03, 0.016],
        [0, 0.034, -0.004],
        [0, 0.022, -0.024],
        [0, 0.0, -0.031],
        [0, -0.016, -0.026],
      ].map((p) => new THREE.Vector3(...(p as [number, number, number]))),
    )
    const bar = new THREE.CatmullRomCurve3(
      [
        [-barHalf, -0.172, 0],
        [-barHalf * 0.5, -0.138, 0],
        [0, -0.118, 0],
        [barHalf * 0.5, -0.138, 0],
        [barHalf, -0.172, 0],
      ].map((p) => new THREE.Vector3(...(p as [number, number, number]))),
    )
    return {
      hook: new THREE.TubeGeometry(hook, 48, 0.0042, 10, false),
      bar: new THREE.TubeGeometry(bar, 48, 0.0085, 12, false),
      cap: new THREE.SphereGeometry(0.0105, 16, 12),
      knob: new THREE.SphereGeometry(0.006, 12, 10),
    }
  }, [barHalf])
}

/* --------------------------------- garment --------------------------------- */

export default function Garment({
  id,
  rest,
  registry,
}: {
  id: GarmentId
  rest: { x: number; yaw: number }
  registry: React.MutableRefObject<GarmentRegistry>
}) {
  const built = useMemo<BuiltGarment>(() => buildGarment(id), [id])
  const { spec } = built
  const page = pageById(id)
  const outer = useRef<THREE.Group>(null!)
  const sway = useRef<THREE.Group>(null!)
  const tag = useRef<THREE.Group>(null!)
  const light = useRef<THREE.SpotLight>(null!)
  const lightTarget = useMemo(() => new THREE.Object3D(), [])
  const swing = useRef({ angle: 0, vel: 0 })
  const hover = useRef(0)
  const presence = useRef({ value: 1 })
  const restRef = useRef(rest)
  restRef.current = rest

  const barHalf = 0.2
  const hanger = useHangerGeometries(barHalf)

  /* materials */
  const mats = useMemo(() => {
    const c = spec.colours
    const outerMat = new THREE.MeshPhysicalMaterial({
      map: built.surface,
      alphaMap: built.mask,
      alphaTest: 0.5,
      alphaToCoverage: true,
      normalMap: built.weave,
      normalScale: new THREE.Vector2(0.16, 0.16),
      bumpMap: built.surface,
      bumpScale: 0.9,
      roughness: spec.roughness,
      metalness: 0,
      sheen: spec.sheen,
      sheenColor: new THREE.Color(c.sheen),
      sheenRoughness: 0.5,
      side: THREE.FrontSide,
      envMapIntensity: 0.8,
    })
    const innerMat = new THREE.MeshStandardMaterial({
      color: c.lining,
      alphaMap: built.mask,
      alphaTest: 0.5,
      alphaToCoverage: true,
      roughness: 0.38,
      metalness: 0.05,
      side: THREE.BackSide,
    })
    const outerBack = outerMat.clone()
    outerBack.map = built.surfaceBack
    outerBack.bumpMap = built.surfaceBack
    outerBack.alphaMap = built.maskBack
    const innerBack = innerMat.clone()
    innerBack.alphaMap = built.maskBack
    // solid cloth (no mask) for the collar and belt
    const clothMat = new THREE.MeshPhysicalMaterial({
      color: c.base,
      roughness: spec.roughness,
      sheen: spec.sheen,
      sheenColor: new THREE.Color(c.sheen),
      sheenRoughness: 0.5,
      side: THREE.DoubleSide,
      normalMap: built.weave,
      normalScale: new THREE.Vector2(0.14, 0.14),
    })
    const beltMat = clothMat.clone()
    beltMat.color = new THREE.Color(c.belt)
    const collarLining = new THREE.MeshStandardMaterial({ color: c.lining, roughness: 0.4, side: THREE.BackSide })
    return { outerMat, innerMat, outerBack, innerBack, clothMat, beltMat, collarLining }
  }, [built, spec])

  /* belt, collar, buckles */
  const extras = useMemo(() => {
    const y = spec.beltY
    const lift = 0.0065
    const fz = (x: number, yy: number) => built.frontZ(x, yy) + lift
    const bz = (x: number, yy: number) => built.backZ(x, yy) - lift
    const beltFront = ribbonGeometry(
      [
        [-0.205, y],
        [-0.1, y],
        [0, y],
        [0.1, y],
        [0.205, y],
      ],
      0.042,
      fz,
      72,
    )
    const beltBack = ribbonGeometry(
      [
        [-0.205, y],
        [0, y],
        [0.205, y],
      ],
      0.042,
      bz,
      72,
    )
    // the loose end drops from the buckle
    const beltTail = ribbonGeometry(
      [
        [-0.095, y],
        [-0.112, y - 0.06],
        [-0.124, y - 0.13],
        [-0.13, y - 0.2],
      ],
      0.04,
      (x, yy) => built.frontZ(x, yy) + lift + 0.006,
      32,
    )
    const collar = new THREE.CylinderGeometry(0.09, 0.075, 0.074, 56, 4, true, 0.78, Math.PI * 2 - 1.56)
    return { beltFront, beltBack, beltTail, collar }
  }, [built, spec.beltY])

  const tagTex = useMemo(() => makeTagTexture(page.numeral, page.title), [page.numeral, page.title])
  // dispose on unmount
  useEffect(
    () => () => {
      Object.values(mats).forEach((m) => m.dispose())
      Object.values(extras).forEach((g) => g.dispose())
      tagTex.dispose()
    },
    [mats, tagTex, extras],
  )

  /* register for the director */
  useLayoutEffect(() => {
    light.current.target = lightTarget
    registry.current[id] = {
      id,
      outer: outer.current,
      sway: sway.current,
      tag: tag.current,
      light: light.current,
      height: spec.height,
      kick: (v) => {
        swing.current.vel += v
      },
      presence: presence.current,
      rest: restRef.current,
    }
    return () => {
      delete registry.current[id]
    }
  }, [id, registry, spec.height, lightTarget])

  useEffect(() => {
    const h = registry.current[id]
    if (h) h.rest = rest
  }, [rest, id, registry])

  /* per-frame: swing physics, idle breeze, hover lean, light */
  useFrame((state, dt) => {
    const d = Math.min(dt, 1 / 30)
    const { phase, hovered } = useExperience.getState()
    const isHot = hovered === id && phase === 'idle'
    hover.current = THREE.MathUtils.damp(hover.current, isHot ? 1 : 0, 6, d)
    const s = swing.current
    // damped spring (hanger pendulum)
    s.vel += (-28 * s.angle - 2.6 * s.vel) * d
    s.angle += s.vel * d
    const t = state.clock.elapsedTime
    const seed = id === 'styling' ? 0 : id === 'collection' ? 2.3 : 4.1
    const breeze = phase === 'selecting' ? 0 : 1
    const sw = sway.current
    sw.rotation.z = s.angle + breeze * Math.sin(t * 0.55 + seed) * 0.01
    const restYaw = restRef.current.yaw
    sw.rotation.y = THREE.MathUtils.lerp(restYaw + breeze * Math.sin(t * 0.37 + seed * 1.7) * 0.06, 0, hover.current)
    sw.position.z = hover.current * 0.16
    sw.position.y = hover.current * 0.025
    const sc = 1 + hover.current * 0.025
    sw.scale.setScalar(sc)
    // tag: turns toward the viewer on hover, otherwise swings softly
    tag.current.rotation.y = THREE.MathUtils.lerp(0.55 + Math.sin(t * 0.8 + seed) * 0.18, 0.05, hover.current)
    tag.current.rotation.z = Math.sin(t * 1.1 + seed) * 0.04 - s.angle * 0.6
    // light follows the garment
    const wp = outer.current.position
    lightTarget.position.set(wp.x, wp.y - 0.7, wp.z)
    light.current.position.set(wp.x * 0.85, 4.6, 2.6 + wp.z * 0.6)
    const base = 24 * presence.current.value
    light.current.intensity = THREE.MathUtils.damp(light.current.intensity, base + hover.current * 30, 5, d)
  })

  const onOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    const exp = useExperience.getState()
    if (exp.phase !== 'idle') return
    exp.setHovered(id)
    if (exp.hovered !== id) swing.current.vel += 0.25
    document.body.style.cursor = 'pointer'
  }
  const onOut = () => {
    const exp = useExperience.getState()
    if (exp.hovered === id) exp.setHovered(null)
    document.body.style.cursor = ''
  }
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    const exp = useExperience.getState()
    if (exp.phase !== 'idle' || useTransition.getState().busy) return
    document.body.style.cursor = ''
    exp.select(id)
  }

  const h = spec.height

  return (
    <>
    <spotLight
      ref={light}
      angle={0.3}
      penumbra={0.9}
      intensity={0}
      distance={10}
      decay={1.1}
      color="#ffe9c4"
    />
    <primitive object={lightTarget} />
    <group ref={outer} position={[rest.x, RAIL_Y, 0]}>
      <group ref={sway}>
        {/* hanger */}
        <mesh geometry={hanger.hook} material={goldMaterial} />
        <mesh geometry={hanger.bar} material={goldMaterial} />
        <mesh geometry={hanger.cap} material={goldMaterial} position={[-barHalf, -0.172, 0]} />
        <mesh geometry={hanger.cap} material={goldMaterial} position={[barHalf, -0.172, 0]} />
        <mesh geometry={hanger.knob} material={goldMaterial} position={[0, -0.016, -0.026]} />

        {/* garment */}
        <group position={[0, NECK_Y, 0]}>
          <mesh geometry={built.front} material={mats.outerMat} />
          <mesh geometry={built.front} material={mats.innerMat} />
          <mesh geometry={built.back} material={mats.outerBack} />
          <mesh geometry={built.back} material={mats.innerBack} />

          {/* gold buttons — double-breasted rows, epaulettes, storm flap */}
          {spec.buttons.map(([x, y], i) => (
            <mesh key={i} material={goldMaterial} position={[x, y, built.frontZ(x, y) + 0.005]} scale={[1, 1, 0.4]}>
              <sphereGeometry args={[i >= 6 ? 0.0075 : 0.0115, 18, 12]} />
            </mesh>
          ))}

          {/* stand-and-fall collar around the back of the neck */}
          <group position={[0, 0.018, -0.004]} rotation={[-0.16, 0, 0]} scale={[1, 1, 0.72]}>
            <mesh geometry={extras.collar} material={mats.clothMat} />
            <mesh geometry={extras.collar} material={mats.collarLining} scale={[0.985, 1, 0.985]} />
          </group>

          {/* belt with gold buckle and a loose tail */}
          <mesh geometry={extras.beltFront} material={mats.beltMat} />
          <mesh geometry={extras.beltBack} material={mats.beltMat} />
          <mesh geometry={extras.beltTail} material={mats.beltMat} />
          <group position={[-0.078, spec.beltY, built.frontZ(-0.078, spec.beltY) + 0.012]}>
            <mesh material={goldMaterial} rotation={[0, 0, Math.PI / 4]} scale={[1, 1, 1]}>
              <torusGeometry args={[0.03, 0.0042, 8, 4]} />
            </mesh>
            <mesh material={goldMaterial} rotation={[0, 0, Math.PI / 2]} position={[0.004, 0, 0.002]}>
              <cylinderGeometry args={[0.0018, 0.0018, 0.04, 8]} />
            </mesh>
          </group>
          {/* cuff-strap buckles */}
          {[1, -1].map((sx) => (
            <mesh
              key={sx}
              material={goldMaterial}
              position={[sx * 0.318, -0.688, built.frontZ(sx * 0.318, -0.688) + 0.006]}
              rotation={[0, 0, Math.PI / 4]}
            >
              <torusGeometry args={[0.012, 0.0022, 6, 4]} />
            </mesh>
          ))}
        </group>

        {/* hang tag */}
        <group ref={tag} position={[barHalf - 0.015, NECK_Y - 0.058, 0.035]}>
          <mesh material={goldMaterial} position={[0, -0.05, 0]}>
            <cylinderGeometry args={[0.0007, 0.0007, 0.1, 6]} />
          </mesh>
          <mesh position={[0, -0.148, 0]}>
            <planeGeometry args={[0.072, 0.104]} />
            <meshStandardMaterial map={tagTex} roughness={0.72} side={THREE.FrontSide} />
          </mesh>
          <mesh position={[0, -0.148, -0.0006]} rotation={[0, Math.PI, 0]}>
            <planeGeometry args={[0.072, 0.104]} />
            <meshStandardMaterial color="#efe6d4" roughness={0.8} />
          </mesh>
        </group>

        {/* generous invisible hit area */}
        <mesh
          position={[0, NECK_Y - h / 2 + 0.04, 0.02]}
          onPointerOver={onOver}
          onPointerOut={onOut}
          onClick={onClick}
        >
          <boxGeometry args={[spec.width * 0.92, h + 0.16, 0.24]} />
          <meshBasicMaterial visible={false} />
        </mesh>
      </group>
    </group>
    </>
  )
}
