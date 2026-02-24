---
title: "Type Canonicalization Implementation Plan"
version: "1.0.0"
status: "READY_FOR_EXECUTION"
created: "2026-01-30"
created_by: "architect-ext"
task_id: "ARCH-01a"
parent_registry: "type-registry-2026-01-30.md"
estimated_effort: "8 hours"
phases: 4
---

# Type Canonicalization Implementation Plan

> **Executive Summary**: This plan provides step-by-step instructions for migrating from fragmented type definitions to a canonical type registry. All phases maintain backward compatibility until final cleanup.

---

## Pre-Execution Checklist

Before starting implementation:

- [ ] Read `type-registry-2026-01-30.md` completely
- [ ] Run `pnpm typecheck:fast` - baseline must pass
- [ ] Run `pnpm test:fast` - baseline must pass
- [ ] Create feature branch: `feat/arch-01a-type-canonicalization`

---

## Phase 1: Create Canonical Directory

**Goal**: Create new canonical type files without breaking anything.
**Risk**: LOW
**Duration**: ~1 hour

### Step 1.1: Create Directory Structure

```bash
mkdir -p src/domain/types/canonical
```

### Step 1.2: Create workspace-types.ts

**File**: `src/domain/types/canonical/workspace-types.ts`

```typescript
/**
 * @fileoverview Canonical Workspace Type Definitions
 * @module domain/types/canonical/workspace-types
 * @canonical TRUE - Single source of truth for WorkspaceType
 * 
 * Per new-fundamental-truths.md and ADR-034:
 * - 4 workspaces: ide, knowledge, study, notes
 * - Workspace determined by routing context, NOT project ID
 * 
 * @created 2026-01-30
 * @task ARCH-01a
 */

/**
 * Workspace Type Enumeration
 * 
 * Represents the 4 valid workspace types in the application.
 */
export type WorkspaceType = 'ide' | 'knowledge' | 'study' | 'notes';

/**
 * All workspace types array (for iteration and validation)
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
  /**
   * Get all workspace types
   */
  static all(): WorkspaceType[] {
    return [...WORKSPACE_TYPES];
  }

  /**
   * Validate workspace type
   */
  static isValid(value: string): value is WorkspaceType {
    return WORKSPACE_TYPES.includes(value as WorkspaceType);
  }

  /**
   * Get workspace label for display
   */
  static getLabel(workspaceType: WorkspaceType): string {
    const labels: Record<WorkspaceType, string> = {
      ide: 'IDE',
      knowledge: 'Knowledge',
      study: 'Study',
      notes: 'Notes'
    };
    return labels[workspaceType];
  }

  /**
   * Get workspace description
   */
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

### Step 1.3: Create sync-types.ts (Domain Layer Status)

**File**: `src/domain/types/canonical/sync-types.ts`

```typescript
/**
 * @fileoverview Canonical Sync Status Type
 * @module domain/types/canonical/sync-types
 * @canonical TRUE - Single source of truth for SyncStatus
 * 
 * Note: Full sync configuration types remain in infrastructure layer.
 * This file contains only the status enum used across layers.
 * 
 * @created 2026-01-30
 * @task ARCH-01a
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

### Step 1.4: Create Barrel Export

**File**: `src/domain/types/canonical/index.ts`

```typescript
/**
 * @fileoverview Canonical Types Barrel Export
 * @module domain/types/canonical
 * 
 * Single source of truth for all canonical type definitions.
 * 
 * @created 2026-01-30
 * @task ARCH-01a
 */

// ============================================================================
// Workspace Types
// ============================================================================

export type { WorkspaceType } from './workspace-types';
export { WORKSPACE_TYPES, WorkspaceTypeUtils } from './workspace-types';

// ============================================================================
// Sync Status (UI-facing)
// ============================================================================

export type { SyncStatus } from './sync-types';
export { SYNC_STATUS_VALUES, isValidSyncStatus } from './sync-types';
```

### Step 1.5: Update Main Barrel Export

**File**: `src/domain/types/index.ts`

Add at the top of the file:

```typescript
// ============================================================================
// Canonical Types (ARCH-01a) - Primary exports
// ============================================================================

export type { WorkspaceType, SyncStatus } from './canonical';
export { 
  WORKSPACE_TYPES, 
  WorkspaceTypeUtils,
  SYNC_STATUS_VALUES,
  isValidSyncStatus 
} from './canonical';
```

### Step 1.6: Verification

```bash
pnpm typecheck:fast  # Must pass
pnpm test:fast       # Must pass
```

**Commit Point**: `feat(types): add canonical type directory [ARCH-01a Phase 1]`

---

## Phase 2: Update Deprecated Files to Re-Export

**Goal**: Make deprecated files re-export from canonical (backward compatibility).
**Risk**: MEDIUM
**Duration**: ~2 hours

### Step 2.1: Update workspace-type.ts Value Object

**File**: `src/domain/value-objects/workspace-type.ts`

Replace the entire file with:

```typescript
/**
 * @fileoverview Workspace Type Value Object
 * @module domain/value-objects/workspace-type
 * 
 * @deprecated Import from '@/domain/types' instead
 * This file re-exports from canonical for backward compatibility.
 * 
 * @migration ARCH-01a - Will be removed after all consumers migrated
 */

