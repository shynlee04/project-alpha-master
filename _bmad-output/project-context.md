---
project_name: 'project-alpha'
user_name: 'Admin'
date: '2026-01-01'
sections_completed: ['technology_stack', 'critical_rules', 'patterns', 'gotchas']
status: 'complete'
optimized_for_llm: true
---

# Project Context for AI Agents

_Critical rules and patterns for implementing code in Project Alpha. Focus on unobvious details that AI agents might otherwise miss._

---

## Technology Stack & Versions

### Core Framework

| Package | Version | Purpose |
|---------|---------|---------|
| `@tanstack/react-start` | 1.145.2 | Full-stack React framework (SSR/CSR) |
| `@tanstack/react-router` | 1.144.0 | File-based type-safe routing |
| `@tanstack/react-store` | 0.8.0 | State management |
| `react` | 19.2.3 | UI library |
| `vite` | 7.3.0 | Build tool |
| `typescript` | 5.9.3 | Language |

### State Management (Zustand)

| Package | Version | Purpose |
|---------|---------|---------|
| `zustand` | 5.0.9 | Global state management |
| `dexie` | 4.2.1 | IndexedDB persistence |

### UI & Styling

| Package | Version | Purpose |
|---------|---------|---------|
| `tailwindcss` | 4.1.18 | CSS framework |
| `lucide-react` | 0.562.0 | Icons |
| `sonner` | 2.0.7 | Toast notifications |

---

## Critical Implementation Rules

### 🔴 MUST DO - Store Slice Architecture

```typescript
// All agent slices must be composable
// NEVER duplicate state across slices (e.g., activeAgentId belongs to agent-selection-store)
// ALWAYS access cross-slice data via `get()` and proper type casting if needed (e.g. ProviderState)
```

### 🔴 MUST DO - Event Bus Usage

```typescript
// Use the SINGLETON infrastructure event bus
import { crossWorkspaceEventBus } from '@/infrastructure/events/cross-workspace-event-bus';
// Do NOT use the lib-layer event bus for store synchronization
```

### 🔴 MUST DO - Provider State Access

```typescript
// Models are stored in ProviderState, NOT AgentState
// Access: useAppStore.getState().availableModels
// Agent slices should NOT define `availableModels` property
```

### 🟡 ALWAYS - Strict Typing for Entities

```typescript
// Use strict types from `@/core/entities`
import type { Agent, AgentToolBinding } from '@/core/entities/Agent';
// Do NOT use `any` or loose string types for tool bindings
```

### 🟡 ALWAYS - Dexie Persistence Keys

```typescript
// Ensure Dexie keys match the store name exactly
// agent-selection-store -> 'agent-selection' (add to ViaGentDatabase interface)
```

---

## Code Patterns

### Component Architecture

```typescript
// Presentation Layer (Components) -> Infrastructure Layer (Stores/Events)
// Components should NEVER directly access Dexie or local storage
// Use Hooks: useAppStore(), useAgentsStore(), useAgentSelectionStore()
```

### Error Handling

```typescript
// Use ErrorBoundary for UI crashes
// Use toast.error() for user feedback
// Log errors via safeDebug() in development
```

---

## Gotchas & Warnings

| # | Warning | Impact |
|---|---------|--------|
| 1 | `activeAgentId` removed from `AgentsStore` | Use `AgentSelectionStore` instead |
| 2 | `useProviderStore` is deprecated | Use `useAppStore` directly |
| 3 | `AgentValidationSlice` type conflict | Check `availableModels` access |
| 4 | Dexie schema mismatch | update `via-gent-database.ts` |
| 5 | `AgentConfigDialog` provider ID | Ensure initialization before render |

---

## Usage Guidelines

**For AI Agents:**

-   **Read First**: Check `critical_rules` before modifying stores.
-   **Strict Types**: Use inferred types from Zod schemas where possible.
-   **State Access**: Prefer selectors over raw state access.

_Last Updated: 2026-01-01_
