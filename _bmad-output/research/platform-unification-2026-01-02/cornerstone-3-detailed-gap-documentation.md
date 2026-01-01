# Cornerstone 3: Detailed Gap Documentation & Migration Plan

**Date**: 2026-01-02
**Iteration**: 11 (Phase 1: Detailed Gap Documentation)
**Cornerstone**: 3 - Chat Flow & Thread Management
**Health Score**: 3/10 ❌ (Critical)
**Priority**: HIGHEST

---

## Executive Summary

**Current State**: Two separate stores causing fragmentation
- `conversation-store.ts` (626 lines) - Conversation metadata
- `conversation-threads-store.ts` (726 lines) - Thread messages
- Total: 1,352 lines of god store code

**Target State**: Unified conversation store with slice pattern
- Single bounded store with 5 focused slices (~630 total lines)
- 53% code reduction
- Clear separation of concerns
- Health Score: 9/10 (target)

**Migration Effort**: 70-90 hours

---

## Part 1: Current State Mapping

### 1.1 Store Files

#### Store 1: Conversation Metadata Store

**Location**: `src/lib/state/conversation-store.ts`

**Line Count**: 626 lines (2.1x over 300-line limit) ❌

**Schema**:
```typescript
interface ConversationStoreState {
  activeConversationId: string | null;
  conversations: Record<string, ConversationState>;
  scrollPositions: Record<string, number>;
  pendingToolApprovals: PendingToolApproval[];
  _hasHydrated: boolean;

  // Actions (20+ methods)
  setHasHydrated()
  createConversation(projectId?, agentId?)
  setActiveConversation(id)
  addMessage(conversationId, message)
  updateMessage(conversationId, messageId, updates)
  deleteMessage(conversationId, messageId)
  setScrollPosition(conversationId, position)
  getScrollPosition(conversationId)
  approveToolApproval(conversationId, messageId)
  denyToolApproval(conversationId, messageId)
  clearPendingApprovals(conversationId)
  // ... 10+ more methods
}
```

**Responsibilities**:
- Active conversation tracking
- Message CRUD operations
- Scroll position restoration
- Pending tool approval tracking
- Conversation metadata management

---

#### Store 2: Thread Messages Store

**Location**: `src/infrastructure/persistence/stores/conversation/conversation-threads-store.ts`

**Line Count**: 726 lines (2.4x over 300-line limit) ❌

**Schema**:
```typescript
interface ThreadsStoreState {
  threads: Record<string, ConversationThread>;
  rootThreads: string[];
  threadHierarchy: ThreadHierarchyNode[];
  activeThreadId: string | null;
  contextWindow: ContextWindowConfig;

  // Actions (30+ methods)
  createThread(projectId, title, parentId?)
  deleteThread(threadId)
  getThread(threadId)
  getThreadMessages(threadId)
  addMessageToThread(threadId, message)
  updateMessageInThread(threadId, messageId, updates)
  deleteMessageFromThread(threadId, messageId)
  buildThreadHierarchy(conversationId)
  getContextWindowStats(threadId)
  setActiveThread(threadId)
  compressContext(threadId)
  truncateContext(threadId)
  summarizeContext(threadId)
  // ... 20+ more methods
}
```

**Responsibilities**:
- Thread lifecycle management
- Message storage within threads
- Thread hierarchy (parent-child relationships)
- Context window management
- Agent attribution per message

---

### 1.2 Component Usage Mapping

#### Components Using Both Stores (20+ files)

**IDE Workspace** (10 components):
```
src/presentation/components/ide/
├── AgentChatPanel.tsx                    ← Uses BOTH stores
├── AgentChatPanel/
│   ├── AgentChatConversationManager.tsx   ← Uses BOTH stores
│   ├── AgentChatHeader.tsx               ← Uses conversation-store
│   ├── AgentChatStatus.tsx               ← Uses conversation-store
│   └── AgentChatApprovals.tsx            ← Uses conversation-store
├── EnhancedChatInterface.tsx             ← Uses BOTH stores
└── hooks/
    ├── useAgentChatMessages.ts           ← Uses BOTH stores
    └── useAgentChatApproval.ts           ← Uses conversation-store
```

**Knowledge Workspace** (2 components):
```
src/presentation/components/knowledge/
└── (Future: will use unified store)
```

