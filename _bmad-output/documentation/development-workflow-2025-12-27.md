---
date: 2025-12-27
time: "19:45:00 UTC"
phase: Documentation
team: Documentation
agent_mode: documentation-writer
document_id: development-workflow-2025-12-27
version: 1.0.0
handoff:
  from: null
  to: null
  timestamp: 2025-12-27T19:45:00Z
---

# Development Workflow and Conventions

## Overview

This document describes development workflow, coding conventions, and best practices for the Via-gent project. It covers development commands, code style patterns, component organization, state management, file system operations, AI agent development, and BMAD framework integration.

## Table of Contents

- [Development Commands](#development-commands)
- [Code Style and Conventions](#code-style-and-conventions)
- [Component Organization Patterns](#component-organization-patterns)
- [State Management Patterns](#state-management-patterns)
- [File System Operations Workflow](#file-system-operations-workflow)
- [AI Agent Development Workflow](#ai-agent-development-workflow)
- [BMAD Framework Integration](#bmad-framework-integration)
- [Git Workflow and Commit Messages](#git-workflow-and-commit-messages)
- [References](#references)

---

## Development Commands

### Essential Commands

```bash
# Start development server (port 3000 with cross-origin isolation headers)
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Run tests
pnpm test

# Extract translation keys
pnpm i18n:extract

# Type checking
pnpm tsc --noEmit
```

### Development Server

The development server starts on port 3000 with required cross-origin isolation headers for WebContainer support:

```bash
pnpm dev
```

**Key Points:**
- Server runs at [`http://localhost:3000`](http://localhost:3000)
- Cross-Origin-Opener-Policy: `same-origin`
- Cross-Origin-Embedder-Policy: `require-corp`
- Cross-Origin-Resource-Policy: `cross-origin`

### Build and Preview

```bash
# Production build
pnpm build

# Preview production build
pnpm preview
```

### Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run tests with coverage
pnpm test --coverage
```

### Internationalization

```bash
# Extract translation keys from source code
pnpm i18n:extract
```

This command:
- Scans `src/**/*.{js,jsx,ts,tsx}` files
- Detects `t()`, `i18next.t()`, and `i18next.t()` calls
- Outputs to [`src/i18n/{en,vi}.json`](../src/i18n/en.json)
- Excludes test files and generated routes

### Type Checking

```bash
# Type check without emitting files
pnpm tsc --noEmit
```

---

## Code Style and Conventions

### Import Order Convention

Follow this strict import order in all files:

1. **React imports**
2. **Third-party libraries**
3. **Internal modules with `@/` alias**
4. **Relative imports**

```typescript
// 1. React imports
import React, { useState, useEffect } from 'react';

// 2. Third-party libraries
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

// 3. Internal modules with @/ alias
import { LocalFSAdapter } from '@/lib/filesystem';
import { useIDEStore } from '@/lib/state/ide-store';

// 4. Relative imports
import { FileSystemError } from './sync-types';
```

### TypeScript Conventions

#### Use Interfaces for Props

Always use `interface` for component props, not `type` aliases:

```typescript
// Good
interface MyComponentProps {
  title: string;
  onClick: () => void;
}

function MyComponent({ title, onClick }: MyComponentProps) {
  // ...
}

// Bad
type MyComponentProps = {
  title: string;
  onClick: () => void;
};
```

#### Strict Mode Configuration

The project uses strict TypeScript mode:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "verbatimModuleSyntax": false
  }
}
```

### File Naming Conventions

- **Components**: PascalCase (e.g., [`AgentConfigDialog.tsx`](../src/components/agent/AgentConfigDialog.tsx))
- **Utilities**: camelCase (e.g., [`local-fs-adapter.ts`](../src/lib/filesystem/local-fs-adapter.ts))
- **Types**: PascalCase (e.g., [`sync-types.ts`](../src/lib/filesystem/sync-types.ts))
- **Hooks**: camelCase with `use` prefix (e.g., [`useAgentChat.ts`](../src/hooks/useAgentChat.ts))
- **Test files**: `*.test.ts` or `*.test.tsx`

### Comment Style

- Use JSDoc comments for functions and complex logic
- Keep comments concise and focused on "why" rather than "what"

```typescript
/**
 * Reads file content from the local file system
 * @param path - Relative path to the file
 * @returns File content as string
 * @throws {FileSystemError} When file not found or access denied
 */
async function readFile(path: string): Promise<string> {
  // Implementation
}
```

---

## Component Organization Patterns

### Feature-Based Directory Structure

Components are organized by feature in [`src/components/`](../src/components/):

```
src/components/
├── agent/           # AI agent configuration and dialogs
├── chat/            # Chat interface components
├── ide/             # IDE components (editor, terminal, file tree, preview)
├── ui/              # Reusable UI components
└── layout/          # Layout components (IDELayout, HeaderBar, etc.)
```

### Barrel Exports

Each component directory has an `index.ts` barrel export file:

```typescript
// src/components/ui/index.ts
export { Button } from './button';
export { Dialog } from './dialog';
export { Input } from './input';
export { Toast } from './toast';
```

### Component Structure Pattern

Each component follows this structure:

```typescript
// 1. Imports (in order)
import React from 'react';
import { useTranslation } from 'react-i18next';

// 2. Types
interface ComponentProps {
  // Props definition
}

// 3. Component definition
export function ComponentName({ prop1, prop2 }: ComponentProps) {
  const { t } = useTranslation();

  // 4. Hooks and state
  const [state, setState] = useState();

  // 5. Effects
  useEffect(() => {
    // Effect logic
  }, []);

  // 6. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

---

## State Management Patterns

### Zustand Store Architecture

The project uses Zustand for all client state. Each store has a single responsibility:

| Store | Purpose | Persistence | Location |
|-------|---------|-------------|----------|
| [`useIDEStore`](../src/lib/state/ide-store.ts) | Main IDE state (open files, active file, panels) | IndexedDB |
| [`useStatusBarStore`](../src/lib/state/statusbar-store.ts) | StatusBar state (WC status, sync status, cursor) | Ephemeral |
| [`useFileSyncStatusStore`](../src/lib/state/file-sync-status-store.ts) | File sync progress and status | Ephemeral |
| [`useAgentsStore`](../src/stores/agents.ts) | Agent configuration and state | localStorage |
| [`useAgentSelectionStore`](../src/stores/agent-selection.ts) | Selected agent state | localStorage |

### Store Pattern

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface IDEState {
  openFiles: string[];
  activeFile: string | null;
  chatVisible: boolean;
}

// Persisted store (IndexedDB)
export const useIDEStore = create<IDEState>()(
  persist(
    (set) => ({
      openFiles: [],
      activeFile: null,
      chatVisible: false,
      setFile: (file) => set({ activeFile: file }),
      toggleChat: () => set((state) => ({ chatVisible: !state.chatVisible })),
    }),
    {
      name: 'ide-storage',
      storage: createJSONStorage(() => idbStorage), // IndexedDB storage
    }
  )
);

// Ephemeral store (in-memory)
export const useStatusBarStore = create<StatusBarState>()((set) => ({
  wcStatus: 'idle',
  syncStatus: 'idle',
  setWCStatus: (status) => set({ wcStatus: status }),
  setSyncStatus: (status) => set({ syncStatus: status }),
}));
```

### State Access Pattern

```typescript
// In components
function MyComponent() {
  const activeFile = useIDEStore(state => state.activeFile);
  const setActiveFile = useIDEStore(state => state.setActiveFile);
  const chatVisible = useIDEStore(state => state.chatVisible);
  const toggleChat = useIDEStore(state => state.toggleChat);

  // Use state and actions
  return (
    <div>
      <button onClick={toggleChat}>
        {chatVisible ? 'Hide Chat' : 'Show Chat'}
      </button>
      <div>Active: {activeFile}</div>
    </div>
  );
}
```

### Single Source of Truth Principle

Each state property has ONE owner:
- **Persisted State**: Owned by Zustand stores with IndexedDB persistence
- **Ephemeral State**: Owned by in-memory Zustand stores
- **Agent State**: Owned by localStorage
- **UI State**: Owned by React Context (Workspace, Theme)

**Do not duplicate state** - Use the appropriate store for each state property.

---

## File System Operations Workflow

### LocalFSAdapter as Source of Truth

All file operations go through [`LocalFSAdapter`](../src/lib/filesystem/local-fs-adapter.ts) to the browser's File System Access API:

```typescript
import { LocalFSAdapter } from '@/lib/filesystem';

const adapter = new LocalFSAdapter();

// Request directory access
await adapter.requestDirectoryAccess();

// Read file
const content = await adapter.readFile('/path/to/file.txt');

// Write file
await adapter.writeFile('/path/to/file.txt', 'new content');

// List directory
const entries = await adapter.listDirectory('/path/to/dir');
```

### Sync Manager for WebContainer Mirror

[`SyncManager`](../src/lib/filesystem/sync-manager.ts) syncs files to WebContainer:

```typescript
import { SyncManager } from '@/lib/filesystem';

const syncManager = new SyncManager();

// Start sync
await syncManager.sync();

// Sync automatically triggers on file changes
```

### Permission Handling

Use [`permission-lifecycle.ts`](../src/lib/filesystem/permission-lifecycle.ts) utilities for permission management:

```typescript
import { requestPersistentPermission } from '@/lib/filesystem/permission-lifecycle';

// Request persistent permission
const handle = await requestPersistentPermission();

// Handle permission denied
if (handle.kind === 'denied') {
  // Show UI prompt
}
```

### Error Handling

Use custom error classes from [`sync-types.ts`](../src/lib/filesystem/sync-types.ts):

```typescript
import {
  FileSystemError,
  PermissionDeniedError,
  SyncError,
} from '@/lib/filesystem/sync-types';

try {
  await adapter.readFile('/path/to/file.txt');
} catch (error) {
  if (error instanceof PermissionDeniedError) {
    // Handle permission errors
  } else if (error instanceof FileSystemError) {
    // Handle file system errors
  } else if (error instanceof SyncError) {
    // Handle sync errors
  }
}
```

---

## AI Agent Development Workflow

### MCP Research Protocol

Before implementing unfamiliar patterns, conduct research using MCP tools:

1. **Context7**: Query library documentation for API signatures
2. **Deepwiki**: Check repo wikis for architecture decisions
3. **Tavily/Exa**: Search for 2025 best practices
4. **Repomix**: Analyze current codebase structure

### Agent Tools Development

Implement agent tools in [`src/lib/agent/tools/`](../src/lib/agent/tools/):

```typescript
import { z } from 'zod';
import { AgentFileTools } from '@/lib/agent/facades';

// Tool schema
const readTool = {
  name: 'read_file',
  description: 'Read file content',
  parameters: z.object({
    path: z.string(),
  }),
};

// Tool handler
async function handleReadFile({ path }, facade) {
  const content = await facade.readFile(path);
  return { success: true, content };
}
```

### Provider Adapter Development

Implement provider adapters in [`src/lib/agent/providers/provider-adapter.ts`](../src/lib/agent/providers/provider-adapter.ts):

```typescript
import { createOpenaiChat } from '@tanstack/ai-openai';

function createOpenRouterAdapter(apiKey: string) {
  return createOpenaiChat(
    'mistralai/mistral-2512:free',
    apiKey,
    {
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': 'https://via-gent.dev',
        'X-Title': 'Via-Gent IDE',
      },
    }
  );
}
```

### Tool Execution Integration

Wire tools through [`useAgentChatWithTools`](../src/lib/agent/hooks/use-agent-chat-with-tools.ts) hook:

```typescript
import { useAgentChatWithTools } from '@/lib/agent/hooks/use-agent-chat-with-tools';
import { readTool, writeTool, executeTool } from '@/lib/agent/tools';

function AgentChatPanel() {
  const { messages, sendMessage } = useAgentChatWithTools({
    tools: [readTool, writeTool, executeTool],
    onToolCall: async (toolCall) => {
      // Execute tool via facade
      const result = await toolHandler(toolCall);
      return result;
    },
  });

  return (
    <ChatInterface
      messages={messages}
      onSendMessage={sendMessage}
    />
  );
}
```

### Credential Vault

Use [`credential-vault.ts`](../src/lib/agent/providers/credential-vault.ts) for secure API key storage:

```typescript
import { credentialVault } from '@/lib/agent/providers/credential-vault';

// Store API key
await credentialVault.setCredential('openrouter', 'sk-or-xxx');

// Retrieve API key
const apiKey = await credentialVault.getCredential('openrouter');
```

---

## BMAD Framework Integration

### Epic and Story Structure

The project follows BMAD V6 framework with sequential story development for MVP:

**Current Status (2025-12-25)**:
- **Single MVP Epic**: All AI agent functionality consolidated into one MVP epic
- **7 Sequential Stories**: Stories must be completed in order (no parallel execution)
- **Platform A Only**: Single workstream approach (Antigravity)

### MVP Story Development Cycle

1. **MVP-1**: Agent Configuration & Persistence
2. **MVP-2**: Chat Interface with Streaming
3. **MVP-3**: Tool Execution - File Operations
4. **MVP-4**: Tool Execution - Terminal Commands
5. **MVP-5**: Approval Workflow
6. **MVP-6**: Real-time UI Updates
7. **MVP-7**: E2E Integration Testing

**Critical Requirements**:
- Stories must be completed sequentially
- **MANDATORY: Browser E2E verification** required before marking any story DONE
- Screenshot or recording must be captured for each E2E verification

### Sprint Planning

Sprint planning is documented in [`_bmad-output/sprint-artifacts/mvp-sprint-plan-2025-12-24.md`](_bmad-output/sprint-artifacts/mvp-sprint-plan-2025-12-24.md).

### Story Validation

Story validation criteria are documented in [`_bmad-output/sprint-artifacts/mvp-story-validation-2025-12-24.md`](_bmad-output/sprint-artifacts/mvp-story-validation-2025-12-24.md).

---

## Git Workflow and Commit Messages

### Commit Message Format

Follow this commit message format with epic/story context:

```
<type>(<scope>): <subject>

<optional body>

<optional footer>

Refs: #<epic-number>-<story-number>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring
- `docs`: Documentation changes
- `test`: Test additions/changes
- `chore`: Maintenance tasks

**Examples**:

```
feat(agent): add OpenRouter provider support

Implement OpenRouter adapter with API key configuration.

Refs: #MVP-1-3

fix(filesystem): handle permission denied errors gracefully

Add PermissionDeniedError handling in LocalFSAdapter.

Refs: #MVP-1-5

refactor(state): migrate to Zustand stores

Replace TanStack Store with Zustand for all state management.

Refs: #MVP-1-2
```

### Branch Strategy

- Feature branches are created after epic completion
- Epic consolidation has reduced 26+ epics to 1 focused MVP epic
- Use feature branch names like `feature/mvp-1-agent-configuration`

### Git Ignore Patterns

From [`.gitignore`](../.gitignore):

```
node_modules/
dist/
dist-ssr/
.DS_Store
*.local
.env
.nitro
.tanstack
.wrangler
.output/
.vinxi/
todos.json
```

---

## References

### Internal Documentation

- [`AGENTS.md`](../AGENTS.md) - Project-specific development guidelines
- [`.agent/rules/general-rules.md`](../.agent/rules/general-rules.md) - MCP research protocol and dependency documentation
- [`_bmad-output/documentation/project-architecture-analysis-2025-12-27.md`](project-architecture-analysis-2025-12-27.md) - Architecture analysis
- [`_bmad-output/documentation/internationalization-setup-2025-12-27.md`](internationalization-setup-2025-12-27.md) - i18n setup
- [`_bmad-output/documentation/testing-infrastructure-2025-12-27.md`](testing-infrastructure-2025-12-27.md) - Testing infrastructure
- [`_bmad-output/sprint-artifacts/mvp-sprint-plan-2025-12-24.md`](../sprint-artifacts/mvp-sprint-plan-2025-12-24.md) - MVP sprint plan
- [`_bmad-output/sprint-artifacts/mvp-story-validation-2025-12-24.md`](../sprint-artifacts/mvp-story-validation-2025-12-24.md) - Story validation
- [`_bmad-output/state-management-audit-2025-12-24.md`](../state-management-audit-2025-12-24.md) - State management audit

### External Documentation

- **Vitest**: [https://vitest.dev/](https://vitest.dev/)
- **React**: [https://react.dev](https://react.dev/)
- **TypeScript**: [https://www.typescriptlang.org/](https://www.typescriptlang.org/)
- **Zustand**: [https://zustand.docs.pmnd.rs](https://zustand.docs.pmnd.rs/)
- **i18next**: [https://www.i18next.com](https://www.i18next.com/)
- **TanStack AI**: [https://tanstack.com/ai](https://tanstack.com/ai)
- **TanStack Router**: [https://tanstack.com/router](https://tanstack.com/router)

### Key Configuration Files

- [`vite.config.ts`](../vite.config.ts) - Vite configuration
- [`tsconfig.json`](../tsconfig.json) - TypeScript configuration
- [`vitest.config.ts`](../vitest.config.ts) - Test configuration
- [`i18next-scanner.config.cjs`](../i18next-scanner.config.cjs) - i18next scanner configuration

### Key Implementation Files

- [`src/lib/filesystem/local-fs-adapter.ts`](../src/lib/filesystem/local-fs-adapter.ts) - File system adapter
- [`src/lib/filesystem/sync-manager.ts`](../src/lib/filesystem/sync-manager.ts) - Sync manager
- [`src/lib/agent/providers/provider-adapter.ts`](../src/lib/agent/providers/provider-adapter.ts) - Provider adapter
- [`src/lib/agent/providers/credential-vault.ts`](../src/lib/agent/providers/credential-vault.ts) - Credential vault
- [`src/lib/agent/hooks/use-agent-chat-with-tools.ts`](../src/lib/agent/hooks/use-agent-chat-with-tools.ts) - Agent chat hook
- [`src/lib/state/ide-store.ts`](../src/lib/state/ide-store.ts) - IDE state store
- [`src/stores/agents.ts`](../src/stores/agents.ts) - Agents store

---

**Document Status**: Complete
**Last Updated**: 2025-12-27T19:45:00Z
