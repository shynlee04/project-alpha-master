# True Use Cases Mapping
**Date:** 2026-01-11
**Based On:** Actual Implementation Analysis
**Status:** ACTIVE - Ground Truth

---

## Overview

This document maps the TRUE use cases based on actual codebase implementation, correcting documentation discrepancies and poisoning context.

---

## Use Case 1: Agents Executing CRUD Operations on Tools

### TRUE Implementation

**Status:** ✅ CONFIRMED - Working as implemented

**Architecture:**
- Agents are configured with tool bindings per workspace
- Tools are registered in centralized registry with metadata
- Permission checks occur before execution

**Key Files:**
- `src/domain/entities/agent.ts` - Agent entity with tool bindings
- `src/infrastructure/tools/centralized-tool-registry.ts` - Tool registration
- `src/infrastructure/tools/tool-catalog.ts` - 25+ registered tools

**Tool Categories (10 total):**
| Category | Tools | Permission Model |
|----------|-------|------------------|
| `files` | read, write, list, search | Workspace-scoped |
| `terminal` | execute, shell | Trust-based |
| `knowledge` | synthesize, processPDF, processImage | Workspace-scoped |
| `vision` | analyze, OCR | Trust-based |
| `search` | code, text, semantic | Workspace-scoped |
| `web` | scrape, fetch | Trust-based |
| `notes` | create, read, update, delete | Workspace-scoped |
| `unified` | cross-workspace operations | Special permissions |
| `composite` | multi-step workflows | Orchestrator-only |
| `provider` | LLM operations | Admin-level |

**Permission Flow:**
```
1. Agent requests tool execution
2. WorkspacePermissionManager.checkWorkspacePermission()
3. ToolTrustLevel check (auto/prompt/block)
4. Tool execution or user prompt
5. Result returned to agent
```

**Documentation Discrepancy:** None - implementation matches docs

---

## Use Case 2: RAG (Retrieval Augmented Generation) Operations

### TRUE Implementation

**Status:** ✅ CONFIRMED - Using Gemini Multimodal (NOT traditional vector DB)

**Architecture:**
- RAG uses Google Gemini multimodal API
- NO separate vector database or embedding system
- Processing happens at API level, not local

**Key Files:**
- `src/lib/agent/facades/knowledge-tools.ts` - Knowledge tools facade
- Synthesis Service - Wraps Gemini multimodal API

**RAG Operations:**
| Operation | Implementation | Input | Output |
|-----------|----------------|-------|--------|
| `synthesize()` | Gemini API | Text, context | Synthesized knowledge |
| `processPDF()` | Gemini extraction | PDF file | Extracted text |
| `processImage()` | Gemini Vision | Image file | OCR + understanding |
| `processURL()` | Web scraping + Gemini | URL | Processed content |

**Documentation Discrepancy:** ⚠️ MAJOR
- **Documented:** Traditional RAG with embeddings and vector DB
- **Actual:** Gemini multimodal API only
- **Impact:** Architecture docs mention vector DB that doesn't exist

---

## Use Case 3: Multi-Client Support (Phone and Desktop)

### TRUE Implementation

**Status:** ✅ CONFIRMED - Workspace-based, NOT client-based

**Architecture:**
- Clients access workspaces, not separate client implementations
- Workspace abstraction handles different client types
- Same tools available across clients (workspace-scoped)

**Workspace Types:**
| Workspace | description | Client Support |
|-----------|---------|----------------|
| `ide` | Code development | Desktop (primary), Mobile (limited) |
| `knowledge` | Knowledge synthesis | Both (responsive UI) |
| `study` | Study materials | Both |
| `notes` | Note-taking | Both |

**Client Detection:**
- Responsive UI adapts to client
- Workspace availability filtered by client capabilities
- No separate "mobile app" architecture

**Documentation Discrepancy:** ⚠️ MODERATE
- **Documented:** Separate client types (phone, desktop)
- **Actual:** Workspace-based with responsive UI
- **Impact:** Minor - architectural approach is sound

---