**Chat Components** (3 components):
```
src/presentation/components/chat/
├── ChatPanel.tsx                          ← Uses conversation-store
├── ChatConversation.tsx                   ← Uses BOTH stores
└── UnifiedChatPanel.tsx                   ← Uses BOTH stores
```

**RAG Components** (2 components):
```
src/presentation/components/rag/
└── RAGChatPanel.tsx                       ← Uses BOTH stores
```

**Other** (3+ components):
- `ConversationCard.tsx` (agent workspace)
- `ChatPanelWrapper.tsx` (layout)
- Plus more...

---

### 1.3 Current Data Flow

```
User sends message in AgentChatPanel
  ↓
Component calls BOTH stores:
  - conversationStore.addMessage()         ← Store 1
  - threadsStore.addMessageToThread()     ← Store 2
  ↓
Potential issues:
  - Race conditions (which store updates first?)
  - Data inconsistency (messages out of sync)
  - Complex coordination required
  - Unclear which store to query for what
```

---

### 1.4 Duplicate/Similar Functionality

**Message CRUD** (duplicated):
```typescript
// Store 1: conversation-store.ts
addMessage(conversationId, message)
updateMessage(conversationId, messageId, updates)
deleteMessage(conversationId, messageId)

// Store 2: conversation-threads-store.ts
addMessageToThread(threadId, message)
updateMessageInThread(threadId, messageId, updates)
deleteMessageFromThread(threadId, messageId)
```

**Problem**: Same operations, different stores, unclear which to use

---

## Part 2: Target Architecture

### 2.1 Unified Store Structure

**Location**: `src/infrastructure/persistence/stores/conversations/`

**File Structure**:
```
src/infrastructure/persistence/stores/conversations/
├── conversation-store.ts (150 lines) - Main store
└── slices/
    ├── conversation-crud-slice.ts (~150 lines)
    ├── thread-management-slice.ts (~140 lines)
    ├── message-slice.ts (~130 lines)
    ├── context-window-slice.ts (~120 lines)
    └── conversation-utils-slice.ts (~90 lines)
```

**Total Lines**: ~630 lines across 6 files (vs. 1,352 in 2 files)

---

### 2.2 Slice Responsibilities

#### Slice 1: Conversation CRUD (~150 lines)

**Responsibility**: Conversation lifecycle

```typescript
interface ConversationCrudState {
  conversations: Record<string, Conversation>;

  createConversation(workspaceType, agentId, projectId?)
  deleteConversation(id)
  updateConversation(id, updates)
  archiveConversation(id)

  getConversation(id)
  getConversationsByWorkspace(workspaceType)
  getConversationsByProject(projectId)
  getActiveConversation(workspaceType)

  setConversationFolder(id, folderId)
  addConversationTag(id, tag)
}
```

---

#### Slice 2: Thread Management (~140 lines)

**Responsibility**: Thread hierarchy

```typescript
interface ThreadManagementState {
  threads: Record<string, Thread>;

  createThread(conversationId, parentId?)
  deleteThread(id)
  archiveThread(id)

  buildThreadHierarchy(conversationId)
  getThreadTree(conversationId)
  getRootThreads(conversationId)

  setActiveThread(id)
  getActiveThread()

  forkThread(threadId, messageId)
  mergeThread(sourceId, targetId)
}
```

---

#### Slice 3: Message Management (~130 lines)

**Responsibility**: Message CRUD

```typescript
interface MessageState {
  messagesByThread: Record<string, Message[]>;

  addMessage(threadId, message)
  updateMessage(messageId, updates)
  deleteMessage(messageId)

  getMessages(threadId)
  getMessage(messageId)

  appendToMessage(messageId, content) // Streaming
  setMessageStreaming(messageId, streaming)

  deleteMessages(messageIds[])
  moveMessages(messageIds[], targetThreadId)
}
```

---

#### Slice 4: Context Window (~120 lines)

**Responsibility**: Token management

```typescript
interface ContextWindowState {
  contextWindows: Record<string, ContextWindowConfig>;

  getContextWindow(threadId)
  setContextWindow(threadId, config)

  countTokens(threadId)
  countMessageTokens(message)

  trimContext(threadId, maxTokens)
  getContextSummary(threadId)

  getModelTokenLimit(modelId)
  estimateCost(threadId)
}
```

---

