# Enhanced Story Template
# Story-Cycle Workflow - User-Centric Story Template
# Purpose: Template for creating stories with Product Reality validation

version: "1.0.0"
last_updated: "2026-01-11"

---

# Story: {story_key}

**Title**: {story_title}
**Epic**: {epic_key}
**Points**: {story_points}
**Status**: {backlog|ready-for-dev|in-progress|review|done}

---

## Acceptance Criteria

1. [ ] **{criterion_1}**
   - {detail}

2. [ ] **{criterion_2}**
   - {detail}

3. [ ] **{criterion_3}**
   - {detail}

---

## Agentic & UX Context (REQUIRED)

### The User Journey

**Answer these 6 questions to define the user flow:**

1. **User starts at**: {Screen/State}
   - Where is the user when they begin?
   - Example: "On the Notes list page" or "In the chat panel"

2. **User performs**: {Action}
   - What does the user click/type/ask?
   - Example: "Clicks 'Summarize' button" or "Asks 'Summarize my notes'"

3. **System shows**: {Immediate UI Feedback}
   - What does user see RIGHT AFTER the action?
   - Example: "Spinner appears on button" or "Loading message shows"

4. **Result appears**: {Location}
   - Where does the final result appear?
   - Example: "Summary appears in a modal" or "Text replaces selection"

5. **User then**: {Next Action or Complete}
   - What can user do next?
   - Example: "Can edit summary or dismiss" or "Task is complete"

6. **If it fails**: {Error Handling}
   - What happens if something goes wrong?
   - Example: "Error toast with retry button" or "Fallback to manual input"

---

### Agent Tool Spec (if applicable)

**Does this story involve AI/LLM tool usage?**
- [ ] Yes - Fill out this section
- [ ] No - Skip to Dependencies

If Yes, specify:

#### Tool Definition

**Tool Name**: `{tool_name}`

**Description** (one sentence for LLM):
```
{Clear description of when LLM should use this tool}
```

**Trigger** (When user asks/hints):
```
User: "{example input that should trigger tool}"
→ Agent uses: {tool_name}
```

**NOT Trigger** (When NOT to use):
```
User: "{example input that should NOT trigger}"
→ Agent does: {something else}
```

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| {param_1} | {type} | {yes/no} | {description} |
| {param_2} | {type} | {yes/no} | {description} |

**Permission Level**: {auto_grant|user_confirm|admin_only}
**Reason**: {why this level}

**UI Context**:
- **While Thinking**: {what user sees during AI processing}
- **On Success**: {how result is displayed}
- **On Error**: {error message and recovery}

---

## Tasks/Subtasks

### Development Tasks

- [ ] **Task 1**: {task_description}
  - [ ] Subtask 1.1
  - [ ] Subtask 1.2

- [ ] **Task 2**: {task_description}
  - [ ] Subtask 2.1

### UX/Design Tasks

- [ ] **Design Review**: Verify journey flow matches expectations
  - [ ] Entry point is clear
  - [ ] Action is discoverable
  - [ ] Result location is obvious
  - [ ] Loading state exists
  - [ ] Error state exists

### Agent/AI Tasks (if applicable)

- [ ] **Tool Spec**: Define JSON Schema for LLM tool
  - [ ] Tool name and description defined
  - [ ] Parameters specified with types
  - [ ] Permission level set appropriately
  - [ ] UI context documented

### Testing Tasks

- [ ] **Unit Tests**: {list what to test}
- [ ] **Integration Tests**: {list what to test}
- [ ] **E2E Tests**: {list user flows to test}
- [ ] **State Coverage**: Test loading/empty/error states

---

## Dependencies

### Blocking Stories
- {story_key}: {reason}

### Technical Dependencies
- {dependency}: {reason}

---

## Dev Notes

### Architecture Requirements
{Any specific architectural patterns or constraints}

### Previous Learnings
{Relevant context from previous work}

### Technical Specifications
{Technical details that inform implementation}

---

## Dev Agent Record

### Implementation Plan
{Filled during implementation}

### Debug Log
{Filled during implementation}

### Completion Notes
{Filled when story is done}

---

## File List
{List of files modified/created/deleted}

---

## Change Log
{Summary of changes made}

---

## Status
{Current status: pending|ready-for-dev|in-progress|review|done}

---

## Validation Checklist (Story-Cycle Steps)

### Step 1a: User Journey Simulation (The Movie Script Test)
- [ ] 30-second demo script generated
- [ ] Journey map created
- [ ] Cohesion score >= 3
- [ ] No critical anti-patterns detected

### Step 2: Validate
- [ ] Prerequisites verified
- [ ] Dependencies complete
- [ ] Sprint capacity confirmed

### Step 3a: Agent Tool Spec (The Brain Check)
- [ ] Tool definitions created
- [ ] Permission levels appropriate
- [ ] UI context documented
- [ ] No critical anti-patterns detected

### Step 3: Implement
- [ ] All acceptance criteria implemented
- [ ] Code follows standards
- [ ] Tests written

### Step 4: Test
- [ ] All tests passing
- [ ] Coverage >= 80%
- [ ] No regressions

### Step 5: Review
- [ ] Code review approved
- [ ] Quality checks passed

### Step 6: Done
- [ ] All tasks complete
- [ ] sprint-status.yaml updated

### Step 6a: Reality Check (The Demo)
- [ ] End-to-end flow works
- [ ] All states verified
- [ ] No visual breaks
- [ ] Reality score >= 4

---

## Quality Gates Summary

| Gate | Status | Notes |
|------|--------|-------|
| Story Start Gate | {PASS|FAIL} | Step 2 |
| Product Reality Gate | {PASS|FAIL} | Step 1a |
| Agent Brain Gate | {PASS|FAIL} | Step 3a |
| Test Gate | {PASS|FAIL} | Step 4 |
| Done Gate | {PASS|FAIL} | Step 6 |
| Visual Reality Gate | {PASS|FAIL} | Step 6a |
