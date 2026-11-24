import { useMemo } from 'react'
import * as THREE from 'three'
import { brushedGoldMaterial, goldMaterial } from './materials'
import { RAIL_Y } from './Garment'

/** Brass boutique rail: rounded shoulders, slim uprights, sled feet with ball ends. */
export default function Rack({ half }: { half: number }) {
  const r = 0.019
  const bend = 0.09
  const geo = useMemo(() => {
    const path = new THREE.CurvePath<THREE.Vector3>()
    const H = RAIL_Y
    const xL = -half
    const xR = half
    // left upright → rounded corner → rail → rounded corner → right upright
    path.add(new THREE.LineCurve3(new THREE.Vector3(xL, 0.035, 0), new THREE.Vector3(xL, H - bend, 0)))
    path.add(
      new THREE.QuadraticBezierCurve3(new THREE.Vector3(xL, H - bend, 0), new THREE.Vector3(xL, H, 0), new THREE.Vector3(xL + bend, H, 0)),
    )
    path.add(new THREE.LineCurve3(new THREE.Vector3(xL + bend, H, 0), new THREE.Vector3(xR - bend, H, 0)))
    path.add(
      new THREE.QuadraticBezierCurve3(new THREE.Vector3(xR - bend, H, 0), new THREE.Vector3(xR, H, 0), new THREE.Vector3(xR, H - bend, 0)),
    )
    path.add(new THREE.LineCurve3(new THREE.Vector3(xR, H - bend, 0), new THREE.Vector3(xR, 0.035, 0)))
    return {
      frame: new THREE.TubeGeometry(path, 420, r, 20, false),
      foot: new THREE.CylinderGeometry(0.016, 0.016, 0.74, 20),
      ball: new THREE.SphereGeometry(0.03, 24, 18),
      collar: new THREE.CylinderGeometry(0.03, 0.034, 0.05, 24),
      ring: new THREE.TorusGeometry(0.026, 0.005, 10, 32),
    }
  }, [half])

  return (
    <group>
      <mesh geometry={geo.frame} material={brushedGoldMaterial} />
      {[-half, half].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh geometry={geo.foot} material={brushedGoldMaterial} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} />
          <mesh geometry={geo.ball} material={goldMaterial} position={[0, 0.03, 0.37]} />
          <mesh geometry={geo.ball} material={goldMaterial} position={[0, 0.03, -0.37]} />
          <mesh geometry={geo.collar} material={goldMaterial} position={[0, 0.07, 0]} />
          <mesh geometry={geo.ring} material={goldMaterial} position={[0, 1.2, 0]} rotation={[Math.PI / 2, 0, 0]} />
        </group>
      ))}
    </group>
  )
}
