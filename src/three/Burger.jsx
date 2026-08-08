import React, { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { getHandPickupProgress } from '../utils/scrollProgress'

const burgerPhotoPaths = [
  '/assets/burgers/hamburger-classic-cutout.png',
  '/assets/burgers/cheeseburger-cutout.png',
  '/assets/burgers/koz-burger-cutout.png',
  '/assets/burgers/karisik-burger-cutout.png',
  '/assets/burgers/baldicanli-burger-cutout.png',
]

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
    const up = new THREE.Vector3(0, 1, 0)
    const normal = new THREE.Vector3()
    const goldenAngle = Math.PI * (3 - Math.sqrt(5))
    const count = 28
    for (let index = 0; index < count; index += 1) {
      const radius = Math.sqrt((index + 0.5) / count) * 0.88
      const angle = index * goldenAngle
      const x = Math.cos(angle) * radius * 1.08
      const z = Math.sin(angle) * radius
      const dome = Math.sqrt(Math.max(0, 1 - (x * x) / (1.1 * 1.1) - (z * z) / (1.02 * 1.02)))
      const y = 0.47 + dome * 0.6
      seed.position.set(x, y + 0.025, z)
      normal.set(x / 1.1, dome / 0.6, z / 1.02).normalize()
      seed.quaternion.setFromUnitVectors(up, normal)
      seed.rotateY(angle * 0.37)
      seed.scale.set(0.055, 0.018, 0.095)
      seed.updateMatrix()
      seeds.current.setMatrixAt(index, seed.matrix)
    }
    seeds.current.instanceMatrix.needsUpdate = true
  }, [])

  return (
    <instancedMesh ref={seeds} args={[null, null, 28]} castShadow receiveShadow>
      <sphereGeometry args={[1, 8, 6]} />
      <meshStandardMaterial color="#f0d5a0" roughness={0.9} />
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
    <instancedMesh ref={speckles} args={[null, null, 106]} receiveShadow>
      <sphereGeometry args={[1, 6, 5]} />
      <meshStandardMaterial color="#97501f" roughness={1} />
    </instancedMesh>
  )
}

