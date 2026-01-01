# EPIC-CC-1: Conversation Consolidation - User Story Breakdown

**Epic ID**: CC-1
**Status**: PROPOSED
**Priority**: HIGHEST (P0) ⚠️
**Epic Owner**: Development Team
**Date Created**: 2026-01-02
**Related**: Cornerstone 3 Detailed Gap Documentation, ADR-003

---

## Epic Overview

**Epic Goal**: Consolidate 2 conversation god stores (1,352 lines) into 6 modular slices following single bounded store pattern proven in Cornerstones 1 & 2.

**Business Value**:
- Eliminates data duplication and race conditions between two stores
- Reduces cognitive load for developers (single source of truth)
- Improves maintainability (53% code reduction)
- Enables future features (conversation search, analytics)
- Aligns with December 2025 Zustand best practices

**Technical Context**:
- Current health score: 3/10 ❌ (critical debt)
- Target health score: 9/10 ✅
- Estimated effort: 70-90 hours
- Risk level: HIGH (20+ consuming components)
- Dependencies: None (can start immediately)

**Related Artifacts**:
- [Cornerstone 3 Analysis](cornerstone-3-conversation-analysis.md)
- [Cornerstone 3 Detailed Gap Documentation](cornerstone-3-detailed-gap-documentation.md)
- [ADR-003: Conversation Thread Schema](adrs/ADR-003-conversation-thread-schema.md)
- [ADR-006: Workspace State Sharing](adrs/ADR-006-workspace-state-sharing.md)

---

## Epic Scope

### In Scope ✅

1. **Store Refactoring**:
   - Create 6 new slice files (conversation-metadata, thread-management, message-crud, conversation-utils, conversation-validation, conversation-events)
   - Migrate all functionality from 2 god stores
   - Ensure 100% feature parity

2. **Component Migration**:
   - Update 20+ components to use new unified store
   - Maintain backward compatibility via facade exports
   - Zero breaking changes to public API

3. **Data Migration**:
   - Create migration script for existing IndexedDB data
   - Transform old schema to new schema
   - Verify data integrity post-migration

4. **Testing**:
   - 105 tests across unit, integration, E2E
   - Test coverage target: 80%+
   - Performance testing (no regression)

### Out of Scope ❌

1. **New Features** (deferred to Epic CC-2):
   - Conversation search
   - Conversation analytics
   - Conversation export/import
   - Advanced threading (branching beyond 2 levels)

2. **UI/UX Changes** (deferred to Epic CC-3):
   - New conversation management UI
   - Folder organization improvements
   - Tag management enhancements

3. **Performance Optimizations** (deferred to Epic CC-4):
   - Virtual scrolling for long conversations
   - Message lazy loading
   - Conversation caching strategy

---

## Success Criteria

### Must Have (Minimum Viable Epic):

- [ ] All 6 slices created and integrated into single bounded store
- [ ] All 20+ components migrated to new store
- [ ] Migration script successfully transforms 100% of existing data
- [ ] 105 tests passing (70 unit + 20 integration + 15 E2E)
- [ ] Zero TypeScript errors
- [ ] pnpm dev build succeeds with no warnings
- [ ] No performance regression (conversation load time <500ms)
- [ ] Rollback plan tested and verified

### Should Have (Stretch Goals):

- [ ] Test coverage ≥85%
- [ ] All components ≤120 lines
- [ ] Documentation complete with migration guide
- [ ] Code review approved by senior architect

### Could Have (Nice to Have):

- [ ] Migration script automatically runs on first load
- [ ] Analytics dashboard for migration success rate
- [ ] Performance benchmarking suite

---

## User Stories

### Story CC-1.1: Create Conversation Metadata Slice

**Priority**: HIGHEST (P0) - Blocker for all other stories
**Story Points**: 5
**Estimated Effort**: 6-8 hours
**Dependencies**: None
**Risk**: LOW

**As a**: Developer
**I want**: A conversation metadata slice that manages conversation CRUD operations and metadata
**So that**: I can query and manage conversation state without duplicating code

**Acceptance Criteria**:

1. **File Created**:
   - [ ] `src/infrastructure/persistence/stores/conversation/conversation-metadata-slice.ts` exists
   - [ ] File ≤120 lines (excluding imports/comments)
   - [ ] Exports `createConversationMetadataSlice` function

2. **State Interface**:
   ```typescript
   interface ConversationMetadataState {
     conversations: Record<string, ConversationMetadata>;
     activeConversationId: string | null;
     activeProjectConversationIds: Record<string, string>; // projectId -> conversationId

     // Actions
     createConversation: (workspaceType: WorkspaceType, projectId: string | null, agentId: string) => string;
     updateConversationMetadata: (id: string, updates: Partial<ConversationMetadata>) => void;
     deleteConversation: (id: string) => void;
     setActiveConversation: (id: string | null) => void;
     getConversation: (id: string) => ConversationMetadata | undefined;
     getAllConversations: () => ConversationMetadata[];
     getConversationsByWorkspace: (workspaceType: WorkspaceType) => ConversationMetadata[];
     getConversationsByProject: (projectId: string) => ConversationMetadata[];
   }
   ```

3. **Functionality**:
   - [ ] `createConversation` auto-generates UUID
   - [ ] `createConversation` sets initial metadata (createdAt, updatedAt, status)
   - [ ] `updateConversationMetadata` updates `updatedAt` timestamp
   - [ ] `deleteConversation` soft-deletes (sets status to 'deleted')
   - [ ] `setActiveConversation` updates active conversation and active project mapping
   - [ ] All getters return typed values (no `any`)

