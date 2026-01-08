## File Inventory Summary

### Counts
| Type | Count |
|------|-------|
| .tsx | 1051 |
| .ts  | 1058 |
| .css | 7 |
| Total| 2116 |

### Complexity Hotspots (Top 30 Directories)
| Directory | File Count |
|-----------|------------|
| src/presentation/components/ui | 51 |
| src/lib/knowledge | 46 |
| src/presentation/components/hub | 37 |
| src/presentation/components/chat | 36 |
| src/presentation/components/agent | 36 |
| src/hooks | 34 |
| src/lib/rag | 30 |
| src/lib/filesystem | 28 |
| src/infrastructure/persistence/stores | 27 |
| src/routes | 20 |
| src/presentation/components/notes | 20 |
| src/infrastructure/persistence | 20 |
| src/lib/agent/tools | 19 |
| src/infrastructure/sync/adapters | 19 |
| src/presentation/components/ui/event-indicators | 18 |
| src/lib/notes | 18 |
| src/presentation/components/layout/IDELayout | 17 |
| src/presentation/components/agent/AgentConfigForm | 16 |
| src/infrastructure/persistence/dexie-db-helpers | 16 |
| src/presentation/components/ui/icons | 15 |
| src/infrastructure/sync/core | 15 |
| src/lib/workspace | 14 |
| src/infrastructure/persistence/stores/conversation | 13 |
| src/presentation/components/study | 12 |
| src/presentation/components/knowledge/__tests__ | 12 |
| src/lib/filesystem/__tests__ | 12 |
| src/lib/agent/tools/__tests__ | 12 |
| src/presentation/components/layout | 11 |

### God Files (>500 lines)
| File | Lines | Category |
|------|-------|----------|
| src/lib/templates/template-registry.ts | 1321 | lib/templates |
| src/infrastructure/persistence/dexie-db.ts | 1152 | infrastructure/persistence |
| src/lib/agent/__tests__/tool-permission-manager.test.ts | 1094 | lib/agent/__tests__ |
| src/infrastructure/persistence/workflow-persistence.test.ts | 906 | infrastructure/persistence |
| src/infrastructure/persistence/dexie-db-migrations.ts | 828 | infrastructure/persistence |
| src/lib/sync/__tests__/reverse-sync-service.test.ts | 804 | lib/sync/__tests__ |
| src/lib/git/git-client.ts | 791 | lib/git |
| src/presentation/components/ide/MonacoEditor/MonacoEditor.tsx | 769 | presentation/components/ide |
| src/lib/workflow/builder/workflow-builder-store.test.ts | 766 | lib/workflow/builder |
| src/infrastructure/events/event-bus.ts | 764 | infrastructure/events |
| src/lib/workflow/agents/debate-agent.ts | 752 | lib/workflow/agents |
| src/presentation/components/ui/resizable.tsx | 745 | presentation/components/ui |
| src/lib/workflow/executor/workflow-executor.test.ts | 727 | lib/workflow/executor |
| src/presentation/components/notes/NotesPage.tsx | 724 | presentation/components/notes |
| src/lib/notes/note-store.backup.ts | 724 | lib/notes |
| src/lib/workflow/executor/workflow-executor.ts | 713 | lib/workflow/executor |
| src/presentation/components/knowledge/KnowledgePage.tsx | 709 | presentation/components/knowledge |
| src/lib/navigation/symbol-parser.ts | 696 | lib/navigation |
| src/lib/workspace/__tests__/session-snapshot.test.ts | 677 | lib/workspace/__tests__ |
| src/e2e/__tests__/epic-e1-cross-workspace-chat.e2e.test.tsx | 674 | e2e/__tests__ |
| src/lib/agent/tools/__tests__/retry-queue.test.ts | 670 | lib/agent/tools/__tests__ |
| src/lib/plugins/plugin-manager.ts | 646 | lib/plugins |
| src/lib/rag/incremental-indexing-service.ts | 645 | lib/rag |
| src/lib/rag/orama-index.ts | 644 | lib/rag |
| src/__tests__/chat.test.ts | 640 | __tests__ |
| src/lib/agent/factory.ts | 612 | lib/agent |
| src/lib/terminal/terminal-emulator.ts | 608 | lib/terminal |
| src/routeTree.gen.ts | 604 | routes |
| src/presentation/components/knowledge/IndexingProgressPanel.tsx | 593 | presentation/components/knowledge |

### Layer Distribution
| Layer | Files | Complexity |
|-------|-------|------------|
| src/routes/ | 20 | Medium |
| src/presentation/ | ~800+ | High (UI components) |
| src/lib/ | ~1000+ | Very High (business logic) |
| src/infrastructure/ | ~100+ | High (data layer) |
