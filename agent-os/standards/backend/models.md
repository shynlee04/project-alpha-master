---
document_id: STD-BACKEND-MODELS-2025-12-27
title: Data Model Standards
version: 1.0.0
last_updated: 2025-12-27T13:15:00Z
phase: Implementation
team: Team A (Antigravity)
agent_mode: bmad-bmm-tech-writer
status: NOT_APPLICABLE
---

# Data Model Standards

## Overview

This document defines data model standards for the Via-gent project.

**Project Context**: Via-gent is a browser-based IDE that uses **TypeScript interfaces** and **Zod schemas** for type validation. There is **no traditional backend data modeling** (no SQL tables, ORM models, etc.). All data structures are defined in TypeScript and validated with Zod.

**Status**: **NOT APPLICABLE** - This document describes client-side data modeling patterns.

## Data Modeling Architecture

### Type-First Approach

Via-gent uses a type-first approach with TypeScript:

```typescript
// TypeScript interface
export interface ProjectMetadata {
  id: string;
  name: string;
  path: string;
  createdAt: Date;
  updatedAt: Date;
}

// Zod schema for validation
export const ProjectMetadataSchema = z.object({
  id: z.string(),
  name: z.string(),
  path: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Type inference from schema
export type ProjectMetadataInput = z.infer<typeof ProjectMetadataSchema>;
```

Reference: [`src/lib/workspace/workspace-types.ts`](../../src/lib/workspace/workspace-types.ts)

## Core Data Models

### Project Metadata

```typescript
export interface ProjectMetadata {
  id: string;
  name: string;
  path: string;
  createdAt: Date;
  updatedAt: Date;
}
```

**Storage**: IndexedDB via Dexie  
**Validation**: Zod schema  
**Reference**: [`src/lib/workspace/workspace-types.ts`](../../src/lib/workspace/workspace-types.ts)

### Conversation

```typescript
export interface Conversation {
  id: string;
  projectId: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  toolCalls?: ToolCall[];
  timestamp: Date;
}
```

**Storage**: IndexedDB via Dexie  
**Validation**: Zod schema  
**Reference**: [`src/lib/workspace/workspace-types.ts`](../../src/lib/workspace/workspace-types.ts)

### Agent Configuration

```typescript
export interface AgentConfig {
  id: string;
  name: string;
  provider: string;
  model: string;
  systemPrompt?: string;
  tools: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

**Storage**: localStorage  
**Validation**: Zod schema  
**Reference**: [`src/stores/agents.ts`](../../src/stores/agents.ts)

## Data Model Patterns

### Immutable Updates

Use immutable update patterns for state:

```typescript
// ❌ Bad - mutation
function addMessage(conversation: Conversation, message: Message) {
  conversation.messages.push(message);
  return conversation;
}

// ✅ Good - immutable
function addMessage(conversation: Conversation, message: Message): Conversation {
  return {
    ...conversation,
    messages: [...conversation.messages, message],
    updatedAt: new Date(),
  };
}
```

### Type Guards

Use Zod for runtime validation:

```typescript
import { ProjectMetadataSchema } from './schemas';

function validateProject(data: unknown): ProjectMetadata {
  try {
    return ProjectMetadataSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation failed:', error.errors);
    }
    throw new Error('Invalid project data');
  }
}
```

### Schema Validation

Validate API responses:

```typescript
// API response schema
const ChatResponseSchema = z.object({
  id: z.string(),
  choices: z.array(z.object({
    message: z.object({
      role: z.enum(['assistant', 'user', 'system']),
      content: z.string(),
    }),
  })),
});

// Usage
const response = await fetch('/api/chat');
const data = await response.json();
const validated = ChatResponseSchema.parse(data);
```

## IndexedDB Schema

### Dexie Table Definitions

```typescript
// src/lib/state/dexie-db.ts
import Dexie, { Table } from 'dexie';

export class ViaGentDB extends Dexie {
  projects!: Table<ProjectMetadata, string>;
  conversations!: Table<Conversation, string>;
  
