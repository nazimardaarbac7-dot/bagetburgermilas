import React, { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import Burger from './Burger'

const floatingBurgers = [
  { position: [-5.6, 2.5, -1.6], exit: [-10, 6, -2.5], tilt: 0.12, yaw: -0.16, scale: 0.72 },
  { position: [5.7, 1.9, -2.9], exit: [10, 6, -2.5], tilt: -0.1, yaw: 0.14, scale: 0.72 },
  { position: [-4.8, -3.5, -2.8], exit: [-12, -7, -2.5], tilt: -0.14, yaw: 0.12, scale: 0.72 },
  { position: [5.25, -3.2, -0.3], exit: [12, -7, -2.2], tilt: 0.13, yaw: -0.15, scale: 0.72 },
]

const mobileFloatingBurgers = [
  { position: [-1.58, 2.05, -1.15], exit: [-4.7, 3.8, -1.4], tilt: -0.18, yaw: -0.2, scale: 0.6 },
  { position: [1.62, 1.35, -1.8], exit: [4.8, 3.5, -1.3], tilt: 0.14, yaw: 0.18, scale: 0.56 },
  { position: [-1.62, -1.25, -1.65], exit: [-4.8, -3.8, -1.2], tilt: 0.14, yaw: 0.16, scale: 0.57 },
  { position: [1.5, -1.95, -0.65], exit: [4.8, -3.9, -1.35], tilt: -0.16, yaw: -0.17, scale: 0.62 },
]

export default function FloatingBurgers({ heroExitProgress }) {
  const group = useRef()
  const burgerGroups = useRef([])
  const hidden = useRef(false)
  const { size } = useThree()
  const burgers = size.width <= 720 ? mobileFloatingBurgers : floatingBurgers

  useFrame((state, delta) => {
    const progress = heroExitProgress.current
    const smoothDelta = Math.min(delta, 1 / 30)
    if (hidden.current && progress <= 0.97) hidden.current = false
    group.current.visible = !hidden.current
    if (hidden.current) return

    const handoff = THREE.MathUtils.smootherstep(progress, 0, 1)
    const pointerStrength = 1 - handoff

    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, state.pointer.x * 0.22 * pointerStrength, 3, smoothDelta)
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, -state.pointer.y * 0.1 * pointerStrength, 3, smoothDelta)

    burgers.forEach((burger, index) => {
      const item = burgerGroups.current[index]
      if (!item) return

      const start = 0.015 + index * 0.018
      const end = 0.92 + index * 0.018
      const normalizedExit = THREE.MathUtils.clamp((progress - start) / (end - start), 0, 1)
      const exitProgress = THREE.MathUtils.smootherstep(normalizedExit, 0, 1)
      const [baseX, baseY, baseZ] = burger.position
      const [exitX, exitY, exitZ] = burger.exit

      const targetX = baseX + exitX * exitProgress
      const targetY = baseY + exitY * exitProgress
      const targetZ = baseZ + exitZ * exitProgress
      const targetScale = 1 - exitProgress * 0.04

      item.position.set(targetX, targetY, targetZ)
      item.rotation.z = burger.tilt * exitProgress
      item.rotation.y = burger.yaw * exitProgress
      item.scale.setScalar(targetScale)
    })

    if (progress >= 0.9995) {
      hidden.current = true
      group.current.visible = false
    }
  })

  return (
    <group ref={group}>
      {burgers.map((burger, index) => (
        <group
          key={index}
          ref={(node) => { burgerGroups.current[index] = node }}
          position={burger.position}
        >
          <Burger index={index} isFloating floatingScale={burger.scale * 1.15} motionProgress={heroExitProgress} position={[0, 0, 0]} accent="#de860b" />
        </group>
      ))}
    </group>
  )
}
