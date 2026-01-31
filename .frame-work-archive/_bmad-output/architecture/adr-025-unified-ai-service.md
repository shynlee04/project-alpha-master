# Investigation 5: Unified AI Service Design

**Date:** 2026-01-07  
**Investigator:** @bmad-bmm-architect  
**Scope:** Design unified AgentExecutionService, define contracts between agent config, vault, and API layer, create ADR for architecture decision

## Executive Summary

Based on findings from Investigations 1-4, I propose a **unified AgentExecutionService** that consolidates all AI invocation patterns into a single, workspace-aware service with consistent tool access, permission enforcement, and reactivity.

## Current State Analysis

### Architectural Disjoint Summary

| Pattern | Entry Point | API Path | Tool Access | Agent Awareness | Issues |
|---------|-------------|----------|-------------|-----------------|---------|
| **Full Agent System** | ChatPanel | /api/chat | ✅ Factory tools | ✅ Workspace agents | Proper but complex |
| **Notes AI Service** | note-ai-service | Direct API | ❌ No tools | ✅ Workspace agents | Bypasses unified system |
| **Hardcoded Features** | VoiceRecordButton | Direct API | ❌ No tools | ❌ Hardcoded provider | Security risk |

### Critical Problems Identified

1. **Three different AI invocation patterns** with inconsistent behavior
2. **Permission bypasses** in Notes workspace (security risk)
3. **No unified tool access** across workspaces
4. **Inconsistent system prompt composition**
5. **Reactivity gaps** in agent switching

## Proposed Unified Architecture

### AgentExecutionService Design

#### Core Service Interface

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

#### Request Structure

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

#### Response Structure

```typescript
interface AgentExecutionResponse {
  content: string;
  agent: AgentExecutionInfo;
  toolCalls?: ToolCallResult[];
  metadata: ExecutionMetadata;
}

interface AgentExecutionInfo {
  agentId: string;
  providerId: string;
  modelId: string;
  systemPrompt: string;
  workspaceType: WorkspaceType;
  permissionsUsed: PermissionCheck[];
}

interface ExecutionMetadata {
  executionId: string;
  timestamp: Date;
  duration: number;
  tokenCount?: TokenUsage;
  workspaceContext: WorkspaceContext;
}
```

### Service Implementation Architecture

#### Layer 1: Agent Resolution

```typescript
class AgentResolver {
  resolveAgent(request: AgentExecutionRequest): ResolvedAgent {
    // Priority: explicit agentId → workspace default → last selected → fallback
    const agent = request.agentId 
      ? this.getAgentById(request.agentId)
      : this.getAgentForWorkspace(request.workspaceType);

    return {
      agent,
      provider: this.resolveProvider(agent, request.providerId),
      model: this.resolveModel(agent, request.modelId),
      systemPrompt: this.composeSystemPrompt(agent, request),
    };
  }
}
```

#### Layer 2: Permission Validation

```typescript
class PermissionValidator {
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

#### Layer 3: Execution Router

```typescript
class ExecutionRouter {
  async routeExecution(
    request: AgentExecutionRequest,
    resolvedAgent: ResolvedAgent
  ): Promise<AgentExecutionResponse> {
    // Route based on capabilities and workspace
    if (request.options.stream && this.supportsStreaming(resolvedAgent)) {
      return this.executeStream(request, resolvedAgent);
    }

    if (request.options.tools && request.options.tools.length > 0) {
      return this.executeWithTools(request, resolvedAgent);
    }

    return this.executeSimple(request, resolvedAgent);
  }

  private async executeWithTools(
    request: AgentExecutionRequest,
    resolvedAgent: ResolvedAgent
  ): Promise<AgentExecutionResponse> {
    // Use unified /api/chat endpoint with proper tool integration
    const response = await this.callUnifiedChatAPI({
      messages: this.buildMessages(request, resolvedAgent),
      agent: resolvedAgent,
      tools: this.createToolDefinitions(request.options.tools),
      stream: false,
    });

    return this.transformResponse(response, resolvedAgent);
  }
}
```

#### Layer 4: Tool Integration

```typescript
class ToolIntegrationManager {
  createToolDefinitions(toolConfigs: ToolConfig[]): ToolDefinition[] {
    return toolConfigs.map(config => this.createToolDefinition(config));
  }

  private createToolDefinition(config: ToolConfig): ToolDefinition {
    switch (config.type) {
      case 'file':
        return this.createFileTool(config);
      case 'terminal':
        return this.createTerminalTool(config);
      case 'knowledge':
        return this.createKnowledgeTool(config);
      case 'notes':
        return this.createNotesTool(config); // New notes-specific tools
      default:
        throw new Error(`Unknown tool type: ${config.type}`);
    }
  }

