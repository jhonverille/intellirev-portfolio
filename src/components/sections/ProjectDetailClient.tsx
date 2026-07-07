'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Timestamp } from 'firebase/firestore'
import { getProjectById, Project } from '@/lib/projects'
import GlassCard from '@/components/ui/GlassCard'
import styles from './ProjectDetail.module.css'
import {
    ArrowLeft, ArrowRight, ExternalLink, Github, Loader2,
    AlertCircle, Tag, Calendar, ChevronLeft, ChevronRight
} from 'lucide-react'

export default function ProjectDetailPage() {
    const searchParams = useSearchParams()
    const id = searchParams?.get('id') as string
    const router = useRouter()
    const [project, setProject] = useState<Project | null>(null)
    const [loading, setLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)
    const [activeTab, setActiveTab] = useState<'challenge' | 'solution' | 'execution' | 'impact'>('challenge')
    const [currentImage, setCurrentImage] = useState(0)
    const touchStartX = useRef<number | null>(null)
    const touchEndX = useRef<number | null>(null)

    useEffect(() => {
        const fetchProject = async () => {
            if (!id) return
            try {
                const data = await getProjectById(id)
                if (!data) {
                    setNotFound(true)
                } else {
                    setProject(data)
                }
            } catch {
                setNotFound(true)
            } finally {
                setLoading(false)
            }
        }
        fetchProject()
    }, [id])

    const images = project
        ? (project.imageUrls && project.imageUrls.length > 0 ? project.imageUrls : project.imageUrl ? [project.imageUrl] : [])
        : []

    // Build unified media list: images first, then videos
    type MediaItem = { type: 'image' | 'video'; url: string }
    const media: MediaItem[] = [
        ...images.map(url => ({ type: 'image' as const, url })),
        ...(project?.videoUrls ?? []).map(url => ({ type: 'video' as const, url }))
    ]

    const prevImage = useCallback(() => {
        setCurrentImage(i => (i - 1 + media.length) % media.length)
    }, [media.length])

    const nextImage = useCallback(() => {
        setCurrentImage(i => (i + 1) % media.length)
    }, [media.length])

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX
        touchEndX.current = null
    }

    const handleTouchMove = (e: React.TouchEvent) => {
        touchEndX.current = e.touches[0].clientX
    }

    const handleTouchEnd = () => {
        if (touchStartX.current === null || touchEndX.current === null) return
        const diff = touchStartX.current - touchEndX.current
        if (Math.abs(diff) > 50) {
            diff > 0 ? nextImage() : prevImage()
        }
        touchStartX.current = null
        touchEndX.current = null
    }

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (!project || media.length <= 1) return
            if (e.key === 'ArrowLeft') prevImage()
            if (e.key === 'ArrowRight') nextImage()
        }
        window.addEventListener('keydown', handleKey)
        return () => window.removeEventListener('keydown', handleKey)
    }, [project, media.length, prevImage, nextImage])

    const formatDate = (ts: Timestamp | null) => {
        if (!ts) return null
        return ts.toDate().toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        })
    }

    if (loading) {
        return (
            <div className={styles.page}>
                <div className={styles.loadingState}>
                    <Loader2 size={40} className={styles.spinner} />
                    <p>Loading project...</p>
                </div>
            </div>
        )
    }

    if (notFound || !project) {
        return (
            <div className={styles.page}>
                <div className={styles.errorState}>
                    <AlertCircle size={40} />
                    <p>Project not found.</p>
                    <button className={styles.backBtn} onClick={() => router.push('/#projects')}>
                        <ArrowLeft size={16} /> Back to Projects
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className={styles.page}>

            {/* ─── Hero ─── */}
            <div className={styles.hero}>
                <button className={styles.backBtn} onClick={() => router.back()}>
                    <ArrowLeft size={16} /> Back
                </button>

                <span className={styles.category}>{project.category}</span>
                <h1 className={styles.title}>{project.title}</h1>

                <div className={styles.actions}>
                    {project.liveUrl && (
                        <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className={styles.liveBtn}>
                            <ExternalLink size={16} /> View Live Site
                        </a>
                    )}
                    {project.githubUrl && (
                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className={styles.githubBtn}>
                            <Github size={16} /> GitHub Repository
                        </a>
                    )}
                </div>
            </div>

            {/* ─── Image Carousel ─── */}
            <div className={styles.coverWrap}>
                {media.length > 0 ? (
                    <div
                        className={styles.carousel}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                    >
                        <div className={styles.carouselTrack} style={{ transform: `translateX(-${currentImage * 100}%)` }}>
                            {media.map((item, i) => (
                                <div key={i} className={styles.carouselSlide}>
                                    {item.type === 'video' ? (
                                        <video
                                            src={item.url}
                                            className={styles.coverImage}
                                            controls
                                            playsInline
                                            style={{ background: '#000' }}
                                        />
                                    ) : (
                                        <img src={item.url} alt={`${project.title} image ${i + 1}`} className={styles.coverImage} />
                                    )}
                                </div>
                            ))}
                        </div>

                        {media.length > 1 && (
                            <>
                                <button className={`${styles.carouselBtn} ${styles.carouselBtnPrev}`} onClick={prevImage} aria-label="Previous">
                                    <ChevronLeft size={22} />
                                </button>
                                <button className={`${styles.carouselBtn} ${styles.carouselBtnNext}`} onClick={nextImage} aria-label="Next">
                                    <ChevronRight size={22} />
                                </button>
                                <div className={styles.carouselDots}>
                                    {media.map((item, i) => (
                                        <button
                                            key={i}
                                            className={`${styles.dot} ${i === currentImage ? styles.dotActive : ''} ${item.type === 'video' ? styles.dotVideo : ''}`}
                                            onClick={() => setCurrentImage(i)}
                                            aria-label={`Go to ${item.type} ${i + 1}`}
                                        />
                                    ))}
                                </div>
                                <div className={styles.carouselCounter}>{currentImage + 1} / {media.length}</div>
                            </>
                        )}
                    </div>
                ) : (
                    <div className={styles.coverPlaceholder}>Project Preview</div>
                )}
            </div>

            {/* ─── Body: Main + Sidebar ─── */}
            <div className={styles.body}>
                {/* Main */}
                <div className={styles.mainContent}>
                    <GlassCard className={styles.contentCard}>
                        <div className={styles.tabsHeader}>
                            <button 
                                className={`${styles.tabBtn} ${activeTab === 'challenge' ? styles.tabBtnActive : ''}`}
                                onClick={() => setActiveTab('challenge')}
                            >
                                The Challenge
                            </button>
                            <button 
                                className={`${styles.tabBtn} ${activeTab === 'solution' ? styles.tabBtnActive : ''}`}
                                onClick={() => setActiveTab('solution')}
                            >
                                Strategic Solution
                            </button>
                            <button 
                                className={`${styles.tabBtn} ${activeTab === 'execution' ? styles.tabBtnActive : ''}`}
                                onClick={() => setActiveTab('execution')}
                            >
                                Execution
                            </button>
                            <button 
                                className={`${styles.tabBtn} ${activeTab === 'impact' ? styles.tabBtnActive : ''}`}
                                onClick={() => setActiveTab('impact')}
                            >
                                Impact
                            </button>
                        </div>

                        <div className={styles.tabContent}>
                            {activeTab === 'challenge' && (
                                <>
                                    <span className={styles.sectionLabel}>The Challenge / Problem</span>
                                    <p className={styles.sectionText}>
                                        {project.challenge || project.description || 'No challenge description provided yet.'}
                                    </p>
                                </>
                            )}
                            {activeTab === 'solution' && (
                                <>
                                    <span className={styles.sectionLabel}>The Strategic Solution</span>
                                    <p className={styles.sectionText}>
                                        {project.solution || 'No solution description provided yet.'}
                                    </p>
                                </>
                            )}
                            {activeTab === 'execution' && (
                                <>
                                    <span className={styles.sectionLabel}>The Execution</span>
                                    <p className={styles.sectionText}>
                                        {project.execution || 'No execution details provided yet.'}
                                    </p>
                                </>
                            )}
                            {activeTab === 'impact' && (
                                <>
                                    <span className={styles.sectionLabel}>The Tangible Result / Impact</span>
                                    <p className={styles.sectionText}>
                                        {project.impact || 'No impact details provided yet.'}
                                    </p>
                                </>
                            )}
                        </div>
                    </GlassCard>
                </div>

                {/* Sidebar */}
                <aside className={styles.sidebar}>
                    {/* Tech Stack */}
                    {project.tags.length > 0 && (
                        <GlassCard className={styles.sideCard}>
                            <h4><Tag size={12} style={{ display: 'inline', marginRight: 6 }} />Tech Stack</h4>
                            <div className={styles.tagList}>
                                {project.tags.map((tag, i) => (
                                    <span key={i} className={styles.tagPill}>{tag}</span>
                                ))}
                            </div>
                        </GlassCard>
                    )}

                    {/* Date */}
                    {project.createdAt && (
                        <GlassCard className={styles.sideCard}>
                            <h4><Calendar size={12} style={{ display: 'inline', marginRight: 6 }} />Published</h4>
                            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', margin: 0 }}>
                                {formatDate(project.createdAt)}
                            </p>
                        </GlassCard>
                    )}

                    {/* Links */}
                    {(project.liveUrl || project.githubUrl) && (
                        <GlassCard className={styles.sideCard}>
                            <h4>Links</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {project.liveUrl && (
                                    <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className={styles.liveBtn} style={{ fontSize: '0.8rem', padding: '0.6rem 1.2rem', justifyContent: 'center' }}>
                                        <ExternalLink size={14} /> Live Site
                                    </a>
                                )}
                                {project.githubUrl && (
                                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className={styles.githubBtn} style={{ fontSize: '0.8rem', padding: '0.6rem 1.2rem', justifyContent: 'center' }}>
                                        <Github size={14} /> Repo
                                    </a>
                                )}
                            </div>
                        </GlassCard>
                    )}
                </aside>
            </div>
        </div>
    )
}
