# MVP Risk Register
**Date**: 2025-12-25 (Updated)
**Created**: 2025-12-24
**Project**: Project Alpha - AI Coding Agent Vertical Slice
**Epic**: MVP (AI Coding Agent Vertical Slice)
**Platform**: Platform A (Antigravity)
**Incident Response**: INC-2025-12-24-001 (RESOLVED)
**Sprint Status**: IN_PROGRESS

---

## Executive Summary

This risk register identifies potential risks that could impact the successful delivery of the MVP epic. Each risk is assessed for probability, impact, and mitigation strategies. The register will be updated throughout the sprint as new risks emerge or existing risks are resolved.

### Risk Summary
- **Total Risks Identified**: 12
- **High Priority**: 3
- **Medium Priority**: 5
- **Low Priority**: 4
- **Overall Risk Level**: MEDIUM (with active mitigation)

---

## Risk Assessment Matrix

| Probability \ Impact | Low | Medium | High |
|----------------------|-----|--------|------|
| High | R9, R12 | R4, R8 | R1, R2 |
| Medium | R10, R11 | R5, R7 | R3 |
| Low | - | R6 | - |

**Legend**:
- **R1**: WebContainer Integration Complexity
- **R2**: SSE Streaming Stability
- **R3**: File System Permissions
- **R4**: Browser E2E Verification Time
- **R5**: IndexedDB Schema Changes
- **R6**: Provider API Rate Limits
- **R7**: Event Bus Integration
- **R8**: Terminal Working Directory
- **R9**: localStorage Security
- **R10**: Batch Approval Complexity
- **R11**: Real-time UI Synchronization
- **R12**: Browser Automation Setup

---

## Detailed Risk Register

### HIGH PRIORITY RISKS

#### R1: WebContainer Integration Complexity

**Category**: Technical
**Probability**: High
**Impact**: High
**Risk Score**: 9/9

**Description**:
WebContainer integration for file and terminal operations (MVP-3, MVP-4) may be more complex than anticipated, potentially causing delays or integration issues.

**Potential Impact**:
- Delay MVP-3 and MVP-4 by 2-3 days
- Block subsequent stories (MVP-5, MVP-6)
- Require significant refactoring

**Affected Stories**:
- MVP-3: Tool Execution - File Operations
- MVP-4: Tool Execution - Terminal Commands

**Mitigation Strategies**:
1. **Primary**: Leverage existing WebContainer patterns from Epic 13 (DONE)
2. **Secondary**: Incremental testing - test file operations before terminal
3. **Contingency**: Simplify to basic read/write if advanced features block
4. **Fallback**: Use mock implementations for initial testing

**Owner**: Dev (@bmad-bmm-dev)
**Monitoring Plan**:
- Daily check on WebContainer integration progress
- Review Epic 13 patterns before starting MVP-3
- Allocate buffer time in schedule

**Trigger Conditions**:
- WebContainer operations fail consistently
- Integration issues persist > 1 day
- No progress on file operations after 2 days

**Status**: Active - Mitigation in place

---

#### R2: SSE Streaming Stability

**Category**: Technical
**Probability**: High
**Impact**: High
**Risk Score**: 9/9

**Description**:
Server-Sent Events (SSE) streaming for chat responses (MVP-2) may be unstable or fail in certain browser environments, breaking the chat functionality.

**Potential Impact**:
- Chat interface non-functional
- MVP-2 cannot be completed
- Blocks all subsequent stories

**Affected Stories**:
- MVP-2: Chat Interface with Streaming

**Mitigation Strategies**:
1. **Primary**: Use proven TanStack AI streaming patterns
2. **Secondary**: Implement robust error handling and reconnection logic
3. **Contingency**: Fallback to polling if SSE fails
4. **Fallback**: Mock streaming for development testing

**Owner**: Dev (@bmad-bmm-dev)
**Monitoring Plan**:
- Test SSE in multiple browsers (Chrome, Edge, Firefox)
- Monitor connection stability during development
- Have polling fallback ready

**Trigger Conditions**:
- SSE connections drop frequently
- Streaming fails in specific browsers
- Error rate > 20%

