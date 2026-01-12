# COMPLETE STATE & PERSISTENCE INVENTORY

**Generated**: 2026-01-15  
**Purpose**: All-in-one inventory of state management, persistence, and data storage mechanisms  
**Scope**: Everything that holds state or persists data

---

# TABLE OF CONTENTS

1. [Dexie Databases (IndexedDB)](#1-dexie-databases-indexeddb)
2. [Zustand Stores](#2-zustand-stores)
3. [React Context Providers](#3-react-context-providers)
4. [localStorage Usage](#4-localstorage-usage)
5. [Custom Persistence Solutions](#5-custom-persistence-solutions)
6. [Grouping & Recommendations](#6-grouping--recommendations)

---

# 1. DEXIE DATABASES (IndexedDB)

## 1.1 Main Database

| Database | Class | Location | Tables | Purpose |
|----------|-------|----------|--------|---------|
| **ViaGentDatabase** | `dexie-db-class.ts:90` | infrastructure/persistence/ | 25+ tables | Main application database |

### ViaGentDatabase Tables
```
├── projects                           # Project metadata
├── ideState                          # IDE layout/tabs state
├── conversations                    # Chat conversations
├── threads                          # Conversation threads
├── sources                          # Knowledge sources
├── collections                      # Knowledge collections
├── oramaIndexes                     # RAG search indexes
├── syncStatus                       # File sync metadata
├── fileMetadata                     # File metadata cache
├── fsaHandles                       # FSA directory handles
├── sessions                        # Session snapshots
├── toolExecutionLogs               # AI tool execution history
├── flashcards                      # Flashcard data
├── flashcardSets                   # Flashcard sets
├── studySessions                   # Study session data
├── studyCards                      # Study cards with SRS
├── quiz                            # Quiz data
├── quizQuestions                  # Quiz questions
├── providerConfigs                # Provider configurations
├── providerCredentialsEncrypted   # Encrypted API keys
├── &identities                     # WebAuthn identities
├── *sent, *received, *groups, *groupsFroms  # Message indexes
└── ... (more)
```

## 1.2 Secondary Databases (SEPARATE from ViaGentDatabase!)

| Database | Class | Location | Tables | Purpose |
|----------|-------|----------|--------|---------|
| **FlashcardDatabase** | `flashcard-db.ts:42` | stores/flashcard/ | 5+ tables | Flashcard SRS data |
| **StudyDatabase** | `study-database-slice.ts:40` | stores/study/ | 4+ tables | Study session data |
| **QuizDatabase** | `quiz-db.ts:44` | stores/study/quiz/ | 3+ tables | Quiz data |
| **CanvasDatabase** | `canvas-db.ts` | stores/canvas/ | 3+ tables | Canvas data |
| **AudioDatabase** | `audio-storage.ts:44` | lib/audio/ | 2+ tables | Audio metadata |
| **SuggestionTrackerDatabase** | `suggestion-tracker.ts:80` | lib/agent/ | 2+ tables | AI suggestions |
| **ConversationDatabase** | `conversation-memory.ts:45` | lib/agent/ | 2+ tables | Agent memory |
| **UserPreferencesDatabase** | `user-profile.ts:82` | lib/agent/ | 2+ tables | User preferences |
| **QuizHistoryDatabase** | `quiz-history-store.ts:14` | stores/ | 2+ tables | Quiz history |

### ⚠️ CRITICAL: 9 SEPARATE DATABASES!

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    CURRENT STATE - DATABASE CHAOS                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ViaGentDatabase (Main)                                                    │
│  ├── projects                                                             │
│  ├── ideState                                                             │
│  ├── conversations                                                        │
│  ├── ...                                                                  │
│  └───────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  FlashcardDatabase (SEPARATE!)                                             │
│  ├── flashcards                                                           │
│  ├── flashcardSets                                                        │
│  └───────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  StudyDatabase (SEPARATE!)                                                 │
│  ├── studySessions                                                        │
│  ├── studyCards                                                           │
│  └───────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  QuizDatabase (SEPARATE!)                                                  │
│  ├── quiz                                                                 │
│  ├── quizQuestions                                                        │
│  └───────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  CanvasDatabase (SEPARATE!)                                               │
│  ├── ...                                                                  │
│  └───────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  AudioDatabase (SEPARATE!)                                                │
│  ├── ...                                                                  │
│  └───────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  + 4 MORE SEPARATE DATABASES...                                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

# 2. ZUSTAND STORES

## 2.1 Core Application Stores

| Store | File | Persistence | Table/Key | Issue |
|-------|------|-------------|-----------|-------|
| **useAppStore** | use-app-store.ts | Dexie | providerConfigs | ✅ OK |
| **useIDEStore** | ide/useIDEStore.ts | Custom → ideState | projectId key | ✅ OK |
| **useConversationStore** | conversation/useConversationStore.ts | Dexie | conversations | ✅ OK |
| **useProjectStore** | project/useProjectStore.ts | **NONE** | **N/A** | 🔴 CRITICAL |
| **useFileSyncStatusStore** | workspace/ | Dexie | fileSyncStatus | ✅ OK |
| **useEditorTabsStore** | editor-tabs/index.ts | Dexie | **providerConfigs** | ⚠️ WRONG TABLE |

## 2.2 Workspace Stores

| Store | File | Persistence | Workspace Isolated |
|-------|------|-------------|-------------------|
| **use-file-loader-slice.ts** | workspace/slices/ | Runtime + FSA handle | Yes |
| **use-file-ops-slice.ts** | workspace/slices/ | Runtime | Yes |
| **use-storage-adapter-slice.ts** | workspace/slices/ | Runtime | Yes |
| **useWorkspaceState.ts** | workspace/ | Runtime | Yes |
| **useWorkspaceSwitching.ts** | workspace/ | localStorage | Yes |
| **workspace-provider-slice.ts** | workspace/ | localStorage | Yes |
| **unified-workspace-provider.tsx** | workspace/ | React Context | Yes |

## 2.3 IDE Stores

| Store | File | Persistence | Notes |
|-------|------|-------------|-------|
| **useIDEStore.ts** | ide/ | Custom adapter | IDE layout/tabs |
| **ide-project-slice.ts** | ide/ | Custom | Project context |
| **ide-editor-slice.ts** | ide/ | Custom | Editor state |
| **ide-layout-slice.ts** | ide/ | Custom | Layout config |
| **ide-selectors-slice.ts** | ide/ | Custom | UI selectors |
| **ide-explorer-slice.ts** | ide/ | Custom | File explorer |
| **ide-terminal-slice.ts** | ide/ | Custom | Terminal state |
| **terminal-store.ts** | terminal-store.ts | Custom | Terminal |
| **layout-store.ts** | layout-store.ts | **localStorage** | Global layout |

## 2.4 Conversation/Chat Stores

| Store | File | Persistence | Notes |
|-------|------|-------------|-------|
| **useConversationStore.ts** | conversation/ | Dexie | Main store |
| **conversation-store.ts** | conversation/ | Dexie | Legacy facade |
| **unified-chat-store.ts** | chat/ | Dexie | Unified chat |
| **message-crud-slice.ts** | conversation/slices/ | Dexie | Message ops |
| **conversation-events-slice.ts** | conversation/ | Dexie | Events |
| **thread-management-slice.ts** | conversation/ | Dexie | Thread ops |
| **create-message-slice.ts** | conversation/slices/ | Dexie | Message creation |

## 2.5 Knowledge/RAG Stores

| Store | File | Persistence | Notes |
|-------|------|-------------|-------|
| **knowledge-store.ts** | knowledge/ | Custom | Knowledge base |
| **rag-store.ts** | rag/ | Custom | RAG operations |
| **rag-chat-slice.ts** | rag/ | Custom | RAG chat |
| **rag-search-slice.ts** | rag/ | Custom | Search |
| **rag-index-slice.ts** | rag/ | Custom | Indexing |
| **knowledge-synthesis-slice.ts** | knowledge/slices/ | Custom | AI synthesis |

## 2.6 Note Stores

| Store | File | Persistence | Notes |
|-------|------|-------------|-------|
| **note-crud-slice.ts** | notes/slices/ | IndexedDB | CRUD ops |
| **note-sync-slice.ts** | notes/slices/ | IndexedDB | Sync |
| **note-navigation-store.ts** | notes/ | localStorage | Navigation |
| **prompt-history-store.ts** | notes/ | localStorage | AI prompts |
| **prompt-suggestion-store.ts** | notes/ | localStorage | Suggestions |
| **slash-command-store.ts** | notes/ | localStorage | Slash commands |
| **ai-prompt-store.ts** | notes/ | localStorage | AI settings |

## 2.7 Study/Flashcard Stores

| Store | File | Persistence | Database |
|-------|------|-------------|----------|
| **useFlashcardStore** | flashcard/ | Dual | FlashcardDatabase + StudyDatabase |
| **useStudyStore** | study/ | Dual | StudyDatabase |
| **study-store.ts** | study/ | Dexie | Study state |
| **quiz-history-store.ts** | study/ | QuizDatabase | Quiz history |

## 2.8 Agent/AI Stores

| Store | File | Persistence | Notes |
|-------|------|-------------|-------|
| **tool-permission-store.ts** | permissions/ | Custom | Tool permissions |
| **use-app-store.ts** | root | Dexie | Agent config |

## 2.9 Other Stores

| Store | File | Persistence | Notes |
|-------|------|-------------|-------|
| **notification-store.ts** | notifications/ | Dexie | Notifications |
| **statusbar-store.ts** | statusbar-store.ts | Custom | Status bar |
| **analytics-store.ts** | analytics-store.ts | Custom | Analytics |
| **plugins-store.ts** | plugins-store.ts | Custom | Plugins |
| **code-chunk-store.ts** | code-chunk-store.ts | **localStorage** | Code chunks |
| **openai-compatible-store.ts** | openai-compatible-store.ts | Custom | OpenAI compat |
| **prompt-enhancement-store.ts** | prompt-enhancement-store.ts | Custom | Prompt enh. |
| **session-snapshot-manager.ts** | session-snapshot-manager.ts | Dexie | Snapshots |
| **event-status-store.ts** | events/ | Custom | Events |
| **canvas-store.ts** | canvas-store.ts | Custom + localStorage | Canvas |
| **canvas-persistence-slice.ts** | canvas/slices/ | localStorage | Canvas persist |
| **git-operations-slice.ts** | git/ | Custom | Git ops |
| **git-branch-slice.ts** | git/ | Custom | Branches |
| **git-status-slice.ts** | git/ | Custom | Status |
| **git-client-slice.ts** | git/ | Custom | Git client |

---

# 3. REACT CONTEXT PROVIDERS

| Context | File | Purpose |嵌套? |
|---------|------|---------|------|
| **ProjectContext** | lib/workspace/ProjectContext.tsx | Project state | No |
| **WorkspaceContext** | infrastructure/persistence/stores/workspace/workspace-provider-slice.ts | Workspace state | Yes |
| **UnifiedWorkspaceContext** | unified-workspace-provider.tsx | Unified workspace | Yes |
| **SidebarContext** | IconSidebar.tsx | Sidebar state | No |
| **ResizableContext** | ui/resizable.tsx | Resizable panels | No |
| **SelectContext** | ui/select-react19-compatible.tsx | Select component | No |
| **ToastContext** | Toast/ToastContext.tsx | Toast notifications | No |
| **StatusAnnouncerContext** | ui/StatusAnnouncer.tsx | A11y announcements | No |
| **TooltipProvider** | ui/tooltip.tsx | Radix Tooltip | No |

---

# 4. LOCALSTORAGE USAGE

## 4.1 Critical localStorage Keys

| Key | File | Purpose | Should be Dexie? |
|-----|------|---------|-----------------|
| **viagent-sidebar-panel** | IconSidebar.tsx | Sidebar panel | ✅ YES |
| **viagent-sidebar-collapsed** | IconSidebar.tsx | Collapsed state | ✅ YES |
| **mobile-ide-panel** | IDEMobileLayout.tsx | Mobile panel | ✅ YES |
| **command-palette:recent** | command-registry.tsx | Recent commands | ✅ YES |
| **theme** | hooks/use-theme.ts | Theme | ❌ OK (UI only) |
| **ONBOARDING_COMPLETED_KEY** | Onboarding.tsx | Onboarding state | ❌ OK |
| **TEMP_PROJECT_STORAGE_KEY** | temp-project.ts | Temp project | ❌ OK (ephemeral) |
| **LAST_WORKSPACE_KEY_*** | useWorkspaceSwitching.ts | Last workspace | ✅ YES |
| **canvas-active-id** | canvas/slices/ | Active canvas | ✅ YES |
| **trust-levels** | useToolTrustLevels.ts | AI trust levels | ✅ YES |
| **code-chunk-store** | code-chunk-store.ts | **EVERYTHING** | ❌ WRONG! |
| **sync-status-store** | dexie-db-migrations.ts | Legacy sync | 🔄 MIGRATING |
| **'sync-status-store'** | dexie-db-migrations.ts:205 | Legacy | 🔄 MIGRATING |

## 4.2 Files with direct localStorage Access

| File | Lines | Usage |
|------|-------|-------|
| lib/editor/tab-persistence.ts | ~20 | Tab state |
| infrastructure/persistence/dexie-db-migrations.ts | ~10 | Migration flags |
| lib/agent/providers/credential-vault.ts | ~5 | Credentials |
| lib/workspace/temp-project.ts | ~5 | Temp project |
| lib/git/git-credentials.ts | ~5 | Git creds |
| lib/knowledge/graph/graph-persistence.ts | ~3 | Graph data |
| infrastructure/persistence/database-recovery.ts | ~20 | Recovery |
| presentation/components/hub/MobileProjectSelector.tsx | ~3 | Templates |
| lib/command-palette/command-registry.ts | ~3 | Recent commands |
| lib/settings/settings-exporter.ts | ~5 | Settings backup |
| lib/settings/settings-importer.ts | ~5 | Settings restore |
| infrastructure/persistence/stores/canvas/slices/ | ~10 | Canvas state |
| presentation/components/ide/IconSidebar.tsx | ~5 | Sidebar state |
| + 20+ more files with scattered usage |

---

# 5. CUSTOM PERSISTENCE SOLUTIONS

## 5.1 Custom Dexie Storage Adapters

| Adapter | File | Purpose |
|---------|------|---------|
| **createDexieStorage** | dexie-storage.ts | Zustand → Dexie |
| **createJSONStorage** | dexie-storage.ts | JSON wrapper for Dexie |
| **ideStateStorageAdapter** | ide/ide-state-storage.ts | IDE state (custom schema) |

## 5.2 Custom Persistence Functions

| Function | File | Purpose |
|----------|------|---------|
| **persistConversation** | conversation-store.ts | Debounced conversation save |
| **saveIDEState** | ide-state-storage.ts | IDE state with custom schema |
| **hydrateProjects** | useProjectStore.ts | Load projects (NO SAVE!) |
| **backupToLocalStorage** | settings-exporter.ts | Settings backup |
| **restoreFromLocalStorage** | settings-importer.ts | Settings restore |

## 5.3 Non-Persistence State (Runtime Only)

| Store | File | Persistence | Issue |
|-------|------|-------------|-------|
| **useProjectStore** | project/useProjectStore.ts | **NONE** | 🔴 CRITICAL |
| **layout-store.ts** | layout-store.ts | localStorage | Could be Dexie |
| **code-chunk-store.ts** | code-chunk-store.ts | **localStorage** | ❌ WRONG |

---

# 6. GROUPING & RECOMMENDATIONS

## 6.1 Database Consolidation (HIGH PRIORITY)

### Group 1: Merge Into ViaGentDatabase
| Current Database | Tables to Merge | Files to Change |
|-----------------|-----------------|-----------------|
| FlashcardDatabase | flashcards, flashcardSets | flashcard-db.ts, stores |
| StudyDatabase | studySessions, studyCards | study-database-slice.ts |
| QuizDatabase | quiz, quizQuestions | quiz-db.ts |
| CanvasDatabase | canvas_* | canvas-db.ts |

**Files to change**: 15+  
**Risk**: HIGH (data migration required)  
**Effort**: 4-6 hours

### Group 2: Keep Separate (Justify)
| Database | Reason to Keep Separate |
|----------|------------------------|
| AudioDatabase | Rarely accessed, small data |
| UserPreferencesDatabase | User-specific, rarely synced |

## 6.2 Zustand Store Fixes (MEDIUM PRIORITY)

### Group 3: Fix Broken Stores
| Store | Fix | Files |
|-------|-----|-------|
| **useProjectStore** | Add persist middleware | useProjectStore.ts |
| **useEditorTabsStore** | Use dedicated table | editor-tabs/index.ts |

### Group 4: Consolidate localStorage to Dexie
| Current | Should Be | Files |
|---------|-----------|-------|
| code-chunk-store.ts | Dexie 'codeChunks' table | code-chunk-store.ts |
| layout-store.ts | Dexie 'layoutState' table | layout-store.ts |
| canvas-persistence-slice.ts | Dexie 'canvasState' table | canvas-persistence-slice.ts |

## 6.3 localStorage Cleanup (LOW PRIORITY)

### Group 5: Remove or Document
| Key | Current Usage | Recommendation |
|-----|---------------|----------------|
| *50+ scattered keys* | Scattered across 20+ files | Consolidate or document |

## 6.4 Context Consolidation (LOW PRIORITY)

### Group 6: Reduce Context Nesting
| Current | Problem | Recommendation |
|---------|---------|----------------|
| ProjectContext + WorkspaceContext + UnifiedWorkspaceContext | Overlapping concerns | Unify into single WorkspaceContext |

---

# 7. SUMMARY TABLE

| Category | Count | Health |
|----------|-------|--------|
| Dexie Databases | 9 | 🔴 1 main, 8 separate (chaos) |
| Zustand Stores | 50+ | 🟡 48 OK, 2 broken |
| React Contexts | 9 | 🟢 OK |
| localStorage Keys | 50+ | 🟡 30+ should be Dexie |
| Custom Persistence | 5+ | 🟡 OK but complex |

---

# 8. IMMEDIATE ACTIONS

## P0 - Critical (This Week)
1. **Fix useProjectStore persistence** - State lost on reload!
2. **Fix useEditorTabsStore table** - Using wrong table
3. **Complete PS-02/PS-03** - Database consolidation

## P1 - High (This Sprint)
1. Merge FlashcardDatabase → ViaGentDatabase
2. Merge StudyDatabase → ViaGentDatabase  
3. Move code-chunk-store to Dexie
4. Move layout-store to Dexie

## P2 - Medium (Next Sprint)
1. Merge QuizDatabase → ViaGentDatabase
2. Consolidate React Contexts
3. Document all localStorage keys
4. Remove duplicate persistence patterns

---

**END OF INVENTORY**

For questions, refer to specific file paths above.
