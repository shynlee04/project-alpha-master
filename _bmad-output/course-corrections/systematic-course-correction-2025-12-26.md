# Systematic Course Correction Plan
**Date**: 2025-12-26T14:57:00+07:00
**Status**: ACTIVE
**Priority**: CRITICAL

---

## Executive Summary

This document outlines a systematic course correction to address the fundamental governance failures, architectural confusion, and development paralysis that has rendered the project non-functional as of 2025-12-26.

**Root Causes Identified:**
1. **Governance Failure**: No single source of truth for sprint/workflow status
2. **Context Poisoning**: 1.33M tokens of scattered, unorganized documentation
3. **Superficial Implementation**: Lack of deep understanding of agentic coding patterns, TanStack AI SDK, and modern web architecture
4. **Fragmented Architecture**: Dead code, broken routing, duplicate state management
5. **No Research Enforcement**: MCP tools not used during implementation
6. **Uncontrolled Orchestration**: Handoff documents created without execution validation

**Impact**: Development server completely blocked, project unable to progress on MVP stories.

---

## Phase 1: Immediate Stabilization (P0 - 24-48 hours)

### 1.1 Fix Development Server Blocker
**Status**: ✅ COMPLETED
- Killed process on port 42071
- Verified server can start

### 1.2 Establish Single Source of Truth
**Status**: IN PROGRESS

**Problem**: Two status files (`sprint-status-consolidated.yaml`, `bmm-workflow-status-consolidated.yaml`) are not being consistently updated, causing drift and confusion.

**Solution**:
1. Create master governance file: `_bmad-output/governance/master-status.yaml`
   - Single source of truth for ALL status tracking
   - Includes: sprint status, workflow status, platform assignments, epic/story mapping
   - Versioned with change history
   - Auto-generated from consolidated data

2. Deprecate dual status files
   - Mark `sprint-status-consolidated.yaml` and `bmm-workflow-status-consolidated.yaml` as LEGACY
   - Create migration script to consolidate historical data into master status

3. Implement status update workflow
   - All status updates MUST go through master status
   - Handoff documents reference master status IDs
   - Automated validation of status consistency

**Acceptance Criteria**:
- [ ] Master status file created with schema validation
- [ ] Historical data migrated from legacy status files
- [ ] Legacy files marked as deprecated with redirect notices
- [ ] Status update workflow documented in `.agent/rules/`
- [ ] All agents trained to use master status

### 1.3 Audit and Consolidate Documentation
**Status**: PENDING

**Problem**: 637 files, 1.33M tokens of scattered documentation causing context poisoning.

**Solution**:
1. Create documentation inventory
   - Scan `_bmad-output/` for all documentation
   - Categorize by type: architecture, epic, story, handoff, course-correction, research, marketing
   - Tag each document with: created_date, status, relevance, size

2. Archive obsolete documentation
   - Move documents older than 30 days to `_bmad-output/archive/obsolete-docs/`
   - Create index of archived documents for reference

3. Create living documentation structure
   - `_bmad-output/docs/active/` - Current, actively used docs
   - `_bmad-output/docs/reference/` - Reference materials
   - `_bmad-output/docs/architecture/` - Architecture decisions
   - `_bmad-output/docs/research/` - Research findings

4. Implement documentation governance
   - Max document size: 50K tokens per file
   - Required metadata: created_date, last_updated, status, dependencies
   - Version control with change history

**Acceptance Criteria**:
- [ ] Documentation inventory created
- [ ] Obsolete docs archived (files > 30 days old)
- [ ] New documentation structure established
- [ ] Documentation governance rules documented
- [ ] Token usage reduced by 80%

### 1.4 Codebase Architecture Audit
**Status**: PENDING

**Problem**: Fragmented architecture with dead code, broken routing, and duplicate state management.

**Solution**:
1. Conduct comprehensive architecture audit
   - Map all components and their dependencies
   - Identify dead code (unused imports, orphaned files)
   - Identify broken routing (components not wired to routes)
   - Identify duplicate implementations (same functionality in multiple files)

2. Create architecture cleanup plan
   - Prioritize by impact: P0 (blocks development), P1 (technical debt), P2 (minor cleanup)
   - Create migration plan for duplicate code
   - Create removal plan for dead code

