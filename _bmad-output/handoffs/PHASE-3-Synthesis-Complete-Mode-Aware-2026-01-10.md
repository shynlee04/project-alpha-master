# HANDOFF: Phase 3 Synthesis Complete (Mode-Aware Design)

**Session**: MP-EPIC40-001
**Date**: 2026-01-10
**Phase**: 3 (Synthesis & Design Routing)
**Status**: COMPLETE

---

## From
- **Phase**: 2 (Research Discovery)
- **Input**: Industry best practices research

## To
- **Phase**: 4 (Conditional Implementation)
- **Action**: Awaiting user authorization

---

## Executive Summary

Phase 3 completed synthesis with **critical addition**: Based on user input about Roocode's Orchestrator mode and Context Engineering research, we've enhanced Route D to be **mode-aware**.

### Key Insight: Two-Agent-Group Architecture

**Problem Identified**: Without mode-based agent segmentation, agents with wrong prompts/tools can cause "disastrous" outcomes:
- Coding agents trying note operations → confusion, wrong actions
- Knowledge agents trying git operations → repository corruption risk
- All agents getting same context → token waste, conflicting assumptions

**Solution**: Implement mode-aware design with:
- **CODING mode**: File operations, terminal, git
- **KNOWLEDGE mode**: Notes, RAG, research, multimodality
- **ORCHESTRATOR mode**: Routes tasks, never executes

---

## Artifacts Created

| Artifact | Location |
|----------|----------|
| Synthesis Document (Mode-Aware) | [`synthesis-document-mode-aware.md`](_bmad-output/phase3-synthesis/synthesis-document-mode-aware.md) |
| Implementation Cycles | [`implementation-cycles.md`](_bmad-output/phase3-synthesis/implementation-cycles.md) |
| Phase 3 Handoff | This document |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      ORCHESTRATOR LAYER                         │
│  • Task classification (coding vs knowledge)                    │
│  • Mode routing                                               │
│  • Context injection                                         │
└─────────────────────────────────────────────────────────────────┘
                              │
            ┌─────────────────┴─────────────────┐
            ▼                                   ▼
┌──────────────────────────┐    ┌──────────────────────────┐
│   CODING MODE            │    │   KNOWLEDGE MODE         │
├──────────────────────────┤    ├──────────────────────────┤
│ System Prompt: CODE       │    │ System Prompt: GENERAL    │
│ Focus: File operations,   │    │ Focus: Notes, RAG,        │
│ terminal, git, build      │    │ research, multimodality   │
├──────────────────────────┤    ├──────────────────────────┤
│ Tools:                   │    │ Tools:                   │
│ • read_file              │    │ • search_notes (RAG)      │
│ • write_file             │    │ • create_note            │
│ • list_files            │    │ • read_note              │
│ • execute_command       │    │ • update_note            │
│ • git_status             │    │ • delete_note            │
│ • git_diff               │    │ • list_notes             │
│                          │    │ • process_pdf            │
│ Registry Filter:          │    │ • process_image          │
│ mode === 'coding'        │    │ • process_url            │
│ category === FILE        │    │                          │
└──────────────────────────┘    │ category === NOTE/RESEARCH│
                                 └──────────────────────────┘
```

---

## Implementation Cycles (Updated)

| Cycle | Focus | Duration |
|-------|-------|----------|
| **D.1** | Mode-Aware Registry | 1-2 cycles |
| **D.2** | Note CRUD Tools | 1-2 cycles |
| **D.3** | search_notes Integration | 1 cycle |
| **D.4** | Mode Prompt System | 1-2 cycles |
| **D.5** | Server Integration | 1 cycle |
| **D.6** | RAG Context | 1 cycle |
| **D.7** | Testing | 1-2 cycles |

**Total**: 6-9 cycles (increased from 5-8)

---

## New Files to Create (12 total)

### Core Infrastructure
- `src/domain/tools/tool-registry.ts` - IToolDefinition with modes
- `src/infrastructure/tools/tool-registry-impl.ts` - Registry implementation
- `src/domain/agents/agent-modes.ts` - AgentMode enum
- `src/domain/agents/mode-config.ts` - Mode configurations
- `src/lib/agent/orchestrator.ts` - Orchestrator logic

### Note Tools
- `src/domain/tools/note/create-note-tool.ts`
- `src/domain/tools/note/read-note-tool.ts`
- `src/domain/tools/note/update-note-tool.ts`
- `src/domain/tools/note/delete-note-tool.ts`
- `src/domain/tools/note/list-notes-tool.ts`

### Schemas
- `src/domain/tools/schemas/*.ts` - Zod schemas

---

## Files to Modify (4 total)

| File | Changes |
|------|---------|
| [`src/routes/api/chat.ts`](src/routes/api/chat.ts) | Mode-aware getTools() |
| [`src/lib/agent/factory.ts`](src/lib/agent/factory.ts) | Wire search_notes |
| [`src/lib/agent/prompt-composer.ts`](src/lib/agent/prompt-composer.ts) | Mode-specific prompts |
| [`src/lib/agent/hooks/use-agent-chat-with-tools.ts`](src/lib/agent/hooks/use-agent-chat-with-tools.ts) | Mode selection |

---

## Success Criteria

### Must Have (P0)
- [ ] Mode-aware tool registry implemented
- [ ] CODING and KNOWLEDGE modes defined with distinct prompts
- [ ] All 5 note CRUD tools implemented
- [ ] search_notes wired to LLM
- [ ] Mode-specific system prompts active
- [ ] Server exposes mode-filtered tools
- [ ] Tests passing

### Should Have (P1)
- [ ] RAG context only for KNOWLEDGE mode
- [ ] Orchestrator routing logic
- [ ] Permission filtering per mode
- [ ] Context isolation verified

---

## Research Sources

### Context Engineering & Multi-Agent Systems
- [AI Orchestration System Prompts (GitHub)](https://github.com/danielrosehill/AI-Orchestration-System-Prompts)
- [Best practices for building AI multi agent system (Vellum)](https://www.vellum.ai/blog/multi-agent-systems-building-with-context-engineering)
- [Multi-Agent Orchestration: Choosing the Right Pattern](https://vunvulear.medium.com/multi-agent-orchestration-choosing-the-right-pattern-7de7d7c9d072)
- [AI Agent Orchestration Patterns - Azure Architecture Center](https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/ai-agent-design-patterns)

### Tool Design & RAG
- [How to think about agent frameworks (LangChain Blog)](https://blog.langchain.com/how-to-think-about-agent-frameworks/)
- [RAG vs. AI Agents: The Definitive 2025 Guide](https://medium.com/@tuguidragos/rag-vs-ai-agents-the-definitive-2025-guide-to-ai-automation-architecture-3d5157dd0097)

---

## Decision Point

**Proceed to Phase 4 (Implementation)?**

Phase 4 will execute the mode-aware design across 6-9 cycles.

**Options**:
- **[A]** Authorize Phase 4 - Begin with Cycle D.1 (Mode-Aware Registry)
- **[B]** Quick Fix - Skip mode awareness, basic tool fix only (2 cycles)
- **[C]** Show Menu - Display full interactive menu

---

**Status**: Awaiting user authorization for Phase 4
