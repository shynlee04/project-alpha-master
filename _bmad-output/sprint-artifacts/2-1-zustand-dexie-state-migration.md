# Story 2.1: Zustand + Dexie State Migration

---
epic: 2
story: 1
title: Zustand + Dexie State Migration
slug: zustand-dexie-state-migration
status: drafted
created_at: 2025-12-28T23:10:00+07:00
updated_at: 2025-12-28T23:10:00+07:00
team: A
platform: UI/Foundation
---

## Overview

**As a** developer,  
**I want** agent **configuration** stored in Zustand with Dexie persistence,  
**So that** configuration changes are visible immediately without page reload (fixes BF-01).

**Epic Context:** Epic 2 - AI Chat That Just Works (Days 4-7)

**Dependencies:**
- ✅ Story 2.0 (Credential Vault) - DONE
- Requires `useConversationStore` created (`src/lib/state/conversation-store.ts`)

**FRs Covered:**
- FR-STATE-01: Unified Store (Zustand+Dexie) — System shall sync Zustand state changes to Dexie (IndexedDB) with <100ms latency
- FR-STATE-02: Session Restoration — System shall restore open files, cursor positions, and scroll offsets on reload

**Remediation Epics Addressed:**
- R-01 (Hot-Reloading Bug Fix)
- R-02 (Atomic State Updates)

---

## Acceptance Criteria

### AC-1: Unified Agent Configuration Store
**Given** an agent's config is stored in multiple places (local state + store)  
**When** migration is complete  
**Then** all agent **configuration** state is in Zustand store (`useAgentsStore`)  
**And** Dexie middleware syncs to IndexedDB within 100ms (NFR-PERF-08)

### AC-2: Immediate UI Update on Configuration Change
**Given** a user modifies agent configuration  
**When** they change any field in AgentConfigDialog  
**Then** the change is reflected immediately in AgentSelector  
**And** no navigation is required to see the update (R-01 fixed)

### AC-3: Encrypted API Key Persistence
**Given** a user saves API key  
**When** the key is persisted  
**Then** `encryptAPIKey()` from `@/lib/security/credential-vault` is called  
**And** only the encrypted value reaches IndexedDB

### AC-4: Conversation Store Creation
**Given** the application needs to track conversation state  
**When** `useConversationStore` is imported  
**Then** it provides messages, scroll position, and pending tool approvals  
**And** persists to Dexie via the established pattern

---

## Tasks

### T1: Research & Pattern Analysis ✅
- [x] Analyze existing `useAgentsStore` implementation (localStorage-based)
- [x] Review `useProviderStore` pattern (Dexie-backed, working example)
- [x] Review `createDexieStorage` adapter implementation
- [x] Understand Dexie schema (version 6 with `providerConfigs` table)

### T2: Extend Dexie Schema for Agent Configs
- [ ] Add `agentConfigs` table to `dexie-db.ts` (version 7)
- [ ] Add `conversationState` table for scroll position + active conversation
- [ ] Run migration upgrade to verify schema works

### T3: Migrate useAgentsStore to Dexie Persistence
- [ ] Replace `localStorage` persistence with `createDexieStorage('agentConfigs')`
- [ ] Update store name from `'via-gent-agents'` to `'agent-configs'`
- [ ] Add optimistic update pattern with rollback
- [ ] Add hydration status handling per existing pattern

### T4: Create useConversationStore
- [ ] Create `src/lib/state/conversation-store.ts`
- [ ] Define state interface:
  - `activeConversationId: string | null`
  - `conversations: Record<string, ConversationState>`
  - `messages: ThreadMessageRecord[]`
  - `scrollPositions: Record<string, number>`
  - `pendingToolApprovals: PendingToolApproval[]`
- [ ] Implement Dexie persistence via established pattern
- [ ] Add hydration hook `useConversationStoreHydration()`

### T5: Integrate Credential Vault with Agent Store
- [ ] When agent is created/updated with API key, call `credentialVault.storeCredentials()`
- [ ] When agent is deleted, call `credentialVault.deleteCredentials()`
- [ ] Never store plaintext API keys in store state

### T6: Unit Tests
- [ ] Test `useAgentsStore` CRUD operations with persistence
- [ ] Test `useConversationStore` persistence and restoration
- [ ] Test credential vault integration (mock vault)
- [ ] Test hydration timing (<100ms for 10 agents)

### T7: Integration Verification
- [ ] Verify AgentConfigDialog updates are immediately visible in AgentSelector
- [ ] Verify state persists across page refresh
- [ ] Verify no "flash of unsaved content" during hydration

---

## Research Requirements

### Required MCP Tool Queries

1. **Context7** - Zustand persist middleware official docs
2. **Context7** - Dexie.js table operations and indexing
3. **DeepWiki** - TanStack patterns for state management
4. **Codebase grep** - Existing store patterns in `src/stores/` and `src/lib/state/`

