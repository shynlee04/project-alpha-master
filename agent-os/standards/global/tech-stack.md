---
date: 2025-12-31
time: 03:20:00
phase: Standards Update
team: Team-A
agent_mode: bmad-core-bmad-master
---

# Technology Stack Specification

## Overview

This document defines the complete technology stack for the Via-gent (Project Alpha v2.0) project - a browser-based IDE running code locally using WebContainers with integrated AI agent capabilities.

## Core Runtime

| Technology | Version | Purpose | Documentation |
|------------|---------|---------|---------------|
| React | 19.2.3 | UI rendering, hooks, concurrent features | https://react.dev |
| TypeScript | 5.9.3 | Type safety, strict mode | https://www.typescriptlang.org |
| Vite | 7.3.0 | Build tool, dev server, HMR | https://vite.dev |
| TanStack Start | 1.143.3 | Hybrid SSR framework | https://tanstack.com/start |
| TanStack Router | 1.143.3 | File-based routing | https://tanstack.com/router |

## State Management

| Technology | Version | Purpose | Documentation |
|------------|---------|---------|---------------|
| Zustand | 5.0.9 | Client-side state management | https://zustand.docs.pmnd.rs |
| Dexie.js | 4.2.1 | IndexedDB wrapper for persistence | https://dexie.org |
| Zod | 4.2.1 | Runtime validation | https://zod.dev |

### Zustand Store Patterns

```typescript
// ✅ REQUIRED: Always use useShallow for multi-property selectors
import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';

interface IDEState {
  openFiles: string[];
  activeFile: string | null;
  setActiveFile: (path: string) => void;
}

export const useIDEStore = create<IDEState>()(
  persist(
    (set) => ({
      openFiles: [],
      activeFile: null,
      setActiveFile: (path) => set({ activeFile: path }),
    }),
    {
      name: 'ide-storage',
    }
  )
);

// ✅ USAGE: Always use useShallow
const { openFiles, activeFile } = useIDEStore(
  useShallow((s) => ({
    openFiles: s.openFiles,
    activeFile: s.activeFile,
  }))
);
```

### Dexie Schema Pattern

```typescript
// ✅ REQUIRED: Table naming - camelCase, plural
class ViaGentDB extends Dexie {
  agents!: Table<Agent>;          // CORRECT
  projects!: Table<Project>;      // CORRECT
  conversations!: Table<Conversation>;
  
  constructor() {
    super('via-gent-db');
    
    this.version(9).stores({
      projects: '++id, name, lastOpened',
      agents: 'id, name, provider',
      conversations: '++id, agentId, createdAt',
      ideState: 'projectId, updatedAt',
      fileMetadata: 'path, lastModified, [path+lastModified]',
      toolExecutionLogs: 'id, conversationId, messageId, toolName, timestamp',
    });
  }
}

export const db = new ViaGentDB();
```

## AI & Chat

| Technology | Version | Purpose | Documentation |
|------------|---------|---------|---------------|
| TanStack AI | 0.2.0 | AI orchestration, SSE streaming | https://tanstack.com/ai |
| @tanstack/ai-openai | 0.2.0 | OpenRouter/OpenAI adapter | https://tanstack.com/ai |
| @tanstack/ai-gemini | 0.2.0 | Google Gemini adapter | https://tanstack.com/ai |

### AI Provider Configuration

```typescript
// ✅ REQUIRED: Use provider adapter factory
import { providerAdapterFactory } from '@/lib/agent/providers/provider-adapter';

const adapter = providerAdapterFactory.createAdapter('openrouter', {
  apiKey: await credentialVault.get('openrouter'),
  model: 'anthropic/claude-3.5-sonnet',
});
```

## IDE Components

| Technology | Version | Purpose | Documentation |
|------------|---------|---------|---------------|
| Monaco Editor | 0.55.1 | Code editor with syntax highlighting | https://microsoft.github.io/monaco-editor |
| @monaco-editor/react | - | React wrapper for Monaco | https://github.com/suren-atoyan/monaco-react |
| @xterm/xterm | 5.5.0 | Terminal emulator | http://xtermjs.org |
| @xterm/addon-fit | 5.5.0 | Auto-fit terminal to container | http://xtermjs.org |
| @webcontainer/api | 1.6.1 | Browser Node.js environment | https://developer.stackblitz.com |