  private createNotesTool(config: ToolConfig): ToolDefinition {
    // Notes workspace specific tools
    return {
      name: 'enhance_note',
      description: 'Enhance note content with AI assistance',
      parameters: z.object({
        content: z.string(),
        enhancementType: z.enum(['summarize', 'expand', 'organize', 'cite']),
      }),
      execute: async (input) => {
        // Execute with workspace-aware permissions
        return this.executeNotesTool(input, config.workspaceContext);
      },
    };
  }
}
```

### Workspace-Specific Adaptations

#### Notes Workspace Tools

```typescript
const NOTES_WORKSPACE_TOOLS: ToolConfig[] = [
  {
    id: 'read_note',
    type: 'notes',
    name: 'Read Note',
    description: 'Read note content for context',
    enabledInWorkspaces: ['notes'],
    requiredPermissions: ['notes.read'],
  },
  {
    id: 'write_note',
    type: 'notes', 
    name: 'Write Note',
    description: 'Write or modify note content',
    enabledInWorkspaces: ['notes'],
    requiredPermissions: ['notes.write'],
    requiresApproval: true,
  },
  {
    id: 'search_notes',
    type: 'notes',
    name: 'Search Notes',
    description: 'Search across user notes',
    enabledInWorkspaces: ['notes'],
    requiredPermissions: ['notes.read'],
  },
  {
    id: 'enhance_content',
    type: 'notes',
    name: 'Enhance Content',
    description: 'AI-powered content enhancement',
    enabledInWorkspaces: ['notes'],
    requiredPermissions: ['notes.write'],
    requiresApproval: false, // Built-in safety
  }
];
```

#### Voice/Image Processing Tools

```typescript
const MULTIMEDIA_TOOLS: ToolConfig[] = [
  {
    id: 'process_voice',
    type: 'notes',
    name: 'Process Voice',
    description: 'Transcribe and process voice input',
    enabledInWorkspaces: ['notes'],
    requiredPermissions: ['notes.write'],
    provider: 'gemini', // Configurable, not hardcoded
  },
  {
    id: 'process_image',
    type: 'notes',
    name: 'Process Image', 
    description: 'Analyze and process images',
    enabledInWorkspaces: ['notes'],
    requiredPermissions: ['notes.write'],
    provider: 'gemini', // Configurable, not hardcoded
  }
];
```

## Migration Strategy

### Phase 1: Service Foundation (Week 1-2)

1. **Create AgentExecutionService Core**
   ```typescript
   // src/lib/agent/services/agent-execution-service.ts
   export class AgentExecutionService {
     private static instance: AgentExecutionService;
     
     public static getInstance(): AgentExecutionService {
       if (!AgentExecutionService.instance) {
         AgentExecutionService.instance = new AgentExecutionService();
       }
       return AgentExecutionService.instance;
     }
     
     // Core implementation
   }
   ```

2. **Implement Agent Resolution**
   - Migrate agent selection logic from stores
   - Add workspace-aware agent resolution
   - Implement fallback hierarchy

3. **Add Permission Validation**
   - Integrate existing workspace permission manager
   - Add API key availability checks
   - Create permission result aggregation

### Phase 2: Tool Integration (Week 3-4)

1. **Create Notes-Specific Tools**
   ```typescript
   // src/lib/agent/tools/notes-tools/
   export const notesTools = {
     readNote: createReadNoteTool(),
     writeNote: createWriteNoteTool(),
     searchNotes: createSearchNotesTool(),
     enhanceContent: createEnhanceContentTool(),
   };
   ```

2. **Migrate VoiceRecordButton**
   ```typescript
   // Before: Hardcoded gemini
   const apiKey = await credentialVault.getCredentials('gemini');
   
   // After: Agent-aware
   const agent = agentExecutionService.getAgentForWorkspace('notes');
   const result = await agentExecutionService.executeTool('process_voice', {
     audioData,
     language: 'auto'
   }, { workspaceType: 'notes' });
   ```

3. **Update note-ai-service**
   ```typescript
   // Before: Direct API calls
   const response = await callProviderAPI({...});
   
   // After: Unified service
   const response = await agentExecutionService.executeForWorkspace('notes', prompt, {
     tools: ['enhance_content', 'search_notes'],
     context: { contextBlocks }
   });
   ```

### Phase 3: System Prompt Unification (Week 5-6)

1. **Integrate 5-Layer System**
   - Migrate from legacy system-prompt.ts
   - Implement full prompt-composer.ts
   - Add workspace-specific prompt layers

2. **Add Client Customization**
   ```typescript
   interface CustomPromptLayer {
     id: string;
     content: string;
     priority: number;
     workspaceTypes?: WorkspaceType[];
   }
   
   service.addCustomPromptLayer({
     id: 'user-instructions',
     content: userInstructions,
     priority: 4,
     workspaceTypes: ['notes']
   });
   ```

### Phase 4: Reactivity & Events (Week 7-8)

1. **Event-Driven Updates**
   ```typescript
   // Agent changes trigger service updates
   crossWorkspaceEventBus.onAgentChange((event) => {
     agentExecutionService.invalidateAgentCache(event.agentId);
   });
   
   // Provider changes trigger credential refresh
   crossWorkspaceEventBus.onProviderConfigChange((event) => {
     agentExecutionService.refreshProviderCredentials(event.providerId);
   });
   ```

2. **Performance Optimization**
   - Add request caching
   - Implement request batching
   - Add performance monitoring

## API Contracts

### Service Contract

```typescript
// Primary contract for all AI operations
interface AgentExecutionContract {
  // Synchronous completion
  execute(request: AgentExecutionRequest): Promise<AgentExecutionResponse>;
  
