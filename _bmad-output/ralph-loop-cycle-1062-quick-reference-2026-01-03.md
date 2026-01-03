# Ralph Loop Cycle 1062: Quick Reference Card

**Date**: 2026-01-03
**Purpose**: Fast reference for recursive auto-loop operations

---

## 🎯 Top 5 Priorities (This Cycle)

1. **Fix TypeScript Errors** (824 → <100)
   - Start: TanStack Router types (40 errors)
   - Next: Component prop types (20 errors)
   - Then: Agent/chat API contracts (15 errors)

2. **IndexedDB Safety** (P0 Data Loss Risk)
   - Add quota estimation before writes
   - Implement safe transaction patterns
   - Test quota exceeded scenarios

3. **Eliminate Silent Failures** (23 instances → 0)
   - Replace `console.error + return null`
   - Implement error boundaries
   - Add user-facing error messages

4. **AgentConfigDialog Refactoring** (1,089 → <300 lines)
   - Extract custom hooks
   - Split into sub-components
   - Test all agent config flows

5. **Store Consolidation** (69 stores → 30 stores)
   - Delete duplicates (30% duplication rate)
   - Split god stores into slices
   - Migrate to unified architecture

---

## 📊 Baseline Metrics

| Metric | Current | Target | Delta |
|--------|---------|--------|-------|
| TypeScript Errors | 824 | <100 | -88% |
| Source Files | 885 | - | - |
| Components | 424 | - | - |
| Stores | 69 | 30 | -56% |
| God Components | 16 | 0 | -100% |
| God Stores | 16 | 0 | -100% |
| Silent Failures | 23 | 0 | -100% |

---

## 🔧 Packed Context Files

```
repomix-codebase-full.xml       # 885 files, 1.12M tokens
repomix-docs-full.xml           # 3,037 files, 7.65M tokens
```

**Search Examples**:
```bash
# Find all stores
grep -o '<file path="[^"]*store[^"]*"' repomix-codebase-full.xml

# Count TypeScript errors by file
grep "error TS" /tmp/ts-errors.log | cut -d'(' -f1 | sort | uniq -c | sort -rn

# Find god components (>300 lines)
# (Requires deeper XML parsing - see baseline context)
```

---

## ⚠️ Critical Gotchas

### 1. WebContainer Cross-Origin Isolation
- Missing COOP/COEP headers break WebContainers
- `crossOriginIsolationPlugin` must be FIRST in Vite plugins
- Required for SharedArrayBuffer

### 2. IndexedDB Quota
- No quota handling = data loss risk
- Always estimate before large writes
- Implement graceful degradation

### 3. Zustand v5 Selectors
- **NEVER** destructure entire store (infinite loops)
```typescript
// ❌ WRONG
const { providers, removeProvider } = useProviderStore();

// ✅ CORRECT
const providers = useAppStore(s => s.providers)
const removeProvider = useAppStore(s => s.removeProvider)
```

### 4. File System Sync
- Local FS is source of truth
- WebContainer is mirror only (no reverse sync)
- `.git`, `node_modules` excluded from sync

### 5. Route Tree Type Errors
- TanStack Router v1.x has breaking type changes
- Lazy route loaders need type fixes
- Route tree children type mismatches

---

## 🚀 Quick Start Commands

```bash
# Development
pnpm dev                    # Start dev server (port 3000)
pnpm build                  # Production build
pnpm test                   # Run tests

# Type Checking
pnpm tsc --noEmit           # Count TypeScript errors
pnpm tsc --noEmit 2>&1 | grep "error TS" | wc -l

# Context Packing
npx repomix@latest ./src --style xml --output repomix-codebase-full.xml
npx repomix@latest . --include "**/*.{md,yaml}" --style xml --output repomix-docs-full.xml

# Analysis
grep -o '<file path=' repomix-codebase-full.xml | wc -l    # Count files
head -100 repomix-codebase-full.xml                         # Preview structure
```

---

## 📁 Key File Locations

### Stores
```
infrastructure/persistence/stores/           # Modern stores (69 files)
├── agents/                                  # Agent stores (10 files)
├── conversation/                            # Conversation stores (19 files)
├── providers/                               # Provider stores (8 files)
├── rag/                                     # RAG stores (10 files)
└── workspace/                               # Workspace stores (3 files)

lib/state/                                   # Legacy stores (25 files, migrating)
stores/                                      # Deprecated (empty)
```

