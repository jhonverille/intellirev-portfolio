import React from 'react'
import styles from './GlassCard.module.css'

interface GlassCardProps {
    children: React.ReactNode
    className?: string
    style?: React.CSSProperties
}

export default function GlassCard({ children, className, style }: GlassCardProps) {
    return (
        <div className={`${styles.card} ${className || ''}`} style={style}>
            {children}
        </div>
    )
}
