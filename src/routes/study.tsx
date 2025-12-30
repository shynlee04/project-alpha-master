import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/study')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/study"!</div>
}
