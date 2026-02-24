# SUB-AGENT DELEGATION PLAN
## Purpose: Complete Codebase Analysis & Architecture Mapping

---

## GENERATED: 2026-01-26T17:00:00+07:00
## AUTHOR: BMAD Master Agent
## REFERENCE: COMPREHENSIVE-CHAOS-ANALYSIS-2026-01-26.md

---

# EXECUTIVE SUMMARY

The Via-gent codebase requires systematic analysis and mapping across **1,736 TypeScript/TSX files** in **334 directories**. This document defines sub-agent work packages for comprehensive analysis.

---

# SUB-AGENT WORK PACKAGES

## AGENT 1: Domain Mapper Agent

**Mission:** Map all 1,736 files to their proper Clean Architecture domain

### Input
- Full file list from `src/`
- Domain definitions from Clean Architecture

### Output
- `domain-mapping-2026-01-26.csv` with columns:
  - `file_path`
  - `current_domain` (where it is now)
  - `correct_domain` (where it should be)
  - `action_required` (keep/move/delete/merge)
  - `priority` (P0/P1/P2/P3)
  - `notes`

### Domains to Map To
| Domain | Directory | Purpose |
|--------|-----------|---------|
| `domain/entities` | Core business entities | |
| `domain/interfaces` | Contracts/interfaces | |
| `domain/services` | Business logic | |
| `domain/use-cases` | Use case implementations | |
| `infrastructure/persistence` | Dexie/stores | |
| `infrastructure/filesystem` | FSA/storage adapters | |
| `infrastructure/events` | EventBus | |
| `infrastructure/context` | Context providers | |
| `infrastructure/sync` | File sync | |
| `plugins/*` | Feature plugins | |
| `presentation/components/ui` | Design system | |
| `presentation/layouts` | Layout components | |
| `routes` | TanStack Router routes | |
| `DELETE` | Files to remove | |

### Priority Files (P0)
1. All files in `src/lib/workspace/` - **DELETE**
2. All files in `src/presentation/components/workspace/` - **DELETE**
3. Duplicates between `lib/` and `infrastructure/`

---

## AGENT 2: Duplication Detector Agent

**Mission:** Find all duplicate implementations across the codebase

### Input
- Full file list
- Known duplications from chaos analysis:
  - `lib/filesystem/` (59) vs `infrastructure/filesystem/` (32)
  - `lib/notes/` (57) vs `plugins/notes/`
  - `lib/events/` (11) vs `infrastructure/events/` (3)
  - `lib/filesync/` (15) vs `infrastructure/sync/` (81)

### Output
- `duplications-2026-01-26.md` with sections:
  - Exact duplicates (same code, different locations)
  - Functional duplicates (same purpose, different implementations)
  - Consolidation recommendations

### Analysis Methodology
1. Compare file names across directories
2. Compare export symbols (functions, classes, types)
3. Compare import patterns (who uses what)
4. Identify the "canonical" version (usually in `infrastructure/`)

---

## AGENT 3: Translation Auditor Agent

**Mission:** Audit all workspace-centric translation keys

### Input
- `src/i18n/en.json` (111KB)
- `src/i18n/vi.json` (102KB)

### Output
- `translation-audit-2026-01-26.md` with:
  - List of all `ide.*` keys (30 found)
  - List of all `workspace*` keys (121 found)
  - Migration recommendations:
    - Rename to generic keys
    - Map old keys → new keys
  - Usage analysis:
    - Which components use these keys
    - Breaking changes if renamed

### Key Categories
| Prefix | Count | Action |
|--------|-------|--------|
| `ide.*` | 30 | Rename to `project.*` or `filetree.*` |
| `workspace*` | 121 | Rename to `project.*` |
| `notes.*` | TBD | Keep as plugin namespace |
| `hub.*` | TBD | Keep as route namespace |

---

## AGENT 4: Store Auditor Agent

**Mission:** Audit all Zustand stores for workspace references

### Input
- All files in `src/infrastructure/persistence/stores/` (219 items)
- Known problematic stores:
  - `workspace-store-facade.ts`
  - `workspace-store-factory.ts`
  - `workspace/` directory (17 files)

### Output
- `store-audit-2026-01-26.md` with:
  - List of all stores with workspace references
  - Store dependency graph
  - Migration recommendations:
    - Which stores to delete
    - Which stores to merge
    - Which stores to rename
  - Project-scoped store proposal

