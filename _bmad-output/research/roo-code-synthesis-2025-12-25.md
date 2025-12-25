# Roo Code Architecture Synthesis for Via-gent

**Document ID:** RESEARCH-2025-12-25-RooCodeSynthesis  
**Created:** 2025-12-25T19:15:00+07:00  
**Purpose:** Extract applicable patterns from Roo Code (VSCode extension) for Via-gent (browser-based IDE)  
**Epic Traceability:** Epic 29 (Agentic Execution Loop), MVP-3, MVP-4

---

## Executive Summary

Roo Code is a VSCode extension implementing an agentic coding assistant. While it uses XML-based tool calls (vs our TanStack AI SDK function calling), many architectural patterns are directly applicable to Via-gent.

**Key Differences:**
| Aspect | Roo Code | Via-gent |
|--------|----------|----------|
| Platform | VSCode Extension | Browser (WebContainer) |
| Tool Calls | XML tags in text | TanStack AI function calling |
| Confirmation | YOLO mode or user approval | Auto for reads, approval for writes |
| File Access | Native FS | File System Access API + WC |

> [!IMPORTANT]
> **ROOT CAUSE IDENTIFIED**: Roo Code appends tool errors to conversation so LLM can self-correct. Our TanStack AI setup returns `{ success: false, error }` but the **LLM may not be seeing these errors formatted in a way it can understand and retry**.

---

## Applicable Patterns

### 1. ✅ YOLO Mode (Auto-Execute)

**Roo Pattern:**
- YOLO mode = auto-approve tools, agent runs autonomously
- Non-destructive tools (read_file, list_files) can run multiple per turn
- Destructive tools (write_file, execute_command) may require approval in non-YOLO

**Via-gent Application:**
We should implement similar tiered approval:
- **Auto-run:** `read_file`, `list_files`, `search_files`
- **Require approval:** `write_file`, `delete_file`, `execute_command`
- **YOLO toggle:** User can enable full auto-execution

### 2. ✅ Error Feedback Loop (CRITICAL)

**Roo Pattern:**
> When tools fail, error is appended to conversation so LLM can self-correct on next turn. Only after X failures does it stop for user decision.

**Via-gent Application:**
This is **exactly what's missing** in our current implementation!

Current flow:
```
Agent calls tool → Tool fails → Error logged to console → Agent never sees it
```

Required flow:
```
Agent calls tool → Tool fails → Error appended to message stream
→ Agent sees error → Agent self-corrects → Retry
→ After 3 failures → Stop, ask user for guidance
```

**Action Item (High Priority):**
```typescript
// In factory.ts tool handlers
catch (error) {
    return { 
        success: false, 
        error: error.message,
        retryable: true,
        attempt: currentAttempt,
        maxAttempts: 3
    };
}
```

### 3. ✅ Multiple Non-Mutating Tools Per Turn

**Roo Pattern:**
> Read and list operations can be batched (max 5 files)

**Via-gent Application:**
TanStack AI's `agentLoopStrategy: maxIterations(3)` already supports this. Each iteration can call multiple tools if needed.

### 4. ✅ Efficient Reading Strategy

**Roo Pattern:**
> "Read all related files together (max 5 files), use line ranges for large files"

**Via-gent Application:**
- Our `read_file` should support `startLine/endLine` parameters
- Batch reads: `read_files(paths: string[])`
- Max 5 files prevents context overflow

**Action Item:**
```typescript
// read-file-tool.ts enhancement
interface ReadFileInput {
    path: string;
    startLine?: number;
    endLine?: number;
}
```

### 3. ✅ Surgical Edits vs Full Rewrites

**Roo Pattern:**
`apply_diff` tool with SEARCH/REPLACE blocks instead of `write_to_file` for existing files.

**Via-gent Application:**
We currently have only `write_file`. Consider adding:
```typescript
// New tool: apply_diff
{
    path: string;
    diffs: Array<{
        startLine: number;
        searchContent: string;
        replaceContent: string;
    }>;
}
```

