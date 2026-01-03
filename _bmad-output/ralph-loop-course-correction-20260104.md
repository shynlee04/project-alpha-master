# COURSE CORRECTION: Foundation First Strategy

**Date**: 2026-01-04 00:45:00
**Trigger**: User Directive - Stop Hook Feedback
**Previous Strategy**: Fix TypeScript errors (TS-001)
**New Strategy**: Foundation First (Stores, Persistence, Splitting God Classes)

---

## 🚨 CRITICAL DIRECTIVE FROM USER

**Key Instruction**: "ignore types errors of Tests for now, they are not important"

**Foundation First Priority**:
1. **Foundation**: States, persistence, stores, reactive entities
2. **Centralizing**: LLM providers, agents configuration refactoring
3. **Splitting**: Large code files, god classes
4. **File System E2E**: Each workspace (IDE → Notes → Knowledge)
5. **100% Health**: All workspaces must achieve 100% health

**Migration Requirements**:
- **EXTREMELY IMPORTANT**: Assess migration across architecture
- Transform and transfer legacy to new components
- **DO NOT CRASH** the project during refactoring
- Address in **batches of related items**
- **Scaffold but NOT break things**
- **Recursive cleanup** one after another
- Always check bigger cycles loop
- Use latest timestamp artifacts as anchor

---

## 📊 Strategy Shift

### ❌ ABANDONED: TypeScript Error Fixing (TS-001)

**Reason**: Test file TypeScript errors are NOT important
**Time Wasted**: ~45 minutes on compilation and analysis
**Lesson**: Always clarify scope BEFORE starting execution

### ✅ NEW STRATEGY: Foundation First

**Phase 0: Foundation Stabilization** (Revised)

**Priority Order**:
1. **God Store Elimination** (Highest Priority)
   - Split large stores (>120 lines)
   - Eliminate circular dependencies
   - Consolidate duplicate stores

2. **God Class Splitting**
   - Components >300 lines
   - Services >200 lines
   - Utilities >150 lines

3. **File System End-to-End** (Workspace by Workspace)
   - **IDE Workspace** (First - currently well-designed)
   - **Notes Workspace** (Second)
   - **Knowledge Workspace** (Third)
   - Each workspace: 100% health before proceeding

4. **Recursive Migration**
   - Legacy → New component transformation
   - Import/export cleanup
   - Circular dependency elimination
   - Continuous validation

---

## 🎯 Foundation First Execution Plan

### Phase 0A: God Store Analysis & Splitting (Week 1)

**Target**: All stores ≤120 lines, zero circular dependencies

**God Stores Identified** (From epic-tracking.md):
1. `rag-store.ts` (1,595 lines - WORST)
2. `conversation-threads-store.ts` (726 lines)
3. `conversation-store.ts` (626 lines)
4. `project-store.ts` (450 lines)
5. `file-snapshot-store.ts` (509 lines)
6. `agents-store.ts` (430 lines) - **CIRCULAR DEP**
7. Plus 63 more god stores (69 total)

**Execution Strategy**:
1. **Analyze** each god store (dependencies, responsibilities)
2. **Split** into focused slices (≤120 lines each)
3. **Migrate** consumers to new slices
4. **Validate** zero breaking changes
5. **Delete** old store (after migration)

**Per-Store Validation**:
```bash
# For each store:
1. Read and analyze store
2. Create slice files (≤120 lines)
3. Write unit tests (≥80% coverage)
4. Migrate consumers (facade pattern)
5. Run tests (100% pass rate)
6. Delete old store
7. Commit: `refactor(store): Split [store-name] into [N] slices`
```

### Phase 0B: God Component Splitting (Week 1-2)

**Target**: All components ≤300 lines

**God Components Identified**:
1. `AgentConfigDialog.tsx` (1,089 lines - 9x over limit!)
2. Plus 44 more violations (45 total)

**Execution Strategy**:
1. **Extract** hooks (≤120 lines)
2. **Extract** sub-components (≤200 lines)
3. **Compose** in main component (≤300 lines)
4. **Validate** visual regression
5. **Test** functionality preserved

### Phase 0C: File System End-to-End - IDE Workspace (Week 2)

**Scope**: Complete file system CRUD for IDE workspace

**Features**:
1. User permissions (read/write/execute)
2. AI agent tool permissions (FileTools, TerminalTools)
3. Concurrent access handling
4. Synchronization status
5. File type handling (code, config, data)
6. CRUD operations (Create, Read, Update, Delete)
7. Error handling (quota exceeded, permission denied)
8. Smartphone UX consideration

