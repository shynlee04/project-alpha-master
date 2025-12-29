import { createFileRoute } from '@tanstack/react-router'
import { HubHomePage } from '../components/hub/HubHomePage'
import { MainLayout } from '../components/layout/MainLayout'
import { AgentDiagnostic } from '../components/debug/AgentDiagnostic'

export const Route = createFileRoute('/')({
  component: () => (
    <MainLayout>
      <HubHomePage />
      {/* CC-2025-12-29: Debug tool - remove after fixing */}
      <AgentDiagnostic />
    </MainLayout>
  ),
})
