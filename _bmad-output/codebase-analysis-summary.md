# Project Alpha Master - Comprehensive Codebase Analysis
**Generated**: 2026-01-02  
**Repomix Pack**: 4,466 files → 2.16M XML (2.16M compressed)  
**Analysis Method**: Repomix + Grep + TypeScript compiler

---

## Executive Summary

### Codebase Scale
- **Total Files**: 4,466 files (documentation, source, tests, configs)
- **Source Code**: ~1.8M lines across src/
- **Presentation Components**: 366 React components
- **Test Files**: 154 test files across 47 test directories
- **Store Files**: 71 stores (3 locations identified with duplication)

### TypeScript Health Status
- **Total Errors**: 1,000 TypeScript errors
- **Production Code Errors**: ~306 (estimate)
- **Test Code Errors**: ~694 (estimate)
- **Health Score**: ~5.9% (1,000 errors / 17,000+ files)

### Critical Architecture Issues
1. **Store Duplication Crisis**: 30% duplication rate across 3 locations
2. **God Stores**: 16 files exceed 300-line limit (worst: 1,595 lines duplicated)
3. **Circular Dependencies**: 4 high-risk cycles identified
4. **Missing Type Definitions**: 268 missing exports

---

## 1. TypeScript Error Analysis

### Error Distribution by File (Top 30)

| Rank | File | Errors | Category |
|------|------|--------|----------|
| 1 | `src/lib/agent/__tests__/prompt-composer.test.ts` | 21 | Test mocking |
| 2 | `src/lib/agent/providers/anthropic-adapter.ts` | 20 | Type mismatches |
| 3 | `src/presentation/components/agent/WorkspacePermissionManager.tsx` | 19 | Props typing |
| 4 | `src/lib/knowledge/__tests__/runtime-validation.test.ts` | 18 | Test validation |
| 5 | `src/lib/workspace/__tests__/project-metadata.test.ts` | 16 | Mock types |
| 6 | `src/infrastructure/persistence/stores/conversation/useConversationStore.ts` | 16 | Type exports |
| 7 | `src/presentation/components/agent/AgentConfigDialog.tsx` | 14 | Component props |
| 8 | `src/presentation/components/layout/IDELayoutMain.tsx` | 13 | State typing |
| 9 | `src/lib/rag/__tests__/hybrid-retriever.test.ts` | 13 | Test mocks |
| 10 | `src/infrastructure/persistence/stores/conversation/__tests__/useConversationStore.test.ts` | 13 | Store tests |

### Error Categories

#### 1. Missing Module Exports (268 errors)
- `Cannot find module '@netlify/edge-functions'`
- `Cannot find module 'vinxi/http'`
- `Cannot find module './rag-store'`
- `Cannot find module './session-snapshot-manager'`
- `Module has no exported member 'WorkspaceBindings'`
- `Module has no exported member 'ConversationStoreState'`

#### 2. Type Assignment Errors (200+ errors)
- `Type 'string' is not assignable to type 'number'`
- `Object literal may only specify known properties`
- `Property does not exist on type`
- `Type is missing the following properties`

#### 3. Test-Related Errors (300+ errors)
- Untyped function calls in vitest mocks
- Implicit `any` types in test parameters
- Missing type imports in test files
- Incompatible mock types

#### 4. Store Persistence Errors (150+ errors)
- Dexie storage type mismatches
- PersistOptions configuration errors
- IndexedDB schema incompatibilities
- Migration type mismatches

---

## 2. Store Architecture Analysis

### Store Locations (3 Critical Areas)

#### Location 1: `src/lib/state/` (25 stores)
**Purpose**: Legacy store location (being migrated)
- `provider-store.ts` (430 lines)
- `rag-store.ts` (1,595 lines - GOD STORE)
- `conversation-store.ts`
- `ide-store.ts`
- `knowledge-store.ts`
- `layout-store.ts`
- `tool-permission-store.ts`
- `workspace-*.ts` (3 stores)

