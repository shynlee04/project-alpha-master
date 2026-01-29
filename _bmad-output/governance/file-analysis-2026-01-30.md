---
id: FILE-ANALYSIS-2026-01-30
title: "311 Files >300 Lines - Categorized Analysis"
created: 2026-01-30
analyst: analyst-ext
status: COMPLETE
---

# File Analysis: 311 Files >300 Lines

## Executive Summary

**Total Files Analyzed**: ~100 source files (excluding tests, node_modules)
**NEW Files**: 15 files (created during UXUI epics, last 3 days)
**OLD/Legacy Files**: 35+ files (archived, deprecated, or superseded)
**ACTIVE Files**: 50+ files (currently in use, need refactoring)

**Key Finding**: ~35% of large files are OLD/LEGACY and should be SKIPPED during refactoring efforts.

---

## Category 1: NEW Files (SKIP - Already Well-Structured)

These files were created during EPIC-UXUI-01, EPIC-UXUI-02, EPIC-UXUI-03 (last 3 days) and follow modern architecture patterns.

### Store Architecture (New Pattern - Zustand Slices)
| File | Lines | Created | Status |
|------|-------|---------|--------|
| `src/infrastructure/persistence/stores/conversation/conversation-store.ts` | ~400 | 2026-01-29 | NEW - Modern slice pattern |
| `src/infrastructure/persistence/stores/conversation/conversation-helpers.ts` | ~350 | 2026-01-29 | NEW - Helper functions |
| `src/infrastructure/persistence/stores/conversation/conversation-types.ts` | ~300 | 2026-01-29 | NEW - Type definitions |
| `src/infrastructure/persistence/stores/agents/agent-selection-store.ts` | ~380 | 2026-01-29 | NEW - Agent selection |
| `src/infrastructure/persistence/stores/agents/slices/index.ts` | ~320 | 2026-01-29 | NEW - Slice exports |
| `src/infrastructure/persistence/stores/providers/provider-crud-slice.ts` | ~360 | 2026-01-29 | NEW - Provider CRUD |
| `src/infrastructure/persistence/stores/providers/provider-models-slice.ts` | ~340 | 2026-01-29 | NEW - Provider models |
| `src/infrastructure/persistence/stores/providers/provider-utils-slice.ts` | ~310 | 2026-01-29 | NEW - Provider utils |
| `src/infrastructure/persistence/stores/plugin-coordination-store.ts` | ~471 | 2026-01-29 | NEW - Plugin coordination |

### Domain & Application Layer (New)
| File | Lines | Created | Status |
|------|-------|---------|--------|
| `src/application/services/ProviderService.ts` | ~450 | 2026-01-29 | NEW - Provider service |
| `src/domain/interfaces/plugin-capability.interface.ts` | ~392 | 2026-01-29 | NEW - Plugin capabilities |
| `src/domain/types/plugin-coordination.types.ts` | ~380 | 2026-01-29 | NEW - Coordination types |
| `src/infrastructure/context/plugin-coordination-context.tsx` | ~370 | 2026-01-29 | NEW - React context |
| `src/infrastructure/tools/centralized-tool-registry.ts` | ~590 | 2026-01-29 | NEW - Tool registry |
| `src/infrastructure/tools/tool-catalog.ts` | ~547 | 2026-01-29 | NEW - Tool catalog |

**Recommendation**: SKIP these files. They use modern Zustand slice patterns and are already well-structured.

---

## Category 2: OLD/Legacy Files (SKIP - Will Be Deleted)

These files are archived, deprecated, superseded, or marked for deletion. DO NOT REFACTOR.

### Phase 2 Archived (AI/Agent Features - Restored Later)
**Location**: `_phase2-archive/` (copies preserved)
**Status**: ARCHIVED - Will be restored in Phase 2

