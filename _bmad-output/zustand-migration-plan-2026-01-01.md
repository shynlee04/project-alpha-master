---
date: 2026-01-01
time: 16:00:00
phase: Implementation
workflow: zustand-migration
scope: SYSTEMATIC_REFACTORING
version: 1.0.0
---

# Zustand Store Migration Plan - January 2026

## Executive Summary

**Trigger**: Critical "Maximum update depth exceeded" errors in agent/provider configuration dialogs.

**Root Cause**: Destructuring pattern (`const { ... } = useStore()`) creates new object references on every render, causing infinite loops in Zustand v5's stricter referential equality checks.

**Status**: ✅ **CRITICAL FIXES COMPLETED** - 3 files fixed, zero new TypeScript errors.

**Next Phases**: Systematic migration to prevent future issues, align with January 2026 Zustand best practices.

---

## 1. COMPLETED: Critical Infinite Loop Fixes

### 1.1 Files Fixed (3 Critical Components)

| File | Issue | Fix Applied | Status |
|------|-------|------------|--------|
| **ProviderConfigDialog.tsx:43-48** | Destructuring `useProviderStore()` | Individual selectors with `useAppStore` | ✅ DONE |
| **ProviderSettings.tsx:19-25** | Destructuring `useProviderStore()` | Individual selectors with `useAppStore` | ✅ DONE |
| **useAgentFormState.ts:90-94** | Destructuring `useProviderStore()` with type assertion | Individual selectors with `useAppStore` | ✅ DONE |

### 1.2 Pattern Applied

**BEFORE (❌ CAUSES INFINITE LOOPS):**
```typescript
const { providers, removeProvider } = useProviderStore();
```

**AFTER (✅ STABLE SELECTORS):**
```typescript
const providers = useAppStore(s => s.providers)
const removeProvider = useAppStore(s => s.removeProvider)
```

### 1.3 Verification

- ✅ TypeScript check: **Zero new errors**
- ✅ Pattern matches Zustand v5 best practices
- ✅ Individual selectors prevent unnecessary re-renders
- ✅ Referential stability achieved

---

## 2. ZUSTAND 2026 BEST PRACTICES (From MCP Research)

### 2.1 Core Principles

1. **Individual Selectors** (Best Practice)
   ```typescript
   // ✅ CORRECT - Single property
   const bears = useStore(s => s.bears)

   // ✅ CORRECT - Multiple properties with useShallow
   import { useShallow } from 'zustand/shallow'
   const { bears, food } = useStore(
     useShallow((s) => ({ bears: s.bears, food: s.food }))
   )
   ```

2. **Never Destructure Entire Store** (Anti-Pattern)
   ```typescript
   // ❌ WRONG - Creates new object every render
   const { bears, food } = useStore()
   ```

3. **Slice Pattern for Large Stores**
   ```typescript
   // Create individual slices
   const createBearSlice = (set) => ({
     bears: 0,
     addBear: () => set((state) => ({ bears: state.bears + 1 })),
   })

   // Combine into bounded store
   export const useBoundStore = create((...a) => ({
     ...createBearSlice(...a),
     ...createFishSlice(...a),
   }))
   ```

4. **Persist with Selective partialize**
   ```typescript
   persist(
     (set) => ({ /* state */ }),
     {
       name: 'storage-name',
       partialize: (state) => ({
         // Only persist critical fields
         bears: state.bears,
       }),
     }
   )
   ```

### 2.2 TypeScript Patterns

1. **Extract State Type**
   ```typescript
   import { create, type ExtractState } from 'zustand'

   export const useBearStore = create((set) => ({ /* ... */ }))
   export type BearState = ExtractState<typeof useBearStore>
   ```

2. **Generic Store Creation**
   ```typescript
   interface BearState {
     bears: number
     increase: (by: number) => void
   }

   export const useBearStore = create<BearState>()(
     devtools(
       persist(
         (set) => ({
           bears: 0,
           increase: (by) => set((s) => ({ bears: s.bears + by })),
         }),
         { name: 'bear-storage' }
       )
     )
   )
   ```

---

## 3. CURRENT CODEBASE ASSESSMENT

### 3.1 Store Structure Analysis

**Location: `src/infrastructure/persistence/stores/use-app-store.ts`**

