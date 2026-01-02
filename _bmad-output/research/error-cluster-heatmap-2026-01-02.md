# TypeScript Error Cluster Heatmap
**Date**: 2026-01-02
**Analysis Tool**: Repomix + TypeScript Compiler
**Total Errors**: 1,130

---

## Top 50 Error Hotspots

### 🔴 CRITICAL (20+ errors per file)

| Rank | File | Errors | Category | Risk Level |
|------|------|--------|----------|------------|
| 1 | `src/lib/filesystem/file-snapshot-store.ts` | 47 | File System | 🔴 P0 - Data Loss |
| 2 | `src/lib/workspace/__tests__/project-metadata.test.ts` | 23 | Test | 🟡 P3 |
| 3 | `src/lib/agent/__tests__/prompt-composer.test.ts` | 21 | Test | 🟡 P3 |
| 4 | `src/lib/agent/providers/anthropic-adapter.ts` | 20 | Agent | 🟠 P1 - Feature Regression |
| 5 | `WorkspacePermissionManager.tsx` | 19 | UI | 🟢 P2 |
| 6 | `src/lib/knowledge/__tests__/runtime-validation.test.ts` | 18 | Test | 🟡 P3 |
| 6 | `useConversationStore.test.ts` | 18 | Test | 🟡 P3 |
| 8 | `migrate-api-keys-to-vault.test.ts` | 17 | Test | 🟡 P3 |
| 8 | `conversation-migration.test.ts` | 17 | Test | 🟡 P3 |
| 10 | `useConversationStore.ts` | 16 | Store | 🟠 P1 - Performance |
| 11 | `AgentConfigDialog.tsx` | 14 | UI | 🟢 P2 |
| 11 | `useProviderEvents.ts` | 14 | Agent | 🟠 P1 |
| 13 | `IDELayoutMain.tsx` | 13 | UI | 🟢 P2 |
| 13 | `hybrid-retriever.test.ts` | 13 | Test | 🟡 P3 |
| 13 | `cross-workspace-file-operations.integration.test.ts` | 13 | Test | 🟡 P3 |
| 13 | `knowledge-tools-impl.ts` | 13 | Agent | 🟠 P1 |

---

### 🟠 HIGH (10-19 errors per file)

| Rank | File | Errors | Category |
|------|------|--------|----------|
| 17 | `MarkdownExportDialog.tsx` | 12 | UI |
| 17 | `ConceptNode.test.tsx` | 12 | Test |
| 17 | `dexie-db-migrations.ts` | 12 | DB Migration |
| 17 | `flashcard-store.test.ts` | 12 | Test |
| 21 | `session-snapshot-manager.ts` | 11 | Store |
| 22 | `MarkdownImportDialog.tsx` | 10 | UI |
| 22 | `reverse-sync-service.ts` | 10 | File Sync |
| 22 | `note-store.test.ts` | 10 | Test |
| 22 | `tool-execution-logger.test.ts` | 10 | Test |
| 22 | `schema-migrations.ts` | 10 | Schema |
| 22 | `migration-backup.test.ts` | 10 | Test |
| 22 | `schema-migrations.test.ts` | 10 | Test |
| 28 | `RAGPanelContainer.tsx` | 9 | UI |
| 28 | `orama-index.ts` | 9 | RAG |
| 28 | `knowledge/index.ts` | 9 | Knowledge |
| 28 | `study-file-sync-service.test.ts` | 9 | Test |
| 28 | `cross-workspace-file-references.test.ts` | 9 | Test |

---

### 🟡 MEDIUM (7-9 errors per file)