| File | Lines | Reason |
|------|-------|--------|
| `src/application/services/ProviderService.ts` | 1943 | ARCHIVED - Phase 2 feature |
| `src/lib/agent/__tests__/tool-permission-manager.test.ts` | 1094 | ARCHIVED - Phase 2 test |
| `src/lib/agent/hooks/use-agent-chat-with-tools.ts` | 725 | ARCHIVED - Phase 2 hook |
| `src/presentation/components/ide/AgentChatPanel.tsx` | 691 | ARCHIVED - Phase 2 UI |
| `src/lib/agent/tools/note-commands.ts` | 637 | ARCHIVED - Phase 2 tools |
| `src/presentation/components/ide/EnhancedChatInterface.tsx` | 602 | ARCHIVED - Phase 2 UI |
| `src/lib/agent/facades/file-tools-impl.ts` | 587 | ARCHIVED - Phase 2 facade |
| `src/lib/agent/providers/credential-vault.ts` | 543 | ARCHIVED - Phase 2 provider |
| `src/infrastructure/persistence/stores/conversation/useConversationStore.ts` | 495 | ARCHIVED - Phase 2 store |
| `src/infrastructure/persistence/stores/providers/migration-backup.ts` | 561 | ARCHIVED - Phase 2 migration |
| `src/infrastructure/persistence/stores/agents/` | ~2000 total | ARCHIVED - Entire directory |
| `src/infrastructure/persistence/stores/providers/` | ~1500 total | ARCHIVED - Entire directory |
| `src/infrastructure/persistence/stores/conversation/` | ~1800 total | ARCHIVED - Entire directory |
| `src/lib/agent/` | ~8000+ total | ARCHIVED - Entire directory |
| `src/presentation/components/agent/` | ~5000+ total | ARCHIVED - Entire directory |
| `src/domain/tools/` | ~600 total | ARCHIVED - Entire directory |
| `src/infrastructure/tools/` | ~800 total | ARCHIVED - Entire directory |

**Note**: These files have STUB replacements in src/ that return empty/null. The real implementations are in `_phase2-archive/`.

### Layout Cleanup Archive (EPIC-UXUI-02)
**Location**: `_bmad-ext/.archive/layout-cleanup-2026-01-28/`
**Status**: DELETED from src/ - 1,383 lines removed

| File | Lines | Original Location | Reason |
|------|-------|-------------------|--------|
| `IDELayout/` | ~2000 | `src/presentation/components/layout/IDELayout/` | Legacy resizable layouts |
| `IDELayoutMain.tsx` | 393 | `src/presentation/components/layout/` | react-resizable-panels |
| `IDEMobileLayout.tsx` | 268 | `src/presentation/components/ide/` | Not imported |
| `MobileIDELayout.tsx` | 345 | `src/presentation/components/layout/` | Not imported |
| `NotesMobileLayout.tsx` | 289 | `src/presentation/components/notes/` | Not imported |
| `NotesPage.tsx` | 1205 | `src/presentation/components/notes/` | Not imported |
| `MainLayout.tsx` | 74 | `src/presentation/components/layout/` | Not imported |
| `TabletPortraitLayout.tsx` | 272 | `src/presentation/components/layout/` | Not imported |
| `ResponsiveLayoutSwitcher.tsx` | 165 | `src/presentation/components/layout/` | Not imported |
| `layout-presets-store.ts` | 345 | `src/infrastructure/persistence/stores/` | Replaced by workflow-presets |
| `layout-presets.ts` | 172 | `src/presentation/layouts/` | Not imported |
| `layout-utils.ts` | 341 | `src/presentation/layouts/` | Not imported |
| `LayoutRenderers.tsx` | 318 | `src/presentation/layouts/` | Not imported |
| `LayoutPresetPicker.tsx` | 265 | `src/presentation/components/ui/` | Not imported |
| `SavePresetDialog.tsx` | 311 | `src/presentation/components/ui/` | Not imported |
| `LayoutOnboarding.tsx` | 267 | `src/presentation/components/onboarding/` | Not imported |
| `PluginLayout.tsx` | 256 | `src/presentation/layouts/` | Replaced by WorkspaceLayout |
| `PluginPanel.tsx` | 316 | `src/presentation/layouts/` | Not imported |
| `MobilePluginNav.tsx` | 179 | `src/presentation/layouts/` | Not imported |
| `PluginToggles.tsx` | 199 | `src/presentation/components/layout/` | Not imported |
| `PluginToolbar.tsx` | 193 | `src/presentation/components/layout/` | Not imported |
| `PresetSelector.tsx` | 196 | `src/presentation/components/layout/` | Not imported |
| `SidebarQuickActions.tsx` | 257 | `src/presentation/components/layout/` | Not imported |
| `MobileBottomNav.tsx` | 254 | `src/presentation/components/layout/` | Not imported |

