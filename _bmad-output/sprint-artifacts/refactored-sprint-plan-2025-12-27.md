---
date: 2025-12-27
time: 17:15:00
phase: Sprint Planning
team: Team-A
agent_mode: bmad-bmm-pm
---

# Refactored Sprint Plan: Course Correction Implementation

**Date**: 2025-12-27  
**Sprint Duration**: 3 weeks (December 27, 2025 - January 17, 2026)  
**Platform**: Platform A (Antigravity) - Single Workstream  
**Related Artifacts**:
- [`technical-roadmap-course-correction-2025-12-27.md`](../technical-roadmap-course-correction-2025-12-27.md)
- [`sprint-status-consolidated.yaml`](sprint-status-consolidated.yaml)

---

## Executive Summary

This refactored sprint plan aligns with the technical roadmap's 3-week timeline to resolve P0 blocking issues, complete MVP E2E verification, implement Epic 29 (Agentic Execution Loop), and re-verify 12 stories marked incorrectly as DONE.

**Key Changes from Previous Plan**:
1. **P0 Fixes Prioritized**: Immediate unblocking tasks (agentic loop, path validation) moved to Week 1, Day 1-2
2. **Epic 29 Scheduled**: Full agentic execution loop implementation in Week 2 (4 stories, 10 points)
3. **E2E Validation Week**: Dedicated Week 3 for re-verifying 12 stories with mandatory browser testing
4. **State Management Refactoring**: Deferred to Week 2, Day 1-2 (post-MVP) to avoid MVP-3 interference

**Current Status**:
- MVP-1: Agent Configuration & Persistence - IN_PROGRESS
- MVP-2: Chat Interface with Streaming - IN_PROGRESS
- MVP-3: Tool Execution - File Operations - ready-for-e2e
- MVP-4-7: Blocked (dependency chain)

---

## Week 1: Immediate Unblocking & MVP Completion

**Duration**: December 27 - January 2, 2026 (7 days)  
**Primary Focus**: Unblock MVP-2/3/4 E2E verification with P0 fixes

### Day 1-2 (December 27-28): P0 Fixes

| Priority | Task | Story ID | Effort | Owner | Status |
|----------|-------|-----------|---------|--------|--------|
| **P0** | Add `maxIterations(3)` to [`useAgentChatWithTools.ts`](../../src/lib/agent/hooks/use-agent-chat-with-tools.ts) | MVP-2 | 2-4h | Dev | Ready for Dev |
| **P0** | Add path validation to agent tools (read, write, list) | MVP-3 | 2-3h | Dev | Ready for Dev |
| **P2** | Verify TanStack AI and TanStack Router usage patterns | MVP-2 | 1-2h | Architect | Ready for Dev |

**Dependencies**:
- P0 fixes must complete before MVP-2/3 E2E verification can proceed
- Path validation can be done in parallel with MVP-3 development

### Day 3-4 (December 29-30): MVP-2 E2E Verification

| Task | Story ID | Effort | Owner | Status |
|-------|-----------|---------|--------|--------|
| Complete MVP-2 browser E2E verification with screenshot | MVP-2 | 4-6h | Dev | Blocked by P0 fix |
| Test multi-step conversations with streaming | MVP-2 | 2-3h | TEA | Blocked by P0 fix |
| Verify chat history persistence | MVP-2 | 1-2h | TEA | Blocked by P0 fix |

**Acceptance Criteria**:
- Chat panel opens and displays messages
- Messages send to `/api/chat` endpoint
- Responses stream in real-time using SSE
- Rich text formatting for responses
- Code blocks with syntax highlighting
- Error handling for failed requests
- Chat history persists in localStorage
- **MANDATORY**: Browser E2E verification with screenshot

### Day 5-7 (December 31 - January 2): MVP-3 E2E Verification

| Task | Story ID | Effort | Owner | Status |
|-------|-----------|---------|--------|--------|
| Complete MVP-3 browser E2E verification with screenshot | MVP-3 | 4-6h | Dev | Blocked by P0 fix |
| Test file read operations with approval | MVP-3 | 2-3h | TEA | Blocked by P0 fix |
| Test file write operations with diff preview | MVP-3 | 2-3h | TEA | Blocked by P0 fix |
| Verify file tree updates in real-time | MVP-3 | 1-2h | TEA | Blocked by P0 fix |