**Status**: ⚠️ **MATERIALIZED AND RESOLVED** (2025-12-25)

**Resolution Notes**:
This risk materialized on 2025-12-25 with two separate issues:
1. **401 "User not found"** - Incorrect argument order for `createOpenaiChat`
2. **400 "Input required: messages"** - Empty messages array overriding `useChat` messages

**Course Correction Applied**:
- See: `_bmad-output/course-corrections/openrouter-401-fix-2025-12-25.md`
- Fixed provider adapter signature: `createOpenaiChat(modelId, apiKey, config)`
- Removed `messages: []` from body options that was overriding useChat messages
- Changed `toStreamResponse` → `toServerSentEventsStream` (non-deprecated)

**Validation Status**:
- [x] Build passes (`pnpm build` - exit code 0)
- [ ] Manual browser E2E test (pending restart)

---

#### R3: File System Permissions

**Category**: Technical
**Probability**: Medium
**Impact**: High
**Risk Score**: 6/9

**Description**:
File System Access API permissions may be denied or expire unexpectedly, blocking file operations in MVP-3.

**Potential Impact**:
- File operations blocked
- User cannot complete workflow
- MVP-3 cannot be verified

**Affected Stories**:
- MVP-3: Tool Execution - File Operations

**Mitigation Strategies**:
1. **Primary**: Use existing permission lifecycle utilities from project
2. **Secondary**: Clear error messages with retry guidance
3. **Fallback**: Read-only operations if write permissions fail
4. **Fallback**: Mock file system for development

**Owner**: Dev (@bmad-bmm-dev)
**Monitoring Plan**:
- Test permission flows in different browser states
- Verify permission persistence across sessions
- Monitor permission denial rates

**Trigger Conditions**:
- Permissions denied > 30% of attempts
- Users unable to grant permissions
- Permission restoration fails

**Status**: Active - Mitigation in place

---

### MEDIUM PRIORITY RISKS

#### R4: Browser E2E Verification Time

**Category**: Process
**Probability**: High
**Impact**: Medium
**Risk Score**: 6/9

**Description**:
Manual browser E2E verification for each story may take longer than anticipated, extending sprint duration beyond 2-3 weeks.

**Potential Impact**:
- Sprint extends to 4+ weeks
- Stakeholder expectations not met
- Resource allocation issues

**Affected Stories**:
- All MVP stories (MVP-1 through MVP-7)

**Mitigation Strategies**:
1. **Primary**: Allocate dedicated time for each story's E2E verification
2. **Secondary**: Prioritize core workflows over edge cases
3. **Contingency**: Reduce test scope if time constrained
4. **Fallback**: Document partial verification if complete not possible

**Owner**: Scrum Master (@bmad-bmm-sm)
**Monitoring Plan**:
- Track E2E verification time per story
- Adjust estimates based on actual time
- Communicate delays early

**Trigger Conditions**:
- E2E verification takes > 50% longer than estimated
- Sprint timeline at risk
- Multiple stories delayed

**Status**: Active - Monitoring

---

#### R5: IndexedDB Schema Changes

**Category**: Technical
**Probability**: Medium
**Impact**: Medium
**Risk Score**: 4/9

**Description**:
IndexedDB schema changes may be required for agent configuration or chat history, requiring migration logic.

**Potential Impact**:
- Data loss during migration
- MVP-1 or MVP-2 blocked
- Additional development time

**Affected Stories**:
- MVP-1: Agent Configuration & Persistence
- MVP-2: Chat Interface with Streaming

**Mitigation Strategies**:
1. **Primary**: Use existing ProjectStore schema where possible
2. **Secondary**: Implement migration scripts if changes needed
3. **Contingency**: Use localStorage as fallback
4. **Fallback**: Clear data on schema change (acceptable for MVP)

**Owner**: Dev (@bmad-bmm-dev)
**Monitoring Plan**:
- Review existing schema before starting MVP-1
- Test migration logic in development
- Have fallback ready

**Trigger Conditions**:
- Schema changes required
- Migration fails in testing
- Data loss observed

