import { useRef, useMemo, Component, type ReactNode } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import {
  Float, MeshTransmissionMaterial, Sparkles,
  AccumulativeShadows, RandomizedLight,
  Environment,
} from '@react-three/drei'
import {
  EffectComposer, Bloom, DepthOfField, Vignette, SMAA, BrightnessContrast,
  N8AO,
} from '@react-three/postprocessing'
import * as THREE from 'three'

class SceneErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false }
  static getDerivedStateFromError() { return { hasError: true } }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          width: '100%', height: '100%',
          background: 'radial-gradient(ellipse at 40% 45%, #ddd0c0 0%, #ede5d5 40%, #f5f0e8 100%)',
        }} />
      )
    }
    return this.props.children
  }
}

// ─── Ceramic material factory ───
function useCeramicMaterial(color: string, roughness = 0.05) {
  return useMemo(() => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(color),
    roughness,
    metalness: 0,
    clearcoat: 1,
    clearcoatRoughness: 0.02,
    reflectivity: 0.95,
    envMapIntensity: 1.2,
    sheen: 0.2,
    sheenColor: new THREE.Color('#fff8ee'),
    sheenRoughness: 0.5,
  }), [color, roughness])
}

// ─── Coffee liquid material ───
function useCoffeeLiquidMaterial() {
  return useMemo(() => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#2a1608'),
    roughness: 0.05,
    metalness: 0,
    clearcoat: 1,
    clearcoatRoughness: 0.02,
    reflectivity: 0.9,
    envMapIntensity: 1.5,
  }), [])
}

