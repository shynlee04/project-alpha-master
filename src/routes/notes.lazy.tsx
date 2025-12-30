import { createLazyFileRoute } from '@tanstack/react-router';
import { NotesPage } from '@/components/notes/NotesPage';

export const Route = createLazyFileRoute('/notes')({
    component: NotesPage,
});
