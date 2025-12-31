---
date: '2025-12-31'
time: '03:25:00'
phase: 'Implementation'
team: 'Team-A'
agent_mode: 'bmad-core-bmad-master'
---

# Project Conventions

_Conventions and patterns specific to the Via-gent project. This document complements the global coding standards with project-specific rules, architectural patterns, and established practices._

---

## 1. Naming Conventions

### 1.1 File and Directory Names

| Element | Convention | Example |
|---------|------------|---------|
| React Components | PascalCase.tsx | `ChatPanel.tsx`, `AgentConfigDialog.tsx` |
| Hooks | use*.ts | `useAgentChat.ts`, `useResponsive.ts` |
| Utilities | camelCase.ts | `path-utils.ts`, `file-ops.ts` |
| Stores | camelCase.ts | `ide-store.ts`, `provider-store.ts` |
| Types | PascalCase.ts | `IDEState.ts`, `SyncOperation.ts` |
| Constants | UPPER_SNAKE_CASE | `MAX_FILE_SIZE`, `DEFAULT_TIMEOUT` |
| Component Directories | kebab-case | `chat-panel/`, `file-tree/` |
| Feature Directories | kebab-case | `agent-tools/`, `webcontainer/` |

### 1.2 Barrel Export Pattern

All feature directories MUST have `index.ts` barrel exports:

```typescript
// src/components/chat/index.ts
export { ChatPanel } from './ChatPanel';
export { ChatConversation } from './ChatConversation';
export { AgentSelector } from './AgentSelector';
export type { ChatPanelProps } from './ChatPanel';
export type { ChatMessage } from './types';

// src/lib/agent/tools/index.ts
export { readFileTool } from './read-file-tool';
export { writeFileTool } from './write-file-tool';
export { listFilesTool } from './list-files-tool';
export { executeCommandTool } from './execute-command-tool';
export type { ToolResult } from './tool-types';
```

### 1.3 Store Naming

Zustand stores follow a specific pattern:

```typescript
// Use "use" prefix for store hooks
export const useIDEStore = create<IDEState>()(/* ... */);
export const useProviderStore = create<ProviderState>()(/* ... */);

// Legacy stores (migrate to lib/state/)
export const useAgentsStore = create<AgentsState>()(
  persist(/* ... */, { name: 'agents-storage' })
);
```

### 1.4 Event and Action Naming

```typescript
// State actions - set{Property} pattern
const setActiveFile = (file: string) => set({ activeFile: file });
const addOpenFile = (file: string) => set((state) => ({
  openFiles: [...state.openFiles, file],
}));
const removeOpenFile = (file: string) => set((state) => ({
  openFiles: state.openFiles.filter((f) => f !== file),
}));

// Toggle actions - toggle{Prop} pattern
const toggleChatVisible = () => set((state) => ({
  isChatVisible: !state.isChatVisible,
}));

// Async actions - load{X}Async pattern
const loadProjectAsync = async (id: string) => {
  const project = await db.projects.get(id);
  set({ activeProject: project });
};
```

---

## 2. State Management Conventions

### 2.1 State Architecture (P1.10 Audit)

The project uses a layered state architecture:

```typescript
/**
 * State Architecture Overview:
 * 
 * 1. Persisted State (IndexedDB via Dexie)
 *    - useIDEStore: openFiles, activeFile, panels
 *    - useConversationStore: messages, threads
 *    - useKnowledgeStore: documents, sources
 * 
 * 2. Ephemeral State (in-memory)
 *    - useStatusBarStore: cursor, sync status
 *    - useNavigationStore: command palette, search
 *    - useFileSyncStatusStore: sync progress, errors
 * 
 * 3. Agent State (localStorage)
 *    - useAgentsStore: agent configurations
 *    - useAgentSelectionStore: selected agent
 * 
 * 4. UI State (React Context)
 *    - WorkspaceContext: workspace handles
 *    - ThemeContext: theme mode
 */
```

### 2.2 Zustand Store Pattern

All Zustand stores MUST follow this pattern:

```typescript
interface StoreNameState {
  // State properties (nouns)
  property: Type;
  
  // Actions (verbs)
  setProperty: (value: Type) => void;
  addItem: (item: Item) => void;
  removeItem: (id: string) => void;
  loadAsync: (id: string) => Promise<void>;
}

export const useStoreNameStore = create<StoreNameState>()(
  persist(
    (set, get) => ({
      // Initial state
      property: defaultValue,
      
      // Actions
      setProperty: (value) => set({ property: value }),
      
      addItem: (item) => set((state) => ({
        items: [...state.items, item],
      })),
      
      removeItem: (id) => set((state) => ({
        items: state.items.filter((i) => i.id !== id),
      })),
      
      loadAsync: async (id) => {
        const data = await db.table.get(id);
        set({ data });
      },
    }),
    {
      name: 'store-name-storage',
      storage: createDexieStorage('tableName'),
      partialize: (state) => ({
        // Only persist selected properties
        property: state.property,
      }),
    }
  )
);
```

### 2.3 Selectors with useShallow

```typescript
// ✅ REQUIRED: Always use useShallow for multi-property selectors
const { activeFile, setActiveFile } = useIDEStore(
  useShallow((s) => ({
    activeFile: s.activeFile,
    setActiveFile: s.setActiveFile,
  }))
);

// ❌ WRONG: Selecting entire store causes excessive re-renders
const store = useIDEStore();

// ✅ OK: Single property
const isChatVisible = useIDEStore((s) => s.isChatVisible);
```

---

## 3. Component Conventions

### 3.1 Component Structure

```typescript
/**
 * Standard Component Structure:
 * 
 * 1. Imports (React, third-party, @/, relative)
 * 2. Types/Interfaces
 * 3. Constants/Config
 * 4. Helper functions
 * 5. Main component
 * 6. Sub-components (if any)
 * 7. Barrel export
 */

// Component file template
import { useState, useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { Button } from '@/components/ui';
import { useIDEStore } from '@/lib/state/ide-store';
import { useTranslation } from 'react-i18next';
import type { ComponentProps } from './types';
import styles from './Component.module.css';

interface ComponentProps {
  // Props interface
}

const Component = ({ prop1, prop2 }: ComponentProps) => {
  // Hooks
  const { t } = useTranslation();
  const { state, setState } = useStore(/* selector */);
  
  // Callbacks
  const handleClick = useCallback(() => {
    // Handler logic
  }, [dependency]);
  
  // Render
  return (
    <div className={styles.container}>
      {/* JSX */}
    </div>
  );
};

export { Component };
export type { ComponentProps };
```

### 3.2 Error Boundary Convention

All critical components MUST be wrapped with ErrorBoundary:

```typescript
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

<ErrorBoundary 
  fallback={<ErrorState message={t('error.componentFailed')} />}
  onError={(error, errorInfo) => {
    console.error('Component error:', error, errorInfo);
    // Optionally report to Sentry
  }}
>
  <ComponentThatMightFail />
</ErrorBoundary>
```

---

## 4. API and Data Fetching Conventions

### 4.1 API Route Pattern

All API routes follow TanStack Start pattern:

```typescript
import { createAPIHandler } from '@tanstack/start-api';
import { z } from 'zod';

// Validation schema
const RequestSchema = z.object({
  agentId: z.string(),
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string(),
  })),
});

export default createAPIHandler({
  POST: async ({ request }) => {
    // Parse and validate
    const body = await request.json();
    const { success, data } = RequestSchema.safeParse(body);
    
    if (!success) {
      return new Response(
        JSON.stringify({ error: 'Invalid request' }),
        { status: 400 }
      );
    }
    
    // Process
    const result = await processRequest(data);
    
    // Return
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
  },
});
```

### 4.2 Dexie Table Naming

```typescript
/**
 * Dexie Table Conventions:
 * - Table names: camelCase, plural
 * - Indexes: Define on primary and frequently queried fields
 * - Schema changes: Only additive migrations
 */

class ViaGentDB extends Dexie {
  agents!: Table<Agent>;          // ✅ CORRECT
  projects!: Table<Project>;      // ✅ CORRECT
  
  constructor() {
    super('via-gent-db');
    
    this.version(9).stores({
      agents: '++id, name, provider',
      projects: '++id, name, createdAt, lastOpened',
      conversations: '++id, agentId, createdAt',
      fileMetadata: 'path, lastModified, [path+lastModified]',
      toolExecutionLogs: 'id, conversationId, toolName, timestamp',
    });
  }
}
```

