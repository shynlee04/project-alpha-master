# DESIGN: Centralized System Prompt & Self-Switching Agent Architecture

**Session**: MP-EPIC40-001
**Date**: 2026-01-10
**Type**: Architectural Design Specification
**Governance**: BMAD v6, ADR Template

---

## Executive Summary

This document defines the architecture for **ONE centralized system prompt** with context-aware self-switching behavior. It addresses the critical gap between the existing 5-layer prompt architecture and the need for intelligent, context-driven agent behavior.

### Bottom Line Up Front (BLUF)

**Current Problem**: Agent modes (solo-dev, code, notes) are statically configured and require manual selection. The system lacks intelligent routing based on context.

**Solution**: Implement a **Centralized Prompt Orchestrator** that:
1. Analyzes initiating prompt, workspace context, document context, and conversation context
2. Dynamically selects and composes the appropriate agent mode
3. Filters tools based on workspace type, permissions, and mode
4. Manages context window at 65% threshold with compression strategies

---

## PART 1: CURRENT ARCHITECTURE ANALYSIS

### Existing 5-Layer Architecture (in `prompt-composer.ts`)

```
┌─────────────────────────────────────────────────────────────────┐
│                    SYSTEM PROMPT COMPOSER                        │
├─────────────────────────────────────────────────────────────────┤
│  Layer 1: Tool Constitution (hidden, always sent)              │
│  Layer 2: Agent Mode (solo-dev/code/notes - MANUAL selection) │
│  Layer 3: Context Injection (open files, project summary)      │
│  Layer 4: User Preferences (defined, not fully utilized)       │
│  Layer 5: Session Context (defined, not fully utilized)        │
└─────────────────────────────────────────────────────────────────┘
```

### Current Agent Modes (in `system-prompt.ts`)

| Mode | ID | Use Case | Current Limitation |
|------|-----|----------|-------------------|
| Quick Flow Solo Dev | `solo-dev` | General development, vague requests | Manual selection only |
| Code | `code` | Execute-specific tasks, no questions | Manual selection only |
| Notes Assistant | `notes` | Note-taking, knowledge management | Manual selection only |

### Critical Gap: No Self-Switching Mechanism

The system has THREE well-defined modes but **NO intelligent router** to select between them based on context.

---

## PART 2: CENTRALIZED PROMPT ORCHESTRATOR DESIGN

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        PROMPT ORCHESTRATOR                               │
│  (ONE centralized system prompt with context-aware self-switching)     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  INPUT CONTEXT ANALYSIS                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Initiating   │  │  Workspace   │  │   Document   │  │ Conversation │ │
│  │   Prompt     │  │   Context    │  │   Context    │  │   Context    │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘ │
│         │                  │                  │                  │       │
│         └──────────────────┴──────────────────┴──────────────────┘       │
│                                    │                                   │
│                                    ▼                                   │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    MODE CLASSIFIER                                 │  │
│  │  (Analyzes context to determine optimal agent mode)                │  │
│  └───────────────────────────────────────┬───────────────────────────┘  │
│                                          │                               │
│           ┌──────────────────────────────┼────────────────────────────┐ │
│           ▼                              ▼                              ▼ │
│  ┌────────────┐              ┌────────────┐              ┌────────────┐ │
│  │   CODING   │              │  KNOWLEDGE │              │ORCHESTRATOR│ │
│  │   MODE     │              │   MODE     │              │   MODE     │ │
│  └─────┬──────┘              └─────┬──────┘              └─────┬──────┘ │
│        │                          │                          │           │
│        └──────────────────────────┴──────────────────────────┘           │
│                                    │                                   │
│                                    ▼                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │                    COMPOSED SYSTEM PROMPT                            │ │ │
│  │  - Tool Constitution (Layer 1)                                       │ │
│  │  - Selected Mode Configuration (Layer 2)                            │ │
│  │  - Injected Context (Layer 3)                                       │ │
│  │  - Tool Permissions Filtered by Mode/Workspace                      │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

### Mode Classification Logic

