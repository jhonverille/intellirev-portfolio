'use client'

import { useState, useEffect } from 'react'
import { db, storage } from '@/lib/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { Upload, FileText } from 'lucide-react'
import styles from './ProfileConfigManager.module.css'

export default function ProfileConfigManager() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [resumeFile, setResumeFile] = useState<File | null>(null)

    // Cleanup object URLs to prevent memory leaks
    useEffect(() => {
        return () => {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview)
            }
        }
    }, [imagePreview])

    const [config, setConfig] = useState({
        name: 'Jhon Verille Alterado',
        bio: 'I specialize in architecting autonomous ecosystems and intelligent workflows that transform complex processes into seamless digital experiences.',
        profileImageUrl: '',
        resumeUrl: '',
        githubUrl: '',
        linkedinUrl: ''
    })

    useEffect(() => {
        fetchConfig()
    }, [])

    const fetchConfig = async () => {
        try {
            const docRef = doc(db, 'site_settings', 'profile')
            const docSnap = await getDoc(docRef)
            
            if (docSnap.exists()) {
                const data = docSnap.data()
                setConfig({
                    name: data.name || '',
                    bio: data.bio || '',
                    profileImageUrl: data.profileImageUrl || '',
                    resumeUrl: data.resumeUrl || '',
                    githubUrl: data.githubUrl || '',
                    linkedinUrl: data.linkedinUrl || ''
                })
            }
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setError(null)
        setSuccess(false)

        try {
            let finalImageUrl = config.profileImageUrl
            let finalResumeUrl = config.resumeUrl

            if (imageFile) {
                setUploading(true)
                const storageRef = ref(storage, `profile_images/${Date.now()}_${imageFile.name}`)
                const snapshot = await uploadBytes(storageRef, imageFile)
                finalImageUrl = await getDownloadURL(snapshot.ref)
            }

            if (resumeFile) {
                setUploading(true)
                const storageRef = ref(storage, `resumes/${Date.now()}_${resumeFile.name}`)
                const snapshot = await uploadBytes(storageRef, resumeFile)
                finalResumeUrl = await getDownloadURL(snapshot.ref)
            }

            if (imageFile || resumeFile) {
                setUploading(false)
            }

            let finalLinkedin = config.linkedinUrl.trim()
            if (finalLinkedin && !/^https?:\/\//i.test(finalLinkedin)) {
                finalLinkedin = `https://${finalLinkedin}`
            }

            let finalGithub = config.githubUrl.trim()
            if (finalGithub && !/^https?:\/\//i.test(finalGithub)) {
                finalGithub = `https://${finalGithub}`
            }

            const docRef = doc(db, 'site_settings', 'profile')
            const finalConfig = { 
                ...config, 
                profileImageUrl: finalImageUrl, 
                resumeUrl: finalResumeUrl,
                linkedinUrl: finalLinkedin,
                githubUrl: finalGithub
            }
            await setDoc(docRef, finalConfig, { merge: true })
            
            // Update local state with the new image URL
            setConfig(finalConfig)
            setImageFile(null)
            setImagePreview(null)
            setResumeFile(null)

            setSuccess(true)
            
            // Hide success message after 3 seconds
            setTimeout(() => setSuccess(false), 3000)
        } catch (err: any) {
            setError(err.message)
            setUploading(false)
        } finally {
            setSaving(false)
        }
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            setImageFile(file)
            setImagePreview(URL.createObjectURL(file))
        }
    }

    const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setResumeFile(e.target.files[0])
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setConfig(prev => ({
            ...prev,
            [name]: value
        }))
    }

    if (loading) return <div className={styles.loading}>Loading profile configuration...</div>

    return (
        <div className={styles.managerContainer}>
            <div className={styles.header}>
                <h2>Profile Configuration</h2>
                <p>Manage the content displayed in the "My Profile" section.</p>
            </div>

            {error && <div className={styles.error}>{error}</div>}
            {success && <div className={styles.success}>Profile configuration saved successfully!</div>}

            <form onSubmit={handleSave} className={styles.form}>
                <div className={styles.formGroup}>
                    <label>Full Name / Headline</label>
                    <input
                        type="text"
                        name="name"
                        value={config.name}
                        onChange={handleChange}
                        className={styles.input}
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>Biography</label>
                    <textarea
                        name="bio"
                        value={config.bio}
                        onChange={handleChange}
                        className={styles.textarea}
                        rows={4}
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>Profile Image</label>
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
                        {(imagePreview || config.profileImageUrl) ? (
                            <img 
                                src={imagePreview || config.profileImageUrl} 
                                alt="Profile Preview" 
                                className={styles.imagePreview}
                            />
                        ) : (
                            <Upload className={styles.uploadIcon} />
                        )}
                        <div className={styles.uploadHint}>
                            <span>Click or drag to upload image</span>
                            <small>JPEG, PNG, WebP up to 5MB</small>
                        </div>
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label>Resume File</label>
                    <div className={styles.imageUploadArea}>
                        {uploading && (
                            <div className={styles.uploadingOverlay}>
                                Uploading...
                            </div>
                        )}
                        <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={handleResumeChange}
                            className={styles.fileInput}
                            disabled={uploading || saving}
                        />
                        <FileText className={styles.uploadIcon} />
                        <div className={styles.uploadHint}>
                            <span>
                                {resumeFile 
                                    ? `Selected: ${resumeFile.name}` 
                                    : config.resumeUrl 
                                        ? 'Current resume uploaded (Click to replace)' 
                                        : 'Click or drag to upload resume'
                                }
                            </span>
                            <small>PDF, DOC, DOCX up to 10MB</small>
                        </div>
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label>LinkedIn URL</label>
                    <input
                        type="text"
                        inputMode="url"
                        name="linkedinUrl"
                        value={config.linkedinUrl}
                        onChange={handleChange}
                        className={styles.input}
                        placeholder="https://linkedin.com/in/yourprofile"
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>GitHub URL</label>
                    <input
                        type="text"
                        inputMode="url"
                        name="githubUrl"
                        value={config.githubUrl}
                        onChange={handleChange}
                        className={styles.input}
                        placeholder="https://github.com/yourusername"
                    />
                </div>

                <div className={styles.formActions}>
                    <button 
                        type="submit" 
                        className={styles.saveBtn}
                        disabled={saving || uploading}
                    >
                        {(saving || uploading) ? 'Saving...' : 'Save Configuration'}
                    </button>
                </div>
            </form>
        </div>
    )
}
