# 46-02: Workspace-Specific System Prompts

**Epic:** EPIC-46 - Space-Aware Agent Orchestration
**Story:** 46-02
**Status:** READY
**Created:** 2026-01-14
**Priority:** P1-HIGH
**Team:** Team A

---

## User Story

**As a** user interacting with the AI agent
**I want** the agent to use system prompts customized for my current workspace
**So that** the AI only suggests actions available in that workspace and doesn't confuse me with unavailable tools

---

## Current Problem

### Static System Prompts

The current `system-prompt.ts` has:
- `buildSystemPrompt()` that takes optional `workspaceType` parameter
- Mode-specific prompts (CODING, KNOWLEDGE, ORCHESTRATOR)
- But the prompt doesn't list available tools per workspace

### User Impact

When a user is in the Notes workspace and asks for help:
- AI might suggest `execute_command` (not available in Notes)
- AI might suggest file operations (limited in Notes)
- User gets confused trying unavailable features

---

## Acceptance Criteria

### AC1: System Prompt Includes Available Tools List
- [ ] Prompt lists tools available in current workspace
- [ ] Prompt indicates which tools are unavailable
- [ ] Tool list dynamically generated from agent configuration

### AC2: Prompt Explains Unavailable Tools
- [ ] Clear message: "Some tools are not available in this workspace"
- [ ] Lists which tools the user would have in other workspaces
- [ ] Suggests switching workspaces if needed

### AC3: Workspace-Specific Prompts Generated
- [ ] IDE workspace prompt: File operations, terminal, code execution
- [ ] Notes workspace prompt: Note CRUD, search, organization
- [ ] Knowledge workspace prompt: Synthesis, PDF processing, web content
- [ ] Study workspace prompt: Research, analysis, reference materials

### AC4: Browser Mode Uses Same Logic
- [ ] Browser mode treated like regular Notes workspace
- [ ] Tools filtered appropriately for browser mode
- [ ] Prompt mentions "Browser Mode" context

---

## Technical Implementation

### Approach: Workspace Prompt Builder

Create a new `workspace-prompt-builder.ts` that:
1. Uses `filterToolsForWorkspace()` to get available tools
2. Generates tool list section for system prompt
3. Appends to mode-specific prompts
4. Caches prompts per workspace-type/mode combination

### Files to Create

#### 1. `src/lib/agent/workspace-prompt-builder.ts`

```typescript
import { filterToolsForWorkspace } from './workspace-tool-filter';
import { WorkspacePermissionManager } from './workspace-permission-manager';
import { ToolPermissionManager } from './tool-permission-manager';
import type { AgentData, WorkspaceContext } from './agent-types';
import type { AgentMode } from '@/domain/tools/tool-definition';

/**
 * Build workspace-specific tool list for system prompt
 */
export function buildToolListPrompt(
  agent: AgentData,
  workspaceContext: WorkspaceContext
): string {
  const permissionManager = new WorkspacePermissionManager(
    ToolPermissionManager.getInstance()
  );

  const filtered = filterToolsForWorkspace(
    agent,
    workspaceContext,
    permissionManager
  );

  // Available tools section
  const availableTools = filtered.available.map(t => `- ${t.toolId}: ${t.description}`);
  const unavailableTools = filtered.blocked.map(t => `- ${t.toolId}: ${t.reason}`);

  let prompt = `
## Available Tools

You have access to the following tools in this workspace:

${availableTools.join('\n')}
`;

  // Unavailable tools section
  if (unavailableTools.length > 0) {
    prompt += `
## Unavailable Tools

The following tools are NOT available in this workspace:
${unavailableTools.map(t => `- ${t.toolId}: ${t.reason}`).join('\n')}

If you need to use these tools, suggest the user switch to the appropriate workspace.
`;
  }

  return prompt;
}

/**
 * Build complete system prompt for workspace
 */
export function buildWorkspaceSystemPrompt(
  mode: AgentMode,
  agent: AgentData,
  workspaceContext: WorkspaceContext
): string {
  // Get mode-specific base prompt
  const modePrompt = getModePrompt(mode);

  // Add workspace-specific tool list
  const toolList = buildToolListPrompt(agent, workspaceContext);

  // Add workspace context
  const workspaceInfo = `
## Current Workspace

You are in the **${workspaceContext.workspaceType}** workspace.
${workspaceContext.projectPath ? `Project: ${workspaceContext.projectPath}` : ''}
`;

  return modePrompt + workspaceInfo + toolList;
}
```

### Files to Modify

#### 2. `src/lib/agent/system-prompt.ts`

Add export for `buildWorkspaceSystemPrompt`:

```typescript
// Re-export from workspace-prompt-builder
export { buildWorkspaceSystemPrompt, buildToolListPrompt } from './workspace-prompt-builder';
```

