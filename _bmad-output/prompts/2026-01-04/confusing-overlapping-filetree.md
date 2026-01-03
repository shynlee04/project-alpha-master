## This `src/infrastructure` 

```
> tree
.
├── events
│   ├── cross-workspace-event-bus.ts
│   ├── event-bus.ts
│   └── index.ts
├── external
├── framework
└── persistence
    ├── dexie-db-ai-types.ts
    ├── dexie-db-class.ts
    ├── dexie-db-core-types.ts
    ├── dexie-db-helpers.ts
    ├── dexie-db-knowledge-types.ts
    ├── dexie-db-migrations.ts
    ├── dexie-db-session-types.ts
    ├── dexie-db.ts
    ├── dexie-storage.ts
    ├── index.ts
    ├── rag-store-helpers.ts
    ├── rag-store-types.ts
    ├── state-orchestrator.ts
    └── stores
        ├── __tests__
        │   └── schema-migrations.test.ts
        ├── agents
        │   ├── agent-selection-store.ts
        │   ├── index.ts
        │   ├── slices
        │   │   ├── agent-crud-slice.ts
        │   │   ├── agent-events-slice.ts
        │   │   ├── agent-utils-slice.ts
        │   │   ├── agent-validation-slice.ts
        │   │   ├── agent-workspace-bindings-slice.ts
        │   │   └── index.ts
        │   └── types.ts
        ├── agents-store.test.ts
        ├── auto-approve-store.ts
        ├── canvas-store.ts
        ├── conversation
        │   ├── __tests__
        │   │   ├── conversation-events-slice.test.ts
        │   │   ├── conversation-metadata-slice.test.ts
        │   │   ├── conversation-migration.test.ts
        │   │   ├── conversation-utils-slice.test.ts
        │   │   ├── conversation-validation-slice.test.ts
        │   │   ├── message-crud-slice.test.ts
        │   │   ├── test-helper.ts
        │   │   ├── thread-management-slice.test.ts
        │   │   └── useConversationStore.test.ts
        │   ├── conversation-events-slice.ts
        │   ├── conversation-helpers.ts
        │   ├── conversation-metadata-slice.ts
        │   ├── conversation-store.ts
        │   ├── conversation-types.ts
        │   ├── conversation-utils-slice.ts
        │   ├── conversation-validation-slice.ts
        │   ├── index.ts
        │   ├── message-crud-slice.ts
        │   ├── migration
        │   │   └── conversation-migration.ts
        │   ├── slices
        │   │   ├── create-context-window-slice.ts
        │   │   ├── create-hierarchy-slice.ts
        │   │   ├── create-message-slice.ts
        │   │   ├── create-metadata-slice.ts
        │   │   ├── create-project-state-slice.ts
        │   │   ├── create-thread-crud-slice.ts
        │   │   └── index.ts
        │   ├── thread-management-slice.ts
        │   ├── types.ts
        │   └── useConversationStore.ts
        ├── conversation-auto-restore.ts
        ├── events
        │   └── event-status-store.ts
        ├── filesystem
        │   ├── index.ts
        │   ├── snapshot-bulk-ops-slice.ts
        │   ├── snapshot-cache-slice.ts
        │   ├── snapshot-metadata-slice.ts
        │   ├── snapshot-quota-slice.ts
        │   ├── snapshot-types.ts
        │   └── useFileSnapshotStore.ts
        ├── flashcard-store.ts
        ├── hub-store.ts
        ├── hydration-manager.ts
        ├── ide
        │   ├── ide-editor-slice.ts
        │   ├── ide-explorer-slice.ts
        │   ├── ide-layout-slice.ts
        │   ├── ide-project-slice.ts
        │   ├── ide-selectors-slice.ts
        │   ├── ide-terminal-slice.ts
        │   ├── ide-types.ts
        │   ├── index.ts
        │   └── useIDEStore.ts
        ├── index.ts
        ├── knowledge
        │   ├── index.ts
        │   ├── knowledge-collections-slice.ts
        │   ├── knowledge-metadata-slice.ts
        │   ├── knowledge-sources-slice.ts
        │   ├── knowledge-synthesis-slice.ts
        │   ├── knowledge-types.ts
        │   ├── knowledge-ui-slice.ts
        │   └── useKnowledgeStore.ts
        ├── layout-store.ts
        ├── navigation-store.ts
        ├── openai-compatible-store.ts
        ├── project
        │   ├── index.ts
        │   ├── project-bindings-slice.ts
        │   ├── project-crud-slice.ts
        │   ├── project-layout-slice.ts
        │   ├── project-permissions-slice.ts
        │   ├── project-types.ts
        │   ├── project-utils-slice.ts
        │   └── useProjectStore.ts
        ├── prompt-enhancement-store.ts
        ├── providers
        │   ├── __tests__
        │   │   ├── migrate-api-keys-to-vault.test.ts
        │   │   ├── migration-backup.test.ts
        │   │   └── provider-crud-readonly.test.ts
        │   ├── index.ts
        │   ├── migrate-api-keys-to-vault.ts
        │   ├── migration-backup.ts
        │   ├── provider-crud-slice.ts
        │   ├── provider-models-slice.ts
        │   ├── provider-utils-slice.ts
        │   ├── types.ts
        │   └── use-migration-state.ts
        ├── quiz-history-store.ts
        ├── rag
        │   ├── index.ts
        │   ├── rag-chat-slice.ts
        │   ├── rag-chunking-slice.ts
        │   ├── rag-helpers.ts
        │   ├── rag-index-slice.ts
        │   ├── rag-search-slice.ts
        │   ├── rag-store.ts
        │   ├── rag-types.ts
        │   └── rag-voice-slice.ts
        ├── schema-migrations.ts
        ├── session-snapshot-manager.ts
        ├── statusbar-store.ts
        ├── study-store.ts
        ├── synthesis-store.ts
        ├── types.ts
        ├── use-app-store.ts
        └── workspace
            ├── index.ts
            ├── workspace-context.ts
            └── workspace-provider.tsx
```

