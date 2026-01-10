# EPIC-40 System Prompt Architecture - Handoff

**Date:** 2026-01-10
**Status:** PARTIALLY COMPLETE - Type errors remain
**Epic:** EPIC-40 - Agent Chat Self-Switching & Tool Registry
**Story:** 40-07 - Implement Prompt Orchestrator

---

## What Was Done

### 1. New System Prompt Architecture (`src/lib/agent/system-prompt.ts`)

**Two-Layer Architecture Implemented:**

```typescript
// LAYER 1: ORCHESTRATOR (Meta-Level)
export const ORCHESTRATOR_SYSTEM_PROMPT = `
# You are Via-Gent Agent Orchestrator

Your job is to understand the user's request and switch to the appropriate mode.

## How You Work
You analyze FOUR context sources to decide on mode:
1. Initiating Prompt - What the user just asked
2. Workspace Type - ide, notes, knowledge, or study
3. Active Document - File currently open (extension indicates context)
4. Conversation History - Recent modes used

## Your First Response
ALWAYS start with a conversational response explaining your mode choice:
"I see you're [context]. Based on your request to [request],
I'm switching to **[MODE]** mode to help you [expected outcome]."
`;

// LAYER 2: MODE-SPECIFIC PROMPTS
export const MODE_CODING_PROMPT = `...`;      // For code execution
export const MODE_KNOWLEDGE_PROMPT = `...`;    // For notes/knowledge
export const MODE_ORCHESTRATOR_SUB_PROMPT = `...`; // For planning/analysis
```

**Key Changes:**
- Removed duplicate `AgentModeType` - now uses `AgentMode` from domain layer
- Renamed legacy `AgentMode` interface to `AgentModeConfig` to avoid conflicts
- Added `toComposerFormat()` adapter to bridge new architecture with `SystemPromptComposer`

### 2. ModeClassifier Integration (`src/lib/agent/mode-classifier.ts`)

- Re-exported `ContextSources` type for use in hook
- `classifyMode()` function analyzes 4 context sources and returns mode with confidence

### 3. Agent Chat Hook Updates (`src/lib/agent/hooks/use-agent-chat-with-tools.ts`)

- Added `toComposerFormat` import
- Fixed `activeDocument` to include `path` property (required by `DocumentContext`)
- Hook now: `classifyMode()` → `getAgentModeForClassifier()` → `toComposerFormat()` → `promptComposer.updateConfig()`

### 4. Tool Catalog (`src/infrastructure/tools/tool-catalog.ts`)

- Note tools registered (5 tools: create_note, read_note, update_note, delete_note, list_notes)
- Category `notes` added with count 5
- All note tools configured for `['knowledge', 'orchestrator']` modes and `['notes', 'knowledge']` workspaces

---

## Known Issues / What's Broken

### TypeScript Errors (Approximately 15-20 remaining)

**Note Tool Type Mismatches:**
```
src/domain/tools/note/create-note-tool.ts(57,31): error TS2345
src/domain/tools/note/delete-note-tool.ts(45,31): error TS2345
src/domain/tools/note/list-notes-tool.ts(59,30): error TS2345
src/domain/tools/note/read-note-tool.ts(48,29): error TS2345
src/domain/tools/note/update-note-tool.ts(51,31): error TS2345
```

**Root Cause:** `NoteOperationResult<T>` generic was added but tool implementations still return incompatible types. The `NoteRecord` domain entity uses `blocks: Block[]` (BlockNote), but tool schemas expect `content: string` (markdown).

**Fix Needed:** Either:
1. Create a `NoteData` type that matches tool schemas and convert `NoteRecord` → `NoteData` in implementations
2. Or update tool schemas to match `NoteRecord` structure

**Other Errors:**
- Some unused variable warnings in various files
- Some component prop type issues

---

## What Needs To Be Completed

### 1. Fix Note Tool Type Mismatches (BLOCKING)

**File:** `src/domain/tools/note/types.ts`
- Already has `NoteData` interface defined with `content: string`
- `NoteOperationResult<T>` is generic

**Files to Update:**
- `create-note-tool.ts` - Convert `NoteRecord` result to `NoteData` before returning
- `read-note-tool.ts` - Convert blocks to markdown content
- `update-note-tool.ts` - Convert blocks to markdown content
- `delete-note-tool.ts` - Return proper structure
- `list-notes-tool.ts` - Convert each note's blocks to markdown

