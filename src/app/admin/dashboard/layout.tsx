'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading && !user) {
            router.push('/admin/login')
        }
    }, [user, loading, router])

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', color: '#00f2ff' }}>
                Authenticating...
            </div>
        )
    }

    if (!user) {
        return null // Will redirect
    }

    return (
        <div style={{ position: 'relative', zIndex: 10, padding: '2rem', minHeight: '100vh', background: 'rgba(8,8,10,0.8)', backdropFilter: 'blur(20px)' }}>
            {children}
        </div>
    )
}
