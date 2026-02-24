/**
 * @fileoverview Project ID Types - Template literal types for compile-time safety
 * @module domain/types/project-ids
 *
 * **ARC-D01**: ProjectId template literal type
 *
 * Per ADR-033 Decision D4 (Entity Naming):
 * - ProjectId MUST follow naming convention at compile time
 * - Format: proj_{timestamp}_{random}
 * - Example: proj_1704787200000_abc123xyz
 * - WORKSPACE IS DETERMINED BY ROUTING, NOT BY PROJECT ID
 *
 * **BUG-011 FIX (2026-01-19)**: Removed workspace prefix from ProjectId.
 * Previous implementation incorrectly added {workspaceType}: prefix to project IDs,
 * causing routing failures and URL encoding issues (ide%3Aproj_...).
 *
 * @epic EPIC-CC-ARC
 * @story ARC-D01
 * @author Team B
 * @created 2026-01-18
 * @modified 2026-01-19 - BUG-011 FIX: Remove workspace prefix
 */

/**
 * Workspace type enumeration
 *
 * @remarks
 * Represents the 4 valid workspace types.
 * BUG-011 FIX: Workspace type is NO LONGER part of project ID.
 * Workspace is determined by routing context, not by project ID prefix.
 */
export type WorkspaceType = 'ide' | 'knowledge' | 'study' | 'notes';

/**
 * Project ID template literal type
 *
 * @remarks
 * BUG-011 FIX: Project ID format is now:
 * - proj_{timestamp}_{random}
 * - NO workspace prefix
 *
 * Previous (WRONG): ide:proj_1704787200000_abc123xyz
 * Correct: proj_1704787200000_abc123xyz
 *
 * @example
 * ```ts
 * const valid: ProjectId = 'proj_1704787200000_abc123xyz'; // ✅
 * const invalid: ProjectId = 'ide:proj_1704787200000_abc123xyz'; // ❌ No prefix!
 * ```
 */
export type ProjectId = `proj_${number}_${string}`;

/**
 * Legacy project ID type (for backward compatibility)
 *
 * @remarks
 * Used for existing projects that may not follow the namespaced format.
 * Should NOT be used for new project creation.
 *
 * **DEPRECATED**: New projects MUST use namespaced ProjectId format.
 */
export type LegacyProjectId = string;

/**
 * Union type for all valid project IDs
 *
 * @remarks
 * Includes both new namespaced format and legacy format.
 * Type guards should be used to distinguish at runtime.
 */
export type AnyProjectId = ProjectId | LegacyProjectId;

/**
 * Branded type for validated ProjectId
 *
 * @remarks
 * Use this when you need to guarantee that a ProjectId has been
 * validated at runtime (not just compile-time checked).
 *
 * @example
 * ```ts
 * function assertValidProjectId(id: string): id is BrandedProjectId {
 *   return isValidProjectId(id);
 * }
 * ```
 */
export interface BrandedProjectId extends String {
  readonly __brand: 'ProjectId';
}

/**
 * Extract workspace type from a namespaced project ID
 *
 * @remarks
 * Compile-time utility to extract workspace prefix from ProjectId.
 * Returns 'ide' as default for legacy non-namespaced IDs.
 *
 * @example
 * ```ts
 * type W1 = ExtractWorkspaceType<'ide:proj_123'>; // 'ide'
 * type W2 = ExtractWorkspaceType<'knowledge:proj_456'>; // 'knowledge'
 * type W3 = ExtractWorkspaceType<'legacy'>; // 'ide' (default)
 * ```
 */
export type ExtractWorkspaceType<T extends string> =
  T extends `${infer W}:${string}` ? W extends WorkspaceType ? W : 'ide'
  : 'ide';

/**
 * Runtime validation: Check if a string matches ProjectId format
 *
 * @param id - String to validate
 * @returns true if valid ProjectId format
 *
 * BUG-011 FIX: Updated regex to NOT require workspace prefix
 *
 * @example
 * ```ts
 * isValidProjectId('proj_123_abc'); // true
 * isValidProjectId('ide:proj_123_abc'); // false (prefix not allowed)
 * isValidProjectId('invalid'); // false
 * ```
 */
export function isValidProjectId(id: string): id is ProjectId {
  // BUG-011 FIX: Pattern is now proj_{timestamp}_{random} WITHOUT workspace prefix
  const pattern = /^proj_\d+_[a-z0-9]+$/;
  return pattern.test(id);
}

/**
 * Check if a project ID has legacy workspace prefix (for migration)
 *
 * @param id - Project ID to check
 * @returns true if has legacy prefix like 'ide:', 'notes:', etc.
 */
export function hasLegacyPrefix(id: string): boolean {
  const legacyPattern = /^(ide|knowledge|study|notes):proj_\d+_[a-z0-9]+$/;
  return legacyPattern.test(id);
}

/**
 * Strip legacy workspace prefix from project ID
 *
 * @param id - Project ID that may have legacy prefix
 * @returns Project ID without prefix
 *
 * @example
 * ```ts
 * stripLegacyPrefix('ide:proj_123_abc'); // 'proj_123_abc'
 * stripLegacyPrefix('proj_123_abc'); // 'proj_123_abc' (unchanged)
 * ```
 */
export function stripLegacyPrefix(id: string): string {
  if (hasLegacyPrefix(id)) {
    return id.split(':')[1];
  }
  return id;
}

/**
 * Extract workspace type from project ID (runtime)
 *
 * BUG-011 FIX: Since project IDs no longer contain workspace prefix,
 * this function now returns 'ide' as default for all projects.
 * Workspace should be determined from routing context, not project ID.
 *
 * @deprecated Use route context to determine workspace instead
 * @param id - Project ID to parse (ignored since IDs don't have prefix)
 * @returns 'ide' as default (workspace comes from routing, not ID)
 */
export function extractWorkspaceType(id: string): WorkspaceType {
  // BUG-011 FIX: Legacy IDs may still have prefix - extract it for migration
  if (hasLegacyPrefix(id)) {
    const parts = id.split(':');
    const workspaceType = parts[0];
    if (workspaceType === 'ide' || workspaceType === 'knowledge' ||
        workspaceType === 'study' || workspaceType === 'notes') {
      return workspaceType;
    }
  }
  // For new IDs without prefix, default to 'ide'
  // Actual workspace is determined by routing context
  return 'ide';
}

/**
 * Assert that a string is a valid ProjectId
 *
 * @param id - String to validate
 * @throws TypeError if invalid ProjectId format
 *
 * @example
 * ```ts
 * assertProjectId('ide:proj_123_abc'); // OK
 * assertProjectId('invalid'); // throws TypeError
 * ```
 */
export function assertProjectId(id: string): asserts id is ProjectId {
  if (!isValidProjectId(id)) {
    throw new TypeError(
      `Invalid ProjectId format: "${id}". Expected format: "{workspaceType}:proj_{timestamp}_{random}" where workspaceType is one of: ide, knowledge, study, notes`
    );
  }
}

/**
 * Type guard for branded ProjectId
 *
 * @param value - Any value to check
 * @returns true if value is a BrandedProjectId
 */
export function isBrandedProjectId(value: unknown): value is BrandedProjectId {
  return typeof value === 'string' && isValidProjectId(value);
}
