# Domain Services Documentation

This document describes domain services in the `src/core/rules/` directory.

## Current State

**Status:** NOT IMPLEMENTED

The `src/core/rules/` directory is currently empty. There are no domain services defined.

## Expected Structure

Domain services should encapsulate business logic that doesn't belong to a single entity. They should be stateless and operate on domain entities.

### Expected Domain Services

Based on the entities defined in `src/core/entities/`, the following domain services should be considered:

### 1. Agent Domain Services

```typescript
// src/core/rules/agent-service.ts (PROPOSED)
export interface AgentService {
    createAgent(params: AgentCreateParams): Agent;
    updateAgent(id: string, params: AgentUpdateParams): Agent;
    deleteAgent(id: string): void;
    validateAgent(agent: Agent): ValidationResult;
    checkAgentAvailability(agentId: string, workspaceType: WorkspaceType): boolean;
    getDefaultAgentForWorkspace(workspaceType: WorkspaceType): Agent | null;
}

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}
```

### 2. Conversation Domain Services

```typescript
// src/core/rules/conversation-service.ts (PROPOSED)
export interface ConversationService {
    createConversation(agentId: string, workspaceType: WorkspaceType): Conversation;
    addMessage(conversationId: string, message: Omit<Message, 'id' | 'timestamp'>): Message;
    addToolCall(conversationId: string, messageId: string, toolCall: Omit<ToolCall, 'id' | 'timestamp'>): void;
    addToolResult(conversationId: string, messageId: string, toolResult: Omit<ToolResult, 'timestamp'>): void;
    summarizeContext(conversationId: string): void;
    createThreadBranch(conversationId: string, messageId: string, name: string): Thread;
    getConversationContext(conversationId: string): ConversationContext;
}
```

### 3. Provider Domain Services

```typescript
// src/core/rules/provider-service.ts (PROPOSED)
export interface ProviderService {
    getProvider(id: string): LLMProvider | null;
    getProvidersByType(type: ProviderType): LLMProvider[];
    getEnabledProviders(): LLMProvider[];
    fetchModels(providerId: string): Promise<ProviderModel[]>;
    validateProviderConfig(provider: LLMProvider): ValidationResult;
    getModel(providerId: string, modelId: string): ProviderModel | null;
}
```

### 4. Tool Domain Services

```typescript
// src/core/rules/tool-service.ts (PROPOSED)
export interface ToolService {
    getTool(id: string): Tool | null;
    getToolsByCategory(category: ToolCategory): Tool[];
    getToolsForWorkspace(workspaceType: WorkspaceType): Tool[];
    validateToolExecution(request: ToolExecutionRequest): ValidationResult;
    getToolPermissions(agentId: string, toolId: string, workspaceType: WorkspaceType): boolean;
}
```

## Value Objects

The `src/core/value-objects/` directory is also empty. Value objects should be added for:

### Expected Value Objects

```typescript
// src/core/value-objects/agent-value-objects.ts (PROPOSED)
export class AgentName {
    constructor(value: string) {
        if (value.length < 1 || value.length > 100) {
            throw new Error('Agent name must be between 1 and 100 characters');
        }
        this.value = value;
    }
    readonly value: string;
}

export class SystemPrompt {
    constructor(value: string) {
        if (value.length > 32000) {
            throw new Error('System prompt must not exceed 32000 characters');
        }
        this.value = value;
    }
    readonly value: string;
}

export class Temperature {
    constructor(value: number) {
        if (value < 0 || value > 2) {
            throw new Error('Temperature must be between 0 and 2');
        }
        this.value = value;
    }
    readonly value: number;
}

// src/core/value-objects/provider-value-objects.ts (PROPOSED)
export class ProviderUrl {
    constructor(value: string) {
        if (!value.startsWith('https://')) {
            throw new Error('Provider URL must use HTTPS');
        }
        this.value = value;
    }
    readonly value: string;
}

// src/core/value-objects/conversation-value-objects.ts (PROPOSED)
export class TokenCount {
    constructor(value: number) {
        if (value < 0) {
            throw new Error('Token count must be non-negative');
        }
        this.value = value;
    }
    readonly value: number;
}

export class MessageContentValidator {
    static validate(content: MessageContent): ValidationResult {
        // Validate message content structure
    }
}
```

## Recommendations

### Immediate Actions

1. **Create shared types file** for common types like `WorkspaceType` to avoid duplication
2. **Implement domain services** in `src/core/rules/` for business logic encapsulation
3. **Add value objects** in `src/core/value-objects/` for validation and type safety

### Long-term Improvements

1. **Add factory functions** for entity creation with validation
2. **Implement domain events** for entity state changes
3. **Add domain invariants** validation
4. **Consider using class-based entities** with methods for behavior

## Known Issues

1. **Empty rules directory**: No domain services implemented
2. **Empty value-objects directory**: No value objects for validation
3. **Duplicate type definitions**: `WorkspaceType` defined in multiple files
4. **No factory pattern**: Entities created directly without validation
5. **No domain events**: No event emission for state changes

## Developer Notes

- Domain services should be stateless and focus on business logic
- Value objects should encapsulate validation logic
- Domain events should be used for cross-entity communication
- All domain logic should be framework-agnostic