3. Establish architecture governance
   - Define component ownership rules
   - Define routing standards
   - Define state management boundaries
   - Document in `.agent/rules/architecture-governance.md`

**Acceptance Criteria**:
- [ ] Architecture audit report generated
- [ ] Dead code identified and catalogued
- [ ] Broken routing documented
- [ ] Cleanup plan created
- [ ] Architecture governance rules established

---

## Phase 2: Knowledge Foundation (P0 - 48-72 hours)

### 2.1 Research Modern Agentic Coding Patterns
**Status**: PENDING
**Mode**: knowledge-synthesizer

**Research Questions**:
1. What are the current best practices for browser-based agentic coding IDEs in 2025?
2. How do successful implementations (Cursor, Windsurf, Roo Code) handle:
   - Tool execution and approval workflows
   - State management for agentic loops
   - File system synchronization
   - Terminal integration
   - Streaming chat interfaces
3. What are the architectural patterns for:
   - Multi-provider AI integration
   - Client-side vs server-side tool execution
   - Context window management for long conversations
   - Error handling and recovery in agentic workflows

**Research Methodology**:
1. Use MCP tools:
   - **Tavily**: Search for "agentic coding IDE 2025 best practices"
   - **Exa**: Search for "browser-based AI agent architecture patterns"
   - **Context7**: Query TanStack AI documentation for latest patterns
   - **Deepwiki**: Check Roo Code, Cursor repositories for implementation insights

2. Create synthesis document
   - `_bmad-output/research/agentic-coding-patterns-synthesis-2025-12-26.md`
   - Maximum 100K tokens
   - Structured with actionable insights

3. Update architecture guidelines
   - Incorporate findings into `.agent/rules/architecture-governance.md`

**Acceptance Criteria**:
- [ ] Research completed using all MCP tools
- [ ] Synthesis document created (≤100K tokens)
- [ ] Architecture guidelines updated with new patterns
- [ ] Implementation recommendations documented

### 2.2 TanStack AI SDK Deep Dive
**Status**: PENDING
**Mode**: knowledge-synthesizer

**Research Questions**:
1. What are the correct patterns for:
   - Client-side tool execution with server-side streaming
   - Multi-provider adapter architecture
   - SSE streaming implementation
   - Tool registration and execution flow

2. How to handle:
   - Provider credential management
   - Model selection and configuration
   - Error handling for provider failures
   - Rate limiting and retry logic

3. Integration patterns with WebContainers:
   - How to execute tools in WebContainer sandbox
   - File system access from agent tools
   - Terminal command execution from agents

**Research Methodology**:
1. Use Context7 to query TanStack AI documentation
2. Use Exa to search for "TanStack AI tool execution patterns 2025"
3. Analyze current implementation in `src/lib/agent/`
4. Create gap analysis document

**Deliverable**:
- `_bmad-output/research/tanstack-ai-implementation-guide-2025-12-26.md`
- Maximum 80K tokens
- Code examples for correct patterns

**Acceptance Criteria**:
- [ ] TanStack AI patterns researched
- [ ] Implementation guide created
- [ ] Gap analysis documented
- [ ] Code examples provided

---

## Phase 3: Sprint Governance Reset (P0 - 24-48 hours)

### 3.1 Reset Sprint Status
**Status**: PENDING

**Current State**:
- MVP-1 (Agent Configuration & Persistence): IN_PROGRESS
- MVP-2 through MVP-7: NOT STARTED
- Sprint status: Inconsistent with actual progress

**Solution**:
1. Reset MVP sprint to clean state
   - MVP-1: Mark as READY (not IN_PROGRESS)
   - MVP-2 through MVP-7: Mark as TODO
   - Clear all partial completion flags

2. Validate story dependencies
   - Ensure stories are properly linked
   - Verify acceptance criteria are complete
   - Check for missing prerequisites

3. Update master status file
   - Reflect reset in master status
   - Document reason for reset (course correction)

**Acceptance Criteria**:
- [ ] Sprint status reset to clean state
- [ ] Master status file updated
- [ ] Story dependencies validated
- [ ] Reset documented

### 3.2 Establish Sprint Workflow
**Status**: PENDING

**Problem**: No clear workflow for sprint execution, causing ad-hoc task assignment.

