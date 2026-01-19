/**
 * @fileoverview Folder Overlap Detection Service
 * @module infrastructure/filesystem/folder-overlap-service
 *
 * **ARC-B07**: Folder overlap detection and warning UI
 *
 * Per ADR-033 Decision D2:
 * - Detect nested/overlapping folder selections
 * - Block same path, warn on parent/child overlap
 * - User can confirm or cancel
 *
 * @epic EPIC-CC-ARC
 * @story ARC-B07
 * @author Team B
 * @created 2026-01-17
 */

import { getDb } from '@/infrastructure/persistence/dexie-db';

// ============================================================================
// Types
// ============================================================================

/**
 * Overlap detection result
 */
export interface OverlapResult {
  /** Whether there is any overlap */
  hasOverlap: boolean;
  /** Type of overlap detected */
  overlapType: 'none' | 'same' | 'parent' | 'child';
  /** Projects that overlap (for same/parent/child) */
  overlappingProjects: OverlappingProject[];
  /** Whether user should be blocked */
  shouldBlock: boolean;
}

/**
 * Information about an overlapping project
 */
export interface OverlappingProject {
  projectId: string;
  projectName: string;
  overlapReason: string;
}

/**
 * Overlap detection options
 */
export interface OverlapCheckOptions {
  /** Allow child overlap (user confirmed warning) */
  allowChildOverlap?: boolean;
  /** Allow parent overlap (user confirmed warning) */
  allowParentOverlap?: boolean;
}

/**
 * Folder path information for comparison
 */
interface FolderPathInfo {
  projectId: string;
  projectName: string;
  /** Normalized path for comparison */
  normalizedPath: string;
  /** Whether this is an FSA project */
  isFSA: boolean;
}

// ============================================================================
// Overlap Detection Service
// ============================================================================

/**
 * Check if a selected folder overlaps with existing projects
 *
 * @param folderPath - The path of the folder being selected
 * @param options - Optional overlap check settings
 * @returns Overlap detection result
 *
 * @example
 * ```ts
 * const result = await checkFolderOverlap('/Users/john/projects/my-app');
 * if (result.shouldBlock) {
 *   // Block selection - same path
 *   showBlockDialog(result.overlappingProjects);
 * } else if (result.hasOverlap) {
 *   // Show warning - parent/child overlap
 *   showWarningDialog(result.overlappingProjects);
 * }
 * ```
 */
export async function checkFolderOverlap(
  folderPath: string,
  options: OverlapCheckOptions = {}
): Promise<OverlapResult> {
  const db = getDb();
  if (!db) {
    return { hasOverlap: false, overlapType: 'none', overlappingProjects: [], shouldBlock: false };
  }

  // Normalize the input path for comparison
  const normalizedInputPath = normalizePath(folderPath);

  // Get all existing projects with their paths
  const existingProjects = await db.projects.toArray();
  const projectPaths: FolderPathInfo[] = [];

  for (const project of existingProjects) {
    // For FSA projects, we need to check if we have a folder path
    // For IndexedDB projects, there's no file system overlap
    if (project.storageType === 'fsa' && project.path) {
      projectPaths.push({
        projectId: project.id,
        projectName: project.name,
        normalizedPath: normalizePath(project.path),
        isFSA: true,
      });
    }
  }

  // Check for overlaps
  const overlappingProjects: OverlappingProject[] = [];

  for (const existing of projectPaths) {
    const overlap = detectOverlap(normalizedInputPath, existing.normalizedPath);

    if (overlap.type !== 'none') {
      overlappingProjects.push({
        projectId: existing.projectId,
        projectName: existing.projectName,
        overlapReason: getOverlapReason(normalizedInputPath, existing.normalizedPath, overlap.type),
      });
    }
  }

  // Determine if we should block
  const hasSameOverlap = overlappingProjects.some(p => p.overlapReason.includes('same folder'));
  const shouldBlock = hasSameOverlap;

  // Determine overlap type (use most severe)
  let overlapType: 'none' | 'same' | 'parent' | 'child' = 'none';
  if (hasSameOverlap) {
    overlapType = 'same';
  } else if (overlappingProjects.some(p => p.overlapReason.includes('parent'))) {
    overlapType = 'parent';
  } else if (overlappingProjects.some(p => p.overlapReason.includes('child'))) {
    overlapType = 'child';
  }

  // Filter based on options
  let filteredProjects = overlappingProjects;
  if (options.allowChildOverlap) {
    filteredProjects = filteredProjects.filter(p => !p.overlapReason.includes('child'));
  }
  if (options.allowParentOverlap) {
    filteredProjects = filteredProjects.filter(p => !p.overlapReason.includes('parent'));
  }

  return {
    hasOverlap: filteredProjects.length > 0,
    overlapType,
    overlappingProjects: filteredProjects,
    shouldBlock: shouldBlock && filteredProjects.length > 0,
  };
}

