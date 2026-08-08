import React, { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
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

function World({ heroExitProgress, scrollProgress, activeIndex, trayDragOffset, burgerInteraction, onReady }) {
  return <>
    <color attach="background" args={['#170d0b']} />
    <fog attach="fog" args={['#170d0b', 13, 28]} />
    <ambientLight intensity={0.36} color="#f2b38c" />
    <directionalLight castShadow intensity={3.15} color="#ffc08a" position={[5, 9, 6]} shadow-mapSize={[1024, 1024]} />
    <spotLight intensity={49} angle={0.48} penumbra={0.82} color="#d84a2d" position={[-8, 7, -4]} target-position={[0, 0, 0]} />
    <pointLight intensity={17} distance={16} color="#d58a4d" position={[0, 3, 5]} />
    <Environment preset="city" environmentIntensity={0.3} />
    <FloatingBurgers heroExitProgress={heroExitProgress} />
    <Tray scrollProgress={scrollProgress} activeIndex={activeIndex} trayDragOffset={trayDragOffset} burgerInteraction={burgerInteraction} />
    <CameraRig scrollProgress={scrollProgress} />
    <SceneReady onReady={onReady} />
  </>
}

export default function Experience({ heroExitProgress, scrollProgress, activeIndex, trayDragOffset, burgerInteraction, onReady }) {
  return (
    <div className="canvas-wrap" aria-hidden="true">
      <Canvas dpr={[1, 1.5]} shadows camera={{ position: [0, 0.3, 13.4], fov: 38 }} gl={{ antialias: true, powerPreference: 'high-performance' }}>
        <World heroExitProgress={heroExitProgress} scrollProgress={scrollProgress} activeIndex={activeIndex} trayDragOffset={trayDragOffset} burgerInteraction={burgerInteraction} onReady={onReady} />
      </Canvas>
    </div>
  )
}
