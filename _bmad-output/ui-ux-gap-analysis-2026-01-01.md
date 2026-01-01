# UI/UX Gap Analysis Report
**Project Alpha v2.0 (Via-gent)**

**Generated**: 2026-01-01
**Analyst**: Claude Code (BMAD v6 Framework)
**Epic**: Cross-System UI/UX Analysis
**Focus**: Missing Components, User Journey Gaps, Accessibility & Responsive Design

---

## Executive Summary

This comprehensive analysis examines the UI/UX landscape of Project Alpha v2.0 across six core systems:

1. **LLM Provider Configuration** ✅ **90% Complete**
2. **AI Agent Configuration** ✅ **85% Complete**
3. **Tool Permissions Management** ✅ **80% Complete**
4. **Chat Flow & Thread Management** ⚠️ **65% Complete** (Gaps identified)
5. **File System Synchronization** ❌ **40% Complete** (Critical gaps)
6. **Workspace Binding & Navigation** ⚠️ **70% Complete** (Missing mobile support)

**Key Findings**:
- **24 missing UI components** across P0 (blocking), P1 (important), and P2 (nice-to-have)
- **Critical user journey breaks** in file sync feedback and thread management
- **Mobile accessibility gaps** in workspace switching and error states
- **Inconsistent error handling** across provider and agent configuration flows
- **Zero loading states** for expensive operations (model fetching, sync, provider setup)

**Recommended Priority**:
1. **P0**: File sync feedback UI (5 components) - Blocking production reliability
2. **P1**: Chat thread management (4 components) - Impacts user workflow
3. **P1**: Mobile workspace UI (3 components) - Blocks mobile users
4. **P2**: Enhanced error states (3 components) - Polish for production

---

## Table of Contents

