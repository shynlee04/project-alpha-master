---
project_name: 'project-alpha'
user_name: 'Admin'
date: '2025-12-20'
sections_completed: ['technology_stack', 'critical_rules', 'patterns', 'gotchas']
---

# Project Context for AI Agents

_Critical rules and patterns for implementing code in Project Alpha. Focus on unobvious details that AI agents might otherwise miss._

---

## Technology Stack & Versions

### Core Framework

| Package | Version | Purpose |
|---------|---------|---------|
| `@tanstack/react-start` | 1.141.7 | Full-stack React framework (SSR/CSR) |
| `@tanstack/react-router` | 1.141.6 | File-based type-safe routing |
| `@tanstack/react-store` | 0.8.0 | State management |
| `react` | 19.2.3 | UI library |
| `vite` | 7.3.0 | Build tool |
| `typescript` | 5.9.3 | Language |

### Browser APIs

| Package | Version | Purpose |
|---------|---------|---------|
| `@webcontainer/api` | 1.6.1 | Browser-based Node.js sandbox |
| `@monaco-editor/react` | 4.7.0 | Code editor |
| `@xterm/xterm` | 5.5.0 | Terminal emulator |
| `isomorphic-git` | 1.36.1 | Client-side git operations |
| `idb` | 8.0.3 | IndexedDB wrapper |

### AI Integration

| Package | Version | Purpose |
|---------|---------|---------|
| `@tanstack/ai` | 0.0.3 | AI framework |
| `@tanstack/ai-gemini` | 0.0.3 | Gemini LLM adapter |
| `zod` | 4.2.1 | Schema validation for tools |

### Styling & UI

| Package | Version | Purpose |
|---------|---------|---------|
| `tailwindcss` | 4.1.18 | CSS framework |
| `lucide-react` | 0.544.0 | Icons |
| `react-resizable-panels` | 3.0.6 | Resizable panel layout |

---

## Critical Implementation Rules

### 🔴 MUST DO - Cross-Origin Isolation

```typescript
// vite.config.ts - COOP/COEP headers REQUIRED for WebContainers
const crossOriginIsolationPlugin: Plugin = {
  name: 'configure-response-headers',
  configureServer(server) {
    server.middlewares.use((_req, res, next) => {
      res.setHeader('Cross-Origin-Opener-Policy', 'same-origin')
      res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp')
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
      next()
    })
  },
}
// Plugin MUST be first in plugins array
```

### 🔴 MUST DO - WebContainer Singleton

```typescript
// Only ONE WebContainer instance per page
// See: src/lib/webcontainer/manager.ts
// NEVER create multiple instances - use the singleton boot() function
```

### 🔴 MUST DO - Terminal Working Directory

```typescript
// Terminal spawns at WebContainer root by default
// ALWAYS pass projectPath to startShell()
await adapter.startShell(projectPath);
// Without this, npm/pnpm commands won't find package.json
```

### 🔴 MUST DO - Local FS is Source of Truth

```markdown
- All file edits go through LocalFSAdapter FIRST
- Then replicated to WebContainer
- WebContainer changes (node_modules) do NOT sync back
- This is BY DESIGN - local FS is authoritative
```

### 🟡 ALWAYS - File Sync Exclusions

```typescript
// These paths are EXCLUDED from sync to WebContainer:
['.git', 'node_modules', '.DS_Store', 'Thumbs.db']
// They are regenerated inside the sandbox
```

### 🟡 ALWAYS - Route Tree is Auto-Generated

```markdown
- NEVER edit src/routeTree.gen.ts
- TanStack Router plugin regenerates it
- Add new routes by creating files in src/routes/
```

### 🟡 ALWAYS - Use Path Alias

```typescript
// Use @/ alias for src imports
import { SyncManager } from '@/lib/filesystem/sync-manager';
// NOT relative imports like: ../../lib/filesystem/sync-manager
```

---

## Code Patterns

### Import Order

```typescript
// 1. React
import { useState, useEffect } from 'react';

// 2. Third-party
import { useStore } from '@tanstack/react-store';
import { Terminal } from '@xterm/xterm';

// 3. Internal (path alias)
import { SyncManager } from '@/lib/filesystem';

// 4. Relative
import { MyComponent } from './MyComponent';
```

### File Naming

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `FileTree.tsx` |
| Utilities | camelCase or kebab-case | `sync-manager.ts` |
| Tests | kebab-case.test.ts | `sync-manager.test.ts` |
| Types | PascalCase | `SyncTypes.ts` |

### Component Props

```typescript
// Use interface for props (better error messages)
interface FileTreeProps {
  rootPath: string;
  onSelect: (path: string) => void;
}

// NOT type alias
type FileTreeProps = { ... }; // ❌
```

### Error Handling

```typescript
// Use custom error classes from src/lib/filesystem/sync-types.ts
import { SyncError, PermissionDeniedError } from '@/lib/filesystem';

try {
  await syncManager.sync();
} catch (error) {
  if (error instanceof PermissionDeniedError) {
    // Handle permission specifically
  } else if (error instanceof SyncError) {
    // Handle sync error
  }
}
```

---

## Testing Patterns

### Test Location

```markdown
Tests are CO-LOCATED with source:
- src/lib/filesystem/__tests__/sync-manager.test.ts
- src/lib/workspace/__tests__/project-store.test.ts
```

### Mock Patterns

```typescript
// FSA API mock (global in test setup)
vi.mock('window.showDirectoryPicker');

// IndexedDB mock
import 'fake-indexeddb/auto';

// WebContainer mock
vi.mock('@webcontainer/api');
```

---

## MCP Tool Usage (for AI Agents)

### Recommended Tools

| Tool | When to Use |
|------|-------------|
| **Context7** | Official docs lookup (2 sequential steps) |
| **Deepwiki** | Deep semantic questions about specific repos |
| **Tavily/Exa** | Web research, cross-dependency knowledge |
| **Repomix** | Pack remote repos for iterative analysis |
| **@web** | Direct URL access |

### Deepwiki Repos

```markdown
- https://deepwiki.com/TanStack/router
- https://deepwiki.com/stackblitz/webcontainer-core
- https://deepwiki.com/stackblitz/webcontainer-docs
- https://deepwiki.com/xtermjs/xterm.js
- https://deepwiki.com/TanStack/query
```

### Local Dependency Libraries

```markdown
Available in docs/dependencies-libraries/:
- router-main (TanStack Router)
- store-main (TanStack Store)
- tanstack-ai (AI framework)
- webcontainer-docs-main
- webcontainer-api-starter-main
- xterm.js-master
- monaco-react-master
- isomorphic-git-main
- Roo-Code-main (agent patterns)
```

---

## Gotchas & Warnings

| # | Warning | Impact |
|---|---------|--------|
| 1 | WebContainer singleton | Only one per page |
| 2 | FSA permissions ephemeral | Must use permission-lifecycle.ts |
| 3 | Route tree auto-generated | Never edit manually |
| 4 | Missing COOP/COEP headers | WebContainers won't work |
| 5 | Sync exclusions active | .git, node_modules excluded |
| 6 | IndexedDB schema in project-store.ts | Changes need migration |
| 7 | Tests mock FSA globally | Check test setup |
| 8 | Terminal CWD defaults to root | Pass projectPath |
| 9 | No reverse sync | WebContainer changes lost |
| 10 | Strict TypeScript | noUnusedLocals, noUnusedParameters |

---

*Generated by BMAD generate-project-context workflow - 2025-12-20*
