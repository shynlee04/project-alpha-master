
import { createFileRoute } from '@tanstack/react-router';
import { NotesPage } from '@/components/notes/NotesPage';

// @ts-ignore - Route strict typing will be fixed by TanStack Router codegen
export const Route = createFileRoute('/notes' as any)({
    component: NotesPage,
});
