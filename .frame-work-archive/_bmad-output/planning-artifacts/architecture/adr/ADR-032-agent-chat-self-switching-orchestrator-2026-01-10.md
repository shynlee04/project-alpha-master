# ADR-032: Agent Chat Self-Switching Orchestrator & Centralized Tool Registry

**Status**: PROPOSED
**Date**: 2026-01-10
**Decision Type**: Architectural Standard
**Epic**: EPIC-40
**Session**: MP-EPIC40-001

---

## Context

### Problem Statement

The current agent chat system has **three critical gaps**:

1. **Static Mode Selection**: Agent modes (`solo-dev`, `code`, `notes`) require manual UI selection. No intelligent routing based on context.

2. **Server-Side Tool Limitation**: Only 4 tools are exposed to the LLM at [`src/routes/api/chat.ts:118-125`](src/routes/api/chat.ts#L118-L125), while 10+ tools exist client-side. Note CRUD tools and `search_notes` are unavailable to the agent.

3. **Missing Tool Registry**: No centralized system for registering, filtering, and managing tools across modes, workspaces, and permissions.

### Impact

| User Journey | Status | Impact |
|--------------|--------|--------|
| Create note via agent | ❌ Blocked | Agent cannot call note tools |
| Search notes via RAG | ❌ Blocked | `search_notes` not wired to LLM |
| Automatic mode switching | ❌ Missing | User must manually select mode |
| Context at 65% threshold | ❌ Not set | Current threshold is 80% |

### Technical Debt

- Fragmented tool definitions across multiple files
- Hardcoded tool list in server endpoint
- No permission-based tool filtering
- Duplication between client and server tool definitions

---

## Decision

Implement a **Centralized Prompt Orchestrator** with:

1. **Self-Switching Agent Mode Classifier** - Analyzes initiating prompt, workspace context, document context, and conversation context to dynamically select the optimal agent mode.

2. **Centralized Tool Registry** - Single source of truth for tool definitions with filtering by mode, workspace type, and user permissions.

3. **Server-Side Tool Exposure** - Update [`chat.ts:getTools()`](src/routes/api/chat.ts#L118-L125) to expose all authorized tools to the LLM.

4. **Context Window at 65%** - Lower compression threshold from 80% to 65%.

---

## Architecture

### Self-Switching Mode Classifier

```typescript
interface ModeClassificationInput {
  initiatingPrompt: string;
  workspaceType: 'ide' | 'notes' | 'knowledge' | 'study';
  documentContext: {
    openFiles: string[];
    openNotes: string[];
  };
  conversationContext: {
    recentTopics: string[];
    dominantCategory: 'coding' | 'knowledge' | 'mixed';
  };
  userPermissions: string[];
}

class ModeClassifier {
  classify(input: ModeClassificationInput): {
    mode: 'coding' | 'knowledge' | 'orchestrator';
    confidence: number;
    toolFilter: string[];
  }
}
```

**Classification Rules**:
- **Workspace-based routing**: `notes`/`knowledge` workspace → `knowledge` mode
- **Prompt analysis**: Keywords like "create note", "search my notes" → `knowledge` mode
- **Document context**: Open notes vs. open files influences mode selection
- **Conversation history**: Previous messages' dominant category provides continuity

### Centralized Tool Registry

```typescript
interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  category: 'file' | 'terminal' | 'note' | 'research' | 'multimodal';
  handler: ToolHandler;

  // Permission & Mode Filtering
  permissions: Permission[];
  allowedModes: AgentMode[];
  allowedWorkspaces: WorkspaceType[];

  // Server Exposure
  serverExposed: boolean;
  clientSide: boolean;
}

class CentralizedToolRegistry {
  register(tool: ToolDefinition): void;
  getFilteredTools(config: {
    mode: AgentMode;
    workspaceType: WorkspaceType;
    userPermissions: Permission[];
  }): ToolDefinition[];
}
```

### Server-Side Tool Exposure Fix

**Before** ([`chat.ts:118-125`](src/routes/api/chat.ts#L118-L125)):
```typescript
function getTools() {
    return [
        readFileDef,
        writeFileDef,
        listFilesDef,
        executeCommandDef,
    ];
}
```

**After**:
```typescript
function getTools(user: User, workspaceType: WorkspaceType) {
    const permissions = getUserPermissions(user);
    const mode = classifyMode(workspaceType);
    return toolRegistry.getFilteredTools({ mode, workspaceType, permissions });
}
```

### One Centralized System Prompt

```typescript
const CENTRALIZED_SYSTEM_PROMPT = `
# VIA-GENT AI AGENT

## IDENTITY
You are a context-aware AI assistant operating in the Via-Gent workspace.

## TOOL CONSTITUTION
${TOOL_CONSTITUTION}

## DYNAMIC MODE CONFIGURATION
{{MODE_INJECTION_POINT}}

## AVAILABLE TOOLS
{{FILTERED_TOOLS_INJECTION_POINT}}

## CURRENT TASK
{{CURRENT_TASK_INJECTION_POINT}}
`;
```

---

## Rationale

### Why Self-Switching?

1. **Better UX**: Users shouldn't need to manually select modes. The system should "just know."
2. **Context Awareness**: The best mode depends on where you are (workspace) and what you're doing (task).
3. **Continuity**: Conversation history should influence mode selection for consistency.

### Why Centralized Registry?

1. **Single Source of Truth**: One place to define tools instead of scattered across files.
2. **Permission Filtering**: Server-side validation ensures users only get tools they're allowed to use.
3. **Mode-Based Routing**: Different workspaces need different tools (e.g., no `execute_command` in Notes workspace).

### Why Server-Side Exposure?

1. **LLM Awareness**: The LLM can only call tools it knows about. Server defines what the LLM sees.
2. **Security**: Permission checks happen server-side before tool definitions are sent.
3. **Efficiency**: Don't send tools the user can't access or don't need in current workspace.

---

## Implementation Plan

### Phase 1: Foundation (Week 1)

| Story | File | Deliverable |
|-------|------|-------------|
| EPIC-40-01 | `src/domain/tools/centralized-tool-registry.ts` | Create tool registry |
| EPIC-40-02 | `src/lib/agent/mode-classifier.ts` | Implement mode classifier |
| EPIC-40-03 | `context-window/internal.ts` | Change threshold to 65% |

### Phase 2: Server Integration (Week 2)

| Story | File | Deliverable |
|-------|------|-------------|
| EPIC-40-04 | `src/routes/api/chat.ts` | Update getTools() to use registry |
| EPIC-40-05 | `src/domain/tools/note/` | Create 5 note tool definitions |
| EPIC-40-06 | `src/lib/agent/factory.ts` | Wire search_notes to registry |

### Phase 3: Orchestrator (Week 3)

| Story | File | Deliverable |
|-------|------|-------------|
| EPIC-40-07 | `src/lib/agent/prompt-orchestrator.ts` | Build orchestrator |
| EPIC-40-08 | `src/lib/agent/prompt-composer.ts` | Integrate with 5-layer system |
| EPIC-40-09 | `__tests__/` | E2E tests for self-switching |

---

## Compliance Checklist

### Governance
- [ ] Follows BMAD v6 framework
- [ ] Artifact dated with YYYY-MM-DD format
- [ ] Status file updated

### ADR Template
- [ ] Context section clearly states problem
- [ ] Decision section provides solution
- [ ] Rationale explains reasoning
- [ ] Implementation plan with stories
- [ ] Compliance checklist included

### Code Standards
- [ ] No file exceeds 300 lines (TS-001)
- [ ] Slice pattern for Zustand stores (ADR-001)
- [ ] Clean Architecture layer compliance (ADR-003)
- [ ] Import patterns followed (CLAUDE.md)

---

## Related ADRs

- [ADR-001](ADR-001-zustand-state-management.md): Zustand State Management with v5 Patterns
- [ADR-002](ADR-002-single-source-of-truth.md): Single Source of Truth for State
- [ADR-003](ADR-003-clean-architecture-layers.md): Clean Architecture Layer Separation
- [ADR-031](ADR-031-chat-system-unification.md): Chat System Unification

---

## Alternatives Considered

### Alternative A: Keep Manual Mode Selection

**Rejected**: Users shouldn't have to manually switch. The system can infer from context.

### Alternative B: Separate Agents per Mode

**Rejected**: Adds complexity. Single agent with dynamic prompts is simpler and more maintainable.

### Alternative C: Client-Side Tool Registry Only

**Rejected**: Server-side filtering is critical for security and LLM awareness.

---

**Status**: Ready for Sprint Planning

**Next Step**: `/bmad:bmm:workflows:sprint-planning` for EPIC-40 remediation sprint
