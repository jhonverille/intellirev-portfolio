'use client'

import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, Sphere, MeshDistortMaterial } from '@react-three/drei'
import * as THREE from 'three'

export default function PulseSphereObject() {
  const meshRef = useRef<THREE.Mesh>(null)
  const ringRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)
  const [scrollY, setScrollY] = useState(0)
  const [mouse, setMouse] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleScroll = () => {
      const maxScroll = Math.max(1, document.body.scrollHeight - window.innerHeight)
      setScrollY(window.scrollY / maxScroll)
    }

    const handleMouseMove = (e: MouseEvent) => {
      setMouse({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  useFrame((state) => {
    const time = state.clock.getElapsedTime()

    if (groupRef.current) {
      // Testimonials/Contact section is around scrollY = 0.8 to 1.0
      // We want it to be centered at bottom (x = 1.5) at scrollY = 0.8
      // Start off-screen bottom left
      const targetPosX = -6 + (scrollY * 9.375) // at 0.8 -> -6 + 7.5 = 1.5
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetPosX, 0.05)

      const targetPosY = (0.8 - scrollY) * 6
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetPosY, 0.05)

      // Parallax
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, mouse.x * 0.3, 0.05)
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -mouse.y * 0.3, 0.05)
    }

    if (meshRef.current) {
      meshRef.current.rotation.x = time * 0.2
      meshRef.current.rotation.y = time * 0.3
      
      // Pulsating effect
      const scale = 1 + Math.sin(time * 2) * 0.05
      meshRef.current.scale.set(scale, scale, scale)
    }

    if (ringRef.current) {
      ringRef.current.rotation.x = Math.PI / 2 + Math.sin(time * 0.5) * 0.2
      ringRef.current.rotation.y = time * 0.5
    }
  })

  return (
    <group ref={groupRef} position={[-6, 3, 0]}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        {/* Core Pulsating Sphere */}
        <Sphere ref={meshRef} args={[1, 64, 64]}>
          <MeshDistortMaterial
            color="#ff00ff"
            emissive="#7000ff"
            emissiveIntensity={1}
            roughness={0.1}
            metalness={0.8}
            distort={0.3}
            speed={3}
          />
        </Sphere>

        {/* Orbiting Ring */}
        <mesh ref={ringRef}>
          <torusGeometry args={[1.5, 0.02, 16, 100]} />
          <meshStandardMaterial
            color="#00f2ff"
            emissive="#00f2ff"
            emissiveIntensity={2}
          />
        </mesh>
        
        {/* Outer Glow */}
        <Sphere args={[1.2, 32, 32]}>
          <meshBasicMaterial
            color="#ff00ff"
            transparent
            opacity={0.1}
            blending={THREE.AdditiveBlending}
          />
        </Sphere>
      </Float>
    </group>
  )
}
