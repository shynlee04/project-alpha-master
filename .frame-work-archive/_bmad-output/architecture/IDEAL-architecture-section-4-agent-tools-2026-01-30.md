---
document_id: IDEAL-ARCH-004
title: "IDEAL Architecture - Section 4: Agent & Tool Architecture"
version: "1.0.0"
status: "HYPOTHESIS - PENDING VALIDATION"
created: "2026-01-30T23:15:00+07:00"
author: "architect-ext"
parent_session: "ses_3f3a97f58ffeAQG0ztux1SZMCR"
synthesis_sources:
  - "new-fundamental-truths.md v2.2.0"
  - "architecture.md v4.0.0"
  - "TanStack AI SDK official docs (2026)"
  - "Project Alpha agent entity analysis"
  - "BMAD framework agent orchestration patterns"
validation_status: "NOT VALIDATED"
---

# IDEAL Architecture - Section 4: Agent & Tool Architecture

> **HYPOTHESIS DOCUMENT**: This represents the TARGET state for Project Alpha's agent and tool system. All patterns here are prescriptive and opinionated. Validation required before implementation.

---

## 1. Architecture Overview

### 1.1 The Hierarchical Agent Model

```
+============================================================================+
|                           USER INTERFACE LAYER                               |
|  +----------------------------------------------------------------------+  |
|  |                        Chat Cascade Plugin                            |  |
|  |  +--------------+  +---------------+  +----------------------------+  |  |
|  |  | Message Input|  | Thread Panel  |  | Streaming Response Display |  |  |
|  |  +--------------+  +---------------+  +----------------------------+  |  |
|  +----------------------------------------------------------------------+  |
+============================================================================+
                                    |
                                    v
+============================================================================+
|                         ORCHESTRATOR LAYER                                   |
|  +----------------------------------------------------------------------+  |
|  |                    Agent Coordinator                                  |  |
|  |  +-----------------+  +------------------+  +---------------------+   |  |
|  |  | Context Detect  |  | Task Decompose   |  | Route to Agent      |   |  |
|  |  +-----------------+  +------------------+  +---------------------+   |  |
|  |                                                                       |  |
|  |  Tools: read-files, grep, glob, list-files, todowrite, todoread,     |  |
|  |         switch-mode, delegate-tasks, question                         |  |
|  |  Permission: READ-ONLY (no write, no bash, no destructive ops)        |  |
|  +----------------------------------------------------------------------+  |
+============================================================================+
                                    |
             +----------------------+----------------------+
             |                      |                      |
             v                      v                      v
+========================+  +========================+  +========================+
|    DOMAIN AGENTS       |  |    DOMAIN AGENTS       |  |    DOMAIN AGENTS       |
|------------------------|  |------------------------|  |------------------------|
|   dev-ext              |  |   architect-ext        |  |   analyst-ext          |
|   - File CRUD          |  |   - Design docs        |  |   - Research           |
|   - bash (limited)     |  |   - ADRs               |  |   - Analysis           |
|   - task delegation    |  |   - Review             |  |   - Requirements       |
+========================+  +========================+  +========================+
```

### 1.2 Core Principles

| # | Principle | Description |
|---|-----------|-------------|
| 1 | **Orchestrator is Read-Only** | Coordinator agents NEVER execute destructive operations |
| 2 | **Tools Execute in Browser** | Client-side tools via `.client()` for FSA/IndexedDB access |
| 3 | **Permission Matrix is 3-Tier** | ask, allow, deny per agent per tool |
| 4 | **TanStack AI SDK is Canonical** | All LLM calls routed through TanStack AI adapters |
| 5 | **Threads are Project-Scoped** | Conversation context tied to projectId, NOT workspace |

---

## 2. Orchestrator Pattern

### 2.1 Orchestrator Responsibilities

The Orchestrator (Coordinator) is the **first responder** to user input. It NEVER executes work directly.

```typescript
// ============================================================================
// @/domain/services/orchestrator-service.ts
// ============================================================================

/**
 * Orchestrator Decision Result
 * 
 * The orchestrator analyzes user input and decides:
 * 1. Can I answer directly? (conversational)
 * 2. Should I switch mode to a domain agent?
 * 3. Should I delegate a task to sub-agents?
 */
interface OrchestratorDecision {
  action: 'respond' | 'switch-mode' | 'delegate';
  targetAgent?: AgentType;
  tasks?: DelegatedTask[];
  response?: string;
  reasoning: string;
}

type AgentType = 
  | 'orchestrator'    // Self (for conversational responses)
  | 'dev-ext'         // Code implementation
  | 'architect-ext'   // Architecture design
  | 'analyst-ext'     // Research and analysis
  | 'ux-designer-ext' // UI/UX design
  | 'tech-writer-ext' // Documentation
  | 'test-ext'        // Testing
  | 'reviewer-ext';   // Code review
```

### 2.2 Orchestrator Tool Set (Read-Only)

