# Component Dependency Map
## Visual Guide to System Relationships

**Generated:** 2026-01-02
**Purpose:** Guide systematic refactoring cycles

---

## 🎯 System-Wide Component Map

### Layer 4: Presentation (UI Components)

```
┌─────────────────────────────────────────────────────────────┐
│ WORKSPACE LAYOUT                                            │
│                                                             │
│ ┌─────────────┬─────────────┬─────────────┬──────────────┐ │
│ │   HUB       │    IDE      │  KNOWLEDGE  │    NOTES     │ │
│ │  (10 comp)  │  (20 comp)  │  (15 comp)  │  (10 comp)   │ │
│ └─────────────┴─────────────┴─────────────┴──────────────┘ │
│                                                             │
│ ┌─────────────┬─────────────┬──────────────────────────┐   │
│ │   STUDY     │  SETTINGS   │      AGENT CONFIG        │   │
│ │  (10 comp)  │   (5 comp)  │      (20 comp)           │   │
│ └─────────────┴─────────────┴──────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ SHARED UI COMPONENTS (50+ primitives)                       │
│                                                             │
│ [Button] [Input] [Dialog] [Badge] [Skeleton] [EmptyState]  │
│ [ErrorState] [ApprovalOverlay] [CommandPalette]            │
└─────────────────────────────────────────────────────────────┘
```

**Total UI Components:** 332
**Components >300 lines:** 17 (god components)

### Layer 3: Infrastructure (Persistence & Events)

```
┌─────────────────────────────────────────────────────────────┐
│ PERSISTENCE LAYER                                          │
│                                                             │
│ ┌──────────────────────────────────────────────────────┐  │
│ │  MODERN STORES (18 files)                             │  │
│ │  src/infrastructure/persistence/stores/               │  │
│ │                                                        │  │
│ │  AGENTS (5 slices)                                   │  │
│ │  ├─ agent-crud-slice.ts                              │  │
│ │  ├─ agent-workspace-bindings-slice.ts                │  │
│ │  ├─ agent-validation-slice.ts                        │  │
│ │  ├─ agent-events-slice.ts                            │  │
│ │  └─ agent-utils-slice.ts                             │  │
│ │                                                        │  │
│ │  PROVIDERS (3 slices)                                 │  │
│ │  ├─ provider-crud-slice.ts                           │  │
│ │  ├─ provider-models-slice.ts                         │  │
│ │  └─ provider-utils-slice.ts                          │  │
│ │                                                        │  │
│ │  CONVERSATION (1 store)                               │  │
│ │  └─ conversation-threads-store.ts (726 lines) ⚠️     │  │
│ │                                                        │  │
│ │  CANVAS (1 store)                                    │  │
│ │  └─ canvas-store.ts (619 lines) ⚠️                   │  │
│ └──────────────────────────────────────────────────────┘  │
│                                                             │
│ ┌──────────────────────────────────────────────────────┐  │
│ │  LEGACY STORES (25+ files) ⚠️                          │  │
│ │  src/lib/state/                                       │  │
│ │                                                        │  │
│ │  ├─ dexie-db.ts (1,267 lines) ❌ WORST FILE          │  │
│ │  ├─ knowledge-store.ts (718 lines) ⚠️                │  │
│ │  ├─ quiz-store.ts (629 lines) ⚠️                     │  │
│ │  ├─ conversation-store.ts (626 lines) ⚠️             │  │
│ │  └─ [21 more stores >300 lines]                      │  │
│ └──────────────────────────────────────────────────────┘  │
│                                                             │
│ ┌──────────────────────────────────────────────────────┐  │
│ │  DEPRECATED STORES (8 files) ❌                       │  │
│ │  src/stores/ (empty, to be deleted)                   │  │
│ └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ EVENT BUS                                                  │
│                                                             │
│  Cross-Workspace Events                                     │
│  ├─ WorkspaceChangeEvent                                   │
│  ├─ AgentConfigEvent                                       │
│  └─ SyncStatusEvent                                        │
└─────────────────────────────────────────────────────────────┘
```

**Total Stores:** 141 across 3 locations
**Duplication:** 17 duplicate stores (~6,500 lines)

### Layer 2: Domain (Business Logic)

```
┌─────────────────────────────────────────────────────────────┐
│ APPLICATION SERVICES                                        │
│  src/application/                                           │
│  ├─ services/                                               │
│  │  ├─ AgentService.ts                                     │
│  │  └─ ProviderService.ts                                  │
│  ├─ dtos/                                                   │
│  └─ use-cases/                                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ DOMAIN SERVICES (Scattered in lib/) ⚠️                      │
│                                                             │
│  SHOULD BE IN: src/domain/                                  │
│                                                             │
│  src/lib/agent/          → src/domain/agent/               │
│  src/lib/knowledge/      → src/domain/knowledge/           │
│  src/lib/study/          → src/domain/study/               │
│  src/lib/notes/          → src/domain/notes/               │
│  src/lib/rag/            → src/domain/rag/                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ VALUE OBJECTS                                              │
│  src/domain/value-objects/                                  │
│  ├─ ToolPermission.ts                                       │
│  ├─ WorkspaceBinding.ts                                     │
│  └─ WorkspaceType.ts                                        │
└─────────────────────────────────────────────────────────────┘
```

