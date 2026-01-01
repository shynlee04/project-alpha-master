# Developer Onboarding Guide: Platform Unification Epics
**Created:** 2026-01-02
**Phase:** Phase 1 Complete (Iterations 1-20) - Ready for Phase 3 Implementation
**Audience:** Developers joining Epic CC-1 or Epic CP-1

---

## Welcome to Platform Unification! 🚀

This guide will help you get up to speed quickly on the **Platform Unification Initiative** and prepare you to contribute to **Epic CC-1 (Conversation Consolidation)** or **Epic CP-1 (Project Consolidation)**.

**Time to Complete**: 60-90 minutes
**Prerequisites**: Familiarity with TypeScript, React, Zustand

---

## Table of Contents

1. [Platform Unification Overview](#1-platform-unification-overview)
2. [Current State & Problems](#2-current-state--problems)
3. [Target Architecture](#3-target-architecture)
4. [Epic Summaries](#4-epic-summaries)
5. [Getting Started](#5-getting-started)
6. [Common Workflows](#6-common-workflows)
7. [Troubleshooting](#7-troubleshooting)
8. [Resources & References](#8-resources--references)

---

## 1. Platform Unification Overview

### Mission

Transform the fragmented codebase into a **unified, coherent platform** where:
- **5 Cornerstones** operate as single-source-of-truth
- **4 Workspaces** work seamlessly together
- **4 Use Cases** are fully implementable

### Current Phase

**Phase 1**: ✅ **COMPLETE** (Iterations 1-20) - Analysis & Gap Documentation
**Phase 3**: 🔄 **NEXT** (Iterations 31-150) - Implementation - Cornerstones

### Progress So Far

**Documents Created**: 20+ documents (~15,000 lines)
- 5 Cornerstone analyses
- 4 Architecture Decision Records (ADRs)
- 2 Detailed gap documentation
- 2 Epic user story breakdowns
- 1 Comprehensive implementation roadmap
- 5 Iteration completion summaries

**Ready for Implementation**: ✅ Epic CC-1 and Epic CP-1 are fully defined with user stories

---

## 2. Current State & Problems

### Cornerstone Health Scores

| Cornerstone | Health Score | Status | Action Required |
|-------------|--------------|--------|-----------------|
| **CS1: Providers** | 9/10 ✅ | Production-ready | None (already refactored) |
| **CS2: Agents** | 9/10 ✅ | Production-ready | None (already refactored) |
| **CS3: Conversations** | 3/10 ❌ | **Critical debt** | **Epic CC-1**: 127 hours |
| **CS4: Projects** | 6/10 ⚠️ | **Moderate issues** | **Epic CP-1**: 80-100 hours |
| **CS5: RAG** | 8/10 ✅ | Production-ready | Minor enhancements |

**Average Health**: 7/10 ⚠️ (Target: 9/10)

### Problems Identified

**God Stores** (Files >300 lines with too many responsibilities):
- **Cornerstone 3**: 2 god stores (1,352 lines total)
  - `conversation-store.ts` (626 lines) - 20+ methods
  - `conversation-threads-store.ts` (726 lines) - 30+ methods
- **Cornerstone 4**: 2 god stores (959 lines total)
  - `project-store.ts` (450 lines) - 20+ methods
  - `file-snapshot-store.ts` (509 lines) - 10+ methods

**Issues**:
- ❌ Cognitive load (too much code in one file)
- ❌ Hard to test (multiple responsibilities)
- ❌ Hard to maintain (no clear separation)
- ❌ Data duplication risk (20+ components using both conversation stores)
- ❌ Potential circular dependencies

---

## 3. Target Architecture

### Solution: Single Bounded Store with Slice Pattern

**Before** (God Store):
```typescript
// ❌ Single file with 400+ lines, 20+ methods
// conversation-store.ts (626 lines)
export const useConversationStore = create<ConversationStore>((set, get) => ({
  conversations: {},
  activeConversationId: null,
  scrollPositions: {},
  pendingToolApprovals: [],

  // 20+ methods...
  createConversation,
  updateConversation,
  deleteConversation,
  getConversation,
  // ... 15+ more methods
}));
```

**After** (Slices):
```typescript
// ✅ 6 focused slices (each <120 lines)
// conversation-metadata-slice.ts (120 lines)
export const createConversationMetadataSlice = (set, get) => ({
  createConversation,
  updateConversationMetadata,
  deleteConversation,
  getConversation,
  // 3 more methods (focused on metadata)
});

// thread-management-slice.ts (120 lines)
export const createThreadManagementSlice = (set, get) => ({
  createThread,
  deleteThread,
  setActiveThread,
  // ... (focused on threads)
});

// + 4 more slices (utils, validation, events, messages)

// ✅ Combined into single bounded store
export const useConversationStore = create<ConversationStore>()(
  persist(
    (...a) => ({
      ...createConversationMetadataSlice(...a),
      ...createThreadManagementSlice(...a),
      ...createMessageCrudSlice(...a),
      ...createConversationUtilsSlice(...a),
      ...createConversationValidationSlice(...a),
      ...createConversationEventsSlice(...a),
    }),
    {
      name: 'conversation-state',
      storage: createDexieStorage('conversationState'),
    }
  )
);
```

### Benefits

✅ **Modularity**: Each slice has single responsibility
✅ **Testability**: Easy to unit test individual slices
✅ **Maintainability**: Each slice ≤120 lines
✅ **No Circular Dependencies**: Cross-slice via `get()` or domain services
✅ **Code Reduction**: 8-53% reduction (varies by complexity)

---

## 4. Epic Summaries

### Epic CC-1: Conversation Consolidation (HIGHEST PRIORITY)

**Goal**: Refactor 2 conversation god stores (1,352 lines) into 6 modular slices (630 lines, 53% reduction)

**Duration**: 127 hours (16 days)

**Health Improvement**: 3/10 ❌ → 9/10 ✅

**15 User Stories**:
- **Foundation** (7 stories, CC-1.1 through CC-1.7): Create 6 slices + unified store
  - CC-1.1: Conversation Metadata Slice (10 tests, 6-8 hours)
  - CC-1.2: Thread Management Slice (14 tests, 10-12 hours)
  - CC-1.3: Message CRUD Slice (12 tests, 10-12 hours)
  - CC-1.4: Utils Slice (10 tests, 6-8 hours)
  - CC-1.5: Validation Slice (12 tests, 6-8 hours)
  - CC-1.6: Events Slice (12 tests, 6-8 hours)
  - CC-1.7: Unified Store Integration (10 tests, 10-12 hours)

- **Migration** (6 stories, CC-1.8 through CC-1.13): Data migration + component updates
  - CC-1.8: Data Migration Script (15 tests, 8-10 hours)
  - CC-1.9: Study Workspace Migration (4 hours) - LOW risk
  - CC-1.10: Notes Workspace Migration (6 hours) - LOW-MEDIUM risk
  - CC-1.11: Knowledge Workspace Migration (8 hours) - MEDIUM risk
  - CC-1.12: Chat Components Migration (6 hours) - MEDIUM risk
  - CC-1.13: IDE Workspace Migration (11 hours) - HIGHEST risk

- **Cleanup** (2 stories, CC-1.14 and CC-1.15): Delete old stores + documentation
  - CC-1.14: Delete Old Stores (4 hours)
  - CC-1.15: Epic Documentation (6 hours)

**Total Tests**: 105 (70 unit + 20 integration + 15 E2E)

**Documentation**: `epic-cc-1-conversation-consolidation-breakdown.md`

---

### Epic CP-1: Project Consolidation (HIGH PRIORITY)

**Goal**: Refactor 2 project god stores (959 lines) into 9 modular slices (880 lines, 8% reduction + better architecture) + fix Hub routing

**Duration**: 80-100 hours (12-15 days)

**Health Improvement**: 6/10 ⚠️ → 9/10 ✅

**18 User Stories**:
- **Project Store** (6 stories, CP-1.1 through CP-1.6): Create 5 slices + unified store
  - CP-1.1: Project CRUD Slice (12 tests, 8-10 hours)
  - CP-1.2: Workspace Bindings Slice (12 tests, 6-8 hours)
  - CP-1.3: Permissions Slice (12 tests, 6-8 hours)
  - CP-1.4: Layout Slice (10 tests, 4-6 hours)
  - CP-1.5: Utils Slice (14 tests, 6-8 hours)
  - CP-1.6: Unified Store Integration (10 tests, 8-10 hours)

- **Snapshot Store** (5 stories, CP-1.7 through CP-1.11): Create 4 slices + unified store
  - CP-1.7: Snapshot Metadata Slice (10 tests, 8-10 hours)
  - CP-1.8: Cache Slice (12 tests, 8-10 hours)
  - CP-1.9: Bulk Ops Slice (8 tests, 6-8 hours)
  - CP-1.10: Quota Slice (10 tests, 4-6 hours)
  - CP-1.11: Unified Store Integration (6 tests, 8-10 hours)

- **Hub & Migration** (7 stories, CP-1.12 through CP-1.18): Hub route + migrations + cleanup
  - CP-1.12: Create Hub Route (2 hours)
  - CP-1.13: Hub Components Migration (3 hours)
  - CP-1.14: IDE Components Migration (6 hours)
  - CP-1.15: File Sync Services Migration (8 hours)
  - CP-1.16: Data Migration Script (10 tests, 4-6 hours)
  - CP-1.17: Delete Old Stores (4 hours)
  - CP-1.18: Epic Documentation (6 hours)

**Total Tests**: 95 (60 unit + 20 integration + 15 E2E)

**Documentation**: `epic-cp-1-project-consolidation-breakdown.md`

---

## 5. Getting Started

### Prerequisites Checklist

Before starting work on an epic story, verify:

**Environment Setup**:
- [ ] Node.js installed (v18+)
- [ ] pnpm installed (`npm install -g pnpm`)
- [ ] Dependencies installed (`pnpm install`)
- [ ] Development server runs (`pnpm dev`)

**Codebase Access**:
- [ ] Git access to repository
- [ ] IDE configured (VS Code recommended)
- [ ] TypeScript enabled in IDE
- [ ] ESLint configured

**Knowledge Required**:
- [ ] Familiar with TypeScript
- [ ] Familiar with React
- [ ] Familiar with Zustand (basic knowledge)
- [ ] Familiar with IndexedDB (basic knowledge)

### First Steps

**Step 1: Read This Guide** (60 minutes)
- ✅ You're here! Welcome aboard! 🎉

**Step 2: Read Epic Breakdown** (30 minutes)
```bash
# For Epic CC-1:
cat _bmad-output/research/platform-unification-2026-01-02/epic-cc-1-conversation-consolidation-breakdown.md

# For Epic CP-1:
cat _bmad-output/research/platform-unification-2026-01-02/epic-cp-1-project-consolidation-breakdown.md
```

**Step 3: Read Reference Implementation** (30 minutes)
```bash
# See how Cornerstones 1 & 2 were successfully refactored
cat _bmad-output/research/platform-unification-2026-01-02/adrs/ADR-002-agent-vault-architecture.md
```

**Step 4: Read Implementation Guide** (30 minutes)
```bash
# Step-by-step guide for implementing epic stories
# Open CLAUDE.md and search for "Epic Implementation Guide"
```

**Step 5: Set Up Development Environment** (15 minutes)
```bash
# Clone repository (if not already done)
git clone <repository-url>
cd project-alpha-master

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Verify server starts on http://localhost:3000
```

**Step 6: Create Feature Branch** (5 minutes)
```bash
# For Epic CC-1, Story CC-1.1:
git checkout -b feature/cc-1-1-conversation-metadata-slice

# For Epic CP-1, Story CP-1.1:
git checkout -b feature/cp-1-1-project-crud-slice
```

---

## 6. Common Workflows

### Workflow 1: Implementing a Slice Story

**Example**: Story CC-1.1 (Create Conversation Metadata Slice)

**Time**: 6-8 hours

**Steps**:
1. **Read Story** (15 min) - Open epic breakdown, find story, read acceptance criteria
2. **Read Reference** (30 min) - Study ADR-002 and existing slice implementations
3. **Create Slice** (2-4 hours) - Implement slice file (≤120 lines)
4. **Write Tests** (2-3 hours) - Write unit tests (≥80% coverage)
5. **Run Tests** (5 min) - Verify all tests pass
6. **Verify Criteria** (30 min) - Check all acceptance criteria met
7. **Create PR** (15 min) - Commit, push, create PR, request review

**Detailed Guide**: See `CLAUDE.md` → "Epic Implementation Guide"

---

### Workflow 2: Implementing a Data Migration Story

**Example**: Story CC-1.8 (Data Migration Script)

**Time**: 8-10 hours

**Steps**:
1. **Read Story** (15 min) - Understand data transformation requirements
2. **Design Migration** (1 hour) - Plan backup, transform, verify, rollback
3. **Implement Migration** (4-6 hours) - Write migration script
4. **Write Tests** (2-3 hours) - Test backup, transform, verify, rollback
5. **Manual Test** (1 hour) - Test with real data copy
6. **Create PR** (15 min) - Request thorough review

**Critical**: Always test with production data copy before running in production!

---

### Workflow 3: Implementing Component Migration

**Example**: Story CC-1.9 (Study Workspace Migration)

**Time**: 4 hours

**Steps**:
1. **Read Story** (15 min) - Identify components to migrate
2. **Update Imports** (30 min) - Change to use new store
3. **Test Component** (1 hour) - Manual testing in workspace
4. **Write Tests** (1 hour) - Component tests (2 tests per component)
5. **Verify No Regressions** (1 hour) - Test all workspace features
6. **Create PR** (15 min) - Request review

**Safety**: Migrate in batches (lowest risk first), test thoroughly after each batch

---

## 7. Troubleshooting

### Common Issues

#### Issue 1: "Maximum update depth exceeded" Error

**Symptom**: Browser console shows infinite re-render loop

**Cause**: Destructuring Zustand store hook creates new object references

**Solution**: Use individual selectors instead of destructuring

```typescript
// ❌ WRONG (causes infinite loop)
const { conversations, addConversation } = useConversationStore();

// ✅ CORRECT (stable references)
const conversations = useConversationStore(s => s.conversations)
const addConversation = useConversationStore(s => s.addConversation)
```

**Documentation**: `AGENTS.md` → "Agent Interaction Patterns & Store Access" → "Infinite Loop Bug Fix"

---

#### Issue 2: Circular Dependency Error

**Symptom**: TypeScript error: "Cannot find module" or "Import cycle detected"

**Cause**: Direct import between slice files

**Solution**: Use `get()` for cross-slice communication

```typescript
// ❌ WRONG (circular dependency)
import { updateConversation } from './conversation-metadata-slice';

export const createThreadManagementSlice = (set, get) => ({
  createThread: (conversationId) => {
    updateConversation(conversationId, { hasThreads: true }); // Circular!
  }
});

// ✅ CORRECT (use get())
export const createThreadManagementSlice = (set, get) => ({
  createThread: (conversationId) => {
    get().updateConversationMetadata(conversationId, { hasThreads: true });
  }
});
```

**Documentation**: `CLAUDE.md` → "Epic Implementation Guide" → "Common Pitfalls"

---

#### Issue 3: Data Loss During Migration

**Symptom**: Data missing after migration script runs

**Cause**: No backup before migration, or migration script fails midway

**Solution**: Always create timestamped backup before migration

```typescript
// ✅ CORRECT (safe migration with backup)
export async function migrateToNewStore() {
  // Step 1: Create timestamped backup
  const backupId = 'backup-' + Date.now();
  await backupIndexedDB(backupId);

  try {
    // Step 2: Migrate data
    const data = await getOldData();
    const transformed = transformData(data);
    await writeNewData(transformed);

    // Step 3: Verify integrity
    const verification = await verifyMigration(transformed);
    if (!verification.success) {
      throw new Error(verification.error);
    }

    // Step 4: Delete old data (only after successful migration)
    await deleteOldData();
  } catch (error) {
    // Rollback: Restore from backup
    await restoreBackup(backupId);
    throw error;
  }
}
```

**Documentation**: `CLAUDE.md` → "Epic Implementation Guide" → "Common Pitfalls"

---

#### Issue 4: Tests Failing After Slice Creation

**Symptom**: Unit tests fail with "Cannot read property 'X' of undefined"

**Cause**: Slice not properly integrated into unified store, or test setup incorrect

**Solution**: Verify slice integration and test setup

```typescript
// ✅ CORRECT (slice integration)
export const useConversationStore = create<ConversationStore>()(
  persist(
    (...a) => ({
      ...createConversationMetadataSlice(...a),  // ← Slice must be spread here
      ...createThreadManagementSlice(...a),
      // ... other slices
    }),
    {
      name: 'conversation-state',
      storage: createDexieStorage('conversationState'),
    }
  )
);

// ✅ CORRECT (test setup)
describe('conversation-metadata-slice', () => {
  beforeEach(() => {
    // Reset store before each test
    useConversationStore.getState().resetState();
  });

  it('should create conversation', () => {
    const store = useConversationStore.getState();
    const conversationId = store.createConversation('ide', null, 'agent-1');
    expect(conversationId).toBeDefined();
  });
});
```

---

### Getting Help

**If you encounter issues not covered here**:

1. **Check Documentation**:
   - Epic breakdown: `epic-cc-1-conversation-consolidation-breakdown.md` or `epic-cp-1-project-consolidation-breakdown.md`
   - Gap documentation: `cornerstone-*-detailed-gap-documentation.md`
   - ADR-002: Reference implementation for successful refactoring

2. **Check Code Examples**:
   - Existing slices in `src/infrastructure/persistence/stores/providers/`
   - Test files in `src/infrastructure/persistence/stores/conversation/__tests__/`

3. **Ask Team**:
   - Create GitHub issue with detailed description
   - Include error messages, stack traces, and reproduction steps
   - Tag relevant team members

---

## 8. Resources & References

### Documentation

**Platform Unification Research** (`_bmad-output/research/platform-unification-2026-01-02/`):
- **Analyses**: 5 Cornerstone analyses (CS1-CS5)
- **ADRs**: 4 Architecture Decision Records
- **Gap Docs**: 2 Detailed gap documentation (CS3, CS4)
- **Epics**: 2 Epic user story breakdowns (CC-1, CP-1)
- **Roadmap**: 1 Comprehensive implementation roadmap
- **Summaries**: 5 Iteration completion summaries

**Project Documentation**:
- `AGENTS.md` - Architecture patterns + epic overviews + refactoring patterns
- `CLAUDE.md` - Implementation guidance + step-by-step workflows

### Key Files

**Reference Implementations**:
- `src/infrastructure/persistence/stores/providers/provider-store-core.ts` (97 lines) - Good slice example
- `src/infrastructure/persistence/stores/providers/index.ts` (305 lines) - Unified store example

**God Stores to Refactor** (Epic CC-1):
- `src/infrastructure/persistence/stores/conversation/conversation-store.ts` (626 lines)
- `src/infrastructure/persistence/stores/conversation/conversation-threads-store.ts` (726 lines)

**God Stores to Refactor** (Epic CP-1):
- `src/lib/workspace/project-store.ts` (450 lines)
- `src/lib/filesystem/file-snapshot-store.ts` (509 lines)

### External Documentation

**Zustand**:
- Official Docs: https://zustand.docs.pmnd.rs/
- GitHub: https://github.com/pmndrs/zustand
- v5 Migration Guide: https://github.com/pmndrs/zustand/blob/main/docs/migrations/migrating-to-v5.md

**Dexie (IndexedDB)**:
- Official Docs: https://dexie.org/
- GitHub: https://github.com/dfahlander/Dexie.js

**TanStack React Router**:
- Docs: https://tanstack.com/router
- GitHub: https://github.com/TanStack/router

---

## Next Steps

After completing this guide, you should be ready to:

1. **Pick an Epic**: Epic CC-1 (conversations) or Epic CP-1 (projects)
2. **Pick a Story**: Start with first story (CC-1.1 or CP-1.1)
3. **Follow Implementation Guide**: See `CLAUDE.md` → "Epic Implementation Guide"
4. **Ask Questions**: If unsure, ask team lead or create GitHub issue

**Good Luck! 🚀**

Remember:
- ✅ **Test first** (TDD approach)
- ✅ **Small slices** (≤120 lines each)
- ✅ **No circular deps** (use `get()` for cross-slice calls)
- ✅ **Backup data** (before any migration)
- ✅ **Zero breaking changes** (facade exports preserve compatibility)

---

**Generated**: Developer Onboarding Guide (Iteration 18)
**Next**: Iteration 19 - Document Phase 1 Lessons Learned

**END OF GUIDE**
