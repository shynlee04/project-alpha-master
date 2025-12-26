# Governance Remediation Plan
**Project**: Via-gent (Project Alpha)
**Date**: 2025-12-26
**Based On**: `governance-audit-report-2025-12-26.md`
**Plan ID**: REM-2025-12-26-001

---

## Executive Summary

This remediation plan provides a prioritized, actionable roadmap to address the 27 governance issues identified in the governance audit. The plan is organized by severity (P0, P1, P2) and includes estimated effort, dependencies, and MCP research requirements.

### Remediation Strategy
- **Phase 1 (Week 1)**: P0 issues - Critical blockers that must be resolved before any development continues
- **Phase 2 (Week 2)**: P1 issues - High-priority fixes to restore governance integrity
- **Phase 3 (Weeks 3-4)**: P2 issues - Medium-priority improvements and infrastructure

### Success Criteria
- 100% governance consistency across all documents
- 100% story completion validation with full acceptance criteria
- 100% E2E verification with screenshot evidence
- 100% MCP research compliance for all implementations
- Single source of truth for project documentation

---

## Phase 1: Critical Blockers (P0) - Week 1

### P0-1: Fix Status Inconsistency Between Governance Documents

**Issue**: Critical status inconsistency between `sprint-status-consolidated.yaml` and `bmm-workflow-status-consolidated.yaml`

**Evidence**:
- [`sprint-status-consolidated.yaml`](../sprint-artifacts/sprint-status-consolidated.yaml) shows MVP-2 as "done"
- [`bmm-workflow-status-consolidated.yaml`](../bmm-workflow-status-consolidated.yaml) shows MVP-3 as "in-progress"

**Root Cause**: No synchronization mechanism between governance documents

**Remediation Steps**:
1. Implement single-source-of-truth mechanism for story status
2. Create automated sync script between governance documents
3. Add validation gate before allowing story transition
4. Update both documents to reflect accurate current status

**Files to Modify**:
- [`_bmad-output/sprint-artifacts/sprint-status-consolidated.yaml`](../sprint-artifacts/sprint-status-consolidated.yaml)
- [`_bmad-output/bmm-workflow-status-consolidated.yaml`](../bmm-workflow-status-consolidated.yaml)

**Estimated Effort**: 1-2 days

**Dependencies**: None

**MCP Research Required**: No

**Governance Infrastructure Needed**: Yes - Automated sync mechanism

**Acceptance Criteria**:
- [ ] Both governance documents show same current story status
- [ ] Automated sync script created and tested
- [ ] Validation gate implemented
- [ ] No status inconsistencies detected

---

### P0-2: Fix Story Dependency Violation

**Issue**: MVP-3 marked as "in-progress" while MVP-2 is not verified complete

**Evidence**:
- [`bmm-workflow-status-consolidated.yaml`](../bmm-workflow-status-consolidated.yaml) shows MVP-3 as "in-progress"
- MVP-2 acceptance criteria not fully verified
- Violates sequential story dependency rule

**Root Cause**: No gate preventing premature story start

**Remediation Steps**:
1. Revert MVP-3 status to "backlog"
2. Implement mandatory completion verification before creating handoff
3. Add workflow status check that validates previous story is "done"
4. Update handoff template to include dependency verification step

**Files to Modify**:
- [`_bmad-output/bmm-workflow-status-consolidated.yaml`](../bmm-workflow-status-consolidated.yaml)
- [`_bmad-output/handoffs/bmad-master-to-dev-mvp-3-tool-execution-files-2025-12-25.md`](../_bmad-output/handoffs/bmad-master-to-dev-mvp-3-tool-execution-files-2025-12-25.md)

**Estimated Effort**: 1-2 days

**Dependencies**: P0-1 (Status consistency)

**MCP Research Required**: No

**Governance Infrastructure Needed**: Yes - Story transition validation gate

**Acceptance Criteria**:
- [ ] MVP-3 status reverted to "backlog"
- [ ] Workflow status check implemented
- [ ] Handoff template updated with dependency verification
- [ ] No premature story transitions allowed

---

### P0-3: Implement E2E Verification Enforcement Mechanism

**Issue**: E2E verification is "MANDATORY" but no enforcement mechanism exists

