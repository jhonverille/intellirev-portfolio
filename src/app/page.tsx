'use client'

import dynamic from 'next/dynamic'
import Hero from '@/components/sections/Hero'
import Profile from '@/components/sections/Profile'
import Expertise from '@/components/sections/Expertise'
import ProjectGrid from '@/components/sections/ProjectGrid'
import Testimonials from '@/components/sections/Testimonials'
import ContactForm from '@/components/sections/ContactForm'
import Header from '@/components/layout/Header'

import { useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Dynamically import 3D Scene with no SSR
const Scene = dynamic(() => import('@/components/3d/Scene'), {
  ssr: false,
  loading: () => <div className="loading-placeholder" />
})

export default function Home() {
  useEffect(() => {
    // Initialize smooth scrolling
    const lenis = new Lenis()

    // Connect Lenis to GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update)

    const rafCallback = (time: number) => {
      lenis.raf(time * 1000)
    }
    gsap.ticker.add(rafCallback)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(rafCallback)
      lenis.destroy()
    }
  }, [])

  return (
    <main>
      {/* Background 3D Scene */}
      <Scene />

      {/* Persistent Shell */}
      <Header />

      {/* Scrollable Sections */}
      <Hero />
      <Profile />
      <Expertise />
      <ProjectGrid />
      <Testimonials />
      <ContactForm />

      <style jsx global>{`
        .loading-placeholder {
          position: fixed;
          inset: 0;
          background: #08080a;
          z-index: -1;
        }
      `}</style>
    </main>
  )
}

