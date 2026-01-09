# SYNTHESIS: EPIC-40 Agent Chat Tool Enhancement (UPDATED)

**Session**: MP-EPIC40-001
**Phase**: 3 (Synthesis & Design Routing)
**Date**: 2026-01-10
**Status**: COMPLETE (with Mode-Aware Design)

---

## Executive Summary

This synthesis combines **Phase 1 Diagnostics**, **Phase 2 Research**, and **Context Engineering Research** to produce a mode-aware design specification.

### Bottom Line Up Front (BLUF)

**Problem**: Server-side tool limitation (4 tools) blocks agent access to notes, research, RAG, and voice features.

**Critical Gap Missing**: The system lacks **mode-based agent segmentation** - different agent groups need different system prompts and tool sets to avoid "disastrous" outcomes.

**Solution**: Implement Route D (Integrated + Mode-Aware Design) - coordinated enhancement across tool registry, CRUD operations, mode-based prompt routing, RAG integration, and server-side exposure.

**Effort**: 6-9 implementation cycles

---

## PART 0: CONTEXT ENGINEERING PRINCIPLES (NEW)

### The Two-Agent-Group Architecture

Based on research from Roocode, Vellum, and industry best practices:

```
┌─────────────────────────────────────────────────────────────────┐
│                     ORCHESTRATOR LAYER                          │
│  (Routes tasks to appropriate agent group based on task type)   │
└─────────────────────────────────────────────────────────────────┘
                              │
            ┌─────────────────┴─────────────────┐
            ▼                                   ▼
┌──────────────────────────┐    ┌──────────────────────────┐
│   CODING AGENT GROUP     │    │  KNOWLEDGE AGENT GROUP   │
├──────────────────────────┤    ├──────────────────────────┤
│ System Prompt: CODE       │    │ System Prompt: GENERAL    │
│ Focus: File operations,   │    │ Focus: Notes, RAG,        │
│ terminal, git, build      │    │ research, multimodality   │
├──────────────────────────┤    ├──────────────────────────┤
│ Available Tools:         │    │ Available Tools:         │
│ • read_file              │    │ • search_notes (RAG)      │
│ • write_file             │    │ • create_note            │
│ • list_files            │    │ • read_note              │
│ • execute_command       │    │ • update_note            │
│ • git_operations         │    │ • delete_note            │
│ • build_test             │    │ • list_notes             │
└──────────────────────────┘    └──────────────────────────┘
```

### Context Engineering Best Practices (From Research)

| Principle | Description | Implementation |
|-----------|-------------|----------------|
| **Scoped Instructions** | Each mode gets role-specific prompts | `mode: 'coding'` → coding prompt |
| **Tool Filtering by Mode** | Modes only see relevant tools | Registry filters by mode capability |
| **Context Isolation** | Prevent conflicting assumptions | Separate context windows per mode |
| **Decision Forwarding** | Pass prior decisions to downstream agents | Shared state/memory layer |

### Failure Modes Without Mode-Aware Design

| Failure Mode | Cause | "Disastrous" Outcome |
|--------------|-------|----------------------|
| **Wrong Tool Usage** | Knowledge agent tries git operations | Corrupted repository |
| **Context Overflow** | Coding agent gets note RAG context | Wasted tokens, confusion |
| **Conflicting Assumptions** | Both agents try same task | Duplicate work, conflicts |
| **Hallucination** | Incomplete context for mode | Wrong actions taken |

---

## PART 1: PROBLEM RESTATEMENT (With Evidence)

### Root Cause Identified

