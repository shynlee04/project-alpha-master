import { createLazyFileRoute } from '@tanstack/react-router';
import { KnowledgePage } from '@/components/knowledge/KnowledgePage';

export const Route = createLazyFileRoute('/knowledge')({
    component: KnowledgePage,
});