**Evidence**:
- Definition of Done includes "MANDATORY: Browser E2E Verification"
- E2E verification directory exists but is empty
- No screenshots stored for any completed stories

**Root Cause**: E2E verification requirement exists but no mechanism to capture/store screenshots

**Remediation Steps**:
1. Implement screenshot capture mechanism (browser screenshot tool)
2. Create E2E verification directory structure for each story
3. Store screenshot files in `_bmad-output/e2e-verification/{story-key}/`
4. Update sprint status to include screenshot file path
5. Add E2E verification checklist to Definition of Done

**Files to Create**:
- `_bmad-output/e2e-verification/mvp-1/`
- `_bmad-output/e2e-verification/mvp-2/`
- `_bmad-output/e2e-verification/mvp-3/`
- `_bmad-output/e2e-verification/mvp-4/`
- `_bmad-output/e2e-verification/mvp-5/`
- `_bmad-output/e2e-verification/mvp-6/`
- `_bmad-output/e2e-verification/mvp-7/`

**Files to Modify**:
- [`_bmad-output/sprint-artifacts/sprint-status-consolidated.yaml`](../sprint-artifacts/sprint-status-consolidated.yaml)
- [`_bmad-output/sprint-artifacts/mvp-story-validation-2025-12-24.md`](../sprint-artifacts/mvp-story-validation-2025-12-24.md)

**Estimated Effort**: 2-3 days

**Dependencies**: None

**MCP Research Required**: No

**Governance Infrastructure Needed**: Yes - Screenshot capture tool

**Acceptance Criteria**:
- [ ] E2E verification directory structure created
- [ ] Screenshot capture mechanism implemented
- [ ] Screenshot files stored with timestamps
- [ ] Sprint status updated with screenshot file paths
- [ ] E2E verification checklist added to Definition of Done

---

### P0-4: Conduct Actual E2E Verification for Completed Stories

**Issue**: MVP-1 and MVP-2 marked "done" with `e2e_verified: true` but no screenshots

**Evidence**:
- [`sprint-status-consolidated.yaml`](../sprint-artifacts/sprint-status-consolidated.yaml) lines 114, 62
- E2E verification directory is empty (only contains template)
- No screenshot files found

**Root Cause**: E2E verification checkbox checked but no mechanism to capture/store screenshot

**Remediation Steps**:
1. Start development server: `pnpm dev`
2. Open browser to `http://localhost:3000`
3. Test MVP-1: Agent Configuration & Persistence
   - Select AI provider (OpenRouter/Anthropic)
   - Enter API key
   - Save configuration
   - Verify configuration persists across browser refresh
   - Capture screenshot of working configuration
4. Test MVP-2: Chat Interface with Streaming
   - Open chat interface
   - Select agent
   - Send message
   - Verify streaming response
   - Verify rich text formatting
   - Verify code blocks display correctly
   - Verify chat history persists
   - Capture screenshot of working chat interface
5. Store screenshots in `_bmad-output/e2e-verification/mvp-1/` and `_bmad-output/e2e-verification/mvp-2/`
6. Update sprint status with screenshot file paths

**Files to Create**:
- `_bmad-output/e2e-verification/mvp-1/mvp1_agent_config_e2e_2025-12-26.webp`
- `_bmad-output/e2e-verification/mvp-2/mvp2_chat_streaming_e2e_2025-12-26.webp`

**Files to Modify**:
- [`_bmad-output/sprint-artifacts/sprint-status-consolidated.yaml`](../sprint-artifacts/sprint-status-consolidated.yaml)

**Estimated Effort**: 2-3 days

**Dependencies**: P0-3 (E2E enforcement mechanism)

**MCP Research Required**: No

**Governance Infrastructure Needed**: No

**Acceptance Criteria**:
- [ ] MVP-1 E2E verification completed with screenshot
- [ ] MVP-2 E2E verification completed with screenshot
- [ ] Screenshots stored in E2E verification directory
- [ ] Sprint status updated with screenshot file paths
- [ ] All acceptance criteria verified for both stories

---

### P0-5: Enforce MCP Research Protocol

**Issue**: No evidence of MCP research before implementing agent infrastructure

**Evidence**:
- Agent infrastructure implemented without documented research
- TanStack AI integration without prior Context7/Deepwiki/Tavily/Exa research
- No research artifacts found in `_bmad-output/`

