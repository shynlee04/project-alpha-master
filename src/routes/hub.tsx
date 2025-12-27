import { createFileRoute } from '@tanstack/react-router'
import { HubHomePage } from '../components/hub/HubHomePage'
import { MainLayout } from '../components/layout/MainLayout'

export const Route = createFileRoute('/hub')({
  component: () => (
    <MainLayout>
      <HubHomePage />
    </MainLayout>
  ),
})