function BurgerPhoto({ index }) {
  const texture = useTexture(burgerPhotoPaths[index])

  useLayoutEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = 8
    texture.needsUpdate = true
  }, [texture])

  return (
    <mesh position={[0, 0.65, 0.72]} renderOrder={2} castShadow>
      <planeGeometry args={[2.52, 1.895]} />
      <meshBasicMaterial
        map={texture}
        transparent
        alphaTest={0.015}
        toneMapped={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

function HandPickup({ scrollProgress }) {
  const hand = useRef()
  const material = useRef()
  const texture = useTexture('/assets/interaction/hand-grab.png')

  useLayoutEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = 8
    texture.needsUpdate = true
  }, [texture])

  useFrame(() => {
    if (!hand.current || !material.current || !scrollProgress) return
    const pickup = getHandPickupProgress(scrollProgress.current)
    const reach = THREE.MathUtils.smootherstep(pickup, 0, 0.48)
    const appear = THREE.MathUtils.smoothstep(pickup, 0, 0.1)

    hand.current.visible = pickup > 0.001
    hand.current.position.x = THREE.MathUtils.lerp(0.42, 0, reach)
    hand.current.position.y = THREE.MathUtils.lerp(6.25, 1.15, reach)
    hand.current.rotation.z = THREE.MathUtils.lerp(-0.065, 0, reach)
    hand.current.scale.setScalar(THREE.MathUtils.lerp(0.97, 1, reach))
    material.current.opacity = appear
  })

  return (
    <mesh ref={hand} position={[0.42, 6.25, 1.16]} renderOrder={4} visible={false}>
      <planeGeometry args={[4, 6]} />
      <meshBasicMaterial
        ref={material}
        map={texture}
        transparent
        opacity={0}
        alphaTest={0.015}
        depthWrite={false}
        toneMapped={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

function CheddarSlice() {
  const cheddarTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 128
    canvas.height = 128
    const context = canvas.getContext('2d')
    const gradient = context.createLinearGradient(0, 0, 128, 128)
    gradient.addColorStop(0, '#ffc331')
    gradient.addColorStop(0.5, '#f2a313')
    gradient.addColorStop(1, '#d97908')
    context.fillStyle = gradient
    context.fillRect(0, 0, 128, 128)

    let randomState = 7812
    for (let index = 0; index < 180; index += 1) {
      randomState = (Math.imul(randomState, 1664525) + 1013904223) >>> 0
      const x = (randomState / 4294967296) * 128
      randomState = (Math.imul(randomState, 1664525) + 1013904223) >>> 0
      const y = (randomState / 4294967296) * 128
      context.fillStyle = index % 3 ? 'rgba(255, 224, 106, .13)' : 'rgba(139, 65, 4, .1)'
      context.beginPath()
      context.arc(x, y, 0.5 + (index % 4) * 0.25, 0, Math.PI * 2)
      context.fill()
    }

    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(1.35, 1.1)
    return texture
  }, [])

  return (
    <mesh position={[0, 0.265, 0]} rotation={[0, Math.PI / 4, 0]} castShadow receiveShadow>
      <boxGeometry args={[1.62, 0.055, 1.62]} />
      <meshPhysicalMaterial map={cheddarTexture} color="#fff0b0" roughness={0.72} clearcoat={0.08} clearcoatRoughness={0.8} />
    </mesh>
  )
}

function RoastedPeppers() {
  const pepperTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 128
    canvas.height = 128
    const context = canvas.getContext('2d')
    const gradient = context.createLinearGradient(0, 0, 128, 0)
    gradient.addColorStop(0, '#7e1d14')
    gradient.addColorStop(0.25, '#d34525')
    gradient.addColorStop(0.62, '#a82418')
    gradient.addColorStop(1, '#ed5a2b')
    context.fillStyle = gradient
    context.fillRect(0, 0, 128, 128)
    for (let index = 0; index < 24; index += 1) {
      const x = (index * 47) % 128
      const y = (index * 29) % 128
      context.strokeStyle = index % 3 === 0 ? 'rgba(48, 17, 12, .72)' : 'rgba(255, 137, 65, .24)'
      context.lineWidth = 1.4 + (index % 4) * 0.7
      context.beginPath()
      context.moveTo(x - 7, y + 3)
      context.bezierCurveTo(x - 2, y - 4, x + 4, y + 6, x + 10, y - 2)
      context.stroke()
    }
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(1.8, 1.2)
    return texture
  }, [])

  const pepperGeometries = useMemo(() => {
    const paths = [
      [[-0.8, 0.4, 0.72], [-0.42, 0.44, 0.91], [0.02, 0.4, 0.81], [0.7, 0.43, 0.91]],
      [[-0.72, 0.39, 0.59], [-0.28, 0.43, 0.75], [0.22, 0.4, 0.68], [0.8, 0.4, 0.79]],
      [[-0.5, 0.43, 0.86], [-0.12, 0.46, 0.98], [0.3, 0.42, 0.91], [0.62, 0.44, 1]],
      [[-0.8, 0.39, 1.02], [-0.52, 0.26, 1.045], [-0.24, 0.37, 1.05], [0.05, 0.29, 1.04]],
      [[0.02, 0.38, 1.03], [0.3, 0.25, 1.05], [0.55, 0.37, 1.04], [0.8, 0.29, 1.02]],
    ]
    return paths.map((points, index) => {
      const curve = new THREE.CatmullRomCurve3(points.map(([x, y, z]) => new THREE.Vector3(x, y, z)))
      const geometry = new THREE.TubeGeometry(curve, 24, index < 3 ? 0.12 : 0.11, 8, false)
      if (index < 3) {
        geometry.scale(1, 0.38, 1)
        geometry.translate(0, 0.26, 0)
      } else {
        geometry.scale(1, 0.58, 1)
        geometry.translate(0, 0.17, 0)
      }
      return geometry
    })
  }, [])

  return (
    <group>
      {pepperGeometries.map((geometry, index) => (
        <mesh key={index} geometry={geometry} castShadow>
          <meshPhysicalMaterial
            map={pepperTexture}
            color={index === 1 ? '#d98f7b' : '#e7a28d'}
            roughness={0.72}
            clearcoat={0.14}
            clearcoatRoughness={0.68}
          />
        </mesh>
      ))}
    </group>
  )
}