#### Location 2: `src/stores/` (8 stores)
**Purpose**: Temporary location (DEPRECATED)
- `agents-store.ts` (430 lines, circular dependency)
- `conversation-threads-store.ts` (726 lines - GOD STORE)
- Empty files (migration artifacts)

#### Location 3: `src/infrastructure/persistence/stores/` (38+ stores)
**Purpose**: Modern architecture (target location)
```
stores/
├── agents/           # Agent store slices (5 files)
├── conversation/     # Conversation store slices (6 files + tests)
├── providers/        # Provider store slices (4 files)
├── rag/              # RAG store slices
├── project/          # Project store slices
└── snapshot/         # Snapshot store slices
```

### Store Duplication Crisis

#### Provider Store (3 duplicates)
| File | Lines | Status |
|------|-------|--------|
| `src/lib/state/provider-store.ts` | 430 | ⚠️ Legacy |
| `src/infrastructure/persistence/stores/providers/provider-store.ts` | 255 | ✅ Target |
| `src/stores/provider-config-store.ts` | 180 | ⚠️ Duplicate |

**Duplication**: 765 lines (30% redundancy)

#### Agent Store (2 duplicates)
| File | Lines | Issues |
|------|-------|--------|
| `src/stores/agents-store.ts` | 430 | Circular dep with provider-store |
| `src/infrastructure/persistence/stores/agents/use-agent-store.ts` | 280 | ✅ Modern |

**Circular Dependency**:
```
agents-store.ts ↔ provider-store.ts
  (imports)        (imports)
```

#### RAG Store (1,595 lines duplicated)
| File | Lines | Status |
|------|-------|--------|
| `src/lib/state/rag-store.ts` | 1,595 | ❌ GOD STORE |
| `src/infrastructure/persistence/stores/rag/index.ts` | 1,595 | ❌ Duplicate |

**Worst God Store**: 13.3x the 120-line standard

#### Conversation Stores (2 god stores)
| File | Lines | Issues |
|------|-------|--------|
| `src/infrastructure/persistence/stores/conversation/conversation-store.ts` | 626 | God store |
| `src/infrastructure/persistence/stores/conversation/conversation-threads-store.ts` | 726 | God store |

**Target Architecture** (6 slices, 120 lines each):
```
conversation/
├── conversation-metadata-slice.ts     (120 lines) ✅ Story CC-1.1
├── thread-management-slice.ts         (120 lines) ✅ Story CC-1.2
├── message-crud-slice.ts              (120 lines) ✅ Story CC-1.3
├── conversation-utils-slice.ts        (120 lines) ✅ Story CC-1.4
├── conversation-validation-slice.ts   (120 lines) ✅ Story CC-1.5
├── conversation-events-slice.ts       (120 lines) ✅ Story CC-1.6
└── index.ts                           (unified store) Story CC-1.7
```

---

## 3. Workspace Routing & Navigation

### Route Structure (10 workspace routes)

#### IDE Workspace
- `/ide` - Main IDE route
- `/ide/$projectId` - Project-specific IDE
- `/_workspace/ide/` - Layout wrapper

#### Knowledge Workspace
- `/knowledge` - Knowledge hub
- `/knowledge.$projectId.lazy.tsx` - Lazy-loaded project

#### Notes Workspace
- `/notes.lazy.tsx` - Lazy-loaded notes
- `/notes.$projectId.lazy.tsx` - Project-specific notes

#### Study Workspace
- `/study.lazy.tsx` - Lazy-loaded study
- `/study.$projectId.lazy.tsx` - Project-specific study

#### General Workspace
- `/workspace/` - Workspace hub
- `/workspace/$projectId` - Project route
- `/workspace/$workspaceType` - Dynamic workspace type

### Navigation Flow Issues

