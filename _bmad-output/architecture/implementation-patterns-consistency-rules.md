# Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**12 critical conflict points** identified where AI agents could make different choices.

### Naming Patterns

**Database/Schema Naming:**
```typescript
// IndexedDB stores: camelCase
const stores = {
  projects: 'projects',
  conversations: 'conversations',
  toolResults: 'toolResults'
};

// Object keys: camelCase
interface Project {
  projectId: string;
  folderPath: string;
  lastOpened: Date;
}
```

**API Naming Conventions:**
```typescript
// API routes: kebab-case path, camelCase params
// /api/chat (POST)
// Search params: camelCase
// ?projectId=xxx&file=src/index.ts
```

**Code Naming Conventions:**
```typescript
// Components: PascalCase file and export
// MonacoEditor.tsx → export function MonacoEditor
// Hooks: camelCase with 'use' prefix
// useAgentChat.ts → export function useAgentChat
// Utilities: camelCase
// sync-manager.ts → export function syncToWebContainer
// Stores: camelCase with 'Store' suffix
// ideStore.ts → export const ideStore
```

### Structure Patterns

**Project Organization:**
```
src/
├── routes/              # TanStack Router file-based routes
├── components/
│   ├── ui/              # Shadcn/ui components
│   ├── ide/             # IDE-specific components
│   └── layout/          # Layout components
├── lib/
│   ├── webcontainer/    # WebContainers integration
│   ├── filesystem/      # FSA + sync logic
│   ├── git/             # isomorphic-git operations
│   ├── persistence/     # IndexedDB + idb
│   └── agent/           # TanStack AI tools
├── stores/              # TanStack Store definitions
└── types/               # Shared TypeScript types
```

**Test Organization:**
```
tests/
├── unit/                # Unit tests co-located or here
├── integration/         # Integration tests
└── e2e/                 # End-to-end tests
```

### Format Patterns

**API Response Formats:**
```typescript
// AI streaming uses TanStack AI format (SSE)
// Tool results:
interface ToolResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}
```

**Date Formats:**
```typescript
// Stored: ISO 8601 strings
// Display: Relative (via date-fns)
const stored = new Date().toISOString(); // "2025-12-10T18:00:00.000Z"
```

### Communication Patterns

**Event Naming:**
```typescript
// Domain events: past tense, descriptive
type IDEEvent = 
  | { type: 'file.opened'; path: string }
  | { type: 'file.saved'; path: string }
  | { type: 'command.executed'; command: string; exitCode: number }
  | { type: 'git.committed'; hash: string };
```

**State Updates:**
```typescript
// Immutable updates via TanStack Store
ideStore.setState((prev) => ({
  ...prev,
  openFiles: [...prev.openFiles, newFile]
}));
```

### Process Patterns

**Error Handling:**
```typescript
// All async operations wrapped in try-catch
// User-facing errors: toast notification
// Technical errors: console + optional error boundary
try {
  await syncToWebContainer(handle);
} catch (error) {
  if (error instanceof PermissionDeniedError) {
    toast.error('Permission required', { 
      description: 'Please grant folder access to continue.'
    });
  } else {
    console.error('Sync failed:', error);
    toast.error('Sync failed', { 
      description: 'Unable to sync files. Please try again.'
    });
  }
}
```

**Loading States:**
```typescript
// Consistent loading state naming
interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

// Use TanStack Query for async operations
const { data, isLoading, error } = useQuery({
  queryKey: ['project', projectId],
  queryFn: () => loadProject(projectId)
});
```

### Enforcement Guidelines

**All AI Agents MUST:**
- Follow the naming conventions exactly as documented
- Use the project structure defined in this architecture
- Implement error handling patterns consistently
- Use TanStack Store for state management, not local React state for cross-component data

---
