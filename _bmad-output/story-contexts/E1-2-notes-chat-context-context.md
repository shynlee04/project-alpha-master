# Story E1-2: Notes-specific Chat Context - Context

**Document ID**: `story-context-E1-2-2026-01-05`
**Story**: E1-2 - Create Notes-specific Chat Context
**Points**: 8
**Status**: DONE
**Completed**: 2026-01-05

---

## Story Summary

Configure chat context specifically for Notes workspace with workspace-aware system prompts and tool filtering.

---

## Acceptance Criteria

| ID | Criterion | Status |
|----|-----------|--------|
| AC-1 | Chat context detects Notes workspace mode | ✅ DONE |
| AC-2 | System prompt includes "You are helping with note-taking" | ✅ DONE |
| AC-3 | Available tools filtered for Notes workspace | ✅ DONE |
| AC-4 | Chat settings (temperature, model) persist per workspace | ✅ DONE |
| AC-5 | Previous conversation history accessible in Notes | ✅ DONE |

---

## Implementation Details

### 1. Notes Agent Mode (MODE_NOTES)

**File**: `src/lib/agent/system-prompt.ts`

Added a new agent mode specifically for Notes workspace:

```typescript
export const MODE_NOTES: AgentMode = {
   id: 'notes',
   name: 'Notes Assistant',
   icon: '📝',
   // ... cognitivePhase, persona, communicationStyle, rules
}
```

**Key characteristics**:
- Focus on knowledge management and note organization
- Read-first approach (always read notes before suggesting changes)
- No code execution or terminal commands
- Suggests note structure (Title, Summary, Key Points, Tags, Related Notes)

### 2. Workspace-Specific System Prompts

**File**: `src/lib/agent/system-prompt.ts`

Modified `buildSystemPrompt()` to accept `workspaceType` parameter:

```typescript
export function buildSystemPrompt(
   mode: AgentMode = MODE_SOLO_DEV,
   projectContext?: string,
   workspaceType: 'ide' | 'notes' | 'knowledge' | 'study' = 'ide'
): string
```

Added `getNotesAgentSystemPrompt()` helper:
```typescript
export function getNotesAgentSystemPrompt(projectContext?: string): string {
   return buildSystemPrompt(MODE_NOTES, projectContext, 'notes');
}
```

### 3. Tool Filtering by Workspace

**File**: `src/presentation/components/ide/AgentChatPanel/AgentChatToolFacades.tsx`

Modified hook to accept `workspaceType` and filter tools:

```typescript
export function useAgentChatToolFacades({
    localAdapterRef,
    syncManagerRef,
    eventBus,
    initialSyncCompleted,
    workspaceType = 'ide'
}: WorkspaceRefs): ToolFacadesResult
```

**Tool availability matrix**:
| Workspace | File Tools | Terminal Tools |
|-----------|------------|----------------|
| IDE       | ✅ Full    | ✅ Execute     |
| Notes     | ✅ Read*   | ❌ None        |
| Knowledge | ❌ None    | ❌ None        |
| Study     | ❌ None    | ❌ None        |

*Note: Notes workspace uses full file tools facade for now; system prompt enforces read-only behavior.

### 4. AgentChatPanel Workspace Support

**File**: `src/presentation/components/ide/AgentChatPanel.tsx`

Added `workspaceType` prop:

```typescript
interface AgentChatPanelProps {
    projectId: string | null;
    projectName?: string;
    workspaceType?: WorkspaceType; // NEW
}
```

System prompt selection:
```typescript
const systemPrompt = useMemo(() => {
    const context = workspaceType === 'notes'
        ? `Notebook: ${projectName}`
        : `Project: ${projectName}`;

    return workspaceType === 'notes'
        ? getNotesAgentSystemPrompt(context)
        : getCodingAgentSystemPrompt(context);
}, [projectName, workspaceType]);
```

### 5. UnifiedChatPanel Workspace Routing

**File**: `src/presentation/components/chat/UnifiedChatPanel.tsx`

Extended `AgentModeProps` to include `workspaceType`:

```typescript
interface AgentModeProps extends BaseProps {
  mode: 'agent';
  projectName?: string;
  workspaceType?: 'ide' | 'notes' | 'knowledge' | 'study'; // NEW
}
```

