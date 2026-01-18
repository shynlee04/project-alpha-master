# Feature Group: Cross-Workspace Features

**Shard ID**: ARCH-SHARD-03-08
**Parent**: ARCH-REMEDIATION-INDEX-2026-01-14
**Focus**: Cross-Workspace Features (Event Bus, Context Sharing, Routing, User Journey)
**Status**: COMPLETE - DEEP ANALYSIS

---

## 1. Cross-Workspace Architecture

### 1.1 Event Bus Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    CROSS-WORKSPACE EVENT BUS                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                 LOCAL EVENT BUS (per workspace)                  │   │
│  │  eventBus.ts - 50+ event types for IDE-specific events        │   │
│  │  - File operations, sync, container, terminal, process       │   │
│  │  - Agent tool calls, retry, import                        │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                   │                                    │
│                    ┌──────────────┼──────────────┐                    │
│                    ▼              ▼              ▼                    │
│            ┌──────────┐  ┌──────────┐  ┌──────────┐                   │
│            │   IDE    │  │  Notes   │  │Knowledge │                   │
│            │ Workspace│  │Workspace │  │Workspace │                   │
│            └──────────┘  └──────────┘  └──────────┘                   │
│                    │              │              │                    │
│                    └──────────────┼──────────────┘                    │
│                                   │                                   │
│                                   ▼                                   │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │              CROSS-WORKSPACE EVENT BUS                       │   │
│  │  cross-workspace-event-bus.ts - Global event sync            │   │
│  │                                                              │   │
│  │  Event Types:                                                 │   │
│  │  - FileChange                                               │   │
│  │  - AgentConfig                                             │   │
│  │  - SyncStatus                                             │   │
│  │  - ProviderConfig                                         │   │
│  │  - ChatState                                            │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.2 User Journey Across Workspaces

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    USER JOURNEY ACROSS WORKSPACES                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  HUB (Default Entry)                                                   │
│       │                                                                │
│       ▼                                                                │
│  ┌─────────────────────────────────────────────────────────────┐        │
│  │              Workspace Selector                            │        │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │        │
│  │  │   IDE    │  │  Notes   │  │Knowledge │  │  Study  │ │        │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘ │        │
│  └────────┼───────────┼───────────┼───────────┼──────────────┘        │
│           │           │           │           │                         │
│           ▼           ▼           ▼           ▼                         │
│  ┌─────────────────────────────────────────────────────────────┐        │
│  │              Unified Context (Persisted)                   │        │
│  │  - Current project                                        │        │
│  │  - User preferences                                     │        │
│  │  - Recent history                                     │        │
│  │  - API keys (vault)                                  │        │
│  └─────────────────────────────────────────────────────────────┘        │
│                                                                          │
│  Cross-Workspace Actions:                                                 │
│  - Open Note from IDE → Switch to Notes workspace                        │
│  - Import to Knowledge from Notes → Stay in Notes or switch              │
│  - Create Quiz from Knowledge → Switch to Study                          │
│  - Copy code to Note → Switch to Notes                                 │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Cross-Workspace Feature Mapping

| Feature | IDE | Notes | Knowledge | Study | Cross-Workspace |
|---------|-----|-------|-----------|--------|----------------|
| **BYOK Vault** | Uses | Uses | Uses | Uses | ✅ Shared |
| **Project Space** | FS+IDB | IDB | IDB | IDB | ✅ Shared |
| **Agent/LLM** | Mode-specific | Mode-specific | Mode-specific | Mode-specific | ⚠️ Mode-based |
| **Chat Flow** | ✅ Uses | ✅ Uses | ✅ Uses | ✅ Uses | ✅ Cross-workspace |
| **File Tree** | ✅ IDE-only | Via import | Via import | Via import | ⚠️ Via RAG |
| **Block Editor** | ❌ | ✅ Notes-only | ❌ | ❌ | ❌ |
| **RAG Search** | Via Knowledge | Via Knowledge | ✅ Knowledge | Via Knowledge | ⚠️ Shared index |
| **Flashcards** | ❌ | ❌ | ❌ | ✅ Study-only | ❌ |
| **Quiz Gen** | ❌ | ❌ | Via Knowledge | ✅ Study | ⚠️ Via Knowledge |
| **WebContainer** | ✅ IDE-only | ❌ | ❌ | ❌ | ❌ |

---

## 3. Cross-Workspace Interactions

### Interaction 1: IDE → Notes (Copy Code)

```
1. User in IDE writes code
2. Selects code → right-click "Copy to Note"
3. Event: IDE_FILE_SELECTED → payload: {filePath, content}
4. Cross-workspace bus broadcasts event
5. Notes workspace receives → opens note → pastes content
6. User continues in Notes workspace
```

### Interaction 2: Notes → Knowledge (Create from Note)

```
1. User in Notes has note
2. Clicks "Add to Knowledge"
3. Event: NOTE_IMPORT_REQUESTED → payload: {noteId, title, content}
4. Cross-workspace bus broadcasts
5. Knowledge workspace receives → creates source entry
6. User switches to Knowledge to see imported content
```

### Interaction 3: Knowledge → Study (Create Quiz)

```
1. User in Knowledge selects sources
2. Clicks "Generate Quiz"
3. Event: QUIZ_GENERATION_REQUESTED → payload: {sourceIds}
4. Cross-workspace bus broadcasts
5. Study workspace receives → generates quiz
6. User switches to Study to take quiz
```

---

## 4. File Change Manifest - Cross-Workspace

### Files to CREATE

| File | description | Lines |
|------|---------|-------|
| `lib/events/cross-workspace/workspace-event-router.ts` | Event routing | 80 |
| `lib/events/cross-workspace/workspace-event-types.ts` | Type definitions | 40 |
| `presentation/hooks/use-cross-workspace-events.ts` | React integration | 60 |

### Files to MODIFY

| File | Change | Lines |
|------|--------|-------|
| `cross-workspace-event-bus.ts` | Add routing logic | +50 |
| `WorkspaceEnhancedSwitcher.tsx` | Add cross-workspace actions | +30 |

---

*Back to [ARCH-INDEX.md](./ARCH-INDEX.md)*
*Next: [shard-03-09 - File Reference Map](./shard-03-09-file-reference-map.md)*
