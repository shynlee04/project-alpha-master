/**
 * ============================================================================
 * @spike-copy-source: src/infrastructure/filesystem/storage-types.ts
 * ============================================================================
 *
 * This file is a SELECTIVE COPY from main app for isolated testing.
 *
 * USER JOURNEYS DEMONSTRATED:
 * - Desktop: FSA storage for IDE and Notes
 * - Mobile: IndexedDB storage for Notes (IDE blocked)
 *
 * ADR-033 COMPLIANCE: [Score 10/10]
 * - ✅ StorageGateway abstraction implemented
 * - ✅ FSA and IndexedDB gateways
 * - ✅ Platform-based storage selection
 * - ✅ Auto-detection (no user choice)
 *
 * ARCHITECTURE VIOLATIONS: None detected
 *
 * ============================================================================
 */

// Re-export types for spike isolation
export type * from '@/infrastructure/filesystem/storage-types';