**Root Cause**: MCP research protocol exists but not enforced

**Remediation Steps**:
1. Create MCP research documentation template
2. Update handoff template to include MCP research step
3. Block implementation without prior research approval
4. Audit existing implementations for MCP research compliance
5. Create research artifacts for agent infrastructure

**Files to Create**:
- `_bmad-output/mcp-research/template.md`
- `_bmad-output/mcp-research/agent-infrastructure-2025-12-26.md`
- `_bmad-output/mcp-research/tanstack-ai-integration-2025-12-26.md`
- `_bmad-output/mcp-research/webcontainer-file-ops-2025-12-26.md`

**Files to Modify**:
- `.agent/rules/general-rules.md`
- `.cursor/rules/bmad/templates/handoff-template.md`

**Estimated Effort**: 3-5 days

**Dependencies**: None

**MCP Research Required**: Yes - Need to use Context7, Deepwiki, Tavily, Exa to research:
- TanStack AI SDK patterns
- WebContainer file operations
- Agent tool execution patterns
- Chat streaming implementation

**Governance Infrastructure Needed**: Yes - MCP research approval workflow

**Acceptance Criteria**:
- [ ] MCP research documentation template created
- [ ] Handoff template updated with MCP research step
- [ ] Implementation blocked without prior research approval
- [ ] Existing implementations audited for compliance
- [ ] Research artifacts created for agent infrastructure

---

### P0-6: Implement Handoff Validation Mechanism

**Issue**: Handoff for MVP-3 created before MVP-2 completion verification

**Evidence**:
- [`bmad-master-to-dev-mvp-3-tool-execution-files-2025-12-25.md`](../_bmad-output/handoffs/bmad-master-to-dev-mvp-3-tool-execution-files-2025-12-25.md)
- Contains warning but no validation that MVP-2 is complete
- No mechanism to prevent premature handoff

**Root Cause**: No gate preventing handoff creation for next story before current story is verified complete

**Remediation Steps**:
1. Implement handoff validation checklist
2. Require previous story "done" confirmation before creating next handoff
3. Add workflow status check to handoff process
4. Update handoff template to include validation step
5. Archive premature MVP-3 handoff

**Files to Modify**:
- `.cursor/rules/bmad/templates/handoff-template.md`
- [`_bmad-output/handoffs/bmad-master-to-dev-mvp-3-tool-execution-files-2025-12-25.md`](../_bmad-output/handoffs/bmad-master-to-dev-mvp-3-tool-execution-files-2025-12-25.md)

**Estimated Effort**: 1-2 days

**Dependencies**: P0-1 (Status consistency), P0-2 (Story dependency)

**MCP Research Required**: No

**Governance Infrastructure Needed**: Yes - Handoff validation system

**Acceptance Criteria**:
- [ ] Handoff validation checklist implemented
- [ ] Previous story "done" confirmation required
- [ ] Workflow status check added to handoff process
- [ ] Handoff template updated with validation step
- [ ] Premature MVP-3 handoff archived

---

## Phase 2: High-Priority Fixes (P1) - Week 2

### P1-1: Complete MVP-1 Implementation

**Issue**: MVP-1 marked "done" but missing 4/7 acceptance criteria

**Evidence**:
- Missing: Model selection from provider catalog
- Missing: Configuration persistence across browser sessions
- Missing: Connection test before saving
- Missing: Agent status shows 'Ready' when configured

**Root Cause**: No validation that all acceptance criteria are met before marking story "done"

**Remediation Steps**:
1. Implement model selection UI with provider catalog
2. Add connection test functionality
3. Verify localStorage persistence works across browser refresh
4. Implement agent status indicator
5. Re-validate MVP-1 with full acceptance criteria
6. Conduct E2E verification with screenshot

**Files to Review/Modify**:
- [`src/components/agent/AgentConfigDialog.tsx`](../src/components/agent/AgentConfigDialog.tsx)
- [`src/stores/agents.ts`](../src/stores/agents.ts)
- [`src/lib/agent/providers/model-registry.ts`](../src/lib/agent/providers/model-registry.ts)

**Estimated Effort**: 2-3 days

**Dependencies**: P0-4 (E2E verification)