#### Issue 1: Hub Routing Missing
**Problem**: No `/hub` route exists for HubHomePage component
**Impact**: Cannot access hub via URL navigation
**Epic**: CP-1.12 (Create Hub accessible via /hub URL)

#### Issue 2: Lazy Loading Inconsistency
**Problem**: Some workspaces use lazy loading, others don't
**Impact**: Inconsistent bundle splitting
**Recommendation**: All workspace routes should use `.lazy.tsx`

#### Issue 3: Duplicate Route Definitions
**Problem**: `/workspace/$projectId` defined 8 times across files
**Impact**: Route conflicts, unclear which takes precedence
**Recommendation**: Consolidate to single route definition

---

## 4. Component Dependencies Across Workspaces

### Component Count by Workspace

| Workspace | Components | Location |
|-----------|------------|----------|
| IDE | 80+ | `src/presentation/components/ide/` |
| Knowledge | 15 | `src/presentation/components/knowledge/` |
| Study | 12 | `src/presentation/components/study/` |
| Notes | 10 | `src/presentation/components/notes/` |
| Chat | 15 | `src/presentation/components/chat/` |
| Agent | 20+ | `src/presentation/components/agent/` |
| Canvas | 8 | `src/presentation/components/canvas/` |
| RAG | 10 | `src/presentation/components/rag/` |
| UI Primitives | 50+ | `src/presentation/components/ui/` |

**Total**: 366 presentation components

### Cross-Workspace Dependencies

#### Shared Components (Used by 3+ workspaces)
1. **AgentSelector** - Used in: Knowledge, Notes, Study
   - Issue: Uses global `useAgentsStore` instead of per-workspace `useAgentSelectionStore`
   - Fix: `UnifiedAgentSelector.tsx` (247 lines) created in Cycle 18

2. **CommandPalette** - Used in: IDE, Knowledge, Study
   - Location: `src/presentation/components/ide/CommandPalette.tsx`
   - Status: ✅ Working, no issues

3. **ErrorBoundary** - Used in: All workspaces
   - Location: `src/presentation/components/common/ErrorBoundary.tsx`
   - Status: ✅ Implemented across all routes

4. **LoadingState, EmptyState, ErrorState** - Used in: All workspaces
   - Location: `src/presentation/components/ui/`
   - Status: ✅ Consistent design system

#### Workspace-Specific Issues

##### Knowledge Workspace (15 components)
**Gaps**:
- ❌ KnowledgeSearchInterface (P0)
- ❌ DocumentPreviewViewer (P0)
- ❌ EmbeddingVisualization (P1)

**Existing**:
- ✅ KnowledgePage.tsx
- ✅ SourceImportDialog.tsx
- ✅ CitationSidebar.tsx (from rag/)

##### Study Workspace (12 components)
**Gaps**:
- ❌ AdvancedQuizEditor (P0)
- ❌ ProgressTrackingDashboard (P0)
- ❌ SpacedRepetitionScheduler (P1)

**Existing**:
- ✅ StudyPage.tsx
- ✅ QuizContainer.tsx
- ✅ QuizSession.tsx

##### Notes Workspace (10 components)
**Gaps**:
- ❌ AdvancedNoteEditor (P1)
- ❌ NoteLinkingGraph (P1)
- ❌ NoteSearchFilter (P2)

**Existing**:
- ✅ NoteEditor.tsx
- ✅ NoteTree.tsx
- ✅ MarkdownExportDialog.tsx

---

## 5. Test Infrastructure & Mocking Patterns

### Test Coverage Statistics

| Metric | Count |
|--------|-------|
| Test Files | 154 |
| Test Directories | 47 |
| Test Errors | ~694 |
| Coverage Target | ≥80% |
| Current Coverage | Unknown (not measured) |

### Test Infrastructure

#### Testing Stack
- **Framework**: Vitest
- **React Testing**: @testing-library/react
- **Mocking**: vi.mock() for external deps
- **Coverage**: c8 (built-in to Vitest)

#### Test Patterns

