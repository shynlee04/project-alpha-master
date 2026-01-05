# Architecture Documentation

This document describes the architecture patterns and layer boundaries of the `src/core` domain.

## Architecture Overview

The `src/core` directory follows **Clean Architecture** principles, placing all entities in the **Domain Layer**. This is the innermost layer of the application architecture, containing pure business entities without any framework dependencies.

## Layer Boundaries

```
┌─────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                          │
│                  (use-cases, services, hooks)                   │
├─────────────────────────────────────────────────────────────────┤
│                        DOMAIN LAYER                             │
│                   (src/core - Pure Entities)                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  entities/                                               │   │
│  │  ├── Agent.ts        - AI Agent configuration           │   │
│  │  ├── Provider.ts     - LLM Provider configuration       │   │
│  │  ├── Conversation.ts - Chat session entities            │   │
│  │  └── Tool.ts         - Tool capability entities         │   │
│  │                                                         │   │
│  │  rules/ (EMPTY)      - Domain services                  │   │
│  │  value-objects/      - Value objects for validation     │   │
│  └─────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                    INFRASTRUCTURE LAYER                         │
│            (persistence, external APIs, frameworks)             │
└─────────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
src/core/
├── index.ts              # Barrel export
├── entities/             # Domain entities (4 files)
│   ├── Agent.ts          # Agent entity
│   ├── Provider.ts       # LLM Provider entity
│   ├── Conversation.ts   # Conversation entity
│   └── Tool.ts           # Tool entity
├── rules/                # Domain services (EMPTY - TODO)
└── value-objects/        # Value objects (EMPTY - TODO)
```

## Design Principles Applied

### 1. Pure TypeScript Interfaces

All entities are defined as TypeScript interfaces with no framework dependencies:

```typescript
// src/core/entities/Agent.ts
export interface Agent {
    id: string;
    name: string;
    // ... no class implementations, no decorators
}
```

**Benefits:**
- Framework agnostic
- Easy to serialize/deserialize
- Simple testing
- Can be used by any layer

### 2. No External Dependencies

The `src/core` directory has **zero external dependencies**:

```typescript
// No imports from:
// - react
// - zustand
// - dexie
// - any external libraries
```

**Benefits:**
- Stable API contract
- Changes to infrastructure don't affect domain
- Easy refactoring
- Clear separation of concerns

### 3. Single Source of Truth

Entities serve as the single source of truth for domain types:

```typescript
// Used by:
// - Infrastructure layer (persistence)
// - Application layer (hooks, services)
// - Presentation layer (components)
// - Tests (mock definitions)
```

## Architecture Patterns

### 1. Entity Pattern

Each entity represents a core business concept:

| Entity | Purpose | Key Properties |
|--------|---------|----------------|
| `Agent` | AI agent configuration | `providerId`, `modelId`, `tools`, `workspaceBindings` |
| `LLMProvider` | AI service provider | `baseUrl`, `capabilities`, `models` |
| `Conversation` | Chat session | `messages`, `context`, `agentId` |
| `Tool` | Agent capability | `category`, `configSchema`, `supportedWorkspaces` |

### 2. Type Sharing Pattern

Types are shared across entities using common definitions:

```typescript
// WorkspaceType used by Agent, Conversation, Tool
export type WorkspaceType = 'ide' | 'knowledge' | 'study' | 'notes';

// Modality used by Provider
export type Modality = 'text' | 'image' | 'audio' | 'video' | 'code';
```

### 3. Discriminated Union Pattern

For variants, discriminated unions are used:

```typescript
export type MessageContent =
    | { type: 'text'; value: string }
    | { type: 'code'; value: string; language: string }
    | { type: 'image'; value: string; mimeType: string }
    | { type: 'file'; value: string; fileName: string };
```

## Dependencies Between Modules

### Entity Relationships

```
Agent ──────────────┐
    │               │
    ├── providerId ─┼──► LLMProvider
    └── tools ──────┤
                    │
Tool ──────────────┤
    │               │
    └── category ───┘
```

### Shared Types