function ClassicBurger({ withCheese = false, withRoastedPepper = false }) {
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

  const tomatoGeometry = useMemo(() => {
    const geometry = new THREE.CylinderGeometry(0.96, 0.98, 0.105, 48, 2)
    const positions = geometry.attributes.position
    for (let index = 0; index < positions.count; index += 1) {
      const x = positions.getX(index)
      const y = positions.getY(index)
      const z = positions.getZ(index)
      const angle = Math.atan2(z, x)
      const edge = Math.hypot(x, z) > 0.7 ? 1 + Math.sin(angle * 9) * 0.018 + Math.sin(angle * 5) * 0.012 : 1
      positions.setXYZ(index, x * edge, y, z * edge)
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
    [-0.42, 0.365, -0.73, -0.15],
    [0.42, 0.37, -0.72, 0.18],
  ]

  return (
    <>
      <mesh position={[0, 0.46, 0]} scale={[1.12, 0.58, 1.02]} castShadow receiveShadow>
        <sphereGeometry args={[1, 40, 22, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial map={bunTexture} color="#ffffff" roughness={0.84} clearcoat={0.06} clearcoatRoughness={0.8} />
      </mesh>
      <ClassicBunSpeckles />
      <SesameSeeds />

      <mesh position={[0, 0.335, 0]} geometry={tomatoGeometry} castShadow receiveShadow>
        <meshPhysicalMaterial color="#b72e21" roughness={0.76} clearcoat={0.12} clearcoatRoughness={0.68} />
      </mesh>

      {pickles.map(([x, y, z, rotation], pickleIndex) => (
        <group key={pickleIndex} position={[x, y, z]} rotation={[0, rotation, 0]}>
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.19, 0.19, 0.075, 18]} />
            <meshStandardMaterial color="#596a2c" roughness={0.92} />
          </mesh>
          <mesh position={[0, 0.04, 0]}>
            <cylinderGeometry args={[0.135, 0.135, 0.008, 18]} />
            <meshStandardMaterial color="#84914a" roughness={1} />
          </mesh>
        </group>
      ))}

      {withCheese && <CheddarSlice />}
      {withRoastedPepper && <RoastedPeppers />}

      <mesh position={[0, 0.03, 0]} geometry={pattyGeometry} castShadow receiveShadow>
        <meshStandardMaterial map={pattyTexture} bumpMap={pattyTexture} bumpScale={0.055} color="#c58d73" roughness={0.94} />
      </mesh>

      <mesh position={[0, -0.36, 0]} scale={[1.09, 0.4, 1.02]} castShadow receiveShadow>
        <sphereGeometry args={[1, 36, 18]} />
        <meshPhysicalMaterial map={bunTexture} color="#ffffff" roughness={0.86} clearcoat={0.05} clearcoatRoughness={0.84} />
      </mesh>
    </>
  )
}

function HeroBurgerDepth() {
  const shadowTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 128
    canvas.height = 128
    const context = canvas.getContext('2d')
    const gradient = context.createRadialGradient(64, 61, 5, 64, 64, 62)
    gradient.addColorStop(0, 'rgba(4, 17, 18, .72)')
    gradient.addColorStop(0.48, 'rgba(4, 17, 18, .3)')
    gradient.addColorStop(1, 'rgba(4, 17, 18, 0)')
    context.fillStyle = gradient
    context.fillRect(0, 0, 128, 128)
    return new THREE.CanvasTexture(canvas)
  }, [])

  return (
    <>
      <mesh position={[0, -0.08, -1.16]} scale={[1.48, 0.62, 1]} renderOrder={-1}>
        <circleGeometry args={[1, 48]} />
        <meshBasicMaterial map={shadowTexture} transparent opacity={0.78} depthWrite={false} toneMapped={false} />
      </mesh>
      <pointLight color="#ffe0ad" intensity={3.2} distance={4.4} decay={2} position={[-1.45, 1.75, 2.3]} />
      <pointLight color="#de860b" intensity={1.05} distance={3.6} decay={2} position={[1.35, -0.25, 1.5]} />
    </>
  )
}

export default function Burger({ index, activeIndex, isFloating = false, floatingScale = 0.72, pickupTarget = false, pickupProgress, position = [0, 0, 0], facingAngle = 0, accent, interactionPulse }) {
  const group = useRef()
  const lastInteraction = useRef(0)
  const tapEnergy = useRef(0)
  const baseY = position[1]
  const baseZ = position[2]
  const floatingPhase = index * 1.7

  useFrame((state, delta) => {
    const isActive = index === activeIndex
    if (!isFloating && interactionPulse?.current.index === index && interactionPulse.current.token !== lastInteraction.current) {
      lastInteraction.current = interactionPulse.current.token
      tapEnergy.current = 1
    }
    tapEnergy.current = THREE.MathUtils.damp(tapEnergy.current, 0, 7, delta)

    const pickup = pickupTarget && pickupProgress ? getHandPickupProgress(pickupProgress.current) : 0
    const lift = THREE.MathUtils.smootherstep(pickup, 0.48, 1)

    const targetScale = isFloating ? floatingScale : isActive ? 1.12 + tapEnergy.current * 0.1 + lift * 0.045 : 0.84
    const nextScale = THREE.MathUtils.damp(group.current.scale.x, targetScale, 4, delta)
    group.current.scale.setScalar(nextScale)
    if (isFloating) {
      group.current.position.y = baseY + Math.sin(state.clock.elapsedTime * 0.8 + floatingPhase) * 0.23
      group.current.rotation.y += delta * (0.14 + index * 0.012)
      group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.42 + floatingPhase) * 0.08
    } else {
      group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, facingAngle, 5, delta)
      group.current.rotation.z = THREE.MathUtils.damp(group.current.rotation.z, lift * -0.035, 5, delta)
      group.current.position.y = THREE.MathUtils.damp(group.current.position.y, baseY + (isActive ? 0.19 : 0) + tapEnergy.current * 0.22 + lift * 4.65, 5, delta)
      group.current.position.z = THREE.MathUtils.damp(group.current.position.z, baseZ + lift * 0.32, 5, delta)
    }
  })

  return (
    <group
      ref={group}
      name={pickupTarget ? 'hand-pickup-target' : isFloating ? 'hero-burger' : `tray-burger-${index + 1}`}
      userData={{ pickupTarget }}
      position={position}
      rotation={isFloating ? [0.12, index * 1.1, -0.08] : [0, facingAngle, 0]}
    >
      {isFloating && <HeroBurgerDepth />}
      {pickupTarget && <HandPickup scrollProgress={pickupProgress} />}
      {!isFloating ? <BurgerPhoto index={index} /> : <ClassicBurger withCheese />}
      {!isFloating && <pointLight color={accent} intensity={index === activeIndex ? 2.15 : 0.25} distance={3.2} position={[0, 2.2, 1.5]} />}
    </group>
  )
}
