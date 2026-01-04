# Workspace Architecture Inventory
**Agent**: WORKSPACE SCANNER
**Phase**: INVENTORY
**Timestamp**: 2026-01-04 16:17:00 UTC
**Target**: `src/`
**Focus**: Event bus usage, workspace coupling, component mapping, isolation violations

---

## Executive Summary

**CRITICAL FINDING**: Dual event bus architecture creates fragmentation and potential state synchronization issues.

- **2 Cross-Workspace Event Bus implementations** discovered (different APIs, different locations)
- **6 IDE-only components** marked with `@workspace ide-only` (legitimately using legacy context)
- **101 workspace-specific components** across 4 workspaces
- **127 cross-workspace import violations** detected
- **Workspace provider migration in progress** (NEW store replacing OLD context)

---

## 1. Event Bus Architecture

### 1.1 Two Competing Implementations

#### Implementation A: `src/infrastructure/events/cross-workspace-event-bus.ts`
```typescript
// Lines 23-215
export class CrossWorkspaceEventBus {
  private unsubscribers: Array<() => void> = [];

  initialize(): void {
    this.subscribeProviderEvents();     // OBSOLETE (Ralph Loop Cycle 4)
    this.subscribeAgentEvents();
    this.subscribeWorkspaceEvents();
  }

  emitCrossWorkspace<T>(eventType: string, payload: T, targetWorkspace?: string): void
}

// Singleton
export const crossWorkspaceEventBus = new CrossWorkspaceEventBus();
```

**Events Emitted**:
- `AGENT_CREATED`, `AGENT_CONFIG_UPDATED`, `AGENT_DELETED` (via `eventBus.on`)
- `WORKSPACE_TRANSITION_STARTED`, `WORKSPACE_TRANSITION_COMPLETED`, `WORKSPACE_CHANGED` (via `eventBus.on`)
- Custom events via `emitCrossWorkspace()`

**Subscribers**:
- `useAgentsStore` (agent events)
- `useAgentSelectionStore` (selection sync)
- State orchestrator (workspace transitions)

#### Implementation B: `src/lib/events/cross-workspace-event-bus.ts`
```typescript
// Lines 134-422 (EventEmitter3-based)
class CrossWorkspaceEventBus extends EventEmitter3 {
  private static readonly EVENTS = {
    FILE_CHANGE: 'file:change',
    AGENT_CONFIG_CHANGE: 'agent:config:change',
    SYNC_STATUS: 'sync:status',
    PROJECT_STATE_CHANGE: 'project:state:change',
    WORKSPACE_CHANGED: 'workspace:changed',
    PROVIDER_CONFIG_CHANGE: 'provider:config:change',
    MODELS_UPDATED: 'models:updated',
  } as const;

  // Typed event emitters
  emitFileChange(event: Omit<FileChangeEvent, 'timestamp'>): void
  emitAgentConfigChange(event: Omit<AgentConfigChangeEvent, 'timestamp'>): void
  emitSyncStatus(event: Omit<SyncStatusEvent, 'timestamp'>): void
  emitProjectStateChange(event: Omit<ProjectStateChangeEvent, 'timestamp'>): void
  emitWorkspaceChanged(event: WorkspaceChangeEvent): void
  emitProviderConfigChange(event: Omit<ProviderConfigChangeEvent, 'timestamp'>): void
  emitModelsUpdated(event: Omit<ModelsUpdatedEvent, 'timestamp'>): void
}

// Singleton
export const crossWorkspaceEventBus = new CrossWorkspaceEventBus();
```

**Event Types**:
- `FileChangeEvent` - File CRUD operations
- `AgentConfigChangeEvent` - Agent CRUD operations
- `SyncStatusEvent` - Sync progress/status
- `ProjectStateChangeEvent` - Project open/close/bindings
- `WorkspaceChangeEvent` - Workspace transitions
- `ProviderConfigChangeEvent` - Provider API key/config changes
- `ModelsUpdatedEvent` - Provider model list refresh