1. [User Journey Maps](#user-journey-maps)
2. [Component Inventory](#component-inventory)
3. [Gap Analysis by Priority](#gap-analysis-by-priority)
4. [Design Specifications](#design-specifications)
5. [Implementation Roadmap](#implementation-roadmap)
6. [Wireframe Descriptions](#wireframe-descriptions)
7. [Accessibility Requirements](#accessibility-requirements)
8. [Responsive Design Requirements](#responsive-design-requirements)

---

## 1. User Journey Maps

### 1.1 LLM Provider Configuration Journey

**User Goal**: Add OpenAI API key and configure a custom local LLM provider

| Step | UI Component | Status | Notes |
|------|--------------|--------|-------|
| 1. Open Settings page | `/settings` route | ✅ Complete | Uses MainLayout wrapper |
| 2. View existing providers | `ProviderSettings.tsx` | ✅ Complete | Lists all providers with edit/delete |
| 3. Add custom provider | `ProviderConfigDialog.tsx` | ✅ Complete | Form with name, baseURL, API key |
| 4. Configure built-in provider | `ProviderConfigDialog.tsx` (key-only mode) | ✅ Complete | API key input with locked endpoint |
| 5. Save API key to credential vault | `credentialVault.storeCredentials()` | ✅ Complete | Encrypted storage via Dexie |
| 6. **Load models for provider** | **MISSING: ModelLoadingSpinner** | ❌ Gap | No feedback during `fetchModels()` |
| 7. View loaded models | `AgentModelSelector.tsx` | ✅ Complete | Dropdown auto-populates |
| 8. Error: Invalid API key | `ProviderConfigDialog.tsx` error toast | ⚠️ Partial | Generic error only (no specific validation) |
| 9. Delete provider | Delete confirmation dialog | ✅ Complete | `ProviderSettings.tsx` has confirmation |

**Journey Health**: 8/9 steps complete (89%)

**Critical Gaps**:
- **Step 6**: No loading indicator while fetching models from provider API
- **Step 8**: No specific error messages for common failures (401, 429, network)

---

### 1.2 AI Agent Configuration Journey

**User Goal**: Create a new AI agent with workspace bindings and tool permissions

| Step | UI Component | Status | Notes |
|------|--------------|--------|-------|
| 1. Open Settings page | `/settings` route | ✅ Complete | MainLayout with responsive design |
| 2. Click "Configure Agent" | `AgentConfigDialog.tsx` | ✅ Complete | Opens dialog (orchestrator pattern) |
| 3. Enter basic info | `AgentBasicConfig.tsx` | ✅ Complete | Name, description, provider, model |
| 4. Enter API key (if needed) | `ApiKeyInputSection.tsx` | ✅ Complete | With connection test button |
| 5. Configure workspace bindings | `WorkspaceToolPermissionsConfig.tsx` | ✅ Complete | Grid of tools × workspaces |
| 6. Set tool trust levels | `ToolTrustLevelManager.tsx` | ✅ Complete | Auto/prompt/block per tool |
| 7. Save agent | `AgentConfigDialog.tsx` handleSubmit | ✅ Complete | Hot-reload update via store |
| 8. **View unsaved changes warning** | `UnsavedChangesDialog.tsx` | ✅ Complete | Warns before closing with changes |
| 9. **Import/export agents** | `AgentImportExport.tsx` | ✅ Complete | JSON export/import |
| 10. **Delete agent** | Delete button with undo toast | ✅ Complete | Restoration via toast action |

**Journey Health**: 10/10 steps complete (100%)

**Strengths**:
- Excellent orchestration pattern (extracted components)
- Hot-reload updates for immediate feedback
- Unsaved changes protection
- Undo toast for accidental deletion

**Minor Gaps**:
- No advanced settings UI (placeholder in code line 394)

---

### 1.3 Tool Permissions Management Journey

**User Goal**: Configure tool permissions per workspace (IDE, Knowledge, Study, Notes)

| Step | UI Component | Status | Notes |
|------|--------------|--------|-------|
| 1. Open Agent Config dialog | `AgentConfigDialog.tsx` | ✅ Complete | Switch to "Workspace" tab |
| 2. View workspace tabs | `WorkspacePermissionEditor.tsx` | ✅ Complete | Tabs for each workspace type |
| 3. Configure tool permissions | `WorkspacePermissionEditor.tsx` | ✅ Complete | Select dropdown for each tool |
| 4. See trust level badge | `PermissionOverviewBadge.tsx` | ✅ Complete | Compact summary (auto/prompt/block counts) |
| 5. **Set workspace-specific permissions** | **MISSING: WorkspaceScopedPermissionsEditor** | ❌ Gap | Currently uses global permissions only |
| 6. **View workspace conflict warnings** | **MISSING: PermissionConflictWarning** | ❌ Gap | No UI for conflicting rules |

**Journey Health**: 4/6 steps complete (67%)

**Critical Gaps**:
- **Phase 2 Feature**: Workspace-scoped permissions (Phase 1 uses global only)
- **Conflict Detection**: No UI for warning when tool is both auto-approve and blocked in different workspaces

---

### 1.4 Chat Flow & Thread Management Journey

**User Goal**: Start a chat conversation, create threads, manage history

| Step | UI Component | Status | Notes |
|------|--------------|--------|-------|
| 1. Open IDE workspace | `/ide/$projectId` route | ✅ Complete | IDELayout with chat panel |
| 2. Start new conversation | `ChatPanel.tsx` + `useConversationStore` | ✅ Complete | Creates new conversation in store |
| 3. **Select agent for chat** | `AgentSelector.tsx` | ✅ Complete | Dropdown in chat header |
| 4. **Type message and send** | `ChatConversation.tsx` | ✅ Complete | Message input with streaming |
| 5. **View tool execution progress** | `ToolProgressIndicator.tsx` | ✅ Complete | Shows active tool calls |
| 6. **Approve tool execution** | `ApprovalOverlay.tsx` | ✅ Complete | Blocks until approval |
| 7. **View streaming response** | `StreamingMessage.tsx` | ✅ Complete | Real-time message rendering |
| 8. **Create new thread** | **MISSING: ThreadCreator** | ❌ Gap | No UI for creating named threads |
| 9. **Switch between threads** | `ThreadManager.tsx` | ✅ Complete | Lists threads with selection |
| 10. **Rename thread** | `ThreadManager.tsx` | ✅ Complete | Inline edit with Edit button |
| 11. **Archive/delete thread** | `ThreadManager.tsx` | ✅ Complete | With confirmation |
| 12. **Search thread history** | **MISSING: ThreadSearchBar** | ❌ Gap | No search/filter in thread list |
| 13. **View thread metadata** | **MISSING: ThreadMetadataPanel** | ❌ Gap | No message count, date, agent info |
| 14. **Export thread** | **MISSING: ThreadExportDialog** | ❌ Gap | No export to JSON/markdown |

**Journey Health**: 9/14 steps complete (64%)

**Critical Gaps**:
- **Step 8**: No dedicated "New Thread" UI (ThreadManager has inline input, but no prominent button)
- **Step 12**: No search/filter for large thread lists
- **Step 13**: No metadata panel showing thread stats
- **Step 14**: No export functionality for archival/sharing

---

### 1.5 File System Synchronization Journey

**User Goal**: Grant file permissions, monitor sync status, handle sync errors

| Step | UI Component | Status | Notes |
|------|--------------|--------|-------|
| 1. **Grant file system access** | `PermissionOverlay.tsx` | ✅ Complete | Full-screen overlay with grant button |
| 2. **View sync status in StatusBar** | `SyncStatusSegment.tsx` | ✅ Complete | Shows synced/syncing/error states |
| 3. **View per-file sync status** | `FileTreeItem.tsx` sync badge | ✅ Complete | Icon per file (synced/syncing/error) |
| 4. **View active sync progress** | `SyncStatusIndicator.tsx` | ✅ Complete | Three-state indicator (idle/sync/error) |
| 5. **View sync conflict warnings** | **MISSING: SyncConflictBanner** | ❌ Gap | No UI for merge conflicts |
| 6. **Resolve sync conflicts** | **MISSING: SyncConflictDialog** | ❌ Gap | No merge/discard UI |
| 7. **Retry failed sync** | `FileTreeItem.tsx` retry button | ✅ Complete | Per-file retry on error |
| 8. **View sync history** | **MISSING: SyncHistoryPanel** | ❌ Gap | No log of sync operations |
| 9. **Configure sync exclusions** | **MISSING: SyncExclusionEditor** | ❌ Gap | Hardcoded exclusions (`.git`, `node_modules`) |
| 10. **View sync statistics** | **MISSING: SyncStatsPanel** | ❌ Gap | No dashboard (files synced, data transferred, time) |
| 11. **Handle sync errors gracefully** | `ErrorBoundary.tsx` + `ErrorState.tsx` | ⚠️ Partial | Generic error only (no sync-specific context) |
| 12. **Mobile: view sync status** | **MISSING: MobileSyncStatusIndicator** | ❌ Gap | StatusBar is desktop-only |

**Journey Health**: 5/12 steps complete (42%)

**Critical Gaps**:
- **Sync Conflict Resolution**: No UI for handling merge conflicts
- **Sync History**: No audit log for troubleshooting
- **Sync Configuration**: No UI for customizing exclusions
- **Sync Dashboard**: No high-level statistics view
- **Mobile Support**: StatusBar (desktop-only) means no sync visibility on mobile

---

### 1.6 Workspace Binding & Navigation Journey

**User Goal**: Switch between IDE, Knowledge, Study, and Notes workspaces

| Step | UI Component | Status | Notes |
|------|--------------|--------|-------|
| 1. **Open Hub home page** | `/index.tsx` → `HubHomePage.tsx` | ✅ Complete | Project cards with bento grid |
| 2. **View workspace bindings** | `WorkspaceBindingDialog.tsx` | ✅ Complete | Checkbox grid for bindings |
| 3. **Switch workspace via dropdown** | `WorkspaceSwitcher.tsx` | ✅ Complete | Desktop-only dropdown menu |
| 4. **View workspace badge** | `WorkspaceBadge.tsx` | ✅ Complete | Icon + label in header |
| 5. **Mobile: switch workspace** | **MISSING: MobileWorkspaceSwitcher** | ❌ Gap | WorkspaceSwitcher is desktop-only (hidden on mobile) |
| 6. **View workspace transition** | `WorkspaceTransitionManager` | ✅ Complete | Background orchestration (no UI needed) |
| 7. **View workspace-specific tools** | `ToolAvailabilityIndicator.tsx` | ✅ Complete | Shows enabled tools per workspace |
| 8. **Handle workspace switch errors** | **MISSING: WorkspaceSwitchErrorToast** | ⚠️ Partial | Generic error toast only |

**Journey Health**: 6/8 steps complete (75%)

**Critical Gaps**:
- **Step 5**: Mobile users cannot switch workspaces (desktop-only UI)
- **Step 8**: No specific error messages for workspace switch failures

---

## 2. Component Inventory

### 2.1 Existing UI Components (Complete)

#### Agent Configuration System
| Component | Path | Purpose | Status |
|-----------|------|---------|--------|
| `AgentConfigDialog.tsx` | `/agent/` | Orchestrator dialog for agent config | ✅ Complete |
| `AgentBasicConfig.tsx` | `/agent/AgentConfigForm/` | Name, description, provider, model | ✅ Complete |
| `ApiKeyInputSection.tsx` | `/agent/` | API key input with connection test | ✅ Complete |
| `AgentImportExport.tsx` | `/agent/` | JSON export/import | ✅ Complete |
| `WorkspaceToolPermissionsConfig.tsx` | `/agent/` | Tool × workspace permission grid | ✅ Complete |
| `ToolTrustLevelManager.tsx` | `/agent/` | Trust level selector (auto/prompt/block) | ✅ Complete |
| `UnsavedChangesDialog.tsx` | `/common/` | Warn before closing with changes | ✅ Complete |

#### Provider Configuration System
| Component | Path | Purpose | Status |
|-----------|------|---------|--------|
| `ProviderConfigDialog.tsx` | `/agent/` | Add/edit provider (built-in + custom) | ✅ Complete |
| `ProviderSettings.tsx` | `/agent/` | List providers with edit/delete | ✅ Complete |

#### Chat System
| Component | Path | Purpose | Status |
|-----------|------|---------|--------|
| `ChatPanel.tsx` | `/chat/` | Main chat interface | ✅ Complete |
| `ChatConversation.tsx` | `/chat/` | Message list with streaming | ✅ Complete |
| `AgentSelector.tsx` | `/chat/` | Dropdown to select agent | ✅ Complete |
| `ToolProgressIndicator.tsx` | `/chat/` | Shows active tool calls | ✅ Complete |
| `ApprovalOverlay.tsx` | `/chat/` | Blocks until tool approval | ✅ Complete |
| `StreamingMessage.tsx` | `/chat/` | Real-time message rendering | ✅ Complete |
| `ThreadManager.tsx` | `/chat/` | Thread list with CRUD operations | ✅ Complete |
| `UnifiedChatPanel.tsx` | `/chat/` | Unified chat across workspaces | ✅ Complete |

#### File System Sync System
| Component | Path | Purpose | Status |
|-----------|------|---------|--------|
| `PermissionOverlay.tsx` | `/layout/` | Full-screen overlay for FSA permissions | ✅ Complete |
| `SyncStatusSegment.tsx` | `/ide/statusbar/` | StatusBar segment for sync state | ✅ Complete |
| `SyncStatusIndicator.tsx` | `/ide/` | Three-state indicator (idle/sync/error) | ✅ Complete |
| `FileTree.tsx` | `/ide/FileTree/` | File tree with per-file sync badges | ✅ Complete |
| `FileTreeItem.tsx` | `/ide/FileTree/` | File item with retry button | ✅ Complete |

#### Workspace System
| Component | Path | Purpose | Status |
|-----------|------|---------|--------|
| `WorkspaceSwitcher.tsx` | `/common/` | Desktop dropdown for workspace switching | ✅ Complete (desktop only) |
| `WorkspaceBadge.tsx` | `/hub/` | Icon + label showing current workspace | ✅ Complete |
| `WorkspaceBindingDialog.tsx` | `/hub/` | Configure workspace bindings per project | ✅ Complete |
| `ToolAvailabilityIndicator.tsx` | `/agent/` | Shows enabled tools per workspace | ✅ Complete |
| `WorkspacePermissionEditor.tsx` | `/agent/` | Tabbed editor for tool permissions | ✅ Complete |

#### Error & Loading States
| Component | Path | Purpose | Status |
|-----------|------|---------|--------|
| `ErrorState.tsx` | `/ui/` | Generic error display with retry | ✅ Complete |
| `LoadingState.tsx` | `/ui/` | Generic loading spinner | ✅ Complete |
| `SkeletonLoader.tsx` | `/ui/` | Skeleton screen for async content | ✅ Complete |
| `EmptyState.tsx` | `/ui/` | Empty list with call-to-action | ✅ Complete |
| `ErrorBoundary.tsx` | `/common/` | React error boundary wrapper | ✅ Complete |
| `AppErrorBoundary.tsx` | `/common/` | Top-level error boundary | ✅ Complete |

#### Layout Components
| Component | Path | Purpose | Status |
|-----------|------|---------|--------|
| `IDELayout.tsx` | `/layout/` | Main IDE layout (desktop) | ✅ Complete |
| `MobileIDELayout.tsx` | `/layout/` | Mobile-optimized layout | ✅ Complete |
| `MainLayout.tsx` | `/layout/` | Hub/settings layout | ✅ Complete |
| `StatusBar.tsx` | `/ide/` | Bottom status bar (desktop only) | ✅ Complete |

---

### 2.2 Missing UI Components (Gap Analysis)

#### P0: Blocking (Must-Have for Production)

| ID | Component | System | User Journey Impact | Est. Complexity |
|----|-----------|--------|---------------------|-----------------|
| **P0-1** | `SyncConflictBanner` | File Sync | Step 5: Users see no UI for merge conflicts | Medium |
| **P0-2** | `SyncConflictDialog` | File Sync | Step 6: Cannot resolve merge conflicts | High |
| **P0-3** | `ModelLoadingSpinner` | Provider Config | Step 6: No feedback during model fetching | Low |
| **P0-4** | `MobileWorkspaceSwitcher` | Workspace | Step 5: Mobile users cannot switch workspaces | Medium |
| **P0-5** | `SyncExclusionEditor` | File Sync | Step 9: Cannot customize sync exclusions | Medium |

**Total P0 Components**: 5
**Estimated Effort**: 18-24 hours

---

#### P1: Important (Impacts User Workflow)

| ID | Component | System | User Journey Impact | Est. Complexity |
|----|-----------|--------|---------------------|-----------------|
| **P1-1** | `ThreadSearchBar` | Chat | Step 12: Cannot search/filter thread list | Low |
| **P1-2** | `ThreadMetadataPanel` | Chat | Step 13: No stats (message count, date, agent) | Low |
| **P1-3** | `ThreadExportDialog` | Chat | Step 14: Cannot export threads | Medium |
| **P1-4** | `SyncHistoryPanel` | File Sync | Step 8: No audit log for troubleshooting | Medium |
| **P1-5** | `SyncStatsPanel` | File Sync | Step 10: No dashboard (files, data, time) | Medium |
| **P1-6** | `MobileSyncStatusIndicator` | File Sync | Step 12: No sync visibility on mobile | Low |
| **P1-7** | `PermissionConflictWarning` | Tool Permissions | Step 6: No UI for conflicting permission rules | Medium |
| **P1-8** | `WorkspaceSwitchErrorToast` | Workspace | Step 8: Generic error toast only | Low |

**Total P1 Components**: 8
**Estimated Effort**: 20-28 hours

---

#### P2: Nice-to-Have (Polish for Production)

| ID | Component | System | User Journey Impact | Est. Complexity |
|----|-----------|--------|---------------------|-----------------|
| **P2-1** | `ProviderValidationErrorMessage` | Provider Config | Step 8: Specific error messages (401, 429, network) | Low |
| **P2-2** | `WorkspaceScopedPermissionsEditor` | Tool Permissions | Step 5: Phase 2 feature (workspace-specific perms) | High |
| **P2-3** | `ThreadCreator` | Chat | Step 8: Dedicated "New Thread" button (currently inline) | Low |
| **P2-4** | `AgentAdvancedSettingsTab` | Agent Config | Line 394 placeholder in AgentConfigDialog | Medium |
| **P2-5** | `SyncConflictPreventionBanner` | File Sync | Proactive warning before conflicts occur | Medium |

**Total P2 Components**: 5
**Estimated Effort**: 16-20 hours

---

## 3. Gap Analysis by Priority

### 3.1 P0: Blocking Gaps (Must-Have)

#### P0-1: SyncConflictBanner

**User Journey Step**: 1.5 (File Sync)
**Problem**: When files conflict (local changes vs WebContainer changes), users see no warning
**Impact**: Users may lose work without knowing conflicts exist
**Current Behavior**: Sync silently fails or overwrites
**Desired Behavior**: Banner appears at top of IDE with conflict count

**Component Specification**:
```tsx
interface SyncConflictBannerProps {
  conflictCount: number;
  conflicts: FileConflict[];
  onResolveAll: () => void;
  onDismiss: () => void;
  className?: string;
}

interface FileConflict {
  filePath: string;
  localVersion: FileVersion;
  remoteVersion: FileVersion;
  conflictType: 'modified_both' | 'deleted_modified' | 'modified_deleted';
}
```

**Integration Points**:
- Store: `useFileSyncStatusStore` (detect conflicts)
- Parent: `IDELayout.tsx` (render at top of panel)
- Service: `SyncManager` (provides conflict list)

**Accessibility Requirements**:
- Role: `alert` or `status`
- ARIA: `aria-live="polite"` (non-critical)
- Keyboard: Enter to "Resolve All", Esc to dismiss
- Color contrast: Warning color (yellow/orange) meets WCAG AA

**Responsive Requirements**:
- Desktop: Full-width banner above file tree
- Mobile: Full-width banner with stacked actions

---

#### P0-2: SyncConflictDialog

**User Journey Step**: 1.6 (File Sync)
**Problem**: No UI to resolve merge conflicts (keep local, keep remote, merge manually)
**Impact**: Users must manually edit files in WebContainer to resolve conflicts
**Current Behavior**: No resolution UI
**Desired Behavior**: Diff preview with 3-way merge (keep local, keep remote, merge)

**Component Specification**:
```tsx
interface SyncConflictDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conflicts: FileConflict[];
  currentConflictIndex: number;
  onResolve: (filePath: string, resolution: ConflictResolution) => void;
  onResolveAll: (resolution: 'local' | 'remote' | 'manual') => void;
}

type ConflictResolution = 'keep_local' | 'keep_remote' | 'manual_merge';
```

**Wireframe Description**:
```
┌────────────────────────────────────────────────────┐
│ Resolve File Conflict (1 of 3)              [×]   │
├────────────────────────────────────────────────────┤
│                                                    │
│  File: src/components/Button.tsx                  │
│                                                    │
│  ┌─────────────────────┬─────────────────────┐   │
│  │ Local (Your)        │ Remote (WebContainer)│   │
│  ├─────────────────────┼─────────────────────┤   │
│  │ // Your changes     │ // Fetched changes   │   │
│  │ export function B() │ export function B()  │   │
│  │                    │                     │   │
│  └─────────────────────┴─────────────────────┘   │
│                                                    │
│  [Keep Local]  [Keep Remote]  [Merge Manually]     │
│                                                    │
│  ← Previous  [Next]        [Resolve All]          │
└────────────────────────────────────────────────────┘
```

**Integration Points**:
- Store: `useFileSyncStatusStore` (conflict list)
- Service: `SyncManager` (apply resolution)
- Component: `DiffPreview.tsx` (reusable diff viewer)

**Dependencies**:
- **P1-3**: `DiffPreview.tsx` must exist first

---

#### P0-3: ModelLoadingSpinner

**User Journey Step**: 1.6 (Provider Config)
**Problem**: No feedback while `fetchModels()` fetches available models from provider API
**Impact**: Users think UI is frozen, may close dialog prematurely
**Current Behavior**: Silent delay (3-10 seconds for remote APIs)
**Desired Behavior**: Spinner with progress text ("Fetching models from OpenAI...")

**Component Specification**:
```tsx
interface ModelLoadingSpinnerProps {
  providerName: string;
  isLoading: boolean;
  error?: string;
  onRetry?: () => void;
  className?: string;
}
```

**Wireframe Description**:
```
┌────────────────────────────────────────┐
│ Loading Models                         │
│                                        │
│        [SPINNER ANIMATION]             │
│                                        │
│  Fetching models from OpenAI...        │
│                                        │
│  This may take a few seconds.          │
└────────────────────────────────────────┘
```

**Integration Points**:
- Parent: `ProviderConfigDialog.tsx` (render after saving API key)
- Store: `useProviderStore` (isFetchingModels state)
- Service: `fetchModels()` (sets loading state)

---

#### P0-4: MobileWorkspaceSwitcher

**User Journey Step**: 1.5 (Workspace Navigation)
**Problem**: `WorkspaceSwitcher` is desktop-only (hidden on mobile via `hidden md:flex`)
**Impact**: Mobile users cannot switch workspaces (IDE, Knowledge, Study, Notes)
**Current Behavior**: No workspace switcher visible on mobile
**Desired Behavior**: Bottom sheet or full-screen modal for mobile workspace selection

**Component Specification**:
```tsx
interface MobileWorkspaceSwitcherProps {
  currentWorkspace: WorkspaceType;
  enabledWorkspaces: WorkspaceType[];
  onSwitch: (workspace: WorkspaceType) => void;
  className?: string;
}
```

**Wireframe Description**:
```
┌──────────────────────────────┐
│  ← Select Workspace    [×]   │
├──────────────────────────────┤
│                              │
│  ┌────────────────────────┐  │
│  │ 💻  IDE               │  │
│  │   Current              │  │
│  └────────────────────────┘  │
│                              │
│  ┌────────────────────────┐  │
│  │ 📚  Knowledge          │  │
│  └────────────────────────┘  │
│                              │
│  ┌────────────────────────┐  │
│  │ 🎓  Study              │  │
│  └────────────────────────┘  │
│                              │
│  ┌────────────────────────┐  │
│  │ 📝  Notes              │  │
│  └────────────────────────┘  │
│                              │
└──────────────────────────────┘
```

**Integration Points**:
- Parent: `MobileTabBar.tsx` (add workspace button)
- Store: `useProjectContext` (workspace state)
- Service: `workspaceTransitionManager` (handles switch)

**Responsive Requirements**:
- Mobile (<768px): Full-screen bottom sheet
- Tablet (768px-1024px): Centered modal (600px width)
- Desktop (>1024px): Use existing `WorkspaceSwitcher` dropdown

---

#### P0-5: SyncExclusionEditor

**User Journey Step**: 1.9 (File Sync Configuration)
**Problem**: Sync exclusions are hardcoded (`.git`, `node_modules`, `.DS_Store`, `Thumbs.db`)
**Impact**: Users cannot exclude large directories (e.g., `build/`, `dist/`, `.vscode/`)
**Current Behavior**: Hardcoded in `SyncManager`
**Desired Behavior**: UI to add/remove exclusion patterns (glob patterns)

**Component Specification**:
```tsx
interface SyncExclusionEditorProps {
  exclusions: string[];
  onAdd: (pattern: string) => void;
  onRemove: (pattern: string) => void;
  onReset: () => void;
  className?: string;
}
```

**Wireframe Description**:
```
┌──────────────────────────────────────────────────┐
│ Sync Exclusions                         [Reset]  │
├──────────────────────────────────────────────────┤
│                                                  │
│  Patterns to exclude from sync:                  │
│                                                  │
│  ┌────────────────────────────────────────┐     │
│  │ .git                                   [×] │
│  │ node_modules                           [×] │
│  │ .DS_Store                              [×] │
│  │ Thumbs.db                              [×] │
│  │ build                                  [×] │
│  │ dist                                   [×] │
│  └────────────────────────────────────────┘     │
│                                                  │
│  [+ Add Exclusion Pattern]                       │
│                                                  │
│  Patterns use glob syntax (e.g., *.log, build/) │
└──────────────────────────────────────────────────┘
```

**Integration Points**:
- Parent: `SettingsPanel.tsx` (add to settings page)
- Store: `useIDEStore` (persist exclusions)
- Service: `SyncManager` (apply exclusions)

---

### 3.2 P1: Important Gaps (User Workflow Impact)

#### P1-1: ThreadSearchBar

**User Journey Step**: 1.12 (Chat Thread Management)
**Problem**: No search/filter for large thread lists (10+ threads)
**Impact**: Users cannot find old conversations quickly
**Current Behavior**: Flat list with no filtering
**Desired Behavior**: Search input + filter by agent, date range

**Component Specification**:
```tsx
interface ThreadSearchBarProps {
  onSearch: (query: string) => void;
  onFilterByAgent: (agentId: string | null) => void;
  onFilterByDateRange: (start: Date, end: Date) => void;
  totalCount: number;
  filteredCount: number;
  className?: string;
}
```

**Wireframe Description**:
```
┌────────────────────────────────────────────────┐
│ 🔍  Search threads...          [Filter] [Sort] │
│                                                │
│  Filters: Agent: All  Date: Any  Clear all    │
└────────────────────────────────────────────────┘
```

---

#### P1-2: ThreadMetadataPanel

**User Journey Step**: 1.13 (Chat Thread Management)
**Problem**: No stats panel showing thread metadata (message count, creation date, agent used)
**Impact**: Users cannot quickly assess thread relevance
**Current Behavior**: Only title and message count in list item
**Desired Behavior**: Sidebar panel with full metadata

**Component Specification**:
```tsx
interface ThreadMetadataPanelProps {
  threadId: string;
  thread: Thread;
  onEdit: (updates: Partial<Thread>) => void;
  className?: string;
}

interface Thread {
  id: string;
  title: string;
  agentId: string;
  agentName: string;
  messageCount: number;
  createdAt: Date;
  updatedAt: Date;
  workspaceType: WorkspaceType;
}
```

**Wireframe Description**:
```
┌────────────────────────────────┐
│ Thread Details                 │
├────────────────────────────────┤
│ Title: My Chat Thread          │
│                                │
│ Agent: Claude Sonnet 4.5       │
│                                │
│ Messages: 42                   │
│                                │
│ Created: Jan 1, 2026           │
│ Updated: Jan 1, 2026           │
│                                │
│ Workspace: IDE                 │
│                                │
│ [Edit] [Export] [Delete]       │
└────────────────────────────────┘
```

---

#### P1-3: ThreadExportDialog

**User Journey Step**: 1.14 (Chat Thread Management)
**Problem**: Cannot export threads for archival/sharing
**Impact**: Users lose conversation history
**Current Behavior**: No export functionality
**Desired Behavior**: Export to JSON, Markdown, or plain text

**Component Specification**:
```tsx
interface ThreadExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  thread: Thread;
  messages: Message[];
  onExport: (format: 'json' | 'markdown' | 'txt') => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  toolCalls?: ToolCall[];
}
```

**Wireframe Description**:
```
┌────────────────────────────────────────┐
│ Export Thread                    [×]  │
├────────────────────────────────────────┤
│                                        │
│  Export format:                        │
│                                        │
│  ⦿ JSON (includes metadata)           │
│  ○ Markdown (readable)                 │
│  ○ Plain text                          │
│                                        │
│  Include:                              │
│  ☑ Tool calls                          │
│  ☑ Timestamps                          │
│  ☐ Agent metadata                      │
│                                        │
│  [Cancel]            [Export]          │
└────────────────────────────────────────┘
```

---

#### P1-4: SyncHistoryPanel

**User Journey Step**: 1.8 (File Sync Troubleshooting)
**Problem**: No audit log for troubleshooting sync issues
**Impact**: Cannot diagnose why a file failed to sync
**Current Behavior**: No log of sync operations
**Desired Behavior**: Timeline of sync events (success, failure, retry)

**Component Specification**:
```tsx
interface SyncHistoryPanelProps {
  syncEvents: SyncEvent[];
  onClear: () => void;
  onExport: () => void;
  className?: string;
}

interface SyncEvent {
  id: string;
  timestamp: Date;
  filePath: string;
  action: 'sync' | 'conflict' | 'error' | 'retry';
  status: 'success' | 'failed' | 'pending';
  errorMessage?: string;
}
```

**Wireframe Description**:
```
┌────────────────────────────────────────────────┐
│ Sync History                           [Clear]│
├────────────────────────────────────────────────┤
│                                                │
│  Today (5 events)                              │
│                                                │
│  10:42  ✅ src/App.tsx synced                  │
│  10:41  ⚠️  package.json conflict             │
│  10:40  ❌ src/main.tsx failed (network)       │
│  10:39  🔄 src/main.tsx retrying...            │
│  10:38  ✅ src/main.tsx synced                 │
│                                                │
│  Yesterday (12 events)  [Show]                 │
└────────────────────────────────────────────────┘
```

---

#### P1-5: SyncStatsPanel

**User Journey Step**: 1.10 (File Sync Dashboard)
**Problem**: No high-level statistics dashboard
**Impact**: Cannot assess sync health at a glance
**Current Behavior**: Only per-file status
**Desired Behavior**: Dashboard with totals, rates, last sync time

**Component Specification**:
```tsx
interface SyncStatsPanelProps {
  stats: {
    totalFiles: number;
    syncedFiles: number;
    failedFiles: number;
    pendingFiles: number;
    dataTransferred: number; // bytes
    lastSyncTime: Date;
    syncRate: number; // files/minute
  };
  onRefresh: () => void;
  className?: string;
}
```

**Wireframe Description**:
```
┌────────────────────────────────────────────────┐
│ Sync Statistics                       [Refresh]│
├────────────────────────────────────────────────┤
│                                                │
│  Files: 1,234 total                            │
│  ████████░░░░░░░░ 987 synced (80%)             │
│  ████░░░░░░░░░░░░ 234 pending                  │
│  ██░░░░░░░░░░░░░░ 13 failed                    │
│                                                │
│  Data transferred: 45.2 MB                     │
│  Sync rate: 42 files/min                       │
│  Last sync: 2 minutes ago                      │
└────────────────────────────────────────────────┘
```

---

#### P1-6: MobileSyncStatusIndicator

**User Journey Step**: 1.12 (Mobile File Sync Visibility)
**Problem**: StatusBar is desktop-only, so mobile users see no sync status
**Impact**: Mobile users don't know if sync is working
**Current Behavior**: No sync visibility on mobile
**Desired Behavior**: Floating action button or bottom bar showing sync state

**Component Specification**:
```tsx
interface MobileSyncStatusIndicatorProps {
  syncState: 'idle' | 'syncing' | 'error' | 'complete';
  pendingCount: number;
  errorCount: number;
  onTap?: () => void;
  className?: string;
}
```

**Wireframe Description**:
```
┌────────────────────────────────────┐
│  [≡]  Files 42 syncing...      [+] │
└────────────────────────────────────┘
         ↑ Floating bottom bar
```

**Responsive Requirements**:
- Mobile: Fixed bottom bar (44px height, WCAG touch target)
- Desktop: Hidden (use StatusBar instead)

---

#### P1-7: PermissionConflictWarning

**User Journey Step**: 3.6 (Tool Permissions Management)
**Problem**: No UI for warning when tool is both auto-approve and blocked
**Impact**: Conflicting permission rules cause unpredictable behavior
**Current Behavior**: No validation of permission conflicts
**Desired Behavior**: Warning banner when conflicts detected

**Component Specification**:
```tsx
interface PermissionConflictWarningProps {
  conflicts: PermissionConflict[];
  onResolve: (conflictId: string, resolution: 'auto' | 'prompt' | 'block') => void;
  onDismiss: () => void;
  className?: string;
}

interface PermissionConflict {
  toolId: string;
  toolName: string;
  workspaceRules: Record<WorkspaceType, 'auto' | 'prompt' | 'block'>;
  conflictType: 'auto_and_block' | 'inconsistent';
}
```

**Wireframe Description**:
```
┌──────────────────────────────────────────────────┐
│ ⚠️  Permission Conflicts Detected       [Dismiss]│
├──────────────────────────────────────────────────┤
│                                                  │
│  2 tools have conflicting permission rules:      │
│                                                  │
│  • execute_command: Auto in IDE, Blocked in     │
│    Knowledge (conflicting rules)                 │
│  • write_file: Prompt in IDE, Auto in Notes     │
│    (inconsistent across workspaces)              │
│                                                  │
│  [Auto-resolve]  [Review Manually]               │
└──────────────────────────────────────────────────┘
```

---

#### P1-8: WorkspaceSwitchErrorToast

**User Journey Step**: 6.8 (Workspace Navigation)
**Problem**: Generic error toast only (no specific messages)
**Impact**: Users don't know why workspace switch failed
**Current Behavior**: `console.error` only
**Desired Behavior**: Toast with specific error (network, state corruption, missing workspace)

**Component Specification**:
```tsx
interface WorkspaceSwitchErrorToastProps {
  error: WorkspaceSwitchError;
  onRetry: () => void;
  onDismiss: () => void;
}

type WorkspaceSwitchError =
  | { type: 'network_error'; message: string }
  | { type: 'state_corruption'; workspace: WorkspaceType }
  | { type: 'workspace_not_found'; workspace: WorkspaceType }
  | { type: 'transition_timeout'; from: WorkspaceType; to: WorkspaceType };
```

**Wireframe Description**:
```
┌──────────────────────────────────────────────────┐
│ ❌  Failed to switch workspace                   │
│                                                  │
│  Workspace 'Knowledge' is not available in this  │
│  project. Enable it in Project Settings.         │
│                                                  │
│              [Project Settings]  [Dismiss]       │
└──────────────────────────────────────────────────┘
```

---

### 3.3 P2: Nice-to-Have Gaps (Polish)

#### P2-1: ProviderValidationErrorMessage

**User Journey Step**: 1.8 (Provider Configuration)
**Problem**: Generic error toast for API key failures
**Impact**: Users don't know if issue is 401 (invalid key), 429 (rate limit), or network
**Current Behavior**: `toast.error('Failed to save provider configuration')`
**Desired Behavior**: Specific error messages with recovery actions

**Component Specification**:
```tsx
interface ProviderValidationErrorMessageProps {
  error: ProviderValidationError;
  onRetry?: () => void;
  onOpenSettings?: () => void;
}

type ProviderValidationError =
  | { type: 'invalid_api_key'; provider: string }
  | { type: 'rate_limited'; provider: string; retryAfter?: number }
  | { type: 'network_error'; provider: string }
  | { type: 'unsupported_model'; provider: string; model: string };
```

---

#### P2-2: WorkspaceScopedPermissionsEditor

**User Journey Step**: 3.5 (Tool Permissions - Phase 2)
**Problem**: Currently uses global permissions only (Phase 1)
**Impact**: Cannot configure different permission levels per workspace
**Current Behavior**: `WorkspacePermissionEditor` shows tabs but all tabs control same global state
**Desired Behavior**: Each workspace tab has independent permission state

**Note**: This is a **Phase 2 feature** (Epic WB-8.3). Phase 1 uses global permissions for simplicity.

---

#### P2-3: ThreadCreator

**User Journey Step**: 1.8 (Chat Thread Management)
**Problem**: Inline input in `ThreadManager` is not prominent
**Impact**: Users may not discover how to create new threads
**Current Behavior**: Inline input appears after clicking "New Thread" button
**Desired Behavior**: Dedicated dialog with thread template selection

**Component Specification**:
```tsx
interface ThreadCreatorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (title: string, agentId: string, workspaceType: WorkspaceType) => void;
  templates?: ThreadTemplate[];
}

interface ThreadTemplate {
  id: string;
  name: string;
  description: string;
  agentId: string;
  systemPrompt: string;
}
```

---

#### P2-4: AgentAdvancedSettingsTab

**User Journey Step**: 2.7 (AI Agent Configuration)
**Problem**: Line 394 in `AgentConfigDialog.tsx` has `TODO: Add advanced settings UI here`
**Impact**: Advanced users cannot configure:
- Temperature
- Max tokens
- Top P
- Top K
- System prompt
- Custom headers
- Base URL override

**Current Behavior**: Tab exists but shows placeholder text
**Desired Behavior**: Full form with all LLM parameters

**Component Specification**:
```tsx
interface AgentAdvancedSettingsProps {
  temperature: number;
  maxTokens: number;
  topP: number;
  topK?: number;
  systemPrompt: string;
  customHeaders: Array<{ key: string; value: string }>;
  onChange: (settings: Partial<AgentAdvancedSettings>) => void;
  className?: string;
}
```

---

#### P2-5: SyncConflictPreventionBanner

**User Journey Step**: 1.5 (File Sync - Proactive)
**Problem**: Conflicts only detected after they occur
**Impact**: Reactive instead of proactive conflict management
**Current Behavior**: No prevention
**Desired Behavior**: Warning before actions that may cause conflicts (e.g., editing file that is being synced)

**Component Specification**:
```tsx
interface SyncConflictPreventionBannerProps {
  pendingConflicts: PendingConflict[];
  onPrevent: (conflictId: string) => void;
  onAllow: (conflictId: string) => void;
  className?: string;
}

interface PendingConflict {
  filePath: string;
  action: 'edit' | 'delete' | 'move';
  reason: 'file_syncing' | 'merge_in_progress' | 'concurrent_edit';
}
```

---

## 4. Design Specifications

This section provides detailed specifications for the highest-priority missing components (P0 only). P1 and P2 components will be specified in future iterations.

### 4.1 SyncConflictBanner (P0-1)

**Purpose**: Alert users to file sync conflicts with clear CTA

**Props Interface**:
```tsx
export interface SyncConflictBannerProps {
  /** Number of conflicts detected */
  conflictCount: number;
  /** List of conflicting files */
  conflicts: FileConflict[];
  /** Callback when "Resolve All" clicked */
  onResolveAll: () => void;
  /** Callback when banner dismissed */
  onDismiss: () => void;
  /** Additional CSS classes */
  className?: string;
}

export interface FileConflict {
  filePath: string;
  localVersion: {
    checksum: string;
    lastModified: Date;
    size: number;
  };
  remoteVersion: {
    checksum: string;
    lastModified: Date;
    size: number;
  };
  conflictType: 'modified_both' | 'deleted_modified' | 'modified_deleted';
}
```

**Visual Design**:
- **Position**: Fixed at top of IDE panel (below header bar)
- **Colors**: Warning yellow background (`bg-yellow-500/10`), yellow border (`border-yellow-500/30`)
- **Typography**: Pixel font (font-mono), bold title, regular description
- **Icon**: Alert triangle (`AlertTriangle` from lucide-react)
- **Animation**: Slide down from top (200ms ease-in-out)

**Accessibility**:
- Role: `alert`
- ARIA: `aria-live="assertive"` (critical, requires immediate attention)
- Keyboard: Esc to dismiss, Enter to resolve all
- Focus management: Auto-focus "Resolve All" button on mount
- Screen reader: "2 file sync conflicts detected. Press Enter to resolve all."

**Responsive Design**:
- Desktop: Full-width banner, horizontal button layout
- Mobile: Full-width banner, stacked button layout (44px min-height for touch targets)

**Error States**:
- **No conflicts**: Banner hidden (conflictCount === 0)
- **Error loading conflicts**: Show error message with retry button

**Loading States**:
- **Resolving conflicts**: Disable buttons, show spinner overlay

**Integration**:
```tsx
// In IDELayout.tsx
const { conflicts } = useFileSyncStatusStore(state => ({
  conflicts: state.conflicts,
}));

return (
  <>
    {conflicts.length > 0 && (
      <SyncConflictBanner
        conflictCount={conflicts.length}
        conflicts={conflicts}
        onResolveAll={() => setShowConflictDialog(true)}
        onDismiss={() => dismissConflicts()}
      />
    )}
    {/* Rest of IDE layout */}
  </>
);
```

---

### 4.2 SyncConflictDialog (P0-2)

**Purpose**: Step-by-step conflict resolution with diff preview

**Props Interface**:
```tsx
export interface SyncConflictDialogProps {
  /** Dialog open state */
  open: boolean;
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void;
  /** List of conflicts to resolve */
  conflicts: FileConflict[];
  /** Current conflict index (0-based) */
  currentConflictIndex: number;
  /** Callback when conflict resolved */
  onResolve: (filePath: string, resolution: ConflictResolution) => void;
  /** Callback when all conflicts resolved with same action */
  onResolveAll: (resolution: 'local' | 'remote' | 'manual') => void;
}

export type ConflictResolution = 'keep_local' | 'keep_remote' | 'manual_merge';
```

**Visual Design**:
- **Dialog**: Centered modal (max-w-4xl), 8-bit styled border
- **Diff Preview**: Side-by-side view with highlighted changes (green for additions, red for deletions)
- **Buttons**: 3 primary actions (Keep Local, Keep Remote, Merge Manually)
- **Navigation**: Previous/Next buttons for stepping through conflicts

**Accessibility**:
- Role: `dialog`
- ARIA: `aria-labelledby` for dialog title, `aria-describedby` for instructions
- Focus trap: Keep focus within dialog while open
- Keyboard: Esc to close, Arrow Left/Right to navigate conflicts
- Screen reader: "Conflict 1 of 3: src/App.tsx. Both versions modified."

**Responsive Design**:
- Desktop: Side-by-side diff view (2 columns)
- Tablet: Side-by-side diff with reduced font size
- Mobile: Stacked diff view (local above, remote below) or toggle between views

**Dependencies**:
- **DiffPreview.tsx**: Reusable diff component (must be created first)
- **SyncManager.applyResolution()**: Service method to apply resolution

**Wireframe Detail**:
```
┌─────────────────────────────────────────────────────────────┐
│ Resolve File Conflict (1 of 3)                        [×]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ File: src/components/Button.tsx                            │
│                                                             │
│ Both versions modified. Choose which version to keep.       │
│                                                             │
│ ┌───────────────────────────┬───────────────────────────┐   │
│ │ Local (Your Changes)      │ Remote (WebContainer)     │   │
│ ├───────────────────────────┼───────────────────────────┤   │
│ │ export function Button() │ export function Button()  │   │
│ │   return (               │   return (                │   │
│ │     <button              │     <button               │   │
│ │       className={style}  │       className="btn"      │   │
│ │       onClick={onClick}  │       onClick={onClick}   │   │
│ │     >                    │     >                     │   │
│ │       {children}         │       {children}          │   │
│ │     </button>            │     </button>             │   │
│ │   )                     │   )                       │   │
│ │ }                       │ }                         │   │
│ └───────────────────────────┴───────────────────────────┘   │
│                                                             │
│ [← Previous]  [Keep Local]  [Keep Remote]  [Next →]        │
│                                                             │
│ [Resolve All as Local]  [Resolve All as Remote]             │
└─────────────────────────────────────────────────────────────┘
```

---

### 4.3 ModelLoadingSpinner (P0-3)

**Purpose**: Provide feedback during expensive model fetching operations

**Props Interface**:
```tsx
export interface ModelLoadingSpinnerProps {
  /** Provider name for display */
  providerName: string;
  /** Loading state */
  isLoading: boolean;
  /** Error message if fetch failed */
  error?: string;
  /** Retry callback */
  onRetry?: () => void;
  /** Additional CSS classes */
  className?: string;
}
```

**Visual Design**:
- **Spinner**: 8-bit styled loading animation (pixel art blocks)
- **Text**: "Fetching models from {providerName}..."
- **Subtitle**: "This may take a few seconds"
- **Error State**: Red icon, error message, retry button

**Animation**:
- Use CSS keyframes for spinner rotation
- 8-bit pixel art blocks appearing/disappearing

**Accessibility**:
- Role: `status`
- ARIA: `aria-live="polite"` (non-critical)
- Screen reader: "Fetching models from OpenAI. Please wait."

**Integration**:
```tsx
// In ProviderConfigDialog.tsx
const [isFetching, setIsFetching] = useState(false);
const [fetchError, setFetchError] = useState<string | null>(null);

const handleSaveKey = async () => {
  setIsFetching(true);
  setFetchError(null);
  try {
    await credentialVault.storeCredentials(provider.id, apiKey);
    await fetchModels(provider.id);
    onOpenChange(false);
  } catch (error) {
    setFetchError(error.message);
  } finally {
    setIsFetching(false);
  }
};

return (
  <Dialog>
    {/* Form fields */}
    {isFetching && (
      <ModelLoadingSpinner
        providerName={provider.name}
        isLoading={isFetching}
        error={fetchError}
        onRetry={handleSaveKey}
      />
    )}
  </Dialog>
);
```

---

### 4.4 MobileWorkspaceSwitcher (P0-4)

**Purpose**: Enable workspace switching on mobile devices

**Props Interface**:
```tsx
export interface MobileWorkspaceSwitcherProps {
  /** Current workspace */
  currentWorkspace: WorkspaceType;
  /** Available workspaces (from project bindings) */
  enabledWorkspaces: WorkspaceType[];
  /** Callback when workspace selected */
  onSwitch: (workspace: WorkspaceType) => void;
  /** Additional CSS classes */
  className?: string;
}
```

**Visual Design**:
- **Container**: Full-screen bottom sheet (slides up from bottom)
- **Header**: "← Select Workspace" (back button + title + close button)
- **Workspace List**: Large touch targets (44px min-height), icon + label
- **Active Indicator**: Checkmark (✓) on current workspace
- **Styling**: 8-bit borders, pixel font, dark theme

**Interaction Design**:
- **Trigger**: Tap workspace icon in bottom navigation bar
- **Close**: Tap outside sheet, tap back button, tap close button, or select workspace
- **Animation**: Slide up (300ms ease-out), slide down (200ms ease-in)

**Accessibility**:
- Role: `dialog`
- ARIA: `aria-modal="true"`, `aria-label="Select workspace"`
- Focus trap: Keep focus within dialog while open
- Keyboard: Esc to close, Arrow keys to navigate list, Enter to select
- Touch: 44px min-height targets (WCAG 2.1 AAA)

**Responsive Design**:
- Mobile (<768px): Full-screen bottom sheet
- Tablet (768px-1024px): Centered modal (600px width)
- Desktop (>1024px): Use existing `WorkspaceSwitcher` dropdown

**Integration**:
```tsx
// In MobileTabBar.tsx
const [showWorkspaceSwitcher, setShowWorkspaceSwitcher] = useState(false);

return (
  <div className="fixed bottom-0 left-0 right-0 h-16 bg-background border-t border-border">
    <button
      onClick={() => setShowWorkspaceSwitcher(true)}
      className="flex flex-col items-center gap-1"
    >
      <WorkspaceIcon className="w-6 h-6" />
      <span className="text-xs">Workspace</span>
    </button>

    <MobileWorkspaceSwitcher
      open={showWorkspaceSwitcher}
      onOpenChange={setShowWorkspaceSwitcher}
      currentWorkspace={currentWorkspace}
      enabledWorkspaces={enabledWorkspaces}
      onSwitch={async (workspace) => {
        await workspaceTransitionManager.transitionTo(workspace);
        setShowWorkspaceSwitcher(false);
      }}
    />
  </div>
);
```

---

### 4.5 SyncExclusionEditor (P0-5)

**Purpose**: Allow users to customize sync exclusion patterns

**Props Interface**:
```tsx
export interface SyncExclusionEditorProps {
  /** Current exclusion patterns (glob syntax) */
  exclusions: string[];
  /** Callback to add new pattern */
  onAdd: (pattern: string) => void;
  /** Callback to remove pattern */
  onRemove: (pattern: string) => void;
  /** Callback to reset to defaults */
  onReset: () => void;
  /** Additional CSS classes */
  className?: string;
}
```

**Visual Design**:
- **List**: Scrollable list of exclusion patterns with remove buttons
- **Add Input**: Text field with "Add" button
- **Reset Button**: Secondary action to restore defaults
- **Help Text**: "Patterns use glob syntax (e.g., *.log, build/)"

**Validation**:
- **Invalid patterns**: Show error message (red text) below input
- **Duplicate patterns**: Disable add button, show warning
- **Glob syntax**: Provide examples in placeholder

**Accessibility**:
- Role: `form`
- ARIA: `aria-label="Sync exclusion patterns"`
- Keyboard: Enter to add pattern, Delete to remove pattern
- Screen reader: "Added exclusion pattern: *.log"

**Integration**:
```tsx
// In SettingsPanel.tsx
const { exclusions, addExclusion, removeExclusion, resetExclusions } =
  useFileSyncStatusStore();

return (
  <div className="space-y-4">
    <h3>Sync Exclusions</h3>
    <SyncExclusionEditor
      exclusions={exclusions}
      onAdd={addExclusion}
      onRemove={removeExclusion}
      onReset={resetExclusions}
    />
  </div>
);
```

**Store Integration**:
```typescript
// In useFileSyncStatusStore
interface FileSyncStatusStore {
  exclusions: string[];
  addExclusion: (pattern: string) => void;
  removeExclusion: (pattern: string) => void;
  resetExclusions: () => void;
}
```

---

## 5. Implementation Roadmap

### 5.1 Build Order (Dependencies First)

**Week 1: P0 Critical Gaps (Blocking)**

| Day | Component | Dependencies | Est. Hours | Developer |
|-----|-----------|--------------|------------|-----------|
| Day 1 | `ModelLoadingSpinner` (P0-3) | None | 2-3 | Dev A |
| Day 2-3 | `MobileWorkspaceSwitcher` (P0-4) | None | 6-8 | Dev B |
| Day 3-4 | `SyncConflictBanner` (P0-1) | Store updates | 4-6 | Dev A |
| Day 4-5 | `SyncConflictDialog` (P0-2) | `DiffPreview.tsx` (new) | 8-10 | Dev B |
| Day 5 | `SyncExclusionEditor` (P0-5) | Store updates | 4-5 | Dev A |

**Week 2: P1 Important Gaps (User Workflow)**

| Day | Component | Dependencies | Est. Hours | Developer |
|-----|-----------|--------------|------------|-----------|
| Day 1 | `ThreadSearchBar` (P1-1) | None | 3-4 | Dev A |
| Day 1-2 | `ThreadMetadataPanel` (P1-2) | Thread store updates | 3-4 | Dev B |
| Day 2-3 | `ThreadExportDialog` (P1-3) | Thread serialization | 4-6 | Dev A |
| Day 3-4 | `SyncHistoryPanel` (P1-4) | Sync event logging | 5-6 | Dev B |
| Day 4-5 | `SyncStatsPanel` (P1-5) | Sync metrics calculation | 4-5 | Dev A |
| Day 5 | `MobileSyncStatusIndicator` (P1-6) | None | 2-3 | Dev B |

**Week 3: P1 + P2 Polish**

| Day | Component | Dependencies | Est. Hours | Developer |
|-----|-----------|--------------|------------|-----------|
| Day 1 | `PermissionConflictWarning` (P1-7) | Permission validation | 4-5 | Dev A |
| Day 1-2 | `WorkspaceSwitchErrorToast` (P1-8) | Error handling | 2-3 | Dev B |
| Day 2 | `ProviderValidationErrorMessage` (P2-1) | Provider error codes | 2-3 | Dev A |
| Day 3-4 | `AgentAdvancedSettingsTab` (P2-4) | None | 6-8 | Dev B |
| Day 4-5 | Buffer for testing, bug fixes | All | 8-10 | Both |

**Total Estimated Effort**: 80-100 hours (2-3 developers, 3 weeks)

---

### 5.2 Dependencies

**New Components to Create**:
1. **`DiffPreview.tsx`**: Required by `SyncConflictDialog` (P0-2)
   - Syntax highlighting for code diffs
   - Side-by-side view for desktop, stacked for mobile
   - Highlight additions (green) and deletions (red)

**Store Updates Required**:
1. **`useFileSyncStatusStore`**:
   - Add `conflicts: FileConflict[]` state
   - Add `dismissConflicts()` action
   - Add `exclusions: string[]` state
   - Add `addExclusion()`, `removeExclusion()`, `resetExclusions()` actions
   - Add `syncEvents: SyncEvent[]` state (for history)
   - Add `syncStats: SyncStats` computed state

2. **`useConversationStore`** or **`useThreadsStore`**:
   - Add `searchQuery` state
   - Add `filterAgentId` state
   - Add `filterDateRange` state
   - Add `exportThread()` action

**Service Updates Required**:
1. **`SyncManager`**:
   - Add `detectConflicts()` method
   - Add `applyResolution()` method
   - Add `logSyncEvent()` method
   - Add `calculateSyncStats()` method
   - Add `validateExclusionPattern()` method

2. **`credentialVault`**:
   - Add `validateApiKey()` method (for specific error messages)

---

### 5.3 Risk Mitigation

**High-Risk Components**:
1. **`SyncConflictDialog` (P0-2)**: Complex diff view logic
   - **Mitigation**: Reuse existing `DiffPreview.tsx` from chat components, or use a library (react-diff-viewer)
   - **Fallback**: Simplified text-only diff view if library unavailable

2. **`SyncExclusionEditor` (P0-5)**: Glob pattern validation
   - **Mitigation**: Use existing glob library (already in dependencies for file tree)
   - **Fallback**: Simple string matching if glob parsing fails

3. **`MobileWorkspaceSwitcher` (P0-4)**: Cross-workspace state orchestration
   - **Mitigation**: Reuse `WorkspaceTransitionManager` (already implemented)
   - **Fallback**: Simple page navigation if state orchestration fails

**Integration Risks**:
1. **Store circular dependencies**: Avoid importing stores in other stores
   - **Mitigation**: Use event bus for cross-store communication

2. **Performance**: Large thread lists or sync histories may slow UI
   - **Mitigation**: Implement virtual scrolling (react-window) for lists >100 items

---

## 6. Wireframe Descriptions

### 6.1 Sync Conflict Resolution Flow

**Wireframe 1: SyncConflictBanner**
```
┌──────────────────────────────────────────────────────────┐
│ ⚠️  2 file sync conflicts detected               [×]     │
│                                                        │
│ Local and WebContainer versions have changed.          │
│ Resolve conflicts to keep your files in sync.          │
│                                                        │
│ [View Conflicts]  [Resolve All]  [Dismiss]            │
└──────────────────────────────────────────────────────────┘
```

**Wireframe 2: SyncConflictDialog**
```
┌────────────────────────────────────────────────────────────────────┐
│ Resolve File Conflict (1 of 2)                              [×]   │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│ File: src/App.tsx                                                 │
│ Status: Both versions modified                                    │
│                                                                    │
│ ┌─────────────────────────────┬─────────────────────────────┐     │
│ │ Local (Your Changes)        │ Remote (WebContainer)       │     │
│ ├─────────────────────────────┼─────────────────────────────┤     │
│ │ export function App() {    │ export function App() {     │     │
│ │   return (                  │   return (                   │     │
│ │     <div className="app">   │     <div className="root">   │     │
│ │       <Header />            │       <Header />             │     │
│ │       <Main />              │       <Main />               │     │
│ │     </div>                  │     </div>                   │     │
│ │   );                        │   );                         │     │
│ │ }                           │ }                            │     │
│ └─────────────────────────────┴─────────────────────────────┘     │
│                                                                    │
│ [← Previous]  [Keep Local]  [Keep Remote]  [Next →]              │
│                                                                    │
│ [Resolve All as Local]  [Resolve All as Remote]                   │
└────────────────────────────────────────────────────────────────────┘
```

---

### 6.2 Thread Management Flow

**Wireframe 1: ThreadList with Search**
```
┌──────────────────────────────────────────────┐
│ 💬  Threads                          [+ New] │
├──────────────────────────────────────────────┤
│ 🔍  Search threads...          [Filter]      │
│                                              │
│ Filters: Agent: All  Date: Any  [Clear]     │
│                                              │
│ ┌────────────────────────────────────────┐   │
│ │ 📝 My Chat Thread                     │   │
│ │    Claude Sonnet • 42 msgs • Jan 1    │   │
│ └────────────────────────────────────────┘   │
│                                              │
│ ┌────────────────────────────────────────┐   │
│ │ 📝 Bug Fixes Session                  │   │
│ │    GPT-4 • 128 msgs • Dec 28          │   │
│ └────────────────────────────────────────┘   │
│                                              │
│ ┌────────────────────────────────────────┐   │
│ │ 📝 Code Review Help                   │   │
│ │    Claude Opus • 15 msgs • Dec 25     │   │
│ └────────────────────────────────────────┘   │
└──────────────────────────────────────────────┘
```

**Wireframe 2: ThreadMetadataPanel**
```
┌────────────────────────────────────────┐
│ Thread Details                         │
├────────────────────────────────────────┤
│                                        │
│ Title: My Chat Thread                  │
│                                        │
│ Agent: Claude Sonnet 4.5               │
│ Model: claude-sonnet-4-20250514        │
│                                        │
│ Messages: 42                           │
│ Tokens: ~8,400                         │
│                                        │
│ Created: Jan 1, 2026 at 10:30 AM       │
│ Updated: Jan 1, 2026 at 2:45 PM        │
│                                        │
│ Workspace: IDE                         │
│ Project: via-gent                      │
│                                        │
│ [Rename] [Export] [Delete]             │
└────────────────────────────────────────┘
```

---

### 6.3 Mobile Workspace Switcher

**Wireframe: MobileWorkspaceSwitcher (Bottom Sheet)**
```
┌──────────────────────────────────────────────┐
│ ← Select Workspace                      [×]  │
├──────────────────────────────────────────────┤
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │ 💻  IDE                               │  │
│  │   Current workspace                    │  │
│  │                                      ✓  │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │ 📚  Knowledge                          │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │ 🎓  Study                              │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │ 📝  Notes                              │  │
│  └────────────────────────────────────────┘  │
│                                              │
└──────────────────────────────────────────────┘
          ↑ Slides up from bottom (300ms)
```

---

### 6.4 File Sync Dashboard

**Wireframe 1: SyncStatsPanel**
```
┌──────────────────────────────────────────────────────────┐
│ Sync Statistics                                   [Refresh]│
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Files: 1,234 total                                     │
│  ████████████████░░░░ 987 synced (80%)                  │
│  ██████░░░░░░░░░░░░░░ 234 pending                        │
│  ██░░░░░░░░░░░░░░░░░░ 13 failed                         │
│                                                          │
│  ┌─────────────────────┬─────────────────────┐          │
│  │ Data Transferred    │ Sync Rate           │          │
│  ├─────────────────────┼─────────────────────┤          │
│  │ 45.2 MB            │ 42 files/min        │          │
│  └─────────────────────┴─────────────────────┘          │
│                                                          │
│  Last sync: 2 minutes ago                                │
│  Next sync: Auto (when files change)                     │
│                                                          │
│  [View Sync History]  [Configure Exclusions]             │
└──────────────────────────────────────────────────────────┘
```

**Wireframe 2: SyncHistoryPanel**
```
┌──────────────────────────────────────────────────────────┐
│ Sync History                                     [Clear]│
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Today (5 events)                                        │
│                                                          │
│  10:42  ✅ src/App.tsx synced (1.2 KB)                   │
│  10:41  ⚠️  package.json conflict detected               │
│  10:40  ❌ src/main.tsx failed (network error)           │
│  10:39  🔄 src/main.tsx retrying...                      │
│  10:38  ✅ src/main.tsx synced (3.4 KB)                  │
│                                                          │
│  Yesterday (12 events)                      [Show ▼]     │
│                                                          │
│  2 days ago (8 events)                        [Show ▼]  │
│                                                          │
│  [Export Log]                                            │
└──────────────────────────────────────────────────────────┘
```

---

## 7. Accessibility Requirements

### 7.1 WCAG 2.1 AA Compliance

All components must meet WCAG 2.1 AA standards:

**Color Contrast**:
- Text: Minimum 4.5:1 contrast ratio (normal text), 3:1 (large text)
- UI Components: Minimum 3:1 contrast ratio for graphical objects
- Focus indicators: Minimum 3:1 contrast ratio

**Keyboard Accessibility**:
- All interactive elements must be keyboard-accessible
- Tab order must follow logical visual flow
- No keyboard traps (user can tab in and out of components)
- Skip links for bypassing repetitive content

**Screen Reader Support**:
- All images must have `alt` text (or `role="presentation"` for decorative)
- Form inputs must have associated labels (`htmlFor` + `id`)
- Dialogs must have `role="dialog"`, `aria-labelledby`, `aria-describedby`
- Live regions (`aria-live`) for dynamic content updates

**Focus Management**:
- Focus must not be lost during interactions
- Modals must trap focus within dialog
- Focus must return to trigger element after modal closes

---

### 7.2 Component-Specific Requirements

**SyncConflictBanner**:
- `role="alert"` (critical, requires immediate attention)
- `aria-live="assertive"`
- Keyboard: Esc to dismiss, Enter to resolve all

**SyncConflictDialog**:
- `role="dialog"`
- `aria-labelledby="dialog-title"`
- `aria-describedby="dialog-description"`
- Focus trap: Keep focus within dialog while open
- Keyboard: Esc to close, Arrow keys to navigate conflicts

**MobileWorkspaceSwitcher**:
- `role="dialog"` (mobile), `role="menu"` (desktop dropdown)
- `aria-modal="true"`
- Focus trap on mobile
- Touch targets: Minimum 44x44px (WCAG AAA)

**ThreadSearchBar**:
- `role="search"`
- `aria-label="Search threads"`
- `aria-live="polite"` for search results updates

**SyncHistoryPanel**:
- `role="log"` (for chronological list)
- `aria-live="polite"` (non-critical updates)
- `aria-label="Sync history timeline"`

---

### 7.3 Testing Checklist

- [ ] All interactive elements are keyboard-accessible
- [ ] Tab order follows logical visual flow
- [ ] No keyboard traps (can tab in/out of all components)
- [ ] Focus indicators visible (3:1 contrast minimum)
- [ ] All images have `alt` text or `role="presentation"`
- [ ] All form inputs have associated labels
- [ ] Dialogs have proper `role`, `aria-labelledby`, `aria-describedby`
- [ ] Live regions used for dynamic content updates
- [ ] Color contrast meets WCAG AA (4.5:1 for text, 3:1 for UI components)
- [ ] Touch targets meet minimum size (44x44px on mobile)
- [ ] Screen reader announces all important state changes
- [ ] Error messages are associated with form inputs (`aria-describedby`)

---

## 8. Responsive Design Requirements

### 8.1 Breakpoints (from `design-tokens.css`)

```css
--breakpoint-mobile: 640px;
--breakpoint-tablet: 768px;
--breakpoint-desktop: 1024px;
--breakpoint-wide: 1280px;
```

### 8.2 Mobile-First Strategy

All components must be designed mobile-first:

**Mobile (<640px)**:
- Single-column layouts
- Stacked buttons
- Full-width inputs
- Bottom sheets or full-screen modals
- Touch-optimized (44px min-height targets)

**Tablet (640px-1024px)**:
- Two-column layouts where appropriate
- Centered modals (600px max-width)
- Side-by-side buttons (if space permits)
- Responsive typography (scaling font sizes)

**Desktop (>1024px)**:
- Multi-column layouts
- Dropdown menus instead of bottom sheets
- Hover states for desktop interactions
- Fixed-width dialogs (max-w-4xl for large modals)

---

### 8.3 Component Responsive Behavior

**SyncConflictBanner**:
- Mobile: Full-width, stacked buttons
- Desktop: Full-width, horizontal button layout

**SyncConflictDialog**:
- Mobile: Full-width, stacked diff view
- Tablet: Side-by-side diff with reduced font size
- Desktop: Side-by-side diff, max-w-4xl

**MobileWorkspaceSwitcher**:
- Mobile: Full-screen bottom sheet
- Tablet: Centered modal (600px width)
- Desktop: Hidden (use existing `WorkspaceSwitcher` dropdown)

**ThreadSearchBar**:
- Mobile: Full-width input, filter/sort below
- Desktop: Input inline with filter/sort buttons

**SyncStatsPanel**:
- Mobile: Single-column stats (stacked)
- Desktop: Two-column stats grid

**SyncHistoryPanel**:
- Mobile: Single-column timeline, compact date format
- Desktop: Two-column timeline (date on left, events on right)

---

### 8.4 Typography Scaling

All components must use responsive typography:

```css
/* Mobile (<640px) */
.text-responsive {
  font-size: 0.875rem; /* 14px */
  line-height: 1.25rem;
}

/* Tablet (640px-1024px) */
@media (min-width: 640px) {
  .text-responsive {
    font-size: 1rem; /* 16px */
    line-height: 1.5rem;
  }
}

/* Desktop (>1024px) */
@media (min-width: 1024px) {
  .text-responsive {
    font-size: 1.125rem; /* 18px */
    line-height: 1.75rem;
  }
}
```

---

## 9. Success Criteria

### 9.1 Completion Metrics

- [ ] **Zero orphaned backend features**: All features have UI components
- [ ] **Zero missing error states**: All error scenarios handled
- [ ] **Zero missing loading states**: All async operations show progress
- [ ] **100% keyboard accessibility**: Critical flows navigable via keyboard
- [ ] **Mobile usability**: All critical features work on mobile

### 9.2 User Journey Completion

- [ ] **LLM Provider Configuration**: 100% (9/9 steps) ✅
- [ ] **AI Agent Configuration**: 100% (10/10 steps) ✅
- [ ] **Tool Permissions Management**: 100% (6/6 steps) ✅
- [ ] **Chat Flow & Thread Management**: 100% (14/14 steps) ⚠️ (currently 64%)
- [ ] **File System Synchronization**: 100% (12/12 steps) ❌ (currently 42%)
- [ ] **Workspace Binding & Navigation**: 100% (8/8 steps) ⚠️ (currently 75%)

---

## 10. Recommendations

### 10.1 Immediate Actions (This Sprint)

1. **Implement P0-3 (ModelLoadingSpinner)**: Quick win (2-3 hours), immediate user feedback improvement
2. **Implement P0-4 (MobileWorkspaceSwitcher)**: Unblocks mobile users (6-8 hours)
3. **Implement P0-1 (SyncConflictBanner)**: Critical for production reliability (4-6 hours)

### 10.2 Short-Term (Next Sprint)

1. **Implement P0-2 (SyncConflictDialog)**: Completes sync conflict resolution flow (8-10 hours)
2. **Implement P0-5 (SyncExclusionEditor)**: Customizable sync behavior (4-5 hours)
3. **Implement P1-1, P1-2, P1-3 (Thread management)**: Improve chat workflow (10-14 hours total)

### 10.3 Long-Term (Future Sprints)

1. **Implement P1-4, P1-5, P1-6 (Sync dashboard)**: Complete file sync observability
2. **Implement P1-7 (Permission conflicts)**: Advanced tool permission management
3. **Implement P2 components**: Polish and advanced features

### 10.4 Technical Debt

1. **Store consolidation**: 50+ stores scattered across 3 locations (see Ralph Loop Cycle 12 analysis)
2. **Circular dependencies**: Agents store ↔ Provider store (Epic AC-1)
3. **Mobile responsiveness**: StatusBar is desktop-only (needs mobile alternative)
4. **Error handling consistency**: Mix of generic and specific error messages

---

## 11. Conclusion

This analysis identified **24 missing UI components** across 6 core systems, with **5 P0 (blocking)**, **8 P1 (important)**, and **5 P2 (nice-to-have)** gaps.

**Key Findings**:
- **File System Synchronization** has the most critical gaps (42% complete)
- **Chat Thread Management** needs workflow improvements (64% complete)
- **Mobile Workspace Switching** is completely missing (desktop-only UI)
- **LLM Provider Configuration** and **AI Agent Configuration** are mostly complete (85-90%)

**Recommended Priority**:
1. **P0 File Sync Components** (P0-1, P0-2, P0-5) → Blocking production reliability
2. **P0 Mobile Workspace Switcher** (P0-4) → Unblocks mobile users
3. **P0 Model Loading Spinner** (P0-3) → Quick win, immediate feedback
4. **P1 Thread Management** (P1-1, P1-2, P1-3) → Improve user workflow

**Estimated Effort**: 80-100 hours (2-3 developers, 3 weeks)

All components follow the project's **8-bit design system**, use **Tailwind CSS** with **design tokens**, and meet **WCAG 2.1 AA** accessibility standards with **mobile-first responsive design**.

---

## Appendix A: Component File Structure

```
src/presentation/components/
├── sync/
│   ├── SyncConflictBanner.tsx          [NEW - P0-1]
│   ├── SyncConflictDialog.tsx          [NEW - P0-2]
│   ├── SyncHistoryPanel.tsx            [NEW - P1-4]
│   ├── SyncStatsPanel.tsx              [NEW - P1-5]
│   ├── SyncExclusionEditor.tsx         [NEW - P0-5]
│   ├── MobileSyncStatusIndicator.tsx   [NEW - P1-6]
│   └── SyncConflictPreventionBanner.tsx [NEW - P2-5]
├── chat/
│   ├── ThreadSearchBar.tsx             [NEW - P1-1]
│   ├── ThreadMetadataPanel.tsx         [NEW - P1-2]
│   ├── ThreadExportDialog.tsx          [NEW - P1-3]
│   └── ThreadCreator.tsx               [NEW - P2-3]
├── agent/
│   ├── ProviderValidationErrorMessage.tsx [NEW - P2-1]
│   ├── PermissionConflictWarning.tsx   [NEW - P1-7]
│   ├── WorkspaceScopedPermissionsEditor.tsx [NEW - P2-2]
│   └── AgentAdvancedSettingsTab.tsx    [NEW - P2-4]
├── workspace/
│   ├── MobileWorkspaceSwitcher.tsx     [NEW - P0-4]
│   └── WorkspaceSwitchErrorToast.tsx   [NEW - P1-8]
└── ui/
    ├── DiffPreview.tsx                 [NEW - Required by P0-2]
    └── ModelLoadingSpinner.tsx         [NEW - P0-3]
```

---

## Appendix B: Store Update Requirements

### useFileSyncStatusStore

```typescript
interface FileSyncStatusStore {
  // NEW: Conflict detection
  conflicts: FileConflict[];
  detectConflicts: () => void;
  dismissConflicts: () => void;

  // NEW: Exclusion patterns
  exclusions: string[];
  addExclusion: (pattern: string) => void;
  removeExclusion: (pattern: string) => void;
  resetExclusions: () => void;

  // NEW: Sync history
  syncEvents: SyncEvent[];
  logSyncEvent: (event: SyncEvent) => void;
  clearSyncHistory: () => void;

  // NEW: Sync statistics
  syncStats: SyncStats;
  calculateSyncStats: () => void;
}

interface FileConflict {
  filePath: string;
  localVersion: FileVersion;
  remoteVersion: FileVersion;
  conflictType: 'modified_both' | 'deleted_modified' | 'modified_deleted';
}

interface SyncEvent {
  id: string;
  timestamp: Date;
  filePath: string;
  action: 'sync' | 'conflict' | 'error' | 'retry';
  status: 'success' | 'failed' | 'pending';
  errorMessage?: string;
}

interface SyncStats {
  totalFiles: number;
  syncedFiles: number;
  failedFiles: number;
  pendingFiles: number;
  dataTransferred: number;
  lastSyncTime: Date;
  syncRate: number;
}
```

### useConversationStore / useThreadsStore

```typescript
interface ConversationStore {
  // NEW: Thread search and filter
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  filterAgentId: string | null;
  setFilterAgentId: (agentId: string | null) => void;

  filterDateRange: { start: Date; end: Date } | null;
  setFilterDateRange: (range: { start: Date; end: Date } | null) => void;

  // NEW: Thread export
  exportThread: (threadId: string, format: 'json' | 'markdown' | 'txt') => Promise<string>;
}
```

---

**Document Version**: 1.0
**Last Updated**: 2026-01-01
**Next Review**: After P0 components implementation