### Store Categories
| Category | Action |
|----------|--------|
| Project stores | ✅ Keep |
| Workspace stores | 🔴 Delete/Migrate |
| Global UI stores | ⚠️ Review |
| Feature stores | ⚠️ Move to plugins |

---

## AGENT 5: Route Fixer Agent

**Mission:** Create working route structure per new-fundamental-truths.md

### Input
- `new-fundamental-truths.md`
- Current route files in `src/routes/`
- Root cause analysis from chaos document

### Output
- `route-fix-plan-2026-01-26.md` with:
  - Exact route structure (only 2 routes!)
  - File changes required
  - Code for `$projectId.tsx` that works
  - Testing plan

### Target Route Structure
```
/hub                - Project management, no project loaded
/$projectId         - Project loaded with feature plugins
```

### Files to Modify
1. `$projectId.tsx` - FIX context race condition
2. Delete: `ide.tsx`, `ide.$projectId.tsx`, `notes.lazy.tsx`, `notes.$projectId.tsx`

---

## AGENT 6: Context Fixer Agent

**Mission:** Fix ProjectContext race condition

### Input
- `src/infrastructure/context/project-context.tsx`
- Root cause analysis from chaos document

### Output
- Fixed `project-context.tsx` that:
  - Does NOT render children until context is ready
  - Handles FSA permission overlay correctly
  - Provides non-null context to children

### Fix Strategy
```tsx
return (
  <ProjectContext.Provider value={contextValue}>
    {loading ? (
      <LoadingSpinner />
    ) : error ? (
      <ErrorDisplay error={error} />
    ) : contextValue ? (
      children
    ) : (
      <LoadingSpinner />
    )}
    {showPermissionOverlay && ...}
  </ProjectContext.Provider>
);
```

---

## AGENT 7: Plugin Fixer Agent

**Mission:** Fix FileTreePlugin to handle async context

### Input
- `src/plugins/filetree/FileTreePlugin.tsx`
- Root cause analysis from chaos document

### Output
- Fixed `FileTreePlugin.tsx` that:
  - Uses `useProjectContextSafe()` instead of `useProjectContext()`
  - Shows proper loading state while context initializes
  - Uses correct translation keys (not `ide.*`)

### Fix Strategy
```tsx
function FileTreeComponent({ width, height }: PluginMainProps) {
  const projectContext = useProjectContextSafe();
  
  if (!projectContext) {
    return <LoadingSkeleton />;
  }
  
  const { gateway } = projectContext;
  
  if (!gateway) {
    return <NoGatewayMessage />;
  }
  
  // ... rest of component
}
```

---

# EXECUTION SEQUENCE

## Phase 0: Critical Fixes (Immediate)
1. **AGENT 6**: Fix ProjectContext race condition
2. **AGENT 7**: Fix FileTreePlugin async handling
3. **AGENT 5**: Create working route structure

## Phase 1: Analysis (Parallel)
4. **AGENT 1**: Domain mapping
5. **AGENT 2**: Duplication detection
6. **AGENT 3**: Translation audit
7. **AGENT 4**: Store audit

## Phase 2: Cleanup (Sequential)
8. Delete deprecated files (based on AGENT 1 output)
9. Consolidate duplicates (based on AGENT 2 output)
10. Fix translations (based on AGENT 3 output)
11. Fix stores (based on AGENT 4 output)

---

# SUCCESS CRITERIA

| Metric | Target |
|--------|--------|
| FileTree renders with files | ✅ Files visible on project load |
| Routes work | ✅ Only /hub and /$projectId exist |
| No workspace pollution | ✅ Zero `workspace` references in new code |
| Domain mapping complete | ✅ 100% files categorized |
| Duplications identified | ✅ All duplications documented |

---

# FILES GENERATED BY THIS PLAN

| File | Agent | Purpose |
|------|-------|---------|
| `domain-mapping-2026-01-26.csv` | AGENT 1 | Complete file mapping |
| `duplications-2026-01-26.md` | AGENT 2 | Duplication analysis |
| `translation-audit-2026-01-26.md` | AGENT 3 | Translation key audit |
| `store-audit-2026-01-26.md` | AGENT 4 | Store analysis |
| `route-fix-plan-2026-01-26.md` | AGENT 5 | Route structure fix |
| `project-context-fixed.tsx` | AGENT 6 | Fixed context provider |
| `FileTreePlugin-fixed.tsx` | AGENT 7 | Fixed plugin component |

---

*End of Sub-Agent Delegation Plan*
*Generated by BMAD Master Agent*
