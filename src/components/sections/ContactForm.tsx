'use client'

import { useState } from 'react'
import styles from './ContactForm.module.css'
import GlassCard from '../ui/GlassCard'
import SectionHeader from '../ui/SectionHeader'
import { Send, CheckCircle2, Instagram, Linkedin, Facebook, Twitter as X } from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore'
import { useEffect } from 'react'

export default function ContactForm() {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    })

    const [settings, setSettings] = useState({
        contactEmail: 'fazeel@gmail.com',
        contactPhone: '123-456-7890',
        socialX: '#',
        socialFacebook: '#',
        socialLinkedIn: '#',
        socialInstagram: '#'
    })

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const docRef = doc(db, 'site_settings', 'general')
                const docSnap = await getDoc(docRef)
                if (docSnap.exists()) {
                    setSettings(prev => ({ ...prev, ...docSnap.data() }))
                }
            } catch (err) {
                console.warn("Could not fetch site settings, using defaults.")
            }
        }
        fetchSettings()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setStatus('loading')

        try {
            if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
                await addDoc(collection(db, 'inquiries'), {
                    ...formData,
                    createdAt: serverTimestamp()
                })
            } else {
                console.warn("Firebase not configured. Simulating success.")
                await new Promise(resolve => setTimeout(resolve, 1500))
            }
            setStatus('success')
            setFormData({ name: '', email: '', message: '' })
        } catch (error) {
            console.error("Submission error:", error)
            setStatus('error')
        }
    }

    return (
        <section className={styles.container} id="contact">
            <SectionHeader
                subtitle="Get in Touch"
                title="Let's Talk"
            />

            <GlassCard className={styles.formCard}>

                {status === 'success' ? (
                    <div className={styles.success}>
                        <CheckCircle2 size={48} color="var(--accent-cyan)" />
                        <h3>Transmission Received!</h3>
                        <p>I'll get back to you across the digital void shortly.</p>
                        <button onClick={() => setStatus('idle')} className={styles.btn}>Send another</button>
                    </div>
                ) : (
                    <div className={styles.cardContent}>
                        <form onSubmit={handleSubmit} className={styles.form}>
                            {status === 'error' && (
                                <p className={styles.errorMessage}>
                                    An error occurred. Please try again or email me directly.
                                </p>
                            )}

                            <div className={styles.inputGroup}>
                                <label htmlFor="name">Full Name</label>
                                <input
                                    id="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label htmlFor="email">Email</label>
                                <input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label htmlFor="message">Message</label>
                                <textarea
                                    id="message"
                                    rows={1}
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    required
                                />
                            </div>

                            <button type="submit" className={styles.btn} disabled={status === 'loading'}>
                                {status === 'loading' ? 'Sending...' : 'Send'}
                            </button>
                        </form>

                        <div className={styles.sidebar}>
                            <div className={styles.sidebarItem}>
                                <h4>Contact</h4>
                                <p className="text-highlight">{settings.contactEmail}</p>
                            </div>

                            <div className={styles.sidebarItem}>
                                <h4>Call</h4>
                                <p className="text-highlight">{settings.contactPhone}</p>
                            </div>

                            <div className={styles.socials}>
                                <a href={settings.socialX} className={styles.socialLink} aria-label="X" target="_blank" rel="noopener noreferrer"><X size={20} /></a>
                                <a href={settings.socialFacebook} className={styles.socialLink} aria-label="Facebook" target="_blank" rel="noopener noreferrer"><Facebook size={20} /></a>
                                <a href={settings.socialLinkedIn} className={styles.socialLink} aria-label="LinkedIn" target="_blank" rel="noopener noreferrer"><Linkedin size={20} /></a>
                                <a href={settings.socialInstagram} className={styles.socialLink} aria-label="Instagram" target="_blank" rel="noopener noreferrer"><Instagram size={20} /></a>
                            </div>
                        </div>
                    </div>
                )}
            </GlassCard>
        </section>
    )
}


