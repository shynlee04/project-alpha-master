import { createFileRoute } from '@tanstack/react-router'
import { HubHomePage } from '@/presentation/components/hub/HubHomePage'
import { MainLayout } from '@/presentation/components/layout/MainLayout'
import { ErrorBoundary } from '@/presentation/components/error'

export const Route = createFileRoute('/hub')({
  component: () => (
    <ErrorBoundary>
      <MainLayout>
        <HubHomePage />
      </MainLayout>
    </ErrorBoundary>
  ),
})