**Solution**:
1. Define sprint execution workflow
   - Story selection criteria
   - Task breakdown process
   - Agent assignment rules
   - Completion verification process
   - Status update requirements

2. Create workflow documentation
   - `_bmad-output/governance/sprint-workflow.md`
   - Visual workflow diagram
   - Decision trees for common scenarios

3. Implement workflow enforcement
   - Handoff documents must follow workflow
   - Status updates must follow workflow
   - Completion must meet acceptance criteria

**Acceptance Criteria**:
- [ ] Sprint workflow defined
- [ ] Workflow documentation created
- [ ] Enforcement rules established
- [ ] Agents trained on workflow

---

## Phase 4: Architecture Cleanup (P1 - 1-2 weeks)

### 4.1 Remove Dead Code
**Status**: PENDING

**Cleanup Targets**:
1. Unwired components
2. Duplicate implementations
3. Unused imports
4. Orphaned files
5. Dead routes
6. Legacy state management code

**Methodology**:
1. Use Repomix analysis to identify dead code
2. Create cleanup checklist per component
3. Execute cleanup in priority order
4. Validate no functionality broken
5. Update documentation

**Acceptance Criteria**:
- [ ] Dead code inventory created
- [ ] 90% of identified dead code removed
- [ ] No functionality broken
- [ ] Tests updated
- [ ] Documentation updated

### 4.2 Fix Broken Routing
**Status**: PENDING

**Problem**: Components created but not wired to TanStack Router.

**Solution**:
1. Audit all components in `src/components/`
2. Identify components not referenced in routes
3. Create missing route files
4. Wire components to routes
5. Test routing in browser

**Acceptance Criteria**:
- [ ] All components audited
- [ ] Missing routes created
- [ ] Components wired to routes
- [ ] Routing tested
- [ ] No broken links

### 4.3 Consolidate State Management
**Status**: PENDING

**Problem**: Duplicate state in [`IDELayout.tsx`](src/components/layout/IDELayout.tsx) (already identified in state audit).

**Solution**:
1. Replace local state with Zustand hooks
2. Add file content cache for ephemeral data
3. Update handlers to work with Zustand actions
4. Remove duplicate synchronization code
5. Test state persistence

**Acceptance Criteria**:
- [ ] Local state replaced with Zustand
- [ ] File content cache implemented
- [ ] Handlers updated
- [ ] Duplicate code removed
- [ ] State persistence tested

---

## Phase 5: Documentation Governance (P1 - 1 week)

### 5.1 Implement Documentation Governance
**Status**: PENDING

**Governance Rules**:
1. All documentation must have metadata header
2. Max file size: 50K tokens
3. Required fields: created_date, last_updated, status, dependencies, version
4. Version control with change history
5. Obsolete docs must be archived after 30 days
6. Active docs must be in `_bmad-output/docs/active/`
7. Reference docs in `_bmad-output/docs/reference/`

**Implementation**:
1. Create documentation template
2. Migrate active docs to new structure
3. Archive obsolete docs
4. Create governance documentation
5. Train agents on governance rules

**Acceptance Criteria**:
- [ ] Documentation template created
- [ ] Active docs migrated
- [ ] Obsolete docs archived
- [ ] Governance documentation published
- [ ] Agents trained

---

## Phase 6: MVP Sprint Restart (P0 - Immediate)

### 6.1 Reset and Restart MVP Sprint
**Status**: PENDING

**Current Issue**: MVP-1 marked IN_PROGRESS but actual implementation is incomplete/broken.

**Solution**:
1. Reset MVP-1 to READY
   - Clear all partial completion flags
   - Validate all acceptance criteria
   - Update master status

2. Re-validate MVP story sequence
   - Ensure dependencies are correct
   - Verify stories are in logical order
   - Check for gaps or overlaps

3. Create MVP restart checklist
   - Pre-restart validation
   - Restart execution order
   - Post-restart verification

**Acceptance Criteria**:
- [ ] MVP-1 reset to READY
- [ ] All MVP stories validated
- [ ] Restart checklist created
- [ ] Master status updated
- [ ] Ready to begin MVP-1

---

## Success Metrics

