---
date: 2025-12-31
time: 03:15:00
phase: Standards Update
team: Team-A
agent_mode: bmad-core-bmad-master
---

# Coding Style Standards

## Overview

This document defines the coding style standards for the Via-gent (Project Alpha v2.0) project, a browser-based IDE using React 19, TypeScript 5.9, and WebContainers.

## Import Order (MANDATORY)

```typescript
// 1. React imports
import { useState, useEffect, useCallback } from 'react';

// 2. Third-party libraries
import { useShallow } from 'zustand/react/shallow';
import { z } from 'zod';

// 3. Internal modules with @/ alias
import { useIDEStore } from '@/lib/state/ide-store';
import { Button } from '@/components/ui';

// 4. Relative imports
import { useLocalHandlers } from './hooks/useLocalHandlers';
import type { LayoutProps } from './types';
```

## TypeScript Conventions

### Interface vs Type

```typescript
// ✅ REQUIRED: Use interface for objects, type for unions
interface AgentConfig {
  id: string;
  name: string;
  provider: string;
}
type AgentStatus = 'idle' | 'running' | 'error';

// ✅ REQUIRED: No I prefix on interfaces
interface AgentConfig { }     // CORRECT
interface IAgentConfig { }    // WRONG

// ✅ REQUIRED: Underscore prefix for intentionally unused
const [_value, setValue] = useState();  // ESLint allows this
```

### Path Alias Usage

```typescript
// ✅ REQUIRED: Use @/ alias for internal imports
import { useIDEStore } from '@/lib/state/ide-store';  // CORRECT
import { useIDEStore } from '../../lib/state/ide-store';  // AVOID
```

## Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| React Component | PascalCase.tsx | `AgentConfigDialog.tsx` |
| Utility Function | camelCase.ts | `createDexieStorage.ts` |
| Custom Hook | use*.ts | `useAgentChat.ts` |
| Test File | *.test.ts(x) | `credential-vault.test.ts` |
| Directory | kebab-case | `agent-tools/` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| Private Methods | camelCase with _ prefix | `_handlePrivate()` |

## Component Structure

```typescript
// ✅ REQUIRED: Organized imports
// 1. React
// 2. Third-party
// 3. @/ aliases
// 4. Relative

// ✅ REQUIRED: Interfaces before components
interface ComponentProps {
  title: string;
  onSubmit: () => void;
}

// ✅ OPTIONAL: JSDoc for complex components
/**
 * Agent configuration dialog for managing AI provider settings.
 * Handles credential storage via encrypted IndexedDB.
 */
export function AgentConfigDialog({ title, onSubmit }: ComponentProps) {
  // Implementation
}
```

## State Management (Zustand)

```typescript
// ✅ REQUIRED: Always use useShallow for multi-property selectors
const { activeFile, setActiveFile } = useIDEStore(
  useShallow((s) => ({
    activeFile: s.activeFile,
    setActiveFile: s.setActiveFile,
  }))
);

// ❌ WRONG: Selecting entire store (causes excessive re-renders)
const state = useIDEStore();

// ✅ REQUIRED: Immutable updates only
set((state) => ({
  openFiles: [...state.openFiles, newFile],  // SPREAD
}));

// ❌ WRONG: Direct mutation
set((state) => {
  state.openFiles.push(newFile);  // MUTATION - FORBIDDEN
  return state;
});

// ✅ REQUIRED: Action naming conventions
// set{Property}  - setActiveFile(path)
// add{Item}      - addOpenFile(path)
// remove{Item}   - removeOpenFile(path)
// toggle{Prop}   - toggleChatVisible()
// load{X}Async   - loadProjectAsync(id)
```

## Async/Await Patterns

