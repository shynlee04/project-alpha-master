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
