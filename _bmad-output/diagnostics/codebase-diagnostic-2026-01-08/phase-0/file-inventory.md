## File Inventory Summary

### Counts
| Type | Count |
|------|-------|
| .tsx | 513 |
| .ts  | 1051 |
| .css | 7 |
| **Total**| **1571** |

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
| src/presentation/components/knowledge | 22 |
| src/presentation/components/ide | 21 |
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
| src/lib/templates/template-registry.ts | 1321 | Business Logic |
| src/infrastructure/persistence/dexie-db.ts | 1152 | Infrastructure |
| src/lib/agent/__tests__/tool-permission-manager.test.ts | 1094 | Test |
| src/infrastructure/persistence/workflow-persistence.test.ts | 906 | Test |
| src/infrastructure/persistence/dexie-db-migrations.ts | 828 | Infrastructure |
| src/lib/sync/__tests__/reverse-sync-service.test.ts | 804 | Test |
| src/lib/git/git-client.ts | 791 | Business Logic |
| src/presentation/components/ide/MonacoEditor/MonacoEditor.tsx | 769 | Presentation |
| src/lib/workflow/builder/workflow-builder-store.test.ts | 766 | Test |
| src/infrastructure/events/event-bus.ts | 764 | Infrastructure |
| src/lib/workflow/agents/debate-agent.ts | 752 | Business Logic |
| src/presentation/components/ui/resizable.tsx | 745 | Presentation |
| src/lib/workflow/executor/workflow-executor.test.ts | 727 | Test |
| src/presentation/components/notes/NotesPage.tsx | 724 | Presentation |
| src/lib/notes/note-store.backup.ts | 724 | Legacy/Backup |
| src/lib/workflow/executor/workflow-executor.ts | 713 | Business Logic |
| src/presentation/components/knowledge/KnowledgePage.tsx | 709 | Presentation |
| src/lib/navigation/symbol-parser.ts | 696 | Business Logic |
| src/lib/workspace/__tests__/session-snapshot.test.ts | 677 | Test |
| src/e2e/__tests__/epic-e1-cross-workspace-chat.e2e.test.tsx | 674 | Test |
| src/lib/agent/tools/__tests__/retry-queue.test.ts | 670 | Test |
| src/lib/plugins/plugin-manager.ts | 646 | Business Logic |
| src/lib/rag/incremental-indexing-service.ts | 645 | Business Logic |
| src/lib/rag/orama-index.ts | 644 | Business Logic |
| src/__tests__/chat.test.ts | 640 | Test |
| src/lib/agent/factory.ts | 612 | Business Logic |
| src/lib/terminal/terminal-emulator.ts | 608 | Business Logic |
| src/routeTree.gen.ts | 604 | Generated |
| src/presentation/components/knowledge/IndexingProgressPanel.tsx | 593 | Presentation |

### Layer Distribution
| Layer | Files | Complexity |
|-------|-------|------------|
| src/routes/ | 27 | Low |
| src/presentation/ | 598 | High |
| src/lib/ | 520 | High |
| src/infrastructure/ | 342 | Medium |
