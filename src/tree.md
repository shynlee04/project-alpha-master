.
|-- ./application
|   `-- ./application/services
|       |-- ./application/services/AgentService.ts
|       `-- ./application/services/ProviderService.ts
|-- ./codetree-2026-01-04.md
|-- ./codetree-2026-04-01.md
|-- ./codetree-for-analysi-2.mds
|-- ./codetree-for-analysis.md
|-- ./components
|   `-- ./components/rag
|       |-- ./components/rag/CitationCountBadge.tsx
|       |-- ./components/rag/CitationSidebar.tsx
|       `-- ./components/rag/index.ts
|-- ./core
|   |-- ./core/entities
|   |   |-- ./core/entities/Agent.ts
|   |   |-- ./core/entities/Conversation.ts
|   |   |-- ./core/entities/Provider.ts
|   |   `-- ./core/entities/Tool.ts
|   `-- ./core/index.ts
|-- ./data
|   |-- ./data/demo.punk-songs.ts
|   `-- ./data/mock-sources.json
|-- ./domain
|   |-- ./domain/entities
|   |   `-- ./domain/entities/agent.ts
|   |-- ./domain/services
|   |   |-- ./domain/services/agent-orchestration-service.ts
|   |   |-- ./domain/services/agent-workspace-utils.ts
|   |   |-- ./domain/services/AgentProviderValidator.ts
|   |   |-- ./domain/services/index.ts
|   |   `-- ./domain/services/workspace-transition-service.ts
|   |-- ./domain/use-cases
|   |   `-- ./domain/use-cases/switch-workspace-use-case.ts
|   `-- ./domain/value-objects
|       |-- ./domain/value-objects/tool-permission.ts
|       |-- ./domain/value-objects/workspace-binding.ts
|       `-- ./domain/value-objects/workspace-type.ts
|-- ./e2e
|-- ./global-types.d.ts
|-- ./hooks
|   |-- ./hooks/index.ts
|   |-- ./hooks/use-cross-workspace-events.ts
|   |-- ./hooks/useAdvancedSearch.ts
|   |-- ./hooks/useAgents.ts
|   |-- ./hooks/useAnalytics.ts
|   |-- ./hooks/useCanvasDrop.ts
|   |-- ./hooks/useCapabilityDetection.test.ts
|   |-- ./hooks/useCapabilityDetection.ts
|   |-- ./hooks/useChatHistory.ts
|   |-- ./hooks/useCodeFormatter.ts
|   |-- ./hooks/useCodeNavigation.ts
|   |-- ./hooks/useCodeSnippets.ts
|   |-- ./hooks/useCollaborationPresence.ts
|   |-- ./hooks/useCommandPalette.ts
|   |-- ./hooks/useEditorTabs.ts
|   |-- ./hooks/useFileDiff.ts
|   |-- ./hooks/useFileWatcher.ts
|   |-- ./hooks/useGit.ts
|   |-- ./hooks/useIdeStatePersistence.ts
|   |-- ./hooks/useKeyboardShortcuts.ts
|   |-- ./hooks/useMediaQuery.ts
|   |-- ./hooks/useNotifications.ts
|   |-- ./hooks/useOfflineStatus.ts
|   |-- ./hooks/usePlugins.ts
|   |-- ./hooks/useProcessManager.ts
|   |-- ./hooks/useProjectTemplates.ts
|   |-- ./hooks/useQuizSession.ts
|   |-- ./hooks/useQuizTimer.ts
|   |-- ./hooks/useResponsive.ts
|   |-- ./hooks/useStoreHydration.ts
|   |-- ./hooks/useTaskScheduler.ts
|   |-- ./hooks/useTerminal.ts
|   |-- ./hooks/useUnsavedWorkPreservation.ts
|   `-- ./hooks/useWorkspaceContext.ts
|-- ./i18n
|   |-- ./i18n/config.ts
|   |-- ./i18n/en
|   |   |-- ./i18n/en/chat.json
|   |   |-- ./i18n/en/rag.json
|   |   `-- ./i18n/en/voice.json
|   |-- ./i18n/en.json
|   |-- ./i18n/en.json.backup
|   |-- ./i18n/LocaleProvider.tsx
|   |-- ./i18n/vi
|   |   |-- ./i18n/vi/chat.json
|   |   |-- ./i18n/vi/rag.json
|   |   `-- ./i18n/vi/voice.json
|   |-- ./i18n/vi.json
|   |-- ./i18n/vi.json.backup
|   `-- ./i18n/vi.json.tmp
|-- ./infrastructure
|   |-- ./infrastructure/codetree-2026-01-04.md
|   |-- ./infrastructure/codetree-for-analysis.md
|   |-- ./infrastructure/events
|   |   |-- ./infrastructure/events/cross-workspace-event-bus.ts
|   |   |-- ./infrastructure/events/event-bus.ts
|   |   `-- ./infrastructure/events/index.ts
|   |-- ./infrastructure/persistence
|   |   |-- ./infrastructure/persistence/codetree-2026-01-04.md
|   |   |-- ./infrastructure/persistence/database-recovery.ts
|   |   |-- ./infrastructure/persistence/dexie-db-ai-types.ts
|   |   |-- ./infrastructure/persistence/dexie-db-class.ts
|   |   |-- ./infrastructure/persistence/dexie-db-core-types.ts
|   |   |-- ./infrastructure/persistence/dexie-db-helpers
|   |   |   |-- ./infrastructure/persistence/dexie-db-helpers/additional-file-metadata-helpers.ts
|   |   |   |-- ./infrastructure/persistence/dexie-db-helpers/collection-helpers-basic.ts
|   |   |   |-- ./infrastructure/persistence/dexie-db-helpers/collection-helpers-sources.ts
|   |   |   |-- ./infrastructure/persistence/dexie-db-helpers/conversation-thread-helpers.ts
|   |   |   |-- ./infrastructure/persistence/dexie-db-helpers/file-metadata-helpers.ts
|   |   |   |-- ./infrastructure/persistence/dexie-db-helpers/fsa-handle-helpers.ts
|   |   |   |-- ./infrastructure/persistence/dexie-db-helpers/ide-state-helpers.ts
|   |   |   |-- ./infrastructure/persistence/dexie-db-helpers/index.ts
|   |   |   |-- ./infrastructure/persistence/dexie-db-helpers/session-snapshot-helpers.ts
|   |   |   |-- ./infrastructure/persistence/dexie-db-helpers/source-helpers-basic.ts
|   |   |   |-- ./infrastructure/persistence/dexie-db-helpers/source-helpers-search.ts
|   |   |   |-- ./infrastructure/persistence/dexie-db-helpers/sync-status-helpers-basic.ts
|   |   |   |-- ./infrastructure/persistence/dexie-db-helpers/sync-status-helpers-query.ts
|   |   |   |-- ./infrastructure/persistence/dexie-db-helpers/synthesis-result-helpers-create.ts
|   |   |   |-- ./infrastructure/persistence/dexie-db-helpers/synthesis-result-helpers-crud.ts
|   |   |   `-- ./infrastructure/persistence/dexie-db-helpers/tool-execution-log-helpers.ts
|   |   |-- ./infrastructure/persistence/dexie-db-helpers.ts
|   |   |-- ./infrastructure/persistence/dexie-db-knowledge-types.ts
|   |   |-- ./infrastructure/persistence/dexie-db-migrations.ts
|   |   |-- ./infrastructure/persistence/dexie-db-plugin-types.ts
|   |   |-- ./infrastructure/persistence/dexie-db-session-types.ts
|   |   |-- ./infrastructure/persistence/dexie-db-snippet-types.ts
|   |   |-- ./infrastructure/persistence/dexie-db-types.ts
|   |   |-- ./infrastructure/persistence/dexie-db-workflow-types.ts
|   |   |-- ./infrastructure/persistence/dexie-db.ts
|   |   |-- ./infrastructure/persistence/dexie-storage.ts
|   |   |-- ./infrastructure/persistence/index.ts
|   |   |-- ./infrastructure/persistence/rag-store-helpers.ts
|   |   |-- ./infrastructure/persistence/rag-store-types.ts
|   |   |-- ./infrastructure/persistence/state-orchestrator.ts
|   |   |-- ./infrastructure/persistence/stores
|   |   |   |-- ./infrastructure/persistence/stores/agents
|   |   |   |   |-- ./infrastructure/persistence/stores/agents/agent-selection-store.backup.ts
|   |   |   |   |-- ./infrastructure/persistence/stores/agents/agent-selection-store.ts
|   |   |   |   |-- ./infrastructure/persistence/stores/agents/index.ts
|   |   |   |   |-- ./infrastructure/persistence/stores/agents/slices
|   |   |   |   |   |-- ./infrastructure/persistence/stores/agents/slices/agent-crud-slice.ts
|   |   |   |   |   |-- ./infrastructure/persistence/stores/agents/slices/agent-events-slice.ts
|   |   |   |   |   |-- ./infrastructure/persistence/stores/agents/slices/agent-selection-actions.ts
|   |   |   |   |   |-- ./infrastructure/persistence/stores/agents/slices/agent-selection-events.ts
|   |   |   |   |   |-- ./infrastructure/persistence/stores/agents/slices/agent-selection-queries.ts
|   |   |   |   |   |-- ./infrastructure/persistence/stores/agents/slices/agent-selection-state.ts
|   |   |   |   |   |-- ./infrastructure/persistence/stores/agents/slices/agent-selection-utils.ts
|   |   |   |   |   |-- ./infrastructure/persistence/stores/agents/slices/agent-utils-slice.ts
|   |   |   |   |   |-- ./infrastructure/persistence/stores/agents/slices/agent-validation-slice.ts
|   |   |   |   |   |-- ./infrastructure/persistence/stores/agents/slices/agent-workspace-bindings-slice.ts
|   |   |   |   |   `-- ./infrastructure/persistence/stores/agents/slices/index.ts
|   |   |   |   `-- ./infrastructure/persistence/stores/agents/types.ts
|   |   |   |-- ./infrastructure/persistence/stores/agents-store.test.ts
|   |   |   |-- ./infrastructure/persistence/stores/analytics-store.ts
|   |   |   |-- ./infrastructure/persistence/stores/auto-approve-store.ts
|   |   |   |-- ./infrastructure/persistence/stores/canvas
|   |   |   |   |-- ./infrastructure/persistence/stores/canvas/canvas-db.ts
|   |   |   |   |-- ./infrastructure/persistence/stores/canvas/canvas-types.ts
|   |   |   |   |-- ./infrastructure/persistence/stores/canvas/canvas-utils.ts
|   |   |   |   |-- ./infrastructure/persistence/stores/canvas/index.ts
|   |   |   |   |-- ./infrastructure/persistence/stores/canvas/slices
|   |   |   |   |   |-- ./infrastructure/persistence/stores/canvas/slices/canvas-io-slice.ts
|   |   |   |   |   |-- ./infrastructure/persistence/stores/canvas/slices/canvas-linkage-slice.ts
|   |   |   |   |   |-- ./infrastructure/persistence/stores/canvas/slices/canvas-multi-slice.ts
|   |   |   |   |   |-- ./infrastructure/persistence/stores/canvas/slices/canvas-persistence-slice.ts
|   |   |   |   |   `-- ./infrastructure/persistence/stores/canvas/slices/canvas-state-slice.ts
|   |   |   |   `-- ./infrastructure/persistence/stores/canvas/types.ts
|   |   |   |-- ./infrastructure/persistence/stores/canvas-store.ts
|   |   |   |-- ./infrastructure/persistence/stores/chat
|   |   |   |   |-- ./infrastructure/persistence/stores/chat/chat-settings-store.ts
|   |   |   |   `-- ./infrastructure/persistence/stores/chat/index.ts
|   |   |   |-- ./infrastructure/persistence/stores/conversation
|   |   |   |   |-- ./infrastructure/persistence/stores/conversation/conversation-events-slice.ts
|   |   |   |   |-- ./infrastructure/persistence/stores/conversation/conversation-helpers.ts
|   |   |   |   |-- ./infrastructure/persistence/stores/conversation/conversation-metadata-slice.ts
|   |   |   |   |-- ./infrastructure/persistence/stores/conversation/conversation-store.ts
|   |   |   |   |-- ./infrastructure/persistence/stores/conversation/conversation-types.ts
|   |   |   |   |-- ./infrastructure/persistence/stores/conversation/conversation-utils-slice.ts
|   |   |   |   |-- ./infrastructure/persistence/stores/conversation/conversation-validation-slice.ts
|   |   |   |   |-- ./infrastructure/persistence/stores/conversation/event-types.ts
|   |   |   |   |-- ./infrastructure/persistence/stores/conversation/index.ts
|   |   |   |   |-- ./infrastructure/persistence/stores/conversation/message-crud-slice.ts
|   |   |   |   |-- ./infrastructure/persistence/stores/conversation/migration
|   |   |   |   |   `-- ./infrastructure/persistence/stores/conversation/migration/conversation-migration.ts
|   |   |   |   |-- ./infrastructure/persistence/stores/conversation/slices
|   |   |   |   |   |-- ./infrastructure/persistence/stores/conversation/slices/create-context-window-slice.ts
|   |   |   |   |   |-- ./infrastructure/persistence/stores/conversation/slices/create-hierarchy-slice.ts
|   |   |   |   |   |-- ./infrastructure/persistence/stores/conversation/slices/create-message-slice.ts
|   |   |   |   |   |-- ./infrastructure/persistence/stores/conversation/slices/create-metadata-slice.ts
|   |   |   |   |   |-- ./infrastructure/persistence/stores/conversation/slices/create-project-state-slice.ts
|   |   |   |   |   |-- ./infrastructure/persistence/stores/conversation/slices/create-thread-crud-slice.ts
|   |   |   |   |   `-- ./infrastructure/persistence/stores/conversation/slices/index.ts
|   |   |   |   |-- ./infrastructure/persistence/stores/conversation/thread-management-slice.ts
|   |   |   |   |-- ./infrastructure/persistence/stores/conversation/types.ts
|   |   |   |   `-- ./infrastructure/persistence/stores/conversation/useConversationStore.ts
|   |   |   |-- ./infrastructure/persistence/stores/conversation-auto-restore.ts
|   |   |   |-- ./infrastructure/persistence/stores/editor-tabs
|   |   |   |   |-- ./infrastructure/persistence/stores/editor-tabs/editor-tabs-crud-slice.ts
|   |   |   |   |-- ./infrastructure/persistence/stores/editor-tabs/editor-tabs-position-slice.ts
|   |   |   |   |-- ./infrastructure/persistence/stores/editor-tabs/editor-tabs-state-slice.ts
|   |   |   |   `-- ./infrastructure/persistence/stores/editor-tabs/index.ts
|   |   |   |-- ./infrastructure/persistence/stores/editor-tabs-store.ts
|   |   |   |-- ./infrastructure/persistence/stores/editor-tabs-store.ts.backup
|   |   |   |-- ./infrastructure/persistence/stores/events
|   |   |   |   `-- ./infrastructure/persistence/stores/events/event-status-store.ts
|   |   |   |-- ./infrastructure/persistence/stores/file-watcher-store.ts
|   |   |   |-- ./infrastructure/persistence/stores/filesystem
|   |   |   |   |-- ./infrastructure/persistence/stores/filesystem/index.ts
|   |   |   |   |-- ./infrastructure/persistence/stores/filesystem/snapshot-bulk-ops-slice.ts
|   |   |   |   |-- ./infrastructure/persistence/stores/filesystem/snapshot-cache-slice.ts
|   |   |   |   |-- ./infrastructure/persistence/stores/filesystem/snapshot-metadata-slice.ts
|   |   |   |   |-- ./infrastructure/persistence/stores/filesystem/snapshot-quota-slice.ts
|   |   |   |   |-- ./infrastructure/persistence/stores/filesystem/snapshot-types.ts
|   |   |   |   `-- ./infrastructure/persistence/stores/filesystem/useFileSnapshotStore.ts
|   |   |   |-- ./infrastructure/persistence/stores/flashcard
|   |   |   |   |-- ./infrastructure/persistence/stores/flashcard/flashcard-db.ts
|   |   |   |   |-- ./infrastructure/persistence/stores/flashcard/flashcard-utils.ts
|   |   |   |   |-- ./infrastructure/persistence/stores/flashcard/index.ts
|   |   |   |   `-- ./infrastructure/persistence/stores/flashcard/slices
|   |   |   |       |-- ./infrastructure/persistence/stores/flashcard/slices/flashcard-crud-slice.ts
|   |   |   |       |-- ./infrastructure/persistence/stores/flashcard/slices/flashcard-filter-slice.ts
|   |   |   |       |-- ./infrastructure/persistence/stores/flashcard/slices/flashcard-operations-slice.ts
|   |   |   |       |-- ./infrastructure/persistence/stores/flashcard/slices/flashcard-persistence-slice.ts
|   |   |   |       `-- ./infrastructure/persistence/stores/flashcard/slices/flashcard-set-crud-slice.ts
|   |   |   |-- ./infrastructure/persistence/stores/flashcard-store.ts
|   |   |   |-- ./infrastructure/persistence/stores/git
|   |   |   |   |-- ./infrastructure/persistence/stores/git/git-branch-slice.ts
|   |   |   |   |-- ./infrastructure/persistence/stores/git/git-client-slice.ts
|   |   |   |   |-- ./infrastructure/persistence/stores/git/git-operations-slice.ts
|   |   |   |   |-- ./infrastructure/persistence/stores/git/git-status-slice.ts
|   |   |   |   `-- ./infrastructure/persistence/stores/git/index.ts
|   |   |   |-- ./infrastructure/persistence/stores/git-store.ts
|   |   |   |-- ./infrastructure/persistence/stores/git-store.ts.backup
|   |   |   |-- ./infrastructure/persistence/stores/hub-store.ts
|   |   |   |-- ./infrastructure/persistence/stores/hydration-manager.ts
|   |   |   |-- ./infrastructure/persistence/stores/ide
|   |   |   |   |-- ./infrastructure/persistence/stores/ide/ide-editor-slice.ts
|   |   |   |   |-- ./infrastructure/persistence/stores/ide/ide-explorer-slice.ts
|   |   |   |   |-- ./infrastructure/persistence/stores/ide/ide-layout-slice.ts
|   |   |   |   |-- ./infrastructure/persistence/stores/ide/ide-project-slice.ts
|   |   |   |   |-- ./infrastructure/persistence/stores/ide/ide-selectors-slice.ts
|   |   |   |   |-- ./infrastructure/persistence/stores/ide/ide-state-storage.ts
|   |   |   |   |-- ./infrastructure/persistence/stores/ide/ide-terminal-slice.ts
|   |   |   |   |-- ./infrastructure/persistence/stores/ide/ide-types.ts
|   |   |   |   |-- ./infrastructure/persistence/stores/ide/index.ts
|   |   |   |   `-- ./infrastructure/persistence/stores/ide/useIDEStore.ts
|   |   |   |-- ./infrastructure/persistence/stores/index.ts
|   |   |   |-- ./infrastructure/persistence/stores/knowledge
|   |   |   |   |-- ./infrastructure/persistence/stores/knowledge/index.ts
|   |   |   |   |-- ./infrastructure/persistence/stores/knowledge/knowledge-store.ts
|   |   |   |   |-- ./infrastructure/persistence/stores/knowledge/slices
|   |   |   |   |   |-- ./infrastructure/persistence/stores/knowledge/slices/knowledge-collection-slice.ts
|   |   |   |   |   |-- ./infrastructure/persistence/stores/knowledge/slices/knowledge-metadata-slice.ts
|   |   |   |   |   |-- ./infrastructure/persistence/stores/knowledge/slices/knowledge-preview-slice.ts
|   |   |   |   |   |-- ./infrastructure/persistence/stores/knowledge/slices/knowledge-source-crud-slice.ts
|   |   |   |   |   |-- ./infrastructure/persistence/stores/knowledge/slices/knowledge-synthesis-slice.ts
|   |   |   |   |   `-- ./infrastructure/persistence/stores/knowledge/slices/knowledge-undo-slice.ts
|   |   |   |   `-- ./infrastructure/persistence/stores/knowledge/types.ts
|   |   |   |-- ./infrastructure/persistence/stores/layout-store.ts
|   |   |   |-- ./infrastructure/persistence/stores/navigation-store.ts
|   |   |   |-- ./infrastructure/persistence/stores/notification-store.ts
|   |   |   |-- ./infrastructure/persistence/stores/notification-store.ts.backup
|   |   |   |-- ./infrastructure/persistence/stores/notifications
|   |   |   |   |-- ./infrastructure/persistence/stores/notifications/index.ts
|   |   |   |   |-- ./infrastructure/persistence/stores/notifications/notification-crud-slice.ts
|   |   |   |   |-- ./infrastructure/persistence/stores/notifications/notification-filter-slice.ts
|   |   |   |   `-- ./infrastructure/persistence/stores/notifications/notification-preferences-slice.ts
|   |   |   |-- ./infrastructure/persistence/stores/openai-compatible-store.ts
|   |   |   |-- ./infrastructure/persistence/stores/permissions
|   |   |   |   |-- ./infrastructure/persistence/stores/permissions/constants.ts
|   |   |   |   |-- ./infrastructure/persistence/stores/permissions/index.ts
|   |   |   |   |-- ./infrastructure/persistence/stores/permissions/migrations.ts
|   |   |   |   |-- ./infrastructure/persistence/stores/permissions/selectors.ts
|   |   |   |   |-- ./infrastructure/persistence/stores/permissions/slices
|   |   |   |   |   `-- ./infrastructure/persistence/stores/permissions/slices/permission-actions-slice.ts
|   |   |   |   |-- ./infrastructure/persistence/stores/permissions/tool-permission-store.ts
|   |   |   |   `-- ./infrastructure/persistence/stores/permissions/types.ts
|   |   |   |-- ./infrastructure/persistence/stores/plugins-store.ts
|   |   |   |-- ./infrastructure/persistence/stores/project
|   |   |   |   |-- ./infrastructure/persistence/stores/project/index.ts
|   |   |   |   |-- ./infrastructure/persistence/stores/project/migrate-bindings.ts
|   |   |   |   |-- ./infrastructure/persistence/stores/project/project-bindings-slice.ts
|   |   |   |   |-- ./infrastructure/persistence/stores/project/project-crud-slice.ts
|   |   |   |   |-- ./infrastructure/persistence/stores/project/project-layout-slice.ts
|   |   |   |   |-- ./infrastructure/persistence/stores/project/project-permissions-slice.ts
|   |   |   |   |-- ./infrastructure/persistence/stores/project/project-types.ts
|   |   |   |   |-- ./infrastructure/persistence/stores/project/project-utils-slice.ts
|   |   |   |   |-- ./infrastructure/persistence/stores/project/useProjectStore.ts
|   |   |   |   `-- ./infrastructure/persistence/stores/project/useWorkspaceProjects.ts
|   |   |   |-- ./infrastructure/persistence/stores/prompt-enhancement-store.ts
|   |   |   |-- ./infrastructure/persistence/stores/providers
|   |   |   |   |-- ./infrastructure/persistence/stores/providers/index.ts
|   |   |   |   |-- ./infrastructure/persistence/stores/providers/migrate-api-keys-to-vault.ts
|   |   |   |   |-- ./infrastructure/persistence/stores/providers/migration-backup.ts
|   |   |   |   |-- ./infrastructure/persistence/stores/providers/provider-crud-slice.ts
|   |   |   |   |-- ./infrastructure/persistence/stores/providers/provider-models-slice.ts
|   |   |   |   |-- ./infrastructure/persistence/stores/providers/provider-utils-slice.ts
|   |   |   |   |-- ./infrastructure/persistence/stores/providers/types.ts
|   |   |   |   `-- ./infrastructure/persistence/stores/providers/use-migration-state.ts
|   |   |   |-- ./infrastructure/persistence/stores/quiz-history-store.ts
|   |   |   |-- ./infrastructure/persistence/stores/rag
|   |   |   |   |-- ./infrastructure/persistence/stores/rag/index.ts
|   |   |   |   |-- ./infrastructure/persistence/stores/rag/rag-chat-slice.ts
|   |   |   |   |-- ./infrastructure/persistence/stores/rag/rag-chunking-slice.ts
|   |   |   |   |-- ./infrastructure/persistence/stores/rag/rag-helpers.ts
|   |   |   |   |-- ./infrastructure/persistence/stores/rag/rag-index-slice.ts
|   |   |   |   |-- ./infrastructure/persistence/stores/rag/rag-search-slice.ts
|   |   |   |   |-- ./infrastructure/persistence/stores/rag/rag-store.ts
|   |   |   |   |-- ./infrastructure/persistence/stores/rag/rag-types.ts
|   |   |   |   `-- ./infrastructure/persistence/stores/rag/rag-voice-slice.ts
|   |   |   |-- ./infrastructure/persistence/stores/schema-migrations.ts
|   |   |   |-- ./infrastructure/persistence/stores/session-snapshot-manager.ts
|   |   |   |-- ./infrastructure/persistence/stores/statusbar-store.ts
|   |   |   |-- ./infrastructure/persistence/stores/study
|   |   |   |   |-- ./infrastructure/persistence/stores/study/index.ts
|   |   |   |   |-- ./infrastructure/persistence/stores/study/quiz
|   |   |   |   |   |-- ./infrastructure/persistence/stores/study/quiz/quiz-db.ts
|   |   |   |   |   |-- ./infrastructure/persistence/stores/study/quiz/slices
|   |   |   |   |   |   |-- ./infrastructure/persistence/stores/study/quiz/slices/question-management-slice.ts
|   |   |   |   |   |   |-- ./infrastructure/persistence/stores/study/quiz/slices/quiz-management-slice.ts
|   |   |   |   |   |   |-- ./infrastructure/persistence/stores/study/quiz/slices/quiz-query-slice.ts
|   |   |   |   |   |   `-- ./infrastructure/persistence/stores/study/quiz/slices/quiz-ui-slice.ts
|   |   |   |   |   `-- ./infrastructure/persistence/stores/study/quiz/types.ts
|   |   |   |   |-- ./infrastructure/persistence/stores/study/quiz-store.ts
|   |   |   |   |-- ./infrastructure/persistence/stores/study/slices
|   |   |   |   |   |-- ./infrastructure/persistence/stores/study/slices/study-database-slice.ts
|   |   |   |   |   |-- ./infrastructure/persistence/stores/study/slices/study-navigation-slice.ts
|   |   |   |   |   |-- ./infrastructure/persistence/stores/study/slices/study-session-slice.ts
|   |   |   |   |   `-- ./infrastructure/persistence/stores/study/slices/study-stats-slice.ts
|   |   |   |   `-- ./infrastructure/persistence/stores/study/study-store-refactored.ts
|   |   |   |-- ./infrastructure/persistence/stores/study-store.ts
|   |   |   |-- ./infrastructure/persistence/stores/synthesis-store.ts
|   |   |   |-- ./infrastructure/persistence/stores/terminal-store.ts
|   |   |   |-- ./infrastructure/persistence/stores/types.ts
|   |   |   |-- ./infrastructure/persistence/stores/use-app-store.ts
|   |   |   `-- ./infrastructure/persistence/stores/workspace
|   |   |       |-- ./infrastructure/persistence/stores/workspace/index.ts
|   |   |       |-- ./infrastructure/persistence/stores/workspace/unified-workspace-context.ts
|   |   |       |-- ./infrastructure/persistence/stores/workspace/unified-workspace-provider.tsx
|   |   |       |-- ./infrastructure/persistence/stores/workspace/useCornerstoneStores.ts
|   |   |       |-- ./infrastructure/persistence/stores/workspace/useWorkspaceFileSystem.ts
|   |   |       |-- ./infrastructure/persistence/stores/workspace/useWorkspaceSwitching.ts
|   |   |       |-- ./infrastructure/persistence/stores/workspace/workspace-context.ts
|   |   |       |-- ./infrastructure/persistence/stores/workspace/workspace-provider.tsx
|   |   |       |-- ./infrastructure/persistence/stores/workspace/workspace-store.ts
|   |   |       `-- ./infrastructure/persistence/stores/workspace/workspace-types.ts
|   |   |-- ./infrastructure/persistence/workflow-persistence.test.ts
|   |   `-- ./infrastructure/persistence/workflow-persistence.ts
|   |-- ./infrastructure/sync
|   |   |-- ./infrastructure/sync/adapters
|   |   |   |-- ./infrastructure/sync/adapters/adapter-errors.ts
|   |   |   |-- ./infrastructure/sync/adapters/adapter-factory.ts
|   |   |   |-- ./infrastructure/sync/adapters/base-adapter.ts
|   |   |   |-- ./infrastructure/sync/adapters/fsa-adapter-core.ts
|   |   |   |-- ./infrastructure/sync/adapters/fsa-adapter-types.ts
|   |   |   |-- ./infrastructure/sync/adapters/fsa-adapter-utils.ts
|   |   |   |-- ./infrastructure/sync/adapters/fsa-adapter.ts
|   |   |   |-- ./infrastructure/sync/adapters/fsa-file-watcher.ts
|   |   |   |-- ./infrastructure/sync/adapters/fsa-path-operations.ts
|   |   |   |-- ./infrastructure/sync/adapters/fsa-permission-manager.ts
|   |   |   |-- ./infrastructure/sync/adapters/idb-adapter-core.ts
|   |   |   |-- ./infrastructure/sync/adapters/idb-adapter-factory.ts
|   |   |   |-- ./infrastructure/sync/adapters/idb-adapter-types.ts
|   |   |   |-- ./infrastructure/sync/adapters/idb-adapter-utils.ts
|   |   |   |-- ./infrastructure/sync/adapters/idb-adapter.ts
|   |   |   |-- ./infrastructure/sync/adapters/idb-crud.ts
|   |   |   |-- ./infrastructure/sync/adapters/idb-database.ts
|   |   |   |-- ./infrastructure/sync/adapters/idb-eviction.ts
|   |   |   `-- ./infrastructure/sync/adapters/idb-quota-manager.ts
|   |   |-- ./infrastructure/sync/bridges
|   |   |   `-- ./infrastructure/sync/bridges/note-folder-bridge.ts
|   |   |-- ./infrastructure/sync/core
|   |   |   |-- ./infrastructure/sync/core/event-emitters.ts
|   |   |   |-- ./infrastructure/sync/core/event-types.ts
|   |   |   |-- ./infrastructure/sync/core/file-types.ts
|   |   |   |-- ./infrastructure/sync/core/file-watcher.ts
|   |   |   |-- ./infrastructure/sync/core/quota-types.ts
|   |   |   |-- ./infrastructure/sync/core/sync-config.ts
|   |   |   |-- ./infrastructure/sync/core/sync-core-types.ts
|   |   |   |-- ./infrastructure/sync/core/sync-engine-core.ts
|   |   |   |-- ./infrastructure/sync/core/sync-engine-state.ts
|   |   |   |-- ./infrastructure/sync/core/sync-engine-types.ts
|   |   |   |-- ./infrastructure/sync/core/sync-engine.ts
|   |   |   |-- ./infrastructure/sync/core/sync-event-bus.ts
|   |   |   |-- ./infrastructure/sync/core/sync-events.ts
|   |   |   |-- ./infrastructure/sync/core/sync-result-types.ts
|   |   |   `-- ./infrastructure/sync/core/sync-types.ts
|   |   |-- ./infrastructure/sync/index.ts
|   |   |-- ./infrastructure/sync/strategies
|   |   |   |-- ./infrastructure/sync/strategies/bidirectional-sync-core.ts
|   |   |   |-- ./infrastructure/sync/strategies/bidirectional-sync.ts
|   |   |   |-- ./infrastructure/sync/strategies/conflict-detection.ts
|   |   |   |-- ./infrastructure/sync/strategies/conflict-resolution.ts
|   |   |   |-- ./infrastructure/sync/strategies/conflict-resolver.ts
|   |   |   |-- ./infrastructure/sync/strategies/file-comparison-types.ts
|   |   |   |-- ./infrastructure/sync/strategies/index.ts
|   |   |   |-- ./infrastructure/sync/strategies/sync-operation-executor.ts
|   |   |   `-- ./infrastructure/sync/strategies/sync-operation-types.ts
|   |   |-- ./infrastructure/sync/workspace-bindings
|   |   |   |-- ./infrastructure/sync/workspace-bindings/base.ts
|   |   |   |-- ./infrastructure/sync/workspace-bindings/ide.ts
|   |   |   |-- ./infrastructure/sync/workspace-bindings/index.ts
|   |   |   |-- ./infrastructure/sync/workspace-bindings/knowledge.ts
|   |   |   |-- ./infrastructure/sync/workspace-bindings/notes.ts
|   |   |   `-- ./infrastructure/sync/workspace-bindings/study.ts
|   |   `-- ./infrastructure/sync/workspace-services
|   |       |-- ./infrastructure/sync/workspace-services/cross-workspace-file-references
|   |       |   |-- ./infrastructure/sync/workspace-services/cross-workspace-file-references/cross-workspace-reference-factory.ts
|   |       |   |-- ./infrastructure/sync/workspace-services/cross-workspace-file-references/cross-workspace-reference-manager.ts
|   |       |   |-- ./infrastructure/sync/workspace-services/cross-workspace-file-references/cross-workspace-reference-types.ts
|   |       |   `-- ./infrastructure/sync/workspace-services/cross-workspace-file-references/index.ts
|   |       |-- ./infrastructure/sync/workspace-services/cross-workspace-file-references.ts
|   |       |-- ./infrastructure/sync/workspace-services/file-sync-service.ts
|   |       |-- ./infrastructure/sync/workspace-services/hooks
|   |       |   `-- ./infrastructure/sync/workspace-services/hooks/index.ts
|   |       |-- ./infrastructure/sync/workspace-services/ide-file-sync-service.ts
|   |       |-- ./infrastructure/sync/workspace-services/index.ts
|   |       |-- ./infrastructure/sync/workspace-services/knowledge-file-sync-service.ts
|   |       |-- ./infrastructure/sync/workspace-services/knowledge-sync
|   |       |   |-- ./infrastructure/sync/workspace-services/knowledge-sync/index.ts
|   |       |   |-- ./infrastructure/sync/workspace-services/knowledge-sync/knowledge-source-store.ts
|   |       |   |-- ./infrastructure/sync/workspace-services/knowledge-sync/knowledge-sync-service-core.ts
|   |       |   `-- ./infrastructure/sync/workspace-services/knowledge-sync/knowledge-sync-types.ts
|   |       |-- ./infrastructure/sync/workspace-services/notes
|   |       |   |-- ./infrastructure/sync/workspace-services/notes/index.ts
|   |       |   |-- ./infrastructure/sync/workspace-services/notes/note-crud-operations.ts
|   |       |   |-- ./infrastructure/sync/workspace-services/notes/note-file-watcher.ts
|   |       |   |-- ./infrastructure/sync/workspace-services/notes/note-folder-bridge.ts
|   |       |   |-- ./infrastructure/sync/workspace-services/notes/note-markdown-parser.ts
|   |       |   |-- ./infrastructure/sync/workspace-services/notes/note-markdown-writer.ts
|   |       |   |-- ./infrastructure/sync/workspace-services/notes/notes-file-sync-core.ts
|   |       |   `-- ./infrastructure/sync/workspace-services/notes/notes-file-sync-service.ts
|   |       |-- ./infrastructure/sync/workspace-services/notes-file-sync-service.ts
|   |       |-- ./infrastructure/sync/workspace-services/project-knowledge-sync.ts
|   |       |-- ./infrastructure/sync/workspace-services/study-file-sync-service.ts
|   |       `-- ./infrastructure/sync/workspace-services/study-sync
|   |           |-- ./infrastructure/sync/workspace-services/study-sync/index.ts
|   |           |-- ./infrastructure/sync/workspace-services/study-sync/study-import-utils.ts
|   |           |-- ./infrastructure/sync/workspace-services/study-sync/study-sync-service-core.ts
|   |           `-- ./infrastructure/sync/workspace-services/study-sync/study-sync-types.ts
|   `-- ./infrastructure/ui
|       `-- ./infrastructure/ui/AgentWorkspaceSync.tsx
|-- ./lib
|   |-- ./lib/agent
|   |   |-- ./lib/agent/agent-io.ts
|   |   |-- ./lib/agent/deep-think
|   |   |   |-- ./lib/agent/deep-think/deep-think-hook.ts
|   |   |   |-- ./lib/agent/deep-think/deep-think-parsers.ts
|   |   |   |-- ./lib/agent/deep-think/deep-think-prompts.ts
|   |   |   `-- ./lib/agent/deep-think/deep-think-types.ts
|   |   |-- ./lib/agent/facades
|   |   |   |-- ./lib/agent/facades/command-sanitizer.ts
|   |   |   |-- ./lib/agent/facades/file-lock.ts
|   |   |   |-- ./lib/agent/facades/file-tools-impl.ts
|   |   |   |-- ./lib/agent/facades/file-tools.ts
|   |   |   |-- ./lib/agent/facades/index.ts
|   |   |   |-- ./lib/agent/facades/knowledge-tools-impl.ts
|   |   |   |-- ./lib/agent/facades/knowledge-tools.ts
|   |   |   |-- ./lib/agent/facades/terminal-tools-impl.ts
|   |   |   `-- ./lib/agent/facades/terminal-tools.ts
|   |   |-- ./lib/agent/factory.ts
|   |   |-- ./lib/agent/hooks
|   |   |   |-- ./lib/agent/hooks/index.ts
|   |   |   |-- ./lib/agent/hooks/use-agent-chat-with-tools.ts
|   |   |   `-- ./lib/agent/hooks/use-prompt-enhancer.ts
|   |   |-- ./lib/agent/memory
|   |   |   |-- ./lib/agent/memory/conversation-memory.ts
|   |   |   |-- ./lib/agent/memory/index.ts
|   |   |   |-- ./lib/agent/memory/insight-extractor.ts
|   |   |   `-- ./lib/agent/memory/memory-index.ts
|   |   |-- ./lib/agent/multimodal
|   |   |   `-- ./lib/agent/multimodal/message-builder.ts
|   |   |-- ./lib/agent/preferences
|   |   |   |-- ./lib/agent/preferences/index.ts
|   |   |   |-- ./lib/agent/preferences/preference-tracker.ts
|   |   |   `-- ./lib/agent/preferences/user-profile.ts
|   |   |-- ./lib/agent/prompt-composer-config.ts
|   |   |-- ./lib/agent/prompt-composer-types.ts
|   |   |-- ./lib/agent/prompt-composer.ts
|   |   |-- ./lib/agent/providers
|   |   |   |-- ./lib/agent/providers/agent-validation-service.ts
|   |   |   |-- ./lib/agent/providers/anthropic-adapter.ts
|   |   |   |-- ./lib/agent/providers/credential-encryption.ts
|   |   |   |-- ./lib/agent/providers/credential-storage.ts
|   |   |   |-- ./lib/agent/providers/credential-vault.ts
|   |   |   |-- ./lib/agent/providers/index.ts
|   |   |   |-- ./lib/agent/providers/model-registry.ts
|   |   |   |-- ./lib/agent/providers/provider-adapter.ts
|   |   |   `-- ./lib/agent/providers/types.ts
|   |   |-- ./lib/agent/routes
|   |   |-- ./lib/agent/suggestions
|   |   |   |-- ./lib/agent/suggestions/index.ts
|   |   |   |-- ./lib/agent/suggestions/suggestion-engine.ts
|   |   |   `-- ./lib/agent/suggestions/suggestion-tracker.ts
|   |   |-- ./lib/agent/system-prompt.ts
|   |   |-- ./lib/agent/tool-permission
|   |   |   |-- ./lib/agent/tool-permission/constants.ts
|   |   |   |-- ./lib/agent/tool-permission/helpers.ts
|   |   |   |-- ./lib/agent/tool-permission/index.ts
|   |   |   |-- ./lib/agent/tool-permission/tool-permission-manager.ts
|   |   |   |-- ./lib/agent/tool-permission/tool-permission-queries.ts
|   |   |   |-- ./lib/agent/tool-permission/tool-permission-singleton.ts
|   |   |   |-- ./lib/agent/tool-permission/tool-permission-trust.ts
|   |   |   `-- ./lib/agent/tool-permission/types.ts
|   |   |-- ./lib/agent/tool-permission-manager.ts
|   |   |-- ./lib/agent/tools
|   |   |   |-- ./lib/agent/tools/execute-command-streaming.ts
|   |   |   |-- ./lib/agent/tools/execute-command-tool.ts
|   |   |   |-- ./lib/agent/tools/index.ts
|   |   |   |-- ./lib/agent/tools/list-files-tool.ts
|   |   |   |-- ./lib/agent/tools/permission-check.ts
|   |   |   |-- ./lib/agent/tools/process-image-tool.ts
|   |   |   |-- ./lib/agent/tools/process-pdf-tool.ts
|   |   |   |-- ./lib/agent/tools/process-url-tool.ts
|   |   |   |-- ./lib/agent/tools/read-file-tool.ts
|   |   |   |-- ./lib/agent/tools/retry-queue.ts
|   |   |   |-- ./lib/agent/tools/search-notes-tool.ts
|   |   |   |-- ./lib/agent/tools/streaming.ts
|   |   |   |-- ./lib/agent/tools/synthesize-tool.ts
|   |   |   |-- ./lib/agent/tools/tool-error.ts
|   |   |   |-- ./lib/agent/tools/tool-execution-logger.ts
|   |   |   |-- ./lib/agent/tools/tool-parser.ts
|   |   |   |-- ./lib/agent/tools/tool-timeout.ts
|   |   |   |-- ./lib/agent/tools/types.ts
|   |   |   `-- ./lib/agent/tools/write-file-tool.ts
|   |   |-- ./lib/agent/workspace-execution-context.ts
|   |   |-- ./lib/agent/workspace-permission-manager.ts
|   |   `-- ./lib/agent/workspace-tool-filter.ts
|   |-- ./lib/analytics
|   |   |-- ./lib/analytics/metrics-collector.ts
|   |   `-- ./lib/analytics/performance-monitor.ts
|   |-- ./lib/audio
|   |   |-- ./lib/audio/audio-generation.ts
|   |   `-- ./lib/audio/audio-storage.ts
|   |-- ./lib/canvas
|   |   |-- ./lib/canvas/index.ts
|   |   |-- ./lib/canvas/linkage-ai-enhancer.ts
|   |   |-- ./lib/canvas/linkage-analyzer.ts
|   |   |-- ./lib/canvas/linkage-types.ts
|   |   |-- ./lib/canvas/rag-linkage-analyzer.ts
|   |   `-- ./lib/canvas/types.ts
|   |-- ./lib/chat
|   |   |-- ./lib/chat/context-window-manager.ts
|   |   |-- ./lib/chat/message-search.ts
|   |   `-- ./lib/chat/title-generator.ts
|   |-- ./lib/codetree-2026-01-04.md
|   |-- ./lib/collaboration
|   |   |-- ./lib/collaboration/cursor-tracker.ts
|   |   |-- ./lib/collaboration/presence-manager.ts
|   |   `-- ./lib/collaboration/websocket-client.ts
|   |-- ./lib/command-palette
|   |   |-- ./lib/command-palette/command-registry.ts
|   |   |-- ./lib/command-palette/fuzzy-search.tsx
|   |   `-- ./lib/command-palette/index.ts
|   |-- ./lib/context
|   |   |-- ./lib/context/ContextEngine.ts
|   |   |-- ./lib/context/ContextInjector.ts
|   |   |-- ./lib/context/index.ts
|   |   |-- ./lib/context/NoteContentRetriever.ts
|   |   `-- ./lib/context/RAGQueryService.ts
|   |-- ./lib/demo
|   |   `-- ./lib/demo/sample-conversations.json
|   |-- ./lib/diff
|   |   |-- ./lib/diff/diff-generator.ts
|   |   `-- ./lib/diff/index.ts
|   |-- ./lib/editor
|   |   |-- ./lib/editor/index.ts
|   |   |-- ./lib/editor/language-utils.ts
|   |   |-- ./lib/editor/tab-manager.ts
|   |   `-- ./lib/editor/tab-persistence.ts
|   |-- ./lib/errorHandling
|   |   `-- ./lib/errorHandling/globalErrorHandlers.ts
|   |-- ./lib/events
|   |   |-- ./lib/events/cross-workspace-event-bus.ts
|   |   |-- ./lib/events/index.ts
|   |   |-- ./lib/events/store-events.ts
|   |   |-- ./lib/events/use-chat-event-bridge.ts
|   |   |-- ./lib/events/use-chat-state-sync.ts
|   |   |-- ./lib/events/use-conversation-persistence.ts
|   |   |-- ./lib/events/use-cross-workspace-events.ts
|   |   |-- ./lib/events/use-workspace-event.ts
|   |   `-- ./lib/events/workspace-events.ts
|   |-- ./lib/filesync
|   |   |-- ./lib/filesync/cross-workspace-file-references.ts
|   |   |-- ./lib/filesync/file-sync-service.ts
|   |   |-- ./lib/filesync/hooks
|   |   |   |-- ./lib/filesync/hooks/index.ts
|   |   |   `-- ./lib/filesync/hooks/use-file-sync-service.ts
|   |   |-- ./lib/filesync/hooks.ts
|   |   |-- ./lib/filesync/ide-file-sync-service.ts
|   |   |-- ./lib/filesync/index.ts
|   |   |-- ./lib/filesync/knowledge-file-sync-service.ts
|   |   |-- ./lib/filesync/notes-file-sync-service.ts
|   |   |-- ./lib/filesync/project-knowledge-sync.ts
|   |   `-- ./lib/filesync/study-file-sync-service.ts
|   |-- ./lib/filesync.ts
|   |-- ./lib/filesystem
|   |   |-- ./lib/filesystem/constants.ts
|   |   |-- ./lib/filesystem/dir-ops.ts
|   |   |-- ./lib/filesystem/directory-walker.ts
|   |   |-- ./lib/filesystem/exclusion-config.ts
|   |   |-- ./lib/filesystem/file-ops.ts
|   |   |-- ./lib/filesystem/file-snapshot-store
|   |   |   |-- ./lib/filesystem/file-snapshot-store/file-snapshot-store-refactored.ts
|   |   |   |-- ./lib/filesystem/file-snapshot-store/snapshot-bulk-slice.ts
|   |   |   |-- ./lib/filesystem/file-snapshot-store/snapshot-cache-slice.ts
|   |   |   |-- ./lib/filesystem/file-snapshot-store/snapshot-invalidation-slice.ts
|   |   |   |-- ./lib/filesystem/file-snapshot-store/snapshot-lookup-slice.ts
|   |   |   `-- ./lib/filesystem/file-snapshot-store/types.ts
|   |   |-- ./lib/filesystem/file-snapshot-store.ts
|   |   |-- ./lib/filesystem/fs-errors.ts
|   |   |-- ./lib/filesystem/fs-handle-utils.ts
|   |   |-- ./lib/filesystem/fs-types.ts
|   |   |-- ./lib/filesystem/fsa-handle-manager.ts
|   |   |-- ./lib/filesystem/handle-utils.ts
|   |   |-- ./lib/filesystem/hash-utils.ts
|   |   |-- ./lib/filesystem/index.ts
|   |   |-- ./lib/filesystem/local-fs-adapter.ts
|   |   |-- ./lib/filesystem/path-guard.ts
|   |   |-- ./lib/filesystem/path-utils.ts
|   |   |-- ./lib/filesystem/permission-lifecycle.test.ts
|   |   |-- ./lib/filesystem/permission-lifecycle.ts
|   |   |-- ./lib/filesystem/project-context-provider.ts
|   |   |-- ./lib/filesystem/sync-executor.ts
|   |   |-- ./lib/filesystem/sync-manager
|   |   |   |-- ./lib/filesystem/sync-manager/index.ts
|   |   |   |-- ./lib/filesystem/sync-manager/sync-batch-sync.ts
|   |   |   |-- ./lib/filesystem/sync-manager/sync-file-ops.ts
|   |   |   |-- ./lib/filesystem/sync-manager/sync-manager-factory.ts
|   |   |   |-- ./lib/filesystem/sync-manager/sync-manager-types.ts
|   |   |   `-- ./lib/filesystem/sync-manager/sync-manager.ts
|   |   |-- ./lib/filesystem/sync-manager.test.ts
|   |   |-- ./lib/filesystem/sync-manager.ts
|   |   |-- ./lib/filesystem/sync-operations.ts
|   |   |-- ./lib/filesystem/sync-planner.ts
|   |   |-- ./lib/filesystem/sync-transaction
|   |   |   |-- ./lib/filesystem/sync-transaction/index.ts
|   |   |   |-- ./lib/filesystem/sync-transaction/sync-batch-deleter.ts
|   |   |   |-- ./lib/filesystem/sync-transaction/sync-batch-error.ts
|   |   |   |-- ./lib/filesystem/sync-transaction/sync-batch-writer.ts
|   |   |   |-- ./lib/filesystem/sync-transaction/sync-rollback-executor.ts
|   |   |   |-- ./lib/filesystem/sync-transaction/sync-transaction-log.ts
|   |   |   `-- ./lib/filesystem/sync-transaction/sync-transaction-types.ts
|   |   |-- ./lib/filesystem/sync-transaction-log.ts
|   |   |-- ./lib/filesystem/sync-types.ts
|   |   |-- ./lib/filesystem/sync-utils.ts
|   |   |-- ./lib/filesystem/unified-storage-adapter.ts
|   |   `-- ./lib/filesystem/validation.ts
|   |-- ./lib/formatter
|   |   |-- ./lib/formatter/code-formatter.ts
|   |   |-- ./lib/formatter/config-eslint.ts
|   |   |-- ./lib/formatter/config-prettier.ts
|   |   |-- ./lib/formatter/index.ts
|   |   `-- ./lib/formatter/types.ts
|   |-- ./lib/git
|   |   |-- ./lib/git/git-client.ts
|   |   `-- ./lib/git/git-credentials.ts
|   |-- ./lib/hooks
|   |   |-- ./lib/hooks/index.ts
|   |   |-- ./lib/hooks/use-theme.ts
|   |   `-- ./lib/hooks/useProviderEvents.ts
|   |-- ./lib/ide
|   |   |-- ./lib/ide/code-analysis-bridge.ts
|   |   `-- ./lib/ide/code-analyzer.ts
|   |-- ./lib/init
|   |   |-- ./lib/init/seed-api-keys.ts
|   |   `-- ./lib/init/seed-workspace-permissions.ts
|   |-- ./lib/keyboard
|   |   |-- ./lib/keyboard/index.ts
|   |   |-- ./lib/keyboard/KeyboardShortcutManager.ts
|   |   `-- ./lib/keyboard/shortcuts.ts
|   |-- ./lib/knowledge
|   |   |-- ./lib/knowledge/flashcard-exporter.ts
|   |   |-- ./lib/knowledge/flashcard-generator.ts
|   |   |-- ./lib/knowledge/flashcard-utils.ts
|   |   |-- ./lib/knowledge/gemini-image-mocks.ts
|   |   |-- ./lib/knowledge/gemini-image-processor.ts
|   |   |-- ./lib/knowledge/gemini-image-prompts.ts
|   |   |-- ./lib/knowledge/gemini-image-types.ts
|   |   |-- ./lib/knowledge/gemini-pdf-api.ts
|   |   |-- ./lib/knowledge/gemini-pdf-mocks.ts
|   |   |-- ./lib/knowledge/gemini-pdf-processor.ts
|   |   |-- ./lib/knowledge/gemini-pdf-prompts.ts
|   |   |-- ./lib/knowledge/gemini-pdf-types.ts
|   |   |-- ./lib/knowledge/gemini-url-processor.ts
|   |   |-- ./lib/knowledge/graph
|   |   |   |-- ./lib/knowledge/graph/graph-crud.ts
|   |   |   |-- ./lib/knowledge/graph/graph-persistence.ts
|   |   |   |-- ./lib/knowledge/graph/graph-queries.ts
|   |   |   |-- ./lib/knowledge/graph/graph-traversal.ts
|   |   |   |-- ./lib/knowledge/graph/graph-utils.ts
|   |   |   `-- ./lib/knowledge/graph/index.ts
|   |   |-- ./lib/knowledge/index.ts
|   |   |-- ./lib/knowledge/knowledge-graph-types.ts
|   |   |-- ./lib/knowledge/knowledge-graph.ts
|   |   |-- ./lib/knowledge/metadata-extractor.ts
|   |   |-- ./lib/knowledge/note-chunker.ts
|   |   |-- ./lib/knowledge/organization-engine.ts
|   |   |-- ./lib/knowledge/organization-strategies.ts
|   |   |-- ./lib/knowledge/organization-types.ts
|   |   |-- ./lib/knowledge/pdf-parser.ts
|   |   |-- ./lib/knowledge/recommendation-generator.ts
|   |   |-- ./lib/knowledge/relevancy-factors.ts
|   |   |-- ./lib/knowledge/relevancy-scorer.ts
|   |   |-- ./lib/knowledge/relevancy-types.ts
|   |   |-- ./lib/knowledge/source-import-handlers.ts
|   |   |-- ./lib/knowledge/source-import-types.ts
|   |   |-- ./lib/knowledge/source-import-validators.ts
|   |   |-- ./lib/knowledge/source-import.ts
|   |   |-- ./lib/knowledge/source-rag-bridge.ts
|   |   |-- ./lib/knowledge/subject-classifier-types.ts
|   |   |-- ./lib/knowledge/subject-classifier.ts
|   |   |-- ./lib/knowledge/subject-scoring.ts
|   |   |-- ./lib/knowledge/subject-taxonomy.ts
|   |   |-- ./lib/knowledge/synthesis-api-types.ts
|   |   |-- ./lib/knowledge/synthesis-mocks.ts
|   |   |-- ./lib/knowledge/synthesis-prompts.ts
|   |   |-- ./lib/knowledge/synthesis-service.ts
|   |   |-- ./lib/knowledge/synthesis-types.ts
|   |   |-- ./lib/knowledge/types.ts
|   |   |-- ./lib/knowledge/url-fetcher-content-extractor.ts
|   |   |-- ./lib/knowledge/url-fetcher-types.ts
|   |   |-- ./lib/knowledge/url-fetcher.ts
|   |   |-- ./lib/knowledge/vault-analyzer.ts
|   |   `-- ./lib/knowledge/verify-rag-bridge.ts
|   |-- ./lib/media
|   |   |-- ./lib/media/image-attachments.ts
|   |   `-- ./lib/media/image-processor.ts
|   |-- ./lib/metadata
|   |   `-- ./lib/metadata/fetch-url-metadata.ts
|   |-- ./lib/mocks
|   |   `-- ./lib/mocks/empty.ts
|   |-- ./lib/monitoring
|   |   |-- ./lib/monitoring/performance-monitor.ts
|   |   `-- ./lib/monitoring/sentry.ts
|   |-- ./lib/navigation
|   |   |-- ./lib/navigation/definition-provider.ts
|   |   |-- ./lib/navigation/index.ts
|   |   |-- ./lib/navigation/references-provider.ts
|   |   |-- ./lib/navigation/symbol-outline.ts
|   |   `-- ./lib/navigation/symbol-parser.ts
|   |-- ./lib/notes
|   |   |-- ./lib/notes/ai-prompt-store.ts
|   |   |-- ./lib/notes/embedding-worker-bridge.ts
|   |   |-- ./lib/notes/index.ts
|   |   |-- ./lib/notes/markdown-converter.ts
|   |   |-- ./lib/notes/note-ai-service.ts
|   |   |-- ./lib/notes/note-event-emitter.ts
|   |   |-- ./lib/notes/note-file-sync.ts
|   |   |-- ./lib/notes/note-indexer.ts
|   |   |-- ./lib/notes/note-navigation-store.ts
|   |   |-- ./lib/notes/note-retriever.ts
|   |   |-- ./lib/notes/note-store-facade.ts
|   |   |-- ./lib/notes/note-store-refactored.ts
|   |   |-- ./lib/notes/note-store.backup.ts
|   |   |-- ./lib/notes/note-store.ts
|   |   |-- ./lib/notes/note-tree-utils.ts
|   |   |-- ./lib/notes/slices
|   |   |   |-- ./lib/notes/slices/note-crud-slice.ts
|   |   |   |-- ./lib/notes/slices/note-events-slice.ts
|   |   |   |-- ./lib/notes/slices/note-indexing-slice.ts
|   |   |   |-- ./lib/notes/slices/note-metadata-slice.ts
|   |   |   |-- ./lib/notes/slices/note-query-slice.ts
|   |   |   |-- ./lib/notes/slices/note-sync-slice.ts
|   |   |   `-- ./lib/notes/slices/note-ui-slice.ts
|   |   |-- ./lib/notes/types-embedding.ts
|   |   |-- ./lib/notes/types-slice.ts
|   |   `-- ./lib/notes/types.ts
|   |-- ./lib/notifications
|   |   |-- ./lib/notifications/notification-manager.ts
|   |   `-- ./lib/notifications/types.ts
|   |-- ./lib/offline
|   |   |-- ./lib/offline/cache-manager.ts
|   |   |-- ./lib/offline/offline-detector.ts
|   |   `-- ./lib/offline/service-worker-registration.ts
|   |-- ./lib/pdf
|   |   |-- ./lib/pdf/pdf-vision-capture.ts
|   |   |-- ./lib/pdf/pdf-vision-hook.ts
|   |   |-- ./lib/pdf/pdf-vision-manager.ts
|   |   `-- ./lib/pdf/pdf-vision-types.ts
|   |-- ./lib/persistence
|   |   |-- ./lib/persistence/db.ts
|   |   `-- ./lib/persistence/index.ts
|   |-- ./lib/plugins
|   |   |-- ./lib/plugins/builtins
|   |   |   |-- ./lib/plugins/builtins/github-integration.ts
|   |   |   `-- ./lib/plugins/builtins/retro-theme-pack.ts
|   |   |-- ./lib/plugins/plugin-hooks.ts
|   |   |-- ./lib/plugins/plugin-manager.ts
|   |   `-- ./lib/plugins/types.ts
|   |-- ./lib/rag
|   |   |-- ./lib/rag/audio-capture.ts
|   |   |-- ./lib/rag/audio-playback.ts
|   |   |-- ./lib/rag/chunk-strategies
|   |   |   |-- ./lib/rag/chunk-strategies/chunk-strategy.interface.ts
|   |   |   |-- ./lib/rag/chunk-strategies/fixed-size-chunker.ts
|   |   |   |-- ./lib/rag/chunk-strategies/index.ts
|   |   |   |-- ./lib/rag/chunk-strategies/recursive-chunker.ts
|   |   |   `-- ./lib/rag/chunk-strategies/semantic-chunker.ts
|   |   |-- ./lib/rag/chunk-strategies.ts
|   |   |-- ./lib/rag/citation-formatter.ts
|   |   |-- ./lib/rag/citation-types.ts
|   |   |-- ./lib/rag/cloud-embedder.ts
|   |   |-- ./lib/rag/document-chunker.ts
|   |   |-- ./lib/rag/embedding-cache.ts
|   |   |-- ./lib/rag/embedding-service.ts
|   |   |-- ./lib/rag/hybrid-retriever.ts
|   |   |-- ./lib/rag/incremental-indexing-service.ts
|   |   |-- ./lib/rag/index.ts
|   |   |-- ./lib/rag/indexeddb-storage.ts
|   |   |-- ./lib/rag/live-api-types.ts
|   |   |-- ./lib/rag/live-api-websocket.ts
|   |   |-- ./lib/rag/orama-index-adapter.ts
|   |   |-- ./lib/rag/orama-index.ts
|   |   |-- ./lib/rag/pagination.ts
|   |   |-- ./lib/rag/query-cache.ts
|   |   |-- ./lib/rag/query-optimizer-config.ts
|   |   |-- ./lib/rag/query-optimizer-helpers.ts
|   |   |-- ./lib/rag/query-optimizer-types.ts
|   |   |-- ./lib/rag/query-optimizer.ts
|   |   |-- ./lib/rag/rag-chat.ts
|   |   |-- ./lib/rag/rrf-fusion.ts
|   |   |-- ./lib/rag/search-highlighter.ts
|   |   |-- ./lib/rag/sync-subscription-service.ts
|   |   |-- ./lib/rag/token-counter.ts
|   |   |-- ./lib/rag/transformers-loader.ts
|   |   `-- ./lib/rag/types.ts
|   |-- ./lib/scheduler
|   |   |-- ./lib/scheduler/built-in-tasks.ts
|   |   |-- ./lib/scheduler/cron-parser.ts
|   |   `-- ./lib/scheduler/task-scheduler.ts
|   |-- ./lib/search
|   |   `-- ./lib/search/search-indexer.ts
|   |-- ./lib/settings
|   |   |-- ./lib/settings/settings-exporter.ts
|   |   |-- ./lib/settings/settings-importer.ts
|   |   `-- ./lib/settings/settings-serializer.ts
|   |-- ./lib/snippets
|   |   |-- ./lib/snippets/snippet-store
|   |   |   |-- ./lib/snippets/snippet-store/snippet-crud-slice.ts
|   |   |   |-- ./lib/snippets/snippet-store/snippet-export-slice.ts
|   |   |   |-- ./lib/snippets/snippet-store/snippet-filtering-slice.ts
|   |   |   |-- ./lib/snippets/snippet-store/snippet-store-refactored.ts
|   |   |   `-- ./lib/snippets/snippet-store/snippet-utils-slice.ts
|   |   |-- ./lib/snippets/snippet-store.ts
|   |   `-- ./lib/snippets/snippet-templates.ts
|   |-- ./lib/study
|   |   |-- ./lib/study/index.ts
|   |   |-- ./lib/study/quiz-generator.ts
|   |   |-- ./lib/study/quiz-session.ts
|   |   |-- ./lib/study/quiz-types.ts
|   |   `-- ./lib/study/srs-types.ts
|   |-- ./lib/sync
|   |   |-- ./lib/sync/event-types.ts
|   |   |-- ./lib/sync/file-metadata-cache.ts
|   |   |-- ./lib/sync/index.ts
|   |   |-- ./lib/sync/reverse-sync-service.ts
|   |   `-- ./lib/sync/sync-event-bus.ts
|   |-- ./lib/templates
|   |   |-- ./lib/templates/template-engine.ts
|   |   |-- ./lib/templates/template-registry.ts
|   |   `-- ./lib/templates/template-types.ts
|   |-- ./lib/terminal
|   |   |-- ./lib/terminal/index.ts
|   |   `-- ./lib/terminal/terminal-emulator.ts
|   |-- ./lib/utils
|   |   |-- ./lib/utils/dynamic-imports.ts
|   |   |-- ./lib/utils/error-classification.ts
|   |   |-- ./lib/utils/error-handling.ts
|   |   |-- ./lib/utils/mobile-error-handling.ts
|   |   |-- ./lib/utils/platform-detection.ts
|   |   `-- ./lib/utils/security.ts
|   |-- ./lib/utils.ts
|   |-- ./lib/validation
|   |   `-- ./lib/validation/chat-request.ts
|   |-- ./lib/voice
|   |   |-- ./lib/voice/gemini-transcription-service.ts
|   |   `-- ./lib/voice/use-voice-recording.ts
|   |-- ./lib/watcher
|   |   |-- ./lib/watcher/change-detector.ts
|   |   |-- ./lib/watcher/file-watcher.ts
|   |   `-- ./lib/watcher/index.ts
|   |-- ./lib/webcontainer
|   |   |-- ./lib/webcontainer/crash-recovery.ts
|   |   |-- ./lib/webcontainer/index.ts
|   |   |-- ./lib/webcontainer/manager.ts
|   |   |-- ./lib/webcontainer/process-manager.ts
|   |   |-- ./lib/webcontainer/terminal-adapter.ts
|   |   `-- ./lib/webcontainer/types.ts
|   |-- ./lib/workflow
|   |   |-- ./lib/workflow/agents
|   |   |   |-- ./lib/workflow/agents/content-routing-agent.ts
|   |   |   |-- ./lib/workflow/agents/debate-agent.ts
|   |   |   |-- ./lib/workflow/agents/index.ts
|   |   |   `-- ./lib/workflow/agents/sequential-expansion-agent.ts
|   |   |-- ./lib/workflow/builder
|   |   |   |-- ./lib/workflow/builder/index.ts
|   |   |   |-- ./lib/workflow/builder/slices
|   |   |   |   |-- ./lib/workflow/builder/slices/workflow-connection-slice.ts
|   |   |   |   |-- ./lib/workflow/builder/slices/workflow-crud-slice.ts
|   |   |   |   |-- ./lib/workflow/builder/slices/workflow-persistence-slice.ts
|   |   |   |   |-- ./lib/workflow/builder/slices/workflow-step-slice.ts
|   |   |   |   |-- ./lib/workflow/builder/slices/workflow-utilities-slice.ts
|   |   |   |   `-- ./lib/workflow/builder/slices/workflow-validation-slice.ts
|   |   |   |-- ./lib/workflow/builder/types.ts
|   |   |   |-- ./lib/workflow/builder/workflow-builder-store-refactored.ts
|   |   |   |-- ./lib/workflow/builder/workflow-builder-store.backup.ts
|   |   |   |-- ./lib/workflow/builder/workflow-builder-store.test.ts
|   |   |   `-- ./lib/workflow/builder/workflow-builder-store.ts
|   |   |-- ./lib/workflow/executor
|   |   |   |-- ./lib/workflow/executor/index.ts
|   |   |   |-- ./lib/workflow/executor/workflow-executor.test.ts
|   |   |   `-- ./lib/workflow/executor/workflow-executor.ts
|   |   |-- ./lib/workflow/index.ts
|   |   `-- ./lib/workflow/types.ts
|   `-- ./lib/workspace
|       |-- ./lib/workspace/file-sync-status-store
|       |   |-- ./lib/workspace/file-sync-status-store/file-status-slice.ts
|       |   |-- ./lib/workspace/file-sync-status-store/file-sync-status-store-refactored.ts
|       |   |-- ./lib/workspace/file-sync-status-store/hydration-slice.ts
|       |   |-- ./lib/workspace/file-sync-status-store/index.ts
|       |   |-- ./lib/workspace/file-sync-status-store/sync-lifecycle-slice.ts
|       |   |-- ./lib/workspace/file-sync-status-store/sync-progress-slice.ts
|       |   `-- ./lib/workspace/file-sync-status-store/types.ts
|       |-- ./lib/workspace/file-sync-status-store.ts
|       |-- ./lib/workspace/hooks
|       |   |-- ./lib/workspace/hooks/useEventBusEffects.ts
|       |   |-- ./lib/workspace/hooks/useInitialSync.ts
|       |   |-- ./lib/workspace/hooks/useSyncOperations.ts
|       |   |-- ./lib/workspace/hooks/useWorkspaceActions.ts
|       |   `-- ./lib/workspace/hooks/useWorkspaceState.ts
|       |-- ./lib/workspace/index.ts
|       |-- ./lib/workspace/note-context-tracker.ts
|       |-- ./lib/workspace/project-store
|       |   |-- ./lib/workspace/project-store/project-crud-slice.ts
|       |   |-- ./lib/workspace/project-store/project-layout-slice.ts
|       |   |-- ./lib/workspace/project-store/project-permissions-slice.ts
|       |   |-- ./lib/workspace/project-store/project-store-refactored.ts
|       |   |-- ./lib/workspace/project-store/project-utils-slice.ts
|       |   |-- ./lib/workspace/project-store/project-workspace-bindings-slice.ts
|       |   `-- ./lib/workspace/project-store/types.ts
|       |-- ./lib/workspace/project-store.test.ts
|       |-- ./lib/workspace/project-store.ts
|       |-- ./lib/workspace/project-types.ts
|       |-- ./lib/workspace/ProjectContext.tsx
|       |-- ./lib/workspace/session-snapshot.ts
|       |-- ./lib/workspace/threads-store.ts
|       |-- ./lib/workspace/workspace-access-helper.tsx
|       |-- ./lib/workspace/workspace-detector.ts
|       |-- ./lib/workspace/workspace-transition-manager.ts
|       |-- ./lib/workspace/workspace-types.ts
|       `-- ./lib/workspace/WorkspaceContext.test.tsx
|-- ./logo.svg
|-- ./mocks
|   `-- ./mocks/agents.ts
|-- ./presentation
|   `-- ./presentation/components
|       |-- ./presentation/components/about
|       |   |-- ./presentation/components/about/AboutPage.css
|       |   |-- ./presentation/components/about/AboutPage.tsx
|       |   |-- ./presentation/components/about/contact
|       |   |   |-- ./presentation/components/about/contact/ContactSection.tsx
|       |   |   `-- ./presentation/components/about/contact/index.ts
|       |   |-- ./presentation/components/about/HeroSection.tsx
|       |   |-- ./presentation/components/about/index.ts
|       |   |-- ./presentation/components/about/journey
|       |   |   |-- ./presentation/components/about/journey/index.ts
|       |   |   |-- ./presentation/components/about/journey/JourneyCard.tsx
|       |   |   `-- ./presentation/components/about/journey/JourneySection.tsx
|       |   |-- ./presentation/components/about/layout
|       |   |   |-- ./presentation/components/about/layout/PortfolioLayout.tsx
|       |   |   `-- ./presentation/components/about/layout/SectionContainer.tsx
|       |   |-- ./presentation/components/about/ParticleBackground.tsx
|       |   |-- ./presentation/components/about/projects
|       |   |   |-- ./presentation/components/about/projects/index.ts
|       |   |   |-- ./presentation/components/about/projects/ProjectShowcase.tsx
|       |   |   `-- ./presentation/components/about/projects/ViaGentCard.tsx
|       |   |-- ./presentation/components/about/ScrollIndicator.tsx
|       |   |-- ./presentation/components/about/sections
|       |   |   |-- ./presentation/components/about/sections/ContactSection.tsx
|       |   |   |-- ./presentation/components/about/sections/HeroSection.tsx
|       |   |   |-- ./presentation/components/about/sections/JourneySection.tsx
|       |   |   |-- ./presentation/components/about/sections/ShowcaseSection.tsx
|       |   |   `-- ./presentation/components/about/sections/SkillsUniverse.tsx
|       |   |-- ./presentation/components/about/skills
|       |   |   |-- ./presentation/components/about/skills/index.ts
|       |   |   |-- ./presentation/components/about/skills/SkillCard.tsx
|       |   |   |-- ./presentation/components/about/skills/SkillCategory.tsx
|       |   |   `-- ./presentation/components/about/skills/SkillsMatrix.tsx
|       |   |-- ./presentation/components/about/stats
|       |   |   |-- ./presentation/components/about/stats/index.ts
|       |   |   |-- ./presentation/components/about/stats/StatItem.tsx
|       |   |   `-- ./presentation/components/about/stats/StatsBar.tsx
|       |   `-- ./presentation/components/about/timeline
|       |       |-- ./presentation/components/about/timeline/AchievementTimeline.tsx
|       |       `-- ./presentation/components/about/timeline/index.ts
|       |-- ./presentation/components/agent
|       |   |-- ./presentation/components/agent/AGENT_CONFIG_DIALOG_REFACTORING.md
|       |   |-- ./presentation/components/agent/agent-config-dialog-types.ts
|       |   |-- ./presentation/components/agent/agent-config-dialog-utils.ts
|       |   |-- ./presentation/components/agent/agent-config-types.ts
|       |   |-- ./presentation/components/agent/agent-config-validation.ts
|       |   |-- ./presentation/components/agent/AgentConfigDialog.tsx
|       |   |-- ./presentation/components/agent/AgentConfigDialogFooter.tsx
|       |   |-- ./presentation/components/agent/AgentConfigDialogHeader.tsx
|       |   |-- ./presentation/components/agent/AgentConfigForm
|       |   |   |-- ./presentation/components/agent/AgentConfigForm/AgentAdvancedSettingsTab.tsx
|       |   |   |-- ./presentation/components/agent/AgentConfigForm/AgentApiKeySection.tsx
|       |   |   |-- ./presentation/components/agent/AgentConfigForm/AgentBasicInfoTab.tsx
|       |   |   |-- ./presentation/components/agent/AgentConfigForm/AgentConfigActions.tsx
|       |   |   |-- ./presentation/components/agent/AgentConfigForm/AgentModelSelector.tsx
|       |   |   |-- ./presentation/components/agent/AgentConfigForm/AgentProviderSelector.tsx
|       |   |   |-- ./presentation/components/agent/AgentConfigForm/AgentValidation.tsx
|       |   |   |-- ./presentation/components/agent/AgentConfigForm/ApiKeyInput.tsx
|       |   |   |-- ./presentation/components/agent/AgentConfigForm/ApiKeyStatus.tsx
|       |   |   |-- ./presentation/components/agent/AgentConfigForm/BaseUrlInput.tsx
|       |   |   |-- ./presentation/components/agent/AgentConfigForm/ConnectionTestButton.tsx
|       |   |   |-- ./presentation/components/agent/AgentConfigForm/CustomHeadersEditor.tsx
|       |   |   |-- ./presentation/components/agent/AgentConfigForm/CustomModelIdInput.tsx
|       |   |   |-- ./presentation/components/agent/AgentConfigForm/index.ts
|       |   |   |-- ./presentation/components/agent/AgentConfigForm/NativeToolsToggle.tsx
|       |   |   `-- ./presentation/components/agent/AgentConfigForm/OpenAICompatibleSettings.tsx
|       |   |-- ./presentation/components/agent/AgentConfigTabContents.tsx
|       |   |-- ./presentation/components/agent/AgentCreationSuccess.tsx
|       |   |-- ./presentation/components/agent/AgentImportExport.tsx
|       |   |-- ./presentation/components/agent/AgentManager.tsx
|       |   |-- ./presentation/components/agent/AgentValidationErrors.tsx
|       |   |-- ./presentation/components/agent/AgentWorkspaceBindingConfig.tsx
|       |   |-- ./presentation/components/agent/AgentWorkspaceSwitchingFeedback.tsx
|       |   |-- ./presentation/components/agent/ApiKeyInputSection.tsx
|       |   |-- ./presentation/components/agent/ConversationCard.tsx
|       |   |-- ./presentation/components/agent/DeepThinkUI.tsx
|       |   |-- ./presentation/components/agent/hooks
|       |   |   |-- ./presentation/components/agent/hooks/index.ts
|       |   |   |-- ./presentation/components/agent/hooks/useAgentFieldUpdate.ts
|       |   |   |-- ./presentation/components/agent/hooks/useAgentFormActions.ts
|       |   |   |-- ./presentation/components/agent/hooks/useAgentFormState.ts
|       |   |   |-- ./presentation/components/agent/hooks/useAgentFormSubmission.ts
|       |   |   |-- ./presentation/components/agent/hooks/useAgentFormValidation.ts
|       |   |   `-- ./presentation/components/agent/hooks/useUnsavedChangesWarning.ts
|       |   |-- ./presentation/components/agent/index.ts
|       |   |-- ./presentation/components/agent/memory-index.ts
|       |   |-- ./presentation/components/agent/MemorySearch.tsx
|       |   |-- ./presentation/components/agent/MigrationStatus.tsx
|       |   |-- ./presentation/components/agent/ModelFetchProgress.tsx
|       |   |-- ./presentation/components/agent/PreferenceSettings.tsx
|       |   |-- ./presentation/components/agent/ProviderConfigDialog.tsx
|       |   |-- ./presentation/components/agent/ProviderDeletionWarningDialog.tsx
|       |   |-- ./presentation/components/agent/ProviderSettings.tsx
|       |   |-- ./presentation/components/agent/ProviderStatusBadge.tsx
|       |   |-- ./presentation/components/agent/ToolAvailabilityIndicator.tsx
|       |   |-- ./presentation/components/agent/ToolPermissionsConfig.tsx
|       |   |-- ./presentation/components/agent/ToolTrustLevelManager.tsx
|       |   |-- ./presentation/components/agent/ToolTrustLevels
|       |   |   |-- ./presentation/components/agent/ToolTrustLevels/hooks
|       |   |   |   |-- ./presentation/components/agent/ToolTrustLevels/hooks/index.ts
|       |   |   |   `-- ./presentation/components/agent/ToolTrustLevels/hooks/useToolTrustLevels.ts
|       |   |   |-- ./presentation/components/agent/ToolTrustLevels/index.ts
|       |   |   |-- ./presentation/components/agent/ToolTrustLevels/ToolTrustRow.tsx
|       |   |   `-- ./presentation/components/agent/ToolTrustLevels/TrustLevelLegend.tsx
|       |   |-- ./presentation/components/agent/UnifiedAgentSelector.tsx
|       |   |-- ./presentation/components/agent/useAgentConfigForm.ts
|       |   |-- ./presentation/components/agent/useAgentConfigProvider.ts
|       |   |-- ./presentation/components/agent/WorkspacePermissionEditor.tsx
|       |   |-- ./presentation/components/agent/WorkspacePermissionManager.tsx
|       |   |-- ./presentation/components/agent/WorkspacePermissions
|       |   |   |-- ./presentation/components/agent/WorkspacePermissions/CategoryApprovalGrid.tsx
|       |   |   |-- ./presentation/components/agent/WorkspacePermissions/FilePermissionRow.tsx
|       |   |   |-- ./presentation/components/agent/WorkspacePermissions/hooks
|       |   |   |   |-- ./presentation/components/agent/WorkspacePermissions/hooks/index.ts
|       |   |   |   `-- ./presentation/components/agent/WorkspacePermissions/hooks/useWorkspacePermissions.ts
|       |   |   |-- ./presentation/components/agent/WorkspacePermissions/index.ts
|       |   |   |-- ./presentation/components/agent/WorkspacePermissions/PermissionBadge.tsx
|       |   |   |-- ./presentation/components/agent/WorkspacePermissions/PermissionGridHeader.tsx
|       |   |   |-- ./presentation/components/agent/WorkspacePermissions/PermissionLegend.tsx
|       |   |   |-- ./presentation/components/agent/WorkspacePermissions/PermissionSwitch.tsx
|       |   |   |-- ./presentation/components/agent/WorkspacePermissions/ToolPermissionRow.tsx
|       |   |   |-- ./presentation/components/agent/WorkspacePermissions/types.ts
|       |   |   `-- ./presentation/components/agent/WorkspacePermissions/YOLOModeToggle.tsx
|       |   `-- ./presentation/components/agent/WorkspaceToolPermissionsConfig.tsx
|       |-- ./presentation/components/analytics
|       |   |-- ./presentation/components/analytics/AnalyticsDashboard.tsx
|       |   |-- ./presentation/components/analytics/index.ts
|       |   `-- ./presentation/components/analytics/MetricsChart.tsx
|       |-- ./presentation/components/audio
|       |   |-- ./presentation/components/audio/AudioPlayer.tsx
|       |   `-- ./presentation/components/audio/index.ts
|       |-- ./presentation/components/canvas
|       |   |-- ./presentation/components/canvas/Canvas.tsx
|       |   |-- ./presentation/components/canvas/CanvasRAGLinkagePanel.tsx
|       |   |-- ./presentation/components/canvas/edges
|       |   |   |-- ./presentation/components/canvas/edges/edgeTypes.tsx
|       |   |   |-- ./presentation/components/canvas/edges/index.ts
|       |   |   `-- ./presentation/components/canvas/edges/RelationshipEdge.tsx
|       |   |-- ./presentation/components/canvas/EnhancedLinkageVisualization.tsx
|       |   |-- ./presentation/components/canvas/index.ts
|       |   |-- ./presentation/components/canvas/LinkageProposalsPanel.tsx
|       |   |-- ./presentation/components/canvas/nodes
|       |   |   |-- ./presentation/components/canvas/nodes/CodeConceptNode.tsx
|       |   |   |-- ./presentation/components/canvas/nodes/ConceptNode.tsx
|       |   |   |-- ./presentation/components/canvas/nodes/index.ts
|       |   |   |-- ./presentation/components/canvas/nodes/nodeTypes.ts
|       |   |   `-- ./presentation/components/canvas/nodes/SourceNode.tsx
|       |   `-- ./presentation/components/canvas/NodeSourcePicker.tsx
|       |-- ./presentation/components/chat
|       |   |-- ./presentation/components/chat/ApprovalOverlay.tsx
|       |   |-- ./presentation/components/chat/AutoApproveSettings.tsx
|       |   |-- ./presentation/components/chat/BatchApprovalBar.tsx
|       |   |-- ./presentation/components/chat/ChatBubble.tsx
|       |   |-- ./presentation/components/chat/ChatBubbleOverlay.tsx
|       |   |-- ./presentation/components/chat/ChatConversation.tsx
|       |   |-- ./presentation/components/chat/ChatHistory.tsx
|       |   |-- ./presentation/components/chat/ChatPanel.tsx
|       |   |-- ./presentation/components/chat/CodeBlock.tsx
|       |   |-- ./presentation/components/chat/ConversationCard.tsx
|       |   |-- ./presentation/components/chat/DebateTimeline.tsx
|       |   |-- ./presentation/components/chat/DiffPreview.tsx
|       |   |-- ./presentation/components/chat/ExpandableChatPanel.tsx
|       |   |-- ./presentation/components/chat/FileAttachmentInput.tsx
|       |   |-- ./presentation/components/chat/ImagePreviewDialog.tsx
|       |   |-- ./presentation/components/chat/index.ts
|       |   |-- ./presentation/components/chat/MessageSearch.tsx
|       |   |-- ./presentation/components/chat/NoteReference.tsx
|       |   |-- ./presentation/components/chat/NoteReferencePicker.tsx
|       |   |-- ./presentation/components/chat/RoutingDecision.tsx
|       |   |-- ./presentation/components/chat/SequentialExpansionOptions.tsx
|       |   |-- ./presentation/components/chat/StreamdownRenderer.tsx
|       |   |-- ./presentation/components/chat/SuggestionChips.tsx
|       |   |-- ./presentation/components/chat/ThreadCard.tsx
|       |   |-- ./presentation/components/chat/ThreadFolderTree.tsx
|       |   |-- ./presentation/components/chat/ThreadManager.tsx
|       |   |-- ./presentation/components/chat/ThreadsList.tsx
|       |   |-- ./presentation/components/chat/TimeoutWarning.tsx
|       |   |-- ./presentation/components/chat/ToolCallBadge.tsx
|       |   |-- ./presentation/components/chat/ToolExecutionIndicator.tsx
|       |   |-- ./presentation/components/chat/ToolProgressIndicator.tsx
|       |   |-- ./presentation/components/chat/UnifiedChatPanel.tsx
|       |   |-- ./presentation/components/chat/URLInputDialog.tsx
|       |   |-- ./presentation/components/chat/workflow
|       |   |   |-- ./presentation/components/chat/workflow/index.ts
|       |   |   |-- ./presentation/components/chat/workflow/useWorkflowDragDrop.ts
|       |   |   |-- ./presentation/components/chat/workflow/WorkflowCanvas.tsx
|       |   |   |-- ./presentation/components/chat/workflow/WorkflowPalette.tsx
|       |   |   |-- ./presentation/components/chat/workflow/WorkflowStepEditor.tsx
|       |   |   |-- ./presentation/components/chat/workflow/WorkflowTemplates.tsx
|       |   |   `-- ./presentation/components/chat/workflow/WorkflowToolbar.tsx
|       |   |-- ./presentation/components/chat/WorkflowBuilder.refactored.tsx
|       |   |-- ./presentation/components/chat/WorkflowBuilder.tsx
|       |   `-- ./presentation/components/chat/WorkflowVisualizer.tsx
|       |-- ./presentation/components/collaboration
|       |   |-- ./presentation/components/collaboration/LiveCursor.tsx
|       |   `-- ./presentation/components/collaboration/UserPresenceIndicator.tsx
|       |-- ./presentation/components/command-palette
|       |   `-- ./presentation/components/command-palette/CommandPalette.tsx
|       |-- ./presentation/components/common
|       |   |-- ./presentation/components/common/AppErrorBoundary.tsx
|       |   |-- ./presentation/components/common/AppInitializer.tsx
|       |   |-- ./presentation/components/common/CrossWorkspaceFileReference.tsx
|       |   |-- ./presentation/components/common/DatabaseRecoveryDialog.tsx
|       |   |-- ./presentation/components/common/ErrorBoundary.tsx
|       |   |-- ./presentation/components/common/hooks
|       |   |   `-- ./presentation/components/common/hooks/useUnsavedChangesWarning.ts
|       |   |-- ./presentation/components/common/index.ts
|       |   |-- ./presentation/components/common/UnsavedChangesDialog.tsx
|       |   `-- ./presentation/components/common/WorkspaceSwitcher.tsx
|       |-- ./presentation/components/dashboard
|       |   |-- ./presentation/components/dashboard/Onboarding.tsx
|       |   `-- ./presentation/components/dashboard/PitchDeck.tsx
|       |-- ./presentation/components/dev
|       |   `-- ./presentation/components/dev/SyncDevTools.tsx
|       |-- ./presentation/components/diff
|       |   |-- ./presentation/components/diff/DiffViewer.tsx
|       |   |-- ./presentation/components/diff/index.ts
|       |   |-- ./presentation/components/diff/LineDiff.tsx
|       |   `-- ./presentation/components/diff/MergeConflictResolver.tsx
|       |-- ./presentation/components/editor
|       |   |-- ./presentation/components/editor/DefinitionTooltip.tsx
|       |   |-- ./presentation/components/editor/EditorTab.tsx
|       |   |-- ./presentation/components/editor/EditorTabBar.tsx
|       |   |-- ./presentation/components/editor/index.ts
|       |   `-- ./presentation/components/editor/SymbolsPanel.tsx
|       |-- ./presentation/components/error
|       |   |-- ./presentation/components/error/ErrorBoundary.tsx
|       |   |-- ./presentation/components/error/ErrorFallback.tsx
|       |   |-- ./presentation/components/error/ErrorMessage.tsx
|       |   `-- ./presentation/components/error/index.ts
|       |-- ./presentation/components/formatter
|       |   |-- ./presentation/components/formatter/FormatDialog.tsx
|       |   |-- ./presentation/components/formatter/index.ts
|       |   `-- ./presentation/components/formatter/MobileFormatButton.tsx
|       |-- ./presentation/components/git
|       |   |-- ./presentation/components/git/GitBranchManager.tsx
|       |   |-- ./presentation/components/git/GitCommitDialog.tsx
|       |   |-- ./presentation/components/git/GitDiffViewer.tsx
|       |   |-- ./presentation/components/git/GitMergeConflictResolver.tsx
|       |   |-- ./presentation/components/git/GitSettings.tsx
|       |   `-- ./presentation/components/git/index.ts
|       |-- ./presentation/components/Header.tsx
|       |-- ./presentation/components/hub
|       |   |-- ./presentation/components/hub/ActivityCard.tsx
|       |   |-- ./presentation/components/hub/ActivityLineChart.tsx
|       |   |-- ./presentation/components/hub/BootSequence.tsx
|       |   |-- ./presentation/components/hub/ChartsGrid.tsx
|       |   |-- ./presentation/components/hub/DeleteProjectDialog.tsx
|       |   |-- ./presentation/components/hub/HubHero.tsx
|       |   |-- ./presentation/components/hub/HubHomePage.tsx
|       |   |-- ./presentation/components/hub/index.ts
|       |   |-- ./presentation/components/hub/InitialWorkspaceSelector.tsx
|       |   |-- ./presentation/components/hub/MobileProjectSelector.tsx
|       |   |-- ./presentation/components/hub/NavigationBreadcrumbs.tsx
|       |   |-- ./presentation/components/hub/ProjectActionsMenu.tsx
|       |   |-- ./presentation/components/hub/ProjectCard.tsx
|       |   |-- ./presentation/components/hub/ProjectCountCard.tsx
|       |   |-- ./presentation/components/hub/ProjectMetadataDialog.tsx
|       |   |-- ./presentation/components/hub/ProjectPickerDialog.tsx
|       |   |-- ./presentation/components/hub/ProjectSearchBar.tsx
|       |   |-- ./presentation/components/hub/RecentProjectsSection.tsx
|       |   |-- ./presentation/components/hub/StorageUsageCard.tsx
|       |   |-- ./presentation/components/hub/SummaryCardsGrid.tsx
|       |   |-- ./presentation/components/hub/TopicCard.tsx
|       |   |-- ./presentation/components/hub/TopicPortalCard.tsx
|       |   |-- ./presentation/components/hub/useDashboardMetrics.ts
|       |   |-- ./presentation/components/hub/useMetricsCollection.ts
|       |   |-- ./presentation/components/hub/useProjectSearch.ts
|       |   |-- ./presentation/components/hub/useWorkspaceBindingState.ts
|       |   |-- ./presentation/components/hub/useWorkspaceFilters.ts
|       |   |-- ./presentation/components/hub/WorkspaceBadge.tsx
|       |   |-- ./presentation/components/hub/WorkspaceBindingDialog.tsx
|       |   |-- ./presentation/components/hub/WorkspaceBindingDialog.types.ts
|       |   |-- ./presentation/components/hub/WorkspaceBindingFooter.tsx
|       |   |-- ./presentation/components/hub/WorkspaceBindingHeader.tsx
|       |   |-- ./presentation/components/hub/WorkspaceBindingToggle.tsx
|       |   |-- ./presentation/components/hub/WorkspaceCheckboxItem.tsx
|       |   |-- ./presentation/components/hub/WorkspaceCheckboxList.tsx
|       |   |-- ./presentation/components/hub/WorkspaceFilter.tsx
|       |   `-- ./presentation/components/hub/WorkspacePieChart.tsx
|       |-- ./presentation/components/ide
|       |   |-- ./presentation/components/ide/AgentChatPanel
|       |   |   |-- ./presentation/components/ide/AgentChatPanel/AgentChatAPIKeyManager.tsx
|       |   |   |-- ./presentation/components/ide/AgentChatPanel/AgentChatApprovals.tsx
|       |   |   |-- ./presentation/components/ide/AgentChatPanel/AgentChatConversationManager.tsx
|       |   |   |-- ./presentation/components/ide/AgentChatPanel/AgentChatEnhancingUI.tsx
|       |   |   |-- ./presentation/components/ide/AgentChatPanel/AgentChatHeader.tsx
|       |   |   |-- ./presentation/components/ide/AgentChatPanel/AgentChatStatus.tsx
|       |   |   |-- ./presentation/components/ide/AgentChatPanel/AgentChatToolFacades.tsx
|       |   |   |-- ./presentation/components/ide/AgentChatPanel/index.ts
|       |   |   |-- ./presentation/components/ide/AgentChatPanel/message-mappers.ts
|       |   |   `-- ./presentation/components/ide/AgentChatPanel/useAgentChatApprovals.ts
|       |   |-- ./presentation/components/ide/AgentChatPanel.tsx
|       |   |-- ./presentation/components/ide/AgentsPanel.tsx
|       |   |-- ./presentation/components/ide/BentoCardPreview.tsx
|       |   |-- ./presentation/components/ide/BentoGrid.tsx
|       |   |-- ./presentation/components/ide/CacheIndicator.tsx
|       |   |-- ./presentation/components/ide/CommandPalette.tsx
|       |   |-- ./presentation/components/ide/EnhancedChatInterface.tsx
|       |   |-- ./presentation/components/ide/ExplorerPanel.tsx
|       |   |-- ./presentation/components/ide/FeatureSearch.tsx
|       |   |-- ./presentation/components/ide/FileTree
|       |   |   |-- ./presentation/components/ide/FileTree/ConfirmDialog.tsx
|       |   |   |-- ./presentation/components/ide/FileTree/ContextMenu.tsx
|       |   |   |-- ./presentation/components/ide/FileTree/FileOperationDialog.tsx
|       |   |   |-- ./presentation/components/ide/FileTree/FileTree.tsx
|       |   |   |-- ./presentation/components/ide/FileTree/FileTreeItem.tsx
|       |   |   |-- ./presentation/components/ide/FileTree/hooks
|       |   |   |   |-- ./presentation/components/ide/FileTree/hooks/useContextMenuActions.ts
|       |   |   |   |-- ./presentation/components/ide/FileTree/hooks/useFileTreeActions.ts
|       |   |   |   |-- ./presentation/components/ide/FileTree/hooks/useFileTreeEventSubscriptions.ts
|       |   |   |   |-- ./presentation/components/ide/FileTree/hooks/useFileTreeState.ts
|       |   |   |   `-- ./presentation/components/ide/FileTree/hooks/useKeyboardNavigation.ts
|       |   |   |-- ./presentation/components/ide/FileTree/hooks.ts
|       |   |   |-- ./presentation/components/ide/FileTree/icons.tsx
|       |   |   |-- ./presentation/components/ide/FileTree/index.ts
|       |   |   |-- ./presentation/components/ide/FileTree/types.ts
|       |   |   `-- ./presentation/components/ide/FileTree/utils.ts
|       |   |-- ./presentation/components/ide/hooks
|       |   |   |-- ./presentation/components/ide/hooks/index.ts
|       |   |   |-- ./presentation/components/ide/hooks/useAgentChatApiKeys.ts
|       |   |   |-- ./presentation/components/ide/hooks/useAgentChatApproval.ts
|       |   |   |-- ./presentation/components/ide/hooks/useAgentChatArtifacts.ts
|       |   |   |-- ./presentation/components/ide/hooks/useAgentChatMessages.ts
|       |   |   `-- ./presentation/components/ide/hooks/useLazyFileContent.ts
|       |   |-- ./presentation/components/ide/IconSidebar.tsx
|       |   |-- ./presentation/components/ide/index.ts
|       |   |-- ./presentation/components/ide/MonacoEditor
|       |   |   |-- ./presentation/components/ide/MonacoEditor/EditorTabBar.legacy.tsx
|       |   |   |-- ./presentation/components/ide/MonacoEditor/EditorTabBar.tsx
|       |   |   |-- ./presentation/components/ide/MonacoEditor/hooks
|       |   |   |   |-- ./presentation/components/ide/MonacoEditor/hooks/index.ts
|       |   |   |   |-- ./presentation/components/ide/MonacoEditor/hooks/useMonacoEditorEventSubscriptions.ts
|       |   |   |   `-- ./presentation/components/ide/MonacoEditor/hooks/useMonacoEventSubscriptions.ts
|       |   |   |-- ./presentation/components/ide/MonacoEditor/index.ts
|       |   |   `-- ./presentation/components/ide/MonacoEditor/MonacoEditor.tsx
|       |   |-- ./presentation/components/ide/PanelShell.tsx
|       |   |-- ./presentation/components/ide/PreviewPanel
|       |   |   |-- ./presentation/components/ide/PreviewPanel/index.ts
|       |   |   |-- ./presentation/components/ide/PreviewPanel/PreviewPanel.tsx
|       |   |   `-- ./presentation/components/ide/PreviewPanel/types.ts
|       |   |-- ./presentation/components/ide/QuickActionsMenu.tsx
|       |   |-- ./presentation/components/ide/SearchPanel.tsx
|       |   |-- ./presentation/components/ide/SettingsPanel.tsx
|       |   |-- ./presentation/components/ide/statusbar
|       |   |   |-- ./presentation/components/ide/statusbar/AgentStatusSegment.tsx
|       |   |   |-- ./presentation/components/ide/statusbar/CursorPosition.tsx
|       |   |   |-- ./presentation/components/ide/statusbar/FileTypeIndicator.tsx
|       |   |   |-- ./presentation/components/ide/statusbar/index.ts
|       |   |   |-- ./presentation/components/ide/statusbar/ProviderStatus.tsx
|       |   |   |-- ./presentation/components/ide/statusbar/StatusBarSegment.tsx
|       |   |   |-- ./presentation/components/ide/statusbar/SyncStatusSegment.tsx
|       |   |   `-- ./presentation/components/ide/statusbar/WebContainerStatus.tsx
|       |   |-- ./presentation/components/ide/StatusBar.tsx
|       |   |-- ./presentation/components/ide/StreamingMessage.tsx
|       |   |-- ./presentation/components/ide/SyncEditWarning.tsx
|       |   |-- ./presentation/components/ide/SyncStatusIndicator.tsx
|       |   |-- ./presentation/components/ide/SyncStatusPanel.tsx
|       |   |-- ./presentation/components/ide/XTerminal
|       |   |   `-- ./presentation/components/ide/XTerminal/hooks
|       |   |       `-- ./presentation/components/ide/XTerminal/hooks/useTerminalEventSubscriptions.ts
|       |   `-- ./presentation/components/ide/XTerminal.tsx
|       |-- ./presentation/components/keyboard
|       |   |-- ./presentation/components/keyboard/index.ts
|       |   `-- ./presentation/components/keyboard/KeyboardShortcutsHelp.tsx
|       |-- ./presentation/components/knowledge
|       |   |-- ./presentation/components/knowledge/CollectionManager.tsx
|       |   |-- ./presentation/components/knowledge/CollectionSelector.tsx
|       |   |-- ./presentation/components/knowledge/CreateCollectionDialog.tsx
|       |   |-- ./presentation/components/knowledge/flashcard-preview.tsx
|       |   |-- ./presentation/components/knowledge/FlashcardPreviewPanel.tsx
|       |   |-- ./presentation/components/knowledge/hooks
|       |   |   |-- ./presentation/components/knowledge/hooks/index.ts
|       |   |   `-- ./presentation/components/knowledge/hooks/useAPIKeyRetrieval.ts
|       |   |-- ./presentation/components/knowledge/index.ts
|       |   |-- ./presentation/components/knowledge/IndexingProgressPanel.tsx
|       |   |-- ./presentation/components/knowledge/KnowledgePage.tsx
|       |   |-- ./presentation/components/knowledge/MetadataDisplay.tsx
|       |   |-- ./presentation/components/knowledge/MetadataEditor.tsx
|       |   |-- ./presentation/components/knowledge/QuizPreviewPanel.tsx
|       |   |-- ./presentation/components/knowledge/RAGConfigurationPanel.tsx
|       |   |-- ./presentation/components/knowledge/RenameDialog.tsx
|       |   |-- ./presentation/components/knowledge/SourceCard.tsx
|       |   |-- ./presentation/components/knowledge/SourceCardGrid.tsx
|       |   |-- ./presentation/components/knowledge/SourceContextMenu.tsx
|       |   |-- ./presentation/components/knowledge/SourceImportDialog.tsx
|       |   |-- ./presentation/components/knowledge/SourceMetadataDialog.tsx
|       |   |-- ./presentation/components/knowledge/SourcePreviewPanel.tsx
|       |   |-- ./presentation/components/knowledge/StudyArtifactExportDialog.tsx
|       |   |-- ./presentation/components/knowledge/SynthesisDialog.tsx
|       |   `-- ./presentation/components/knowledge/UndoToast.tsx
|       |-- ./presentation/components/LanguageSwitcher.tsx
|       |-- ./presentation/components/layout
|       |   |-- ./presentation/components/layout/ChatPanelWrapper.tsx
|       |   |-- ./presentation/components/layout/hooks
|       |   |   |-- ./presentation/components/layout/hooks/index.ts
|       |   |   |-- ./presentation/components/layout/hooks/useIDEFileHandlers.ts
|       |   |   |-- ./presentation/components/layout/hooks/useIDEKeyboardShortcuts.ts
|       |   |   |-- ./presentation/components/layout/hooks/useIDEStateRestoration.ts
|       |   |   `-- ./presentation/components/layout/hooks/useWebContainerBoot.ts
|       |   |-- ./presentation/components/layout/IDEHeaderBar.tsx
|       |   |-- ./presentation/components/layout/IDELayout
|       |   |   |-- ./presentation/components/layout/IDELayout/IDEChatPanel.tsx
|       |   |   |-- ./presentation/components/layout/IDELayout/IDEDiscoveryMechanisms.tsx
|       |   |   |-- ./presentation/components/layout/IDELayout/IDEEditorPanel.tsx
|       |   |   |-- ./presentation/components/layout/IDELayout/IDEEditorPreviewGroup.tsx
|       |   |   |-- ./presentation/components/layout/IDELayout/IDEErrorBoundaryWrapper.tsx
|       |   |   |-- ./presentation/components/layout/IDELayout/IDEPreviewPanel.tsx
|       |   |   |-- ./presentation/components/layout/IDELayout/IDEResizableLayout.tsx
|       |   |   |-- ./presentation/components/layout/IDELayout/IDESidebarPanelComponents.tsx
|       |   |   |-- ./presentation/components/layout/IDELayout/IDESidebarPanels.tsx
|       |   |   |-- ./presentation/components/layout/IDELayout/IDETerminalPanel.tsx
|       |   |   |-- ./presentation/components/layout/IDELayout/index.ts
|       |   |   |-- ./presentation/components/layout/IDELayout/types.ts
|       |   |   |-- ./presentation/components/layout/IDELayout/useIDELayoutDiscoveryState.ts
|       |   |   |-- ./presentation/components/layout/IDELayout/useIDELayoutFileState.ts
|       |   |   |-- ./presentation/components/layout/IDELayout/useIDELayoutPanelRefs.ts
|       |   |   |-- ./presentation/components/layout/IDELayout/useIDELayoutState.ts
|       |   |   `-- ./presentation/components/layout/IDELayout/useIDELayoutWorkspaceState.ts
|       |   |-- ./presentation/components/layout/IDELayoutMain.tsx
|       |   |-- ./presentation/components/layout/index.ts
|       |   |-- ./presentation/components/layout/MainLayout.tsx
|       |   |-- ./presentation/components/layout/MainSidebar.tsx
|       |   |-- ./presentation/components/layout/MinViewportWarning.tsx
|       |   |-- ./presentation/components/layout/MobileIDELayout.tsx
|       |   |-- ./presentation/components/layout/MobileTabBar.tsx
|       |   |-- ./presentation/components/layout/PermissionOverlay.tsx
|       |   `-- ./presentation/components/layout/TerminalPanel.tsx
|       |-- ./presentation/components/notes
|       |   |-- ./presentation/components/notes/AIPromptDialog.tsx
|       |   |-- ./presentation/components/notes/AISlashCommand.tsx
|       |   |-- ./presentation/components/notes/AITransformMenu.tsx
|       |   |-- ./presentation/components/notes/index.ts
|       |   |-- ./presentation/components/notes/MarkdownExportDialog.tsx
|       |   |-- ./presentation/components/notes/MarkdownImportDialog.tsx
|       |   |-- ./presentation/components/notes/MultiModalImport.tsx
|       |   |-- ./presentation/components/notes/NoteContextMenu.tsx
|       |   |-- ./presentation/components/notes/NoteEditor.css
|       |   |-- ./presentation/components/notes/NoteEditor.tsx
|       |   |-- ./presentation/components/notes/NotesFilePicker.tsx
|       |   |-- ./presentation/components/notes/NoteSidebar.tsx
|       |   |-- ./presentation/components/notes/NoteSidebarChat.tsx
|       |   |-- ./presentation/components/notes/NotesIndexingButton.tsx
|       |   |-- ./presentation/components/notes/NotesPage.tsx
|       |   |-- ./presentation/components/notes/NotesRAGSearch.tsx
|       |   |-- ./presentation/components/notes/NoteStudyMenu.tsx
|       |   |-- ./presentation/components/notes/NoteTree.tsx
|       |   |-- ./presentation/components/notes/NoteTreeItem.tsx
|       |   |-- ./presentation/components/notes/ProjectFilesPanel.tsx
|       |   `-- ./presentation/components/notes/VoiceRecordButton.tsx
|       |-- ./presentation/components/notifications
|       |   |-- ./presentation/components/notifications/index.ts
|       |   |-- ./presentation/components/notifications/NotificationBadge.tsx
|       |   |-- ./presentation/components/notifications/NotificationCenter.tsx
|       |   |-- ./presentation/components/notifications/NotificationPermissionRequester.tsx
|       |   `-- ./presentation/components/notifications/Toast.tsx
|       |-- ./presentation/components/offline
|       |   `-- ./presentation/components/offline/OfflineIndicator.tsx
|       |-- ./presentation/components/plugins
|       |   |-- ./presentation/components/plugins/index.ts
|       |   |-- ./presentation/components/plugins/PluginManager.tsx
|       |   |-- ./presentation/components/plugins/PluginMarketplace.tsx
|       |   `-- ./presentation/components/plugins/PluginSettings.tsx
|       |-- ./presentation/components/project
|       |   |-- ./presentation/components/project/ProjectCreationWizard.tsx
|       |   |-- ./presentation/components/project/ProjectSelector.tsx
|       |   |-- ./presentation/components/project/ProjectsPage.tsx
|       |   |-- ./presentation/components/project/steps
|       |   |   |-- ./presentation/components/project/steps/AgentSelectionStep.tsx
|       |   |   |-- ./presentation/components/project/steps/FileSetupStep.tsx
|       |   |   |-- ./presentation/components/project/steps/ProjectDetailsStep.tsx
|       |   |   |-- ./presentation/components/project/steps/ReviewStep.tsx
|       |   |   |-- ./presentation/components/project/steps/TemplateSelectionStep.tsx
|       |   |   `-- ./presentation/components/project/steps/WorkspaceSetupStep.tsx
|       |   `-- ./presentation/components/project/wizard-types.ts
|       |-- ./presentation/components/rag
|       |   |-- ./presentation/components/rag/CitationSidebar.tsx
|       |   |-- ./presentation/components/rag/index.ts
|       |   |-- ./presentation/components/rag/IndexingProgressPanel.tsx
|       |   |-- ./presentation/components/rag/RAGChatPanel.tsx
|       |   |-- ./presentation/components/rag/RAGPanelContainer.tsx
|       |   `-- ./presentation/components/rag/RAGSearchPanel.tsx
|       |-- ./presentation/components/scheduler
|       |   |-- ./presentation/components/scheduler/index.ts
|       |   |-- ./presentation/components/scheduler/ScheduledTasksDialog.tsx
|       |   |-- ./presentation/components/scheduler/SchedulePresetSelector.tsx
|       |   |-- ./presentation/components/scheduler/TaskEditor.tsx
|       |   `-- ./presentation/components/scheduler/TaskExecutionHistory.tsx
|       |-- ./presentation/components/search
|       |   |-- ./presentation/components/search/AdvancedSearchDialog.tsx
|       |   |-- ./presentation/components/search/index.ts
|       |   |-- ./presentation/components/search/SavedSearches.tsx
|       |   |-- ./presentation/components/search/SearchFilters.tsx
|       |   `-- ./presentation/components/search/SearchResults.tsx
|       |-- ./presentation/components/settings
|       |   |-- ./presentation/components/settings/SettingsExportDialog.tsx
|       |   `-- ./presentation/components/settings/SettingsImportDialog.tsx
|       |-- ./presentation/components/snippets
|       |   |-- ./presentation/components/snippets/SnippetEditor.tsx
|       |   `-- ./presentation/components/snippets/SnippetManager.tsx
|       |-- ./presentation/components/study
|       |   |-- ./presentation/components/study/flashcard.tsx
|       |   |-- ./presentation/components/study/index.ts
|       |   |-- ./presentation/components/study/quiz-preview.tsx
|       |   |-- ./presentation/components/study/QuizContainer.tsx
|       |   |-- ./presentation/components/study/QuizQuestionView.tsx
|       |   |-- ./presentation/components/study/QuizResults.tsx
|       |   |-- ./presentation/components/study/QuizReview.tsx
|       |   |-- ./presentation/components/study/QuizStartScreen.tsx
|       |   |-- ./presentation/components/study/study-session.tsx
|       |   |-- ./presentation/components/study/study-stats.tsx
|       |   |-- ./presentation/components/study/StudyFilePicker.tsx
|       |   `-- ./presentation/components/study/StudyPage.tsx
|       |-- ./presentation/components/templates
|       |   |-- ./presentation/components/templates/TemplateCustomization.tsx
|       |   `-- ./presentation/components/templates/TemplateGallery.tsx
|       |-- ./presentation/components/terminal
|       |   |-- ./presentation/components/terminal/TerminalPanel.tsx
|       |   `-- ./presentation/components/terminal/TerminalTabs.tsx
|       |-- ./presentation/components/ui
|       |   |-- ./presentation/components/ui/activity-indicators
|       |   |   |-- ./presentation/components/ui/activity-indicators/ChunkingStatusIndicator.tsx
|       |   |   |-- ./presentation/components/ui/activity-indicators/DatabaseIndexingIndicator.tsx
|       |   |   |-- ./presentation/components/ui/activity-indicators/EmbeddingProgressIndicator.tsx
|       |   |   |-- ./presentation/components/ui/activity-indicators/index.ts
|       |   |   |-- ./presentation/components/ui/activity-indicators/RAGAutoIndexingIndicator.tsx
|       |   |   |-- ./presentation/components/ui/activity-indicators/SyncStatusIndicator.tsx
|       |   |   |-- ./presentation/components/ui/activity-indicators/SyncStatusPanel.tsx
|       |   |   `-- ./presentation/components/ui/activity-indicators/types.ts
|       |   |-- ./presentation/components/ui/AgentValidationFeedback.tsx
|       |   |-- ./presentation/components/ui/alert.tsx
|       |   |-- ./presentation/components/ui/ApprovalOverlay.css
|       |   |-- ./presentation/components/ui/ApprovalOverlay.tsx
|       |   |-- ./presentation/components/ui/badge.tsx
|       |   |-- ./presentation/components/ui/brand-logo.tsx
|       |   |-- ./presentation/components/ui/breadcrumbs.tsx
|       |   |-- ./presentation/components/ui/button.tsx
|       |   |-- ./presentation/components/ui/card.tsx
|       |   |-- ./presentation/components/ui/checkbox.tsx
|       |   |-- ./presentation/components/ui/collapsible-section.tsx
|       |   |-- ./presentation/components/ui/context-tooltip.tsx
|       |   |-- ./presentation/components/ui/dialog.tsx
|       |   |-- ./presentation/components/ui/dropdown-menu.tsx
|       |   |-- ./presentation/components/ui/EmptyState.tsx
|       |   |-- ./presentation/components/ui/ErrorState.tsx
|       |   |-- ./presentation/components/ui/event-indicators
|       |   |   |-- ./presentation/components/ui/event-indicators/event-indicator-utils.tsx
|       |   |   |-- ./presentation/components/ui/event-indicators/EventIndicator.tsx
|       |   |   |-- ./presentation/components/ui/event-indicators/index.ts
|       |   |   |-- ./presentation/components/ui/event-indicators/indexing-utils.tsx
|       |   |   |-- ./presentation/components/ui/event-indicators/IndexingPhaseItem.tsx
|       |   |   |-- ./presentation/components/ui/event-indicators/IndexingProgressIndicator.tsx
|       |   |   |-- ./presentation/components/ui/event-indicators/note-indexing-utils.tsx
|       |   |   |-- ./presentation/components/ui/event-indicators/NoteIndexingIndicator.tsx
|       |   |   |-- ./presentation/components/ui/event-indicators/quiz-generation-utils.tsx
|       |   |   |-- ./presentation/components/ui/event-indicators/QuizGenerationIndicator.tsx
|       |   |   |-- ./presentation/components/ui/event-indicators/QuizGenerationStepItem.tsx
|       |   |   |-- ./presentation/components/ui/event-indicators/StreamingStatusIndicator.tsx
|       |   |   |-- ./presentation/components/ui/event-indicators/ToolExecutionIndicator.tsx
|       |   |   |-- ./presentation/components/ui/event-indicators/ToolExecutionStep.tsx
|       |   |   |-- ./presentation/components/ui/event-indicators/types.ts
|       |   |   |-- ./presentation/components/ui/event-indicators/workspace-transition-utils.tsx
|       |   |   |-- ./presentation/components/ui/event-indicators/WorkspaceTransitionIndicator.tsx
|       |   |   `-- ./presentation/components/ui/event-indicators/WorkspaceTransitionStepItem.tsx
|       |   |-- ./presentation/components/ui/icons
|       |   |   |-- ./presentation/components/ui/icons/AIIcon.tsx
|       |   |   |-- ./presentation/components/ui/icons/ChatIcon.tsx
|       |   |   |-- ./presentation/components/ui/icons/CloseIcon.tsx
|       |   |   |-- ./presentation/components/ui/icons/FileIcon.tsx
|       |   |   |-- ./presentation/components/ui/icons/icon.tsx
|       |   |   |-- ./presentation/components/ui/icons/index.ts
|       |   |   |-- ./presentation/components/ui/icons/MaximizeIcon.tsx
|       |   |   |-- ./presentation/components/ui/icons/MenuIcon.tsx
|       |   |   |-- ./presentation/components/ui/icons/MinusIcon.tsx
|       |   |   |-- ./presentation/components/ui/icons/PlusIcon.tsx
|       |   |   |-- ./presentation/components/ui/icons/RefreshIcon.tsx
|       |   |   |-- ./presentation/components/ui/icons/SearchIcon.tsx
|       |   |   |-- ./presentation/components/ui/icons/SettingsIcon.tsx
|       |   |   |-- ./presentation/components/ui/icons/source-icons.tsx
|       |   |   `-- ./presentation/components/ui/icons/TerminalIcon.tsx
|       |   |-- ./presentation/components/ui/index.ts
|       |   |-- ./presentation/components/ui/input.tsx
|       |   |-- ./presentation/components/ui/keyboard-shortcuts-overlay.tsx
|       |   |-- ./presentation/components/ui/label.tsx
|       |   |-- ./presentation/components/ui/loading-components.ts
|       |   |-- ./presentation/components/ui/LoadingSpinner.tsx
|       |   |-- ./presentation/components/ui/LoadingState.tsx
|       |   |-- ./presentation/components/ui/MobileCapabilityBanner.tsx
|       |   |-- ./presentation/components/ui/ModelLoadingSpinner.tsx
|       |   |-- ./presentation/components/ui/pixel-badge.tsx
|       |   |-- ./presentation/components/ui/progress-indicator.tsx
|       |   |-- ./presentation/components/ui/progress.tsx
|       |   |-- ./presentation/components/ui/ProgressBar.tsx
|       |   |-- ./presentation/components/ui/resizable.tsx
|       |   |-- ./presentation/components/ui/select.tsx
|       |   |-- ./presentation/components/ui/separator.tsx
|       |   |-- ./presentation/components/ui/sheet.tsx
|       |   |-- ./presentation/components/ui/skeleton.tsx
|       |   |-- ./presentation/components/ui/SkeletonLoader.tsx
|       |   |-- ./presentation/components/ui/SkeletonScreen.tsx
|       |   |-- ./presentation/components/ui/SkipLinks.tsx
|       |   |-- ./presentation/components/ui/slider.tsx
|       |   |-- ./presentation/components/ui/sonner.tsx
|       |   |-- ./presentation/components/ui/status-dot.tsx
|       |   |-- ./presentation/components/ui/StatusAnnouncer.tsx
|       |   |-- ./presentation/components/ui/StreamingIndicator.tsx
|       |   |-- ./presentation/components/ui/switch.tsx
|       |   |-- ./presentation/components/ui/tabs.tsx
|       |   |-- ./presentation/components/ui/textarea.tsx
|       |   |-- ./presentation/components/ui/ThemeProvider.tsx
|       |   |-- ./presentation/components/ui/ThemeToggle.tsx
|       |   |-- ./presentation/components/ui/Toast
|       |   |   |-- ./presentation/components/ui/Toast/index.ts
|       |   |   |-- ./presentation/components/ui/Toast/Toast.tsx
|       |   |   `-- ./presentation/components/ui/Toast/ToastContext.tsx
|       |   |-- ./presentation/components/ui/tooltip.tsx
|       |   `-- ./presentation/components/ui/truncated-text.tsx
|       |-- ./presentation/components/watcher
|       |   |-- ./presentation/components/watcher/FileChangeDialog.tsx
|       |   |-- ./presentation/components/watcher/index.ts
|       |   `-- ./presentation/components/watcher/MonacoEditorWithWatcher.tsx
|       `-- ./presentation/components/workspace
|           `-- ./presentation/components/workspace/WorkspaceEnhancedSwitcher.tsx
|-- ./router.tsx
|-- ./routes
|   |-- ./routes/about.lazy.tsx
|   |-- ./routes/about.tsx
|   |-- ./routes/agents.tsx
|   |-- ./routes/api
|   |   |-- ./routes/api/chat.ts
|   |   |-- ./routes/api/flashcards
|   |   |   `-- ./routes/api/flashcards/generate.ts
|   |   `-- ./routes/api/quizzes
|   |       `-- ./routes/api/quizzes/generate.ts
|   |-- ./routes/debug.tsx
|   |-- ./routes/hub.tsx
|   |-- ./routes/ide.$projectId.tsx
|   |-- ./routes/ide.$projectId.tsx.bak
|   |-- ./routes/ide.tsx
|   |-- ./routes/index.tsx
|   |-- ./routes/knowledge.$projectId.lazy.tsx
|   |-- ./routes/knowledge.lazy.tsx
|   |-- ./routes/notes.$projectId.lazy.tsx
|   |-- ./routes/notes.lazy.tsx
|   |-- ./routes/projects.tsx
|   |-- ./routes/settings.tsx
|   |-- ./routes/study.$projectId.lazy.tsx
|   |-- ./routes/study.lazy.tsx
|   |-- ./routes/test-error-boundary.tsx
|   |-- ./routes/test-fs-adapter.tsx
|   |-- ./routes/webcontainer.$.tsx
|   `-- ./routes/workspace
|       |-- ./routes/workspace/$projectId.tsx
|       `-- ./routes/workspace/index.tsx
|-- ./routeTree.gen.ts
|-- ./server.ts
|-- ./shared
|   `-- ./shared/types
|       `-- ./shared/types/index.ts
|-- ./src-tree.md
|-- ./styles
|   |-- ./styles/animations.css
|   |-- ./styles/design-tokens.css
|   |-- ./styles/design-tokens.ts
|   `-- ./styles/light-theme-tokens.css
|-- ./styles.css
|-- ./tree-2025-12-24.md
|-- ./tree.md
|-- ./tree.txt
|-- ./tree.xml
|-- ./types
|   |-- ./types/theme.ts
|   |-- ./types/tool-call.ts
|   `-- ./types/vitest-axe.d.ts
|-- ./utils
|   `-- ./utils/export-utils.ts
`-- ./workers
    `-- ./workers/note-embedding.worker.ts

228 directories, 1408 files
