---
story_key: "40-07-prompt-orchestrator"
epic: 40
story: 7
status: "in_progress"
created_at: "2026-01-10T09:35:00+07:00"
points: 4
---

# Story 40-07: Implement Prompt Orchestrator

## User Story

**As a** system architect
**I want** a PromptOrchestrator that dynamically builds system prompts
**So that** the agent can automatically switch modes based on context and expose appropriate tools

## Acceptance Criteria

### AC-1: PromptOrchestrator Uses One Centralized Template
**Given** the PromptOrchestrator class
**When** building a system prompt
**Then** it should use ORCHESTRATOR_SYSTEM_PROMPT as the base template

### AC-2: Dynamic Mode Injection Based on ModeClassifier
**Given** a context with prompt, workspace, document, and conversation
**When** buildPrompt() is called
**Then** it should use ModeClassifier to determine the optimal mode
**And** inject the mode-specific prompt section

### AC-3: Tool Descriptions Filtered by Mode
**Given** a mode classification result
**When** building the prompt
**Then** only tools allowed for that mode should be included in the prompt

### AC-4: Context Injection
**Given** workspace, documents, and conversation context
**When** building the prompt
**Then** this context should be injected into the appropriate prompt sections

### AC-5: Integration with 5-Layer Prompt Composer
**Given** the SystemPromptComposer
**When** PromptOrchestrator builds the final prompt
**Then** it should integrate with or be compatible with the 5-layer architecture

## Tasks

- [ ] T1: Create PromptOrchestrator class in src/lib/agent/prompt-orchestrator.ts
- [ ] T2: Implement buildPrompt() method using ModeClassifier
- [ ] T3: Integrate with CentralizedToolRegistry for tool filtering
- [ ] T4: Integrate with SystemPromptComposer for final output
- [ ] T5: Write unit tests for PromptOrchestrator
- [ ] T6: Verify TypeScript compilation

## Dev Notes

### Dependencies
- Story 40-01 (Tool Registry) - DONE ✅
- Story 40-02 (Mode Classifier) - Already implemented ✅

### Existing Components to Integrate
- `src/lib/agent/mode-classifier.ts` - Mode classification
- `src/infrastructure/tools/centralized-tool-registry.ts` - Tool filtering
- `src/lib/agent/system-prompt.ts` - Prompt templates
- `src/lib/agent/prompt-composer.ts` - 5-layer composer

### Integration Points
- Touches: src/lib/agent/prompt-orchestrator.ts (new file)
- Touches: src/lib/agent/hooks/use-agent-chat-with-tools.ts (will use PromptOrchestrator)

### Implementation Details

The PromptOrchestrator should:

1. **Accept context** from the chat hook:
   - User prompt
   - Workspace type
   - Active document
   - Conversation history

2. **Classify mode** using ModeClassifier:
   - Returns mode + confidence + reasoning

3. **Filter tools** using CentralizedToolRegistry:
   - Filter by mode (allowedModes)
   - Filter by workspace (allowedWorkspaces)
   - Return tool definitions

4. **Build prompt** using system-prompt templates:
   - Use ORCHESTRATOR_SYSTEM_PROMPT as base
   - Inject mode-specific prompt section
   - Add tool descriptions
   - Add context sections

### Files to Create/Modify
- NEW: src/lib/agent/prompt-orchestrator.ts
- MODIFY: src/lib/agent/hooks/use-agent-chat-with-tools.ts (to use PromptOrchestrator)

### References

- Epic: `_bmad-output/sprint-artifacts/epic-40-agent-chat-remediation-sprint-2026-01-10.md`
- Story 40-01: Tool Registry (DONE)
- Story 40-02: Mode Classifier (implemented)
- src/lib/agent/mode-classifier.ts
- src/lib/agent/system-prompt.ts
- src/lib/agent/prompt-composer.ts

## Status History

| Status | Timestamp | Agent | Notes |
|--------|-----------|-------|-------|
| backlog | 2026-01-10T12:00:00+07:00 | SM | Created from EPIC-40 remediation |
| in_progress | 2026-01-10T09:35:00+07:00 | Opus | Starting implementation |

## Dev Agent Record

### Agent
- Model: claude-opus-4-5-20251101
- Session: 2026-01-10T09:35:00+07:00

### Task Progress
- [ ] T1: Create PromptOrchestrator class in src/lib/agent/prompt-orchestrator.ts
- [ ] T2: Implement buildPrompt() method using ModeClassifier
- [ ] T3: Integrate with CentralizedToolRegistry for tool filtering
- [ ] T4: Integrate with SystemPromptComposer for final output
- [ ] T5: Write unit tests for PromptOrchestrator
- [ ] T6: Verify TypeScript compilation

### Files Changed
| File | Action | Lines |
|------|--------|-------|
| src/lib/agent/prompt-orchestrator.ts | Create | TBD |

### Tests Created
- TBD

### TypeScript Check
⏳ PENDING

### Test Results
⏳ PENDING

### Decisions Made
- TBD

## Code Review

**Reviewer:** TBD
**Date:** TBD

### Checklist
- [ ] All ACs verified
- [ ] All tests passing
- [ ] Architecture patterns followed
- [ ] No TypeScript errors
- [ ] Code quality acceptable

### Issues Found
- TBD

### Sign-off
[ ] APPROVED for merge