```typescript
// ============================================================================
// @/infrastructure/ai/tools/orchestrator-tools.ts
// ============================================================================

import { toolDefinition } from '@tanstack/ai';
import { z } from 'zod';

/**
 * Orchestrator Tool Registry
 * 
 * ALL orchestrator tools are READ-ONLY.
 * No file mutations, no bash execution, no destructive operations.
 */
export const orchestratorTools = {
  // =========================================================================
  // File Reading Tools
  // =========================================================================
  
  readFiles: toolDefinition({
    name: 'read_files',
    description: 'Read one or more files by path',
    parameters: z.object({
      paths: z.array(z.string()).describe('File paths to read'),
      maxLength: z.number().optional().describe('Max characters per file'),
    }),
    needsApproval: false,
  }).client(async (input) => {
    const results: Record<string, string> = {};
    for (const path of input.paths) {
      results[path] = await syncEngine.readFile(path);
    }
    return results;
  }),

  glob: toolDefinition({
    name: 'glob',
    description: 'Find files matching a glob pattern',
    parameters: z.object({
      pattern: z.string().describe('Glob pattern (e.g., "src/**/*.ts")'),
      limit: z.number().optional().default(100),
    }),
    needsApproval: false,
  }).client(async (input) => {
    return await syncEngine.glob(input.pattern, { limit: input.limit });
  }),

  grep: toolDefinition({
    name: 'grep',
    description: 'Search file contents for a regex pattern',
    parameters: z.object({
      pattern: z.string().describe('Regex pattern to search'),
      include: z.string().optional().describe('File pattern to include'),
    }),
    needsApproval: false,
  }).client(async (input) => {
    return await syncEngine.grep(input.pattern, { include: input.include });
  }),

  listFiles: toolDefinition({
    name: 'list_files',
    description: 'List files in a directory',
    parameters: z.object({
      path: z.string().describe('Directory path'),
      recursive: z.boolean().optional().default(false),
    }),
    needsApproval: false,
  }).client(async (input) => {
    return await syncEngine.listFiles(input.path, { recursive: input.recursive });
  }),

  // =========================================================================
  // Task Management Tools
  // =========================================================================

  todoWrite: toolDefinition({
    name: 'todo_write',
    description: 'Create or update a task list in memory',
    parameters: z.object({
      tasks: z.array(z.object({
        id: z.string(),
        description: z.string(),
        status: z.enum(['pending', 'in-progress', 'done']),
      })),
    }),
    needsApproval: false,
  }).client((input) => {
    // In-memory task list (session-scoped)
    globalThis.__orchestratorTasks = input.tasks;
    return { success: true, count: input.tasks.length };
  }),

  todoRead: toolDefinition({
    name: 'todo_read',
    description: 'Read current task list from memory',
    parameters: z.object({}),
    needsApproval: false,
  }).client(() => {
    return globalThis.__orchestratorTasks ?? [];
  }),

  question: toolDefinition({
    name: 'question',
    description: 'Ask the user a clarifying question',
    parameters: z.object({
      question: z.string().describe('The question to ask'),
      options: z.array(z.string()).optional().describe('Multiple choice options'),
    }),
    needsApproval: false,
  }).client((input) => {
    // Returns question for UI to display
    return { type: 'question', ...input };
  }),

  // =========================================================================
  // Delegation Tools
  // =========================================================================

  switchMode: toolDefinition({
    name: 'switch_mode',
    description: 'Switch conversation to a domain-specific agent',
    parameters: z.object({
      targetAgent: z.enum([
        'dev-ext',
        'architect-ext',
        'analyst-ext',
        'ux-designer-ext',
        'tech-writer-ext',
        'test-ext',
        'reviewer-ext',
      ]),
      reason: z.string().describe('Why switching to this agent'),
      context: z.string().optional().describe('Context to pass to target agent'),
    }),
    needsApproval: false,
  }).client((input) => {
    return { type: 'mode-switch', ...input };
  }),

  delegateTasks: toolDefinition({
    name: 'delegate_tasks',
    description: 'Delegate tasks to sub-agents with isolated context',
    parameters: z.object({
      tasks: z.array(z.object({
        agentType: z.enum([
          'dev-ext',
          'architect-ext', 
          'analyst-ext',
          'ux-designer-ext',
          'tech-writer-ext',
        ]),
        description: z.string(),
        expectedOutput: z.string(),
        timeout: z.number().optional().default(300000), // 5 min default
      })),
    }),
    needsApproval: true, // User must approve delegation
  }).client((input) => {
    return { type: 'delegation', tasks: input.tasks };
  }),
};
```

---

## 3. Domain-Specific Agents

### 3.1 Agent Registry

```typescript
// ============================================================================
// @/domain/types/agent-types.ts
// ============================================================================

/**
 * Agent Configuration Schema
 * 
 * Each domain agent has:
 * - Unique identity and capabilities
 * - Focused tool set
 * - Permission boundaries
 * - System prompt template
 */
interface AgentConfiguration {
  id: AgentType;
  name: string;
  description: string;
  category: 'coordinator' | 'implementation' | 'design' | 'research';
  tools: ToolId[];
  permissions: AgentPermissions;
  systemPromptTemplate: string;
}

interface AgentPermissions {
  write: boolean;
  edit: boolean;
  bash: 'none' | 'limited' | 'full';
  task: boolean;
  needsApprovalFor: ToolId[];
}
```

### 3.2 Agent Definitions