```typescript
interface ModeClassificationInput {
  initiatingPrompt: string;
  workspaceType: 'ide' | 'notes' | 'knowledge' | 'study';
  documentContext: {
    openFiles: string[];
    activeFile?: string;
    openNotes: string[];
    activeNote?: string;
  };
  conversationContext: {
    recentTopics: string[];
    dominantCategory: 'coding' | 'knowledge' | 'mixed' | 'unknown';
    messageCount: number;
  };
  userPermissions: string[];
}

interface ModeClassificationOutput {
  selectedMode: 'coding' | 'knowledge' | 'orchestrator';
  confidence: number;
  reasoning: string;
  toolFilter: string[];
}

class ModeClassifier {
  classify(input: ModeClassificationInput): ModeClassificationOutput {
    // 1. Workspace-based primary routing
    if (input.workspaceType === 'notes' || input.workspaceType === 'knowledge') {
      return {
        selectedMode: 'knowledge',
        confidence: 0.9,
        reasoning: 'Workspace type is knowledge-focused',
        toolFilter: KNOWLEDGE_TOOLS,
      };
    }

    // 2. Initiating prompt analysis
    const promptCategory = this.analyzePrompt(input.initiatingPrompt);

    // 3. Document context analysis
    const documentCategory = this.analyzeDocuments(input.documentContext);

    // 4. Conversation context analysis
    const conversationCategory = input.conversationContext.dominantCategory;

    // 5. Weighted decision
    return this.weightedDecision({
      promptCategory,
      documentCategory,
      conversationCategory,
      userPermissions: input.userPermissions,
    });
  }
}
```

---

## PART 3: ONE CENTRALIZED SYSTEM PROMPT STRUCTURE

### Master Prompt Template

```typescript
const CENTRALIZED_SYSTEM_PROMPT = `
# VIA-GENT AI AGENT

## IDENTITY
You are a context-aware AI assistant operating in the Via-Gent workspace. You automatically adapt your behavior based on the user's context, workspace type, and current task.

## CORE PRINCIPLES
1. **Context First**: Your behavior is determined by the environment and task
2. **Action Over Instruction**: Use tools to accomplish tasks, don't just describe
3. **Safety First**: Always read before modifying, ask when uncertain
4. **Respect Boundaries**: Only use tools appropriate for the current workspace

## TOOL CONSTITUTION
${TOOL_CONSTITUTION}

## DYNAMIC MODE CONFIGURATION
The following section is dynamically injected based on context analysis:

{{MODE_INJECTION_POINT}}

## WORKSPACE CONTEXT
{{WORKSPACE_CONTEXT_INJECTION_POINT}}

## AVAILABLE TOOLS
{{FILTERED_TOOLS_INJECTION_POINT}}

## CURRENT TASK
{{CURRENT_TASK_INJECTION_POINT}}
`;
```

### Mode-Specific Prompt Sections

```typescript
const MODE_PROMPTS = {
  coding: `
## MODE: CODING SPECIALIST
You are operating in CODING mode. Your expertise:
- File operations (read, write, list)
- Terminal commands and git operations
- Build systems and testing
- Code refactoring and debugging

Available Tools: readFile, writeFile, listFiles, executeCommand, git_operations
Focus: Code-related tasks with production-quality output.
`,

  knowledge: `
## MODE: KNOWLEDGE ASSISTANT
You are operating in KNOWLEDGE mode. Your expertise:
- Note creation, reading, updating, and organization
- Semantic search across notes and documents
- Research and content synthesis
- Multimodal content processing (PDF, images, URLs)

Available Tools: searchNotes, createNote, readNote, updateNote, deleteNote, listNotes, processPDF, processImage
Focus: Knowledge management and information clarity.
`,

  orchestrator: `
## MODE: ORCHESTRATOR
You are operating in ORCHESTRATOR mode. Your role:
- Analyze complex tasks requiring multiple capabilities
- Route subtasks to appropriate modes
- Coordinate between coding and knowledge operations
- NEVER execute directly - you delegate to specialized modes

Available Tools: None (routing only)
Focus: Task decomposition and coordination.
`,
};
```

---

## PART 4: TOOL PERMISSION & REGISTRY SYSTEM

### Centralized Tool Registry

```typescript
// src/domain/tools/centralized-tool-registry.ts

interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  category: 'file' | 'terminal' | 'note' | 'research' | 'multimodal';
  handler: ToolHandler;

  // Permission filtering
  permissions: Permission[];
  allowedModes: AgentMode[];
  allowedWorkspaces: WorkspaceType[];

  // Server-side exposure
  serverExposed: boolean;
  clientSide: boolean;
}

class CentralizedToolRegistry {
  private tools = new Map<string, ToolDefinition>();

  register(tool: ToolDefinition): void {
    this.tools.set(tool.id, tool);
  }

  // Get tools filtered by mode, workspace, and permissions
  getFilteredTools(config: {
    mode: AgentMode;
    workspaceType: WorkspaceType;
    userPermissions: Permission[];
    serverSide: boolean;
  }): ToolDefinition[] {
    return Array.from(this.tools.values()).filter(tool => {
      // Mode filter
      if (!tool.allowedModes.includes(config.mode)) return false;

      // Workspace filter
      if (!tool.allowedWorkspaces.includes(config.workspaceType)) return false;

      // Permission filter
      const hasPermissions = tool.permissions.every(p =>
        config.userPermissions.includes(p)
      );
      if (!hasPermissions) return false;

      // Server-side exposure filter
      if (config.serverSide && !tool.serverExposed) return false;

      return true;
    });
  }
}
```