**MCP Research Required**: Yes - Need to research:
- Model catalog UI patterns
- Connection test implementation
- Agent status indicator patterns

**Governance Infrastructure Needed**: No

**Acceptance Criteria**:
- [ ] Model selection UI implemented with provider catalog
- [ ] Connection test functionality implemented
- [ ] localStorage persistence verified across browser refresh
- [ ] Agent status indicator implemented
- [ ] All 7 acceptance criteria met
- [ ] E2E verification completed with screenshot

---

### P1-2: Complete MVP-2 Implementation

**Issue**: MVP-2 marked "done" but acceptance criteria not verified

**Evidence**:
- [`mvp-sprint-plan-2025-12-24.md`](../sprint-artifacts/mvp-sprint-plan-2025-12-24.md) lines 94-101 shows all acceptance criteria unchecked
- No evidence that chat streaming works end-to-end
- No evidence that rich text formatting works
- No evidence that code blocks display correctly
- No evidence that chat history persists

**Root Cause**: No validation that all acceptance criteria are met before marking story "done"

**Remediation Steps**:
1. Conduct browser E2E verification of MVP-2 with full workflow test
2. Verify all acceptance criteria are met
3. Capture screenshot evidence
4. Update sprint status with verification details
5. Fix any acceptance criteria gaps found during verification

**Files to Review/Modify**:
- [`src/components/chat/`](../src/components/chat/)
- [`src/routes/api/chat.ts`](../src/routes/api/chat.ts)
- [`src/lib/agent/hooks/`](../src/lib/agent/hooks/)

**Estimated Effort**: 2-3 days

**Dependencies**: P0-4 (E2E verification), P1-1 (MVP-1 complete)

**MCP Research Required**: No

**Governance Infrastructure Needed**: No

**Acceptance Criteria**:
- [ ] All acceptance criteria verified
- [ ] E2E verification completed with screenshot
- [ ] Chat streaming works end-to-end
- [ ] Rich text formatting works
- [ ] Code blocks display correctly
- [ ] Chat history persists
- [ ] Sprint status updated with verification details

---

### P1-3: Consolidate State Management (IDELayout Duplication)

**Issue**: [`IDELayout.tsx`](../src/components/layout/IDELayout.tsx) duplicates IDE state with local `useState` instead of using [`useIDEStore`](../src/lib/state/ide-store.ts)

**Evidence**:
- [`state-management-audit-p1.10-2025-12-26.md`](../state-management-audit-p1.10-2025-12-26.md) documents this issue
- Lines 142-148 in IDELayout.tsx show duplicate state synchronization

**Root Cause**: No clear state ownership guidelines enforced

**Remediation Steps**:
1. Replace duplicated state in IDELayout.tsx with Zustand hooks:
   - `isChatVisible` → `useIDEStore(s => s.chatVisible)` + `setChatVisible()`
   - `terminalTab` → `useIDEStore(s => s.terminalTab)` + `setTerminalTab()`
   - `openFiles` → Use `useIDEStore` with local file content cache
   - `activeFilePath` → `useIDEStore(s => s.activeFile)` + `setActiveFile()`
2. Add local `fileContentCache` Map for ephemeral file content (not persisted)
3. Update [`useIDEFileHandlers`](../src/components/layout/hooks/useIDEFileHandlers.ts) to work with Zustand actions
4. Remove duplicate state synchronization code (lines 142-148 in IDELayout.tsx)
5. Test state consistency across IDE operations

**Files to Modify**:
- [`src/components/layout/IDELayout.tsx`](../src/components/layout/IDELayout.tsx)
- [`src/components/layout/hooks/useIDEFileHandlers.ts`](../src/components/layout/hooks/useIDEFileHandlers.ts)

**Estimated Effort**: 3-5 days

**Dependencies**: None

**MCP Research Required**: No

**Governance Infrastructure Needed**: No

**Acceptance Criteria**:
- [ ] All duplicated state replaced with Zustand hooks
- [ ] Local fileContentCache Map added for ephemeral content
- [ ] useIDEFileHandlers updated to work with Zustand actions
- [ ] Duplicate state synchronization code removed
- [ ] State consistency verified across IDE operations

---

### P1-4: Document Persistence Strategy

**Issue**: Inconsistent persistence strategy across state management