**File**: [`src/routes/api/chat.ts:118-125`](src/routes/api/chat.ts#L118-L125)

```typescript
function getTools() {
    return [
        readFileDef,
        writeFileDef,
        listFilesDef,
        executeCommandDef,
    ];
}
```

**Evidence**: Only 4 tools hardcoded while 10+ tools exist on client side. **No mode-based filtering exists.**

### Impact Assessment

| Feature | Status | Impact |
|---------|--------|--------|
| Note CRUD | ❌ Blocked | Agent cannot create/read/update/delete notes |
| Semantic Search | ❌ Blocked | Agent cannot search notes with RAG |
| Research Tools | ❌ Blocked | Agent cannot process PDF/images/URLs |
| Voice I/O | ❌ Blocked | Agent cannot use voice features |
| Mode-Based Routing | ❌ Missing | No segmentation between coding/knowledge agents |
| File Operations | ✅ Working | Basic read/write/list/execute work |

---

## PART 2: INDUSTRY VALIDATION

### Research Sources

1. **[AI Orchestration System Prompts (GitHub)](https://github.com/danielrosehill/AI-Orchestration-System-Prompts)** - System prompts for orchestrating access to specialized agents
2. **[Best practices for building AI multi agent system (Vellum)](https://www.vellum.ai/blog/multi-agent-systems-building-with-context-engineering)** - Context engineering framework
3. **[Multi-Agent Orchestration: Choosing the Right Pattern](https://vunvulear.medium.com/multi-agent-orchestration-choosing-the-right-pattern-7de7d7c9d072)** - Orchestration patterns
4. **[AI Agent Orchestration Patterns - Azure Architecture Center](https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/ai-agent-design-patterns)** - Microsoft's official guidance
5. **[RAG vs. AI Agents: The Definitive 2025 Guide](https://medium.com/@tuguidragos/rag-vs-ai-agents-the-definitive-2025-guide-to-ai-automation-architecture-3d5157dd0097)** - Agentic RAG patterns

### Key Insight: Context Engineering is Critical

From Vellum research:
> "Cognition found that the main issue with multi agent systems is that they are highly failure prone when agents work from conflicting assumptions or incomplete information."

**Solution**: Build agents that factor in the collective knowledge and decisions of the entire system before acting.

---

## PART 3: SOLUTION ARCHITECTURE (MODE-AWARE)

### Design Philosophy

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
│ Prompt: You are a code   │    │ Prompt: You are a        │
│ specialist. You have    │    │ knowledge assistant.      │
│ access to file ops,      │    │ You can search notes,     │
│ terminal, and git.       │    │ create content, and       │
│                          │    │ research topics.         │
├──────────────────────────┤    ├──────────────────────────┤
│ Tools:                   │    │ Tools:                   │
│ • readFile              │    │ • searchNotes (RAG)       │
│ • writeFile             │    │ • createNote             │
│ • listFiles             │    │ • readNote               │
│ • executeCommand        │    │ • updateNote             │
│ • gitStatus             │    │ • deleteNote             │
│ • gitDiff               │    │ • listNotes              │
│                          │    │ • processPDF            │
│ Registry Filter:        │    │ • processImage           │
│ mode === 'coding'       │    │ • processURL             │
│                          │    │                          │
│ Registry Filter:        │    │ Registry Filter:         │
│ category === FILE       │    │ category === NOTE       │
└──────────────────────────┘    │         RESEARCH          │
                                 └──────────────────────────┘
```

### Tool Registry with Mode Awareness

```typescript
// Domain: Tool definitions
interface IToolDefinition {
  name: string;
  description: string;
  category: ToolCategory;
  parameters: z.ZodType;
  handler: ToolHandler;
  permissions: Permission[];
  modes: AgentMode[];  // NEW: Mode-specific availability
}

enum AgentMode {
  CODING = 'coding',
  KNOWLEDGE = 'knowledge',
  ORCHESTRATOR = 'orchestrator',
}

class ToolRegistry {
  // Get tools for specific mode
  getForMode(mode: AgentMode, permissions: Permission[]): IToolDefinition[] {
    return Array.from(this.tools.values())
      .filter(tool => tool.modes.includes(mode))
      .filter(tool => tool.permissions.every(p => permissions.includes(p)));
  }
}
```

### System Prompt Routing

```typescript
// src/lib/agent/prompt-composer.ts
interface ModePromptConfig {
  [AgentMode.CODING]: string;
  [AgentMode.KNOWLEDGE]: string;
  [AgentMode.ORCHESTRATOR]: string;
}

const MODE_PROMPTS: ModePromptConfig = {
  [AgentMode.CODING]: `
    You are a CODE SPECIALIST agent.
    Your expertise: file operations, terminal commands, git, build systems.
    Available tools: readFile, writeFile, listFiles, executeCommand, git operations.
    Focus: Code-related tasks only.
  `,

  [AgentMode.KNOWLEDGE]: `
    You are a KNOWLEDGE assistant agent.
    Your expertise: notes, research, RAG, multimodal content processing.
    Available tools: searchNotes, createNote, readNote, updateNote, deleteNote, listNotes.
    Focus: Knowledge-related tasks only.
  `,

  [AgentMode.ORCHESTRATOR]: `
    You are an ORCHESTRATOR.
    Your role: Route tasks to appropriate specialized modes.
    You NEVER execute tasks directly - you delegate to coding or knowledge modes.
  `,
};

export function composePrompt(
  mode: AgentMode,
  context: AgentContext
): string {
  const modePrompt = MODE_PROMPTS[mode];
  const tools = getToolDescriptions(mode);
  const ragContext = getRAGContext(mode, context);

  return [
    modePrompt,
    tools,
    ragContext,
    context.task,
  ].join('\n\n');
}
```

---

## PART 4: DESIGN SPECIFICATION - ROUTE D (UPDATED)

### Cycle D.1: Mode-Aware Tool Registry (1-2 cycles)

#### D.1.1: Create Tool Registry with Mode Support
**File**: `src/domain/tools/tool-registry.ts`

**Deliverables**:
- `IToolDefinition` interface with `modes` field
- `ToolRegistry` class with mode filtering
- `AgentMode` enum
- Zod schema definitions

#### D.1.2: Define Agent Modes
**File**: `src/domain/agents/agent-modes.ts`

```typescript
export enum AgentMode {
  CODING = 'coding',
  KNOWLEDGE = 'knowledge',
  ORCHESTRATOR = 'orchestrator',
}

export interface ModeConfig {
  systemPrompt: string;
  allowedCategories: ToolCategory[];
  defaultTools: string[];
}

export const MODE_CONFIGS: Record<AgentMode, ModeConfig> = {
  [AgentMode.CODING]: {
    systemPrompt: 'You are a code specialist...',
    allowedCategories: [ToolCategory.FILE, ToolCategory.TERMINAL],
    defaultTools: ['readFile', 'writeFile', 'listFiles', 'executeCommand'],
  },
  [AgentMode.KNOWLEDGE]: {
    systemPrompt: 'You are a knowledge assistant...',
    allowedCategories: [ToolCategory.NOTE, ToolCategory.RESEARCH],
    defaultTools: ['searchNotes', 'createNote', 'readNote', 'updateNote', 'deleteNote', 'listNotes'],
  },
  [AgentMode.ORCHESTRATOR]: {
    systemPrompt: 'You are an orchestrator...',
    allowedCategories: [],
    defaultTools: [],
  },
};
```

### Cycle D.2: Note CRUD Tools Implementation (1-2 cycles)
*(Same as before, tools tagged with KNOWLEDGE mode)*

### Cycle D.3: search_notes Integration (1 cycle)
*(Same as before, tool tagged with KNOWLEDGE mode)*

### Cycle D.4: Mode-Based Prompt System (1-2 cycles) - NEW

#### D.4.1: Implement Mode Prompt Composer
**File**: `src/lib/agent/prompt-composer.ts`

**Deliverables**:
- Mode-specific system prompts
- Dynamic tool descriptions per mode
- Context injection per mode

#### D.4.2: Implement Orchestrator Logic
**File**: `src/lib/agent/orchestrator.ts`

**Deliverables**:
- Task classification logic
- Mode routing
- Handoff management

### Cycle D.5: Server-Side Integration (1 cycle)

#### D.5.1: Update chat.ts with Mode Support
**File**: `src/routes/api/chat.ts`

```typescript
function getToolsForMode(mode: AgentMode, user: User) {
  const permissions = getUserPermissions(user);
  return toolRegistry.getForMode(mode, permissions);
}
```

### Cycle D.6: RAG Context Integration (1 cycle)

#### D.6.1: Mode-Aware RAG
**File**: `src/lib/agent/prompt-composer.ts`

- RAG context ONLY injected for KNOWLEDGE mode
- CODING mode gets no RAG context (prevents token waste)

### Cycle D.7: Testing & Validation (1-2 cycles)

#### D.7.1: Mode Routing Tests
- Verify coding tasks use CODING mode
- Verify knowledge tasks use KNOWLEDGE mode
- Verify tool filtering per mode

#### D.7.2: Context Isolation Tests
- Verify CODING mode doesn't get note tools
- Verify KNOWLEDGE mode doesn't get git tools
- Verify no context overflow

---

## PART 5: IMPLEMENTATION BREAKDOWN

| Cycle | Focus | Deliverables | Duration |
|-------|-------|--------------|----------|
| **D.1** | Mode-Aware Registry | Registry with mode filtering, Mode definitions | 1-2 cycles |
| **D.2** | Note CRUD Tools | 5 tools tagged with KNOWLEDGE mode | 1-2 cycles |
| **D.3** | search_notes Integration | Tool wired, tagged KNOWLEDGE | 1 cycle |
| **D.4** | Mode Prompt System | Mode-specific prompts, Orchestrator | 1-2 cycles |
| **D.5** | Server Integration | Mode-aware tool exposure | 1 cycle |
| **D.6** | RAG Context | Mode-aware RAG injection | 1 cycle |
| **D.7** | Testing | Unit, integration, E2E | 1-2 cycles |

**Total**: 6-9 cycles (increased from 5-8 due to mode awareness)

---

## PART 6: SUCCESS CRITERIA

### Must Have (P0)
- [ ] Mode-aware tool registry implemented
- [ ] CODING and KNOWLEDGE modes defined
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

### Nice to Have (P2)
- [ ] Voice tools (KNOWLEDGE mode)
- [ ] Research tools (KNOWLEDGE mode)
- [ ] Tool performance metrics
- [ ] Mode switching analytics

---

## PART 7: FILES TO CREATE/MODIFY

### New Files (12)
- `src/domain/tools/tool-registry.ts`
- `src/infrastructure/tools/tool-registry-impl.ts`
- `src/domain/agents/agent-modes.ts`
- `src/domain/agents/mode-config.ts`
- `src/domain/tools/schemas/*.ts`
- `src/domain/tools/note/*.ts` (5 files)
- `src/lib/agent/orchestrator.ts`

### Modified Files (4)
- `src/routes/api/chat.ts`
- `src/lib/agent/factory.ts`
- `src/lib/agent/prompt-composer.ts`
- `src/lib/agent/hooks/use-agent-chat-with-tools.ts`

---

## HANDOFF TO PHASE 4

This synthesis provides:

1. ✅ Problem restatement with evidence
2. ✅ Industry validation (including context engineering)
3. ✅ Mode-aware solution architecture
4. ✅ Design specifications for Route D (updated)
5. ✅ Risk assessment (including failure modes)
6. ✅ Success criteria
7. ✅ Implementation breakdown by cycle

**Critical Addition**: Mode-based agent segmentation prevents "disastrous" outcomes by ensuring:
- Coding agents only see coding tools
- Knowledge agents only see knowledge tools
- Each mode gets appropriate system prompts
- Context is isolated per mode

---

**Status**: Ready for Phase 4 authorization

**Sources**:
- [AI Orchestration System Prompts (GitHub)](https://github.com/danielrosehill/AI-Orchestration-System-Prompts)
- [Best practices for building AI multi agent system (Vellum)](https://www.vellum.ai/blog/multi-agent-systems-building-with-context-engineering)
- [Multi-Agent Orchestration: Choosing the Right Pattern](https://vunvulear.medium.com/multi-agent-orchestration-choosing-the-right-pattern-7de7d7c9d072)
- [AI Agent Orchestration Patterns - Azure Architecture Center](https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/ai-agent-design-patterns)
- [RAG vs. AI Agents: The Definitive 2025 Guide](https://medium.com/@tuguidragos/rag-vs-ai-agents-the-definitive-2025-guide-to-ai-automation-architecture-3d5157dd0097)
