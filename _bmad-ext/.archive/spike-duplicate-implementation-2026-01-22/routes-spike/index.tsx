/**
 * @fileoverview Spike Hub Entry Page
 * @module routes/spike/index
 * @updated 2026-01-17T10:30:00+07:00
 *
 * ============================================================================
 * SPIKE HUB ENTRY PAGE
 * ============================================================================
 *
 * Uses full HubHomePage component for proper entry flow:
 * - New user detection → Project creation wizard (via /spike/create)
 * - Returning user → Project list selection
 * - Device-aware routing → IDE vs Notes entry guards
 * ============================================================================
 */

import { createFileRoute } from '@tanstack/react-router';
import { HubHomePage } from '@/spike/components/hub/HubHomePage';

/**
 * Spike Hub Route
 *
 * Uses full HubHomePage component for proper entry flow.
 */
export const Route = createFileRoute('/spike/')({
  component: HubHomePage,
});