---

## 5. Git and Version Control

### 5.1 Commit Message Format

All commits MUST follow the format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting, no code change
- `refactor`: Code restructuring
- `perf`: Performance improvement
- `test`: Adding/missing tests
- `chore`: Maintenance

**Scopes:**
- `ide`: IDE components
- `agent`: Agent system
- `chat`: Chat interface
- `store`: State management
- `sync`: File sync
- `ui`: UI components
- `docs`: Documentation
- `epic-XX`: Reference epic number

**Examples:**

```
feat(agent): add file locking for concurrent operations

- Implements FileLock class to serialize concurrent file operations
- Prevents race conditions when multiple agents modify same file

Fixes #123
Refs EPIC-22

refactor(store): migrate useIDEStore to useShallow selectors

- Reduces unnecessary re-renders by 60%
- Follows best practices from P1.10 state audit

BREAKING CHANGE: Store interface updated
```

### 5.2 Branch Strategy

```bash
# Feature branches (created after epic completion)
feature/EPIC-XX-description

# Bug fixes
fix/EPIC-XX-story-YY-brief-description

# Hotfixes (from main)
hotfix/critical-issue-description
```

---

## 6. Internationalization (i18n) Conventions

### 6.1 Translation Key Structure

```typescript
/**
 * Translation Key Convention:
 * 
 * {component}.{section}.{element}.{modifier}
 * 
 * Examples:
 * - chat.input.placeholder
 * - error.fileSync.permissionDenied
 * - common.button.save
 * - terminal.status.connected
 */
```

### 6.2 Vietnamese Localization Notes

```typescript
/**
 * Vietnamese (vi) Localization Guidelines:
 * 
 * 1. Date format: DD/MM/YYYY (not MM/DD/YYYY)
 * 2. Time format: 24-hour (not AM/PM)
 * 3. Number format: 1.234,56 (dot for decimals)
 * 4. Currency: 1.234.567 ₫
 * 5. Diacritics: Keep original Vietnamese diacritics
 *    - "Xin chào" not "Xin chao"
 * 
 * @see src/i18n/vi.json
 * @see src/lib/utils/locale-formatter.ts
 */
```

---

## 7. Error Handling Conventions

### 7.1 Custom Error Classes

```typescript
/**
 * Custom Error Classes:
 * - SyncError: File synchronization failures
 * - PermissionDeniedError: FSA permission issues
 * - ToolExecutionError: Agent tool failures
 * - ValidationError: Input validation failures
 */

class SyncError extends Error {
  constructor(
    message: string,
    public path: string,
    public code: string,
    public recoverable: boolean = false
  ) {
    super(message);
    this.name = 'SyncError';
  }
}

// Usage
try {
  await syncFile(path);
} catch (error) {
  if (error instanceof SyncError) {
    // Handle sync error
    console.error(`Sync failed for ${error.path}: ${error.message}`);
    if (error.recoverable) {
      await retrySync(error.path);
    }
  }
}
```

### 7.2 Error Severity Levels

```typescript
/**
 * Error Severity Levels (L1-L5):
 * 
 * L1 (Critical): Application unusable, requires immediate fix
 * L2 (High): Major feature broken, workarounds exist
 * L3 (Medium): Feature impaired, minor impact
 * L4 (Low): Minor issue, low priority fix
 * L5 (Info): Informational, no action required
 */
```

---

## 8. Testing Conventions

### 8.1 Test File Organization

```typescript
/**
 * Test Organization:
 * 
 * - Unit tests: *.test.ts(x) adjacent to source
 * - Integration tests: __tests__/ directory
 * - Test utilities: __tests__/setup.ts, mocks.ts
 */

// Example test structure
src/
├── lib/
│   └── utils/
│       ├── error-handling.ts
│       └── __tests__/
│           ├── error-handling.test.ts
│           └── setup.ts
```

