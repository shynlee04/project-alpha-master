# Thread V2 Schema Design

**Created:** 2026-02-01
**Status:** DESIGN — Not yet implemented
**Implements When:** Phase D (Agentic Features)
**Authority:** SOURCE-OF-TRUTH.md Part 3.3

---

## Purpose

This document defines the target schema for ThreadMessage with parts-based content, enhanced ToolCall with approval workflow, and ToolResult with side effects tracking.

**Why this document exists:**
- Captures architectural intent before implementation
- Prevents "forgot this field" during Phase D
- Provides clear migration path (additive, not breaking)
- Referenced by Phase D planning

---

## Current State (v1)

```typescript
// @/domain/schemas/thread.schema.ts (current)

interface ThreadMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;  // Plain string
  timestamp: number;
  agentId?: string;
  agentName?: string;
  agentModel?: string;
  toolCalls?: ThreadToolCall[];  // Basic structure
}

interface ThreadToolCall {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  input?: unknown;
  output?: unknown;
  duration?: number;
}
```

**Limitations:**
- `content: string` cannot represent code blocks, artifacts, thinking blocks
- No approval workflow data (who approved, when)
- No side effects tracking (which files were created/modified)
- Tool results embedded in toolCall.output, not as separate message parts

---

## Target State (v2)

### MessagePart Union Type

AI responses contain multiple types of content. Parts-based structure allows:
- Rendering different part types with appropriate UI
- Indexing specific part types for RAG
- Tracking tool calls and results as first-class entities

```typescript
// @/domain/schemas/thread.schema.ts (v2)

/**
 * MessagePart - Union type for structured message content
 * 
 * EXTENSIBILITY: Add new part types as union members.
 * Each part type is self-describing via `type` discriminator.
 */
type MessagePart =
  // Text content (markdown)
  | { type: 'text'; content: string }
  
  // Code with syntax highlighting
  | { type: 'code'; language: string; content: string; filename?: string }
  
  // Interactive artifact (HTML, React component preview)
  | { type: 'artifact'; id: string; title: string; content: string; language?: string }
  
  // AI thinking/reasoning (collapsible)
  | { type: 'thinking'; content: string; isCollapsed?: boolean }
  
  // Diagram (mermaid, SVG)
  | { type: 'diagram'; diagramType: 'mermaid' | 'svg'; content: string }
  
  // Tool call request (from AI)
  | { type: 'tool_call'; toolCall: ToolCall }
  
  // Tool execution result
  | { type: 'tool_result'; toolResult: ToolResult }
  
  // Error message
  | { type: 'error'; message: string; code?: string }
  
  // Image (inline or generated)
  | { type: 'image'; url: string; alt?: string; source?: 'user' | 'generated' };
```

### Enhanced ToolCall

Tool calls need approval workflow for write/execute operations.

```typescript
/**
 * ToolCall - Request to execute a tool
 * 
 * Lifecycle:
 * 1. AI requests tool execution → status: 'pending'
 * 2. User approves or auto-approved → status: 'approved'
 * 3. Execution starts → status: 'running'
 * 4. Execution completes → status: 'completed' or 'failed'
 * 
 * If rejected: status: 'rejected', no execution
 */
interface ToolCall {
  /** Unique call ID (UUID) */
  id: string;
  
  /** Tool name from TOOL_REGISTRY */
  toolName: string;
  
  /** Arguments passed to tool */
  args: Record<string, unknown>;
  
  /** Current status */
  status: 'pending' | 'approved' | 'rejected' | 'running' | 'completed' | 'failed';
  
  /** When AI requested this tool call */
  requestedAt: number;  // Unix ms
  
  /** When call was approved (if approval required) */
  approvedAt?: number;  // Unix ms
  
  /** Who approved: user clicked approve, or auto-approved by policy */
  approvedBy?: 'user' | 'auto';
  
  /** Why rejected (if status: 'rejected') */
  rejectionReason?: string;
}
```

### ToolResult with Side Effects

Tool results must track what files were changed for:
- Showing "3 files created" in UI
- Syncing FileTree after tool execution
- Undo/rollback capability (future)

```typescript
/**
 * ToolResult - Outcome of tool execution
 * 
 * Separated from ToolCall because:
 * - Results may arrive asynchronously (streaming)
 * - Results may be large (file contents)
 * - Results may have side effects that need tracking
 */
interface ToolResult {
  /** References ToolCall.id */
  callId: string;
  
  /** Tool output (varies by tool type) */
  output: unknown;
  
  /** Error message if failed */
  error?: string;
  
  /** When execution completed */
  executedAt: number;  // Unix ms
  
  /** Execution duration */
  durationMs: number;
  
  /**
   * Side effects - files changed by this tool
   * 
   * Used by:
   * - FileTree to refresh
   * - RAG to re-index
   * - UI to show "created 2 files"
   */
  sideEffects?: {
    /** Paths of files created */
    createdFiles?: string[];
    
    /** Paths of files modified */
    modifiedFiles?: string[];
    
    /** Paths of files deleted */
    deletedFiles?: string[];
  };
}
```

