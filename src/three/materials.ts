import * as THREE from 'three'

/** Polished brass/gold used by the rack, hangers and buttons. */
export const goldMaterial = new THREE.MeshStandardMaterial({
  color: new THREE.Color('#d6b06a'),
  metalness: 1,
  roughness: 0.2,
  envMapIntensity: 1.35,
})

/** Slightly satin gold for large surfaces (rail, uprights). */
export const brushedGoldMaterial = new THREE.MeshStandardMaterial({
  color: new THREE.Color('#c9a35c'),
  metalness: 1,
  roughness: 0.3,
  envMapIntensity: 1.2,
})
