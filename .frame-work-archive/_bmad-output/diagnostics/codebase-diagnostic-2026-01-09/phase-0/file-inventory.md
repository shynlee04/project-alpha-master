# Phase 0: Codebase Structure Mapping

## Executive Summary

This phase maps the complete codebase structure to understand scale, complexity hotspots, and dependency relationships.

---

## File Inventory Summary

### Counts
| Type | Count |
|------|-------|
| .tsx (React components) | 517 |
| .ts (TypeScript files) | 1,055 |
| .css (Stylesheets) | 7 |
| **Total** | **1,579** |

### Layer Distribution
| Layer | Files | Percentage | Complexity |
|-------|-------|------------|------------|
| **src/presentation** | 599 | 38% | High (UI components) |
| **src/lib** | 521 | 33% | High (business logic) |
| **src/infrastructure** | 336 | 21% | Medium (persistence) |
| **src/hooks** | 36 | 2% | Low (reactive logic) |
| **src/core** | 7 | <1% | Very Low (entities) |
| **src/routes** | 26 | 2% | Low (routing) |

---

## Complexity Hotspots (Top 30 Directories)

| Directory | File Count | Risk Level |
|-----------|------------|------------|
| src/presentation/components/ui | 51 | 🔴 HIGH |
| src/lib/knowledge | 46 | 🔴 HIGH |
| src/presentation/components/hub | 37 | 🟡 MEDIUM |
| src/presentation/components/agent | 37 | 🟡 MEDIUM |
| src/presentation/components/chat | 36 | 🟡 MEDIUM |
| src/hooks | 34 | 🟡 MEDIUM |
| src/lib/rag | 30 | 🟡 MEDIUM |
| src/lib/filesystem | 28 | 🟡 MEDIUM |
| src/infrastructure/persistence/stores | 27 | 🟡 MEDIUM |
| src/presentation/components/knowledge | 22 | 🟢 LOW |
| src/presentation/components/notes | 21 | 🟢 LOW |
| src/presentation/components/ide | 21 | 🟢 LOW |
| src/routes | 20 | 🟢 LOW |
| src/infrastructure/persistence | 20 | 🟢 LOW |
| src/lib/notes | 19 | 🟢 LOW |
| src/lib/agent/tools | 19 | 🟢 LOW |
| src/infrastructure/sync/adapters | 19 | 🟢 LOW |
| src/presentation/components/ui/event-indicators | 18 | 🟢 LOW |
| src/presentation/components/layout/IDELayout | 17 | 🟢 LOW |
| src/presentation/components/agent/AgentConfigForm | 16 | 🟢 LOW |

---

## God Files (>500 lines)

| File | Lines | Category | Risk |
|------|-------|----------|------|
| src/lib/templates/template-registry.ts | 1,321 | Registry | 🔴 CRITICAL |
| src/infrastructure/persistence/dexie-db.ts | 1,152 | Database | 🔴 CRITICAL |
| src/lib/agent/__tests__/tool-permission-manager.test.ts | 1,094 | Test | 🟡 |
| src/infrastructure/persistence/workflow-persistence.test.ts | 906 | Test | 🟡 |
| src/infrastructure/persistence/dexie-db-migrations.ts | 828 | Database | 🔴 HIGH |
| src/lib/sync/__tests__/reverse-sync-service.test.ts | 804 | Test | 🟡 |
| src/lib/git/git-client.ts | 791 | Git | 🔴 HIGH |
| src/presentation/components/ide/MonacoEditor/MonacoEditor.tsx | 769 | IDE | 🔴 HIGH |
| src/infrastructure/events/event-bus.ts | 764 | Events | 🔴 HIGH |
| src/lib/workflow/agents/debate-agent.ts | 752 | Workflow | 🔴 HIGH |
| src/lib/workflow/executor/workflow-executor.test.ts | 727 | Test | 🟡 |
| src/presentation/components/ui/resizable.tsx | 745 | UI | 🟡 |
| src/presentation/components/notes/NotesPage.tsx | 724 | Notes | 🔴 HIGH |
| src/presentation/components/knowledge/KnowledgePage.tsx | 709 | Knowledge | 🔴 HIGH |
| src/lib/navigation/symbol-parser.ts | 696 | Parser | 🟡 |
| src/lib/agent/factory.ts | 612 | Agent | 🔴 HIGH |
| src/lib/terminal/terminal-emulator.ts | 608 | Terminal | 🟡 |
| src/presentation/components/knowledge/IndexingProgressPanel.tsx | 593 | UI | 🟡 |
| src/presentation/components/ide/EnhancedChatInterface.tsx | 592 | IDE | 🟡 |
| src/lib/events/cross-workspace-event-bus.ts | 588 | Events | 🔴 HIGH |
| src/lib/agent/facades/file-tools-impl.ts | 587 | Agent | 🔴 HIGH |
| src/lib/scheduler/task-scheduler.ts | 586 | Scheduler | 🟡 |
| src/lib/rag/incremental-indexing-service.ts | 645 | RAG | 🔴 HIGH |
| src/lib/rag/orama-index.ts | 644 | RAG | 🔴 HIGH |
| src/lib/plugins/plugin-manager.ts | 659 | Plugin | 🟡 |
| src/lib/rag/query-optimizer.ts | 568 | RAG | 🟡 |
| src/lib/rag/document-chunker.ts | 572 | RAG | 🟡 |

**Total god files (>500 lines): 40+ files identified**

---

## Risk Assessment

| Risk | Files Affected | Priority |
|------|----------------|----------|
| God component (>700 lines) | 15+ files | P0 |
| God store (>300 lines) | 10+ files | P0 |
| Complex dependency chains | Cross-workspace | P1 |
| Duplicate functionality | rag-store, knowledge-store | P1 |
| Event bus proliferation | Multiple event emitters | P2 |

---

## Recommendations for Next Phase

### Focus Areas for User Journey Analysis
1. **NotesPage.tsx (724 lines)** - Complex component needing deep scan
2. **KnowledgePage.tsx (709 lines)** - RAG integration point
3. **MonacoEditor.tsx (769 lines)** - Heavy IDE dependency
4. **dexie-db.ts (1,152 lines)** - Database bottleneck potential

### Suspected Bottleneck Components
1. **cross-workspace-event-bus.ts** - Central event hub
2. **dexie-db.ts** - Single point of database access
3. **useLiveQuery subscriptions** - Potential re-render issues
4. **UnifiedWorkspaceProvider** - Wraps entire app

---

## Data Collection Commands Executed

```bash
# File count
find src -type f \( -name "*.tsx" -o -name "*.ts" \) | wc -l
# Result: 1,572

# God files
find src -name "*.tsx" -o -name "*.ts" | xargs wc -l | sort -rn | head -40

# Directory complexity
find src -type f \( -name "*.tsx" -o -name "*.ts" \) | \
  sed 's|/[^/]*$||' | sort | uniq -c | sort -rn | head -30

# Layer distribution
find src/{routes,presentation,lib,infrastructure,hooks,core} -type f \( -name "*.tsx" -o -name "*.ts" \) | wc -l
```

---

*Generated by Codebase Diagnostic Workflow v1.0.0*
*Phase 0: Structure Mapping*
*Date: 2026-01-09*