### Updated ThreadMessage

```typescript
/**
 * ThreadMessage v2 - Parts-based content
 * 
 * MIGRATION STRATEGY:
 * - Add `parts` as optional field
 * - Keep `content` for backward compatibility
 * - Writers use `parts`, readers check `parts` first then `content`
 */
interface ThreadMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';  // Added 'tool' role
  
  /**
   * @deprecated Use `parts` instead
   * Kept for backward compatibility with existing threads
   */
  content?: string;
  
  /**
   * Structured message content
   * Preferred over `content` for new messages
   */
  parts?: MessagePart[];
  
  timestamp: number;
  agentId?: string;
  agentName?: string;
  agentModel?: string;
  
  /**
   * @deprecated Use parts with type: 'tool_call' instead
   * Kept for backward compatibility
   */
  toolCalls?: ThreadToolCall[];
}
```

---

## TOOL_REGISTRY Design

Tools are code-defined, not persisted. The registry defines what tools exist and their properties.

```typescript
// @/domain/tools/tool-registry.ts

type ToolCategory = 'file' | 'rag' | 'terminal' | 'system' | 'web';
type ToolPermissionLevel = 'read' | 'write' | 'execute';

interface ToolDefinition {
  /** Tool identifier (used in ToolCall.toolName) */
  name: string;
  
  /** Human-readable description */
  description: string;
  
  /** Tool category for grouping */
  category: ToolCategory;
  
  /** Required permission levels */
  requiredPermissions: ToolPermissionLevel[];
  
  /** Input schema (Zod) for validation */
  inputSchema: z.ZodSchema;
  
  /** Output schema (Zod) for typing */
  outputSchema: z.ZodSchema;
  
  /** Does this tool require user approval before execution? */
  needsApproval: boolean;
  
  /** Does this tool create/modify/delete files? */
  hasSideEffects: boolean;
}

/**
 * TOOL_REGISTRY - Static registry of available tools
 * 
 * This is CODE-DEFINED, not persisted to database.
 * Tools are added by implementing ToolDefinition and registering here.
 */
const TOOL_REGISTRY: Record<string, ToolDefinition> = {
  'read_file': {
    name: 'read_file',
    description: 'Read contents of a file',
    category: 'file',
    requiredPermissions: ['read'],
    needsApproval: false,
    hasSideEffects: false,
    inputSchema: z.object({ path: z.string() }),
    outputSchema: z.object({ content: z.string() }),
  },
  
  'write_file': {
    name: 'write_file',
    description: 'Write content to a file',
    category: 'file',
    requiredPermissions: ['write'],
    needsApproval: true,  // Requires approval
    hasSideEffects: true,  // Creates/modifies files
    inputSchema: z.object({ path: z.string(), content: z.string() }),
    outputSchema: z.object({ success: z.boolean() }),
  },
  
  'delete_file': {
    name: 'delete_file',
    description: 'Delete a file',
    category: 'file',
    requiredPermissions: ['write'],
    needsApproval: true,
    hasSideEffects: true,
    inputSchema: z.object({ path: z.string() }),
    outputSchema: z.object({ success: z.boolean() }),
  },
  
  'list_files': {
    name: 'list_files',
    description: 'List files in a directory',
    category: 'file',
    requiredPermissions: ['read'],
    needsApproval: false,
    hasSideEffects: false,
    inputSchema: z.object({ path: z.string().optional() }),
    outputSchema: z.array(z.object({ name: z.string(), isDirectory: z.boolean() })),
  },
  
  'search_rag': {
    name: 'search_rag',
    description: 'Search project knowledge base',
    category: 'rag',
    requiredPermissions: ['read'],
    needsApproval: false,
    hasSideEffects: false,
    inputSchema: z.object({ query: z.string(), limit: z.number().optional() }),
    outputSchema: z.array(z.object({ content: z.string(), score: z.number() })),
  },
  
  'run_command': {
    name: 'run_command',
    description: 'Execute terminal command',
    category: 'terminal',
    requiredPermissions: ['execute'],
    needsApproval: true,
    hasSideEffects: true,  // Commands may create/modify files
    inputSchema: z.object({ command: z.string(), cwd: z.string().optional() }),
    outputSchema: z.object({ stdout: z.string(), stderr: z.string(), exitCode: z.number() }),
  },
};
```

---

## Migration Strategy

### Phase D Implementation Steps