### Research Completed (Phase 1: Create Story)

<research_notes>
  <finding source="codebase" file="src/stores/agents-store.ts">
    Current useAgentsStore uses localStorage persistence via Zustand `persist` middleware.
    Pattern: create<AgentsState>()(persist((set, get) => {...}, { name: 'via-gent-agents', version: 1 }))
    Issue: localStorage doesn't scale for complex state and lacks indexing.
  </finding>
  
  <finding source="codebase" file="src/lib/state/provider-store.ts">
    Working Dexie pattern example:
    - Uses createJSONStorage(() => createDexieStorage('providerConfigs'))
    - Has partialize for selective persistence
    - Has onRehydrateStorage for initialization
    - Integrates with credentialVault for secure key deletion
  </finding>
  
  <finding source="codebase" file="src/lib/state/dexie-storage.ts">
    createDexieStorage adapter matches Zustand StateStorage interface.
    Stores state as parsed JSON object (not stringified) for DB inspectability.
    Error handling with console warnings/errors.
    Pattern: { getItem, setItem, removeItem } returning Promises.
  </finding>
  
  <finding source="codebase" file="src/lib/state/dexie-db.ts">
    Schema version 6 is current.
    Tables available: projects, ideState, conversations, taskContexts, toolExecutions, credentials, threads, providerConfigs.
    Need to add: agentConfigs table for this story.
    PersistedStateRecord interface used for generic Zustand persistence.
  </finding>
  
  <finding source="context7" query="Dexie storage persistence">
    Dexie supports isStoragePersisted() and persist() for IndexedDB durability.
    Browser may prompt user for permission.
    Good pattern: Check persistence on first load, attempt to enable if not active.
  </finding>
</research_notes>

---

## Dev Notes

### Architecture Patterns (from architecture.md)

1. **State Boundary Pattern (Arch 6.2)**:
   - Components → Zustand → Dexie (never skip layers)
   - All state mutations go through Zustand actions

2. **Optimistic Update Pattern (Decision 4.2.1)**:
   ```typescript
   const updateAgent = async (id: string, updates: Partial<Agent>) => {
       const previousState = useAgentsStore.getState().agents;
       
       // Step 1: Optimistic update (immediate UI)
       useAgentsStore.getState().updateAgent(id, updates);
       
       try {
           // Step 2: Persist to IndexedDB (via Dexie middleware)
           // Handled automatically by Zustand persist
           toast.success('Agent updated');
       } catch (error) {
           // Step 3: Rollback on failure
           useAgentsStore.setState({ agents: previousState });
           toast.error('Update failed');
       }
   };
   ```

3. **Naming Conventions (Arch 5.2)**:
   - PascalCase for components
   - camelCase for utilities
   - use* for hooks

4. **i18n Compliance**:
   - All new UI strings must use translation keys (EN + VI)
   - See `src/i18n/locales/en.json` and `vi.json`

### File Changes Scope

| File | Action | Purpose |
|------|--------|---------|
| `src/lib/state/dexie-db.ts` | Modify | Add agentConfigs + conversationState tables (v7) |
| `src/stores/agents-store.ts` | Modify | Migrate to Dexie persistence |
| `src/lib/state/conversation-store.ts` | Create | New conversation state store |
| `src/lib/state/index.ts` | Modify | Export new store |
| `src/lib/state/conversation-store.test.ts` | Create | Unit tests for new store |
| `src/stores/agents-store.test.ts` | Modify | Update tests for Dexie |

---

## Dev Agent Record

**Agent:** (assigned on dev phase)
**Session:** TBD

### Task Progress:
(Updated during development)

### Research Executed:
- Context7: Dexie storage persistence patterns
- Codebase grep: useAgentsStore, dexie-storage usage patterns
- File review: provider-store.ts (working Dexie integration example)

### Files Changed:
(Updated during development)

### Tests Created:
(Updated during development)

### Decisions Made:
1. **Dexie over localStorage**: IndexedDB via Dexie provides better scalability, async operations, and inspectability vs localStorage
2. **PersistedStateRecord reuse**: Use existing generic interface for new tables
3. **Credential vault integration**: API keys stay in separate encrypted storage, not in agent config state

---

## Code Review

(Populated after implementation)

---

## References

- [Architecture Document](_bmad-output/project-planning-artifacts/architecture.md) - Section 4.2.1, 6.2
- [Epic 2 Definition](_bmad-output/epics.md) - Story 2.1 section
- [Provider Store Pattern](src/lib/state/provider-store.ts) - Working Dexie example
- [Dexie Storage Adapter](src/lib/state/dexie-storage.ts) - StateStorage implementation

---

## Status History

| Date | Status | Agent | Notes |
|------|--------|-------|-------|
| 2025-12-28T23:10 | drafted | @bmad-core-bmad-master | Story created with research complete |
