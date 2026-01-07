a# Component Inventory

**Generated:** 2026-01-07
**Scan Mode:** Exhaustive

---

## Overview

Via-gent has **426 presentation components** organized by workspace and feature domain. Components follow a **8-bit retro design system** with solid colors, pixel-perfect styling, and no glassmorphism effects.

---

## Component Summary

| Category | Count | Location |
|----------|-------|----------|
| **UI Components** | 45 | `ui/` |
| **Chat** | 35 | `chat/` |
| **Hub** | 30 | `hub/` |
| **Agent** | 28 | `agent/` |
| **Knowledge** | 21 | `knowledge/` |
| **IDE** | 20 | `ide/` |
| **Notes** | 16 | `notes/` |
| **Icons** | 14 | `ui/icons/` |
| **Layout** | 10 | `layout/` |
| **Event Indicators** | 16 | `ui/event-indicators/` |
| **Activity Indicators** | 6 | `ui/activity-indicators/` |
| **Study** | 11 | `study/` |
| **Agent Form** | 15 | `agent/AgentConfigForm/` |
| **Workspace Permissions** | 8 | `agent/WorkspacePermissions/` |
| **Status Bar** | 7 | `ide/statusbar/` |
| **Agent Chat Panel** | 7 | `ide/AgentChatPanel/` |
| **Common** | 6 | `common/` |
| **Project Steps** | 6 | `project/steps/` |
| **File Tree** | 6 | `ide/FileTree/` |
| **RAG** | 5 | `rag/` |
| **Git** | 5 | `git/` |
| **Workflow** | 5 | `chat/workflow/` |
| **Canvas** | 5 | `canvas/` |
| **Search** | 4 | `search/` |
| **Scheduler** | 4 | `scheduler/` |
| **Notifications** | 4 | `notifications/` |
| **Editor** | 4 | `editor/` |
| **About Sections** | 5 | `about/sections/` |
| **About** | 4 | `about/` |
| **IDE Layout** | 10 | `layout/IDELayout/` |
| **Other** | ~100 | Various |

**Total:** 426 components

---

## UI Components (45)

**Location:** `src/presentation/components/ui/`

Base UI components following 8-bit design system.

### Status & Loading
- `ErrorState.tsx` - Error display component
- `SkeletonLoader.tsx` - Loading placeholder
- `SkeletonScreen.tsx` - Full-page skeleton
- `LoadingState.tsx` - Loading indicator
- `EmptyState.tsx` - Empty content display

### Feedback
- `Toast.tsx` / `ToastContext.tsx` - Toast notifications
- `sonner.tsx` - Sonner toast wrapper
- `ApprovalOverlay.tsx` - Tool approval overlay
- `AgentValidationFeedback.tsx` - Validation messages

### Inputs & Controls
- `button.tsx` - Button variants
- `input.tsx` - Text input
- `textarea.tsx` - Text area
- `select.tsx` - Dropdown select
- `switch.tsx` - Toggle switch
- `slider.tsx` - Range slider
- `checkbox.tsx` - Checkbox
- `radio-group.tsx` - Radio buttons
- `label.tsx` - Form label

### Display
- `card.tsx` - Card container
- `badge.tsx` - Status badge
- `pixel-badge.tsx` - 8-bit styled badge
- `truncated-text.tsx` - Text truncation
- `status-dot.tsx` - Status indicator
- `progress-indicator.tsx` - Progress display
- `ProgressBar.tsx` - Progress bar
- `progress.tsx` - Progress wrapper
- `collapsible-section.tsx` - Collapsible content

### Navigation
- `tabs.tsx` - Tab navigation
- `breadcrumb.tsx` - Breadcrumb trail
- `tooltip.tsx` - Tooltip display

### Modals & Overlays
- `dialog.tsx` - Dialog modal
- `sheet.tsx` - Side sheet
- `dropdown-menu.tsx` - Dropdown menu
- `popover.tsx` - Popover content
- `alert-dialog.tsx` - Alert confirmation

