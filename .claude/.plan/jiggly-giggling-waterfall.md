# Master Implementation Plan: Foundation Stabilization (Epic 54)

**Date:** 2026-01-04 (Updated with ACTUAL scan data)
**TypeScript:** ✅ 0 errors in code files
**Health Target:** 85/100 (current: 72/100)

---

## CRITICAL FINDING: What ACTUALLY Needs Fixing

My previous analysis used STALE data. Fresh scan reveals:

### ✅ ALREADY FIXED (Don't Touch These!)

The original ARCH-01.1 targets were SUCCESSFULLY split:

| File | Was | Now | Status |
|------|-----|-----|--------|
| `idb-adapter-core.ts` | 660 | **281** | ✅ DONE |
| `fsa-adapter-core.ts` | 497 | **291** | ✅ DONE |
| `bidirectional-sync-core.ts` | 470 | **218** | ✅ DONE |
| `sync-engine-core.ts` | 371 | **207** | ✅ DONE |

### 🚨 NEW GOD FILES (Created During Migration)

The workspace-services/ folder accumulated logic during migration:

| File | Lines | Exceeds 300 by | Priority |
|------|-------|-----------------|----------|
| `notes-file-sync-service.ts` | **659** | +359 (2.2x) | P0 |
| `cross-workspace-file-references.ts` | **359** | +59 (1.2x) | P1 |
| `study-file-sync-service.ts` | **330** | +30 (1.1x) | P1 |
| `knowledge-file-sync-service.ts` | **300** | Exactly limit | P1 |

### 🚨 GOD STORES (Actual Current State)

| File | Lines | Exceeds 300 by | Consumers |
|------|-------|-----------------|-----------|
| `quiz-store.ts` | **658** | +358 (2.2x) | StudyPage, NoteStudyMenu |
| `canvas-store.ts` | **623** | +323 (2.1x) | Canvas, linkage components |
| `flashcard-store.ts` | **531** | +231 (1.8x) | Study components |
| `tool-permission-store.ts` | **493** | +193 (1.6x) | Agent config, 12+ consumers |
| `study-store.ts` | **458** | +158 (1.5x) | Study workspace |
| `use-app-store.ts` | **367** | +67 (1.2x) | Global, 20+ consumers |
| `session-snapshot-manager.ts` | **321** | +21 (1.1x) | IDE components |
| `useConversationStore.ts` | **303** | +3 (1.0x) | Chat, 20+ consumers |

### 📁 Legacy Status (Good News)

- `src/lib/filesync/` = Mostly 1-line re-exports ✅ (facades working)
- `src/lib/state/` = Test files + deprecated facades
- No circular dependencies ✅

---

## Phase 1: Workspace Services Cleanup (4 files)

**Root Cause:** During filesync → infrastructure/sync migration, services accumulated logic.

### Story 1.1: notes-file-sync-service.ts (659 → 4×165)

**Current Responsibilities (659 lines):**
- Note CRUD operations with IndexedDB
- File watching for changes
- Bidirectional sync (MD ↔ IndexedDB)
- Markdown parsing + frontmatter
- Cross-workspace references

**Split Strategy:**
```
src/infrastructure/sync/workspace-services/notes/
├── notes-file-sync-service.ts (165) - Core orchestration
├── note-crud-operations.ts (150) - CRUD + persistence
├── note-markdown-parser.ts (120) - MD + frontmatter
├── note-sync-orchestrator.ts (150) - Bidirectional sync
└── note-file-watcher.ts (100) - File watching
```

**Risk:** HIGH - Notes workspace core functionality

### Story 1.2: cross-workspace-file-references.ts (359 → 2×180)

**Split Strategy:**
```
src/infrastructure/sync/workspace-services/
├── cross-workspace-file-references.ts (180) - Core API
└── reference-resolver.ts (170) - Resolution logic
```

**Risk:** MEDIUM - Affects all workspace linking

### Story 1.3: study-file-sync-service.ts (330 → 2×165)

**Split Strategy:**
```
src/infrastructure/sync/workspace-services/study/
├── study-file-sync-service.ts (165) - Core service
└── study-file-importer.ts (150) - Import logic
```

**Risk:** LOW - Read-only access, simpler logic

### Story 1.4: knowledge-file-sync-service.ts (300 → 2×150)

**Split Strategy:**
```
src/infrastructure/sync/workspace-services/knowledge/
├── knowledge-file-sync-service.ts (150) - Core service
└── knowledge-source-importer.ts (130) - Source import
```

**Risk:** LOW - At 300 lines, borderline case

---

## Phase 2: God Store Refactoring (8 stores)

