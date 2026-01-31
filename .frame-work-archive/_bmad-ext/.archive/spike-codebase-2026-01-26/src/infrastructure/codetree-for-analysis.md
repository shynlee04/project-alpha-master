.
├── codetree-2026-01-04.md
├── codetree-for-analysi-2.mds
├── events
│   ├── cross-workspace-event-bus.ts
│   ├── event-bus.ts
│   └── index.ts
├── external
├── framework
├── persistence
│   ├── codetree-2026-01-04.md
│   ├── dexie-db-ai-types.ts
│   ├── dexie-db-class.ts
│   ├── dexie-db-core-types.ts
│   ├── dexie-db-helpers
│   │   ├── additional-file-metadata-helpers.ts
│   │   ├── collection-helpers-basic.ts
│   │   ├── collection-helpers-sources.ts
│   │   ├── conversation-thread-helpers.ts
│   │   ├── file-metadata-helpers.ts
│   │   ├── fsa-handle-helpers.ts
│   │   ├── ide-state-helpers.ts
│   │   ├── index.ts
│   │   ├── session-snapshot-helpers.ts
│   │   ├── source-helpers-basic.ts
│   │   ├── source-helpers-search.ts
│   │   ├── sync-status-helpers-basic.ts
│   │   ├── sync-status-helpers-query.ts
│   │   ├── synthesis-result-helpers-create.ts
│   │   ├── synthesis-result-helpers-crud.ts
│   │   └── tool-execution-log-helpers.ts
│   ├── dexie-db-helpers.ts
│   ├── dexie-db-knowledge-types.ts
│   ├── dexie-db-migrations.ts
│   ├── dexie-db-session-types.ts
│   ├── dexie-db-types.ts
│   ├── dexie-db.ts
│   ├── dexie-storage.ts
│   ├── index.ts
│   ├── rag-store-helpers.ts
│   ├── rag-store-types.ts
│   ├── state-orchestrator.ts
│   └── stores
│       ├── agents
│       │   ├── agent-selection-store.ts
│       │   ├── index.ts
│       │   ├── slices
│       │   │   ├── agent-crud-slice.ts
│       │   │   ├── agent-events-slice.ts
│       │   │   ├── agent-utils-slice.ts
│       │   │   ├── agent-validation-slice.ts
│       │   │   ├── agent-workspace-bindings-slice.ts
│       │   │   └── index.ts
│       │   └── types.ts
│       ├── agents-store.test.ts
│       ├── auto-approve-store.ts
│       ├── canvas-store.ts
│       ├── conversation
│       │   ├── conversation-events-slice.ts
│       │   ├── conversation-helpers.ts
│       │   ├── conversation-metadata-slice.ts
│       │   ├── conversation-store.ts
│       │   ├── conversation-types.ts
│       │   ├── conversation-utils-slice.ts
│       │   ├── conversation-validation-slice.ts
│       │   ├── index.ts
│       │   ├── message-crud-slice.ts
│       │   ├── migration
│       │   │   └── conversation-migration.ts
│       │   ├── slices
│       │   │   ├── create-context-window-slice.ts
│       │   │   ├── create-hierarchy-slice.ts
│       │   │   ├── create-message-slice.ts
│       │   │   ├── create-metadata-slice.ts
│       │   │   ├── create-project-state-slice.ts
│       │   │   ├── create-thread-crud-slice.ts
│       │   │   └── index.ts
│       │   ├── thread-management-slice.ts
│       │   ├── types.ts
│       │   └── useConversationStore.ts
│       ├── conversation-auto-restore.ts
│       ├── events
│       │   └── event-status-store.ts
│       ├── filesystem
│       │   ├── index.ts
│       │   ├── snapshot-bulk-ops-slice.ts
│       │   ├── snapshot-cache-slice.ts
│       │   ├── snapshot-metadata-slice.ts
│       │   ├── snapshot-quota-slice.ts
│       │   ├── snapshot-types.ts
│       │   └── useFileSnapshotStore.ts
│       ├── flashcard-store.ts
│       ├── hub-store.ts
│       ├── hydration-manager.ts
│       ├── ide
│       │   ├── ide-editor-slice.ts
│       │   ├── ide-explorer-slice.ts
│       │   ├── ide-layout-slice.ts
│       │   ├── ide-project-slice.ts
│       │   ├── ide-selectors-slice.ts
│       │   ├── ide-terminal-slice.ts
│       │   ├── ide-types.ts
│       │   ├── index.ts
│       │   └── useIDEStore.ts
│       ├── index.ts
│       ├── knowledge
│       │   ├── index.ts
│       │   ├── knowledge-store.ts
│       │   ├── slices
│       │   │   ├── knowledge-collection-slice.ts
│       │   │   ├── knowledge-metadata-slice.ts
│       │   │   ├── knowledge-preview-slice.ts
│       │   │   ├── knowledge-source-crud-slice.ts
│       │   │   ├── knowledge-synthesis-slice.ts
│       │   │   └── knowledge-undo-slice.ts
│       │   └── types.ts
│       ├── layout-store.ts
│       ├── navigation-store.ts
│       ├── openai-compatible-store.ts
│       ├── permissions
│       │   ├── index.ts
│       │   └── tool-permission-store.ts
│       ├── project
│       │   ├── index.ts
│       │   ├── project-bindings-slice.ts
│       │   ├── project-crud-slice.ts
│       │   ├── project-layout-slice.ts
│       │   ├── project-permissions-slice.ts
│       │   ├── project-types.ts
│       │   ├── project-utils-slice.ts
│       │   └── useProjectStore.ts
│       ├── prompt-enhancement-store.ts
│       ├── providers
│       │   ├── index.ts
│       │   ├── migrate-api-keys-to-vault.ts
│       │   ├── migration-backup.ts
│       │   ├── provider-crud-slice.ts
│       │   ├── provider-models-slice.ts
│       │   ├── provider-utils-slice.ts
│       │   ├── types.ts
│       │   └── use-migration-state.ts
│       ├── quiz-history-store.ts
│       ├── rag
│       │   ├── index.ts
│       │   ├── rag-chat-slice.ts
│       │   ├── rag-chunking-slice.ts
│       │   ├── rag-helpers.ts
│       │   ├── rag-index-slice.ts
│       │   ├── rag-search-slice.ts
│       │   ├── rag-store.ts
│       │   ├── rag-types.ts
│       │   └── rag-voice-slice.ts
│       ├── schema-migrations.ts
│       ├── session-snapshot-manager.ts
│       ├── statusbar-store.ts
│       ├── study
│       │   ├── index.ts
│       │   └── quiz-store.ts
│       ├── study-store.ts
│       ├── synthesis-store.ts
│       ├── types.ts
│       ├── use-app-store.ts
│       └── workspace
│           ├── index.ts
│           ├── workspace-context.ts
│           └── workspace-provider.tsx
└── sync
    ├── adapters
    │   ├── base-adapter.ts
    │   ├── fsa-adapter.ts
    │   └── idb-adapter.ts
    ├── core
    │   ├── sync-engine.ts
    │   ├── sync-events.ts
    │   └── sync-types.ts
    ├── index.ts
    ├── strategies
    │   ├── bidirectional-sync.ts
    │   ├── conflict-resolution.ts
    │   └── index.ts
    └── workspace-bindings
        ├── base.ts
        ├── ide.ts
        ├── index.ts
        ├── knowledge.ts
        ├── notes.ts
        └── study.ts

28 directories, 159 files
