# Sprint Planning Proposal: EPIC-CC-01 Architectural Remediation

**Document ID**: `SPP-CC-01-2026-01-14`
**Created**: 2026-01-14T15:30:00+07:00
**Author**: EXCALIBUR (Event-Driven Workflow Orchestrator)
**Status**: PROPOSAL - AWAITING APPROVAL
**Parent**: `_bmad-output/correct-course/team-b-status-correction-2026-01-14.md`

---

## 1. Sprint Overview

### 1.1 Sprint Metadata

```yaml
sprint:
  id: "CC-SPRINT-01"
  name: "Corrective Course - Architectural Remediation"
  type: "correct-course"
  priority: "P0 - CRITICAL"
  team: "Team B"
  duration: "5 days"
  start_date: "TBD - Pending approval"
  end_date: "TBD + 5 days"
  
goals:
  primary: "Fix broken features while improving architecture"
  constraints:
    - "NO NEW FEATURES"
    - "NO BREAKING CHANGES"
    - "INCREMENTAL FIXES"
    - "E2E VALIDATION REQUIRED"
```

### 1.2 Sprint Objectives

| Objective | Success Criteria | Priority |
|-----------|------------------|----------|
| Fix Unified Tools (read/write) | All tools execute with real adapters | P0 |
| Fix Thread Creation | Threads created successfully with valid workspace | P0 |
| Fix Conversation Chain | Auto-create conversation on chat open | P0 |
| Validate EPIC-44 Blocks | At least 3 AI blocks E2E tested | P1 |
| Add ESLint Governance | Direct store access banned | P1 |

---

## 2. Pre-Investigation Findings (Conflict Detection)

### 2.1 Architectural Flaws Identified

| Domain | Flaw | Severity | Files Affected |
|--------|------|----------|----------------|
| Tools | No context adapter wiring | CRITICAL | `tool-catalog.ts`, `factory.ts` |
| Chat | Conversation not auto-created | CRITICAL | `ChatInterface.tsx`, `chat-metadata-slice.ts` |
| Chat | Thread requires valid conversation | CRITICAL | `thread-management-slice.ts` |
| Notes | God component (1146 lines) | HIGH | `AISlashCommand.tsx` |
| Notes | God component (946 lines) | HIGH | `NoteEditor.tsx` |
| Storage | No abstraction layer | MEDIUM | Multiple sync files |

### 2.2 Feature-Architecture Mapping

| Feature | Broken Because | Architecture Fix |
|---------|----------------|------------------|
| `write` tool | Missing fileAdapter injection | Create FileSystemAdapter |
| `read` tool | Missing noteService injection | Create NoteServiceAdapter |
| Thread creation | No conversation exists | Auto-create on chat open |
| AI commands | No service layer | Extract to AICommandExecutor |
| State reactivity | Direct getState() calls | Convert to hook selectors |

### 2.3 Hybrid Conflict Analysis

| Feature | Current State | Should It Exist? | Verdict |
|---------|--------------|------------------|---------|
| Unified tools (read/write/delete/list) | Defined but unusable | YES - core functionality | FIX |
| Legacy tools (read_file/write_file) | Parallel to unified | NO - redundant | DEPRECATE |
| 159 fragmented stores | Over-engineered | REDUCE - consolidate | DEFER |
| God components (3) | Technical debt | SPLIT - but later | DEFER |

---

## 3. Story Breakdown (Detailed)

### 3.1 Story CC-01: Unified Tool Adapter Wiring

