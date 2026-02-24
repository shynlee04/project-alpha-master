---
title: "Canonical Type Registry - Phase 1 Architecture Remediation"
version: "1.0.0"
status: "ACTIVE"
created: "2026-01-30"
created_by: "architect-ext"
task_id: "ARCH-01a"
parent_task: "Phase 1 - Architecture Remediation Framework"
related_documents:
  - "new-fundamental-truths.md"
  - "ARCH-STRATEGIC-REFACTOR-2026-01-21.md"
  - "CLEAN-ARCHITECTURE-ACTION-PLAN-2026-01-20.md"
---

# Canonical Type Registry

> **Purpose**: Single source of truth for all domain types. This document establishes which type definitions are canonical and provides a migration path from duplicate/conflicting definitions.

## Executive Summary

### Type Chaos Discovered

| Synonym Group | Active Definitions | Severity | Impact |
|---------------|-------------------|----------|--------|
| `WorkspaceType` | 8 files in src/ | CRITICAL | Import graph fragmentation |
| `SyncStatus` | 3 files (INCOMPATIBLE values) | CRITICAL | Runtime errors possible |
| `ProjectId` | 1 file (clean) | LOW | Well-defined |
| `PluginId` | 1 file (clean) | LOW | Well-defined |

### Key Findings

1. **WorkspaceType** is defined in **8 different locations** within active source code
2. **SyncStatus** has **incompatible definitions** - statusbar-store includes 'synced' state that sync-types does NOT
3. **Import graph is fragmented** - files import WorkspaceType from 4+ different sources
4. **No single barrel export** exists for canonical types

---

## Part 1: Canonical Type Definitions

### 1.1 WorkspaceType

**CANONICAL DEFINITION** (from `new-fundamental-truths.md`):

```typescript
/**
 * Workspace type enumeration - the 4 valid workspace types
 * 
 * @canonical src/domain/types/canonical/workspace-types.ts
 * @remarks Workspace is determined by routing context, not project ID
 */
export type WorkspaceType = 'ide' | 'knowledge' | 'study' | 'notes';
```

**CANONICAL OWNER**: `src/domain/types/`

**BUSINESS RULE**: Per ADR-033/ADR-034, workspaces are:
- `ide` - Code development workspace (Desktop FSA only)
- `knowledge` - Knowledge synthesis and RAG workspace
- `study` - Study materials and flashcard workspace
- `notes` - Note-taking and documentation workspace

### 1.2 SyncStatus

**CANONICAL DEFINITION** (RESOLUTION REQUIRED):

Two incompatible definitions exist:

| Location | Values |
|----------|--------|
| `src/infrastructure/sync/types/sync-types.ts` | `'idle' | 'syncing' | 'error'` |
| `src/infrastructure/persistence/stores/statusbar-store.ts` | `'idle' | 'syncing' | 'synced' | 'error'` |

**DECISION**: The statusbar-store definition is **more complete** (includes 'synced' state).

```typescript
/**
 * Sync operation status
 * 
 * @canonical src/domain/types/canonical/sync-types.ts
 * @remarks 'synced' indicates successful completion
 */
export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';
```

**CANONICAL OWNER**: `src/domain/types/`

**RELATED TYPES** (also in sync domain):
- `SyncStatusType` in sync-core-types.ts: `'idle' | 'syncing' | 'complete' | 'error' | 'conflict'`
- These are **different concerns**: SyncStatus = UI state, SyncStatusType = operation state

### 1.3 ProjectId

**CANONICAL DEFINITION** (already clean):

```typescript
/**
 * Project ID template literal type
 * 
 * @canonical src/domain/types/project-ids.ts (EXISTING - NO CHANGE)
 * @remarks Format: proj_{timestamp}_{random}, NO workspace prefix
 */
export type ProjectId = `proj_${number}_${string}`;
```

**CANONICAL OWNER**: `src/domain/types/project-ids.ts` (keep as-is)

### 1.4 PluginId

**CANONICAL DEFINITION** (already clean):

```typescript
/**
 * Plugin ID union type
 * 
 * @canonical src/domain/types/plugin-types.ts (EXISTING - NO CHANGE)
 */
export type PluginId =
  | 'filetree'
  | 'monaco'
  | 'notes'
  | 'terminal'
  | 'chat'
  | 'agents'
  | 'preview';
```

