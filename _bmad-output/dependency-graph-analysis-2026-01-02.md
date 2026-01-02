# Dependency Graph Analysis - Via-gent Migration Assessment

**Generated**: 2026-01-02
**Purpose**: Identify import dependencies, circular dependencies, and safe refactoring paths
**Methodology**: Static analysis of `from '@/...'` imports across codebase

---

## 1. IMPORT HOTSPOTS (Top 20 Most Imported Modules)

| Rank | Module | Import Count | Category | Risk Level |
|------|--------|--------------|----------|------------|
| 1 | `core/entities/Agent` | 25 | Domain entity | LOW (stable) |
| 2 | `lib/state/dexie-db` | 18 | Database | HIGH (duplicate) |
| 3 | `domain/value-objects/workspace-type` | 18 | Domain type | LOW (stable) |
| 4 | `lib/agent/providers/credential-vault` | 10 | Security | LOW (stable) |
| 5 | `infrastructure/persistence/stores/agents` | 9 | Store | MEDIUM (changing) |
| 6 | `lib/rag/types` | 8 | RAG types | MEDIUM (evolving) |
| 7 | `infrastructure/events/event-bus` | 7 | Events | LOW (stable) |
| 8 | `lib/events/cross-workspace-event-bus` | 7 | Events | LOW (stable) |
| 9 | `hooks/useMediaQuery` | 7 | Hook | LOW (stable) |
| 10 | `lib/filesystem/local-fs-adapter` | 7 | File system | LOW (stable) |
| 11 | `infrastructure/persistence/stores/use-app-store` | 5 | Store | MEDIUM (changing) |
| 12 | `lib/workspace` | 5 | Workspace | MEDIUM (evolving) |
| 13 | `lib/utils/mobile-error-handling` | 5 | Utils | LOW (stable) |
| 14 | `lib/webcontainer` | 5 | WebContainer | LOW (stable) |
| 15 | `lib/state/workspace-store` | 4 | Store | HIGH (duplicate) |
| 16 | `lib/workspace/project-store` | 4 | Store | HIGH (duplicate) |
| 17 | `lib/events` | 4 | Events | LOW (stable) |
| 18 | `lib/state/dexie-storage` | 4 | Storage | MEDIUM (refactored) |
| 19 | `lib/workspace/workspace-detector` | 3 | Workspace | LOW (stable) |
| 20 | `lib/agent` | 3 | Agent | LOW (stable) |

**Key Insights**:
- Database imports (rank 2, 15-16) are high-risk due to duplicate locations
- Store imports (rank 5, 11, 15, 18) are medium-risk due to active refactoring
- Domain and hook imports are low-risk (stable interfaces)

---

## 2. CIRCULAR DEPENDENCY RISKS

### 2.1 Detected Circular Imports

**Cycle 1: Agent ↔ Provider Stores** (HIGH RISK)
```
infrastructure/persistence/stores/agents/agents-crud-slice.ts
  → imports from → infrastructure/persistence/stores/providers/provider-crud-slice.ts
    → imports from → infrastructure/persistence/stores/agents/agents-crud-slice.ts
```
**Impact**: Runtime errors, infinite loops in Zustand v5
**Status**: ⚠️ FIXED in Ralph Loop Cycle 18 (use individual selectors)

**Cycle 2: State → Infrastructure → State** (MEDIUM RISK)
```
lib/state/dexie-db.ts
  → imports from → infrastructure/persistence/dexie-db-class.ts
    → imports from → lib/state/dexie-db-migrations.ts
      → imports from → lib/state/dexie-db.ts
```
**Impact**: Module resolution errors, build failures
**Status**: ❌ NOT FIXED (legacy refactoring incomplete)

**Cycle 3: RAG Store ↔ Knowledge Store** (LOW RISK)
```
infrastructure/persistence/stores/rag/rag-store.ts
  → imports from → lib/state/knowledge-store.ts
    → imports from → infrastructure/persistence/stores/rag/rag-store.ts
```
**Impact**: Type errors, hydration failures
**Status**: ❌ NOT FIXED (knowledge store not migrated yet)