// Re-export canonical types
export type { WorkspaceType } from '@/domain/types/canonical';
export { WorkspaceTypeUtils } from '@/domain/types/canonical';
```

### Step 2.2: Update workspace.ts Entity

**File**: `src/domain/entities/workspace.ts`

Replace the WorkspaceType definition (lines 11-14) with:

```typescript
/**
 * Supported workspace types
 * @deprecated Import WorkspaceType from '@/domain/types' instead
 */
export type { WorkspaceType } from '@/domain/types/canonical';
```

Keep all other content (WorkspaceConfig, WorkspaceState, etc.)

### Step 2.3: Update chat.ts Entity

**File**: `src/domain/entities/chat.ts`

Replace the WorkspaceType definition (lines 13-17) with:

```typescript
/**
 * Workspace type enumeration
 * @deprecated Import WorkspaceType from '@/domain/types' instead
 */
export type { WorkspaceType } from '@/domain/types/canonical';
```

Keep all other content (MessageRole, ToolCall, etc.)

### Step 2.4: Update sync-core-types.ts

**File**: `src/infrastructure/sync/core/sync-core-types.ts`

Replace the WorkspaceType definition (lines 9-13) with:

```typescript
/**
 * Workspace type for sync configuration
 * @deprecated Import from '@/domain/types' instead
 */
export type { WorkspaceType } from '@/domain/types/canonical';
```

Keep all other content (SyncDirection, ConflictStrategy, etc.)

### Step 2.5: Update sync-types.ts (Infrastructure)

**File**: `src/infrastructure/sync/types/sync-types.ts`

**CRITICAL**: Add 'synced' to the SyncStatus definition (line 15):

```typescript
/**
 * Status of the sync operation
 * @deprecated Import SyncStatus from '@/domain/types' for new code
 */
export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';
```

This makes it compatible with statusbar-store.ts definition.

### Step 2.6: Verification

```bash
pnpm typecheck:fast  # Must pass - no breaking changes
pnpm test:fast       # Must pass
```

**Commit Point**: `feat(types): add backward-compatible re-exports [ARCH-01a Phase 2]`

---

## Phase 3: Migrate Consumers

**Goal**: Update all consumer files to use canonical imports.
**Risk**: MEDIUM
**Duration**: ~4 hours

### Batch 3A: Project-IDs Consumers (3 files)

Update import statements:

| File | Old Import | New Import |
|------|-----------|------------|
| `src/infrastructure/persistence/stores/project/project-crud-slice.ts` | `from '@/domain/types/project-ids'` | `from '@/domain/types'` |
| `src/infrastructure/persistence/services/project-handle-service.ts` | `from '@/domain/types/project-ids'` | `from '@/domain/types'` |
| `src/infrastructure/sync/pointer-sync-service.ts` | `from '@/domain/types/project-ids'` | `from '@/domain/types'` |

**Pattern**:
```typescript
// OLD
import type { WorkspaceType, ProjectId } from '@/domain/types/project-ids';
import { extractWorkspaceType } from '@/domain/types/project-ids';

// NEW
import type { WorkspaceType, ProjectId } from '@/domain/types';
import { extractWorkspaceType } from '@/domain/types';
```

### Batch 3B: Workspace Entity Consumers (6 files)

Update import statements:

| File | Old Import | New Import |
|------|-----------|------------|
| `src/infrastructure/persistence/stores/workspace/unified-workspace-context.ts` | `from '@/domain/entities/workspace'` | `from '@/domain/types'` |
| `src/infrastructure/persistence/stores/project/project-types.ts` | `from '@/domain/entities/workspace'` | `from '@/domain/types'` |
| `src/domain/services/ProjectRegistry.ts` | `from '@/domain/entities/workspace'` | `from '@/domain/types'` |
| `src/domain/services/project-registry-types.ts` | `from '@/domain/entities/workspace'` | `from '@/domain/types'` |
| `src/infrastructure/persistence/stores/rag/rag-types.ts` | `from '@/domain/entities/workspace'` | `from '@/domain/types'` |
| `src/infrastructure/persistence/stores/workspace/workspace-types.ts` | `from '@/domain/entities/workspace'` | `from '@/domain/types'` |

**Pattern**:
```typescript
// OLD
import type { WorkspaceType } from '@/domain/entities/workspace';

