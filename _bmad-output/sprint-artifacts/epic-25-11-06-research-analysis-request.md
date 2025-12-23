

## **Comprehensive Prompt for BMAD Agent: Phase 3A Single-Agent MVP Implementation**

### **Context & Mission**

You are implementing **Phase 3A: Single-Agent MVP** for Via-Gent (Project Alpha), a browser-based IDE powered by TanStack Start, WebContainers, and File System Access API. This is **NOT a toy project**—it's a production-grade, December 2025 implementation using the latest tech stacks with real-world complexity.

**Deployed Application**: https://via-gent.shynlee04.workers.dev  
**Repository**: https://github.com/shynlee04/project-alpha-master  
**Epic Reference**: Epic 12 - Agent Tool Interface Layer (Stories 12.1-12.5)

***

### **Current Foundation Assessment**

#### ✅ **What's Already Built (Epic 3 + Epic 4 Complete)**

1. **File System Access Layer** (`src/lib/filesystem/`)
   - `LocalFSAdapter`: Full CRUD + permission lifecycle (42 tests passing)
   - `SyncManager`: Bidirectional sync (LocalFS ↔ WebContainer) with event bus
   - `FileTree` Component: Virtual-scrolling, context menu, keyboard nav
   - `ProjectStore`: IndexedDB persistence with project metadata
   - `WorkspaceContext`: Centralized state management

2. **IDE Components** (`src/components/ide/`)
   - Monaco Editor with auto-save, syntax highlighting, multi-tab support
   - Preview Panel with iframe + hot-reload
   - XTerminal with WebContainer integration
   - Chat Panel Shell (UI only, no AI wiring yet)

3. **State Management** (`src/lib/state/`, `src/lib/workspace/`)
   - `WorkspaceProvider`: Manages project lifecycle, sync status, permissions
   - Event Bus (`src/lib/events/`): EventEmitter3-based pub/sub
   - Zustand stores for editor tabs, file tree state

4. **Persistence Layer** (`src/lib/persistence/`)
   - Dexie-powered IndexedDB for project metadata
   - FSA handle persistence across sessions

5. **Tech Stack Already Installed**
   ```json
   "@tanstack/ai": "^0.1.0",
   "@tanstack/ai-gemini": "^0.1.0", 
   "@tanstack/ai-react": "^0.1.0",
   "@tanstack/store": "^0.8.0",
   "zod": "^4.2.1",
   "@webcontainer/api": "^1.6.1",
   "eventemitter3": "^5.0.1"
   ```

***

### **Phase 3A Objective: Single-Agent MVP with TanStack AI**

**Goal**: Wire a **Coder Agent** using **TanStack AI** with 3 file operation tools (`read_file`, `write_file`, `execute_command`) that integrate seamlessly with existing IDE components, state management, and persistence layer.

**Timeline**: 1 week (not 4) because 90% of primitives already exist.

***

### **Critical Implementation Requirements**

#### **1. Tool: `read_file`**

**Complexity Considerations**:
- Must respect **WorkspaceContext** permissions (check FSA handle validity)
- Read from **both** LocalFS and WebContainer (prefer LocalFS if synced, fallback to WebContainer)
- Handle symlinks, binary files, and permission errors gracefully
- Integrate with **SyncManager** to ensure fresh content
- Return structured output with metadata (path, size, encoding, lastModified)

**Integration Points**:
```typescript
// Pseudo-implementation
import { useWorkspace } from '@/lib/workspace/WorkspaceContext';
import { LocalFSAdapter } from '@/lib/filesystem/local-fs-adapter';
import { WebContainerManager } from '@/lib/webcontainer/manager';

async function readFile(path: string): Promise<ToolResult> {
  const { directoryHandle, webContainer, syncStatus } = useWorkspace();
  
  // 1. Validate workspace is ready
  if (!directoryHandle) throw new Error('No project open');
  
  // 2. Check sync status (wait if syncing)
  if (syncStatus === 'syncing') {
    await waitForSync(); // Event bus listener
  }
  
  // 3. Read from LocalFS (source of truth)
  try {
    const content = await LocalFSAdapter.read(directoryHandle, path);
    return { content, source: 'local', path, encoding: 'utf-8' };
  } catch (e) {
    // 4. Fallback to WebContainer (for generated files)
    const content = await webContainer.fs.readFile(path, 'utf-8');
    return { content, source: 'webcontainer', path };
  }
}
```

