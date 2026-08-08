import React, { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { getHandPickupProgress } from '../utils/scrollProgress'

export default function CameraRig({ scrollProgress }) {
  const { camera, size, viewport } = useThree()
  const target = useRef(new THREE.Vector3())
  const desired = useRef(new THREE.Vector3())

  useFrame((state, delta) => {
    const progress = scrollProgress.current
    const isMobile = size.width <= 720
    const trayAmount = THREE.MathUtils.smoothstep(progress, 0, isMobile ? 0.085 : 0.14)
    const ending = THREE.MathUtils.smoothstep(getHandPickupProgress(progress), 0, 1)
    const compact = viewport.width < 7
    const heroZ = compact ? 15.5 : 13.4
    const trayZ = compact ? 15.2 : 13.1
    desired.current.set(
      state.pointer.x * (compact ? 0.18 : 0.42) * (1 - trayAmount),
      THREE.MathUtils.lerp(0.3, compact ? 4.05 : 4.55, trayAmount) - ending * 1.15,
      THREE.MathUtils.lerp(heroZ, trayZ - ending * 1.75, trayAmount),
    )
    target.current.set(0, THREE.MathUtils.lerp(0.25, 0.08, trayAmount) + ending * 0.2, 0)
    camera.position.lerp(desired.current, 1 - Math.exp(-delta * (isMobile ? 3.1 : 1.9)))
    camera.lookAt(target.current)
  })
  return null
}