### Other
- ` resizable.tsx` - Resizable panels
- `ThemeToggle.tsx` - Theme switcher
- `SkipLinks.tsx` - Accessibility skip links
- `StreamingIndicator.tsx` - Streaming status
- `ModelLoadingSpinner.tsx` - Model loading state
- `MobileCapabilityBanner.tsx` - Mobile feature notice
- `keyboard-shortcuts-overlay.tsx` - Keyboard shortcuts

---

## Icons (14)

**Location:** `src/presentation/components/ui/icons/`

8-bit styled icon components.

- `AIIcon.tsx` - AI assistant icon
- `ChatIcon.tsx` - Chat icon
- `CloseIcon.tsx` - Close/X icon
- `FileIcon.tsx` - File icon
- `MenuIcon.tsx` - Hamburger menu
- `PlusIcon.tsx` - Add/plus icon
- `RefreshIcon.tsx` - Refresh icon
- `SearchIcon.tsx` - Search icon
- `SettingsIcon.tsx` - Settings gear
- `TerminalIcon.tsx` - Terminal icon
- `TrashIcon.tsx` - Delete/trash icon
- `CheckIcon.tsx` - Checkmark icon
- `CopyIcon.tsx` - Copy icon
- `DownloadIcon.tsx` - Download icon

---

## Agent Components (28)

**Location:** `src/presentation/components/agent/`

### Main Components
- `AgentConfigDialog.tsx` - Agent configuration modal
- `AgentSelector.tsx` - Agent dropdown selector
- `UnifiedAgentSelector.tsx` - Unified agent selector
- `AgentManager.tsx` - Agent management UI
- `AgentsPanel.tsx` - Agents list panel

### Configuration Form (15)
**Location:** `agent/AgentConfigForm/`

- `AgentBasicConfig.tsx` - Name, provider, model
- `ApiKeyInputSection.tsx` - API key input
- `ProviderSelector.tsx` - Provider dropdown
- `ModelSelector.tsx` - Model dropdown
- `SystemPromptInput.tsx` - System prompt editor
- `LLMParameters.tsx` - Temperature, max tokens
- `MemorySettings.tsx` - Memory configuration
- `DeepThinkSettings.tsx` - Deep thinking config
- `AgentCapabilities.tsx` - Capability badges

### Workspace Permissions (8)
**Location:** `agent/WorkspacePermissions/`

- `WorkspacePermissionsConfig.tsx` - Permission grid
- `PermissionBadge.tsx` - Permission status badge
- `PermissionSwitch.tsx` - Permission toggle
- `PermissionGridHeader.tsx` - Grid header
- `ToolPermissionRow.tsx` - Tool permission row
- `PermissionLegend.tsx` - Permission legend

### Tool Trust Levels (2)
**Location:** `agent/ToolTrustLevels/`

- `ToolTrustLevelManager.tsx` - Trust level config
- `TrustLevelLegend.tsx` - Trust level legend

### Import/Export
- `AgentImportExport.tsx` - Import/export agents

---

## IDE Components (20)

**Location:** `src/presentation/components/ide/`

### Panels
- `PanelShell.tsx` - Resizable panel wrapper
- `ExplorerPanel.tsx` - File explorer
- `SettingsPanel.tsx` - Settings panel
- `SearchPanel.tsx` - Search interface
- `SyncStatusPanel.tsx` - Sync status display

### Editor
- `MonacoEditor.tsx` - Monaco editor wrapper
- `EditorTabBar.tsx` - Editor file tabs
- `StreamingMessage.tsx` - Streaming message display
- `EnhancedChatInterface.tsx` - Enhanced chat UI

### Terminal
- `XTerminal.tsx` - Terminal emulator

### File Tree (6)
**Location:** `ide/FileTree/`