### 2.2 Safe Refactoring Pattern

**To break circular dependencies**:
```typescript
// ❌ WRONG (creates cycle)
import { useAgentStore } from './agents-store'
import { useProviderStore } from './provider-store'

// agents-store.ts
import { useProviderStore } from './provider-store'
export const useAgentStore = create((set, get) => ({
  createAgent: (agent) => {
    const providers = useProviderStore.getState().providers // Circular!
  }
}))

// ✅ CORRECT (use get() for cross-slice calls)
export const createAgentSlice = (set, get) => ({
  createAgent: (agent) => {
    const providers = get().providers // No circular dependency!
  }
})

// ✅ CORRECT (inject dependencies)
export const createAgentSlice = (set, get, api) => ({
  createAgent: (agent) => {
    const providers = api.getState().providerSlice.providers
  }
})
```

---

## 3. MODULE RESOLUTION ERRORS (85 Files Affected)

### 3.1 Missing Export Errors

**Error Pattern**:
```
TS2305: Module '"./dexie-db-core-types"' has no exported member 'WorkspaceBindings'.
TS2305: Module '"./dexie-db"' has no exported member 'default'.
TS2307: Cannot find module './rag-store' or its corresponding type declarations.
```

**Root Cause**: Incomplete migration from `lib/state/` to `infrastructure/persistence/`

**Affected Files**: 85 files across:
- 20 test files
- 15 store files
- 10 RAG system files
- 40 UI components

### 3.2 Import Path Migration Map

| Old Import Path | New Import Path | Files to Update |
|-----------------|-----------------|-----------------|
| `@/lib/state/dexie-db` | `@/infrastructure/persistence/dexie-db` | 18 files |
| `@/lib/state/dexie-db-class` | `@/infrastructure/persistence/dexie-db-class` | 12 files |
| `@/lib/state/rag-store` | `@/infrastructure/persistence/stores/rag/rag-store` | 8 files |
| `@/lib/state/notes-store` | `@/lib/notes/note-store` | 4 files |
| `@/lib/state/canvas-store` | `@/infrastructure/persistence/stores/canvas-store` | 5 files |
| `@/lib/state/flashcard-store` | `@/infrastructure/persistence/stores/flashcard-store` | 3 files |

**Migration Script**:
```bash
# Step 1: Find all files with old imports
grep -r "from '@/lib/state/dexie-db'" src/ --include="*.ts" --include="*.tsx"

# Step 2: Replace imports (careful, manual review required)
# Use IDE refactoring tools to ensure accuracy

# Step 3: Validate
pnpm tsc --noEmit
```

### 3.3 Breaking Change Prevention

**Pattern**: Facade exports preserve backward compatibility
```typescript
// OLD FILE (deprecated but kept for compatibility)
// src/lib/state/dexie-db.ts

// Re-export from new location (facade pattern)
export {
  db,
  getDb,
  ViaGentDatabase,
  // ... all other exports
} from '@/infrastructure/persistence/dexie-db'

// Add deprecation warning (IDE will show this)
/**
 * @deprecated Use @/infrastructure/persistence/dexie-db instead
 * This file will be removed in v2.1.0
 */
```

**Benefits**:
- ✅ Zero breaking changes for existing imports
- ✅ Gradual migration path (update files one by one)
- ✅ IDE shows deprecation warnings
- ✅ Can delete old file after all consumers migrated

---

## 4. SAFE TRANSFORMATION PATHS

### 4.1 Database Schema Migration

**Current Issue**: Database types are duplicated
- `src/lib/state/dexie-db.ts` (1,267 lines, legacy)
- `src/infrastructure/persistence/dexie-db.ts` (1,061 lines, modern)