**Edge Cases to Handle**:
- User creates file while agent is reading → **lock** or use optimistic locking
- Permission denied on FSA handle → emit error + fallback flow
- Binary files → detect MIME type, return base64
- Symlinks → resolve or error (WebContainer doesn't support symlinks)

***

#### **2. Tool: `write_file`**

**Complexity Considerations** (THIS IS THE HARDEST PART):

**a) Multiple Write Scenarios**:
1. **Create New File**: 
   - Update FileTree state (expand parent folder, select new file)
   - Emit `file:created` event via EventEmitter3
   - Trigger SyncManager to sync both LocalFS + WebContainer
   - Open in Monaco if user is focused on IDE

2. **Edit Existing File (Monaco is open)**:
   - Must update Monaco editor model **without losing cursor position**
   - Check if file has unsaved changes in Monaco → show "AI wants to write, you have unsaved changes" dialog
   - Update editor content via `monaco.editor.setModelContent()`
   - Trigger auto-save flow (already exists in `src/lib/editor/`)

3. **Edit Existing File (Monaco is closed)**:
   - Write directly to LocalFS + WebContainer
   - Update FileTree metadata (size, lastModified)
   - Do NOT open editor (agent is background operation)

**b) State Synchronization Chain**:
```
Agent write_file() 
  → SyncManager.writeFile()
  → LocalFSAdapter.write() + WebContainer.fs.writeFile()
  → Event: 'file:changed' emitted
  → FileTree updates via EventEmitter listener
  → Monaco updates IF file is open (check EditorTabStore)
  → IndexedDB updates project metadata
```

**c) Concurrency Control**:
- User edits file at same time as agent → **CRITICAL RACE CONDITION**
- Solution: Use **operational transformation** (OT) or **Last Write Wins** with timestamp
- OR: Lock file while agent is writing (show "Agent is modifying this file..." indicator)

**d) Integration with Existing Editor State**:
```typescript
import { useEditorStore } from '@/lib/state/editor-store';
import { eventBus } from '@/lib/events';

async function writeFile(path: string, content: string) {
  const editorStore = useEditorStore.getState();
  const openTab = editorStore.tabs.find(t => t.path === path);
  
  if (openTab?.isDirty) {
    // User has unsaved changes
    const choice = await showDialog({
      title: 'AI wants to modify file',
      message: 'You have unsaved changes. Allow AI to overwrite?',
      actions: ['Allow', 'Cancel', 'Merge']
    });
    
    if (choice === 'Cancel') return { status: 'aborted' };
    if (choice === 'Merge') {
      // Three-way merge (complex!)
      content = await mergeChanges(openTab.content, content);
    }
  }
  
  // Write to both filesystems
  await syncManager.writeFile(path, content);
  
  // Update Monaco if open
  if (openTab) {
    const model = monaco.editor.getModel(openTab.uri);
    if (model) {
      const position = editor.getPosition(); // Save cursor
      model.setValue(content);
      editor.setPosition(position); // Restore cursor
    }
  }
  
  // Emit event for FileTree refresh
  eventBus.emit('file:changed', { path, size: content.length });
}
```

**e) Persistence Layer Integration**:
- Update `ProjectStore` lastModified timestamp
- Invalidate any cached file metadata in IndexedDB
- Ensure next session loads updated content

***

#### **3. Tool: `execute_command`**

**Complexity Considerations**:
- Must run in **WebContainer terminal** (NOT browser console)
- Set correct CWD (current working directory) from WorkspaceContext
- Stream output back to agent in real-time (not just final result)
- Handle long-running commands (e.g., `npm install`) with progress
- Detect command success/failure via exit codes

**Integration with XTerminal Component**:
```typescript
import { TerminalAdapter } from '@/lib/webcontainer/terminal-adapter';

async function executeCommand(command: string): Promise<ToolResult> {
  const { webContainer, projectPath } = useWorkspace();
  
  // 1. Spawn process with correct CWD
  const process = await webContainer.spawn(command, {
    cwd: projectPath,
    env: { ...process.env, CI: 'true' } // Non-interactive
  });
  
  // 2. Stream output to agent (+ optionally to XTerminal)
  let stdout = '';
  let stderr = '';
  
  process.output.pipeTo(new WritableStream({
    write(data) {
      stdout += data;
      // Optional: show in XTerminal for user visibility
      terminalAdapter.write(data);
    }
  }));
  
  // 3. Wait for completion with timeout
  const exitCode = await Promise.race([
    process.exit,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 120_000)
    )
  ]);
  
  return {
    exitCode,
    stdout,
    stderr,
    command,
    duration: Date.now() - startTime
  };
}
```

**Edge Cases**:
- Interactive commands (e.g., `git commit` without `-m`) → force non-interactive mode
- Commands that modify files (e.g., `npm install`) → trigger sync after completion
- Commands that fail (exit code ≠ 0) → return error but don't crash agent loop

