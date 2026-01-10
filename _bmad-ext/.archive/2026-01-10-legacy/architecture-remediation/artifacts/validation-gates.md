# Validation Gates

**Module**: architecture-remediation
**Last Updated**: 2026-01-03
**Purpose**: Acceptance criteria checklists for all epics and stories

## Gate Categories

### Pre-Validation Gates
**When**: Before starting work
**Purpose**: Ensure prerequisites met, minimize rework

### Completion Gates
**When**: Before marking story as DONE
**Purpose**: Verify all acceptance criteria met

### Post-Validation Gates
**When**: After marking story as DONE
**Purpose**: Ensure no regression, documentation updated

---

## Phase 0: Foundation Stabilization

### Story TS-001: Fix TypeScript Errors

#### Pre-Validation Checklist
- [ ] Error analysis complete (categorized by type and severity)
- [ ] Fix strategy documented (batch size, target errors)
- [ ] Validation plan defined (TypeScript check, test suite)
- [ ] Rollback plan established (git branch, revert strategy)

#### Completion Checklist
- [ ] TypeScript errors reduced from 1,172 to <100
- [ ] All P0 missing imports fixed (TS2304, TS2305)
- [ ] All P0 type mismatches fixed (TS2322, TS2345)
- [ ] Zero new errors introduced
- [ ] `pnpm tsc --noEmit` passes (zero errors)
- [ ] `pnpm test` passes (100% pass rate)
- [ ] Error analysis report created (`_bmad-output/ts-analysis/`)
- [ ] Fix validation report created (`_bmad-output/ts-validation/`)

#### Post-Validation Checklist
- [ ] CLAUDE.md updated (TS error count)
- [ ] Epic tracking updated (TS-001 → DONE)
- [ ] Health score recalculated (should improve by +0.5)
- [ ] No regression bugs reported
- [ ] Team notified of completion

---

### Story DB-001: Safe IndexedDB Operations

#### Pre-Validation Checklist
- [ ] IndexedDB usage audit complete (all write operations identified)
- [ ] Quota detection strategy documented
- [ ] Error handling patterns defined (graceful degradation)
- [ ] Test scenarios defined (quota exceeded, upgrade request)

#### Completion Checklist
- [ ] Quota detection implemented (proactive monitoring)
- [ ] Quota upgrade request flow implemented
- [ ] Graceful degradation implemented (user notification, recovery)
- [ ] All IndexedDB writes handle quota errors
- [ ] Quota simulation tests passing (5+ scenarios)
- [ ] Error messages user-friendly (clear, actionable)
- [ ] No data loss scenarios in tests
- [ ] Performance impact acceptable (<5% overhead)

#### Post-Validation Checklist
- [ ] CLAUDE.md updated (IndexedDB best practices)
- [ ] Epic tracking updated (DB-001 → DONE)
- [ ] Health score recalculated (should improve by +0.3)
- [ ] No data loss incidents reported
- [ ] Documentation created (user guide for quota management)

---

### Story UI-001: Extract AgentConfigDialog Hooks

#### Pre-Validation Checklist
- [ ] Component complexity analysis complete
- [ ] Hook extraction opportunities identified
- [ ] Sub-component composition planned
- [ ] API stability verified (no breaking changes)

#### Completion Checklist
- [ ] Main component ≤300 lines (from 1,089 lines)
- [ ] All hooks ≤120 lines
- [ ] All sub-components ≤200 lines
- [ ] Zero breaking changes (props interface unchanged)
- [ ] Zero TypeScript errors
- [ ] Zero test failures (100% pass rate)
- [ ] Test coverage ≥80%
- [ ] Functionality preserved (visual regression check passed)

#### Post-Validation Checklist
- [ ] CLAUDE.md updated (component size limits)
- [ ] Epic tracking updated (UI-001 → DONE)
- [ ] Health score recalculated (should improve by +0.2)
- [ ] No user-facing regressions reported
- [ ] Component documentation updated

---

## Phase 1: Store Refactoring

### Epic CC-1: Conversation Consolidation

#### Story CC-1.1: Create conversation-metadata-slice

##### Pre-Validation Checklist
- [ ] Slice boundaries defined (metadata operations only)
- [ ] State interface documented
- [ ] Action methods specified
- [ ] Test cases planned (10 tests minimum)

