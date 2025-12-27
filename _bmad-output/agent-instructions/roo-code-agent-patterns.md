# Roo Code Agent Architecture Patterns for Via-Gent

**Created:** 2025-12-11  
**Purpose:** Extract and apply proven patterns from Roo Code's agentic coding platform to improve Via-Gent's agent architecture.

---

## Overview

Roo Code demonstrates professional-grade patterns for building AI coding agents. This document extracts key architectural insights applicable to Via-Gent's client-side agentic IDE.

---

## Key Architectural Patterns

### 1. Tool Architecture

**Pattern: Abstract Base Tool with Protocol Agnostic Execution**

Roo Code uses a `BaseTool` abstract class that separates:
- **Parsing** (protocol-specific) from **Execution** (business logic)
- **Native protocol** (structured JSON) from **Legacy protocol** (XML strings)

```typescript
// Roo Code Pattern (src/core/tools/BaseTool.ts)
abstract class BaseTool<TName extends ToolName> {
  abstract readonly name: TName;
  
  // Parse legacy XML params → typed params
  abstract parseLegacy(params: Record<string, string>): ToolParams<TName>;
  
  // Protocol-agnostic core logic
  abstract execute(params: ToolParams<TName>, task: Task, callbacks: ToolCallbacks): Promise<void>;
  
  // Optional streaming support
  async handlePartial(task: Task, block: ToolUse<TName>): Promise<void> {}
  
  // Entry point - routes to correct parser
  async handle(task: Task, block: ToolUse, callbacks: ToolCallbacks): Promise<void> {
    if (block.nativeArgs !== undefined) {
      params = block.nativeArgs; // Native: already typed
    } else {
      params = this.parseLegacy(block.params); // Legacy: parse XML
    }
    await this.execute(params, task, callbacks);
  }
}
```

**Via-Gent Application:**

```typescript
// Apply to Via-Gent tools (src/lib/tools/base-tool.ts)
export abstract class BaseTool<TName extends ToolName> {
  abstract readonly name: TName;
  abstract readonly description: string;
  abstract readonly parameters: z.ZodType;
  
  // TanStack AI compatible execution
  abstract execute(params: z.infer<typeof this.parameters>): Promise<ToolResult>;
  
  // Convert to TanStack AI tool definition
  toToolDefinition() {
    return toolDefinition({
      description: this.description,
      parameters: this.parameters,
    }).server(async ({ input }) => this.execute(input));
  }
}
```

---

### 2. Tool Callbacks Pattern

**Pattern: Standardized Callback Interface**

Roo Code provides a consistent callback interface for all tools:

```typescript
interface ToolCallbacks {
  askApproval: AskApproval;      // Request user approval
  handleError: HandleError;       // Report errors
  pushToolResult: PushToolResult; // Send results back
  removeClosingTag: RemoveClosingTag; // XML cleanup
  toolProtocol: ToolProtocol;     // Protocol type
  toolCallId?: string;            // For tracking
}
```

**Via-Gent Application:**

```typescript
// Apply to Via-Gent (src/lib/tools/callbacks.ts)
export interface ToolCallbacks {
  // User interaction
  requestApproval(action: string, details: Record<string, unknown>): Promise<boolean>;
  
  // Status reporting
  reportProgress(message: string, percent?: number): void;
  reportError(error: Error): void;
  
  // Result handling
  pushResult(result: ToolResult): void;
  
  // File system integration
  syncManager: SyncManager;
  webContainer: WebContainer;
}
```

---

### 3. Mode-Based Tool Filtering

**Pattern: Filter Tools Per Agent Mode**

Roo Code restricts tool access based on mode configuration:

```typescript
// Roo Code Pattern (src/core/task/build-tools.ts)
async function buildNativeToolsArray(options: BuildToolsOptions) {
  const nativeTools = getNativeTools(partialReadsEnabled);
  
  // Filter based on mode restrictions
  const filteredNativeTools = filterNativeToolsForMode(
    nativeTools,
    mode,
    customModes,
    experiments,
    codeIndexManager,
    filterSettings,
    mcpHub,
  );
  
  // Also filter MCP tools
  const filteredMcpTools = filterMcpToolsForMode(mcpTools, mode, customModes);
  
  return [...filteredNativeTools, ...filteredMcpTools];
}
```

