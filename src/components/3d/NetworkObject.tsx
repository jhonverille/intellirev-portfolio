'use client'

import { useRef, useState, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'

export default function NetworkObject() {
  const pointsRef = useRef<THREE.Points>(null)
  const groupRef = useRef<THREE.Group>(null)
  const [scrollY, setScrollY] = useState(0)
  const [mouse, setMouse] = useState({ x: 0, y: 0 })

  // Generate random points in a sphere
  const [positions, mathColors] = useMemo(() => {
    const count = 300
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const colorObj = new THREE.Color()

    for (let i = 0; i < count; i++) {
      // Random position in sphere of radius 1.5
      const r = 1.5 * Math.cbrt(Math.random())
      const theta = Math.random() * 2 * Math.PI
      const phi = Math.acos(2 * Math.random() - 1)

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = r * Math.cos(phi)

      // Mix cyan and purple
      if (Math.random() > 0.5) {
        colorObj.set('#00f2ff')
      } else {
        colorObj.set('#7000ff')
      }
      colors[i * 3] = colorObj.r
      colors[i * 3 + 1] = colorObj.g
      colors[i * 3 + 2] = colorObj.b
    }
    return [positions, colors]
  }, [])

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
      // Expertise section is around scrollY = 0.4
      // We want it to be centered right (x = 1.5) at scrollY = 0.4
      // Start off-screen bottom-left
      const targetPosX = -4 + (scrollY * 13.75) // at 0.4 -> -4 + 5.5 = 1.5
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetPosX, 0.05)

      const targetPosY = (0.4 - scrollY) * 5
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetPosY, 0.05)

      // Parallax
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, mouse.x * 0.8, 0.05)
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -mouse.y * 0.8, 0.05)
    }

    if (pointsRef.current) {
      pointsRef.current.rotation.y = time * 0.1
      pointsRef.current.rotation.z = time * 0.05
    }
  })

  return (
    <group ref={groupRef} position={[-4, 2, 0]}>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        <Points ref={pointsRef} positions={positions} colors={mathColors}>
          <PointMaterial
            transparent
            vertexColors
            size={0.05}
            sizeAttenuation={true}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </Points>
      </Float>
    </group>
  )
}
