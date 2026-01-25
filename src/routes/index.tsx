/**
 * @fileoverview Hub Index Route - Home Page
 * @module routes/index
 * 
 * FIX-2026-01-26: Removed MainLayout wrapper.
 * GlobalSidebar and GlobalHeader are now rendered in __root.tsx.
 * HubHomePage renders directly into the Outlet.
 */

import { createFileRoute } from '@tanstack/react-router'
import { HubHomePage } from '@/presentation/components/hub/HubHomePage'

export const Route = createFileRoute('/')({\n  component: () => <HubHomePage />,
})
