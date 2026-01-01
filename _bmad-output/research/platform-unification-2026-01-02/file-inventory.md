# Platform Unification File Inventory

**Date**: 2026-01-02
**Phase**: 1 - Codebase Analysis & Gap Documentation
**Iteration**: 11-15

## 📊 Executive Summary

**Total Files**: 711 files across 177 directories
**Total Lines**: ~172,582 lines of code
**God Components**: 17 files >300 lines
**Store Duplication**: 30% (17 duplicate stores)
**Overall Health**: 5.9/100 (CRITICAL)

---

## 🎯 Critical Files by Cornerstone

### Cornerstone 1: Provider Configuration (83/100 ✅)

**Key Files**:
- `src/infrastructure/persistence/stores/use-app-store.ts` (321 lines) - Unified global store
- `src/lib/agent/providers/credential-vault.ts` (215 lines) - Encrypted API key storage
- `src/lib/agent/providers/model-registry.ts` (178 lines) - Available AI models
- `src/presentation/components/agent/ProviderConfigDialog.tsx` (287 lines)

**Status**: ✅ Story 3.2 complete, consolidation done, reactivity gaps remain

---

### Cornerstone 2: Agent Configuration (70/100 ⚠️)

**Key Files**:
- `src/infrastructure/persistence/stores/agents/agents-store.ts` (430 lines) - ❌ GOD STORE
- `src/infrastructure/persistence/stores/agents/agent-selection-store.ts` (156 lines)
- `src/presentation/components/agent/AgentConfigDialog.tsx` (1,089 lines) - ❌ WORST GOD COMPONENT
- `src/presentation/components/agent/UnifiedAgentSelector.tsx` (247 lines) - ✅ NEW (Cycle 18)
- `src/presentation/components/agent/AgentManager.tsx` (285 lines) - ✅ NEW (Cycle 18)

**God Components**:
1. **AgentConfigDialog.tsx** - 1,089 lines (9x over limit) - P0 Phase 0 target
2. **agents-store.ts** - 430 lines (3.6x over limit)

---

### Cornerstone 3: Conversation System (60/100 ⚠️)

**Key Files**:
- `src/infrastructure/persistence/stores/conversation/conversation-threads-store.ts` (726 lines) - ❌ GOD STORE
- `src/lib/state/conversation-store.ts` (626 lines) - Duplicate
- `src/lib/chat/context-window-manager.ts` (token management)
- `src/presentation/components/chat/ChatPanel.tsx` (312 lines) - ⚠️ God component

**God Components**:
1. **conversation-threads-store.ts** - 726 lines (6x over limit)
2. **ChatPanel.tsx** - 312 lines (2.6x over limit)

---

### Cornerstone 4: Project Management (75/100 ✅)

**Key Files**:
- `src/lib/workspace/project-store.ts` (450 lines)
- `src/lib/workspace/ProjectContext.tsx` (workspace context)
- `src/lib/filesystem/sync-manager/` (FSA integration)
- `src/lib/webcontainer/manager.ts` (WebContainer lifecycle)

**Status**: Backend solid, Hub UI missing (P0 - 20 hours)

---

### Cornerstone 5: RAG & Knowledge Synthesis (50/100 ❌)

**Key Files**:
- `src/lib/state/rag-store.ts` (1,595 lines) - ❌ WORST GOD STORE (13x over limit)
- `src/lib/rag/embedding-service.ts` (embeddings)
- `src/lib/rag/chunk-strategies/` (3 strategies)
- `src/lib/knowledge/synthesis-service.ts` (synthesis logic)
- `src/presentation/components/canvas/Canvas.tsx` (canvas UI)

**God Components**:
1. **rag-store.ts** - 1,595 lines (13x over limit) - WORST OFFENDER

**Missing UI Components** (P0):
- DocumentPreviewViewer, EmbeddingVisualization, KnowledgeSearchInterface

---

## 📦 Store Distribution (71 Total)

### Primary: `src/infrastructure/persistence/stores/` (38 files)
- **Modern architecture**, December 2025 Zustand patterns
- 5 god stores identified
- Total: ~5,500 lines

### Legacy: `src/lib/state/` (25 files)
- **Migrating to infrastructure layer**
- Total: ~3,000 lines
- Status: DEPRECATED

### Deprecated: `src/stores/` (8 files)
- **Duplicates and empty files**
- 2 god stores (duplicates)
- Total: ~1,200 lines
- Status: DELETE after migration

---

## 🎨 UI Component Distribution (294 Total)

| Workspace | Count | God Components | Health |
|-----------|-------|----------------|--------|
| IDE | 80+ | 3 | GOOD |
| Knowledge | 15 | 1 | MIXED |
| Study | 12 | 1 | GOOD |
| Notes | 10 | 1 | GOOD |
| Agent Config | 20+ | 3 | CRITICAL |
| Common/UI | 50+ | 2 | GOOD |
| Layout | 10+ | 0 | EXCELLENT |
| Chat | 15+ | 1 | MIXED |

**Total God Components**: 12 files >300 lines

---

## 🔧 Service Layer Files (~200 files)

### Domain Services
- `src/domain/services/agent-workspace-utils.ts` (106 lines) - ✅ EXCELLENT

### Application Services
- `src/application/services/AgentService.ts`
- `src/application/services/ProviderService.ts`

### Library Services
- `src/lib/agent/` (45+ files) - AI agent infrastructure
- `src/lib/filesystem/` (25+ files) - File system sync
- `src/lib/knowledge/` (30+ files) - Knowledge graph, RAG
- `src/lib/rag/` (25+ files) - RAG indexing, retrieval
- `src/lib/webcontainer/` - WebContainer lifecycle

---

## 🧪 Test Files (40+)

Distribution:
- Agent tests: 15+ files
- Filesystem tests: 12 files
- Hook tests: 8 files
- RAG tests: 5 files

**Status**: 47/47 tests passing (Story 3.2)

---

## ✅ Completion: 40%

**Completed**:
- ✅ Complete file inventory (711 files catalogued)
- ✅ God components identified (17 files >300 lines)
- ✅ Store duplication mapped (17 duplicate stores)
- ✅ Workspace distribution documented (294 components)

**Next**: Create prioritized remediation plan (Iterations 16-20)
