---
date: 2026-01-01
time: 18:45:00
phase: Implementation
workflow: correct-course-planning
scope: COMPREHENSIVE_ARCHITECTURAL_TRANSFORMATION
validation_score: PENDING
---

# Correct-Course Plan: Comprehensive Architectural Transformation

**Based On:**
- `_bmad-output/architectural-gap-analysis-2025-12-31.md`
- `_bmad-output/arc-module-gap-analysis-2025-12-31.md`
- `_bmad-output/prompts/2025-12-28/dev-cycle-prompt.md`
- `_bmad-output/validation/sweeping-validation.md`

**Research Completed:**
- ✅ December 2025 Zustand patterns (4 MCP turns)
- ✅ Dexie + Zustand integration patterns
- ✅ Slice pattern + single bounded store architecture
- ✅ Persist middleware best practices

---

## Executive Summary

**Current Status:**
- Phase 0 (Foundation): ✅ COMPLETE
- Phase 1 (Architecture): ❌ NEEDS DEFINITION
- Phase 2 (Full System): ❌ NEEDS DEFINITION
- Phase 3 (Validation): ❌ NEEDS DEFINITION

**Validation Score:**
- ARC Module: 95/100 (PASSED)
- 3 Critical Gaps Remaining:
  1. AgentConfigDialog.tsx (1089 LOC god class)
  2. Context management (summarization/pruning)
  3. 3-Device rule testing

**Correct-Course Strategy:**
Progressive refactoring following December 2025 Zustand patterns with:
- 4-layer architecture enforcement
- Component size limits (120 lines, not 300)
- Slice pattern for modular stores
- Dexie persistence with selective partialize
- Event-driven cross-workspace communication

---

## Phase 1: Architecture Compliance (Foundational)

### P1-TASK-1: Complete Four-Layer Architecture Separation

**Reference:** `architectural-gap-analysis-2025-12-31.md` (Section 2.1)

**Target State:**
```
src/
├── core/                   # LAYER 2: DOMAIN (Pure business logic)
│   ├── entities/           # Business entities (Agent, LLMProvider, Conversation)
│   ├── rules/              # Business rules (validation)
│   └── value-objects/      # Immutable value types
├── application/            # LAYER 3: APPLICATION (Use cases)
│   ├── use-cases/          # Orchestrated operations
│   ├── services/           # Application services (AgentService, ChatService)
│   └── dtos/               # Data transfer objects
├── infrastructure/         # LAYER 1: INFRASTRUCTURE
│   ├── persistence/        # Dexie implementations
│   ├── external/           # LLM adapters, credential vault
│   └── framework/          # Zustand middleware, React hooks
└── presentation/           # LAYER 4: PRESENTATION
    ├── components/         # UI components (max 120 lines)
    ├── hooks/              # Custom React hooks
    └── stores/             # Zustand stores (single bounded)
```

**Actions:**
1. ✅ **COMPLETED**: Core layer exists (`src/core/entities/`, `src/domain/value-objects/`)
2. ✅ **COMPLETED**: Infrastructure layer (`src/infrastructure/persistence/`)
3. ✅ **COMPLETED**: Presentation layer (`src/presentation/components/`)
4. ⚠️ **PARTIAL**: Application layer (`src/application/services/` exists but not fully utilized)

**Remaining Work:**
- Extract business logic from UI components → Application services
- Create DTOs for data transfer between layers
- Document layer boundaries in ADR format

**Validation:** `sweeping-validation.md` Level 6 (Architecture Compliance)

---

### P1-TASK-2: Enforce Component Size Limits (120 Lines)

**Reference:** `architectural-gap-analysis-2025-12-31.md` (Section 1.3)

**Current Violations:**
| File | Lines | Target | Split Required |
|------|-------|--------|----------------|
| `AgentConfigDialog.tsx` | 1089 | 120 | ✅ Into 9 components |
| `ChatPanel.tsx` | 400+ | 120 | Split into 4 components |
| `UnifiedChatPanel.tsx` | 350+ | 120 | Split into 3 components |

