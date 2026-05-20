'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { PerspectiveCamera, Environment, Stars, Html, useProgress } from '@react-three/drei'
import { Suspense, useRef, useEffect, useState } from 'react'
import * as THREE from 'three'
import AbyssObject from './AbyssObject'

function Loader() {
    const { progress } = useProgress()
    return (
        <Html center>
            <div style={{
                color: '#00f2ff',
                fontFamily: 'var(--font-main)',
                fontSize: '1.5rem',
                letterSpacing: '2px',
                fontWeight: 'bold',
                textShadow: '0 0 10px rgba(0, 242, 255, 0.5)'
            }}>
                {progress.toFixed(0)}%
            </div>
        </Html>
    )
}

function ScrollGroup({ children }: { children: React.ReactNode }) {
    const groupRef = useRef<THREE.Group>(null)
    const [scrollY, setScrollY] = useState(0)

    useEffect(() => {
        const handleScroll = () => {
            const maxScroll = Math.max(1, document.body.scrollHeight - window.innerHeight)
            setScrollY(window.scrollY / maxScroll)
        }
        window.addEventListener('scroll', handleScroll, { passive: true })
        handleScroll()
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    useFrame(() => {
        if (groupRef.current) {
            // Total vertical distance in 3D space is 40 units (to align with 5 intervals of 8)
            const targetY = scrollY * 40
            groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.05)
        }
    })

    return <group ref={groupRef}>{children}</group>
}

export default function Scene() {
    return (
        <Canvas>
            <Suspense fallback={<Loader />}>
                <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={75} />

                {/* Lights */}
                <ambientLight intensity={0.2} />
                <pointLight position={[10, 10, 10]} intensity={1.5} color="#00f2ff" />
                <pointLight position={[-10, -10, -10]} intensity={1.5} color="#7000ff" />

                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

                <ScrollGroup>
                    <group position={[0, 0, 0]}>
                        <AbyssObject />
                    </group>
                </ScrollGroup>

                <Environment preset="city" />
            </Suspense>
        </Canvas>
    )
}
