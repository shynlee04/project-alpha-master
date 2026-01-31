---
story_id: "31-01"
story_title: "Implement AgentExecutionService core"
epic_id: "EPIC-31"
priority: "P1"
effort_hours: 2
status: "draft"
created_at: "2026-01-08T06:30:00+07:00"
updated_at: "2026-01-08T06:30:00+07:00"
assigned_to: "@bmad-bmm-dev"
dependencies: ["EPIC-38", "EPIC-30"]
research_artifacts:
  - source: "context7"
    query: "TanStack AI execution patterns"
    findings: 4
  - source: "deepwiki"
    query: "Agent service architecture patterns"
    findings: 3
  - source: "codebase-analysis"
    query: "Current AI invocation fragmentation"
    findings: 7
---

# Story 31-01: Implement AgentExecutionService core

## Epic Context
**EPIC-31**: AI Service Unification - Consolidate duplicate AI invocation code into a single, unified service.

## Overview
Create the core `AgentExecutionService` that provides a single interface for AI agent execution across all workspaces, replacing the current fragmented approach where each workspace has its own AI invocation logic.

## Background
Currently, AI agent execution is duplicated across:
- IDE workspace: `src/lib/agent/hooks/use-agent-chat-with-tools.ts`
- Knowledge workspace: `src/lib/rag/knowledge-agent-executor.ts`
- Notes workspace: Inline AI calls in components

This fragmentation causes:
1. Inconsistent behavior across workspaces
2. Duplicate code maintenance burden
3. Divergent feature sets (e.g., deep think works in IDE but not elsewhere)

## Acceptance Criteria

1. [ ] **AC1 - Service Created**: `AgentExecutionService` class exists at `src/application/services/AgentExecutionService.ts`
2. [ ] **AC2 - Execute Method**: Service has `execute(request: AgentRequest): Promise<AgentResponse>` method
3. [ ] **AC3 - Provider Abstraction**: Service abstracts provider selection ( Anthropic, OpenRouter)
4. [ ] **AC4 - Tool Orchestration**: Service handles tool execution via unified tool registry
5. [ ] **AC5 - Stream Support**: Service supports both streaming and non-streaming responses
6. [ ] **AC6 - Error Handling**: Service has unified error handling with specific error types
7. [ ] **AC7 - TypeScript Strict**: Full type safety with no `any` types

## Dependencies

### Story Dependencies
- **EPIC-38**: Must complete (Clean Architecture) - ensures proper layer structure
- **EPIC-30**: Must complete (P0 Fixes) - ensures error boundaries for stability
- **Story 31-02**: Migrates IDE workspace to use this service

### Code Dependencies
- `src/lib/agent/factory.ts` - Provider adapter factory (reuse)
- `src/lib/agent/tools/index.ts` - Unified tool registry (reuse)
- `src/lib/agent/prompt-composer.ts` - Prompt composition (reuse)
- `src/infrastructure/persistence/stores/providers/` - Provider configuration

### Documentation
- `_bmad-output/research/agent-vault-api-flow-2026-01-07.md` - Current agent system analysis
- CLAUDE.md: Agent Interaction Patterns section

## Traceability Matrix

| PRD Req | AC | Test | Code | Review |
|---------|----|----|----|----|
| REQ-AI-001 | AC1 | service-exists.test.ts | application/services/AgentExecutionService.ts:1 | @code-reviewer |
| REQ-AI-001 | AC2 | execute-method.test.ts | AgentExecutionService.ts:execute() | @code-reviewer |
| REQ-AI-001 | AC3 | provider-abstraction.test.ts | AgentExecutionService.ts:_selectProvider() | @code-reviewer |
| REQ-AI-001 | AC4 | tool-orchestration.test.ts | AgentExecutionService.ts:_executeTools() | @code-reviewer |
| REQ-AI-001 | AC5 | stream-support.test.ts | AgentExecutionService.ts:_handleStream() | @code-reviewer |
| REQ-AI-001 | AC6 | error-handling.test.ts | AgentExecutionService.ts:error handling | @code-reviewer |
| REQ-AI-001 | AC7 | pnpm-typecheck | Zero TS errors | @code-reviewer |

