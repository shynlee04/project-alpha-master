# Shard 7: File Change Manifest - Master Index

**Shard ID**: ARCH-SHARD-07
**Parent**: ARCH-REMEDIATION-INDEX-2026-01-14
**Status**: MASTER INDEX - References Detailed Manifests

---

## File Change Summary by Epic

### Epic 1: Foundation Fixes

| Action | File | Verification |
|--------|------|--------------|
| ADD | `knowledge-tools-impl.ts` health check | Tools initialize gracefully |
| MODIFY | `note-tools-impl.ts` enhance blocksToMarkdown | All block types convert |
| MODIFY | `tool-catalog.ts` add startup init | Tools registered on start |

**Files**: 3 | **Net Change**: +~130 lines

### Epic 2: Store Consolidation

| Action | File | Verification |
|--------|------|--------------|
| CREATE | `use-workspace-file-loader.ts` | Tests pass |
| CREATE | `use-workspace-file-ops.ts` | Tests pass |
| CREATE | `use-workspace-dexie-adapter.ts` | Tests pass |
| MODIFY | `useWorkspaceFileSystem.ts` | Lines < 200 |
| CREATE | `provider-credentials-crud.ts` | Tests pass |
| CREATE | `provider-migration-slice.ts` | Tests pass |
| MODIFY | `provider-credentials-slice.ts` | Lines < 300 |
| CREATE | `use-conversation.ts` hook | Tests pass |
| MODIFY | `ChatInterface.tsx` | ensureConversation() |
| DELETE | `conversation-migration.ts` | No imports |

**Files**: 11 | **Net Change**: +~500 lines, -~900 lines

### Epic 3: Context & Event Unification

| Action | File | Verification |
|--------|------|--------------|
| MODIFY | `unified-workspace-context.ts` | All slices work |
| DELETE | `workspace-context.ts` | No imports |
| FIX | Event subscriptions | No memory leaks |

**Files**: 3 | **Net Change**: -~500 lines

### Epic 4: Module Refactoring

| Action | File | Verification |
|--------|------|--------------|
| CREATE | `lib/knowledge/synthesis/` (8 files) | Tests pass |
| CREATE | `lib/knowledge/import/` (6 files) | Tests pass |
| CREATE | `lib/knowledge/graph/` (5 files) | Tests pass |
| CREATE | `lib/rag/chunking/` (5 files) | Tests pass |
| CREATE | `lib/rag/retrieval/` (5 files) | Tests pass |
| CREATE | `domain/interfaces/storage-adapter.ts` | Interface complete |
| DELETE | Old `lib/knowledge/*` | All imports updated |
| DELETE | Old `lib/rag/*` | All imports updated |

**Files**: 30+ | **Net Change**: +~800 lines, -~1500 lines

### Epic 5: Type Safety

| Action | File | Verification |
|--------|------|--------------|
| REMOVE | `as any` in AISlashCommand | Zero remaining |
| ADD | `domain/schemas/credential-schemas.ts` | 6 schemas |
| ADD | `dexie-db-migrations.ts` v21 | Migration works |
| MODIFY | `provider-types.ts` | Validation added |

**Files**: 4 | **Net Change**: +~200 lines, -~50 casts

### Epic 6: Persistence Consolidation

| Action | File | Verification |
|--------|------|--------------|
| CREATE | Migration v21: FlashcardDB → ViaGent | Data preserved |
| DELETE | `flashcard-db.ts` | No imports |
| CREATE | Migration v22: StudyDB → ViaGent | Data preserved |
| DELETE | `study-database-slice.ts` | No imports |
| MODIFY | `bidirectional-sync-core.ts` | Content hashing |
| MODIFY | `dexie-db-migrations.ts` | State in Dexie |

**Files**: 6 | **Net Change**: +~200 lines, -~500 lines

---

## Total File Changes

| Epic | Create | Modify | Delete |
|------|--------|--------|--------|
| 1: Foundation | 0 | 3 | 0 |
| 2: Stores | 5 | 4 | 1 |
| 3: Context | 0 | 2 | 1 |
| 4: Modules | 30+ | 0 | 20+ |
| 5: Types | 2 | 2 | 0 |
| 6: Persistence | 2 | 2 | 2 |
| **TOTAL** | **~40** | **~13** | **~24** |

**Net Code Change**: +~1830 lines, -~2900 lines = **-1070 lines**

---

## Must-Pass Checklist Per Epic

### Epic 1: Foundation Fixes
- [ ] Knowledge tools initialize gracefully
- [ ] All block types convert correctly
- [ ] Tools registered on app start

### Epic 2: Store Consolidation
- [ ] useWorkspaceFileSystem.ts < 200 lines
- [ ] ProviderCredentialsSlice < 300 lines
- [ ] Conversation auto-creation works
- [ ] getState() removed from presentation

### Epic 3: Context & Event Unification
- [ ] Only one workspace context active
- [ ] No double re-renders
- [ ] No memory leaks

### Epic 4: Module Refactoring
- [ ] lib/knowledge/ has 6 subdirectories (<15 files each)
- [ ] lib/rag/ has 5 subdirectories (<15 files each)
- [ ] StorageAdapter interface defined
- [ ] All imports updated

### Epic 5: Type Safety
- [ ] Zero `as any` casts in provider code
- [ ] Zod schemas validate all key input
- [ ] projectId added to tool logs

### Epic 6: Persistence Consolidation
- [ ] Single ViaGentDatabase
- [ ] Content hashing works
- [ ] Migration state in Dexie

---

*Back to [ARCH-INDEX.md](./ARCH-INDEX.md)*
*Next: [Shard 08 - Executive Summary](./shard-08-executive-summary.md)*