#### Slice 5: Conversation Utils (~90 lines)

**Responsibility**: Helpers

```typescript
interface ConversationUtilsState {
  searchConversations(query)
  filterByTag(tag)
  filterByDateRange(start, end)

  getConversationStats(id)
  getWorkspaceStats(workspaceType)

  exportConversation(id, format)
  importConversation(data, format)

  deleteOldConversations(olderThan)
  clearArchivedConversations()
}
```

---

## Part 3: Migration Plan

### Phase 1: Create New Store (Non-Breaking) ✅

**Duration**: 20-25 hours

**Steps**:

1. **Create directory structure** (5 minutes):
   ```bash
   mkdir -p src/infrastructure/persistence/stores/conversations/slices
   ```

2. **Implement Slice 1: Conversation CRUD** (4 hours):
   - Create `conversation-crud-slice.ts`
   - Implement all CRUD operations
   - Add TypeScript types
   - Write unit tests

3. **Implement Slice 2: Thread Management** (4 hours):
   - Create `thread-management-slice.ts`
   - Implement thread hierarchy
   - Add forking/merging logic
   - Write unit tests

4. **Implement Slice 3: Message Management** (3 hours):
   - Create `message-slice.ts`
   - Implement message CRUD
   - Add streaming support
   - Write unit tests

5. **Implement Slice 4: Context Window** (3 hours):
   - Create `context-window-slice.ts`
   - Implement token counting
   - Add context trimming logic
   - Write unit tests

6. **Implement Slice 5: Utils** (2 hours):
   - Create `conversation-utils-slice.ts`
   - Implement helper functions
   - Write unit tests

7. **Create Main Store** (3 hours):
   - Create `conversation-store.ts`
   - Compose all slices
   - Add Dexie persistence
   - Add hydration handler

8. **Integration Testing** (3 hours):
   - Test store creation
   - Test persistence
   - Test hydration
   - Test slice composition

**Deliverables**:
- ✅ 6 new files (1 store + 5 slices)
- ✅ Comprehensive tests (80%+ coverage)
- ✅ No breaking changes (old stores still exist)

---

### Phase 2: Component Migration (Low Risk First)

**Duration**: 30-35 hours

**Migration Order** (safest first):

#### Batch 1: Study Workspace Components (4 hours)
**Risk**: LOW (Minimal usage, easy to test)

Components:
1. StudyPage.tsx
2. QuizContainer.tsx
3. FlashcardView.tsx

**Steps**:
1. Update imports:
   ```typescript
   // Before
   import { useConversationStore } from '@/lib/state/conversation-store';
   import { useThreadsStore } from '@/infrastructure/persistence/stores/conversation/conversation-threads-store';

   // After
   import { useConversationStore } from '@/infrastructure/persistence/stores/conversations/conversation-store';
   ```

2. Update selectors:
   ```typescript
   // Before (two stores)
   const conversations = useConversationStore(s => s.conversations)
   const threads = useThreadsStore(s => s.threads)

   // After (unified)
   const conversations = useConversationStore(s => s.conversations)
   const threads = useConversationStore(s => s.threads)
   ```

3. Test in Study workspace
4. Verify conversations work
5. Commit changes

---

#### Batch 2: Notes Workspace Components (6 hours)

**Risk**: LOW-MEDIUM (Moderate usage)

Components:
1. NotesPage.tsx
2. NoteEditor.tsx
3. NoteList.tsx
4. AIMenu.tsx

**Steps**: Same as Batch 1

---

#### Batch 3: Knowledge Workspace Components (8 hours)

**Risk**: MEDIUM (High usage, RAG integration)

Components:
1. KnowledgePage.tsx
2. SourcePanel.tsx
3. Canvas.tsx (canvas linkage)
4. RAGChatPanel.tsx

**Steps**:
1. Update imports and selectors
2. Test RAG functionality
3. Verify canvas integration
4. Test citation linking
5. Commit changes

---

#### Batch 4: Chat Components (6 hours)

**Risk**: MEDIUM (Used across workspaces)

Components:
1. ChatPanel.tsx
2. ChatConversation.tsx
3. UnifiedChatPanel.tsx
4. ChatPanelWrapper.tsx

**Steps**:
1. Update imports and selectors
2. Test in all 4 workspaces
3. Verify chat persistence
4. Commit changes

