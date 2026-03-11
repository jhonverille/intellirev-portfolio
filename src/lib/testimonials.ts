import { db } from './firebase'
import { collection, query, orderBy, getDocs, Timestamp } from 'firebase/firestore'

export interface Testimony {
    id: string
    name: string
    role: string
    content: string
    avatar?: string
    createdAt?: Timestamp | null
}

const TESTIMONIALS_COLLECTION = 'testimonials'

/**
 * Fetches all testimonials from Firestore ordered by creation date
 */
export async function getAllTestimonials(): Promise<Testimony[]> {
    try {
        const q = query(collection(db, TESTIMONIALS_COLLECTION), orderBy('createdAt', 'desc'))
        const snap = await getDocs(q)
        return snap.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name || '',
            role: doc.data().role || '',
            content: doc.data().content || '',
            avatar: doc.data().avatar || '',
            createdAt: doc.data().createdAt || null,
        }))
    } catch (error) {
        console.error('Error fetching testimonials:', error)
        throw error
    }
}
