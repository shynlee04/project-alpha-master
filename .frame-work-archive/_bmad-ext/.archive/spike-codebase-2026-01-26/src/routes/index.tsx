import { createFileRoute } from '@tanstack/react-router'
import { HubHomePage } from '@/presentation/components/hub/HubHomePage'
import { MainLayout } from '@/presentation/components/layout/MainLayout'

export const Route = createFileRoute('/')({
  component: () => (
    <MainLayout>
      <HubHomePage />
    </MainLayout>
  ),
})