**Split Pattern:**
```
AgentConfigDialog.tsx (1089 LOC)
├── AgentConfigDialog.tsx (120 LOC) - Main container
├── AgentConfigBasicInfo.tsx (90 LOC) - Name, description
├── AgentConfigProviderSelect.tsx (80 LOC) - Provider dropdown
├── AgentConfigModelSelector.tsx (100 LOC) - Model selection
├── AgentConfigWorkspacePermissions.tsx (120 LOC) - Workspace bindings
├── AgentConfigToolPermissions.tsx (110 LOC) - Tool access
├── AgentConfigValidationFeedback.tsx (70 LOC) - Error display
├── AgentConfigAdvancedSettings.tsx (95 LOC) - Temperature, max tokens
└── AgentConfigActions.tsx (60 LOC) - Save, cancel, delete
```

**Actions:**
1. Create `_bmad-output/split-plans/agent-config-dialog-split.md` with detailed component breakdown
2. Use React component composition pattern (container + presentational)
3. Share state via Zustand selectors (no prop drilling)
4. Test each component independently

**Validation:** `sweeping-validation.md` Level 1 (File size <120 lines)

---

### P1-TASK-3: Fix Circular Dependencies via Single Bounded Store

**Reference:** `arc-module-gap-analysis-2025-12-31.md` (Section 4 - Dependency Sanity)

**Current Issues:**
- ❌ `agents-store.ts` ↔ `provider-store.ts` (circular import)
- ❌ Store cross-imports breaking layer boundaries

**December 2025 Pattern:**
```typescript
// ✅ CORRECT: Single bounded store with slices
export const useAppStore = create<AppState>()(
  persist(
    (...a) => ({
      // Slice 1: Agent CRUD (pure operations)
      ...createAgentCrudSlice(...a),

      // Slice 2: Provider CRUD
      ...createProviderCrudSlice(...a),

      // Slice 3: Cross-slice communication via get()
      ...createAgentProviderSlice(...a),
    }),
    {
      name: 'app-state',
      storage: createDexieStorage('appState'),
      partialize: (state) => ({
        // Selective persistence (ephemeral state excluded)
        agents: state.agents,
        providers: state.providers,
        // NOT: validationErrors, _hasHydrated, availableModels
      }),
    }
  )
);
```

**Actions:**
1. ✅ **COMPLETED**: Created `use-app-store.ts` with single bounded store
2. ✅ **COMPLETED**: Split provider store into 3 slices (CRUD, Models, Utils)
3. ✅ **COMPLETED**: Added `appState` table to Dexie schema (v19)
4. ⚠️ **IN PROGRESS**: Migrate all consumers to use `useAppStore`
5. ⏳ **TODO**: Delete deprecated stores after migration

**Cross-Slice Communication Pattern:**
```typescript
// ❌ WRONG: Direct import
import { useProviderStore } from './provider-store';

// ✅ CORRECT: Use get() to access other slices
createAgentValidationSlice((set, get) => ({
  validateAgent: (agentId) => {
    const agent = get().agents.find(a => a.id === agentId);
    const provider = get().providers.find(p => p.id === agent.providerId);
    // Validation logic using cross-slice data
  }
}));
```

**Validation:**
- `sweeping-validation.md` Level 4 (Dependency Sanity)
- Run: `pnpm madge --circular src/` → 0 circular dependencies

---

## Phase 2: State Management Refactoring

### P2-TASK-1: Eliminate Store Duplication Crisis

**Reference:** `arc-module-gap-analysis-2025-12-31.md` (Section 1.1)

**Current Duplication:**
| Store | Location 1 | Location 2 | Location 3 | Action |
|-------|-----------|-----------|-----------|--------|
| Provider | `src/lib/state/provider-store.ts` (765 lines) | `src/stores/provider-config-store.ts` | `src/infrastructure/persistence/stores/providers/` | Consolidate → 1 location |
| Agent | `src/stores/agents-store.ts` (430 lines) | `src/infrastructure/persistence/stores/agents/` | `src/lib/state/agent-store.ts` | Consolidate → 1 location |
| Conversation | `src/lib/state/conversation-store.ts` | `src/stores/conversation-threads-store.ts` | `src/infrastructure/persistence/stores/conversation/` | Consolidate → 1 location |

