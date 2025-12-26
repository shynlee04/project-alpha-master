# MVP Sprint Plan
**Date**: 2025-12-25 (Updated)
**Created**: 2025-12-24
**Project**: Project Alpha - AI Coding Agent Vertical Slice
**Epic**: MVP (AI Coding Agent Vertical Slice)
**Platform**: Platform A (Antigravity)
**Incident Response**: INC-2025-12-24-001 (RESOLVED)
**Sprint Status**: IN_PROGRESS

---

## Executive Summary

This sprint plan outlines the implementation timeline for the consolidated MVP epic, which delivers a complete vertical slice of the AI coding agent functionality. The plan follows a sequential story approach, ensuring each story builds upon the previous one to deliver working software at each stage.

### Key Metrics
- **Total Stories**: 7
- **Total Story Points**: 36
- **Estimated Duration**: 2-3 weeks
- **Platform**: Platform A (single workstream)
- **Approach**: Sequential dependencies (no parallel execution)

---

## User Journey Alignment

The MVP stories follow the complete user journey:
```
Configure Agent → Chat Interface → Execute Tools → Approve Actions → Real-time Updates → E2E Validation
```

Each story adds a layer of functionality that enables the next step in the journey.

---

## Story Timeline

### Week 1: Foundation & Core Interaction

#### Day 1-2: MVP-1 - Agent Configuration & Persistence (5 points)
**Status**: ✅ IN_PROGRESS (Started 2025-12-25)
**Duration**: 2 days
**Dependencies**: None

**Progress Notes**:
- 2025-12-25: Course correction applied for OpenRouter 401 fix
- Chat API integration issues resolved (see `_bmad-output/course-corrections/openrouter-401-fix-2025-12-25.md`)
- Provider adapter fixed for correct `createOpenaiChat` signature

**Deliverables**:
- Provider selection UI (OpenRouter/Anthropic)
- Secure API key storage in localStorage
- Model selection from provider catalog
- Cross-session persistence
- Connection test functionality
- Agent status indicator

**E2E Verification**:
- User can configure agent
- Configuration persists after browser refresh
- Connection test passes with valid API key
- Agent shows "Ready" status

**Acceptance Criteria**:
- [x] User can select AI provider (OpenRouter/Anthropic) - Implemented
- [x] API keys stored securely in localStorage - Implemented
- [ ] Model selection from provider catalog
- [ ] Configuration persists across browser sessions
- [ ] Connection test passes before saving
- [ ] Agent status shows 'Ready' when configured
- [ ] **MANDATORY: Browser E2E verification with screenshot** (see [`_bmad-output/governance/status-update-procedure-2025-12-26.md`](_bmad-output/governance/status-update-procedure-2025-12-26.md))

---

#### Day 3-4: MVP-2 - Chat Interface with Streaming (5 points)
**Status**: IN_PROGRESS (E2E verification pending)
**Duration**: 2 days
**Dependencies**: MVP-1

**Deliverables**:
- Chat panel UI with message display
- Message sending to `/api/chat` endpoint
- Real-time SSE streaming responses
- Rich text formatting (markdown)
- Code blocks with syntax highlighting
- Error handling for failed requests
- Chat history persistence

**E2E Verification**:
- User can send message to AI
- Response streams in real-time
- Code blocks display correctly
- Chat history persists

**Acceptance Criteria**:
- [ ] Chat panel opens and displays messages
- [ ] Messages send to /api/chat endpoint
- [ ] Responses stream in real-time using SSE
- [ ] Rich text formatting for responses
- [ ] Code blocks with syntax highlighting
- [ ] Error handling for failed requests
- [ ] Chat history persists in localStorage
- [ ] **MANDATORY: Browser E2E verification with screenshot** (see [`_bmad-output/governance/status-update-procedure-2025-12-26.md`](_bmad-output/governance/status-update-procedure-2025-12-26.md))

---

### Week 2: Tool Execution & Approval

#### Day 5-7: MVP-3 - Tool Execution - File Operations (8 points)
**Status**: BACKLOG
**Duration**: 3 days
**Dependencies**: MVP-2

**Deliverables**:
- File read tool with approval dialog
- File write tool with diff preview
- WebContainer file operations integration
- Real-time Monaco editor updates
- File tree status updates
- File sync to local filesystem

