'use client'

import { Canvas } from '@react-three/fiber'
import { PerspectiveCamera, Environment, Float, Stars, Html, useProgress } from '@react-three/drei'
import { Suspense } from 'react'
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

                <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                    <AbyssObject />
                </Float>

                <Environment preset="city" />
            </Suspense>
        </Canvas>
    )
}