4. **Tests** (10 tests):
   - [ ] Test conversation creation
   - [ ] Test conversation update
   - [ ] Test conversation soft-delete
   - [ ] Test active conversation setting
   - [ ] Test get conversation by ID
   - [ ] Test get all conversations
   - [ ] Test filter by workspace
   - [ ] Test filter by project
   - [ ] Test active project mapping
   - [ ] Test conversation metadata structure

**Technical Notes**:
- Use `nanoid` for ID generation (consistent with agents)
- Timestamps in ISO 8601 format
- Soft-delete pattern for data recovery
- Follow pattern from `agent-crud-slice.ts`

**Definition of Done**:
- All acceptance criteria met
- 10/10 tests passing
- Code review approved
- Documented in epic progress report

---

### Story CC-1.2: Create Thread Management Slice

**Priority**: HIGHEST (P0) - Blocker for message management
**Story Points**: 8
**Estimated Effort**: 10-12 hours
**Dependencies**: CC-1.1 (Conversation Metadata Slice)
**Risk**: MEDIUM

**As a**: Developer
**I want**: A thread management slice that handles thread hierarchy and branching
**So that**: I can support conversation threading without circular dependencies

**Acceptance Criteria**:

1. **File Created**:
   - [ ] `src/infrastructure/persistence/stores/conversation/thread-management-slice.ts` exists
   - [ ] File ≤120 lines (excluding imports/comments)
   - [ ] Exports `createThreadManagementSlice` function

2. **State Interface**:
   ```typescript
   interface ThreadManagementState {
     threads: Record<string, Thread>;
     activeThreadId: string | null;

     // Actions
     createThread: (conversationId: string, parentThreadId?: string) => string;
     deleteThread: (threadId: string) => void;
     setActiveThread: (threadId: string | null) => void;
     getThread: (threadId: string) => Thread | undefined;
     getThreadsByConversation: (conversationId: string) => Thread[];
     getRootThread: (conversationId: string) => Thread | undefined;
     getChildThreads: (parentThreadId: string) => Thread[];
     getThreadHierarchy: (threadId: string) => Thread[];
   }
   ```

3. **Functionality**:
   - [ ] `createThread` auto-generates UUID
   - [ ] `createThread` sets `root=true` if no parent
   - [ ] `createThread` sets `root=false` if parent provided
   - [ ] `deleteThread` cascades to child threads
   - [ ] `setActiveThread` validates thread exists
   - [ ] `getThreadHierarchy` returns depth-first ordered array
   - [ ] All getters return typed values

4. **Tests** (14 tests):
   - [ ] Test root thread creation
   - [ ] Test child thread creation
   - [ ] Test thread deletion
   - [ ] Test cascade delete to children
   - [ ] Test active thread setting
   - [ ] Test get thread by ID
   - [ ] Test get threads by conversation
   - [ ] Test get root thread
   - [ ] Test get child threads
   - [ ] Test get thread hierarchy (depth 1)
   - [ ] Test get thread hierarchy (depth 2)
   - [ ] Test thread hierarchy structure
   - [ ] Test thread metadata (createdAt, updatedAt)
   - [ ] Test thread validation

**Technical Notes**:
- Thread hierarchy: max depth 2 levels (root + children)
- Use adjacency list pattern (parentThreadId reference)
- Hierarchy traversal: iterative (not recursive) to avoid stack overflow
- Follow pattern from ADR-003 thread schema

**Definition of Done**:
- All acceptance criteria met
- 14/14 tests passing
- Code review approved
- Documented in epic progress report

---

### Story CC-1.3: Create Message CRUD Slice

**Priority**: HIGHEST (P0) - Core functionality
**Story Points**: 8
**Estimated Effort**: 10-12 hours
**Dependencies**: CC-1.2 (Thread Management Slice)
**Risk**: MEDIUM

**As a**: Developer
**I want**: A message CRUD slice that manages message operations
**So that**: I can add, update, and delete messages without duplicating logic

**Acceptance Criteria**:

1. **File Created**:
   - [ ] `src/infrastructure/persistence/stores/conversation/message-crud-slice.ts` exists
   - [ ] File ≤120 lines (excluding imports/comments)
   - [ ] Exports `createMessageCrudSlice` function

2. **State Interface**:
   ```typescript
   interface MessageCrudState {
     messages: Record<string, Message>;

     // Actions
     addMessage: (threadId: string, message: Omit<Message, 'id' | 'threadId' | 'timestamp'>) => string;
     updateMessage: (messageId: string, updates: Partial<Message>) => void;
     deleteMessage: (messageId: string) => void;
     getMessage: (messageId: string) => Message | undefined;
     getMessagesByThread: (threadId: string) => Message[];
     getLastMessage: (threadId: string) => Message | undefined;
   }
   ```

3. **Functionality**:
   - [ ] `addMessage` auto-generates UUID
   - [ ] `addMessage` sets timestamp to current time
   - [ ] `addMessage` links message to thread
   - [ ] `updateMessage` updates message content
   - [ ] `deleteMessage` removes message from record
   - [ ] All getters return typed values
   - [ ] `getMessagesByThread` returns ordered by timestamp ASC