- `FileTree.tsx` - File tree component
- `FileTreeItem.tsx` - Tree item
- `ContextMenu.tsx` - Context menu
- `ConfirmDialog.tsx` - Confirmation dialog
- `FileOperationDialog.tsx` - File operations
- `icons.tsx` - File icons

### Agent Chat Panel (7)
**Location:** `ide/AgentChatPanel/`

- `AgentChatConversationManager.tsx` - Chat manager
- `AgentChatHeader.tsx` - Chat header
- `AgentChatStatus.tsx` - Status display
- `AgentChatApprovals.tsx` - Approval UI
- `AgentChatEnhancingUI.tsx` - Enhancement UI
- `AgentChatAPIKeyManager.tsx` - API key manager
- `AgentChatToolFacades.tsx` - Tool facades

### Status Bar (7)
**Location:** `ide/statusbar/`

- `StatusBar.tsx` - Status bar container
- `SyncStatusSegment.tsx` - Sync status
- `WebContainerStatus.tsx` - WebContainer status
- `AgentStatusSegment.tsx` - Agent status
- `CursorPosition.tsx` - Cursor position
- `FileTypeIndicator.tsx` - File type
- `ProviderStatus.tsx` - Provider status

### Other
- `CommandPalette.tsx` - Command palette (Ctrl+P)
- `FeatureSearch.tsx` - Feature search
- `QuickActionsMenu.tsx` - Quick actions
- `IconSidebar.tsx` - Icon sidebar
- `AgentsPanel.tsx` - Agents panel
- `CacheIndicator.tsx` - Cache status
- `SyncEditWarning.tsx` - Sync edit warning
- `SyncStatusIndicator.tsx` - Sync indicator
- `BentoGrid.tsx` - Bento grid layout
- `BentoCardPreview.tsx` - Card preview

---

## Chat Components (35)

**Location:** `src/presentation/components/chat/`

### Chat Interface
- `ChatPanel.tsx` - Main chat panel
- `ChatConversation.tsx` - Conversation display
- `ChatInput.tsx` - Message input
- `ChatHeader.tsx` - Chat header
- `MessageList.tsx` - Message list

### Thread Management
- `ThreadManager.tsx` - Thread manager
- `ThreadCard.tsx` - Thread card
- `ThreadsList.tsx` - Threads list
- `ThreadFolderTree.tsx` - Folder tree

### Workflow (5)
**Location:** `chat/workflow/`

- `WorkflowBuilder.tsx` - Workflow builder UI
- `WorkflowVisualizer.tsx` - Flowchart view
- `WorkflowTemplates.tsx` - Template gallery
- `WorkflowExecutor.tsx` - Execution UI

### Other
- `ApprovalOverlay.tsx` - Approval overlay
- `BatchApprovalBar.tsx` - Batch approval
- `ToolCallBadge.tsx` - Tool call badge
- `ToolProgressIndicator.tsx` - Tool progress
- `SuggestionChips.tsx` - Suggestion chips
- `StreamdownRenderer.tsx` - Markdown renderer
- `CodeBlock.tsx` - Code syntax highlight

---

## Knowledge Components (21)

**Location:** `src/presentation/components/knowledge/`

- `KnowledgePage.tsx` - Knowledge page
- `KnowledgePanel.tsx` - Knowledge panel
- `DocumentUpload.tsx` - Document upload
- `DocumentList.tsx` - Document list
- `SourceManager.tsx` - Source management
- `SynthesisPanel.tsx` - Knowledge synthesis
- `VectorSearch.tsx` - Vector search
- `KnowledgeCanvas.tsx` - Knowledge canvas

---

## Notes Components (16)

**Location:** `src/presentation/components/notes/`

- `NotesPage.tsx` - Notes page
- `NotesPanel.tsx` - Notes panel
- `NoteEditor.tsx` - Note editor
- `NoteList.tsx` - Note list
- `AIPromptDialog.tsx` - AI prompt dialog
- `AITransformMenu.tsx` - AI transform menu
- `BlockEditor.tsx` - Block editor
- `NoteCard.tsx` - Note card

