import { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { AdaptiveDpr, PerformanceMonitor } from '@react-three/drei'
import { Bloom, EffectComposer, Noise, ToneMapping, Vignette } from '@react-three/postprocessing'
import { BlendFunction, ToneMappingMode } from 'postprocessing'
import * as THREE from 'three'
import { AnimatePresence, motion } from 'motion/react'
import Scene from './Scene'
import { useExperience } from '../store/experience'
import './Experience.css'

/**
 * The persistent WebGL layer. Fixed behind the DOM; only renders while the
 * home hero is on screen or a cinematic is playing.
 */
export default function Experience({ active }: { active: boolean }) {
  const phase = useExperience((s) => s.phase)
  const heroVisible = useExperience((s) => s.heroVisible)
  const sceneReady = useExperience((s) => s.sceneReady)
  const [dpr, setDpr] = useState(1.6)
  const [fx, setFx] = useState(true)

  const cinematic = phase === 'selecting' || phase === 'intro' || phase === 'returning'
  // keep drawing until the first frames are in (otherwise a page scrolled past the hero never lifts the loader)
  const running = active && (heroVisible || cinematic || !sceneReady)

  useEffect(() => {
    document.documentElement.classList.toggle('is-3d-loading', active && !sceneReady)
  }, [active, sceneReady])

  return (
    <>
      <div className={`xp ${active ? 'is-active' : ''} ${sceneReady ? 'is-ready' : ''}`} aria-hidden>
        <Canvas
          frameloop={running ? 'always' : 'never'}
          dpr={[1, dpr]}
          camera={{ fov: 35, near: 0.05, far: 60, position: [0, 2, 8] }}
          gl={{
            antialias: false,
            powerPreference: 'high-performance',
            alpha: false,
            stencil: false,
            toneMapping: THREE.NoToneMapping,
          }}
          onCreated={({ gl }) => {
            gl.setClearColor('#14050a')
          }}
        >
          <PerformanceMonitor
            onDecline={() => {
              setDpr(1)
              setFx(false)
            }}
            onIncline={() => setDpr(1.6)}
          />
          <AdaptiveDpr pixelated={false} />
          <Scene />
          <EffectComposer multisampling={fx ? 4 : 0} enableNormalPass={false}>
            <Bloom mipmapBlur intensity={0.42} luminanceThreshold={0.82} luminanceSmoothing={0.2} radius={0.7} />
            <Vignette offset={0.22} darkness={0.72} />
            <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.14} />
            <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
          </EffectComposer>
        </Canvas>
      </div>

      <AnimatePresence>
        {active && !sceneReady && (
          <motion.div
            className="xp-loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 1.1, ease: [0.65, 0, 0.35, 1] } }}
          >
            <motion.span
              className="xp-loader__word"
              initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            >
              Femmora
            </motion.span>
            <span className="xp-loader__line" />
            <motion.span
              className="xp-loader__sub label-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{ delay: 0.6, duration: 1 }}
            >
              Preparing the atelier
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