**Evidence**:
- IDE state persisted to IndexedDB via Zustand
- Agent configurations persisted to localStorage
- Some state is ephemeral (in-memory)
- No clear documentation on which state should be persisted vs ephemeral

**Root Cause**: No documented persistence strategy

**Remediation Steps**:
1. Document persistence strategy for each state property
2. Create state architecture diagram
3. Establish clear guidelines for when to use IndexedDB vs localStorage vs ephemeral
4. Update AGENTS.md with persistence guidelines
5. Create persistence strategy reference document

**Files to Create**:
- `_bmad-output/architecture/state-persistence-strategy-2025-12-26.md`
- `_bmad-output/architecture/state-architecture-diagram-2025-12-26.md`

**Files to Modify**:
- [`AGENTS.md`](../AGENTS.md)

**Estimated Effort**: 2-3 days

**Dependencies**: P1-3 (State consolidation)

**MCP Research Required**: No

**Governance Infrastructure Needed**: No

**Acceptance Criteria**:
- [ ] Persistence strategy documented for each state property
- [ ] State architecture diagram created
- [ ] Guidelines established for IndexedDB vs localStorage vs ephemeral
- [ ] AGENTS.md updated with persistence guidelines
- [ ] Persistence strategy reference document created

---

### P1-5: Audit Component Architecture

**Issue**: Components created but not wired into application

**Evidence**:
- [`src/components/ide/`](../src/components/ide/) contains multiple components that may not be used
- Need to verify routing integration in [`src/routes/`](../src/routes/)

**Root Cause**: No component ownership or lifecycle management

**Remediation Steps**:
1. Audit component usage across codebase
2. Remove unused/dead components
3. Ensure all components are imported and used
4. Update routing to include all necessary components
5. Create component ownership matrix

**Files to Review**:
- [`src/components/ide/`](../src/components/ide/)
- [`src/routes/`](../src/routes/)

**Estimated Effort**: 2-3 days

**Dependencies**: None

**MCP Research Required**: No

**Governance Infrastructure Needed**: Yes - Component lifecycle management

**Acceptance Criteria**:
- [ ] Component usage audit completed
- [ ] Unused/dead components removed
- [ ] All components imported and used
- [ ] Routing updated to include necessary components
- [ ] Component ownership matrix created

---

### P1-6: Consolidate Documentation

**Issue**: Documentation scattered across multiple directories without single source of truth

**Evidence**:
- Documentation in `_bmad-output/`, `docs/`, `.agent/rules/`, `.cursor/rules/`
- No clear documentation hierarchy or navigation
- Duplicate information across multiple documents

**Root Cause**: No documentation governance

**Remediation Steps**:
1. Create documentation index
2. Establish documentation hierarchy
3. Consolidate duplicate information
4. Create single source of truth for project documentation
5. Archive outdated documentation

**Files to Create**:
- `_bmad-output/documentation-index-2025-12-26.md`

**Files to Modify**:
- All documentation directories

**Estimated Effort**: 2-3 days

**Dependencies**: None

**MCP Research Required**: No

**Governance Infrastructure Needed**: Yes - Documentation review process

**Acceptance Criteria**:
- [ ] Documentation index created
- [ ] Documentation hierarchy established
- [ ] Duplicate information consolidated
- [ ] Single source of truth created
- [ ] Outdated documentation archived

---

## Phase 3: Medium-Priority Improvements (P2) - Weeks 3-4

### P2-1: Implement Agent Tool Testing

**Issue**: Agent tools may not be fully implemented or tested

**Evidence**:
- Handoff for MVP-3 created but implementation status unknown
- No evidence of tool testing
- No evidence of facade integration

**Remediation Steps**:
1. Audit agent tool implementation completeness
2. Verify all tools are registered and tested
3. Verify facade integration with WebContainer
4. Create test coverage report for agent tools
5. Write missing tests if needed

**Files to Review**:
- [`src/lib/agent/tools/`](../src/lib/agent/tools/)
- [`src/lib/agent/facades/`](../src/lib/agent/facades/)
- [`src/lib/agent/hooks/`](../src/lib/agent/hooks/)

**Estimated Effort**: 3-5 days

**Dependencies**: None

**MCP Research Required**: No

**Governance Infrastructure Needed**: No