## Research Findings

### Source 1: Context7 - TanStack AI Execution Patterns
**Finding**: TanStack AI provides a unified `createAgent` function that abstracts provider differences. Key patterns:

```typescript
import { createAgent, createTool } from '@tanstack/ai';

// Agent creation
const agent = createAgent({
  id: 'my-agent',
  enabledTools: ['read_file', 'write_file'],
  middleware: [],
  // Provider abstraction
  getProvider: async () => providerAdapter
});

// Execution with streaming
for await (const chunk of agent.stream({
  messages: [...],
  tools: {...}
})) {
  // Handle stream chunk
}
```

**Impact**: Use TanStack AI patterns but wrap in our service layer for workspace awareness and BYOK integration.

**References**:
- TanStack AI documentation
- Agent execution best practices

### Source 2: Codebase Analysis - Current Fragmentation
**Finding**: Three separate AI invocation implementations with 70% code duplication:

| Location | Lines | Features | Duplicated |
|----------|-------|----------|------------|
| use-agent-chat-with-tools.ts | 180 | Streaming, tools, deep think | YES |
| knowledge-agent-executor.ts | 145 | RAG-specific, tools | YES |
| Notes AI (inline) | 90+ | Basic streaming | YES |

**Common duplicated code**:
1. Provider selection logic
2. Message formatting
3. Tool execution wrapper
4. Stream consumption loop
5. Error handling

**Impact**: Extract common code into service, eliminate ~250 lines of duplication.