## Use Case 4: File Synchronization Between Clients

### TRUE Implementation

**Status:** ✅ CONFIRMED - Sophisticated bidirectional sync

**Architecture:**
- Workspace-scoped sync with cross-workspace references
- Bidirectional sync with conflict resolution
- FSA for desktop, IndexedDB for fallback/mobile

**Key Files:**
- `src/infrastructure/sync/workspace-services/file-sync-service.ts`
- `src/infrastructure/sync/strategies/bidirectional-sync.ts`
- `src/infrastructure/sync/adapters/` (FSA, IDB)

**Sync Strategy:**
| Scenario | Strategy |
|----------|----------|
| Same file, both modified | Last-write-wins + user prompt for conflicts |
| New file on one side | Copy to other side |
| Deleted on one side | Prompt user |
| Cross-workspace reference | Maintain reference, sync actual file once |

**Conflict Resolution:**
- Currently: Last-write-wins (can cause data loss)
- Planned: User prompts for conflicts (see EPIC-FS-06)

**Documentation Discrepancy:** None - implementation is more sophisticated than docs

---

## Use Case 5: Workspace Management (Different Tools, Different Responsibilities)

### TRUE Implementation

**Status:** ✅ CONFIRMED - Workspace-based tool scoping

**Architecture:**
- Each workspace has different tool availability
- Agents have per-workspace tool bindings
- Permissions are workspace-scoped

**Workspace Tool Matrix:**
| Tool | IDE | Knowledge | Study | Notes |
|------|-----|-----------|-------|-------|
| read_file | ✅ | ❌ | ❌ | ✅ |
| write_file | ✅ | ❌ | ❌ | ✅ |
| terminal | ✅ | ❌ | ❌ | ❌ |
| synthesize | ❌ | ✅ | ✅ | ❌ |
| processPDF | ❌ | ✅ | ✅ | ❌ |
| notes CRUD | ✅ | ✅ | ✅ | ✅ |

**Agent Workspace Bindings:**
```typescript
agent.workspaceBindings = [
  { workspaceType: 'ide', isAvailable: true, tools: ['read_file', 'terminal'] },
  { workspaceType: 'knowledge', isAvailable: true, tools: ['synthesize', 'processPDF'] },
  { workspaceType: 'notes', isAvailable: true, tools: ['notes', 'read_file'] }
]
```

**Documentation Discrepancy:** None

---

## Use Case 6: Project Space Management

### TRUE Implementation

**Status:** ✅ CONFIRMED - Project-based conversations

**Architecture:**
- Conversations are scoped to projects
- Projects belong to workspaces
- Project metadata tracked separately

**Key Files:**
- `src/infrastructure/persistence/stores/chat/unified-chat-store.ts`
- `src/domain/entities/project.ts`

**Project Structure:**
```typescript
Project {
  id: string
  name: string
  workspaceType: WorkspaceType
  path: string          // File system path
  metadata: ProjectMetadata
}

Conversation {
  id: string
  projectId?: string    // Project-scoped
  agentId: string
  workspaceType: WorkspaceType
}
```

**Documentation Discrepancy:** None

---

## Use Case 7: Thread Management for Chat

### TRUE Implementation

**Status:** ✅ CONFIRMED - Hierarchical thread system

**Architecture:**
- Threads have parent-child relationships
- Cascade delete operations
- Thread lifecycle management

**Key Files:**
- `src/infrastructure/persistence/stores/chat/slices/thread-management-slice.ts`

**Thread Operations:**
| Operation | Description |
|-----------|-------------|
| `createThread(parentThreadId?)` | Create with optional parent |
| `deleteThread(threadId)` | Cascade delete children |
| `getThreadHierarchy(threadId)` | Get full tree |
| `getThreadMessages(threadId)` | Get messages for thread |

**Thread Structure:**
```
Thread (root)
├── Thread (child 1)
│   └── Thread (grandchild)
└── Thread (child 2)
```

**Documentation Discrepancy:** None

---

## Use Case 8: Agent Orchestrator with Mode Switching

