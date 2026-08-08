import React, { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const matte = {
  bun: '#a94f1d',
  bunHighlight: '#d47a2d',
  patty: '#28120d',
  cheese: '#dea01f',
  lettuce: '#34562d',
  tomato: '#a62c21',
  cream: '#ead8ad',
}

function SesameSeeds() {
  const seeds = useRef()

  useLayoutEffect(() => {
    const seed = new THREE.Object3D()
    for (let index = 0; index < 13; index += 1) {
      const angle = (index / 13) * Math.PI * 2.7
      const radius = 0.55 + (index % 3) * 0.22
      seed.position.set(Math.cos(angle) * radius, 0.99 + (index % 2) * 0.06, Math.sin(angle) * radius)
      seed.rotation.set(0.4, -angle, 0.3)
      seed.updateMatrix()
      seeds.current.setMatrixAt(index, seed.matrix)
    }
    seeds.current.instanceMatrix.needsUpdate = true
  }, [])

  return (
    <instancedMesh ref={seeds} args={[null, null, 13]} castShadow>
      <sphereGeometry args={[0.055, 7, 7]} />
      <meshStandardMaterial color={matte.cream} roughness={0.85} />
    </instancedMesh>
  )
}

function ClassicBunSpeckles() {
  const speckles = useRef()

  useLayoutEffect(() => {
    const dot = new THREE.Object3D()
    const up = new THREE.Vector3(0, 1, 0)
    const normal = new THREE.Vector3()
    const goldenAngle = Math.PI * (3 - Math.sqrt(5))
    const topCount = 62
    const bottomCount = 44

    for (let index = 0; index < topCount; index += 1) {
      const phi = 0.18 + (index / (topCount - 1)) * 1.3
      const theta = index * goldenAngle
      const sinPhi = Math.sin(phi)
      const x = Math.cos(theta) * sinPhi * 1.12
      const y = 0.46 + Math.cos(phi) * 0.58
      const z = Math.sin(theta) * sinPhi * 1.02
      dot.position.set(x, y, z)
      normal.set(x / 1.12, (y - 0.46) / 0.58, z / 1.02).normalize()
      dot.quaternion.setFromUnitVectors(up, normal)
      const size = 0.85 + (index % 4) * 0.08
      dot.scale.set(0.019 * size, 0.007, 0.029 * size)
      dot.updateMatrix()
      speckles.current.setMatrixAt(index, dot.matrix)
    }

    for (let index = 0; index < bottomCount; index += 1) {
      const vertical = -0.72 + ((index + 0.5) / bottomCount) * 1.44
      const theta = index * goldenAngle + 0.5
      const radial = Math.sqrt(1 - vertical * vertical)
      const x = Math.cos(theta) * radial * 1.09
      const y = -0.46 + vertical * 0.39
      const z = Math.sin(theta) * radial * 1.02
      dot.position.set(x, y, z)
      normal.set(x / 1.09, (y + 0.46) / 0.39, z / 1.02).normalize()
      dot.quaternion.setFromUnitVectors(up, normal)
      const size = 0.82 + (index % 3) * 0.1
      dot.scale.set(0.018 * size, 0.007, 0.028 * size)
      dot.updateMatrix()
      speckles.current.setMatrixAt(topCount + index, dot.matrix)
    }

    speckles.current.instanceMatrix.needsUpdate = true
  }, [])

  return (
    <instancedMesh ref={speckles} args={[null, null, 106]}>
      <sphereGeometry args={[1, 6, 5]} />
      <meshStandardMaterial color="#97501f" roughness={1} />
    </instancedMesh>
  )
}

function ClassicBurger() {
  const bunTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256
    const context = canvas.getContext('2d')
    context.fillStyle = '#d98a3b'
    context.fillRect(0, 0, 256, 256)

    let randomState = 28173
    const random = () => {
      randomState = (Math.imul(randomState, 1664525) + 1013904223) >>> 0
      return randomState / 4294967296
    }

    for (let index = 0; index < 720; index += 1) {
      const x = random() * 256
      const y = random() * 256
      const width = 0.65 + random() * 1.8
      const height = 0.4 + random() * 1.05
      context.save()
      context.translate(x, y)
      context.rotate(random() * Math.PI)
      context.fillStyle = index % 5 === 0 ? 'rgba(244, 187, 101, .72)' : `rgba(111, 51, 20, ${0.38 + random() * 0.4})`
      context.beginPath()
      context.ellipse(0, 0, width, height, 0, 0, Math.PI * 2)
      context.fill()
      context.restore()
    }

    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(1.7, 1.15)
    texture.anisotropy = 4
    return texture
  }, [])

  const pattyTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 128
    canvas.height = 128
    const context = canvas.getContext('2d')
    context.fillStyle = '#432c23'
    context.fillRect(0, 0, 128, 128)

    let randomState = 9147
    const random = () => {
      randomState = (Math.imul(randomState, 1103515245) + 12345) >>> 0
      return randomState / 4294967296
    }

    for (let index = 0; index < 420; index += 1) {
      const shade = index % 3 === 0 ? 'rgba(113, 72, 54, .42)' : 'rgba(32, 19, 15, .38)'
      context.fillStyle = shade
      context.beginPath()
      context.ellipse(random() * 128, random() * 128, 0.45 + random() * 1.3, 0.35 + random() * 0.9, random() * Math.PI, 0, Math.PI * 2)
      context.fill()
    }

    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(1.6, 1)
    texture.anisotropy = 4
    return texture
  }, [])

  const pattyGeometry = useMemo(() => {
    const geometry = new THREE.CylinderGeometry(1.04, 1.08, 0.4, 40, 4)
    const positions = geometry.attributes.position
    for (let index = 0; index < positions.count; index += 1) {
      const x = positions.getX(index)
      const y = positions.getY(index)
      const z = positions.getZ(index)
      const radius = Math.hypot(x, z)
      if (radius < 0.7) continue
      const angle = Math.atan2(z, x)
      const roughness = Math.sin(angle * 7 + y * 19) * 0.018 + Math.sin(angle * 13 - y * 23) * 0.011
      positions.setXYZ(index, x * (1 + roughness), y + Math.sin(angle * 11) * 0.006, z * (1 + roughness))
    }
    positions.needsUpdate = true
    geometry.computeVertexNormals()
    return geometry
  }, [])

  const pickles = [
    [-0.66, 0.37, 0.64, -0.2],
    [-0.25, 0.36, 0.79, 0.15],
    [0.2, 0.37, 0.82, -0.08],
    [0.62, 0.36, 0.67, 0.22],
  ]
  const sauceDollops = [-0.76, -0.39, 0.02, 0.42, 0.76]

  return (
    <>
      <mesh position={[0, 0.46, 0]} scale={[1.12, 0.58, 1.02]} castShadow>
        <sphereGeometry args={[1, 40, 22, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial map={bunTexture} color="#ffffff" roughness={0.84} clearcoat={0.06} clearcoatRoughness={0.8} />
      </mesh>
      <ClassicBunSpeckles />

      <mesh position={[0, 0.325, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.84, 0.065, 8, 42]} />
        <meshStandardMaterial color="#a83322" roughness={0.92} />
      </mesh>
      <mesh position={[0, 0.29, 0]} rotation={[Math.PI / 2, 0.08, 0]} castShadow>
        <torusGeometry args={[0.76, 0.045, 7, 38]} />
        <meshStandardMaterial color="#e2c99b" roughness={0.9} />
      </mesh>

      {pickles.map(([x, y, z, rotation], pickleIndex) => (
        <group key={pickleIndex} position={[x, y, z]} rotation={[0, rotation, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.19, 0.19, 0.075, 18]} />
            <meshStandardMaterial color="#596a2c" roughness={0.92} />
          </mesh>
          <mesh position={[0, 0.04, 0]}>
            <cylinderGeometry args={[0.135, 0.135, 0.008, 18]} />
            <meshStandardMaterial color="#84914a" roughness={1} />
          </mesh>
        </group>
      ))}

      {sauceDollops.map((x, dollopIndex) => (
        <mesh key={x} position={[x, 0.36 + (dollopIndex % 2) * 0.025, 0.83 - Math.abs(x) * 0.14]} scale={[0.13, 0.075, 0.1]} castShadow>
          <sphereGeometry args={[1, 9, 7]} />
          <meshStandardMaterial color={dollopIndex % 2 ? '#e5d2ad' : '#ad3825'} roughness={0.88} />
        </mesh>
      ))}

      <mesh position={[0, 0.03, 0]} geometry={pattyGeometry} castShadow>
        <meshStandardMaterial map={pattyTexture} color="#ffffff" roughness={1} />
      </mesh>

      <mesh position={[0, -0.22, 0]} rotation={[Math.PI / 2, 0.05, 0]} castShadow>
        <torusGeometry args={[0.84, 0.052, 7, 40]} />
        <meshStandardMaterial color="#c94a2c" roughness={0.92} />
      </mesh>
      <mesh position={[0, -0.255, 0]} rotation={[Math.PI / 2, -0.05, 0]} castShadow>
        <torusGeometry args={[0.73, 0.04, 7, 36]} />
        <meshStandardMaterial color="#dfc79a" roughness={0.9} />
      </mesh>

      <mesh position={[0, -0.47, 0]} scale={[1.09, 0.42, 1.02]} castShadow receiveShadow>
        <sphereGeometry args={[1, 36, 18]} />
        <meshPhysicalMaterial map={bunTexture} color="#f1d0a4" roughness={0.86} clearcoat={0.05} clearcoatRoughness={0.84} />
      </mesh>
    </>
  )
}

export default function Burger({ index, activeIndex, isFloating = false, floatingScale = 0.72, pickupTarget = false, position = [0, 0, 0], accent, interactionPulse }) {
  const group = useRef()
  const lastInteraction = useRef(0)
  const tapEnergy = useRef(0)
  const baseY = position[1]
  const floatingPhase = index * 1.7

  useFrame((state, delta) => {
    const isActive = index === activeIndex
    if (!isFloating && interactionPulse?.current.index === index && interactionPulse.current.token !== lastInteraction.current) {
      lastInteraction.current = interactionPulse.current.token
      tapEnergy.current = 1
    }
    tapEnergy.current = THREE.MathUtils.damp(tapEnergy.current, 0, 7, delta)

    const targetScale = isFloating ? floatingScale : isActive ? 1.12 + tapEnergy.current * 0.1 : 0.84
    const nextScale = THREE.MathUtils.damp(group.current.scale.x, targetScale, 4, delta)
    group.current.scale.setScalar(nextScale)
    if (isFloating) {
      group.current.position.y = baseY + Math.sin(state.clock.elapsedTime * 0.8 + floatingPhase) * 0.23
      group.current.rotation.y += delta * (0.14 + index * 0.012)
      group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.42 + floatingPhase) * 0.08
    } else {
      group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, 0, 5, delta)
      group.current.position.y = THREE.MathUtils.damp(group.current.position.y, baseY + (isActive ? 0.19 : 0) + tapEnergy.current * 0.22, 5, delta)
    }
  })

  return (
    <group
      ref={group}
      name={pickupTarget ? 'hand-pickup-target' : isFloating ? 'hero-burger' : `tray-burger-${index + 1}`}
      userData={{ pickupTarget }}
      position={position}
      rotation={isFloating ? [0.12, index * 1.1, -0.08] : [0, 0, 0]}
    >
      {!isFloating && index === 0 ? <ClassicBurger /> : <><mesh position={[0, 0.83, 0]} castShadow>
        <sphereGeometry args={[1, 32, 18, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial color={matte.bunHighlight} roughness={0.7} clearcoat={0.12} clearcoatRoughness={0.68} />
      </mesh>
      <SesameSeeds />
      <mesh position={[0, 0.38, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <cylinderGeometry args={[1.08, 1.13, 0.08, 4]} />
        <meshStandardMaterial color={matte.cheese} roughness={0.72} />
      </mesh>
      <mesh position={[0, 0.2, 0]} rotation={[0, index * 0.38, 0]} castShadow>
        <torusGeometry args={[0.95, 0.16, 7, 16]} />
        <meshStandardMaterial color={matte.lettuce} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.02, 0]} castShadow>
        <cylinderGeometry args={[0.93, 1.01, 0.29, 18]} />
        <meshStandardMaterial color={matte.patty} roughness={1} />
      </mesh>
      <mesh position={[0, -0.2, 0]} castShadow>
        <cylinderGeometry args={[0.87, 0.87, 0.09, 20]} />
        <meshStandardMaterial color={matte.tomato} roughness={0.75} />
      </mesh>
      <mesh position={[0, -0.41, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.93, 1.02, 0.28, 28]} />
        <meshPhysicalMaterial color={matte.bun} roughness={0.78} clearcoat={0.08} clearcoatRoughness={0.75} />
      </mesh></>}
      {!isFloating && <pointLight color={accent} intensity={index === activeIndex ? 2.15 : 0.25} distance={3.2} position={[0, 2.2, 1.5]} />}
    </group>
  )
}