**Via-Gent Application:**

```typescript
// Apply to Via-Gent (src/lib/tools/tool-registry.ts)
export class ToolRegistry {
  private tools: Map<string, BaseTool<any>> = new Map();
  
  // Get tools filtered by agent capabilities
  getToolsForAgent(agentType: AgentType): BaseTool<any>[] {
    const permissions = AGENT_TOOL_PERMISSIONS[agentType];
    
    return Array.from(this.tools.values()).filter(
      (tool) => permissions.includes(tool.name)
    );
  }
  
  // Convert to TanStack AI format
  async buildToolsArray(agentType: AgentType): Promise<ToolDefinition[]> {
    return this.getToolsForAgent(agentType).map(t => t.toToolDefinition());
  }
}

const AGENT_TOOL_PERMISSIONS: Record<AgentType, ToolName[]> = {
  orchestrator: ['delegate_task', 'check_status', 'report_completion'],
  coder: ['read_file', 'write_file', 'list_files', 'execute_command', 'search_files'],
  planner: ['read_file', 'list_files', 'ask_question'],
  validator: ['read_file', 'run_tests', 'check_types'],
};
```

---

### 4. MCP Tool Integration

**Pattern: Unified MCP Tool Interface**

Roo Code provides a consistent pattern for MCP tool use:

```typescript
// Roo Code Pattern (src/core/prompts/tools/use-mcp-tool.ts)
function getUseMcpToolDescription(args: ToolArgs): string {
  return `## use_mcp_tool
Description: Request to use a tool provided by a connected MCP server.
Parameters:
- server_name: (required) The name of the MCP server
- tool_name: (required) The name of the tool to execute
- arguments: (required) A JSON object with input parameters
...`;
}
```

**Via-Gent Application:**

```typescript
// Apply to Via-Gent (src/lib/tools/mcp-bridge.ts)
export const useMcpTool = toolDefinition({
  description: "Execute a tool from an MCP server",
  parameters: z.object({
    serverName: z.string().describe("MCP server name"),
    toolName: z.string().describe("Tool to execute"),
    arguments: z.record(z.unknown()).describe("Tool arguments as JSON"),
  }),
}).server(async ({ input }) => {
  const { serverName, toolName, arguments: args } = input;
  
  const mcpClient = getMcpClient(serverName);
  return await mcpClient.callTool(toolName, args);
});
```

---

### 5. Concrete Tool Implementations

**Pattern: Specialized Tool Classes**

Roo Code has dedicated tool implementations for each capability:

| Tool | Purpose | Via-Gent Equivalent |
|------|---------|---------------------|
| `ReadFileTool` | Read file contents | `readFile` |
| `WriteToFileTool` | Write/create files | `writeFile` |
| `ListFilesTool` | List directory contents | `listFiles` |
| `ExecuteCommandTool` | Run terminal commands | `executeCommand` |
| `CodebaseSearchTool` | Search code semantically | `searchCode` |
| `ApplyDiffTool` | Apply code patches | `applyDiff` |
| `BrowserActionTool` | Control browser | N/A (WebContainer preview) |
| `AskFollowupQuestionTool` | Request user input | `askQuestion` |
| `AttemptCompletionTool` | Mark task complete | `completeTask` |

**Via-Gent Implementation Example:**

```typescript
// src/lib/tools/implementations/read-file.ts
export class ReadFileTool extends BaseTool<'read_file'> {
  readonly name = 'read_file' as const;
  readonly description = 'Read the contents of a file from the project';
  readonly parameters = z.object({
    path: z.string().describe('Relative path to the file'),
    startLine: z.number().optional().describe('Start line (1-indexed)'),
    endLine: z.number().optional().describe('End line (1-indexed)'),
  });
  
  async execute(params: z.infer<typeof this.parameters>): Promise<ToolResult> {
    const { path, startLine, endLine } = params;
    
    // Use SyncManager for unified file access
    const content = await this.syncManager.readFile(path);
    
    if (startLine || endLine) {
      const lines = content.split('\n');
      const start = (startLine ?? 1) - 1;
      const end = endLine ?? lines.length;
      return { content: lines.slice(start, end).join('\n') };
    }
    
    return { content };
  }
}
```

