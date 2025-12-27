# Naming Convention Guidelines

**Document ID**: P2-NAMING-2025-12-26  
**Created**: 2025-12-26T18:57:00Z  
**Status**: Completed

## Overview

This document establishes consistent naming conventions for the Via-gent codebase to improve code readability and maintainability.

## Naming Convention Standards

### 1. React Components

**Pattern**: PascalCase  
**Extension**: `.tsx`  
**Location**: `src/components/` and subdirectories

**Examples**:
- `AgentChatPanel.tsx`
- `ChatPanel.tsx`
- `IDELayout.tsx`
- `MonacoEditor.tsx`
- `StreamingMessage.tsx`

**Rationale**: PascalCase is the standard React convention for component names, making them easily distinguishable from functions and variables.

### 2. TypeScript Files (Non-Components)

**Pattern**: camelCase  
**Extension**: `.ts`  
**Location**: `src/lib/`, `src/hooks/`, `src/routes/`

**Examples**:
- `agent-factory.ts`
- `file-sync-manager.ts`
- `use-agent-chat.ts`
- `credential-vault.ts`
- `model-registry.ts`

**Rationale**: camelCase follows JavaScript/TypeScript conventions for modules, utilities, and helper functions.

### 3. React Hooks

**Pattern**: `useCamelCase`  
**Extension**: `.ts` or `.tsx`  
**Location**: `src/hooks/` and feature-specific `hooks/` directories

**Examples**:
- `useAgentChat.ts`
- `useAgentChatWithTools.ts`
- `useIdeStatePersistence.ts`
- `useProcessManager.ts`
- `useWorkspaceEvent.ts`

**Rationale**: The `use` prefix is the standard React convention for custom hooks, making them easily recognizable.

### 4. Constants

**Pattern**: UPPER_SNAKE_CASE  
**Extension**: `.ts`  
**Location**: `src/lib/` and feature directories

**Examples**:
- `MAX_ITERATIONS.ts`
- `DEFAULT_TIMEOUT.ts`
- `SYNC_EXCLUSIONS.ts`
- `WEB_CONTAINER_CONFIG.ts`

**Rationale**: UPPER_CASE clearly distinguishes constants from variables and functions, following common JavaScript conventions.

### 5. Types and Interfaces

**Pattern**: PascalCase  
**Extension**: `.ts`  
**Location**: `src/types/` and co-located with implementation files

**Examples**:
- `AgentConfig.ts`
- `FileOperationResult.ts`
- `SyncStatus.ts`
- `WebContainerState.ts`

**Rationale**: PascalCase for types aligns with component names, making type definitions intuitive.

### 6. Test Files

**Pattern**: Same name as source file with `.test.ts` or `.test.tsx` extension  
**Location**: `__tests__/` directories adjacent to source files

**Examples**:
- `agent-factory.test.ts`
- `AgentChatPanel.test.tsx`
- `sync-manager.test.ts`
- `use-agent-chat.test.ts`

**Rationale**: Co-locating tests with `.test` extension makes test files easily discoverable and maintains clear association with source files.

### 7. Utility Functions

**Pattern**: camelCase  
**Extension**: `.ts`  
**Location**: `src/lib/utils.ts`, `src/lib/` utility files

**Examples**:
- `format-date.ts`
- `validate-email.ts`
- `parse-json.ts`
- `debounce.ts`

**Rationale**: camelCase is the standard convention for utility functions in JavaScript/TypeScript.

### 8. Component Directories

**Pattern**: kebab-case  
**Location**: `src/components/` and feature directories

**Examples**:
- `agent/`
- `chat/`
- `ide/`
- `ui/`
- `layout/`

**Rationale**: kebab-case for directories follows common web development conventions and improves readability in file explorers.

### 9. Barrel Export Files

**Pattern**: `index.ts`  
**Location**: Each directory that exports multiple modules

**Examples**:
- `src/components/agent/index.ts`
- `src/lib/agent/index.ts`
- `src/lib/state/index.ts`

