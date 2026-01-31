---
title: "ADR-040: Canonical Type Registry"
status: "ACCEPTED"
date: "2026-01-30"
decision-makers: "architect-ext-team-b"
technical-story: "ARCH-01a"
related:
  - "type-registry-2026-01-30.md"
  - "type-registry-implementation-plan-2026-01-30.md"
  - "ADR-039"
---

# ADR-040: Canonical Type Registry

## Status
ACCEPTED

## Context

Type definitions were scattered across 10+ files, causing significant architectural problems:

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

### Impact on Development

- **Agent "refuktor" cycles**: AI agents create duplicate type definitions when they can't find canonical location
- **Import confusion**: Developers don't know which import path to use
- **Maintenance burden**: Changes require updating 8+ files instead of 1
- **Type safety risks**: Incompatible definitions can cause runtime errors

## Decision

### 1. Canonical Type Locations

All domain types MUST be defined in `src/domain/types/`:

| Type | Canonical Location | Status |
|------|-------------------|--------|
| `WorkspaceType` | `src/domain/types/canonical/workspace-types.ts` | NEW |
| `SyncStatus` | `src/domain/types/canonical/sync-types.ts` | NEW |
| `ProjectId` | `src/domain/types/project-ids.ts` | KEEP |
| `PluginId` | `src/domain/types/plugin-types.ts` | KEEP |

### 2. Canonical Type Definitions

#### WorkspaceType

```typescript
/**
 * Workspace type enumeration - the 4 valid workspace types
 *
 * @canonical src/domain/types/canonical/workspace-types.ts
 * @remarks Workspace is determined by routing context, not project ID
 */
export type WorkspaceType = 'ide' | 'knowledge' | 'study' | 'notes';
```

#### SyncStatus

```typescript
/**
 * Sync operation status
 *
 * @canonical src/domain/types/canonical/sync-types.ts
 * @remarks 'synced' indicates successful completion
 */
export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';
```

### 3. Import Contract

**MUST use**:
```typescript
import type { WorkspaceType } from '@/domain/types';
import type { ProjectId, AnyProjectId, BrandedProjectId } from '@/domain/types';
import type { PluginId, PluginCategory } from '@/domain/types';
import type { SyncStatus, SyncProgress, SyncResult, SyncError } from '@/infrastructure/sync/types';
```

**MUST NOT use**:
- `@/lib/*` - Deprecated layer, violates architecture
- `@/domain/entities/workspace` for WorkspaceType - Should come from types, not entities
- `@/domain/entities/chat` for WorkspaceType - Should come from types, not entities
- `@/domain/value-objects/workspace-type` - Redundant, types owns primitives

### 4. Migration Strategy

Deprecated locations MUST re-export from canonical until migrated:

| Deprecated Location | Action |
|---------------------|--------|
| `src/domain/value-objects/workspace-type.ts` | Re-export from canonical |
| `src/domain/entities/workspace.ts` | Re-export from canonical |
| `src/domain/entities/chat.ts` | Re-export from canonical |
| `src/infrastructure/sync/core/sync-core-types.ts` | Import from canonical |
| `src/infrastructure/sync/types/sync-types.ts` | Add 'synced' value |
| `src/lib/workspace/workspace-types.ts` | Delete after migration |

### 5. Enforcement

- **ESLint rule** to enforce import paths
- **Governance checks** to detect duplicate definitions
- **Pre-commit checklist** for agents creating new types

## Consequences

### Positive

- **Single source of truth**: All types defined in one canonical location
- **Reduced maintenance**: Changes require updating 1 file instead of 8+
- **Agent predictability**: AI agents can reliably find canonical types
- **Type safety**: Eliminates incompatible definitions
- **Import clarity**: Developers know exactly which path to use

### Negative

- **Migration effort**: 26 files need import migration (~4 hours)
- **Breaking changes**: Deprecated paths must be removed after migration
- **Learning curve**: Team must adopt new import patterns

### Neutral

- **Backward compatibility**: Re-exports maintain compatibility during migration
- **Rollback strategy**: All deprecated files contain re-exports (safe to revert)

## Migration Impact

| Category | File Count | Estimated Effort |
|----------|------------|------------------|
| New files to create | 4 | 1 hour |
| Files to update (re-export) | 5 | 2 hours |
| Consumer files to migrate | 26 | 4 hours |
| Files to delete | 2 | 30 minutes |
| **TOTAL** | 37 files | **~8 hours** |

## Related ADRs

- **ADR-039**: Consolidated Project-Centric Architecture - Establishes project-centric model
- **ADR-041**: 4-Layer State Architecture - Defines state layer boundaries
- **ADR-042**: Agent Brownfield Guard - Enforces governance rules

## References

- `type-registry-2026-01-30.md` - Complete type registry analysis
- `type-registry-implementation-plan-2026-01-30.md` - Step-by-step migration plan
- `new-fundamental-truths.md` - Architectural decisions source
- `AGENTS.md` - Governance rules

---

**Decision Date**: 2026-01-30
**Effective**: Immediately
**Review Date**: 2026-02-28 (after migration complete)