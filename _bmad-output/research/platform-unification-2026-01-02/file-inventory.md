---
name: Platform Unification - File Inventory
iteration: 1
created: 2026-01-02T13:00:00+07:00
scope: Complete codebase scan for store/provider/agent/conversation/RAG files
---

# File Inventory - Platform Unification Research

**Iteration:** 1
**Date:** 2026-01-02
**Purpose:** Establish baseline understanding of current codebase fragmentation

---

## Store Files Inventory (14,451 total lines across stores)

### CRITICAL FINDING: Massive Store Fragmentation

**Store Locations (3 separate directories):**
1. `src/stores/` (legacy)
2. `src/lib/state/` (transitional)
3. `src/infrastructure/persistence/stores/` (new architecture)

### God Store Files (>300 lines) - NEED IMMEDIATE REFACTORING

| File | Lines | Issue | Priority |
|------|-------|-------|----------|
| `knowledge-store.test.ts` | 1,024 | Test file, but indicates god store | P0 |
| `conversation-threads-store.ts` | 726 | Thread management god store | P0 |
| `knowledge-store.ts` | 718 | Knowledge god store | P0 |
| `quiz-store.ts` | 629 | Quiz state god store | P1 |
| `conversation-store.ts` | 626 | Conversation god store | P0 |
| `canvas-store.ts` | 619 | Canvas state god store | P1 |
| `note-store.ts` | 566 | Note state god store | P1 |
| `flashcard-store.ts` | 521 | Flashcard god store | P1 |
| `file-snapshot-store.ts` | 509 | File sync state | P1 |
| `project-store.ts` | 450 | Project state | P0 |

### Provider & LLM Configuration Files

**Core Files:**
- `src/lib/agent/providers/provider-adapter.ts` - Provider adapter factory
- `src/lib/agent/providers/anthropic-adapter.ts` - Anthropic adapter
- `src/lib/agent/providers/credential-vault.ts` - Credential storage (encrypted)
- `src/lib/agent/providers/credential-encryption.ts` - Encryption utilities
- `src/lib/agent/providers/types.ts` - Provider type definitions
- `src/core/entities/Provider.ts` - Provider domain entity

**Test Files:**
- `src/lib/agent/providers/__tests__/provider-adapter.test.ts`
- `src/lib/agent/providers/__tests__/credential-vault.test.ts`
- `src/lib/agent/providers/__tests__/credential-encryption.test.ts`

### Agent Configuration Files

**Core Entity:**
- `src/core/entities/Agent.ts` - Agent domain entity
- `src/hooks/useAgents.ts` - Agent hook

**Stores:**
- `src/infrastructure/persistence/stores/agents/agent-selection-store.ts` (282 lines)
- Store locations scattered across 3 directories

**Tool Files:**
- `src/lib/agent/tools/` - 20+ individual tool files
- `src/lib/agent/tools/types.ts` - Tool type definitions

### Conversation & Thread Files

**Store Files (MULTIPLE LOCATIONS - CRITICAL FRAGMENTATION):**
1. `src/infrastructure/persistence/stores/conversation/conversation-threads-store.ts` (726 lines)
2. `src/lib/state/conversation-store.ts` (626 lines)
3. `src/lib/workspace/conversation-store.ts` (94 lines)
4. `src/infrastructure/persistence/stores/conversation/conversation-store.ts` (21 lines)
5. `src/lib/workspace/threads-store.ts` (142 lines)

**Support Files:**
- `src/lib/chat/context-window-manager.ts` - Token management
- `src/lib/agent/memory/conversation-memory.ts` - Conversation memory
- `src/lib/agent/memory/memory-index.ts` - Memory indexing
- `src/core/entities/Conversation.ts` - Conversation domain entity

### RAG & Embedding Files

**Store Files (FRAGMENTED):**
1. `src/lib/state/knowledge-store.ts` (718 lines) - Primary knowledge store
2. `src/lib/state/__tests__/knowledge-store.test.ts` (1,024 lines)
3. `src/infrastructure/persistence/stores/rag/rag-store.ts` (124 lines)
4. `src/infrastructure/persistence/rag-store-types.ts` (242 lines)

**Core RAG Files:**
- `src/lib/rag/chunk-strategies.ts` - Document chunking
- `src/lib/rag/indexeddb-storage.ts` - IndexedDB for embeddings
- `src/lib/rag/query-optimizer-config.ts` - Query optimization
- `src/lib/rag/pagination.ts` - Result pagination
- `src/lib/rag/live-api-websocket.ts` - Live API WebSocket

**Components:**
- `src/components/rag/` - RAG UI components

### File System & Project Files

**Store Files:**
- `src/lib/workspace/project-store.ts` (450 lines) - Project state
- `src/lib/filesystem/file-snapshot-store.ts` (509 lines) - File sync state
- `src/lib/workspace/file-sync-status-store.ts` (254 lines)

**Project Context:**
- `src/lib/workspace/ProjectContext.tsx`
- `src/lib/workspace/WorkspaceContext.tsx`

---

## Summary Statistics

### Store Fragmentation (CRITICAL ISSUE)

| Metric | Count | Notes |
|--------|-------|-------|
| **Total store files** | 50+ | Across 3 directories |
| **Total lines in stores** | 14,451 | Massive duplication likely |
| **God stores (>300 lines)** | 10 | Need immediate refactoring |
| **Duplicate conversation stores** | 5 | CRITICAL fragmentation |
| **Store directories** | 3 | No single source of truth |

### Provider Configuration
- **Status:** Partially centralized
- **Issue:** Scattered across multiple files
- **Good:** Has credential vault with encryption
- **Gap:** No unified LLMStore with Dexie persistence

### Agent Configuration
- **Status:** Fragmented
- **Issue:** Agent definitions in multiple locations
- **Good:** Has domain entity in `src/core/entities/Agent.ts`
- **Gap:** No centralized agent vault with workspace bindings

### Conversation System
- **Status:** HEAVILY FRAGMENTED
- **Issue:** 5 separate conversation stores
- **Good:** Has conversation domain entity
- **Gap:** No unified thread management

### RAG System
- **Status:** Partially implemented
- **Issue:** Stores scattered, some god stores
- **Good:** Has chunking, embedding, storage
- **Gap:** No unified pipeline with UI integration

### Project & File System
- **Status:** Partially implemented
- **Issue:** Not integrated with workspaces
- **Good:** Has project context, file sync
- **Gap:** No Hub integration, workspace binding broken

---

## Next Steps (Iteration 2-5)

**Iteration 2:** Cornerstone 1 Deep Dive (Provider Configuration)
- Audit all provider-related files
- Map current provider store structure
- Identify gaps in unified LLMStore design

**Iteration 3:** Cornerstone 2 Deep Dive (Agent Vault)
- Audit all agent-related files
- Map current agent store structure
- Identify workspace binding implementation gaps

**Iteration 4:** Cornerstone 3 Deep Dive (Conversation System)
- Audit all conversation stores (5 locations!)
- Map thread management flow
- Identify conversation consolidation strategy

**Iteration 5:** Cornerstone 5 Deep Dive (RAG Pipeline)
- Audit all RAG/embedding files
- Map document processing flow
- Identify UI integration gaps

---

**Generated:** Iteration 1
**Next:** Cornerstone 1 Provider Analysis
