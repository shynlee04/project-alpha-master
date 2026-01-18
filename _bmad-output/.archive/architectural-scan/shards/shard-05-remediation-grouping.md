# Shard 5: Remediation Grouping (6 Epics) - Updated

**Shard ID**: ARCH-SHARD-05
**Parent**: ARCH-REMEDIATION-INDEX-2026-01-14
**Status**: COMPLETE - WITH FEATURE-SPECIFIC REFERENCES

---

## Epic 1: Foundation Fixes

**Scope**: Critical wiring issues blocking feature functionality

| Issue | Priority | Feature | Stories |
|-------|----------|---------|---------|
| Add vault-ready check to KnowledgeToolsFacade | P0 | Agent/LLM | AGENT-03 |
| Enhance blocksToMarkdown() for complex blocks | P0 | Agent/LLM | AGENT-03 |
| Fix NoteStoreState lazy dependency | P0 | Agent/LLM | AGENT-03 |
| Add tool catalog startup initialization | P1 | Agent/LLM | AGENT-02 |

**Files**: ~6 files
**Duration**: 1-2 days

---

## Epic 2: Store Consolidation

**Scope**: Fix god stores and direct access violations

| Issue | Priority | Feature | Stories |
|-------|----------|---------|---------|
| Split useWorkspaceFileSystem.ts (571 lines) | P0 | Project Space | PS-01, PS-02, PS-03 |
| Split provider-credentials-slice.ts (396 lines) | P0 | BYOK | BYOK-01, BYOK-02 |
| Replace conversation store facade | P0 | Chat Flow | CHAT-01 |
| Convert 47 getState() violations to hooks | P1 | Chat Flow | CHAT-05 |

**Files**: ~25 files
**Duration**: 1-2 weeks

---

## Epic 3: Context & Event Unification

**Scope**: Fix duplicate contexts and event system

| Issue | Priority | Feature | Stories |
|-------|----------|---------|---------|
| Deprecate legacy WorkspaceContext | P0 | Cross-Workspace | ALL |
| Fix event subscription cleanup | P0 | Cross-Workspace | ALL |
| Consolidate event bus architecture | P2 | Cross-Workspace | ALL |

**Files**: ~13 files
**Duration**: 3-5 days

---

## Epic 4: Module Refactoring

**Scope**: Split god modules into focused sub-modules

| Issue | Priority | Feature | Stories |
|-------|----------|---------|---------|
| Split Knowledge module (46 files → 6 subdirs) | P0 | Agent/LLM | AGENT-03 |
| Split RAG module (30 files → 5 subdirs) | P0 | Agent/LLM | AGENT-03 |
| Create StorageAdapter interface | P0 | Project Space | PS-03 |
| Fix Domain→Infrastructure import | P0 | Project Space | PS-03 |

**Files**: ~30 files
**Duration**: 1-2 weeks

---

## Epic 5: Type Safety

**Scope**: Reduce `as any` casts and add validation

| Issue | Priority | Feature | Stories |
|-------|----------|---------|---------|
| Remove `as any` in AISlashCommand (50+ casts) | P0 | Workspace-Specific | ALL |
| Add Zod validation for domain inputs | P1 | BYOK | BYOK-02 |
| Add `projectId` to ToolExecutionLogRecord | P0 | BYOK | BYOK-04 |

**Files**: ~17 files
**Duration**: 1 week

---

## Epic 6: Persistence Consolidation

**Scope**: Consolidate multiple Dexie databases

| Issue | Priority | Feature | Stories |
|-------|----------|---------|---------|
| Consolidate FlashcardDB into ViaGentDatabase | P0 | Workspace-Specific | Study |
| Consolidate StudyDB into ViaGentDatabase | P0 | Workspace-Specific | Study |
| Add content hashing to conflict detection | P1 | Project Space | PS-04 |
| Store migration state in Dexie | P1 | Project Space | PS-02 |

**Files**: ~12 files
**Duration**: 1 week

---

## Total Effort Summary

| Epic | Files | Duration | Features Fixed |
|------|-------|----------|----------------|
| 1: Foundation | 6 | 1-2 days | Agent/LLM |
| 2: Stores | 25 | 1-2 weeks | Project Space, BYOK, Chat |
| 3: Context | 13 | 3-5 days | Cross-Workspace |
| 4: Modules | 30 | 1-2 weeks | Agent/LLM, Project Space |
| 5: Types | 17 | 1 week | BYOK, Workspace |
| 6: Persistence | 12 | 1 week | Project Space, Workspace |
| **TOTAL** | **~100** | **4-6 weeks** | **ALL** |

---

*Back to [ARCH-INDEX.md](./ARCH-INDEX.md)*
*Next: [Shard 06 - Requirements & Stories](./shard-06-requirements-stories.md)*
