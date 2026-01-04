/**
 * @fileoverview Dexie Storage Adapter Facade - DEPRECATED
 * @module lib/state/dexie-storage
 * @deprecated Use `@/infrastructure/persistence/dexie-storage` instead
 *
 * This file is a backward-compatibility facade that re-exports from the
 * canonical location in infrastructure/persistence.
 *
 * Migration (ADR-024, Epic 53):
 * - Old import: `import { createDexieStorage } from '@/lib/state/dexie-storage'`
 * - New import: `import { createDexieStorage } from '@/infrastructure/persistence/dexie-storage'`
 *
 * This facade will be removed after Story 53-7 (Update All Import Paths).
 */

// Emit deprecation warning in development
if (process.env.NODE_ENV === 'development') {
  console.warn(
    '[DEPRECATED] Import from @/lib/state/dexie-storage is deprecated.\n' +
      'Please update your import to: @/infrastructure/persistence/dexie-storage\n' +
      'See: ADR-024, Epic 53 - State Management Consolidation'
  );
}

// Re-export everything from canonical location
export { createDexieStorage } from '@/infrastructure/persistence/dexie-storage';