**Execution Order:** By Consumer Count (most consumers first = highest impact)

### Story 2.1: quiz-store.ts (658 → 3×120) - HIGH PRIORITY

**Consumers:** StudyPage, NoteStudyMenu, QuizPreviewPanel, flashcard components

**Split Strategy:**
```
src/infrastructure/persistence/stores/study/
├── quiz-store.ts (120) - Barrel export + main store
├── slices/
│   ├── quiz-crud-slice.ts (120) - createQuiz, updateQuiz, deleteQuiz
│   ├── quiz-questions-slice.ts (120) - addQuestion, updateQuestion
│   └── quiz-settings-slice.ts (120) - updateSettings, getSettings
```

**Risk:** HIGH - Complex relationships between quizzes and questions

### Story 2.2: canvas-store.ts (623 → 3×120) - HIGH PRIORITY

**Consumers:** Canvas, LinkageAnalyzer, 8+ components

**Split Strategy:**
```
src/infrastructure/persistence/stores/
├── canvas-store.ts (120) - Main store
├── slices/
│   ├── canvas-nodes-slice.ts (120) - Node CRUD, selection
│   ├── canvas-edges-slice.ts (120) - Edge CRUD, connections
│   └── canvas-viewport-slice.ts (120) - Zoom, pan, viewport
```

**Risk:** HIGH - @xyflow/react integration is complex

### Story 2.3: tool-permission-store.ts (493 → 2×150) - HIGH PRIORITY

**Consumers:** AgentConfigDialog, 12+ agent-related components

**Split Strategy:**
```
src/infrastructure/persistence/stores/permissions/
├── tool-permission-store.ts (150) - Main store
├── slices/
│   ├── permission-crud-slice.ts (120) - setTrustLevel, updatePermissions
│   └── permission-session-slice.ts (120) - Session trust, ephemeral
```

**Risk:** MEDIUM - Well-defined boundaries

### Story 2.4: flashcard-store.ts (531 → 2×150) - MEDIUM PRIORITY

**Split Strategy:**
```
src/infrastructure/persistence/stores/
├── flashcard-store.ts (150) - Main store
├── slices/
│   ├── flashcard-crud-slice.ts (120) - CRUD operations
│   └── flashcard-progress-slice.ts (120) - SRS progress, scheduling
```

**Risk:** MEDIUM - SRS algorithm complexity

### Story 2.5: study-store.ts (458 → 2×150) - MEDIUM PRIORITY

**Split Strategy:**
```
src/infrastructure/persistence/stores/
├── study-store.ts (150) - Main store
├── slices/
│   ├── study-session-slice.ts (120) - Active session, current card
│   └── study-progress-slice.ts (120) - Overall progress, stats
```

**Risk:** MEDIUM - Session management is complex

### Story 2.6: use-app-store.ts (367 → cleanup) - LOW PRIORITY

**Current State:** Already uses slice pattern, just needs minor cleanup

**Action:** Extract common patterns, reduce to ≤300 lines

**Risk:** LOW - Well-structured already

### Story 2.7: session-snapshot-manager.ts (321 → 2×120) - LOW PRIORITY

**Split Strategy:**
```
src/infrastructure/persistence/stores/
├── session-snapshot-manager.ts (120) - Main manager
└── slices/
    ├── snapshot-crud-slice.ts (120) - Create, restore, delete
    └── snapshot-cache-slice.ts (100) - Cache management
```

**Risk:** LOW - Straightforward split

### Story 2.8: useConversationStore.ts (303 → minor cleanup) - LOW PRIORITY

**Current State:** Has slice structure in conversation/slices/, just needs consolidation

**Action:** Consolidate slices, reduce to ≤300 lines

**Risk:** LOW - Already organized

---

## Phase 3: Workspace E2E Implementation

### Current Workspace State (Actual)

| Workspace | File System | Sync Status | Issues |
|-----------|-------------|--------------|--------|
| **IDE** | FSA ✅ | WebContainer ✅ | Harden permissions |
| **Notes** | IndexedDB + Manual FSA | Partial | No auto-mount, no sync UI |
| **Knowledge** | IndexedDB (in-memory sources) | None | No FSA export, no auto-index |

### Story 3.1: Notes Workspace Auto-Mount (4h)

**Problem:** User must manually pick Notes directory every session

**Solution:**
```typescript
// On first Notes workspace visit:
1. Check IndexedDB for saved directory handle
2. If not found, prompt user to select Notes directory
3. Save handle to IndexedDB (workspace-binding table)
4. On subsequent visits, auto-mount from saved handle
5. Show "Change directory" button in settings
```

