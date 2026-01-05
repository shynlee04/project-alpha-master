# Architecture Documentation

## Overview

The `src/lib` directory is the core library layer of the Via-gent IDE, providing infrastructure for AI agents, file systems, RAG pipelines, and state management. This document describes the architectural patterns, service boundaries, and design principles.

## Directory Structure

```
src/lib/
├── agent/          # AI Agent infrastructure (81 files)
├── audio/          # Audio processing
├── canvas/         # Canvas visualization
├── chat/           # Chat utilities
├── editor/         # Editor utilities
├── events/         # Event system (10 files)
├── filesync/       # File sync services (15 files)
├── filesystem/     # File system & sync (45 files)
├── hooks/          # Shared React hooks
├── ide/            # IDE utilities
├── init/           # Initialization
├── knowledge/      # Knowledge synthesis (48 files)
├── mocks/          # Mock utilities
├── monitoring/     # Observability
├── notes/          # Notes management (18 files)
├── pdf/            # PDF processing
├── persistence/    # Persistence layer
├── rag/            # RAG pipeline (32 files)
├── state/          # State management (34 files)
├── study/          # Spaced repetition
├── sync/           # Sync utilities (8 files)
├── utils/          # Utilities (9 files)
├── validation/     # Validation
├── webcontainer/   # WebContainer (9 files)
└── workspace/      # Workspace management (16 files)
```

## Core Design Patterns

### 1. Facade Pattern

Used throughout to provide clean interfaces over complex subsystems:

```typescript
// Agent facades abstract WebContainer and local FS operations
src/lib/agent/facades/
├── file-tools.ts         # File operations
├── terminal-tools.ts     # Terminal operations
└── knowledge-tools.ts    # Knowledge synthesis

// Knowledge source import
src/lib/knowledge/source-import.ts
```

**Benefits:**
- Clean API surface
- Testability (mock facades)
- Swap implementations

### 2. Singleton Pattern

Used for resources that should only have one instance:

```typescript
// WebContainer singleton
src/lib/webcontainer/manager.ts
const wc = await boot();  // Returns cached instance

// Credential vault
src/lib/agent/providers/credential-vault.ts
export const credentialVault = new CredentialVault();

// Event bus
src/lib/events/cross-workspace-event-bus.ts
export const crossWorkspaceEventBus = new CrossWorkspaceEventBus();
```

**Benefits:**
- Single source of truth
- Memory efficiency
- Consistent state

### 3. Store Pattern (Zustand)

Reactive state management with persistence:

```typescript
// State structure
src/lib/state/
├── ide-store.ts              # IDE state
├── tool-permission-store.ts  # Tool permissions
├── workspace-store.ts        # Workspace state
├── knowledge/                # Knowledge store (slices)
│   ├── knowledge-store.ts
│   ├── slices/
│   │   ├── knowledge-source-crud-slice.ts
│   │   ├── knowledge-metadata-slice.ts
│   │   └── ...
```

**Benefits:**
- Reactive updates
- Persistence support
- DevTools integration

### 4. Event Emitter Pattern

Pub/sub for loose coupling:

```typescript
// Cross-workspace events
src/lib/events/cross-workspace-event-bus.ts
export const crossWorkspaceEventBus = new CrossWorkspaceEventBus();

// Store events
src/lib/events/store-events.ts
export const storeEvents = new EventEmitter();

// Workspace events
src/lib/events/workspace-events.ts
```

**Event Types:**
```typescript
type WorkspaceId = 'ide' | 'notes' | 'knowledge' | 'study';

interface FileChangeEvent {
    workspaceId: WorkspaceId;
    filePath: string;
    changeType: 'created' | 'modified' | 'deleted';
}

interface AgentConfigChangeEvent {
    workspaceId: WorkspaceId;
    agentId: string;
    changeType: 'created' | 'updated' | 'deleted';
}
```

### 5. Factory Pattern

Object creation with configuration:

```typescript
// Agent tool factory
src/lib/agent/factory.ts
createAgentClientTools(options: ToolFactoryOptions)

// Sync manager factory
src/lib/filesystem/sync-manager/sync-manager-factory.ts
createSyncManager(adapter, config)
```

### 6. Repository Pattern

Data access abstraction:

```typescript
// Knowledge graph
src/lib/knowledge/graph/
├── graph-crud.ts
├── graph-queries.ts
├── graph-traversal.ts
└── graph-persistence.ts

// Project store
src/lib/workspace/project-store.ts
```

## Layer Architecture

```
┌─────────────────────────────────────────┐
│           Presentation Layer            │
│   (src/presentation/components/)        │
├─────────────────────────────────────────┤
│            Hook Layer                   │
│      (src/lib/hooks/, agent/hooks/)     │
├─────────────────────────────────────────┤
│             Service Layer               │
│  (agent/, knowledge/, rag/, filesync/)  │
├─────────────────────────────────────────┤
│           Persistence Layer             │
│        (state/, persistence/)           │
├─────────────────────────────────────────┤
│          Infrastructure Layer           │
│  (filesystem/, webcontainer/, events/)  │
└─────────────────────────────────────────┘
```

## Service Boundaries

### Agent System (`agent/`)

**Responsibilities:**
- LLM provider integration
- Tool execution
- Agent lifecycle management
- Conversation memory

**Dependencies:**
- `filesystem` - File operations
- `webcontainer` - Terminal execution
- `events` - Cross-workspace communication
- `state` - Agent configuration