| Agent | Category | Tools | bash | write | Primary Use |
|-------|----------|-------|------|-------|-------------|
| **orchestrator** | coordinator | read-files, glob, grep, list-files, todowrite, todoread, question, switch-mode, delegate-tasks | none | false | User guidance, routing |
| **dev-ext** | implementation | read-files, write-file, edit-file, bash, glob, grep, list-files, create-directory, delete-file, move-file, task | limited | true | Code implementation, TDD |
| **architect-ext** | design | read-files, glob, grep, list-files, write-design-doc, create-adr, review | none | design-only | Architecture, ADRs |
| **analyst-ext** | research | read-files, glob, grep, list-files, web-search, analyze | none | false | Research, requirements |
| **ux-designer-ext** | design | read-files, glob, write-design-doc, create-wireframe | none | design-only | UI/UX design |
| **tech-writer-ext** | research | read-files, glob, grep, write-documentation | none | docs-only | API docs, guides |
| **test-ext** | implementation | read-files, write-file, bash, glob, grep, run-tests | limited | true | Testing, E2E |
| **reviewer-ext** | research | read-files, glob, grep, write-review | none | review-only | Code review |

### 3.3 Implementation Agent (dev-ext)

```typescript
// ============================================================================
// @/infrastructure/ai/agents/dev-ext-agent.ts
// ============================================================================

import { toolDefinition } from '@tanstack/ai';
import { z } from 'zod';

/**
 * Developer Agent Tool Registry
 * 
 * Full implementation capabilities with safety controls.
 * Destructive operations require approval.
 */
export const devExtTools = {
  // Inherited read-only tools
  ...orchestratorTools,

  // =========================================================================
  // File Mutation Tools
  // =========================================================================

  writeFile: toolDefinition({
    name: 'write_file',
    description: 'Create or overwrite a file with new content',
    parameters: z.object({
      path: z.string().describe('File path to write'),
      content: z.string().describe('File content'),
    }),
    needsApproval: true, // Always requires approval
  }).client(async (input) => {
    await syncEngine.writeFile(input.path, input.content);
    return { success: true, path: input.path, bytes: input.content.length };
  }),

  editFile: toolDefinition({
    name: 'edit_file',
    description: 'Edit a file by replacing a substring',
    parameters: z.object({
      path: z.string().describe('File path to edit'),
      oldString: z.string().describe('String to find and replace'),
      newString: z.string().describe('Replacement string'),
      replaceAll: z.boolean().optional().default(false),
    }),
    needsApproval: true,
  }).client(async (input) => {
    const content = await syncEngine.readFile(input.path);
    const newContent = input.replaceAll
      ? content.replaceAll(input.oldString, input.newString)
      : content.replace(input.oldString, input.newString);
    await syncEngine.writeFile(input.path, newContent);
    return { success: true, path: input.path };
  }),

  deleteFile: toolDefinition({
    name: 'delete_file',
    description: 'Delete a file',
    parameters: z.object({
      path: z.string().describe('File path to delete'),
    }),
    needsApproval: true, // Destructive - always requires approval
  }).client(async (input) => {
    await syncEngine.deleteFile(input.path);
    return { success: true, deleted: input.path };
  }),

  moveFile: toolDefinition({
    name: 'move_file',
    description: 'Move or rename a file',
    parameters: z.object({
      from: z.string().describe('Source path'),
      to: z.string().describe('Destination path'),
    }),
    needsApproval: true,
  }).client(async (input) => {
    await syncEngine.moveFile(input.from, input.to);
    return { success: true, from: input.from, to: input.to };
  }),

  createDirectory: toolDefinition({
    name: 'create_directory',
    description: 'Create a directory',
    parameters: z.object({
      path: z.string().describe('Directory path to create'),
    }),
    needsApproval: false, // Non-destructive
  }).client(async (input) => {
    await syncEngine.createDirectory(input.path);
    return { success: true, path: input.path };
  }),

  // =========================================================================
  // Bash Tool (Limited)
  // =========================================================================

  bash: toolDefinition({
    name: 'bash',
    description: 'Execute a shell command (limited to safe commands)',
    parameters: z.object({
      command: z.string().describe('Command to execute'),
      workdir: z.string().optional().describe('Working directory'),
      timeout: z.number().optional().default(120000),
    }),
    needsApproval: true, // Always requires approval
  }).server(async (input) => {
    // Server-side execution with sandboxing
    const blockedPatterns = [
      /rm\s+-rf\s+\//,
      /sudo/,
      /chmod\s+777/,
      /curl.*\|.*sh/,
      /wget.*\|.*bash/,
    ];
    
    for (const pattern of blockedPatterns) {
      if (pattern.test(input.command)) {
        throw new Error(`Blocked dangerous command pattern: ${pattern}`);
      }
    }
    
    return await executeCommand(input.command, {
      cwd: input.workdir,
      timeout: input.timeout,
    });
  }),
};
```

---

## 4. Tool Architecture

### 4.1 Tool Types

```
+============================================================================+
|                          TOOL CLASSIFICATION                                 |
+============================================================================+
|                                                                              |
|  +------------------------+  +------------------------+  +--------------+   |
|  |    CLIENT TOOLS        |  |    SERVER TOOLS        |  | AGENT TOOLS  |   |
|  |------------------------|  |------------------------|  |--------------|   |
|  | Execution: Browser     |  | Execution: Edge/Node   |  | Delegation   |   |
|  | API: .client()         |  | API: .server()         |  | Sub-agents   |   |
|  |                        |  |                        |  |              |   |
|  | Examples:              |  | Examples:              |  | Examples:    |   |
|  | - File read/write (FSA)|  | - LLM calls            |  | - task       |   |
|  | - IndexedDB ops        |  | - Database queries     |  | - delegate   |   |
|  | - Local storage        |  | - External APIs        |  | - handoff    |   |
|  | - WebContainer         |  | - Bash execution       |  |              |   |
|  +------------------------+  +------------------------+  +--------------+   |
|                                                                              |
+============================================================================+
```