### WebContainer Configuration

```typescript
// ⚠️ CRITICAL: COOP/COEP headers required in vite.config.ts
// See src/lib/webcontainer/manager.ts

import { WebContainer } from '@webcontainer/api';

class WebContainerManager {
  private static instance: WebContainer | null = null;
  
  static async getInstance(): Promise<WebContainer> {
    if (!this.instance) {
      this.instance = await WebContainer.boot();
    }
    return this.instance;
  }
}
```

## Styling & UI

| Technology | Version | Purpose | Documentation |
|------------|---------|---------|---------------|
| Tailwind CSS | 4.1.18 | Utility-first CSS | https://tailwindcss.com |
| @tailwindcss/vite | - | Vite plugin for Tailwind | https://tailwindcss.com |
| class-variance-authority | - | Variant props for components | https://cva.style |
| next-themes | - | Dark/light theme support | https://github.com/pacocoursey/next-themes |
| clsx | - | Conditional class names | https://github.com/lukeed/clsx |
| tailwind-merge | - | Merge Tailwind classes | https://github.com/dcastil/tailwind-merge |

### Component Styling Pattern

```typescript
// ✅ REQUIRED: Use cva for component variants
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

## UI Components

| Technology | Purpose | Documentation |
|------------|---------|---------------|
| Radix UI Primitives | Headless accessible components | https://www.radix-ui.com/primitives |
| lucide-react | Icon library | https://lucide.dev |
| react-resizable-panels | Resizable panel layout | https://react-resizable-panels.vercel.app |
| sonner | Toast notifications | https://sonner.emilkowal.ski |

### Radix UI Components Used

```typescript
// ✅ REQUIRED: Import from @radix-ui/react-*
import * as Dialog from '@radix-ui/react-dialog';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Select from '@radix-ui/react-select';
import * as Tabs from '@radix-ui/react-tabs';
import * as Switch from '@radix-ui/react-switch';
```

## Internationalization

| Technology | Version | Purpose | Documentation |
|------------|---------|---------|---------------|
| i18next | - | Translation framework | https://www.i18next.com |
| i18next-browser-languagedetector | - | Auto-detect browser language | https://github.com/i18next/i18next-browser-languagedetector |
| react-i18next | - | React integration | https://react.i18next.com |

### i18n Pattern

```typescript
// ✅ REQUIRED: Use t() hook for all UI strings
import { useTranslation } from 'react-i18next';

function Component() {
  const { t } = useTranslation();
  
  return <button>{t('common.save')}</button>;
}

// ✅ REQUIRED: Run extraction after adding new keys
// pnpm i18n:extract
```

## File System

| Technology | Purpose | Documentation |
|------------|---------|---------------|
| File System Access API | Browser-native file operations | https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API |
| isomorphic-git | Git operations in browser | https://isomorphic-git.org |

## Monitoring & Observability

| Technology | Purpose | Documentation |
|------------|---------|---------------|
| @sentry/react | Error tracking | https://docs.sentry.io |

## Build Configuration

### Vite Config

```typescript
// ✅ REQUIRED: crossOriginIsolationPlugin must be FIRST
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    crossOriginIsolationPlugin(),  // FIRST
    react(),
    tailwindcss(),
    tsconfigPaths(),
  ],
});
```

### TypeScript Config

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## Testing

| Technology | Version | Purpose | Documentation |
|------------|---------|---------|---------------|
| Vitest | 4.0.16 | Test runner | https://vitest.dev |
| @testing-library/react | - | React component testing | https://testing-library.com |
| @testing-library/user-event | - | User event simulation | https://testing-library.com |
| happy-dom | - | Lightweight DOM for testing | https://happy.dom |

## Package Manager

| Technology | Version | Purpose |
|------------|---------|---------|
| pnpm | - | Fast, disk-efficient package manager |

## Related Documents

- [`coding-style.md`](coding-style.md) - Coding style standards
- [`error-handling.md`](error-handling.md) - Error handling patterns
- [`validation.md`](validation.md) - Input validation standards
- [`project-context.md`](../../../../_bmad-output/project-planning-artifacts/project-context.md) - Project context and constraints