```
WorkspaceType
├── Used by: Agent, Conversation, Tool
└── Definition: 'ide' | 'knowledge' | 'study' | 'notes'

Modality
├── Used by: ProviderModel
└── Definition: 'text' | 'image' | 'audio' | 'video' | 'code'
```

## API Contracts

### Barrel Export (index.ts)

```typescript
// src/core/index.ts
export * from './entities/Agent';
export * from './entities/Provider';
export * from './entities/Conversation';
// Tool is not exported (may need to be added)
```

### Import Pattern

```typescript
// Correct import pattern
import { Agent, LLMProvider, Conversation } from '@/core';

// Import specific interfaces
import { Agent, AgentToolBinding, WorkspaceBinding } from '@/core/entities/Agent';
```

## Known Architecture Issues

### 1. Missing Domain Services

**Issue:** The `src/core/rules/` directory is empty.

**Impact:** Business logic may be scattered across application layer.

**Recommendation:** Add domain services for:
- Agent validation and factory
- Conversation management
- Provider configuration

### 2. Missing Value Objects

**Issue:** The `src/core/value-objects/` directory is empty.

**Impact:** No validation at domain level.

**Recommendation:** Add value objects for:
- `AgentName`, `SystemPrompt`, `Temperature`
- `ProviderUrl`, `TokenCount`
- Validation logic in constructors

### 3. Duplicate Type Definitions

**Issue:** `WorkspaceType` is defined in both `Agent.ts` and `Tool.ts`.

**Impact:** Potential inconsistency and maintenance burden.

**Recommendation:** Create a shared types file:
```typescript
// src/core/types/workspace.ts
export type WorkspaceType = 'ide' | 'knowledge' | 'study' | 'notes';
```

### 4. Incomplete Barrel Export

**Issue:** `Tool` entity is not exported from `src/core/index.ts`.

**Impact:** Inconsistent API.

**Recommendation:** Add Tool export:
```typescript
export * from './entities/Tool';
```

## Layer Interaction

### Domain → Infrastructure

Domain entities are used by infrastructure layer for persistence:

```typescript
// Infrastructure layer (src/infrastructure/persistence/dexie-db.ts)
import { Agent } from '@/core/entities/Agent';

interface AgentStorage {
    agents: Agent[];  // Domain entity as storage contract
}
```

### Domain → Application

Application layer uses domain entities for business logic:

```typescript
// Application layer (src/lib/agent/hooks/use-agent-chat-with-tools.ts)
import { Agent, Tool, ToolExecutionRequest } from '@/core';

function useAgentChatWithTools(agent: Agent) {
    // Use domain entities
}
```

### Domain → Presentation

Presentation layer uses domain types for props and state:

```typescript
// Presentation layer (src/presentation/components/agent/AgentConfigDialog.tsx)
import { Agent, AgentCreateParams } from '@/core';

interface AgentConfigDialogProps {
    agent?: Agent;
    onSave: (params: AgentCreateParams) => void;
}
```

## Best Practices

### 1. Keep Entities Pure

- No methods on entities (use domain services instead)
- No framework-specific decorators
- No I/O operations

### 2. Use Interfaces for Contracts

- Prefer interfaces over types for entity definitions
- Use discriminated unions for variants
- Export all types from barrel

### 3. Document Business Rules

Document business rules in JSDoc comments:

```typescript
/**
 * Agent - Domain Entity
 *
 * Business rules:
 * - Agent must have providerId and modelId (foreign keys to LLMProvider and ProviderModel)
 * - Status transitions: offline → online → busy → error
 */
export interface Agent { ... }
```

### 4. Avoid Duplicate Definitions

- Share common types across entities
- Avoid circular dependencies
- Use barrel exports for clean imports

## Future Improvements

1. **Add domain services** in `src/core/rules/`
2. **Add value objects** in `src/core/value-objects/`
3. **Consolidate shared types** in a single location
4. **Add factory functions** for entity creation
5. **Implement domain events** for state changes
6. **Add validation** at domain level

## Developer Notes

- The domain layer is stable and should rarely change
- Any changes to domain entities require careful consideration
- Domain entities are the API contract for the entire application
- Always validate at domain level using value objects
- Use domain services to encapsulate business logic