1. **Add Zod schemas** (additive)
   ```typescript
   // Add to thread.schema.ts
   export const MessagePartSchema = z.discriminatedUnion('type', [
     z.object({ type: z.literal('text'), content: z.string() }),
     z.object({ type: z.literal('code'), language: z.string(), content: z.string(), filename: z.string().optional() }),
     // ... other part types
   ]);
   
   export const EnhancedToolCallSchema = z.object({
     id: z.string().uuid(),
     toolName: z.string(),
     args: z.record(z.unknown()),
     status: z.enum(['pending', 'approved', 'rejected', 'running', 'completed', 'failed']),
     requestedAt: z.number(),
     approvedAt: z.number().optional(),
     approvedBy: z.enum(['user', 'auto']).optional(),
     rejectionReason: z.string().optional(),
   });
   
   export const ToolResultSchema = z.object({
     callId: z.string().uuid(),
     output: z.unknown(),
     error: z.string().optional(),
     executedAt: z.number(),
     durationMs: z.number(),
     sideEffects: z.object({
       createdFiles: z.array(z.string()).optional(),
       modifiedFiles: z.array(z.string()).optional(),
       deletedFiles: z.array(z.string()).optional(),
     }).optional(),
   });
   ```

2. **Add `parts` field to ThreadMessageSchema** (optional, alongside content)
   ```typescript
   export const ThreadMessageSchema = z.object({
     id: z.string().uuid(),
     role: z.enum(['user', 'assistant', 'system', 'tool']),
     content: z.string().optional(),  // Kept for backward compat
     parts: z.array(MessagePartSchema).optional(),  // NEW
     timestamp: z.number(),
     // ...
   });
   ```

3. **Create helper functions**
   ```typescript
   // Get message content, preferring parts
   function getMessageContent(message: ThreadMessage): string {
     if (message.parts) {
       return message.parts
         .filter(p => p.type === 'text')
         .map(p => p.content)
         .join('\n');
     }
     return message.content ?? '';
   }
   
   // Create message with parts
   function createAssistantMessage(parts: MessagePart[]): ThreadMessage {
     return {
       id: crypto.randomUUID(),
       role: 'assistant',
       parts,
       timestamp: Date.now(),
     };
   }
   ```

4. **Update ThreadService** to write `parts`

5. **Update ChatPanel UI** to render by part type

6. **Create TOOL_REGISTRY** in `@/domain/tools/tool-registry.ts`

7. **No database migration needed** — new field is optional

---

## UI Rendering Guidance

```tsx
// ChatMessage.tsx (Phase D)

function ChatMessage({ message }: { message: ThreadMessage }) {
  // Prefer parts, fall back to content
  if (message.parts) {
    return (
      <div className="message">
        {message.parts.map((part, i) => (
          <MessagePartRenderer key={i} part={part} />
        ))}
      </div>
    );
  }
  
  // Legacy: plain content string
  return <Markdown>{message.content}</Markdown>;
}

function MessagePartRenderer({ part }: { part: MessagePart }) {
  switch (part.type) {
    case 'text':
      return <Markdown>{part.content}</Markdown>;
    case 'code':
      return <CodeBlock language={part.language} filename={part.filename}>{part.content}</CodeBlock>;
    case 'artifact':
      return <ArtifactPreview id={part.id} title={part.title} content={part.content} />;
    case 'thinking':
      return <ThinkingBlock isCollapsed={part.isCollapsed}>{part.content}</ThinkingBlock>;
    case 'tool_call':
      return <ToolCallCard toolCall={part.toolCall} />;
    case 'tool_result':
      return <ToolResultCard toolResult={part.toolResult} />;
    case 'image':
      return <img src={part.url} alt={part.alt} />;
    case 'error':
      return <ErrorMessage code={part.code}>{part.message}</ErrorMessage>;
    default:
      return null;
  }
}
```

---

## What This Enables

| Capability | V1 (current) | V2 (this design) |
|------------|--------------|------------------|
| Plain text responses | Yes | Yes |
| Code blocks with syntax | Parse from markdown | First-class `code` part |
| Artifacts | Not supported | `artifact` part with preview |
| AI thinking | Not shown | `thinking` part, collapsible |
| Tool calls in message | Basic array | Structured with approval |
| Tool results | Embedded in toolCall | Separate `tool_result` part |
| File side effects | Not tracked | `sideEffects` in ToolResult |
| User approval workflow | Not supported | `approvedBy`, `approvedAt` |
| RAG on specific parts | Index whole message | Index by part type |

---

## References

- SOURCE-OF-TRUTH.md Part 3.3 (ThreadMessage schema)
- SOURCE-OF-TRUTH.md Part 3.4 (AI Tools Schema)
- TanStack AI SDK message format
- Claude/GPT streaming response structures

---

*Design document created: 2026-02-01*
*Implements in: Phase D (Agentic Features)*
*Do NOT modify thread.schema.ts until Phase D planning*