### 1.2 Publisher/Subscriber Analysis

**Publishers (Event Emitters)**:
```
[DETECTED ZERO USAGE]
No components found calling crossWorkspaceEventBus.emit*() methods
```

**Subscribers (Event Listeners)**:
```
[DETECTED ZERO USAGE]
No components found calling crossWorkspaceEventBus.on*() methods
```

**CRITICAL ISSUE**: Event bus infrastructure exists but is **unused** in component layer. Events may be emitted at store level but no component-level subscriptions detected.

---

## 2. Workspace Context Architecture

### 2.1 Legacy Workspace Context (DEPRECATED for cross-workspace)

**File**: `src/lib/workspace/WorkspaceContext.tsx` (201 lines)

**Status**: `@deprecated IDE-ONLY CONTEXT`

**Marked IDE-Only Components** (6 total):
```typescript
// @workspace ide-only
- src/presentation/components/ide/MonacoEditor/MonacoEditor.tsx
- src/presentation/components/ide/AgentChatPanel.tsx
- src/presentation/components/ide/FileTree/FileTree.tsx
- src/presentation/components/ide/statusbar/AgentStatusSegment.tsx
- src/presentation/components/layout/IDEHeaderBar.tsx
- src/presentation/components/layout/MobileIDELayout.tsx
```

**Usage Pattern**:
```typescript
import { useWorkspace } from '@/lib/workspace/WorkspaceContext';

function Component() {
  const { projectId, workspaceType } = useWorkspace();
}
```

**Migration Guide** (from file):
```typescript
// BEFORE (OLD - IDE-ONLY)
import { useWorkspace } from '@/lib/workspace/WorkspaceContext';

// AFTER (NEW - Cross-Workspace)
import { useWorkspaceStore } from '@/infrastructure/persistence/stores/workspace';

const projectId = useWorkspaceStore(s => s.projectId);
const workspaceType = useWorkspaceStore(s => s.workspaceType);
```

### 2.2 New Workspace Store (Cross-Workspace)

**File**: `src/infrastructure/persistence/stores/workspace/workspace-provider.tsx` (195 lines)

**Status**: Active, unified cross-workspace provider

**Provider Location**: `src/infrastructure/persistence/stores/workspace/`

**Integration Points** (9 route files):
```typescript
// All workspace routes use NEW provider
- src/routes/ide.tsx
- src/routes/ide.$projectId.tsx
- src/routes/knowledge.lazy.tsx
- src/routes/knowledge.$projectId.lazy.tsx
- src/routes/notes.lazy.tsx
- src/routes/notes.$projectId.lazy.tsx
- src/routes/study.lazy.tsx
- src/routes/study.$projectId.lazy.tsx
```

**Usage Pattern**:
```typescript
import { useWorkspaceStore } from '@/infrastructure/persistence/stores/workspace';

function Component() {
  const projectId = useWorkspaceStore(s => s.projectId);
  const workspaceType = useWorkspaceStore(s => s.workspaceType);
  const setCurrentWorkspace = useWorkspaceStore(s => s.setCurrentWorkspace);
}
```

**Provider Integrations** (5 cornerstone stores):
```typescript
// Lines 48-80 of workspace-provider.tsx
1. LLM Providers (useAppStore)
2. Agent Configuration (useAppStore + useAgentSelectionStore)
3. Conversation/Chat (useConversationStore)
4. Project/Filesystem (workspace-store)
5. RAG Pipeline (useRAGStore)
```

---

## 3. Cross-Workspace Import Violations

### 3.1 Workspace Component Imports

**Detected 127 cross-workspace imports** in `src/presentation/components/`

**Pattern**: Components importing from other workspace directories