**Acceptance Criteria**:
- AI can request to read project files
- Approval dialog shows file path and content preview
- AI can request to write/update files
- Approval dialog shows diff preview for writes
- File changes sync to local filesystem
- Monaco editor reflects changes in real-time
- File tree shows updated status
- File read executes in WebContainer
- File write executes in WebContainer
- File list tool for directory traversal
- Approval flow for file operations
- Error handling for file operations
- File lock mechanism for concurrency
- **MANDATORY**: Browser E2E verification with screenshot

### Week 1 Milestones

- [ ] P0 fixes implemented and tested
- [ ] MVP-2 passes E2E verification with screenshot
- [ ] MVP-3 passes E2E verification with screenshot
- [ ] Path validation prevents unauthorized file access
- [ ] Agentic loop configured with `maxIterations(3)`
- [ ] No P0 or P1 issues remaining

---

## Week 2: Post-MVP Refactoring & Epic 29

**Duration**: January 3-9, 2026 (7 days)  
**Primary Focus**: State management refactoring + Epic 29 implementation

### Day 1-2 (January 3-4): State Management Refactoring

| Priority | Task | Story ID | Effort | Owner | Status |
|----------|-------|-----------|---------|--------|--------|
| **P0** | Refactor [`IDELayout.tsx`](../../src/components/layout/IDELayout.tsx) to use `useIDEStore` | STATE-1 | 8-12h | Dev | Ready for Dev |
| **P0** | Add local `fileContentCache` Map for ephemeral file content | STATE-2 | 2-3h | Dev | Ready for Dev |
| **P0** | Update [`useIDEFileHandlers`](../../src/components/layout/hooks/useIDEFileHandlers.ts) to work with Zustand actions | STATE-3 | 2-3h | Dev | Ready for Dev |
| **P0** | Remove duplicate state synchronization code (lines 142-148) | STATE-4 | 1-2h | Dev | Ready for Dev |

**Acceptance Criteria**:
- `IDELayout.tsx` uses `useIDEStore` for all IDE state
- No state duplication in codebase
- Single source of truth for IDE state
- Automatic persistence to IndexedDB
- Consistent state access across all components
- Reduced code complexity
- No linter errors (pnpm build passes)
- No type errors (pnpm tsc --noEmit passes)

### Day 3-7 (January 5-9): Epic 29 - Agentic Execution Loop

**Epic 29 Priority**: P0 - Competitive Parity  
**Total Effort**: 24-32 hours (10 points)  
**Stories**: 4 sequential stories

#### Story 29-1: Agent Loop Strategy Implementation (3 points)

| Task | Effort | Owner | Status |
|-------|---------|--------|--------|
| Add `agentLoopStrategy` to `use-agent-chat-with-tools.ts` | 4-6h | Dev | Ready for Dev |
| Support configurable max iterations (default: 10) | 2-3h | Dev | Ready for Dev |
| Track iteration count in component state | 1-2h | Dev | Ready for Dev |
| Emit iteration events for UI updates | 1-2h | Dev | Ready for Dev |
| Pass iteration context to tool execution | 1-2h | Dev | Ready for Dev |

**Acceptance Criteria**:
- `agentLoopStrategy` configured with `maxIterations(10)`
- Iteration count tracked in component state
- Iteration events emitted for UI updates
- Iteration context passed to tool execution
- Configurable max iterations via agent config
- No linter errors
- No type errors
- Unit tests passing (≥80% coverage)

#### Story 29-2: Iteration UI & State Visualization (3 points)

| Task | Effort | Owner | Status |
|-------|---------|--------|--------|
| Display current iteration count (e.g., "Step 3/10") | 2-3h | UX Designer | Ready for Dev |
| Show collapsible reasoning sections | 2-3h | UX Designer | Ready for Dev |
| Add progress bar to approval overlay | 2-3h | Dev | Ready for Dev |
| Implement pause/resume controls | 3-4h | Dev | Ready for Dev |
| Visual indicator for iteration limits | 1-2h | Dev | Ready for Dev |

**Acceptance Criteria**:
- Current iteration count displayed (e.g., "Step 3/10")
- Collapsible reasoning sections in chat UI
- Progress bar in approval overlay
- Pause/resume controls for agent execution
- Visual indicator for iteration limits (progress bar, step counter)
- No linter errors
- No type errors
- Browser E2E verification with screenshot

