import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { getAllProjects, Project } from '@/lib/projects'
import GlassCard from '../ui/GlassCard'
import SectionHeader from '../ui/SectionHeader'
import styles from './ProjectGrid.module.css'
import { ArrowRight, ExternalLink, Github } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const PLACEHOLDER_PROJECTS = [
    { id: 'p1', title: 'Nexus AI', category: 'Web Application', tags: ['React', 'AI', 'Firebase'] },
    { id: 'p2', title: 'Void Engine', category: '3D Graphics', tags: ['Three.js', 'GLSL', 'WebGL'] },
    { id: 'p3', title: 'CryptoFlow', category: 'Blockchain Visualizer', tags: ['Next.js', 'Web3', 'D3'] },
]

export default function ProjectGrid() {
    const router = useRouter()
    const sectionRef = useRef<HTMLDivElement>(null)
    const cardsRef = useRef<(HTMLDivElement | null)[]>([])
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const data = await getAllProjects()
                setProjects(data)
            } catch (e) {
                console.error('Failed to load projects:', e)
            } finally {
                setLoading(false)
            }
        }
        fetchProjects()
    }, [])

    // Re-run GSAP once Firestore data has loaded
    useEffect(() => {
        const items = projects.length > 0 ? projects : PLACEHOLDER_PROJECTS
        if (loading || items.length === 0) return
        const ctx = gsap.context(() => {
            cardsRef.current.forEach((card, index) => {
                if (!card) return
                gsap.from(card, {
                    scrollTrigger: {
                        trigger: card,
                        start: 'top bottom-=100',
                        toggleActions: 'play none none reverse'
                    },
                    y: 50,
                    opacity: 0,
                    duration: 0.8,
                    delay: (index % 3) * 0.1,
                    ease: 'power3.out'
                })
            })
        }, sectionRef)
        return () => ctx.revert()
    }, [loading, projects])

    const goToProject = (id: string) => router.push(`/projects/detail?id=${id}`)

    // Skeleton cards shown while fetching
    const SkeletonCards = () => (
        <>
            {[0, 1, 2].map(i => (
                <div key={i} className={styles.cardWrapper}>
                    <GlassCard className={styles.projectCard}>
                        <div className={styles.skeletonImage} />
                        <div className={styles.textContent}>
                            <div className={styles.skeletonTitle} />
                            <div className={styles.skeletonCategory} />
                            <div className={styles.skeletonLine} />
                            <div className={styles.skeletonLine} style={{ width: '70%' }} />
                        </div>
                    </GlassCard>
                </div>
            ))}
        </>
    )

    // Placeholder cards shown when Firestore has no projects yet
    const PlaceholderCards = () => (
        <>
            {PLACEHOLDER_PROJECTS.map((p, index) => (
                <div key={p.id} ref={el => { cardsRef.current[index] = el }} className={styles.cardWrapper}>
                    <GlassCard className={styles.projectCard}>
                        <div className={styles.imageArea}>
                            <div className={styles.placeholderOverlay} />
                            <span className={styles.comingSoonLabel}>Coming Soon</span>
                        </div>
                        <div className={styles.textContent}>
                            <h3 className={styles.projectTitle}>{p.title}</h3>
                            <p className={styles.projectCategory}>{p.category}</p>
                            <div className={styles.tagRow}>
                                {p.tags.map((tag, i) => (
                                    <span key={i} className={styles.tagPill}>{tag}</span>
                                ))}
                            </div>
                        </div>
                    </GlassCard>
                </div>
            ))}
        </>
    )

    return (
        <section ref={sectionRef} className={styles.container} id="projects">
            <SectionHeader
                subtitle="Our Digital Creations"
                title="Featured Projects"
            />

            <div className={styles.grid}>
                {loading ? (
                    <SkeletonCards />
                ) : projects.length === 0 ? (
                    <PlaceholderCards />
                ) : (
                    projects.map((project, index) => (
                        <div
                            key={project.id}
                            ref={(el) => { cardsRef.current[index] = el }}
                            className={styles.cardWrapper}
                            onClick={() => goToProject(project.id)}
                        >
                            <GlassCard className={styles.projectCard}>
                                <div className={styles.imageArea}>
                                    {project.imageUrl
                                        ? <img src={project.imageUrl} alt={project.title} className={styles.projectImage} />
                                        : <div className={styles.placeholderOverlay} />
                                    }
                                    <div className={styles.hoverOverlay}>
                                        <span className={styles.viewLabel}>
                                            View Case Study <ArrowRight size={16} />
                                        </span>
                                    </div>
                                </div>
                                <div className={styles.textContent}>
                                    <h3 className={styles.projectTitle}>{project.title}</h3>
                                    <p className={styles.projectCategory}>{project.category}</p>
                                    {project.description && (
                                        <p className={styles.projectDesc}>{project.description}</p>
                                    )}
                                    {project.tags.length > 0 && (
                                        <div className={styles.tagRow}>
                                            {project.tags.slice(0, 3).map((tag, i) => (
                                                <span key={i} className={styles.tagPill}>{tag}</span>
                                            ))}
                                            {project.tags.length > 3 && (
                                                <span className={styles.tagPill}>+{project.tags.length - 3}</span>
                                            )}
                                        </div>
                                    )}
                                    <div className={styles.quickLinks} onClick={e => e.stopPropagation()}>
                                        {project.liveUrl && (
                                            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className={styles.quickLink}>
                                                <ExternalLink size={14} /> Live
                                            </a>
                                        )}
                                        {project.githubUrl && (
                                            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className={styles.quickLink}>
                                                <Github size={14} /> Repo
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </GlassCard>
                        </div>
                    ))
                )}
            </div>

            <div className={styles.footer}>
                <button className={styles.exploreBtn} onClick={() => router.push('/projects')}>
                    Explore All Projects <ArrowRight size={16} />
                </button>
            </div>
        </section>
    )
}