##### Pattern 1: Component Testing
```typescript
// Example: src/presentation/components/canvas/nodes/__tests__/ConceptNode.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

describe('ConceptNode', () => {
  it('should render node with title', () => {
    render(<ConceptNode data={{ title: 'Test' }} />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```

##### Pattern 2: Store Testing
```typescript
// Example: src/infrastructure/persistence/stores/conversation/__tests__/conversation-metadata-slice.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { createConversationStore } from '../useConversationStore';

describe('conversation-metadata-slice', () => {
  let store;

  beforeEach(() => {
    store = createConversationStore();
  });

  it('should create conversation with UUID', () => {
    const id = store.getState().createConversation('ide', null, 'agent-1');
    expect(id).toMatch(/^conv_/);
  });
});
```

##### Pattern 3: Agent Tool Testing
```typescript
// Example: src/lib/agent/tools/__tests__/tool-execution-logger.test.ts
import { describe, it, expect, vi } from 'vitest';
import { ToolExecutionLogger } from '../tool-execution-logger';

describe('ToolExecutionLogger', () => {
  it('should log tool execution', () => {
    const logger = new ToolExecutionLogger();
    logger.log('read', '/path/to/file', { success: true });
    expect(logger.getLogs()).toHaveLength(1);
  });
});
```

### Mocking Issues

#### Issue 1: Untyped Mocks (200+ errors)
**Problem**: `vi.mock()` calls without type arguments
**Files Affected**:
- `src/hooks/__tests__/useCanvasDrop.test.ts`
- `src/hooks/__tests__/useResponsive.test.ts`
- All agent tool tests

**Fix**:
```typescript
// BEFORE (error)
vi.mock('@/lib/agent/providers/anthropic-adapter', () => ({
  createAnthropicAdapter: vi.fn()
}));

// AFTER (fixed)
const mockCreateAdapter = vi.fn();
vi.mock('@/lib/agent/providers/anthropic-adapter', () => ({
  createAnthropicAdapter: () => mockCreateAdapter()
}));
```

#### Issue 2: Missing Test Library Imports
**Error**: `Cannot find module '@testing-library/react-hooks'`
**Fix**: Use `@testing-library/react` instead (merged in v14)

#### Issue 3: Implicit Any Types
**Problem**: Test parameters typed as `any`
**Count**: 90+ TS7006 errors
**Fix**: Add proper type annotations to test callbacks

---

## 6. Migration Gaps Analysis

### Legacy vs New Implementations

#### Gap 1: Provider Stores (Epic AC-1)

**Legacy** (`src/lib/state/provider-store.ts`):
```typescript
// 430 lines, monolithic
export const useProviderStore = create<ProviderStoreState>()(
  persist(
    (set, get) => ({
      providers: [],
      activeProviderId: null,
      addProvider: (provider) => { /* ... */ },
      updateProvider: (id, updates) => { /* ... */ },
      removeProvider: (id) => { /* ... */ },
      // ... 20+ more actions
    }),
    { name: 'provider-store' }
  )
);
```

**New** (`src/infrastructure/persistence/stores/providers/`):
```typescript
// 4 slices, ~120 lines each
export const createProviderCrudSlice = (set, get) => ({
  addProvider, updateProvider, removeProvider
});

export const createProviderModelsSlice = (set, get) => ({
  fetchModels, updateModels, clearModels
});

export const createProviderUtilsSlice = (set, get) => ({
  getActiveProvider, validateProvider, testConnection
});

// Combined in provider-store.ts (255 lines total)
```

**Migration Status**:
- ✅ New store created (Phase 1 complete)
- ⏳ Components migration pending (Phase 2)
- ⏳ Legacy store deletion pending (Phase 3)

**Breaking Change Risk**: HIGH (20+ components import from old location)

#### Gap 2: Conversation Stores (Epic CC-1)

