'use client'

import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, Box } from '@react-three/drei'
import * as THREE from 'three'

export default function HoloCubeObject() {
  const outerRef = useRef<THREE.Mesh>(null)
  const middleRef = useRef<THREE.Mesh>(null)
  const innerRef = useRef<THREE.Mesh>(null)
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
      // Projects section is around scrollY = 0.6
      // We want it to be centered left (x = -1.5) at scrollY = 0.6
      // Start off-screen right
      const targetPosX = 4.5 - (scrollY * 10) // at 0.6 -> 4.5 - 6 = -1.5
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetPosX, 0.05)

      const targetPosY = (scrollY - 0.6) * 5
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetPosY, 0.05)

      // Parallax
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, mouse.x * 0.4, 0.05)
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -mouse.y * 0.4, 0.05)
    }

    if (outerRef.current) {
      outerRef.current.rotation.x = time * 0.2
      outerRef.current.rotation.y = time * 0.3
    }
    
    if (middleRef.current) {
      middleRef.current.rotation.x = -time * 0.3
      middleRef.current.rotation.z = time * 0.4
    }

    if (innerRef.current) {
      innerRef.current.rotation.y = -time * 0.5
      innerRef.current.rotation.z = -time * 0.2
    }
  })

  return (
    <group ref={groupRef} position={[4.5, -2, 0]}>
      <Float speed={1.5} rotationIntensity={0.8} floatIntensity={1.2}>
        {/* Outer Wireframe Box */}
        <Box ref={outerRef} args={[1.8, 1.8, 1.8]}>
          <meshStandardMaterial
            color="#00f2ff"
            wireframe
            transparent
            opacity={0.3}
            emissive="#00f2ff"
            emissiveIntensity={1}
          />
        </Box>

        {/* Middle Semi-transparent Box */}
        <Box ref={middleRef} args={[1.2, 1.2, 1.2]}>
          <meshStandardMaterial
            color="#ffffff"
            transparent
            opacity={0.15}
            roughness={0.1}
            metalness={0.9}
            side={THREE.DoubleSide}
          />
        </Box>

        {/* Inner Solid Glowing Box */}
        <Box ref={innerRef} args={[0.6, 0.6, 0.6]}>
          <meshStandardMaterial
            color="#7000ff"
            emissive="#3a0088"
            emissiveIntensity={2}
            roughness={0.3}
            metalness={0.8}
          />
        </Box>
      </Float>
    </group>
  )
}
