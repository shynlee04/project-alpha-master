import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/workspace/$projectId')({
    ssr: false,
})