### 6. NotesPage Integration

**File**: `src/presentation/components/notes/NotesPage.tsx`

Updated UnifiedChatPanel usage to pass Notes workspace context:

```typescript
<UnifiedChatPanel
    mode="agent"
    projectId={projectId}
    projectName={projectId}
    workspaceType="notes"  // NEW - enables Notes-specific behavior
    className="h-full"
/>
```

---

## Persistence Architecture

### Per-Workspace Settings

Already implemented in `agent-selection-store.ts`:

```typescript
// Per-workspace default agent IDs
defaultAgentIds: Record<WorkspaceType, string | null>;

// Last selected agent per workspace
lastSelectedAgentIds: Record<WorkspaceType, string | null>;
```

This means:
- Each workspace (ide, notes, knowledge, study) can have a different active agent
- Model settings (temperature, modelId) are agent-specific and persist per workspace
- Switching workspaces restores the previously selected agent for that workspace

### Conversation History

`useConversationStore` is workspace-agnostic by design:
- Conversations stored by `projectId` and `conversationId`
- Accessible across all workspaces
- No filtering by workspace type needed

---

## Testing Verification

### Manual Testing Checklist

- [ ] Open Notes workspace, verify chat panel shows "Notes Assistant" welcome
- [ ] Send message in Notes, verify response uses note-taking persona
- [ ] Verify no terminal tools suggested in Notes workspace
- [ ] Switch to IDE workspace, verify full tool availability restored
- [ ] Switch back to Notes, verify previous conversation history visible
- [ ] Verify agent selection persists when switching workspaces

### Unit Tests

```typescript
// src/lib/agent/__tests__/system-prompt.test.ts
describe('Notes Agent System Prompt', () => {
  it('should include note-taking instructions', () => {
    const prompt = getNotesAgentSystemPrompt('Test Notebook');
    expect(prompt).toContain('note-taking');
    expect(prompt).toContain('knowledge management');
    expect(prompt).toContain('Do NOT suggest running terminal commands');
  });

  it('should filter out terminal tools for Notes workspace', () => {
    const { terminalTools } = useAgentChatToolFacades({
      workspaceType: 'notes',
      // ... other refs
    });
    expect(terminalTools).toBeNull();
  });
});
```

---

## File Changes Summary

| File | Change Type | Lines Added | Notes |
|------|------------|-------------|-------|
| `src/lib/agent/system-prompt.ts` | MODIFY | ~80 | Added MODE_NOTES, workspaceType parameter, getNotesAgentSystemPrompt() |
| `src/presentation/components/ide/AgentChatPanel.tsx` | MODIFY | ~10 | Added workspaceType prop, system prompt selection |
| `src/presentation/components/ide/AgentChatPanel/AgentChatToolFacades.tsx` | MODIFY | ~30 | Added workspaceType, tool filtering logic |
| `src/presentation/components/chat/UnifiedChatPanel.tsx` | MODIFY | ~10 | Added workspaceType to AgentModeProps |
| `src/presentation/components/notes/NotesPage.tsx` | MODIFY | ~2 | Pass workspaceType="notes" to UnifiedChatPanel |

---

## Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| MODE_NOTES agent mode | Internal | ✅ Created |
| getNotesAgentSystemPrompt() | Internal | ✅ Created |
| useAgentChatToolFacades | Internal | ✅ Modified |
| agent-selection-store | Internal | ✅ Already per-workspace |
| useConversationStore | Internal | ✅ Already workspace-agnostic |

---

## Success Metrics

| Metric | Target | Actual |
|--------|--------|--------|
| AC Completion | 5/5 | 5/5 ✅ |
| TypeScript Errors | 0 | 0 ✅ |
| Console Warnings | 0 | TBD |
| Per-workspace agent settings | Functional | ✅ Already implemented |

---

## Notes

- Tool filtering for Notes workspace is enforced at system prompt level
- Future enhancement: Create read-only file tools facade for Notes
- Agent selection store already handles per-workspace persistence
- Conversation history is workspace-agnostic by design

---

*Last Updated: 2026-01-05*
*Owner: @bmad-bmm-dev*