### Components
```
presentation/components/                     # 424 UI components
├── agent/                                   # Agent config UI (20 files)
├── ide/                                     # IDE components (20 files)
├── knowledge/                               # Knowledge workspace (15 files)
├── study/                                   # Study workspace (10 files)
├── notes/                                   # Notes workspace (10 files)
├── chat/                                    # Chat UI (15 files)
├── ui/                                      # UI primitives (50 files)
└── layout/                                  # Layout components (10 files)
```

### Agent Infrastructure
```
lib/agent/                                   # 65 agent system files
├── tools/                                   # 20+ agent tools
├── providers/                               # LLM provider adapters
├── hooks/                                   # Agent chat hooks
└── facades/                                 # File/terminal tool facades
```

### Routing
```
routes/                                      # 21 route files
├── __root.tsx                               # Root layout
├── ide.tsx                                  # IDE workspace
├── knowledge.$projectId.lazy.tsx            # Knowledge (TYPE ERRORS)
├── notes.$projectId.lazy.tsx                # Notes (TYPE ERRORS)
├── study.$projectId.lazy.tsx                # Study (TYPE ERRORS)
└── api/chat.ts                              # Chat API (TYPE ERRORS)
```

---

## 🎨 Component Size Limits

**STANDARD**: 120 lines per component (strictly enforced)

**Current Violations** (God Components):
1. `AgentConfigDialog.tsx` - 1,089 lines (9x over limit)
2. `rag-store.ts` - 1,595 lines (13x over limit, DUPLICATE)
3. `agents-store.ts` - 430 lines (3.6x over limit)
4. `conversation-threads-store.ts` - 726 lines (6x over limit)
5. Plus 12+ additional violations

**Refactoring Pattern**:
```typescript
// BEFORE (god component)
function BigComponent() {
  // 500+ lines of logic
}

// AFTER (modular components)
function BigComponent() {
  const hook1 = useCustomHook1();     // Extracted logic
  const hook2 = useCustomHook2();     // Extracted logic
  return (
    <>
      <SubComponent1 />               // Split UI
      <SubComponent2 />               // Split UI
    </>
  );
}
```

---

## 🔄 Recursive Loop Pattern

### Per Iteration:
1. **Measure Current State**
   ```bash
   pnpm tsc --noEmit 2>&1 | grep "error TS" | wc -l
   ```

2. **Fix Next Batch** (10-20 errors at a time)
   - Pick low-risk, high-impact fixes first
   - Test changes thoroughly
   - Commit with conventional commit format

3. **Update Metrics**
   - Document errors fixed
   - Update baseline context
   - Calculate progress percentage

4. **Report Progress**
   - Summary of changes made
   - Errors remaining
   - Next iteration targets

### Success Criteria (Per Cycle):
- TypeScript errors reduced by 50%
- Zero data loss incidents
- All tests passing
- Documentation updated

---

## 📋 Pre-Flight Checklist

Before starting work:
- [ ] Read baseline context (`ralph-loop-cycle-1062-baseline-context-2026-01-03.md`)
- [ ] Check current TypeScript error count
- [ ] Verify no uncommitted changes
- [ ] Confirm test suite passes
- [ ] Identify specific target (e.g., "fix TanStack Router types")

After completing work:
- [ ] Run `pnpm tsc --noEmit` to verify error reduction
- [ ] Run `pnpm test` to ensure no regressions
- [ ] Update baseline metrics in this document
- [ ] Commit changes with clear message
- [ ] Document breaking changes (if any)

---

## 🆘 Emergency Procedures

### If Data Loss Occurs:
1. STOP all operations immediately
2. Check IndexedDB backups in `_bmad-output/sprint-artifacts/`
3. Restore from last timestamped backup
4. Investigate root cause before resuming

### If TypeScript Errors Increase:
1. Revert last commit
2. Run `pnpm tsc --noEmit` to verify baseline
3. Investigate error messages carefully
4. Fix incrementally (5-10 errors at a time)

### If Tests Fail:
1. Check if it's a test setup issue or real bug
2. If setup issue: fix test configuration
3. If real bug: revert and investigate
4. Never skip tests to proceed

### If Build Fails:
1. Check Vite configuration
2. Verify all imports resolve
3. Check for circular dependencies
4. Review recent changes to build files

---

## 📞 Context Sources

- **Full Baseline**: `_bmad-output/ralph-loop-cycle-1062-baseline-context-2026-01-03.md`
- **CLAUDE.md**: Project-specific development patterns
- **AGENTS.md**: Agent development workflow
- **epics.md**: Epic definitions and priorities
- **sprint-status.yaml**: Sprint tracking

---

**Cycle 1062 Quick Reference Created: 2026-01-03**
**Update After Each Major Iteration**