**Status:** Partial implementation, services need migration from `lib/`

### Layer 1: Core (Entities)

```
┌─────────────────────────────────────────────────────────────┐
│ CORE ENTITIES                                               │
│  src/core/entities/                                         │
│                                                             │
│  ├─ Agent.ts                                                │
│  ├─ Provider.ts                                             │
│  ├─ Tool.ts                                                 │
│  ├─ Conversation.ts                                         │
│  └─ Workspace.ts                                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ VALUE OBJECTS                                               │
│  src/core/value-objects/                                    │
│  └─ [TBD - minimal implementation]                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ DOMAIN RULES                                                │
│  src/core/rules/                                            │
│  └─ [TBD - minimal implementation]                          │
└─────────────────────────────────────────────────────────────┘
```

**Status:** Minimal implementation, entities defined inline

---

## 🔄 Critical Dependency Flows

### AI Agent Flow

```
┌──────────────────────┐
│ AgentConfigDialog    │ (1,089 lines) ⚠️ Phase 0 target
│  ├─ ProviderConfig   │
│  ├─ AgentSelection   │
│  └─ ToolPermissions  │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ useAgentChat Hook    │
│  ├─ Tool Execution   │
│  ├─ Streaming        │
│  └─ Memory Context   │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ AgentFactory         │ (612 lines)
│  ├─ Adapter Creation │
│  ├─ Model Registry   │
│  └─ Credential Vault │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ ProviderAdapter      │
│  ├─ OpenRouter       │
│  ├─ Anthropic        │
│  └─ Gemini           │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ TanStack AI          │
│  ├─ Streaming SSE    │
│  └─ Tool Calling     │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ Agent Tools (19)     │
│  ├─ FileTools        │
│  ├─ TerminalTools    │
│  └─ SnapshotTools    │
└──────────────────────┘
```

### State Management Flow

```
┌──────────────────────┐
│ UI Components        │ (332 components)
│  ├─ AgentChatPanel   │
│  ├─ IDE Layout       │
│  └─ Knowledge Canvas │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ Custom Hooks         │
│  ├─ useAgentChat     │
│  ├─ useAgents        │
│  └─ useWorkspace     │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ STORE SLICES         │ (18 modern + 25 legacy)
│  ├─ Agent Slices     │
│  ├─ Provider Slices  │
│  └─ Canvas Store     │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ ZUSTAND v5           │
│  ├─ Individual Selectors ✅        │
│  ├─ Slice Pattern ✅               │
│  └─ Partialize ✅                  │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ DEXIE (IndexedDB)    │
│  ├─ Projects Store   │
│  ├─ Conversations    │
│  └─ Knowledge Graph  │
└──────────────────────┘
```

### File System Sync Flow

```
┌──────────────────────┐
│ User Local Disk      │
│  (File System Access │
│   API)               │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ LocalFSAdapter       │
│  ├─ File Read/Write  │
│  ├─ Directory List   │
│  └─ Permission Mgmt  │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ IndexedDB            │
│  ├─ Project Metadata │
│  ├─ File Tree        │
│  └─ Snapshots        │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ SyncManager          │
│  ├─ Debounced Batch  │
│  ├─ Exclusion Filter │
│  └─ Conflict Resolve │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ WebContainer FS      │
│  ├─ Code Execution   │
│  ├─ Terminal         │
│  └─ Package Manager  │
└──────────────────────┘
```

---

## 🎯 Refactoring Priority Map

### Priority 0 (Immediate - Week 1-2)

```
┌─────────────────────────────────────────────────────────┐
│ FOUNDATION STABILIZATION                               │
│                                                         │
│ 1. TS-001: Fix TypeScript Errors                       │
│    Target: 1,172 → <100 errors (6-8 hours)            │
│                                                         │
│ 2. DB-001: Safe IndexedDB Operations                  │
│    Target: Add quota handling (18-22 hours)           │
│                                                         │
│ 3. UI-001: Extract AgentConfigDialog Hooks            │
│    Target: 1,089 → <300 lines (16-20 hours)           │
│                                                         │
│ TOTAL: 26-50 hours                                     │
└─────────────────────────────────────────────────────────┘
```

### Priority 1 (Week 3-4)

```
┌─────────────────────────────────────────────────────────┐
│ STORE CONSOLIDATION (Epic AC-1)                        │
│                                                         │
│ 1. Migrate provider stores (3 hours)                   │
│ 2. Migrate agent stores (6 hours)                     │
│ 3. Migrate conversation stores (4 hours)              │
│ 4. Delete src/stores/ (2 hours)                        │
│ 5. Fix circular dependencies (4 hours)                │
│                                                         │
│ TOTAL: 42 hours (8 stories)                            │
└─────────────────────────────────────────────────────────┘
```

