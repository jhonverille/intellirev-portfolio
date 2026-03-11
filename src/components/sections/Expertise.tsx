'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Terminal, Code, Cpu, Globe, Database, Layers } from 'lucide-react'
import SectionHeader from '../ui/SectionHeader'
import styles from './Expertise.module.css'

gsap.registerPlugin(ScrollTrigger)

const SKILL_GROUPS = [
    {
        name: 'Frontend Forge',
        icon: < Globe size={20} />,
        skills: ['React', 'Next.js', 'TypeScript', 'GSAP', 'Three.js', 'Tailwind', 'CSS Modules']
    },
    {
        name: 'Backend Core',
        icon: < Database size={20} />,
        skills: ['Node.js', 'Firebase', 'Firestore', 'PostgreSQL', 'REST APIs', 'Auth']
    },
    {
        name: 'Systems & Architecture',
        icon: < Cpu size={20} />,
        skills: ['Vercel', 'Git', 'CI/CD', 'Edge Functions', 'Web Vitals', 'Performance']
    },
    {
        name: 'Creative Suite',
        icon: < Layers size={20} />,
        skills: ['Figma', 'UI Design', '3D Modeling', 'Motion Graphics', 'Adobe CC']
    }
]

export default function Expertise() {
    const containerRef = useRef<HTMLDivElement>(null)
    const terminalRef = useRef<HTMLDivElement>(null)
    const skillRefs = useRef<(HTMLSpanElement | null)[]>([])

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Animate terminal window
            gsap.from(terminalRef.current, {
                scrollTrigger: {
                    trigger: terminalRef.current,
                    start: 'top bottom-=100',
                    toggleActions: 'play none none reverse'
                },
                y: 100,
                opacity: 0,
                duration: 1,
                ease: 'power4.out'
            })

            // Stagger skill badges
            skillRefs.current.forEach((badge, i) => {
                if (!badge) return
                gsap.from(badge, {
                    scrollTrigger: {
                        trigger: badge,
                        start: 'top bottom-=50',
                        toggleActions: 'play none none reverse'
                    },
                    scale: 0.8,
                    opacity: 0,
                    duration: 0.5,
                    delay: (i % 5) * 0.05,
                    ease: 'back.out(1.7)'
                })
            })
        }, containerRef)

        return () => ctx.revert()
    }, [])

    return (
        <section ref={containerRef} className={styles.container} id="expertise">
            <SectionHeader
                subtitle="Capabilities & Mastery"
                title="The Technical Stack"
            />

            <div ref={terminalRef} className={styles.terminal}>
                <div className={styles.terminalHeader}>
                    <div className={`${styles.dot} ${styles.dotRed}`} />
                    <div className={`${styles.dot} ${styles.dotYellow}`} />
                    <div className={`${styles.dot} ${styles.dotGreen}`} />
                    <span className={styles.terminalTitle}>jhonverille — skills — 80x24</span>
                </div>

                <div className={styles.terminalBody}>
                    {SKILL_GROUPS.map((group, groupIndex) => (
                        <div key={group.name} className={styles.skillGroup}>
                            <div className={styles.groupHeader}>
                                <div className={styles.iconWrapper}>
                                    {group.icon}
                                </div>
                                <h3 className={styles.groupName}>{group.name}</h3>
                            </div>
                            <div className={styles.skillList}>
                                {group.skills.map((skill, skillIndex) => {
                                    const refIndex = groupIndex * 10 + skillIndex;
                                    return (
                                        <span
                                            key={skill}
                                            ref={el => { skillRefs.current[refIndex] = el }}
                                            className={styles.skillBadge}
                                        >
                                            {skill}
                                        </span>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                <div className={styles.terminalBody} style={{ paddingTop: 0 }}>
                    <div className={styles.promptLine}>
                        <span className="text-highlight">jhonverille@portfolio:~$</span>
                        <span className={styles.cursor} />
                    </div>
                </div>
            </div>
        </section>
    )
}
