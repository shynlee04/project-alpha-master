# Shard 4: Conflict Detection (P0-P2) - Updated

**Shard ID**: ARCH-SHARD-04
**Parent**: ARCH-REMEDIATION-INDEX-2026-01-14
**Status**: COMPLETE - WITH FEATURE-SPECIFIC CONFLICTS

---

## P0 Conflicts (Critical - Blocking)

### P0-001: God Credentials Slice + BYOK

| Field | Value |
|-------|-------|
| **Conflict** | Provider credentials slice mixes CRUD + migration + vault |
| **Architecture Issue** | `provider-credentials-slice.ts:396` (Group A) |
| **Feature Impact** | BYOK Story BYOK-01, BYOK-02, BYOK-03 |
| **Fix** | Split into: CRUD slice, Migration slice, Vault slice |

### P0-002: God Knowledge Module + Agent/LLM

| Field | Value |
|-------|-------|
| **Conflict** | 46 files in lib/knowledge (6 concerns mixed) |
| **Architecture Issue** | `lib/knowledge/*` (Group F) |
| **Feature Impact** | Agent/LLM Story AGENT-03 (RAG-Powered Context) |
| **Fix** | Split into: synthesis/, import/, graph/, pdf/, url/, flashcard/ |

### P0-003: God RAG Module + Agent/LLM

| Field | Value |
|-------|-------|
| **Conflict** | 30 files in lib/rag (5 concerns mixed) |
| **Architecture Issue** | `lib/rag/*` (Group F) |
| **Feature Impact** | Agent/LLM Story AGENT-03 (RAG-Powered Context) |
| **Fix** | Split into: chunking/, retrieval/, indexing/, query/, fusion/ |

### P0-004: blocksToMarkdown Incomplete + Agent/LLM

| Field | Value |
|-------|-------|
| **Conflict** | Complex block types not converted (tables, code blocks, quotes) |
| **Architecture Issue** | `note-tools-impl.ts:58-96` (Group D) |
| **Feature Impact** | Agent/LLM Story AGENT-03 (AI receives incomplete content) |
| **Fix** | Enhance blocksToMarkdown() to handle all BlockNote types |

### P0-005: Knowledge Tools Lazy Init + BYOK

| Field | Value |
|-------|-------|
| **Conflict** | Knowledge tools fail if vault not ready |
| **Architecture Issue** | `knowledge-tools-impl.ts:52-65` (Group D) |
| **Feature Impact** | Agent/LLM Story AGENT-03 (Knowledge tools unusable) |
| **Fix** | Add vault-ready check, graceful initialization |

### P0-006: Conversation Store Facade + Chat Flow

| Field | Value |
|-------|-------|
| **Conflict** | 495-line facade maps unified state on EVERY change |
| **Architecture Issue** | `useConversationStore.ts:150-404` (Group A) |
| **Feature Impact** | Chat Flow Story CHAT-01 (performance degradation) |
| **Fix** | Replace with direct use of unified-chat-store |

### P0-007: Multiple Dexie Databases + Project Space

| Field | Value |
|-------|-------|
| **Conflict** | 3 separate databases (ViaGent, Flashcard, Study) |
| **Architecture Issue** | `flashcard-db.ts`, `study-database-slice.ts` (Group C) |
| **Feature Impact** | Project Space Story PS-02 (fragmented persistence) |
| **Fix** | Consolidate to single ViaGentDatabase |

### P0-008: No Storage Abstraction + Project Space

| Field | Value |
|-------|-------|
| **Conflict** | Components know storage details (FS vs IDB) |
| **Architecture Issue** | Missing `StorageAdapter` interface (Group C) |
| **Feature Impact** | Project Space Story PS-03 (unified storage) |
| **Fix** | Create StorageAdapter interface in domain layer |

### P0-009: Domain Depends on Infrastructure + Project Space

| Field | Value |
|-------|-------|
| **Conflict** | `unified-file-crud.ts` imports from infrastructure |
| **Architecture Issue** | `domain/services/file-crud/unified-file-crud.ts:31` (Group F) |
| **Feature Impact** | Project Space Story PS-03 (Clean Architecture violation) |
| **Fix** | Move interface to domain, implementation in infrastructure |

### P0-010: Missing projectId in Tool Logs + BYOK Audit

| Field | Value |
|-------|-------|
| **Conflict** | Cannot trace tool executions to projects |
| **Architecture Issue** | `dexie-db-session-types.ts:97-115` (Group E) |
| **Feature Impact** | BYOK Story BYOK-04 (audit impossible) |
| **Fix** | Add projectId field, create migration v21 |

---

## P1 Conflicts (High - Should Fix)

| # | Conflict | Architecture Issue | Feature Impact | Fix |
|---|----------|-------------------|----------------|-----|
| P1-001 | Direct store access (47 violations) | Multiple files (Group A) | Chat UI render issues | Create hooks |
| P1-002 | Tool catalog missing init | `tool-catalog.ts:346-354` (Group D) | Silent tool failures | Add startup hook |
| P1-003 | 100+ `as any` casts | Multiple files (Group E) | Type safety gaps | Remove casts, add Zod |
| P1-004 | Sync without content hash | `bidirectional-sync-core.ts:144` (Group C) | False conflicts | Add SHA-256 |
| P1-005 | Duplicate workspace contexts | `workspace-context.ts` vs `unified-...` (Group B) | Conflicting providers | Consolidate |
| P1-006 | Migration state in localStorage | `dexie-db-migrations.ts:49-72` (Group C) | Private mode fails | Store in Dexie |
| P1-007 | Duplicate conversation stores | `useConversationStore.ts` vs `unified-chat-store.ts` (Group A) | Migration incomplete | Complete migration |
| P1-008 | KnowledgePage memory leak | `KnowledgePage.tsx:207-210` (Group B) | Browser memory growth | Fix cleanup |

---

## P2 Conflicts (Medium - Nice to Fix)

| # | Conflict | Architecture Issue | Impact | Fix |
|---|----------|-------------------|--------|-----|
| P2-001 | Event bus duplication | `eventBus` vs `crossWorkspaceEventBus` | Event fragmentation | Consolidate |
| P2-002 | Console.log in prod | `cross-workspace-event-bus.ts:220` | Performance | Remove/guard |
| P2-003 | Legacy migration code active | `conversation-migration.ts:542` | Technical debt | Remove |
| P2-004 | Inconsistent persistence | localStorage vs Dexie | Different behavior | Standardize |
| P2-005 | Event bus type safety gaps | Callbacks typed as `any` | Type safety | Strongly type |

---

## Conflict Summary by Feature Group

| Feature Group | P0 | P1 | P2 |
|---------------|----|----|-----|
| BYOK Vault System | 2 | 3 | 0 |
| Project Space Boundaries | 4 | 2 | 2 |
| Agent/LLM Orchestration | 3 | 2 | 0 |
| Cascade Chat Flow | 1 | 2 | 2 |
| Cross-Workspace | 0 | 2 | 1 |
| Workspace-Specific | 0 | 1 | 0 |
| **TOTAL** | **10** | **12** | **5** |

---

*Back to [ARCH-INDEX.md](./ARCH-INDEX.md)*
*Next: [Shard 05 - Remediation Grouping](./shard-05-remediation-grouping.md)*