**CANONICAL OWNER**: `src/domain/types/plugin-types.ts` (keep as-is)

---

## Part 2: Synonym Resolution Table

### 2.1 WorkspaceType Locations

| Current Location | Status | Migration Action |
|------------------|--------|------------------|
| `src/domain/types/project-ids.ts:32` | CANONICAL SOURCE | Keep, re-export from canonical |
| `src/domain/value-objects/workspace-type.ts:31` | DUPLICATE | Re-export from canonical |
| `src/domain/entities/workspace.ts:14` | DUPLICATE | Re-export from canonical |
| `src/domain/entities/chat.ts:17` | DUPLICATE | Re-export from canonical |
| `src/lib/workspace/workspace-types.ts` | DEPRECATED (in @/lib/) | Delete after migration |
| `src/infrastructure/sync/core/sync-core-types.ts:13` | DUPLICATE | Re-export from canonical |
| `src/infrastructure/sync/workspace-services/file-sync-service.ts:53` | DUPLICATE | Delete, import from canonical |
| `src/infrastructure/persistence/stores/chat/chat-settings-store.ts:23` | DUPLICATE (order differs!) | Delete, import from canonical |
| `src/lib/filesystem/file-snapshot-store/snapshot-cache-slice.ts:8` | DEPRECATED | Delete after migration |

**CRITICAL ISSUE**: `chat-settings-store.ts` has different member order: `'ide' | 'notes' | 'knowledge' | 'study'`

### 2.2 SyncStatus Locations

| Current Location | Definition | Migration Action |
|------------------|------------|------------------|
| `src/infrastructure/sync/types/sync-types.ts:15` | `'idle' | 'syncing' | 'error'` | UPDATE to add 'synced' |
| `src/infrastructure/persistence/stores/statusbar-store.ts:41` | `'idle' | 'syncing' | 'synced' | 'error'` | CANONICAL - move to domain |
| `src/lib/workspace/workspace-types.ts:11` | `'idle' | 'syncing' | 'error'` | DELETE (deprecated path) |

### 2.3 Import Path Current Usage

**Files importing WorkspaceType from different sources**:

| Import Source | File Count | Files (sample) |
|---------------|------------|----------------|
| `@/domain/types/project-ids` | 3 | project-crud-slice.ts, project-handle-service.ts, pointer-sync-service.ts |
| `@/domain/entities/workspace` | 7 | unified-workspace-context.ts, project-types.ts, ProjectRegistry.ts, rag-types.ts |
| `@/domain/value-objects/workspace-type` | 13 | agents/slices/index.ts, use-app-store.ts, file-crud-types.ts, shared/types/index.ts |
| `@/domain/entities/chat` | 3 | useThreadManager.ts, chat-metadata-slice.ts |

**Total fragmentation**: 26 files importing WorkspaceType from 4 different sources

---

## Part 3: Import Path Contract

### 3.1 Canonical Import Paths (MUST use)

```typescript
// Core domain types
import type { WorkspaceType } from '@/domain/types';
import type { ProjectId, AnyProjectId, BrandedProjectId } from '@/domain/types';
import type { PluginId, PluginCategory } from '@/domain/types';

// Sync types (infrastructure-owned)
import type { SyncStatus, SyncProgress, SyncResult, SyncError } from '@/infrastructure/sync/types';

// Re-exported utilities
import { isValidProjectId, isValidPluginId } from '@/domain/types';
import { WorkspaceTypeUtils } from '@/domain/types';
```

### 3.2 Forbidden Import Paths (MUST NOT use)

| Forbidden Path | Reason | Canonical Alternative |
|----------------|--------|----------------------|
| `@/lib/*` | Deprecated layer, violates architecture | Use `@/domain/*` or `@/infrastructure/*` |
| `@/domain/entities/workspace` for WorkspaceType | Should come from types, not entities | `@/domain/types` |
| `@/domain/entities/chat` for WorkspaceType | Should come from types, not entities | `@/domain/types` |
| `@/domain/value-objects/workspace-type` | Redundant, types owns primitives | `@/domain/types` |
| `@/domain/types/project-ids` for WorkspaceType only | Use barrel export | `@/domain/types` |
| `@/infrastructure/sync/core/sync-core-types` for WorkspaceType | Infrastructure should not own domain types | `@/domain/types` |