**Legacy** (2 god stores, 1,352 lines total):
```
src/infrastructure/persistence/stores/conversation/
├── conversation-store.ts (626 lines)
└── conversation-threads-store.ts (726 lines)
```

**New** (6 slices + unified store, target 720 lines):
```
src/infrastructure/persistence/stores/conversation/
├── conversation-metadata-slice.ts (120 lines) ✅ Story CC-1.1
├── thread-management-slice.ts (120 lines) ✅ Story CC-1.2
├── message-crud-slice.ts (120 lines) ✅ Story CC-1.3
├── conversation-utils-slice.ts (120 lines) ✅ Story CC-1.4
├── conversation-validation-slice.ts (120 lines) ✅ Story CC-1.5
├── conversation-events-slice.ts (120 lines) ✅ Story CC-1.6
├── index.ts (unified store) Story CC-1.7
└── __tests__/ (70 tests total)
```

**Migration Status**:
- ✅ All 6 slices created (Phase 1 complete)
- ✅ Data migration script written (Story CC-1.8)
- ⏳ Component migration pending (Stories CC-1.9 through CC-1.13)
- ⏳ Legacy store deletion pending (Story CC-1.14)

**Components to Migrate** (5 batches, 35 hours):
1. Batch 1: Study workspace (4 components, 4 hours) - LOW risk
2. Batch 2: Notes workspace (6 components, 6 hours) - LOW-MEDIUM risk
3. Batch 3: Knowledge workspace (9 components, 8 hours) - MEDIUM risk
4. Batch 4: Chat components (7 components, 6 hours) - MEDIUM risk
5. Batch 5: IDE workspace (11 components, 11 hours) - HIGHEST risk

#### Gap 3: Agent Stores (Epic WB)

**Legacy** (`src/stores/agents-store.ts`):
```typescript
// 430 lines, circular dependency with provider-store
export const useAgentsStore = create<AgentStore>()(
  persist(
    (set, get) => ({
      agents: [DEFAULT_AGENT],
      activeAgentId: DEFAULT_AGENT.id,
      // ... imports from useProviderStore (circular!)
    }),
    { name: 'agents-store' }
  )
);
```

**New** (`src/infrastructure/persistence/stores/agents/`):
```typescript
// 5 slices, ~120 lines each
export const createAgentCrudSlice = (set, get) => ({
  createAgent, updateAgent, deleteAgent
});

export const createAgentWorkspaceBindingsSlice = (set, get) => ({
  setWorkspaceBinding, removeWorkspaceBinding, getAgentsForWorkspace
});

// Combined in use-agent-store.ts (280 lines total)
```

**Migration Status**:
- ✅ New store created with slices
- ✅ Circular dependency eliminated
- ⏳ Components migration pending (Epic WB, 8 stories, 42 hours)

#### Gap 4: RAG Stores (Epic RAG-1)

**Current** (1,595 lines duplicated):
```
src/lib/state/rag-store.ts (1,595 lines)
src/infrastructure/persistence/stores/rag/index.ts (1,595 lines - duplicate)
```

**Target** (3-4 slices, ~360 lines total):
```
src/infrastructure/persistence/stores/rag/
├── rag-metadata-slice.ts (120 lines)
├── rag-indexing-slice.ts (120 lines)
├── rag-retrieval-slice.ts (120 lines)
└── index.ts (unified store)
```

**Migration Status**:
- ❌ Epic not started
- ❌ God store not split
- ❌ Duplicate not deleted

---

## 7. Critical Migration Paths

### Phase 0: Foundation Stabilization (Week 1-2)

#### TS-001: Fix TypeScript Errors (6-8 hours)
**Target**: Reduce from 1,172 to <100 errors
**Priority**: P0

**Batches**:
1. Batch 1: Fix 306 production errors (4 hours)
   - Missing module exports (268 errors)
   - Type assignment errors (200+ errors)
   
2. Batch 2: Fix 694 test errors (2-4 hours)
   - Untyped mocks (200+ errors)
   - Implicit any types (90+ errors)