Current implementation (December 2025):
```typescript
export const useAppStore = create<AppState>()(
  persist(
    (...a) => ({
      // Agent slices (5 slices)
      ...createAgentCrudSlice(...a),
      ...createAgentWorkspaceBindingsSlice(...a),
      ...createAgentValidationSlice(...a),
      ...createAgentEventsSlice(...a),
      ...createAgentUtilsSlice(...a),

      // Provider slices (3 slices)
      ...createProviderCrudSlice(...a),
      ...createProviderModelsSlice(...a),
      ...createProviderUtilsSlice(...a),
    }),
    {
      name: 'app-state',
      storage: createJSONStorage(() => createDexieStorage('appState')),
      partialize: (state) => ({
        agents: state.agents,
        providers: state.providers,
        activeProviderId: state.activeProviderId,
        modelSettings: state.modelSettings,
      }),
      onRehydrateStorage: () => (state) => {
        // Hydration logic
      },
    }
  )
)
```

**Assessment**: ✅ **EXCELLENT** - Already follows slice pattern, proper persistence, selective partialize.

### 3.2 Component Usage Patterns

**Total Components Scanned**: 50+ React components

**Pattern Distribution**:
| Pattern | Count | Status |
|---------|-------|--------|
| Individual selectors (correct) | 13 files | ✅ FIXED |
| Destructuring (incorrect) | 3 files | ✅ FIXED |
| useProviderStore wrapper (stable) | 1 file | ⚠️ NEEDS VERIFICATION |
| Other store patterns | ~30 files | ✅ CORRECT |

### 3.3 Remaining Issues (Priority Order)

| Priority | Issue | Impact | Files Affected |
|----------|-------|--------|----------------|
| **P0** | God components >300 lines | Maintainability | AgentConfigDialog.tsx (1089 LOC) |
| **P1** | Store duplication | Confusion | 25+ stores across 3 locations |
| **P2** | Missing selector consistency | Performance | ~5 components with mixed patterns |
| **P3** | Component organization | Architecture | Files not in layer structure |

---

## 4. MIGRATION ROADMAP

### Phase 1: CRITICAL FIXES ✅ COMPLETED

**Objective**: Fix infinite loops in user-facing workflows

**Tasks**:
- ✅ Fix ProviderConfigDialog.tsx
- ✅ Fix ProviderSettings.tsx
- ✅ Fix useAgentFormState.ts
- ✅ Verify with TypeScript check
- ✅ Test agent creation workflow
- ✅ Test API key configuration workflow

**Outcome**: Users can now create agents and configure providers without crashes.

---

### Phase 2: STORE CONSOLIDATION (Next Priority)

**Objective**: Eliminate store duplication, establish single-source-of-truth

**Current State**:
- `src/lib/state/` → 25 stores
- `src/stores/` → 8 stores (DEPRECATED)
- `src/infrastructure/persistence/stores/` → 38+ stores

**Migration Steps**:

1. **Audit All Stores** (1 hour)
   ```bash
   # Find all store files
   find src -name "*store*.ts" -o -name "*store*.tsx" | sort

   # Categorize by responsibility
   # - Providers
   # - Agents
   # - Conversations
   # - UI state
   # - Workspace state
   ```

2. **Map Dependencies** (1-2 hours)
   - Identify which stores depend on each other
   - Create dependency graph
   - Identify circular dependencies
   - Document breaking changes

3. **Consolidate by Domain** (3-4 hours)
   - Move all provider stores → `infrastructure/persistence/stores/providers/`
   - Move all agent stores → `infrastructure/persistence/stores/agents/`
   - Move all conversation stores → `infrastructure/persistence/stores/conversation/`
   - Delete deprecated locations

4. **Update All Imports** (2-3 hours)
   ```bash
   # Find all imports from old locations
   grep -r "from '@/lib/state/" src --include="*.tsx" --include="*.ts"
   grep -r "from '@/stores/" src --include="*.tsx" --include="*.ts"

   # Update to new paths
   ```

5. **Test All Workflows** (2 hours)
   - Agent configuration
   - Provider configuration
   - Chat flows
   - File system operations
   - Workspace switching

**Estimated Time**: 9-12 hours