**Status**: Monitoring - Low probability

---

#### R6: Provider API Rate Limits

**Category**: External
**Probability**: Low
**Impact**: Medium
**Risk Score**: 3/9

**Description**:
AI provider APIs (OpenRouter, Anthropic) may have rate limits that slow development or block testing.

**Potential Impact**:
- Development slowed
- Testing blocked
- User experience degraded

**Affected Stories**:
- MVP-1: Agent Configuration & Persistence
- MVP-2: Chat Interface with Streaming

**Mitigation Strategies**:
1. **Primary**: Use free tier providers initially
2. **Secondary**: Implement request queuing
3. **Contingency**: Mock provider for development
4. **Fallback**: Use multiple provider keys

**Owner**: Dev (@bmad-bmm-dev)
**Monitoring Plan**:
- Monitor API usage during development
- Track rate limit errors
- Have mock provider ready

**Trigger Conditions**:
- Rate limit errors > 10%
- Development blocked by limits
- Testing slowed significantly

**Status**: Monitoring - Low probability

---

#### R7: Event Bus Integration

**Category**: Technical
**Probability**: Medium
**Impact**: Medium
**Risk Score**: 4/9

**Description**:
Event bus integration for real-time UI updates (MVP-6) may be complex or have performance issues.

**Potential Impact**:
- Real-time updates not working
- UI synchronization issues
- MVP-6 delayed

**Affected Stories**:
- MVP-6: Real-time UI Updates

**Mitigation Strategies**:
1. **Primary**: Use existing event system from project
2. **Secondary**: Implement debouncing to prevent performance issues
3. **Contingency**: Simplify to polling if event bus fails
4. **Fallback**: Manual refresh as last resort

**Owner**: Dev (@bmad-bmm-dev)
**Monitoring Plan**:
- Test event bus performance
- Monitor for memory leaks
- Have polling fallback ready

**Trigger Conditions**:
- Event bus performance issues
- UI synchronization failures
- Memory leaks detected

**Status**: Monitoring - Medium probability

---

#### R8: Terminal Working Directory

**Category**: Technical
**Probability**: High
**Impact**: Medium
**Risk Score**: 6/9

**Description**:
Terminal working directory may not be set correctly, causing commands to fail or run in wrong location.

**Potential Impact**:
- Terminal commands fail
- File operations blocked
- MVP-4 verification fails

**Affected Stories**:
- MVP-4: Tool Execution - Terminal Commands

**Mitigation Strategies**:
1. **Primary**: Explicit CWD configuration in terminal setup
2. **Secondary**: Validate working directory before command execution
3. **Contingency**: Use absolute paths in commands
4. **Fallback**: Manual directory change before commands

**Owner**: Dev (@bmad-bmm-dev)
**Monitoring Plan**:
- Test terminal commands in different project structures
- Verify CWD in all scenarios
- Monitor for working directory errors

**Trigger Conditions**:
- Commands fail due to wrong directory
- Working directory not set correctly
- File operations fail in terminal

**Status**: Active - Mitigation in place

---

### LOW PRIORITY RISKS

#### R9: localStorage Security

**Category**: Security
**Probability**: Low
**Impact**: Low
**Risk Score**: 2/9

**Description**:
API keys stored in localStorage may be vulnerable to XSS attacks or unauthorized access.

**Potential Impact**:
- Security vulnerability
- User credentials compromised
- MVP-1 security concerns

**Affected Stories**:
- MVP-1: Agent Configuration & Persistence

**Mitigation Strategies**:
1. **Primary**: Use encryption for stored keys
2. **Secondary**: Validate on load
3. **Contingency**: Clear keys on logout
4. **Fallback**: Use session storage (acceptable for MVP)

**Owner**: Dev (@bmad-bmm-dev)
**Monitoring Plan**:
- Review security best practices
- Test for XSS vulnerabilities
- Document security assumptions

**Trigger Conditions**:
- Security vulnerabilities found
- Keys exposed in logs
- Unauthorized access detected

**Status**: Monitoring - Low probability

---

#### R10: Batch Approval Complexity

