# Agent Tool Architecture (Epic 6 Prep)

**Source:** Roo Code patterns analysis  
**Status:** Architectural guidance for Epic 6 implementation

### BaseTool Abstract Pattern

```typescript
// src/lib/tools/base-tool.ts
export abstract class BaseTool<TName extends ToolName> {
  abstract readonly name: TName;
  abstract readonly description: string;
  abstract readonly parameters: z.ZodType;
  
  // Protocol-agnostic execution
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

### Mode-Based Tool Filtering

```typescript
// src/lib/tools/tool-registry.ts
const AGENT_TOOL_PERMISSIONS: Record<AgentType, ToolName[]> = {
  orchestrator: ['delegate_task', 'check_status', 'report_completion'],
  coder: ['read_file', 'write_file', 'list_files', 'execute_command', 'search_files'],
  planner: ['read_file', 'list_files', 'ask_question'],
  validator: ['read_file', 'run_tests', 'check_types'],
};

export class ToolRegistry {
  getToolsForAgent(agentType: AgentType): BaseTool<any>[] {
    const permissions = AGENT_TOOL_PERMISSIONS[agentType];
    return Array.from(this.tools.values()).filter(
      (tool) => permissions.includes(tool.name)
    );
  }
}
```

### Task Context Pattern

```typescript
// src/lib/agent/task-context.ts
export interface TaskContext {
  taskId: string;
  conversationId: string;
  projectPath: string;
  
  // Services
  syncManager: SyncManager;
  webContainer: WebContainer;
  terminal: TerminalAdapter;
  
  // Communication
  sendMessage(message: AgentMessage): void;
  requestApproval(action: string): Promise<boolean>;
}
```

### Tool Implementation Mapping

| Roo Code Tool | Via-Gent Equivalent | Integration Point |
|---------------|---------------------|-------------------|
| `ReadFileTool` | `read_file` | SyncManager.readFile() |
| `WriteToFileTool` | `write_file` | SyncManager.writeFile() |
| `ListFilesTool` | `list_files` | LocalFSAdapter.listDirectory() |
| `ExecuteCommandTool` | `execute_command` | WebContainer.spawn() |
| `AskFollowupQuestionTool` | `ask_question` | Chat panel UI |
| `AttemptCompletionTool` | `complete_task` | Task state update |

---