**Acceptance Criteria**:
- [ ] Agent tool implementation audit completed
- [ ] All tools registered and tested
- [ ] Facade integration verified
- [ ] Test coverage report created
- [ ] Missing tests written

---

### P2-2: Establish Governance Infrastructure

**Issue**: No centralized governance enforcement mechanism

**Evidence**:
- No mechanism to validate story completion
- No synchronization between governance documents
- No gate preventing premature story transitions
- No enforcement of E2E verification requirement

**Remediation Steps**:
1. Implement story completion validation mechanism
2. Create E2E verification enforcement tool
3. Implement handoff validation system
4. Create governance dashboard
5. Establish documentation review process
6. Implement automated governance checks

**Files to Create**:
- `_bmad-output/governance/validation-mechanism-2025-12-26.md`
- `_bmad-output/governance/dashboard-spec-2025-12-26.md`

**Estimated Effort**: 5-7 days

**Dependencies**: All P0 and P1 issues resolved

**MCP Research Required**: No

**Governance Infrastructure Needed**: Yes - This IS the governance infrastructure

**Acceptance Criteria**:
- [ ] Story completion validation mechanism implemented
- [ ] E2E verification enforcement tool created
- [ ] Handoff validation system implemented
- [ ] Governance dashboard created
- [ ] Documentation review process established
- [ ] Automated governance checks implemented

---

## Remediation Schedule

### Week 1: Critical Blockers (P0)
- **Days 1-2**: P0-1 Fix Status Inconsistency
- **Days 1-2**: P0-2 Fix Story Dependency Violation
- **Days 3-5**: P0-3 Implement E2E Verification Enforcement
- **Days 6-7**: P0-4 Conduct Actual E2E Verification
- **Days 8-10**: P0-5 Enforce MCP Research Protocol
- **Days 10-11**: P0-6 Implement Handoff Validation

### Week 2: High-Priority Fixes (P1)
- **Days 12-14**: P1-1 Complete MVP-1 Implementation
- **Days 15-17**: P1-2 Complete MVP-2 Implementation
- **Days 18-22**: P1-3 Consolidate State Management
- **Days 23-25**: P1-4 Document Persistence Strategy
- **Days 26-28**: P1-5 Audit Component Architecture
- **Days 29-31**: P1-6 Consolidate Documentation

### Weeks 3-4: Medium-Priority Improvements (P2)
- **Days 32-36**: P2-1 Implement Agent Tool Testing
- **Days 37-43**: P2-2 Establish Governance Infrastructure

---

## Risk Assessment

### High-Risk Items
1. **P0-3 E2E Verification Enforcement**: May require browser automation tooling
2. **P0-5 MCP Research Protocol**: May require significant research effort
3. **P1-3 State Consolidation**: May break existing functionality if not careful

### Medium-Risk Items
1. **P1-1 Complete MVP-1**: May require significant UI changes
2. **P1-2 Complete MVP-2**: May require backend changes
3. **P2-2 Governance Infrastructure**: Complex, may have unintended side effects

### Low-Risk Items
1. **P0-1 Status Inconsistency**: Straightforward documentation fix
2. **P0-2 Story Dependency**: Simple status update
3. **P1-4 Persistence Strategy**: Documentation only
4. **P1-5 Component Audit**: Analysis only
5. **P1-6 Documentation Consolidation**: Organization only
6. **P2-1 Agent Tool Testing**: Testing only

---

## Dependencies

### P0 Dependencies
- P0-2 depends on P0-1 (Status consistency)
- P0-4 depends on P0-3 (E2E enforcement)
- P0-6 depends on P0-1 and P0-2 (Status and dependency)

### P1 Dependencies
- P1-2 depends on P0-4 (E2E verification)
- P1-2 depends on P1-1 (MVP-1 complete)
- P1-4 depends on P1-3 (State consolidation)

### P2 Dependencies
- P2-2 depends on all P0 and P1 issues resolved

---

## MCP Research Requirements

### P0-5: Enforce MCP Research Protocol
**Required Research**:
1. **TanStack AI SDK Patterns**
   - Use Context7 to query TanStack AI documentation
   - Use Deepwiki to check TanStack repo for architecture decisions
   - Use Tavily/Exa to search for 2025 best practices
   - Use Repomix to analyze current TanStack AI integration

