'use client'

import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, Icosahedron } from '@react-three/drei'
import * as THREE from 'three'

export default function DataCoreObject() {
  const outerRef = useRef<THREE.Mesh>(null)
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
      // Profile section is around scrollY = 0.2
      // We want it to be centered at scrollY = 0.2
      // Start off-screen right (x=4) when scroll is 0, move to left (x=-1.5) at scroll 0.2
      // targetX = 4 - (scrollY * 27.5) -> wait, if scroll=0.2, targetX = 4 - 5.5 = -1.5
      const targetPosX = 4 - (scrollY * 27.5)
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetPosX, 0.05)

      // Move slightly up and down based on scroll
      const targetPosY = (scrollY - 0.2) * -5
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetPosY, 0.05)

      // Parallax with mouse
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, mouse.x * 0.5, 0.05)
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -mouse.y * 0.5, 0.05)
    }

    if (outerRef.current) {
      outerRef.current.rotation.x = time * 0.2
      outerRef.current.rotation.y = time * 0.3
    }

    if (innerRef.current) {
      innerRef.current.rotation.x = -time * 0.5
      innerRef.current.rotation.z = time * 0.4
    }
  })

  return (
    <group ref={groupRef} position={[4, 0, 0]}>
      <Float speed={2.5} rotationIntensity={0.5} floatIntensity={1}>
        {/* Outer Wireframe */}
        <Icosahedron ref={outerRef} args={[1.2, 1]}>
          <meshStandardMaterial
            color="#00f2ff"
            wireframe
            transparent
            opacity={0.4}
            emissive="#00f2ff"
            emissiveIntensity={1}
          />
        </Icosahedron>

        {/* Inner Solid Core */}
        <Icosahedron ref={innerRef} args={[0.7, 0]}>
          <meshStandardMaterial
            color="#7000ff"
            emissive="#3a0088"
            emissiveIntensity={0.5}
            roughness={0.2}
            metalness={0.8}
          />
        </Icosahedron>
      </Float>
    </group>
  )
}
