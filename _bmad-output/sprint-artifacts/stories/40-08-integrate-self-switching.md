---
story_key: "40-08-integrate-self-switching"
epic: 40
story: 8
status: "IN_PROGRESS"
created_at: "2026-01-10T09:45:00+07:00"
completed_at: null
points: 3
---

# Story 40-08: Integrate Self-Switching with useAgentChatWithTools

## User Story

**As a** user
**I want** the agent to automatically switch modes based on conversation context
**So that** I get relevant behavior without manually changing agent settings

## Acceptance Criteria

### AC-1: Hook Calls ModeClassifier on Each Message
**Given** the hook is configured with a workspace type
**When** a user sends a message
**Then** the hook should classify the mode using ModeClassifier

### AC-2: System Prompt Updates Dynamically
**Given** a mode is classified
**When** the mode changes from previous message
**Then** the SystemPromptComposer should be updated with the new mode

### AC-3: Mode Switching Logged for Observability
**Given** mode classification occurs
**When** mode is determined
**Then** the classification result should be logged to console

### AC-4: Smooth Transitions Between Modes
**Given** multiple messages in a conversation
**When** context shifts (e.g., from coding to notes)
**Then** mode should transition smoothly without breaking the conversation

## Tasks

- [x] T1: Add workspaceType option to hook parameters
- [x] T2: Integrate ModeClassifier.classifyMode in sendMessage
- [x] T3: Update SystemPromptComposer with classified mode
- [x] T4: Add console logging for mode transitions
- [ ] T5: Write unit tests for mode switching integration
- [ ] T6: Verify TypeScript compilation
- [ ] T7: Manual testing of mode transitions

## Dev Notes

### Dependencies
- Story 40-02 (Mode Classifier) - DONE ✅
- Story 40-07 (Prompt Orchestrator) - DONE ✅

### Integration Points
- Touches: src/lib/agent/hooks/use-agent-chat-with-tools.ts
- Uses: ModeClassifier from lib/agent/mode-classifier
- Uses: SystemPromptComposer from lib/agent/prompt-composer
- Uses: getAgentModeForClassifier, toComposerFormat from lib/agent/system-prompt
- Breaks: None (additive change)

### Implementation Details

The hook already contains the implementation (lines 19-21, 55-57, 393-441):

```typescript
// Import ModeClassifier and helpers
import { classifyMode } from '../mode-classifier';
import { getAgentModeForClassifier, toComposerFormat } from '../system-prompt';

// Add workspaceType to options
workspaceType?: "ide" | "notes" | "knowledge" | "study";

// Classify mode on each message
const classifyCurrentMode = useCallback((userMessage: string, currentMessages: typeof rawMessages) => {
    const classification = classifyMode({
        prompt: userMessage,
        workspaceType: options.workspaceType || 'ide',
        activeDocument: layerContext.activeFile ? {...} : undefined,
        conversationHistory: [...],
    });

    console.log('[useAgentChat] Mode classification:', {
        prompt: userMessage.substring(0, 50),
        classifiedMode: classification.mode,
        confidence: classification.confidence,
        reasoning: classification.reasoning,
    });

    return getAgentModeForClassifier(classification.mode);
}, [layerContext.activeFile, options.workspaceType]);

// Update SystemPromptComposer on sendMessage
const agentMode = classifyCurrentMode(content, rawMessages);
promptComposer.updateConfig({ agentMode: toComposerFormat(agentMode) });
console.log('[useAgentChat] Mode switched to:', agentMode.id, agentMode.name);
```

### Files to Modify
- src/lib/agent/hooks/use-agent-chat-with-tools.ts (already implemented, need tests)
- src/lib/agent/hooks/__tests__/use-agent-chat-with-tools.test.ts (new tests)

### References

- Epic: `_bmad-output/sprint-artifacts/epic-40-agent-chat-remediation-sprint-2026-01-10.md`
- Story 40-02: Mode Classifier (DONE)
- Story 40-07: Prompt Orchestrator (DONE)

## Status History

| Status | Timestamp | Agent | Notes |
|--------|-----------|-------|-------|
| backlog | 2026-01-10T09:00:00+07:00 | SM | Created from EPIC-40 remediation |
| in_progress | 2026-01-10T09:45:00+07:00 | Dev | Implementation already exists, creating tests |

## Dev Agent Record

### Agent
- Model: claude-opus-4-5-20251101
- Session: 2026-01-10T09:45:00+07:00

### Task Progress
- [x] T1: Add workspaceType option to hook parameters
- [x] T2: Integrate ModeClassifier.classifyMode in sendMessage
- [x] T3: Update SystemPromptComposer with classified mode
- [x] T4: Add console logging for mode transitions
- [ ] T5: Write unit tests for mode switching integration
- [ ] T6: Verify TypeScript compilation
- [ ] T7: Manual testing of mode transitions

### Files Changed
| File | Action | Lines |
|------|--------|-------|
| src/lib/agent/hooks/use-agent-chat-with-tools.ts | Already implemented | ~60 lines (lines 19-21, 55-57, 393-441) |

### Tests Created
- Pending: use-agent-chat-with-tools mode switching tests

## Code Review

**Reviewer:** TBD
**Date:** TBD

### Checklist
- [ ] All ACs verified
- [ ] All tests passing
- [ ] Architecture patterns followed
- [ ] No TypeScript errors
- [ ] Code quality acceptable

### Sign-off
[ ] APPROVED for merge