### Deferred to Post-MVP (Study & Knowledge Workspaces)
**Status**: @deprecated - Will be removed or kept dormant

| File | Lines | Status |
|------|-------|--------|
| `src/infrastructure/persistence/stores/study/study-store-refactored.ts` | ~400 | @deprecated - Study deferred |
| `src/infrastructure/persistence/stores/study/slices/study-database-slice.ts` | ~350 | @deprecated - Study deferred |
| `src/infrastructure/persistence/stores/study/quiz-store.ts` | ~320 | @deprecated - Study deferred |
| `src/infrastructure/persistence/stores/knowledge/index.ts` | ~380 | @deprecated - Knowledge deferred |
| `src/lib/study/quiz-session.ts` | ~300 | @deprecated - Study deferred |
| `src/lib/study/quiz-generator.ts` | ~280 | @deprecated - Study deferred |
| `src/lib/study/quiz-types.ts` | ~250 | @deprecated - Study deferred |
| `src/lib/knowledge/synthesis-service.ts` | ~320 | @deprecated - Synthesis deferred |
| `src/lib/knowledge/synthesis-types.ts` | ~350 | @deprecated - Synthesis deferred |
| `src/lib/knowledge/types.ts` | ~380 | @deprecated - Knowledge deferred |
| `src/infrastructure/sync/workspace-services/study-file-sync-service.ts` | ~400 | @deprecated - Study deferred |
| `src/infrastructure/sync/workspace-services/knowledge-file-sync-service.ts` | ~420 | @deprecated - Knowledge deferred |
| `src/infrastructure/sync/workspace-services/project-knowledge-sync.ts` | ~380 | @deprecated - Knowledge deferred |

### Deprecated Components (Marked for Deletion)

| File | Lines | Status |
|------|-------|--------|
| `src/presentation/components/Header.tsx` | ~150 | @deprecated - Use GlobalHeader |
| `src/presentation/components/hub/HubHomePage.tsx` | ~441 | ARCHIVED comments - BentoGrid removed |
| `src/presentation/components/common/WorkspaceSwitcher.tsx` | ~280 | @deprecated - Use router navigation |
| `src/infrastructure/persistence/stores/layout-store.ts` | ~379 | @deprecated - Use PluginLayoutStore |
| `src/infrastructure/persistence/stores/use-app-store.ts` | ~379 | @deprecated - Use direct selectors |
| `src/infrastructure/persistence/stores/project/index.ts` | ~400 | @deprecated - Use useProjectStore |
| `src/lib/workspace/threads-store.ts` | ~508 | @deprecated - LEGACY (Epic 51) |
| `src/lib/workspace/temp-project.ts` | ~320 | @deprecated - Use explicit project creation |
| `src/lib/workspace/workspace-access-helper.tsx` | ~508 | @deprecated - Use hub instead |

**Recommendation**: SKIP all these files. They will be deleted in future cleanup passes.

---

## Category 3: ACTIVE Files (PRIORITIZE for Refactoring)

These files are actively imported, used in production, and need refactoring/splitting.

### 🔴 CRITICAL - Core Infrastructure (High Priority)