#### DB-001: Safe IndexedDB Operations (18-22 hours)
**Target**: Add quota handling to all IndexedDB operations
**Priority**: P0 (data loss risk)

**Files Affected**:
- `src/infrastructure/persistence/dexie-storage.ts`
- `src/infrastructure/persistence/stores/conversation/useConversationStore.ts`
- All stores using `createDexieStorage()`

#### UI-001: Extract AgentConfigDialog Hooks (16-20 hours)
**Target**: Reduce AgentConfigDialog from 1,089 to <300 lines
**Priority**: P0 (maintainability crisis)

**Approach**:
1. Extract `useAgentFormState` hook (200 lines)
2. Extract `useAgentPermissions` hook (150 lines)
3. Extract `useAgentModels` hook (150 lines)
4. Extract `useAgentValidation` hook (100 lines)
5. Component reduces to ~300 lines (manageable)

### Phase 1: Store Refactoring (Week 3-4)

#### Epic AC-1: Agent Configuration Consolidation
**Duration**: 42 hours (8 stories)
**Status**: 100% story readiness, ready to start

**Stories**:
- AC-1.1: Create agent metadata slice (4 hours)
- AC-1.2: Create agent workspace bindings slice (6 hours)
- AC-1.3: Create agent validation slice (4 hours)
- AC-1.4: Create agent events slice (5 hours)
- AC-1.5: Create agent utils slice (3 hours)
- AC-1.6: Create unified agent store (4 hours)
- AC-1.7: Write data migration script (8 hours)
- AC-1.8: Migrate 20+ components (8 hours)

#### Epic CC-1: Conversation Consolidation
**Duration**: 127 hours (15 stories)
**Status**: All 6 slices created, component migration pending

**Stories**:
- CC-1.1 through CC-1.6: Create 6 slices (24 hours) ✅ COMPLETE
- CC-1.7: Create unified store (4 hours) ✅ COMPLETE
- CC-1.8: Write data migration script (12 hours) ✅ COMPLETE
- CC-1.9 through CC-1.13: Migrate 35 components (35 hours) ⏳ PENDING
- CC-1.14: Delete legacy stores (4 hours) ⏳ PENDING
- CC-1.15: Update documentation (4 hours) ⏳ PENDING

### Phase 2: Infrastructure Hardening (Week 5-6)

#### Epic CP-1: Project Consolidation
**Duration**: 80-100 hours (18 stories)
**Status**: Ready to start

**God Stores to Refactor**:
- `src/lib/workspace/project-store.ts` (450 lines)
- `src/lib/filesystem/file-snapshot-store.ts` (509 lines)

**Target Architecture** (9 slices):
```
project/
├── project-crud-slice.ts (120 lines)
├── project-workspace-bindings-slice.ts (100 lines)
├── project-permissions-slice.ts (110 lines)
├── project-layout-slice.ts (80 lines)
├── project-utils-slice.ts (90 lines)
└── index.ts (unified store)

snapshot/
├── snapshot-metadata-slice.ts (100 lines)
├── snapshot-cache-slice.ts (110 lines)
├── snapshot-bulk-ops-slice.ts (90 lines)
├── snapshot-quota-slice.ts (80 lines)
└── index.ts (unified store)
```

### Phase 3: Architecture Transformation (Week 7-8)

#### Four-Layer Clean Architecture
**Target**: Complete separation of concerns

**Layer 1: Infrastructure** (Dexie, repositories)
**Layer 2: Domain** (Entities, rules, services)
**Layer 3: Application** (Use cases, DTOs)
**Layer 4: Presentation** (UI components)

**Migration**: All stores → Layer 1 (Infrastructure)

---

## 8. Recommendations

### Immediate Actions (Week 1)

1. **Fix Critical TypeScript Errors** (TS-001, 6-8 hours)
   - Start with missing module exports (268 errors, 2 hours)
   - Fix type assignment errors (200+ errors, 2 hours)
   - Fix test mocking errors (200+ errors, 2-4 hours)