### TRUE Implementation

**Status:** ⚠️ PARTIAL - Manual mode switching (not automatic)

**Architecture:**
- Agents have modes (coding, knowledge, orchestrator)
- Tools are restricted by mode
- Mode switching is MANUAL, not automatic

**Agent Modes:**
| Mode | description | Tools |
|------|---------|-------|
| `coding` | Development | read_file, write_file, terminal, search |
| `knowledge` | RAG/synthesis | synthesize, processPDF, processImage |
| `orchestrator` | Multi-step | composite, unified |

**Mode Restriction:**
```typescript
toolDefinition = {
  id: 'read_file',
  allowedModes: ['coding', 'orchestrator']  // NOT available in knowledge mode
}
```

**Documentation Discrepancy:** ⚠️ MODERATE
- **Documented:** Automatic mode switching based on context
- **Actual:** Manual mode selection only
- **Impact:** UX issue - users must manually switch modes

---

## Use Case 9: User Permissions for Tool Access

### TRUE Implementation

**Status:** ✅ CONFIRMED - Multi-layered permission system

**Architecture:**
- ToolPermissionManager (singleton)
- WorkspacePermissionManager (per-workspace)
- Trust level system (auto/prompt/block)

**Permission Layers:**
1. **Tool Level:** Is tool enabled for agent?
2. **Workspace Level:** Is tool available in workspace?
3. **Mode Level:** Is tool allowed in current agent mode?
4. **Trust Level:** auto/prompt/block

**Permission Check Flow:**
```
User requests tool execution
  ↓
Tool enabled for agent? → NO → Block
  ↓ YES
Tool available in workspace? → NO → Block
  ↓ YES
Tool allowed in agent mode? → NO → Block
  ↓ YES
What is trust level?
  ├─ auto → Execute
  ├─ prompt → Ask user
  └─ block → Block
```

**Key Files:**
- `src/infrastructure/tools/tool-permissions.ts`
- `src/lib/agent/workspace-permission-manager.ts`

**Documentation Discrepancy:** None

---

## Cross-Workspace Management

### TRUE Implementation

**Status:** ✅ CONFIRMED - Through project space and unified tools

**Architecture:**
- Projects can span workspaces
- Unified tools operate across workspaces
- Cross-workspace file references supported

**Cross-Workspace Operations:**
- **Unified Tools:** Can access data from multiple workspaces
- **Project References:** Files can reference across workspaces
- **Agent Access:** Agents can be configured for multiple workspaces

**Agent Workspace Binding:**
```typescript
agent.workspaceBindings = [
  { workspaceType: 'ide', isAvailable: true },
  { workspaceType: 'knowledge', isAvailable: true },
  { workspaceType: 'notes', isAvailable: false }  // Not available here
]
```

---

## Summary of Discrepancies

| Use Case | Documentation | Implementation | Severity |
|----------|---------------|----------------|----------|
| Agent CRUD tools | Correct | Correct | ✅ None |
| RAG operations | Vector DB mentioned | Gemini multimodal only | ⚠️ Major |
| Multi-client | Separate clients | Workspace-based | ⚠️ Minor |
| File sync | Basic described | Sophisticated bidirectional | ✅ Better than documented |
| Workspace management | Correct | Correct | ✅ None |
| Project space | Correct | Correct | ✅ None |
| Thread management | Correct | Correct | ✅ None |
| Agent orchestrator | Auto switching | Manual switching | ⚠️ Moderate |
| User permissions | Correct | Correct | ✅ None |

---

## Related Documents

- [BMAD Architecture SSOT](_bmad-output/architecture/BMAD-ARCHITECTURE-SSOT-2026-01-11.md)
- [Poisoning Context Report](_bmad-output/architecture/POISONING-CONTEXT-2026-01-11.md)
- [Epic/Story Remediation Plan](_bmad-output/architecture/EPIC-STORY-REMEDIATION-2026-01-11.md)

---

*Ground Truth Analysis: 2026-01-11*
*Based on actual codebase implementation*
