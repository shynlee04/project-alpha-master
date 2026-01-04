/**
 * @fileoverview Knowledge Store Barrel Export (FACADE)
 * @module lib/state/knowledge
 * @governance Epic 53-3 (State Management Consolidation) - ADR-024
 * @deprecated Import from '@/infrastructure/persistence/stores/knowledge' instead
 *
 * MIGRATION NOTE: This file is a FACADE that re-exports from the canonical location.
 * The canonical implementation is at src/infrastructure/persistence/stores/knowledge/
 *
 * This facade exists for backward compatibility with existing imports.
 * New code should import directly from '@/infrastructure/persistence/stores/knowledge'.
 */

// Re-export everything from canonical location
export * from '@/infrastructure/persistence/stores/knowledge';

// Log deprecation warning in development
if (process.env.NODE_ENV === 'development') {
    console.warn(
        '[DEPRECATION] Importing from "@/lib/state/knowledge" is deprecated. ' +
        'Please update imports to use "@/infrastructure/persistence/stores/knowledge" instead. ' +
        '(ADR-024: State Management Consolidation)'
    );
}