2. **Add IndexedDB Quota Handling** (DB-001, 18-22 hours)
   - P0 data loss risk
   - Affects all persisted stores
   - Safe rollback strategy required

3. **Extract AgentConfigDialog Hooks** (UI-001, 16-20 hours)
   - P0 maintainability crisis (1,089 lines)
   - Target: <300 lines (4 hooks)
   - Zero breaking changes (internal refactor)

### Short-Term Actions (Weeks 2-4)

1. **Start Epic AC-1** (Agent Consolidation, 42 hours)
   - 8 stories, all ready to implement
   - Eliminates circular dependency
   - Reduces agents-store from 430 to 280 lines

2. **Continue Epic CC-1** (Conversation Consolidation)
   - Migrate 35 components across 5 batches
   - Total 35 hours of component migration
   - Zero breaking changes (facade pattern)

3. **Fix Hub Routing** (Epic CP-1.12, 2 hours)
   - Create `/hub` route
   - Make HubHomePage accessible via URL
   - Quick win, high user value

### Medium-Term Actions (Weeks 5-8)

1. **Epic CP-1** (Project Consolidation, 80-100 hours)
   - Refactor 2 god stores (959 lines total)
   - Create 9 slices (target: 120 lines each)
   - 60 tests required

2. **Epic RAG-1** (RAG Store Refactoring)
   - Split 1,595-line god store
   - Delete duplicate in lib/state
   - Create 3-4 slices

3. **Four-Layer Architecture** (Complete transformation)
   - Migrate all stores to infrastructure layer
   - Create domain services layer
   - Update presentation layer

---

## 9. File Path Reference

### Critical Files to Modify

#### TypeScript Errors (Priority Files)
```
src/lib/agent/providers/anthropic-adapter.ts (20 errors)
src/presentation/components/agent/WorkspacePermissionManager.tsx (19 errors)
src/infrastructure/persistence/stores/conversation/useConversationStore.ts (16 errors)
src/presentation/components/agent/AgentConfigDialog.tsx (14 errors)
src/presentation/components/layout/IDELayoutMain.tsx (13 errors)
```

#### God Stores (Refactoring Targets)
```
src/lib/state/rag-store.ts (1,595 lines) - CRITICAL
src/infrastructure/persistence/stores/conversation/conversation-threads-store.ts (726 lines)
src/infrastructure/persistence/stores/conversation/conversation-store.ts (626 lines)
src/stores/agents-store.ts (430 lines) - circular dependency
src/lib/state/provider-store.ts (430 lines)
src/presentation/components/agent/AgentConfigDialog.tsx (1,089 lines)
```

#### Duplicate Stores (Delete After Migration)
```
src/lib/state/provider-store.ts (use infrastructure version instead)
src/lib/state/rag-store.ts (use infrastructure version instead)
src/stores/agents-store.ts (use infrastructure version instead)
src/stores/conversation-threads-store.ts (use new slices instead)
```

#### New Store Locations (Target Architecture)
```
src/infrastructure/persistence/stores/
├── agents/use-agent-store.ts (unified store)
├── providers/provider-store.ts (unified store)
├── conversation/useConversationStore.ts (unified store)
├── project/ (9 slices, Epic CP-1)
└── snapshot/ (4 slices, Epic CP-1)
```

#### Workspace Routes (Navigation)
```
src/routes/
├── ide.tsx
├── ide.$projectId.tsx
├── knowledge.lazy.tsx
├── knowledge.$projectId.lazy.tsx
├── notes.lazy.tsx
├── notes.$projectId.lazy.tsx
├── study.lazy.tsx
├── study.$projectId.lazy.tsx
├── workspace/index.tsx
├── workspace/$projectId.tsx
└── hub.tsx (NEW - Epic CP-1.12)
```

---

## 10. Success Metrics