---

#### Batch 5: IDE Workspace Components (11 hours)

**Risk**: HIGHEST (Core functionality, complex)

Components:
1. AgentChatPanel.tsx
2. AgentChatConversationManager.tsx
3. AgentChatHeader.tsx
4. AgentChatStatus.tsx
5. AgentChatApprovals.tsx
6. EnhancedChatInterface.tsx
7. Hooks (3 files)

**Steps**:
1. Update imports and selectors
2. Test tool execution flow
3. Test streaming responses
4. Test agent switching
5. Test approval workflow
6. Comprehensive testing
7. Commit changes

---

### Phase 3: Data Migration

**Duration**: 8-10 hours

**Steps**:

1. **Create Migration Script** (4 hours):
   ```typescript
   // scripts/migrate-conversations.ts
   import { migrateConversations } from '@/lib/migrations/conversation-migration';

   export async function runMigration() {
     console.log('[Migration] Starting conversation migration...');

     // Read from old stores
     const oldConversations = await dbOld.conversations.toArray();
     const oldThreads = await dbOld.threads.toArray();

     // Transform to new schema
     const result = await migrateConversations({
       conversations: oldConversations,
       threads: oldThreads,
     });

     console.log(`[Migration] Migrated ${result.conversations} conversations`);
     console.log(`[Migration] Migrated ${result.threads} threads`);
     console.log(`[Migration] Migrated ${result.messages} messages`);
   }
   ```

2. **Add Migration Types** (2 hours):
   ```typescript
   // src/lib/migrations/conversation-types.ts
   export interface MigrationSource {
     conversations: OldConversation[];
     threads: OldThread[];
   }

   export interface MigrationResult {
     conversations: number;
     threads: number;
     messages: number;
     errors: string[];
   }
   ```

3. **Transform Logic** (2 hours):
   - Map OldConversation → New Conversation
   - Map OldThread → New Thread
   - Merge messages from both stores
   - Preserve timestamps
   - Preserve relationships

4. **Run Migration** (1 hour):
   - Add migration trigger to app startup
   - Run migration once
   - Verify data integrity
   - Log results

5. **Verification** (1 hour):
   - Compare record counts
   - Spot-check data
   - Test functionality
   - Rollback if needed

---

### Phase 4: Cleanup

**Duration**: 12-15 hours

**Steps**:

1. **Run Full Test Suite** (2 hours):
   ```bash
   pnpm test
   ```

2. **Verify `pnpm dev` Works** (1 hour):
   ```bash
   pnpm dev
   # Test all 4 workspaces
   # Test chat functionality
   # Verify no errors
   ```

3. **Verify Build Succeeds** (1 hour):
   ```bash
   pnpm build
   ```

4. **Check for Circular Imports** (30 minutes):
   ```bash
   pnpm madge --circular src/
   ```

5. **TypeScript Validation** (30 minutes):
   ```bash
   pnpm tsc --noEmit
   ```

6. **Update JSDoc Comments** (2 hours):
   - Add documentation to new store
   - Update component comments

7. **Delete Old Stores** (1 hour):
   ```bash
   # Only after verification complete
   rm src/lib/state/conversation-store.ts
   rm src/infrastructure/persistence/stores/conversation/conversation-threads-store.ts
   ```

8. **Final Testing** (4 hours):
   - End-to-end testing
   - Cross-workspace testing
   - Load testing
   - Fix any issues

**Deliverables**:
- ✅ Old stores deleted
- ✅ All tests passing
- ✅ Zero TypeScript errors
- ✅ Build succeeds
- ✅ All workspaces functional

---

## Part 4: Breaking Changes

### 4.1 Store Import Paths

**Breaking Change**: Component imports must be updated

**Before**:
```typescript
import { useConversationStore } from '@/lib/state/conversation-store';
import { useThreadsStore } from '@/infrastructure/persistence/stores/conversation/conversation-threads-store';
```

**After**:
```typescript
import { useConversationStore } from '@/infrastructure/persistence/stores/conversations/conversation-store';
```

**Impact**: 20+ components need updating

---

### 4.2 Selector Patterns

**Breaking Change**: Some selectors renamed

**Before** (two stores):
```typescript
const conversations = useConversationStore(s => s.conversations)
const threads = useThreadsStore(s => s.threads)
```