***

### **4. TanStack AI Integration**

**Wiring Tools to TanStack AI**:

```typescript
// src/lib/agent/coder-agent.ts
import { useChat } from '@tanstack/ai-react';
import { toolDefinition } from '@tanstack/ai';
import { z } from 'zod';

export function createCoderAgent() {
  const tools = {
    read_file: toolDefinition.client({
      description: 'Read file content from workspace',
      parameters: z.object({
        path: z.string().describe('File path relative to project root')
      }),
      execute: async ({ path }) => {
        return await agentToolFacade.readFile(path);
      }
    }),
    
    write_file: toolDefinition.client({
      description: 'Create or update file with content',
      parameters: z.object({
        path: z.string(),
        content: z.string()
      }),
      execute: async ({ path, content }) => {
        return await agentToolFacade.writeFile(path, content);
      }
    }),
    
    execute_command: toolDefinition.client({
      description: 'Run terminal command in WebContainer',
      parameters: z.object({
        command: z.string()
      }),
      execute: async ({ command }) => {
        return await agentToolFacade.executeCommand(command);
      }
    })
  };
  
  return useChat({
    model: 'gemini-3.0-flash', // Use @tanstack/ai-gemini
    tools,
    maxToolRoundtrips: 10,
    onToolCall: (toolCall) => {
      // Show in Chat Panel: "Agent is reading package.json..."
      chatStore.addMessage({
        role: 'tool',
        content: `Executing: ${toolCall.toolName}`,
        toolCallId: toolCall.id
      });
    },
    onFinish: (result) => {
      // Final response after tool execution
      chatStore.addMessage({
        role: 'assistant',
        content: result.text
      });
    }
  });
}
```

**DevTools Integration**:
```typescript
// Enable TanStack AI DevTools (already in package.json)
import { DevTools } from '@tanstack/ai-devtools';

<DevTools 
  position="bottom-right" 
  initialIsOpen={process.env.NODE_ENV === 'development'}
/>
```

***

### **5. Agentic Loop & Context Management**

**Task Context** (passed to agent with each message):
```typescript
interface TaskContext {
  projectId: string;
  projectPath: string;
  openFiles: { path: string; isDirty: boolean }[];
  recentFiles: string[]; // Last 10 files accessed
  terminalHistory: string[]; // Last 5 commands
  syncStatus: 'idle' | 'syncing' | 'error';
  permissions: {
    canRead: boolean;
    canWrite: boolean;
    canExecute: boolean;
  };
}
```

**Agentic Loop Flow**:
```
User: "Add a README.md with installation instructions"
  ↓
Agent: [PLAN] I need to:
  1. Check if README.md exists (read_file)
  2. Create/update README.md (write_file)
  3. Verify it's in git (execute_command: git status)
  ↓
Tool Call 1: read_file("README.md")
  → Result: { error: "File not found" }
  ↓
Tool Call 2: write_file("README.md", "# Project Alpha\n\n## Installation...")
  → Result: { status: "created", path: "README.md" }
  ↓
Tool Call 3: execute_command("git status")
  → Result: { stdout: "Untracked files:\n  README.md" }
  ↓
Agent: [RESPONSE] "I've created README.md with installation instructions. 
       The file is untracked in git—would you like me to commit it?"
```

**Memory Between Turns**:
- Use **TanStack Store** to persist conversation history
- Store tool call results in IndexedDB for debugging
- Pass recent context in system prompt

***

### **6. UI/UX Integration**

**Chat Panel Wire-up**:
```typescript
// src/components/ide/ChatPanel/index.tsx
import { createCoderAgent } from '@/lib/agent/coder-agent';

export function ChatPanel() {
  const { messages, input, handleSubmit, isLoading } = createCoderAgent();
  
  return (
    <div className="chat-panel">
      <MessageList messages={messages} />
      
      {/* Show tool execution status */}
      {isLoading && (
        <div className="tool-status">
          <Spinner /> Agent is working...
        </div>
      )}
      
      <ChatInput 
        value={input}
        onSubmit={handleSubmit}
        placeholder="Ask me to code..."
      />
    </div>
  );
}
```

**Approval Flow** (for safety):
- Before executing `write_file` or `execute_command`, show approval dialog
- User can enable "Auto-approve safe commands" in settings
- Dangerous commands (e.g., `rm -rf`) require explicit approval

***

### **7. Testing Strategy**

