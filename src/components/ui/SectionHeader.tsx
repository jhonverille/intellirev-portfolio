import { ReactNode } from 'react'
import styles from './SectionHeader.module.css'

interface SectionHeaderProps {
    title: ReactNode;
    subtitle: ReactNode;
    className?: string;
    align?: 'center' | 'left';
    level?: 'h1' | 'h2';
}

export default function SectionHeader({
    title,
    subtitle,
    className = '',
    align = 'center',
    level = 'h2'
}: SectionHeaderProps) {
    const alignmentClass = align === 'left' ? styles.alignLeft : ''
    const Heading = level as any

    return (
        <div className={`${styles.header} ${alignmentClass} ${className}`}>
            <span className={styles.subtitle}>{subtitle}</span>
            <Heading className={styles.title}>{title}</Heading>
        </div>
    )
}
