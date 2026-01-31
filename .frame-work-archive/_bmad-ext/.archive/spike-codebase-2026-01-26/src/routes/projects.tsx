import { createFileRoute } from '@tanstack/react-router'
import { ProjectsPage } from '@/presentation/components/project/ProjectsPage'
import { MainLayout } from '@/presentation/components/layout/MainLayout'
import { ErrorBoundary } from '@/presentation/components/error'

export const Route = createFileRoute('/projects')({
  component: () => (
    <ErrorBoundary>
      <MainLayout>
        <ProjectsPage />
      </MainLayout>
    </ErrorBoundary>
  ),
})