---

## Study Components (11)

**Location:** `src/presentation/components/study/`

- `StudyPage.tsx` - Study page
- `FlashcardDeck.tsx` - Flashcard deck
- `Flashcard.tsx` - Single flashcard
- `QuizPanel.tsx` - Quiz panel
- `QuizQuestion.tsx` - Quiz question
- `StudySession.tsx` - Study session
- `ProgressTracker.tsx` - Progress tracking

---

## Layout Components (10)

**Location:** `src/presentation/components/layout/`

- `IDELayout.tsx` - Main IDE layout
- `MobileIDELayout.tsx` - Mobile layout
- `WorkspaceLayout.tsx` - Workspace layout
- `MainLayout.tsx` - Main layout wrapper
- `PanelLayout.tsx` - Panel layout

### IDE Layout (10)
**Location:** `layout/IDELayout/`

- `IDELayout.tsx` - Main layout
- `IDESidebar.tsx` - Sidebar
- `IDEMain.tsx` - Main area
- `IDEFooter.tsx` - Footer
- `IDEResizer.tsx` - Panel resizer

---

## Hub Components (30)

**Location:** `src/presentation/components/hub/`

Central hub for project management and navigation.

- `HubPage.tsx` - Hub page
- `ProjectGrid.tsx` - Project grid
- `ProjectCard.tsx` - Project card
- `RecentProjects.tsx` - Recent projects
- `QuickActions.tsx` - Quick actions
- `WorkspaceSelector.tsx` - Workspace selector

---

## Event Indicators (16)

**Location:** `src/presentation/components/ui/event-indicators/`

Real-time event feedback components.

- `EventIndicator.tsx` - Generic indicator
- `IndexingProgressIndicator.tsx` - Indexing progress
- `IndexingPhaseItem.tsx` - Indexing phase
- `ToolExecutionIndicator.tsx` - Tool execution
- `ToolExecutionStep.tsx` - Execution step
- `WorkspaceTransitionIndicator.tsx` - Workspace transition
- `WorkspaceTransitionStepItem.tsx` - Transition step
- `QuizGenerationIndicator.tsx` - Quiz generation
- `QuizGenerationStepItem.tsx` - Generation step
- `NoteIndexingIndicator.tsx` - Note indexing
- `StreamingStatusIndicator.tsx` - Streaming status

---

## Activity Indicators (6)

**Location:** `src/presentation/components/ui/activity-indicators/`

- `DatabaseIndexingIndicator.tsx` - Database indexing
- `EmbeddingProgressIndicator.tsx` - Embedding generation
- `ChunkingStatusIndicator.tsx` - Document chunking
- `SyncStatusIndicator.tsx` - File sync status

---

## Common Components (6)

**Location:** `src/presentation/components/common/`

- `ErrorBoundary.tsx` - Error boundary wrapper
- `LoadingSpinner.tsx` - Loading spinner
- `ConfirmDialog.tsx` - Confirmation dialog
- `EmptyState.tsx` - Empty state
- `UnsavedChangesDialog.tsx` - Unsaved changes warning

---

## Canvas Components (5)

**Location:** `src/presentation/components/canvas/`

- `CanvasView.tsx` - Canvas view
- `CanvasNode.tsx` - Canvas node
- `CanvasEdge.tsx` - Canvas edge
- `CanvasControls.tsx` - Canvas controls

---

## RAG Components (5)

**Location:** `src/presentation/components/rag/`

- `RAGSearch.tsx` - RAG search
- `RAGResults.tsx` - Search results
- `VectorIndex.tsx` - Vector index
- `DocumentChunker.tsx` - Document chunker

---

## Related Documentation

- [Architecture](./architecture.md) - System design
- [State Management](./state-management.md) - Store architecture
- [Development Guide](./development-guide.md) - Setup and commands
