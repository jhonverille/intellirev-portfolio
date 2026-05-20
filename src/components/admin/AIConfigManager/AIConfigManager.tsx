'use client'

import { useState, useEffect } from 'react'
import { db } from '@/lib/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import GlassCard from '@/components/ui/GlassCard'
import styles from './AIConfigManager.module.css'
import { Save, Bot, MessageSquare, Info, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

const DEFAULT_MODEL = 'openai/gpt-4o-mini'

export default function AIConfigManager() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)

    const [config, setConfig] = useState({
        model: DEFAULT_MODEL,
        systemPromptOverride: '',
        temperature: 0.7,
        maxTokens: 1000
    })

    useEffect(() => {
        async function fetchConfig() {
            try {
                const docRef = doc(db, 'site_settings', 'ai')
                const docSnap = await getDoc(docRef)

                if (docSnap.exists()) {
                    setConfig(prev => ({ ...prev, ...docSnap.data() }))
                }
            } catch (error) {
                console.error("Error fetching AI config:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchConfig()
    }, [])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setStatus(null)

        try {
            const docRef = doc(db, 'site_settings', 'ai')
            await setDoc(docRef, config, { merge: true })
            setStatus({ type: 'success', message: 'AI Core updated and synchronized.' })
            setTimeout(() => setStatus(null), 4000)
        } catch (error: any) {
            console.error("Error saving AI config:", error)
            setStatus({ type: 'error', message: `Sync failed: ${error.message}` })
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className={styles.loadingState}>
                <Loader2 className={styles.spinner} size={40} />
                <p>Initializing AI Neural Interface...</p>
            </div>
        )
    }

    return (
        <GlassCard style={{ padding: '0' }} className={styles.mainCard}>
            <div className={styles.container}>
                <header className={styles.header}>
                    <h2>AI Bot Configuration</h2>
                    <p>Fine-tune the intelligence and personality of your portfolio's digital twin.</p>
                </header>

                <form onSubmit={handleSave} className={styles.form}>
                    {/* Brain Model section removed as per user request */}

                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <Bot size={18} />
                            <span>Personality & Core Instructions</span>
                        </div>
                        <div className={styles.inputGroup}>
                            <label>System Prompt Override / Additional Instructions</label>
                            <textarea
                                className={styles.textareaField}
                                value={config.systemPromptOverride}
                                onChange={(e) => setConfig({ ...config, systemPromptOverride: e.target.value })}
                                placeholder="Example: You are very formal and professional. Focus specifically on my architectural experience..."
                            />
                            <p className={styles.infoText}>
                                <Info size={12} /> These instructions are appended to the base system prompt to refine behavior.
                            </p>
                        </div>
                    </section>

                    <footer className={styles.footer}>
                        <div className={styles.statusSection}>
                            {status && (
                                <div className={`${styles.statusMessage} ${styles[status.type]}`}>
                                    {status.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                                    {status.message}
                                </div>
                            )}
                        </div>
                        <button
                            type="submit"
                            disabled={saving}
                            className={styles.saveBtn}
                        >
                            {saving ? (
                                <><Loader2 className={styles.btnSpinner} size={18} /> Updating Neural Core...</>
                            ) : (
                                <><Save size={18} /> Save AI Settings</>
                            )}
                        </button>
                    </footer>
                </form>
            </div>
        </GlassCard>
    )
}
