import { createFileRoute } from '@tanstack/react-router'
import { HubHomePage } from '../components/hub/HubHomePage'
import { HubLayout } from '../components/layout/HubLayout'

export const Route = createFileRoute('/')({
  component: () => (
    <HubLayout>
      <HubHomePage />
    </HubLayout>
  ),
})
