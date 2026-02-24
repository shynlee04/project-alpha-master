# Next Epic Analysis

**Report ID:** `next-epic-analysis-2026-01-18`
**Created:** 2026-01-18
**Author:** analyst-ext
**Timebox:** 10 minutes

---

## Current State

| Epic/Story | Status | Progress | Notes |
|------------|--------|----------|-------|
| **CC-STORAGE-GATEWAY** | COMPLETE | 100% | Storage Gateway Foundation |
| **CC-DF-01** | PARTIAL | 66% (2/3 files) | Note File Format Migration - missing test |
| **CC-DF-02** | PENDING | 0% | DexieDB → FSA Sync Layer |
| **CC-DF-03** | PENDING | 0% | Agent Tool Integration |
| **CC-DF-04** | COMPLETE | 100% | User Experience Updates |
| **CC-DF-05** | PENDING | 0% | Migration Verification Tests |
| **CC-DF-06** | PENDING | 0% | Rollback Procedure |

**MVP Scope:** Notes + IDE workspaces only
**Deferred:** Knowledge workspace (RAG), Study workspace (flashcards) - archived to post-mvp

---

## Recommended Next Epic

**Epic ID:** `CC-IDE-FSA`
**Title:** IDE Workspace FSA Migration
**Goal:** Apply FSA storage to IDE workspace, mirroring the Notes workspace migration pattern

### Why This Epic Next?

| Factor | Analysis |
|--------|----------|
| **Dependency Chain** | CC-STORAGE-GATEWAY (complete) → CC-DESKTOP-FSA (in progress) → CC-IDE-FSA (next) |
| **Pattern Reuse** | IDE migration will reuse: StorageGateway, Note File Format, Sync Layer, Agent Tools |
| **MVP Completion** | Notes + IDE = full MVP scope. Completing IDE means MVP feature complete |
| **Architecture Consistency** | Both workspaces should use same FSA storage pattern |
| **User Value** | IDE with FSA enables agentic coding with true file system access |

---

## Proposed Stories

### CC-IDE-01: IDE File Gateway Implementation

| Attribute | Value |
|-----------|-------|
| **Story ID** | CC-IDE-01 |
| **Title** | IDE File Gateway Implementation |
| **Priority** | P0 |
| **Effort** | 4 hours |
| **Status** | TODO |

**Description:**
Create a dedicated file gateway for IDE workspace files, reusing the StorageGateway abstraction.

**Acceptance Criteria:**
- [ ] `src/lib/ide/gateways/ide-file-gateway.ts` created
- [ ] Implements `read()`, `write()`, `delete()`, `list()` methods
- [ ] Uses `FSAGateway` for desktop, `IDBGateway` for mobile
- [ ] Supports `.viagent/` metadata folder exclusion
- [ ] Unit tests pass

**Dependencies:**
- CC-DF-02 (Sync Layer - for file watching pattern)

---

### CC-IDE-02: File Tree Integration

| Attribute | Value |
|-----------|-------|
| **Story ID** | CC-IDE-02 |
| **Title** | IDE File Tree Integration |
| **Priority** | P0 |
| **Effort** | 6 hours |
| **Status** | TODO |

**Description:**
Integrate FSA storage with the IDE file tree component, replacing DexieDB file references.

**Acceptance Criteria:**
- [ ] File tree reads from FSA via `ide-file-gateway`
- [ ] File tree updates reflect in FSA immediately
- [ ] File watching triggers tree refresh
- [ ] Supports nested folder creation/deletion
- [ ] Excludes `node_modules`, `.git`, `.viagent/` per ADR-033

**Dependencies:**
- CC-IDE-01 (File Gateway)

---

### CC-IDE-03: Monaco Editor File Operations

| Attribute | Value |
|-----------|-------|
| **Story ID** | CC-IDE-03 |
| **Title** | Monaco Editor File Operations |
| **Priority** | P0 |
| **Effort** | 4 hours |
| **Status** | TODO |