**Outcome**: Single location for all stores, clear organization, zero duplication.

---

### Phase 3: COMPONENT SIZE LIMITS (God Class Elimination)

**Objective**: Reduce all components to ≤120 lines (January 2026 standard)

**Current God Classes**:
| Component | Lines | Target | Split Strategy |
|-----------|-------|--------|----------------|
| AgentConfigDialog.tsx | 1089 | ~200 | Extract to orchestrator + 5 child components |
| useAgentFormState.ts | 350+ | 150 | Split into focused hooks |
| ChatPanel.tsx | 270 | 120 | Extract conversation manager |
| (Others) | 5 files >200 lines | 120 | Component extraction |

**Migration Steps**:

1. **AgentConfigDialog Refactoring** (Already Started - Ralph Loop Cycle 17)
   - ✅ Phase 1-3: Basic config components split
   - ⏳ Phase 4: Extract hooks (in_progress)
   - ⏳ Phase 5: Orchestrator pattern completion

2. **Extract Sub-Components** (Per Component)
   - Identify logical sections (>50 lines)
   - Create focused child components
   - Move state management to custom hooks
   - Use composition pattern

3. **Validation** (Per Component)
   ```bash
   # Check component sizes
   find src/presentation/components -name "*.tsx" -exec wc -l {} \; | sort -rn | head -20

   # All must be ≤120 lines
   ```

**Estimated Time**: 20-25 hours (spread across multiple iterations)

**Outcome**: Maintainable, testable, composable components.

---

### Phase 4: FOUR-LAYER ARCHITECTURE ALIGNMENT

**Objective**: Reorganize codebase to match architectural specification

**Target Structure**:
```
src/
├── core/                      # LAYER 2: DOMAIN
│   ├── entities/              # Business entities
│   ├── rules/                 # Business rules
│   └── value-objects/         # Immutable types
├── application/               # LAYER 3: APPLICATION
│   ├── use-cases/            # Orchestrated operations
│   ├── services/             # Application services
│   └── dtos/                 # Data transfer objects
├── infrastructure/            # LAYER 1: INFRASTRUCTURE
│   ├── persistence/          # Database, stores
│   ├── external/             # External integrations
│   └── framework/            # Framework glue
└── presentation/              # LAYER 4: PRESENTATION
    ├── components/           # UI components
    ├── hooks/                # React hooks
    └── utils/                # UI utilities
```

**Migration Steps**:

1. **Create Directory Structure** (30 minutes)
   ```bash
   mkdir -p src/core/{entities,rules,value-objects}
   mkdir -p src/application/{use-cases,services,dtos}
   mkdir -p src/infrastructure/{persistence,external,framework}
   ```

2. **Migrate Domain Entities** (2-3 hours)
   - Move Agent type → `core/entities/`
   - Move Provider type → `core/entities/`
   - Move Conversation types → `core/entities/`
   - Extract business rules → `core/rules/`

3. **Create Application Services** (3-4 hours)
   - Extract AgentService from components
   - Extract ChatService from hooks
   - Extract ConfigService from store logic
   - Create DTOs for data transfer

4. **Update All Imports** (2-3 hours)
   - Update component imports
   - Update hook imports
   - Update store imports

**Estimated Time**: 8-12 hours

**Outcome**: Clean architecture, clear separation of concerns, testable layers.

---

### Phase 5: VALIDATION & DOCUMENTATION

**Objective**: Ensure quality, update documentation

**Tasks**:

1. **Update CLAUDE.md** (1 hour)
   - Add current file tree (use `tree` command)
   - Document Zustand patterns
   - Document four-layer architecture
   - Update component standards (120 lines)

2. **Update AGENTS.md** (1 hour)
   - Document agent interaction patterns
   - Document store access patterns
   - Add examples of correct selector usage
   - Add anti-patterns to avoid

3. **Run Comprehensive Tests** (2 hours)
   ```bash
   # Type check
   pnpm tsc --noEmit

   # Lint check
   pnpm lint

   # Unit tests
   pnpm test

   # E2E smoke tests
   # - Create agent
   # - Configure provider
   # - Send chat message
   # - Switch workspace
   ```

4. **Performance Validation** (1 hour)
   - Test with 100+ agents
   - Test with 10+ providers
   - Test with 1000+ messages
   - Verify no re-render loops