**Safe Path**:
```
Step 1: Add missing exports to modern file (30 min)
  - WorkspaceBindings interface
  - Default export (db instance)

Step 2: Create facade in legacy file (15 min)
  - Re-export everything from modern location
  - Add @deprecated comment

Step 3: Update 5 highest-import files (1 hour)
  - Test each change with pnpm tsc --noEmit

Step 4: Batch update remaining files (2 hours)
  - Use IDE refactoring tools
  - Validate after each batch

Step 5: Delete legacy file (30 min)
  - Only after all consumers migrated
  - Run full test suite
```

**Total Time**: 4 hours
**Risk Level**: LOW (facade pattern prevents breakage)

### 4.2 Store Consolidation

**Current Issue**: 50 stores across 3 locations (17 duplicates)

**Safe Path**:
```
Phase 1: Audit and map (2 hours)
  - Identify all stores and their consumers
  - Create dependency graph

Phase 2: Migrate low-risk stores (4 hours)
  - Start with stores <5 consumers
  - Create facades for old locations

Phase 3: Migrate high-risk stores (6 hours)
  - Stores with 10+ consumers
  - Require careful testing

Phase 4: Delete legacy stores (2 hours)
  - Only after validation complete
  - Keep backup branch
```

**Total Time**: 14 hours (matches Epic CC-1/CP-1 estimates)
**Risk Level**: MEDIUM (comprehensive testing required)

### 4.3 Component Hook Extraction

**Current Issue**: AgentConfigDialog is 299 lines (2.5x limit)

**Safe Path**:
```
Step 1: Create hook interfaces (2 hours)
  - Define input/output contracts
  - Document hook responsibilities

Step 2: Extract hooks (4 hours)
  - Extract useAgentConfigDialog
  - Extract useAgentTabContent
  - Validate each hook independently

Step 3: Create tab components (4 hours)
  - AgentConfigBasicTab
  - AgentConfigWorkspaceTab
  - AgentConfigAdvancedTab
  - Test each component in isolation

Step 4: Integrate and test (2 hours)
  - Update dialog to use new hooks
  - Test all agent config flows
  - Verify no behavior changes

Step 5: Update documentation (1 hour)
  - Document hook APIs
  - Update component docs
  - Add migration guide
```

**Total Time**: 13 hours (matches UI-001 estimate)
**Risk Level**: MEDIUM (comprehensive testing required)

---

## 5. DEPENDENCY GRAPH VISUALIZATION

### 5.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│  (294 components in src/presentation/components/)            │
└────────────────────────┬────────────────────────────────────┘
                         │ imports
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                   Application Layer                          │
│  (services, DTOs in src/application/)                       │
└────────────────────────┬────────────────────────────────────┘
                         │ imports
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                     Domain Layer                             │
│  (entities in src/core/, services in src/domain/)           │
└────────────────────────┬────────────────────────────────────┘
                         │ imports
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                  Infrastructure Layer                        │
│  (persistence in src/infrastructure/persistence/)            │
│  - Dexie database (IndexedDB)                               │
│  - Zustand stores (50 stores, 17 duplicates)                │
│  - Event bus (cross-workspace events)                       │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Critical Dependencies

**Agent System**:
```
AgentConfigDialog (presentation)
  → useAgentsStore (infrastructure/stores/agents)
    → Agent entity (core/entities)
    → credential-vault (lib/agent/providers)
      → Dexie storage (infrastructure/persistence)
```

**RAG System**:
```
RAGChatPanel (presentation)
  → useRAGStore (infrastructure/stores/rag)
    → knowledge-store (lib/state) [LEGACY]
      → dexie-db (lib/state) [LEGACY]
        → IndexedDB (browser API)
```

**File System Sync**:
```
FileSyncStatusPanel (presentation)
  → useFileSyncStatusStore (lib/workspace) [LEGACY]
    → SyncManager (lib/filesync)
      → LocalFSAdapter (lib/filesystem)
        → WebContainer (lib/webcontainer)
```

---

## 6. REFACTORING CHECKLIST

### 6.1 Pre-Refactoring Checklist