### Phase 1: Immediate Stabilization
- Development server unblocked: ✅
- Master status file created: ⬜
- Documentation audit completed: ⬜
- Architecture audit completed: ⬜
- Sprint status reset: ⬜

### Phase 2: Knowledge Foundation
- Agentic patterns researched: ⬜
- TanStack AI patterns documented: ⬜
- Architecture guidelines updated: ⬜

### Phase 3: Sprint Governance
- Sprint status reset: ⬜
- Sprint workflow defined: ⬜
- Workflow enforcement: ⬜

### Phase 4: Architecture Cleanup
- Dead code removed: ⬜
- Routing fixed: ⬜
- State consolidated: ⬜

### Phase 5: Documentation Governance
- Governance implemented: ⬜
- Documentation consolidated: ⬜
- Token usage reduced: ⬜

### Phase 6: MVP Restart
- MVP sprint restarted: ⬜
- MVP-1 completed: ⬜

---

## Risk Mitigation

### High-Risk Items
1. **Context Poisoning**: 1.33M tokens scattered across 637 files
   - **Mitigation**: Aggressive archival, size limits, strict governance

2. **Development Paralysis**: Multiple failed attempts causing loss of momentum
   - **Mitigation**: Single source of truth, clear workflow, incremental progress

3. **Knowledge Gaps**: Superficial understanding of complex patterns
   - **Mitigation**: Mandatory research before implementation, knowledge synthesis mode

4. **Technical Debt**: Accumulating from rushed implementations
   - **Mitigation**: Architecture audit, systematic cleanup, quality gates

### Contingency Plans
1. If Phase 1 takes > 48 hours, escalate to emergency governance reset
2. If research reveals major architectural gaps, pause all development until addressed
3. If cleanup breaks functionality, rollback immediately and investigate

---

## Next Steps

1. **Immediate (Next 4 hours)**:
   - Complete Phase 1.2 (Master Status File)
   - Begin Phase 1.3 (Documentation Audit)

2. **Short-term (Next 24 hours)**:
   - Complete Phase 1 (all sub-phases)
   - Begin Phase 2 (Knowledge Foundation)

3. **Medium-term (Next 1 week)**:
   - Complete Phase 3 (Sprint Governance)
   - Begin Phase 4 (Architecture Cleanup)

4. **Long-term (Next 2 weeks)**:
   - Complete Phase 5 (Documentation Governance)
   - Complete Phase 6 (MVP Sprint Restart)

---

## Appendix: Critical Issues Catalog

### Issue #1: Development Server Blocker
- **Severity**: P0 - CRITICAL
- **Status**: ✅ RESOLVED
- **Root Cause**: Process on port 42071 not killed properly
- **Fix**: Killed process, server can start

### Issue #2: Unmanaged Status Tracking
- **Severity**: P0 - CRITICAL
- **Status**: 🔄 IN PROGRESS
- **Root Cause**: Two status files, inconsistent updates, no validation
- **Fix**: Create master status file, deprecate legacy files

### Issue #3: Context Poisoning
- **Severity**: P0 - CRITICAL
- **Status**: ⏳ PENDING
- **Root Cause**: 1.33M tokens scattered across 637 files
- **Fix**: Audit, archive, size limits, governance

### Issue #4: Superficial Implementation
- **Severity**: P0 - CRITICAL
- **Status**: ⏳ PENDING
- **Root Cause**: Lack of deep research, rushed implementation
- **Fix**: Mandatory research before implementation, knowledge synthesis

### Issue #5: Fragmented Architecture
- **Severity**: P1 - HIGH
- **Status**: ⏳ PENDING
- **Root Cause**: Dead code, broken routing, duplicate state
- **Fix**: Architecture audit, systematic cleanup

### Issue #6: No Research Enforcement
- **Severity**: P0 - CRITICAL
- **Status**: ⏳ PENDING
- **Root Cause**: MCP tools not used during implementation
- **Fix**: Enforce MCP research protocol, add to workflow

---

**Document Control**:
- **ID**: CC-2025-12-26-001
- **Version**: 1.0
- **Created**: 2025-12-26T14:57:00+07:00
- **Last Updated**: 2025-12-26T14:57:00+07:00
- **Status**: ACTIVE
- **Next Review**: 2025-12-27T10:00:00+07:00