| File | Lines | Usage | Refactor Priority |
|------|-------|-------|-------------------|
| `src/infrastructure/persistence/dexie-db-migrations.ts` | 1746 | Database migrations | HIGH - Split by version |
| `src/infrastructure/persistence/dexie-db.ts` | 1213 | Core database | HIGH - Extract stores |
| `src/infrastructure/events/event-bus.ts` | 888 | Event system | MEDIUM - Split by event type |
| `src/infrastructure/filesystem/file-tree-scanner.ts` | 833 | File scanning | MEDIUM - Extract utils |
| `src/infrastructure/filesystem/fsa-gateway.ts` | 816 | FSA gateway | MEDIUM - Split adapters |
| `src/infrastructure/filesystem/terminal-fs-adapter.ts` | 751 | Terminal adapter | MEDIUM - Extract platform logic |
| `src/infrastructure/filesystem/markdown-sync-service.ts` | 697 | Sync service | MEDIUM - Split strategies |
| `src/infrastructure/filesystem/viagent-service.ts` | 672 | VIAgent service | MEDIUM - Extract handlers |
| `src/infrastructure/filesystem/fsa-storage-adapter.ts` | 672 | Storage adapter | MEDIUM - Split operations |
| `src/infrastructure/filesystem/handle-persistence.ts` | 605 | Handle persistence | MEDIUM - Extract CRUD |
| `src/infrastructure/filesystem/idb-gateway.ts` | 543 | IDB gateway | MEDIUM - Split by store |
| `src/infrastructure/persistence/workflow-persistence.ts` | 547 | Workflow persistence | MEDIUM - Extract operations |
| `src/infrastructure/persistence/stores/file-tree-store.ts` | 536 | File tree state | MEDIUM - Extract slices |
| `src/infrastructure/persistence/stores/notes/slash-commands/index.ts` | 563 | Slash commands | MEDIUM - Split commands |
| `src/infrastructure/persistence/stores/plugin-coordination-store.ts` | 471 | Plugin coordination | MEDIUM - Already new pattern |

### 🔴 CRITICAL - Domain Services (High Priority)

| File | Lines | Usage | Refactor Priority |
|------|-------|-------|-------------------|
| `src/domain/services/universal-provider-registry.ts` | 724 | Provider registry | HIGH - Split by provider type |
| `src/domain/services/universal-adapter-factory.ts` | 590 | Adapter factory | HIGH - Split by adapter type |
| `src/domain/services/file-crud/unified-file-crud.ts` | 618 | File CRUD | HIGH - Split operations |
| `src/domain/services/ProjectRegistry.ts` | 581 | Project registry | MEDIUM - Extract queries |

### 🟡 HIGH - Presentation Components (Active Use)

| File | Lines | Usage | Refactor Priority |
|------|-------|-------|-------------------|
| `src/presentation/components/notes/AISlashCommand.tsx` | 1674 | AI slash commands | HIGH - Split command handlers |
| `src/presentation/components/notes/NoteEditor.tsx` | 1353 | Main note editor | HIGH - Extract hooks/blocks |
| `src/presentation/components/ide/MonacoEditor/MonacoEditor.tsx` | 773 | Monaco wrapper | HIGH - Extract features |
| `src/plugins/monaco/MonacoMain.tsx` | 534 | Monaco plugin main | HIGH - Split into components |
| `src/presentation/components/notes/SlashCommandManager.tsx` | 657 | Slash command UI | MEDIUM - Extract logic |
| `src/presentation/components/notes/InBlockAIPopup.tsx` | 577 | AI popup | MEDIUM - Extract handlers |
| `src/presentation/components/notes/blocks/MultiStepGenerationBlock.tsx` | 700 | Block type | MEDIUM - Extract steps |
| `src/presentation/components/notes/blocks/ArtifactGalleryBlock.tsx` | 684 | Block type | MEDIUM - Extract gallery |
| `src/presentation/components/notes/blocks/VideoGenerationBlock.tsx` | 618 | Block type | MEDIUM - Extract generation |
| `src/presentation/components/notes/blocks/ChartDiagramBlock.tsx` | 568 | Block type | MEDIUM - Extract charting |
| `src/presentation/components/notes/blocks/TransformPipelineBlock.tsx` | 558 | Block type | MEDIUM - Extract pipeline |
| `src/presentation/components/notes/blocks/StoryboardBlock.tsx` | 552 | Block type | MEDIUM - Extract storyboard |
| `src/presentation/components/notes/blocks/VideoBlock.tsx` | 545 | Block type | MEDIUM - Extract video |
| `src/presentation/components/notes/blocks/ReferenceBlock.tsx` | 536 | Block type | MEDIUM - Extract references |
| `src/presentation/components/notes/blocks/AIVisionBlock.tsx` | 511 | Block type | MEDIUM - Extract vision |
| `src/presentation/components/notes/blocks/EmbedBlock.tsx` | 477 | Block type | LOW - Simple block |
| `src/presentation/components/notes/SaveBlockDialog.tsx` | 483 | Dialog | LOW - Simple dialog |
| `src/presentation/components/notes/PromptTemplatesDialog.tsx` | 464 | Dialog | LOW - Simple dialog |
| `src/presentation/components/notes/AIPromptDialog.tsx` | 446 | Dialog | LOW - Simple dialog |
| `src/presentation/components/notes/AITransformMenu.tsx` | 398 | Menu | LOW - Simple menu |
| `src/presentation/components/notes/MarkdownSyncConflictDialog.tsx` | 398 | Dialog | LOW - Simple dialog |
| `src/presentation/components/notes/NoteCodeBlock.tsx` | 388 | Code block | LOW - Simple block |
| `src/presentation/components/notes/NoteSidebar.tsx` | 427 | Sidebar | MEDIUM - Extract sections |
| `src/presentation/components/notes/NoteSidebarChat.tsx` | ~400 | Sidebar chat | MEDIUM - Extract chat |
| `src/presentation/components/notes/ProjectFilesPanel.tsx` | 428 | Files panel | MEDIUM - Extract tree |
| `src/presentation/components/notes/PromptHistoryPanel.tsx` | 438 | History panel | MEDIUM - Extract list |
| `src/presentation/components/notes/PromptShareDialog.tsx` | 414 | Share dialog | LOW - Simple dialog |
| `src/presentation/components/notes/PromptRefinementDialog.tsx` | 413 | Refinement | LOW - Simple dialog |
| `src/presentation/components/notes/blocks/TTSBlock.tsx` | 393 | TTS block | LOW - Simple block |
| `src/presentation/components/notes/blocks/SlidesExportBlock.tsx` | 446 | Export block | LOW - Simple block |

