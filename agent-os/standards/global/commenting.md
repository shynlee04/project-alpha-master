---
date: '2025-12-31'
time: '03:20:00'
phase: 'Implementation'
team: 'Team-A'
agent_mode: 'bmad-core-bmad-master'
---

# Code Commenting Standards

_Standards for writing effective, maintainable code comments in the Via-gent project. All comments must be in English with professional tone, following the project's 8-bit gaming aesthetic and technical precision._

---

## 1. Comment Philosophy

### 1.1 Core Principles

| Principle | Description | Example |
|-----------|-------------|---------|
| **Explain Why, Not What** | Comments should explain intent, not repeat code | ❌ `// Increment counter` → ✅ `// Prevent race condition by serializing file operations` |
| **Document Complexity** | Comment non-obvious logic, algorithms, or workarounds | Complex sync logic, async race conditions |
| **Maintain Narrative** | Comments should tell a story about the code's purpose | Flow of data, state transitions, business rules |
| **Temporal Relevance** | Document historical decisions and future intentions | `// TODO: Remove when WebContainer adds native support` |

### 1.2 When to Comment

```typescript
// ✅ REQUIRED: Complex algorithms or non-obvious logic
/**
 * Implements optimistic UI update pattern for file operations.
 * The UI is immediately updated while sync happens in background.
 * If sync fails, the state is rolled back and user is notified.
 * This pattern reduces perceived latency by ~200ms for user actions.
 */
async function updateFileOptimistically(path: string, content: string) {
  // ...
}

// ✅ REQUIRED: Business rules and constraints
// Only allow file operations within project root to prevent escape
// via paths like "../../../etc/passwd"
const sanitizePath = (path: string) => {
  // ...
};

// ✅ REQUIRED: Known limitations or known issues
// WebContainer does not support symlinks on Windows
// Fallback: Copy file content instead of creating symlink
if (platform === 'windows' && operation === 'symlink') {
  // ...
}

// ✅ REQUIRED: Configuration that requires explanation
// Use batch size of 10 to balance memory vs performance
// Too small: excessive async overhead
// Too large: memory pressure on browser
const BATCH_SIZE = 10;

// ✅ REQUIRED: Workarounds for external issues
// TanStack AI 0.2.0 has a race condition in stream processing
// Issue: https://github.com/TanStack/ai/issues/1234
// Workaround: Add delay before consuming stream
await delay(100);
```

### 1.3 When NOT to Comment

```typescript
// ❌ FORBIDDEN: Self-explanatory code
const addOne = (x: number) => x + 1;  // Add one to x

// ❌ FORBIDDEN: Commented-out code
// const oldCode = () => { ... }

// ❌ FORBIDDEN: Obvious variable names
const count = 5;  // Count is 5

// ❌ FORBIDDEN: TODOs without description
// TODO:
// TODO: Fix this
// ✅ Required: TODO with JIRA ticket and description
// TODO(EPIC-22): Investigate memory leak in file sync - Ticket #1234

// ❌ FORBIDDEN: Comments that contradict code
// This should never happen (but it does, hence the bug report)
```

---

## 2. Comment Types and Styles

### 2.1 Block Comments (Multi-line)

```typescript
/**
 * Component or function description for public APIs.
 * Use for exported functions, classes, and complex utilities.
 * Follows JSDoc format for documentation generation.
 * 
 * @param paramName - Description of parameter
 * @returns Description of return value
 * @throws Description of possible exceptions
 * @example Usage example
 * 
 * @see Reference to related code or documentation
 */
```

**Usage Examples:**

```typescript
/**
 * Creates a synchronized file operation queue that ensures
 * all file operations are processed in order, even when
 * multiple agents attempt concurrent modifications.
 * 
 * @param directoryHandle - FSA directory handle for the project
 * @param options - Configuration for sync behavior
 * @returns Configured sync queue instance
 * 
 * @throws {PermissionDeniedError} When FSA permission is revoked
 * @throws {SyncError} When file cannot be synchronized
 * 
 * @example
 * ```typescript
 * const queue = await createSyncQueue(handle, { 
 *   maxRetries: 3,
 *   timeout: 5000 
 * });
 * ```
 * 
 * @see SyncManager for high-level sync operations
 * @see https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API
 */
export async function createSyncQueue(
  directoryHandle: FileSystemDirectoryHandle,
  options?: SyncQueueOptions
): Promise<SyncQueue> {
  // Implementation
}
```

### 2.2 Single-line Comments (Inline)

