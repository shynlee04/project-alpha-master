# ═══════════════════════════════════════════════════════════════════════════
# STORY: GU-A-01 - Unify Provider Type Definitions
# ═══════════════════════════════════════════════════════════════════════════

**Epic**: EPIC-GU (Grand Unification Refactor)
**Target**: Target A - LLM & Agent Config Unification
**Story ID**: GU-A-01
**Status**: backlog
**Created**: 2026-01-09T23:45:00+07:00

---

## User Story

**As a** developer maintaining the LLM provider system,
**I want** a single source of truth for all provider-related type definitions,
**So that** I don't encounter type conflicts, circular dependencies, or confusion about which types to import.

---

## Context & Problem Statement

### Current State (Based on Codebase Analysis)

**Duplicate Type Definitions Found**:

| Type | Location 1 | Location 2 | Lines |
|------|-----------|-----------|-------|
| `ProviderConfig` | `src/lib/agent/providers/types.ts` | `src/infrastructure/persistence/stores/providers/types.ts` | Duplicate |
| `ModelInfo` | `src/lib/agent/providers/types.ts` | `src/infrastructure/persistence/stores/providers/types.ts` | Duplicate |
| `ProviderType` | `src/lib/agent/providers/types.ts` | `src/infrastructure/persistence/stores/providers/types.ts` | Duplicate |
| `StoredCredential` | `src/lib/agent/providers/credential-vault.ts` | `src/infrastructure/persistence/stores/providers/` | Duplicate |

**Impact**:
- Type import confusion throughout codebase
- Maintenance burden (changes must be made in 2+ places)
- Circular type import at `providers/types.ts:34`
- Violates DRY principle

### Root Cause

The provider system evolved organically:
1. Original implementation in `src/lib/agent/providers/`
2. New unified store created in `src/infrastructure/persistence/stores/providers/`
3. Types were copied instead of migrated, creating duplication

---

## Acceptance Criteria

| AC ID | Criterion | Verification Method |
|-------|-----------|---------------------|
| AC-1 | Single canonical location for all provider types | `grep -r "ProviderConfig" src/` shows 1 definition |
| AC-2 | All imports use canonical path | `pnpm typecheck` passes with zero errors |
| AC-3 | Backward compatibility maintained via re-exports | Existing consuming files still compile |
| AC-4 | No circular type dependencies | Graph analysis shows 0 cycles |
| AC-5 | Type definitions ≤ 200 lines per file | `wc -l` on canonical files |

---

## Technical Approach

### Phase 1: Create Canonical Type Location

**New Structure**:
```
src/domain/types/llm/
├── index.ts                           # Barrel export (backward compat)
├── provider-types.ts                  # All provider-related types
├── model-types.ts                     # Model-related types
├── credential-types.ts                # API key/credential types
└── adapter-types.ts                   # Provider adapter interfaces
```

### Phase 2: Migration Strategy

1. **Create canonical types** in new location
2. **Update exports** in old locations (re-export from domain)
3. **Update imports** incrementally by workspace:
   - IDE workspace first
   - Knowledge workspace second
   - Study workspace third
   - Notes workspace last
4. **Delete old type files** only after all consumers migrated

### Phase 3: Facade Pattern

```typescript
// src/lib/agent/providers/types.ts (BEFORE - contains definitions)
// src/lib/agent/providers/types.ts (AFTER - facade re-export)

// Facade for backward compatibility
export type {
  ProviderConfig,
  ProviderType,
  ModelInfo,
  StoredCredential,
  // ... all other provider types
} from '@/domain/types/llm';

// Deprecation warning
/** @deprecated Use from '@/domain/types/llm' instead */
export const PROVIDERS_DEPRECATED = false;
```

---

## Files to Create

| File | Purpose | Est. Lines |
|------|---------|-----------|
| `src/domain/types/llm/provider-types.ts` | Provider config types | 80 |
| `src/domain/types/llm/model-types.ts` | Model info types | 60 |
| `src/domain/types/llm/credential-types.ts` | Credential types | 50 |
| `src/domain/types/llm/adapter-types.ts` | Adapter interfaces | 40 |
| `src/domain/types/llm/index.ts` | Barrel export | 20 |

## Files to Modify

| File | Change Type | Risk |
|------|-------------|------|
| `src/lib/agent/providers/types.ts` | Convert to facade | Low |
| `src/infrastructure/persistence/stores/providers/types.ts` | Convert to facade | Low |
| `src/lib/agent/providers/credential-vault.ts` | Update imports | Low |
| `src/lib/agent/providers/model-registry.ts` | Update imports | Low |
| `src/infrastructure/persistence/stores/providers/index.ts` | Update imports | Low |
| `src/presentation/components/agent/ProviderConfigDialog.tsx` | Update imports | Low |
| `src/presentation/components/agent/ProviderSettings.tsx` | Update imports | Low |

## Files to Delete (After Migration Complete)

| File | Deletion Condition |
|------|---------------------|
| `src/lib/agent/providers/types.ts` | All consumers migrated to domain types |
| `src/infrastructure/persistence/stores/providers/types.ts` | All consumers migrated to domain types |

---

## Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| GU-A-00 | Domain layer structure created | **BLOCKER** |
| EPIC-38-05 | Domain entities pattern established | Complete ✅ |

---

## Effort Estimation

| Task | Est. Time |
|------|-----------|
| Create canonical type files | 1h |
| Create facades in old locations | 0.5h |
| Update imports (incremental) | 1.5h |
| Verification (typecheck, tests) | 0.5h |
| **Total** | **3.5h** |

---

## Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking existing imports | Medium | High | Facade pattern maintains compatibility |
| Circular type dependency persists | Low | Medium | Careful import structuring |
| Runtime errors after migration | Low | High | Comprehensive testing |

---

## Definition of Done

- [ ] Canonical type files created in `src/domain/types/llm/`
- [ ] Old type files converted to facades (re-export only)
- [ ] All consumer imports updated to canonical path
- [ ] `pnpm typecheck` passes with zero errors (code files only)
- [ ] No circular dependencies detected
- [ ] Backward compatibility verified (all consuming files compile)
- [ ] AGENTS.md updated with new canonical paths
- [ ] Story marked DONE in sprint status

---

## Notes

- **This story is about TYPES ONLY** - no store implementation changes yet
- Store consolidation (GU-A-02) will depend on completed type unification
- Facade pattern allows gradual migration without breaking changes
- Domain types location aligns with ADR-029 Clean Architecture compliance

---

**Story File**: `_bmad-output/sprint-artifacts/stories/epic-gu-story-a-01-unify-provider-types.md`
**Workflow**: BMAD Story-Cycle v2.0
**Next Step**: Step 02 - Validate Story