### 3.3 Layer Ownership Rules

```
┌─────────────────────────────────────────────────────────────┐
│                    DOMAIN LAYER                              │
│  Owns: WorkspaceType, ProjectId, PluginId, PluginCategory   │
│  Path: @/domain/types/*                                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 INFRASTRUCTURE LAYER                         │
│  Owns: SyncStatus, SyncProgress, SyncError, SyncConfig      │
│  Path: @/infrastructure/sync/types/*                         │
│  IMPORTS FROM: @/domain/types (for WorkspaceType)           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 PRESENTATION LAYER                           │
│  Owns: UI-specific types only                                │
│  Path: @/presentation/types/* (if needed)                    │
│  IMPORTS FROM: @/domain/types, @/infrastructure/*/types     │
└─────────────────────────────────────────────────────────────┘
```

---

## Part 4: Implementation Plan

### 4.1 Directory Structure

**CREATE**: `src/domain/types/canonical/`

```
src/domain/types/
├── canonical/                    # NEW - Canonical definitions
│   ├── workspace-types.ts        # WorkspaceType + WorkspaceTypeUtils
│   ├── project-types.ts          # ProjectId types (migrate from project-ids.ts)
│   ├── plugin-types.ts           # PluginId, PluginCategory (keep existing)
│   ├── sync-types.ts             # SyncStatus (moved from infrastructure)
│   └── index.ts                  # Barrel export
├── index.ts                      # Updated barrel (re-exports from canonical/)
├── project-ids.ts                # DEPRECATE → re-export from canonical/
├── plugin-types.ts               # KEEP (already canonical)
├── plugin-coordination.types.ts  # KEEP
├── viagent-metadata.ts           # KEEP
└── llm/                          # KEEP
```

### 4.2 File-by-File Changes

#### Phase 1: Create Canonical Directory (No Breaking Changes)

| Step | Action | File | Risk |
|------|--------|------|------|
| 1.1 | CREATE | `src/domain/types/canonical/workspace-types.ts` | LOW |
| 1.2 | CREATE | `src/domain/types/canonical/sync-types.ts` | LOW |
| 1.3 | CREATE | `src/domain/types/canonical/index.ts` | LOW |
| 1.4 | UPDATE | `src/domain/types/index.ts` - add re-exports | LOW |

#### Phase 2: Update Deprecated Files to Re-Export

| Step | Action | File | Risk |
|------|--------|------|------|
| 2.1 | UPDATE | `src/domain/value-objects/workspace-type.ts` - re-export from canonical | MEDIUM |
| 2.2 | UPDATE | `src/domain/entities/workspace.ts` - re-export from canonical | MEDIUM |
| 2.3 | UPDATE | `src/domain/entities/chat.ts` - re-export from canonical | MEDIUM |
| 2.4 | UPDATE | `src/infrastructure/sync/core/sync-core-types.ts` - import from canonical | MEDIUM |
| 2.5 | UPDATE | `src/infrastructure/sync/types/sync-types.ts` - add 'synced' value | HIGH |

#### Phase 3: Migrate Consumers (Batch by Impact)

**Batch 3A: Low-Risk Files (3 files)**
| File | Current Import | New Import |
|------|---------------|------------|
| `project-handle-service.ts` | `@/domain/types/project-ids` | `@/domain/types` |
| `pointer-sync-service.ts` | `@/domain/types/project-ids` | `@/domain/types` |
| `project-crud-slice.ts` | `@/domain/types/project-ids` | `@/domain/types` |

**Batch 3B: Medium-Risk Files (7 files - @/domain/entities/workspace consumers)**
| File | Current Import | New Import |
|------|---------------|------------|
| `unified-workspace-context.ts` | `@/domain/entities/workspace` | `@/domain/types` |
| `project-types.ts` | `@/domain/entities/workspace` | `@/domain/types` |
| `ProjectRegistry.ts` | `@/domain/entities/workspace` | `@/domain/types` |
| `project-registry-types.ts` | `@/domain/entities/workspace` | `@/domain/types` |
| `rag-types.ts` | `@/domain/entities/workspace` | `@/domain/types` |
| `workspace-types.ts` (stores) | `@/domain/entities/workspace` | `@/domain/types` |

