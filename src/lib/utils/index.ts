/**
 * @fileoverview Utils Library Barrel Export (FACADE)
 * @module lib/utils
 *
 * **@deprecated FACADE PATTERN**: This module re-exports from src/lib/utils.ts
 * to maintain backward compatibility.
 *
 * **MIGRATION REQUIRED**: Update imports to use canonical paths:
 *   OLD: import { cn } from '@/lib/utils';
 *   NEW: import { cn } from '@/lib/utils';
 *
 * Note: The cn function and error handling utilities remain in src/lib/utils.ts
 * as they are shared utilities. This index file provides a consistent import pattern.
 *
 * **Timeline**: This facade will be removed after migration is complete
 * **Epic**: EPIC-CONSOLIDATION
 * **Created**: 2026-01-29
 */

// ============================================================================
// Re-exports from lib/utils.ts (Main utilities)
// ============================================================================

export { cn } from '../utils';

// ============================================================================
// Re-exports from lib/utils/ subdirectory (Error handling, etc.)
// ============================================================================

export * from './error-handling';
export * from './error-classification';
export * from './mobile-error-handling';
export * from './platform-detection';
export * from './hash';
export * from './security';
export * from './dynamic-imports';