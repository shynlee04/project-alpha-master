# Core Domain Documentation

## Overview

The `src/core` directory contains the **Domain Layer** of the application, following Clean Architecture principles. It defines pure business entities without any framework dependencies.

## Quick Reference

| Item | Value |
|------|-------|
| **Files** | 5 |
| **Lines of Code** | 396 |
| **Entities** | 4 |
| **Interfaces** | 22 |
| **Types** | 10 |
| **Domain Services** | 0 (TODO) |
| **Value Objects** | 0 (TODO) |

## Directory Structure

```
src/core/
├── index.ts              # Barrel export (16 lines)
├── entities/             # Domain entities (380 lines)
│   ├── Agent.ts          # Agent configuration
│   ├── Provider.ts       # LLM Provider configuration
│   ├── Conversation.ts   # Chat session entities
│   └── Tool.ts           # Tool capability entities
├── rules/                # Domain services (EMPTY)
└── value-objects/        # Value objects (EMPTY)
```

## Entities

### Agent (`src/core/entities/Agent.ts`)

Core business entity representing AI agents.

**Key Properties:**
- `id`, `name`, `description` - Core identity
- `providerId`, `modelId` - Provider linkage (CRITICAL)
- `systemPrompt`, `temperature`, `maxTokens` - LLM parameters
- `tools` - Tool bindings with per-workspace permissions
- `workspaceBindings` - Where agent is available
- `status` - Agent status (online/offline/busy/error)
- `metrics` - tasksCompleted, successRate, tokensUsed

**Business Rules:**
- Must have valid `providerId` and `modelId`
- Status transitions: offline → online → busy → error
- Tools require workspace permissions

### LLMProvider (`src/core/entities/Provider.ts`)

AI service provider configuration (single source of truth).

**Key Properties:**
- `id`, `name`, `providerType` - Identity
- `baseUrl` - API endpoint
- `isHardcoded` - Built-in provider flag
- `hasApiKey` - Credential vault indicator
- `models` - Available models
- `capabilities` - streaming, functionCalling, vision, embeddings

**Business Rules:**
- API key stored in encrypted credential-vault.ts
- Built-in providers have readonly URLs

### Conversation (`src/core/entities/Conversation.ts`)

Chat session with agent participation.

**Key Properties:**
- `id`, `workspaceType`, `threadId` - Core identity
- `agentId` - Participating agent
- `messages` - Message history
- `context` - Token budget, summaries, attached resources
- `metadata` - title, tags, pinned, scrollPosition

**Message Types:**
- `text` - Plain text content
- `code` - Code with language specification
- `image` - Image with MIME type
- `file` - File attachment

### Tool (`src/core/entities/Tool.ts`)

Agent capability definition.

**Key Properties:**
- `id`, `name`, `description`, `category` - Identity
- `requiresAuth` - Authentication requirement
- `supportedWorkspaces` - Workspace availability
- `configSchema` - Configuration options
- `isEnabled` - Availability flag

**Tool Categories:**
- `file-operations`, `terminal`, `web-search`
- `knowledge`, `rag`, `code-generation`, `testing`

## Shared Types

### WorkspaceType

Used by Agent, Conversation, and Tool entities.

```typescript
type WorkspaceType = 'ide' | 'knowledge' | 'study' | 'notes';
```

### Modality

Used by ProviderModel for multimodal support.

```typescript
type Modality = 'text' | 'image' | 'audio' | 'video' | 'code';
```

## Usage

### Importing Entities

```typescript
// Import from barrel
import { Agent, LLMProvider, Conversation, Tool } from '@/core';

// Import specific entity
import { Agent, AgentToolBinding, WorkspaceBinding } from '@/core/entities/Agent';

// Import types
import { WorkspaceType, ToolCategory } from '@/core/entities/Tool';
```

### Creating Entities

```typescript
const agent: Agent = {
    id: 'agent-001',
    name: 'Code Assistant',
    description: 'Helps with coding tasks',
    providerId: 'anthropic',
    modelId: 'claude-sonnet-4-20250514',
    systemPrompt: 'You are a helpful coding assistant.',
    temperature: 0.7,
    maxTokens: 4096,
    topP: 1.0,
    tools: [],
    workspaceBindings: [{
        workspaceType: 'ide',
        isAvailable: true,
        uiVariant: 'full',
        isDefault: true
    }],
    status: 'online',
    tasksCompleted: 0,
    successRate: 0,
    tokensUsed: 0,
    lastActive: new Date().toISOString(),
    createdAt: new Date().toISOString()
};
```

## Architecture

### Layer Position

The `src/core` directory sits at the innermost layer of Clean Architecture:

```
┌─────────────────────────────────────┐
│     Presentation Layer (UI)         │
├─────────────────────────────────────┤
│    Application Layer (Services)     │
├─────────────────────────────────────┤
│       Domain Layer (src/core)       │  ← We are here
├─────────────────────────────────────┤
│  Infrastructure Layer (Persistence) │
└─────────────────────────────────────┘
```

### Key Principles

1. **Pure TypeScript** - No framework dependencies
2. **No External Imports** - Zero external dependencies
3. **Interface Contracts** - TypeScript interfaces only
4. **Single Source of Truth** - Domain entities define the API

## Known Issues

| Issue | Severity | Description |
|-------|----------|-------------|
| Empty rules directory | Medium | No domain services implemented |
| Empty value-objects | Medium | No validation at domain level |
| Duplicate WorkspaceType | Low | Defined in Agent.ts and Tool.ts |
| Tool not exported | Low | Missing barrel export |

## Recommendations

### Immediate

1. Add Tool export to barrel (`src/core/index.ts`)
2. Create shared types file for WorkspaceType

### Short-term

1. Implement domain services in `src/core/rules/`
2. Add value objects in `src/core/value-objects/`
3. Add factory functions for entity creation

### Long-term

1. Implement domain events for state changes
2. Add validation at domain level
3. Consider class-based entities with methods

## Related Documentation

- [Entities Documentation](entities.md) - Detailed entity documentation
- [Domain Services](domain-services.md) - Service recommendations
- [Architecture](architecture.md) - Architecture patterns

## Developer Notes

- Domain layer is stable and rarely changes
- Changes require careful consideration
- Domain entities are the API contract
- Always validate at domain level
- Use domain services for business logic