**Category**: Technical
**Probability**: Low
**Impact**: Low
**Risk Score**: 2/9

**Description**:
Batch approval for multiple operations (MVP-5) may be more complex than anticipated.

**Potential Impact**:
- MVP-5 delayed
- Simplified approval flow
- User experience degraded

**Affected Stories**:
- MVP-5: Approval Workflow

**Mitigation Strategies**:
1. **Primary**: Start with single approval, add batch later
2. **Secondary**: Simplify batch approval logic
3. **Contingency**: Defer batch approval to post-MVP
4. **Fallback**: Sequential approval only

**Owner**: Dev (@bmad-bmm-dev)
**Monitoring Plan**:
- Implement single approval first
- Add batch approval if time permits
- Monitor complexity during development

**Trigger Conditions**:
- Batch approval too complex
- Time constraints emerge
- Single approval sufficient

**Status**: Monitoring - Low probability

---

#### R11: Real-time UI Synchronization

**Category**: Technical
**Probability**: Medium
**Impact**: Low
**Risk Score**: 2/9

**Description**:
Real-time UI synchronization across all IDE panels (MVP-6) may have race conditions or stale data issues.

**Potential Impact**:
- UI shows stale data
- User confusion
- MVP-6 verification issues

**Affected Stories**:
- MVP-6: Real-time UI Updates

**Mitigation Strategies**:
1. **Primary**: Use reactive state management (Zustand)
2. **Secondary**: Implement optimistic updates
3. **Contingency**: Add manual refresh button
4. **Fallback**: Polling for updates

**Owner**: Dev (@bmad-bmm-dev)
**Monitoring Plan**:
- Test synchronization in different scenarios
- Monitor for race conditions
- Have polling fallback ready

**Trigger Conditions**:
- Stale data observed
- Race conditions detected
- Synchronization failures

**Status**: Monitoring - Low probability

---

#### R12: Browser Automation Setup

**Category**: Technical
**Probability**: High
**Impact**: Low
**Risk Score**: 3/9

**Description**:
Browser automation setup for E2E testing (MVP-7) may be complex or time-consuming.

**Potential Impact**:
- MVP-7 delayed
- Manual testing required
- Automation benefits lost

**Affected Stories**:
- MVP-7: E2E Integration Testing

**Mitigation Strategies**:
1. **Primary**: Use Playwright (proven tool)
2. **Secondary**: Start with simple automation, expand later
3. **Contingency**: Manual testing if automation fails
4. **Fallback**: Document manual test procedures

**Owner**: Dev (@bmad-bmm-dev)
**Monitoring Plan**:
- Set up automation early in MVP-7
- Test automation framework
- Have manual testing plan ready

**Trigger Conditions**:
- Automation setup takes > 2 days
- Framework issues persist
- Time constraints emerge

**Status**: Monitoring - Medium probability

---

## Risk Monitoring Plan

### Daily Risk Review

During daily standups, the team will review:
1. **Active Risks**: Status updates on high and medium priority risks
2. **New Risks**: Any new risks identified during the day
3. **Trigger Conditions**: Whether any trigger conditions have been met
4. **Mitigation Progress**: Progress on mitigation strategies

### Weekly Risk Assessment

At the end of each week, the Scrum Master will:
1. Update risk register with new information
2. Reassess probability and impact based on new data
3. Review mitigation effectiveness
4. Escalate risks that require additional attention

### Sprint Risk Review

At the sprint review, the team will:
1. Review all risks from the sprint
2. Document lessons learned
3. Update risk register for future sprints
4. Identify any new risks for post-MVP epics

---

## Risk Response Strategies

### Avoid
- **R9 (localStorage Security)**: Use encryption to avoid security issues
- **R10 (Batch Approval Complexity)**: Start with single approval to avoid complexity

### Mitigate
- **R1 (WebContainer Integration)**: Leverage existing patterns, incremental testing
- **R2 (SSE Streaming)**: Proven patterns, error handling, polling fallback
- **R3 (File System Permissions)**: Existing utilities, clear error messages
- **R4 (E2E Verification Time)**: Dedicated time, prioritization
- **R5 (IndexedDB Schema)**: Existing schema, migration scripts
- **R6 (Provider API Rate Limits)**: Free tier, request queuing
- **R7 (Event Bus Integration)**: Existing system, debouncing
- **R8 (Terminal Working Directory)**: Explicit CWD, validation