  // Streaming completion  
  executeStream(request: AgentExecutionRequest): AsyncIterable<AgentExecutionChunk>;
  
  // Tool execution
  executeTool(toolId: string, input: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult>;
  
  // Workspace shortcuts
  executeForWorkspace(workspaceType: WorkspaceType, prompt: string, options?: WorkspaceExecutionOptions): Promise<AgentExecutionResponse>;
  
  // Agent management
  getAgentForWorkspace(workspaceType: WorkspaceType): Agent | null;
  validateAgentPermissions(agentId: string, workspaceType: WorkspaceType): PermissionResult;
  
  // Lifecycle
  invalidateCache(agentId?: string): void;
  refreshCredentials(providerId?: string): Promise<void>;
}
```

### Error Handling Contract

```typescript
interface AgentExecutionError extends Error {
  code: ErrorCode;
  agentId?: string;
  workspaceType?: WorkspaceType;
  providerId?: string;
  retryable: boolean;
  suggestions?: string[];
}

type ErrorCode = 
  | 'AGENT_NOT_FOUND'
  | 'AGENT_NOT_AVAILABLE_IN_WORKSPACE'  
  | 'API_KEY_MISSING'
  | 'API_KEY_INVALID'
  | 'TOOL_PERMISSION_DENIED'
  | 'WORKSPACE_PERMISSION_DENIED'
  | 'PROVIDER_ERROR'
  | 'NETWORK_ERROR'
  | 'VALIDATION_ERROR';
```

### Monitoring Contract

```typescript
interface ExecutionMetrics {
  executionId: string;
  agentId: string;
  workspaceType: WorkspaceType;
  providerId: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  tokenCount: TokenUsage;
  toolCalls: ToolCallMetric[];
  success: boolean;
  errorCode?: string;
}

interface AgentExecutionMonitor {
  recordMetrics(metrics: ExecutionMetrics): void;
  getMetrics(filter?: MetricsFilter): ExecutionMetrics[];
  getPerformanceReport(timeRange: TimeRange): PerformanceReport;
}
```

## Configuration Management

### Service Configuration

```typescript
interface AgentExecutionServiceConfig {
  // Default behavior
  defaultProvider: string;
  defaultModel: string;
  defaultTemperature: number;
  defaultMaxTokens: number;
  
  // Workspace settings
  workspaceSettings: Record<WorkspaceType, WorkspaceConfig>;
  
  // Tool configuration
  toolRegistry: ToolRegistry;
  permissionManager: WorkspacePermissionManager;
  
  // Performance
  cacheConfig: CacheConfig;
  rateLimitConfig: RateLimitConfig;
  
