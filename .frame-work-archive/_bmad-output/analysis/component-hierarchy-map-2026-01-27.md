# UI Component Hierarchy Map

**Generated**: 2026-01-27
**Agent**: architect-ext (Team A)
**Task ID**: PH2-T2C
**Status**: COMPLETE

---

## Executive Summary

| Metric | Count |
|--------|-------|
| **Total Component Files** | 509 |
| **Component Directories** | 97 |
| **Route Files** | 16 |
| **Layout Components** | 34 |
| **UI Primitives** | 60+ |
| **CSS Files** | 26 |
| **Components >300 Lines** | 55 (CRITICAL) |
| **Inline Style Violations** | 302 instances in 20+ files |

---

## Level 1: Routes (Entry Points)

### TanStack Router Structure

| Route | File | Layout | Parameters | Lines |
|-------|------|--------|------------|-------|
| **Root** | `__root.tsx` | `ProjectAwareLayout` | - | 124 |
| **Index** | `index.tsx` | MainLayout (via root) | - | 15 |
| **Hub** | `hub.tsx` | `MainLayout` | - | 14 |
| **Projects** | `projects.tsx` | `MainLayout` | - | 14 |
| **Settings** | `settings.tsx` | `MainLayout` | - | 532 |
| **Agents** | `agents.tsx` | `MainLayout` | - | 46 |
| **Project** | `$projectId.tsx` | `PluginLayout` (no sidebar) | `projectId` | 151 |
| **Diagnostic** | `$projectId.diagnostic.tsx` | N/A | `projectId` | 347 |
| **About** | `about.tsx` + `about.lazy.tsx` | MainLayout | - | 10 |
| **Debug** | `debug.tsx` | N/A | - | 165 |
| **WebContainer** | `webcontainer.$.tsx` | N/A | splat | 5 |
| **Provider Playground** | `$__debug__.provider-playground.tsx` | N/A | - | 855 |

### API Routes (src/routes/api/)

| Route | File | Purpose |
|-------|------|---------|
| `chat.ts` | API chat endpoint | Chat API |
| `providers.ts` | List providers | Provider listing |
| `providers.$id.ts` | Get provider | Individual provider |
| `providers.$id.execute.ts` | Execute provider | Provider execution |
| `providers.$id.test.ts` | Test provider | Provider testing |

---

## Level 2: Layouts (Skeleton)

### Primary Layout Architecture

```
__root.tsx (RootRoute)
├── ThemeProvider
├── LocaleProvider
├── TooltipProvider
├── ToastProvider
├── OverlayRoot
├── AppInitializer
├── UnifiedWorkspaceProvider
├── AppErrorBoundary
└── ProjectAwareLayout (MAIN ROUTING)
    ├── [Global Routes] → GlobalHeader + MainSidebar + Breadcrumbs + Outlet + SystemRail
    └── [Project Routes] → GlobalHeader + Outlet (PluginLayout) + SystemRail
```

### Layout Components by File

| Layout | File | Lines | Role |
|--------|------|-------|------|
| **ProjectAwareLayout** | `layout/ProjectAwareLayout.tsx` | 116 | Route-aware layout switching |
| **MainLayout** | `layout/MainLayout.tsx` | 84 | Global pages (hub, settings) |
| **PluginLayout** | `layouts/PluginLayout.tsx` | 245+ | Bento grid for project workspace |
| **GlobalHeader** | `layout/GlobalHeader.tsx` | 331 | Top navigation bar |
| **MainSidebar** | `layout/MainSidebar.tsx` | 403 | Global navigation sidebar |
| **SystemRail** | `layout/SystemRail.tsx` | 265 | Bottom status bar |
| **Breadcrumbs** | `layout/Breadcrumbs.tsx` | 237 | Navigation breadcrumbs |
| **IDELayoutMain** | `layout/IDELayoutMain.tsx` | 368 | Legacy IDE layout |
| **IDEHeaderBar** | `layout/IDEHeaderBar.tsx` | 354 | IDE header |
| **MobileIDELayout** | `layout/MobileIDELayout.tsx` | 331 | Mobile responsive |
| **MobileBottomNav** | `layout/MobileBottomNav.tsx` | 218 | Mobile navigation |

