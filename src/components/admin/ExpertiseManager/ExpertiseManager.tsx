'use client'

import { useState, useEffect, useRef } from 'react'
import { db } from '@/lib/firebase'
import {
    collection, onSnapshot, doc, addDoc, updateDoc,
    deleteDoc, query, orderBy, serverTimestamp
} from 'firebase/firestore'
import GlassCard from '@/components/ui/GlassCard'
import styles from './ExpertiseManager.module.css'
import {
    Plus, Pencil, Trash2, Loader2, Layers,
    X, Save, CheckCircle2, AlertCircle, ChevronUp, ChevronDown, ChevronDown as ChevronDownIcon
} from 'lucide-react'

interface SkillGroup {
    id: string
    name: string
    icon: string
    skills: string[]
    order: number
}

const EMPTY_FORM = {
    name: '',
    icon: 'Layers',
    skills: '',
    order: 0,
}

const ICON_OPTIONS = [
    'Globe', 'Database', 'Cpu', 'Layers', 'Code', 'Terminal',
    'Zap', 'Star', 'Box', 'Cloud', 'Lock', 'Smartphone'
]

export default function ExpertiseManager() {
    const [groups, setGroups] = useState<SkillGroup[]>([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [form, setForm] = useState(EMPTY_FORM)
    const [saving, setSaving] = useState(false)
    const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null)
    const [iconDropOpen, setIconDropOpen] = useState(false)
    const iconDropRef = useRef<HTMLDivElement>(null)

    // Close icon dropdown when clicking outside
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (iconDropRef.current && !iconDropRef.current.contains(e.target as Node)) {
                setIconDropOpen(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    useEffect(() => {
        const q = query(collection(db, 'expertise'), orderBy('order', 'asc'))
        const unsub = onSnapshot(q, (snap) => {
            const data = snap.docs.map(d => ({
                id: d.id,
                name: d.data().name || '',
                icon: d.data().icon || 'Layers',
                skills: d.data().skills || [],
                order: d.data().order ?? 0,
            }))
            setGroups(data)
            setLoading(false)
        }, () => setLoading(false))
        return () => unsub()
    }, [])

    const openAdd = () => {
        setEditingId(null)
        setForm({ ...EMPTY_FORM, order: groups.length })
        setStatus(null)
        setModalOpen(true)
    }

    const openEdit = (g: SkillGroup) => {
        setEditingId(g.id)
        setForm({
            name: g.name,
            icon: g.icon,
            skills: g.skills.join(', '),
            order: g.order,
        })
        setStatus(null)
        setModalOpen(true)
    }

    const closeModal = () => {
        setModalOpen(false)
        setEditingId(null)
        setStatus(null)
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.name.trim()) return
        setSaving(true)
        setStatus(null)

        try {
            const payload = {
                name: form.name.trim(),
                icon: form.icon,
                skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
                order: Number(form.order),
            }

            if (editingId) {
                await updateDoc(doc(db, 'expertise', editingId), payload)
                setStatus({ type: 'success', msg: 'Skill group updated.' })
            } else {
                await addDoc(collection(db, 'expertise'), { ...payload, createdAt: serverTimestamp() })
                setStatus({ type: 'success', msg: 'Skill group created.' })
            }
            setTimeout(() => closeModal(), 1200)
        } catch (err: any) {
            setStatus({ type: 'error', msg: err.message || 'An error occurred.' })
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Delete "${name}" permanently?`)) return
        await deleteDoc(doc(db, 'expertise', id))
    }

    const moveOrder = async (index: number, direction: 'up' | 'down') => {
        const target = direction === 'up' ? index - 1 : index + 1
        if (target < 0 || target >= groups.length) return
        const a = groups[index]
        const b = groups[target]
        await updateDoc(doc(db, 'expertise', a.id), { order: b.order })
        await updateDoc(doc(db, 'expertise', b.id), { order: a.order })
    }

    if (loading) {
        return (
            <GlassCard style={{ padding: 0 }}>
                <div className={styles.loading}>
                    <Loader2 className={styles.spinner} size={40} />
                    <p>Loading expertise...</p>
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
                            <h2>Expertise</h2>
                            <p>{groups.length} skill group{groups.length !== 1 ? 's' : ''} on the site.</p>
                        </div>
                        <button className={styles.addBtn} onClick={openAdd}>
                            <Plus size={18} />
                            Add Group
                        </button>
                    </div>

                    {/* List */}
                    <div className={styles.list}>
                        {groups.length === 0 ? (
                            <div className={styles.empty}>
                                <Layers size={48} />
                                <p>No skill groups yet. Click "Add Group" to get started.</p>
                            </div>
                        ) : (
                            groups.map((g, index) => (
                                <div key={g.id} className={styles.groupRow}>
                                    <div className={styles.orderBtns}>
                                        <button
                                            className={styles.orderBtn}
                                            onClick={() => moveOrder(index, 'up')}
                                            disabled={index === 0}
                                        >
                                            <ChevronUp size={14} />
                                        </button>
                                        <button
                                            className={styles.orderBtn}
                                            onClick={() => moveOrder(index, 'down')}
                                            disabled={index === groups.length - 1}
                                        >
                                            <ChevronDown size={14} />
                                        </button>
                                    </div>

                                    <div className={styles.groupInfo}>
                                        <div className={styles.groupMeta}>
                                            <span className={styles.iconBadge}>{g.icon}</span>
                                            <h3 className={styles.groupName}>{g.name}</h3>
                                        </div>
                                        <div className={styles.skillPills}>
                                            {g.skills.map((skill, i) => (
                                                <span key={i} className={styles.skillPill}>{skill}</span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className={styles.rowActions}>
                                        <button className={styles.editBtn} onClick={() => openEdit(g)}>
                                            <Pencil size={14} /> Edit
                                        </button>
                                        <button className={styles.deleteBtn} onClick={() => handleDelete(g.id, g.name)}>
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </GlassCard>

            {/* Modal */}
            {modalOpen && (
                <div className={styles.overlay} onClick={(e) => { if (e.target === e.currentTarget) closeModal() }}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <h3>{editingId ? 'EDIT SKILL GROUP' : 'NEW SKILL GROUP'}</h3>
                            <button className={styles.closeBtn} onClick={closeModal}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className={styles.form}>
                            {/* Name */}
                            <div className={styles.inputGroup}>
                                <label>Group Name *</label>
                                <input
                                    className={styles.inputField}
                                    type="text"
                                    placeholder="e.g. Frontend Forge"
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    required
                                />
                            </div>

                            {/* Icon - Custom Dropdown */}
                            <div className={styles.inputGroup}>
                                <label>Icon</label>
                                <div ref={iconDropRef} className={styles.customSelect}>
                                    <button
                                        type="button"
                                        className={styles.customSelectTrigger}
                                        onClick={() => setIconDropOpen(o => !o)}
                                    >
                                        <span>{form.icon}</span>
                                        <ChevronDownIcon size={14} className={iconDropOpen ? styles.chevronOpen : ''} />
                                    </button>
                                    {iconDropOpen && (
                                        <div className={styles.customSelectList}>
                                            {ICON_OPTIONS.map(icon => (
                                                <button
                                                    key={icon}
                                                    type="button"
                                                    className={`${styles.customSelectOption} ${form.icon === icon ? styles.selected : ''}`}
                                                    onClick={() => { setForm({ ...form, icon }); setIconDropOpen(false) }}
                                                >
                                                    {icon}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Skills */}
                            <div className={styles.inputGroup}>
                                <label>Skills (comma-separated)</label>
                                <textarea
                                    className={styles.textareaField}
                                    placeholder="e.g. React, Next.js, TypeScript, GSAP"
                                    value={form.skills}
                                    onChange={e => setForm({ ...form, skills: e.target.value })}
                                    rows={3}
                                />
                            </div>

                            {/* Order */}
                            <div className={styles.inputGroup}>
                                <label>Display Order</label>
                                <input
                                    className={styles.inputField}
                                    type="number"
                                    min={0}
                                    value={form.order}
                                    onChange={e => setForm({ ...form, order: Number(e.target.value) })}
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
                                <button type="submit" className={styles.saveBtn} disabled={saving}>
                                    {saving
                                        ? <><Loader2 size={16} className={styles.spin} /> Saving...</>
                                        : <><Save size={16} /> {editingId ? 'Update Group' : 'Create Group'}</>
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
