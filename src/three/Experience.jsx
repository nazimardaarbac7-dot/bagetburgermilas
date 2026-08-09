import React, { memo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Preload } from '@react-three/drei'
import CameraRig from './CameraRig'
import FloatingBurgers from './FloatingBurgers'
import Tray from './Tray'

function SceneReady({ onReady }) {
  const reported = useRef(false)

  useFrame(() => {
    if (reported.current) return
    reported.current = true
    requestAnimationFrame(onReady)
  })

  return null
}

function World({ heroExitProgress, trayEntryProgress, scrollProgress, finalTransitionProgress, activeIndex, burgerInteraction, onReady }) {
  return <>
    <color attach="background" args={['#1d4042']} />
    <fog attach="fog" args={['#1d4042', 13, 28]} />
    <ambientLight intensity={0.36} color="#f5d49b" />
    <directionalLight castShadow intensity={3.15} color="#ffd18a" position={[5, 9, 6]} shadow-mapSize={[1024, 1024]} shadow-camera-left={-10} shadow-camera-right={10} shadow-camera-top={10} shadow-camera-bottom={-10} />
    <spotLight intensity={49} angle={0.48} penumbra={0.82} color="#de860b" position={[-8, 7, -4]} target-position={[0, 0, 0]} />
    <pointLight intensity={17} distance={16} color="#f2a42b" position={[0, 3, 5]} />
    <Environment preset="city" environmentIntensity={0.3} />
    <FloatingBurgers heroExitProgress={heroExitProgress} />
    <Tray trayEntryProgress={trayEntryProgress} scrollProgress={scrollProgress} finalTransitionProgress={finalTransitionProgress} activeIndex={activeIndex} burgerInteraction={burgerInteraction} />
    <CameraRig heroExitProgress={heroExitProgress} trayEntryProgress={trayEntryProgress} scrollProgress={scrollProgress} />
    <Preload all />
    <SceneReady onReady={onReady} />
  </>
}

function Experience({ heroExitProgress, trayEntryProgress, scrollProgress, finalTransitionProgress, activeIndex, burgerInteraction, onReady }) {
  return (
    <div className="canvas-wrap" aria-hidden="true">
      <Canvas dpr={[1, 1.5]} shadows camera={{ position: [0, 0.3, 13.4], fov: 38 }} gl={{ antialias: true, powerPreference: 'high-performance' }}>
        <World heroExitProgress={heroExitProgress} trayEntryProgress={trayEntryProgress} scrollProgress={scrollProgress} finalTransitionProgress={finalTransitionProgress} activeIndex={activeIndex} burgerInteraction={burgerInteraction} onReady={onReady} />
      </Canvas>
    </div>
  )
}

export default memo(Experience)