  constructor() {
    super('via-gent-db');
    
    this.version(1).stores({
      projects: 'id, name, createdAt, updatedAt',
      conversations: 'id, projectId, createdAt, updatedAt'
    });
  }
}
```

**Reference**: [`src/lib/state/dexie-db.ts`](../../src/lib/state/dexie-db.ts)

### Index Strategy

Define indexes for common queries:

```typescript
this.version(1).stores({
  // Primary key: id
  // Indexes: name, createdAt, updatedAt
  projects: 'id, name, createdAt, updatedAt',
  
  // Primary key: id
  // Indexes: projectId, createdAt, updatedAt
  conversations: 'id, projectId, createdAt, updatedAt'
});
```

## Zod Schema Patterns

### Base Schema

```typescript
import { z } from 'zod';

// Base schema with common fields
const BaseSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Extend base schema
const ProjectSchema = BaseSchema.extend({
  name: z.string().min(1).max(100),
  path: z.string(),
});
```

### Optional Fields

```typescript
const AgentConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  provider: z.string(),
  model: z.string(),
  systemPrompt: z.string().optional(),
  tools: z.array(z.string()),
});
```

### Enum Validation

```typescript
const MessageRoleSchema = z.enum(['user', 'assistant', 'system']);

const MessageSchema = z.object({
  id: z.string(),
  role: MessageRoleSchema,
  content: z.string(),
});
```

## Data Validation Best Practices

### Input Validation

Validate all user inputs:

```typescript
import { z } from 'zod';

const CreateProjectSchema = z.object({
  name: z.string().min(1).max(100),
  path: z.string().optional(),
});

function createProject(input: unknown) {
  const validated = CreateProjectSchema.parse(input);
  // Create project with validated data
}
```

### API Response Validation

Validate API responses:

```typescript
const ChatCompletionSchema = z.object({
  id: z.string(),
  object: z.literal('chat.completion'),
  created: z.number(),
  model: z.string(),
  choices: z.array(z.object({
    index: z.number(),
    message: z.object({
      role: z.enum(['assistant', 'user', 'system']),
      content: z.string(),
    }),
    finish_reason: z.enum(['stop', 'length', 'content_filter']),
  })),
});

async function chatWithAI(messages: Message[]) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ messages }),
  });
  
  const data = await response.json();
  return ChatCompletionSchema.parse(data);
}
```

### Error Handling

Handle validation errors gracefully:

```typescript
import { ZodError } from 'zod';

function safeParse<T>(schema: z.ZodSchema<T>, data: unknown): T | null {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      console.error('Validation errors:', error.errors);
    }
    return null;
  }
}
```

## Type Safety Patterns

### Discriminated Unions

Use discriminated unions for variant types:

```typescript
type ToolCall = 
  | { type: 'read_file'; path: string }
  | { type: 'write_file'; path: string; content: string }
  | { type: 'execute_command'; command: string };

function handleToolCall(call: ToolCall) {
  switch (call.type) {
    case 'read_file':
      // call.path is available
      break;
    case 'write_file':
      // call.path and call.content are available
      break;
    case 'execute_command':
      // call.command is available
      break;
  }
}
```

### Type Guards

Create custom type guards:

```typescript
function isProject(data: unknown): data is ProjectMetadata {
  return ProjectMetadataSchema.safeParse(data).success;
}

function processProject(data: unknown) {
  if (isProject(data)) {
    // TypeScript knows data is ProjectMetadata
    console.log(data.name);
  }
}
```

## References

### Internal Documentation

- [`project-architecture-analysis-2025-12-27.md`](../../_bmad-output/documentation/project-architecture-analysis-2025-12-27.md) - Architecture analysis
- [`development-workflow-2025-12-27.md`](../../_bmad-output/documentation/development-workflow-2025-12-27.md) - Development workflow

### External Documentation

- **TypeScript**: [https://www.typescriptlang.org/](https://www.typescriptlang.org/)
- **Zod**: [https://zod.dev/](https://zod.dev/)
- **Dexie.js**: [https://dexie.org/](https://dexie.org/)

### Implementation Files

- [`src/lib/workspace/workspace-types.ts`](../../src/lib/workspace/workspace-types.ts) - Core type definitions
- [`src/lib/state/dexie-db.ts`](../../src/lib/state/dexie-db.ts) - IndexedDB schema
- [`src/stores/agents.ts`](../../src/stores/agents.ts) - Agent configuration types
- [`src/lib/agent/tools/types.ts`](../../src/lib/agent/tools/types.ts) - Agent tool types

---

**Document Status**: Not Applicable (Frontend-Only Project)
**Last Updated**: 2025-12-27T13:15:00Z
**Next Review**: 2026-01-27