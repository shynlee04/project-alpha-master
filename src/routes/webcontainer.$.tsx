import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/webcontainer/$')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/webcontainer/$"!</div>
}