##### Completion Checklist
- [ ] Slice file created (`conversation-metadata-slice.ts`)
- [ ] File ≤120 lines (excluding imports/comments)
- [ ] State interface defined with all required properties
- [ ] Action methods implemented (create, update, delete, get)
- [ ] `createConversation` auto-generates UUID
- [ ] `updateConversationMetadata` updates `updatedAt` timestamp
- [ ] `deleteConversation` soft-deletes (sets status to 'deleted')
- [ ] All getters return typed values (no `any`)
- [ ] 10 unit tests passing (100% pass rate)
- [ ] Test coverage ≥80%

##### Post-Validation Checklist
- [ ] No circular imports detected
- [ ] Slice integrates with unified store
- [ ] Epic tracking updated (CC-1.1 → DONE)
- [ ] Health score recalculated

---

#### Story CC-1.8: Data Migration

##### Pre-Validation Checklist
- [ ] Old store schemas documented
- [ ] New store schemas documented
- [ ] Transformation rules defined
- [ ] Backup strategy established
- [ ] Rollback plan defined

##### Completion Checklist
- [ ] Timestamped backup created
- [ ] Old data read successfully
- [ ] Data transformed to new schema
- [ ] New data written successfully
- [ ] Data integrity verified (zero data loss)
- [ ] Rollback tested (works correctly)
- [ ] Migration completes in reasonable time (<30 seconds)
- [ ] User notification implemented (migration in progress)

##### Post-Validation Checklist
- [ ] Old stores deleted (after verification)
- [ ] Migration report created (`_bmad-output/migration-report-cc-1.8.md`)
- [ ] Epic tracking updated (CC-1.8 → DONE)
- [ ] No data loss incidents reported

---

## Phase 2: Infrastructure Hardening

### Story IH-001: IndexedDB Quota Management

#### Pre-Validation Checklist
- [ ] Quota monitoring strategy documented
- [ ] Upgrade request flow designed
- [ ] User notification UX planned
- [ ] Test scenarios defined (quota exceeded, upgrade success/failure)

#### Completion Checklist
- [ ] Proactive quota monitoring implemented
- [ ] Quota upgrade request flow implemented
- [ ] Graceful degradation implemented (user notification, recovery actions)
- [ ] User notification UI created (clear, actionable)
- [ ] Recovery actions implemented (clear old data, upgrade storage)
- [ ] Integration tests passing (5+ quota scenarios)
- [ ] Performance impact acceptable (<5% overhead)
- [ ] Error messages user-friendly

#### Post-Validation Checklist
- [ ] CLAUDE.md updated (quota management best practices)
- [ ] Epic tracking updated (IH-001 → DONE)
- [ ] No data loss incidents reported
- [ ] User feedback collected (optional)

---

### Story IH-002: Error Boundary Coverage

#### Pre-Validation Checklist
- [ ] Error boundary audit complete (critical paths identified)
- [ ] Error state UI designed
- [ ] Error logging configured (Sentry)
- [ ] Test scenarios defined (error types, recovery paths)

#### Completion Checklist
- [ ] Error boundaries added to all workspace routes
- [ ] Error boundaries added to all agent components
- [ ] Error state UI implemented (clear, helpful)
- [ ] Error logging configured (Sentry integration)
- [ ] Error scenario tests passing (10+ scenarios)
- [ ] Recovery actions tested (reload, reset, contact support)
- [ ] User-facing error messages (clear, actionable)

#### Post-Validation Checklist
- [ ] CLAUDE.md updated (error boundary best practices)
- [ ] Epic tracking updated (IH-002 → DONE)
- [ ] Error monitoring dashboard active
- [ ] No unhandled errors reported

---

### Story IH-003: Silent Failure Elimination

#### Pre-Validation Checklist
- [ ] Silent failure audit complete (23 instances categorized)
- [ ] Severity assigned (P0/P1/P2)
- [ ] Fix strategy documented (explicit error handling)
- [ ] Test scenarios defined

#### Completion Checklist
- [ ] All P0 silent failures fixed (8 instances)
- [ ] All P1 silent failures fixed (10 instances)
- [ ] All P2 silent failures fixed (5 instances)
- [ ] Explicit error handling implemented (user-facing messages)
- [ ] Recovery actions implemented (retry, reset, contact support)
- [ ] Error handling tests passing (23+ scenarios)
- [ ] Zero `console.error + return null` patterns remaining

#### Post-Validation Checklist
- [ ] CLAUDE.md updated (error handling best practices)
- [ ] Epic tracking updated (IH-003 → DONE)
- [ ] No silent failures reported
- [ ] User feedback improved (clearer error messages)

---

## Phase 3: Architecture Transformation

### Story AT-001: Four-Layer Architecture

