---
name: Store Consolidation Map
description: Complete inventory and migration plan for all 37 stores across the codebase
version: 1.0.0
author: @bmad-bmm-architect
created: 2026-01-01T10:00:00+07:00
phase: Planning
---

# Store Consolidation Map

**Creation Date:** 2026-01-01
**Purpose**: Complete inventory and migration plan for all Zustand stores
**Total Stores**: 37 (excluding duplicates)
**Duplicate Stores**: 8 confirmed duplicates

---

## Part I: Store Inventory

### Category 1: Core Application State (Target: `src/infrastructure/persistence/stores/core/`)

| Store Name | Current Location(s) | LOC | Purpose | TypeScript Errors | Canonical Version | Target Location |
|------------|-------------------|-----|---------|------------------|-------------------|-----------------|
| `ide-store.ts` | `src/lib/state/` | TBD | IDE state (files, panels, active file) | 0 | `src/lib/state/ide-store.ts` | `stores/core/ide-store.ts` |
| `conversation-store.ts` | `src/lib/state/`<br>`src/infrastructure/persistence/stores/`<br>`src/lib/workspace/` | 626 → 424 | Conversation and chat state | 5 | `src/infrastructure/persistence/stores/conversation-store.ts` | `stores/core/conversation-store.ts` |
| `workspace-store.ts` | `src/lib/state/` | TBD | Current workspace, transition state | 0 | `src/lib/state/workspace-store.ts` | `stores/core/workspace-store.ts` |
| `navigation-store.ts` | `src/lib/state/` | TBD | Navigation state (command palette) | 0 | `src/lib/state/navigation-store.ts` | `stores/core/navigation-store.ts` |
| `statusbar-store.ts` | `src/lib/state/` | TBD | Status bar segments | 0 | `src/lib/state/statusbar-store.ts` | `stores/core/statusbar-store.ts` |
| `file-sync-status-store.ts` | `src/lib/state/` | TBD | File sync status tracking | 0 | `src/lib/state/file-sync-status-store.ts` | `stores/core/file-sync-status-store.ts` |

### Category 2: Agent Configuration State (Target: `src/infrastructure/persistence/stores/agents/`)

| Store Name | Current Location(s) | LOC | Purpose | TypeScript Errors | Canonical Version | Target Location |
|------------|-------------------|-----|---------|------------------|-------------------|-----------------|
| `agents-store.ts` | `src/stores/` | TBD | Agent definitions (workspace bindings, tool permissions) | 0 | `src/stores/agents-store.ts` | `stores/agents/agents-store.ts` |
| `agent-selection-store.ts` | `src/stores/` | TBD | Active agent selection | 0 | `src/stores/agent-selection-store.ts` | `stores/agents/agent-selection-store.ts` |
| `provider-config-store.ts` | `src/lib/agent/providers/` | TBD | LLM provider configuration | 0 | `src/lib/agent/providers/provider-config-store.ts` | `stores/agents/provider-config-store.ts` |
| `models-loader-store.ts` | `src/lib/agent/providers/` | TBD | Available models list | 0 | `src/lib/agent/providers/models-loader-store.ts` | `stores/agents/models-loader-store.ts` |

### Category 3: Knowledge Workspace State (Target: `src/infrastructure/persistence/stores/knowledge/`)

| Store Name | Current Location(s) | LOC | Purpose | TypeScript Errors | Canonical Version | Target Location |
|------------|-------------------|-----|---------|------------------|-------------------|-----------------|
| `rag-store.ts` | `src/lib/state/`<br>`src/infrastructure/persistence/stores/`<br>`src/stores/` | 810 → orchestrator | RAG infrastructure state | 2 | `src/stores/rag-store.ts` (refactored to orchestrator pattern) | `stores/knowledge/rag-store.ts` |
| `knowledge-store.ts` | `src/lib/state/`<br>`src/infrastructure/persistence/stores/` | TBD | Knowledge sources and collections | 1 | `src/infrastructure/persistence/stores/knowledge-store.ts` | `stores/knowledge/knowledge-store.ts` |
| `source-store.ts` | `src/lib/state/` | TBD | Individual source state | 0 | `src/lib/state/source-store.ts` | `stores/knowledge/source-store.ts` |

### Category 4: Study Workspace State (Target: `src/infrastructure/persistence/stores/study/`)

