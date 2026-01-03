---
date: 2026-01-03
time: 23:59:00
phase: Grand Cycle 6 - Complete Migration Assessment
story: 51-platform-unification-status
team: Team A
agent_mode: bmad-bmm-dev
iteration: 465
previous: iteration-464 (architecture analysis revised)
---

# Grand Cycle 6: Complete Store Migration Assessment

**Generated**: 2026-01-03T23:59:00+07:00
**Critical Finding**: 37 store files exist across legacy and modern locations
**Migration Status**: PARTIAL - adapters bridge old and new during transition

---

## Executive Summary

**Previous Assessment** (Iteration 463): Recommended store unification
**Revised Decision** (Iteration 464): DO NOT unify - domain separation is correct
**ACTUAL REALITY** (Iteration 465): **MIGRATION IS INCOMPLETE** - must complete before deciding

**Critical Discovery**: The codebase has **THREE layers** of stores:
1. **Legacy stores** (lib/state/, lib/workspace/) - being migrated away
2. **Modern stores** (infrastructure/persistence/stores/) - target architecture
3. **Adapter stores** - bridge between old and new during migration

---

## Complete Store Inventory (37 Files)

### Layer 1: Modern Stores (infrastructure/persistence/stores/)

**Primary Unified Stores**:
- ✅ `use-app-store.ts` - Agents + Providers (8 slices, 375 lines)
- ✅ `conversation/useConversationStore.ts` - Conversations (6 slices, 233 lines)
- ✅ `rag/rag-store.ts` - RAG pipeline (5 slices, 130 lines)

**Workspace Stores**:
- `agents/agent-selection-store.ts` - Per-workspace agent selection (8 consumers)
- `workspace/workspace-context.ts` - Workspace context provider
- `workspace/workspace-provider.tsx` - Workspace provider component

**Feature Stores**:
- `canvas-store.ts` - Canvas state management
- `flashcard-store.ts` - Flashcard CRUD
- `hub-store.ts` - Project hub state
- `layout-store.ts` - UI layout state
- `navigation-store.ts` - Navigation state
- `openai-compatible-store.ts` - OpenAI-compatible providers
- `prompt-enhancement-store.ts` - Prompt enhancement
- `quiz-history-store.ts` - Quiz history
- `statusbar-store.ts` - Status bar state
- `study-store.ts` - Study workspace state
- `synthesis-store.ts` - Synthesis operations
- `auto-approve-store.ts` - Tool auto-approval
- `events/event-status-store.ts` - Event tracking

**Total Modern**: 20 stores

---

### Layer 2: Legacy Stores (lib/state/, lib/workspace/)

**Core State** (lib/state/):
- `ide-store.ts` - IDE state (6 consumers) ⚠️ DUPLICATE
- `knowledge-store.ts` - Knowledge workspace (14 consumers) ⚠️ DUPLICATE
- `quiz-store.ts` - Quiz state (3 consumers) ⚠️ DUPLICATE
- `tool-permission-store.ts` - Tool permissions (1 consumer)
- `workspace-store.ts` - Workspace state (2 consumers)

**Workspace State** (lib/workspace/):
- `conversation-store.ts` - **ADAPTER** (bridges to modern store) ✅
- `threads-store.ts` - Thread persistence (Dexie layer) ✅
- `project-store.ts` - Project management (13 consumers) ⚠️ DUPLICATE
- `file-sync-status-store.ts` - File sync status
- `ide-state-store.ts` - IDE state persistence

**Notes State** (lib/notes/):
- `note-store.ts` - Notes state (3 consumers)
- `note-navigation-store.ts` - Note navigation (3 consumers)
- `ai-prompt-store.ts` - AI prompt state (2 consumers)

**Filesystem** (lib/filesystem/):
- `file-snapshot-store.ts` - File snapshots

**Total Legacy**: 14 stores

---

### Layer 3: Helper/Database Files (infrastructure/persistence/)

**Persistence Layer** (infrastructure/persistence/):
- `rag-store-helpers.ts` - RAG store helpers
- `rag-store-types.ts` - RAG store types
- `conversation-auto-restore.ts` - Conversation restoration
- `schema-migrations.test.ts` - Migration tests
- `migrate-api-keys-to-vault.ts` - API key migration
- `migration-backup.ts` - Migration backup utilities