### 🟡 HIGH - Layout & UI (Active Use)

| File | Lines | Usage | Refactor Priority |
|------|-------|-------|-------------------|
| `src/presentation/layouts/PluginLayoutStore.ts` | 692 | Layout state | MEDIUM - Already sliced |
| `src/presentation/hooks/usePluginPlacement.ts` | 813 | Plugin placement | HIGH - Extract logic |
| `src/presentation/components/ui/resizable.tsx` | 763 | Resizable UI | MEDIUM - Extract panels |
| `src/presentation/components/ui/SkeletonScreen.tsx` | 508 | Skeleton UI | LOW - Simple component |
| `src/presentation/components/ui/ApprovalOverlay.tsx` | 443 | Overlay | LOW - Simple overlay |
| `src/presentation/components/layout/MainSidebar.tsx` | 403 | Main sidebar | MEDIUM - Extract sections |
| `src/presentation/components/layout/PluginDocker.tsx` | 390 | Docker | MEDIUM - Extract plugins |
| `src/presentation/components/layout/FloatingPluginDocker.tsx` | 445 | Floating docker | MEDIUM - Extract logic |
| `src/presentation/components/layout/MainContentRenderer.tsx` | ~350 | Content renderer | MEDIUM - Extract renderers |

### 🟡 HIGH - Library Code (Active Use)

