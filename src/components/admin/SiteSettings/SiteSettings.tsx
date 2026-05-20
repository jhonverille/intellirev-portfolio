'use client'

import { useState, useEffect, useRef } from 'react'
import { db, storage } from '@/lib/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import GlassCard from '@/components/ui/GlassCard'
import styles from './SiteSettings.module.css'
import { Save, Globe, Mail, Share2, Info, Loader2, CheckCircle2, AlertCircle, Cpu, Plus, X, Upload, Image as ImageIcon } from 'lucide-react'

interface Tool {
    name: string;
    logoUrl: string;
}

// Revision: 1.1.0 - Tool Logo Support
export default function SiteSettings() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)

    // UI state for adding new tool
    const [newToolName, setNewToolName] = useState('')
    const [newToolLogo, setNewToolLogo] = useState<File | null>(null)
    const [logoPreview, setLogoPreview] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [settings, setSettings] = useState({
        heroHeadline: '',
        heroSubheadline: '',
        contactEmail: '',
        contactPhone: '',
        socialX: '',
        socialFacebook: '',
        socialLinkedIn: '',
        socialInstagram: '',
        showPhilippinesFlag: true,
        tools: [] as Tool[]
    })

    useEffect(() => {
        async function fetchSettings() {
            try {
                const docRef = doc(db, 'site_settings', 'general')
                const docSnap = await getDoc(docRef)

                if (docSnap.exists()) {
                    const data = docSnap.data()
                    // Data Migration: Normalize tools to array of objects
                    if (data.tools && Array.isArray(data.tools)) {
                        data.tools = data.tools.map(t =>
                            typeof t === 'string' ? { name: t, logoUrl: '' } : t
                        )
                    }
                    if (data.showPhilippinesFlag === undefined) {
                        data.showPhilippinesFlag = true;
                    }
                    setSettings(prev => ({ ...prev, ...data }))
                }
            } catch (error) {
                console.error("Error fetching settings:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchSettings()
    }, [])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setNewToolLogo(file)
            const reader = new FileReader()
            reader.onloadend = () => setLogoPreview(reader.result as string)
            reader.readAsDataURL(file)
        }
    }

    const addTool = async () => {
        if (!newToolName.trim()) return

        let logoUrl = ''
        if (newToolLogo) {
            setUploading(true)
            try {
                const storageRef = ref(storage, `tools_logos/${Date.now()}_${newToolLogo.name}`)
                const snapshot = await uploadBytes(storageRef, newToolLogo)
                logoUrl = await getDownloadURL(snapshot.ref)
            } catch (err) {
                console.error("Upload error:", err)
            } finally {
                setUploading(false)
            }
        }

        const newTool: Tool = { name: newToolName.trim(), logoUrl }
        setSettings({ ...settings, tools: [...settings.tools, newTool] })

        // Reset adding state
        setNewToolName('')
        setNewToolLogo(null)
        setLogoPreview(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setStatus(null)

        try {
            // First, if there's a pending tool name, add it automatically
            const finalTools = [...settings.tools]
            if (newToolName.trim()) {
                console.log("Auto-adding pending tool:", newToolName)

                let logoUrl = ''
                if (newToolLogo) {
                    try {
                        const storageRef = ref(storage, `tools_logos/${Date.now()}_${newToolLogo.name}`)
                        const snapshot = await uploadBytes(storageRef, newToolLogo)
                        logoUrl = await getDownloadURL(snapshot.ref)
                    } catch (err) {
                        console.error("Auto-add logo upload error:", err)
                    }
                }
                finalTools.push({ name: newToolName.trim(), logoUrl })

                // Update local state for UI consistency
                setSettings(prev => ({ ...prev, tools: finalTools }))
                setNewToolName('')
                setNewToolLogo(null)
                setLogoPreview(null)
            }

            const docRef = doc(db, 'site_settings', 'general')
            const finalData = { ...settings, tools: finalTools }
            console.log("Synchronizing with Nexus:", finalData)

            await setDoc(docRef, finalData, { merge: true })
            setStatus({ type: 'success', message: 'Configuration synchronized successfully.' })
            setTimeout(() => setStatus(null), 4000)
        } catch (error: any) {
            console.error("Error saving settings:", error)
            setStatus({ type: 'error', message: `Nexus error: ${error.message}` })
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className={styles.loadingState}>
                <Loader2 className={styles.spinner} size={40} />
                <p>Establishing connection to database...</p>
            </div>
        )
    }

    return (
        <GlassCard style={{ padding: '0' }} className={styles.mainCard}>
            <div className={styles.container}>
                <header className={styles.header}>
                    <h2>Site Configuration</h2>
                    <p>Manage global variables and core brand identifiers.</p>
                </header>

                <form onSubmit={handleSave} className={styles.form}>
                    {/* Hero Content Section */}
                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <Globe size={18} />
                            <span>Primary Brand Copy</span>
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Main Headline</label>
                            <input
                                className={styles.inputField}
                                type="text"
                                value={settings.heroHeadline}
                                onChange={(e) => setSettings({ ...settings, heroHeadline: e.target.value })}
                                placeholder="e.g. FRONTEND ARCHITECT"
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Sub-headline / Mission Statement</label>
                            <textarea
                                className={styles.textareaField}
                                value={settings.heroSubheadline}
                                onChange={(e) => setSettings({ ...settings, heroSubheadline: e.target.value })}
                                placeholder="Describe your core expertise..."
                            />
                        </div>
                        <div className={styles.inputGroup} style={{ flexDirection: 'row', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
                            <div
                                style={{
                                    width: '40px',
                                    height: '24px',
                                    borderRadius: '12px',
                                    backgroundColor: settings.showPhilippinesFlag ? '#66BB6A' : '#333',
                                    position: 'relative',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.3s'
                                }}
                                onClick={() => setSettings({ ...settings, showPhilippinesFlag: !settings.showPhilippinesFlag })}
                            >
                                <div style={{
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '50%',
                                    backgroundColor: 'white',
                                    position: 'absolute',
                                    top: '2px',
                                    left: settings.showPhilippinesFlag ? '18px' : '2px',
                                    transition: 'left 0.3s'
                                }} />
                            </div>
                            <label style={{ margin: 0, cursor: 'pointer' }} onClick={() => setSettings({ ...settings, showPhilippinesFlag: !settings.showPhilippinesFlag })}>
                                Append "From Philippines" flag design to Hero Headline
                            </label>
                        </div>
                    </section>

                    {/* Contact Info Section */}
                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <Mail size={18} />
                            <span>Communication Channels</span>
                        </div>
                        <div className={styles.grid}>
                            <div className={styles.inputGroup}>
                                <label>Public Email</label>
                                <input
                                    className={styles.inputField}
                                    type="email"
                                    value={settings.contactEmail}
                                    onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Business Phone</label>
                                <input
                                    className={styles.inputField}
                                    type="text"
                                    value={settings.contactPhone}
                                    onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Social Media Section */}
                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <Share2 size={18} />
                            <span>Social Proximity</span>
                        </div>
                        <div className={styles.grid}>
                            <div className={styles.inputGroup}>
                                <label>X (Twitter) Link</label>
                                <input
                                    className={styles.inputField}
                                    type="text"
                                    value={settings.socialX}
                                    onChange={(e) => setSettings({ ...settings, socialX: e.target.value })}
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>LinkedIn Profile</label>
                                <input
                                    className={styles.inputField}
                                    type="text"
                                    value={settings.socialLinkedIn}
                                    onChange={(e) => setSettings({ ...settings, socialLinkedIn: e.target.value })}
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Instagram URL</label>
                                <input
                                    className={styles.inputField}
                                    type="text"
                                    value={settings.socialInstagram}
                                    onChange={(e) => setSettings({ ...settings, socialInstagram: e.target.value })}
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Facebook Page</label>
                                <input
                                    className={styles.inputField}
                                    type="text"
                                    value={settings.socialFacebook}
                                    onChange={(e) => setSettings({ ...settings, socialFacebook: e.target.value })}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Tools Section */}
                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <Cpu size={18} />
                            <span>Tools & Technologies</span>
                        </div>
                        <div className={styles.toolsContainer}>
                            <div className={styles.toolsGrid}>
                                {settings.tools.map((tool, index) => (
                                    <div key={index} className={styles.toolTag}>
                                        {tool.logoUrl && <img src={tool.logoUrl} alt="" className={styles.toolLogo} />}
                                        <span>{tool.name}</span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newTools = [...settings.tools];
                                                newTools.splice(index, 1);
                                                setSettings({ ...settings, tools: newTools });
                                            }}
                                            className={styles.removeTool}
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className={styles.addToolContainer}>
                                <div className={styles.addToolGroup}>
                                    <input
                                        type="text"
                                        placeholder="Tool name (e.g. n8n)"
                                        className={styles.inputField}
                                        value={newToolName}
                                        onChange={(e) => setNewToolName(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                addTool();
                                            }
                                        }}
                                    />

                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        style={{ display: 'none' }}
                                        accept="image/*"
                                    />

                                    <button
                                        type="button"
                                        className={`${styles.iconUploadBtn} ${logoPreview ? styles.hasPreview : ''}`}
                                        onClick={() => fileInputRef.current?.click()}
                                        title="Upload Logo"
                                    >
                                        {logoPreview ? (
                                            <img src={logoPreview} alt="Preview" className={styles.previewImg} />
                                        ) : (
                                            <ImageIcon size={18} />
                                        )}
                                    </button>

                                    <button
                                        type="button"
                                        className={styles.addBtn}
                                        disabled={uploading || !newToolName}
                                        onClick={addTool}
                                    >
                                        {uploading ? <Loader2 className={styles.spin} size={18} /> : <Plus size={18} />}
                                    </button>
                                </div>
                                {newToolLogo && <span className={styles.fileName}>{newToolLogo.name}</span>}
                            </div>
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
                                <><Loader2 className={styles.btnSpinner} size={18} /> Syncing...</>
                            ) : (
                                <><Save size={18} /> Commit Changes</>
                            )}
                        </button>
                    </footer>
                </form>
            </div>
        </GlassCard>
    )
}