#### Story 29-3: Intelligent Termination Strategies (2 points)

| Task | Effort | Owner | Status |
|-------|---------|--------|--------|
| Combine multiple termination strategies | 2-3h | Dev | Ready for Dev |
| Detect stuck states (3+ consecutive failures) | 2-3h | Dev | Ready for Dev |
| Natural completion detection | 1-2h | Dev | Ready for Dev |
| Timeout protection (60s max per loop) | 1-2h | Dev | Ready for Dev |
| Per-agent iteration limits | 1-2h | Dev | Ready for Dev |

**Acceptance Criteria**:
- Multiple termination strategies combined (maxIterations + untilFinishReason + stuckDetection)
- Stuck states detected (3+ consecutive failures)
- Natural completion detection (stop reason)
- Timeout protection (60s max per loop)
- Per-agent iteration limits
- No linter errors
- No type errors
- Unit tests passing (≥80% coverage)

#### Story 29-4: Error Recovery & User Handoff (2 points)

| Task | Effort | Owner | Status |
|-------|---------|--------|--------|
| Automatic retry for transient errors | 2-3h | Dev | Ready for Dev |
| Pause agent on persistent failures | 1-2h | Dev | Ready for Dev |
| Provide clear error messages | 1-2h | Dev | Ready for Dev |
| Suggest corrective actions | 1-2h | Dev | Ready for Dev |
| Allow user to resume or abort | 2-3h | Dev | Ready for Dev |

**Acceptance Criteria**:
- Automatic retry for transient errors (max 3 retries)
- Agent pauses on persistent failures (4+ consecutive errors)
- Clear error messages displayed to user
- Corrective actions suggested (e.g., "Check API credentials", "Verify file permissions")
- User can resume or abort agent execution
- No linter errors
- No type errors
- Browser E2E verification with screenshot

### Week 2 Milestones

- [ ] State management refactoring complete (no duplication)
- [ ] Epic 29-1: Agent Loop Strategy Implementation completed
- [ ] Epic 29-2: Iteration UI & State Visualization completed
- [ ] Epic 29-3: Intelligent Termination Strategies completed
- [ ] Epic 29-4: Error Recovery & User Handoff completed
- [ ] Competitive parity achieved (multi-step execution, iteration visibility, intelligent termination)
- [ ] All Epic 29 stories pass E2E verification with screenshots

---

## Week 3: E2E Validation & Documentation

**Duration**: January 10-16, 2026 (7 days)  
**Primary Focus**: Re-verify 12 stories + documentation updates

### Day 1-4 (January 10-13): Re-verify 12 Stories

**Context**: 12 stories were incorrectly marked DONE without browser E2E verification. These must be re-verified with mandatory browser testing.

| Story ID | Story Name | Effort | Owner | Status |
|----------|-------------|---------|--------|--------|
| [List from investigation] | [12 stories from various epics] | 16-20h | Dev | Ready for E2E |
| Test complete user journey for each story | - | 8-12h | TEA | Ready for E2E |
| Capture screenshot/recording for each story | - | 4-6h | Dev | Ready for E2E |

**Acceptance Criteria**:
- Each story tested in browser with complete user journey
- Screenshot or recording captured for each story
- Integration scenarios verified (not just component existence)
- All acceptance criteria validated
- No regressions introduced
- Documentation reflects actual implementation state

### Day 5-7 (January 14-16): Documentation Updates

| Task | Effort | Owner | Status |
|-------|---------|--------|--------|
| Update [`AGENTS.md`](../../AGENTS.md) with new patterns and best practices | 3-4h | Tech Writer | Ready for Dev |
| Update sprint status with completed stories | 1-2h | PM | Ready for Dev |
| Create Epic 29 retrospective document | 2-3h | PM | Ready for Dev |
| Update technical documentation | 2-3h | Tech Writer | Ready for Dev |

**Acceptance Criteria**:
- AGENTS.md updated with agentic loop patterns
- Sprint status reflects all completed stories
- Epic 29 retrospective created with lessons learned
- Technical documentation reflects current implementation
- No P0 or P1 issues remaining
- All artifacts traceable to source code

### Week 3 Milestones

