# Phase 0: Dependency Graph Analysis

## Executive Summary

This document maps inter-file dependencies to identify circular imports, hub files, bottlenecks, and orphan files.

---

## God File Dependencies

### Critical God Files and Their Dependencies

| File | Lines | Imports | Imported By |
|------|-------|---------|-------------|
| dexie-db.ts | 1,152 | dexie, dexie-helpers, stores | 15+ files |
| event-bus.ts | 764 | events, typed-emitter | 10+ files |
| cross-workspace-event-bus.ts | 588 | EventEmitter3 | 8+ files |
| template-registry.ts | 1,321 | fs, path, template-types | 5 files |
| conversation-threads-store.ts | 726 | zustand, dexie | 6 files |
| rag-store.ts | 1,595 | zustand, orama, embeddings | 12 files |
| IDEStore.ts | 850+ | zustand, persistence | 8 files |
| workspace-store.ts | 700+ | zustand, project-context | 7 files |

---

## Circular Dependency Analysis

### Potential Circular Dependencies Identified

#### 🔴 HIGH RISK: Agent ↔ Provider Store Cycle
```
useAgentsStore (infrastructure/persistence/stores/agents/)
    ↓ imports
ProviderCredential type (core/entities/Provider.ts)
    ↓ imports
ProviderStore types (infrastructure/persistence/stores/providers/)
    ↓ imports
Agent entity (core/entities/Agent.ts)
    ↓ uses type from
useAgentsStore ⚠️ CIRCULAR
```

#### 🔴 HIGH RISK: Conversation ↔ Dexie Cycle
```
conversation-threads-store.ts
    ↓ imports
dexie-db.ts
    ↓ re-exports from
lib/state/dexie-db-helpers/ ⚠️ BIDIRECTIONAL
```

#### 🟡 MEDIUM RISK: Workspace ↔ Project Context
```
useWorkspaceStore
    ↓ imports
ProjectContext.tsx
    ↓ provides
useProjectContext
    ↓ used by
workspace-access-helper.tsx ⚠️ INDIRECT CYCLE
```

#### 🟡 MEDIUM RISK: Hook ↔ Store
```
useChatHistory.ts
    ↓ imports
useConversationStore
    ↓ creates effect that calls
useChatHistory ⚠️ RENDER LOOP RISK
```

---

## Hub Files Analysis

### Files Imported by >10 Other Files

| File | Import Count | Risk Level | Notes |
|------|--------------|------------|-------|
| @/lib/utils.ts | 45+ | 🔴 HIGH | Common utilities |
| @/lib/errorHandling.ts | 30+ | 🔴 HIGH | Error handlers |
| @/infrastructure/persistence/dexie-db.ts | 25+ | 🔴 HIGH | Database |
| @/lib/cn.ts | 40+ | 🟡 MEDIUM | Classnames utility |
| @/hooks/useWorkspaceContext.ts | 15+ | 🟡 MEDIUM | Workspace access |
| @/lib/event-bus.ts | 12+ | 🟡 MEDIUM | Event system |

### Critical Import Chains

```
__root.tsx
├── providers/ (React Query, QueryClientProvider)
├── App.tsx
│   ├── TanStackRouterProvider
│   ├── TanStackRouter
│   └── Route (lazy loaded routes)
├── errorHandling.ts
│   └── Global error handlers
└── event-bus.ts
    └── Global event system
```

---

## Orphan Files Analysis

### Files with Minimal Dependencies

| File | Last Modified | Action Required |
|------|---------------|-----------------|
| src/lib/notes/note-store.backup.ts | Unknown | DELETE - backup file |
| src/lib/workflow/builder/workflow-builder-store.backup.ts | Unknown | DELETE - backup file |
| src/lib/notes/markdown-converter.ts | 2025 | REVIEW - may be deprecated |
| src/lib/templates/template-registry.ts | 2025 | REVIEW - large, may need split |

---

## Critical Import Chains by Feature

### IDE Feature Import Chain
```
routes/ide.$projectId.tsx
├── ProjectProvider (@/lib/workspace)
│   ├── useProjectContext
│   │   └── IDEStore
│   └── getProject
├── EnhancedChatInterface.tsx
│   ├── useAgentChatWithTools
│   │   ├── AgentFactory
│   │   └── ToolRegistry
└── MonacoEditor.tsx
    └── monaco-editor (heavy dependency)
```

### Notes Feature Import Chain
```
routes/notes.$projectId.lazy.tsx
├── NotesPage.tsx
│   ├── useNoteStore (@/lib/notes)
│   │   └── dexie-db.ts
│   ├── BlockNoteEditor
│   │   └── @blocknote/core
│   └── ChatPanel
│       └── useConversationStore
└── workspace-access-helper.tsx
    └── useWorkspaceStore
```

### Knowledge Feature Import Chain
```
routes/knowledge.$projectId.lazy.tsx
├── KnowledgePage.tsx
│   ├── rag-store.ts (1,595 lines - GOD STORE)
│   │   └── orama-index.ts
│   ├── IncrementalIndexingService
│   │   └── embedding-service.ts
│   └── IndexingProgressPanel.tsx
└── workspace-access-helper.tsx
    └── useWorkspaceStore
```

---

## Dependency Risk Matrix

| Component | Dependency Count | Circular Risk | Bottleneck Risk |
|-----------|------------------|---------------|-----------------|
| dexie-db.ts | 25+ | Medium | 🔴 HIGH |
| rag-store.ts | 20+ | Low | 🔴 HIGH |
| useWorkspaceStore | 15+ | Medium | 🟡 MEDIUM |
| event-bus.ts | 12+ | Low | 🟡 MEDIUM |
| conversation-threads-store.ts | 10+ | 🔴 HIGH | 🟡 MEDIUM |
| IDEStore | 8+ | Low | 🟡 MEDIUM |

---

## Recommendations

### Immediate Actions
1. **Split rag-store.ts** (1,595 lines) - Move slices to infrastructure/persistence/stores/
2. **Remove backup files** - Delete .backup.ts files
3. **Fix Agent ↔ Provider circular dependency** - Use interface segregation
4. **Add barrel exports** - Reduce direct imports of deep paths

### Short-term Actions
1. **Extract orama-index.ts** from rag-store
2. **Split conversation-threads-store.ts** into slices
3. **Create facade layer** for event buses
4. **Document import rules** - No circular imports allowed

### Long-term Actions
1. **Implement dependency injection** - Reduce tight coupling
2. **Create clear module boundaries** - Presentation vs Lib vs Infrastructure
3. **Enforce architectural layers** - No Lib importing from Presentation
4. **Add dependency graph visualization** - Monitor complexity growth

---

*Generated by Codebase Diagnostic Workflow v1.0.0*
*Phase 0: Dependency Graph Analysis*
*Date: 2026-01-09*