**Target Architecture:**
```
Single Source of Truth:
└── src/infrastructure/persistence/stores/
    ├── use-app-store.ts (MAIN BOUNDED STORE)
    ├── agents/
    │   ├── index.ts (barrel export)
    │   └── slices/ (5 slices <300 lines each)
    ├── providers/
    │   ├── index.ts (barrel export)
    │   └── slices/ (3 slices <300 lines each)
    └── conversation/
        ├── index.ts (barrel export)
        └── slices/ (3 slices <300 lines each)

Deprecated (DELETE after migration):
├── src/stores/*.ts (OLD LOCATION - DELETE)
└── src/lib/state/*.ts (DUPLICATES - DELETE)
```

**Migration Steps:**
1. **Phase 1** (✅ DONE): Create unified store with slices
2. **Phase 2** (⏳ TODO): Update all imports via search/replace:
   ```bash
   # Find all imports
   grep -r "from '@/stores/agents-store'" src/
   grep -r "from '@/lib/state/provider-store'" src/

   # Replace with unified import
   find src/ -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i.bak \
     "s|from '@/stores/agents-store'|from '@/infrastructure/persistence/stores/agents'|g"
   ```
3. **Phase 3** (⏳ TODO): Delete deprecated stores
4. **Phase 4** (⏳ TODO): Update documentation

**Validation:**
- `sweeping-validation.md` Level 1 (State Integrity)
- Run: `pnpm build` → 0 module resolution errors

---

### P2-TASK-2: Implement Selective Persistence (partialize)

**Reference:** December 2025 Zustand research (persist middleware docs)

**Current Issues:**
- ❌ Ephemeral state persisted to IndexedDB (bloat)
- ❌ Validation errors cached across sessions
- ❌ Available models re-fetched every load

**December 2025 Pattern:**
```typescript
export const useAppStore = create<AppState>()(
  persist(
    (...a) => ({ /* slices */ }),
    {
      name: 'app-state',
      storage: createDexieStorage('appState'),

      // ✅ Selective persistence (CRITICAL)
      partialize: (state) => ({
        // PERSISTED (survives browser reload)
        agents: state.agents,
        activeAgentId: state.activeAgentId,
        providers: state.providers,
        activeProviderId: state.activeProviderId,
        modelSettings: state.modelSettings,

        // NOT PERSISTED (ephemeral, recomputed on load)
        // - validationErrors (cleared on reload)
        // - _hasHydrated (runtime flag)
        // - availableModels (fetched on demand)
        // - isLoading (ephemeral)
        // - isLoadingModels (ephemeral)
        // - selectedModelId (ephemeral)
        // - modelCache (rebuild on demand)
      }),
    }
  )
);
```

**Actions:**
1. ✅ **COMPLETED**: `use-app-store.ts` has proper partialize
2. ✅ **COMPLETED**: `onRehydrateStorage` handler validates data
3. ⏳ **TODO**: Add `_hasHydrated` flag check in all components
4. ⏳ **TODO**: Show skeleton UI until hydration complete

**Validation:**
- `sweeping-validation.md` Level 1 (Selector Hydration)
- Test: Hard refresh → No flash of empty state

---

### P2-TASK-3: Implement Event-Driven Cross-Workspace Reactivity

**Reference:** `arc-module-gap-analysis-2025-12-31.md` (Section 3 - Agent Config System)

**Current Status:**
- ✅ Event bus implemented (`src/infrastructure/events/`)
- ✅ Workspace events defined (`WorkspaceChangeEvent`)
- ⚠️ **NOT FULLY WIRED**: Not all stores emit events on mutations

