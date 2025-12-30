import { createLazyFileRoute } from '@tanstack/react-router';
import { AboutPage } from '@/components/about';

export const Route = createLazyFileRoute('/about')({
    component: AboutPage,
});
