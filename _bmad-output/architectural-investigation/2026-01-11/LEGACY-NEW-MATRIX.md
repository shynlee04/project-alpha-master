# LEGACY vs NEW ARCHITECTURE MATRIX
**Date:** 2026-01-11  
**Purpose:** Exact counting of in-code, non-dead, wired stories/components

---

## 1. EXACT STORY COUNT (In Code, Non-Dead, Wired)

| Category | Count | Status |
|----------|-------|--------|
| **TOTAL stories in codebase** | ~38 | Files exist |
| **Stories DONE** | 16 | EPIC-38(10) + EPIC-30(1) + EPIC-31(1) + Phase-1(4) |
| **Stories IN_PROGRESS** | 2 | FS-05, P1.5-04 |
| **Stories NOT_STARTED** | 6 | FS-06, 39-01, 39-02, P1-06, P07, P1-08 |
| **EPIC-40 (Multimodal)** | 12 | COMPLETED (per bmm-workflow-status.yaml) |
| **EPIC-FS (File System)** | 14 | 4 done, 10 remaining |

---

## 2. STORE USAGE MATRIX (Actual Code)

| Store | Files Using | % of Codebase | Critical? |
|-------|-------------|---------------|-----------|
| **ConversationStore (Facade)** | 26 files | ~70% | ⚠️ UI layer |
| **UnifiedChatStore (New)** | 6 files | ~30% | ✅ Multi-agent |

### Files using ConversationStore (FACADE) - 26 files:

```
CORE UI (5):
├── AgentChatPanel.tsx           ← MAIN CHAT INTERFACE
├── ChatPanelWrapper.tsx          ← THREAD LIST
├── useAgentChatMessages.ts
├── AgentChatConversationManager.tsx
└── ChatHistory.tsx

COMPONENTS (4):
├── ThreadCard.tsx                ← THREAD DISPLAY
├── ThreadsList.tsx               ← THREAD LIST UI
├── ThreadFolderTree.tsx          ← TREE VIEW
└── SequentialExpansionOptions.tsx

STORES/INFRA (12):
├── useConversationStore.ts       ← FACADE DEFINITION
├── conversation-store.ts
├── index.ts (conversation)
├── workspace-context.ts
├── useCornerstoneStores.ts
├── unified-workspace-context.ts
├── workspace-provider.tsx
├── index.ts (persistence/stores)
├── auto-restore.ts
├── conversation-migration.ts
└── ...tests

LIB/HOOKS (5):
├── useChatHistory.ts
├── context-window-manager.ts
├── threads-store.ts
├── workspace/index.ts
└── use-conversation-persistence.ts
```

### Files using UnifiedChatStore (NEW) - 6 files:

```
CORE (3):
├── unified-chat-store.ts         ← STORE DEFINITION
├── index.ts (chat)
└── useConversationStore.ts       ← FACADE MAPS TO THIS

MULTI-AGENT (2):
├── use-agent-chat-with-tools.ts  ← ⚡ MULTI-AGENT SYSTEM ✅
└── use-agent-chat-with-tools.test.ts

DEAD CODE (1):
└── useThreadManager.ts           ← NEVER USED
```

---

## 3. THREAD MANAGEMENT COMPONENT MATRIX

| Component | Status | Lines | Store | Imported? | Wired? |
|-----------|--------|-------|-------|-----------|--------|
| **ThreadCard** | ✅ ACTIVE | 169 | Facade | Yes | Yes |
| **ThreadsList** | ⚠️ UNKNOWN | 186 | Props | No | No |
| **ThreadFolderTree** | ⚠️ UNKNOWN | 200+ | Facade | No | No |
| **ThreadManager** | ❌ DEAD | 335 | Unified | No | No |
| **useThreadManager** | ❌ DEAD | 186 | Unified | No | No |

---

## 4. ARCHITECTURE INTEGRATION STATUS

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ARCHITECTURE INTEGRATION MAP                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  MULTI-AGENT SYSTEM (use-agent-chat-with-tools.ts)                          │
│         │                                                                     │
│         ▼                                                                     │
│  UnifiedChatStore (6 files) ──────────────────────┐                          │
│         │                                           │                          │
│         │ "Source of Truth"                        │                          │
│         │                                           │                          │
│         ▼                                           ▼                          │
│  ConversationStore Facade ────────────────► UI Components                   │
│  (26 files)                                        │                          │
│         │                                           │                          │
│         │ "Backward Compatibility"                  │                          │
│         │                                           │                          │
│         ▼                                           ▼                          │
│  ┌─────────────────────────────────────────────────────────────┐            │
│  │ UI COMPONENTS (Working)                                       │            │
│  │  - AgentChatPanel (main chat)                                │            │
│  │  - ChatPanelWrapper (thread list)                            │            │
│  │  - ThreadCard (thread display)                               │            │
│  │  - EnhancedChatInterface (input + display)                   │            │
│  └─────────────────────────────────────────────────────────────┘            │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────┐            │
│  │ DEAD CODE (Never Integrated)                                 │            │
│  │  - ThreadManager (335 lines)                                 │            │
│  │  - useThreadManager (186 lines)                              │            │
│  └─────────────────────────────────────────────────────────────┘            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. NON-NEGOTIABLE IMPACT ANALYSIS