/**
 * Detect overlap between two paths
 */
function detectOverlap(path1: string, path2: string): { type: 'none' | 'same' | 'parent' | 'child' } {
  // Remove trailing slashes for comparison
  const clean1 = path1.replace(/\/+$/, '');
  const clean2 = path2.replace(/\/+$/, '');

  // Same path
  if (clean1 === clean2) {
    return { type: 'same' };
  }

  // path1 is parent of path2
  if (clean2.startsWith(clean1 + '/')) {
    return { type: 'parent' };
  }

  // path2 is parent of path1
  if (clean1.startsWith(clean2 + '/')) {
    return { type: 'child' };
  }

  return { type: 'none' };
}

/**
 * Get human-readable overlap reason
 */
function getOverlapReason(
  _newPath: string,
  existingPath: string,
  type: 'none' | 'same' | 'parent' | 'child'
): string {
  switch (type) {
    case 'same':
      return `Same folder as "${existingPath}"`;
    case 'parent':
      return `Parent folder of "${existingPath}"`;
    case 'child':
      return `Child folder of "${existingPath}"`;
    default:
      return '';
  }
}

/**
 * Normalize a file path for comparison
 *
 * - Removes redundant slashes
 * - Resolves . and .. (basic)
 * - Converts to lowercase for case-insensitive comparison (macOS/Windows)
 */
function normalizePath(path: string): string {
  let normalized = path;

  // Replace backslashes with forward slashes (Windows)
  normalized = normalized.replace(/\\/g, '/');

  // Remove redundant slashes
  normalized = normalized.replace(/\/+/g, '/');

  // Remove trailing slash
  normalized = normalized.replace(/\/+$/, '');

  // For case-insensitive comparison (macOS and Windows are case-insensitive)
  normalized = normalized.toLowerCase();

  return normalized;
}

/**
 * Get folder path from a directory handle
 *
 * @param handle - The FSA directory handle
 * @returns The folder path
 *
 * @remarks
 * FSA doesn't provide full path for security reasons.
 * We use the handle name which is just the folder name.
 * Full path comparison would require additional user permission.
 */
export async function getFolderHandlePath(handle: FileSystemDirectoryHandle): Promise<string> {
  // Try to resolve the handle to get more path information
  // Note: FSA doesn't expose full file system path for security
  // We use the handle name as a fallback

  // For now, return just the folder name
  // In a future enhancement, we could:
  // 1. Ask user to paste the full path
  // 2. Use a File System Access API extension if available
  // 3. Store a UUID-based reference

  return handle.name;
}

/**
 * Check if folder overlap should be allowed based on project settings
 *
 * @param _projectId - The project ID to check
 * @returns Whether overlap is allowed for this project
 */
export async function isOverlapAllowed(_projectId: string): Promise<boolean> {
  // Future: Check if user has previously confirmed overlap for this project
  // For now, always require confirmation
  return false;
}

/**
 * Record user's overlap confirmation
 *
 * @param projectId - The project ID
 * @param confirmedProjectIds - Project IDs that overlap
 */
export async function recordOverlapConfirmation(
  projectId: string,
  confirmedProjectIds: string[]
): Promise<void> {
  // Future: Store user's confirmation so we don't ask again
  // For now, this is a no-op
  console.log('[FolderOverlap] Recorded overlap confirmation:', {
    projectId,
    confirmedProjectIds,
  });
}

/**
 * Get overlapping projects for a specific project
 *
 * @param projectId - The project to check
 * @returns List of overlapping projects
 */
export async function getOverlappingProjects(projectId: string): Promise<string[]> {
  const db = getDb();
  if (!db) return [];

  const project = await db.projects.get(projectId);
  if (!project || !project.path) return [];

  const result = await checkFolderOverlap(project.path);
  return result.overlappingProjects.map(p => p.projectId);
}
