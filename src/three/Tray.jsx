import React, { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import Burger from './Burger'
import { burgers } from '../data/burgers'
import { getTrayRotationProgress } from '../utils/scrollProgress'

export default function Tray({ trayEntryProgress, scrollProgress, finalTransitionProgress, activeIndex, burgerInteraction, mobileOptimized = false }) {
  const tray = useRef()
  const trayVisual = useRef()
  const entryVisible = useRef(false)
  const finalHidden = useRef(false)
  const { size } = useThree()
  const isMobile = size.width <= 720

  useFrame((state, delta) => {
    const smoothDelta = Math.min(delta, 1 / 30)
    const progress = scrollProgress.current
    const entryProgress = trayEntryProgress.current
    const finalProgress = finalTransitionProgress.current
    if (!entryVisible.current && (entryProgress > 0.00001 || progress > 0.0005)) entryVisible.current = true
    if (entryVisible.current && entryProgress <= 0.001 && progress <= 0.0001) entryVisible.current = false
    if (finalHidden.current && finalProgress <= 0.97) finalHidden.current = false
    if (!finalHidden.current && finalProgress >= 0.9995) finalHidden.current = true
    trayVisual.current.visible = entryVisible.current && !finalHidden.current
    if (!trayVisual.current.visible) return

    const heroHandoff = entryProgress
    const trayEntry = THREE.MathUtils.smootherstep(progress, 0, isMobile ? 0.055 : 0.09)
    const intro = Math.max(heroHandoff, trayEntry)
    const heroTransitionActive = entryProgress > 0.0001 && entryProgress < 0.9999
    const rotationProgress = getTrayRotationProgress(progress, isMobile)
    const targetRotation = -rotationProgress * (burgers.length - 1) * ((Math.PI * 2) / burgers.length)
    const targetScale = THREE.MathUtils.lerp(isMobile ? 0.72 : 0.68, 1, intro)
    const settleSpeed = isMobile ? 4.2 : 2.8
    const rotationSpeed = isMobile ? 8.5 : 5.5
    const currentScale = heroTransitionActive
      ? targetScale
      : THREE.MathUtils.damp(trayVisual.current.scale.x, targetScale, settleSpeed, smoothDelta)
    tray.current.rotation.y = THREE.MathUtils.damp(tray.current.rotation.y, targetRotation, rotationSpeed, smoothDelta)
    trayVisual.current.scale.setScalar(currentScale)
    const settledY = isMobile ? -0.48 : -0.95
    const entryY = isMobile ? -8.5 : -9.5
    const targetY = THREE.MathUtils.lerp(entryY, settledY, intro)
    trayVisual.current.position.y = heroTransitionActive
      ? targetY
      : THREE.MathUtils.damp(trayVisual.current.position.y, targetY, settleSpeed, smoothDelta)
  })

  return (
    <group ref={trayVisual} position={[0, -8.5, 0]} scale={0.001}>
      <group ref={tray}>
        <mesh receiveShadow>
          <cylinderGeometry args={[5.55, 5.55, 0.34, 80]} />
          <meshStandardMaterial color="#252327" metalness={0.93} roughness={0.29} />
        </mesh>
        <mesh position={[0, 0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[5.3, 0.16, 12, 72]} />
          <meshStandardMaterial color="#8a7164" metalness={1} roughness={0.22} />
        </mesh>
        <mesh position={[0, 0.205, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[5.27, 80]} />
          <meshStandardMaterial color="#312b2b" metalness={0.72} roughness={0.43} />
        </mesh>
        {burgers.map((burger, index) => {
          const angle = (index / burgers.length) * Math.PI * 2
          const radius = 3.68
          return <Burger
            key={burger.id}
            index={index}
            activeIndex={activeIndex}
            accent={burger.accent}
            interactionPulse={burgerInteraction}
            sceneProgress={scrollProgress}
            sceneEntryProgress={trayEntryProgress}
            pickupTarget={index === burgers.length - 1}
            pickupProgress={finalTransitionProgress}
            finalTransitionProgress={finalTransitionProgress}
            mobileOptimized={mobileOptimized}
            position={[Math.sin(angle) * radius, 0.5, Math.cos(angle) * radius]}
            facingAngle={angle}
          />
        })}
      </group>
    </group>
  )
}