### Tool Definition Registry (All Tools)

```typescript
const ALL_TOOLS: ToolDefinition[] = [
  // FILE TOOLS (CODING mode)
  {
    id: 'read_file',
    category: 'file',
    allowedModes: ['coding'],
    allowedWorkspaces: ['ide'],
    permissions: ['read_files'],
    serverExposed: true,
    clientSide: true,
  },
  {
    id: 'write_file',
    category: 'file',
    allowedModes: ['coding'],
    allowedWorkspaces: ['ide'],
    permissions: ['write_files'],
    serverExposed: true,
    clientSide: true,
  },
  {
    id: 'list_files',
    category: 'file',
    allowedModes: ['coding', 'knowledge'],
    allowedWorkspaces: ['ide', 'notes', 'knowledge'],
    permissions: ['read_files'],
    serverExposed: true,
    clientSide: true,
  },

  // TERMINAL TOOLS (CODING mode)
  {
    id: 'execute_command',
    category: 'terminal',
    allowedModes: ['coding'],
    allowedWorkspaces: ['ide'],
    permissions: ['execute_commands'],
    serverExposed: true,
    clientSide: true,
  },

  // NOTE TOOLS (KNOWLEDGE mode)
  {
    id: 'search_notes',
    category: 'note',
    allowedModes: ['knowledge'],
    allowedWorkspaces: ['notes', 'knowledge', 'study'],
    permissions: ['read_notes'],
    serverExposed: false, // Currently not exposed - needs fixing
    clientSide: true,
  },
  {
    id: 'create_note',
    category: 'note',
    allowedModes: ['knowledge'],
    allowedWorkspaces: ['notes', 'knowledge', 'study'],
    permissions: ['write_notes'],
    serverExposed: false, // Needs to be added
    clientSide: true,
  },
  {
    id: 'read_note',
    category: 'note',
    allowedModes: ['knowledge'],
    allowedWorkspaces: ['notes', 'knowledge', 'study'],
    permissions: ['read_notes'],
    serverExposed: false, // Needs to be added
    clientSide: true,
  },
  {
    id: 'update_note',
    category: 'note',
    allowedModes: ['knowledge'],
    allowedWorkspaces: ['notes', 'knowledge', 'study'],
    permissions: ['write_notes'],
    serverExposed: false, // Needs to be added
    clientSide: true,
  },
  {
    id: 'delete_note',
    category: 'note',
    allowedModes: ['knowledge'],
    allowedWorkspaces: ['notes', 'knowledge', 'study'],
    permissions: ['delete_notes'],
    serverExposed: false, // Needs to be added
    clientSide: true,
  },
  {
    id: 'list_notes',
    category: 'note',
    allowedModes: ['knowledge'],
    allowedWorkspaces: ['notes', 'knowledge', 'study'],
    permissions: ['read_notes'],
    serverExposed: false, // Needs to be added
    clientSide: true,
  },

  // RESEARCH TOOLS (KNOWLEDGE mode)
  {
    id: 'synthesize',
    category: 'research',
    allowedModes: ['knowledge'],
    allowedWorkspaces: ['knowledge', 'study'],
    permissions: ['research'],
    serverExposed: false,
    clientSide: true,
  },
  {
    id: 'process_pdf',
    category: 'multimodal',
    allowedModes: ['knowledge'],
    allowedWorkspaces: ['knowledge', 'study'],
    permissions: ['process_content'],
    serverExposed: false,
    clientSide: true,
  },
  {
    id: 'process_image',
    category: 'multimodal',
    allowedModes: ['knowledge'],
    allowedWorkspaces: ['knowledge', 'study'],
    permissions: ['process_content'],
    serverExposed: false,
    clientSide: true,
  },
  {
    id: 'process_url',
    category: 'multimodal',
    allowedModes: ['knowledge'],
    allowedWorkspaces: ['knowledge', 'study'],
    permissions: ['process_content'],
    serverExposed: false,
    clientSide: true,
  },
];
```

---

## PART 5: CONTEXT WINDOW MANAGEMENT (65% THRESHOLD)

### Current State vs. Required State