**After** (unified):
```typescript
const conversations = useConversationStore(s => s.conversations)
const threads = useConversationStore(s => s.threads)
// Same property names, different store
```

**Impact**: Minimal (same property names)

---

### 4.3 Method Signatures

**Breaking Change**: Some methods consolidated

**Before**:
```typescript
conversationStore.addMessage(conversationId, message)
threadsStore.addMessageToThread(threadId, message)
```

**After**:
```typescript
conversationStore.addMessage(threadId, message) // Unified method
```

**Impact**: Components calling these methods must update

---

## Part 5: Test Requirements

### 5.1 Unit Tests (Per Slice)

**Slice 1: Conversation CRUD** (15 tests):
- ✅ createConversation() creates new conversation
- ✅ deleteConversation() removes conversation
- ✅ updateConversation() modifies conversation
- ✅ archiveConversation() sets status
- ✅ getConversationsByWorkspace() filters correctly
- ✅ getConversationsByProject() filters correctly
- ✅ getActiveConversation() returns active conversation
- ✅ setConversationFolder() updates folder
- ✅ addConversationTag() adds tag
- ✅ Folder organization works
- ✅ Tag filtering works
- ✅ Active conversation tracking works
- ✅ Conversation persistence works
- ✅ Conversation hydration works

**Slice 2: Thread Management** (15 tests):
- ✅ createThread() creates new thread
- ✅ deleteThread() removes thread
- ✅ buildThreadHierarchy() builds correct tree
- ✅ getThreadTree() returns tree structure
- ✅ getRootThreads() returns root-level threads
- ✅ setActiveThread() sets active thread
- ✅ forkThread() creates branch from message
- ✅ mergeThread() combines branches
- ✅ Thread hierarchy preserves parent-child
- ✅ Thread status tracking works
- ✅ Thread persistence works
- ✅ Thread hydration works

**Slice 3: Message Management** (12 tests):
- ✅ addMessage() adds message to thread
- ✅ updateMessage() modifies message
- ✅ deleteMessage() removes message
- ✅ appendToMessage() streams content
- ✅ setMessageStreaming() controls streaming
- ✅ getMessages() returns all messages
- ✅ getMessage() returns specific message
- ✅ deleteMessages() removes multiple
- ✅ moveMessages() moves between threads
- ✅ Message ordering preserved
- ✅ Multimodal content supported
- ✅ Message persistence works

**Slice 4: Context Window** (10 tests):
- ✅ getContextWindow() returns config
- ✅ setContextWindow() updates config
- ✅ countTokens() counts correctly
- ✅ countMessageTokens() counts message
- ✅ trimContext() removes oldest messages
- ✅ getContextSummary() generates summary
- ✅ getModelTokenLimit() returns limit
- ✅ estimateCost() calculates cost
- ✅ Context compression works
- ✅ Context truncation works

**Slice 5: Utils** (8 tests):
- ✅ searchConversations() filters by query
- ✅ filterByTag() filters by tag
- ✅ filterByDateRange() filters by date
- ✅ getConversationStats() returns stats
- ✅ getWorkspaceStats() returns stats
- ✅ exportConversation() exports data
- ✅ importConversation() imports data
- ✅ deleteOldConversations() removes old

**Total Unit Tests**: 70 tests

---

### 5.2 Integration Tests (20 tests)

**Store Integration**:
- ✅ Slices compose correctly
- ✅ Cross-slice communication works via get()
- ✅ Persistence works end-to-end
- ✅ Hydration works end-to-end

**Component Integration**:
- ✅ AgentChatPanel uses unified store
- ✅ ChatPanel uses unified store
- ✅ RAGChatPanel uses unified store
- ✅ All workspace components work

**Data Migration**:
- ✅ Old data migrates correctly
- ✅ No data loss during migration
- ✅ Rollback works if needed

**Total Integration Tests**: 20 tests

---

### 5.3 E2E Tests (15 tests)

**User Flows**:
- ✅ User creates conversation in IDE
- ✅ User sends message and receives response
- ✅ User approves tool execution
- ✅ User switches conversations
- ✅ User archives conversation
- ✅ User searches conversations

**Cross-Workspace**:
- ✅ Conversation persists across workspace switch
- ✅ Thread hierarchy works in all workspaces
- ✅ Agent switching preserves context

