/**
 * @fileoverview Temp Project Management (Phase 1)
 * @module lib/workspace/temp-project
 *
 * PHASE 1: Mobile/Default temp project auto-creation
 * - Creates virtual temp project when no project is selected
 * - ONE temp project per session (stored in localStorage)
 * - Auto-initializes virtual file system
 *
 * Usage:
 * ```ts
 * import { getOrCreateTempProject, isTempProject, getTempProjectBannerProps }
 * from '@/lib/workspace/temp-project';
 *
 * const tempProject = await getOrCreateTempProject();
 * if (isTempProject(tempProject.id)) {
 *   // Show temp banner
 * }
 * ```
 */

import { saveProject, getProject } from '@/lib/workspace/project-store';
import type { Project } from '@/domain/entities/project';
import { isDesktopPlatform } from '@/lib/utils/platform-detection';

// ============================================================================
// Constants
// ============================================================================

const TEMP_PROJECT_PREFIX = 'alpha-temp-';
const TEMP_PROJECT_STORAGE_KEY = 'alpha-temp-project-id';

/**
 * Temp project metadata for display
 */
export interface TempProjectMetadata {
  id: string;
  name: string;
  isTemporary: boolean;
  createdAt: Date;
  platform: 'mobile' | 'desktop';
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Check if a project ID is a temp project
 */
export function isTempProject(projectId: string): boolean {
  return projectId?.startsWith(TEMP_PROJECT_PREFIX) || false;
}

/**
 * Get the stored temp project ID from localStorage
 */
export function getStoredTempProjectId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(TEMP_PROJECT_STORAGE_KEY);
  } catch {
    return null;
  }
}

/**
 * Get or create the temp project for this session
 *
 * Phase 1 Behavior:
 * - On mobile: Always creates temp project
 * - On desktop: Creates temp project if no FSA handle available
 * - ONE temp project per session (reuses existing if found)
 * - Project persists in IndexedDB via project store
 */
export async function getOrCreateTempProject(): Promise<Project> {
  // Check for existing temp project
  const existingId = getStoredTempProjectId();
  if (existingId) {
    const existing = await getProject(existingId);
    if (existing) {
      return existing as Project;
    }
  }

  // Create new temp project
  const tempProject = await createTempProject();
  return tempProject;
}

/**
 * Create a new temp project
 */
async function createTempProject(): Promise<Project> {
  const projectId = generateTempProjectId();
  const now = new Date();
  const platform = isDesktopPlatform() ? 'desktop' : 'mobile';

  const tempProject: Project = {
    id: projectId,
    name: `Temp Project (${formatTimestamp(now)})`,
    folderPath: `/virtual/${projectId}`,
    storageType: 'indexeddb', // Virtual storage = IndexedDB only
    lastOpened: now,
    createdAt: now,
    autoSync: false, // No sync for temp projects
    fileSnapshotEnabled: false,
    bindings: {}, // Empty bindings for temp project
    tags: [], // No tags for temp project
    isTemp: true, // Mark as temp project
    autoCreated: true, // Mark as auto-created
  };

  // Save to project store
  await saveProject(tempProject);

  // Store ID in localStorage for session persistence
  try {
    localStorage.setItem(TEMP_PROJECT_STORAGE_KEY, projectId);
  } catch (e) {
    console.warn('[TempProject] Failed to store ID in localStorage:', e);
  }

  console.log('[TempProject] Created temp project:', projectId, 'platform:', platform);
  return tempProject;
}

/**
 * Generate a unique temp project ID with timestamp
 */
function generateTempProjectId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${TEMP_PROJECT_PREFIX}${timestamp}-${random}`;
}

/**
 * Format timestamp for display
 */
function formatTimestamp(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Get temp project metadata for banner display
 */
export function getTempProjectBannerProps(project: Project): TempProjectMetadata {
  return {
    id: project.id,
    name: project.name,
    isTemporary: isTempProject(project.id),
    createdAt: project.lastOpened,
    platform: isDesktopPlatform() ? 'desktop' : 'mobile',
  };
}

/**
 * Clear the temp project (for testing or user action)
 */
export async function clearTempProject(): Promise<void> {
  const existingId = getStoredTempProjectId();
  if (existingId) {
    try {
      localStorage.removeItem(TEMP_PROJECT_STORAGE_KEY);
      console.log('[TempProject] Cleared temp project:', existingId);
    } catch (e) {
      console.warn('[TempProject] Failed to clear temp project:', e);
    }
  }
}

/**
 * Check if user should see temp project flow
 *
 * Phase 1: Mobile users always get temp project
 * Desktop users get temp project if no FSA handle available
 */
export function shouldUseTempProject(hasFsaHandle: boolean = false): boolean {
  // Mobile: Always use temp project
  if (!isDesktopPlatform()) {
    return true;
  }

  // Desktop: Use temp project if no FSA handle
  return !hasFsaHandle;
}