**Rationale**: `index.ts` is the standard convention for barrel exports, providing clean import paths.

## File Naming Patterns Summary

| File Type | Pattern | Extension | Example |
|------------|----------|-------------|----------|
| React Components | PascalCase | `.tsx` | `AgentChatPanel.tsx` |
| TypeScript Modules | camelCase | `.ts` | `agent-factory.ts` |
| React Hooks | `useCamelCase` | `.ts` | `useAgentChat.ts` |
| Constants | UPPER_SNAKE_CASE | `.ts` | `MAX_ITERATIONS.ts` |
| Types/Interfaces | PascalCase | `.ts` | `AgentConfig.ts` |
| Tests | SourceName.test | `.ts/.tsx` | `agent-factory.test.ts` |
| Utilities | camelCase | `.ts` | `format-date.ts` |
| Directories | kebab-case | - | `agent/` |
| Barrel Exports | `index.ts` | `.ts` | `index.ts` |

## Code Style Guidelines

### Import Order

1. React imports
2. Third-party library imports
3. Internal module imports with `@/` alias
4. Relative imports

**Example**:
```typescript
import { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { useIDEStore } from '@/lib/state/ide-store';
import { LocalFSAdapter } from './local-fs-adapter';
```

### Component Props

**Pattern**: Interface with PascalCase name + `Props` suffix

**Example**:
```typescript
interface AgentChatPanelProps {
  agentId: string;
  onSendMessage: (message: string) => void;
}
```

**Rationale**: Clear prop interfaces improve type safety and IDE autocomplete.

### Type Aliases vs Interfaces

**Preference**: Use `interface` for component props and object shapes  
**Use**: `type` for union types, function types, and complex type compositions

**Example**:
```typescript
// Use interface for object shapes
interface AgentConfig {
  id: string;
  name: string;
}

// Use type for unions
type AgentStatus = 'idle' | 'running' | 'completed';

// Use type for function types
type SendMessageHandler = (message: string) => void;
```

## Enforcement

### Linting

The project uses ESLint with TypeScript rules to enforce naming conventions. Ensure:

1. ESLint is configured to check naming patterns
2. TypeScript strict mode is enabled
3. No unused imports or variables
4. Consistent naming across the codebase

### Pre-commit Hooks

Consider adding pre-commit hooks to:
1. Run ESLint on staged files
2. Check for naming convention violations
3. Prevent commits with naming issues

## Migration Guide

When renaming files to follow these conventions:

1. **Update file name** to match the pattern
2. **Update all imports** referencing the old name
3. **Update barrel exports** if applicable
4. **Run tests** to ensure no broken imports
5. **Update documentation** if the file is referenced

## Examples of Good Naming

### Components
```typescript
// ✅ Good
export function AgentChatPanel({ agentId }: AgentChatPanelProps) {
  return <div>...</div>;
}

// ❌ Bad
export function agentChatPanel({ agent_id }: agent_chat_panel_props) {
  return <div>...</div>;
}
```

### Hooks
```typescript
// ✅ Good
export function useAgentChat(agentId: string) {
  // ...
}

// ❌ Bad
export function UseAgentChat(agentId: string) {
  // ...
}
```

### Constants
```typescript
// ✅ Good
export const MAX_ITERATIONS = 3;
export const SYNC_EXCLUSIONS = ['.git', 'node_modules'];

// ❌ Bad
export const maxIterations = 3;
export const syncExclusions = ['.git', 'node_modules'];
```

## Related Documents

- [P2 Fixes Implementation](./p2-fixes-implementation-2025-12-26.md) - Complete P2 implementation plan
- [Governance Audit Report](../governance-audit/governance-audit-report-2025-12-26.md) - Original audit findings
- [Remediation Plan](../governance-audit/remediation-plan-2025-12-26.md) - P2 remediation steps

## Approval

- **Status**: Approved for implementation
- **Next Steps**: Add to development guidelines and enforce through linting
- **Owner**: Dev Team

---

**Document End**
