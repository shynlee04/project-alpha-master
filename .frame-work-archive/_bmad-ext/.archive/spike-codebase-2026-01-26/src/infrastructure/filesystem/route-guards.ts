/**
 * @fileoverview Route Guards for Platform & Storage Validation
 * @module infrastructure/filesystem/route-guards
 * @governance ARC-A04: Unified Route Guards
 *
 * Centralized route guards to enforce platform constraints.
 * - Mobile/Tablet → Block IDE access, redirect to Notes
 * - Non-FSA → Block IDE access, redirect to Notes
 */

import { redirect } from '@tanstack/react-router';
import { getPlatformContract } from './platform-contract';

/**
 * Guard: Enforce IDE access restrictions
 * Redirects to /notes/$projectId if platform doesn't support IDE
 *
 * Usage:
 * beforeLoad: async ({ params }) => {
 *   await requireIDEAccess(params.projectId);
 * }
 */
export async function requireIDEAccess(projectId: string) {
  const platform = getPlatformContract();

  if (!platform.canAccessIDE) {
    console.warn(`[RouteGuard] IDE access denied on ${platform.deviceType}, redirecting to Notes`);
    
    throw redirect({
      to: '/notes/$projectId',
      params: { projectId },
      search: { reason: 'mobile-not-supported' },
    });
  }
}