### 4.2 Tool Definition Pattern

```typescript
// ============================================================================
// @/infrastructure/ai/tools/tool-types.ts
// ============================================================================

import { toolDefinition } from '@tanstack/ai';
import { z } from 'zod';

/**
 * Tool Definition Contract
 * 
 * All tools MUST follow this pattern:
 * 1. Define with toolDefinition()
 * 2. Specify needsApproval for destructive ops
 * 3. Use .client() for browser execution OR .server() for edge
 */

// CLIENT TOOL: Executes in browser, has access to FSA/IndexedDB
const clientToolExample = toolDefinition({
  name: 'tool_name',
  description: 'What this tool does',
  parameters: z.object({
    param1: z.string().describe('Parameter description'),
  }),
  needsApproval: false, // or true for destructive
}).client(async (input) => {
  // Browser-side execution
  // Has access to: FSA, IndexedDB, localStorage, WebContainer
  return { result: 'success' };
});

// SERVER TOOL: Executes on edge/server, has access to secrets
const serverToolExample = toolDefinition({
  name: 'llm_call',
  description: 'Call an LLM provider',
  parameters: z.object({
    prompt: z.string(),
    model: z.string(),
  }),
  needsApproval: false,
}).server(async (input) => {
  // Server-side execution
  // Has access to: API keys, database, external APIs
  return { result: await callLLM(input) };
});
```

### 4.3 Tool Registration

```typescript
// ============================================================================
// @/infrastructure/ai/tool-registry.ts
// ============================================================================

import { orchestratorTools } from './tools/orchestrator-tools';
import { devExtTools } from './tools/dev-ext-tools';
import { architectExtTools } from './tools/architect-ext-tools';

/**
 * Global Tool Registry
 * 
 * Maps agent types to their available tools.
 * Used by the orchestration layer to configure agents.
 */
export const toolRegistry: Record<AgentType, ToolSet> = {
  orchestrator: orchestratorTools,
  'dev-ext': devExtTools,
  'architect-ext': architectExtTools,
  'analyst-ext': analystExtTools,
  'ux-designer-ext': uxDesignerExtTools,
  'tech-writer-ext': techWriterExtTools,
  'test-ext': testExtTools,
  'reviewer-ext': reviewerExtTools,
};

/**
 * Get tools for an agent with permission filtering
 */
export function getAgentTools(
  agentType: AgentType,
  workspaceType: WorkspaceType,
  permissions: ToolPermissionMatrix
): ToolSet {
  const baseTools = toolRegistry[agentType];
  const filtered: ToolSet = {};

  for (const [toolId, tool] of Object.entries(baseTools)) {
    const permission = permissions[agentType]?.[toolId]?.[workspaceType];
    
    if (permission === 'deny') continue;
    
    // Wrap tool with approval check if permission is 'ask'
    if (permission === 'ask') {
      filtered[toolId] = withApprovalRequired(tool);
    } else {
      filtered[toolId] = tool;
    }
  }

  return filtered;
}
```

---

## 5. Permission Matrix

### 5.1 3-Tier Permission Model

| Permission | Behavior | Use Case |
|------------|----------|----------|
| **allow** | Execute immediately without user confirmation | Read operations, non-destructive |
| **ask** | Require user confirmation before execution | Write, delete, bash commands |
| **deny** | Block execution entirely | Dangerous operations, policy violations |

### 5.2 Permission Matrix Schema

