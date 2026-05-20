'use client'

import { useEffect, useState, useRef } from 'react'
import styles from './Profile.module.css'
import { db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { FileText, Github, Linkedin } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function Profile() {
    const sectionRef = useRef<HTMLElement>(null)
    const [isLoaded, setIsLoaded] = useState(false)
    const [settings, setSettings] = useState({
        name: 'Jhon Verille Alterado',
        bio: 'I specialize in architecting autonomous ecosystems and intelligent workflows that transform complex processes into seamless digital experiences.',
        profileImageUrl: '',
        resumeUrl: '#',
        githubUrl: '#',
        linkedinUrl: '#'
    })

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const docRef = doc(db, 'site_settings', 'profile')
                const docSnap = await getDoc(docRef)
                
                if (docSnap.exists()) {
                    const data = docSnap.data()
                    setSettings(prev => ({
                        name: data.name || prev.name,
                        bio: data.bio || prev.bio,
                        profileImageUrl: data.profileImageUrl || prev.profileImageUrl,
                        resumeUrl: data.resumeUrl || prev.resumeUrl,
                        githubUrl: data.githubUrl || prev.githubUrl,
                        linkedinUrl: data.linkedinUrl || prev.linkedinUrl
                    }))
                }
            } catch (err) {
                console.error("Failed to fetch profile settings:", err)
            } finally {
                setIsLoaded(true)
            }
        }
        
        fetchProfile()
    }, [])

    useEffect(() => {
        if (!isLoaded || !sectionRef.current) return;
        const ctx = gsap.context(() => {
            gsap.fromTo(`.${styles.content}`, 
                { opacity: 0, y: 30 },
                {
                    opacity: 1, 
                    y: 0, 
                    duration: 1, 
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: "top 80%"
                    }
                }
            )
        }, sectionRef)
        return () => ctx.revert()
    }, [isLoaded])

    return (
        <section className={styles.container} id="profile" ref={sectionRef}>
            <div className={styles.content}>
                <div className={styles.textContent}>
                    <span className={styles.greeting}>Hi, I'm</span>
                    <h2 className={styles.headline}>{settings.name}</h2>
                    <p className={styles.bio}>{settings.bio}</p>
                    
                    <div className={styles.actions}>
                        <a href={settings.resumeUrl} target="_blank" rel="noopener noreferrer" className={styles.primaryBtn}>
                            <FileText size={18} />
                            Download Resume
                        </a>
                        <a href={settings.linkedinUrl} target="_blank" rel="noopener noreferrer" className={styles.socialBtn} aria-label="LinkedIn">
                            <Linkedin size={20} />
                        </a>
                        <a href={settings.githubUrl} target="_blank" rel="noopener noreferrer" className={styles.socialBtn} aria-label="GitHub">
                            <Github size={20} />
                        </a>
                    </div>
                </div>

                <div className={styles.imageContent}>
                    <div className={styles.glowEffect}></div>
                    <div className={styles.imageWrapper}>
                        {settings.profileImageUrl ? (
                            <img src={settings.profileImageUrl} alt={settings.name} className={styles.profileImage} />
                        ) : (
                            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, rgba(66, 165, 245, 0.2) 0%, rgba(26, 26, 46, 0.8) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ fontSize: '4rem', opacity: 0.5 }}>JV</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}