**Required Events:**
| Event | Emitter | Listener | Purpose |
|-------|---------|----------|---------|
| `agent:created` | `addAgent()` | Workspace switcher | Update agent lists |
| `agent:updated` | `updateAgent()` | Agent config UI | Refresh UI |
| `agent:deleted` | `removeAgent()` | All workspaces | Remove from selections |
| `provider:key-set` | `setApiKey()` | Model loader | Fetch models |
| `provider:models-loaded` | `fetchModels()` | Agent config | Populate model dropdown |
| `workspace:changed` | Workspace switcher | All stores | Update context |

**Implementation Pattern:**
```typescript
// agents/slices/agent-crud-slice.ts
export const createAgentCrudSlice: StateCreator<...> = (set, get) => ({
  addAgent: (agent) => {
    set((state) => ({ agents: [...state.agents, agent] }));

    // ✅ Emit event for cross-workspace reactivity
    emitStoreEvent('agent:created', { agent });
  },

  removeAgent: (agentId) => {
    set((state) => ({
      agents: state.agents.filter(a => a.id !== agentId)
    }));

    // ✅ Emit event
    emitStoreEvent('agent:deleted', { agentId });
  }
});
```

**Actions:**
1. ✅ **COMPLETED**: Event bus infrastructure exists
2. ⏳ **TODO**: Wire events in all slice actions
3. ⏳ **TODO**: Subscribe to events in UI components
4. ⏳ **TODO**: Test cross-workspace reactivity

**Validation:**
- `sweeping-validation.md` Level 1 (State Flow Completeness)
- Test: Change setting → Navigate → Return → State persists

---

## Phase 3: UI/UX Refactoring (God Class Elimination)

### P3-TASK-1: Split AgentConfigDialog.tsx (1089 LOC)

**Reference:** `arc-module-gap-analysis-2025-12-31.md` (Section 3 - Remaining Gaps)

**Current Issues:**
- ❌ 1089 lines (9x the 120-line limit)
- ❌ Mixed concerns (config, validation, permissions, UI state)
- ❌ Hard to test and maintain

**Split Plan:**

```
AgentConfigDialog.tsx (Main Container - 120 lines)
├── Uses: useAppStore() for state
├── Manages: Dialog open/close, current step
└── Renders: Tab-based interface

Tabs:
├── [Basic Info] → AgentConfigBasicInfo.tsx (90 lines)
├── [Provider] → AgentConfigProviderSelect.tsx (80 lines)
├── [Model] → AgentConfigModelSelector.tsx (100 lines)
├── [Workspaces] → AgentConfigWorkspacePermissions.tsx (120 lines)
├── [Tools] → AgentConfigToolPermissions.tsx (110 lines)
└── [Advanced] → AgentConfigAdvancedSettings.tsx (95 lines)

Shared Components:
├── AgentConfigValidationFeedback.tsx (70 lines)
└── AgentConfigActions.tsx (60 lines)
```

**Component Contract:**
```typescript
// AgentConfigDialog.tsx (Main)
interface AgentConfigDialogProps {
  agentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AgentConfigDialog({ agentId, open, onOpenChange }: AgentConfigDialogProps) {
  const agent = useAppStore((state) => state.agents.find(a => a.id === agentId));
  const updateAgent = useAppStore((state) => state.updateAgent);

  // Container logic only (no UI rendering)
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Tabs defaultValue="basic">
        <TabsList>
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="provider">Provider</TabsTrigger>
          {/* ... */}
        </TabsList>

        <TabsContent value="basic">
          <AgentConfigBasicInfo agent={agent} onSave={updateAgent} />
        </TabsContent>

        {/* ... */}
      </Tabs>
    </Dialog>
  );
}
```

**Benefits:**
- Each component <120 lines ✅
- Single responsibility per component ✅
- Testable in isolation ✅
- Reusable across workspaces ✅

**Actions:**
1. Create detailed split plan document
2. Extract components one by one (test each extraction)
3. Update all imports after split
4. Integration test (ensure no regressions)

**Validation:** `sweeping-validation.md` Level 1 (Component size <120 lines)

---

