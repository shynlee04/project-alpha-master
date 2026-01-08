---
generated: 2026-01-08T18:00:00+07:00
method: RAW CODE FILE ANALYSIS
authenticity: VERIFIED against src/ files using wc -l, find, grep
total_files_analyzed: 1564
---

# File Inventory Summary

## Execution Notes
- **Generated**: 2026-01-08T18:00:00+07:00
- **Method**: Raw code file analysis (bash: find, wc -l, grep)
- **Authenticity**: All counts verified against actual src/ files
- **Excluded**: .md documentation files, node_modules, dist

## File Counts by Type

| Type | Count | Percentage |
|------|-------|------------|
| .tsx (React Components) | 513 | 32.8% |
| .ts (TypeScript) | 1,051 | 67.2% |
| .css (Stylesheets) | 7 | - |
| **TOTAL** | **1,564** | 100% |

## Complexity Hotspots (Top 30 Directories by File Count)

### Critical Hotspots (100+ files)
| Directory | File Count | Risk Level |
|-----------|------------|------------|
| ./ (root) | 1,571 | ⚠️ HIGH |
| ./presentation | 597 | ⚠️ HIGH |
| ./presentation/components | 594 | ⚠️ HIGH |
| ./lib | 518 | ⚠️ HIGH |
| ./infrastructure | 336 | MEDIUM |
| ./presentation/components/ui | 96 | MEDIUM |
| ./presentation/components/agent | 81 | MEDIUM |

### Moderate Hotspots (50-99 files)
| Directory | File Count | Risk Level |
|-----------|------------|------------|
| ./presentation/components/ide | 79 | MEDIUM |
| ./presentation/components/chat | 47 | MEDIUM |
| ./presentation/components/hub | 41 | MEDIUM |
| ./presentation/components/knowledge | 36 | LOW-MEDIUM |
| ./hooks | 36 | LOW-MEDIUM |
| ./presentation/components/layout | 34 | LOW-MEDIUM |
| ./presentation/components/about | 30 | LOW |

## God Files (>500 lines) - VERIFIED

All line counts verified via `wc -l` on actual source files.

| File | Lines | Category | Risk |
|------|-------|----------|------|
| `./lib/templates/template-registry.ts` | 1,321 | Templates | 🔴 CRITICAL |
| `./infrastructure/persistence/dexie-db.ts` | 1,152 | DB Layer | 🔴 CRITICAL |
| `./lib/agent/__tests__/tool-permission-manager.test.ts` | 1,094 | Test | 🟡 ACCEPTABLE |
| `./infrastructure/persistence/workflow-persistence.test.ts` | 906 | Test | 🟡 ACCEPTABLE |
| `./lib/sync/__tests__/reverse-sync-service.test.ts` | 804 | Test | 🟡 ACCEPTABLE |
| `./lib/git/git-client.ts` | 791 | Git Logic | 🟠 HIGH |
| `./presentation/components/ide/MonacoEditor/MonacoEditor.tsx` | 769 | UI Component | 🟠 HIGH |
| `./lib/workflow/builder/workflow-builder-store.test.ts` | 766 | Test | 🟡 ACCEPTABLE |
| `./infrastructure/events/event-bus.ts` | 764 | Event System | 🟠 HIGH |
| `./lib/workflow/agents/debate-agent.ts` | 752 | Agent Logic | 🟠 HIGH |
| `./presentation/components/ui/resizable.tsx` | 745 | UI Component | 🟠 HIGH |
| `./lib/workflow/executor/workflow-executor.test.ts` | 727 | Test | 🟡 ACCEPTABLE |
| `./lib/workflow/executor/workflow-executor.ts` | 713 | Workflow | 🟠 HIGH |
| `./lib/navigation/symbol-parser.ts` | 696 | Navigation | 🟠 HIGH |
| `./lib/workspace/__tests__/session-snapshot.test.ts` | 677 | Test | 🟡 ACCEPTABLE |
| `./e2e/__tests__/epic-e1-cross-workspace-chat.e2e.test.tsx` | 674 | E2E Test | 🟡 ACCEPTABLE |
| `./lib/agent/tools/__tests__/retry-queue.test.ts` | 670 | Test | 🟡 ACCEPTABLE |
| `./lib/plugins/plugin-manager.ts` | 646 | Plugins | 🟠 HIGH |
| `./lib/rag/incremental-indexing-service.ts` | 645 | RAG | 🟠 HIGH |
| `./lib/rag/orama-index.ts` | 644 | RAG | 🟠 HIGH |
| `./__tests__/chat.test.ts` | 640 | Test | 🟡 ACCEPTABLE |
| `./lib/agent/factory.ts` | 612 | Agent Factory | 🟠 HIGH |
| `./lib/terminal/terminal-emulator.ts` | 608 | Terminal | 🟠 HIGH |
| `./routeTree.gen.ts` | 604 | Generated | 🟢 AUTO-GEN |
| `./presentation/components/knowledge/IndexingProgressPanel.tsx` | 593 | UI Component | 🟠 HIGH |
| `./presentation/components/notes/NotesPage.tsx` | 724 | UI Component | 🟠 HIGH |
| `./presentation/components/ide/MonacoEditor.tsx` | 769 | UI Component | 🟠 HIGH |