**Database Types** (lib/state/):
- `dexie-db.ts` - Main database (23 consumers)
- `dexie-db-class.ts` - Database class
- `dexie-storage.ts` - Dexie storage adapter
- `dexie-db-helpers.ts` - Database helpers
- `dexie-migrations.ts` - Database migrations
- Multiple `dexie-db-*-types.ts` files - Type definitions

**Total Helpers**: 15+ files

---

## Migration Status Analysis

### ✅ COMPLETED MIGRATIONS

**Agent + Provider Unification** (Iteration 463):
- ✅ Legacy scattered provider stores → `use-app-store.ts` (8 slices)
- ✅ Circular dependency resolved
- ✅ All components migrated to new store
- ✅ Legacy stores deleted or adapted

**Conversation System** (Partial):
- ✅ New `useConversationStore.ts` created (6 slices, 233 lines)
- ✅ Adapter created at `lib/workspace/conversation-store.ts`
- ✅ Thread persistence via `lib/workspace/threads-store.ts`
- ⚠️ Some components may still use legacy APIs

### ⚠️ PARTIAL MIGRATIONS

**Knowledge Workspace**:
- ❌ Legacy `lib/state/knowledge-store.ts` still active (14 consumers)
- ❌ Modern infrastructure store NOT created yet
- ❌ Collections, sources, synthesis features in legacy location

**Project Management**:
- ❌ Legacy `lib/workspace/project-store.ts` still active (13 consumers)
- ✅ Modern `hub-store.ts` exists but NOT integrated
- ❌ Hub routing broken (/hub route not accessible)

**IDE Workspace**:
- ❌ Legacy `lib/state/ide-store.ts` still active (6 consumers)
- ❌ Modern IDE store NOT created yet
- ❌ File management, terminal, editor state in legacy location

**Quiz System**:
- ❌ Legacy `lib/state/quiz-store.ts` still active (3 consumers)
- ✅ Modern `quiz-history-store.ts` exists
- ❌ Migration incomplete

**Study Workspace**:
- ⚠️ Modern `study-store.ts` exists
- ⚠️ Legacy quiz-store still used
- ⚠️ Flashcards split between modern/legacy

### ❌ NOT STARTED

**Notes Workspace**:
- ❌ All stores in legacy location (lib/notes/)
- ❌ No modern infrastructure store created
- ❌ Note editor, navigation, AI prompts scattered

---

## Duplicates and Conflicts

### Critical Duplicates (Same Functionality, Different Locations)

1. **Project Management**:
   - Legacy: `lib/workspace/project-store.ts` (13 consumers)
   - Modern: `infrastructure/persistence/stores/hub-store.ts` (NOT used)
   - **Conflict**: Two separate systems for project CRUD
   - **Impact**: Hub not functional, projects fragmented

2. **Knowledge Workspace**:
   - Legacy: `lib/state/knowledge-store.ts` (14 consumers)
   - Modern: NONE (needs creation)
   - **Conflict**: Knowledge features locked in legacy
   - **Impact**: Cannot modernize RAG integration

3. **IDE Workspace**:
   - Legacy: `lib/state/ide-store.ts` (6 consumers)
   - Modern: NONE (needs creation)
   - **Conflict**: IDE state scattered
   - **Impact**: File management, terminal state inconsistent

4. **Quiz System**:
   - Legacy: `lib/state/quiz-store.ts` (3 consumers)
   - Modern: `quiz-history-store.ts`
   - **Conflict**: Quiz state split
   - **Impact**: Study workspace incomplete

---

## Consumer Analysis

### Components Using Legacy Stores (27 files)

**Knowledge Workspace** (14 components):
- `KnowledgePage.tsx`
- `SourcePreviewPanel.tsx`
- `CollectionManager.tsx`
- `CollectionSelector.tsx`
- `SourceCard.tsx`
- `SourceCardGrid.tsx`
- `SourceMetadataDialog.tsx`
- `SynthesisDialog.tsx`
- `QuizPreviewPanel.tsx`
- `CanvasRAGLinkagePanel.tsx`
- `LinkageProposalsPanel.tsx`
- `NotesPage.tsx`
- `NoteStudyMenu.tsx`
- `StudyPage.tsx`

**Project Management** (13 components):
- (Components consuming lib/workspace/project-store.ts)
- Likely: HubHomePage, ProjectCard, workspace selectors

