# Dependencies Documentation

## Overview

This document maps the dependencies between modules in `src/lib/` and external packages.

## External Dependencies

### AI & Machine Learning

| Package | Purpose | Used In |
|---------|---------|---------|
| `@tanstack/ai` | AI framework, tool definitions | `agent/factory.ts`, `agent/tools/` |
| `zod` | Schema validation | `agent/tools/types.ts` |
| `@google/generative-ai` | Gemini API for synthesis | `knowledge/synthesis-service.ts` |
| `@xenova/transformers` | Transformers.js for embeddings | `rag/transformers-loader.ts` |
| `@orama/orama` | Vector search engine | `rag/orama-index.ts` |

### File System & WebContainer

| Package | Purpose | Used In |
|---------|---------|---------|
| `@webcontainer/api` | WebContainer runtime | `webcontainer/manager.ts` |

### State Management

| Package | Purpose | Used In |
|---------|---------|---------|
| `zustand` | State management | `state/*`, `notes/note-store.ts` |
| `dexie` | IndexedDB wrapper | `state/dexie-db.ts`, `persistence/db.ts` |

### Events

| Package | Purpose | Used In |
|---------|---------|---------|
| `eventemitter3` | Event emitter | `events/cross-workspace-event-bus.ts` |

### UI & Utilities

| Package | Purpose | Used In |
|---------|---------|---------|
| `sonner` | Toast notifications | `utils/error-handling.ts` |
| `react-i18next` | Internationalization | `utils/error-handling.ts` |

## Internal Dependencies

### Agent Module

```
agent/
├── depends on:
│   ├── filesystem/     # File operations
│   ├── webcontainer/   # Terminal execution
│   ├── events/         # Cross-workspace events
│   └── state/          # Agent configuration
│
└── depended by:
    ├── presentation/   # Agent chat UI
    └── routes/         # API endpoints
```

### FileSystem Module

```
filesystem/
├── depends on:
│   ├── webcontainer/   # Mount files
│   └── sync/           # Event bus
│
└── depended by:
    ├── agent/          # Agent file tools
    └── filesync/       # File sync services
```

### WebContainer Module

```
webcontainer/
├── depends on:
│   └── events/         # Lifecycle events
│
└── depended by:
    ├── filesystem/     # Mount operations
    ├── agent/          # Terminal tools
    └── editor/         # Code execution
```

### RAG Module

```
rag/
├── depends on:
│   ├── knowledge/      # Source documents
│   └── state/          # Index storage
│
└── depended by:
    ├── knowledge/      # Search integration
    └── notes/          # Note indexing
```

### Knowledge Module

```
knowledge/
├── depends on:
│   ├── rag/            # Indexing
│   ├── pdf/            # PDF processing
│   └── state/          # Storage
│
└── depended by:
    ├── rag/            # Source documents
    └── notes/          # Note synthesis
```

### Events Module

```
events/
├── depends on:
│   └── (none - foundational)
│
└── depended by:
    ├── agent/          # Tool execution events
    ├── webcontainer/   # Lifecycle events
    ├── workspace/      # State changes
    └── filesync/       # Sync events
```

### State Module

```
state/
├── depends on:
│   └── persistence/    # Database
│
└── depended by:
    ├── agent/          # Agent configuration
    ├── knowledge/      # Knowledge state
    ├── notes/          # Note state
    └── workspace/      # Project state
```

### Notes Module

```
notes/
├── depends on:
│   ├── rag/            # Note indexing
│   └── state/          # Note storage
│
└── depended by:
    └── (presentation layer only)
```

### FileSync Module

```
filesync/
├── depends on:
│   ├── filesystem/     # File operations
│   └── workspace/      # Project context
│
└── depended by:
    └── (presentation layer only)
```

## Dependency Flow Diagram

```
                    ┌──────────────┐
                    │   events/    │
                    └──────────────┘
                           ▲
         ┌─────────────────┼─────────────────┐
         │                 │                 │
    ┌────┴────┐      ┌─────┴─────┐     ┌─────┴─────┐
    │ agent/  │      │workspace/ │     │webcontainer│
    └────┬────┘      └─────┬─────┘     └─────┬─────┘
         │                 │                 │
         ▼                 ▼                 ▼
    ┌────────┐       ┌─────────────┐   ┌─────────────┐
    │filesyst.│       │   state/    │   │  sync/      │
    └────┬───┘       └──────┬──────┘   └─────────────┘
         │                  │
         ▼                  ▼
    ┌────────┐       ┌─────────────┐
    │webcont.│       │ persistence/│
    └────────┘       └─────────────┘
         │
         ▼
    ┌────────┐
    │  rag/  │
    └────┬───┘
         │
         ▼
    ┌────────┐
    │knowl.  │
    └────────┘
```

## Circular Dependency Risks

### Potential Issues

1. **agent ↔ state**: Agent configuration depends on state, state may depend on agent events
2. **filesystem ↔ sync**: File operations trigger sync events, sync depends on file operations
3. **knowledge ↔ rag**: Knowledge sources indexed by RAG, RAG results used by knowledge

### Mitigation Strategies

1. **Event Bus Pattern**: Use events instead of direct imports
2. **Facade Pattern**: Abstract dependencies behind interfaces
3. **Lazy Imports**: Dynamic imports for breaking cycles
4. **Dependency Injection**: Pass dependencies as parameters

## Import Guidelines

### Do

```typescript
// Use barrel exports
import { useWorkspace } from '@/infrastructure/persistence/stores/workspace';

// Use facades for complex subsystems
import { createSyncManager } from '@/lib/filesystem/sync-manager';

// Use type-only imports when possible
import type { SyncConfig } from '@/lib/filesystem/sync-manager';
```

### Don't

```typescript
// Avoid deep imports
import { boot } from '@/lib/webcontainer/manager';

// Avoid circular imports (use events instead)
```

## Version Compatibility

| Package | Required Version | Notes |
|---------|------------------|-------|
| `@tanstack/ai` | ^0.2.0 | TanStack AI framework |
| `zod` | ^4.2.1 | Schema validation |
| `zustand` | ^5.0.0 | State management |
| `dexie` | ^3.2.0 | IndexedDB |
| `@webcontainer/api` | ^1.6.1 | WebContainer runtime |
| `eventemitter3` | ^5.0.0 | Event emitter |
| `sonner` | ^1.5.0 | Toast notifications |
