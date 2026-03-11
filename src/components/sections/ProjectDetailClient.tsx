'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { db } from '@/lib/firebase'
import { Timestamp } from 'firebase/firestore'
import { getProjectById, Project } from '@/lib/projects'
import GlassCard from '@/components/ui/GlassCard'
import styles from './ProjectDetail.module.css'
import {
    ArrowLeft, ExternalLink, Github, Loader2,
    AlertCircle, Tag, Calendar
} from 'lucide-react'

// Note: generateStaticParams is not used in 'use client' files.
// For static export with dynamic routes, we usually need a server component shell.
// However, since this is an SPA on Firebase, we handle routing via rewrites.
// To satisfy the Next.js build:

export default function ProjectDetailPage() {
    const params = useParams()
    const id = params?.id as string
    const router = useRouter()
    const [project, setProject] = useState<Project | null>(null)
    const [loading, setLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)

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

                {project.description && (
                    <p className={styles.desc}>{project.description}</p>
                )}

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

            {/* ─── Cover Image ─── */}
            <div className={styles.coverWrap}>
                {project.imageUrl
                    ? <img src={project.imageUrl} alt={project.title} className={styles.coverImage} />
                    : <div className={styles.coverPlaceholder}>Project Preview</div>
                }
            </div>

            {/* ─── Body: Main + Sidebar ─── */}
            <div className={styles.body}>
                {/* Main */}
                <div className={styles.mainContent}>
                    <GlassCard className={styles.contentCard}>
                        <span className={styles.sectionLabel}>About this project</span>
                        <h2 className={styles.sectionTitle}>Overview</h2>
                        <p className={styles.sectionText}>
                            {project.description || 'No detailed description provided yet.'}
                        </p>
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