### Bento Grid System (src/presentation/layouts/)

| Component | Lines | Purpose |
|-----------|-------|---------|
| `PluginLayout.tsx` | 245 | Main bento grid container |
| `BentoGridStore.ts` | - | Plugin grid state |
| `PluginLayoutStore.ts` | - | Layout persistence |
| `DraggableBentoCell.tsx` | - | Drag-swap cells |
| `MobilePluginNav.tsx` | - | Mobile plugin switcher |
| `bento-layouts.ts` | - | Grid templates |
| `workflow-presets.ts` | - | Layout presets |

---

## Level 3-6: Component Tree

### Complete Hierarchy (ASCII Diagram)

```
src/presentation/
├── components/
│   ├── about/                    # Portfolio/About page components
│   │   ├── AboutPage.tsx         # 299 lines
│   │   ├── HeroSection.tsx
│   │   ├── ParticleBackground.tsx
│   │   ├── ScrollIndicator.tsx
│   │   ├── contact/
│   │   ├── journey/
│   │   ├── layout/
│   │   ├── projects/
│   │   ├── sections/
│   │   ├── skills/
│   │   ├── stats/
│   │   └── timeline/
│   │
│   ├── agent/                    # Agent configuration (40+ files)
│   │   ├── AgentConfigDialog.tsx # Complex config
│   │   ├── AgentManager.tsx
│   │   ├── ProviderSettings.tsx  # 447 lines
│   │   ├── AgentConfigForm/      # Form components
│   │   ├── WorkspacePermissions/
│   │   ├── ToolTrustLevels/
│   │   └── hooks/
│   │
│   ├── analytics/                # Dashboard analytics
│   │   ├── AnalyticsDashboard.tsx # 457 lines
│   │   └── MetricsChart.tsx      # 447 lines
│   │
│   ├── audio/
│   │   └── AudioPlayer.tsx
│   │
│   ├── canvas/                   # ReactFlow canvas
│   │   ├── Canvas.tsx
│   │   ├── edges/
│   │   └── nodes/
│   │
│   ├── chat/                     # Chat system (40+ files)
│   │   ├── UnifiedChatPanel.tsx
│   │   ├── ChatHistory.tsx       # 454 lines
│   │   ├── ChatBubble.tsx
│   │   ├── CodeBlock.tsx         # 465 lines
│   │   ├── DiffPreview.tsx       # 432 lines
│   │   ├── WorkflowBuilder.tsx   # 476 lines
│   │   ├── FileAttachmentInput.tsx # 492 lines
│   │   ├── workflow/
│   │   └── ...
│   │
│   ├── collaboration/
│   │   ├── LiveCursor.tsx
│   │   └── UserPresenceIndicator.tsx
│   │
│   ├── command-palette/
│   │   └── CommandPalette.tsx
│   │
│   ├── common/                   # Shared utilities
│   │   ├── AppErrorBoundary.tsx
│   │   ├── AppInitializer.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── PluginFallback.tsx
│   │   ├── WorkspaceSwitcher.tsx
│   │   └── DatabaseRecoveryDialog.tsx
│   │
│   ├── dashboard/
│   │   ├── Onboarding.tsx
│   │   └── PitchDeck.tsx
│   │
│   ├── dev/
│   │   └── SyncDevTools.tsx
│   │
│   ├── diff/                     # Diff viewing
│   │   ├── DiffViewer.tsx
│   │   ├── LineDiff.tsx
│   │   └── MergeConflictResolver.tsx
│   │
│   ├── editor/                   # Editor components
│   │   ├── EditorTabBar.tsx
│   │   ├── EditorTab.tsx
│   │   ├── SymbolsPanel.tsx
│   │   └── DefinitionTooltip.tsx
│   │
│   ├── error/
│   │   ├── ErrorBoundary.tsx
│   │   ├── ErrorFallback.tsx
│   │   └── ErrorMessage.tsx
│   │
│   ├── formatter/
│   │   ├── FormatDialog.tsx
│   │   └── MobileFormatButton.tsx
│   │
│   ├── git/                      # Git integration
│   │   ├── GitBranchManager.tsx
│   │   ├── GitCommitDialog.tsx
│   │   ├── GitDiffViewer.tsx
│   │   ├── GitMergeConflictResolver.tsx # 473 lines
│   │   └── GitSettings.tsx
│   │
│   ├── header/
│   │   └── SimpleHeader.tsx
│   │
│   ├── hub/                      # Hub/home page (40+ files)
│   │   ├── HubHomePage.tsx       # 540 lines
│   │   ├── ProjectCard.tsx
│   │   ├── WorkspaceBindingDialog.tsx
│   │   └── ...
│   │
│   ├── ide/                      # IDE workspace (60+ files)
│   │   ├── AgentChatPanel.tsx    # 691 lines - GOD COMPONENT
│   │   ├── MonacoEditor/
│   │   │   └── MonacoEditor.tsx  # 772 lines - GOD COMPONENT
│   │   ├── FileTree/
│   │   ├── PreviewPanel/
│   │   ├── XTerminal/
│   │   ├── statusbar/
│   │   ├── AgentChatPanel/
│   │   ├── EnhancedChatInterface.tsx # 602 lines
│   │   └── hooks/
│   │
│   ├── keyboard/
│   │   └── KeyboardShortcutsHelp.tsx
│   │
│   ├── layout/                   # Layout components (35+ files)
│   │   ├── ProjectAwareLayout.tsx
│   │   ├── GlobalHeader.tsx      # 331 lines
│   │   ├── MainSidebar.tsx       # 403 lines
│   │   ├── MainLayout.tsx
│   │   ├── IDELayout/            # Modular IDE layout
│   │   └── ...
│   │
│   ├── notes/                    # Notes workspace (50+ files)
│   │   ├── NotesPage.tsx         # 1102 lines - GOD COMPONENT
│   │   ├── NoteEditor.tsx        # 1353 lines - GOD COMPONENT
│   │   ├── AISlashCommand.tsx    # 1674 lines - GOD COMPONENT
│   │   ├── SlashCommandManager.tsx # 657 lines
│   │   ├── InBlockAIPopup.tsx    # 577 lines
│   │   ├── blocks/               # 20+ block types
│   │   │   ├── MultiStepGenerationBlock.tsx # 700 lines
│   │   │   ├── ArtifactGalleryBlock.tsx # 684 lines
│   │   │   ├── VideoGenerationBlock.tsx # 617 lines
│   │   │   └── ...
│   │   └── hooks/
│   │
│   ├── notifications/
│   │   ├── NotificationCenter.tsx # 454 lines
│   │   └── NotificationBadge.tsx
│   │
│   ├── offline/
│   │   └── OfflineIndicator.tsx
│   │
│   ├── onboarding/
│   │   └── LayoutOnboarding.tsx
│   │
│   ├── panels/
│   │   └── index.ts
│   │
│   ├── plugins/                  # Plugin marketplace
│   │   ├── PluginMarketplace.tsx
│   │   ├── PluginSettings.tsx
│   │   └── PluginManager.tsx
│   │
│   ├── project/                  # Project creation
│   │   ├── ProjectCreationWizard.tsx # 530 lines
│   │   ├── ProjectsPage.tsx
│   │   └── steps/
│   │
│   ├── rag/                      # RAG system
│   │   ├── RAGChatPanel.tsx
│   │   ├── RAGSearchPanel.tsx
│   │   └── IndexingProgressPanel.tsx
│   │
│   ├── scheduler/                # Task scheduler
│   │   ├── ScheduledTasksDialog.tsx
│   │   └── TaskEditor.tsx
│   │
│   ├── search/
│   │   ├── AdvancedSearchDialog.tsx
│   │   └── SearchFilters.tsx
│   │
│   ├── settings/
│   │   ├── SettingsExportDialog.tsx
│   │   └── SettingsImportDialog.tsx
│   │
│   ├── sidebar/                  # Sidebar panels
│   │   ├── ProjectSidebar.tsx
│   │   ├── PluginSidebar.tsx
│   │   └── AgentToolsPanel.tsx
│   │
│   ├── snippets/
│   │   ├── SnippetEditor.tsx     # 455 lines
│   │   └── SnippetManager.tsx
│   │
│   ├── templates/
│   │   ├── TemplateCustomization.tsx # 484 lines
│   │   └── TemplateGallery.tsx   # 474 lines
│   │
│   ├── terminal/
│   │   ├── TerminalPanel.tsx
│   │   └── TerminalTabs.tsx
│   │
│   ├── ui/                       # UI Primitives (60+ files)
│   │   ├── resizable.tsx         # 763 lines - GOD COMPONENT
│   │   ├── SkeletonScreen.tsx    # 508 lines
│   │   ├── ApprovalOverlay.tsx   # 443 lines
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── select.tsx
│   │   ├── tabs.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── icons/
│   │   ├── event-indicators/
│   │   ├── activity-indicators/
│   │   ├── Toast/
│   │   └── ...
│   │
│   ├── watcher/
│   │   └── FileChangeDialog.tsx
│   │
│   └── workspace/                # Workspace management
│       ├── WorkspaceSettings.tsx
│       ├── WorkspaceEnhancedSwitcher.tsx
│       └── sync/
│
├── hooks/                        # Global hooks (5 files)
│   ├── useArtifactPreview.ts
│   ├── useChatExport.ts
│   ├── useMarkdownSyncConflict.ts
│   ├── useStorageMode.ts
│   └── useThreadManager.ts
│
└── layouts/                      # Plugin layout system
    ├── PluginLayout.tsx
    ├── PluginLayoutStore.ts
    ├── BentoGridStore.ts
    ├── DraggableBentoCell.tsx
    ├── MobilePluginNav.tsx
    ├── bento-layouts.ts
    └── workflow-presets.ts
```