```typescript
// Section divider for organization
// ----------------------------------------------------------------

// Warning about edge cases or side effects
// ⚠️ CRITICAL: WebContainer must be booted before file operations

// Temporary workaround indicator
// FIXME: Remove when WebContainer fixes the race condition
// Ticket: https://github.com/stackblitz/webcontainer/issues/XXXX

// Enhancement suggestion
// TODO(EPIC-24): Consider using IndexedDB for larger files

// Explanation of counter-intuitive logic
// Use reverse iteration for safe removal while iterating
```

### 2.3 Inline Comments (Trailing)

```typescript
// Use sparingly - prefer block comments for documentation

const fileSize = calculateSize(bytes); // Convert bytes to human-readable

// Complex expressions - explain the formula
const similarity = (matchingChunks / totalChunks) * 100; // Jaccard similarity index

// Conditional logic - explain the condition
if (!isMobile && !isTablet) { // Desktop-only features
  // ...
}
```

---

## 3. Language-Specific Commenting

### 3.1 TypeScript/JavaScript

```typescript
/**
 * Type definition for a file synchronization operation.
 * Includes metadata for rollback and conflict resolution.
 */
interface SyncOperation {
  /** Unique identifier for the operation */
  id: string;
  
  /** Relative path from project root */
  path: string;
  
  /** Type of operation: create, update, delete */
  type: 'create' | 'update' | 'delete';
  
  /** Previous content for rollback (if applicable) */
  previousContent?: string;
  
  /** Current content to sync */
  content?: string;
  
  /** Timestamp when operation was queued */
  queuedAt: number;
  
  /** User or agent who initiated the operation */
  initiator: 'user' | string; // string = agent ID
}

// ----------------------------------------------------------------
// State Management Comments
// ----------------------------------------------------------------

/**
 * Zustand store for IDE state with Dexie persistence.
 * 
 * State Architecture (P1.10 Audit):
 * - Persisted: openFiles, activeFile, panels (IndexedDB)
 * - Ephemeral: panel sizes, scroll positions (in-memory)
 * - UI State: handled by React Context
 * 
 * @see useIDEStore for React integration
 * @see dexie-storage.ts for persistence layer
 */
interface IDEState {
  // State (nouns)
  openFiles: string[];
  activeFile: string | null;
  panels: Panel[];
  
  // Actions (verbs)
  setActiveFile: (path: string) => void;
  addOpenFile: (path: string) => void;
  closeFile: (path: string) => void;
}
```

### 3.2 React Components

```typescript
/**
 * Chat conversation panel with streaming responses.
 * 
 * Architecture:
 * - Uses TanStack AI for streaming responses
 * - Integrates with Agent Tools for file operations
 * - Maintains conversation history in IndexedDB
 * 
 * State Dependencies:
 * - useConversationStore: Message history
 * - useAgentSelectionStore: Active agent
 * - useIDEStore: Open files (for context)
 * 
 * @example
 * ```tsx
 * <ChatPanel 
 *   agentId="file-agent"
 *   onToolApproval={handleApproval}
 * />
 * ```
 */
export function ChatPanel({
  agentId,
  onToolApproval,
}: ChatPanelProps) {
  // Hook comments - explain why this hook is used
  const { messages, sendMessage } = useConversationStore();
  
  // Handle concurrent file modifications
  // Only allow one agent to modify at a time
  const [fileLock, setFileLock] = useState<FileLock | null>(null);
  
  // Render comments - explain conditional rendering
  if (!agentId) {
    return <EmptyState message={t('chat.selectAgent')} />;
  }
  
  // Event handler comments
  // Debounce auto-save to reduce disk I/O
  const handleContentChange = useCallback(
    debounce((content: string) => {
      saveToHistory(content);
    }, 1000),
    []
  );
  
  return (
    <div className="chat-panel">
      {/* Message list - virtualized for performance */}
      <MessageList messages={messages} />
      
      {/* Input area with auto-complete */}
      <MessageInput 
        onSubmit={sendMessage}
        autoComplete={agentConfig.autocomplete}
      />
    </div>
  );
}
```

### 3.3 CSS and Styling

```css
/* Design Tokens - 8-bit Gaming Theme */
/* ---------------------------------------------------------------- */

/* Primary colors - neon palette for dark mode */
:root {
  /* Brand colors */
  --color-primary: #00ff88;
  --color-secondary: #00d4ff;
  --color-accent: #ff00ff;
  
  /* Background layers (dark theme) */
  --bg-surface: #1a1a2e;
  --bg-elevated: #16213e;
  --bg-modal: #0f0f1a;
  
  /* Typography */
  --font-mono: 'JetBrains Mono', monospace;
  --font-ui: 'Inter', system-ui, sans-serif;
}

/* Component styles with design tokens */
/* ---------------------------------------------------------------- */

/* Button variants - matches cva configuration */
.btn {
  /* Base styles - shared across variants */
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  
  /* 8-bit aesthetic - pixel-perfect borders */
  border: 2px solid transparent;
  box-shadow: 
    inset 0 0 0 1px rgba(255, 255, 255, 0.1),
    0 2px 0 rgba(0, 0, 0, 0.5);
  
  /* Animation - smooth transitions */
  transition: all 0.2s ease;
}

.btn-primary {
  /* Primary brand color */
  background: var(--color-primary);
  color: var(--bg-surface);
  
  /* 8-bit hover effect */
  &:hover {
    box-shadow: 
      inset 0 0 0 1px rgba(255, 255, 255, 0.2),
      0 0 12px var(--color-primary);
  }
}
```