### Transfer
- None identified (all risks internal to project)

### Accept
- **R11 (Real-time UI Synchronization)**: Accept low probability, have fallback
- **R12 (Browser Automation Setup)**: Accept complexity, have manual testing plan

---

## Risk Communication

### Stakeholder Communication

**High Priority Risks**: Communicate immediately to stakeholders
- R1: WebContainer Integration Complexity
- R2: SSE Streaming Stability
- R3: File System Permissions

**Medium Priority Risks**: Communicate weekly or as status changes
- R4: Browser E2E Verification Time
- R5: IndexedDB Schema Changes
- R6: Provider API Rate Limits
- R7: Event Bus Integration
- R8: Terminal Working Directory

**Low Priority Risks**: Communicate at sprint review
- R9: localStorage Security
- R10: Batch Approval Complexity
- R11: Real-time UI Synchronization
- R12: Browser Automation Setup

### Escalation Path

1. **Level 1**: Dev handles with mitigation strategies
2. **Level 2**: Scrum Master escalates to BMAD Master
3. **Level 3**: BMAD Master escalates to stakeholders

**Escalation Triggers**:
- Risk probability or impact increases
- Mitigation strategies fail
- Risk blocks story completion

---

## Lessons Learned

### From Incident INC-2025-12-24-001

1. **E2E Validation is Critical**: Component-centric validation without E2E testing led to the incident
   - **Lesson**: Always validate end-to-end workflows
   - **Application**: All MVP stories require browser E2E verification

2. **Vertical Slice vs Horizontal**: Horizontal slicing created complexity and integration chaos
   - **Lesson**: Prefer vertical slices for new features
   - **Application**: MVP follows user journey sequentially

3. **Scope Creep Prevention**: Too many parallel workstreams caused context poisoning
   - **Lesson**: Limit active epics to 1-2 per feature
   - **Application**: Single MVP epic with sequential stories

4. **Traceability is Essential**: Lost traceability between stories and original requirements
   - **Lesson**: Maintain clear traceability to original stories
   - **Application**: All MVP stories trace to original epics 12, 25, 28

---

## Risk Register Maintenance

### Update Frequency

- **Daily**: Update risk status during standups
- **Weekly**: Reassess probability and impact
- **Per Story**: Update when story completes or blocked
- **Per Sprint**: Comprehensive review and update

### Version Control

- Current version: 1.0
- Update log:
  - 2025-12-24: Initial version created

### Approval

**Approved By**: Scrum Master (@bmad-bmm-sm)
**Reviewers**: Product Manager (@bmad-bmm-pm), BMAD Master (@bmad-core-bmad-master)
**Next Review**: 2025-12-26

---

## Appendix: Course Corrections Log

| Date | Risk | Issue | Resolution |
|------|------|-------|------------|
| 2025-12-25 | R2 | OpenRouter 401/400 errors | Provider adapter fixed, body options corrected |

---

## Appendix: Risk Glossary

- **Probability**: Likelihood of risk occurring (Low, Medium, High)
- **Impact**: Severity of consequences if risk occurs (Low, Medium, High)
- **Risk Score**: Probability × Impact (1-9 scale)
- **Mitigation**: Actions to reduce probability or impact
- **Contingency**: Backup plan if mitigation fails
- **Trigger Conditions**: Events that indicate risk is materializing
- **Owner**: Person responsible for monitoring and mitigating risk

---

**Document Owner**: Scrum Master (@bmad-bmm-sm)
**Version**: 1.1
**Status**: ACTIVE
**Last Updated**: 2025-12-25T10:00:00+07:00
**Created**: 2025-12-24

---

## Change Log

| Date | Version | Description |
|------|---------|-------------|
| 2025-12-24 | 1.0 | Initial risk register |
| 2025-12-25 | 1.1 | R2 materialized and resolved, added course corrections log |