// NEW
import type { WorkspaceType } from '@/domain/types';
```

### Batch 3C: Value Object Consumers (13 files)

Update import statements:

| File |
|------|
| `src/infrastructure/persistence/stores/agents/slices/index.ts` |
| `src/infrastructure/sync/workspace-services/cross-workspace-file-references/cross-workspace-reference-manager.ts` |
| `src/infrastructure/persistence/stores/use-app-store.ts` |
| `src/infrastructure/persistence/stores/agents/types.ts` |
| `src/infrastructure/persistence/stores/workspace/__tests__/workspace-switch-isolation.test.ts` |
| `src/domain/services/file-crud/file-crud-types.ts` |
| `src/infrastructure/persistence/stores/types.ts` |
| `src/domain/services/agent-workspace-utils.ts` |
| `src/infrastructure/sync/workspace-services/cross-workspace-file-references/cross-workspace-reference-types.ts` |
| `src/infrastructure/persistence/stores/workspace/useWorkspaceSwitching.ts` |
| `src/infrastructure/persistence/stores/workspace/useCornerstoneStores.ts` |
| `src/infrastructure/persistence/stores/workspace/workspace-context.ts` |
| `src/shared/types/index.ts` |

**Pattern**:
```typescript
// OLD
import type { WorkspaceType } from '@/domain/value-objects/workspace-type';

// NEW
import type { WorkspaceType } from '@/domain/types';
```

### Batch 3D: Chat Entity Consumers (3 files)

| File | Note |
|------|------|
| `src/presentation/hooks/useThreadManager.ts` | Keep other chat imports |
| `src/infrastructure/persistence/stores/chat/slices/chat-metadata-slice.ts` | Keep other chat imports |

**Pattern**:
```typescript
// OLD
import type { WorkspaceType } from '@/domain/entities/chat';

// NEW
import type { WorkspaceType } from '@/domain/types';
// Keep: import type { ChatMessage, ChatThread } from '@/domain/entities/chat';
```

### Batch 3E: Infrastructure Sync Files (2 files)

| File |
|------|
| `src/infrastructure/sync/workspace-services/file-sync-service.ts` (line 53) |
| `src/infrastructure/persistence/stores/chat/chat-settings-store.ts` (line 23) |

These files have LOCAL definitions that should be DELETED:

```typescript
// DELETE this line entirely:
export type WorkspaceType = 'ide' | 'notes' | 'knowledge' | 'study';

// ADD at imports:
import type { WorkspaceType } from '@/domain/types';
```

### Step 3.99: Verification After Each Batch

```bash
pnpm typecheck:fast  # Must pass after each batch
pnpm test:fast       # Run after completing all batches
```

**Commit Point**: `refactor(types): migrate consumers to canonical imports [ARCH-01a Phase 3]`

---

## Phase 4: Cleanup (OPTIONAL - After Full Verification)

**Goal**: Delete deprecated exports and files.
**Risk**: HIGH
**Duration**: ~30 minutes
**Prerequisite**: All Phase 3 migrations complete and verified

### Step 4.1: Verify No Remaining Imports

```bash
# Search for old import paths
grep -r "from '@/lib/workspace" src/
grep -r "from '@/domain/value-objects/workspace-type'" src/
grep -r "from '@/domain/entities/workspace'" src/ | grep WorkspaceType
grep -r "from '@/domain/entities/chat'" src/ | grep "WorkspaceType"
```

Each should return 0 results for WorkspaceType imports.

### Step 4.2: Delete @/lib/ Type Files

**ONLY after Step 4.1 verification**:

- DELETE: `src/lib/workspace/workspace-types.ts` (if no other exports used)
- DELETE: `src/lib/filesystem/file-snapshot-store/snapshot-cache-slice.ts` WorkspaceType line

### Step 4.3: Final Verification

```bash
pnpm typecheck:fast
pnpm test:fast
pnpm governance
```

**Commit Point**: `chore(types): remove deprecated type exports [ARCH-01a Phase 4]`

---

## Rollback Procedure

If any phase fails:

### Phase 1 Rollback
```bash
rm -rf src/domain/types/canonical/
git checkout src/domain/types/index.ts
```

### Phase 2 Rollback
```bash
git checkout src/domain/value-objects/workspace-type.ts
git checkout src/domain/entities/workspace.ts
git checkout src/domain/entities/chat.ts
git checkout src/infrastructure/sync/core/sync-core-types.ts
git checkout src/infrastructure/sync/types/sync-types.ts
```

### Phase 3 Rollback
```bash
git checkout .  # Revert all consumer changes
```

---

## Success Criteria

| Criteria | Measurement |
|----------|-------------|
| All type definitions centralized | 1 canonical location per type |
| No duplicate definitions | 0 local WorkspaceType definitions in src/ |
| All imports use canonical paths | 0 imports from deprecated paths |
| TypeScript compiles | `pnpm typecheck:fast` passes |
| Tests pass | `pnpm test:fast` passes |
| Governance passes | `pnpm governance` passes |

---

## Post-Migration Tasks

After successful migration:

1. **Update ESLint rules** to forbid deprecated import paths
2. **Add to governance checks** validation of canonical imports
3. **Document in AGENTS.md** the canonical import contract
4. **Create ADR** documenting this architectural decision

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-01-30 | architect-ext | Initial implementation plan |

---

**END OF IMPLEMENTATION PLAN**