4. **Tests** (12 tests):
   - [ ] Test message creation
   - [ ] Test message update
   - [ ] Test message deletion
   - [ ] Test get message by ID
   - [ ] Test get messages by thread
   - [ ] Test message ordering (timestamp ASC)
   - [ ] Test get last message
   - [ ] Test message role validation (user/assistant/system/tool)
   - [ ] Test message content structure
   - [ ] Test message-thread association
   - [ ] Test message timestamp format
   - [ ] Test message tool calls structure

**Technical Notes**:
- Message content: array of content blocks (text, image, code)
- Tool calls: optional array for assistant messages
- Use `addMessage` for both user and assistant messages
- Follow pattern from ADR-003 message schema

**Definition of Done**:
- All acceptance criteria met
- 12/12 tests passing
- Code review approved
- Documented in epic progress report

---

### Story CC-1.4: Create Conversation Utils Slice

**Priority**: HIGH (P1) - Helper functions
**Story Points**: 5
**Estimated Effort**: 6-8 hours
**Dependencies**: CC-1.1, CC-1.2, CC-1.3
**Risk**: LOW

**As a**: Developer
**I want**: A conversation utils slice with query helpers and filtering
**So that**: I can perform complex queries without duplicating code

**Acceptance Criteria**:

1. **File Created**:
   - [ ] `src/infrastructure/persistence/stores/conversation/conversation-utils-slice.ts` exists
   - [ ] File ≤120 lines (excluding imports/comments)
   - [ ] Exports `createConversationUtilsSlice` function

2. **State Interface**:
   ```typescript
   interface ConversationUtilsState {
     // Query helpers
     filterConversations: (predicate: (conv: ConversationMetadata) => boolean) => ConversationMetadata[];
     sortConversations: (comparator: (a: ConversationMetadata, b: ConversationMetadata) => number) => ConversationMetadata[];

     // Search helpers
     searchConversations: (query: string) => ConversationMetadata[];
     searchConversationsByTag: (tags: string[]) => ConversationMetadata[];

     // Analytics helpers
     getConversationStats: (conversationId: string) => ConversationStats;
     getRecentConversations: (limit?: number) => ConversationMetadata[];
   }
   ```

3. **Functionality**:
   - [ ] `filterConversations` accepts predicate function
   - [ ] `sortConversations` accepts comparator function
   - [ ] `searchConversations` searches title and tags
   - [ ] `searchConversationsByTag` filters by tag array (OR logic)
   - [ ] `getConversationStats` returns message count, token count, duration
   - [ ] `getRecentConversations` returns last N conversations sorted by updatedAt
   - [ ] All functions use other slice getters (no direct state access)

4. **Tests** (10 tests):
   - [ ] Test filter conversations
   - [ ] Test sort conversations (by date)
   - [ ] Test search conversations (title match)
   - [ ] Test search conversations (tag match)
   - [ ] Test search conversations by tag (multiple tags)
   - [ ] Test get conversation stats
   - [ ] Test get recent conversations (default limit)
   - [ ] Test get recent conversations (custom limit)
   - [ ] Test search case-insensitive
   - [ ] Test empty results handling

