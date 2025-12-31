import { createLazyFileRoute } from '@tanstack/react-router';
import { AboutPage } from '@/presentation/components/about';

export const Route = createLazyFileRoute('/about')({
    component: AboutPage,
});