**Files to modify:**
- `src/presentation/components/notes/NotesPage.tsx`
- `src/infrastructure/sync/workspace-services/notes-file-sync-service.ts`

### Story 3.2: Notes Sync Status UI (2h)

**Problem:** User can't see sync state

**Solution:**
```typescript
// Add to Notes sidebar:
<SyncStatusPanel
  workspace="notes"
  lastSync={lastSyncTime}
  pendingChanges={pendingChanges.length}
  onSyncNow={handleSyncNow}
/>
```

### Story 3.3: Knowledge Persistent Sources (3h)

**Problem:** Sources stored in memory, lost on refresh

**Solution:**
```typescript
// Add to Dexie schema:
db.version(1).stores({
  knowledgeSources: '++id, url, createdAt',
});

// Replace in-memory store with IndexedDB
export const knowledgeSourceStore = {
  add: async (source) => await db.knowledgeSources.add(source),
  getAll: async () => await db.knowledgeSources.toArray(),
  // ...
}
```

### Story 3.4: Knowledge FSA Export (2h)

**Problem:** Can't export knowledge back to local files

**Solution:**
```typescript
export const exportKnowledgeSource = async (sourceId: string) => {
  const source = await getSource(sourceId);
  const handle = await getSavedDirectoryHandle(); // Re-use from Notes
  const file = await handle.getFileHandle(source.filename, { create: true });
  const writable = await file.createWritable();
  await writable.write(source.content);
  await writable.close();
}
```

---

## Execution Strategy (Minimize Back-And-Forth)

### Week 1: Workspace Services Only

```
Day 1: notes-file-sync-service.ts split
  → Create 4 modules
  → Test locally
  → Verify no breaking changes

Day 2: cross-workspace-file-references.ts split
  → Create 2 modules
  → Test cross-workspace links

Day 3: study and knowledge services split
  → Split both (simpler files)
  → Test all workspace services
```

### Week 2: God Stores (By Consumer Count)

```
Day 1-2: HIGH consumer count (quiz, canvas, permissions)
  → Split stores
  → Create facades in old locations
  → Run full test suite

Day 3-4: MEDIUM consumer count (flashcard, study)
  → Split stores
  → Create facades
  → Update consumers

Day 5: LOW consumer count (app-store, snapshot, conversation)
  → Minor cleanup
  → No facade needed (already sliced)
```

### Week 3: Workspace E2E

```
Day 1-2: Notes Workspace
  → Auto-mount implementation
  → Sync status UI
  → Test full flow

Day 3-4: Knowledge Workspace
  → Persistent sources
  → FSA export
  → Test full flow
```

---

## Validation Gates (After Each Story)

```bash
# Pre-commit validation
pnpm typecheck              # TypeScript (code only)
pnpm build                  # Build must pass

# File size check
find src/infrastructure -name "*.ts" -exec wc -l {} \; | awk '$1 > 300'

# Verify no breaking changes
grep -r "from '@/lib/filesync" src/  # Should be 0 (or only facades)

# Test the specific area changed
pnpm test -- workspace-services
# or
pnpm test -- quiz-store
```

---

## Risk Assessment

### HIGH RISK (Test Thoroughly)

1. **notes-file-sync-service.ts split** - Core Notes functionality
2. **quiz-store.ts split** - Study quiz data integrity
3. **canvas-store.ts split** - @xyflow integration

### MEDIUM RISK (Standard Testing)

1. **tool-permission-store.ts split** - Agent permissions
2. **flashcard-store.ts split** - SRS data
3. **study-store.ts split** - Study sessions

### LOW RISK (Straightforward)

1. **Other workspace services** - Simpler logic
2. **use-app-store.ts cleanup** - Already well-structured
3. **Conversation store** - Has slices already

---

## Success Criteria

**Epic 54 COMPLETE when:**

1. ✅ Zero files >300 lines in workspace-services/
2. ✅ Zero stores >300 lines in infrastructure/persistence/stores/
3. ✅ TypeScript zero errors (code files)
4. ✅ All tests passing
5. ✅ Notes workspace auto-mounts directory
6. ✅ Knowledge workspace persists sources
7. ✅ Health Score ≥85/100

---

## Immediate Next Action

**Story 1.1:** Split notes-file-sync-service.ts (659 lines)

**Command:** Use `normalize-components` workflow
**Agent:** @component-splitter
**Estimated:** 3-4 hours
**Deliverables:**
- 4 new modules ≤165 lines each
- Barrel export (notes/index.ts)
- All tests passing
- No breaking changes

**After Story 1.1 Complete:**
- Update sprint-status.yaml
- Run validation gates
- Move to Story 1.2
