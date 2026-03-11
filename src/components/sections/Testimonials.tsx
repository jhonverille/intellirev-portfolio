'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Quote, Loader2 } from 'lucide-react'
import GlassCard from '../ui/GlassCard'
import SectionHeader from '../ui/SectionHeader'
import styles from './Testimonials.module.css'
import { getAllTestimonials, Testimony } from '@/lib/testimonials'

gsap.registerPlugin(ScrollTrigger)

const PLACEHOLDER_TESTIMONIALS: Testimony[] = [
    {
        id: 't1',
        name: 'Alex Rivera',
        role: 'CEO @ TechSphere',
        content: 'Jhon transformed our vision into a stunning digital reality. His attention to detail in the 3D space is unmatched.'
    },
    {
        id: 't2',
        name: 'Sarah Chen',
        role: 'Product Lead @ Innovate',
        content: 'The terminal-inspired UI you built for our dashboard is both functional and beautiful. A true full-stack talent.'
    },
    {
        id: 't3',
        name: 'Marcus Thorne',
        role: 'Creative Director',
        content: 'Working with Jhon was a seamless experience. He brings a unique blend of technical mastery and artistic flair.'
    }
]

export default function Testimonials() {
    const sectionRef = useRef<HTMLDivElement>(null)
    const cardRefs = useRef<(HTMLDivElement | null)[]>([])
    const [testimonials, setTestimonials] = useState<Testimony[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchTestimonials = async () => {
            try {
                const data = await getAllTestimonials()
                if (data.length === 0) {
                    setTestimonials(PLACEHOLDER_TESTIMONIALS)
                } else {
                    setTestimonials(data)
                }
            } catch (e) {
                console.error('Error fetching testimonials:', e)
                setTestimonials(PLACEHOLDER_TESTIMONIALS)
            } finally {
                setLoading(false)
            }
        }
        fetchTestimonials()
    }, [])

    useEffect(() => {
        if (loading) return

        const ctx = gsap.context(() => {
            cardRefs.current.forEach((card, i) => {
                if (!card) return
                gsap.from(card, {
                    scrollTrigger: {
                        trigger: card,
                        start: 'top bottom-=50',
                        toggleActions: 'play none none reverse'
                    },
                    y: 60,
                    opacity: 0,
                    duration: 0.8,
                    delay: i * 0.15,
                    ease: 'power3.out'
                })
            })
        }, sectionRef)

        return () => ctx.revert()
    }, [loading, testimonials])

    return (
        <section ref={sectionRef} className={styles.container} id="testimonials">
            <SectionHeader
                subtitle="Wall of Trust"
                title="Client Testimonials"
            />

            {loading ? (
                <div className={styles.loadingState}>
                    <Loader2 className={styles.spinner} size={40} />
                    <p>Loading stories...</p>
                </div>
            ) : (
                <div className={styles.grid}>
                    {testimonials.map((t, i) => (
                        <div key={t.id} ref={el => { cardRefs.current[i] = el }}>
                            <GlassCard className={styles.testimonialCard}>
                                <Quote className={styles.quoteIcon} size={32} />
                                <p className={styles.quote}>"{t.content}"</p>
                                <div className={styles.author}>
                                    <div className={styles.avatar}>
                                        {t.name.charAt(0)}
                                    </div>
                                    <div className={styles.authorInfo}>
                                        <span className={styles.name}>{t.name}</span>
                                        <span className={styles.role}>{t.role}</span>
                                    </div>
                                </div>
                            </GlassCard>
                        </div>
                    ))}
                </div>
            )}
        </section>
    )
}