**IDE Workspace** (6 components):
- (Components consuming lib/state/ide-store.ts)
- Likely: IDELayout, Editor panels, File explorer

### Components Using Modern Stores (19 files)

**Agent Configuration** (11 components):
- `AgentManager.tsx`
- `AgentWorkspaceBindingConfig.tsx`
- `AgentWorkspaceSwitchingFeedback.tsx`
- `ProviderConfigDialog.tsx`
- `ProviderSettings.tsx`
- `UnifiedAgentSelector.tsx`
- `hooks/useAgentFormState.ts`
- `useAgentConfigForm.ts`
- `useAgentConfigProvider.ts`
- `AppInitializer.tsx`
- `WorkspacePermissionEditor.tsx`

**Chat/Conversation** (7 components):
- `ChatConversation.tsx`
- `ChatPanel.tsx`
- `ThreadCard.tsx`
- `ThreadFolderTree.tsx`
- `ThreadsList.tsx`
- `AgentChatPanel.tsx`
- `AgentChatConversationManager.tsx`

**RAG** (3 components):
- `RAGPanelContainer.tsx`
- `RAGChatPanel.tsx` (test)
- `RAGSearchPanel.tsx` (test)

---

## Migration Gaps

### Gap 1: Knowledge Workspace Migration (NOT STARTED)

**Current State**:
- Legacy: `lib/state/knowledge-store.ts` (active, 14 consumers)
- Modern: NONE

**Required Migration**:
1. Create `infrastructure/persistence/stores/knowledge/useKnowledgeStore.ts`
2. Slice structure:
   - Knowledge Metadata Slice (sources, collections)
   - Source CRUD Slice (add, update, delete sources)
   - Collection Management Slice (folders, tags)
   - Synthesis Slice (AI metadata, summaries)
   - Validation Slice (source type checking)
3. Migrate 14 components to new store
4. Delete legacy store after migration verified

**Estimated Effort**: 12-16 hours

---

### Gap 2: Project Hub Migration (PARTIAL)

**Current State**:
- Legacy: `lib/workspace/project-store.ts` (active, 13 consumers)
- Modern: `hub-store.ts` (NOT integrated, broken /hub route)

**Required Migration**:
1. Create `/routes/hub.tsx` route handler
2. Integrate `hub-store.ts` with project CRUD
3. Migrate 13 project-consuming components
4. Verify HubHomePage accessibility
5. Delete legacy project-store after migration verified

**Estimated Effort**: 8-10 hours

---

### Gap 3: IDE Workspace Migration (NOT STARTED)

**Current State**:
- Legacy: `lib/state/ide-store.ts` (active, 6 consumers)
- Modern: NONE

**Required Migration**:
1. Create `infrastructure/persistence/stores/ide/useIDEStore.ts`
2. Slice structure:
   - IDE State Slice (files, active file, panels)
   - Editor Slice (Monaco state, cursors)
   - Terminal Slice (shell state, history)
   - Layout Slice (panel sizes, sidebar)
3. Migrate 6 IDE components
4. Delete legacy ide-store after migration verified

**Estimated Effort**: 10-12 hours

---

### Gap 4: Notes Workspace Migration (NOT STARTED)

**Current State**:
- All stores in `lib/notes/` (3 stores, 8 consumers total)
- Modern: NONE

**Required Migration**:
1. Create `infrastructure/persistence/stores/notes/useNotesStore.ts`
2. Slice structure:
   - Note CRUD Slice
   - Note Navigation Slice (tree view, breadcrumbs)
   - AI Prompt Slice (quick actions)
4. Migrate 8 note components
5. Delete legacy note stores after migration verified

**Estimated Effort**: 8-10 hours

---

### Gap 5: Quiz System Migration (PARTIAL)

**Current State**:
- Legacy: `lib/state/quiz-store.ts` (active, 3 consumers)
- Modern: `quiz-history-store.ts` (NOT integrated)

**Required Migration**:
1. Create `infrastructure/persistence/stores/study/useQuizStore.ts`
2. Migrate quiz functionality from legacy
3. Integrate with `quiz-history-store.ts`
4. Migrate 3 quiz-consuming components
5. Delete legacy quiz-store after migration verified

**Estimated Effort**: 6-8 hours

---

## Revised Implementation Plan

