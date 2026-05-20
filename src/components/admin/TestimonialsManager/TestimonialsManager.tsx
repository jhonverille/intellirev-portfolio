'use client'

import { useState, useEffect } from 'react'
import { db, storage } from '@/lib/firebase'
import {
    collection, onSnapshot, doc, addDoc, updateDoc, deleteDoc,
    query, orderBy, serverTimestamp, Timestamp
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import GlassCard from '@/components/ui/GlassCard'
import styles from './TestimonialsManager.module.css'
import {
    Plus, Pencil, Trash2, Loader2, Quote,
    X, Save, CheckCircle2, AlertCircle, User, Upload
} from 'lucide-react'

interface Testimony {
    id: string
    name: string
    role: string
    content: string
    avatar?: string
    createdAt?: Timestamp | null
}

const EMPTY_FORM = {
    name: '',
    role: '',
    content: '',
    avatar: ''
}

export default function TestimonialsManager() {
    const [testimonials, setTestimonials] = useState<Testimony[]>([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [form, setForm] = useState(EMPTY_FORM)
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)

    // Cleanup object URLs to prevent memory leaks
    useEffect(() => {
        return () => {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview)
            }
        }
    }, [imagePreview])

    useEffect(() => {
        const q = query(collection(db, 'testimonials'), orderBy('createdAt', 'desc'))
        const unsub = onSnapshot(q, (snap) => {
            const data = snap.docs.map(d => ({
                id: d.id,
                ...d.data()
            } as Testimony))
            setTestimonials(data)
            setLoading(false)
        }, (err) => {
            console.error("Testimonials fetch error:", err)
            setLoading(false)
        })
        return () => unsub()
    }, [])

    const openModal = (testimony?: Testimony) => {
        if (testimony) {
            setEditingId(testimony.id)
            setForm({
                name: testimony.name,
                role: testimony.role,
                content: testimony.content,
                avatar: testimony.avatar || ''
            })
        } else {
            setEditingId(null)
            setForm(EMPTY_FORM)
        }
        setImageFile(null)
        setImagePreview(null)
        setModalOpen(true)
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            setImageFile(file)
            setImagePreview(URL.createObjectURL(file))
        }
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setStatus(null)

        try {
            let finalAvatarUrl = form.avatar

            if (imageFile) {
                setUploading(true)
                const storageRef = ref(storage, `testimonials_avatars/${Date.now()}_${imageFile.name}`)
                const snapshot = await uploadBytes(storageRef, imageFile)
                finalAvatarUrl = await getDownloadURL(snapshot.ref)
                setUploading(false)
            }

            const data = {
                ...form,
                avatar: finalAvatarUrl,
                updatedAt: serverTimestamp(),
                createdAt: editingId ? (testimonials.find(t => t.id === editingId)?.createdAt || serverTimestamp()) : serverTimestamp()
            }

            if (editingId) {
                await updateDoc(doc(db, 'testimonials', editingId), data)
                setStatus({ type: 'success', msg: 'Testimony updated successfully!' })
            } else {
                await addDoc(collection(db, 'testimonials'), data)
                setStatus({ type: 'success', msg: 'Testimony added successfully!' })
            }

            setTimeout(() => {
                setModalOpen(false)
                setStatus(null)
            }, 1000)
        } catch (err: any) {
            setStatus({ type: 'error', msg: err.message })
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this testimony?')) return
        try {
            await deleteDoc(doc(db, 'testimonials', id))
        } catch (err) {
            console.error("Delete error:", err)
        }
    }

    if (loading) {
        return (
            <div className={styles.loading}>
                <Loader2 className={styles.spinner} size={40} />
                <p>Establishing neural link to feedback hub...</p>
            </div>
        )
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <h2>Testimonials Manager</h2>
                    <p>Curate the voices of those who have experienced your work.</p>
                </div>
                <button className={styles.addBtn} onClick={() => openModal()}>
                    <Plus size={18} /> Add Testimony
                </button>
            </div>

            <div className={styles.grid}>
                {testimonials.map(t => (
                    <GlassCard key={t.id} className={styles.card}>
                        <div className={styles.cardInfo}>
                            <div className={styles.userRow}>
                                <div className={styles.avatar}>
                                    {t.avatar ? <img src={t.avatar} alt="" /> : <User size={20} />}
                                </div>
                                <div className={styles.meta}>
                                    <h3>{t.name}</h3>
                                    <span>{t.role}</span>
                                </div>
                            </div>
                            <p className={styles.content}>"{t.content}"</p>
                        </div>
                        <div className={styles.cardActions}>
                            <button onClick={() => openModal(t)} className={styles.editBtn}>
                                <Pencil size={16} />
                            </button>
                            <button onClick={() => handleDelete(t.id)} className={styles.deleteBtn}>
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </GlassCard>
                ))}
            </div>

            {modalOpen && (
                <div className={styles.overlay}>
                    <GlassCard className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <h3>{editingId ? 'Edit Testimony' : 'New Testimony'}</h3>
                            <button onClick={() => setModalOpen(false)}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSave} className={styles.form}>
                            <div className={styles.inputGroup}>
                                <label>Client Name</label>
                                <input
                                    required
                                    type="text"
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label>Role / Company</label>
                                <input
                                    required
                                    type="text"
                                    value={form.role}
                                    onChange={e => setForm({ ...form, role: e.target.value })}
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label>Testimony Content</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={form.content}
                                    onChange={e => setForm({ ...form, content: e.target.value })}
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label>Avatar Profile Picture</label>
                                <div className={styles.imageUploadArea}>
                                    {uploading && (
                                        <div className={styles.uploadingOverlay}>
                                            Uploading...
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className={styles.fileInput}
                                        disabled={uploading || saving}
                                    />
                                    {(imagePreview || form.avatar) ? (
                                        <img 
                                            src={imagePreview || form.avatar} 
                                            alt="Avatar Preview" 
                                            className={styles.imagePreview}
                                        />
                                    ) : (
                                        <Upload size={24} className={styles.uploadIcon} />
                                    )}
                                    <div className={styles.uploadHint}>
                                        <span>Click or drag to upload image</span>
                                        <small>JPEG, PNG, WebP</small>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.formFooter}>
                                {status && (
                                    <div className={`${styles.status} ${styles[status.type]}`}>
                                        {status.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                                        {status.msg}
                                    </div>
                                )}
                                <button type="submit" disabled={saving || uploading} className={styles.saveBtn}>
                                    {(saving || uploading) ? <Loader2 className={styles.spinner} size={18} /> : <Save size={18} />}
                                    {editingId ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </GlassCard>
                </div>
            )}
        </div>
    )
}