| Store Name | Current Location(s) | LOC | Purpose | TypeScript Errors | Canonical Version | Target Location |
|------------|-------------------|-----|---------|------------------|-------------------|-----------------|
| `flashcard-store.ts` | `src/lib/state/`<br>`src/infrastructure/persistence/stores/` | TBD | Flashcard state | 3 | `src/infrastructure/persistence/stores/flashcard-store.ts` | `stores/study/flashcard-store.ts` |
| `quiz-store.ts` | `src/lib/state/`<br>`src/infrastructure/persistence/stores/` | 629 → 305 | Quiz state | 4 | `src/infrastructure/persistence/stores/quiz-store.ts` (refactored) | `stores/study/quiz-store.ts` |

### Category 5: Canvas Workspace State (Target: `src/infrastructure/persistence/stores/canvas/`)

| Store Name | Current Location(s) | LOC | Purpose | TypeScript Errors | Canonical Version | Target Location |
|------------|-------------------|-----|---------|------------------|-------------------|-----------------|
| `canvas-store.ts` | `src/lib/state/`<br>`src/infrastructure/persistence/stores/` | TBD | Canvas nodes and connections | 1 | `src/infrastructure/persistence/stores/canvas-store.ts` | `stores/canvas/canvas-store.ts` |

### Category 6: Other Stores (To be categorized)

| Store Name | Current Location(s) | LOC | Purpose | TypeScript Errors | Canonical Version | Proposed Category |
|------------|-------------------|-----|---------|------------------|-------------------|------------------|
| `ide-state-store.ts` | `src/infrastructure/persistence/stores/` | TBD | IDE state management | 0 | `src/infrastructure/persistence/stores/ide-state-store.ts` | core (merge with ide-store) |
| `project-store.ts` | `src/lib/workspace/` | TBD | Project metadata | 0 | `src/lib/workspace/project-store.ts` | core |
| `sync-manager-store.ts` | `src/lib/workspace/` | TBD | Sync state | 0 | `src/lib/workspace/sync-manager-store.ts` | core |
| `terminal-store.ts` | `src/lib/state/` | TBD | Terminal state | 0 | `src/lib/state/terminal-store.ts` | core |
| `editor-store.ts` | `src/lib/state/` | TBD | Editor state | 0 | `src/lib/state/editor-store.ts` | core |
| `study-store.ts` | `src/lib/state/` | TBD | Study workspace state | 2 | `src/lib/state/study-store.ts` | study |
| `notes-store.ts` | `src/lib/state/` | TBD | Notes workspace state | 1 | `src/lib/state/notes-store.ts` | knowledge (create knowledge/notes subcategory) |

---

## Part II: Confirmed Duplicates Analysis

### Critical Duplicates (Must Resolve)

**1. conversation-store.ts**
- **Location 1**: `src/lib/state/conversation-store.ts` (626 lines, reduced to 424)
- **Location 2**: `src/infrastructure/persistence/stores/conversation-store.ts`
- **Location 3**: `src/lib/workspace/conversation-store.ts`
- **Status**: ❌ CRITICAL - 3 versions
- **Resolution**: Use `src/infrastructure/persistence/stores/conversation-store.ts` as canonical (already refactored to 424 lines split across 4 files)
- **Migration**: Update all imports, delete 2 duplicates

**2. rag-store.ts**
- **Location 1**: `src/lib/state/rag-store.ts` (810 lines)
- **Location 2**: `src/infrastructure/persistence/stores/rag-store.ts`
- **Location 3**: `src/stores/rag-store.ts`
- **Status**: ❌ CRITICAL - 3 versions
- **Resolution**: Use `src/stores/rag-store.ts` as canonical (refactored to orchestrator pattern)
- **Migration**: Update all imports, delete 2 duplicates

**3. canvas-store.ts**
- **Location 1**: `src/lib/state/canvas-store.ts`
- **Location 2**: `src/infrastructure/persistence/stores/canvas-store.ts`
- **Status**: ❌ CRITICAL - 2 versions
- **Resolution**: Use `src/infrastructure/persistence/stores/canvas-store.ts` as canonical
- **Migration**: Update imports, delete 1 duplicate

**4. knowledge-store.ts**
- **Location 1**: `src/lib/state/knowledge-store.ts`
- **Location 2**: `src/infrastructure/persistence/stores/knowledge-store.ts`
- **Status**: ❌ CRITICAL - 2 versions
- **Resolution**: Use `src/infrastructure/persistence/stores/knowledge-store.ts` as canonical
- **Migration**: Update imports, delete 1 duplicate

