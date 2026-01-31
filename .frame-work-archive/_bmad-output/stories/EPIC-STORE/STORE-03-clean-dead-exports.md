---
story_key: "EPIC-STORE-STORE-03-clean-dead-exports"
epic: "EPIC-STORE"
story: 3
status: "done"
created_at: "2026-01-12T12:15:00+07:00"
version: "2.0"
points: 2
---

# STORE-03: Clean Up Dead Slice Exports

## User Story

**As a** Developer
**I want** all barrel export files to have clean exports with no dead code
**So that** the codebase is maintainable and developers aren't confused by unused exports

### Epic Context
From **EPIC-STORE: Store Consolidation & Conflict Resolution**
- Epic Goal: Consolidate duplicate stores, remove facade overhead, clean up dead code
- This Story Supports: Phase 1 (Dead Code Removal) - Barrel export hygiene
- Epic Progress: 20% complete (2 of 10 stories done)

## Acceptance Criteria

### AC-1: Identify Dead Exports in Barrel Files

**Given** The codebase has barrel export files (index.ts) in various store directories
**When** A systematic scan is performed
**Then** All dead exports are identified and documented

#### Implementation Hints
- Relevant Files:
  - `src/infrastructure/persistence/stores/index.ts` (main barrel)
  - `src/infrastructure/persistence/stores/*/index.ts` (sub-directory barrels)
- Architecture Pattern: Zustand store pattern with barrel exports
- Related Stories: STORE-02 (unused imports already clean)

#### Edge Cases to Handle
- Commented-out exports (dead code, should be removed)
- Type exports that are used in type annotations
- Re-exports for backward compatibility

### AC-2: Remove Dead Exports

**Given** Dead exports have been identified
**When** Removal is performed
**Then** TypeScript compilation still succeeds with no new errors

### AC-3: Verify No Breaking Changes

**Given** Exports have been cleaned
**When** Full TypeScript check is run
**Then** No files fail to compile

## Deep Analysis

### Cross-Impact Mapping

| Workspace | Affected | Impact Level | Key Files |
|-----------|----------|--------------|-----------|
| IDE | ❌ | NONE | N/A |
| Notes | ❌ | NONE | N/A |
| Knowledge | ❌ | NONE | N/A |
| Shared UI | ❌ | NONE | N/A |

#### Dependencies
- **Depends On**: STORE-01, STORE-02
- **Required By**: STORE-04, STORE-05

#### Architectural Impact
- **Layers Touched**: infrastructure (persistence/stores)
- **Clean Architecture**: ✅ COMPLIANT
- **Potential Conflicts**: None detected

### Scan Results

#### Files Scanned (20 barrel export files)
- All `src/infrastructure/persistence/stores/*/index.ts` files
- Main `src/infrastructure/persistence/stores/index.ts`

#### Dead Code Found

**File: `src/infrastructure/persistence/stores/index.ts`**
- Lines 39-45: Commented-out `models-loader-store` exports (DEAD CODE)

```typescript
// Models-loader-store was merged into provider-store (Story AC-1.6)
// Use useAppStore or useProviderStore instead
// export {
//   useModelsStore,
//   useProviderModels as useModelsForProvider,
//   useSelectedModel,
//   type ModelsState,
//   type ModelStateEntry
// } from '@/stores/models-loader-store';
```

**Action**: Remove entire commented section (7 lines)

#### Clean Files
- All other barrel exports are actively used
- No other dead exports found
- Slice index files (`conversation/slices/index.ts`, etc.) are clean

## Tasks

- [x] T1: Scan all barrel export files for dead exports (1h)
- [x] T2: Remove commented-out models-loader-store section (15m)
- [x] T3: Verify TypeScript compilation passes (5m)
- [x] T4: Document findings (15m)

## Dev Notes

### Integration Points
- **Touches**: `src/infrastructure/persistence/stores/index.ts`
- **Breaks**: None
- **Shared With**: All store-consuming code

### Technical Considerations
- Commented-out code serves no description in production
- Git history preserves the information if needed
- The models-loader-store was merged into provider-store in a previous iteration
- Removing dead code reduces confusion about which exports to use

## Status History

| Status | Timestamp | Agent | Notes |
|--------|-----------|-------|-------|
| backlog | 2026-01-12 | SM | From EPIC-STORE epic |
| drafted | 2026-01-12T12:15 | bmad-master | Story file created v2.0 |
| ready-for-implementation | 2026-01-12T12:15 | bmad-master | Scan complete |
| implementation-complete | 2026-01-12T12:30 | bmad-master | Dead exports removed |
| done | 2026-01-12T12:30 | bmad-master | Story complete |

## Dev Agent Record

**Agent**: bmad-master (autonomous orchestrator)
**Approach**: Systematic scan followed by targeted removal
**Result**: 7 lines of dead code removed from stores/index.ts

## Completion Summary

✅ All barrel export files scanned
✅ Dead exports identified and removed
✅ TypeScript compilation verified
✅ **Lines removed**: 7 (commented-out models-loader-store exports)

**Changes Made**:
- File: `src/infrastructure/persistence/stores/index.ts`
- Lines removed: 39-45 (commented-out section)

**Next Story**: STORE-04 - Migrate useConversationStore to useUnifiedChatStore
