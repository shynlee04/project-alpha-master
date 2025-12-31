import { createFileRoute } from '@tanstack/react-router'
import { HubHomePage } from '@/presentation/components/hub/HubHomePage'
import { MainLayout } from '@/presentation/components/layout/MainLayout'
import { AgentDiagnostic } from '@/presentation/components/debug/AgentDiagnostic'

export const Route = createFileRoute('/')({
  component: () => (
    <MainLayout>
      <HubHomePage />
      {/* CC-2025-12-29: Debug tool - remove after fixing */}
      <AgentDiagnostic />
    </MainLayout>
  ),
})
