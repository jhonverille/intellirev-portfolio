import { db } from './firebase'
import { collection, query, orderBy, getDocs, doc, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'

export interface SkillGroup {
    id: string
    name: string
    icon: string        // lucide icon name, e.g. 'Globe', 'Database'
    skills: string[]
    order: number
}

const COLLECTION = 'expertise'

export async function getAllSkillGroups(): Promise<SkillGroup[]> {
    try {
        const q = query(collection(db, COLLECTION), orderBy('order', 'asc'))
        const snap = await getDocs(q)
        return snap.docs.map(d => ({
            id: d.id,
            name: d.data().name || '',
            icon: d.data().icon || 'Layers',
            skills: d.data().skills || [],
            order: d.data().order ?? 0,
        }))
    } catch (error) {
        console.error('Error fetching skill groups:', error)
        throw error
    }
}

export async function addSkillGroup(data: Omit<SkillGroup, 'id'>): Promise<void> {
    await addDoc(collection(db, COLLECTION), { ...data, createdAt: serverTimestamp() })
}

export async function updateSkillGroup(id: string, data: Partial<Omit<SkillGroup, 'id'>>): Promise<void> {
    await updateDoc(doc(db, COLLECTION, id), data)
}

export async function deleteSkillGroup(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION, id))
}
