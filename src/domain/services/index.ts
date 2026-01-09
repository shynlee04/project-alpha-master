/**
 * Domain Services Barrel Export
 *
 * Exports all domain service utilities for business logic.
 * These services encapsulate business rules and operations on domain entities.
 *
 * @module domain/services
 * @story AC-1.5 - Fix circular dependencies with domain utilities
 * @architecture Domain-Driven Design (DDD)
 */

// Agent workspace utilities
export {
  isAgentAvailableIn,
  isAgentDefaultFor,
  getAgentsForWorkspace,
  getDefaultAgentForWorkspace,
} from './agent-workspace-utils';

// Project Registry - EPIC-FS, FS-02
export {
  ProjectRegistry,
  ProjectRegistryClass,
} from './ProjectRegistry';

// Re-export types from ProjectRegistry (already exported with 'export type' in source)
export type {
  ProjectConflictResult,
  ProjectLifecycleState,
  ProjectNamespace,
  ProjectRegistration,
  ProjectRegistrationOptions,
  ProjectRegistrationResult,
  ProjectRegistrySnapshot,
  ProjectRegistryStats,
} from './ProjectRegistry';