// ─── Steam — soft rising particles ───
function SteamCloud() {
  const groupRef = useRef<THREE.Group>(null)
  const particles = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      offset: i * 0.5,
      x: (Math.random() - 0.5) * 0.4,
      z: (Math.random() - 0.5) * 0.4,
      baseScale: 0.3 + Math.random() * 0.25,
    })), [])

  useFrame((state) => {
    if (!groupRef.current) return
    groupRef.current.children.forEach((child, i) => {
      const t = state.clock.elapsedTime + particles[i].offset
      const cycle = (t * 0.35) % 2.8
      child.position.y = cycle + 0.5
      const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial
      if (mat) {
        mat.opacity = Math.max(0, Math.sin((cycle / 2.8) * Math.PI) * 0.12)
      }
      child.scale.setScalar(particles[i].baseScale * (1 + cycle * 0.4))
    })
  })

  return (
    <group ref={groupRef} position={[0, 0.5, 0]}>
      {particles.map((p, i) => (
        <mesh key={i} position={[p.x, 0, p.z]}>
          <sphereGeometry args={[1, 24, 24]} />
          <meshStandardMaterial
            color="#ffffff" transparent opacity={0}
            roughness={1} depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
}

// ─── Lathe-based coffee cup — smooth profile ───
function CoffeeCup() {
  const cupRef = useRef<THREE.Group>(null)
  const ceramic = useCeramicMaterial('#fcfaf6', 0.04)
  const ceramicSaucer = useCeramicMaterial('#f5f0e8', 0.08)
  const coffeeLiquid = useCoffeeLiquidMaterial()

  // Cup profile (lathe cross-section) — real cup shape
  const cupProfile = useMemo(() => {
    const pts: THREE.Vector2[] = []
    // Interior curve (concave), from bottom to rim
    for (let i = 0; i <= 20; i++) {
      const t = i / 20
      const y = -0.8 + t * 1.7
      const r = 0.85 + Math.sin(t * Math.PI * 0.5) * 0.25
      pts.push(new THREE.Vector2(r, y))
    }
    // Rim top (flat lip)
    pts.push(new THREE.Vector2(1.12, 0.95))
    pts.push(new THREE.Vector2(1.12, 0.88))
    // Exterior curve (convex), from rim to bottom
    for (let i = 0; i <= 20; i++) {
      const t = i / 20
      const y = 0.88 - t * 1.78
      const r = 1.12 - Math.sin(t * Math.PI * 0.5) * 0.12
      pts.push(new THREE.Vector2(r, y))
    }
    // Base
    pts.push(new THREE.Vector2(0.95, -0.9))
    pts.push(new THREE.Vector2(0, -0.9))
    return pts
  }, [])

  // Saucer profile
  const saucerProfile = useMemo(() => {
    const pts: THREE.Vector2[] = []
    pts.push(new THREE.Vector2(0, 0))
    pts.push(new THREE.Vector2(0.8, 0))
    pts.push(new THREE.Vector2(1.5, 0.04))
    pts.push(new THREE.Vector2(1.65, 0.08))
    pts.push(new THREE.Vector2(1.65, 0.1))
    pts.push(new THREE.Vector2(1.6, 0.1))
    pts.push(new THREE.Vector2(0, 0.06))
    return pts
  }, [])

  useFrame((state) => {
    if (cupRef.current) {
      cupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.15
    }
  })

  // Foam bubbles on coffee surface
  const foamBubbles = useMemo(() =>
    Array.from({ length: 15 }, () => {
      const angle = Math.random() * Math.PI * 2
      const r = Math.random() * 0.85
      return {
        pos: [Math.cos(angle) * r, 0.75, Math.sin(angle) * r] as [number, number, number],
        scale: 0.015 + Math.random() * 0.025,
      }
    }), [])

  return (
    <group ref={cupRef} position={[0, 0, 0]}>
      {/* Cup body via lathe */}
      <mesh castShadow receiveShadow args={[undefined, undefined]}>
        <latheGeometry args={[cupProfile, 128]} />
        <primitive object={ceramic} attach="material" />
      </mesh>

      {/* Coffee liquid surface */}
      <mesh position={[0, 0.72, 0]}>
        <cylinderGeometry args={[0.95, 0.95, 0.03, 128]} />
        <primitive object={coffeeLiquid} attach="material" />
      </mesh>

      {/* Crema ring */}
      <mesh position={[0, 0.735, 0]}>
        <torusGeometry args={[0.92, 0.03, 24, 128]} />
        <meshPhysicalMaterial
          color="#c8a47e"
          roughness={0.3}
          clearcoat={0.6}
          clearcoatRoughness={0.2}
          envMapIntensity={1}
        />
      </mesh>

      {/* Foam bubbles */}
      {foamBubbles.map((b, i) => (
        <mesh key={i} position={b.pos}>
          <sphereGeometry args={[b.scale, 16, 16]} />
          <meshPhysicalMaterial
            color="#d4b896"
            roughness={0.25}
            clearcoat={0.4}
            envMapIntensity={0.8}
          />
        </mesh>
      ))}

      {/* Handle */}
      <mesh position={[1.2, 0.15, 0]} rotation={[0, 0, 0]} castShadow>
        <torusGeometry args={[0.38, 0.09, 32, 64, Math.PI * 1.1]} />
        <primitive object={ceramic} attach="material" />
      </mesh>

      {/* Saucer */}
      <mesh position={[0, -0.95, 0]} receiveShadow castShadow>
        <latheGeometry args={[saucerProfile, 128]} />
        <primitive object={ceramicSaucer} attach="material" />
      </mesh>

      <SteamCloud />
    </group>
  )
}

// ─── Realistic donut ───
function Donut({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (ref.current) ref.current.rotation.z = state.clock.elapsedTime * 0.15
  })

  const sprinkles = useMemo(() =>
    Array.from({ length: 14 }, (_, i) => {
      const angle = (i / 14) * Math.PI * 2 + Math.random() * 0.3
      const r = 0.5 + Math.random() * 0.1
      const colors = ['#c45c4c', '#7ba05b', '#d4a943', '#5b8db8', '#c46cb0', '#e87060']
      return {
        pos: [Math.cos(angle) * r, 0.16, Math.sin(angle) * r] as [number, number, number],
        rot: [Math.random() * 3, Math.random() * 3, Math.random() * 3] as [number, number, number],
        color: colors[i % colors.length],
      }
    }), [])

  const donutMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#d4a06a'),
    roughness: 0.55,
    metalness: 0,
    clearcoat: 0.15,
    clearcoatRoughness: 0.5,
    envMapIntensity: 0.8,
  }), [])

  const glazeMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#5a2d10'),
    roughness: 0.06,
    metalness: 0,
    clearcoat: 1,
    clearcoatRoughness: 0.02,
    reflectivity: 0.95,
    envMapIntensity: 1.5,
  }), [])

  return (
    <Float speed={0.8} rotationIntensity={0.2} floatIntensity={0.6}>
      <group ref={ref} position={position}>
        <mesh castShadow receiveShadow>
          <torusGeometry args={[0.55, 0.28, 48, 96]} />
          <primitive object={donutMat} attach="material" />
        </mesh>
        <mesh position={[0, 0.04, 0]}>
          <torusGeometry args={[0.55, 0.29, 48, 96, Math.PI * 0.92]} />
          <primitive object={glazeMat} attach="material" />
        </mesh>
        {sprinkles.map((s, i) => (
          <mesh key={i} position={s.pos} rotation={s.rot} castShadow>
            <capsuleGeometry args={[0.012, 0.05, 8, 16]} />
            <meshPhysicalMaterial color={s.color} roughness={0.2} clearcoat={0.5} envMapIntensity={1} />
          </mesh>
        ))}
      </group>
    </Float>
  )
}