---

## Components Needing Attention

### Critical: >500 Lines (Immediate Splitting Required)

| Component | Lines | Priority | Split Recommendation |
|-----------|-------|----------|---------------------|
| `notes/AISlashCommand.tsx` | **1674** | P0 | Extract command handlers, UI sections |
| `notes/NoteEditor.tsx` | **1353** | P0 | Extract toolbar, blocks, state hooks |
| `notes/NotesPage.tsx` | **1102** | P0 | Extract panels, modals, sidebars |
| `routes/$__debug__.provider-playground.tsx` | **855** | P1 | Move to dev/ components |
| `ide/MonacoEditor/MonacoEditor.tsx` | **772** | P0 | Extract event handlers, decorations |
| `ui/resizable.tsx` | **763** | P1 | Split panel logic from primitives |
| `notes/blocks/MultiStepGenerationBlock.tsx` | **700** | P1 | Extract step components |
| `ide/AgentChatPanel.tsx` | **691** | P0 | Already partially split, complete it |
| `notes/blocks/ArtifactGalleryBlock.tsx` | **684** | P1 | Extract gallery item, filters |
| `notes/SlashCommandManager.tsx` | **657** | P1 | Extract command groups |
| `notes/blocks/VideoGenerationBlock.tsx` | **617** | P1 | Extract steps, preview |
| `ide/EnhancedChatInterface.tsx` | **602** | P1 | Extract message handling |
| `notes/InBlockAIPopup.tsx` | **577** | P1 | Extract menu sections |
| `notes/blocks/ChartDiagramBlock.tsx` | **568** | P1 | Extract chart types |
| `notes/blocks/TransformPipelineBlock.tsx` | **558** | P1 | Extract stages |
| `notes/blocks/StoryboardBlock.tsx` | **552** | P1 | Extract frames |
| `notes/blocks/VideoBlock.tsx` | **545** | P1 | Extract controls |
| `hub/HubHomePage.tsx` | **540** | P1 | Extract sections |
| `notes/blocks/ReferenceBlock.tsx` | **536** | P1 | Extract preview |
| `routes/settings.tsx` | **532** | P1 | Extract setting groups |
| `project/ProjectCreationWizard.tsx` | **530** | P1 | Extract steps |

