---
title: Via-gent Tech Stack Documentation
version: 1.0.0
date: 2025-12-28
phase: Documentation
agent_mode: bmad-bmm-tech-writer
team: Documentation Team
---

# Via-gent Tech Stack Documentation

## Overview

Via-gent is built on a modern web technology stack optimized for browser-based development environments. This document provides comprehensive coverage of all dependencies, their purposes, and integration patterns.

## Core Technologies

### React 19

**Purpose:** UI framework for building component-based user interfaces

**Key Features Used:**
- Concurrent rendering
- Suspense with streaming
- Server components (via TanStack Start)
- use() hook for async resources

**Documentation:** [https://react.dev](https://react.dev)

### TypeScript 5.x

**Purpose:** Type-safe JavaScript superset

**Configuration (`tsconfig.json`):**
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
    "skipLibCheck": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": false,
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Vite 6

**Purpose:** Build tool and development server

**Key Configuration:**
- Cross-origin isolation for WebContainers
- Hot module replacement (HMR)
- Optimized build with Rollup

**Documentation:** [https://vite.dev](https://vite.dev)

## Routing

### TanStack Router

**Purpose:** Type-safe file-based routing for React

**Features Used:**
- File-based route generation
- Route matching with loaders
- Search params and query handling
- Nested layouts
- SSR support via TanStack Start

**Documentation:** [https://tanstack.com/router](https://tanstack.com/router)

**Route Structure:**
```
src/routes/
├── __root.tsx          # Root route with providers
├── index.tsx           # Landing page
├── ide.tsx             # Main IDE route
├── workspace/
│   └── $projectId.tsx  # Dynamic project route
├── agents.tsx          # Agent configuration
├── settings.tsx        # Settings page
├── hub.tsx             # Hub page
├── knowledge.tsx       # Knowledge base
└── api/
    └── chat.ts         # Chat API endpoint
```

## State Management

### Zustand

**Purpose:** Lightweight state management

**Stores Used:**
- `useIDEStore` - IDE state (open files, active file, panels)
- `useStatusBarStore` - Status bar state
- `useFileSyncStatusStore` - File sync progress
- `useAgentsStore` - Agent configurations
- `useAgentSelectionStore` - Selected agent state
- `useHubStore` - Hub/page state

**Documentation:** [https://zustand.docs.pmnd.rs](https://zustand.docs.pmnd.rs)

**Example Store:**
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface IDEState {
  openFiles: string[];
  activeFile: string | null;
  setActiveFile: (file: string | null) => void;
}

export const useIDEStore = create<IDEState>()(
  persist(
    (set) => ({
      openFiles: [],
      activeFile: null,
      setActiveFile: (file) => set({ activeFile: file }),
    }),
    { name: 'ide-store' }
  )
);
```

### Dexie.js

**Purpose:** IndexedDB wrapper for persistent storage

**Key Features:**
- Type-safe queries
- Transaction support
- Indexed fields for fast lookups
- Dexie React hooks integration

**Documentation:** [https://dexie.org](https://dexie.org)

**Schema Example:**
```typescript
import Dexie from 'dexie';

export const db = new Dexie('ViaGentDB');

db.version(1).stores({
  projects: '++id, name, createdAt, updatedAt',
  conversations: '++id, projectId, agentId, createdAt',
  agentConfigs: '++id, provider, model, createdAt',
});
```

## UI Components

### Radix UI Primitives

**Purpose:** Unstyled, accessible UI components

**Components Used:**
- Dialog (modals)
- Dropdown Menu
- Select
- Tabs
- Switch
- Separator
- Label
- Slot (polymorphic components)

**Documentation:** [https://www.radix-ui.com/primitives](https://www.radix-ui.com/primitives)

### Monaco Editor

**Purpose:** VS Code's editor component for code editing

**Wrapper:** `@monaco-editor/react`

**Features:**
- Syntax highlighting
- IntelliSense
- Multi-language support
- Minimap
- Code actions

**Documentation:** [https://microsoft.github.io/monaco-editor/](https://microsoft.github.io/monaco-editor/)

### xterm.js

**Purpose:** Terminal emulator component

**Addons:**
- `@xterm/addon-fit` - Auto-fit to container

**Features:**
- ANSI colors
- Custom themes
- Event handling
- Input/output streams

**Documentation:** [http://xtermjs.org](http://xtermjs.org)

### Tailwind CSS v4

**Purpose:** Utility-first CSS framework

**Plugins:**
- `@tailwindcss/vite` - Vite integration
- `tailwind-merge` - Class merging
- `clsx` - Conditional class names
- `class-variance-authority` - Variant props

**Documentation:** [https://tailwindcss.com/docs](https://tailwindcss.com/docs)

**Configuration:**
```typescript
// vite.config.ts
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss()],
});
```

### Lucide React

**Purpose:** Icon library

**Usage:**
```typescript
import { Terminal, FileCode, Settings } from 'lucide-react';
```

**Documentation:** [https://lucide.dev](https://lucide.dev)

### React Resizable Panels

**Purpose:** Layout panels with draggable resizing

**Documentation:** [https://react-resizable-panels.vercel.app](https://react-resizable-panels.vercel.app)

### Sonner

**Purpose:** Toast notifications

**Documentation:** [https://sonner.emilkowal.ski](https://sonner.emilkowal.ski)

### next-themes

**Purpose:** Dark/light theme support

**Features:**
- System preference detection
- Manual toggle
- Hydration mismatch prevention

**Documentation:** [https://github.com/pacocoursey/next-themes](https://github.com/pacocoursey/next-themes)

## AI Integration

### TanStack AI

**Purpose:** AI integration framework with streaming support

**Features:**
- Provider abstraction
- Chat streaming
- Tool calling
- Message history

**Documentation:** [https://tanstack.com/ai](https://tanstack.com/ai)

**Related Packages:**
- `@tanstack/ai-core` - Core AI functionality
- `@tanstack/ai-react` - React hooks and components
- `@tanstack/ai-gemini` - Gemini provider

### Zod

**Purpose:** Schema validation and TypeScript inference

**Usage:**
```typescript
import { z } from 'zod';

const ReadFileSchema = z.object({
  path: z.string(),
  encoding: z.string().optional(),
});

type ReadFileInput = z.infer<typeof ReadFileSchema>;
```

**Documentation:** [https://zod.dev](https://zod.dev)

## WebContainer

### @webcontainer/api

**Purpose:** In-browser Node.js runtime

**Key Features:**
- Execute Node.js code
- File system operations
- Process management
- npm package installation

**Documentation:** [https://developer.stackblitz.com/platform/api/webcontainer-api](https://developer.stackblitz.com/platform/api/webcontainer-api)

**Critical Headers Required:**
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Resource-Policy': 'cross-origin',
    },
  },
});
```

## File System

### File System Access API

**Purpose:** Browser API for direct file system access

**Features:**
- Read/write files
- Directory picker
- Permission handling

**Browser Support:** Chrome, Edge, Opera (partial Safari)

### isomorphic-git

**Purpose:** Git operations in the browser

**Documentation:** [https://isomorphic-git.org](https://isomorphic-git.org)

## Internationalization

### i18next

**Purpose:** Internationalization framework

**Plugins:**
- `i18next-browser-languagedetector` - Auto-detect browser language
- `react-i18next` - React integration

**Documentation:** [https://www.i18next.com](https://www.i18next.com)

**Configuration:**
```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './en.json';
import vi from './vi.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { en, vi },
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });
```

## Observability

### @sentry/react

**Purpose:** Error tracking and performance monitoring

**Documentation:** [https://docs.sentry.io/platforms/javascript/guides/react/](https://docs.sentry.io/platforms/javascript/guides/react/)

## Utilities

### Eventemitter3

**Purpose:** Lightweight event emitter

**Documentation:** [http://nodejs.org/api/events.html](http://nodejs.org/api/events.html)

### idb

**Purpose:** Promise-based IndexedDB wrapper

**Documentation:** [https://github.com/jakearchibald/idb](https://github.com/jakearchibald/idb)

## Development Tools

### Vite-tsconfig-paths

**Purpose:** Automatic TypeScript path resolution

**GitHub:** [https://github.com/aleclarson/vite-tsconfig-paths](https://github.com/aleclarson/vite-tsconfig-paths)

## Dependency Summary

| Category | Package | Version | Purpose |
|----------|---------|---------|---------|
| **Core** | react | ^19.0.0 | UI framework |
| | react-dom | ^19.0.0 | DOM renderer |
| | vite | ^6.0.0 | Build tool |
| | typescript | ^5.0.0 | Type safety |
| **Routing** | @tanstack/react-router | ^1.0.0 | File-based routing |
| **State** | zustand | ^5.0.0 | State management |
| | dexie | ^4.0.0 | IndexedDB wrapper |
| | @tanstack/store | ^0.5.0 | TanStack store |
| **UI** | @radix-ui/* | ^1.0.0 | Accessible primitives |
| | @monaco-editor/react | ^5.0.0 | Code editor |
| | @xterm/xterm | ^5.0.0 | Terminal |
| | tailwindcss | ^4.0.0 | CSS framework |
| | lucide-react | ^0.400.0 | Icons |
| **AI** | @tanstack/ai | ^1.0.0 | AI integration |
| | zod | ^3.0.0 | Schema validation |
| **WebContainer** | @webcontainer/api | ^1.0.0 | Browser Node.js |
| **i18n** | i18next | ^23.0.0 | Internationalization |
| | react-i18next | ^15.0.0 | React i18n |
| **Testing** | vitest | ^2.0.0 | Test runner |
| | @testing-library/react | ^16.0.0 | React testing |

## Integration Patterns

### Provider Pattern (Radix UI)

```typescript
import * as Dialog from '@radix-ui/react-dialog';

export const Modal = ({ open, onOpenChange, children }) => (
  <Dialog.Root open={open} onOpenChange={onOpenChange}>
    <Dialog.Portal>
      <Dialog.Overlay />
      <Dialog.Content>{children}</Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);
```

### Hook Pattern (Custom Hooks)

```typescript
import { useState, useCallback } from 'react';

export const useFileOperations = () => {
  const [loading, setLoading] = useState(false);
  
  const readFile = useCallback(async (path: string) => {
    setLoading(true);
    try {
      const content = await window.fs.readFile(path);
      return content;
    } finally {
      setLoading(false);
    }
  }, []);
  
  return { readFile, loading };
};
```

### Store Pattern (Zustand)

```typescript
import { create } from 'zustand';

interface Store {
  count: number;
  increment: () => void;
}

export const useStore = create<Store>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));
```

---

**Document Information**
- Version: 1.0.0
- Created: 2025-12-28
- Agent: bmad-bmm-tech-writer
- Phase: Documentation