| File | Lines | Usage | Refactor Priority |
|------|-------|-------|-------------------|
| `src/lib/templates/template-registry.ts` | 1321 | Templates | HIGH - Split by category |
| `src/lib/notes/prompt-templates-data.ts` | 850 | Prompt data | MEDIUM - Split by type |
| `src/lib/git/git-client.ts` | 791 | Git client | MEDIUM - Extract operations |
| `src/lib/plugins/plugin-manager.ts` | 659 | Plugin manager | MEDIUM - Extract lifecycle |
| `src/lib/terminal/terminal-emulator.ts` | 611 | Terminal | MEDIUM - Extract handlers |
| `src/lib/notes/markdown-converter.ts` | 574 | Markdown | MEDIUM - Extract converters |
| `src/lib/notes/format/note-formatter.ts` | 561 | Formatter | MEDIUM - Extract formatters |
| `src/lib/notes/slash-command-store.ts` | 541 | Slash store | MEDIUM - Extract commands |
| `src/lib/notes/saved-blocks-store.ts` | 514 | Saved blocks | MEDIUM - Extract operations |
| `src/lib/notes/slices/note-crud-slice.ts` | 507 | CRUD slice | MEDIUM - Already sliced |
| `src/lib/notes/note-file-sync.ts` | 457 | File sync | MEDIUM - Extract sync |
| `src/lib/notes/ai-image-service.ts` | 378 | AI images | MEDIUM - Extract service |
| `src/lib/notes/note-indexer.ts` | 383 | Indexer | MEDIUM - Extract indexing |
| `src/lib/notes/export/note-exporter.ts` | 440 | Exporter | MEDIUM - Extract exporters |
| `src/lib/notes/prompt-sharing-service.ts` | 422 | Sharing | MEDIUM - Extract sharing |
| `src/lib/scheduler/task-scheduler.ts` | 586 | Scheduler | MEDIUM - Extract strategies |
| `src/lib/events/cross-workspace-event-bus.ts` | 583 | Event bus | MEDIUM - Split by workspace |
| `src/lib/rag/incremental-indexing-service.ts` | 646 | RAG indexing | MEDIUM - Extract strategies |
| `src/lib/rag/orama-index.ts` | 644 | Orama index | MEDIUM - Extract operations |
| `src/lib/rag/document-chunker.ts` | 572 | Chunker | MEDIUM - Extract chunkers |
| `src/lib/rag/query-optimizer.ts` | 568 | Query optimizer | MEDIUM - Extract strategies |
| `src/lib/rag/embedding-service.ts` | 532 | Embeddings | MEDIUM - Extract providers |
| `src/lib/rag/hybrid-retriever.ts` | 498 | Retriever | MEDIUM - Extract strategies |
| `src/lib/rag/types.ts` | 529 | RAG types | LOW - Just types |
| `src/lib/rag/pagination.ts` | 437 | Pagination | LOW - Simple utility |
| `src/lib/rag/sync-subscription-service.ts` | 389 | Sync service | MEDIUM - Extract handlers |
| `src/lib/rag/live-api-websocket.ts` | 389 | WebSocket | MEDIUM - Extract handlers |
| `src/lib/rag/audio-playback.ts` | 388 | Audio | LOW - Simple utility |
| `src/lib/navigation/symbol-parser.ts` | 696 | Symbol parser | MEDIUM - Extract parsers |
| `src/lib/navigation/definition-provider.ts` | 432 | Definitions | MEDIUM - Extract providers |
| `src/lib/navigation/symbol-outline.ts` | 419 | Outline | MEDIUM - Extract outline |
| `src/lib/navigation/references-provider.ts` | 382 | References | MEDIUM - Extract providers |
| `src/lib/search/search-indexer.ts` | 530 | Search | MEDIUM - Extract indexers |
| `src/lib/watcher/file-watcher.ts` | 440 | Watcher | MEDIUM - Extract handlers |
| `src/lib/watcher/change-detector.ts` | 377 | Change detector | MEDIUM - Extract detectors |
| `src/lib/canvas/linkage-analyzer.ts` | 470 | Canvas | MEDIUM - Extract analysis |
| `src/lib/collaboration/websocket-client.ts` | 418 | Collaboration | MEDIUM - Extract client |
| `src/lib/settings/settings-serializer.ts` | 487 | Settings | MEDIUM - Extract serializers |
| `src/lib/keyboard/shortcuts.ts` | 459 | Shortcuts | MEDIUM - Extract handlers |
| `src/lib/utils/error-classification.ts` | 563 | Errors | MEDIUM - Extract classifiers |
| `src/lib/utils/error-handling.ts` | 452 | Error handling | MEDIUM - Extract handlers |
| `src/lib/context/ContextInjector.ts` | 398 | Context | MEDIUM - Extract injection |
| `src/lib/analytics/metrics-collector.ts` | 407 | Analytics | MEDIUM - Extract collectors |
| `src/lib/analytics/performance-monitor.ts` | 401 | Performance | MEDIUM - Extract monitors |
| `src/lib/voice/use-voice-recording.ts` | 405 | Voice | MEDIUM - Extract recording |
| `src/lib/diagnostics/trace-system.ts` | 406 | Diagnostics | MEDIUM - Extract tracers |
| `src/lib/workspace/project-repository.ts` | 405 | Repository | MEDIUM - Extract queries |