```typescript
// ✅ REQUIRED: Error handling for async operations
async function loadProjectAsync(id: string): Promise<void> {
  try {
    const project = await db.projects.get(id);
    if (!project) {
      throw new Error(`Project ${id} not found`);
    }
    set({ activeProject: project });
  } catch (error) {
    console.error('[ProjectStore] Failed to load project:', error);
    throw error; // Re-throw for caller handling
  }
}

// ✅ RECOMMENDED: Parallel execution when possible
const [projects, settings] = await Promise.all([
  db.projects.toArray(),
  db.settings.get('user'),
]);
```

## Conditional Rendering

```typescript
// ✅ PREFERRED: Early returns for guard clauses
function ChatPanel({ isOpen }: ChatPanelProps) {
  if (!isOpen) {
    return null;
  }

  return <div className="chat-panel">{/* content */}</div>;
}

// ✅ PREFERRED: Ternary for simple conditional rendering
<div className={isActive ? 'active' : 'inactive'}>
  {isLoading ? <Spinner /> : <Content />}
</div>;
```

## Event Handler Patterns

```typescript
// ✅ RECOMMENDED: Named handlers for clarity
const handleSubmit = useCallback(() => {
  onSubmit(formData);
}, [formData, onSubmit]);

// ✅ RECOMMENDED: Prevent default explicitly when needed
const handleFormSubmit = useCallback((e: FormEvent) => {
  e.preventDefault();
  onSubmit();
}, [onSubmit]);

// ❌ AVOID: Inline handlers for complex logic
// <button onClick={() => { handleComplexLogic(); updateState(); }}>
```

## File Organization

```
src/
├── components/           # React components BY FEATURE
│   ├── {feature}/       # Feature-specific
│   │   ├── index.ts     # ⚠️ ALWAYS create barrel export
│   │   └── Component.tsx
├── lib/                  # Non-React utilities BY DOMAIN
│   └── {domain}/
├── routes/               # TanStack Router (DO NOT manual edit routeTree.gen.ts)
├── hooks/                # GLOBAL shared hooks only
├── stores/               # Legacy (migrate to lib/state)
└── types/                # Global type definitions
```

## Barrel Export Pattern (MANDATORY)

```typescript
// Every directory MUST have index.ts
// src/components/agent/index.ts
export { AgentConfigDialog } from './AgentConfigDialog';
export { AgentSelector } from './AgentSelector';
export type { AgentConfigDialogProps } from './AgentConfigDialog';

// ✅ CORRECT: Import from barrel
import { AgentConfigDialog } from '@/components/agent';

// ❌ WRONG: Deep import
import { AgentConfigDialog } from '@/components/agent/AgentConfigDialog';
```

## Error Class Definitions

```typescript
// ✅ REQUIRED: Custom error classes for specific domains
export class SyncError extends Error {
  constructor(
    message: string,
    public readonly path: string,
    public readonly code: string
  ) {
    super(message);
    this.name = 'SyncError';
  }
}

export class PermissionDeniedError extends Error {
  constructor(message: string, public readonly operation: string) {
    super(message);
    this.name = 'PermissionDeniedError';
  }
}
```

## Anti-Patterns to Avoid

```typescript
// ❌ NEVER: Use any type without justification
const data: any = response;  // WRONG
const data: unknown = response;  // Use unknown instead

// ❌ NEVER: Use console.log in production code
console.log('debug');  // Use console.debug or remove

// ❌ NEVER: Mutate Zustand state directly
state.items.push(newItem);  // FORBIDDEN

// ❌ NEVER: Access IndexedDB directly from components
// Always go through Zustand stores

// ❌ NEVER: Skip error boundaries for async operations
// Always wrap with try/catch

// ❌ NEVER: Use window.localStorage for sensitive data
// Use credential vault with encryption

// ❌ NEVER: Edit routeTree.gen.ts manually
// It's auto-generated by TanStack Router
```

## Related Documents

- [`error-handling.md`](error-handling.md) - Error handling patterns
- [`validation.md`](validation.md) - Input validation standards
- [`commenting.md`](commenting.md) - Code commenting guidelines
- [`conventions.md`](conventions.md) - General development conventions
