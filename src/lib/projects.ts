import { db } from './firebase'
import { collection, query, orderBy, getDocs, doc, getDoc, Timestamp } from 'firebase/firestore'

export interface Project {
    id: string
    title: string
    category: string
    description: string
    imageUrl: string
    imageUrls?: string[]
    liveUrl: string
    githubUrl: string
    tags: string[]
    createdAt: Timestamp | null
}

const PROJECTS_COLLECTION = 'projects'

/**
 * Fetches all projects from Firestore ordered by creation date
 */
export async function getAllProjects(): Promise<Project[]> {
    try {
        const q = query(collection(db, PROJECTS_COLLECTION), orderBy('createdAt', 'desc'))
        const snap = await getDocs(q)
        return snap.docs.map(d => ({
            id: d.id,
            title: d.data().title || '',
            category: d.data().category || '',
            description: d.data().description || '',
            imageUrl: d.data().imageUrl || '',
            imageUrls: d.data().imageUrls || [],
            liveUrl: d.data().liveUrl || '',
            githubUrl: d.data().githubUrl || '',
            tags: d.data().tags || [],
            createdAt: d.data().createdAt || null,
        }))
    } catch (error) {
        console.error('Error fetching projects:', error)
        throw error
    }
}

/**
 * Fetches a single project by ID
 */
export async function getProjectById(id: string): Promise<Project | null> {
    try {
        const docRef = doc(db, PROJECTS_COLLECTION, id)
        const docSnap = await getDoc(docRef)

        if (!docSnap.exists()) return null

        return {
            id: docSnap.id,
            title: docSnap.data().title || '',
            category: docSnap.data().category || '',
            description: docSnap.data().description || '',
            imageUrl: docSnap.data().imageUrl || '',
            imageUrls: docSnap.data().imageUrls || [],
            liveUrl: docSnap.data().liveUrl || '',
            githubUrl: docSnap.data().githubUrl || '',
            tags: docSnap.data().tags || [],
            createdAt: docSnap.data().createdAt || null,
        }
    } catch (error) {
        console.error(`Error fetching project with ID ${id}:`, error)
        throw error
    }
}
