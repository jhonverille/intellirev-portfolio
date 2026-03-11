'use client'

import { useState, useEffect } from 'react'
import { db, storage } from '@/lib/firebase'
import {
    collection, onSnapshot, doc, addDoc, updateDoc, deleteDoc,
    query, orderBy, serverTimestamp, Timestamp
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import GlassCard from '@/components/ui/GlassCard'
import styles from './ProjectsManager.module.css'
import {
    Plus, Pencil, Trash2, Loader2, LayoutGrid,
    X, Save, ImageIcon, CheckCircle2, AlertCircle, ExternalLink, Github
} from 'lucide-react'

interface Project {
    id: string
    title: string
    category: string
    description: string
    imageUrl: string
    liveUrl: string
    githubUrl: string
    tags: string[]
    createdAt: Timestamp | null
}

const EMPTY_FORM = {
    title: '',
    category: '',
    description: '',
    imageUrl: '',
    liveUrl: '',
    githubUrl: '',
    tags: '' // stored as comma-separated string in form, converted on save
}

export default function ProjectsManager() {
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [form, setForm] = useState(EMPTY_FORM)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string>('')
    const [uploading, setUploading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null)

    // Real-time listener
    useEffect(() => {
        const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'))
        const unsub = onSnapshot(q, (snap) => {
            const data = snap.docs.map(d => ({
                id: d.id,
                title: d.data().title || '',
                category: d.data().category || '',
                description: d.data().description || '',
                imageUrl: d.data().imageUrl || '',
                liveUrl: d.data().liveUrl || '',
                githubUrl: d.data().githubUrl || '',
                tags: d.data().tags || [],
                createdAt: d.data().createdAt || null,
            }))
            setProjects(data)
            setLoading(false)
        }, () => setLoading(false))

        return () => unsub()
    }, [])

    const openAdd = () => {
        setEditingId(null)
        setForm(EMPTY_FORM)
        setImageFile(null)
        setImagePreview('')
        setStatus(null)
        setModalOpen(true)
    }

    const openEdit = (p: Project) => {
        setEditingId(p.id)
        setForm({
            title: p.title,
            category: p.category,
            description: p.description,
            imageUrl: p.imageUrl,
            liveUrl: p.liveUrl,
            githubUrl: p.githubUrl,
            tags: p.tags.join(', ')
        })
        setImageFile(null)
        setImagePreview(p.imageUrl)
        setStatus(null)
        setModalOpen(true)
    }

    const closeModal = () => {
        setModalOpen(false)
        setEditingId(null)
        setStatus(null)
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setImageFile(file)
        const reader = new FileReader()
        reader.onloadend = () => setImagePreview(reader.result as string)
        reader.readAsDataURL(file)
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.title.trim()) return
        setSaving(true)
        setStatus(null)

        try {
            let finalImageUrl = form.imageUrl

            // Upload new image if one was selected
            if (imageFile) {
                setUploading(true)
                const storageRef = ref(storage, `project_images/${Date.now()}_${imageFile.name}`)
                const snapshot = await uploadBytes(storageRef, imageFile)
                finalImageUrl = await getDownloadURL(snapshot.ref)
                setUploading(false)
            }

            const payload = {
                title: form.title.trim(),
                category: form.category.trim(),
                description: form.description.trim(),
                imageUrl: finalImageUrl,
                liveUrl: form.liveUrl.trim(),
                githubUrl: form.githubUrl.trim(),
                tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
            }

            if (editingId) {
                await updateDoc(doc(db, 'projects', editingId), payload)
                setStatus({ type: 'success', msg: 'Project updated successfully.' })
            } else {
                await addDoc(collection(db, 'projects'), { ...payload, createdAt: serverTimestamp() })
                setStatus({ type: 'success', msg: 'Project created successfully.' })
            }

            setTimeout(() => closeModal(), 1500)
        } catch (err: any) {
            setStatus({ type: 'error', msg: err.message || 'An error occurred.' })
        } finally {
            setSaving(false)
            setUploading(false)
        }
    }

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Delete "${title}" permanently? This cannot be undone.`)) return
        await deleteDoc(doc(db, 'projects', id))
    }

    if (loading) {
        return (
            <GlassCard style={{ padding: 0 }}>
                <div className={styles.loading}>
                    <Loader2 className={styles.spinner} size={40} />
                    <p>Loading projects...</p>
                </div>
            </GlassCard>
        )
    }

    return (
        <>
            <GlassCard style={{ padding: 0 }}>
                <div className={styles.container}>

                    {/* Header */}
                    <div className={styles.header}>
                        <div className={styles.headerLeft}>
                            <h2>Projects</h2>
                            <p>{projects.length} project{projects.length !== 1 ? 's' : ''} in your portfolio.</p>
                        </div>
                        <button className={styles.addBtn} onClick={openAdd}>
                            <Plus size={18} />
                            Add Project
                        </button>
                    </div>

                    {/* Grid */}
                    <div className={styles.grid}>
                        {projects.length === 0 ? (
                            <div className={styles.empty}>
                                <LayoutGrid size={48} />
                                <p>No projects yet. Click "Add Project" to get started.</p>
                            </div>
                        ) : (
                            projects.map(p => (
                                <div key={p.id} className={styles.projectCard}>
                                    {p.imageUrl
                                        ? <img src={p.imageUrl} alt={p.title} className={styles.cardImage} />
                                        : <div className={styles.cardImagePlaceholder}>No Image</div>
                                    }
                                    <div className={styles.cardBody}>
                                        <h3 className={styles.cardTitle}>{p.title}</h3>
                                        <span className={styles.cardCategory}>{p.category}</span>
                                        {p.description && <p className={styles.cardDesc}>{p.description}</p>}
                                        {p.tags.length > 0 && (
                                            <div className={styles.cardTags}>
                                                {p.tags.slice(0, 4).map((tag, i) => (
                                                    <span key={i} className={styles.tag}>{tag}</span>
                                                ))}
                                                {p.tags.length > 4 && (
                                                    <span className={styles.tag}>+{p.tags.length - 4}</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div className={styles.cardActions}>
                                        <button className={styles.editBtn} onClick={() => openEdit(p)}>
                                            <Pencil size={14} /> Edit
                                        </button>
                                        {p.liveUrl && (
                                            <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className={styles.editBtn} style={{ textDecoration: 'none' }}>
                                                <ExternalLink size={14} />
                                            </a>
                                        )}
                                        {p.githubUrl && (
                                            <a href={p.githubUrl} target="_blank" rel="noopener noreferrer" className={styles.editBtn} style={{ textDecoration: 'none' }}>
                                                <Github size={14} />
                                            </a>
                                        )}
                                        <button className={styles.deleteBtn} onClick={() => handleDelete(p.id, p.title)}>
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </GlassCard>

            {/* ─── Modal ─── */}
            {modalOpen && (
                <div className={styles.overlay} onClick={(e) => { if (e.target === e.currentTarget) closeModal() }}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <h3>{editingId ? 'EDIT PROJECT' : 'NEW PROJECT'}</h3>
                            <button className={styles.closeBtn} onClick={closeModal}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className={styles.form}>
                            {/* Row 1: Title + Category */}
                            <div className={styles.row}>
                                <div className={styles.inputGroup}>
                                    <label>Title *</label>
                                    <input
                                        className={styles.inputField}
                                        type="text"
                                        placeholder="e.g. Nexus AI"
                                        value={form.title}
                                        onChange={e => setForm({ ...form, title: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label>Category</label>
                                    <input
                                        className={styles.inputField}
                                        type="text"
                                        placeholder="e.g. Web Application"
                                        value={form.category}
                                        onChange={e => setForm({ ...form, category: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div className={styles.inputGroup}>
                                <label>Description</label>
                                <textarea
                                    className={styles.textareaField}
                                    placeholder="Brief overview of the project..."
                                    value={form.description}
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                />
                            </div>

                            {/* Image Upload */}
                            <div className={styles.inputGroup}>
                                <label>Project Image</label>
                                <div className={styles.imageUploadArea}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                    />
                                    {uploading ? (
                                        <div className={styles.uploadingOverlay}>
                                            <Loader2 size={20} className={styles.spin} />
                                            Uploading...
                                        </div>
                                    ) : imagePreview ? (
                                        <img src={imagePreview} alt="Preview" className={styles.imagePreview} />
                                    ) : (
                                        <div className={styles.uploadHint}>
                                            <ImageIcon size={28} />
                                            <span>Click or drag to upload an image</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Row: Links */}
                            <div className={styles.row}>
                                <div className={styles.inputGroup}>
                                    <label>Live URL</label>
                                    <input
                                        className={styles.inputField}
                                        type="url"
                                        placeholder="https://..."
                                        value={form.liveUrl}
                                        onChange={e => setForm({ ...form, liveUrl: e.target.value })}
                                    />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label>GitHub URL</label>
                                    <input
                                        className={styles.inputField}
                                        type="url"
                                        placeholder="https://github.com/..."
                                        value={form.githubUrl}
                                        onChange={e => setForm({ ...form, githubUrl: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Tags */}
                            <div className={styles.inputGroup}>
                                <label>Tech Stack / Tags (comma-separated)</label>
                                <input
                                    className={styles.inputField}
                                    type="text"
                                    placeholder="e.g. React, Next.js, Firebase, TypeScript"
                                    value={form.tags}
                                    onChange={e => setForm({ ...form, tags: e.target.value })}
                                />
                            </div>

                            {/* Status */}
                            {status && (
                                <div className={`${styles.statusMsg} ${styles[status.type]}`}>
                                    {status.type === 'success'
                                        ? <CheckCircle2 size={16} />
                                        : <AlertCircle size={16} />
                                    }
                                    {status.msg}
                                </div>
                            )}

                            {/* Footer */}
                            <div className={styles.modalFooter}>
                                <button type="button" className={styles.cancelBtn} onClick={closeModal}>
                                    Cancel
                                </button>
                                <button type="submit" className={styles.saveBtn} disabled={saving || uploading}>
                                    {saving
                                        ? <><Loader2 size={16} className={styles.spin} /> Saving...</>
                                        : <><Save size={16} /> {editingId ? 'Update Project' : 'Create Project'}</>
                                    }
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}