### P3-TASK-2: Create P0 Event Activity Indicators

**Reference:** Recursive auto-loop requirements (UX/UI event indicators)

**Required Components:**

| Priority | Component | Purpose | Status |
|----------|-----------|---------|--------|
| P0-1 | `SyncStatusVisualization.tsx` | Show file sync queue details | ⏳ TODO |
| P0-2 | `EmbeddingProgressIndicator.tsx` | Show RAG embedding progress | ⏳ TODO |
| P0-3 | `ChunkingProgressIndicator.tsx` | Show document chunking status | ⏳ TODO |
| P0-4 | `IndexingProgressIndicator.tsx` | Show database indexing progress | ⏳ TODO |
| P0-5 | `ModelFetchProgressIndicator.tsx` | Show model fetching status | ⏳ TODO |
| P0-6 | `AgentConfigValidationFeedback.tsx` | Show agent validation errors | ✅ COMPLETE |
| P0-7 | `AgentWorkspaceBindingConfig.tsx` | Workspace binding UI | ✅ COMPLETE |
| P0-8 | `AgentWorkspaceSwitchingFeedback.tsx` | Switching transition feedback | ✅ COMPLETE |

**Component Pattern (Event Activity Indicators):**
```typescript
// SyncStatusVisualization.tsx
export function SyncStatusVisualization() {
  const syncQueue = useSyncStatusStore((state) => state.syncQueue);
  const isSyncing = syncQueue.some(item => item.status === 'syncing');

  return (
    <div className="sync-status-visualization">
      <div className="sync-header">
        <Text>Sync Queue ({syncQueue.length} pending)</Text>
        {isSyncing && <Spinner size="sm" />}
      </div>

      <div className="sync-list">
        {syncQueue.map(item => (
          <SyncQueueItem
            key={item.id}
            path={item.path}
            status={item.status}
            progress={item.progress}
            error={item.error}
          />
        ))}
      </div>
    </div>
  );
}
```

**Event State Structure:**
```typescript
// sync-status-store.ts
interface SyncQueueItem {
  id: string;
  path: string;
  status: 'pending' | 'syncing' | 'completed' | 'failed';
  progress: number; // 0-100
  error?: string;
  timestamp: Date;
}

interface SyncStatusState {
  syncQueue: SyncQueueItem[];
  lastSyncTime: Date | null;
  isPaused: boolean;
}
```

**Actions:**
1. Create P0-1 through P0-5 components (event activity indicators)
2. Wire to existing stores (sync-status-store, rag-store)
3. Add to appropriate workspace layouts
4. Test with real data (file sync, RAG indexing, model fetching)

**Validation:**
- `sweeping-validation.md` Level 8 (I18N Wiring)
- All strings use `t()` hook
- Vietnamese translations added

---

## Phase 4: TypeScript Error Reduction

### P4-TASK-1: Reduce TypeScript Errors from 1,172 to <200

**Reference:** `sweeping-validation.md` Level 2 (Code Hygiene)

**Current Error Analysis:**
```bash
pnpm tsc --noEmit 2>&1 | grep "error TS" | wc -l
# Output: 1172 errors (as of last run)
```

**Error Categories:**
| Category | Count | Fix Strategy |
|----------|-------|--------------|
| Unused imports | ~400 | Run `pnpm build` + fix imports |
| Type mismatches | ~300 | Add proper type annotations |
| Missing dependencies | ~200 | Install missing packages |
| Prop drilling errors | ~150 | Fix component prop types |
| Module resolution | ~122 | Fix import paths |

**Fix Strategy:**

**Batch 1: Remove Unused Imports (Automated)**
```bash
# Use eslint-plugin-unused-imports
pnpm eslint --fix 'src/**/*.{ts,tsx}'
```

**Batch 2: Fix Type Mismatches**
```typescript
// ❌ WRONG
const agent = useAgentsStore((state) => state.agents.find(id));

// ✅ CORRECT
const agent = useAgentsStore((state) => state.agents.find(a => a.id === id));
```