```yaml
story:
  id: "CC-01"
  title: "Unified Tool Adapter Wiring"
  priority: "P0"
  estimation: "4 hours"
  dependencies: []
  
description: |
  The unified tools (read, write, delete, list) are defined in 
  `src/lib/agent/tools/unified/` but their client implementations 
  require `UnifiedToolContext` with `fileAdapter` and `noteService`.
  Currently, these are NEVER provided.
  
  This story creates the adapter layer and wires it into the tool factory.

acceptance_criteria:
  - AC1: FileSystemAdapter created with WebContainer integration
  - AC2: NoteServiceAdapter created with Dexie integration
  - AC3: Tool factory injects correct adapter based on workspace
  - AC4: `read` tool returns actual file content in IDE workspace
  - AC5: `write` tool creates/updates files in Notes workspace
  
files_to_create:
  - path: "src/lib/agent/tools/unified/adapters/file-system-adapter.ts"
    description: "FileAdapter implementation for IDE workspace"
    lines_estimate: 80
    
  - path: "src/lib/agent/tools/unified/adapters/note-service-adapter.ts"
    description: "NoteService implementation for Notes workspace"
    lines_estimate: 100
    
  - path: "src/lib/agent/tools/workspace-context.ts"
    description: "Context provider for workspace-aware tool execution"
    lines_estimate: 60
    
files_to_modify:
  - path: "src/lib/agent/factory.ts"
    change: "Wire adapters to tool creation"
    lines_change: +30
    
  - path: "src/lib/agent/tools/unified/types.ts"
    change: "Export adapter interfaces"
    lines_change: +10

testing:
  unit_tests:
    - "file-system-adapter.test.ts"
    - "note-service-adapter.test.ts"
  integration_tests:
    - "unified-tool-execution.test.ts"
  e2e_tests:
    - "e2e/tools/read-write.spec.ts"

must_pass_checklist:
  - [ ] TypeScript compiles with no errors
  - [ ] `read` tool in IDE workspace returns file content
  - [ ] `write` tool in Notes workspace creates note
  - [ ] Error states handled gracefully
  - [ ] No regressions in existing functionality
```

### 3.2 Story CC-02: Conversation Auto-Creation

```yaml
story:
  id: "CC-02"
  title: "Conversation Auto-Creation"
  priority: "P0"
  estimation: "3 hours"
  dependencies: ["CC-01"]
  
description: |
  When a user opens chat in any workspace, a conversation should be 
  auto-created if none exists. Currently, threads fail because there's
  no parent conversation.

acceptance_criteria:
  - AC1: Opening chat auto-creates conversation for workspace
  - AC2: Conversation has correct workspaceType
  - AC3: Conversation persists to Dexie
  - AC4: Thread auto-created as root thread
  - AC5: Subsequent chat opens reuse existing conversation

files_to_modify:
  - path: "src/presentation/components/chat/ChatInterface.tsx"
    change: "Add useEffect for conversation initialization"
    lines_change: +25
    
  - path: "src/infrastructure/persistence/stores/chat/slices/chat-metadata-slice.ts"
    change: "Add getOrCreateConversation method"
    lines_change: +30

testing:
  unit_tests:
    - "chat-metadata-slice.test.ts (update)"
  integration_tests:
    - "conversation-thread-chain.test.ts (new)"
  e2e_tests:
    - "e2e/chat/thread-creation.spec.ts (new)"

must_pass_checklist:
  - [ ] Chat opens without errors in all workspaces
  - [ ] Conversation exists after chat open
  - [ ] Thread exists as child of conversation
  - [ ] Refreshing page retains conversation
```

### 3.3 Story CC-03: Thread Creation Chain Fix

```yaml
story:
  id: "CC-03"
  title: "Thread Creation Chain Fix"
  priority: "P0"
  estimation: "2 hours"
  dependencies: ["CC-02"]
  
description: |
  Thread creation depends on a valid conversation with workspaceType.
  Currently, it proceeds with undefined values, causing downstream failures.

acceptance_criteria:
  - AC1: Thread creation validates conversation exists
  - AC2: Thread inherits workspaceType from conversation
  - AC3: Invalid state returns clear error (not silent failure)
  - AC4: UI shows loading/error states appropriately

files_to_modify:
  - path: "src/infrastructure/persistence/stores/chat/slices/thread-management-slice.ts"
    change: "Add validation before thread creation"
    lines_change: +15
    
  - path: "src/presentation/components/chat/ThreadSelector.tsx"
    change: "Handle error states in UI"
    lines_change: +20

testing:
  unit_tests:
    - "thread-management-slice.test.ts (update)"
  e2e_tests:
    - "e2e/chat/thread-creation.spec.ts (extend)"

must_pass_checklist:
  - [ ] Thread creation fails gracefully without conversation
  - [ ] Thread has valid workspaceType
  - [ ] UI shows appropriate error message
  - [ ] No console.warn spam in normal operation
```

### 3.4 Story CC-04: Tool Context Factory

