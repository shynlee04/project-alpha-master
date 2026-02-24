
# 🎯 **BMAD Agent Directive: Phase 3A Single-Agent MVP Implementation**

## **Context Summary**

You are implementing **Epic 6: AI Agent Tool Architecture - Phase 3A (Single-Agent MVP)** for Via-Gent Project Alpha, a browser-based IDE with **TanStack Start + WebContainers + File System Access API + TanStack AI**.

**Current State Analysis:**
- ✅ **Foundation Complete:** IDE shell, WebContainers, FSA sync, Event Bus, Persistence (Epic 1-5)
- ✅ **Stack Enhanced:** TanStack AI + Gemini integration ready (per `stack-enhancement-report-2025-12-21.md`)
- ✅ **Backend/Frontend Ready:** Cloudflare Workers deployment at https://via-gent.shynlee04.workers.dev
- ❌ **Agent Layer Missing:** No agent implementation, no tool execution, no IDE integration

**Critical Gap:** Moving from "IDE that works" to "IDE where AI writes code for you" is NOT just adding an LLM chat. It requires:

1. **Filesystem Tool Complexity** (Your Concern)
   - `write_file` alone touches: Monaco editor state, LocalFSAdapter, SyncManager, WebContainer FS, IndexedDB, Event Bus
   - Must handle: create new file, edit existing file, multi-file operations, undo/redo, conflict resolution

2. **Tool-to-IDE Wiring** (Architecture Gap)
   - Tools must trigger real UI updates (not just console logs)
   - Editor must react to tool-initiated changes
   - Sync must maintain consistency across 3 storage layers