### 🟡 HIGH - Routes & Components (Active Use)

| File | Lines | Usage | Refactor Priority |
|------|-------|-------|-------------------|
| `src/routes/$__debug__.provider-playground.tsx` | 855 | Debug route | LOW - Debug only |
| `src/routes/settings.tsx` | 534 | Settings page | MEDIUM - Extract sections |
| `src/routes/$projectId.tsx` | 407 | Project route | MEDIUM - Extract layout |
| `src/presentation/components/project/ProjectCreationWizard.tsx` | 530 | Wizard | MEDIUM - Extract steps |
| `src/presentation/components/project/steps/ProjectDetailsStep.tsx` | 425 | Wizard step | LOW - Simple step |
| `src/presentation/components/project/ProjectsPage.tsx` | 402 | Projects page | MEDIUM - Extract list |
| `src/presentation/components/templates/TemplateCustomization.tsx` | 484 | Templates | MEDIUM - Extract sections |
| `src/presentation/components/templates/TemplateGallery.tsx` | 474 | Gallery | MEDIUM - Extract cards |
| `src/presentation/components/git/GitMergeConflictResolver.tsx` | 473 | Git resolver | MEDIUM - Extract resolution |
| `src/presentation/components/git/GitBranchManager.tsx` | 392 | Git branches | MEDIUM - Extract operations |
| `src/presentation/components/ide/SyncStatusPanel.tsx` | 458 | Sync panel | MEDIUM - Extract status |
| `src/presentation/components/snippets/SnippetEditor.tsx` | 455 | Snippets | MEDIUM - Extract editor |
| `src/presentation/components/snippets/SnippetManager.tsx` | 409 | Manager | MEDIUM - Extract list |
| `src/presentation/components/notifications/NotificationCenter.tsx` | 454 | Notifications | MEDIUM - Extract handlers |
| `src/presentation/components/search/SearchResults.tsx` | 403 | Search | MEDIUM - Extract results |
| `src/presentation/components/analytics/AnalyticsDashboard.tsx` | 457 | Analytics | MEDIUM - Extract widgets |
| `src/presentation/components/analytics/MetricsChart.tsx` | 447 | Charts | MEDIUM - Extract chart types |
| `src/presentation/components/about/HeroSection.tsx` | 424 | Hero | LOW - Simple section |
| `src/presentation/components/workspace/WorkspaceEnhancedSwitcher.tsx` | 386 | Switcher | MEDIUM - Extract logic |
| `src/presentation/components/settings/SettingsImportDialog.tsx` | 424 | Import | LOW - Simple dialog |

### 🟡 HIGH - Infrastructure Context & Sync (Active Use)

| File | Lines | Usage | Refactor Priority |
|------|-------|-------|-------------------|
| `src/infrastructure/context/project-context.tsx` | 572 | Project context | MEDIUM - Extract providers |
| `src/infrastructure/sync/pointer-sync-service.ts` | 417 | Pointer sync | MEDIUM - Extract strategies |
| `src/infrastructure/sync/workspace-services/notes/note-folder-bridge.ts` | 386 | Note bridge | MEDIUM - Extract bridge |
| `src/infrastructure/persistence/state-orchestrator.ts` | 427 | Orchestrator | MEDIUM - Extract orchestration |
| `src/infrastructure/webcontainer/fsa-adapter.ts` | 575 | WebContainer | MEDIUM - Extract adapter |

### 🟢 MEDIUM - Types & Configuration (Lower Priority)