---

## 4. Special Comment Patterns

### 4.1 Architecture Decision Records (ADRs)

```typescript
/**
 * ADR-001: Zustand for State Management
 * 
 * Decision: Use Zustand with Dexie persistence middleware
 * 
 * Context:
 * - Need reactive state management across components
 * - Must persist IDE state across sessions
 * - WebContainer context limits complexity
 * 
 * Consequences:
 * + Simple, minimal API
 * + Excellent TypeScript support
 * + Middleware pattern for persistence
 * - No built-in undo/redo (added via middleware)
 * 
 * @see https://zustand.docs.pmnd.rs
 * @see dexie-storage.ts for persistence implementation
 * @related P1.10 State Management Audit
 */
```

### 4.2 Bug References

```typescript
/**
 * WebContainer boot timeout workaround
 * 
 * WebContainer sometimes fails to boot on first attempt,
 * especially in Firefox due to SharedArrayBuffer restrictions.
 * 
 * Issue: https://github.com/stackblitz/webcontainer/issues/567
 * Workaround: Retry with exponential backoff
 * Status: Monitor - may be fixed in WebContainer 2.0
 */
async function bootWithRetry(
  maxAttempts: number = 3
): Promise<WebContainer> {
  let attempt = 0;
  while (attempt < maxAttempts) {
    try {
      return await webcontainer.boot();
    } catch (error) {
      attempt++;
      if (attempt === maxAttempts) throw error;
      
      // Exponential backoff: 500ms, 1500ms, 4500ms
      await delay(500 * Math.pow(3, attempt - 1));
    }
  }
  throw new Error('Failed to boot WebContainer');
}
```

### 4.3 TODO Comments (with Tracking)

```typescript
// TODO(EPIC-24-2): Optimize file sync for large directories
// Ticket: https://jira.project/EPIC-24-2
// Estimate: 2 days
// Blocked by: FSA handle persistence (24-1)
// Priority: High
// 

// TODO(FUTURE): Implement WebContainer file watching
// Currently polling every 500ms
// WebContainer doesn't emit file change events yet
// Track: https://github.com/stackblitz/webcontainer/issues/123

// TODO(HACK): Temporary workaround for Monaco editor
// Monaco loses focus on file switch
// Fix: Manually refocus after animation
// Remove when Monaco 0.56 is released
```

---

## 5. i18n Integration

### 5.1 Translation Comments

```typescript
// All user-facing strings must use i18n
// Comments for translators follow this pattern:

/**
 * Chat input placeholder
 * @translation Context: User is typing a message to the AI agent
 * @translation Note: Keep concise, max 50 characters
 */
const { t } = useTranslation();
<input placeholder={t('chat.input.placeholder')} />;

/**
 * Error message for file sync failures
 * @translation Context: User attempted to save a file
 * @translation Note: Use friendly tone, avoid technical jargon
 */
toast.error(t('error.sync.saveFailed'));

// Translation keys must be descriptive
// Bad: t('e1')
// Good: t('error.fileSync.permissionDenied')
```

### 5.2 Vietnamese Localization Notes

```typescript
/**
 * Vietnamese language support
 * 
 * Special considerations:
 * - Diacritics: Cần normalization for search
 * - Date format: DD/MM/YYYY (not MM/DD/YYYY)
 * - Currency: VND symbol (₫) or "VNĐ"
 * - RTL: Not required (Vietnamese is LTR)
 * 
 * @see src/i18n/vi.json for translation keys
 */
```

---

## 6. Performance Comments

### 6.1 Optimization Rationale