### High: 400-500 Lines (Plan for Splitting)

| Component | Lines | Issue |
|-----------|-------|-------|
| `notes/blocks/AIVisionBlock.tsx` | 511 | Extract vision logic |
| `ui/SkeletonScreen.tsx` | 508 | Extract skeleton variants |
| `chat/FileAttachmentInput.tsx` | 492 | Extract file handlers |
| `templates/TemplateCustomization.tsx` | 484 | Extract sections |
| `agent/ProviderConfigDialog.tsx` | 484 | Extract tabs |
| `notes/SaveBlockDialog.tsx` | 483 | Extract form |
| `agent/WorkspacePermissionEditor.tsx` | 479 | Extract grids |
| `notes/blocks/EmbedBlock.tsx` | 477 | Extract embed types |
| `chat/WorkflowBuilder.tsx` | 476 | Extract canvas |
| `templates/TemplateGallery.tsx` | 474 | Extract cards |
| `git/GitMergeConflictResolver.tsx` | 473 | Extract diff view |
| `chat/CodeBlock.tsx` | 465 | Extract copy/highlight |
| `notes/PromptTemplatesDialog.tsx` | 464 | Extract list |
| `ide/SyncStatusPanel.tsx` | 458 | Extract indicators |
| `agent/AgentWorkspaceSwitchingFeedback.tsx` | 458 | Extract animations |
| `analytics/AnalyticsDashboard.tsx` | 457 | Extract charts |
| `snippets/SnippetEditor.tsx` | 455 | Extract monaco |
| `chat/ArtifactPreviewModal.tsx` | 455 | Extract preview |
| `notifications/NotificationCenter.tsx` | 454 | Extract list |
| `chat/ChatHistory.tsx` | 454 | Extract items |