| File | Lines | Usage | Refactor Priority |
|------|-------|-------|-------------------|
| `src/domain/types/viagent-metadata.ts` | 466 | Types | LOW - Just types |
| `src/domain/types/llm/provider-types.ts` | 430 | Types | LOW - Just types |
| `src/domain/interfaces/plugin-capability.interface.ts` | 392 | Interfaces | LOW - Just interfaces |
| `src/types/theme.ts` | 376 | Theme types | LOW - Just types |
| `src/styles/design-tokens.ts` | 450 | Design tokens | LOW - Auto-generated |
| `src/hooks/usePlugins.ts` | 447 | Hooks | MEDIUM - Extract hooks |
| `src/hooks/useCodeNavigation.ts` | 380 | Navigation | MEDIUM - Extract navigation |
| `src/hooks/useAdvancedSearch.ts` | 380 | Search | MEDIUM - Extract search |
| `src/routeTree.gen.ts` | 439 | Generated | SKIP - Auto-generated |

### Plugins (Active Use)

| File | Lines | Usage | Refactor Priority |
|------|-------|-------|-------------------|
| `src/plugins/filetree/FileTreePlugin.tsx` | 455 | File tree | MEDIUM - Extract tree |
| `src/plugins/notes/NotesPlugin.tsx` | 414 | Notes | MEDIUM - Extract features |
| `src/plugins/monaco/MonacoPlugin.tsx` | ~300 | Monaco | MEDIUM - Extract features |

---

## Refactoring Priority Matrix

### P0 - Immediate (Health Score Impact)
1. `src/infrastructure/persistence/dexie-db-migrations.ts` (1746 lines)
2. `src/infrastructure/persistence/dexie-db.ts` (1213 lines)
3. `src/presentation/components/notes/AISlashCommand.tsx` (1674 lines)
4. `src/presentation/components/notes/NoteEditor.tsx` (1353 lines)
5. `src/plugins/monaco/MonacoMain.tsx` (534 lines)
6. `src/presentation/components/ide/MonacoEditor/MonacoEditor.tsx` (773 lines)

### P1 - High Priority
7. `src/lib/templates/template-registry.ts` (1321 lines)
8. `src/domain/services/universal-provider-registry.ts` (724 lines)
9. `src/domain/services/universal-adapter-factory.ts` (590 lines)
10. `src/domain/services/file-crud/unified-file-crud.ts` (618 lines)
11. `src/presentation/hooks/usePluginPlacement.ts` (813 lines)
12. All note block components (700-500 lines each)

### P2 - Medium Priority
13. Infrastructure filesystem adapters (800-600 lines)
14. RAG services (600-500 lines)
15. Library utilities (600-400 lines)
16. Presentation components (500-400 lines)

### P3 - Low Priority
17. Types and interfaces
18. Dialog components
19. Debug routes
20. Test files

---

## Recommendations

### Immediate Actions
1. **DO NOT refactor** files in `_phase2-archive/` - they're already archived
2. **DO NOT refactor** files with `@deprecated` or `PHASE 2 ARCHIVED` markers
3. **DO NOT refactor** files in `_bmad-ext/.archive/` - they're already deleted
4. **DO NOT refactor** Study/Knowledge workspace files - deferred to post-MVP

### Refactoring Order
1. Start with **P0 files** - biggest impact on health score
2. Focus on **infrastructure** files first (dexie-db, event-bus)
3. Then **presentation** components (NoteEditor, MonacoMain)
4. Then **domain services** (registries, adapters)
5. Finally **library** utilities

### Expected Impact
- **30 god files** → **10 god files** (target)
- **Health score**: 29.5% → 60%+ (after P0+P1)
- **Lines deleted**: ~15,000+ (removing archived code)

---

## Appendix: File Count Summary

| Category | Count | Lines (approx) | Action |
|----------|-------|----------------|--------|
| NEW files | 15 | ~5,000 | SKIP - Already good |
| OLD/Archived | 35+ | ~25,000 | SKIP - Will delete |
| ACTIVE - P0 | 6 | ~7,000 | PRIORITY 1 |
| ACTIVE - P1 | 15 | ~10,000 | PRIORITY 2 |
| ACTIVE - P2 | 30 | ~15,000 | PRIORITY 3 |
| ACTIVE - P3 | 20 | ~8,000 | PRIORITY 4 |
| **TOTAL** | **~121** | **~70,000** | - |

---

*Analysis completed: 2026-01-30*
*Analyst: analyst-ext*
*Method: Git history analysis, import tracing, deprecation marker scanning*
