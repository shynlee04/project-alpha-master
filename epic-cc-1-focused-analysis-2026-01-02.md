# Epic CC-1 (Conversation Consolidation) - Focused Codebase Analysis

## Generated: 2026-01-02
## Purpose: Safe implementation guide for conversation consolidation

---

## 📊 Focused Pack Overview

**Total Files**: 82 files (critical conversation-related files only)
**Total Tokens**: 117,763 tokens
**Total Characters**: 546,245 chars
**Focus Areas**: Stores, conversation logic, chat components, API endpoints

---

## 🎯 Key Files for Epic CC-1 Implementation

### 1. Core Store Files

#### Target Architecture: `src/infrastructure/persistence/stores/`
**Use-app-store.ts** - Global store with domain slices
- **Agents**: 6 slice files (CRUD, workspace bindings, validation, events, utils)
- **Conversation**: NEW slice structure needed
- **Providers**: Configuration slices
- **Pattern**: Modern Zustand + Dexie with slice architecture

#### Current Implementation (Legacy - needs consolidation)

**Conversation Store** - `src/lib/state/conversation-store.ts` (626 lines)
- **Status**: GOD STORE - Mixed concerns, needs splitting
- **Responsibilities**:
  - Active conversation state management
  - Message persistence (Dexie)
  - Thread lifecycle management
  - Synchronization logic
  - UI state (should be separate)

**Conversation Threads** - `src/stores/conversation-threads-store.ts` (726 lines)
- **Status**: GOD STORE - Thread management too large
- **Responsibilities**:
  - Thread data structure
  - Thread CRUD operations
  - Thread persistence
  - Thread metadata management

**Agent Store** - `src/lib/state/agents-store.ts` (430 lines)
- **Status**: CIRCULAR DEPENDENCY with provider-store
- **Issues**:
  - Cannot be used directly by UI components
  - Workspace filtering logic mixed in
  - Provider dependencies causing circular refs

**Provider Store** - `src/lib/state/provider-store.ts`
- **Status**: CIRCULAR DEPENDENCY with agents-store
- **Issues**:
  - Tightly coupled with agent store
  - Breaking the cycle required for clean architecture

### 2. Chat Components Analysis

#### Core Components (Total: ~10 files)

**ChatPanel** - `src/presentation/components/chat/ChatPanel.tsx`
- Main chat interface
- Message display and input
- Thread switching
- **Integration Point**: Uses conversation store directly

**ChatConversation** - `src/presentation/components/chat/ChatConversation.tsx` (3,778 tokens)
- Conversation rendering
- Message bubbles
- Thread display
- **Integration Point**: Consumes conversation store messages

**ThreadManager** - `src/presentation/components/chat/ThreadManager.tsx` (337 lines from summary)
- Thread lifecycle
- Thread switching logic
- Thread persistence calls
- **Integration Point**: Manages thread state via store

**AgentChatPanel** - `src/presentation/components/ide/AgentChatPanel.tsx` (316 lines)
- IDE integration
- Agent-specific chat
- Tool execution UI
- **Integration Point**: Uses both agent and conversation stores

### 3. API Layer

**Chat API** - `src/routes/api/chat.ts`
- TanStack AI integration
- Streaming responses
- Authentication handling
- **Integration Point**: Entry point for chat functionality

---

## 🏗️ Safe Implementation Strategy

### Phase 1: Create Conversation Slice Architecture

#### Step 1: Define Slice Boundaries
```typescript
// Target structure in src/infrastructure/persistence/stores/conversation/
├── conversation-store.ts              // Main orchestrator (<300 lines)
├── slices/
│   ├── messages-slice.ts              // Message CRUD operations
│   ├── threads-slice.ts               // Thread lifecycle management
│   ├── sync-slice.ts                  // Synchronization logic
│   ├── ui-slice.ts                     // UI state (active thread, etc.)
│   └── metadata-slice.ts               // Conversation metadata
├── migrations/
│   └── v1-initial.ts                  // Dexie migration
└── dexie-schema.ts                    // Database schema definition
```

#### Step 2: Migration Safety Protocol
1. **Create temporary branch**: `feature/epic-cc-1-conversation-consolidation`
2. **Backup strategy**: Export existing conversation data via IndexedDB
3. **Gradual migration**:
   - Create new conversation slices
   - Implement facade pattern for backward compatibility
   - Update components one by one
   - Test each step incrementally

### Phase 2: Break Agent-Provider Circular Dependencies

#### Step 1: Extract Domain Services
Create `src/domain/services/agent-workspace-utils.ts` (exists - 106 lines)
- Extract workspace filtering logic
- Remove from stores
- Create pure functions

#### Step 2: Store Decoupling
```typescript
// Before: Circular dependency
agents-store.ts ↔ provider-store.ts

// After: Clean separation
agents-store.ts (uses domain services)
provider-store.ts (independent)
```

### Phase 3: Store Consolidation

#### Migration Path
```
src/lib/state/conversation*
    ↓ (consolidate)
src/infrastructure/persistence/stores/conversation/
    ↓ (integrate)
src/infrastructure/persistence/stores/use-app-store.ts
```

#### File Cleanup Plan
1. **Delete**: `src/lib/state/conversation-store.ts`
2. **Delete**: `src/stores/conversation-threads-store.ts`
3. **Move**: `src/lib/state/agents-store.ts` → slices
4. **Move**: `src/lib/state/provider-store.ts` → slices
5. **Update**: All consumers to use new store structure

