
import { createFileRoute } from '@tanstack/react-router';

// @ts-ignore - Route strict typing will be fixed by TanStack Router codegen
export const Route = createFileRoute('/notes' as any)({
    // Component moved to notes.lazy.tsx for code splitting
});
