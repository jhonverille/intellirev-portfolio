'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getAllProjects, Project } from '@/lib/projects'
import Header from '@/components/layout/Header'
import GlassCard from '@/components/ui/GlassCard'
import { ArrowRight, ExternalLink, Github, Search } from 'lucide-react'
import styles from './projects.module.css'
import gridStyles from '@/components/sections/ProjectGrid.module.css'

export default function ProjectsGallery() {
    const router = useRouter()
    const [projects, setProjects] = useState<Project[]>([])
    const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)
    const [activeFilter, setActiveFilter] = useState('All')
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        async function loadProjects() {
            try {
                const data = await getAllProjects()
                setProjects(data)
                setFilteredProjects(data)
            } catch (err) {
                console.error('Failed to fetch projects:', err)
            } finally {
                setLoading(false)
            }
        }
        loadProjects()
    }, [])

    useEffect(() => {
        let filtered = projects
        
        if (activeFilter !== 'All') {
            filtered = filtered.filter(p => p.category === activeFilter)
        }
        
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase()
            filtered = filtered.filter(p => 
                p.title.toLowerCase().includes(query) || 
                p.description.toLowerCase().includes(query) ||
                p.tags.some(t => t.toLowerCase().includes(query))
            )
        }
        
        setFilteredProjects(filtered)
    }, [activeFilter, searchQuery, projects])

    const categories = ['All', ...Array.from(new Set(projects.map(p => p.category)))]

    const goToProject = (id: string) => router.push(`/projects/detail?id=${id}`)

    return (
        <main className={styles.main}>
            <Header />
            
            <section className={styles.hero}>
                <p className={styles.subtitle}>Curated Works</p>
                <h1 className={styles.title}>Project Gallery</h1>
                
                <div className={styles.controls}>
                    <div className={styles.searchWrapper}>
                        <Search size={18} className={styles.searchIcon} />
                        <input 
                            type="text" 
                            placeholder="Search projects..." 
                            className={styles.searchInput}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className={styles.filters}>
                        {categories.map(cat => (
                            <button 
                                key={cat} 
                                className={`${styles.filterBtn} ${activeFilter === cat ? styles.filterBtnActive : ''}`}
                                onClick={() => setActiveFilter(cat)}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            <div className={styles.content}>
                {loading ? (
                    <div className={styles.noResults}>Loading projects...</div>
                ) : filteredProjects.length === 0 ? (
                    <div className={styles.noResults}>No projects found matching your criteria.</div>
                ) : (
                    <div className={styles.grid}>
                        {filteredProjects.map((project) => (
                            <div 
                                key={project.id} 
                                className={gridStyles.cardWrapper}
                                onClick={() => goToProject(project.id)}
                            >
                                <GlassCard className={gridStyles.projectCard}>
                                    <div className={gridStyles.imageArea}>
                                        {project.imageUrl 
                                            ? <img src={project.imageUrl} alt={project.title} className={gridStyles.projectImage} />
                                            : <div className={gridStyles.placeholderOverlay} />
                                        }
                                        <div className={gridStyles.hoverOverlay}>
                                            <span className={gridStyles.viewLabel}>
                                                View Case Study <ArrowRight size={16} />
                                            </span>
                                        </div>
                                    </div>
                                    <div className={gridStyles.textContent}>
                                        <h3 className={gridStyles.projectTitle}>{project.title}</h3>
                                        <p className={gridStyles.projectCategory}>{project.category}</p>
                                        {project.description && (
                                            <p className={gridStyles.projectDesc}>{project.description}</p>
                                        )}
                                        {project.tags.length > 0 && (
                                            <div className={gridStyles.tagRow}>
                                                {project.tags.map((tag, i) => (
                                                    <span key={i} className={gridStyles.tagPill}>{tag}</span>
                                                ))}
                                            </div>
                                        )}
                                        <div className={gridStyles.quickLinks} onClick={e => e.stopPropagation()}>
                                            {project.liveUrl && (
                                                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className={gridStyles.quickLink}>
                                                    <ExternalLink size={14} /> Live
                                                </a>
                                            )}
                                            {project.githubUrl && (
                                                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className={gridStyles.quickLink}>
                                                    <Github size={14} /> Repo
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </GlassCard>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    )
}