// ─── Macaron ───
function Macaron({ position, color }: { position: [number, number, number]; color: string }) {
  const ref = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = state.clock.elapsedTime * 0.25
  })

  const shellMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(color),
    roughness: 0.3,
    metalness: 0,
    clearcoat: 0.25,
    clearcoatRoughness: 0.35,
    sheen: 0.6,
    sheenRoughness: 0.3,
    sheenColor: new THREE.Color(color),
    envMapIntensity: 1,
  }), [color])

  const fillingMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#fff2d8'),
    roughness: 0.45,
    clearcoat: 0.15,
    envMapIntensity: 0.8,
  }), [])

  return (
    <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.5}>
      <group ref={ref} position={position}>
        <mesh position={[0, 0.13, 0]} castShadow>
          <sphereGeometry args={[0.4, 64, 48, 0, Math.PI * 2, 0, Math.PI / 2.3]} />
          <primitive object={shellMat} attach="material" />
        </mesh>
        {/* Ruffled edge — small bumps around the circumference */}
        {useMemo(() => Array.from({ length: 16 }, (_, i) => {
          const a = (i / 16) * Math.PI * 2
          return [Math.cos(a) * 0.38, 0.08, Math.sin(a) * 0.38] as [number, number, number]
        }), []).map((p, i) => (
          <mesh key={i} position={p}>
            <sphereGeometry args={[0.05, 12, 12]} />
            <primitive object={shellMat} attach="material" />
          </mesh>
        ))}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.35, 0.35, 0.1, 64]} />
          <primitive object={fillingMat} attach="material" />
        </mesh>
        <mesh position={[0, -0.13, 0]} rotation={[Math.PI, 0, 0]} castShadow>
          <sphereGeometry args={[0.4, 64, 48, 0, Math.PI * 2, 0, Math.PI / 2.3]} />
          <primitive object={shellMat} attach="material" />
        </mesh>
      </group>
    </Float>
  )
}

// ─── Croissant with layered segments ───
function Croissant() {
  const ref = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = state.clock.elapsedTime * 0.12
  })

  const croissantMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#d4a26a'),
    roughness: 0.6,
    metalness: 0,
    clearcoat: 0.25,
    clearcoatRoughness: 0.5,
    sheen: 0.4,
    sheenRoughness: 0.4,
    sheenColor: new THREE.Color('#e8c896'),
    envMapIntensity: 0.9,
  }), [])

  // Segment positions along the crescent
  const segments = useMemo(() => {
    const segs: { pos: [number, number, number]; rot: [number, number, number]; scale: number }[] = []
    for (let i = 0; i < 7; i++) {
      const t = (i / 6) * Math.PI * 1.25 - Math.PI * 0.625
      const r = 0.5
      segs.push({
        pos: [Math.cos(t) * r, 0, Math.sin(t) * r],
        rot: [0, -t + Math.PI / 2, 0],
        scale: 1 - Math.abs(i - 3) * 0.1,
      })
    }
    return segs
  }, [])

  return (
    <Float speed={1} rotationIntensity={0.15} floatIntensity={0.5}>
      <group ref={ref} position={[-3.2, 1.8, -1]} rotation={[0.2, 0, 0.3]}>
        {segments.map((s, i) => (
          <mesh key={i} position={s.pos} rotation={s.rot} scale={[s.scale, s.scale, 0.6]} castShadow>
            <sphereGeometry args={[0.18, 32, 24]} />
            <primitive object={croissantMat} attach="material" />
          </mesh>
        ))}
      </group>
    </Float>
  )
}

