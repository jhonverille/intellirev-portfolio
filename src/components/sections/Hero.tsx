'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import styles from './Hero.module.css'
import { ArrowRight, Zap, Activity } from 'lucide-react'
import dynamic from 'next/dynamic'
import SectionHeader from '../ui/SectionHeader'
import { db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'

// ssr: false prevents Node.js vs browser Math.sin/cos float-precision hydration mismatch
const PhilippinesFlagText = dynamic(
    () => import('./PhilippinesFlagText').then(m => m.PhilippinesFlagText),
    {
        ssr: false,
        // Invisible placeholder keeps layout stable while the SVG loads
        loading: () => <span style={{ opacity: 0, pointerEvents: 'none' }}>Philippines</span>,
    }
)

const N8nIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path fill="#ff6d5a" d="M21.4737 5.6842c-1.1772 0-2.1663.8051-2.4468 1.8947h-2.8955c-1.235 0-2.289.893-2.492 2.111l-.1038.623a1.263 1.263 0 0 1-1.246 1.0555H11.289c-.2805-1.0896-1.2696-1.8947-2.4468-1.8947s-2.1663.8051-2.4467 1.8947H4.973c-.2805-1.0896-1.2696-1.8947-2.4468-1.8947C1.1311 9.4737 0 10.6047 0 12s1.131 2.5263 2.5263 2.5263c1.1772 0 2.1663-.8051 2.4468-1.8947h1.4223c.2804 1.0896 1.2696 1.8947 2.4467 1.8947 1.1772 0 2.1663-.8051 2.4468-1.8947h1.0008a1.263 1.263 0 0 1 1.2459 1.0555l.1038.623c.203 1.218 1.257 2.111 2.492 2.111h.3692c.2804 1.0895 1.2696 1.8947 2.4468 1.8947 1.3952 0 2.5263-1.131 2.5263-2.5263s-1.131-2.5263-2.5263-2.5263c-1.1772 0-2.1664.805-2.4468 1.8947h-.3692a1.263 1.263 0 0 1-1.246-1.0555l-.1037-.623A2.52 2.52 0 0 0 13.9607 12a2.52 2.52 0 0 0 .821-1.4794l.1038-.623a1.263 1.263 0 0 1 1.2459-1.0555h2.8955c.2805 1.0896 1.2696 1.8947 2.4468 1.8947 1.3952 0 2.5263-1.131 2.5263-2.5263s-1.131-2.5263-2.5263-2.5263m0 1.2632a1.263 1.263 0 0 1 1.2631 1.2631 1.263 1.263 0 0 1-1.2631 1.2632 1.263 1.263 0 0 1-1.2632-1.2632 1.263 1.263 0 0 1 1.2632-1.2631M2.5263 10.7368A1.263 1.263 0 0 1 3.7895 12a1.263 1.263 0 0 1-1.2632 1.2632A1.263 1.263 0 0 1 1.2632 12a1.263 1.263 0 0 1 1.2631-1.2632m6.3158 0A1.263 1.263 0 0 1 10.1053 12a1.263 1.263 0 0 1-1.2632 1.2632A1.263 1.263 0 0 1 7.579 12a1.263 1.263 0 0 1 1.2632-1.2632m10.1053 3.7895a1.263 1.263 0 0 1 1.2631 1.2632 1.263 1.263 0 0 1-1.2631 1.2631 1.263 1.263 0 0 1-1.2632-1.2631 1.263 1.263 0 0 1 1.2632-1.2632" />
    </svg>
)

const GHLIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M 13 26 V 17 H 10 L 16 11 L 22 17 H 19 V 26 Z" fill="#42A5F5" />
        <path d="M 16 11 L 22 17 H 19 V 26 H 16 Z" fill="#1E88E5" />
        <path d="M 5 26 V 12 H 2 L 8 6 L 14 12 H 11 V 26 Z" fill="#FFCA28" />
        <path d="M 8 6 L 14 12 H 11 V 26 H 8 Z" fill="#FFB300" />
        <path d="M 21 26 V 10 H 18 L 24 4 L 30 10 H 27 V 26 Z" fill="#66BB6A" />
        <path d="M 24 4 L 30 10 H 27 V 26 H 24 Z" fill="#43A047" />
    </svg>
)