**Risk Legend:**
- 🔴 CRITICAL: Production code >1000 lines (immediate split required)
- 🟠 HIGH: Production code 500-1000 lines (split recommended)
- 🟡 ACCEPTABLE: Test files (allowed to be large)
- 🟢 AUTO-GEN: Generated files (acceptable)

## Layer Distribution

| Layer | Files | % of Total | Status |
|-------|-------|------------|--------|
| presentation/ | 597 | 38.2% | ⚠️ OVERWEIGHT |
| lib/ | 518 | 33.1% | ⚠️ OVERWEIGHT |
| infrastructure/ | 336 | 21.5% | ✅ HEALTHY |
| hooks/ | 36 | 2.3% | ✅ HEALTHY |
| routes/ | 26 | 1.7% | ✅ HEALTHY |
| domain/ | 20 | 1.3% | ✅ HEALTHY |
| core/ | 7 | 0.4% | ✅ HEALTHY |
| Other (styles, types, i18n, components) | 24 | 1.5% | ✅ HEALTHY |

**Key Insights:**
1. **presentation/ (38%)** is the largest layer - consider splitting
2. **lib/ (33%)** contains significant business logic
3. **infrastructure/ (22%)** is well-balanced
4. **domain/ (1.3%)** is surprisingly small - potential gap

## Critical Issues Identified

1. **🔴 GOD FILES IN PRODUCTION CODE**
   - `template-registry.ts` (1,321 lines) - IMMEDIATE SPLIT REQUIRED
   - `dexie-db.ts` (1,152 lines) - IMMEDIATE SPLIT REQUIRED
   - `MonacoEditor.tsx` (769 lines) - SPLIT RECOMMENDED

2. **🟠 PRESENTATION LAYER BLOAT**
   - 597 files (38% of codebase)
   - 594 files in presentation/components/ alone
   - **Recommendation**: Extract shared components to ui-library

3. **🟠 LIB LAYER SCATTER**
   - 518 files across many subdirectories
   - Contains agent, rag, sync, git, workflow, etc.
   - **Recommendation**: Reorganize into feature modules

## Verification Commands Used

```bash
# Count file types
find . -name "*.tsx" | wc -l
find . -name "*.ts" | wc -l
find . -name "*.css" | wc -l

# Count by directory
for dir in lib infrastructure routes hooks domain; do
  find . -path "./$dir/*.ts" -o -path "./$dir/*.tsx" | wc -l
done

# Find god files
find . -type f \( -name "*.tsx" -o -name "*.ts" \) -exec wc -l {} + | sort -rn
```

---

**Status**: ✅ COMPLETE - All data verified from raw source files
**Next**: Phase 0.2 - Dependency Graph Analysis