### 
> cd src/infrastructure
> tree
.
├── events
│   ├── cross-workspace-event-bus.ts
│   ├── event-bus.ts
│   └── index.ts
├── external
├── framework
└── persistence
    ├── dexie-db-ai-types.ts
    ├── dexie-db-class.ts
    ├── dexie-db-core-types.ts
    ├── dexie-db-helpers.ts
    ├── dexie-db-knowledge-types.ts
    ├── dexie-db-migrations.ts
    ├── dexie-db-session-types.ts
    ├── dexie-db.ts
    ├── dexie-storage.ts
    ├── index.ts
    ├── rag-store-helpers.ts
    ├── rag-store-types.ts
    ├── state-orchestrator.ts
    └── stores
        ├── __tests__
        │   └── schema-migrations.test.ts
        ├── agents
        │   ├── agent-selection-store.ts
        │   ├── index.ts
        │   ├── slices
        │   │   ├── agent-crud-slice.ts
        │   │   ├── agent-events-slice.ts
        │   │   ├── agent-utils-slice.ts
        │   │   ├── agent-validation-slice.ts
        │   │   ├── agent-workspace-bindings-slice.ts
        │   │   └── index.ts
        │   └── types.ts
        ├── agents-store.test.ts
        ├── auto-approve-store.ts
        ├── canvas-store.ts
        ├── conversation
        │   ├── __tests__
        │   │   ├── conversation-events-slice.test.ts
        │   │   ├── conversation-metadata-slice.test.ts
        │   │   ├── conversation-migration.test.ts
        │   │   ├── conversation-utils-slice.test.ts
        │   │   ├── conversation-validation-slice.test.ts
        │   │   ├── message-crud-slice.test.ts
        │   │   ├── test-helper.ts
        │   │   ├── thread-management-slice.test.ts
        │   │   └── useConversationStore.test.ts
        │   ├── conversation-events-slice.ts
        │   ├── conversation-helpers.ts
        │   ├── conversation-metadata-slice.ts
        │   ├── conversation-store.ts
        │   ├── conversation-types.ts
        │   ├── conversation-utils-slice.ts
        │   ├── conversation-validation-slice.ts
        │   ├── index.ts
        │   ├── message-crud-slice.ts
        │   ├── migration
        │   │   └── conversation-migration.ts
        │   ├── slices
        │   │   ├── create-context-window-slice.ts
        │   │   ├── create-hierarchy-slice.ts
        │   │   ├── create-message-slice.ts
        │   │   ├── create-metadata-slice.ts
        │   │   ├── create-project-state-slice.ts
        │   │   ├── create-thread-crud-slice.ts
        │   │   └── index.ts
        │   ├── thread-management-slice.ts
        │   ├── types.ts
        │   └── useConversationStore.ts
        ├── conversation-auto-restore.ts
        ├── events
        │   └── event-status-store.ts
        ├── filesystem
        │   ├── index.ts
        │   ├── snapshot-bulk-ops-slice.ts
        │   ├── snapshot-cache-slice.ts
        │   ├── snapshot-metadata-slice.ts
        │   ├── snapshot-quota-slice.ts
        │   ├── snapshot-types.ts
        │   └── useFileSnapshotStore.ts
        ├── flashcard-store.ts
        ├── hub-store.ts
        ├── hydration-manager.ts
        ├── ide
        │   ├── ide-editor-slice.ts
        │   ├── ide-explorer-slice.ts
        │   ├── ide-layout-slice.ts
        │   ├── ide-project-slice.ts
        │   ├── ide-selectors-slice.ts
        │   ├── ide-terminal-slice.ts
        │   ├── ide-types.ts
        │   ├── index.ts
        │   └── useIDEStore.ts
        ├── index.ts
        ├── knowledge
        │   ├── index.ts
        │   ├── knowledge-collections-slice.ts
        │   ├── knowledge-metadata-slice.ts
        │   ├── knowledge-sources-slice.ts
        │   ├── knowledge-synthesis-slice.ts
        │   ├── knowledge-types.ts
        │   ├── knowledge-ui-slice.ts
        │   └── useKnowledgeStore.ts
        ├── layout-store.ts
        ├── navigation-store.ts
        ├── openai-compatible-store.ts
        ├── project
        │   ├── index.ts
        │   ├── project-bindings-slice.ts
        │   ├── project-crud-slice.ts
        │   ├── project-layout-slice.ts
        │   ├── project-permissions-slice.ts
        │   ├── project-types.ts
        │   ├── project-utils-slice.ts
        │   └── useProjectStore.ts
        ├── prompt-enhancement-store.ts
        ├── providers
        │   ├── __tests__
        │   │   ├── migrate-api-keys-to-vault.test.ts
        │   │   ├── migration-backup.test.ts
        │   │   └── provider-crud-readonly.test.ts
        │   ├── index.ts
        │   ├── migrate-api-keys-to-vault.ts
        │   ├── migration-backup.ts
        │   ├── provider-crud-slice.ts
        │   ├── provider-models-slice.ts
        │   ├── provider-utils-slice.ts
        │   ├── types.ts
        │   └── use-migration-state.ts
        ├── quiz-history-store.ts
        ├── rag
        │   ├── index.ts
        │   ├── rag-chat-slice.ts
        │   ├── rag-chunking-slice.ts
        │   ├── rag-helpers.ts
        │   ├── rag-index-slice.ts
        │   ├── rag-search-slice.ts
        │   ├── rag-store.ts
        │   ├── rag-types.ts
        │   └── rag-voice-slice.ts
        ├── schema-migrations.ts
        ├── session-snapshot-manager.ts
        ├── statusbar-store.ts
        ├── study-store.ts
        ├── synthesis-store.ts
        ├── types.ts
        ├── use-app-store.ts
        └── workspace
            ├── index.ts
            ├── workspace-context.ts
            └── workspace-provider.tsx