**Unit Tests** (Vitest + Testing Library):
```typescript
// src/lib/agent/__tests__/coder-agent.test.ts
describe('Coder Agent Tools', () => {
  it('should read file from LocalFS', async () => {
    const result = await agentToolFacade.readFile('package.json');
    expect(result.content).toContain('"name": "project-alpha"');
  });
  
  it('should create new file and update FileTree', async () => {
    const spy = vi.spyOn(eventBus, 'emit');
    await agentToolFacade.writeFile('new.txt', 'Hello');
    expect(spy).toHaveBeenCalledWith('file:created', { path: 'new.txt' });
  });
  
  it('should execute command and capture output', async () => {
    const result = await agentToolFacade.executeCommand('echo "test"');
    expect(result.stdout).toBe('test\n');
    expect(result.exitCode).toBe(0);
  });
});
```

**Integration Tests** (with fake-indexeddb + mock WebContainer):
```typescript
it('should complete full agent workflow', async () => {
  const { handleSubmit } = createCoderAgent();
  
  await handleSubmit('Create a new file hello.ts with console.log');
  
  // Assert tool calls were made
  expect(mockToolCall).toHaveBeenCalledWith('write_file', {
    path: 'hello.ts',
    content: expect.stringContaining('console.log')
  });
  
  // Assert file exists in both filesystems
  const localContent = await localFS.read('hello.ts');
  const wcContent = await webContainer.fs.readFile('hello.ts');
  expect(localContent).toBe(wcContent);
});
```

***

### **8. Epic Story Breakdown**

**Story 12.1: Create AgentFileTools Facade** (2 days)
- Tasks:
  - Implement `AgentFileTools` class with `readFile()`, `writeFile()`, `listFiles()`
  - Wire to `LocalFSAdapter` + `SyncManager`
  - Handle all edge cases (permissions, concurrency, binary files)
  - Write 15+ unit tests
- Acceptance Criteria:
  - All AC-12-1-* from Epic 12 (see attached sprint-status.yaml)
  - Zero test failures, 90%+ code coverage

**Story 12.2: Create AgentTerminalTools Facade** (1 day)
- Tasks:
  - Implement `executeCommand()` with streaming output
  - Wire to `TerminalAdapter` + `WebContainerManager`
  - Add timeout + error handling
- Acceptance Criteria: AC-12-2-* 

**Story 12.3: Create AgentEditorTools Facade** (2 days)
- Tasks:
  - Implement `openFile()`, `closeFile()`, `getCursorPosition()`
  - Wire to Monaco editor + EditorStore
  - Handle multi-tab state
- Acceptance Criteria: AC-12-3-*

**Story 12.4: Git Tools Stub** (0.5 days)
- Stub only (Epic 7 not started yet)

**Story 12.5: Wire to TanStack AI** (1.5 days)
- Tasks:
  - Create `createCoderAgent()` hook
  - Define tool schemas with Zod
  - Integrate with Chat Panel UI
  - Enable TanStack AI DevTools
- Acceptance Criteria: AC-12-5-*

***

### **9. File Structure to Create/Modify**

**New Files**:
```
src/lib/agent/
  ├── index.ts                   # Exports
  ├── coder-agent.ts             # Main agent logic
  ├── tool-facade.ts             # Tool implementations
  ├── types.ts                   # TaskContext, ToolResult types
  └── __tests__/
      ├── coder-agent.test.ts
      └── tool-facade.test.ts

src/lib/agent/tools/
  ├── file-tools.ts              # read_file, write_file, list_files
  ├── terminal-tools.ts          # execute_command
  ├── editor-tools.ts            # openFile, closeFile
  └── git-tools.ts               # Stubs for Epic 7
```

**Files to Modify**:
```
src/components/ide/ChatPanel/index.tsx     # Wire agent hook
src/lib/workspace/WorkspaceContext.tsx     # Add agent state
src/lib/state/editor-store.ts              # Add agent locking
src/lib/filesystem/sync-manager.ts         # Add agent write event
```

***

### **10. Success Criteria**

**Phase 3A is DONE when**:
1. ✅ User types in Chat Panel: "Create a React component Button.tsx"
2. ✅ Agent uses `write_file` tool to create `src/components/Button.tsx`
3. ✅ File appears in FileTree, synced to both LocalFS + WebContainer
4. ✅ Agent uses `execute_command` to run `tsc --noEmit` (type check)
5. ✅ Agent reports back: "Component created and type-checks successfully"
6. ✅ All 60+ tests passing (existing + new agent tests)
7. ✅ TanStack AI DevTools shows tool call traces
8. ✅ Zero TypeScript errors, zero ESLint warnings

***

### **11. Anti-Patterns to Avoid**