### File System (`filesystem/`)

**Responsibilities:**
- File System Access API wrapper
- Path validation
- Permission lifecycle
- Sync to WebContainer

**Dependencies:**
- `webcontainer` - Mount files
- `sync` - Event bus

### RAG Pipeline (`rag/`)

**Responsibilities:**
- Vector search (Orama)
- Document chunking
- Embedding generation
- Hybrid retrieval

**Dependencies:**
- `knowledge` - Source documents
- `state` - Index storage

### Knowledge Module (`knowledge/`)

**Responsibilities:**
- Source import (PDF, URL, text)
- Knowledge synthesis
- Knowledge graph
- Organization engine

**Dependencies:**
- `rag` - Indexing
- `pdf` - PDF processing
- `state` - Storage

### Events System (`events/`)

**Responsibilities:**
- Cross-workspace events
- Store events
- Workspace events

**Dependencies:**
- None (foundational)

### State Management (`state/`)

**Responsibilities:**
- Zustand stores
- Dexie persistence
- Data migrations

**Dependencies:**
- `persistence` - Database

## Cross-Module Dependencies

```
agent ──────► filesystem ──────► webcontainer
  │               │                   │
  │               ▼                   │
  ▼               ▼                   ▼
events ◄──────────── state ◄───────────► knowledge
  │               │                   │
  │               ▼                   │
  └────────► persistence ◄────────────┘
                    │
                    ▼
                 filesync
```

## Persistence Strategy

### Dexie IndexedDB

Primary persistence for structured data:

```typescript
// Tables
- projects          # Project metadata
- sources           # Knowledge sources
- conversations     # Conversation history
- fileMetadata      # File snapshots
- toolExecutionLogs # Tool approvals
- fsaHandles        # FSA handles
- sessions          # Session snapshots
```

### LocalStorage

Simple key-value storage:

```typescript
- vault encryption keys (obfuscated)
- FSA handles (base64 encoded)
- UI preferences
```

### File System Access API

User-selected directory:

```typescript
// Permissions requested
- read
- write

// Lifecycle
- Requested on folder open
- Valid for session
- Can be persisted (per browser)
```

## Error Handling Strategy

### Error Classes

```typescript
// File system errors
src/lib/filesystem/fs-errors.ts
class FileSystemError extends Error
class PermissionDeniedError extends FileSystemError

// Sync errors
src/lib/filesystem/sync-manager/sync-manager-types.ts
class SyncError extends Error

// WebContainer errors
src/lib/webcontainer/types.ts
class WebContainerError extends Error

// Agent errors
src/lib/agent/tools/tool-error.ts
class ToolError extends Error
```

### Error Handling Utilities

```typescript
src/lib/utils/error-handling.ts
showErrorToast(error, options)
withRetry(fn, options)
isNetworkError(error)
isPermissionError(error)
isTimeoutError(error)
```

## Security Architecture

### Credential Storage

```typescript
// AES-256-GCM encryption
src/lib/agent/providers/credential-vault.ts
- Master key encrypted with PBKDF2-derived key
- Salt + IV + authentication tag
- Obfuscated localStorage keys
```

### Path Validation

```typescript
// Path traversal prevention
src/lib/filesystem/path-guard.ts
validatePath(path)
- Rejects '..' components
- Rejects absolute paths
- Validates prefix
```

### Tool Permissions

```typescript
// Trust levels per tool
src/lib/agent/tool-permission/tool-permission-manager.ts
- auto    # Execute without approval
- prompt  # Request approval
- block   # Never execute

// Workspace filtering
src/lib/agent/workspace-permission-manager.ts
- Filter tools by workspace type
- Per-workspace permissions
```

## Migration Status

### Deprecated Modules (ADR-024)

| Old Path | New Path | Status |
|----------|----------|--------|
| `lib/state/dexie-db.ts` | `infrastructure/persistence/dexie-db` | Facade in place |
| `lib/filesync.ts` | `infrastructure/sync/workspace-services` | Facade in place |

### Migration Pattern

```typescript
// Old (deprecated)
import { db } from '@/lib/state/dexie-db';

// New (canonical)
import { db } from '@/infrastructure/persistence/dexie-db';
```

## Developer Guidelines

### File Organization

1. **Single Responsibility**: Each file has one clear purpose
2. **Barrel Exports**: Use `index.ts` for clean imports
3. **Test Files**: Co-located `__tests__/` directories
4. **Types First**: Type definitions at top of files

### Import Order

```typescript
// 1. React imports
import { useState, useEffect } from 'react';

// 2. Third-party libraries
import { z } from 'zod';
import { toast } from 'sonner';

// 3. Internal modules (@/)
import { useWorkspace } from '@/infrastructure/persistence/stores/workspace';

// 4. Relative imports
import { validatePath } from './path-guard';
```

### Component Limits

| Type | Max Lines |
|------|-----------|
| Slice file | 120 |
| Store file | 300 |
| Component | 300 |
| Hook | 150 |
| Helper | 120 |

## Known Architectural Debt

1. **God Stores**: Some stores exceed 300 lines (e.g., `conversation-store.ts`)
2. **Duplicate State**: `IDELayout.tsx` duplicates IDE state with `useState`
3. **Test Coverage**: 40-60% coverage, target 80%
4. **TypeScript Errors**: Some test files have errors (excluded from production checks)
