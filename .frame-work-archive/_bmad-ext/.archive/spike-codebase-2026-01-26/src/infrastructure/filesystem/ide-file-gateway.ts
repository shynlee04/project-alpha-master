/**
 * @fileoverview IDE File Gateway - Storage gateway for IDE workspace
 * @module infrastructure/filesystem/ide-file-gateway
 *
 * **CC-IDE-01**: Create IDE file gateway
 *
 * Per ADR-033 Decision D2:
 * - Desktop with FSA → FSAGateway for IDE file operations
 * - Mobile/Tablet → IDBGateway for IDE file operations
 * - Excludes .viagent/ metadata folder and node_modules
 *
 * @epic EPIC-CC-IDE-FSA
 * @story CC-IDE-01
 * @author TEAM_B
 * @created 2026-01-18
 */

import type { StorageGateway } from '@/domain/interfaces/storage-gateway.interface';
import type { PlatformContract } from './storage-types';
import { FSAGateway } from './fsa-gateway';
import { IDBGateway } from './idb-gateway';
import { getPlatformContract } from './platform-contract';

// ============================================================================
// Factory Function
// ============================================================================

/**
 * Create IDE file gateway factory
 *
 * @remarks
 * Factory function that creates appropriate StorageGateway implementation
 * for IDE workspace based on platform capabilities.
 *
 * Per ADR-033 Decision D2:
 * - Desktop with canAccessIDE → FSAGateway (uses FSA)
 * - Mobile/Tablet → IDBGateway (uses IndexedDB)
 *
 * Exclusion handling:
 * - .viagent/ folder excluded (IDE workspace metadata) via FSAGateway.isExcludedDirectory()
 * - node_modules/ excluded (dependencies) via FSAGateway.isExcludedDirectory()
 * - .git/ excluded (version control) via FSAGateway.isExcludedDirectory()
 * - .next/ excluded (build output) via FSAGateway.isExcludedDirectory()
 * - dist/ excluded (build output) via FSAGateway.isExcludedDirectory()
 * - build/ excluded (build output) via FSAGateway.isExcludedDirectory()
 * - coverage/ excluded (test coverage) via FSAGateway.isExcludedDirectory()
 *
 * Platform detection logic:
 * - Desktop with canAccessFSA: Use FSAGateway with project handle
 * - Mobile/Tablet: Use IDBGateway with project ID
 *
 * File exclusions applied per ADR-033 defaults.
 *
 * @example
 * ```typescript
 * // In IDE route or component:
 * import { createIdeFileGateway } from '@/infrastructure/filesystem/ide-file-gateway';
 *
 * const platform = getPlatformContract();
 * const gateway = createIdeFileGateway({
 *   projectId: 'proj_abc123',
 *   fsaHandle: platform.canAccessIDE ? project.handle : undefined,
 * });
 *
 * // Use gateway for file operations
 * const content = await gateway.read('src/index.ts');
 * await gateway.write('src/index.ts', newContent);
 * const files = await gateway.list('.');
 * ```
 *
 * @param options - Options for gateway creation
 * @returns StorageGateway implementation for IDE workspace
 *
 * @throws {Error} if platform is unsupported or options invalid
 */
export function createIdeFileGateway(options: {
  /** Project ID for IndexedDB storage (mobile) */
  projectId: string;
  /** FSA directory handle (desktop only, optional) */
  fsaHandle?: FileSystemDirectoryHandle | undefined;
}): StorageGateway {
  const { projectId, fsaHandle } = options;

  // Detect platform capabilities
  const platform = getPlatformContract();

  // Route to appropriate gateway implementation
  if (platform.canAccessIDE && fsaHandle) {
    // Desktop: Use FSAGateway with project handle
    // Note: Exclusions are handled by FSAGateway.isExcludedDirectory()
    console.log('[ide-file-gateway] Creating FSAGateway for desktop IDE');
    return new FSAGateway(fsaHandle);
  } else {
    // Mobile/Tablet: Use IDBGateway with project ID
    // Note: IDE workspace is blocked on mobile per ADR-033,
    // but gateway exists for future support/testing
    console.log('[ide-file-gateway] Creating IDBGateway for mobile/tablet IDE');
    return new IDBGateway(projectId);
  }
}

// ============================================================================
// Re-exports
// ============================================================================

/**
 * IDE File Gateway module exports
 *
 * Main export: createIdeFileGateway()
 *
 * Exclusions handled by FSAGateway.isExcludedDirectory() and IDBGateway.shouldWatchFile()
 * - .viagent/ folder excluded (IDE workspace metadata)
 * - node_modules/ excluded (dependencies)
 * - .git/ excluded (version control)
 * - .next/ excluded (build output)
 * - dist/ excluded (build output)
 * - build/ excluded (build output)
 */
export type { PlatformContract };
