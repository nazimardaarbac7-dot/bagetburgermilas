import React, { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import Burger from './Burger'
import { burgers } from '../data/burgers'
import { getTrayRotationProgress } from '../utils/scrollProgress'

export default function Tray({ scrollProgress, finalTransitionProgress, activeIndex, trayDragOffset, burgerInteraction }) {
  const tray = useRef()
  const trayVisual = useRef()
  const { size } = useThree()
  const isMobile = size.width <= 720

  useFrame((state, delta) => {
    const progress = scrollProgress.current
    trayVisual.current.visible = progress > 0.001
    if (!trayVisual.current.visible) {
      trayVisual.current.scale.setScalar(0.001)
      trayVisual.current.position.y = -8.5
      tray.current.rotation.y = 0
      return
    }

    const intro = THREE.MathUtils.smoothstep(progress, 0, isMobile ? 0.065 : 0.11)
    const rotationProgress = getTrayRotationProgress(progress)
    const targetRotation = -rotationProgress * (burgers.length - 1) * ((Math.PI * 2) / burgers.length) + trayDragOffset.current
    const targetScale = 0.08 + intro * 0.92
    const settleSpeed = isMobile ? 4.2 : 2.8
    const currentScale = THREE.MathUtils.damp(trayVisual.current.scale.x, targetScale, settleSpeed, delta)
    tray.current.rotation.y = THREE.MathUtils.damp(tray.current.rotation.y, targetRotation, 4.2, delta)
    trayVisual.current.scale.setScalar(currentScale)
    const settledY = isMobile ? -0.48 : -0.95
    const targetY = THREE.MathUtils.lerp(-8.5, settledY, intro)
    trayVisual.current.position.y = THREE.MathUtils.damp(trayVisual.current.position.y, targetY, settleSpeed, delta)
  })

  return (
    <group ref={trayVisual} position={[0, -8.5, 0]} scale={0.001} visible={false}>
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
            pickupTarget={index === burgers.length - 1}
            pickupProgress={scrollProgress}
            finalTransitionProgress={finalTransitionProgress}
            position={[Math.sin(angle) * radius, 0.5, Math.cos(angle) * radius]}
            facingAngle={angle}
          />
        })}
      </group>
    </group>
  )
}
