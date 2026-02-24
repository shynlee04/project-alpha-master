# Architectural Deep-Scan Investigation Framework
**Date:** 2026-01-11  
**Phase:** 1 - DISCOVERY & FILE INVENTORY  
**Session:** Architectural Conflict Resolution - ThreadManager Integration Gap

---

## 1. Investigation Scope

### 1.1 Primary Focus
- **CHAT-005 (useThreadManager)** + **CHAT-006 (ThreadManager)** - Built but never integrated
- Root cause: Built against `useUnifiedChatStore` but UI uses `useConversationStore`

### 1.2 Secondary Focus
- Full chat architecture state management
- Store synchronization patterns (facade vs direct usage)
- Cross-workspace thread management capabilities

---

## 2. File Inventory - Critical Files

### 2.1 Store Layer
| File | description | Status |
|------|---------|--------|
| `src/infrastructure/persistence/stores/chat/unified-chat-store.ts` | New unified store (source of truth) | ACTIVE |
| `src/infrastructure/persistence/stores/conversation/useConversationStore.ts` | Legacy facade (maps to UnifiedChatStore) | MIGRATING |
| `src/infrastructure/persistence/stores/chat/slices/` | Store slices (metadata, threads, messages, tools, context) | ACTIVE |

### 2.2 Thread Management Components
| File | description | Integration Status |
|------|---------|-------------------|
| `src/presentation/components/chat/ThreadManager.tsx` | Thread CRUD UI (never rendered) | NOT INTEGRATED |
| `src/presentation/hooks/useThreadManager.ts` | Hook for ThreadManager (uses UnifiedChatStore) | UNUSED |
| `src/presentation/components/chat/ThreadCard.tsx` | Thread list card (ACTUALLY USED) | INTEGRATED |
| `src/presentation/components/chat/ThreadsList.tsx` | Thread list container | INTEGRATED |
| `src/presentation/components/layout/ChatPanelWrapper.tsx` | Uses ThreadCard + ConversationStore | ACTIVE |

### 2.3 Chat Components (Working)
| File | Status |
|------|--------|
| `src/presentation/components/ide/EnhancedChatInterface.tsx` | ✅ INTEGRATED |
| `src/presentation/components/chat/ChatInputControls.tsx` | ✅ INTEGRATED |
| `src/presentation/components/chat/CollapsibleSection.tsx` | ✅ INTEGRATED |
| `src/presentation/components/chat/ArtifactPreviewModal.tsx` | ✅ INTEGRATED |

---

## 3. Architectural Conflict Summary

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    THREAD MANAGEMENT ARCHITECTURE                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   UI LAYER (ChatPanelWrapper)                                           │
│         │                                                               │
│         ▼                                                               │
│   useConversationStore (Legacy Facade)                                  │
│         │                                                               │
│         │ Delegates to                                                   │
│         ▼                                                               │
│   useUnifiedChatStore (Source of Truth)                                 │
│                                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ThreadManager (CHAT-006)                                              │
│         │                                                               │
│         ▼                                                               │
│   useThreadManager (CHAT-005) ──────────► useUnifiedChatStore           │
│         │                                                               │
│         │ NEVER INTEGRATED INTO UI                                       │
│         ▼                                                               │
│   ThreadManager.tsx (335 lines) ─ Exported but never imported           │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Investigation Tasks

### 4.1 Phase 1: Discovery (IN PROGRESS)
- [x] Load master orchestrator
- [x] Load workflow status
- [x] Identify key files (stores, components, hooks)
- [x] Create output directory structure
- [ ] Inventory all chat-related files

### 4.2 Phase 2: Mapping
- [ ] Trace data flow through stores
- [ ] Map all imports/exports
- [ ] Identify cross-dependencies
- [ ] Document feature connectivity

### 4.3 Phase 3: Research
- [ ] Research store synchronization patterns
- [ ] Research component composition strategies
- [ ] Research migration approaches

### 4.4 Phase 4: Synthesis
- [ ] Create resolution proposal
- [ ] Document impact analysis
- [ ] Create implementation roadmap

---

## 5. Key Questions to Answer

1. **Why was ThreadManager never integrated?**
   - [ ] Was it a time/priority issue?
   - [ ] Was there a conscious decision to use ThreadCard instead?
   - [ ] Is ThreadManager feature-complete or incomplete?

2. **What is the actual difference between ThreadCard and ThreadManager?**
   - [ ] ThreadCard = simple list item
   - [ ] ThreadManager = full CRUD UI with create/delete/rename/archive

3. **Should ThreadManager be integrated or deprecated?**
   - [ ] What value does it add over ThreadCard?
   - [ ] What migration effort is required?

4. **What is the long-term store strategy?**
   - [ ] Keep both stores with facade?
   - [ ] Migrate all to UnifiedChatStore?
   - [ ] Deprecate facade immediately?

---

## 6. Tools & Techniques

### 6.1 Code Analysis
- `grep` - Find all imports/exports
- `glob` - Find all relevant files
- `read` - Analyze file contents

### 6.2 Documentation Analysis
- `CHAT-INTEGRATION-VERIFICATION-2026-01-11.md` - Already reviewed
- `AGENTS.md` - Governance context
- `CLAUDE.md` - Development standards

### 6.3 Runtime Analysis
- TypeScript compilation check
- Test coverage analysis
- Import graph visualization

---

## 7. Output Artifacts

| Artifact | Location | Description |
|----------|----------|-------------|
| `phase-1-discovery/file-inventory.md` | This file | Inventory of all relevant files |
| `phase-2-mapping/data-flow-map.md` | Next phase | Data flow and dependencies |
| `phase-3-research/research-reports.md` | Next phase | Research synthesis |
| `phase-4-synthesis/resolution-proposal.md` | Final | Expert proposal |

---

*Generated: 2026-01-11 | BMAD Investigation Framework v1.0*