**Examples**:
```typescript
// Knowledge workspace importing from IDE (ILLEGAL COUPLING)
src/presentation/components/knowledge/KnowledgePage.tsx:22:
import { SourceCardGrid } from '@/presentation/components/knowledge/SourceCardGrid';

src/presentation/components/knowledge/KnowledgePage.tsx:41:
import { SynthesisDialog } from '@/presentation/components/knowledge/SynthesisDialog';

// Chat importing from IDE workspace
src/presentation/components/chat/UnifiedChatPanel.tsx:17:
import { AgentChatPanel } from '@/presentation/components/ide/AgentChatPanel';

// Hub importing from IDE workspace
src/presentation/components/hub/HubHomePage.tsx:21:
import { BentoGrid } from '@/presentation/components/ide/BentoGrid';
```

**Issue Analysis**:
- ✅ **LEGITIMATE**: Internal workspace imports (knowledge → knowledge)
- ❌ **VIOLATION**: Cross-workspace imports (chat → ide, hub → ide)

### 3.2 Store Import Violations

**Lib Workspace Imports** (37 files):
```typescript
// Components importing from @/lib/workspace (LEGACY)
src/presentation/components/layout/MobileIDELayout.tsx:29:
import { useWorkspace } from '@/lib/workspace';

src/presentation/components/ide/FileTree/FileTree.tsx:54:
import { useFileSyncStatusStore, useWorkspace } from '@/lib/workspace';

src/presentation/components/common/WorkspaceSwitcher.tsx:18:
import { useProjectContext } from '@/lib/workspace/ProjectContext';
```

**Infrastructure Workspace Imports** (9 files):
```typescript
// Routes using NEW provider
src/routes/ide.tsx:15:
import { WorkspaceProvider } from '@/infrastructure/persistence/stores/workspace'

src/routes/knowledge.$projectId.lazy.tsx:22:
import { WorkspaceProvider } from '@/infrastructure/persistence/stores/workspace';
```

**Status**: Hybrid state - some components migrated to NEW store, others still on OLD context

---

## 4. Workspace Component Mapping

### 4.1 Component Counts

| Workspace | Component Count | Test Count | Total |
|-----------|----------------|------------|-------|
| **IDE** | 44 | ? | ~44 |
| **Knowledge** | 33 | 10 | 43 |
| **Notes** | 14 | ? | ~14 |
| **Study** | 11 | ? | ~11 |
| **Chat** | ? | ? | ? |
| **Layout** | 21 | ? | ~21 |
| **Common** | 6 | ? | ~6 |
| **UI (Shared)** | 79 | ? | ~79 |
| **RAG** | ? | ? | ? |
| **Agent** | 20+ | 3 | ~23 |
| **Hub** | ? | 1 | ~10 |
| **Canvas** | ? | 1 | ~2 |
| **Total** | **~371** | **~15** | **~386** |

### 4.2 Workspace-Specific Components

**IDE Workspace** (44 components):
```
src/presentation/components/ide/
├── MonacoEditor/
│   ├── MonacoEditor.tsx (@workspace ide-only)
│   └── EditorTabBar.tsx
├── AgentChatPanel/
│   ├── AgentChatPanel.tsx (@workspace ide-only)
│   ├── AgentChatConversationManager.tsx
│   ├── AgentChatHeader.tsx
│   ├── AgentChatStatus.tsx
│   ├── AgentChatApprovals.tsx
│   ├── AgentChatEnhancingUI.tsx
│   ├── AgentChatAPIKeyManager.tsx
│   └── AgentChatToolFacades.tsx
├── FileTree/
│   ├── FileTree.tsx (@workspace ide-only)
│   ├── FileTreeItem.tsx
│   ├── ContextMenu.tsx
│   └── icons.tsx
├── statusbar/
│   ├── AgentStatusSegment.tsx (@workspace ide-only)
│   ├── WebContainerStatus.tsx
│   ├── SyncStatusSegment.tsx
│   ├── ProviderStatus.tsx
│   ├── CursorPosition.tsx
│   └── FileTypeIndicator.tsx
├── AgentsPanel.tsx
├── BentoCardPreview.tsx
├── BentoGrid.tsx (imported by Hub - VIOLATION)
├── CacheIndicator.tsx
├── CommandPalette.tsx
├── ExplorerPanel.tsx
├── PreviewPanel/
│   └── PreviewPanel.tsx
├── SearchPanel.tsx
├── SettingsPanel.tsx
├── StatusBar.tsx
├── StreamingMessage.tsx
├── XTerminal.tsx
└── ...
```