```yaml
story:
  id: "CC-04"
  title: "Tool Context Factory"
  priority: "P0"
  estimation: "4 hours"
  dependencies: ["CC-01"]
  
description: |
  Create a factory pattern for tool context that:
  1. Detects current workspace
  2. Provides appropriate adapters
  3. Updates when workspace changes
  4. Handles error cases for missing adapters

acceptance_criteria:
  - AC1: Factory creates workspace-aware context
  - AC2: Context provides correct adapter per workspace
  - AC3: Workspace changes trigger context update
  - AC4: Missing adapter returns descriptive error

files_to_create:
  - path: "src/lib/agent/tools/tool-context-factory.ts"
    description: "Factory for creating workspace-aware tool contexts"
    lines_estimate: 120

files_to_modify:
  - path: "src/lib/agent/factory.ts"
    change: "Use new context factory for tool creation"
    lines_change: +40
    
  - path: "src/lib/agent/tools/unified/types.ts"
    change: "Export factory types"
    lines_change: +15

testing:
  unit_tests:
    - "tool-context-factory.test.ts (new)"
  integration_tests:
    - "workspace-tool-context.test.ts (new)"

must_pass_checklist:
  - [ ] IDE workspace tools use FileSystemAdapter
  - [ ] Notes workspace tools use NoteServiceAdapter
  - [ ] Workspace switch updates tool context
  - [ ] Error messages are actionable
```

### 3.5 Story CC-05: E2E Tool Validation

```yaml
story:
  id: "CC-05"
  title: "E2E Tool Validation"
  priority: "P0"
  estimation: "4 hours"
  dependencies: ["CC-01", "CC-02", "CC-03", "CC-04"]
  
description: |
  End-to-end validation of all unified tools in real workspaces.
  Uses Playwright to simulate actual user flows.

acceptance_criteria:
  - AC1: `read` tool tested in IDE workspace
  - AC2: `write` tool tested in Notes workspace
  - AC3: `list` tool tested across workspaces
  - AC4: `delete` tool tested with permissions
  - AC5: Error scenarios validated

files_to_create:
  - path: "e2e/tools/unified-read.spec.ts"
    description: "E2E tests for read tool"
    lines_estimate: 80
    
  - path: "e2e/tools/unified-write.spec.ts"
    description: "E2E tests for write tool"
    lines_estimate: 80
    
  - path: "e2e/tools/unified-list.spec.ts"
    description: "E2E tests for list tool"
    lines_estimate: 60

testing:
  e2e_only: true
  coverage_target: "100% of unified tools"

must_pass_checklist:
  - [ ] All E2E tests pass
  - [ ] No flaky tests
  - [ ] Error scenarios covered
  - [ ] Tests run in CI within 5 minutes
```

### 3.6 Story CC-06: EPIC-44 E2E Validation

```yaml
story:
  id: "CC-06"
  title: "EPIC-44 E2E Validation"
  priority: "P1"
  estimation: "6 hours"
  dependencies: ["CC-05"]
  
description: |
  Validate that EPIC-44 multimodal blocks actually work with real APIs.
  This was marked complete but never E2E tested.

acceptance_criteria:
  - AC1: AI Image Generation block tested with Gemini API
  - AC2: AI Vision block tested with sample image
  - AC3: TTS block tested with audio output
  - AC4: Chart generation tested with sample data
  - AC5: HTML artifact tested with preview

files_to_create:
  - path: "e2e/multimodal/ai-image-block.spec.ts"
    description: "E2E test for image generation"
    lines_estimate: 60
    
  - path: "e2e/multimodal/ai-vision-block.spec.ts"
    description: "E2E test for vision understanding"
    lines_estimate: 60
    
  - path: "e2e/multimodal/tts-block.spec.ts"
    description: "E2E test for text-to-speech"
    lines_estimate: 50

testing:
  e2e_only: true
  requires_api_key: true
  coverage_target: "5 of 12 blocks minimum"

must_pass_checklist:
  - [ ] At least 3 blocks E2E validated
  - [ ] API errors handled gracefully
  - [ ] Blocks render correct output
  - [ ] Loading states work correctly
```

---

## 4. Risk Assessment

### 4.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| WebContainer adapter fails | MEDIUM | HIGH | Mock for testing, fallback for prod |
| Dexie schema changes needed | LOW | MEDIUM | Use migration pattern |
| Workspace detection incorrect | LOW | HIGH | Add logging, validate with tests |
| E2E tests flaky | MEDIUM | MEDIUM | Add retries, use stable selectors |

### 4.2 Schedule Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Stories take longer than estimated | MEDIUM | MEDIUM | Buffer day included |
| Dependencies block progress | LOW | HIGH | Stories can be parallelized CC-01/CC-04 |
| Integration issues | MEDIUM | MEDIUM | Daily validation runs |