- [ ] All 12 re-verified stories pass E2E testing
- [ ] Screenshots captured for all 12 stories
- [ ] AGENTS.md updated with new patterns
- [ ] Epic 29 retrospective completed
- [ ] All documentation reflects current implementation
- [ ] No P0 or P1 issues remaining
- [ ] Sprint marked as complete

---

## Resource Allocation

### Team A (Platform A) - Single Workstream

| Role | Week 1 | Week 2 | Week 3 |
|------|---------|---------|---------|
| **PM** (bmad-bmm-pm) | Sprint planning, P0 prioritization, Epic 29 breakdown | Epic 29 tracking, retrospective preparation | Sprint closure, retrospective, documentation |
| **Architect** (bmad-bmm-architect) | P0 technical specifications, Epic 29 design | Epic 29 technical specs, state refactoring review | Documentation review |
| **Dev** (bmad-bmm-dev) | P0 fixes (agentic loop, path validation), MVP-2/3 E2E verification | State refactoring, Epic 29 implementation (4 stories) | 12 stories re-verification |
| **TEA** (bmad-bmm-tea) | MVP-2/3 E2E testing | Epic 29 testing | 12 stories re-verification testing |
| **UX Designer** (bmad-bmm-ux-designer) | - | Epic 29 UI (iteration progress, pause/resume) | - |
| **Tech Writer** (bmad-bmm-tech-writer) | - | - | Documentation updates |

### Total Effort Allocation

| Week | Total Effort | P0 Fixes | MVP E2E | Epic 29 | Re-verification | Documentation |
|-------|---------------|-------------|-----------|---------|----------------|--------------|
| **Week 1** | 24-32h | 5-9h | 14-21h | - | - | - |
| **Week 2** | 40-52h | 13-20h | - | 24-32h | - | - |
| **Week 3** | 24-32h | - | - | - | 16-20h | 8-12h |
| **Total** | 88-116h (11-14.5 days) | 18-29h | 14-21h | 24-32h | 16-20h | 8-12h |

---

## Dependencies and Blocking Factors

### Critical Dependencies

| Story | Depends On | Blocking Factor | Mitigation |
|-------|------------|-----------------|------------|
| MVP-2 | P0 fix (agentic loop) | Cannot test multi-step conversations | Complete P0 fix Day 1-2 |
| MVP-3 | P0 fix (path validation) | Cannot test file operations with security | Complete P0 fix Day 1-2 |
| MVP-4 | MVP-3 (E2E verification) | Dependency chain | Complete MVP-3 E2E Week 1 |
| MVP-5 | MVP-4 (E2E verification) | Dependency chain | Complete MVP-4 Week 2 |
| MVP-6 | MVP-5 (E2E verification) | Dependency chain | Complete MVP-5 Week 2 |
| MVP-7 | MVP-6 (E2E verification) | Dependency chain | Complete MVP-6 Week 2 |
| Epic 29-1 | State refactoring (optional) | Cleaner codebase | Can proceed without state refactoring |
| Epic 29-2 | Epic 29-1 | Iteration tracking required | Complete Epic 29-1 Week 2 |
| Epic 29-3 | Epic 29-1, Epic 29-2 | Termination strategies depend on iteration tracking | Complete Epic 29-1, Epic 29-2 Week 2 |
| Epic 29-4 | Epic 29-1, Epic 29-3 | Error recovery depends on iteration tracking and termination | Complete Epic 29-1, Epic 29-3 Week 2 |

### Risk Factors

| Risk | Probability | Impact | Mitigation Strategy |
|-------|-------------|---------|-------------------|
| P0 fixes take longer than expected | Medium | High | Allocate buffer time, prioritize critical path |
| MVP-2/3 E2E verification reveals additional bugs | High | Medium | Allocate buffer time for bug fixes |
| Epic 29 implementation takes longer than 2 weeks | Medium | High | Break into smaller stories, iterative delivery |
| Re-verification of 12 stories exceeds timeline | High | High | Prioritize high-impact stories, defer low-impact |
| State refactoring breaks existing functionality | Low | High | Comprehensive testing, rollback plan |

---

## Risk Mitigation Strategies

### Technical Risks

1. **Agentic Loop Infinite Loops**
   - **Mitigation**: Implement `maxIterations(3)` as immediate safety limit
   - **Backup**: Epic 29-3 adds intelligent termination strategies
   - **Monitoring**: Log all iteration attempts for debugging

