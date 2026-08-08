import React, { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { getHandPickupProgress } from '../utils/scrollProgress'

export default function CameraRig({ heroExitProgress, scrollProgress }) {
  const { camera, size, viewport } = useThree()
  const target = useRef(new THREE.Vector3(0, 0.25, 0))
  const desired = useRef(new THREE.Vector3())
  const desiredTarget = useRef(new THREE.Vector3(0, 0.25, 0))

  useFrame((state, delta) => {
    const smoothDelta = Math.min(delta, 1 / 30)
    const progress = scrollProgress.current
    const isMobile = size.width <= 720
    const heroHandoff = THREE.MathUtils.smootherstep(heroExitProgress.current, 0.64, 1)
    const trayEntry = THREE.MathUtils.smootherstep(progress, 0, isMobile ? 0.065 : 0.11)
    const trayAmount = Math.max(heroHandoff, trayEntry)
    const ending = THREE.MathUtils.smoothstep(getHandPickupProgress(progress), 0, 1)
    const compact = viewport.width < 7
    const heroZ = compact ? 15.5 : 13.4
    const trayZ = compact ? 15.2 : 13.1
    desired.current.set(
      state.pointer.x * (compact ? 0.18 : 0.42) * (1 - trayAmount),
      THREE.MathUtils.lerp(0.3, compact ? 4.05 : 4.55, trayAmount) - ending * 1.15,
      THREE.MathUtils.lerp(heroZ, trayZ - ending * 1.75, trayAmount),
    )
    desiredTarget.current.set(0, THREE.MathUtils.lerp(0.25, 0.08, trayAmount) + ending * 0.2, 0)
    camera.position.lerp(desired.current, 1 - Math.exp(-smoothDelta * (isMobile ? 3.1 : 1.9)))
    target.current.lerp(desiredTarget.current, 1 - Math.exp(-smoothDelta * (isMobile ? 4.4 : 3.2)))
    camera.lookAt(target.current)
  })
  return null
}