```typescript
// ============================================================================
// @/domain/types/permission-types.ts
// ============================================================================

type PermissionLevel = 'allow' | 'ask' | 'deny';

/**
 * Tool Permission Matrix
 * 
 * 3-dimensional matrix: [AgentType][ToolId][WorkspaceType] = PermissionLevel
 */
type ToolPermissionMatrix = Record<
  AgentType,
  Record<ToolId, Record<WorkspaceType, PermissionLevel>>
>;

/**
 * Default Permission Matrix
 * 
 * Conservative defaults:
 * - Orchestrator: all read tools allowed, no write
 * - Dev agents: ask for write/delete/bash
 * - Design agents: design docs only
 */
export const DEFAULT_PERMISSION_MATRIX: ToolPermissionMatrix = {
  orchestrator: {
    read_files: { ide: 'allow', notes: 'allow', knowledge: 'allow', study: 'allow' },
    glob: { ide: 'allow', notes: 'allow', knowledge: 'allow', study: 'allow' },
    grep: { ide: 'allow', notes: 'allow', knowledge: 'allow', study: 'allow' },
    list_files: { ide: 'allow', notes: 'allow', knowledge: 'allow', study: 'allow' },
    todo_write: { ide: 'allow', notes: 'allow', knowledge: 'allow', study: 'allow' },
    todo_read: { ide: 'allow', notes: 'allow', knowledge: 'allow', study: 'allow' },
    question: { ide: 'allow', notes: 'allow', knowledge: 'allow', study: 'allow' },
    switch_mode: { ide: 'allow', notes: 'allow', knowledge: 'allow', study: 'allow' },
    delegate_tasks: { ide: 'ask', notes: 'ask', knowledge: 'ask', study: 'ask' },
    // Orchestrator CANNOT use these
    write_file: { ide: 'deny', notes: 'deny', knowledge: 'deny', study: 'deny' },
    bash: { ide: 'deny', notes: 'deny', knowledge: 'deny', study: 'deny' },
  },
  
  'dev-ext': {
    read_files: { ide: 'allow', notes: 'allow', knowledge: 'deny', study: 'deny' },
    glob: { ide: 'allow', notes: 'allow', knowledge: 'deny', study: 'deny' },
    grep: { ide: 'allow', notes: 'allow', knowledge: 'deny', study: 'deny' },
    write_file: { ide: 'ask', notes: 'ask', knowledge: 'deny', study: 'deny' },
    edit_file: { ide: 'ask', notes: 'ask', knowledge: 'deny', study: 'deny' },
    delete_file: { ide: 'ask', notes: 'deny', knowledge: 'deny', study: 'deny' },
    bash: { ide: 'ask', notes: 'deny', knowledge: 'deny', study: 'deny' },
    create_directory: { ide: 'allow', notes: 'allow', knowledge: 'deny', study: 'deny' },
  },
  
  'architect-ext': {
    read_files: { ide: 'allow', notes: 'allow', knowledge: 'allow', study: 'deny' },
    glob: { ide: 'allow', notes: 'allow', knowledge: 'allow', study: 'deny' },
    grep: { ide: 'allow', notes: 'allow', knowledge: 'allow', study: 'deny' },
    write_design_doc: { ide: 'ask', notes: 'deny', knowledge: 'deny', study: 'deny' },
    create_adr: { ide: 'ask', notes: 'deny', knowledge: 'deny', study: 'deny' },
    // Architect CANNOT use these
    write_file: { ide: 'deny', notes: 'deny', knowledge: 'deny', study: 'deny' },
    bash: { ide: 'deny', notes: 'deny', knowledge: 'deny', study: 'deny' },
  },
  
  // ... other agents follow same pattern
};
```

### 5.3 Permission Check Flow

```
+============================================================================+
|                        PERMISSION CHECK FLOW                                 |
+============================================================================+
|                                                                              |
|  [Tool Call Request]                                                         |
|         |                                                                    |
|         v                                                                    |
|  +------------------+                                                        |
|  | Check Matrix     |                                                        |
|  | [agent][tool][ws]|                                                        |
|  +------------------+                                                        |
|         |                                                                    |
|         +---------------------+---------------------+                        |
|         |                     |                     |                        |
|         v                     v                     v                        |
|  +-------------+       +-------------+       +-------------+                 |
|  |   ALLOW     |       |    ASK      |       |    DENY     |                 |
|  +-------------+       +-------------+       +-------------+                 |
|         |                     |                     |                        |
|         v                     v                     v                        |
|  Execute tool          Show approval UI      Return error                    |
|  immediately           Wait for user         "Permission denied"             |
|                        click "Approve"                                       |
|                              |                                               |
|                              v                                               |
|                        Execute tool                                          |
|                                                                              |
+============================================================================+
```

---

## 6. TanStack AI SDK Integration

### 6.1 Provider Architecture

```typescript
// ============================================================================
// @/infrastructure/ai/providers/provider-registry.ts
// ============================================================================

import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';

/**
 * Provider Registry
 * 
 * Maps provider IDs to TanStack AI adapter factories.
 * All providers MUST go through TanStack AI SDK.
 */
export const providerRegistry = {
  google: (apiKey: string) => createGoogleGenerativeAI({ apiKey }),
  anthropic: (apiKey: string) => createAnthropic({ apiKey }),
  openai: (apiKey: string) => createOpenAI({ apiKey }),
  openrouter: (apiKey: string) => createOpenRouter({ apiKey }),
  ollama: (baseUrl: string) => createOpenAI({ 
    apiKey: 'ollama', // Dummy key
    baseURL: baseUrl,
  }),
};

/**
 * Create provider instance from vault configuration
 */
export async function createProvider(
  projectId: string,
  providerId: ProviderId
): Promise<Provider> {
  const vault = await getProjectVault(projectId);
  const config = vault.providers.get(providerId);
  
  if (!config) {
    throw new Error(`Provider ${providerId} not configured for project ${projectId}`);
  }
  
  const factory = providerRegistry[providerId];
  return factory(config.apiKey);
}
```

### 6.2 Streaming Response Pattern

```typescript
// ============================================================================
// @/infrastructure/ai/services/chat-service.ts
// ============================================================================

import { generateText, streamText } from '@tanstack/ai';

/**
 * Chat Service
 * 
 * Handles all LLM interactions with streaming support.
 */
export class ChatService {
  constructor(
    private readonly projectId: string,
    private readonly threadId: string
  ) {}

  /**
   * Stream a response with tool execution
   */
  async streamResponse(
    messages: Message[],
    agentType: AgentType,
    workspaceType: WorkspaceType
  ): Promise<ReadableStream<StreamChunk>> {
    const provider = await createProvider(this.projectId, 'anthropic');
    const tools = getAgentTools(agentType, workspaceType, DEFAULT_PERMISSION_MATRIX);
    
    const result = await streamText({
      model: provider('claude-sonnet-4-20250514'),
      messages: formatMessages(messages),
      tools,
      maxSteps: 10, // Agentic loop limit
      onStepFinish: async ({ stepType, toolCalls, toolResults }) => {
        // Log tool execution for audit
        await this.logToolExecution(toolCalls, toolResults);
      },
    });

    return result.toDataStream();
  }

  /**
   * Generate structured output
   */
  async generateStructured<T>(
    messages: Message[],
    schema: z.ZodSchema<T>
  ): Promise<T> {
    const provider = await createProvider(this.projectId, 'anthropic');
    
    const result = await generateText({
      model: provider('claude-sonnet-4-20250514'),
      messages: formatMessages(messages),
      output: 'object',
      schema,
    });

    return result.object;
  }
}
```

