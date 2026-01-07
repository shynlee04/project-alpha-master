# ADR-026: AI Service Unification

**Date:** 2026-01-07  
**Status:** PROPOSED  
**Author:** @bmad-bmm-architect

## Context

The codebase currently exhibits **three different AI invocation patterns** with inconsistent behavior, creating architectural disjoint that impacts security, maintainability, and user experience.

### Current State Analysis

Based on Phase 1 findings from ADR-025 (Unified AI Service Design) and Investigation 4 (State/Store Reactivity):

| Pattern | Entry Point | API Path | Tool Access | Agent Awareness | Issues |
|---------|-------------|----------|-------------|-----------------|---------|
| **Full Agent System** | ChatPanel | `/api/chat` | ✅ Factory tools | ✅ Workspace agents | Proper but complex |
| **Notes AI Service** | note-ai-service | Direct API | ❌ No tools | ⚠️ Static selection | Bypasses unified system |
| **Hardcoded Features** | VoiceRecordButton | Direct API | ❌ No tools | ❌ Hardcoded 'gemini' | Security risk |

### Evidence from Phase 1

1. **Hardcoded Provider** (Component Inventory): `VoiceRecordButton.tsx` uses hardcoded 'gemini' provider, bypassing the agent system entirely
2. **Static Agent Selection** (State Reactivity Gaps): `note-ai-service.ts` uses `getAgentForWorkspace('notes')` with direct store access, no reactivity
3. **Reactivity Gap** (Diagnostic Report): Agent switches don't propagate to all AI invocation patterns

### Problem Statement

- **Security Risk**: Hardcoded providers bypass permission enforcement
- **Inconsistent UX**: Different workspaces behave differently
- **Maintenance Burden**: Three patterns to maintain and debug
- **Permission Bypass**: Notes workspace tools lack permission checking

## Decision

Implement a unified `AgentExecutionService` that consolidates all AI invocation patterns into a single, workspace-aware service with consistent tool access, permission enforcement, and reactivity.

### Core Service Interface

```typescript
interface AgentExecutionService {
  // Primary execution method
  executeAgentCompletion(
    request: AgentExecutionRequest
  ): Promise<AgentExecutionResponse>;

  // Streaming support
  executeAgentCompletionStream(
    request: AgentExecutionRequest
  ): AsyncIterable<AgentExecutionChunk>;

  // Workspace-specific methods
  executeForWorkspace(
    workspaceType: WorkspaceType,
    prompt: string,
    options?: WorkspaceExecutionOptions
  ): Promise<AgentExecutionResponse>;

  // Tool execution
  executeTool(
    toolId: string,
    input: unknown,
    context: ToolExecutionContext
  ): Promise<ToolExecutionResult>;
}
```

### Agent Resolution Priority

1. **Explicit agentId** (highest priority - user selected)
2. **Workspace default** (configuration preference)
3. **Last selected** (workspace memory)
4. **Marked default** (agent configuration)
5. **First available** (fallback)

### Request Structure

```typescript
interface AgentExecutionRequest {
  // Core request
  prompt: string;
  workspaceType: WorkspaceType;
  projectId?: string;

  // Agent configuration (optional - auto-selected if not provided)
  agentId?: string;
  providerId?: string;
  modelId?: string;

  // Execution options
  options: {
    stream?: boolean;
    tools?: ToolConfig[];
    systemPrompt?: {
      base?: string;
      workspace?: string;
      client?: string;
    };
    temperature?: number;
    maxTokens?: number;
  };

  // Context
  context?: {
    openFiles?: FileContext[];
    activeFile?: FileContext;
    projectSummary?: ProjectContext;
    conversationHistory?: MessageContext[];
  };
}
```

### Permission Validation Contract

```typescript
interface PermissionValidator {
  validateExecution(
    resolvedAgent: ResolvedAgent,
    request: AgentExecutionRequest
  ): PermissionResult {
    // Check agent availability in workspace
    const agentAvailable = this.checkAgentWorkspaceAvailability(
      resolvedAgent.agent,
      request.workspaceType
    );

    // Check tool permissions
    const toolPermissions = request.options.tools?.map(tool =>
      this.workspacePermissionManager.checkWorkspacePermission(
        tool.id,
        resolvedAgent.agent.tools,
        resolvedAgent.agent.workspaceBindings,
        request.workspaceType
      )
    );

    // Check API key availability
    const apiKeyAvailable = this.checkApiKeyAvailability(
      resolvedAgent.provider.id
    );

    return {
      canExecute: agentAvailable && apiKeyAvailable && 
                toolPermissions.every(p => p.canExecute),
      blockedPermissions: toolPermissions.filter(p => !p.canExecute),
      warnings: this.generateWarnings(resolvedAgent, request),
    };
  }
}
```