22 directories, 131 files
> cd src/infrastructure/persistence
cd: no such file or directory: src/infrastructure/persistence
> tree
.
├── events
│   ├── cross-workspace-event-bus.ts
│   ├── event-bus.ts
│   └── index.ts
├── external
├── framework
└── persistence
    ├── dexie-db-ai-types.ts
    ├── dexie-db-class.ts
    ├── dexie-db-core-types.ts
    ├── dexie-db-helpers.ts
    ├── dexie-db-knowledge-types.ts
    ├── dexie-db-migrations.ts
    ├── dexie-db-session-types.ts
    ├── dexie-db.ts
    ├── dexie-storage.ts
    ├── index.ts
    ├── rag-store-helpers.ts
    ├── rag-store-types.ts
    ├── state-orchestrator.ts
    └── stores
        ├── __tests__
        │   └── schema-migrations.test.ts
        ├── agents
        │   ├── agent-selection-store.ts
        │   ├── index.ts
        │   ├── slices
        │   │   ├── agent-crud-slice.ts
        │   │   ├── agent-events-slice.ts
        │   │   ├── agent-utils-slice.ts
        │   │   ├── agent-validation-slice.ts
        │   │   ├── agent-workspace-bindings-slice.ts
        │   │   └── index.ts
        │   └── types.ts
        ├── agents-store.test.ts
        ├── auto-approve-store.ts
        ├── canvas-store.ts
        ├── conversation
        │   ├── __tests__
        │   │   ├── conversation-events-slice.test.ts
        │   │   ├── conversation-metadata-slice.test.ts
        │   │   ├── conversation-migration.test.ts
        │   │   ├── conversation-utils-slice.test.ts
        │   │   ├── conversation-validation-slice.test.ts
        │   │   ├── message-crud-slice.test.ts
        │   │   ├── test-helper.ts
        │   │   ├── thread-management-slice.test.ts
        │   │   └── useConversationStore.test.ts
        │   ├── conversation-events-slice.ts
        │   ├── conversation-helpers.ts
        │   ├── conversation-metadata-slice.ts
        │   ├── conversation-store.ts
        │   ├── conversation-types.ts
        │   ├── conversation-utils-slice.ts
        │   ├── conversation-validation-slice.ts
        │   ├── index.ts
        │   ├── message-crud-slice.ts
        │   ├── migration
        │   │   └── conversation-migration.ts
        │   ├── slices
        │   │   ├── create-context-window-slice.ts
        │   │   ├── create-hierarchy-slice.ts
        │   │   ├── create-message-slice.ts
        │   │   ├── create-metadata-slice.ts
        │   │   ├── create-project-state-slice.ts
        │   │   ├── create-thread-crud-slice.ts
        │   │   └── index.ts
        │   ├── thread-management-slice.ts
        │   ├── types.ts
        │   └── useConversationStore.ts
        ├── conversation-auto-restore.ts
        ├── events
        │   └── event-status-store.ts
        ├── filesystem
        │   ├── index.ts
        │   ├── snapshot-bulk-ops-slice.ts
        │   ├── snapshot-cache-slice.ts
        │   ├── snapshot-metadata-slice.ts
        │   ├── snapshot-quota-slice.ts
        │   ├── snapshot-types.ts
        │   └── useFileSnapshotStore.ts
        ├── flashcard-store.ts
        ├── hub-store.ts
        ├── hydration-manager.ts
        ├── ide
        │   ├── ide-editor-slice.ts
        │   ├── ide-explorer-slice.ts
        │   ├── ide-layout-slice.ts
        │   ├── ide-project-slice.ts
        │   ├── ide-selectors-slice.ts
        │   ├── ide-terminal-slice.ts
        │   ├── ide-types.ts
        │   ├── index.ts
        │   └── useIDEStore.ts
        ├── index.ts
        ├── knowledge
        │   ├── index.ts
        │   ├── knowledge-collections-slice.ts
        │   ├── knowledge-metadata-slice.ts
        │   ├── knowledge-sources-slice.ts
        │   ├── knowledge-synthesis-slice.ts
        │   ├── knowledge-types.ts
        │   ├── knowledge-ui-slice.ts
        │   └── useKnowledgeStore.ts
        ├── layout-store.ts
        ├── navigation-store.ts
        ├── openai-compatible-store.ts
        ├── project
        │   ├── index.ts
        │   ├── project-bindings-slice.ts
        │   ├── project-crud-slice.ts
        │   ├── project-layout-slice.ts
        │   ├── project-permissions-slice.ts
        │   ├── project-types.ts
        │   ├── project-utils-slice.ts
        │   └── useProjectStore.ts
        ├── prompt-enhancement-store.ts
        ├── providers
        │   ├── __tests__
        │   │   ├── migrate-api-keys-to-vault.test.ts
        │   │   ├── migration-backup.test.ts
        │   │   └── provider-crud-readonly.test.ts
        │   ├── index.ts
        │   ├── migrate-api-keys-to-vault.ts
        │   ├── migration-backup.ts
        │   ├── provider-crud-slice.ts
        │   ├── provider-models-slice.ts
        │   ├── provider-utils-slice.ts
        │   ├── types.ts
        │   └── use-migration-state.ts
        ├── quiz-history-store.ts
        ├── rag
        │   ├── index.ts
        │   ├── rag-chat-slice.ts
        │   ├── rag-chunking-slice.ts
        │   ├── rag-helpers.ts
        │   ├── rag-index-slice.ts
        │   ├── rag-search-slice.ts
        │   ├── rag-store.ts
        │   ├── rag-types.ts
        │   └── rag-voice-slice.ts
        ├── schema-migrations.ts
        ├── session-snapshot-manager.ts
        ├── statusbar-store.ts
        ├── study-store.ts
        ├── synthesis-store.ts
        ├── types.ts
        ├── use-app-store.ts
        └── workspace
            ├── index.ts
            ├── workspace-context.ts
            └── workspace-provider.tsx