/**
 * @fileoverview Project ID Types - Template literal types for compile-time safety
 * @module domain/types/project-ids
 *
 * **ARC-D01**: ProjectId template literal type
 *
 * Per ADR-033 Decision D4 (Entity Naming):
 * - ProjectId MUST follow naming convention at compile time
 * - Format: {workspaceType}:proj_{timestamp}_{random}
 * - Example: ide:proj_1704787200000_abc123xyz
 *
 * @epic EPIC-CC-ARC
 * @story ARC-D01
 * @author Team B
 * @created 2026-01-18
 */

/**
 * Workspace type enumeration
 *
 * @remarks
 * Represents the 4 valid workspace types that can be prefixed
 * to project IDs for namespace isolation.
 */
export type WorkspaceType = 'ide' | 'knowledge' | 'study' | 'notes';

/**
 * Project ID template literal type
 *
 * @remarks
 * Enforces the naming convention at compile time:
 * - Must start with workspaceType (ide/knowledge/study/notes)
 * - Followed by literal ':proj_'
 * - Followed by numeric timestamp
 * - Followed by underscore
 * - Followed by random alphanumeric string
 *
 * @example
 * ```ts
 * const valid: ProjectId = 'ide:proj_1704787200000_abc123xyz'; // ✅
 * const invalid: ProjectId = 'random-string'; // ❌ Type error
 * const invalid: ProjectId = 'ide:xyz_123_abc'; // ❌ Type error (wrong format)
 * ```
 */
export type ProjectId = `${WorkspaceType}:proj_${number}_${string}`;

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
 * @example
 * ```ts
 * isValidProjectId('ide:proj_123_abc'); // true
 * isValidProjectId('invalid'); // false
 * ```
 */
export function isValidProjectId(id: string): id is ProjectId {
  const pattern = /^(ide|knowledge|study|notes):proj_\d+_[a-z0-9]+$/;
  return pattern.test(id);
}

/**
 * Extract workspace type from project ID (runtime)
 *
 * @param id - Project ID to parse
 * @returns Workspace type or 'ide' as default
 *
 * @example
 * ```ts
 * extractWorkspaceType('ide:proj_123_abc'); // 'ide'
 * extractWorkspaceType('knowledge:proj_456_def'); // 'knowledge'
 * extractWorkspaceType('legacy'); // 'ide'
 * ```
 */
export function extractWorkspaceType(id: string): WorkspaceType {
  const parts = id.split(':');
  if (parts.length === 2) {
    const workspaceType = parts[0];
    if (workspaceType === 'ide' || workspaceType === 'knowledge' ||
        workspaceType === 'study' || workspaceType === 'notes') {
      return workspaceType;
    }
  }
  // Legacy or malformed IDs default to 'ide'
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