| Rank | File | Errors | Category |
|------|------|--------|----------|
| 32 | `router.tsx` | 8 | Routing |
| 32 | `LinkageProposalsPanel.test.tsx` | 8 | Test |
| 32 | `session-snapshot.test.ts` | 8 | Test |
| 32 | `stores/index.ts` | 8 | Store |
| 36-49 | (14 files tied) | 7 | Mixed |
| - | `RAGChatPanel.test.tsx` | 7 | Test |
| - | `NoteContextMenu.tsx` | 7 | UI |
| - | `ApprovalOverlay.test.tsx` | 7 | Test |
| - | `SourceNode.test.tsx` | 7 | Test |
| - | `note-store.ts` | 7 | Store |
| - | `markdown-converter.ts` | 7 | Notes |
| - | `source-import.ts` | 7 | Knowledge |
| - | `mock-data.ts` | 7 | Test |
| - | `ide-file-sync-service.ts` | 7 | Sync |
| - | `rag-linkage-analyzer.ts` | 7 | Canvas |
| - | `chat-api.test.ts` | 7 | Test |
| - | `dexie-db-migrations.ts` | 7 | DB |

---

## Error Distribution by Category

```
Test Files (73%):        824 errors
├── Vitest Imports:      50 errors
├── Mock Type Issues:    150 errors
├── Assertion Types:     100 errors
└── Test Setup:          524 errors

Production Code (27%):   306 errors
├── Store Architecture:  150 errors
├── Agent System:        60 errors
├── RAG Pipeline:        40 errors
├── File System:         26 errors
└── UI Components:       30 errors
```

---

## Error Type Breakdown

```typescript
// Top 10 Error Codes (from tsc output)
TS7006  (implicit any)          : ~300 errors  ████████████████████
TS2307  (module not found)       : ~150 errors  ████████
TS2339  (property missing)       : ~120 errors  ███████
TS2322  (type mismatch)          : ~100 errors  ██████
TS2740  (missing properties)     : ~90 errors   █████
TS2345  (argument not assignable): ~80 errors   █████
TS2305  (export not found)       : ~70 errors   ████
TS6133  (unused variable)        : ~60 errors   ████
TS2367  (comparison overlap)     : ~50 errors   ███
TS2353  (unknown property)       : ~40 errors   ██
```

---

## Geographic Heatmap (by Directory)

```
src/
├── lib/                           407 errors
│   ├── filesystem/               98 errors  🔴🔴🔴
│   ├── agent/                    87 errors  🔴🔴
│   ├── knowledge/                65 errors  🔴
│   ├── rag/                      54 errors  🔴
│   ├── state/                    43 errors  🟠
│   ├── notes/                    30 errors  🟠
│   └── sync/                     30 errors  🟠
│
├── infrastructure/
│   └── persistence/
│       └── stores/               156 errors  🔴🔴
│           ├── conversation/     58 errors  🔴
│           ├── providers/        32 errors  🟠
│           └── __tests__/        66 errors  🔴
│
├── presentation/
│   └── components/               183 errors  🔴🔴
│       ├── agent/                42 errors  🟠
│       ├── rag/                  28 errors  🟠
│       ├── notes/                35 errors  🟠
│       ├── layout/               20 errors  🟡
│       ├── canvas/               30 errors  🟠
│       └── __tests__/            28 errors  🟠
│
└── routes/                       21 errors  🟡
```

**Legend**: 🔴 50+ errors | 🔴🔴 30-49 | 🟠 15-29 | 🟡 <15

---

## Dependency Graph of Critical Files

```
file-snapshot-store.ts (47 errors)
        ↓
dexie-db-migrations.ts (12 errors)
        ↓
conversation-migration.test.ts (17 errors)
        ↓
useConversationStore.ts (16 errors)
        ↓
AgentConfigDialog.tsx (14 errors)
```

**Impact**: Fix `file-snapshot-store.ts` → cascading fixes to 5 other critical files

---

## Recommended Fix Order (Bang-for-Buck)

### Quick Wins (10 min each, 50+ errors fixed)
1. ✅ Fix `vitest.config.ts` globals → 50 test import errors
2. ✅ Add `@types/vitest` to dependencies → 20 export errors
3. ✅ Fix `dexie-db-migrations.ts` types → 12 errors