// ─── Glass dispersion sphere ───
function GlassSphere() {
  return (
    <Float speed={0.6} rotationIntensity={0.15} floatIntensity={0.8}>
      <mesh position={[3.2, 2.2, -2]} scale={0.6}>
        <icosahedronGeometry args={[1, 12]} />
        <MeshTransmissionMaterial
          color="#ffe8c0"
          thickness={1}
          roughness={0.03}
          transmission={1}
          ior={1.5}
          chromaticAberration={0.4}
          distortion={0.05}
          distortionScale={0.1}
          temporalDistortion={0.03}
          backside
          resolution={512}
        />
      </mesh>
    </Float>
  )
}

// ─── Realistic coffee bean geometry — true bean shape ───
function createCoffeeBeanGeometry(): THREE.BufferGeometry {
  const geometry = new THREE.SphereGeometry(1, 64, 48)
  const pos = geometry.attributes.position

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const y = pos.getY(i)
    const z = pos.getZ(i)

    // Elongate along X, flatten along Z
    const newX = x * 1.2
    const newY = y * 0.7
    let newZ = z * 0.45

    // Center crease — deep groove along the Y axis
    const creaseDist = Math.abs(newX)
    const creaseWidth = 0.12
    if (creaseDist < creaseWidth) {
      const creaseFactor = 1 - (creaseDist / creaseWidth)
      // Push z inward (toward center) to create the groove
      if (newZ > 0) {
        newZ = newZ - creaseFactor * creaseFactor * 0.35
      } else {
        newZ = newZ + creaseFactor * creaseFactor * 0.35
      }
      // Also push slightly inward overall
      const inward = creaseFactor * 0.1
      const len = Math.sqrt(newX * newX + newY * newY + newZ * newZ)
      if (len > 0.001) {
        const factor = (len - inward) / len
        pos.setX(i, newX * factor)
        pos.setY(i, newY * factor)
        pos.setZ(i, newZ * factor)
        continue
      }
    }

    // Slight taper at the ends (pointed tips)
    const tipFactor = Math.abs(newY) / 0.7
    if (tipFactor > 0.7) {
      const taper = 1 - (tipFactor - 0.7) / 0.3 * 0.3
      pos.setX(i, newX * taper)
      pos.setZ(i, newZ * taper)
    } else {
      pos.setX(i, newX)
      pos.setZ(i, newZ)
    }
    pos.setY(i, newY)
  }

  geometry.computeVertexNormals()
  return geometry
}

// ─── Coffee bean ───
function CoffeeBean({ position, scale = 1, color = '#5c3a22' }: { position: [number, number, number]; scale?: number; color?: string }) {
  const ref = useRef<THREE.Group>(null)
  const geometry = useMemo(() => createCoffeeBeanGeometry(), [])

  const mat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(color),
    roughness: 0.3,
    metalness: 0.08,
    clearcoat: 0.7,
    clearcoatRoughness: 0.25,
    sheen: 0.9,
    sheenRoughness: 0.35,
    sheenColor: new THREE.Color('#8b5a2b'),
    reflectivity: 0.5,
    envMapIntensity: 1.3,
  }), [color])

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y += 0.006
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.4) * 0.15
    }
  })

  const initialRotation = useMemo(() => [
    Math.random() * Math.PI * 2,
    Math.random() * Math.PI * 2,
    Math.random() * Math.PI * 2,
  ] as [number, number, number], [])

  return (
    <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.4}>
      <group ref={ref} position={position} scale={scale * 0.28} rotation={initialRotation}>
        <mesh castShadow receiveShadow geometry={geometry}>
          <primitive object={mat} attach="material" />
        </mesh>
      </group>
    </Float>
  )
}

