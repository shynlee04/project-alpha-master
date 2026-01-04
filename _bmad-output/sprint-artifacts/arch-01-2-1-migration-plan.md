# State Consolidation Migration Plan

**Story**: ARCH-01.2-1
**Date**: 2026-01-05T00:25:00+07:00
**Status**: READY_FOR_EXECUTION

---

## Executive Summary

This document provides the complete migration plan for consolidating state management from `src/lib/state/` to `src/infrastructure/persistence/stores/`.

**Goals:**
1. Fix 8 circular dependencies (infrastructure → lib/state)
2. Migrate `workspace-store.ts` and `workspace-types.ts` to infrastructure
3. Delete duplicate `knowledge/` folder from lib/state
4. Update all consumers to use infrastructure paths
5. Convert legacy files to facades for backward compatibility

---

## Phase 1: Fix Circular Dependencies (BLOCKING)

### 1.1 Copy workspace-types.ts to Infrastructure

**Source**: `src/lib/state/workspace-types.ts` (79 lines)
**Target**: `src/infrastructure/persistence/stores/workspace/workspace-types.ts`

```bash
# Copy file to new location
cp src/lib/state/workspace-types.ts \
   src/infrastructure/persistence/stores/workspace/workspace-types.ts
```

**Update barrel export:**
```typescript
// src/infrastructure/persistence/stores/workspace/index.ts
export * from './workspace-types';
```

### 1.2 Copy workspace-store.ts to Infrastructure

**Source**: `src/lib/state/workspace-store.ts` (216 lines)
**Target**: `src/infrastructure/persistence/stores/workspace/workspace-store.ts`

**Required Changes:**
1. Update import of `workspace-types` to relative path
2. Update import of `crossWorkspaceEventBus` to absolute infrastructure path
3. Keep store logic unchanged

```typescript
// OLD (in lib/state)
import type { WorkspaceType } from './workspace-types';
import { crossWorkspaceEventBus } from '../events/cross-workspace-event-bus';

// NEW (in infrastructure)
import type { WorkspaceType } from './workspace-types';
import { crossWorkspaceEventBus } from '@/infrastructure/events/cross-workspace-event-bus';
```

### 1.3 Update Infrastructure Consumers

These files currently import from `@/lib/state/workspace-store` and must be updated:

| File | Current Import | New Import |
|------|---------------|------------|
| `src/infrastructure/persistence/stores/workspace/index.ts` | `@/lib/state/workspace-store` | `./workspace-store` |
| `src/infrastructure/persistence/stores/workspace/workspace-provider.tsx` | `@/lib/state/workspace-store` | `./workspace-store` |
| `src/infrastructure/persistence/stores/providers/provider-models-slice.ts` | `@/lib/state/workspace-store` | `@/infrastructure/persistence/stores/workspace` |
| `src/infrastructure/persistence/stores/agents/slices/agent-events-slice.ts` | `@/lib/state/workspace-store` | `@/infrastructure/persistence/stores/workspace` |

### 1.4 Create Facades for Backward Compatibility

**src/lib/state/workspace-store.ts** (new facade):
```typescript
/**
 * @deprecated Use '@/infrastructure/persistence/stores/workspace' instead
 */
export * from '@/infrastructure/persistence/stores/workspace/workspace-store';
```

**src/lib/state/workspace-types.ts** (new facade):
```typescript
/**
 * @deprecated Use '@/infrastructure/persistence/stores/workspace/workspace-types' instead
 */
export * from '@/infrastructure/persistence/stores/workspace/workspace-types';
```

---

## Phase 2: Update External Consumers

### 2.1 Production Components (P0 - Must Update)

| Component | Current Import | Action |
|-----------|----------------|--------|
| `src/hooks/useWorkspaceContext.ts` | `@/lib/state/workspace-store` | Keep (facade will work) |
| `src/lib/agent/workspace-execution-context.ts` | `@/lib/state/workspace-store`, `workspace-types` | Keep (facade will work) |
| `src/presentation/components/agent/*.tsx` (7 files) | `@/lib/state/workspace-types` | Keep (facade will work) |

**Note**: Since facades re-export from infrastructure, these will work without changes. Future cleanup can update to direct infrastructure imports.

### 2.2 Test Files (P1 - Batch Update Later)

All test files using old imports will continue to work via facades.

---

## Phase 3: Delete Duplicate knowledge/ Folder

### 3.1 Pre-requisite Check

Before deletion, verify no direct imports of `@/lib/state/knowledge`:

```bash
grep -r "from '@/lib/state/knowledge" src/ --include='*.ts*' | grep -v __tests__
```

**Found consumers** (must update first):
- `src/presentation/components/knowledge/CollectionManager.tsx`
- `src/presentation/components/knowledge/CollectionSelector.tsx`
- `src/presentation/components/knowledge/MetadataEditor.tsx`
- `src/presentation/components/knowledge/SourceCard.tsx`
- `src/presentation/components/knowledge/SourceCardGrid.tsx`
- `src/presentation/components/knowledge/SourceMetadataDialog.tsx`
- `src/presentation/components/knowledge/SourcePreviewPanel.tsx`
- `src/presentation/components/knowledge/SynthesisDialog.tsx`

**Action**: Update these to import from `@/infrastructure/persistence/stores/knowledge`

### 3.2 Create Facade (Optional)

If updating all 8+ files is too risky, create facade first:

```typescript
// src/lib/state/knowledge/index.ts
/**
 * @deprecated Use '@/infrastructure/persistence/stores/knowledge' instead
 */
export * from '@/infrastructure/persistence/stores/knowledge';
```

### 3.3 Delete Folder

After confirming all imports work:

```bash
rm -rf src/lib/state/knowledge/
```

---

## Validation Checklist

After each phase, run:

```bash
# TypeScript compilation
pnpm typecheck

# Validation script
bash scripts/validate-state-consolidation.sh
```

### Success Criteria

| Check | Phase 1 Target | Final Target |
|-------|----------------|--------------|
| Circular dependencies | 0 | 0 |
| TypeScript errors | 0 | 0 |
| knowledge/ folder | Exists | Deleted |
| workspace-store.ts in infrastructure | ✓ | ✓ |
| workspace-types.ts in infrastructure | ✓ | ✓ |

---

## Rollback Plan

If any phase fails:

1. **Restore from git**: `git checkout -- src/`
2. **Keep facades**: Existing facades will continue working
3. **Partial progress**: Each phase is independent; can stop after any phase

---

## Execution Order

```
[ ] Phase 1.1: Copy workspace-types.ts
[ ] Phase 1.2: Copy workspace-store.ts (update imports)
[ ] Phase 1.3: Update 4 infrastructure consumers
[ ] Phase 1.4: Create facades in lib/state
[ ] RUN: pnpm typecheck
[ ] RUN: bash scripts/validate-state-consolidation.sh
[ ] Phase 2.1: (Optional) Update production components
[ ] Phase 3.1: Check knowledge/ consumers
[ ] Phase 3.2: (Optional) Create knowledge facade
[ ] Phase 3.3: Delete knowledge/ folder
[ ] FINAL: Run full validation
```

---

## Estimated Timeline

| Phase | Duration | Cumulative |
|-------|----------|------------|
| Phase 1 (Circular Fix) | 2h | 2h |
| Phase 2 (External Consumers) | 1h | 3h |
| Phase 3 (Knowledge Cleanup) | 1h | 4h |
| Validation & Testing | 1h | 5h |

**Total**: 5 hours

---

*Migration plan created by @bmad-bmm-dev (Team B)*