**Batch 3C: High-Volume Files (13 files - @/domain/value-objects/workspace-type consumers)**
| File | Current Import | New Import |
|------|---------------|------------|
| `agents/slices/index.ts` | `@/domain/value-objects/workspace-type` | `@/domain/types` |
| `cross-workspace-reference-manager.ts` | `@/domain/value-objects/workspace-type` | `@/domain/types` |
| `use-app-store.ts` | `@/domain/value-objects/workspace-type` | `@/domain/types` |
| `agents/types.ts` | `@/domain/value-objects/workspace-type` | `@/domain/types` |
| `workspace-switch-isolation.test.ts` | `@/domain/value-objects/workspace-type` | `@/domain/types` |
| `file-crud-types.ts` | `@/domain/value-objects/workspace-type` | `@/domain/types` |
| `types.ts` (stores) | `@/domain/value-objects/workspace-type` | `@/domain/types` |
| `agent-workspace-utils.ts` | `@/domain/value-objects/workspace-type` | `@/domain/types` |
| `cross-workspace-reference-types.ts` | `@/domain/value-objects/workspace-type` | `@/domain/types` |
| `useWorkspaceSwitching.ts` | `@/domain/value-objects/workspace-type` | `@/domain/types` |
| `useCornerstoneStores.ts` | `@/domain/value-objects/workspace-type` | `@/domain/types` |
| `workspace-context.ts` | `@/domain/value-objects/workspace-type` | `@/domain/types` |
| `shared/types/index.ts` | `@/domain/value-objects/workspace-type` | `@/domain/types` |

**Batch 3D: Chat Entity Consumers (3 files)**
| File | Current Import | New Import |
|------|---------------|------------|
| `useThreadManager.ts` | `@/domain/entities/chat` | `@/domain/types` + `@/domain/entities/chat` |
| `chat-metadata-slice.ts` | `@/domain/entities/chat` | `@/domain/types` |

#### Phase 4: Delete Deprecated Files

| Step | Action | File | Prerequisite |
|------|--------|------|--------------|
| 4.1 | DELETE | `src/lib/workspace/workspace-types.ts` | All consumers migrated |
| 4.2 | DELETE | `src/lib/filesystem/file-snapshot-store/snapshot-cache-slice.ts` WorkspaceType | All consumers migrated |

---

## Part 5: Risk Assessment

### 5.1 High Risk Changes

| Change | Risk Level | Mitigation |
|--------|------------|------------|
| Adding 'synced' to SyncStatus in sync-types.ts | HIGH | May break exhaustive switch statements |
| Deleting @/lib/ exports | HIGH | Must update 654 imports first |

### 5.2 Medium Risk Changes

| Change | Risk Level | Mitigation |
|--------|------------|------------|
| Updating 26 files to new import paths | MEDIUM | Batch updates with typecheck after each |
| Re-exporting from deprecated files | MEDIUM | Maintains backward compatibility |

### 5.3 Low Risk Changes

| Change | Risk Level | Mitigation |
|--------|------------|------------|
| Creating new canonical directory | LOW | Additive only |
| Creating barrel exports | LOW | Additive only |

---

## Part 6: Migration Effort Estimate

### 6.1 File Counts

| Category | File Count | Estimated Effort |
|----------|------------|------------------|
| New files to create | 4 | 1 hour |
| Files to update (re-export) | 5 | 2 hours |
| Consumer files to migrate | 26 | 4 hours |
| Files to delete | 2 | 30 minutes |
| **TOTAL** | 37 files | **~8 hours** |

### 6.2 Verification Requirements

After each phase:
1. `pnpm typecheck:fast` - Must pass
2. `pnpm test:fast` - Must pass
3. `pnpm governance` - Must pass

### 6.3 Rollback Strategy

If migration fails:
1. All deprecated files contain re-exports (backward compatible)
2. No breaking changes until Phase 4 (deletions)
3. Phase 4 only executed after full verification

---

## Part 7: Canonical Type Files Content

### 7.1 workspace-types.ts