**Description:**
Update Monaco Editor to use FSA-based file operations for opening, saving, and auto-save.

**Acceptance Criteria:**
- [ ] Open file → reads from FSA via gateway
- [ ] Save file → writes to FSA via gateway
- [ ] Auto-save debounced to 500ms
- [ ] Unsaved changes indicator
- [ ] External file change detection with reload prompt

**Dependencies:**
- CC-IDE-02 (File Tree Integration)

---

### CC-IDE-04: Terminal File System Access

| Attribute | Value |
|-----------|-------|
| **Story ID** | CC-IDE-04 |
| **Title** | Terminal File System Access |
| **Priority** | P0 |
| **Effort** | 3 hours |
| **Status** | TODO |

**Description:**
Enable terminal commands to interact with FSA files, enabling agentic coding workflows.

**Acceptance Criteria:**
- [ ] Terminal can `cd` into FSA project folder
- [ ] `ls`, `cat`, `grep` work on FSA files
- [ ] File editing via terminal (nano, vim)
- [ ] Git operations work on FSA folder
- [ ] Integration tests verify terminal-FSA connectivity

**Dependencies:**
- CC-IDE-02 (File Tree Integration)

---

### CC-IDE-05: WebContainer File Binding

| Attribute | Value |
|-----------|-------|
| **Story ID** | CC-IDE-05 |
| **Title** | WebContainer File Binding |
| **Priority** | P1 |
| **Effort** | 4 hours |
| **Status** | TODO |

**Description:**
Bind WebContainer file system to FSA storage for true agentic development.

**Acceptance Criteria:**
- [ ] WebContainer mounts FSA folder
- [ ] File changes sync bidirectionally (FSA ↔ WebContainer)
- [ ] `npm install`, `npm run dev` work in WebContainer
- [ ] Preview server accessible via WebContainer
- [ ] Hot reload via WebContainer HMR

**Dependencies:**
- CC-IDE-03 (Monaco Editor), CC-IDE-04 (Terminal)

---

### CC-IDE-06: IDE UX Updates

| Attribute | Value |
|-----------|-------|
| **Story ID** | CC-IDE-06 |
| **Title** | IDE UX Updates |
| **Priority** | P1 |
| **Effort** | 3 hours |
| **Status** | TODO |

**Description:**
Update IDE workspace UI to reflect FSA storage and add platform indicators.

**Acceptance Criteria:**
- [ ] Storage indicator (FSA/BrowserDB) visible in IDE header
- [ ] Platform guard prevents mobile IDE access
- [ ] File operation feedback (toast notifications)
- [ ] 8-bit design compliance
- [ ] Accessibility verified (WCAG 2.1)

**Dependencies:**
- None (can run in parallel)

---

### CC-IDE-07: IDE FSA Migration Tests

| Attribute | Value |
|-----------|-------|
| **Story ID** | CC-IDE-07 |
| **Title** | IDE FSA Migration Tests |
| **Priority** | P1 |
| **Effort** | 3 hours |
| **Status** | TODO |

**Description:**
Comprehensive test coverage for IDE FSA functionality.

**Acceptance Criteria:**
- [ ] E2E test for file create/read/update/delete
- [ ] E2E test for WebContainer integration
- [ ] Test terminal-FSA connectivity
- [ ] Test mobile guard behavior
- [ ] All tests pass with `pnpm vitest run`

**Dependencies:**
- CC-IDE-01 through CC-IDE-06

---

### CC-IDE-08: IDE Rollback Procedure

| Attribute | Value |
|-----------|-------|
| **Story ID** | CC-IDE-08 |
| **Title** | IDE Rollback Procedure |
| **Priority** | P2 |
| **Effort** | 2 hours |
| **Status** | TODO |

**Description:**
Document and test rollback procedure for IDE FSA migration.

**Acceptance Criteria:**
- [ ] Rollback document updated for IDE
- [ ] FSA files can be re-imported if needed
- [ ] Rollback tested in staging
- [ ] Time documented (< 15 minutes)

