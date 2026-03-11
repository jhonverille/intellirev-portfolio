'use client'

import { useState, useEffect } from 'react'
import { db } from '@/lib/firebase'
import {
    collection, onSnapshot, doc, updateDoc, deleteDoc, query, orderBy, Timestamp
} from 'firebase/firestore'
import GlassCard from '@/components/ui/GlassCard'
import styles from './InquiriesList.module.css'
import {
    Inbox, Loader2, MailOpen, Mail, Archive, ArchiveRestore,
    Trash2, MessageSquare, ChevronDown, ChevronUp, Reply
} from 'lucide-react'

interface Inquiry {
    id: string
    name: string
    email: string
    message: string
    createdAt: Timestamp | null
    read: boolean
    archived: boolean
}

type FilterType = 'all' | 'unread' | 'archived'

export default function InquiriesList() {
    const [inquiries, setInquiries] = useState<Inquiry[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<FilterType>('all')
    const [expandedId, setExpandedId] = useState<string | null>(null)

    // Real-time listener
    useEffect(() => {
        const q = query(collection(db, 'inquiries'), orderBy('createdAt', 'desc'))
        const unsub = onSnapshot(q, (snap) => {
            const data = snap.docs.map(d => ({
                id: d.id,
                name: d.data().name || 'Anonymous',
                email: d.data().email || '',
                message: d.data().message || '',
                createdAt: d.data().createdAt || null,
                read: d.data().read || false,
                archived: d.data().archived || false,
            }))
            setInquiries(data)
            setLoading(false)
        }, () => setLoading(false))

        return () => unsub()
    }, [])

    const markRead = async (id: string, currentRead: boolean) => {
        await updateDoc(doc(db, 'inquiries', id), { read: !currentRead })
    }

    const toggleArchive = async (id: string, currentArchived: boolean) => {
        await updateDoc(doc(db, 'inquiries', id), { archived: !currentArchived, read: true })
    }

    const deleteInquiry = async (id: string) => {
        if (!confirm('Delete this inquiry permanently?')) return
        await deleteDoc(doc(db, 'inquiries', id))
    }

    const toggleExpand = (id: string) => {
        // Also mark as read when opened
        const inq = inquiries.find(i => i.id === id)
        if (inq && !inq.read) markRead(id, false)
        setExpandedId(prev => prev === id ? null : id)
    }

    const formatDate = (ts: Timestamp | null) => {
        if (!ts) return '–'
        const d = ts.toDate()
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
            ' · ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    }

    const getInitial = (name: string) => name.charAt(0).toUpperCase()

    const filtered = inquiries.filter(i => {
        if (filter === 'unread') return !i.read && !i.archived
        if (filter === 'archived') return i.archived
        return !i.archived
    })

    const unreadCount = inquiries.filter(i => !i.read && !i.archived).length
    const archivedCount = inquiries.filter(i => i.archived).length
    const allCount = inquiries.filter(i => !i.archived).length

    if (loading) {
        return (
            <GlassCard style={{ padding: 0 }}>
                <div className={styles.loading}>
                    <Loader2 className={styles.spinner} size={40} />
                    <p>Fetching transmissions from the void...</p>
                </div>
            </GlassCard>
        )
    }

    return (
        <GlassCard style={{ padding: 0 }}>
            <div className={styles.container}>

                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.headerLeft}>
                        <h2>Inquiries</h2>
                        <p>Incoming messages from your contact form.</p>
                    </div>
                    {unreadCount > 0 && (
                        <span className={styles.badge}>{unreadCount} new</span>
                    )}
                </div>

                {/* Filter Tabs */}
                <div className={styles.filters}>
                    <button
                        className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        <Inbox size={14} />
                        Inbox
                        <span className={styles.count}>{allCount}</span>
                    </button>
                    <button
                        className={`${styles.filterBtn} ${filter === 'unread' ? styles.active : ''}`}
                        onClick={() => setFilter('unread')}
                    >
                        <Mail size={14} />
                        Unread
                        <span className={styles.count}>{unreadCount}</span>
                    </button>
                    <button
                        className={`${styles.filterBtn} ${filter === 'archived' ? styles.active : ''}`}
                        onClick={() => setFilter('archived')}
                    >
                        <Archive size={14} />
                        Archived
                        <span className={styles.count}>{archivedCount}</span>
                    </button>
                </div>

                {/* List */}
                <div className={styles.list}>
                    {filtered.length === 0 ? (
                        <div className={styles.empty}>
                            <MessageSquare size={48} />
                            <p>
                                {filter === 'unread' ? 'No unread messages.' :
                                    filter === 'archived' ? 'Nothing archived yet.' :
                                        'No inquiries yet. They will appear here when someone contacts you.'}
                            </p>
                        </div>
                    ) : (
                        filtered.map(inq => (
                            <div
                                key={inq.id}
                                className={`${styles.card} ${!inq.read ? styles.unread : ''} ${inq.archived ? styles.archived : ''}`}
                            >
                                {/* Card Header */}
                                <div className={styles.cardHeader} onClick={() => toggleExpand(inq.id)} style={{ cursor: 'pointer' }}>
                                    <div className={styles.senderInfo}>
                                        <div className={styles.avatar}>{getInitial(inq.name)}</div>
                                        <div className={styles.senderMeta}>
                                            <span className={styles.senderName}>{inq.name}</span>
                                            <span className={styles.senderEmail}>{inq.email}</span>
                                        </div>
                                    </div>
                                    <div className={styles.cardMeta}>
                                        <span className={styles.timestamp}>{formatDate(inq.createdAt)}</span>
                                        {!inq.read && <span className={styles.unreadDot} />}
                                        {expandedId === inq.id
                                            ? <ChevronUp size={16} color="var(--text-dim)" />
                                            : <ChevronDown size={16} color="var(--text-dim)" />
                                        }
                                    </div>
                                </div>

                                {/* Message */}
                                <p className={`${styles.message} ${expandedId === inq.id ? styles.expanded : ''}`}>
                                    {inq.message}
                                </p>

                                {/* Actions — only visible when expanded */}
                                {expandedId === inq.id && (
                                    <div className={styles.actions}>
                                        <button
                                            className={`${styles.actionBtn} ${!inq.read ? styles.markRead : ''}`}
                                            onClick={() => markRead(inq.id, inq.read)}
                                        >
                                            {inq.read ? <Mail size={14} /> : <MailOpen size={14} />}
                                            {inq.read ? 'Mark unread' : 'Mark read'}
                                        </button>

                                        <button
                                            className={`${styles.actionBtn} ${inq.archived ? styles.unarchive : styles.archive}`}
                                            onClick={() => toggleArchive(inq.id, inq.archived)}
                                        >
                                            {inq.archived ? <ArchiveRestore size={14} /> : <Archive size={14} />}
                                            {inq.archived ? 'Restore' : 'Archive'}
                                        </button>

                                        <a
                                            href={`mailto:${inq.email}?subject=Re: Your inquiry`}
                                            className={styles.replyLink}
                                        >
                                            <Reply size={14} />
                                            Reply
                                        </a>

                                        <button
                                            className={`${styles.actionBtn} ${styles.delete}`}
                                            onClick={() => deleteInquiry(inq.id)}
                                        >
                                            <Trash2 size={14} />
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

            </div>
        </GlassCard>
    )
}