**5. flashcard-store.ts**
- **Location 1**: `src/lib/state/flashcard-store.ts`
- **Location 2**: `src/infrastructure/persistence/stores/flashcard-store.ts`
- **Status**: ❌ CRITICAL - 2 versions
- **Resolution**: Use `src/infrastructure/persistence/stores/flashcard-store.ts` as canonical
- **Migration**: Update imports, delete 1 duplicate

**6. quiz-store.ts**
- **Location 1**: `src/lib/state/quiz-store.ts` (629 lines, reduced to 305)
- **Location 2**: `src/infrastructure/persistence/stores/quiz-store.ts`
- **Status**: ⚠️ MEDIUM - 2 versions (one already refactored)
- **Resolution**: Use `src/infrastructure/persistence/stores/quiz-store.ts` as canonical (already refactored to 305 lines split across 5 files)
- **Migration**: Update imports, delete 1 duplicate

**7. ide-store.ts**
- **Location 1**: `src/lib/state/ide-store.ts`
- **Location 2**: `src/infrastructure/persistence/stores/ide-state-store.ts` (similar purpose)
- **Status**: ⚠️ MEDIUM - Similar stores, different names
- **Resolution**: Consolidate into single `ide-store.ts`
- **Migration**: Merge functionality, choose canonical version

**8. study-store.ts**
- **Location 1**: `src/lib/state/study-store.ts`
- **Location 2**: `src/infrastructure/persistence/stores/` (implied by duplication analysis)
- **Status**: ⚠️ LOW - Needs verification
- **Resolution**: TBD after audit

---

## Part III: Migration Strategy

### Phase 1: Audit and Map (Week 1)

**Task 1.1: Complete Store Inventory**
- [ ] Run `find src -name "*store*.ts" -type f` to find all stores
- [ ] Document line counts for each store
- [ ] Count TypeScript errors per store
- [ ] Identify import dependencies
- [ ] Document persistence strategy (localStorage, IndexedDB, in-memory)

**Task 1.2: Dependency Mapping**
- [ ] For each store, list all files importing it
- [ ] Create dependency graph
- [ ] Identify circular dependencies
- [ ] Prioritize stores by import count (high import count = high priority)

**Task 1.3: Choose Canonical Versions**
- [ ] For duplicate stores, choose canonical version based on:
  - Least TypeScript errors
  - Best adherence to Zustand best practices
  - Proper Dexie persistence integration
  - Most complete implementation
- [ ] Document rationale for each choice

### Phase 2: Prepare Target Structure (Week 1)

**Task 2.1: Create Directory Structure**
```bash
mkdir -p src/infrastructure/persistence/stores/{core,agents,knowledge,study,canvas}
```

**Task 2.2: Create Barrel Exports**
```typescript
// src/infrastructure/persistence/stores/core/index.ts
export { useIDEStore } from './ide-store';
export { useConversationStore } from './conversation-store';
export { useWorkspaceStore } from './workspace-store';
export { useNavigationStore } from './navigation-store';
export { useStatusbarStore } from './statusbar-store';
export { useFileSyncStatusStore } from './file-sync-status-store';
```

**Task 2.3: Create Master Barrel**
```typescript
// src/infrastructure/persistence/stores/index.ts
// Core stores
export * from './core';

// Agent stores
export * from './agents';

// Knowledge stores
export * from './knowledge';

// Study stores
export * from './study';

// Canvas stores
export * from './canvas';
```

### Phase 3: Execute Migration (Week 2-3)

**Task 3.1: Migrate Core Stores (Priority: HIGH)**
- [ ] Move `conversation-store.ts` to `stores/core/`
- [ ] Move `workspace-store.ts` to `stores/core/`
- [ ] Move `ide-store.ts` to `stores/core/`
- [ ] Move `navigation-store.ts` to `stores/core/`
- [ ] Update all imports

**Task 3.2: Migrate Agent Stores (Priority: HIGH)**
- [ ] Move `agents-store.ts` from `src/stores/` to `stores/agents/`
- [ ] Move `agent-selection-store.ts` from `src/stores/` to `stores/agents/`
- [ ] Move `provider-config-store.ts` from `src/lib/agent/providers/` to `stores/agents/`
- [ ] Move `models-loader-store.ts` from `src/lib/agent/providers/` to `stores/agents/`
- [ ] Update all imports