**Knowledge Workspace** (33 components):
```
src/presentation/components/knowledge/
├── KnowledgePage.tsx
├── SourceContextMenu.tsx
├── SourceCard.tsx
├── SourceCardGrid.tsx
├── SourceMetadataDialog.tsx
├── MetadataEditor.tsx
├── MetadataDisplay.tsx
├── CollectionSelector.tsx
├── CollectionManager.tsx
├── RenameDialog.tsx
├── CreateCollectionDialog.tsx
├── SourceImportDialog.tsx
├── FlashcardPreviewPanel.tsx
├── SourcePreviewPanel.tsx
├── RAGConfigurationPanel.tsx
├── IndexingProgressPanel.tsx
├── QuizPreviewPanel.tsx
├── flashcard-preview.tsx
├── SynthesisDialog.tsx
├── StudyArtifactExportDialog.tsx
├── UndoToast.tsx
└── __tests__/ (10 test files)
```

**Notes Workspace** (14 components):
```
src/presentation/components/notes/
├── NotesPage.tsx
├── NoteSidebar.tsx
├── NoteContextMenu.tsx
├── NoteTree.tsx
├── NoteTreeItem.tsx
├── NoteEditor.tsx
├── NotesIndexingButton.tsx
├── MarkdownExportDialog.tsx
├── MarkdownImportDialog.tsx
├── NotesFilePicker.tsx
├── AITransformMenu.tsx
├── AIPromptDialog.tsx
├── AISlashCommand.tsx
└── NoteStudyMenu.tsx
```

**Study Workspace** (11 components):
```
src/presentation/components/study/
├── StudyPage.tsx
├── QuizContainer.tsx
├── QuizStartScreen.tsx
├── QuizReview.tsx
├── QuizResults.tsx
├── QuizQuestionView.tsx
├── quiz-preview.tsx
├── flashcard.tsx
├── study-session.tsx
├── study-stats.tsx
├── StudyFilePicker.tsx
└── index.ts
```

### 4.3 Shared Components

**Layout** (21 components - cross-workspace):
```
src/presentation/components/layout/
├── IDELayoutMain.tsx
├── MainLayout.tsx
├── MobileIDELayout.tsx (@workspace ide-only)
├── IDEHeaderBar.tsx (@workspace ide-only)
├── MainSidebar.tsx
├── ChatPanelWrapper.tsx
├── IDELayout/
│   ├── index.ts
│   ├── types.ts
│   ├── IDEEditorPanel.tsx
│   ├── IDESidebarPanelComponents.tsx
│   ├── IDESidebarPanels.tsx
│   ├── IDEDiscoveryMechanisms.tsx
│   ├── IDETerminalPanel.tsx
│   └── hooks/
│       ├── useIDEStateRestoration.ts
│       ├── useIDEFileHandlers.ts
│       └── useIDELayoutWorkspaceState.ts
├── PermissionOverlay.tsx
└── TerminalPanel.tsx
```

**Common** (6 components - cross-workspace):
```
src/presentation/components/common/
├── WorkspaceSwitcher.tsx
├── CrossWorkspaceFileReference.tsx
└── ...
```

