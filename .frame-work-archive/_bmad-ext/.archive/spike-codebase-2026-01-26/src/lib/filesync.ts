/**
 * @fileoverview File Sync Service Compatibility Facade
 * @module lib/filesync
 *
 * BACKWARD COMPATIBILITY LAYER - Migrated to infrastructure/sync/workspace-services
 *
 * This file re-exports all types and functions from the new canonical location
 * to maintain backward compatibility with existing imports.
 *
 * @deprecated Import from @/infrastructure/sync/workspace-services instead
 * @migration 2026-01-04
 * @epic CW-01 - Abstract File Sync Service
 */

// Re-export everything from new canonical location
export * from '@/infrastructure/sync/workspace-services';
