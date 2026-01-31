# Shard 2: Architecture Groups (6 Domains)

**Shard ID**: ARCH-SHARD-02
**Parent**: ARCH-REMEDIATION-INDEX-2026-01-14
**Status**: COMPLETE

---

## Group A: State & Stores Domain

### Critical Issues (P0)

| Issue | Location | Lines | Root Cause |
|-------|----------|-------|------------|
| God store | `useWorkspaceFileSystem.ts` | 571 | Mixed: project loading + file ops + Dexie |
| Credentials with CRUD + migration | `provider-credentials-slice.ts` | 396 | Security + migration mixed |
| Single-file slash command store | `slash-command-store.ts` | 471 | 471 lines without slices |

### P1 Issues

| Issue | Location | Count |
|-------|----------|-------|
| Direct `getState()` in presentation | Multiple | 47 |
| Duplicate store architecture | `project-store.ts` | 2 |
| Inconsistent persistence | localStorage vs Dexie | 3 |

---

## Group B: Context & Runtime Domain

### Critical Issues (P0)

| Issue | Location | Root Cause |
|-------|----------|------------|
| Duplicate workspace contexts | `workspace-context.ts` vs `unified-workspace-context.ts` | Conflicting providers |
| Memory leak from events | `KnowledgePage.tsx:207-210` | No cleanup on unmount |

### P1 Issues

| Issue | Location |
|-------|----------|
| Context over-fetching | `UnifiedWorkspaceContext` |
| Missing useCallback | `IconSidebar.tsx:90` |

---

## Group C: Persistence & Data Layer

### Critical Issues (P0)

| Issue | Location | Root Cause |
|-------|----------|------------|
| Conversation store facade | `useConversationStore.ts:150-404` | Mapping on every state change |
| Multiple Dexie databases | `flashcard-db.ts`, `study-database-slice.ts` | Fragmented persistence |

### P1 Issues

| Issue | Location |
|-------|----------|
| Conflict detection without hashing | `bidirectional-sync-core.ts:144-151` |
| Migration state in localStorage | `dexie-db-migrations.ts:49-72` |

---

## Group D: API & Data Flow Wiring

### Critical Issues (P0)

| Issue | Location | Root Cause |
|-------|----------|------------|
| blocksToMarkdown() incomplete | `note-tools-impl.ts:58-96` | Complex blocks not handled |
| Knowledge tools lazy init | `knowledge-tools-impl.ts:52-65` | Vault must be ready |

### P1 Issues

| Issue | Location |
|-------|----------|
| Tool catalog missing init | `tool-catalog.ts:346-354` |
| NoteStoreState lazy dependency | `note-tools-impl.ts:29-33` |

---

## Group E: Schema & Business Contracts

### Critical Issues (P0)

| Issue | Location | Count |
|-------|----------|-------|
| `as any` type assertions | `AISlashCommand.tsx:537-1013` | 50+ |
| Missing projectId in tool logs | `dexie-db-session-types.ts:97-115` | 1 |

### P1 Issues

| Issue | Location | Count |
|-------|----------|-------|
| Record<string, unknown> pollution | 15+ files | 15+ |

---

## Group F: Layers, Boundaries & Dependencies

### Critical Issues (P0)

| Issue | Location | Root Cause |
|-------|----------|------------|
| Domain depends on Infrastructure | `unified-file-crud.ts:31` | Clean Architecture violation |
| God module (knowledge) | `lib/knowledge/*` | 46 files, single point of failure |

### P1 Issues

| Issue | Location | Count |
|-------|----------|-------|
| Presentation imports Infrastructure | Multiple | 100+ |
| Duplicate Core/Domain entities | `core/entities/` vs `domain/` | 1 |

---

## Summary Table

| Group | P0 | P1 | P2 |
|-------|----|----|-----|
| A: State & Stores | 3 | 3 | 0 |
| B: Context & Runtime | 2 | 2 | 1 |
| C: Persistence | 2 | 2 | 0 |
| D: API & Wiring | 2 | 2 | 0 |
| E: Schema & Types | 2 | 1 | 2 |
| F: Layers & Boundaries | 2 | 4 | 2 |
| **TOTAL** | **13** | **14** | **5** |

---

*Back to [ARCH-INDEX.md](./ARCH-INDEX.md)*
*Next: [Shard 03 - Feature Mapping](./shard-03-feature-mapping.md)*
