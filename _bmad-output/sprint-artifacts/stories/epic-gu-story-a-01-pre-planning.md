# ═══════════════════════════════════════════════════════════════════════════
# PRE-PLANNING SUMMARY: GU-A-01 - Unify Provider Type Definitions
# ═══════════════════════════════════════════════════════════════════════════

**Story**: GU-A-01
**Date**: 2026-01-09T23:58:00+07:00
**Status**: PRE-PLANNING COMPLETE ✅
**Gate Result**: PASS - Proceed to Implementation

---

## Research Validation

### Sources Consulted

| # | Source | Topic | Key Insight |
|---|--------|-------|-------------|
| 1 | [Clean Architecture with DDD & Onion](https://bazaglia.com/clean-architecture-with-typescript-ddd-onion/) | Domain Layer | Domain types in dedicated layer with NO dependencies on infrastructure ✅ |
| 2 | [React — Managing Chaos with Zustand](https://medium.com/@janek.lewandoski/react-managing-chaos-with-zustand-78b42acd70ba) | Facade Pattern | Facade pattern VALIDATED for backward compatibility ✅ |
| 3 | [Using Barrel Pattern in React/TypeScript](https://medium.com/@denisultanoglu/using-barrel-pattern-in-react-typescript-projects-e8e855730182) | Barrel Exports | index.ts barrel exports are RECOMMENDED practice ✅ |
| 4 | [Zustand v5 Migration Guide](https://zustand.docs.pmnd.rs/migrations/migrating-to-v5) | Zustand v5 | Approach aligns with v5 best practices ✅ |

### Validation Result

**All research sources VALIDATE the proposed approach in story GU-A-01:**

1. ✅ **Domain Layer Organization**: `src/domain/types/llm/` structure follows Clean Architecture DDD principles
2. ✅ **Facade Pattern**: Re-export facades for backward compatibility is industry best practice
3. ✅ **Barrel Exports**: Using index.ts for clean imports is recommended pattern
4. ✅ **No Breaking Changes**: Gradual migration via facades prevents disruption

---

## Technical Approach Confirmation

### Phase 1: Create Canonical Type Location ✅

```
src/domain/types/llm/
├── index.ts                    # Barrel export (backward compat)
├── provider-types.ts           # ProviderConfig, ProviderType
├── model-types.ts              # ModelInfo, ModelSettings
├── credential-types.ts         # StoredCredential, ApiKeyConfig
└── adapter-types.ts            # ProviderAdapter interfaces
```

### Phase 2: Migration Strategy ✅

1. Create canonical types in new location
2. Convert old type files to facades (re-export only)
3. Add `@deprecated` comments to old exports
4. Update imports incrementally
5. Delete old files after full migration

### Phase 3: Facade Pattern ✅

```typescript
// src/lib/agent/providers/types.ts (AFTER - facade)
export type {
  ProviderConfig,
  ProviderType,
  ModelInfo,
  StoredCredential,
} from '@/domain/types/llm';

/** @deprecated Use from '@/domain/types/llm' instead */
export const PROVIDERS_DEPRECATED = false;
```

---

## Risk Mitigation Confirmed

| Risk | Mitigation | Status |
|------|------------|--------|
| Breaking existing imports | Facade pattern maintains compatibility | ✅ LOW RISK |
| Type mismatches between versions | Lib version (more detailed) as canonical | ✅ MITIGATED |
| Circular dependency persists | Domain layer has NO dependencies on lib/infrastructure | ✅ SOLVED |
| Runtime errors | Type changes only - no runtime code affected | ✅ LOW RISK |

---

## Implementation Readiness

### Prerequisites Checked

| Prerequisite | Status |
|--------------|--------|
| Story file created | ✅ COMPLETE |
| Story validated | ✅ COMPLETE |
| Context XML created | ✅ COMPLETE |
| Context validated (freshness check) | ✅ COMPLETE |
| Pre-planning research (MCP servers) | ✅ COMPLETE |
| Technical approach validated | ✅ COMPLETE |

### Files to Create (5 files)

| File | Est. Lines | description |
|------|-----------|---------|
| `src/domain/types/llm/provider-types.ts` | 80 | Provider config types |
| `src/domain/types/llm/model-types.ts` | 60 | Model info types |
| `src/domain/types/llm/credential-types.ts` | 50 | Credential types |
| `src/domain/types/llm/adapter-types.ts` | 40 | Adapter interfaces |
| `src/domain/types/llm/index.ts` | 20 | Barrel export |

### Files to Modify (2 files → facades)

| File | Change Type | Risk |
|------|-------------|------|
| `src/lib/agent/providers/types.ts` | Convert to facade | LOW |
| `src/infrastructure/persistence/stores/providers/types.ts` | Convert to facade | LOW |

### Files to Update Imports (10 files)

- `src/presentation/components/agent/ProviderConfigDialog.tsx`
- `src/presentation/components/agent/ProviderSettings.tsx`
- `src/presentation/components/agent/useAgentConfigProvider.ts`
- `src/presentation/components/agent/hooks/useAgentFormState.ts`
- `src/presentation/components/agent/AgentConfigForm/AgentProviderSelector.tsx`
- `src/infrastructure/persistence/stores/agents/types.ts`
- `src/infrastructure/persistence/stores/agents/slices/agent-workspace-bindings-slice.ts`
- `src/core/entities/Provider.ts`
- `src/lib/hooks/useProviderEvents.ts`
- `src/lib/settings/settings-exporter.ts`

---

## Acceptance Criteria Verification Plan

| AC | Criterion | Verification Method |
|----|-----------|---------------------|
| AC-1 | Single canonical location | `grep -r "interface ProviderConfig" src/ | wc -l == 1` |
| AC-2 | All imports use canonical path | `pnpm typecheck` passes with zero errors |
| AC-3 | Backward compatibility maintained | Existing consuming files still compile |
| AC-4 | No circular type dependencies | Dependency graph shows 0 cycles |
| AC-5 | Type definitions ≤ 200 lines per file | `wc -l` on canonical files |

---

## Effort Estimation Confirmed

| Task | Est. Time |
|------|-----------|
| Create canonical type files | 1h |
| Create facades in old locations | 0.5h |
| Update imports (incremental) | 1.5h |
| Verification (typecheck, tests) | 0.5h |
| **Total** | **3.5h** |

---

## Gate Decision

**PRE-PLANNING GATE: ✅ PASS**

All research validates the proposed approach. Risk is LOW. Technical approach aligns with industry best practices for:
- Domain-Driven Design (DDD)
- Clean Architecture
- TypeScript module organization
- Zustand v5 patterns

**Recommendation**: PROCEED to Step 06 (Dev Story)

---

**Sources**:
- [Clean Architecture with DDD & Onion](https://bazaglia.com/clean-architecture-with-typescript-ddd-onion/)
- [React — Managing Chaos with Zustand](https://medium.com/@janek.lewandoski/react-managing-chaos-with-zustand-78b42acd70ba)
- [Using Barrel Pattern in React/TypeScript Projects](https://medium.com/@denisultanoglu/using-barrel-pattern-in-react-typescript-projects-e8e855730182)
- [Zustand v5 Migration Guide](https://zustand.docs.pmnd.rs/migrations/migrating-to-v5)