**Conversion Helper Needed:**
```typescript
// In src/lib/notes/markdown-converter.ts or similar
export function noteRecordToNoteData(record: NoteRecord): NoteData {
  return {
    id: record.id,
    title: record.title,
    content: blocksToMarkdown(record.blocks), // Need this function
    parentId: record.parentId || null,
    createdAt: new Date(record.createdAt).toISOString(),
    updatedAt: new Date(record.updatedAt).toISOString(),
  };
}
```

### 2. Wire Tools to Frontend UI

**Where Agent Chat is Used:**
- IDE workspace
- Notes workspace (should work in both)

**Components That May Need Updates:**
- `src/presentation/components/agent/` - Check all agent components
- `src/routes/` - Check workspace routes that use agent chat

**Required Props Pattern:**
```typescript
// Each workspace component using agent chat needs:
const { sendMessage, messages, toolCalls, pendingApprovals, approveToolCall, rejectToolCall } =
  useAgentChatWithTools({
    fileTools,      // From workspace context
    terminalTools,  // From workspace context
    workspaceType,  // 'ide' | 'notes' | 'knowledge' | 'study'
    conversationId,
    threadId,
  });
```

### 3. Test the End-to-End Flow

**Test Scenarios:**
1. User sends "create a note about X" in notes workspace → Agent switches to knowledge mode, create_note tool available
2. User sends "fix this bug" in IDE workspace → Agent switches to coding mode, read_file/write_file tools available
3. User sends "plan my architecture" → Agent switches to orchestrator mode, read-only tools available

**Verification Points:**
- Mode classification works (check console logs)
- System prompt changes based on mode
- Tools are filtered by mode/permission/workspace
- UI shows tool approvals correctly
- Tool execution completes and returns results

---

## File Reference Summary

### Modified Files
| File | Changes | Status |
|------|---------|--------|
| `src/lib/agent/system-prompt.ts` | Complete rewrite with two-layer architecture | ✅ Compiles |
| `src/lib/agent/mode-classifier.ts` | Added re-exports | ✅ Compiles |
| `src/lib/agent/hooks/use-agent-chat-with-tools.ts` | Type fixes, adapter usage | ⚠️ May have issues |
| `src/infrastructure/tools/tool-catalog.ts` | Note tools registered | ✅ Compiles |
| `src/domain/tools/note/types.ts` | Added generic `NoteOperationResult<T>` | ⚠️ Needs implementations updated |

### New Types Introduced
| Type | Location | Purpose |
|------|----------|---------|
| `AgentMode` | `@/domain/tools/tool-definition` | `'coding' \| 'knowledge' \| 'orchestrator'` |
| `AgentModeConfig` | `system-prompt.ts` | `{ id, name, icon, prompt }` - Legacy format |
| `NoteData` | `domain/tools/note/types.ts` | Note with markdown content |
| `NoteOperationResult<T>` | `domain/tools/note/types.ts` | Generic wrapper for tool results |

---

## For the Next Team

### Immediate Priorities
1. **Fix TypeScript errors** - Run `pnpm tsc --noEmit` and address all errors
2. **Implement block→markdown conversion** - Notes use BlockNote blocks, tools need markdown strings
3. **Wire tool approvals in UI** - Ensure nested components receive proper props
4. **Test CRUD operations** - Create, read, update, delete notes through agent

### Architecture Notes
- **Two-layer prompts**: Orchestrator (selector) → Mode-specific (execution)
- **Mode auto-switching**: Based on 4 context sources (prompt, workspace, document, history)
- **Tool filtering**: By mode, workspace, permissions via centralized registry
- **Legacy bridge**: `toComposerFormat()` adapts new system to existing `SystemPromptComposer`

### Testing Checklist
- [ ] TypeScript compiles without errors
- [ ] Agent responds with conversational mode switch message
- [ ] Correct tools are available in each mode
- [ ] Tool approvals show in UI for high-risk operations
- [ ] Note CRUD operations complete successfully
- [ ] Mode switches correctly when context changes

---

## Contact/Context

- **Epic:** EPIC-40 - Agent Chat Self-Switching & Tool Registry
- **Sprint:** Remediation Sprint 2026-01-10
- **Stories:** 40-01 through 40-05 (Foundation + Note Tools)
- **Next Stories:** 40-06 through 40-09 (Prompt Integration)

*Handoff created: 2026-01-10*
