import { createFileRoute, Navigate } from '@tanstack/react-router'

export const Route = createFileRoute('/hub')({
  component: () => <Navigate to="/" replace />,
})