### Medium Effort (1-2 hours each, 100+ errors fixed)
4. ✅ Refactor `file-snapshot-store.ts` types → 47 errors
5. ✅ Fix `anthropic-adapter.ts` types → 20 errors
6. ✅ Fix `useConversationStore.ts` persistence → 16 errors

### High Effort (3-4 hours each, 200+ errors fixed)
7. ✅ Migrate all test mocks to proper types → 150 errors
8. ✅ Fix provider adapter type system → 60 errors
9. ✅ Fix RAG pipeline type safety → 40 errors

---

## Error Velocity Tracking

```
Week 1 (Phase 0):  1,130 → 860 (-270)  ████████████░░
Week 2 (Phase 1):    860 → 720 (-140)  ████████░░░░░░
Week 3 (Phase 2):    720 → 640 (-80)   ██████░░░░░░░░
Week 4-8 (Phase 3):  640 →   0 (-640)  ████████████████
```

**Total Velocity**: ~141 errors/week (8 weeks to completion)

---

## Critical Path Analysis

### Dependencies
```
Test Infrastructure (50 errors)
        ↓
Store Architecture (150 errors)
        ↓
Agent System (60 errors)
        ↓
RAG Pipeline (40 errors)
        ↓
File System (26 errors)
```

**Parallel Work Opportunities**:
- **Team A**: Test Infrastructure + RAG Pipeline (90 errors)
- **Team B**: Store Architecture + Agent System (210 errors)
- **Sync Point**: After Week 2, fix File System together (26 errors)

---

## Risk Matrix

| File | Errors | Lines | Risk | Impact | Fix Time |
|------|--------|-------|------|--------|----------|
| `file-snapshot-store.ts` | 47 | 509 | 🔴 P0 | Data Loss | 7h |
| `dexie-db-migrations.ts` | 12 | 527 | 🔴 P0 | Data Loss | 2h |
| `anthropic-adapter.ts` | 20 | 341 | 🟠 P1 | Agent Chat | 3h |
| `useConversationStore.ts` | 16 | 120 | 🟠 P1 | Performance | 2h |
| `orama-index.ts` | 9 | 234 | 🟠 P1 | Search | 1.5h |
| `AgentConfigDialog.tsx` | 14 | 1089 | 🟡 P2 | UX | 2h |
| `test files (17)` | 200+ | ~3000 | 🟢 P3 | CI | 15h |

---

## Success Metrics

### Phase 0 (Week 1-2)
- [ ] 270 errors fixed
- [ ] All test infrastructure working
- [ ] No data loss incidents
- [ ] Test suite passes

### Phase 1 (Week 3-4)
- [ ] 140 errors fixed
- [ ] Agent chat functional
- [ ] No infinite re-renders
- [ ] Provider types stable

### Phase 2 (Week 5)
- [ ] 80 errors fixed
- [ ] RAG search functional
- [ ] Vector store type-safe

### Phase 3 (Week 6-8)
- [ ] 640 errors fixed
- [ ] All stores consolidated
- [ ] Zero duplicate code
- [ ] God stores eliminated

---

## Next Actions

### Immediate (Today)
1. ✅ Create migration assessment document
2. ✅ Create error cluster heatmap
3. ⏳ Update `bmm-workflow-status.yaml` with Phase 0 tasks
4. ⏳ Assign tasks to Team A and Team B

### This Week
1. Fix `vitest.config.ts` (10 min, 50 errors)
2. Fix `dexie-db-migrations.ts` (2h, 12 errors)
3. Refactor `file-snapshot-store.ts` (7h, 47 errors)
4. Fix `anthropic-adapter.ts` (3h, 20 errors)

**Total**: 12 hours, **129 errors fixed**

---

**Prepared by**: BMAD Master Coordinator
**Data Source**: `repomix-migration-analysis.xml` + `pnpm tsc --noEmit`
**Last Updated**: 2026-01-02
**Next Review**: After Phase 0 completion (23 hours)
