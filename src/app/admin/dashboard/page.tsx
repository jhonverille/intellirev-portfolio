'use client'

import { useState } from 'react'
import { auth } from '@/lib/firebase'
import { signOut } from 'firebase/auth'
import styles from './page.module.css'
import GlassCard from '@/components/ui/GlassCard'
import { LogOut, Home, Settings, LayoutGrid, MessageSquare, Quote } from 'lucide-react'
import Link from 'next/link'

// Placeholder components - implemented soon
import ProjectsManager from '@/components/admin/ProjectsManager/ProjectsManager'
import SiteSettings from '@/components/admin/SiteSettings/SiteSettings'
import InquiriesList from '@/components/admin/InquiriesList/InquiriesList'
import TestimonialsManager from '@/components/admin/TestimonialsManager/TestimonialsManager'

type Tab = 'projects' | 'settings' | 'inquiries' | 'testimonials'

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<Tab>('projects')

    const handleLogout = () => {
        signOut(auth)
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.brand}>
                    <h1>AETHER_ADMIN</h1>
                    <span className={styles.badge}>v1.0</span>
                </div>
                <div className={styles.actions}>
                    <Link href="/" className={styles.iconBtn}>
                        <Home size={20} />
                        <span>View Site</span>
                    </Link>
                    <button onClick={handleLogout} className={styles.logoutBtn}>
                        <LogOut size={16} />
                        Logout
                    </button>
                </div>
            </header>

            <div className={styles.layout}>
                <aside className={styles.sidebar}>
                    <GlassCard className={styles.navCard}>
                        <nav className={styles.nav}>
                            <button
                                className={`${styles.navItem} ${activeTab === 'projects' ? styles.active : ''}`}
                                onClick={() => setActiveTab('projects')}
                            >
                                <LayoutGrid size={20} />
                                Projects
                            </button>
                            <button
                                className={`${styles.navItem} ${activeTab === 'testimonials' ? styles.active : ''}`}
                                onClick={() => setActiveTab('testimonials')}
                            >
                                <Quote size={20} />
                                Testimonials
                            </button>
                            <button
                                className={`${styles.navItem} ${activeTab === 'settings' ? styles.active : ''}`}
                                onClick={() => setActiveTab('settings')}
                            >
                                <Settings size={20} />
                                Site Settings
                            </button>
                            <button
                                className={`${styles.navItem} ${activeTab === 'inquiries' ? styles.active : ''}`}
                                onClick={() => setActiveTab('inquiries')}
                            >
                                <MessageSquare size={20} />
                                Inquiries
                            </button>
                        </nav>
                    </GlassCard>
                </aside>

                <main className={styles.mainContent}>
                    {activeTab === 'projects' && <ProjectsManager />}
                    {activeTab === 'testimonials' && <TestimonialsManager />}
                    {activeTab === 'settings' && <SiteSettings />}
                    {activeTab === 'inquiries' && <InquiriesList />}
                </main>
            </div>
        </div>
    )
}