#### 3. `src/lib/agent/factory.ts`

Integrate workspace prompts into agent creation:

```typescript
import { buildWorkspaceSystemPrompt } from './workspace-prompt-builder';

// In createAgentClientTools or equivalent:
const systemPrompt = buildWorkspaceSystemPrompt(
  mode,
  agent,
  workspaceContext
);
```

---

## Prompt Examples

### IDE Workspace Prompt

```
# Coding Mode

You are now in CODING mode. Your focus is on implementing, fixing, and building code.

## Current Workspace
You are in the **ide** workspace.
Project: /Users/user/project-alpha

## Available Tools
- read_file: Read file content
- write_file: Create or modify files
- list_files: List directory contents
- execute_command: Run terminal commands
```

### Notes Workspace Prompt

```
# Knowledge Mode

You are now in KNOWLEDGE mode. Your focus is on notes and information management.

## Current Workspace
You are in the **notes** workspace.

## Available Tools
- create_note: Create a new note
- read_note: Read note content
- update_note: Modify existing notes
- delete_note: Remove notes
- list_notes: List all notes
- search_notes: Search note content

## Unavailable Tools
The following tools are NOT available in this workspace:
- execute_command: Terminal commands are only available in IDE workspace
- write_file: File editing is only available in IDE workspace
```

### Browser Mode Prompt

```
# Knowledge Mode

You are now in KNOWLEDGE mode.

## Current Workspace
You are in the **notes** workspace (Browser Mode).
You can view and edit notes from all projects without selecting a specific project.

## Available Tools
- create_note: Create a new note (saved to browser mode)
- read_note: Read note content
- update_note: Modify existing notes
- list_notes: List all notes from all projects
```

---

## Design Notes

### Prompt Caching

Building prompts dynamically on every message is expensive. We should cache:

```typescript
const promptCache = new Map<string, string>();

function getCachedPrompt(
  mode: AgentMode,
  workspaceType: string,
  agentToolsHash: string
): string {
  const key = `${mode}:${workspaceType}:${agentToolsHash}`;

  if (promptCache.has(key)) {
    return promptCache.get(key)!;
  }

  const prompt = buildWorkspaceSystemPrompt(mode, agent, workspaceContext);
  promptCache.set(key, prompt);
  return prompt;
}
```

### Tool Description Format

The tool list should be concise. Use:
- Tool ID
- One-line description
- Not full parameter documentation (LLM gets that from schema)

---

## Implementation Tasks

| Task | Type | Effort | Depends On |
|------|------|--------|------------|
| Create workspace-prompt-builder.ts | Implementation | 45m | - |
| Update system-prompt.ts exports | Implementation | 15m | Builder |
| Integrate into agent factory | Implementation | 30m | Builder |
| Add prompt caching | Implementation | 30m | Builder |
| Test prompts in all workspaces | Testing | 30m | All above |
| Verify browser mode prompts | Testing | 15m | All above |

**Total Estimated Effort:** ~2.5 hours

---

## Testing Checklist

### Unit Tests
- [ ] `buildToolListPrompt()` returns correct tool list
- [ ] `buildToolListPrompt()` handles empty available tools
- [ ] `buildWorkspaceSystemPrompt()` combines mode + workspace + tools

### Integration Tests
- [ ] IDE workspace prompt includes file tools
- [ ] Notes workspace prompt includes note tools
- [ ] Prompt shows unavailable tools section
- [ ] Browser mode prompt mentions "Browser Mode"

### Manual Testing
- [ ] Ask AI to "run tests" in Notes workspace → should say not available
- [ ] Ask AI to "create a note" in IDE workspace → should suggest switching or use note tool

---

## Handoff

**Story Status:** READY TO IMPLEMENT
**Next Phase:** Implementation

### Files Created
- [x] Story artifact (this file)

### Files to Create
1. `src/lib/agent/workspace-prompt-builder.ts`

### Files to Modify
1. `src/lib/agent/system-prompt.ts`
2. `src/lib/agent/factory.ts`

---

## Notes

**Why This Matters:**

1. **User Expectations** - AI only suggests available actions
2. **Reduced Confusion** - No "tool not found" errors from bad suggestions
3. **Workspace Switching** - AI can suggest switching workspaces proactively
4. **Better UX** - Clear indication of what's possible where

**Complexity Consideration:**

This is a P1 feature because:
- Significantly improves user experience
- Builds on existing infrastructure
- Low implementation risk
- Foundation for workspace-aware behavior

**Dependencies:**

- Requires `workspace-tool-filter.ts` (already exists)
- Requires `system-prompt.ts` (already exists)
- Can be implemented independently of 46-03, 46-04
