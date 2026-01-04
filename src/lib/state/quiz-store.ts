/**
 * @fileoverview Quiz Store Facade - DEPRECATED
 * @module lib/state/quiz-store
 * @deprecated Use `@/infrastructure/persistence/stores/study` instead
 *
 * This file is a backward-compatibility facade that re-exports from the
 * canonical location in infrastructure/persistence/stores/study.
 *
 * Migration (ADR-024, Epic 53):
 * - Old import: `import { useQuizStore } from '@/lib/state/quiz-store'`
 * - New import: `import { useQuizStore } from '@/infrastructure/persistence/stores/study'`
 *
 * This facade will be removed after Story 53-7 (Update All Import Paths).
 */

// Emit deprecation warning in development
if (process.env.NODE_ENV === 'development') {
  console.warn(
    '[DEPRECATED] Import from @/lib/state/quiz-store is deprecated.\n' +
      'Please update your import to: @/infrastructure/persistence/stores/study\n' +
      'See: ADR-024, Epic 53 - State Management Consolidation'
  );
}

// Re-export everything from canonical location
export { useQuizStore, initializeQuizStore } from '@/infrastructure/persistence/stores/study';
export type { QuizState } from '@/infrastructure/persistence/stores/study';
