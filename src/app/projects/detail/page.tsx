import { Suspense } from 'react'
import ProjectDetailClient from '../../../components/sections/ProjectDetailClient'

export default function Page() {
    return (
        <Suspense fallback={<div>Loading project...</div>}>
            <ProjectDetailClient />
        </Suspense>
    )
}