---

## High-Impact Components

### Most Imported (Highest Risk if Changed)

| Component | Import Count | Impact Level |
|-----------|--------------|--------------|
| `ui/button.tsx` | 160+ | CRITICAL |
| `ui/dialog.tsx` | 100+ | CRITICAL |
| `ui/select.tsx` | 80+ | HIGH |
| `ui/tabs.tsx` | 70+ | HIGH |
| `ui/card.tsx` | 65+ | HIGH |
| `ui/badge.tsx` | 55+ | MEDIUM |
| `ui/input.tsx` | 50+ | MEDIUM |
| `ui/textarea.tsx` | 40+ | MEDIUM |
| `common/ErrorBoundary.tsx` | 15+ | HIGH |
| `layout/MainLayout.tsx` | 8 | HIGH |

### Cross-Cutting Dependencies

| Component | Used By |
|-----------|---------|
| `ThemeProvider` | Root (all pages) |
| `TooltipProvider` | Root (all pages) |
| `OverlayRoot` | Root (all dialogs) |
| `ProjectAwareLayout` | All routes |
| `PluginLayout` | All project routes |

---

## Styling Compliance

### Overview

| Metric | Value | Status |
|--------|-------|--------|
| **Tailwind Usage** | 7,695 className refs | GOOD |
| **CSS Token Usage** | 563 var(--) refs | GOOD |
| **CSS Files** | 26 | MEDIUM |
| **Inline Style Violations** | 302 instances | NEEDS WORK |

### CSS Files Distribution

| Location | Count | Purpose |
|----------|-------|---------|
| `src/styles/` | 3 | Global tokens, animations, light theme |
| `notes/blocks/` | 15 | Block-specific CSS modules |
| `ui/` | 1 | ApprovalOverlay.css |
| `about/` | 1 | Portfolio CSS |
| `notes/` | 2 | Editor CSS |
| `workspace/sync/` | 1 | Sync status CSS |

### Files with Inline Style Violations (Top 20)

