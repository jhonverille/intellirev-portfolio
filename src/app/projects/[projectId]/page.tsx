import { getAllProjects } from '../../../lib/projects'
import ProjectDetailClient from '../../../components/sections/ProjectDetailClient'

export const dynamic = 'force-static'

export async function generateStaticParams() {
    try {
        const projects = await getAllProjects()
        console.log(`Generating static params for ${projects.length} projects`)
        if (projects.length === 0) {
            // Force at least one param to avoid export error
            return [{ projectId: 'fallback' }]
        }
        return projects.map((project: any) => ({
            projectId: project.id,
        }))
    } catch (e: any) {
        console.error('Failed to generate static params:', e.message)
        return [{ projectId: 'fallback' }]
    }
}

export default function Page() {
    return <ProjectDetailClient />
}