### Source 3: Architecture - Service Layer Design
**Finding**: From ADR-024 (Clean Architecture), application services should:
1. Coordinate domain operations
2. Not contain business logic (that's for domain layer)
3. Orchestrate infrastructure calls
4. Provide workspace-aware interfaces

**Impact**: Design AgentExecutionService as an orchestrator, not a container of business logic.

### Source 4: Provider System Analysis
**Finding**: Current provider system in `src/lib/agent/providers/`:
- `provider-adapter.ts` - Base adapter interface
- `anthropic-adapter.ts` - Anthropic implementation
- Model registry for available models
- Credential vault for API keys

**Impact**: AgentExecutionService should use existing provider infrastructure, not duplicate it.

## Implementation Plan

### Step 1: Define Service Interface (15 minutes)
```typescript
// src/application/services/AgentExecutionService.ts

import { AgentRequest, AgentResponse, StreamChunk } from './types';

export interface AgentExecutionConfig {
  workspaceType: WorkspaceType;
  agentId: string;
  enableTools: boolean;
  enableDeepThink: boolean;
  streamResponse: boolean;
}

export class AgentExecutionService {
  private static instance: AgentExecutionService;

  static getInstance(): AgentExecutionService {
    if (!this.instance) {
      this.instance = new AgentExecutionService();
    }
    return this.instance;
  }

  async execute(request: AgentRequest): Promise<AgentResponse>;
  async *executeStream(request: AgentRequest): AsyncGenerator<StreamChunk>;
  cancelExecution(executionId: string): void;
  getExecutionStatus(executionId: string): ExecutionStatus;
}
```

### Step 2: Implement Core Execute Method (30 minutes)
```typescript
// Key responsibilities:
// 1. Validate request
// 2. Select provider based on agent configuration
// 3. Compose prompt (reuse prompt-composer)
// 4. Execute via provider adapter
// 5. Handle tool execution if enabled
// 6. Return formatted response
```

### Step 3: Implement Streaming Support (20 minutes)
```typescript
// Use async generator for streaming
async *executeStream(request: AgentRequest): AsyncGenerator<StreamChunk> {
  const provider = this._selectProvider(request.agentId);
  const tools = request.enableTools ? this._getTools(request.workspaceType) : undefined;

  for await (const chunk of provider.stream({
    messages: request.messages,
    tools,
  })) {
    yield {
      type: 'content',
      content: chunk.content,
      toolCalls: chunk.toolCalls,
    };
  }
}
```

### Step 4: Implement Tool Orchestration (25 minutes)
```typescript
// Reuse existing tool infrastructure
import { getFileTools } from '@/lib/agent/tools/facades/file-tools';
import { getTerminalTools } from '@/lib/agent/tools/facades/terminal-tools';

private _getTools(workspaceType: WorkspaceType): ToolRegistry {
  const baseTools = {
    ...getFileTools(),
    ...getTerminalTools(),
  };

  // Add workspace-specific tools
  switch (workspaceType) {
    case 'knowledge':
      return { ...baseTools, ...getKnowledgeTools() };
    case 'ide':
      return { ...baseTools, ...getIDETools() };
    default:
      return baseTools;
  }
}
```

### Step 5: Add Error Handling (10 minutes)
```typescript
// Define specific error types
export class AgentExecutionError extends Error {
  constructor(
    public code: string,
    message: string,
    public workspaceType: WorkspaceType,
    public agentId: string
  ) {
    super(message);
    this.name = 'AgentExecutionError';
  }
}

// Error codes: PROVIDER_NOT_FOUND, INVALID_REQUEST, TOOL_EXECUTION_FAILED, STREAM_INTERRUPTED
```

### Step 6: Write Unit Tests (30 minutes)
```typescript
// src/application/services/__tests__/AgentExecutionService.test.ts

describe('AgentExecutionService', () => {
  it('should execute agent request', async () => {
    const service = AgentExecutionService.getInstance();
    const response = await service.execute({
      agentId: 'agent-1',
      messages: [{ role: 'user', content: 'Hello' }],
      workspaceType: 'ide',
    });
    expect(response).toBeDefined();
  });

  it('should handle streaming responses', async () => {
    const service = AgentExecutionService.getInstance();
    const chunks = [];
    for await (const chunk of service.executeStream({...})) {
      chunks.push(chunk);
    }
    expect(chunks.length).toBeGreaterThan(0);
  });
});
```

## Validation Checklist

### Pre-Development
- [x] Research completed (4 sources analyzed)
- [x] Provider system understood
- [x] Tool registry reviewed
- [x] Service interface designed

### Post-Development
- [ ] All 7 ACs met
- [ ] Tests pass (≥80% coverage)
- [ ] TypeScript check passes
- [ ] No code duplication with existing implementations
- [ ] Code reviewed by @code-reviewer
- [ ] Story 31-02 ready to start (IDE migration)

## Exit Criteria

Story is **DONE** when:
1. AgentExecutionService class exists with all required methods
2. Service successfully executes AI requests
3. Service supports streaming and non-streaming modes
4. Tool execution integrated
5. Unified error handling implemented
6. Tests cover main execution paths
7. Story 31-02 can begin (migrate IDE workspace)

## Notes

- **Estimated Effort**: 2 hours
- **Risk**: MEDIUM - core service, affects all AI interactions
- **Dependencies**: EPIC-38 and EPIC-30 must complete first
- **Rollback Plan**: Keep existing AI invocation paths active until all workspaces migrated

## Integration Points

This service integrates with:
1. **Provider System**: Uses existing provider adapters
2. **Tool Registry**: Uses unified tool facades
3. **BYOK Vault**: Integrates for credential management (story 31-05)
4. **Workspace System**: Workspace-aware tool filtering

## Future Stories

- **31-02**: Migrate IDE workspace to use AgentExecutionService
- **31-03**: Migrate Notes workspace
- **31-04**: Migrate Knowledge workspace
- **31-05**: Integrate BYOK vault
- **31-06**: Add agent deep think flags
- **31-07**: Remove duplicate AI invocation code
- **31-08**: Add AI service monitoring

## Metadata

**Story Type**: New Feature / Architecture
**Complexity**: Medium (service layer design)
**Risk Level**: MEDIUM (core AI service)
**Test Coverage Required**: ≥80%
**Rollback Plan**: Keep old paths active until migration complete

---

**Generated**: 2026-01-08T06:30:00+07:00
**Workflow**: story-dev-cycle-v2.md
**Template Version**: 2.0.0