- [ ] Create feature branch from `dev`
- [ ] Run `pnpm tsc --noEmit` and save error log (baseline)
- [ ] Run `pnpm test` and save results (baseline)
- [ ] Identify all files that import the target module
- [ ] Document current behavior (screenshots, tests)
- [ ] Create rollback plan (backup branch, revert script)

### 6.2 During Refactoring Checklist

- [ ] Make one change at a time (no bulk commits)
- [ ] Run `pnpm tsc --noEmit` after each change
- [ ] Run `pnpm test` after each change
- [ ] Test manually in browser (if UI change)
- [ ] Update imports incrementally (5-10 files at a time)
- [ ] Commit frequently with descriptive messages

### 6.3 Post-Refactoring Checklist

- [ ] Verify error count is reduced (not increased)
- [ ] Verify all tests still pass
- [ ] Test all affected workflows manually
- [ ] Update documentation (JSDoc, README)
- [ ] Create PR with detailed description
- [ ] Request code review from team
- [ ] Merge only after approval

---

## 7. RISK MITIGATION STRATEGIES

### 7.1 High-Risk Changes

**Database Schema Changes**:
- ❌ Don't: Change schema without migration
- ✅ Do: Use versioned migrations in `dexie-db-migrations.ts`
- ✅ Do: Test migration on backup database first
- ✅ Do: Keep rollback migration (downgrade script)

**Store Signature Changes**:
- ❌ Don't: Rename store exports without facade
- ✅ Do: Re-export as facade for backward compatibility
- ✅ Do: Add `@deprecated` comments
- ✅ Do: Update consumers gradually

**Component Hook Changes**:
- ❌ Don't: Change hook signatures without checking all usages
- ✅ Do: Maintain backward compatibility with defaults
- ✅ Do: Test all workflows before and after
- ✅ Do: Keep old hook as alias if needed

### 7.2 Testing Strategies

**Unit Testing**:
```typescript
// Test hook in isolation
describe('useAgentConfigDialog', () => {
  it('should initialize with agent data', () => {
    const { result } = renderHook(() => useAgentConfigDialog('agent-1'))
    expect(result.current.name).toBe('Test Agent')
  })

  it('should validate form fields', () => {
    const { result } = renderHook(() => useAgentConfigDialog('new'))
    act(() => {
      result.current.setName('')
    })
    expect(result.current.errors.name).toBeDefined()
  })
})
```

**Integration Testing**:
```typescript
// Test component with hook
describe('AgentConfigDialog', () => {
  it('should submit agent config', async () => {
    const { getByText, getByLabelText } = render(<AgentConfigDialog open={true} />)
    const nameInput = getByLabelText(/agent name/i)
    const submitButton = getByText(/save/i)

    await userEvent.type(nameInput, 'New Agent')
    await userEvent.click(submitButton)

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith(expect.any(String))
    })
  })
})
```

**End-to-End Testing**:
```typescript
// Test full workflow in browser
describe('Agent Config Workflow', () => {
  it('should create, edit, and delete agent', async () => {
    // Create
    await page.goto('/agent/config')
    await page.fill('[name="name"]', 'Test Agent')
    await page.click('[type="submit"]')

    // Verify
    await expect(page.locator('text=Test Agent')).toBeVisible()

    // Edit
    await page.click('text=Test Agent')
    await page.fill('[name="name"]', 'Updated Agent')
    await page.click('[type="submit"]')

    // Verify
    await expect(page.locator('text=Updated Agent')).toBeVisible()

    // Delete
    await page.click('text=Updated Agent')
    await page.click('text=Delete')
    await page.click('text=Confirm')

    // Verify
    await expect(page.locator('text=Updated Agent')).not.toBeVisible()
  })
})
```

---

## END OF DOCUMENT

**Next Steps**:
1. Review dependency graph with team
2. Identify high-risk refactoring targets
3. Create detailed migration plans for each target
4. Execute refactoring in priority order

**Generated by**: BMAD Master Analysis Mode
**Date**: 2026-01-02