| File | Issue Type |
|------|------------|
| `analytics/MetricsChart.tsx` | SVG inline styles (acceptable) |
| `collaboration/LiveCursor.tsx` | Position styles (needed) |
| `ui/ProgressBar.tsx` | Dynamic width (needed) |
| `ui/StreamingIndicator.tsx` | Animation styles |
| `chat/WorkflowBuilder.tsx` | Canvas positioning |
| `chat/DebateTimeline.tsx` | Timeline positioning |
| `notes/InBlockAIPopup.tsx` | Popup positioning |
| `notes/VoiceRecordButton.tsx` | Recording animation |
| `ide/EnhancedChatInterface.tsx` | Chat layout |
| `editor/DefinitionTooltip.tsx` | Tooltip positioning |

**Note**: Many inline styles are necessary for dynamic positioning (cursor, tooltips, charts). Focus on eliminating unnecessary inline styles first.

---

## Recommendations

### Immediate Actions (P0)

1. **Split God Components** (>700 lines):
   - `AISlashCommand.tsx` → Extract into ~5 sub-components
   - `NoteEditor.tsx` → Extract toolbar, state hooks, block renderer
   - `NotesPage.tsx` → Extract sidebar, main panel, dialogs
   - `MonacoEditor.tsx` → Extract event handlers, decorations, themes

2. **Standardize Layout Pattern**:
   - All project routes use `PluginLayout` (bento grid)
   - All global routes use `MainLayout` with sidebar
   - Mobile uses `MobilePluginNav` for plugin switching

3. **UI Primitive Audit**:
   - `resizable.tsx` at 763 lines needs splitting
   - Consider extracting ResizableHandle, ResizablePanel as separate files

### Short-Term (P1)

1. **Reduce Inline Styles**:
   - Create CSS utility classes for common patterns
   - Move dynamic styles to CSS variables where possible

2. **Hook Consolidation**:
   - Many components have co-located hooks
   - Consider extracting to `presentation/hooks/` for reuse

3. **Block Component Standardization**:
   - 15+ notes/blocks/ files share patterns
   - Create base block component with composition

### Long-Term (P2)

1. **Design System Documentation**:
   - Document all UI primitives with Storybook
   - Create component usage guidelines

2. **Code Splitting**:
   - Lazy load heavy components (MonacoEditor, Canvas)
   - Use React.lazy for route-level splitting

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         __root.tsx                               │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ Providers: Theme, Locale, Tooltip, Toast, Overlay           │ │
│  │            AppInitializer, UnifiedWorkspaceProvider         │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│                    ProjectAwareLayout                            │
│                              │                                   │
│           ┌──────────────────┴──────────────────┐               │
│           │                                      │               │
│    [Global Routes]                        [Project Routes]       │
│           │                                      │               │
│  ┌────────┴────────┐                    ┌───────┴───────┐       │
│  │ GlobalHeader    │                    │ GlobalHeader  │       │
│  │ MainSidebar     │                    │ PluginLayout  │       │
│  │ Breadcrumbs     │                    │ SystemRail    │       │
│  │ Outlet          │                    └───────────────┘       │
│  │ SystemRail      │                            │               │
│  └─────────────────┘                            │               │
│                                        ┌────────┴────────┐      │
│                                        │ Bento Grid      │      │
│                                        │ ┌─────┬───────┐ │      │
│                                        │ │Chat │Editor │ │      │
│                                        │ ├─────┼───────┤ │      │
│                                        │ │Files│Preview│ │      │
│                                        │ └─────┴───────┘ │      │
│                                        └─────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

---

## File Count Summary by Directory

| Directory | TSX Files | Subdirs |
|-----------|-----------|---------|
| `notes/` | 50+ | 2 |
| `ide/` | 60+ | 8 |
| `agent/` | 45+ | 5 |
| `hub/` | 40+ | 1 |
| `chat/` | 40+ | 1 |
| `ui/` | 60+ | 4 |
| `layout/` | 35+ | 2 |
| `about/` | 20+ | 8 |
| `canvas/` | 10+ | 3 |
| `rag/` | 5 | 1 |
| `git/` | 6 | 0 |
| `project/` | 8 | 1 |

---

**Report Complete**

Generated by: architect-ext
Task Duration: ~15 minutes
Evidence: Direct file scanning + grep analysis