### Priority 2 (Week 5-6)

```
┌─────────────────────────────────────────────────────────┐
│ WORKSPACE BINDINGS (Epic WB)                           │
│                                                         │
│ 1. Agent workspace filtering (4 hours)                │
│ 2. Workspace-specific tool permissions (6 hours)      │
│ 3. Cross-workspace event propagation (4 hours)        │
│ 4. Workspace context migration (6 hours)              │
│ 5. Testing & validation (8 hours)                     │
│                                                         │
│ TOTAL: 28 hours (5 stories)                            │
└─────────────────────────────────────────────────────────┘
```

### Priority 3 (Week 7-8)

```
┌─────────────────────────────────────────────────────────┐
│ INFRASTRUCTURE HARDENING                               │
│                                                         │
│ 1. Complete error boundary coverage (6 hours)         │
│ 2. IndexedDB quota management (8 hours)               │
│ 3. E2E test setup (12 hours)                          │
│ 4. Performance optimization (8 hours)                 │
│                                                         │
│ TOTAL: 34 hours                                        │
└─────────────────────────────────────────────────────────┘
```

### Priority 4 (Week 9+)

```
┌─────────────────────────────────────────────────────────┐
│ ARCHITECTURE TRANSFORMATION                            │
│                                                         │
│ 1. Complete four-layer architecture (20 hours)        │
│ 2. Extract domain services from lib/ (15 hours)       │
│ 3. God component elimination (remaining 12.5%)        │
│    - conversation-threads-store.ts (726 lines)        │
│    - knowledge-store.ts (718 lines)                   │
│    - quiz-store.ts (629 lines)                        │
│ 4. Core entity implementation (10 hours)              │
│                                                         │
│ TOTAL: 55+ hours                                       │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 God Component Map

### UI Components (>300 lines)

| Component | Lines | Location | Priority |
|-----------|-------|----------|----------|
| **AgentConfigDialog.tsx** | 1,089 | agent/ | P0 (Phase 0) |
| AgentManager.tsx | 285 | agent/ | ✅ Refactored |
| UnifiedAgentSelector.tsx | 247 | agent/ | ✅ Refactored |
| WorkspacePermissionEditor.tsx | 318 | agent/ | ✅ Phase 2 complete |
| ToolTrustLevelManager.tsx | 246 | agent/ | ✅ Phase 3 complete |

**Remaining UI God Components:** ~12 files

### Store Files (>600 lines)

| Store | Lines | Location | Priority |
|-------|-------|----------|----------|
| **dexie-db.ts** | 1,267 | lib/state/ | P1 (duplicate) |
| **dexie-db.ts** | 1,061 | infrastructure/ | P1 (duplicate) |
| conversation-threads-store.ts | 726 | infrastructure/ | P1 |
| knowledge-store.ts | 718 | lib/state/ | P1 |
| quiz-store.ts | 629 | lib/state/ | P2 |
| conversation-store.ts | 626 | lib/state/ | P2 |

**Total Store Files >300 lines:** 17 files

---

## 🚦 Migration Status

### ✅ Complete
- [x] Zustand v5 infinite loop fixes (Phase 1)
- [x] Agent component refactoring (87.5% - Cycle 17)
- [x] Event activity indicators (Cycle 17)
- [x] Agent selector migration to unified store (Cycle 18)

### ⏳ In Progress
- [ ] Phase 0: Foundation stabilization (26-50 hours)
- [ ] Store consolidation (Epic AC-1, 42 hours)
- [ ] Workspace bindings (Epic WB, 28 hours)

### 📋 Planned
- [ ] Domain services extraction from lib/
- [ ] Four-layer architecture completion
- [ ] God component elimination (remaining 12.5%)
- [ ] E2E test implementation

---

## 🔗 Cross-Cutting Concerns

### Error Handling
- ✅ Global error boundary exists
- ⚠️ Inconsistent component coverage
- ⚠️ Agent tool execution needs user-friendly recovery

### Internationalization
- ✅ i18next configured (en, vi)
- ✅ Translation keys extracted
- ⚠️ Some hardcoded strings remain

### Accessibility
- ✅ Keyboard navigation in IDE
- ✅ ARIA support in dialogs
- ⚠️ Screen reader testing needed

### Testing
- ✅ 32 test files (critical paths)
- ⚠️ Missing E2E tests
- ⚠️ Component integration tests needed

---

**Component Dependency Map Generated:** 2026-01-02
**Document ID:** `component-dependency-map-2026-01-02.md`

**Related Documents:**
- `codebase-architecture-analysis-2026-01-02.md` (Full analysis)
- `codebase-structure-summary-2026-01-02.md` (Quick reference)
