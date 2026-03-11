'use client'

import Link from 'next/link'
import styles from './Header.module.css'

export default function Header() {
    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
        const path = window.location.pathname;
        if (path === '/' || path === '') {
            e.preventDefault();
            const element = document.getElementById(id);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
                window.history.pushState(null, '', `/#${id}`);
            }
        }
    };

    return (
        <header className={styles.header}>
            <Link href="/#home" className={styles.logo} onClick={(e) => handleNavClick(e, 'home')}>
                <img src="/logo.png" alt="Jhon Verille Logo" className={styles.logoImage} />
                <span>JHON VERILLE ALTERADO</span>
            </Link>

            <nav className={styles.nav}>
                <Link href="/#home" className={styles.navLink} onClick={(e) => handleNavClick(e, 'home')}>Home</Link>
                <Link href="/#expertise" className={styles.navLink} onClick={(e) => handleNavClick(e, 'expertise')}>Expertise</Link>
                <Link href="/#projects" className={styles.navLink} onClick={(e) => handleNavClick(e, 'projects')}>Portfolio</Link>
                <Link href="/#testimonials" className={styles.navLink} onClick={(e) => handleNavClick(e, 'testimonials')}>Testimonials</Link>
                <Link href="/#contact" className={styles.navLink} onClick={(e) => handleNavClick(e, 'contact')}>Contact</Link>
            </nav>
        </header>

    )
}