## Consequences

### Positive

1. **Single Entry Point**: All AI operations use `AgentExecutionService`
2. **Consistent Security**: Centralized permission checking
3. **Unified Tool Access**: Same tools available across workspaces
4. **Event-Driven Reactivity**: Agent changes propagate immediately
5. **Maintainability**: One codebase for AI logic
6. **Extensibility**: Pluggable tool system for new features

### Negative

1. **Breaking Changes**: Existing AI features require migration
2. **Development Effort**: Estimated 10 weeks for full implementation
3. **Learning Curve**: Developers must understand unified patterns
4. **Migration Complexity**: Gradual rollout required

## Implementation

### Phase 1: Service Foundation (Week 1-2)

**File**: `src/lib/agent/services/agent-execution-service.ts`
```typescript
export class AgentExecutionService {
  private static instance: AgentExecutionService;
  
  public static getInstance(): AgentExecutionService {
    if (!AgentExecutionService.instance) {
      AgentExecutionService.instance = new AgentExecutionService();
    }
    return AgentExecutionService.instance;
  }
  
  // Implementation...
}
```

**Files to Create**:
- `src/lib/agent/services/agent-execution-service.ts` - Core service
- `src/lib/agent/services/agent-resolver.ts` - Agent resolution logic
- `src/lib/agent/services/permission-validator.ts` - Permission validation
- `src/lib/agent/services/execution-router.ts` - Execution routing
- `src/lib/agent/types/execution-types.ts` - Type definitions

### Phase 2: Tool Integration (Week 3-4)

**Files**: `src/lib/agent/tools/notes-tools/`
```typescript
export const notesTools = {
  readNote: createReadNoteTool(),
  writeNote: createWriteNoteTool(),
  searchNotes: createSearchNotesTool(),
  enhanceContent: createEnhanceContentTool(),
};
```

**Migration Targets**:
- `src/lib/notes/note-ai-service.ts` - Migrate to unified service
- `src/presentation/components/notes/VoiceRecordButton.tsx` - Use agent system
- `src/presentation/components/ide/AgentChatPanel.tsx` - Use unified service

### Phase 3: System Prompt Unification (Week 5-6)

**Integration**: Migrate from `src/lib/agent/system-prompt.ts` to full prompt-composer integration

### Phase 4: Reactivity & Events (Week 7-8)

**Event-Driven Updates**:
```typescript
crossWorkspaceEventBus.onAgentChange((event) => {
  agentExecutionService.invalidateAgentCache(event.agentId);
});

crossWorkspaceEventBus.onProviderConfigChange((event) => {
  agentExecutionService.refreshProviderCredentials(event.providerId);
});
```

### File References from Phase 1

| File | Line | Issue |
|------|------|-------|
| `src/presentation/components/notes/VoiceRecordButton.tsx` | - | Hardcoded 'gemini' provider |
| `src/lib/notes/note-ai-service.ts` | - | Static agent selection |
| `src/lib/agent/hooks/use-provider-api-key.ts` | 217-228 | Event-driven re-fetch pattern |
| `src/lib/events/cross-workspace-event-bus.ts` | 161-177 | Event types for reactivity |

## Dependencies

- **ADR-027**: Requires state management for agent selection
- **ADR-028**: Error handling for execution failures
- **ADR-029**: Layer compliance for service placement

## Related ADRs

- **ADR-025**: Previous AI service investigation (superseded by this ADR)
- **ADR-027**: State management for agent selection
- **ADR-028**: Error handling patterns

## References

- Phase 1 Investigation: `_bmad-output/architecture/adr-025-unified-ai-service.md`
- State Reactivity Analysis: `_bmad-output/research/state-reactivity-gaps-2026-01-07.md`
- Diagnostic Report: `_bmad-output/scans/comprehensive-diagnostic-report.md`