**Dependencies:**
- All previous stories

---

## Story Summary Table

| Story | Title | Priority | Effort | Dependencies |
|-------|-------|----------|--------|--------------|
| CC-IDE-01 | IDE File Gateway Implementation | P0 | 4h | CC-DF-02 |
| CC-IDE-02 | File Tree Integration | P0 | 6h | CC-IDE-01 |
| CC-IDE-03 | Monaco Editor File Operations | P0 | 4h | CC-IDE-02 |
| CC-IDE-04 | Terminal File System Access | P0 | 3h | CC-IDE-02 |
| CC-IDE-05 | WebContainer File Binding | P1 | 4h | CC-IDE-03, CC-IDE-04 |
| CC-IDE-06 | IDE UX Updates | P1 | 3h | None |
| CC-IDE-07 | IDE FSA Migration Tests | P1 | 3h | All above |
| CC-IDE-08 | IDE Rollback Procedure | P2 | 2h | All above |

**Total Stories:** 8
**Total Effort:** 29 hours (6-8 hours realistic with parallelization)

---

## Exit Criteria

When CC-IDE-FSA epic completes:

- [ ] All 8 stories complete
- [ ] IDE workspace uses FSA storage on desktop
- [ ] Mobile users redirected from IDE (route guard)
- [ ] WebContainer can mount FSA project folder
- [ ] Terminal commands work on FSA files
- [ ] Agent tools can read/write IDE files
- [ ] `pnpm tsc --noEmit` passes with 0 errors
- [ ] `pnpm vitest run` passes
- [ ] MVP (Notes + IDE) feature complete

---

## Dependencies

### External Dependencies

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| CC-STORAGE-GATEWAY | Blocks | ✅ Complete | StorageGateway abstraction |
| CC-DESKTOP-FSA | Blocks | In Progress | Need sync layer from CC-DF-02 |
| Chrome 129+ FileSystemObserver | Technical | Available | For file watching |

### Internal Dependencies (Within Epic)

```
CC-IDE-01 → CC-IDE-02 → CC-IDE-03, CC-IDE-04
                         ↓
                   CC-IDE-05 (WebContainer)
                         ↓
                   CC-IDE-06 (parallel)
                         ↓
                   CC-IDE-07 (Tests)
                         ↓
                   CC-IDE-08 (Rollback)
```

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| WebContainer-FSA binding issues | Medium | High | Use WebContainer mount API, fallback to in-memory |
| Large project file watching | Medium | Medium | Implement depth limits from ADR-033 |
| Mobile IDE guard bypass | Low | High | Server-side validation, thorough testing |
| Performance regression | Medium | Medium | Profile before/after, optimize I/O |

---

## Alternatives Considered

### Option 1: Complete CC-DESKTOP-FSA First (Recommended)

**Pros:**
- Finishes current epic before starting new one
- Tests and patterns established before IDE migration
- Clear dependency chain

**Cons:**
- Delays IDE workspace completion

### Option 2: Parallel IDE Development

**Pros:**
- Faster overall completion

**Cons:**
- Team bandwidth issues
- Potential for duplicate work
- Harder to validate patterns

**Decision:** Recommend Option 1 - Complete CC-DESKTOP-FSA first, then start CC-IDE-FSA

---

## References

- Consolidated Context: `_bmad-ext/.correct-course/consolidated-context-2026-01-18.md`
- CC-DESKTOP-FSA Epic: `_bmad-ext/.correct-course/epics/CC-DESKTOP-FSA-2026-01-18.md`
- ADR-033: `_bmad-output/planning-artifacts/adr/ADR-033-correct-course-architectural-remediation-2026-01-16.md`
- UX Specification: `_bmad-output/planning-artifacts/ux-specification.md`
- Epics Working Copy: `_bmad-output/planning-artifacts/epics.md`

---

**Report Status:** DRAFT
**Next Review:** After CC-DESKTOP-FSA epic completes