---

### 6. Task Context Pattern

**Pattern: Rich Task Context Object**

Roo Code passes a `Task` object containing all execution context:

```typescript
// Roo Code's Task contains:
interface Task {
  // State
  state: TaskState;
  historyIndex: number;
  
  // Configuration
  cwd: string;
  mode: string;
  
  // Services
  api: APIProvider;
  webviewManager: WebviewManager;
  
  // Methods
  say(type: SayType, text: string): Promise<void>;
  ask(type: AskType, question: string): Promise<string>;
}
```

**Via-Gent Application:**

```typescript
// src/lib/agent/task-context.ts
export interface TaskContext {
  // Identifiers
  taskId: string;
  conversationId: string;
  
  // Project context
  projectPath: string;
  projectFiles: string[];
  
  // Services
  syncManager: SyncManager;
  webContainer: WebContainer;
  terminal: TerminalAdapter;
  
  // Communication
  sendMessage(message: AgentMessage): void;
  requestApproval(action: string): Promise<boolean>;
  
  // State
  getHistory(): Message[];
  updateState(state: Partial<TaskState>): void;
}
```

---

### 7. Service Layer Pattern

**Pattern: Dedicated Service Modules**

Roo Code organizes services into specialized modules:

```
src/services/
├── browser/          # Browser control
├── checkpoints/      # State snapshots
├── code-index/       # Code search/index
├── command/          # Command execution
├── glob/             # File pattern matching
├── marketplace/      # Extension marketplace
├── mcp/              # MCP protocol
├── ripgrep/          # Fast file search
├── search/           # Content search
└── tree-sitter/      # Code parsing
```

**Via-Gent Application:**

```
src/lib/services/
├── file-system/      # FSA + WebContainer abstraction
├── terminal/         # xterm.js + WebContainer process
├── editor/           # Monaco integration
├── git/              # isomorphic-git operations
├── persistence/      # IndexedDB stores
├── ai/               # TanStack AI integration
└── mcp/              # MCP client (if needed)
```

---

## Critical Gaps Identified

### Gap 1: Missing Tool Abstraction Layer

**Current Via-Gent:** Tools are ad-hoc functions without unified interface.

**Solution:** Implement `BaseTool` pattern with registry.

### Gap 2: No Mode-Based Tool Filtering

**Current Via-Gent:** All tools available to all agents.

**Solution:** Implement `filterToolsForAgent()` with permission matrix.

### Gap 3: Weak Task Context

**Current Via-Gent:** Agents don't have rich execution context.

**Solution:** Create `TaskContext` passed to all tool executions.

### Gap 4: No Streaming Partial Handling

**Current Via-Gent:** Only handles complete tool calls.

**Solution:** Add `handlePartial()` for streaming UI updates.

---

## Implementation Roadmap

### Phase 1: Tool Architecture (Epic 6 prep)

1. Create `BaseTool` abstract class
2. Implement `ToolRegistry` with mode filtering
3. Convert existing tool functions to `BaseTool` implementations

### Phase 2: Task Context (Epic 6)

1. Create `TaskContext` interface
2. Wire services (SyncManager, WebContainer, Terminal)
3. Pass context to all tool executions

### Phase 3: Agent Orchestration (Post-MVP)

1. Implement multi-agent delegation
2. Add tool approval workflows
3. Create agent handoff protocols

---

## Key Takeaways

1. **Abstraction matters** - Roo Code's `BaseTool` pattern enables consistent tool behavior across protocols
2. **Mode-based filtering** - Not all agents need all tools; restrict by capability
3. **Rich context** - Pass comprehensive context to tools, not just parameters
4. **Streaming support** - Plan for partial/streaming tool execution from the start
5. **Service separation** - Dedicated service modules for each capability domain

---

*Apply these patterns during Epic 6 (AI Agent Integration) implementation.*