2. **WebContainer File Operations**
   - Use Context7 to query WebContainer API documentation
   - Use Deepwiki to check WebContainer repo for patterns
   - Use Tavily/Exa to search for 2025 best practices
   - Use Repomix to analyze current WebContainer integration

3. **Agent Tool Execution Patterns**
   - Use Context7 to query agent tool documentation
   - Use Deepwiki to check agent tool repos for patterns
   - Use Tavily/Exa to search for 2025 best practices
   - Use Repomix to analyze current agent tool implementation

4. **Chat Streaming Implementation**
   - Use Context7 to query streaming API documentation
   - Use Deepwiki to check streaming repos for patterns
   - Use Tavily/Exa to search for 2025 best practices
   - Use Repomix to analyze current streaming implementation

### P1-1: Complete MVP-1 Implementation
**Required Research**:
1. **Model Catalog UI Patterns**
   - Use Context7 to query model catalog documentation
   - Use Tavily/Exa to search for 2025 best practices

2. **Connection Test Implementation**
   - Use Context7 to query connection test documentation
   - Use Tavily/Exa to search for 2025 best practices

3. **Agent Status Indicator Patterns**
   - Use Context7 to query status indicator documentation
   - Use Tavily/Exa to search for 2025 best practices

---

## Governance Infrastructure Requirements

### Required for P0 Issues
1. **Automated Sync Mechanism** (P0-1)
   - Script to sync sprint-status.yaml and bmm-workflow-status-consolidated.yaml
   - Validation gate to prevent status inconsistencies

2. **Story Transition Validation Gate** (P0-2)
   - Workflow status check that validates previous story is "done"
   - Block next story start until validation passes

3. **Screenshot Capture Tool** (P0-3)
   - Browser screenshot capture mechanism
   - E2E verification directory structure
   - Screenshot file storage with timestamps

4. **MCP Research Approval Workflow** (P0-5)
   - Research documentation template
   - Approval process for implementation
   - Block implementation without research approval

5. **Handoff Validation System** (P0-6)
   - Handoff validation checklist
   - Previous story "done" confirmation
   - Workflow status check in handoff process

### Required for P1 Issues
1. **Component Lifecycle Management** (P1-5)
   - Component ownership matrix
   - Lifecycle tracking
   - Dead code detection

2. **Documentation Review Process** (P1-6)
   - Documentation index
   - Review workflow
   - Consolidation process

### Required for P2 Issues
1. **Governance Dashboard** (P2-2)
   - Real-time status tracking
   - Validation gate status
   - E2E verification status
   - MCP research compliance status

2. **Automated Governance Checks** (P2-2)
   - Automated validation of story completion
   - Automated check of E2E verification
   - Automated check of MCP research compliance

---

## Success Metrics

### Target Metrics
- **Governance Consistency**: 100% (all documents synchronized)
- **Story Completion Validation**: 100% (all acceptance criteria verified)
- **E2E Verification Rate**: 100% (all stories with screenshots)
- **MCP Research Compliance**: 100% (all implementations with research)
- **Component Architecture**: 100% (all components wired, no dead code)
- **State Management**: 100% (single source of truth, no duplication)
- **Handoff Protocol Adherence**: 100% (all handoffs validated)

### Current Baseline
- **Governance Consistency**: 0% (status inconsistency between documents)
- **Story Completion Validation**: 50% (stories marked done without full verification)
- **E2E Verification Rate**: 0% (no screenshots for completed stories)
- **MCP Research Compliance**: 0% (no evidence of research)
- **Component Architecture**: Unknown (not audited)
- **State Management**: 50% (known duplication issue)
- **Handoff Protocol Adherence**: 0% (no validation mechanism)

---

## Next Steps

1. **Halt all MVP story development** until P0 issues are resolved
2. **Start with P0-1**: Fix Status Inconsistency Between Governance Documents
3. **Proceed sequentially through P0 issues** before moving to P1
4. **Present this remediation plan** to BMAD Master for approval
5. **Await approval** to begin remediation

---

**Plan Status**: READY FOR APPROVAL
**Next Action**: Present to BMAD Master for review and approval

**Document Owner**: BMAD Architect Agent (@bmad-bmm-architect)
**Version**: 1.0
**Created**: 2025-12-26T18:09:00+07:00