#### Pre-Validation Checklist
- [ ] Four-layer architecture defined (Core, Domain, Infrastructure, Presentation)
- [ ] Layer boundaries documented
- [ ] Dependency rules defined (unidirectional)
- [ ] Migration strategy planned (3 pilot modules)

#### Completion Checklist
- [ ] Four-layer architecture documented (ADR created)
- [ ] Layer boundaries enforced (dependency linting)
- [ ] Unidirectional dependencies verified (zero cycles)
- [ ] Agent module migrated to new architecture
- [ ] RAG module migrated to new architecture
- [ ] Knowledge module migrated to new architecture
- [ ] Integration tests passing (cross-layer communication)
- [ ] Documentation updated (architecture diagrams)

#### Post-Validation Checklist
- [ ] CLAUDE.md updated (four-layer architecture)
- [ ] Epic tracking updated (AT-001 → DONE)
- [ ] Team training completed (architecture overview)
- [ ] No circular dependencies reported

---

### Story AT-002: Domain Service Extraction

#### Pre-Validation Checklist
- [ ] Business logic audit complete
- [ ] Service interfaces defined
- [ ] Dependency injection pattern planned
- [ ] Test strategy documented

#### Completion Checklist
- [ ] Agent-workspace service extracted (pure functions)
- [ ] RAG-processing service extracted (pure functions)
- [ ] Knowledge-graph service extracted (pure functions)
- [ ] Service interfaces defined (clear contracts)
- [ ] Dependency injection implemented
- [ ] Service tests passing (independent, isolated)
- [ ] Zero business logic in components or stores

#### Post-Validation Checklist
- [ ] CLAUDE.md updated (domain service pattern)
- [ ] Epic tracking updated (AT-002 → DONE)
- [ ] Service documentation created
- [ ] Team training completed (domain services)

---

## Universal Gates (Apply to All Stories)

### Pre-Validation (Before Starting)
- [ ] Story acceptance criteria understood
- [ ] Story points estimated accurately
- [ ] Dependencies identified and resolved
- [ ] Blockers cleared
- [ ] Git branch created for story
- [ ] Relevant documentation read (CLAUDE.md, epic breakdown)

### Completion (Before Marking DONE)
- [ ] All acceptance criteria met (100%)
- [ ] Zero TypeScript errors (`pnpm tsc --noEmit`)
- [ ] Zero lint warnings (`pnpm lint`)
- [ ] All tests passing (`pnpm test`, 100% pass rate)
- [ ] Test coverage ≥80% (or specific threshold for story)
- [ ] Code review approved (@bmad-bmm-dev review)
- [ ] No breaking changes (backwards compatible)
- [ ] Documentation updated (if story 3, 7, 11, etc.)

### Post-Validation (After Marking DONE)
- [ ] Epic tracking updated (story → DONE)
- [ ] Health score recalculated (should improve)
- [ ] CLAUDE.md updated (if applicable)
- [ ] Completion report created (if epic completion)
- [ ] Team notified of completion
- [ ] Next story identified and started
- [ ] No regression bugs reported (24-hour monitoring)

---

## Gate Enforcement

### Automated Checks
```bash
# Pre-validation (before starting work)
pnpm check-story-prerequisites --story=TS-001

# Completion validation (before marking DONE)
pnpm validate-story-completion --story=TS-001

# Post-validation (after marking DONE)
pnpm validate-no-regression --story=TS-001
```

### Manual Review
- [ ] Code review approved by @bmad-bmm-dev
- [ ] Architect review (for architecture changes)
- [ ] PM approval (for priority changes)

### Gate Failure Actions
1. **Pre-Validation Failure**: Do not start work, resolve blockers first
2. **Completion Failure**: Fix issues, re-validate, cannot mark DONE
3. **Post-Validation Failure**: Rollback if necessary, investigate regression

---

## Usage

### For Developers (@bmad-bmm-dev)
1. Read story acceptance criteria
2. Complete pre-validation checklist
3. Implement story
4. Complete completion checklist
5. Request code review
6. Mark as DONE after approval
7. Complete post-validation checklist

### For PMs (@bmad-bmm-pm)
1. Review pre-validation checklists
2. Approve story start
3. Monitor progress
4. Review completion checklists
5. Approve story completion
6. Update epic tracking

### For Architects (@bmad-bmm-architect)
1. Review architecture changes
2. Approve layer boundaries
3. Verify dependency rules
4. Sign off on epic completion

---

**Gate Maintainer**: @bmad-bmm-tea
**Last Updated**: 2026-01-03
**Status**: ACTIVE - ENFORCING QUALITY STANDARDS