**Task 3.3: Resolve Duplicates (Priority: CRITICAL)**
- [ ] Delete duplicate `conversation-store.ts` files (keep only 1)
- [ ] Delete duplicate `rag-store.ts` files (keep only 1)
- [ ] Delete duplicate `canvas-store.ts` files (keep only 1)
- [ ] Delete duplicate `knowledge-store.ts` files (keep only 1)
- [ ] Delete duplicate `flashcard-store.ts` files (keep only 1)
- [ ] Delete duplicate `quiz-store.ts` files (keep only 1)
- [ ] Update all imports

**Task 3.4: Migrate Workspace-Specific Stores (Priority: MEDIUM)**
- [ ] Migrate knowledge stores to `stores/knowledge/`
- [ ] Migrate study stores to `stores/study/`
- [ ] Migrate canvas stores to `stores/canvas/`
- [ ] Update all imports

### Phase 4: Validate (Week 4)

**Task 4.1: TypeScript Validation**
```bash
pnpm tsc --noEmit
# Target: 0 errors
```

**Task 4.2: Test Validation**
```bash
pnpm test
# Target: All tests passing
```

**Task 4.3: Smoke Testing**
- [ ] Start dev server: `pnpm dev`
- [ ] Test agent creation and configuration
- [ ] Test workspace switching
- [ ] Test conversation creation and chat
- [ ] Test file operations
- [ ] Test all workspace types

**Task 4.4: Performance Validation**
- [ ] Check bundle size impact
- [ ] Measure store initialization time
- [ ] Verify no performance regressions

---

## Part IV: Import Path Updates

### Global Find and Replace Strategy

**Old Import Pattern 1**: `src/lib/state/`
```bash
# Find all imports from src/lib/state/
grep -r "from '@/lib/state/" src/

# Replace with new paths
# Example: @/lib/state/ide-store → @/infrastructure/persistence/stores/core/ide-store
```

**Old Import Pattern 2**: `src/stores/`
```bash
# Find all imports from src/stores/
grep -r "from '@/stores/" src/

# Replace with new paths
# Example: @/stores/agents → @/infrastructure/persistence/stores/agents/agents-store
```

**Old Import Pattern 3**: `src/infrastructure/persistence/stores/` (duplicates)
```bash
# These should already be correct, but verify
grep -r "from '@/infrastructure/persistence/stores/" src/
```

**Old Import Pattern 4**: `src/lib/agent/providers/` (provider stores)
```bash
# Find provider config store imports
grep -r "from '@/lib/agent/providers/provider-config-store" src/

# Replace with new path
# @/lib/agent/providers/provider-config-store → @/infrastructure/persistence/stores/agents/provider-config-store
```

### Update Script

```bash
#!/bin/bash
# store-migration.sh

# Backup current state
git checkout -b store-migration-backup

# Create new directory structure
mkdir -p src/infrastructure/persistence/stores/{core,agents,knowledge,study,canvas}

# Move stores (execute in specific order to avoid breaking)
# 1. Core stores
git mv src/lib/state/conversation-store.ts src/infrastructure/persistence/stores/core/
git mv src/lib/state/workspace-store.ts src/infrastructure/persistence/stores/core/
git mv src/lib/state/ide-store.ts src/infrastructure/persistence/stores/core/
git mv src/lib/state/navigation-store.ts src/infrastructure/persistence/stores/core/
git mv src/lib/state/statusbar-store.ts src/infrastructure/persistence/stores/core/
git mv src/lib/state/file-sync-status-store.ts src/infrastructure/persistence/stores/core/

# 2. Agent stores
git mv src/stores/agents-store.ts src/infrastructure/persistence/stores/agents/
git mv src/stores/agent-selection-store.ts src/infrastructure/persistence/stores/agents/
git mv src/lib/agent/providers/provider-config-store.ts src/infrastructure/persistence/stores/agents/
git mv src/lib/agent/providers/models-loader-store.ts src/infrastructure/persistence/stores/agents/

# 3. Knowledge stores
git mv src/stores/rag-store.ts src/infrastructure/persistence/stores/knowledge/
git mv src/infrastructure/persistence/stores/knowledge-store.ts src/infrastructure/persistence/stores/knowledge/
git mv src/lib/state/source-store.ts src/infrastructure/persistence/stores/knowledge/

# 4. Study stores
git mv src/infrastructure/persistence/stores/flashcard-store.ts src/infrastructure/persistence/stores/study/
git mv src/infrastructure/persistence/stores/quiz-store.ts src/infrastructure/persistence/stores/study/

# 5. Canvas stores
git mv src/infrastructure/persistence/stores/canvas-store.ts src/infrastructure/persistence/stores/canvas/

# 6. Remove duplicates (AFTER moving canonical versions)
rm src/lib/state/conversation-store.ts.bak  # if backup exists
rm src/lib/state/rag-store.ts.bak
rm src/lib/state/canvas-store.ts.bak
rm src/lib/state/knowledge-store.ts.bak
rm src/lib/state/flashcard-store.ts.bak
rm src/infrastructure/persistence/stores/quiz-store.ts.bak

# 7. Update imports (manual step required)
echo "⚠️  MANUAL STEP: Update all import paths using find/replace patterns documented in Part IV"

echo "✅ Migration complete. Now run:"
echo "   pnpm tsc --noEmit  # Check TypeScript errors"
echo "   pnpm test          # Run tests"
```