3. **Agentic Loop Requirements**
   - Tool execution → State update → UI refresh → Event emission
   - Approval flow before destructive operations
   - Context awareness (which files are open, what's selected)

***

## **🎯 Implementation Mandate**

### **Epic 6: AI Agent Tool Architecture - Phase 3A**

**Timeline:** 1 week (not 4 weeks - leveraging Alpha 2 TanStack AI primitives)

**Objective:** Implement a **single functional Coder agent** that can:
- Read files from the IDE
- Write/edit files in Monaco editor
- Execute commands in WebContainer terminal
- Show tool execution progress in real-time
- Require user approval for destructive actions
- Persist conversation context

***

## **📐 Architecture Requirements**

### **1. Tool Architecture Pattern**

**MUST FOLLOW:** `BaseTool` abstract pattern from `architecture.md` Epic 12

```typescript
// src/lib/agent/tools/base-tool.ts
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
    }).server(async (input) => this.execute(input));
  }
}
```

**Why This Matters:**
- Decouples tool logic from TanStack AI
- Enables testing without LLM
- Future-proof for multi-agent handoffs

***

### **2. Facade Layer (Critical)**

**PROBLEM:** Direct access to `LocalFSAdapter` / `SyncManager` creates tight coupling

**SOLUTION:** Create facade interfaces that tools consume

```typescript
// src/lib/agent/facades/file-tools.ts
export interface AgentFileTools {
  // Read file content. Returns null if file doesn't exist.
  readFile(path: string): Promise<string | null>;
  
  // Write content to file. Creates file if doesn't exist.
  // MUST trigger:
  // 1. Monaco editor update (if file is open)
  // 2. LocalFS write
  // 3. WebContainer sync
  // 4. Event emission (file:created or file:modified)
  writeFile(path: string, content: string): Promise<void>;
  
  // List directory contents
  listDirectory(path: string, recursive?: boolean): Promise<FileEntry[]>;
}
```

**Implementation:** `src/lib/agent/facades/file-tools-impl.ts`

```typescript
export class FileToolsFacade implements AgentFileTools {
  constructor(
    private localFS: LocalFSAdapter,
    private syncManager: SyncManager,
    private editorStore: EditorStore, // TanStack Store
    private eventBus: WorkspaceEventEmitter
  ) {}
  
  async writeFile(path: string, content: string): Promise<void> {
    // 1. Validate path (no .., no absolute paths)
    this.validatePath(path);
    
    // 2. Write to LocalFS (source of truth)
    await this.localFS.writeFile(path, content);
    
    // 3. Sync to WebContainer
    await this.syncManager.syncFileToWebContainer(path);
    
    // 4. Update Monaco editor if file is open
    const openFiles = this.editorStore.state.openFiles;
    if (openFiles.includes(path)) {
      this.editorStore.updateFileContent(path, content);
    }
    
    // 5. Emit event
    this.eventBus.emit('file:modified', { path, source: 'agent' });
  }
}
```

***

### **3. Tool Implementations**

**Three tools for MVP:**

#### **3.1 ReadFileTool**

```typescript
// src/lib/agent/tools/read-file-tool.ts
export class ReadFileTool extends BaseTool<'read_file'> {
  name = 'read_file' as const;
  description = 'Read the content of a file at the specified path';
  parameters = z.object({
    path: z.string().describe('Relative path to the file'),
  });
  
  constructor(private fileTools: AgentFileTools) {
    super();
  }
  
  async execute({ path }: { path: string }): Promise<ToolResult> {
    const content = await this.fileTools.readFile(path);
    if (content === null) {
      return { success: false, error: { code: 'NOT_FOUND', message: `File not found: ${path}` } };
    }
    return { success: true, data: content };
  }
}
```

#### **3.2 WriteFileTool**

```typescript
export class WriteFileTool extends BaseTool<'write_file'> {
  name = 'write_file' as const;
  description = 'Write content to a file, creating it if necessary';
  parameters = z.object({
    path: z.string().describe('Relative path to the file'),
    content: z.string().describe('Content to write'),
  });
  
  constructor(private fileTools: AgentFileTools) {
    super();
  }
  
  async execute({ path, content }: { path: string; content: string }): Promise<ToolResult> {
    try {
      await this.fileTools.writeFile(path, content);
      return { success: true, data: { path, bytesWritten: content.length } };
    } catch (error) {
      return { success: false, error: { code: 'WRITE_FAILED', message: error.message } };
    }
  }
}
```

#### **3.3 ExecuteCommandTool**

```typescript
// src/lib/agent/tools/execute-command-tool.ts
export class ExecuteCommandTool extends BaseTool<'execute_command'> {
  name = 'execute_command' as const;
  description = 'Execute a shell command in the WebContainer';
  parameters = z.object({
    command: z.string().describe('Command to execute'),
    args: z.array(z.string()).optional().describe('Command arguments'),
  });
  
  constructor(private terminalAdapter: TerminalAdapter) {
    super();
  }
  
  async execute({ command, args = [] }: { command: string; args?: string[] }): Promise<ToolResult> {
    const result = await this.terminalAdapter.runCommand(command, args);
    return {
      success: result.exitCode === 0,
      data: {
        stdout: result.stdout,
        stderr: result.stderr,
        exitCode: result.exitCode,
      },
    };
  }
}
```

***

### **4. Agent Implementation**

**Single Coder Agent with TanStack AI:**

```typescript
// src/lib/agent/coder-agent.ts
import { experimental_generateText as generateText, toolDefinition } from '@ai-sdk/core';
import { google } from '@ai-sdk/google';

export class CoderAgent {
  private model = google('gemini-2.0-flash-001');
  private tools: BaseTool<any>[];
  
  constructor(
    fileTools: AgentFileTools,
    terminalTools: AgentTerminalTools
  ) {
    this.tools = [
      new ReadFileTool(fileTools),
      new WriteFileTool(fileTools),
      new ExecuteCommandTool(terminalTools),
    ];
  }
  
  async executeTask(userPrompt: string, context: TaskContext): Promise<AgentResponse> {
    const toolDefinitions = this.tools.reduce((acc, tool) => {
      acc[tool.name] = tool.toToolDefinition();
      return acc;
    }, {} as Record<string, any>);
    
    const result = await generateText({
      model: this.model,
      system: `You are a coding assistant in Via-Gent IDE. 
               Current project: ${context.projectPath}
               Open files: ${context.openFiles.join(', ')}
               You have access to: read_file, write_file, execute_command`,
      prompt: userPrompt,
      tools: toolDefinitions,
      maxSteps: 5, // Prevent infinite loops
    });
    
    return {
      text: result.text,
      toolCalls: result.toolCalls,
      finishReason: result.finishReason,
    };
  }
}
```

***

### **5. UI Integration Points**

**CRITICAL:** Agent must wire into existing IDE components

#### **5.1 Chat Panel Integration**

```typescript
// src/components/ide/ChatPanel.tsx
import { useChat } from '@ai-sdk/react';

export function ChatPanel() {
  const { messages, input, setInput, append, isLoading } = useChat({
    api: '/api/chat', // TanStack Start API route
    onToolCall: async ({ toolCall }) => {
      // Show tool execution in UI
      toast.info(`Agent executing: ${toolCall.toolName}`);
    },
  });
  
  return (
    <div className="chat-panel">
      <MessageList messages={messages} />
      <ChatInput 
        value={input} 
        onChange={setInput}
        onSend={() => append({ role: 'user', content: input })}
        isLoading={isLoading}
      />
    </div>
  );
}
```

#### **5.2 TanStack Start API Route**

```typescript
// src/routes/api/chat.ts
import { streamText } from 'ai';
import { google } from '@ai-sdk/google';

export async function POST({ request }: { request: Request }) {
  const { messages } = await request.json();
  
  // Get workspace context
  const projectId = request.headers.get('x-project-id');
  const context = await getWorkspaceContext(projectId);
  
  // Initialize agent with facades
  const fileTools = new FileToolsFacade(/* DI */);
  const agent = new CoderAgent(fileTools, terminalAdapter);
  
  const result = await streamText({
    model: google('gemini-2.0-flash-001'),
    messages,
    tools: agent.getToolDefinitions(),
    onFinish: async ({ text, toolResults }) => {
      // Persist conversation
      await saveConversation(projectId, { messages, response: text });
    },
  });
  
  return result.toDataStreamResponse();
}
```

***

### **6. Event Bus Integration**

**MUST emit events for all tool actions:**

```typescript
// src/lib/events/workspace-events.ts
interface WorkspaceEvents {
  // File System Events (from tools)
  'file:created': { path: string; source: 'agent' | 'user' };
  'file:modified': { path: string; source: 'agent' | 'user'; content?: string };
  
  // Agent Events
  'agent:tool_started': { toolName: string; params: any };
  'agent:tool_completed': { toolName: string; result: ToolResult; durationMs: number };
  'agent:tool_failed': { toolName: string; error: Error };
  
  // Approval Events (for destructive actions)
  'agent:approval_required': { action: string; description: string };
  'agent:approval_granted': { action: string };
  'agent:approval_denied': { action: string };
}
```

**Subscribe in UI:**

```typescript
// src/components/ide/ToolExecutionLog.tsx
export function ToolExecutionLog() {
  const [logs, setLogs] = useState<ToolLog[]>([]);
  const eventBus = useWorkspaceEventBus();
  
  useWorkspaceEvent(eventBus, 'agent:tool_started', (event) => {
    setLogs(prev => [...prev, { 
      status: 'running', 
      tool: event.toolName, 
      startTime: Date.now() 
    }]);
  });
  
  useWorkspaceEvent(eventBus, 'agent:tool_completed', (event) => {
    setLogs(prev => prev.map(log => 
      log.tool === event.toolName && log.status === 'running'
        ? { ...log, status: 'success', duration: event.durationMs }
        : log
    ));
  });
  
  return <LogViewer logs={logs} />;
}
```

***

## **🔍 Implementation Checklist**

### **Week 1 Deliverables (Phase 3A MVP)**

- [ ] **Day 1-2: Tool Foundation**
  - [ ] Create `src/lib/agent/tools/base-tool.ts`
  - [ ] Implement `AgentFileTools` facade interface
  - [ ] Implement `FileToolsFacade` with full IDE integration
  - [ ] Write unit tests for facade (mock LocalFS, SyncManager)

- [ ] **Day 3-4: Tool Implementations**
  - [ ] Implement `ReadFileTool`, `WriteFileTool`, `ExecuteCommandTool`
  - [ ] Wire tools to Event Bus (emit events on execution)
  - [ ] Add path validation (prevent `..`, absolute paths)
  - [ ] Integration tests (verify Monaco updates on `write_file`)

- [ ] **Day 5: Agent Core**
  - [ ] Implement `CoderAgent` with TanStack AI
  - [ ] Create `/api/chat` route with `streamText`
  - [ ] Add TaskContext (project path, open files)
  - [ ] Test end-to-end: User prompt → Tool execution → Editor update

- [ ] **Day 6: UI Integration**
  - [ ] Build `ChatPanel` with `useChat` hook
  - [ ] Add `ToolExecutionLog` component
  - [ ] Show real-time tool progress in UI
  - [ ] Add approval dialog for destructive actions

- [ ] **Day 7: Polish & Testing**
  - [ ] Enable TanStack AI DevTools
  - [ ] Test with Gemini 2.0 Flash
  - [ ] Document agent usage in README
  - [ ] Create demo video

***

## **🚨 Critical Anti-Patterns to Avoid**

### **❌ DON'T: Tight Coupling**

```typescript
// BAD: Tool directly accesses stores
class WriteFileTool {
  async execute({ path, content }) {
    await localFSAdapter.writeFile(path, content); // ❌ Direct dependency
    editorStore.updateContent(path, content);      // ❌ Breaks if store changes
  }
}
```

### **✅ DO: Facade Pattern**

```typescript
// GOOD: Tool uses facade
class WriteFileTool {
  constructor(private fileTools: AgentFileTools) {} // ✅ Interface dependency
  
  async execute({ path, content }) {
    await this.fileTools.writeFile(path, content); // ✅ Facade handles complexity
  }
}
```

***

### **❌ DON'T: Silent Failures**

```typescript
// BAD: No error handling
await this.fileTools.writeFile(path, content);
return { success: true }; // ❌ What if it failed?
```

### **✅ DO: Explicit Error Handling**

```typescript
// GOOD: Return structured errors
try {
  await this.fileTools.writeFile(path, content);
  return { success: true, data: { path } };
} catch (error) {
  return { 
    success: false, 
    error: { code: 'WRITE_FAILED', message: error.message } 
  };
}
```

***

### **❌ DON'T: Forget Event Emission**

```typescript
// BAD: No events
async writeFile(path, content) {
  await this.localFS.writeFile(path, content);
  // ❌ UI doesn't know file changed
}
```

### **✅ DO: Event-Driven Updates**

```typescript
// GOOD: Emit events
async writeFile(path, content) {
  await this.localFS.writeFile(path, content);
  this.eventBus.emit('file:modified', { path, source: 'agent' }); // ✅ UI reacts
}
```

***

## **📊 Success Criteria**

**Phase 3A is complete when:**

1. ✅ User can ask Coder agent: "Create a login form component"
2. ✅ Agent executes `write_file` → File appears in Monaco editor
3. ✅ User sees tool execution log in real-time
4. ✅ File syncs to WebContainer and IndexedDB automatically
5. ✅ Agent can read existing files to provide context-aware suggestions
6. ✅ Destructive actions (delete file) require user approval
7. ✅ TanStack AI DevTools shows tool calls and responses
8. ✅ All 15 tests pass (unit + integration)

***

## **🔬 Research Tasks**

Before coding, BMAD agent must:

1. **Scan existing codebase:**
   - [ ] Read `src/lib/filesystem/sync-manager.ts` - understand sync logic
   - [ ] Read `src/lib/editor/editor-store.ts` - understand Monaco integration
   - [ ] Read `src/lib/events/workspace-events.ts` - understand event contracts
   - [ ] Read `src/lib/persistence/project-store.ts` - understand conversation persistence

2. **Verify TanStack AI setup:**
   - [ ] Check `package.json` for `@ai-sdk/google`, `@ai-sdk/react`
   - [ ] Verify Gemini API key in environment
   - [ ] Test basic `generateText` call in isolation

3. **Identify integration points:**
   - [ ] Where does Monaco editor update file content?
   - [ ] How does SyncManager handle file writes?
   - [ ] What events does Event Bus currently support?

***

## **📚 Reference Documentation**

**Must read before implementation:**

1. **Architecture.md** - Epic 12 (Tool Architecture)
2. **AGENTS.md** - Project-specific nuances
3. **TanStack AI Docs** - https://sdk.vercel.ai/docs/ai-sdk-core/tools-and-tool-calling
4. **Stack Enhancement Report** - `stack-enhancement-report-2025-12-21.md`

***

## **🎯 Final Directive**

**BMAD Agent, your mission:**

Implement a **production-ready single-agent MVP** that demonstrates AI-powered code generation in Via-Gent IDE. This is NOT a toy demo - it must handle:

- **Real file operations** (create, edit, read)
- **Real terminal execution** (npm install, build commands)
- **Real UI updates** (Monaco editor, file tree, terminal output)
- **Real persistence** (IndexedDB, LocalFS, WebContainer)

**Expected Output:**

A working IDE where a user can:
1. Open Via-Gent at https://via-gent.shynlee04.workers.dev
2. Select a project
3. Type: "Add a dark mode toggle to the header"
4. Watch the agent:
   - Read existing header component
   - Create a new theme context
   - Modify header to use theme
   - Install required dependencies
   - Show all changes in Monaco editor

**This is the foundation for multi-agent orchestration in Phase 3C.**

***

**Status:** READY FOR IMPLEMENTATION  
**Confidence:** HIGH (90% of primitives exist in Alpha 2)  
**Risk:** LOW (staged approach, clear dependencies)