  // Monitoring
  monitoringEnabled: boolean;
  metricsEndpoint?: string;
}

interface WorkspaceConfig {
  enabledTools: string[];
  defaultAgentId?: string;
  systemPromptOverrides?: Record<string, string>;
  toolBehaviorOverrides?: Record<string, ToolBehavior>;
}
```

### Environment-Specific Configuration

```typescript
// Development
const devConfig: AgentExecutionServiceConfig = {
  defaultProvider: 'openrouter',
  defaultModel: 'mistralai/devstral-2512:free',
  monitoringEnabled: true,
  cacheConfig: { ttl: 300000 }, // 5 minutes
};

// Production  
const prodConfig: AgentExecutionServiceConfig = {
  defaultProvider: 'openrouter',
  defaultModel: 'anthropic/claude-3.5-sonnet',
  monitoringEnabled: true,
  cacheConfig: { ttl: 600000 }, // 10 minutes
  rateLimitConfig: { requestsPerMinute: 60 },
};
```

## Benefits of Unified Architecture

### 1. Consistency
- **Single entry point** for all AI operations
- **Uniform error handling** across workspaces
- **Consistent tool access** patterns

### 2. Security
- **Centralized permission checking** 
- **No more hardcoded providers**
- **Unified audit trail**

### 3. Maintainability
- **Single codebase** for AI logic
- **Easier testing** and debugging
- **Centralized configuration**

### 4. Extensibility
- **Easy to add new workspaces**
- **Pluggable tool system**
- **Configurable behavior**

### 5. Performance
- **Shared caching** across operations
- **Request optimization** 
- **Resource pooling**

## Implementation Roadmap

### Sprint 1 (Week 1-2): Foundation
- [ ] Create AgentExecutionService core
- [ ] Implement agent resolution
- [ ] Add basic permission validation
- [ ] Create service tests

### Sprint 2 (Week 3-4): Tool Integration  
- [ ] Implement notes-specific tools
- [ ] Migrate VoiceRecordButton
- [ ] Update note-ai-service
- [ ] Add tool execution tests

### Sprint 3 (Week 5-6): System Prompts
- [ ] Integrate 5-layer prompt system
- [ ] Add workspace prompt layers
- [ ] Implement client customization
- [ ] Create prompt tests

### Sprint 4 (Week 7-8): Reactivity & Performance
- [ ] Add event-driven updates
- [ ] Implement caching
- [ ] Add monitoring
- [ ] Performance optimization

### Sprint 5 (Week 9-10): Migration & Cleanup
- [ ] Migrate all AI features to unified service
- [ ] Remove legacy code
- [ ] Update documentation
- [ ] User acceptance testing

## Risk Mitigation

### Technical Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| **Performance regression** | Medium | Performance testing, caching, gradual rollout |
| **Breaking existing features** | High | Comprehensive testing, feature flags, rollback plan |
| **Complexity increase** | Medium | Clear documentation, layer separation, tests |

### Business Risks  
| Risk | Impact | Mitigation |
|------|--------|------------|
| **User experience disruption** | High | Gradual migration, backward compatibility, user communication |
| **Development slowdown** | Medium | Clear sprint planning, parallel development, knowledge sharing |

## ADR-025: Unified AI Service Architecture

### Status
**PROPOSED** - Awaiting architecture review

### Decision
Implement a unified `AgentExecutionService` that consolidates all AI invocation patterns under a single, workspace-aware service with consistent tool access, permission enforcement, and reactivity.

### Rationale
1. **Eliminates architectural disjoint** between 3 different AI invocation patterns
2. **Improves security** by centralizing permission checks and eliminating hardcoded providers
3. **Enhances maintainability** through single codebase for AI logic
4. **Provides consistent user experience** across all workspaces
5. **Enables future extensibility** with pluggable architecture

### Consequences
- **Breaking changes** required for existing AI features
- **Development effort** estimated at 10 weeks
- **Learning curve** for developers
- **Migration complexity** for existing code

### Alternatives Considered
1. **Status Quo** - Keep existing disjoint patterns (rejected due to security risks)
2. **Partial Unification** - Only unify some patterns (rejected due to continued complexity)
3. **Gradual Migration** - Slow phased approach (rejected due to extended timeline)

---

## Files to Create/Modify

### New Files
- `src/lib/agent/services/agent-execution-service.ts` - Core service
- `src/lib/agent/services/agent-resolver.ts` - Agent resolution logic
- `src/lib/agent/services/permission-validator.ts` - Permission validation
- `src/lib/agent/services/execution-router.ts` - Execution routing
- `src/lib/agent/tools/notes-tools/` - Notes-specific tools
- `src/lib/agent/types/execution-types.ts` - Type definitions

### Modified Files
- `src/lib/notes/note-ai-service.ts` - Migrate to unified service
- `src/presentation/components/notes/VoiceRecordButton.tsx` - Use agent system
- `src/presentation/components/ide/AgentChatPanel.tsx` - Use unified service
- `src/lib/agent/system-prompt.ts` - Integrate with prompt composer
- `src/lib/agent/factory.ts` - Add notes tools

### Deprecated Files
- Legacy AI invocation patterns (marked for removal after migration)

---

**Investigations Complete ✅** - All 5 focused investigations have been completed with comprehensive findings and actionable recommendations.