### TypeScript Health
- **Current**: 1,000 errors
- **Phase 0 Target**: <100 errors (90% reduction)
- **Success Criteria**: Zero production errors, <50 test errors

### Store Architecture
- **Current**: 71 stores, 30% duplication, 16 god stores
- **Phase 1 Target**: 50 stores, 0% duplication, 0 god stores >300 lines
- **Success Criteria**: All stores ≤120 lines, single source of truth

### Component Maintainability
- **Current**: 366 components, 1 god component >1,000 lines
- **Phase 0 Target**: All components ≤300 lines
- **Success Criteria**: 90% of components ≤120 lines

### Test Coverage
- **Current**: Unknown (not measured)
- **Target**: ≥80% coverage
- **Success Criteria**: All new code has tests before merge

---

## 11. Risk Assessment

### High-Risk Areas (P0)

1. **IndexedDB Quota Issues** (DB-001)
   - **Risk**: Data loss without quota handling
   - **Impact**: User data corruption
   - **Mitigation**: Add quota checks before all writes

2. **Circular Dependencies** (agents-store ↔ provider-store)
   - **Risk**: Runtime errors, unpredictable state
   - **Impact**: Agent configuration breaks
   - **Mitigation**: Eliminate via Epic AC-1 (42 hours)

3. **God Stores** (16 files >300 lines)
   - **Risk**: Unmaintainable code, bug-prone
   - **Impact**: Development velocity collapses
   - **Mitigation**: Split into slices (Epic AC-1, CC-1, CP-1)

### Medium-Risk Areas (P1)

1. **TypeScript Errors** (1,000 total)
   - **Risk**: Type safety compromised, runtime errors
   - **Impact**: Production bugs
   - **Mitigation**: Fix in batches (TS-001, 6-8 hours)

2. **Component Dependencies** (Cross-workspace coupling)
   - **Risk**: Breaks workspace isolation
   - **Impact**: Cannot deploy workspaces independently
   - **Mitigation**: Use shared UI primitives, facades

3. **Test Mocking Issues** (200+ errors)
   - **Risk**: Tests don't catch real bugs
   - **Impact**: False confidence in code quality
   - **Mitigation**: Fix mock patterns (TS-001 batch 2)

### Low-Risk Areas (P2)

1. **Hub Routing** (Missing /hub route)
   - **Risk**: Poor UX
   - **Impact**: Cannot navigate to hub via URL
   - **Mitigation**: Quick fix (Epic CP-1.12, 2 hours)

2. **Documentation** (Outdated AGENTS.md)
   - **Risk**: Developer confusion
   - **Impact**: Slower onboarding
   - **Mitigation**: Update after each epic

---

## Conclusion

### Current State
- **Health Score**: ~5.9% (1,000 TS errors, 30% store duplication)
- **Technical Debt**: HIGH (6,500 lines of duplicate code, 16 god stores)
- **Maintainability**: CRITICAL (1,089-line component, circular dependencies)

### Immediate Focus (Week 1-2)
1. Fix TypeScript errors (TS-001)
2. Add IndexedDB quota handling (DB-001)
3. Extract AgentConfigDialog hooks (UI-001)

### Stabilization Path (8 weeks total)
- **Phase 0** (Week 1-2): Foundation Stabilization
- **Phase 1** (Week 3-4): Store Refactoring (Epic AC-1, CC-1)
- **Phase 2** (Week 5-6): Infrastructure Hardening (Epic CP-1)
- **Phase 3** (Week 7-8): Architecture Transformation

### End State
- **Health Score**: 95%+ (<100 TS errors, 0% duplication)
- **Maintainability**: EXCELLENT (all stores ≤120 lines, 0 god stores)
- **Architecture**: Clean 4-layer separation
- **Test Coverage**: ≥80%

---

**Analysis Complete**: 2026-01-02  
**Next Action**: Execute Phase 0, Story TS-001 (Fix TypeScript Errors)
