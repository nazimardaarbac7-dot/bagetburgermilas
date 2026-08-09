import React, { memo, useEffect, useRef, useState } from 'react'
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

function World({ heroExitProgress, trayEntryProgress, scrollProgress, finalTransitionProgress, activeIndex, burgerInteraction, onReady, mobileOptimized }) {
  return <>
    <color attach="background" args={['#1d4042']} />
    <fog attach="fog" args={['#1d4042', 13, 28]} />
    <ambientLight intensity={mobileOptimized ? 0.48 : 0.36} color={mobileOptimized ? '#ffffff' : '#f5d49b'} />
    <directionalLight castShadow={!mobileOptimized} intensity={mobileOptimized ? 2.4 : 3.15} color={mobileOptimized ? '#fff3dd' : '#ffd18a'} position={[5, 9, 6]} shadow-mapSize={[1024, 1024]} shadow-camera-left={-10} shadow-camera-right={10} shadow-camera-top={10} shadow-camera-bottom={-10} />
    {!mobileOptimized && <spotLight intensity={49} angle={0.48} penumbra={0.82} color="#de860b" position={[-8, 7, -4]} target-position={[0, 0, 0]} />}
    <pointLight intensity={mobileOptimized ? 6 : 17} distance={16} color={mobileOptimized ? '#d9e3df' : '#f2a42b'} position={[0, 3, 5]} />
    {!mobileOptimized && <Environment preset="city" environmentIntensity={0.3} />}
    <FloatingBurgers heroExitProgress={heroExitProgress} mobileOptimized={mobileOptimized} />
    <Tray trayEntryProgress={trayEntryProgress} scrollProgress={scrollProgress} finalTransitionProgress={finalTransitionProgress} activeIndex={activeIndex} burgerInteraction={burgerInteraction} mobileOptimized={mobileOptimized} />
    <CameraRig heroExitProgress={heroExitProgress} trayEntryProgress={trayEntryProgress} scrollProgress={scrollProgress} finalTransitionProgress={finalTransitionProgress} />
    <Preload all />
    <SceneReady onReady={onReady} />
  </>
}

function Experience({ heroExitProgress, trayEntryProgress, scrollProgress, finalTransitionProgress, activeIndex, burgerInteraction, onReady }) {
  const [mobileOptimized, setMobileOptimized] = useState(() => window.matchMedia('(max-width: 720px)').matches)

  useEffect(() => {
    const query = window.matchMedia('(max-width: 720px)')
    const handleChange = (event) => setMobileOptimized(event.matches)
    if (query.addEventListener) {
      query.addEventListener('change', handleChange)
      return () => query.removeEventListener('change', handleChange)
    }
    query.addListener(handleChange)
    return () => query.removeListener(handleChange)
  }, [])

  return (
    <div className="canvas-wrap" aria-hidden="true">
      <Canvas key={mobileOptimized ? 'mobile' : 'desktop'} dpr={mobileOptimized ? 1 : [1, 1.5]} shadows={!mobileOptimized} camera={{ position: [0, 0.3, 13.4], fov: 38 }} gl={{ antialias: !mobileOptimized, powerPreference: 'high-performance', stencil: false }}>
        <World heroExitProgress={heroExitProgress} trayEntryProgress={trayEntryProgress} scrollProgress={scrollProgress} finalTransitionProgress={finalTransitionProgress} activeIndex={activeIndex} burgerInteraction={burgerInteraction} onReady={onReady} mobileOptimized={mobileOptimized} />
      </Canvas>
    </div>
  )
}

export default memo(Experience)