### 6.3 Provider Fallback Chain

```typescript
// ============================================================================
// @/infrastructure/ai/services/fallback-chain.ts
// ============================================================================

/**
 * Provider Fallback Chain
 * 
 * Graceful degradation when primary provider fails.
 */
export async function executeWithFallback<T>(
  projectId: string,
  operation: (provider: Provider) => Promise<T>,
  options: FallbackOptions = {}
): Promise<T> {
  const fallbackOrder: ProviderId[] = options.preferredOrder ?? [
    'anthropic',
    'google', 
    'openai',
    'openrouter',
  ];

  let lastError: Error | null = null;

  for (const providerId of fallbackOrder) {
    try {
      const provider = await createProvider(projectId, providerId);
      return await operation(provider);
    } catch (error) {
      lastError = error as Error;
      console.warn(`Provider ${providerId} failed:`, error);
      continue;
    }
  }

  throw new Error(`All providers failed. Last error: ${lastError?.message}`);
}
```

---

## 7. Thread Management

### 7.1 Thread Architecture

```
+============================================================================+
|                           THREAD HIERARCHY                                   |
+============================================================================+
|                                                                              |
|  Project (proj_123_abc)                                                      |
|      |                                                                       |
|      +-- Main Thread (thread_main_xyz)                                      |
|      |       |                                                               |
|      |       +-- Message 1 (user)                                           |
|      |       +-- Message 2 (assistant)                                      |
|      |       +-- Message 3 (user)                                           |
|      |       +-- Message 4 (assistant + tool_calls)                         |
|      |       +-- Message 5 (tool)                                           |
|      |       +-- Message 6 (assistant)                                      |
|      |       +-- ... (until 135K tokens)                                    |
|      |       |                                                               |
|      |       +-- [COMPACTION TRIGGER @ 90%]                                 |
|      |               |                                                       |
|      |               v                                                       |
|      +-- Compacted Thread (thread_compact_abc)                              |
|              |                                                               |
|              +-- Summary Message (condensed context)                        |
|              +-- Message N+1 (continuation)                                 |
|              +-- ...                                                         |
|                                                                              |
+============================================================================+
```

### 7.2 Thread Schema

```typescript
// ============================================================================
// @/domain/types/thread-types.ts
// ============================================================================

/**
 * Thread Entity
 * 
 * Threads are PROJECT-SCOPED, not workspace-scoped.
 * The same thread can be accessed from any workspace within the project.
 */
interface Thread {
  id: string;                    // thread_xxx_yyy
  projectId: string;             // proj_xxx_yyy
  parentThreadId?: string;       // For compaction chain
  title: string;
  messageCount: number;
  contextTokens: number;
  status: 'active' | 'compacted' | 'archived';
  createdAt: number;
  updatedAt: number;
}

/**
 * Message Entity
 */
interface Message {
  id: string;
  threadId: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  toolCalls?: ToolCall[];
  toolResults?: ToolResult[];
  tokens?: number;
  createdAt: number;
}

/**
 * Tool Call Record
 */
interface ToolCall {
  id: string;
  name: string;
  args: Record<string, unknown>;
  status: 'pending' | 'approved' | 'rejected' | 'executed' | 'failed';
}

/**
 * Tool Result Record
 */
interface ToolResult {
  callId: string;
  result: unknown;
  error?: string;
  executionTime: number;
}
```

### 7.3 Context Compaction

```typescript
// ============================================================================
// @/domain/services/compaction-service.ts
// ============================================================================

/**
 * Context Compaction Service
 * 
 * Triggers automatic compaction when thread reaches 90% of context limit.
 */
export class CompactionService {
  private readonly contextLimit = 150000; // 150K tokens
  private readonly compactionThreshold = 0.90; // 90%

  /**
   * Check if compaction is needed
   */
  shouldCompact(thread: Thread): boolean {
    return thread.contextTokens >= this.contextLimit * this.compactionThreshold;
  }

  /**
   * Execute compaction
   * 
   * 1. Create condensed summary of conversation
   * 2. Preserve critical context (file paths, decisions, code)
   * 3. Create new thread with summary as first message
   * 4. Archive original thread
   */
  async compact(thread: Thread, messages: Message[]): Promise<Thread> {
    // Generate summary using LLM
    const summary = await this.generateSummary(messages);
    
    // Create new thread
    const newThread = await db.threads.add({
      id: generateThreadId(),
      projectId: thread.projectId,
      parentThreadId: thread.id,
      title: `${thread.title} (continued)`,
      messageCount: 1,
      contextTokens: await countTokens(summary),
      status: 'active',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Add summary message
    await db.messages.add({
      id: generateMessageId(),
      threadId: newThread.id,
      role: 'system',
      content: summary,
      createdAt: Date.now(),
    });

    // Archive original
    await db.threads.update(thread.id, { status: 'compacted' });

    return newThread;
  }

  private async generateSummary(messages: Message[]): Promise<string> {
    const provider = await createProvider('system', 'anthropic');
    
    const result = await generateText({
      model: provider('claude-sonnet-4-20250514'),
      messages: [
        {
          role: 'system',
          content: `You are a conversation summarizer. Create a concise summary that preserves:
1. Key decisions made
2. File paths mentioned
3. Code snippets referenced
4. Outstanding tasks or questions
5. Current context state

Format as structured markdown.`,
        },
        {
          role: 'user',
          content: `Summarize this conversation:\n\n${formatMessagesForSummary(messages)}`,
        },
      ],
    });

    return result.text;
  }
}
```

---

## 8. BYOK Vault Architecture

### 8.1 Vault Schema

```typescript
// ============================================================================
// @/domain/types/vault-types.ts
// ============================================================================

/**
 * BYOK Vault
 * 
 * Project-scoped configuration for API keys and provider settings.
 * Keys are encrypted at rest using AES-256-GCM.
 */
interface BYOKVault {
  projectId: string;
  providers: Map<ProviderId, ProviderConfig>;
  defaultProvider: ProviderId;
  embeddingProvider: ProviderId; // For RAG
  createdAt: number;
  updatedAt: number;
}

interface ProviderConfig {
  providerId: ProviderId;
  apiKey: string;                // Encrypted at rest
  baseUrl?: string;              // For Ollama or custom endpoints
  models: string[];              // Available models
  defaultModel: string;
  enabled: boolean;
  quotaLimit?: number;           // Monthly token limit
  quotaUsed?: number;
}

type ProviderId = 
  | 'google'      // P1 - FREE embeddings
  | 'anthropic'   // P2 - Best reasoning
  | 'openai'      // P3 - Stable fallback
  | 'openrouter'  // P4 - Universal fallback
  | 'ollama';     // P5 - Local/privacy mode
```

### 8.2 Vault Storage

```typescript
// ============================================================================
// @/infrastructure/persistence/vault-repository.ts
// ============================================================================

import { db } from './dexie-schema';

/**
 * Vault Repository
 * 
 * Secure storage for API keys with encryption.
 */
export class VaultRepository {
  private encryptionKey: CryptoKey | null = null;

  /**
   * Initialize encryption key from user password
   */
  async initialize(password: string): Promise<void> {
    const salt = await this.getOrCreateSalt();
    this.encryptionKey = await this.deriveKey(password, salt);
  }

  /**
   * Store provider configuration with encryption
   */
  async setProviderConfig(
    projectId: string,
    config: ProviderConfig
  ): Promise<void> {
    if (!this.encryptionKey) {
      throw new Error('Vault not initialized');
    }

    const encrypted = await this.encrypt(config.apiKey);
    
    await db.vaultConfigs.put({
      id: `${projectId}:${config.providerId}`,
      projectId,
      providerId: config.providerId,
      encryptedApiKey: encrypted,
      baseUrl: config.baseUrl,
      models: config.models,
      defaultModel: config.defaultModel,
      enabled: config.enabled,
      updatedAt: Date.now(),
    });
  }

  /**
   * Retrieve provider configuration with decryption
   */
  async getProviderConfig(
    projectId: string,
    providerId: ProviderId
  ): Promise<ProviderConfig | null> {
    if (!this.encryptionKey) {
      throw new Error('Vault not initialized');
    }

    const record = await db.vaultConfigs.get(`${projectId}:${providerId}`);
    if (!record) return null;

    const apiKey = await this.decrypt(record.encryptedApiKey);

    return {
      providerId: record.providerId,
      apiKey,
      baseUrl: record.baseUrl,
      models: record.models,
      defaultModel: record.defaultModel,
      enabled: record.enabled,
    };
  }

  private async encrypt(plaintext: string): Promise<ArrayBuffer> {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(plaintext);
    
    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      this.encryptionKey!,
      encoded
    );

    // Prepend IV to ciphertext
    const result = new Uint8Array(iv.length + ciphertext.byteLength);
    result.set(iv);
    result.set(new Uint8Array(ciphertext), iv.length);
    
    return result.buffer;
  }

  private async decrypt(encrypted: ArrayBuffer): Promise<string> {
    const data = new Uint8Array(encrypted);
    const iv = data.slice(0, 12);
    const ciphertext = data.slice(12);

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      this.encryptionKey!,
      ciphertext
    );

    return new TextDecoder().decode(decrypted);
  }

  private async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      'PBKDF2',
      false,
      ['deriveKey']
    );

    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }
}
```

---

## 9. Integration Flow Diagrams

### 9.1 Complete Request Flow

```
+============================================================================+
|                         COMPLETE REQUEST FLOW                               |
+============================================================================+
|                                                                              |
|  [1] User types message in Chat Plugin                                      |
|         |                                                                    |
|         v                                                                    |
|  [2] ChatService.streamResponse()                                           |
|         |                                                                    |
|         v                                                                    |
|  [3] Load BYOK Vault for projectId                                          |
|         |                                                                    |
|         v                                                                    |
|  [4] Create Provider via TanStack AI SDK                                    |
|         |                                                                    |
|         v                                                                    |
|  [5] Get tools for current agent + workspace                                |
|         |                                                                    |
|         v                                                                    |
|  [6] streamText() with agentic loop                                         |
|         |                                                                    |
|         +----------------+------------------+                                |
|         |                |                  |                                |
|         v                v                  v                                |
|  [7a] Text chunk   [7b] Tool call    [7c] Tool result                       |
|         |                |                  |                                |
|         v                v                  v                                |
|  [8] Stream to UI  Check permission  Execute tool                           |
|                          |                  |                                |
|                          v                  v                                |
|                    ask -> Show modal  Return result                         |
|                    allow -> Execute   to LLM loop                           |
|                    deny -> Block                                             |
|                                                                              |
+============================================================================+
```