```typescript
/**
 * Debounced file save - prevents excessive I/O
 * 
 * Performance considerations:
 * - WebContainer file writes are expensive (~50ms each)
 * - User typing can trigger 10+ changes per second
 * - Debouncing reduces writes to ~1-2 per second
 * 
 * Implementation:
 * - Uses requestAnimationFrame for UI responsiveness
 * - Cancels pending save on component unmount
 * - Saves last value on cancel to prevent data loss
 */
const useDebouncedSave = (content: string, path: string) => {
  // Implementation
};

/**
 * Memoized selector for expensive computations
 * 
 * Without memoization:
 * - Re-renders on every store change
 * - Expensive operations (100+ms) on each render
 * 
 * With useShallow:
 * - Only re-renders when selected state changes
 * - Computed values cached between renders
 */
const { fileTree } = useIDEStore(
  useShallow((state) => ({
    fileTree: state.fileTree,
  }))
);
```

---

## 7. Comment Quality Checklist

Before committing code, verify:

- [ ] All exported functions have JSDoc comments
- [ ] Complex logic has explanatory comments
- [ ] No commented-out code remains
- [ ] TODOs have ticket references and descriptions
- [ ] All user-facing strings use `t()` with translation keys
- [ ] Comments explain WHY, not WHAT
- [ ] Comments are up-to-date with code changes
- [ ] No obvious statements (e.g., `// Loop through array`)
- [ ] Bug workarounds reference tickets
- [ ] Performance optimizations explain the trade-offs

---

## 8. Examples by File Type

### 8.1 Store Files

```typescript
/**
 * Provider configuration store
 * 
 * Manages LLM provider credentials and model settings.
 * Credentials are encrypted using Web Crypto API
 * and stored in IndexedDB for persistence.
 * 
 * @see CredentialVault for encryption layer
 * @see ProviderConfigDialog for UI
 */
export const useProviderStore = create<ProviderStoreState>()(
  persist(
    (set, get) => ({
      providers: [],
      activeProvider: null,
      
      addProvider: (config: ProviderConfig) => {
        // Validate before storing
        const validated = validateProviderConfig(config);
        set((state) => ({
          providers: [...state.providers, validated],
        }));
      },
      
      // ... other actions
    }),
    {
      name: 'provider-storage',
      storage: createDexieStorage('providers'),
      partialize: (state) => ({
        // Only persist config, exclude sensitive data
        providers: state.providers.map(p => sanitizeForPersist(p)),
        activeProvider: state.activeProvider,
      }),
    }
  )
);
```

### 8.2 API Routes

```typescript
/**
 * Chat API endpoint - handles AI agent conversations
 * 
 * Request flow:
 * 1. Validate request (Zod schema)
 * 2. Get credentials from CredentialVault
 * 3. Stream response from LLM provider
 * 4. Return SSE stream to client
 * 
 * @route POST /api/chat
 * @body { agentId: string, messages: Message[], options?: ChatOptions }
 * @returns Server-Sent Events stream
 * 
 * @throws {401} Invalid or missing credentials
 * @throws {400} Invalid request format
 * @throws {500} Provider API error
 * 
 * @see src/lib/agent/providers/provider-adapter.ts
 * @see https://tanstack.com/ai/latest/docs/api/functions/create-chat-api
 */
export async function handleChat(
  request: Request
): Promise<Response> {
  // Request validation
  const body = await request.json();
  const { success, data } = chatRequestSchema.safeParse(body);
  
  if (!success) {
    return new Response(
      JSON.stringify({ error: 'Invalid request format' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  // Get provider and stream response
  const provider = providerAdapterFactory.createAdapter(data.agentId);
  const stream = await provider.chat(data.messages, data.options);
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

### 8.3 Test Files

```typescript
/**
 * SyncManager unit tests
 * 
 * Test coverage:
 * - File operations (create, read, update, delete)
 * - Conflict resolution
 * - Error handling and recovery
 * - Permission lifecycle
 * 
 * Mock dependencies:
 * - WebContainer: @webcontainer/api mock
 * - LocalFS: FSA API mock
 * - Dexie: IndexedDB mock (fake-indexeddb)
 * 
 * @see sync-manager.test.ts for integration tests
 */
describe('SyncManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset IndexedDB
    indexedDB.reset();
  });
  
  it('should sync file to WebContainer after local write', async () => {
    // Test setup
    // Execute operation
    // Verify results
  });
  
  it('should handle concurrent file modifications', async () => {
    // Race condition test
    // Verify serialization
  });
});
```

---

## Related Documents

- [`coding-style.md`](coding-style.md): Coding conventions
- [`error-handling.md`](error-handling.md): Error patterns and handling
- [`validation.md`](validation.md): Data validation standards
- [`tech-stack.md`](tech-stack.md): Technology stack reference
- [AGENTS.md](../../../../AGENTS.md): Project development patterns
- [`.agent/rules/general-rules.md`](../../../.agent/rules/general-rules.md): AI agent rules

---

*Last updated: 2025-12-31*
*Maintained by: @bmad-core-bmad-master*
*Next review: 2026-01-15