**UI Primitives** (79 components - cross-workspace):
```
src/presentation/components/ui/
├── button.tsx
├── dialog.tsx
├── input.tsx
├── ...
├── activity-indicators/
│   ├── DatabaseIndexingIndicator.tsx
│   ├── EmbeddingProgressIndicator.tsx
│   ├── ChunkingStatusIndicator.tsx
│   └── SyncStatusIndicator.tsx
└── ...
```

---

## 5. Isolation Concerns

### 5.1 Critical Violations

**Violation 1: Shared Components in Workspace Directories**
```typescript
// BentoGrid in IDE workspace imported by Hub
src/presentation/components/ide/BentoGrid.tsx
src/presentation/components/hub/HubHomePage.tsx:
  import { BentoGrid } from '@/presentation/components/ide/BentoGrid';

// AgentChatPanel in IDE workspace imported by Chat
src/presentation/components/ide/AgentChatPanel.tsx
src/presentation/components/chat/UnifiedChatPanel.tsx:
  import { AgentChatPanel } from '@/presentation/components/ide/AgentChatPanel';
```

**Recommendation**: Move shared components to `src/presentation/components/common/`

**Violation 2: Store Import Fragmentation**
```typescript
// 37 files still using LEGACY context
import { useWorkspace } from '@/lib/workspace/WorkspaceContext';

// 9 route files using NEW store
import { WorkspaceProvider } from '@/infrastructure/persistence/stores/workspace';
```

**Recommendation**: Complete migration to NEW store (see Epic 51-4)

### 5.2 Event Bus Decoupling

**Observation**: Despite having 2 event bus implementations, **ZERO component-level event subscriptions detected**.

**Implications**:
- Workspaces likely communicate via **direct store access** (not events)
- Event buses may be **unused infrastructure**
- Potential **state synchronization bugs** when workspaces modify shared state

**Recommendation**: Audit if event buses are functional or dead code

### 5.3 Workspace Provider Duplication

**2 Providers Active**:
1. `WorkspaceProvider` from `@/lib/workspace/WorkspaceContext` (LEGACY, IDE-only)
2. `WorkspaceProvider` from `@/infrastructure/persistence/stores/workspace` (NEW, cross-workspace)

**Conflict Risk**: Components may consume wrong provider if not imported correctly

**Current Mitigation**: `@workspace ide-only` markers on 6 IDE components

**Recommended Action**: Delete legacy provider after migration complete

---

## 6. Migration Status

### 6.1 Completed Migrations

**Workspace Store** (Epic 51-4 - Platform Unification):
- ✅ NEW provider created at `infrastructure/persistence/stores/workspace/`
- ✅ All 8 workspace routes using NEW provider
- ✅ 6 IDE-only components marked with `@workspace ide-only`
- ✅ Migration guide documented in legacy context file

**Deprecation Warnings**:
- ✅ Legacy `useWorkspace()` hook marked `@deprecated`
- ✅ JSDoc comments warn against using legacy context for new components

### 6.2 Pending Migrations

**Components Still Using Legacy Context** (31 files):
```
High Priority (IDE workspace):
- MobileIDELayout.tsx
- IDEHeaderBar.tsx
- AgentStatusSegment.tsx
- FileTree.tsx
- MonacoEditor.tsx
- AgentChatPanel.tsx

Medium Priority (Cross-workspace):
- WorkspaceSwitcher.tsx (common)
- PermissionOverlay.tsx (layout)
- TerminalPanel.tsx (layout)

Low Priority (Test files):
- __tests__/IDELayout.test.tsx
- __tests__/AgentChatPanel.test.tsx
```

**Estimated Effort**: 2-4 hours to migrate all 31 files to `useWorkspaceStore`

---

## 7. Recommendations

### 7.1 High Priority (Fix Architecture Gaps)

**1. Consolidate Event Bus Implementations**
- **DELETE** `src/lib/events/cross-workspace-event-bus.ts` (EventEmitter3 version)
- **KEEP** `src/infrastructure/events/cross-workspace-event-bus.ts` (domain event version)
- **ADD** component-level subscriptions in workspace pages

