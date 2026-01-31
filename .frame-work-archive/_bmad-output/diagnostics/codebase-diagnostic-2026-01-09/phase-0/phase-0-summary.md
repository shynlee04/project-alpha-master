# Phase 0 Summary: Codebase Structure

## Key Metrics
| Metric | Value |
|--------|-------|
| **Total TypeScript Files** | 1,579 |
| **React Components (.tsx)** | 517 |
| **Pure TypeScript (.ts)** | 1,055 |
| **God Files (>500 lines)** | 40+ |
| **God Components (>700 lines)** | 15+ |
| **Circular Dependencies Found** | 4 high-risk chains |
| **Hub Files (>25 imports)** | 5 files |
| **Orphan/Backup Files** | 4 files |

## Complexity Hotspots (Top 5)
1. `src/presentation/components/ui` - 51 files (UI component library)
2. `src/lib/knowledge` - 46 files (Knowledge feature logic)
3. `src/presentation/components/agent` - 37 files (Agent configuration)
4. `src/presentation/components/chat` - 36 files (Chat interfaces)
5. `src/hooks` - 34 files (Custom React hooks)

## Risk Assessment

| Risk | Files Affected | Priority |
|------|----------------|----------|
| **God Store: rag-store.ts** (1,595 lines) | RAG pipeline, Knowledge workspace | 🔴 P0 |
| **God Store: dexie-db.ts** (1,152 lines) | All database operations | 🔴 P0 |
| **Circular: Agent ↔ Provider types** | Agent configuration, Provider settings | 🔴 P0 |
| **God Component: NotesPage.tsx** (724 lines) | Notes workspace | 🟡 P1 |
| **God Component: KnowledgePage.tsx** (709 lines) | Knowledge workspace | 🟡 P1 |
| **Event Bus Proliferation** | Cross-workspace communication | 🟡 P1 |
| **God Component: MonacoEditor.tsx** (769 lines) | IDE workspace | 🟡 P1 |
| **Backup files polluting codebase** | note-store.backup.ts, etc. | 🟢 P2 |

## Critical Findings

### 1. State Management Chaos
- **rags-store.ts** at 1,595 lines violates single responsibility
- **conversation-threads-store.ts** at 726 lines needs slice extraction
- Multiple overlapping stores for similar concerns

### 2. Database Layer Bottleneck
- **dexie-db.ts** is a single 1,152-line hub
- 25+ files directly import it
- No facade pattern for database access

### 3. Circular Dependencies
- Agent type ↔ Provider type ↔ Agent store cycle detected
- Hook ↔ Store render loop risk in useChatHistory
- Conversation store ↔ Dexie bidirectional dependency

### 4. Backup Files Contaminating Codebase
- `note-store.backup.ts` (724 lines)
- `workflow-builder-store.backup.ts` (568 lines)
- These should be deleted or moved to .archive

## Recommendations for Phase 1 (User Journeys)

### Focus Areas
1. **Workspace access patterns** - trace `useWorkspaceAccess()` hook for issues
2. **NotesPage.tsx initialization** - what happens on mount?
3. **RAG pipeline triggering** - when does Knowledge workspace load data?
4. **Event bus chains** - what events fire on workspace switch?

### Suspected Bottleneck Components
1. `cross-workspace-event-bus.ts` - Central event hub
2. `workspace-access-helper.tsx` - Complex status logic
3. `dexie-db.ts` - All queries go through single file
4. `useLiveQuery` without default values - potential loops

### Key Code Paths to Trace
```
First-time user:
  __root.tsx → providers → routes/index → /hub → workspace selection
  
Notes workspace:
  /notes → workspace-access-helper.tsx → NotesPage.tsx → BlockNote
  
Knowledge workspace:
  /knowledge → rag-store.ts → orama-index.ts → incremental-indexing
  
IDE workspace:
  /ide → WebContainer boot → MonacoEditor → file-sync
```

---

## Phase 0 Complete ✅

**Next Phase:** Phase 1 - User Journeys (7 sub-agents)