| Non-Negotiable | ThreadManager Impact | Evidence |
|----------------|---------------------|----------|
| **1. Multi-agent + tools** | ✅ SAFE | `use-agent-chat-with-tools.ts` uses `UnifiedChatStore` directly |
| **2. RAG vector indexing** | ✅ SAFE | RAG uses messages from `UnifiedChatStore`, not UI components |
| **3a. Cross-workspace** | ✅ SAFE | `workspaceType` field in `UnifiedChatStore` |
| **3b. FS sync + CRUD** | ✅ SAFE | Separate architecture in `persistence/stores/` |
| **3c. Desktop/mobile** | ✅ SAFE | Routing in `src/routes/`, separate from chat |
| **3d. Agent handoff** | ✅ SAFE | `lib/agent/` handles handoffs |
| **3e. BYOK democracy** | ✅ SAFE | Key management in `AgentChatAPIKeyManager.tsx` |
| **3f. Performance** | ✅ IMPROVED | Removing dead code reduces bundle |
| **3g. Fluid UX** | ✅ SAFE | ThreadManager was never integrated, no UX change |

---

## 6. RESOLUTION OPTIONS IMPACT MATRIX

| Option | Stories Affected | Files Changed | Risk | Effort |
|--------|-----------------|---------------|------|--------|
| **A: REMOVE ThreadManager** | 0 | 3 | **LOW** | 1 hour |
| **B: Integrate ThreadManager** | 5-8 | 8-12 | HIGH | 2-3 days |
| **C: Migrate UI to UnifiedChatStore** | 12-15 | 26 | CRITICAL | 1-2 weeks |
| **D: Refactor ThreadManager for Facade** | 3-5 | 5-8 | MEDIUM | 1-2 days |

### Option A: REMOVE ThreadManager (RECOMMENDED)
```
Stories: 0 (dead code)
Files: 3 (remove exports + archive)
Risk: LOW (no consumers)
Effort: 1 hour
Impact: None
```

### Option B: Integrate ThreadManager
```
Stories: 5-8
├── ChatPanelWrapper refactor
├── ThreadCard replacement
├── Feature flag setup
└── Testing
Files: 8-12
Risk: MEDIUM (UI changes)
Effort: 2-3 days
Impact: User workflow changes
```

### Option C: Migrate UI to UnifiedChatStore
```
Stories: 12-15 (ALL facade consumers)
├── AgentChatPanel
├── ChatPanelWrapper
├── ThreadCard
├── All 26 facade consumers
└── Testing all
Files: 26 (all facade consumers)
Risk: HIGH (breaking changes)
Effort: 1-2 weeks
Impact: Complete architecture change
```

### Option D: Refactor for Facade
```
Stories: 3-5
├── ThreadManager.tsx refactor
├── useThreadManager.ts refactor  
├── ChatPanelWrapper update
└── Testing
Files: 5-8
Risk: MEDIUM (store access change)
Effort: 1-2 days
Impact: Minimal
```

---

## 7. VERIFICATION: ZERO THREAT TO NON-NEGOTIABLES

### Multi-Agent System ✅
```typescript
// src/lib/agent/hooks/use-agent-chat-with-tools.ts
import { useUnifiedChatStore } from '@/infrastructure/persistence/stores/chat';

// Already using UnifiedChatStore directly
const activeThreadId = useUnifiedChatStore((state) => state.activeThreadId);
const messages = useUnifiedChatStore((state) => state.messages);
// ✅ THREADMANAGER REMOVAL HAS NO IMPACT
```

### RAG Pipeline ✅
```typescript
// RAG indexes conversation data from UnifiedChatStore
// ThreadManager is UI only - no data impact
// ✅ THREADMANAGER REMOVAL HAS NO IMPACT
```

### Cross-Workspace ✅
```typescript
// workspaceType is stored in UnifiedChatStore
// conversations: { id, workspaceType, projectId, ... }
// ✅ THREADMANAGER REMOVAL HAS NO IMPACT
```

---

## 8. CONCLUSION

### Exact Counts:
- **Stories in code:** ~38
- **Stories using ConversationStore (Facade):** 26 files, representing ~15 unique stories
- **Stories using UnifiedChatStore (New):** 6 files, representing ~8 stories (including multi-agent)
- **Dead code (ThreadManager):** 0 stories affected by removal

### Recommendation: **OPTION A - REMOVE ThreadManager**

| Criteria | Result |
|----------|--------|
| Impact on stories | **0** (dead code) |
| Risk to non-negotiables | **NONE** |
| Effort | **1 hour** |
| Bundle size impact | **REDUCED** |
| Maintenance burden | **REDUCED** |

---

*Generated: 2026-01-11 | BMAD Architectural Matrix v1.0*
