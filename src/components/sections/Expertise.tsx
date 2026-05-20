'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Globe, Database, Cpu, Layers, Code, Terminal, Zap, Star, Box, Cloud, Lock, Smartphone } from 'lucide-react'
import SectionHeader from '../ui/SectionHeader'
import styles from './Expertise.module.css'
import { getAllSkillGroups, SkillGroup } from '@/lib/expertise'

gsap.registerPlugin(ScrollTrigger)

// Map icon name strings from Firestore to actual Lucide components
const ICON_MAP: Record<string, React.ReactNode> = {
    Globe:       <Globe size={20} />,
    Database:    <Database size={20} />,
    Cpu:         <Cpu size={20} />,
    Layers:      <Layers size={20} />,
    Code:        <Code size={20} />,
    Terminal:    <Terminal size={20} />,
    Zap:         <Zap size={20} />,
    Star:        <Star size={20} />,
    Box:         <Box size={20} />,
    Cloud:       <Cloud size={20} />,
    Lock:        <Lock size={20} />,
    Smartphone:  <Smartphone size={20} />,
}

// Fallback if Firestore has no data yet
const FALLBACK_GROUPS = [
    { id: 'f1', name: 'Frontend Forge',      icon: 'Globe',    order: 0, skills: ['React', 'Next.js', 'TypeScript', 'GSAP', 'Three.js', 'Tailwind', 'CSS Modules'] },
    { id: 'f2', name: 'Backend Core',        icon: 'Database', order: 1, skills: ['Node.js', 'Firebase', 'Firestore', 'PostgreSQL', 'REST APIs', 'Auth'] },
    { id: 'f3', name: 'Systems & Architecture', icon: 'Cpu',   order: 2, skills: ['Vercel', 'Git', 'CI/CD', 'Edge Functions', 'Web Vitals', 'Performance'] },
    { id: 'f4', name: 'Creative Suite',      icon: 'Layers',   order: 3, skills: ['Figma', 'UI Design', '3D Modeling', 'Motion Graphics', 'Adobe CC'] },
]

export default function Expertise() {
    const containerRef = useRef<HTMLDivElement>(null)
    const terminalRef = useRef<HTMLDivElement>(null)
    const skillRefs = useRef<(HTMLSpanElement | null)[]>([])
    const [groups, setGroups] = useState<SkillGroup[]>([])
    const [loaded, setLoaded] = useState(false)

    useEffect(() => {
        getAllSkillGroups()
            .then(data => {
                setGroups(data.length > 0 ? data : FALLBACK_GROUPS)
            })
            .catch(() => setGroups(FALLBACK_GROUPS))
            .finally(() => setLoaded(true))
    }, [])

    useEffect(() => {
        if (!loaded || groups.length === 0) return

        const ctx = gsap.context(() => {
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
    }, [loaded, groups])

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
                    {groups.map((group, groupIndex) => (
                        <div key={group.id} className={styles.skillGroup}>
                            <div className={styles.groupHeader}>
                                <div className={styles.iconWrapper}>
                                    {ICON_MAP[group.icon] ?? <Layers size={20} />}
                                </div>
                                <h3 className={styles.groupName}>{group.name}</h3>
                            </div>
                            <div className={styles.skillList}>
                                {group.skills.map((skill, skillIndex) => {
                                    const refIndex = groupIndex * 10 + skillIndex
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

                    <div className={styles.promptLine}>
                        <span className="text-highlight">jhonverille@portfolio:~$</span>
                        <span className={styles.cursor} />
                    </div>
                </div>
            </div>
        </section>
    )
}