2. **State Refactoring Breaks Functionality**
   - **Mitigation**: Comprehensive testing after refactoring
   - **Backup**: Rollback plan with git revert capability
   - **Monitoring**: Run full test suite before merging

3. **Path Validation Blocks Legitimate Operations**
   - **Mitigation**: Clear error messages with actionable guidance
   - **Backup**: User override option for trusted paths
   - **Monitoring**: Log all validation failures for analysis

### Timeline Risks

1. **MVP-2/3 E2E Verification Takes Longer**
   - **Mitigation**: Allocate buffer time (20% extra)
   - **Backup**: Prioritize critical path (MVP-3 → MVP-4)
   - **Monitoring**: Daily stand-ups to track progress

2. **Epic 29 Implementation Exceeds 2 Weeks**
   - **Mitigation**: Break into smaller stories (already done: 4 stories)
   - **Backup**: Iterative delivery (complete 29-1, then 29-2, etc.)
   - **Monitoring**: Weekly progress reviews

3. **Re-verification of 12 Stories Exceeds Timeline**
   - **Mitigation**: Prioritize high-impact stories (core functionality)
   - **Backup**: Defer low-impact stories to next sprint
   - **Monitoring**: Track completion rate (target: 2-3 stories/day)

---

## Success Criteria

### Phase 1: Immediate Unblocking (Week 1)

- [ ] `agentLoopStrategy` configured with `maxIterations(3)`
- [ ] Path validation added to all file tools
- [ ] TanStack AI and TanStack Router usage verified
- [ ] MVP-2 passes E2E verification with screenshot
- [ ] MVP-3 passes E2E verification with screenshot
- [ ] No P0 or P1 issues remaining

### Phase 2: Post-MVP Refactoring (Week 2)

- [ ] `IDELayout.tsx` uses `useIDEStore` for all IDE state
- [ ] No state duplication in codebase
- [ ] Epic 29-1: Agent Loop Strategy Implementation completed
- [ ] Epic 29-2: Iteration UI & State Visualization completed
- [ ] Epic 29-3: Intelligent Termination Strategies completed
- [ ] Epic 29-4: Error Recovery & User Handoff completed

### Phase 3: E2E Validation & Documentation (Week 3)

- [ ] All 12 re-verified stories pass E2E testing
- [ ] Screenshots captured for all 12 stories
- [ ] AGENTS.md updated with new patterns
- [ ] Epic 29 retrospective completed
- [ ] All documentation reflects current implementation
- [ ] No P0 or P1 issues remaining

---

## Alignment with Technical Roadmap

This refactored sprint plan directly aligns with [`technical-roadmap-course-correction-2025-12-27.md`](../technical-roadmap-course-correction-2025-12-27.md):

| Roadmap Priority | Sprint Plan Action | Week | Status |
|------------------|-------------------|-------|--------|
| **P0**: Agentic Execution Loop Gap | Add `maxIterations(3)` to `useAgentChatWithTools.ts` | Week 1, Day 1-2 | ✅ Aligned |
| **P0**: State Management Duplication | Refactor `IDELayout.tsx` to use `useIDEStore` | Week 2, Day 1-2 | ✅ Aligned |
| **P1**: File Access Permission Issues | Add path validation to agent tools | Week 1, Day 1-2 | ✅ Aligned |
| **P2**: SDK Usage Verification | Verify TanStack AI and TanStack Router usage | Week 1, Day 1-2 | ✅ Aligned |
| **P2**: E2E Validation Process | Complete MVP-2/3 E2E verification | Week 1, Day 3-7 | ✅ Aligned |
| **Epic 29**: Agentic Execution Loop | Implement Epic 29 (4 stories) | Week 2, Day 3-7 | ✅ Aligned |
| **Re-verification**: 12 stories | Re-verify 12 stories with browser E2E testing | Week 3, Day 1-4 | ✅ Aligned |
| **Documentation**: Updates | Update AGENTS.md and documentation | Week 3, Day 5-7 | ✅ Aligned |

---

## Related Artifacts & References