---

## 🔍 Critical Implementation Details

### 1. Conversation Store Current Implementation (Key Parts)

From the focused pack, the conversation store has:
- **Message persistence**: Using Dexie for IndexedDB
- **Thread management**: Active thread, thread list
- **Synchronization**: Sync logic for real-time updates
- **UI state**: Currently mixed with business logic

**Refactoring Strategy**:
1. Extract UI state to `ui-slice.ts`
2. Move persistence to `messages-slice.ts` and `threads-slice.ts`
3. Keep sync logic in `sync-slice.ts`

### 2. Store Consumers Analysis

**ChatPanel Component**:
- Currently: Direct import of `useConversationStore`
- Target: Use specific selectors from new conversation slices
- Pattern: `useConversationMessages()`, `useActiveThread()`

**ThreadManager Component**:
- Currently: Direct thread operations
- Target: Use `useThreadSlice()` for thread operations
- Pattern: `useThreadCrud()`, `useThreadLifecycle()`

### 3. Data Migration Strategy

#### Schema Evolution
```typescript
// Current schema (v1)
interface ConversationStore {
  messages: Message[];
  threads: Thread[];
  activeThreadId: string;
  // ... other fields
}

// New schema (v2)
interface ConversationSlices {
  messages: MessageSlice;
  threads: ThreadSlice;
  ui: UISlice;
  sync: SyncSlice;
}
```

#### Data Integrity Safeguards
1. **Export utility**: Create function to export conversations to JSON
2. **Import utility**: Create function to restore from JSON
3. **Version detection**: Detect schema version on load
4. **Graceful fallback**: Handle missing fields with defaults

---

## 🛡️ Risk Mitigation Plan

### 1. Data Loss Prevention
- **Quota Handling**: Implement proper IndexedDB quota checks
- **Backup Before Migration**: Export all conversations
- **Rollback Strategy**: Keep old stores available during transition
- **Test Data**: Create test conversation data for validation

### 2. Infinite Loop Prevention (Zustand v5)
- **Individual Selectors Only**: Never destructure entire stores
- **Stable References**: Ensure selectors return stable objects
- **useShallow**: Use for object comparisons where needed

### 3. Breaking Change Prevention
- **API Compatibility**: Maintain same interface for components
- **Facade Pattern**: Wrap new stores during transition
- **Feature Flags**: Gradually enable new store behavior
- **Documentation**: Update all component imports

### 4. Performance Considerations
- **Lazy Loading**: Load conversation data on demand
- **Optimistic Updates**: For message sending
- **Debounced Sync**: For synchronization operations
- **Virtual Scrolling**: For long conversations

---

## 📋 Implementation Checklist

### Week 1: Conversation Slice Architecture
- [ ] Create `src/infrastructure/persistence/stores/conversation/` directory
- [ ] Implement `conversation-store.ts` main orchestrator
- [ ] Create `messages-slice.ts` with message CRUD operations
- [ ] Create `threads-slice.ts` with thread lifecycle management
- [ ] Implement `dexie-schema.ts` and migration
- [ ] Create facade for backward compatibility
- [ ] Test with ChatPanel component

### Week 2: Store Consolidation
- [ ] Break agent-provider circular dependencies
- [ ] Consolidate agent stores into slices
- [ ] Consolidate provider stores into slices
- [ ] Update use-app-store.ts to include new slices
- [ ] Remove old conversation stores
- [ ] Update all component consumers
- [ ] Test cross-workspace conversation persistence

### Week 3: UI Refactoring
- [ ] Extract hooks from ChatPanel components
- [ ] Standardize error handling patterns
- [ ] Add loading states for async operations
- [ ] Implement proper TypeScript types
- [ ] End-to-end testing across all workspaces

### Week 4: Validation & Cleanup
- [ ] Verify no data loss during migration
- [ ] Test conversation persistence across sessions
- [ ] Validate agent switching works correctly
- [ ] Performance testing
- [ ] Clean up temporary files and branches
- [ ] Update documentation

---

## 🎯 Success Criteria

### Functional Requirements
- [ ] Conversations persist correctly across browser sessions
- [ ] Thread switching works without data loss
- [ ] Agent selections persist per workspace
- [ ] Message synchronization works correctly
- [ ] No regression in chat performance

### Technical Requirements
- [ ] Zero TypeScript errors
- [ ] All components use individual store selectors
- [ ] No circular dependencies
- [ ] All store files < 300 lines
- [ ] Proper error boundaries and loading states

### Data Integrity Requirements
- [ ] 100% conversation data retention
- [ ] No message duplication during sync
- [ ] Correct thread metadata preservation
- [ ] Proper handling of corrupted conversation data

---

## 🔧 Critical Configuration Files

### Vite Configuration (for reference)
- **Cross-origin isolation**: Required for WebContainers
- **Security headers**: COOP/COEP must be first
- **TanStack Start**: Proper SSR configuration

### Package.json Dependencies (verify)
- **@tanstack/ai**: For streaming chat
- **zustand**: State management (v5 patterns)
- **dexie**: IndexedDB persistence
- **@webcontainer/api**: File operations

---

This focused analysis provides the specific files and implementation strategy needed to safely execute Epic CC-1. The conversation consolidation can be achieved by following the phased approach, focusing on creating proper slice boundaries and maintaining data integrity throughout the migration.

**Next Step**: Begin Week 1 by creating the conversation slice architecture in `src/infrastructure/persistence/stores/conversation/`.