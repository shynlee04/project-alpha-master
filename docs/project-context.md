---
project_name: 'project-alpha'
user_name: 'via-gent-dev'
date: '2025-12-28'
last_updated: '2025-12-28'
sections_completed: ['technology_stack', 'implementation_rules', 'patterns']
existing_patterns_found: 3
---

# Project Context & Implementation Rules

This document defines the critical technical context, rules, and patterns that ALL AI agents must follow when implementing code for the `project-alpha` (Via-gent) codebase.

## 1. Technology Stack

### Core Frameworks
- **Runtime:** React 19.2.3 (Vite 7.3.0)
- **Language:** TypeScript 5.9.3 (Strict Mode)
- **Routing:** @tanstack/react-router (1.143.3)
- **State Management:** Zustand 5.0.9 (Store pattern)
- **Persistence:** Dexie 4.2.1 (IndexedDB wrapper)

### UI System
- **Styling:** TailwindCSS 4.1.18 (@tailwindcss/vite)
- **Components:** Radix UI Primitives (Headless)
- **Icons:** lucide-react (0.544.0)
- **Editor:** @monaco-editor/react (4.7.0)
- **Terminal:** @xterm/xterm (5.5.0)

### AI & Agent Infrastructure
- **Agent Framework:** @tanstack/ai (0.2.0)
- **Web Container:** @webcontainer/api (1.6.1)
- **Testing:** Vitest 3.2.4 + React Testing Library

## 2. Critical Implementation Rules

### State Management
- **Single Source of Truth:** ALL shared state must reside in Zustand stores (`src/lib/state/*.ts`).
- **Persistence:** Use `dexie-storage` adapter for persisting Zustand stores to IndexedDB.
- **No Local State Duplication:** Avoid `useState` for data that exists in global stores or URL params.
- **Subscription Pattern:** Use `useShallow` selectors to prevent unnecessary re-renders.

### Mobile Responsiveness
- **Design Principle:** Mobile-first responsive design.
- **Touch Targets:** All interactive elements must have min 44px touch targets on mobile.
- **Layouts:** Use `IDELayout` for desktop and `MobileIDELayout` for mobile (controlled by `useMediaQuery`).
- **Viewport:** Handle safe areas for mobile browsers (iOS Safari).

### Project Structure (Feature-Based)
```
src/
├── components/         # UI Components
│   ├── agent/          # Agent-specific UI (Config, Chat)
│   ├── ide/            # IDE Layout components (Editor, Terminal)
│   ├── layout/         # Application shells
│   └── ui/             # Reusable primitives (Buttons, Dialogs)
├── lib/
│   ├── agent/          # Agent logic (adapters, context)
│   ├── state/          # Zustand stores & Dexie DB
│   └── utils.ts        # Common helpers (cn, etc.)
├── routes/             # TanStack Router definitions
└── hooks/              # Custom React hooks
```

### Coding Conventions
- **Files:** PascalCase for components (`MyComponent.tsx`), kebab-case for utilities/stores (`my-store.ts`).
- **Imports:** Use absolute imports `@/` configured in `tsconfig.json`.
- **Eslint:** No eslint-disable unless absolutely necessary (document why).
- **Types:** Explicitly define all interfaces. Avoid `any`.

## 3. Architecture Patterns

### Agent & Provider System
- **Separation:** Providers (LLMs) and Agents are distinct entities.
- **Storage:**
  - Providers: `projectConfigs` table (Dexie) / `useProviderStore` (Zustand)
  - Agents: `agentConfigs` table (Dexie) / `useAgentStore` (Zustand)
- **Security:** API Keys must be encrypted using `CredentialVault` before storage.

### Data Persistence
- **DexieDB:** Use `src/lib/state/dexie-db.ts` as the single point of database definition.
- **Migrations:** Add new schema versions in `ViaGentDatabase` constructor for any data changes.

## 4. Testing Requirements
- **Unit:** Write `.test.ts` for all logic/hooks (Vitest).
- **Component:** Write `.test.tsx` for complex UIs (Testing Library).
- **Mocking:** Mock `matchMedia`, `ResizeObserver`, and `WebContainer` in tests.
