/**
 * @fileoverview Store Facades - Backward Compatibility Layer
 * @module lib/notes/store-facades
 * @governance EPIC-CC-09 Track 1
 * @created 2026-01-21
 *
 * Provides facades to store locations to enable gradual migration
 * without breaking existing imports.
 *
 * MIGRATION STATUS: Dual-Store Transition in Progress
 * - NEW location: @/infrastructure/persistence/stores/notes/slash-commands
 * - OLD location: ./slash-command-store.ts (still exists, to be deleted)
 * - Team A Dependency: DO NOT BREAK imports from '@/lib/notes'
 *
 * DELETE OLD FILE AFTER:
 * - Team A updates all imports to use new infrastructure location
 * - All tests pass with new location
 * - No user data loss confirmed
 */

// ============================================================================
// Slash Commands Facade (Re-export from NEW location)
// ============================================================================

/**
 * Slash Commands Store - Facade to Infrastructure
 *
 * Re-exports from canonical infrastructure location with Dexie storage.
 * Maintains backward compatibility for imports from '@/lib/notes'
 *
 * @migration-status EPIC-CC-09-01 in_progress
 * @canonical-location /infrastructure/persistence/stores/notes/slash-commands
 *
 * TODO: After Team A completes import updates, delete:
 * - src/lib/notes/slash-command-store.ts
 * - This facade file
 * - Update import statements in all consuming files
 */
export {
    // Store
    useSlashCommandStore,

    // Types
    type CommandCategory,
    type CustomSlashCommand,
    type PromptVariable,
    type SlashCommandStoreState,
    type AvailableIcon,

    // Constants
    COMMAND_CATEGORIES,
    AVAILABLE_ICONS,

    // Helpers
    getLocalizedCommand,
    extractVariablesFromPrompt,
    substituteVariables,
    promptNeedsRefinement,
    getLocalizedVariableLabel,
} from '@/infrastructure/persistence/stores/notes/slash-commands';

// ============================================================================
// Legacy Facade (Deprecated - DO NOT USE)
// ============================================================================

/**
 * Legacy Store Facade
 *
 * Temporary re-export from old location during dual-store transition.
 * This alias exists ONLY to prevent import errors during migration.
 *
 * DEPRECATED: Use direct import from @/infrastructure/persistence/stores/notes/slash-commands
 * TODO: Delete this once Team A updates all imports
 */
export {
    useSlashCommandStore as useSlashCommandStoreLegacy,
} from './slash-command-store';
