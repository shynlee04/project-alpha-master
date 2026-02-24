/**
 * Projects Route - Projects List Page
 *
 * FIX-2026-01-28: Removed MainLayout wrapper.
 * ProjectAwareLayout (in __root.tsx) already provides MainSidebar for global routes.
 * Using MainLayout here caused DOUBLE MainSidebar rendering.
 */
import { createFileRoute } from '@tanstack/react-router'
import { ProjectsPage } from '@/presentation/components/project/ProjectsPage'
import { ErrorBoundary } from '@/presentation/components/error'

export const Route = createFileRoute('/projects')({
  component: () => (
    <ErrorBoundary>
      {/* Content renders directly - MainSidebar is provided by ProjectAwareLayout */}
      <ProjectsPage />
    </ErrorBoundary>
  ),
})
