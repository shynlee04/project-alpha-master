# Schema Architecture Overview

**Created:** 2026-02-01
**Status:** Reference document for remediation phases
**Authority:** SOURCE-OF-TRUTH.md

---

## Purpose

This document provides a map of all domain schemas and their status relative to the remediation roadmap. It answers: "What schemas exist, what's ready, what needs work?"

---

## Schema Inventory

### Core Entity Schemas (`@/domain/schemas/`)

| Schema | File | Status | Notes |
|--------|------|--------|-------|
| **Project** | `project.schema.ts` | ✅ Ready | Has `plugins` field, no workspaceBindings |
| **Thread** | `thread.schema.ts` | ⚠️ V1 | Needs `parts` in Phase D — see THREAD-V2-DESIGN.md |
| **Note** | `note.schema.ts` | ✅ Ready | Project-centric, BlockNote blocks |
| **File** | `file.schema.ts` | ✅ Ready | Project-centric, syncStatus |
| **Plugin** | `plugin.schema.ts` | ✅ Ready | PluginType, ProjectPlugins |

### Type Definitions (`@/domain/types/`)

| Types | File | Status | Notes |
|-------|------|--------|-------|
| **Provider** | `llm/provider-types.ts` | ✅ Ready | Comprehensive provider config |
| **Credentials** | `llm/credential-types.ts` | ✅ Ready | StoredCredential, CredentialStorage |
| **Models** | `llm/model-types.ts` | ✅ Ready | ModelInfo with capabilities |
| **Adapters** | `llm/adapter-types.ts` | ✅ Ready | Adapter interfaces |
| **Domain Events** | `domain-events.ts` | ✅ Ready | Event payloads |
| **Plugin Types** | `plugin-types.ts` | ✅ Ready | Plugin interfaces |

### Entity Classes (`@/domain/entities/`)

| Entity | File | Status | Notes |
|--------|------|--------|-------|
| **Agent** | `agent.ts` | ⚠️ Legacy naming | Uses `workspaceBindings` (aliased to PluginCapability) |
| **Project** | `project.ts` | ⚠️ Duplicate | Prefer `@/domain/schemas/project.schema.ts` |
| **Chat** | `chat.ts` | Unknown | Need to verify |
| **Workspace** | `workspace.ts` | ❌ Legacy | Should be removed/archived |

### Value Objects (`@/domain/value-objects/`)

| Value Object | File | Status | Notes |
|--------------|------|--------|-------|
| **WorkspaceBinding** | `workspace-binding.ts` | ⚠️ Bridge | Aliases to PluginCapability, deprecated |
| **ToolPermission** | `tool-permission.ts` | ✅ Ready | AgentToolBinding class |
| **WorkspaceType** | `workspace-type.ts` | ⚠️ Bridge | Aliases to PluginType |

### Tools (`@/domain/tools/`)

| Tool | File | Status | Notes |
|------|------|--------|-------|
| **ToolPermissions** | `tool-permissions.ts` | ❌ Stub | Phase 2 disabled, returns empty |

---

## Schema Update Schedule

| Phase | Schema Changes | Design Doc |
|-------|----------------|------------|
| **A: BYOK** | None | N/A |
| **B: AI Gateway** | None | N/A |
| **C: Notes AI** | None | N/A |
| **D: Agentic** | ThreadMessage `parts`, ToolCall, ToolResult | THREAD-V2-DESIGN.md |
| **E: RAG** | None (uses Orama schema) | N/A |

---

## Canonical Import Paths

All schema imports should use these paths:

```typescript
// Core schemas (Zod + derived types)
import { Project, ProjectSchema } from '@/domain/schemas/project.schema';
import { Thread, ThreadMessage, ThreadSchema } from '@/domain/schemas/thread.schema';
import { Note, NoteSchema } from '@/domain/schemas/note.schema';
import { FileMetadata, FileSchema } from '@/domain/schemas/file.schema';
import { PluginType, ProjectPlugins } from '@/domain/schemas/plugin.schema';

// Provider types
import { ProviderConfig, ProviderType } from '@/domain/types/llm/provider-types';
import { StoredCredential, CredentialStorage } from '@/domain/types/llm/credential-types';
import { ModelInfo } from '@/domain/types/llm/model-types';

// Domain events
import { DomainEventType, DomainEvent } from '@/domain/types/domain-events';
```

---

## Deprecated Paths (Do Not Use)

```typescript
// ❌ BANNED - use @/domain/schemas/plugin.schema instead
import { WorkspaceBinding } from '@/domain/value-objects/workspace-binding';
import { WorkspaceType } from '@/domain/value-objects/workspace-type';

// ❌ BANNED - use @/domain/schemas/* instead
import { Project } from '@/domain/entities/project';
import { Workspace } from '@/domain/entities/workspace';

// ❌ BANNED - will be removed
import { anything } from '@/lib/*';
```

---

## Design Documents

| Document | Purpose | Status |
|----------|---------|--------|
| `THREAD-V2-DESIGN.md` | Parts-based ThreadMessage, ToolCall, ToolResult | ✅ Created |
| `TOOL-REGISTRY-DESIGN.md` | Tool definitions, permissions | Planned for Phase D |
| `RAG-SCHEMA-DESIGN.md` | Orama integration, RAGDocument | Planned for Phase E |

---

## Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                           PROJECT                                    │
│                    (Root entity - owns all)                          │
│  @/domain/schemas/project.schema.ts                                  │
└───────────────────────────────────┬─────────────────────────────────┘
                                    │
         ┌──────────────────────────┼──────────────────────────┐
         │ projectId                │ projectId                │ projectId
         ▼                          ▼                          ▼
┌─────────────────┐        ┌─────────────────┐        ┌─────────────────┐
│      FILE       │        │     THREAD      │        │      NOTE       │
│  file.schema.ts │        │ thread.schema.ts│        │ note.schema.ts  │
└─────────────────┘        └────────┬────────┘        └─────────────────┘
                                    │
                                    │ messages[]
                                    ▼
                           ┌─────────────────┐
                           │  ThreadMessage  │
                           │  (embedded)     │
                           └────────┬────────┘
                                    │
                      ┌─────────────┴─────────────┐
                      │ parts[] (V2)              │ toolCalls[] (V1)
                      ▼                           ▼
              ┌─────────────────┐        ┌─────────────────┐
              │  MessagePart    │        │   ToolCall      │
              │  (V2 - Phase D) │        │  (enhanced V2)  │
              └─────────────────┘        └─────────────────┘
                      │                           │
                      │                           │
              ┌───────┴───────┐                   ▼
              │               │          ┌─────────────────┐
              ▼               ▼          │   ToolResult    │
         'text'          'tool_call'     │  (V2 - Phase D) │
         'code'          'tool_result'   └─────────────────┘
         'artifact'           │
         'thinking'           │
         'image'              │
         'error'              │
                              │
                              ▼
                    TOOL_REGISTRY (static)
                    @/domain/tools/tool-registry.ts
                    (V2 - Phase D)
```

---

## What's NOT in Schemas

These are stored elsewhere:

| Data | Storage | Schema Location |
|------|---------|-----------------|
| **API Keys** | Encrypted in IndexedDB | `CredentialStorage` interface |
| **RAG Embeddings** | Orama (in-memory + persist) | Orama schema (not Dexie) |
| **File Content** | FSA or OPFS | No schema (raw bytes) |
| **UI State** | Zustand (no persist) | No schema (ephemeral) |
| **Layout State** | Part of Project | `LayoutConfig` in project.schema |

---

*Last updated: 2026-02-01*
*Reference: SOURCE-OF-TRUTH.md, THREAD-V2-DESIGN.md*