### 8.2 Mock Patterns

```typescript
/**
 * Required Mocks:
 * 
 * - WebContainer: @webcontainer/api mock
 * - File System: showDirectoryPicker mock
 * - IndexedDB: fake-indexeddb
 * - Zustand: vi.mock('zustand')
 * - TanStack AI: vi.mock('@tanstack/ai')
 */

// Example
import { vi } from 'vitest';
import '@testing-library/jest-dom';

beforeEach(() => {
  vi.clearAllMocks();
  
  // Mock WebContainer
  vi.mock('@webcontainer/api', () => ({
    WebContainer: vi.fn().mockImplementation(() => ({
      boot: vi.fn().mockResolvedValue({}),
      mount: vi.fn().mockResolvedValue(undefined),
    })),
  }));
  
  // Mock IndexedDB
  import('fake-indexeddb/auto');
});
```

---

## 9. Configuration Conventions

### 9.1 Environment Variables

```typescript
/**
 * Environment Variables:
 * 
 * - Public vars: VITE_* (exposed to client)
 * - Private vars: Server-side only (Cloudflare Workers)
 * 
 * @see .env.example for all variables
 */

interface EnvConfig {
  VITE_PUBLIC_APP_NAME: string;
  VITE_PUBLIC_APP_VERSION: string;
  // API keys are NOT stored in env - use Credential Vault
}
```

### 9.2 Feature Flags

```typescript
/**
 * Feature Flags (via query params or localStorage):
 * 
 * Use pattern: ?feature={name}
 * 
 * Enabled features:
 * - newChatUI: Use enhanced chat interface
 * - ragEnabled: Enable RAG features
 * - devTools: Show debug panel
 */

const isFeatureEnabled = (feature: string): boolean => {
  const params = new URLSearchParams(window.location.search);
  return params.get(`feature_${feature}`) === 'true' ||
         localStorage.getItem(`feature_${feature}`) === 'true';
};
```

---

## 10. Build and Deployment

### 10.1 Build Targets

```typescript
/**
 * Build Targets:
 * 
 * - cloudflare (default): Cloudflare Pages/Workers
 * - netlify: Netlify Edge Functions
 * - node: Node.js server (development only)
 * 
 * @see vite.config.ts for configuration
 */

import { defineConfig } from 'vite';
import crossOriginIsolation from 'vite-plugin-cross-origin-isolation';

export default defineConfig(({ mode }) => {
  const deployTarget = process.env.DEPLOY_TARGET || 'cloudflare';
  
  return {
    plugins: [
      // Cross-origin isolation MUST be first
      crossOriginIsolation(),
    ],
    define: {
      'import.meta.env.VITE_DEPLOY_TARGET': JSON.stringify(deployTarget),
    },
  };
});
```

### 10.2 Vite Configuration Order

```typescript
// vite.config.ts plugin order (critical):
export default defineConfig({
  plugins: [
    // 1. Cross-origin isolation (MUST be first)
    crossOriginIsolation(),
    
    // 2. Framework plugins
    react(),
    TanStackRouter({
      routeFileIgnorePrefix: 'routeTree.gen.ts',
    }),
    
    // 3. Styling
    tailwindcss(),
    
    // 4. TypeScript and paths
    tsconfigPaths(),
    
    // 5. Dev tools (not in production)
    ...(mode === 'development' ? [/* dev plugins */] : []),
  ],
});
```

---

## Related Documents

- [`coding-style.md`](coding-style.md): Coding conventions
- [`commenting.md`](commenting.md): Commenting standards
- [`error-handling.md`](error-handling.md): Error handling patterns
- [`validation.md`](validation.md): Data validation standards
- [`tech-stack.md`](tech-stack.md): Technology stack reference
- [AGENTS.md](../../../../AGENTS.md): Project development patterns
- [`project-context.md`](../../../_bmad-output/project-planning-artifacts/project-context.md): Project constraints

---

*Last updated: 2025-12-31*
*Maintained by: @bmad-core-bmad-master*
*Next review: 2026-01-15