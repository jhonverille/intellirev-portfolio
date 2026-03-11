'use client'

import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshDistortMaterial, Float, Sphere, MeshWobbleMaterial, PerformanceMonitor } from '@react-three/drei'
import * as THREE from 'three'

export default function AbyssObject() {
  const meshRef = useRef<THREE.Mesh>(null)
  const wireRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)
  const [dpr, setDpr] = useState(1.5)
  const [degraded, setDegraded] = useState(false)
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

    // Initial setup
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  useFrame((state) => {
    const time = state.clock.getElapsedTime()

    // Scroll-driven animation & Parallax
    if (groupRef.current) {
      // Move from right to left as user scrolls down
      const targetPosX = 1.5 - (scrollY * 4)
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetPosX, 0.05)

      // Rotate the entire group down as user scrolls + look at mouse
      const targetRotY = scrollY * Math.PI * 1.5 + (mouse.x * 0.3)
      const targetRotX = scrollY * Math.PI * 0.5 - (mouse.y * 0.3)

      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.05)
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, 0.05)
    }

    if (meshRef.current) {
      meshRef.current.rotation.x = time * 0.15
      meshRef.current.rotation.y = time * 0.2
    }

    if (wireRef.current) {
      wireRef.current.rotation.x = -time * 0.1
      wireRef.current.rotation.y = -time * 0.15
    }
  })

  return (
    <PerformanceMonitor onDecline={() => setDegraded(true)} onIncline={() => setDegraded(false)}>
      <group ref={groupRef} position={[1.5, 0, 0]}>
        <Float speed={2} rotationIntensity={1} floatIntensity={1.5}>
          {/* Main Organic Form */}
          <mesh ref={meshRef}>
            <torusKnotGeometry args={[1, 0.4, degraded ? 32 : 64, degraded ? 8 : 16]} />
            <MeshDistortMaterial
              color="#0044ff"
              emissive="#001144"
              emissiveIntensity={0.5}
              roughness={0.2}
              metalness={0.8}
              distort={0.4}
              speed={2}
            />
          </mesh>

          {/* White Accents Layer */}
          {!degraded && (
            <mesh scale={1.05}>
              <torusKnotGeometry args={[1, 0.38, 64, 16]} />
              <meshStandardMaterial
                color="#ffffff"
                roughness={0.1}
                metalness={0.5}
                transparent
                opacity={0.8}
              />
            </mesh>
          )}

          {/* Cyan Glowing Wireframe */}
          <mesh ref={wireRef} scale={1.15}>
            <torusKnotGeometry args={[1, 0.42, 32, 8]} />
            <meshStandardMaterial
              color="#00f2ff"
              wireframe
              transparent
              opacity={0.3}
              emissive="#00f2ff"
              emissiveIntensity={2}
            />
          </mesh>

          {/* Inner Glow Sphere */}
          <Sphere args={[0.6, 32, 32]}>
            <MeshWobbleMaterial
              color="#ffffff"
              emissive="#0084ff"
              emissiveIntensity={2}
              factor={0.5}
              speed={2}
            />
          </Sphere>
        </Float>

        <pointLight position={[3, 3, 3]} intensity={40} color="#00f2ff" />
        <pointLight position={[-3, -3, -3]} intensity={20} color="#ffffff" />
      </group>
    </PerformanceMonitor>
  )
}

