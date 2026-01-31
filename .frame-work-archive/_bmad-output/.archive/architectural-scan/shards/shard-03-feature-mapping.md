# Shard 3: Feature Mapping (Master Index)

**Shard ID**: ARCH-SHARD-03
**Parent**: ARCH-REMEDIATION-INDEX-2026-01-14
**Status**: MASTER INDEX - References Detailed Shards

---

## Feature Mapping Overview

This shard is a **master index** referencing detailed analyses for each core feature group.

---

## Core Centralized Groups

### Feature Group 1: BYOK Vault System
**Detailed Analysis**: [shard-03-01-byok.md](./shard-03-01-byok.md)

**Scope**: Secure API key storage and conditional usage across LLM providers

**Stories**:
| ID | Name | Priority | Status |
|----|------|----------|--------|
| BYOK-01 | Secure Key Storage | P0 | Detailed |
| BYOK-02 | Provider Key Management | P0 | Detailed |
| BYOK-03 | BYOK + Project Space Integration | P1 | Detailed |
| BYOK-04 | Key Security & Audit | P2 | Deferred |

**Key Issues**:
- God credentials slice (396 lines, 3 concerns mixed)
- No Zod validation for key input
- Duplicate Dexie storage

---

### Feature Group 2: Project Space Boundaries
**Detailed Analysis**: [shard-03-02-project-space.md](./shard-03-02-project-space.md)

**Scope**: Desktop File System vs Browser Database boundaries, routing, data flow

**Stories**:
| ID | Name | Priority | Status |
|----|------|----------|--------|
| PS-01 | Desktop File System Access | P0 | Detailed |
| PS-02 | Browser Database Fallback | P0 | Detailed |
| PS-03 | Unified Storage Abstraction | P0 | Detailed |
| PS-04 | Desktop ↔ Browser Sync | P1 | Deferred |
| PS-05 | Project Space Routing | P0 | Detailed |

**Key Issues**:
- God store useWorkspaceFileSystem (571 lines)
- No StorageAdapter interface
- Multiple Dexie databases

---

### Feature Group 3: Agent/LLM Orchestration
**Detailed Analysis**: [shard-03-03-agent-llm.md](./shard-03-03-agent-llm.md)

**Scope**: System prompts, mode classification, tools, RAG, multimodality

**Stories**:
| ID | Name | Priority | Status |
|----|------|----------|--------|
| AGENT-01 | Mode-Based Agent Behavior | P0 | Detailed |
| AGENT-02 | Tool Execution with Permissions | P0 | Detailed |
| AGENT-03 | RAG-Powered Context | P0 | Detailed |
| AGENT-04 | Multimodal Input/Output | P1 | Deferred |
| AGENT-05 | Tool Error Handling & Retry | P1 | Detailed |

**Key Issues**:
- Knowledge god module (46 files)
- RAG god module (30 files)
- blocksToMarkdown incomplete

---

### Feature Group 4: Cascade Chat Flow
**Detailed Analysis**: [shard-03-04-chat-flow.md](./shard-03-04-chat-flow.md)

**Scope**: Conversation → Thread → Messages → Tools → RAG cascade

**Stories**:
| ID | Name | Priority | Status |
|----|------|----------|--------|
| CHAT-01 | Conversation Auto-Creation | P0 | Detailed |
| CHAT-02 | Thread Management | P0 | Detailed |
| CHAT-03 | Message History & Search | P1 | Detailed |
| CHAT-04 | Context Window Management | P1 | Detailed |
| CHAT-05 | Tool Execution in Chat | P0 | Detailed |

**Key Issues**:
- Conversation store facade (495 lines)
- Direct store access in UI (47 violations)
- Memory leak in event subscriptions

---

## Cross-Workspace Features

### Feature Group 5: Cross-Workspace Features
**Detailed Analysis**: [shard-03-05-cross-workspace.md](./shard-03-05-cross-workspace.md)

**Scope**: Features spanning IDE, Notes, Knowledge, Study workspaces

**Components**:
- Cross-Workspace Event Bus
- Workspace Switcher
- Unified Workspace Context
- Project Context

**Key Issues**:
- Duplicate event bus instances
- UnifiedWorkspaceContext over-fetching
- Duplicate workspace contexts

---

## Workspace-Specific Features

### Feature Group 6: Workspace-Specific Features
**Detailed Analysis**: [shard-03-06-workspace-specific.md](./shard-03-06-workspace-specific.md)

**Scope**: Features unique to each workspace type

| Workspace | Unique Features | God Components |
|-----------|-----------------|----------------|
| IDE | Monaco editor, File tree, Terminal | Monaco (772 lines) |
| Notes | BlockNote editor, AI commands, Slash commands | NoteEditor (946 lines), AISlashCommand (1146 lines) |
| Knowledge | RAG indexing, Collections, Sources | KnowledgePage (749 lines) |
| Study | Flashcards, Quiz, SRS | StudyPage (?) |

---

## Feature → Architecture Matrix

| Feature Group | Architecture Groups Involved | Critical Issues |
|---------------|------------------------------|-----------------|
| BYOK | A, D, E, F | God store, type safety |
| Project Space | A, C, D, F | Storage abstraction, dual DBs |
| Agent/LLM | A, D, F | God modules (knowledge, RAG) |
| Chat Flow | A, B, D, F | Store facade, direct access |
| Cross-Workspace | B, F | Duplicate contexts, events |
| Workspace-Specific | A, F | God components |

---

## Next Steps

1. Review detailed feature analyses (shard-03-01 through 03-04)
2. Proceed to [Shard 04 - Conflict Detection](./shard-04-conflict-detection.md)
3. Proceed to [Shard 05 - Remediation Grouping](./shard-05-remediation-grouping.md)

---

*Back to [ARCH-INDEX.md](./ARCH-INDEX.md)*
*Next: [shard-03-01-byok.md](./shard-03-01-byok.md)*