**E2E Verification**:
- AI can request to read file
- User approves and sees file content
- AI can request to write file
- User sees diff preview
- File updates in editor and file tree

**Acceptance Criteria**:
- [ ] AI can request to read project files
- [ ] Approval dialog shows file path and content preview
- [ ] File read executes in WebContainer
- [ ] AI can request to write/update files
- [ ] Approval dialog shows diff preview for writes
- [ ] File changes sync to local filesystem
- [ ] Monaco editor reflects changes in real-time
- [ ] File tree shows updated status
- [ ] **MANDATORY: Browser E2E verification with screenshot** (see [`_bmad-output/governance/status-update-procedure-2025-12-26.md`](_bmad-output/governance/status-update-procedure-2025-12-26.md))

---

#### Day 8-9: MVP-4 - Tool Execution - Terminal Commands (5 points)
**Status**: BACKLOG
**Duration**: 2 days
**Dependencies**: MVP-3

**Deliverables**:
- Terminal command execution tool
- Approval dialog for commands
- WebContainer terminal integration
- Output capture and display
- Command history tracking
- Error handling for failed commands
- Working directory configuration

**E2E Verification**:
- AI can request terminal command
- User approves and sees execution
- Terminal shows output in real-time
- Error handling works for failed commands

**Acceptance Criteria**:
- [ ] AI can request terminal commands
- [ ] Approval dialog shows command to execute
- [ ] Commands execute in WebContainer terminal
- [ ] Output captured and displayed in real-time
- [ ] Terminal panel shows command history
- [ ] Error handling for failed commands
- [ ] Working directory set correctly
- [ ] **MANDATORY: Browser E2E verification with screenshot** (see [`_bmad-output/governance/status-update-procedure-2025-12-26.md`](_bmad-output/governance/status-update-procedure-2025-12-26.md))

---

#### Day 10-11: MVP-5 - Approval Workflow (5 points)
**Status**: BACKLOG
**Duration**: 2 days
**Dependencies**: MVP-4

**Deliverables**:
- Tool call visualization in chat UI
- Enhanced approval overlay with context
- Approve/deny interface
- Real-time execution logs
- Batch approval for multiple operations
- One-click approval for safe operations

**E2E Verification**:
- Tool calls displayed clearly in chat
- Approval overlay shows full context
- User can approve/deny individual operations
- Batch approval works for multiple operations
- Execution logs show in real-time

**Acceptance Criteria**:
- [ ] Tool calls displayed in chat UI
- [ ] Approval overlay shows clear context
- [ ] User can approve or deny each tool call
- [ ] Execution logs show in real-time
- [ ] Error messages clear and actionable
- [ ] Batch approval for multiple operations
- [ ] One-click approval for safe operations
- [ ] **MANDATORY: Browser E2E verification with screenshot** (see [`_bmad-output/governance/status-update-procedure-2025-12-26.md`](_bmad-output/governance/status-update-procedure-2025-12-26.md))

---

### Week 3: Integration & Testing

#### Day 12-13: MVP-6 - Real-time UI Updates (3 points)
**Status**: BACKLOG
**Duration**: 2 days
**Dependencies**: MVP-5

**Deliverables**:
- Event bus integration for state updates
- File sync status updates
- Terminal status reflection in chat
- Agent status real-time updates
- State persistence across refreshes
- All IDE panel synchronization

**E2E Verification**:
- File sync status updates without refresh
- Terminal status reflects in chat
- Agent status updates in real-time
- State survives browser refresh
- All IDE panels stay synchronized

**Acceptance Criteria**:
- [ ] File sync status updates in UI
- [ ] Terminal status reflects in chat
- [ ] Agent status updates in real-time
- [ ] No page refreshes required
- [ ] State survives browser refresh
- [ ] All IDE panels stay synchronized
- [ ] **MANDATORY: Browser E2E verification with screenshot** (see [`_bmad-output/governance/status-update-procedure-2025-12-26.md`](_bmad-output/governance/status-update-procedure-2025-12-26.md))

---

#### Day 14-15: MVP-7 - E2E Integration Testing (5 points)
**Status**: BACKLOG
**Duration**: 2 days
**Dependencies**: MVP-6

**Deliverables**:
- Full workflow test automation
- Browser automation test suite
- Performance benchmarks
- Error scenario testing
- Complete documentation
- Demo video recording