| Parameter | Current Value | Required Value |
|-----------|---------------|----------------|
| Compression Threshold | 80% | **65%** |
| Compression Target | 70% of max | 70% of max (OK) |
| Max Tokens | 128000 | 128000 (OK) |

### Implementation

```typescript
// src/infrastructure/persistence/stores/chat/slices/context-window/internal.ts

// CHANGE FROM:
export const DEFAULT_COMPRESSION_THRESHOLD = 80;

// CHANGE TO:
export const DEFAULT_COMPRESSION_THRESHOLD = 65;
```

### Context Management Strategy

```typescript
interface ContextWindowConfig {
  maxTokens: number;
  warningThreshold: number;  // 65%
  compressionTarget: number; // 70%
  strategy: 'drop_oldest' | 'summarize' | 'truncate';
}

interface ContextManager {
  // Check if context is near limit
  isNearLimit(threadId: string): boolean;

  // Get current usage
  getUsage(threadId: string): ContextUsage;

  // Compress context when threshold reached
  compress(threadId: string): CompressionResult;

  // Smart compression based on conversation importance
  smartCompress(threadId: string): CompressionResult;
}
```

---

## PART 6: IMPLEMENTATION ROADMAP

### Phase 1: Foundation (Week 1)

| Story | Description | Deliverable |
|-------|-------------|-------------|
| EPIC-40-01 | Create Centralized Tool Registry | `src/domain/tools/centralized-tool-registry.ts` |
| EPIC-40-02 | Implement Mode Classifier | `src/lib/agent/mode-classifier.ts` |
| EPIC-40-03 | Update Context Threshold to 65% | `context-window/internal.ts` |

### Phase 2: Server-Side Integration (Week 2)

| Story | Description | Deliverable |
|-------|-------------|-------------|
| EPIC-40-04 | Wire Note Tools to Server | Update `chat.ts:getTools()` |
| EPIC-40-05 | Implement Permission Filtering | Server-side permission checks |
| EPIC-40-06 | Add search_notes to LLM | Full RAG integration |

### Phase 3: Orchestrator & Testing (Week 3)

| Story | Description | Deliverable |
|-------|-------------|-------------|
| EPIC-40-07 | Build Prompt Orchestrator | `src/lib/agent/prompt-orchestrator.ts` |
| EPIC-40-08 | Implement Self-Switching Logic | Dynamic mode selection |
| EPIC-40-09 | E2E Testing & Validation | Full user journey tests |

---

## PART 7: SUCCESS CRITERIA

### Must Have (P0)

- [ ] One centralized system prompt template exists
- [ ] Mode classifier analyzes 4 context sources (prompt, workspace, document, conversation)
- [ ] Tool registry filters by mode, workspace, and permissions
- [ ] All 5 note tools server-exposed and working
- [ ] search_notes wired to LLM with RAG
- [ ] Context threshold at 65%
- [ ] Self-switching agent operational

### Should Have (P1)

- [ ] Orchestrator mode for complex multi-step tasks
- [ ] Smart compression based on conversation importance
- [ ] Tool usage analytics and observability

### Nice to Have (P2)

- [ ] Voice tools (KNOWLEDGE mode)
- [ ] Research tools (PDF/image/URL) server-exposed
- [ ] Custom mode configuration per user

---

## PART 8: DESIGN DECISIONS

### DD-001: One Centralized Prompt vs. Multiple Prompts

**Decision**: ONE centralized prompt with dynamic injection

**Rationale**:
- Single source of truth for agent behavior
- Easier to maintain and update
- Consistent tool constitution across all modes
- Dynamic injection allows mode-specific customization

### DD-002: Client vs. Server Tool Execution

**Decision**: Hybrid approach

- **File tools**: Client-side (FSA/IDB access)
- **Note tools**: Client-side (IndexedDB access)
- **Research tools**: Client-side (browser APIs)
- **Server role**: Tool definition exposure, permission validation, RAG coordination

### DD-003: Mode Switching Frequency

**Decision**: Per-request mode selection

**Rationale**:
- Each user message is re-analyzed for optimal mode
- Allows graceful handling of mixed-context conversations
- No persistent mode lock-in (prevents wrong mode frustration)

---

## HANDOFF TO NEXT STEP

This design specification is ready for:

1. **ADR Creation** - Document architectural decisions formally
2. **Sprint Planning** - Break down into implementable stories
3. **Correct Course Workflow** - Validate approach against existing codebase

---

**Status**: Design Complete, Ready for ADR & Sprint Planning

**Sources**:
- Current codebase analysis
- TanStack AI v0.2.0 documentation
- BMAD v6 governance framework
- User requirements: "read 20 pages, summarize, write into note, write into block, search information and output insights"