**Batch 3: Add Type Annotations to Components**
```typescript
// ❌ WRONG
export function AgentConfigDialog({ agentId, open }) {

// ✅ CORRECT
interface AgentConfigDialogProps {
  agentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AgentConfigDialog({ agentId, open, onOpenChange }: AgentConfigDialogProps) {
```

**Batch 4: Fix Import Paths**
```typescript
// ❌ WRONG (deep import)
import { Agent } from '@/core/entities/Agent';

// ✅ CORRECT (barrel export)
import { Agent } from '@/core/entities';
```

**Actions:**
1. Run TypeScript check: `pnpm tsc --noEmit > ts-errors.txt`
2. Categorize errors by type
3. Fix in batches (unused imports → types → props → paths)
4. Re-run check after each batch
5. Stop when <200 errors remaining

**Validation:**
- `sweeping-validation.md` Level 2 (No Unused Imports)
- Target: <200 TypeScript errors

---

## Phase 5: Documentation & File Tree

### P5-TASK-1: Run Tree Command and Update Documentation

**Reference:** Recursive auto-loop requirements (run tree + update docs after 1-2 iterations)

**Current State:**
- CLAUDE.md last updated: 2025-12-28
- AGENTS.md last updated: 2025-12-28
- File tree outdated (missing new directories)

**Actions:**

**Step 1: Generate Current File Tree**
```bash
tree -L 4 -I 'node_modules|dist|.git' > /tmp/current-tree.txt
```

**Step 2: Update CLAUDE.md**
- Update "Key Directories & Files" section
- Add new directories: `core/`, `application/`, `infrastructure/`, `presentation/`
- Update component count (294 total)
- Update store count (38+ in infrastructure/persistence/stores/)

**Step 3: Update AGENTS.md**
- Add new section: "Four-Layer Architecture"
- Document Zustand slice pattern
- Document Dexie persistence strategy
- Update agent interaction patterns

**Step 4: Create Architecture Documentation**
```
_bmad-output/architecture/
├── four-layer-architecture.md
├── zustand-slice-pattern.md
├── dexie-persistence-strategy.md
└── event-driven-reactivity.md
```

**Validation:**
- `sweeping-validation.md` Level 11 (Documentation Completeness)
- All API endpoints documented with request/response schemas

---

## Execution Roadmap

### Cycle 1: Foundation (Days 1-3)
- ✅ Fix DEFAULT_AGENT export error
- ✅ Add appState table to Dexie (v19)
- ✅ Split provider store into slices
- ⏳ Migrate all stores to use-app-store.ts
- ⏳ Delete deprecated stores

### Cycle 2: Component Refactoring (Days 4-7)
- ⏳ Split AgentConfigDialog.tsx (1089 LOC → 9 components)
- ⏳ Split ChatPanel.tsx (400 LOC → 4 components)
- ⏳ Create P0 event activity indicators (5 components)
- ⏳ Test each component independently

### Cycle 3: TypeScript Fixes (Days 8-10)
- ⏳ Remove unused imports (400 errors)
- ⏳ Fix type mismatches (300 errors)
- ⏳ Add type annotations to components
- ⏳ Fix import paths
- ⏳ Target: <200 errors remaining

### Cycle 4: Event System (Days 11-13)
- ⏳ Wire events in all slice actions
- ⏳ Subscribe to events in UI components
- ⏳ Test cross-workspace reactivity
- ⏳ Document event patterns

### Cycle 5: Documentation (Days 14-15)
- ⏳ Run tree command
- ⏳ Update CLAUDE.md and AGENTS.md
- ⏳ Create architecture diagrams
- ⏳ Write component prop documentation

### Cycle 6: 3-Device Validation (Days 16-18)
- ⏳ Test on Desktop Chrome (macOS/Windows)
- ⏳ Test on Mobile Safari (iOS 16+)
- ⏳ Test on Android Chrome (mid-range)
- ⏳ Fix all device-specific issues

---

## Success Metrics

**Phase Completion Criteria:**