### Investigation Documents
1. [`../technical-roadmap-course-correction-2025-12-27.md`](../technical-roadmap-course-correction-2025-12-27.md) - Technical roadmap with priorities and timeline
2. [`../course-corrections/comprehensive-investigation-consolidation-2025-12-27.md`](../course-corrections/comprehensive-investigation-consolidation-2025-12-27.md) - Consolidated investigation findings
3. [`../course-corrections/read-file-and-agentic-execution-analysis-2025-12-25.md`](../course-corrections/read-file-and-agentic-execution-analysis-2025-12-25.md) - Agentic execution loop gap analysis
4. [`../state-management-audit-p1.10-2025-12-26.md`](../state-management-audit-p1.10-2025-12-26.md) - State management audit

### Epic Specifications
1. [`../epics/epic-29-agentic-execution-loop.md`](../epics/epic-29-agentic-execution-loop.md) - Epic 29 specification
2. [`mvp-sprint-plan-2025-12-24.md`](mvp-sprint-plan-2025-12-24.md) - MVP sprint plan
3. [`mvp-story-validation-2025-12-24.md`](mvp-story-validation-2025-12-24.md) - Story validation criteria

### Sprint Status
1. [`sprint-status-consolidated.yaml`](sprint-status-consolidated.yaml) - Sprint tracking (to be updated with this plan)

### Technical Documentation
1. [`../../AGENTS.md`](../../AGENTS.md) - Project-specific development patterns
2. [`../../src/lib/agent/hooks/use-agent-chat-with-tools.ts`](../../src/lib/agent/hooks/use-agent-chat-with-tools.ts) - Agent chat hook
3. [`../../src/components/layout/IDELayout.tsx`](../../src/components/layout/IDELayout.tsx) - IDE layout component
4. [`../../src/lib/state/ide-store.ts`](../../src/lib/state/ide-store.ts) - IDE state store
5. [`../../src/lib/agent/tools/read-file-tool.ts`](../../src/lib/agent/tools/read-file-tool.ts) - Read file tool

### External Documentation
1. **TanStack AI**: https://tanstack.com/ai
2. **TanStack Router**: https://tanstack.com/router
3. **Zustand**: https://zustand.docs.pmnd.rs
4. **Dexie**: https://dexie.org

---

## Next Actions

### Immediate (Next 24-48 hours)
1. **P0**: Add `maxIterations(3)` to [`useAgentChatWithTools.ts`](../../src/lib/agent/hooks/use-agent-chat-with-tools.ts)
2. **P1**: Add path validation to all file tools
3. **P2**: Verify TanStack AI and TanStack Router usage patterns
4. **E2E**: Complete MVP-2 E2E verification with browser testing

### Short-term (Next 1-2 weeks)
1. **P0**: Complete MVP-3 E2E verification
2. **P0**: Refactor [`IDELayout.tsx`](../../src/components/layout/IDELayout.tsx) state duplication
3. **P0**: Start Epic 29: Agentic Execution Loop implementation

### Long-term (Next 2-4 weeks)
1. Complete Epic 29: Agentic Execution Loop (4 stories)
2. Re-verify 12 stories with browser E2E testing
3. Update AGENTS.md with new patterns and best practices
4. Update documentation to reflect current implementation

---

## Conclusion

This refactored sprint plan provides a comprehensive, prioritized 3-week timeline to resolve all P0 issues, complete MVP E2E verification, implement Epic 29 (Agentic Execution Loop), and re-verify 12 stories marked incorrectly as DONE.

**Key Outcomes**:
1. **Immediate Unblocking**: P0 fixes enable MVP-2/3 E2E verification
2. **Technical Debt Reduction**: State management refactoring eliminates duplication
3. **Competitive Parity**: Epic 29 enables full agentic capabilities
4. **Quality Assurance**: E2E validation ensures features work in production
5. **Documentation Alignment**: All artifacts reflect current implementation

**Timeline**: 3 weeks total (Week 1: MVP completion, Week 2: refactoring + Epic 29, Week 3: E2E validation + documentation)

**Single Source of Truth**: All changes maintain consistency with [`sprint-status-consolidated.yaml`](sprint-status-consolidated.yaml) and [`technical-roadmap-course-correction-2025-12-27.md`](../technical-roadmap-course-correction-2025-12-27.md).

---

**Author**: BMAD PM (Platform A)  
**Status**: Ready for Implementation  
**Next Action**: Update sprint-status-consolidated.yaml and report to @bmad-core-bmad-master with completion summary