### 9.2 Agent Delegation Flow

```
+============================================================================+
|                        AGENT DELEGATION FLOW                                 |
+============================================================================+
|                                                                              |
|  [Orchestrator receives complex task]                                        |
|         |                                                                    |
|         v                                                                    |
|  [Analyze task requirements]                                                 |
|         |                                                                    |
|         v                                                                    |
|  [Call delegate_tasks tool]                                                  |
|         |                                                                    |
|         v                                                                    |
|  [User approval required] --> [Deny] --> Stop                               |
|         |                                                                    |
|         v [Approve]                                                          |
|         |                                                                    |
|  [Create sub-threads for each task]                                         |
|         |                                                                    |
|         +------------+------------+                                          |
|         |            |            |                                          |
|         v            v            v                                          |
|  [dev-ext]    [architect-ext]  [analyst-ext]                                |
|  Sub-thread 1  Sub-thread 2    Sub-thread 3                                 |
|         |            |            |                                          |
|         v            v            v                                          |
|  Execute with   Execute with   Execute with                                 |
|  own tools      own tools      own tools                                    |
|         |            |            |                                          |
|         +------------+------------+                                          |
|                      |                                                       |
|                      v                                                       |
|  [Aggregate results in main thread]                                         |
|                      |                                                       |
|                      v                                                       |
|  [Orchestrator summarizes to user]                                          |
|                                                                              |
+============================================================================+
```

---

## 10. Anti-Patterns (FORBIDDEN)

### 10.1 Direct Provider Calls

```typescript
// ❌ WRONG: Direct provider package usage
import Anthropic from '@anthropic-ai/sdk';
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
await anthropic.messages.create({ ... });

// ✅ CORRECT: TanStack AI SDK adapter
import { createAnthropic } from '@ai-sdk/anthropic';
import { generateText } from '@tanstack/ai';

const provider = createAnthropic({ apiKey: await vault.getKey('anthropic') });
await generateText({ model: provider('claude-sonnet-4'), ... });
```

### 10.2 Orchestrator with Write Tools

```typescript
// ❌ WRONG: Orchestrator executing file writes
const orchestratorTools = {
  write_file: toolDefinition({ ... }).client(async (input) => {
    await syncEngine.writeFile(input.path, input.content);
  }),
};

// ✅ CORRECT: Orchestrator delegates to dev-ext
const orchestratorTools = {
  delegate_tasks: toolDefinition({ ... }).client((input) => {
    return { type: 'delegation', agentType: 'dev-ext', task: input };
  }),
};
```

### 10.3 Hardcoded Permissions

```typescript
// ❌ WRONG: Hardcoded permission checks
if (agentType === 'dev-ext' && toolId === 'write_file') {
  return 'ask';
}

// ✅ CORRECT: Permission matrix lookup
const permission = permissionMatrix[agentType]?.[toolId]?.[workspaceType] ?? 'deny';
```

### 10.4 Thread Without Project Scope

```typescript
// ❌ WRONG: Thread tied to workspace
interface Thread {
  workspaceType: WorkspaceType; // NO! Threads are project-scoped
}

// ✅ CORRECT: Thread tied to project
interface Thread {
  projectId: string; // Project-scoped, accessible from any workspace
}
```

---

## 11. Success Metrics

| Metric | Current | Target | Validation |
|--------|---------|--------|------------|
| Direct provider calls | Unknown | 0 | Lint rule |
| Orchestrator write tools | Unknown | 0 | Audit |
| Permission matrix coverage | 0% | 100% | Test coverage |
| Tool approval compliance | Unknown | 100% | E2E tests |
| Context compaction triggers | N/A | Automated | Integration test |
| Vault encryption | N/A | AES-256-GCM | Security audit |

---

## 12. Migration Checklist

### 12.1 Phase 1: Tool Infrastructure

- [ ] Create `@/infrastructure/ai/tools/` directory
- [ ] Implement orchestrator tool set
- [ ] Implement dev-ext tool set
- [ ] Create tool registry

### 12.2 Phase 2: Permission System

- [ ] Define permission matrix schema
- [ ] Implement default permission matrix
- [ ] Create permission check service
- [ ] Add approval UI component

### 12.3 Phase 3: TanStack AI Integration

- [ ] Configure provider adapters
- [ ] Implement BYOK vault
- [ ] Create ChatService with streaming
- [ ] Test fallback chain

### 12.4 Phase 4: Thread Management

- [ ] Define thread schema in Dexie
- [ ] Implement compaction service
- [ ] Create thread UI components
- [ ] Test context limits

### 12.5 Phase 5: Validation

- [ ] Run `pnpm typecheck:fast`
- [ ] Run `pnpm test:fast`
- [ ] E2E test full flow
- [ ] Security audit vault encryption

---

**Document Status**: HYPOTHESIS - Awaiting validation
**Next Steps**: Review with team, validate TanStack AI SDK patterns against latest docs, then create implementation stories

---

*Generated by architect-ext on 2026-01-30*
