---
project_name: 'Project Alpha v2.0 - Knowledge Synthesis Station'
user_name: 'Admin'
date: '2025-12-28'
sections_completed: ['technology_stack', 'language_rules', 'framework_rules', 'testing_rules', 'code_quality', 'workflow_rules', 'critical_rules']
generated_from: 'architecture.md'
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents MUST follow when implementing code. Focus on unobvious details to prevent implementation mistakes._

---

## Technology Stack & Versions (LOCKED)

### Core Runtime
| Technology | Version | Notes |
|------------|---------|-------|
| React | 19.2.3 | Hooks + Concurrent features |
| TypeScript | 5.9.3 | Strict mode enabled |
| Vite | 7.3.0 | Dev server on port 3000 |
| TanStack Start | 1.143.3 | Hybrid SSR |
| TanStack Router | 1.143.3 | File-based routing |

### State & Data
| Technology | Version | Notes |
|------------|---------|-------|
| Zustand | 5.0.9 | `useShallow` required for selectors |
| Dexie.js | 4.2.1 | IndexedDB wrapper |
| Zod | 4.2.1 | Validation at boundaries |

### AI & Chat
| Technology | Version | Notes |
|------------|---------|-------|
| TanStack AI | 0.2.0 | SSE streaming |
| @tanstack/ai-openai | 0.2.0 | OpenRouter compatible |
| @tanstack/ai-gemini | 0.2.0 | Google Gemini |

### IDE Components
| Technology | Version | Notes |
|------------|---------|-------|
| Monaco Editor | 0.55.1 | Lazy loaded |
| @xterm/xterm | 5.5.0 | Terminal |
| @webcontainer/api | 1.6.1 | Requires COOP/COEP |

### Styling & UI
| Technology | Version | Notes |
|------------|---------|-------|
| Tailwind CSS | 4.1.18 | v4 syntax |
| Radix UI | 1.x-2.x | Unstyled primitives |
| Lucide React | 0.544.0 | Icons |

---

## Critical Implementation Rules

### TypeScript Rules

```typescript
// ✅ REQUIRED: Strict mode is ON
// tsconfig.json: "strict": true

// ✅ REQUIRED: Use interface for objects, type for unions
interface AgentConfig {
  id: string;
  name: string;
}
type AgentStatus = 'idle' | 'running' | 'error';

// ✅ REQUIRED: No I prefix on interfaces
interface AgentConfig { }     // CORRECT
interface IAgentConfig { }    // WRONG

// ✅ REQUIRED: Underscore prefix for intentionally unused
const [_value, setValue] = useState();  // ESLint allows this

// ✅ REQUIRED: Path alias for internal imports
import { useIDEStore } from '@/lib/state/ide-store';  // CORRECT
import { useIDEStore } from '../../lib/state/ide-store';  // AVOID
```

### Import Order (MANDATORY)

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

### Zustand Store Rules (CRITICAL)

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

### Dexie/IndexedDB Rules

```typescript
// ✅ REQUIRED: Table naming - camelCase, plural
class ViaGentDB extends Dexie {
  agents!: Table<Agent>;          // CORRECT
  projects!: Table<Project>;      // CORRECT
  // Agent!: Table<Agent>;        // WRONG - singular
  // Agents!: Table<Agent>;       // WRONG - PascalCase
}

// ✅ REQUIRED: Always use transaction for multi-table operations
await db.transaction('rw', [db.agents, db.projects], async () => {
  await db.agents.put(agent);
  await db.projects.put(project);
});
```

### Error Handling Rules

```typescript
// ✅ REQUIRED: Use custom error classes
import { SyncError, PermissionDeniedError } from '@/lib/filesystem/sync-types';

// ✅ REQUIRED: Catch specific errors first
try {
  await syncFile(path);
} catch (error) {
  if (error instanceof PermissionDeniedError) {
    showPermissionModal();
  } else if (error instanceof SyncError) {
    toast.error('Sync failed: ' + error.message);
  } else {
    console.error('Unexpected error:', error);
    throw error;
  }
}

// ✅ REQUIRED: User-friendly error messages
toast.error('Unable to save file. Please check permissions.');  // CORRECT
toast.error(`SyncError: ENOENT at ${path}`);  // WRONG - too technical
```