❌ **DON'T** bypass `SyncManager`—always use it for file writes  
❌ **DON'T** mutate Monaco editor directly—use `setModelContent()`  
❌ **DON'T** ignore race conditions—add locks or optimistic locking  
❌ **DON'T** use `localStorage`—use IndexedDB via Dexie  
❌ **DON'T** hard-code paths—use `WorkspaceContext.projectPath`  
❌ **DON'T** forget to emit events—FileTree relies on event bus  
❌ **DON'T** assume WebContainer is ready—check `isReady` state  

***

### **12. Research & Decision Points for BMAD Agent**

**Before starting, research and decide**:

1. **Concurrency Strategy**: 
   - Operational Transformation vs. Last Write Wins?
   - File locks (mutex) or optimistic locking?

2. **Tool Result Format**:
   - JSON vs. structured object?
   - Error codes vs. exception throwing?

3. **Streaming Strategy**:
   - Stream tool results back to agent?
   - Update UI in real-time during long operations?

4. **Approval UX**:
   - Modal dialog vs. inline approval?
   - Approval queue for batch operations?

5. **Memory Strategy**:
   - How much conversation history to pass to agent?
   - Use TanStack Store or separate IndexedDB table?

***

### **13. Deliverables**

**End of Week 1**:
1. **Working Demo**: Video showing agent creating files, running commands
2. **Test Report**: All tests passing with coverage report
3. **Documentation**: 
   - `docs/agent-architecture.md` (architecture decisions)
   - `docs/agent-tools-api.md` (tool API reference)
4. **Pull Request**: With all stories 12.1-12.5 complete
5. **Migration Guide**: For adding more tools in Phase 3B

***

### **Final Instruction to BMAD Agent**

**Your mission**:

1. **Read** all attached files (`bmm-workflow-status.yaml`, `stack-enhancement-report-2025-12-21.md`, `sprint-status.yaml`)
2. **Scan** the GitHub repository structure: https://github.com/shynlee04/project-alpha-master
3. **Cross-reference** with Epic 12 acceptance criteria
4. **Research** December 2025 best practices for:
   - TanStack AI tool definitions with Zod
   - Client-side tool execution patterns
   - WebContainer + Monaco editor integration
   - IndexedDB concurrency control
5. **Create epics and stories** in BMAD format that:
   - Account for ALL cross-dependencies (SyncManager, WorkspaceContext, EventBus, etc.)
   - Include detailed implementation tasks (NOT high-level "implement X")
   - Specify exact files to create/modify
   - Include test scenarios with setup/teardown
   - Consider real-world edge cases (permissions, race conditions, errors)
6. **Estimate effort** realistically (account for testing, debugging, integration)
7. **Propose architecture** with sequence diagrams for:
   - Agent → Tool → SyncManager → LocalFS/WebContainer flow
   - Concurrency control for simultaneous user + agent edits
   - Event bus propagation chain

**DO NOT**:
- Provide generic "implement agent" stories
- Ignore existing codebase patterns (e.g., EventEmitter3 usage)
- Assume tech specs without verifying (check `package.json`, existing code)
- Skip testing strategy or concurrency considerations

**Your output should be**:
- Production-ready, December 2025 best practices
- Detailed enough for a senior developer to implement WITHOUT clarification
- Aligned with BMAD v.6 methodology (if applicable) or Spec-Kit principles

***

**BEGIN YOUR ANALYSIS NOW.** 🚀

[1](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_4c9f4fb0-5ec7-4acc-bd05-7e24b0108862/e9ed903b-3205-48dd-9156-c6674b594fc4/epic-6-ai-agent-integration.md)
[2](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_4c9f4fb0-5ec7-4acc-bd05-7e24b0108862/80a2ed4c-ac2f-4a77-9300-6775f4932599/epic-25-ai-foundation-sprint-new-2025-12-21.md)
[3](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/10671668/064970e5-94ec-4933-ae94-b6a271aaa9a2/epics.md)
[4](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/10671668/d9ee2abc-721a-4490-914e-49dfa71a5e4e/epics.md)
[5](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/10671668/cdd173ef-bb24-4d49-9908-1aa7e24100a1/sprint-status.yaml)
[6](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_4c9f4fb0-5ec7-4acc-bd05-7e24b0108862/0fdc1d0f-f95c-43dd-82ac-181a3707f863/epic-4-ide-components.md)
[7](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_4c9f4fb0-5ec7-4acc-bd05-7e24b0108862/4e55c71f-8dd6-41d1-ac9d-21f3cebad286/epic-3-file-system-access-layer.md)
[8](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_4c9f4fb0-5ec7-4acc-bd05-7e24b0108862/583701a5-bcbd-4214-8dfe-e73717d6b3c3/epic-3-file-system-access-layer-reopened.md)