**E2E Verification**:
- Complete workflow test passes
- Browser automation test passes
- Performance benchmarks met
- All error scenarios tested
- Documentation complete
- Demo video recorded

**Acceptance Criteria**:
- [ ] Full workflow test: configure → chat → execute → approve
- [ ] Browser automation test passes
- [ ] Performance benchmarks met
- [ ] Error scenarios tested
- [ ] Documentation complete
- [ ] Demo video recorded
- [ ] **MANDATORY: Browser E2E verification with screenshot** (see [`_bmad-output/governance/status-update-procedure-2025-12-26.md`](_bmad-output/governance/status-update-procedure-2025-12-26.md))

---

## Resource Allocation

### Platform A (Antigravity)
**Primary Development Platform**: 100% allocation
- **Focus**: Sequential MVP story implementation
- **Team**: Single developer (Platform A)
- **Capacity**: 36 story points over 2-3 weeks
- **Approach**: One story at a time, no parallel work

### Platform B
**Status**: Not utilized for MVP
- **Reason**: Consolidated approach requires single workstream
- **Future**: May be used for post-MVP epics

---

## Milestone Checkpoints

### Milestone 1: Foundation Complete (End of Week 1)
**Date**: Day 4
**Stories Completed**: MVP-1, MVP-2
**Verification**: 
- Agent configured and connected
- Chat interface streaming messages
- User can have basic conversation with AI

**Success Criteria**:
- ✅ Agent configuration persists
- ✅ Chat messages send and stream
- ✅ Code blocks display correctly

### Milestone 2: Tool Execution Working (Mid Week 2)
**Date**: Day 9
**Stories Completed**: MVP-1 through MVP-4
**Verification**:
- AI can read files
- AI can write files with diff preview
- AI can execute terminal commands
- All operations require approval

**Success Criteria**:
- ✅ File operations work end-to-end
- ✅ Terminal commands execute
- ✅ Approval workflow functional

### Milestone 3: Full Integration (End of Week 2)
**Date**: Day 11
**Stories Completed**: MVP-1 through MVP-5
**Verification**:
- Complete user journey works
- Real-time UI updates
- State persists across sessions

**Success Criteria**:
- ✅ Full workflow functional
- ✅ Real-time updates working
- ✅ No page refreshes needed

### Milestone 4: MVP Complete (End of Week 3)
**Date**: Day 15
**Stories Completed**: All 7 MVP stories
**Verification**:
- All acceptance criteria met
- E2E tests passing
- Documentation complete
- Demo ready

**Success Criteria**:
- ✅ All stories DONE with browser screenshots
- ✅ E2E automation tests pass
- ✅ Performance benchmarks met
- ✅ Stakeholder demo ready

---

## Risk Management

### High-Priority Risks
1. **WebContainer Integration Complexity**
   - **Impact**: Could delay MVP-3 and MVP-4
   - **Mitigation**: Leverage existing WebContainer manager patterns from Epic 13
   - **Contingency**: Simplify to basic read/write if advanced features block

2. **SSE Streaming Stability**
   - **Impact**: Could break MVP-2 chat functionality
   - **Mitigation**: Use proven TanStack AI streaming patterns
   - **Contingency**: Fallback to polling if SSE fails

3. **Browser E2E Verification Time**
   - **Impact**: Could extend sprint duration
   - **Mitigation**: Allocate dedicated time for each story's E2E verification
   - **Contingency**: Prioritize core workflows over edge cases

### Medium-Priority Risks
4. **File System Permissions**
   - **Impact**: Could block file operations
   - **Mitigation**: Use existing permission lifecycle utilities
   - **Contingency**: Clear error messages with retry guidance

5. **IndexedDB Schema Changes**
   - **Impact**: Could break persistence
   - **Mitigation**: Use existing ProjectStore schema
   - **Contingency**: Migration scripts if changes needed

### Low-Priority Risks
6. **Provider API Rate Limits**
   - **Impact**: Could slow development
   - **Mitigation**: Use free tier providers initially
   - **Contingency**: Mock provider for testing

---

## Definition of Done (Enforced)

Every story MUST meet ALL of the following before being marked DONE:

1. **Code Implementation Complete**
   - All acceptance criteria implemented
   - Code follows project conventions
   - TypeScript types properly defined