interface Tool {
    name: string;
    logoUrl: string;
}

export default function Hero() {
    const containerRef = useRef<HTMLElement>(null)
    const titleRef = useRef<HTMLHeadingElement>(null)
    const contentRef = useRef<HTMLDivElement>(null)
    const wrapperRef = useRef<HTMLDivElement>(null)
    const [extraNodes, setExtraNodes] = useState<{ id: number, left: string, top: string, delay: string, duration: string }[]>([])
    const [isLoaded, setIsLoaded] = useState(false)

    const [settings, setSettings] = useState({
        heroHeadline: <><span className="text-highlight">Automation Specialist</span></> as React.ReactNode,
        heroSubheadline: 'Architecting autonomous ecosystems and intelligent workflows that transform complex processes into seamless digital experiences.',
        tools: [] as Tool[],
        showPhilippinesFlag: true
    })

    const ICON_MAP: Record<string, React.ReactNode> = {
        'n8n': <N8nIcon className={styles.partnerIcon} />,
        'gohighlevel': <GHLIcon className={styles.partnerIcon} />,
        'ghl': <GHLIcon className={styles.partnerIcon} />,
        'automation': <Zap className={styles.partnerIcon} size={20} />,
        'default': <Activity className={styles.partnerIcon} size={20} />
    }

    const getToolIcon = (tool: Tool) => {
        if (tool.logoUrl) {
            return <img src={tool.logoUrl} alt={tool.name} className={styles.partnerIcon} />
        }
        const normalized = tool.name.toLowerCase();
        if (ICON_MAP[normalized]) return ICON_MAP[normalized];
        return ICON_MAP['default'];
    }

    const isDragging = useRef(false)
    const hasDragged = useRef(false)
    const pointerStart = useRef({ x: 0, y: 0 })
    const originOffset = useRef({ x: 0, y: 0 })
    const hoverInterval = useRef<ReturnType<typeof setInterval> | null>(null)

    const startSucking = () => {
        if (hoverInterval.current) return
        hoverInterval.current = setInterval(() => {
            const count = Math.floor(Math.random() * 3) + 1
            const newNodes = Array.from({ length: count }).map(() => ({
                id: Math.random(),
                left: `${Math.random() * 240 - 70}%`,
                top: `${Math.random() * 240 - 70}%`,
                delay: `${Math.random() * 0.15}s`,
                duration: `${1.0 + Math.random() * 1.4}s`,
            }))
            setExtraNodes(prev => [...prev, ...newNodes])
            setTimeout(() => {
                setExtraNodes(prev => prev.filter(n => !newNodes.includes(n)))
            }, 2500)
        }, 250)
    }

    const stopSucking = () => {
        if (hoverInterval.current) {
            clearInterval(hoverInterval.current)
            hoverInterval.current = null
        }
    }

    const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        if (e.button !== 0) return
        const el = wrapperRef.current
        if (!el) return
        gsap.killTweensOf(el)
        stopSucking()
        isDragging.current = true
        hasDragged.current = false
        pointerStart.current = { x: e.clientX, y: e.clientY }
        originOffset.current = {
            x: (gsap.getProperty(el, 'x') as number) || 0,
            y: (gsap.getProperty(el, 'y') as number) || 0,
        }
        el.setPointerCapture(e.pointerId)
        e.preventDefault()
    }

    const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isDragging.current) return
        const el = wrapperRef.current
        if (!el) return
        const dx = e.clientX - pointerStart.current.x
        const dy = e.clientY - pointerStart.current.y
        if (Math.abs(dx) > 4 || Math.abs(dy) > 4) hasDragged.current = true
        gsap.set(el, {
            x: originOffset.current.x + dx,
            y: originOffset.current.y + dy,
        })
    }

    const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isDragging.current) return
        isDragging.current = false
        const el = wrapperRef.current
        if (!el) return
        gsap.to(el, {
            x: 0,
            y: 0,
            duration: 1.5,
            ease: 'elastic.out(1, 0.38)',
        })
    }

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const docRef = doc(db, 'site_settings', 'general')
                const docSnap = await getDoc(docRef)
                if (docSnap.exists()) {
                    const data = docSnap.data()

                    // Data Migration & Normalization
                    let normalizedTools: Tool[] = []
                    if (data.tools && Array.isArray(data.tools)) {
                        normalizedTools = data.tools.map((t: any) =>
                            typeof t === 'string' ? { name: t, logoUrl: '' } : t
                        )
                    }

                    const showFlag = data.showPhilippinesFlag !== undefined ? data.showPhilippinesFlag : true;
                    
                    let baseHeadline = (data.heroHeadline && data.heroHeadline.trim() !== '') 
                        ? data.heroHeadline 
                        : <span className="text-highlight">Automation Specialist</span>;

                    setSettings(prev => ({
                        heroHeadline: showFlag 
                            ? <>{baseHeadline} <br /> From <PhilippinesFlagText /></>
                            : <>{baseHeadline}</>,
                        heroSubheadline: (data.heroSubheadline && data.heroSubheadline.trim() !== '')
                            ? data.heroSubheadline
                            : prev.heroSubheadline,
                        tools: normalizedTools.length > 0 ? normalizedTools : prev.tools,
                        showPhilippinesFlag: showFlag
                    }))
                }
            } catch (err) {
                console.error("Fetch error:", err)
            } finally {
                setIsLoaded(true)
            }
        }
        fetchSettings()

        return () => {
            stopSucking()
        }
    }, [])

    useEffect(() => {
        if (!isLoaded) return;

        const ctx = gsap.context(() => {
            // Initially set opacity to 0 to prevent FOUC just in case GSAP takes a frame
            gsap.set(titleRef.current, { opacity: 0 })
            gsap.set(contentRef.current, { opacity: 0 })

            gsap.fromTo(titleRef.current, 
                { y: 100, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 1.2,
                    ease: "power4.out",
                    delay: 0.1
                }
            )

            gsap.fromTo(contentRef.current, 
                { y: 50, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 1,
                    ease: "power3.out",
                    delay: 0.4
                }
            )
        }, containerRef)

        return () => ctx.revert()
    }, [isLoaded])

    return (
        <section className={styles.container} ref={containerRef} id="home">
            <div className={styles.content}>
                <div ref={titleRef} style={{ opacity: 0 }}>
                    <SectionHeader
                        level="h1"
                        align="left"
                        subtitle="Welcome to my Abyss"
                        title={settings.heroHeadline}
                    />
                </div>

                <div ref={contentRef} style={{ opacity: 0 }}>
                    <p className={styles.description}>
                        {settings.heroSubheadline}
                    </p>

                    <div className={styles.ctaWrapper}>
                        <button className={styles.pillBtn}>
                            Let's Talk
                            <div className={styles.arrowIcon}>
                                <ArrowRight size={18} />
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            <div
                className={styles.blackholeWrapper}
                ref={wrapperRef}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                style={{ cursor: 'grab', touchAction: 'none', userSelect: 'none' }}
            >
                <div
                    className={styles.blackhole}
                    onMouseEnter={startSucking}
                    onMouseLeave={stopSucking}
                >
                    <span className={`${styles.node} ${styles.n1}`}></span>
                    <span className={`${styles.node} ${styles.n2}`}></span>
                    <span className={`${styles.node} ${styles.n3}`}></span>
                    <span className={`${styles.node} ${styles.n4}`}></span>
                    <span className={`${styles.node} ${styles.n5}`}></span>
                    <span className={`${styles.node} ${styles.n6}`}></span>

                    {extraNodes.map(node => (
                        <span
                            key={node.id}
                            className={styles.extraNode}
                            style={{
                                animation: `${styles.suckIn} ${node.duration} ease-in-out forwards ${node.delay}`,
                                left: node.left,
                                top: node.top
                            }}
                        ></span>
                    ))}
                </div>
            </div>

            <div className={styles.partners}>
                <p className={styles.partnersLabel}>Tools I Use</p>
                <div className={styles.partnerGrid}>
                    {settings.tools.map((tool, index) => (
                        <div key={index} className={styles.partner}>
                            {getToolIcon(tool)}
                            {tool.name}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
