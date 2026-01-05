# src/lib Documentation

## Overview

The `src/lib/` directory contains the core library layer of the Via-gent IDE, providing infrastructure for AI agents, file systems, RAG pipelines, and state management. This documentation provides a comprehensive reference for developers working with these modules.

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

## Core Subsystems

### Agent System (`agent/`)

AI Agent infrastructure providing LLM integration, tool execution, and agent lifecycle management.

**Key Features:**
- TanStack AI tool definitions
- Multiple LLM providers (Anthropic, OpenRouter)
- Secure credential storage (AES-256-GCM)
- Workspace-aware tool permissions
- Conversation memory and deep thinking

**Key Files:**
- `factory.ts` - Tool factory
- `providers/credential-vault.ts` - Encrypted API key storage
- `facades/` - Tool abstraction layer
- `tools/` - TanStack AI tools

### File System (`filesystem/`)

File System Access API wrapper and bidirectional sync with WebContainers.

**Key Features:**
- Local FS adapter for browser file access
- Path traversal protection
- Permission lifecycle management
- Sync manager for WebContainer synchronization
- Transaction support for atomic operations

**Key Files:**
- `local-fs-adapter.ts` - FSA API wrapper
- `sync-manager/` - Sync orchestration
- `path-guard.ts` - Security validation
- `permission-lifecycle.ts` - Permission management

### WebContainer (`webcontainer/`)

Singleton WebContainer lifecycle management for running Node.js in the browser.

**Key Features:**
- Singleton boot pattern
- File mounting
- Process spawning
- Terminal adapter
- Crash recovery

**Key Files:**
- `manager.ts` - Singleton manager
- `terminal-adapter.ts` - Shell operations
- `process-manager.ts` - Process tracking

### RAG Pipeline (`rag/`)

Retrieval-Augmented Generation with Orama vector search.

**Key Features:**
- Orama index management
- Document chunking
- Embedding generation
- Hybrid search (vector + keyword)
- Query optimization and caching

**Key Files:**
- `orama-index.ts` - Vector search
- `hybrid-retriever.ts` - Search
- `document-chunker.ts` - Chunking
- `embedding-service.ts` - Embeddings

### Knowledge Module (`knowledge/`)

Knowledge synthesis and management (KSI Module).

**Key Features:**
- Source import (PDF, URL, text)
- Knowledge synthesis
- Knowledge graph
- Subject classification

**Key Files:**
- `synthesis-service.ts` - AI synthesis
- `knowledge-graph.ts` - Graph management
- `source-import.ts` - Import pipeline
- `organization-engine.ts` - Organization

### Events System (`events/`)

Event system for cross-workspace communication.

**Key Features:**
- Cross-workspace event bus
- Store events
- Workspace events
- React hooks for event subscriptions

**Key Files:**
- `cross-workspace-event-bus.ts` - Global event bus
- `workspace-events.ts` - Workspace events
- `use-cross-workspace-events.ts` - React hook

### State Management (`state/`)

Zustand stores with Dexie persistence.

**Key Features:**
- Reactive state management
- IndexedDB persistence
- Knowledge store with slices
- Tool permission store

**Key Files:**
- `ide-store.ts` - IDE state
- `tool-permission-store.ts` - Permissions
- `knowledge/` - Knowledge store
- `dexie-db.ts` - Database facade

## Architecture Patterns

1. **Facade Pattern** - Clean interfaces over complex subsystems
2. **Singleton Pattern** - Single instances (WebContainer, credential vault)
3. **Store Pattern (Zustand)** - Reactive state management
4. **Event Emitter Pattern** - Pub/sub for loose coupling
5. **Factory Pattern** - Object creation with configuration
6. **Repository Pattern** - Data access abstraction

## Security

### Credential Storage
- AES-256-GCM encryption
- PBKDF2 key derivation (100,000 iterations)
- Obfuscated localStorage keys

### File System
- Path traversal protection
- Permission lifecycle
- Exclusion patterns (.git, node_modules)

### Tool Execution
- Command sanitization
- Workspace permission checks
- Trust levels (auto/prompt/block)

## Persistence

| Storage | Usage | Location |
|---------|-------|----------|
| IndexedDB | Structured data | state/dexie-db.ts |
| LocalStorage | Settings, handles | agent/providers/ |
| File System Access | User files | filesystem/local-fs-adapter.ts |

## Migration Status

### Deprecated Modules

| Old Path | New Path | Action |
|----------|----------|--------|
| `lib/state/dexie-db.ts` | `infrastructure/persistence/dexie-db` | Use facade |
| `lib/filesync.ts` | `infrastructure/sync/workspace-services` | Use facade |

## Documentation Files

This directory contains:
- `scan-inventory.json` - Structured scan data
- `file-structure.txt` - Complete file tree
- `agent-system.md` - Agent system documentation
- `filesystem.md` - File system documentation
- `webcontainer.md` - WebContainer documentation
- `architecture.md` - Architecture patterns
- `dependencies.md` - Dependency maps
- `README.md` - This file
- `README-VI.md` - Vietnamese translation

## Quick Start

### Using File System

```typescript
import { LocalFSAdapter, localFS } from '@/lib/filesystem';

const adapter = new LocalFSAdapter();
await adapter.requestDirectoryAccess();
const content = await adapter.readFile('src/App.tsx');
```

### Using WebContainer

```typescript
import { boot, mount, spawn } from '@/lib/webcontainer';

await boot();
await mount({ 'index.js': { file: { contents: 'console.log("hi")' } } });
const process = await spawn('node', ['index.js']);
```

### Using Agent Tools

```typescript
import { createAgentClientTools } from '@/lib/agent/factory';

const tools = createAgentClientTools({
    getFileTools: () => fileToolsFacade,
    getTerminalTools: () => terminalToolsFacade,
});
```

### Using Events

```typescript
import { crossWorkspaceEventBus } from '@/lib/events/cross-workspace-event-bus';

crossWorkspaceEventBus.onFileChange((event) => {
    console.log('File changed:', event.filePath);
});
```

## Developer Guidelines

### File Limits
| Type | Max Lines |
|------|-----------|
| Slice file | 120 |
| Store file | 300 |
| Component | 300 |
| Hook | 150 |
| Helper | 120 |

### Import Order
1. React imports
2. Third-party libraries
3. Internal modules (@/)
4. Relative imports

### Test Coverage
- Target: 80%
- Current: 40-60%

## Known Issues

1. **Test File TypeScript Errors**: Some test files have type issues (excluded from production checks)
2. **God Stores**: Some stores exceed 300 lines (refactoring in progress)
3. **Duplicate State**: `IDELayout.tsx` duplicates IDE state

## Related Documentation

- Platform Architecture: `_bmad-output/architecture/platform-architecture-definitive-2026-01-04.md`
- ADR-024 State Management: `_bmad-output/project-planning-artifacts/adr-state-consolidation-2026-01-04.md`
- CLAUDE.md: Project-wide guidelines