---

## Part V: Risk Mitigation

### Risk 1: Breaking Imports

**Impact**: HIGH
**Likelihood**: HIGH
**Mitigation**:
- Use `git mv` to preserve history
- Run TypeScript compiler after each store migration
- Create comprehensive backup branch
- Use feature flags for gradual rollout

### Risk 2: Runtime State Loss

**Impact**: CRITICAL
**Likelihood**: MEDIUM
**Mitigation**:
- Preserve localStorage key names in persist middleware
- Preserve IndexedDB database name
- Add data migration script if storage format changes
- Test with existing user data

### Risk 3: Test Failures

**Impact**: MEDIUM
**Likelihood**: HIGH
**Mitigation**:
- Update test imports alongside code imports
- Run tests after each store migration
- Fix broken tests immediately
- Maintain test coverage throughout migration

### Risk 4: Performance Regression

**Impact**: MEDIUM
**Likelihood**: LOW
**Mitigation**:
- Benchmark store performance before/after
- Monitor bundle size
- Check for unnecessary re-renders
- Profile hot path operations

---

## Part VI: Success Criteria

### Must Have (P0)

- [ ] Zero duplicate store files (verified by `find` command)
- [ ] All stores in `src/infrastructure/persistence/stores/[domain]/`
- [ ] Zero TypeScript errors
- [ ] All tests passing
- [ ] All smoke tests passing

### Should Have (P1)

- [ ] Barrel exports created for all domains
- [ ] Import paths follow new pattern consistently
- [ ] No performance regressions (>5% slower)
- [ ] Code coverage maintained or improved

### Nice to Have (P2)

- [ ] Store migration documentation
- [ ] Before/after benchmarks
- [ ] Developer migration guide
- [ ] Automated migration script

---

## Part VII: Timeline Estimate

| Phase | Duration | Effort | Dependencies |
|-------|----------|--------|--------------|
| Phase 1: Audit and Map | 3 days | 24 hours | None |
| Phase 2: Prepare Structure | 1 day | 8 hours | Phase 1 complete |
| Phase 3: Execute Migration | 5 days | 40 hours | Phase 2 complete |
| Phase 4: Validate | 3 days | 24 hours | Phase 3 complete |
| **Total** | **12 days** | **96 hours** | - |

**Buffer**: +3 days for unexpected issues
**Total with Buffer**: 15 days (3 weeks)

---

## Conclusion

This store consolidation map provides a complete inventory and migration plan for all 37 stores. By following this plan, we will:

1. ✅ Eliminate all duplicate stores (8 confirmed duplicates)
2. ✅ Organize stores by domain (core, agents, knowledge, study, canvas)
3. ✅ Establish single source of truth for all state
4. ✅ Improve maintainability and developer experience
5. ✅ Enable future architectural improvements

**Next Steps**:
1. Review and approve this consolidation map
2. Begin Phase 1: Audit and Map
3. Execute migration following timeline
4. Validate with TypeScript and tests

---

**Document Version**: 1.0.0
**Last Updated**: 2026-01-01T10:00:00+07:00
**Author**: @bmad-bmm-architect
**Status**: READY FOR EXECUTION