---

## Directory Organization Rules

```
src/
├── components/           # React components BY FEATURE
│   ├── {feature}/       # Feature-specific
│   │   ├── index.ts     # ⚠️ ALWAYS create barrel export
│   │   └── Component.tsx
├── lib/                  # Non-React utilities BY DOMAIN
│   └── {domain}/
├── routes/               # TanStack Router (file-based, DO NOT manual edit routeTree.gen.ts)
├── hooks/                # GLOBAL shared hooks only
├── stores/               # Legacy (migrate to lib/state)
└── types/                # Global type definitions
```

### File Naming Rules

| Element | Convention | Example |
|---------|------------|---------|
| React Component | PascalCase.tsx | `AgentConfigDialog.tsx` |
| Utility | camelCase.ts | `createDexieStorage.ts` |
| Hook | use*.ts | `useAgentChat.ts` |
| Test | *.test.ts(x) | `credential-vault.test.ts` |
| Directory | kebab-case | `agent-tools/` |

### Barrel Export Pattern (MANDATORY)

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

---

## Testing Rules

### Test Organization
- **Location:** `__tests__/` adjacent to source files
- **Pattern:** `*.test.ts(x)`
- **Environment:** `jsdom` for React, `node` for utilities

### Required Mocks
```typescript
// For IndexedDB tests
import 'fake-indexeddb/auto';

// For Zustand tests
vi.mock('zustand');

// For WebContainer tests
vi.mock('@webcontainer/api');
```

### Test Structure
```typescript
describe('ComponentName', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
  });
  
  it('should describe behavior not implementation', () => {
    // ✅ CORRECT: "should save file when submit clicked"
    // ❌ WRONG: "should call setFile"
  });
});
```

---

## WebContainer Critical Rules

```typescript
// ⚠️ CRITICAL: COOP/COEP headers MUST be set for WebContainers to work
// vite.config.ts securityHeadersPlugin handles this in dev

// ⚠️ CRITICAL: Only ONE WebContainer instance per page
// Use WebContainerManager singleton in src/lib/webcontainer/manager.ts

// ⚠️ CRITICAL: Sync is ONE-WAY only
// Local FS → WebContainer (changes in WC do NOT sync back)

// ⚠️ CRITICAL: These are excluded from sync
const SYNC_EXCLUSIONS = ['node_modules', '.git', 'dist', '.DS_Store'];
```

---

## i18n Rules

```typescript
// ✅ REQUIRED: Use t() hook for all user-facing strings
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();
<button>{t('common.save')}</button>;

// ✅ REQUIRED: Run extraction after adding keys
// pnpm i18n:extract

// ⚠️ Keys are in src/i18n/en.json and src/i18n/vi.json
```

---

## Critical Anti-Patterns

### ❌ NEVER Do These

```typescript
// ❌ NEVER: Edit routeTree.gen.ts manually
// It's auto-generated by TanStack Router

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
```

### ✅ ALWAYS Do These

```typescript
// ✅ ALWAYS: Check for existing implementation before creating new
// Use grep_search or codebase_search first

// ✅ ALWAYS: Follow existing patterns in the codebase
// Don't invent new conventions

// ✅ ALWAYS: Use useShallow for Zustand selectors

// ✅ ALWAYS: Create barrel exports (index.ts) for new directories

// ✅ ALWAYS: Validate at boundaries with Zod

// ✅ ALWAYS: Reference AGENTS.md for workflow questions

// ✅ ALWAYS: Execute MCP research for unfamiliar patterns
```

---

## Development Commands

```bash
# Start development server (COOP/COEP enabled)
pnpm dev

# Run tests
pnpm test

# Type check
pnpm typecheck

# Extract i18n keys
pnpm i18n:extract

# Build for production
pnpm build
```

---

## Reference Documents

- **Architecture:** `_bmad-output/project-planning-artifacts/architecture.md`
- **Development Workflow:** `AGENTS.md`
- **Sprint Status:** `bmm-workflow-status.yaml`
- **MCP Research Protocol:** `.agent/rules/general-rules.md`

---

_Generated: 2025-12-28T20:46+07:00_
_This document is optimized for LLM context efficiency. Keep it lean._