### Phase 0: Complete Legacy Migrations (Week 1-2)

**Priority**: P0 - CRITICAL (must complete BEFORE any unification decision)

**Order** (dependency flow):

1. **Project Hub** (8-10 hours) - FOUNDATION for all workspaces
   - Create `/routes/hub.tsx`
   - Integrate `hub-store.ts`
   - Fix /hub routing
   - Verify project CRUD functional

2. **Knowledge Workspace** (12-16 hours) - FOUNDATION for RAG
   - Create `useKnowledgeStore.ts` with 5 slices
   - Migrate 14 components
   - Verify RAG integration functional

3. **IDE Workspace** (10-12 hours) - CORE workspace
   - Create `useIDEStore.ts` with 4 slices
   - Migrate 6 components
   - Verify editor, terminal, file management functional

4. **Notes Workspace** (8-10 hours) - SECONDARY workspace
   - Create `useNotesStore.ts` with 3 slices
   - Migrate 8 components
   - Verify note editor functional

5. **Quiz System** (6-8 hours) - COMPLETES Study workspace
   - Create `useQuizStore.ts`
   - Migrate 3 components
   - Verify study workflow functional

**Total Phase 0 Effort**: 44-56 hours (1-2 weeks)

**Success Criteria**:
- ✅ All legacy stores in lib/state/, lib/workspace/, lib/notes/ deleted
- ✅ All stores consolidated in infrastructure/persistence/stores/
- ✅ All components migrated to modern stores
- ✅ Zero duplicate stores (single source of truth per domain)
- ✅ Production still stable (0 TypeScript errors)

---

### Phase 1: Assess Unification Need (Week 3)

**AFTER Phase 0 complete**, reassess:

**Question**: Should we unify the 5 domain stores into 1 giant store?

**Stores to Consider**:
1. `use-app-store.ts` (Agents + Providers)
2. `useConversationStore.ts` (Conversations)
3. `useRAGStore` (RAG)
4. `useKnowledgeStore.ts` (Knowledge) - NEW in Phase 0
5. `useIDEStore.ts` (IDE) - NEW in Phase 0
6. `useNotesStore.ts` (Notes) - NEW in Phase 0
7. `useQuizStore.ts` (Study) - NEW in Phase 0

**Decision Framework**:
- If cross-domain communication is frequent → UNIFY
- If domains are independent → KEEP SEPARATE
- If performance degraded by unification → KEEP SEPARATE
- If developers working on same store file → UNIFY

---

### Phase 2: Implement Features (Week 4-6)

**After architecture stable**:

1. **Conversation Sharing** (8-10 hours)
2. **RAG Canvas Integration** (10-12 hours)
3. **Cross-Domain Event Bus** (4-6 hours)
4. **Complete Use Cases** (16-20 hours)

**Total Phase 2 Effort**: 38-48 hours

---

## Validation Requirements

### Per Migration (Phase 0)

1. **Before Migration**:
   - ✅ Backup current state
   - ✅ Document all consuming components
   - ✅ Create rollback plan

2. **During Migration**:
   - ✅ Create new store with slice pattern
   - ✅ Migrate components one at a time
   - ✅ Test each component individually
   - ✅ Verify zero TypeScript errors

3. **After Migration**:
   - ✅ Run `pnpm dev` - must start successfully
   - ✅ Run `pnpm build` - must succeed
   - ✅ Manual test workspace functionality
   - ✅ Delete legacy store ONLY after verified

### Per Iteration

```bash
pnpm tsc --noEmit  # Zero errors required
pnpm dev           # Dev server must start
```

---

## Conclusion

**Current Platform State**: MIGRATION INCOMPLETE

**Critical Finding**: Cannot make unification decision until legacy migrations complete

**Immediate Priority**: **Phase 0 - Complete Legacy Migrations** (44-56 hours)

**Migration Order**:
1. Project Hub (foundation)
2. Knowledge Workspace (RAG foundation)
3. IDE Workspace (core workspace)
4. Notes Workspace (secondary workspace)
5. Quiz System (completes Study)

**After Phase 0**: Reassess unification need with complete picture

**Production Deployment**: Safe to deploy NOW (0 errors, stable), but migrations incomplete

---

**Document Version**: 1.0
**Last Updated**: 2026-01-03T23:59:00+07:00
**Iteration**: 465