**Performance**:
- ✅ Store operations are fast (<100ms)
- ✅ No performance regressions
- ✅ Memory usage acceptable

**Total E2E Tests**: 15 tests

**Total Test Coverage Target**: 105 tests, 80%+ coverage

---

## Part 6: Implementation Checklist

### Pre-Migration Checklist

- [ ] Read ADR-003 (Conversation Thread Schema)
- [ ] Understand current architecture
- [ ] Identify all consuming components (20+ files)
- [ ] Create migration plan (this document)
- [ ] Set up feature branch for migration
- [ ] Backup current IndexedDB data
- [ ] Communicate migration to team

---

### Phase 1 Checklist (Create New Store)

- [ ] Create directory structure
- [ ] Implement Slice 1: Conversation CRUD
- [ ] Implement Slice 2: Thread Management
- [ ] Implement Slice 3: Message Management
- [ ] Implement Slice 4: Context Window
- [ ] Implement Slice 5: Utils
- [ ] Create main store file
- [ ] Add Dexie persistence
- [ ] Add hydration handler
- [ ] Write unit tests for all slices (70 tests)
- [ ] Integration testing (20 tests)
- [ ] Verify no breaking changes (old stores still work)

---

### Phase 2 Checklist (Component Migration)

- [ ] Batch 1: Study workspace (3 components)
- [ ] Batch 2: Notes workspace (4 components)
- [ ] Batch 3: Knowledge workspace (4 components)
- [ ] Batch 4: Chat components (4 components)
- [ ] Batch 5: IDE workspace (7+ components)
- [ ] Update all imports
- [ ] Update all selectors
- [ ] Test each workspace
- [ ] Commit after each batch

---

### Phase 3 Checklist (Data Migration)

- [ ] Create migration script
- [ ] Add migration types
- [ ] Implement transform logic
- [ ] Add migration trigger to app
- [ ] Run migration
- [ ] Verify data integrity
- [ ] Test rollback procedure
- [ ] Document migration results

---

### Phase 4 Checklist (Cleanup)

- [ ] Run full test suite (all 105 tests pass)
- [ ] Verify `pnpm dev` works (all workspaces)
- [ ] Verify `pnpm build` succeeds
- [ ] Check for circular imports (none)
- [ ] Validate TypeScript (zero errors)
- [ ] Update JSDoc comments
- [ ] Delete old stores (2 files)
- [ ] Final E2E testing (15 tests)
- [ ] Performance testing
- [ ] Fix any issues

---

### Post-Migration Checklist

- [ ] Update CLAUDE.md with new store architecture
- [ ] Update AGENTS.md if needed
- [ ] Run `tree` command to verify structure
- [ ] Document any breaking changes for team
- [ ] Create rollback plan (if needed)
- [ ] Monitor production for issues
- [ ] Gather user feedback

---

## Part 7: Rollback Plan

### If Migration Fails

**Trigger Criteria**:
- Critical data loss detected
- Build fails after 3 attempts to fix
- Tests fail with blocking issues after 3 attempts
- Performance degradation >50%

**Rollback Steps**:
1. Stop migration immediately
2. Restore from backup (IndexedDB)
3. Revert component migrations (git reset)
4. Delete new store files
5. Verify old stores still work
6. Document failure reason
7. Plan alternative approach

**Rollback Time**: <2 hours

---

## Part 8: Success Criteria

### Migration Complete When:

- [ ] All 5 slices implemented and tested
- [ ] All 20+ components migrated
- [ ] All 105 tests passing
- [ ] Zero TypeScript errors
- [ ] Build succeeds
- [ ] All 4 workspaces functional
- [ ] Data migration verified (no data loss)
- [ ] Performance acceptable (no regressions)
- [ ] Old stores deleted
- [ ] Documentation updated

**Target Health Score**: 9/10 ✅

---

## Summary

**Total Estimated Effort**: 70-90 hours
- Phase 1: Create Store (20-25 hours)
- Phase 2: Component Migration (30-35 hours)
- Phase 3: Data Migration (8-10 hours)
- Phase 4: Cleanup (12-15 hours)

**Risk Level**: MEDIUM-HIGH (core functionality)

**Recommendation**: Proceed with systematic phased migration as documented

---

**END OF CORNERSTONE 3 DETAILED GAP DOCUMENTATION**