```typescript
/**
 * @fileoverview Canonical Workspace Type Definitions
 * @module domain/types/canonical/workspace-types
 * @canonical TRUE - Single source of truth for WorkspaceType
 * 
 * Per new-fundamental-truths.md and ADR-034:
 * - 4 workspaces: ide, knowledge, study, notes
 * - Workspace determined by routing context, NOT project ID
 */

/**
 * Workspace Type Enumeration
 */
export type WorkspaceType = 'ide' | 'knowledge' | 'study' | 'notes';

/**
 * All workspace types array (for iteration)
 */
export const WORKSPACE_TYPES: readonly WorkspaceType[] = [
  'ide',
  'knowledge', 
  'study',
  'notes'
] as const;

/**
 * Workspace type utilities
 */
export class WorkspaceTypeUtils {
  static all(): WorkspaceType[] {
    return [...WORKSPACE_TYPES];
  }

  static isValid(value: string): value is WorkspaceType {
    return WORKSPACE_TYPES.includes(value as WorkspaceType);
  }

  static getLabel(workspaceType: WorkspaceType): string {
    const labels: Record<WorkspaceType, string> = {
      ide: 'IDE',
      knowledge: 'Knowledge',
      study: 'Study',
      notes: 'Notes'
    };
    return labels[workspaceType];
  }

  static getDescription(workspaceType: WorkspaceType): string {
    const descriptions: Record<WorkspaceType, string> = {
      ide: 'Code development and debugging workspace',
      knowledge: 'Knowledge synthesis and RAG workspace',
      study: 'Study materials and flashcard workspace',
      notes: 'Note-taking and documentation workspace'
    };
    return descriptions[workspaceType];
  }
}
```

### 7.2 sync-types.ts (Domain Layer)

```typescript
/**
 * @fileoverview Canonical Sync Status Type
 * @module domain/types/canonical/sync-types
 * @canonical TRUE - Single source of truth for SyncStatus
 * 
 * Note: Full sync configuration types remain in infrastructure layer.
 * This file contains only the status enum used across layers.
 */

/**
 * Sync operation status (UI-facing)
 * 
 * @remarks
 * - idle: No sync operation in progress
 * - syncing: Sync operation is running
 * - synced: Last sync completed successfully
 * - error: Last sync failed with error
 */
export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

/**
 * All sync status values (for iteration/validation)
 */
export const SYNC_STATUS_VALUES: readonly SyncStatus[] = [
  'idle',
  'syncing',
  'synced',
  'error'
] as const;

/**
 * Check if value is valid SyncStatus
 */
export function isValidSyncStatus(value: string): value is SyncStatus {
  return SYNC_STATUS_VALUES.includes(value as SyncStatus);
}
```

### 7.3 canonical/index.ts

```typescript
/**
 * @fileoverview Canonical Types Barrel Export
 * @module domain/types/canonical
 * 
 * Single source of truth for all canonical type definitions.
 */

// Workspace Types
export type { WorkspaceType } from './workspace-types';
export { WORKSPACE_TYPES, WorkspaceTypeUtils } from './workspace-types';

// Sync Status (UI-facing)
export type { SyncStatus } from './sync-types';
export { SYNC_STATUS_VALUES, isValidSyncStatus } from './sync-types';
```

---

## Appendix A: Evidence Sources

### A.1 Files Scanned

- `src/domain/types/project-ids.ts` - ProjectId, WorkspaceType
- `src/domain/value-objects/workspace-type.ts` - WorkspaceType duplicate
- `src/domain/entities/workspace.ts` - WorkspaceType duplicate
- `src/domain/entities/chat.ts` - WorkspaceType duplicate
- `src/lib/workspace/workspace-types.ts` - SyncStatus, deprecated path
- `src/infrastructure/sync/types/sync-types.ts` - SyncStatus (missing 'synced')
- `src/infrastructure/persistence/stores/statusbar-store.ts` - SyncStatus (has 'synced')
- `src/infrastructure/sync/core/sync-core-types.ts` - WorkspaceType duplicate
- `src/domain/types/plugin-types.ts` - PluginId (clean)
- `new-fundamental-truths.md` - Canonical architecture truth

### A.2 Grep Results

- WorkspaceType definitions: 18 total (8 in active src/)
- SyncStatus definitions: 8 total (3 in active src/)
- Import fragmentation: 26 files importing from 4+ sources

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-01-30 | architect-ext | Initial type registry creation |

---

**END OF DOCUMENT**
