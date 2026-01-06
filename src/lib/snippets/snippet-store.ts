/**
 * @fileoverview Code Snippet Store - Facade (Major Refactoring)
 * @module lib/snippets/snippet-store
 * @governance S-031
 * @ai-observable true
 *
 * @deprecated This module has undergone a MAJOR REFACTORING.
 *
 * **IMPORTANT ARCHITECTURAL CHANGE:**
 *
 * BEFORE (482 lines): Single Zustand store file with mixed responsibilities
 * - All CRUD, filtering, export/import, and utility functions in one file
 * - Mixed concerns across 482 lines
 *
 * AFTER (Zustand): Zustand store with 4 focused slices (~525 total lines)
 * - Store: useSnippetStore with slice composition
 * - Slices: CRUD (195 lines), Filtering (115 lines), Export (110 lines), Utils (105 lines)
 * - Cleaner separation of concerns with focused responsibilities
 *
 * **This is a god store elimination following December 2025 Zustand patterns.**
 *
 * Migration Guide:
 *
 * OLD (Single file):
 * ```ts
 * import { useSnippetStore, parseSnippetPlaceholders } from '@/lib/snippets/snippet-store';
 * const { createSnippet } = useSnippetStore.getState();
 * const placeholders = parseSnippetPlaceholders(code);
 * ```
 *
 * NEW (Slice composition):
 * ```ts
 * import { useSnippetStore } from '@/lib/snippets/snippet-store/snippet-store-refactored';
 * import { parseSnippetPlaceholders } from '@/lib/snippets/snippet-store/snippet-utils-slice';
 * const { createSnippet } = useSnippetStore.getState();
 * const placeholders = parseSnippetPlaceholders(code);
 * ```
 *
 * **All backward-compatible exports are now facades that delegate to refactored store.**
 *
 * @see _bmad-output/store-refactoring-summaries/snippet-store-refactoring-2026-01-07.md
 */

// ============================================================================
// Types
// ============================================================================

export type { CodeSnippetRecord, InsertedSnippet, SnippetPlaceholder } from '@/infrastructure/persistence/dexie-db-snippet-types';

// ============================================================================
// Backward Compatibility Facade (Delegates to Refactored Store)
// ============================================================================

export {
  useSnippetStore,
  initializeSnippetStore,
  useFilteredSnippets,
  useSnippet,
  useSnippetFolders,
  useSnippetTags,
  useSelectedSnippet,
} from './snippet-store/snippet-store-refactored';

// Re-export utility functions for backward compatibility
export { parseSnippetPlaceholders, processSnippetForInsertion } from './snippet-store/snippet-store-refactored';