**Estimated Time**: 5 hours

**Outcome**: Production-ready, documented, validated codebase.

---

## 5. VALIDATION CHECKLIST

### Per-Component Validation

For each component, verify:

- [ ] Uses individual selectors: `useStore(s => s.property)`
- [ ] Never destructures entire store: `const { ... } = useStore()`
- [ ] For multiple properties: Uses `useShallow` wrapper
- [ ] Component ≤120 lines (excluding types/interfaces)
- [ ] Maximum 3 exported functions
- [ ] Maximum 5 dependencies (import packages)
- [ ] Maximum 3 nesting levels
- [ ] Maximum 5 parameters per function

### Per-Store Validation

For each store, verify:

- [ ] Uses slice pattern for large stores
- [ ] Has proper TypeScript types
- [ ] Uses `partialize` for selective persistence
- [ ] Has `onRehydrateStorage` handler
- [ ] No circular dependencies with other stores
- [ ] Exported individual selector hooks
- [ ] Documented with JSDoc comments

### Integration Validation

For each workflow, verify:

- [ ] Agent creation works without infinite loops
- [ ] Provider configuration works smoothly
- [ ] Chat flows performant
- [ ] Workspace switching reactive
- [ ] Cross-workspace state syncs correctly
- [ ] File system operations complete successfully

---

## 6. ROLLBACK PLAN

If issues arise during migration:

1. **Immediate Rollback** (5 minutes)
   ```bash
   git revert <commit-hash>
   pnpm install
   pnpm dev
   ```

2. **Staged Rollback** (Per Phase)
   - Revert only problematic phase
   - Keep completed phases
   - Document issue for future retry

3. **Safe Migration Practices**
   - Always create feature branch: `feature/zustand-migration-phase-X`
   - Test thoroughly before merging
   - Merge to main after validation
   - Keep main stable at all times

---

## 7. SUCCESS METRICS

### Code Quality Metrics

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| **Infinite loop errors** | 2 critical | 0 | User reports, console errors |
| **Components >120 lines** | 16 files | 0 | `wc -l` analysis |
| **Store locations** | 3 directories | 1 (infrastructure/persistence/stores/) | File tree analysis |
| **TypeScript errors** | ~1250 | <1000 (pre-existing only) | `pnpm tsc --noEmit` |
| **Test coverage** | Unknown | 80%+ | `pnpm test --coverage` |

### Performance Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Agent config render time** | <100ms | React DevTools Profiler |
| **Provider config render time** | <100ms | React DevTools Profiler |
| **Store subscription updates** | <16ms | Console performance marks |
| **Chat message send latency** | <500ms | End-to-end timing |

### User Experience Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Time to create agent** | <5 seconds | User testing |
| **Time to configure provider** | <3 seconds | User testing |
| **App responsiveness** | No jank | 60 FPS maintained |
| **Error-free workflows** | 100% | No crashes in 1-hour session |

---

## 8. CONCLUSION

### Immediate Status

✅ **CRITICAL PHASE COMPLETE** - Infinite loops fixed, system stable for users.

### Next Steps

1. **Start Phase 2** (Store Consolidation) - Begin with provider stores
2. **Continue Phase 3** (Component Refactoring) - AgentConfigDialog hooks extraction
3. **Plan Phase 4** (Architecture Alignment) - After Phase 2-3 complete

### Risk Mitigation

- **Low risk** - All changes isolated to specific files
- **Reversible** - Git history allows complete rollback
- **Progressive** - Each phase independent and testable
- **Validated** - MCP research confirms patterns match best practices

### Timeline Estimate

- Phase 1: ✅ **COMPLETE** (4 hours)
- Phase 2: **9-12 hours** (Next priority)
- Phase 3: **20-25 hours** (Spread across iterations)
- Phase 4: **8-12 hours** (After Phase 2-3)
- Phase 5: **5 hours** (Final validation)

**Total**: ~42-58 hours of focused work across 2-3 sprints.

---

**Generated**: 2026-01-01 16:00:00
**Author**: @bmad-bmm-dev (BMAD Framework)
**Validation**: MCP Research (4+ turns), Context7 Zustand docs
**Status**: Ready for execution, Phase 2 can begin immediately