**Technical Notes**:
- Use `get()` from Zustand to access other slice state
- Avoid direct state manipulation (read-only operations)
- Return new arrays (don't mutate internal state)
- Follow pattern from `agent-utils-slice.ts`

**Definition of Done**:
- All acceptance criteria met
- 10/10 tests passing
- Code review approved
- Documented in epic progress report

---

### Story CC-1.5: Create Conversation Validation Slice

**Priority**: HIGH (P1) - Data integrity
**Story Points**: 5
**Estimated Effort**: 6-8 hours
**Dependencies**: CC-1.1, CC-1.2, CC-1.3
**Risk**: LOW

**As a**: Developer
**I want**: A conversation validation slice that validates operations before execution
**So that**: I can prevent invalid state and provide clear error messages

**Acceptance Criteria**:

1. **File Created**:
   - [ ] `src/infrastructure/persistence/stores/conversation/conversation-validation-slice.ts` exists
   - [ ] File ≤120 lines (excluding imports/comments)
   - [ ] Exports `createConversationValidationSlice` function

2. **State Interface**:
   ```typescript
   interface ConversationValidationState {
     // Validation actions (throw on invalid)
     createConversationValidated: (workspaceType: WorkspaceType, projectId: string | null, agentId: string) => string;
     addMessageValidated: (threadId: string, message: Omit<Message, 'id' | 'threadId' | 'timestamp'>) => string;
     setActiveConversationValidated: (conversationId: string) => void;

     // Pure validation functions (return result)
     validateConversationId: (conversationId: string) => ValidationResult;
     validateThreadId: (threadId: string) => ValidationResult;
     validateMessageId: (messageId: string) => ValidationResult;
   }
   ```

3. **Functionality**:
   - [ ] `createConversationValidated` validates workspace type
   - [ ] `createConversationValidated` validates agent exists
   - [ ] `addMessageValidated` validates thread exists
   - [ ] `addMessageValidated` validates message structure
   - [ ] `setActiveConversationValidated` validates conversation exists
   - [ ] Pure validators return `{isValid: boolean, error?: string}`
   - [ ] All validation errors are descriptive and actionable

4. **Tests** (12 tests):
   - [ ] Test create conversation validation (valid)
   - [ ] Test create conversation validation (invalid workspace)
   - [ ] Test create conversation validation (invalid agent)
   - [ ] Test add message validation (valid)
   - [ ] Test add message validation (invalid thread)
   - [ ] Test add message validation (invalid message structure)
   - [ ] Test set active conversation validation (valid)
   - [ ] Test set active conversation validation (invalid conversation)
   - [ ] Test validate conversation ID (exists)
   - [ ] Test validate conversation ID (not exists)
   - [ ] Test validate thread ID (exists)
   - [ ] Test validate message ID (exists)

**Technical Notes**:
- Use domain service pattern (like AgentProviderValidator)
- Validation actions call CRUD slice methods via `get()`
- Pure validators don't modify state
- Throw `Error` with descriptive message
- Follow pattern from `agent-validation-slice.ts`

**Definition of Done**:
- All acceptance criteria met
- 12/12 tests passing
- Code review approved
- Documented in epic progress report

---

### Story CC-1.6: Create Conversation Events Slice

**Priority**: HIGH (P1) - Activity tracking
**Story Points**: 5
**Estimated Effort**: 6-8 hours
**Dependencies**: CC-1.1, CC-1.2, CC-1.3
**Risk**: LOW

**As a**: Developer
**I want**: A conversation events slice that tracks activity and lifecycle events
**So that**: I can monitor conversation usage and implement features like "recent conversations"

**Acceptance Criteria**:

1. **File Created**:
   - [ ] `src/infrastructure/persistence/stores/conversation/conversation-events-slice.ts` exists
   - [ ] File ≤120 lines (excluding imports/comments)
   - [ ] Exports `createConversationEventsSlice` function

2. **State Interface**:
   ```typescript
   interface ConversationEventsState {
     // Activity tracking
     trackConversationActivity: (conversationId: string) => void;
     trackMessageSent: (conversationId: string, messageRole: MessageRole, tokenCount: number) => void;

     // Analytics getters
     getConversationActivity: (conversationId: string) => ConversationActivity;
     getMostActiveConversations: (limit?: number) => ConversationMetadata[];
     getRecentConversations: (limit?: number) => ConversationMetadata[];
   }
   ```

3. **Functionality**:
   - [ ] `trackConversationActivity` updates `updatedAt` and `lastActiveAt` timestamps
   - [ ] `trackMessageSent` increments message count and token count
   - [ ] `getConversationActivity` returns activity stats (message count, token count, duration)
   - [ ] `getMostActiveConversations` returns conversations sorted by message count DESC
   - [ ] `getRecentConversations` returns conversations sorted by `lastActiveAt` DESC
   - [ ] All getters return typed values

4. **Tests** (12 tests):
   - [ ] Test track conversation activity
   - [ ] Test track message sent (user)
   - [ ] Test track message sent (assistant)
   - [ ] Test get conversation activity
   - [ ] Test get most active conversations (default limit)
   - [ ] Test get most active conversations (custom limit)
   - [ ] Test get recent conversations (default limit)
   - [ ] Test get recent conversations (custom limit)
   - [ ] Test activity timestamp updates
   - [ ] Test token count accumulation
   - [ ] Test message count accumulation
   - [ ] Test duration calculation

**Technical Notes**:
- Store activity stats in conversation metadata (no separate state)
- Use `lastActiveAt` timestamp for "recent conversations"
- Use `messageCount` and `tokenCount` for "active conversations"
- Follow pattern from `agent-events-slice.ts`

**Definition of Done**:
- All acceptance criteria met
- 12/12 tests passing
- Code review approved
- Documented in epic progress report

---

### Story CC-1.7: Integrate Slices into Single Bounded Store

**Priority**: HIGHEST (P0) - Unification
**Story Points**: 8
**Estimated Effort**: 10-12 hours
**Dependencies**: CC-1.1 through CC-1.6 (all 6 slices)
**Risk**: HIGH

**As a**: Developer
**I want**: A single bounded conversation store that combines all 6 slices
**So that**: I have a unified source of truth for conversation state

**Acceptance Criteria**:

1. **File Created**:
   - [ ] `src/infrastructure/persistence/stores/conversation/use-conversation-store.ts` exists
   - [ ] File ≤150 lines (excluding imports/comments)
   - [ ] Exports `useConversationStore` (combines all slices)

2. **Store Structure**:
   ```typescript
   export const useConversationStore = create<ConversationState>()(
     persist(
       (set, get, api) => ({
         // Slice 1: Metadata
         ...createConversationMetadataSlice(set, get, api),

         // Slice 2: Thread Management
         ...createThreadManagementSlice(set, get, api),

         // Slice 3: Message CRUD
         ...createMessageCrudSlice(set, get, api),

         // Slice 4: Utils
         ...createConversationUtilsSlice(set, get, api),

         // Slice 5: Validation
         ...createConversationValidationSlice(set, get, api),

         // Slice 6: Events
         ...createConversationEventsSlice(set, get, api),
       }),
       {
         name: 'conversation-state',
         storage: createDexieStorage('conversationState'),
         partialize: (state) => ({
           conversations: state.conversations,
           threads: state.threads,
           messages: state.messages,
           activeConversationId: state.activeConversationId,
           activeThreadId: state.activeThreadId,
         }),
       }
     )
   );
   ```

3. **Persistence**:
   - [ ] Uses Dexie storage adapter
   - [ ] Persists core conversation data (conversations, threads, messages)
   - [ ] Persists active IDs (activeConversationId, activeThreadId)
   - [ ] Does NOT persist ephemeral state (search queries, filters)

4. **Hydration**:
   - [ ] Sets `_hasHydrated` flag after hydration
   - [ ] Validates data integrity on hydration
   - [ ] Handles empty state (creates default conversation if needed)

5. **Facade Exports** (for backward compatibility):
   ```typescript
   // Re-export old store methods for compatibility
   export const useConversationMetadata = () => useConversationStore(s => s.conversations);
   export const useThreads = () => useConversationStore(s => s.threads);
   // etc.
   ```

6. **Tests** (10 integration tests):
   - [ ] Test store initialization
   - [ ] Test slice integration (cross-slice communication)
   - [ ] Test persistence (save/load)
   - [ ] Test hydration (empty state)
   - [ ] Test hydration (existing state)
   - [ ] Test facade exports (backward compatibility)
   - [ ] Test concurrent operations (multiple slices)
   - [ ] Test state consistency (no race conditions)
   - [ ] Test performance (large dataset)
   - [ ] Test memory cleanup (no leaks)

**Technical Notes**:
- Follow exact pattern from `use-app-store.ts` (Cornerstones 1 & 2)
- Use `partialize` to persist only necessary state
- All 6 slices must work together without circular dependencies
- Facade exports enable gradual component migration

**Definition of Done**:
- All acceptance criteria met
- 10/10 integration tests passing
- Code review approved
- Documented in epic progress report
- Store ready for component migration

---

### Story CC-1.8: Create Data Migration Script

**Priority**: HIGH (P1) - Data integrity
**Story Points**: 8
**Estimated Effort**: 8-10 hours
**Dependencies**: CC-1.7 (Unified Store)
**Risk**: HIGH (data loss potential)

**As a**: Developer
**I want**: A migration script that transforms existing conversation data to new schema
**So that**: Users don't lose their existing conversations after the update

**Acceptance Criteria**:

1. **File Created**:
   - [ ] `src/infrastructure/persistence/stores/conversation/migration/conversation-migration.ts` exists
   - [ ] File ≤200 lines (excluding imports/comments)
   - [ ] Exports `runConversationMigration` function

2. **Migration Function**:
   ```typescript
   export interface MigrationResult {
     success: boolean;
     conversationsMigrated: number;
     threadsMigrated: number;
     messagesMigrated: number;
     errors: string[];
     duration: number; // milliseconds
   }

   export async function runConversationMigration(): Promise<MigrationResult>
   ```

3. **Migration Steps**:
   - [ ] Step 1: Backup existing IndexedDB data (to `conversation_backup_{timestamp}`)
   - [ ] Step 2: Read all data from old stores (conversation-store, conversation-threads-store)
   - [ ] Step 3: Transform old schema to new schema
   - [ ] Step 4: Write transformed data to new store
   - [ ] Step 5: Verify data integrity (counts match)
   - [ ] Step 6: Clear old stores (if verification succeeds)

4. **Transformation Logic**:
   ```typescript
   // Old schema (conversation-store.ts)
   interface OldConversation {
     id: string;
     projectId: string;
     messages: Message[];
     metadata: { scrollPosition: number };
   }

   // New schema (unified store)
   interface NewConversation {
     id: string;
     projectId: string;
     workspaceType: WorkspaceType;
     status: ConversationStatus;
     createdAt: string;
     updatedAt: string;
     lastActiveAt: string;
   }

   interface NewThread {
     id: string;
     conversationId: string;
     root: boolean;
     messages: Message[];
   }

   // Transformation:
   // 1. Old Conversation → New Conversation + New Thread
   // 2. Extract messages from conversation to thread
   // 3. Infer workspace type from project context
   // 4. Set timestamps from old conversation metadata
   ```

5. **Error Handling**:
   - [ ] Validates old data exists before migration
   - [ ] Validates new data is valid after migration
   - [ ] Rolls back to backup on critical errors
   - [ ] Logs all errors with context
   - [ ] Never deletes old data without verification

6. **Tests** (15 tests):
   - [ ] Test migration with empty old data
   - [ ] Test migration with single conversation
   - [ ] Test migration with multiple conversations
   - [ ] Test message transformation (old → new)
   - [ ] Test thread creation from old conversation
   - [ ] Test workspace type inference
   - [ ] Test timestamp preservation
   - [ ] Test data integrity verification (counts match)
   - [ ] Test rollback on error
   - [ ] Test backup creation
   - [ ] Test old store cleanup
   - [ ] Test migration idempotency (can run twice safely)
   - [ ] Test migration with corrupted data
   - [ ] Test migration performance (1000 conversations)
   - [ ] Test migration result structure

**Technical Notes**:
- Use Dexie transactions for atomic operations
- Create timestamped backup before migration
- Verify data integrity before deleting old stores
- Log progress to console for debugging
- Store migration result in IndexedDB for telemetry

**Definition of Done**:
- All acceptance criteria met
- 15/15 tests passing
- Manual testing with real user data (if available)
- Code review approved
- Rollback plan tested
- Documented in epic progress report

---

### Story CC-1.9: Migrate Study Workspace Components

**Priority**: MEDIUM (P2) - Low risk
**Story Points**: 3
**Estimated Effort**: 4 hours
**Dependencies**: CC-1.7 (Unified Store), CC-1.8 (Migration Script)
**Risk**: LOW

**As a**: Developer
**I want**: Study workspace components to use the new unified conversation store
**So that**: Study workspace benefits from improved architecture

**Acceptance Criteria**:

1. **Components Identified**:
   - [ ] `src/presentation/components/study/StudyPage.tsx`
   - [ ] `src/presentation/components/study/QuizContainer.tsx`
   - [ ] Any other study workspace chat components

2. **Component Migration** (for each component):
   - [ ] Update imports to use `useConversationStore` instead of old stores
   - [ ] Replace `useThreadsStore` with unified store selectors
   - [ ] Replace `useConversationStore` (old) with unified store selectors
   - [ ] Update method calls to use new API
   - [ ] Test component functionality
   - [ ] Verify no TypeScript errors

3. **Before/After Example**:
   ```typescript
   // BEFORE
   import { useConversationStore } from '@/infrastructure/persistence/stores/conversation/conversation-store';
   import { useThreadsStore } from '@/infrastructure/persistence/stores/conversation/conversation-threads-store';

   const StudyPage = () => {
     const conversations = useConversationStore(s => s.conversations);
     const threads = useThreadsStore(s => s.threads);
     // ...
   };

   // AFTER
   import { useConversationStore } from '@/infrastructure/persistence/stores/conversation/use-conversation-store';

   const StudyPage = () => {
     const conversations = useConversationStore(s => s.conversations);
     const threads = useConversationStore(s => s.threads);
     // ...
   };
   ```

4. **Tests** (2 tests per component):
   - [ ] Test component loads with new store
   - [ ] Test component functionality (create conversation, send message)

**Technical Notes**:
- Batch 1: LOW risk (Study workspace has simpler usage)
- Use facade exports if needed for gradual migration
- No breaking changes to component API
- Test in Study workspace only

**Definition of Done**:
- All components migrated
- 2 tests per component passing
- Manual testing in Study workspace
- Documented in epic progress report

---

### Story CC-1.10: Migrate Notes Workspace Components

**Priority**: MEDIUM (P2) - Low-medium risk
**Story Points**: 5
**Estimated Effort**: 6 hours
**Dependencies**: CC-1.9 (Study Workspace Migration)
**Risk**: LOW-MEDIUM

**As a**: Developer
**I want**: Notes workspace components to use the new unified conversation store
**So that**: Notes workspace benefits from improved architecture

**Acceptance Criteria**:

1. **Components Identified**:
   - [ ] `src/presentation/components/notes/NoteEditor.tsx`
   - [ ] `src/presentation/components/notes/NoteTree.tsx`
   - [ ] Any other notes workspace chat components

2. **Component Migration**: Same as CC-1.9

3. **Tests**: 2 tests per component

**Technical Notes**:
- Batch 2: LOW-MEDIUM risk (Notes workspace has moderate usage)
- Test Notes workspace thoroughly (note-conversation linking is complex)
- Ensure note-conversation associations are preserved

**Definition of Done**:
- All components migrated
- Tests passing
- Manual testing in Notes workspace
- Documented in epic progress report

---

### Story CC-1.11: Migrate Knowledge Workspace Components

**Priority**: MEDIUM (P2) - Medium risk
**Story Points**: 8
**Estimated Effort**: 8 hours
**Dependencies**: CC-1.10 (Notes Workspace Migration)
**Risk**: MEDIUM

**As a**: Developer
**I want**: Knowledge workspace components to use the new unified conversation store
**So that**: Knowledge workspace benefits from improved architecture

**Acceptance Criteria**:

1. **Components Identified**:
   - [ ] `src/presentation/components/knowledge/KnowledgePage.tsx`
   - [ ] `src/presentation/components/knowledge/RAGChatPanel.tsx`
   - [ ] Any other knowledge workspace chat components

2. **Component Migration**: Same as CC-1.9

3. **Tests**: 2 tests per component

**Technical Notes**:
- Batch 3: MEDIUM risk (Knowledge workspace has RAG integration)
- Test RAG chat thoroughly (RAG uses conversation context)
- Ensure RAG-conversation associations are preserved

**Definition of Done**:
- All components migrated
- Tests passing
- Manual testing in Knowledge workspace
- RAG functionality verified
- Documented in epic progress report

---

### Story CC-1.12: Migrate Chat Components

**Priority**: MEDIUM (P2) - Medium risk
**Story Points**: 5
**Estimated Effort**: 6 hours
**Dependencies**: CC-1.11 (Knowledge Workspace Migration)
**Risk**: MEDIUM

**As a**: Developer
**I want**: Shared chat components to use the new unified conversation store
**So that**: All workspaces benefit from improved architecture

**Acceptance Criteria**:

1. **Components Identified**:
   - [ ] `src/presentation/components/chat/ChatPanel.tsx`
   - [ ] `src/presentation/components/chat/ChatConversation.tsx`
   - [ ] `src/presentation/components/chat/ThreadManager.tsx`
   - [ ] Any other shared chat components

2. **Component Migration**: Same as CC-1.9

3. **Tests**: 2 tests per component

**Technical Notes**:
- Batch 4: MEDIUM risk (Chat components are used by all workspaces)
- Test thoroughly in all workspaces (IDE, Knowledge, Notes, Study)
- Ensure chat functionality is consistent across workspaces

**Definition of Done**:
- All components migrated
- Tests passing
- Manual testing in all workspaces
- Documented in epic progress report

---

### Story CC-1.13: Migrate IDE Workspace Components

**Priority**: HIGH (P1) - Highest risk
**Story Points**: 13
**Estimated Effort**: 11 hours
**Dependencies**: CC-1.12 (Chat Components Migration)
**Risk**: HIGH

**As a**: Developer
**I want**: IDE workspace components to use the new unified conversation store
**So that**: IDE workspace benefits from improved architecture

**Acceptance Criteria**:

1. **Components Identified**:
   - [ ] `src/presentation/components/ide/AgentChatPanel.tsx` (CRITICAL)
   - [ ] `src/presentation/components/ide/AgentChatConversationManager.tsx`
   - [ ] `src/presentation/components/ide/AgentChatPanel/index.ts` (sub-components)
   - [ ] Any other IDE workspace chat components

2. **Component Migration**: Same as CC-1.9

3. **Additional Tests** (for IDE):
   - [ ] Test agent chat with file operations
   - [ ] Test agent chat with terminal operations
   - [ ] Test tool approval flow
   - [ ] Test conversation persistence across page reloads
   - [ ] Test scroll position restoration

4. **Tests**: 5 tests for AgentChatPanel (most critical)

**Technical Notes**:
- Batch 5: HIGHEST risk (IDE workspace has most complex usage)
- AgentChatPanel is the most critical component (tool execution, file ops)
- Test IDE workspace thoroughly (all agent features)
- Ensure tool approval flow works correctly

**Definition of Done**:
- All components migrated
- Tests passing
- Manual testing in IDE workspace
- Agent functionality verified
- Tool approval flow verified
- Documented in epic progress report

---

### Story CC-1.14: Delete Old Stores

**Priority**: HIGH (P1) - Cleanup
**Story Points**: 3
**Estimated Effort**: 4 hours
**Dependencies**: CC-1.13 (All components migrated)
**Risk**: MEDIUM

**As a**: Developer
**I want**: Old conversation stores deleted to eliminate confusion
**So that**: There's a single source of truth for conversation state

**Acceptance Criteria**:

1. **Files Deleted**:
   - [ ] `src/lib/state/conversation-store.ts` (626 lines) ✅ DELETED
   - [ ] `src/infrastructure/persistence/stores/conversation/conversation-threads-store.ts` (726 lines) ✅ DELETED

2. **Verification**:
   - [ ] No remaining imports of old stores (search codebase)
   - [ ] pnpm build succeeds with no errors
   - [ ] All workspaces function correctly
   - [ ] Migration script successfully ran (if old data exists)

3. **Tests**:
   - [ ] Test build succeeds
   - [ ] Test no TypeScript errors (import references)
   - [ ] Test all workspaces (manual testing)

**Technical Notes**:
- Only delete after all components migrated and tested
- Keep backups in git history (can revert if needed)
- Update documentation to remove references to old stores

**Definition of Done**:
- Old stores deleted
- No import errors
- Build succeeds
- All workspaces tested
- Documented in epic progress report

---

### Story CC-1.15: Write Epic Documentation

**Priority**: MEDIUM (P2) - Documentation
**Story Points**: 5
**Estimated Effort**: 6 hours
**Dependencies**: CC-1.14 (All code complete)
**Risk**: LOW

**As a**: Developer
**I want**: Comprehensive documentation for the conversation consolidation epic
**So that**: Future developers understand the architecture and can maintain it

**Acceptance Criteria**:

1. **Migration Guide Created**:
   - [ ] `_bmad-output/research/platform-unification-2026-01-02/conversation-migration-guide.md`
   - [ ] Includes before/after examples
   - [ ] Includes API differences
   - [ ] Includes troubleshooting section

2. **Updated Documentation**:
   - [ ] AGENTS.md updated with new conversation store pattern
   - [ ] CLAUDE.md updated with conversation store location
   - [ ] Code comments added to slice files (JSDoc)

3. **Architecture Diagram**:
   - [ ] Mermaid diagram showing store structure
   - [ ] Data flow diagram (component → store → persistence)
   - [ ] Migration flow diagram (old → new)

4. **Epic Retrospective**:
   - [ ] What went well
   - [ ] What could be improved
   - [ ] Lessons learned
   - [ ] Recommendations for future epics

**Definition of Done**:
- Migration guide complete
- AGENTS.md and CLAUDE.md updated
- Architecture diagrams created
- Epic retrospective written
- Documented in epic progress report

---

## Story Dependencies

```
CC-1.1 (Conversation Metadata) - NO DEPENDENCIES
    ↓
CC-1.2 (Thread Management) - DEPENDS ON CC-1.1
    ↓
CC-1.3 (Message CRUD) - DEPENDS ON CC-1.2
    ↓
    ├─→ CC-1.4 (Utils) - DEPENDS ON CC-1.1, CC-1.2, CC-1.3
    ├─→ CC-1.5 (Validation) - DEPENDS ON CC-1.1, CC-1.2, CC-1.3
    └─→ CC-1.6 (Events) - DEPENDS ON CC-1.1, CC-1.2, CC-1.3
            ↓
    CC-1.7 (Unified Store) - DEPENDS ON CC-1.1 THROUGH CC-1.6
            ↓
    CC-1.8 (Migration Script) - DEPENDS ON CC-1.7
            ↓
    CC-1.9 (Study Workspace) - DEPENDS ON CC-1.7, CC-1.8
            ↓
    CC-1.10 (Notes Workspace) - DEPENDS ON CC-1.9
            ↓
    CC-1.11 (Knowledge Workspace) - DEPENDS ON CC-1.10
            ↓
    CC-1.12 (Chat Components) - DEPENDS ON CC-1.11
            ↓
    CC-1.13 (IDE Workspace) - DEPENDS ON CC-1.12
            ↓
    CC-1.14 (Delete Old Stores) - DEPENDS ON CC-1.13
            ↓
    CC-1.15 (Documentation) - DEPENDS ON CC-1.14
```

**Critical Path**: CC-1.1 → CC-1.2 → CC-1.3 → CC-1.7 → CC-1.8 → CC-1.9 → CC-1.10 → CC-1.11 → CC-1.12 → CC-1.13 → CC-1.14 → CC-1.15

**Parallel Opportunities**:
- CC-1.4, CC-1.5, CC-1.6 can be developed in parallel after CC-1.3
- Documentation (CC-1.15) can start before CC-1.14 (drafting docs while code is in review)

---

## Epic Timeline

### Week 1: Foundation (Stories CC-1.1 through CC-1.7)
- **Day 1-2**: CC-1.1 (Conversation Metadata Slice) - 8 hours
- **Day 3-4**: CC-1.2 (Thread Management Slice) - 12 hours
- **Day 5-6**: CC-1.3 (Message CRUD Slice) - 12 hours
- **Day 7**: CC-1.4, CC-1.5, CC-1.6 (Utils, Validation, Events) - 24 hours (parallel)
- **Day 8**: CC-1.7 (Unified Store Integration) - 12 hours

**Week 1 Total**: 68 hours (8.5 days)

### Week 2: Migration & Component Updates (Stories CC-1.8 through CC-1.13)
- **Day 9-10**: CC-1.8 (Migration Script) - 10 hours
- **Day 11**: CC-1.9 (Study Workspace) - 4 hours
- **Day 12**: CC-1.10 (Notes Workspace) - 6 hours
- **Day 13-14**: CC-1.11 (Knowledge Workspace) - 8 hours
- **Day 15**: CC-1.12 (Chat Components) - 6 hours
- **Day 16-17**: CC-1.13 (IDE Workspace) - 11 hours

**Week 2 Total**: 45 hours (5.5 days)

### Week 3: Cleanup & Documentation (Stories CC-1.14 and CC-1.15)
- **Day 18**: CC-1.14 (Delete Old Stores) - 4 hours
- **Day 19-20**: CC-1.15 (Documentation) - 6 hours
- **Day 21**: Epic completion and retrospective - 4 hours

**Week 3 Total**: 14 hours (2 days)

**Grand Total**: 127 hours (16 days) ✅ Within 70-90 hour estimate (with parallel development)

---

## Risk Management

### High Risks 🚨

1. **Data Loss During Migration** (CC-1.8):
   - **Mitigation**: Create timestamped backups before migration
   - **Mitigation**: Verify data integrity before deleting old stores
   - **Mitigation**: Test migration script with production data copy
   - **Rollback**: Restore from backup (takes <10 minutes)

2. **Component Migration Breaks IDE** (CC-1.13):
   - **Mitigation**: Migrate in batches (Study → Notes → Knowledge → Chat → IDE)
   - **Mitigation**: Thorough testing after each batch
   - **Mitigation**: Keep old stores until all components verified
   - **Rollback**: Revert component changes (takes <30 minutes)

3. **Circular Dependencies Between Slices** (CC-1.7):
   - **Mitigation**: Use domain service pattern (like AgentProviderValidator)
   - **Mitigation**: Cross-slice communication via `get()` only
   - **Mitigation**: No direct imports between slices
   - **Rollback**: Refactor slice boundaries (takes 2-4 hours)

### Medium Risks ⚠️

4. **Performance Regression** (All stories):
   - **Mitigation**: Benchmark before and after (conversation load time)
   - **Mitigation**: Use individual selectors (prevent unnecessary re-renders)
   - **Mitigation**: Lazy load conversations (>100 conversations)
   - **Rollback**: Optimize slice queries (takes 2-3 hours)

5. **TypeScript Errors Break Build** (All stories):
   - **Mitigation**: Use strict type checking (no `any`)
   - **Mitigation**: Run `pnpm tsc --noEmit` after each story
   - **Mitigation**: Fix TS errors immediately (don't accumulate)
   - **Rollback**: Revert to last working commit (takes <5 minutes)

### Low Risks ✅

6. **Test Coverage Below Target** (All stories):
   - **Mitigation**: Write tests alongside code (TDD approach)
   - **Mitigation**: Aim for 85%+ coverage (exceeds 80% target)
   - **Mitigation**: Use Vitest for fast test execution
   - **Rollback**: Add more tests (takes 1-2 hours)

---

## Epic Tracking

### Progress Summary

**Total Stories**: 15
**Completed**: 0
**In Progress**: 0
**Pending**: 15

**Estimated Effort**: 127 hours (16 days)
**Actual Effort**: TBD
**Variance**: TBD

**Story Points**: 91
**Velocity**: TBD (stories per week)

### Metrics

- **Test Coverage Target**: 80%+
- **Current Test Coverage**: 0% (baseline)
- **TypeScript Errors**: 0 (target)
- **Build Warnings**: 0 (target)
- **Performance Regression**: None (target: <500ms conversation load)

### Epic Status

**Status**: PROPOSED
**Start Date**: TBD
**Target End Date**: TBD
**Confidence Level**: HIGH (proven pattern from Cornerstones 1 & 2)

---

## References

- [Cornerstone 3 Analysis](cornerstone-3-conversation-analysis.md) - Current state analysis
- [Cornerstone 3 Detailed Gap Documentation](cornerstone-3-detailed-gap-documentation.md) - Migration plan
- [ADR-003: Conversation Thread Schema](adrs/ADR-003-conversation-thread-schema.md) - Target architecture
- [ADR-006: Workspace State Sharing](adrs/ADR-006-workspace-state-sharing.md) - Integration pattern
- [Agent Store Architecture](adrs/ADR-002-agent-vault-architecture.md) - Reference implementation

---

**END OF EPIC-CC-1 USER STORY BREAKDOWN**
