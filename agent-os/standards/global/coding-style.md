# Coding Style Standards

> **Last Updated:** 2025-12-21  
> **Applies to:** Via-Gent (Project Alpha)

---

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| **Files** | kebab-case | `local-fs-adapter.ts`, `sync-manager.ts` |
| **Components** | PascalCase | `MonacoEditor.tsx`, `FileTree.tsx` |
| **Hooks** | camelCase with `use` prefix | `useAgentChat.ts`, `useWebContainer.ts` |
| **Types/Interfaces** | PascalCase | `ProjectMetadata`, `ToolResult` |
| **Constants** | SCREAMING_SNAKE_CASE | `MAX_FILE_SIZE`, `DEFAULT_TIMEOUT` |
| **Variables/Functions** | camelCase | `syncToWebContainer`, `handleFileOpen` |

---

## File Size Limits

| Metric | Limit | Enforcement |
|--------|-------|-------------|
| Lines per file | ≤250 | ESLint max-lines |
| Exports per file | ≤2 | Manual review |
| Cyclomatic complexity | ≤10 | ESLint complexity |

> **If a file exceeds limits:** Extract functions, split into modules, or create sub-components.

---

## TypeScript Strictness

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### Avoid `any`

```typescript
// ❌ Bad
const result: any = await fetch('/api/chat');

// ✅ Good
const result: ChatResponse = await fetch('/api/chat').then(r => r.json());
```

---

## Import Ordering

Use consistent import groups:

```typescript
// 1. React and core packages
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Third-party packages
import { toast } from 'sonner';
import { FolderOpen, File } from 'lucide-react';

// 3. Internal components
import { Button } from '@/components/ui/button';
import { MonacoEditor } from '@/components/ide/MonacoEditor';

// 4. Internal utilities and types
import { syncToWebContainer } from '@/lib/filesystem/sync-manager';
import type { ProjectMetadata } from '@/types';
```

---

## General Practices

- **Consistent Naming**: Follow conventions across the codebase
- **Automated Formatting**: Use Prettier with project config
- **Meaningful Names**: Descriptive, no abbreviations (except common: `fs`, `db`)
- **Small, Focused Functions**: One function = one task, ≤20 lines preferred
- **Remove Dead Code**: Delete unused code, don't comment out
- **DRY Principle**: Extract common logic into reusable modules

---

## Error Handling Pattern

```typescript
try {
  await syncToWebContainer(handle);
} catch (error) {
  if (error instanceof PermissionDeniedError) {
    toast.error(t('sync.permission_denied'));
  } else {
    console.error('Sync failed:', error);
    toast.error(t('sync.failed'));
  }
}
```

---

## Agent Guidelines

All AI agents developing this project MUST:

1. Follow naming conventions exactly as documented
2. Keep files under 250 lines
3. Run `pnpm typecheck` before committing
4. Use MCP research tools for unfamiliar patterns
5. Never assume - verify with Context7/Tavily