### 4.3 Risk Mitigation Strategy

```
IF (any story blocked > 4 hours):
  TRIGGER: correct-course utility
  OPTIONS:
    - Split story into smaller pieces
    - Defer non-critical acceptance criteria
    - Escalate for architectural decision
    
IF (E2E tests fail):
  PRIORITY: Fix immediately before next story
  DO NOT: Proceed with broken tests
```

---

## 5. Execution Protocol

### 5.1 Daily Workflow

```yaml
daily_gates:
  morning:
    - Pull latest changes
    - Run `pnpm tsc --noEmit`
    - Run `pnpm test`
    - Review blocked items
    
  evening:
    - Update story status
    - Run E2E validation
    - Update LOOP_STATE.yaml
    - Create handoff artifact if needed
```

### 5.2 Story Completion Criteria

```yaml
definition_of_done:
  - [ ] Code implemented and reviewed
  - [ ] Unit tests written and passing
  - [ ] Integration tests passing
  - [ ] E2E tests passing (if applicable)
  - [ ] TypeScript compiles with no errors
  - [ ] No regressions in existing features
  - [ ] Must-pass checklist complete
  - [ ] Documentation updated (if API changed)
```

### 5.3 Governance Updates

After EACH story completion:
1. Update `_bmad-ext/state/LOOP_STATE.yaml`
2. Update `bmm-workflow-status.yaml` progress
3. Create story artifact in `_bmad-output/sprint-artifacts/`

---

## 6. Dependencies & Deferred Items

### 6.1 NOT IN SCOPE (Deferred)

| Item | Reason | When to Address |
|------|--------|-----------------|
| God component splitting | Too risky during remediation | EPIC-CC-02 |
| Store consolidation (159→50) | Large refactor | EPIC-CC-03 |
| Direct store access (47 violations) | Requires component changes | EPIC-CC-02 |
| Test coverage increase | After architecture stable | EPIC-CC-04 |

### 6.2 External Dependencies

| Dependency | Status | Owner |
|------------|--------|-------|
| WebContainer API | Available | StackBlitz |
| Dexie DB | Available | Internal |
| Gemini API (for E2E) | Requires BYOK | User |
| Playwright | Available | Internal |

---

## 7. Success Metrics

### 7.1 Sprint Success Criteria

| Metric | Before | After | Target |
|--------|--------|-------|--------|
| Unified tools working | 0/4 | 4/4 | 100% |
| Thread creation success | BROKEN | WORKING | Pass |
| E2E tool tests | 0 | 4+ | 4+ new tests |
| EPIC-44 blocks validated | 0/12 | 3+/12 | 25%+ |
| TypeScript errors | 0 | 0 | Zero |

### 7.2 Quality Gates

```yaml
quality_gates:
  gate_1_compile:
    check: "pnpm tsc --noEmit"
    must_pass: true
    
  gate_2_unit_tests:
    check: "pnpm vitest run"
    must_pass: true
    coverage: "> previous"
    
  gate_3_e2e:
    check: "pnpm playwright test"
    must_pass: true
    
  gate_4_no_regressions:
    check: "Manual verification of existing features"
    must_pass: true
```

---

## 8. Approval Request

### 8.1 What Happens on APPROVE

1. ✅ Update `LOOP_STATE.yaml` with EPIC-CC-01 as active
2. ✅ Update `bmm-workflow-status.yaml` with corrected status
3. ✅ Create story files in `_bmad-output/sprint-artifacts/`
4. ✅ Begin CC-01 implementation immediately
5. ✅ Daily updates to governance files

### 8.2 What Happens on MODIFY

1. User specifies which stories to adjust
2. Team B revises estimates/scope
3. Updated proposal submitted for re-review

### 8.3 What Happens on REJECT

1. EPIC-CC-01 not created
2. Current broken state persists
3. User provides alternative direction

---

## Response Options

**User chooses one:**

| Command | Action |
|---------|--------|
| `APPROVE` | Start EPIC-CC-01 immediately |
| `MODIFY CC-XX` | Adjust specific story |
| `INVESTIGATE CC-XX` | More analysis on specific story |
| `REJECT` | Abandon corrective course |

---

*Generated by EXCALIBUR Sprint Planning Workflow*
*Correct-Course Protocol v2.0*
*Pending: User Authorization*