**Benefits:**
- Preserves Monaco history/undo
- Smaller context windows
- Better conflict resolution

### 4. ✅ Todo List Tracking

**Roo Pattern:**
```
[ ] pending
[-] in_progress
[x] completed
```

**Via-gent Application:**
Our agent should produce task lists in responses and track completion. Integrate with:
- `update_todo_list` tool or structured response format
- UI component to display agent's internal checklist

### 5. ✅ Semantic Search First

**Roo Pattern:**
> "For ANY exploration of code you haven't examined yet, you MUST use codebase_search FIRST"

**Via-gent Application:**
Add `semantic_search` or `codebase_search` tool using:
- Monaco's tokenizer/symbol provider
- Or simple full-text search with ranking

### 6. ✅ Ask Before Proceed

**Roo Pattern:**
`ask_followup_question` tool with 2-4 suggested answers.

**Via-gent Application:**
Our agent should be able to ask clarifying questions. Consider:
```typescript
// ask_question tool
{
    question: string;
    suggestions: string[];
}
```

UI renders as a dialog with quick-reply buttons.

### 7. ✅ Mode Switching

**Roo Pattern:**
Modes: Architect, Code, Ask, Debug, Orchestrator

**Via-gent Application:**
Our system prompt can define different "personas":
- Coding Mode: File operations allowed
- Ask Mode: Read-only, explanations
- Debug Mode: Focus on error investigation

### 8. ⚠️ Confirmation After Each Tool

**Roo Pattern:**
> "Wait for user confirmation after each tool use before proceeding"

**Via-gent Application:**
TanStack AI's agentic loop runs multiple iterations automatically. We need:
- **Auto-approve** safe tools (read_file, list_files)
- **Require approval** for write_file, execute_command
- **Streaming feedback** to show what's happening

---

## Patterns NOT Directly Applicable

### 1. Native File System
Roo Code has direct access to FS via Node.js. We use FSA API which requires user permission and doesn't support all features (symlinks, etc).

### 2. Terminal in VSCode
Roo Code can start commands in VSCode integrated terminal. We use WebContainer's spawn which is sandboxed.

---

## Implementation Recommendations

### Phase 1: Quick Wins (MVP-3/MVP-4)
1. Add line range support to `read_file`
2. Update system prompt with Roo-style guidelines
3. Add `ask_question` tool for clarification

### Phase 2: Epic 29 Enhancements
1. Implement `apply_diff` for surgical edits
2. Add semantic search capability
3. Build todo list tracking UI
4. Add mode/persona switching

### Phase 3: Advanced
1. Multi-file reads in single tool
2. Progress streaming for long operations
3. Rollback/undo for file changes

---

## System Prompt Improvements (from Roo)

Our current prompt is too verbose. Key improvements:

```markdown
## CRITICAL RULES

1. Use tools DIRECTLY - never describe what you'll do
2. Read files BEFORE modifying them
3. One logical operation at a time
4. Report errors clearly with suggestions
5. Use relative paths from project root

## WORKFLOW

1. UNDERSTAND: Read relevant files
2. PLAN: Brief description (1-2 lines)
3. EXECUTE: Use tools
4. VERIFY: Check results

## TOOL PRIORITY

- list_files FIRST for exploration
- read_file BEFORE write_file
- ask_question if unclear
```

---

## Cross-Reference

| Via-gent Component | Roo Equivalent | Notes |
|-------------------|----------------|-------|
| read_file | read_file | Add line ranges |
| write_file | write_to_file | Add apply_diff |
| list_files | list_files | Add recursive |
| execute_command | execute_command | WebContainer sandboxed |
| - | search_files | Need to implement |
| - | codebase_search | Semantic search |
| - | ask_followup_question | Need to implement |
| - | update_todo_list | Task tracking |
| - | apply_diff | Surgical edits |

---

## Next Steps

1. [ ] Implement line range support in read_file
2. [ ] Add ask_question tool
3. [ ] Create apply_diff tool specification
4. [ ] Update system prompt with Roo patterns
5. [ ] Define agent modes/personas