### Phase 1: Architecture Compliance
- ✅ Single bounded store implemented
- ✅ All stores use slice pattern
- ✅ Cross-slice communication via `get()`
- ✅ 0 circular dependencies (`pnpm madge --circular src/`)

### Phase 2: State Management
- ✅ 0 duplicate stores
- ✅ Selective persistence (ephemeral state excluded)
- ✅ Hydration race conditions fixed
- ✅ State flow complete (Action → Zustand → Dexie → IndexedDB)

### Phase 3: UI/UX Refactoring
- ✅ All components <120 lines
- ✅ AgentConfigDialog split into 9 components
- ✅ P0 event indicators created (8/8 complete)
- ✅ Components testable in isolation

### Phase 4: TypeScript Quality
- ✅ <200 TypeScript errors
- ✅ 0 unused imports
- ✅ All components have proper type annotations
- ✅ 0 import path errors

### Phase 5: Documentation
- ✅ Tree command output in CLAUDE.md
- ✅ AGENTS.md updated with 4-layer architecture
- ✅ Architecture diagrams created
- ✅ All APIs documented

### Phase 6: Cross-Device Validation
- ✅ Desktop Chrome: Full IDE mode works
- ✅ Mobile Safari: Demo mode works
- ✅ Android Chrome: Offline test passes
- ✅ All touch targets ≥44×44px
- ✅ State survives browser reload

---

## Risk Mitigation

**Risk 1: Breaking Changes During Migration**
- **Mitigation**: Use facade pattern (backward compatibility)
- **Example**: `src/stores/agents-store.ts` re-exports from new location
- **Rollback**: Keep deprecated files until all consumers migrated

**Risk 2: Performance Regression from Split Components**
- **Mitigation**: Use React.memo() for expensive components
- **Validation**: React DevTools Profiler before/after
- **Rollback**: Revert split if render time increases >20%

**Risk 3: IndexedDB Quota Exceeded**
- **Mitigation**: Implement auto-pruning (FIFO, keep last 50 conversations)
- **Validation**: Fill 500MB → Warning → Prune works
- **Rollback**: Adjust retention policy if quota issues persist

**Risk 4: Event Storm (Too Many Events)**
- **Mitigation**: Debounce rapid events (e.g., `agent:updated` during drag)
- **Validation**: Monitor event bus throughput during testing
- **Rollback**: Implement event batching if performance degrades

---

## Next Steps

**Immediate (This Session):**
1. ⏳ Run tree command to capture current file structure
2. ⏳ Create detailed split plan for AgentConfigDialog.tsx
3. ⏳ Start migration of deprecated stores
4. ⏳ Begin TypeScript error reduction (Batch 1: unused imports)

**Short-Term (Next 2-3 Sessions):**
1. Complete store migration (delete deprecated files)
2. Split AgentConfigDialog.tsx into 9 components
3. Create P0 event activity indicators (5 remaining components)
4. Reduce TypeScript errors to <200

**Long-Term (Next 1-2 Weeks):**
1. Complete all phases (1-6)
2. Full 3-device validation
3. Documentation complete
4. All validation levels passed (1-12)

---

## Appendix: References

**Documents Used:**
- `_bmad-output/architectural-gap-analysis-2025-12-31.md`
- `_bmad-output/arc-module-gap-analysis-2025-12-31.md`
- `_bmad-output/prompts/2025-12-28/dev-cycle-prompt.md`
- `_bmad-output/validation/sweeping-validation.md`

**December 2025 Patterns Researched:**
- Zustand persist middleware (official docs)
- Dexie + Zustand integration
- Slice pattern for modular stores
- Single bounded store architecture
- Event-driven cross-workspace communication

**MCP Tools Used (4 Turns):**
1. MiniMax web search (Zustand persist patterns)
2. Web-reader (official Zustand docs)
3. MiniMax web search (Dexie + Zustand)
4. MiniMax web search (slice patterns)

---

**Status:** READY FOR APPROVAL
**Next Action:** Present plan to user and await approval before execution