**2. Eliminate Cross-Workspace Import Violations**
- **MOVE** `BentoGrid` to `src/presentation/components/common/`
- **MOVE** `AgentChatPanel` to `src/presentation/components/chat/` (or create shared location)
- **AUDIT** remaining 125 cross-workspace imports

**3. Complete Workspace Store Migration**
- **MIGRATE** 31 components from `useWorkspace()` to `useWorkspaceStore()`
- **DELETE** `src/lib/workspace/WorkspaceContext.tsx` after migration complete
- **VERIFY** all workspace isolation tests pass

### 7.2 Medium Priority (Improve Isolation)

**4. Standardize Workspace Boundaries**
- **CREATE** workspace-specific barrel exports (`index.ts` files)
- **ENFORCE** lint rule preventing cross-workspace imports
- **DOCUMENT** shared component conventions

**5. Event Bus Integration**
- **ADD** `useWorkspaceEvents()` hook for component subscriptions
- **EMIT** events on all workspace state changes
- **TEST** cross-workspace state synchronization

### 7.3 Low Priority (Technical Debt)

**6. Remove Dead Code**
- **AUDIT** `src/lib/events/` for unused utilities
- **CLEANUP** deprecated workspace context after migration
- **CONSOLIDATE** duplicate type definitions

**7. Documentation**
- **UPDATE** AGENTS.md with workspace architecture
- **CREATE** workspace isolation testing guide
- **DOCUMENT** event bus usage patterns

---

## 8. Next Steps

**For ARCHITECTURAL ANALYSIS Agent**:
- Use this inventory to identify coupling violations
- Design clean architecture for workspace boundaries
- Plan migration of shared components to common directories

**For WORKSPACE E2E Implementation Agent**:
- Use event bus inventory for cross-workspace state sync
- Implement `useWorkspaceEvents()` hook
- Test workspace isolation with event-driven architecture

**For AGENT CONFIGURATION Consolidation Agent**:
- Audit agent state distribution across workspaces
- Verify agent configuration events propagate correctly
- Test agent selection synchronization

---

## Appendix: File Inventory

### Event Bus Files
```
src/infrastructure/events/cross-workspace-event-bus.ts (230 lines)
src/lib/events/cross-workspace-event-bus.ts (429 lines)
src/infrastructure/events/index.ts
src/lib/events/index.ts
src/lib/events/use-cross-workspace-events.ts
```

### Workspace Context Files
```
src/lib/workspace/WorkspaceContext.tsx (201 lines) - DEPRECATED
src/infrastructure/persistence/stores/workspace/workspace-provider.tsx (195 lines) - ACTIVE
src/infrastructure/persistence/stores/workspace/workspace-context.ts
src/infrastructure/persistence/stores/workspace/index.ts
```

### Store Files
```
src/lib/state/workspace-store.ts
src/infrastructure/persistence/stores/workspace/
├── workspace-provider.tsx
├── workspace-context.ts
├── index.ts
└── (other workspace stores)
```

### Route Files (Migration Status)
```
✅ src/routes/ide.tsx (NEW provider)
✅ src/routes/ide.$projectId.tsx (NEW provider)
✅ src/routes/knowledge.lazy.tsx (NEW provider)
✅ src/routes/knowledge.$projectId.lazy.tsx (NEW provider)
✅ src/routes/notes.lazy.tsx (NEW provider)
✅ src/routes/notes.$projectId.lazy.tsx (NEW provider)
✅ src/routes/study.lazy.tsx (NEW provider)
✅ src/routes/study.$projectId.lazy.tsx (NEW provider)
```

---

**Agent**: WORKSPACE SCANNER
**Phase**: INVENTORY COMPLETE
**Next Phase**: ANALYSIS (awaiting ARCHITECTURAL ANALYSIS agent)
**Timestamp**: 2026-01-04 16:17:00 UTC