// ─── Scene ───
function HeroSceneCanvas() {
  const beans = useMemo(() => {
    const seedPositions: [number, number, number][] = [
      [2.5, -0.3, 1], [-2, -1, 0.5], [3, 1, -1], [-2.5, 1.4, 0.8],
      [1.8, 2.2, 0.3], [-1.5, -0.5, 1.5], [0, 2.8, -1], [2.2, -1.8, -0.5],
      [-3.5, 0.5, 0.3], [3.5, -0.8, 0.8],
      [1.2, -1.5, 1.8], [-1.2, 2.5, -0.5],
    ]
    const colors = ['#5c3a22', '#6b4423', '#4a2c17', '#5c3a22', '#7a4f30', '#6b3e1f']
    return seedPositions.map((pos, i) => ({
      pos,
      scale: 0.8 + (i % 3) * 0.3,
      color: colors[i % colors.length],
    }))
  }, [])

  return (
    <Canvas
      shadows
      camera={{ position: [0, 0.8, 5.5], fov: 38 }}
      dpr={[1, 2]}
      gl={{
        antialias: false,
        alpha: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 0.95,
        powerPreference: 'high-performance',
      }}
    >
      {/* IBL — environment map drives all reflections */}
      <Environment preset="apartment" environmentIntensity={0.6} />

      {/* Studio key + fill lights for shadow definition */}
      <directionalLight
        position={[5, 8, 5]}
        intensity={2}
        castShadow
        shadow-mapSize={[4096, 4096]}
        shadow-bias={-0.0001}
        shadow-normalBias={0.02}
        color="#fff5e0"
      />
      <directionalLight position={[-6, 3, -3]} intensity={0.6} color="#e0e8f0" />
      <pointLight position={[-2, 4, -5]} intensity={1} color="#c8a97e" />
      <pointLight position={[0, -2, 3]} intensity={0.4} color="#fff5e0" />

      <CoffeeCup />
      <Croissant />
      <Donut position={[2.8, -1, 0.5]} />
      <Macaron position={[-2.8, 2, 0.5]} color="#e8b4b0" />
      <Macaron position={[3.5, 1.5, -0.5]} color="#b4d4a0" />
      <GlassSphere />
      {beans.map((b, i) => (
        <CoffeeBean key={i} position={b.pos} scale={b.scale} color={b.color} />
      ))}

      <Sparkles count={50} scale={[14, 10, 8]} size={2} speed={0.15} opacity={0.25} color="#e6d5b8" />

      {/* Realistic ground shadows */}
      <AccumulativeShadows
        position={[0, -1.5, 0]}
        frames={80}
        scale={14}
        opacity={0.7}
        color="#2a1a0e"
      >
        <RandomizedLight
          radius={8}
          ambient={0.4}
          intensity={3}
          position={[5, 8, 5]}
          bias={-0.0001}
        />
      </AccumulativeShadows>

      {/* Postprocessing — photorealistic pipeline */}
      <EffectComposer multisampling={4} enableNormalPass>
        <N8AO aoRadius={2} intensity={1.2} distanceFalloff={0.5} />
        <DepthOfField focusDistance={0.015} focalLength={0.04} bokehScale={4} height={480} />
        <Bloom intensity={0.3} luminanceThreshold={0.7} luminanceSmoothing={0.95} mipmapBlur />
        <BrightnessContrast brightness={0.01} contrast={0.06} />
        <Vignette eskil={false} offset={0.25} darkness={0.45} />
        <SMAA />
      </EffectComposer>
    </Canvas>
  )
}

export default function HeroSceneSafe() {
  return (
    <SceneErrorBoundary>
      <HeroSceneCanvas />
    </SceneErrorBoundary>
  )
}