2. **TypeScript Build Passes**
   - `pnpm build` succeeds without errors
   - No TypeScript compilation warnings

3. **Unit Tests Passing**
   - ≥80% code coverage
   - All tests pass
   - No flaky tests

4. **MANDATORY: Browser E2E Verification**
   - Manual browser test completed
   - Screenshot or recording captured
   - Full workflow validated
   - **NO EXCEPTIONS**

5. **Code Review Approved**
   - Peer review completed
   - All feedback addressed
   - Review approved in sprint status

---

## Daily Standup Focus

During the sprint, daily standups will focus on:

1. **Yesterday**: What was accomplished?
2. **Today**: What will be worked on?
3. **Blockers**: Any impediments?
4. **E2E Status**: Browser verification progress?

---

## Sprint Review

**Date**: End of Week 3 (Day 15)
**Attendees**: Development team, stakeholders
**Agenda**:
1. Demo of complete MVP workflow
2. Review of all 7 stories
3. Performance metrics review
4. Stakeholder feedback
5. Next steps (post-MVP epics)

---

## Sprint Retrospective

**Date**: After Sprint Review
**Focus Areas**:
1. What went well with consolidation approach?
2. What challenges did we encounter?
3. How can we improve E2E verification process?
4. Lessons learned for post-MVP epics

---

## Success Metrics

### Quantitative Metrics
- **Story Completion Rate**: 100% (7/7 stories)
- **E2E Verification Rate**: 100% (all stories with screenshots)
- **Test Coverage**: ≥80%
- **Build Success Rate**: 100%
- **Sprint Duration**: 2-3 weeks

### Qualitative Metrics
- **User Journey Completeness**: Full workflow functional
- **Code Quality**: Follows project standards
- **Documentation**: Complete and accurate
- **Stakeholder Satisfaction**: Demo meets expectations

---

## Next Steps (Post-MVP)

After MVP completion, the team will:

1. **Archive Superseded Artifacts**
   - Remove superseded story files
   - Archive consolidation documents
   - Clean up dead artifacts

2. **Evaluate Backlog Epics**
   - Review priority of Epics 7, 11, 21, 23, 26, 27
   - Plan next epic based on user feedback

3. **Expand Based on Feedback**
   - Incorporate stakeholder feedback
   - Plan enhancements
   - Consider multi-platform execution

---

## Governance Compliance

This sprint plan complies with:
- ✅ Incident INC-2025-12-24-001 response requirements
- ✅ Consolidation approach (single MVP epic)
- ✅ Mandatory E2E verification gates (enforced per [`_bmad-output/governance/status-update-procedure-2025-12-26.md`](_bmad-output/governance/status-update-procedure-2025-12-26.md))
- ✅ Platform A single workstream
- ✅ Sequential story dependencies (enforced per [`_bmad-output/governance/status-update-procedure-2025-12-26.md`](_bmad-output/governance/status-update-procedure-2025-12-26.md))
- ✅ Traceability to original stories (12, 25, 28) (documented in [`_bmad-output/governance/mvp-traceability-matrix-2025-12-26.md`](_bmad-output/governance/mvp-traceability-matrix-2025-12-26.md))
- ✅ Single source of truth for status tracking ([`_bmad-output/sprint-artifacts/sprint-status-consolidated.yaml`](_bmad-output/sprint-artifacts/sprint-status-consolidated.yaml))

---

**Plan Status**: IN_PROGRESS
**Current Story**: MVP-1 (Agent Configuration)
**Next Action**: Complete MVP-1 E2E verification, prepare MVP-2
**Last Updated**: 2025-12-26T20:50:00+07:00
**Review Date**: 2025-12-26

---

## Change Log

| Date | Version | Description |
|------|---------|-------------|
| 2025-12-24 | 1.0 | Initial plan creation |
| 2025-12-25 | 1.1 | Updated MVP-1 to IN_PROGRESS, added course correction notes |
| 2025-12-26 | 1.2 | Added explicit E2E verification gate to all story acceptance criteria, updated governance compliance references |

---

**Document Owner**: Product Manager (@bmad-bmm-pm)
**Reviewers**: Scrum Master (@bmad-bmm-sm), BMAD Master (@bmad-core-bmad-master)
**Version**: 1.2