**Acceptance Criteria**:
- 100% health score for IDE workspace
- All file operations working
- Zero data loss scenarios
- Permissions properly enforced
- UX tested on mobile (if applicable)

### Phase 0D: File System End-to-End - Notes Workspace (Week 2-3)

**Scope**: Complete file system CRUD for Notes workspace

**Migration from IDE workspace patterns**:
- Reuse validated patterns from IDE
- Adapt for Notes-specific file types (markdown, rich text)
- Ensure 100% health before proceeding

### Phase 0E: File System End-to-End - Knowledge Workspace (Week 3)

**Scope**: Complete file system CRUD for Knowledge workspace

**Migration from Notes/IDE patterns**:
- Reuse validated patterns
- Adapt for Knowledge-specific file types (PDF, URL imports)
- 100% health requirement

---

## 🔄 Recursive Loop Protocol

### Cycles Within Cycles

**Outer Loop**: Phase 0A → 0B → 0C → 0D → 0E (Foundation)
**Middle Loop**: Per-store/per-component execution
**Inner Loop**: Per-file validation (edit → check → commit → proceed)

### Continuous Validation

**After Each Action**:
1. Run `pnpm tsc --noEmit` (check for new errors)
2. Run `pnpm test` (check for broken tests)
3. Check circular dependencies
4. Verify no breaking changes
5. Update epic tracking

### Anchor Documents

**Always Use Latest Timestamp**:
- `_bmad-output/ralph-loop-*-latest-timestamp.md`
- Consume latest artifacts as input for next cycle
- Overwrite old artifacts with new iterations

### Cleanup & Migration

**One After Another**:
1. Complete current task
2. Migrate legacy → new
3. Clean up imports/exports
4. Fix circular dependencies
5. Validate 100% health
6. Proceed to next batch

---

## 📊 Updated Metrics

### Foundation First Health Score

**Baseline**: 6.8/10 (after CD-001 circular dep fix)
**Target**: 8.8/10 (after Phase 0 complete)
**Gap**: 2.0 points

**Success Criteria**:
- [ ] All god stores eliminated (69 files → 0)
- [ ] All god components eliminated (45 files → 0)
- [ ] File system E2E working (IDE workspace)
- [ ] Zero circular dependencies
- [ ] Zero breaking changes
- [ ] 100% test pass rate

### TypeScript Errors

**Status**: IGNORE TEST FILE ERRORS
**Production Errors**: ~400 (estimate from sprint-status.yaml)
**Action**: Fix ONLY production errors during foundation work

---

## 🚀 Immediate Actions

### RIGHT NOW:

1. ✅ Stop TypeScript compilation (DONE)
2. ✅ Update epic tracking (IN PROGRESS)
3. ⏳ Identify #1 god store to split
4. ⏳ Create splitting strategy
5. ⏳ Execute store splitting

### NEXT 1 HOUR:

1. **Analyze `rag-store.ts`** (worst offender: 1,595 lines)
   - Read full file
   - Identify responsibilities
   - Map dependencies
   - Design slice structure

2. **Create Slice Plan**
   - Define slice boundaries (≤120 lines each)
   - Document migration strategy
   - Identify consumers

3. **Execute Splitting**
   - Create slice files
   - Write unit tests
   - Migrate consumers
   - Delete old store
   - Validate

### NEXT 4 HOURS:

Complete splitting of top 3 god stores:
1. `rag-store.ts` (1,595 lines)
2. `conversation-threads-store.ts` (726 lines)
3. `conversation-store.ts` (626 lines)

---

## 📝 Handoff to Next Cycle

**Next Cycle Will**:
1. Consume this document (latest timestamp anchor)
2. Continue god store splitting
3. File-by-file validation
4. Recursive cleanup
5. Migration legacy → new
6. Update artifacts with new timestamp

**Artifacts Created**:
- This course correction document ✅
- Updated epic tracking (pending)
- Store splitting plan (pending)
- Next cycle handoff (pending)

---

**Generated by**: BMAD Master Agent
**Mode**: Ralph Loop Recursive Auto-Execution
**Iteration**: 1146 (CORRECTED)
**Timestamp**: 2026-01-04 00:45:00

**Status**: 🟡 COURSE CORRECTED
**Next Action**: Analyze and split `rag-store.ts` (1,595 lines)
**Strategy**: FOUNDATION FIRST
