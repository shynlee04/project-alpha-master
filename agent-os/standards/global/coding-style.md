---
document_id: STD-GLOBAL-CODING-STYLE-2025-12-27
title: General Coding Style Standards
version: 1.0.0
last_updated: 2025-12-27T13:45:00Z
phase: Implementation
team: Team A (Antigravity)
agent_mode: bmad-bmm-tech-writer
status: ACTIVE
---

# General Coding Style Standards

## Overview

This document defines general coding style standards for the Via-gent project to ensure consistent, readable, and maintainable code across the codebase.

**Project Context**: Via-gent uses TypeScript, React, and follows strict TypeScript configurations. The project uses ESLint and Prettier for code formatting and linting.

## TypeScript Configuration

### Strict Mode

The project uses strict TypeScript configuration:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "verbatimModuleSyntax": false
  }
}
```

Reference: [`tsconfig.json`](../../tsconfig.json)

### Path Aliases

Use path aliases for cleaner imports:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## Import Order

### Standard Import Order

Follow this import order:

1. React imports
2. Third-party libraries
3. Internal modules with `@/` alias
4. Relative imports

```typescript
// 1. React imports
import React, { useState, useEffect } from 'react';

// 2. Third-party libraries
import { z } from 'zod';
import { createRoute } from '@tanstack/react-router';

// 3. Internal modules with @/ alias
import { useIDEStore } from '@/lib/state/ide-store';
import { LocalFSAdapter } from '@/lib/filesystem/local-fs-adapter';

// 4. Relative imports
import { FileTreeItem } from './FileTreeItem';
import { useFileTreeState } from './hooks/useFileTreeState';
```

Reference: [`src/components/ide/FileTree/FileTree.tsx`](../../src/components/ide/FileTree/FileTree.tsx)

## Naming Conventions

### Variables and Functions

Use camelCase for variables and functions:

```typescript
// ✅ Good
const fileName = 'example.ts';
const readFile = async (path: string) => { ... };

// ❌ Bad
const file_name = 'example.ts';
const ReadFile = async (path: string) => { ... };
```

### Constants

Use UPPER_SNAKE_CASE for constants:

```typescript
// ✅ Good
const MAX_FILE_SIZE = 1024 * 1024; // 1MB
const DEFAULT_ENCODING = 'utf-8';

// ❌ Bad
const maxSize = 1024 * 1024;
const defaultEncoding = 'utf-8';
```

### Classes

Use PascalCase for classes:

```typescript
// ✅ Good
class FileSyncManager {
  constructor() { ... }
}

// ❌ Bad
class fileSyncManager {
  constructor() { ... }
}
```

### Interfaces

Use PascalCase for interfaces:

```typescript
// ✅ Good
export interface FileNode {
  id: string;
  name: string;
  children?: FileNode[];
}

// ❌ Bad
export interface fileNode {
  id: string;
  name: string;
  children?: fileNode[];
}
```

### Types

Use PascalCase for type aliases (prefer interfaces):

```typescript
// ✅ Good - prefer interface
export interface ComponentProps {
  title: string;
  onClick: () => void;
}

// ✅ Good - use type for unions
export type Status = 'loading' | 'success' | 'error';

// ❌ Bad - avoid type for object shapes
export type ComponentPropsType = {
  title: string;
  onClick: () => void;
};
```

### Enums

Use PascalCase for enums and UPPER_SNAKE_CASE for enum values:

```typescript
// ✅ Good
export enum SyncStatus {
  IDLE = 'idle',
  SYNCING = 'syncing',
  COMPLETED = 'completed',
  ERROR = 'error'
}

// ❌ Bad
export enum syncStatus {
  Idle = 'idle',
  Syncing = 'syncing'
}
```

## Code Formatting

### Indentation

Use 2 spaces for indentation:

```typescript
// ✅ Good
export function readFile(path: string) {
  const content = fs.readFileSync(path, 'utf-8');
  return content;
}

// ❌ Bad
export function readFile(path: string) {
    const content = fs.readFileSync(path, 'utf-8');
    return content;
}
```

### Line Length

Keep lines under 100 characters:

```typescript
// ✅ Good
const result = await fetch('/api/chat', {
  method: 'POST',
  body: JSON.stringify({ message: 'Hello' })
});

// ❌ Bad
const result = await fetch('/api/chat', { method: 'POST', body: JSON.stringify({ message: 'Hello' }) });
```

### Trailing Commas

Use trailing commas in multi-line structures:

```typescript
// ✅ Good
const config = {
  port: 3000,
  host: 'localhost',
  ssl: true,
};

// ❌ Bad
const config = {
  port: 3000,
  host: 'localhost',
  ssl: true
};
```

### Semicolons

Always use semicolons:

```typescript
// ✅ Good
const value = 42;
console.log(value);

// ❌ Bad
const value = 42
console.log(value)
```

## TypeScript Best Practices

### Type Annotations

Use explicit type annotations for function parameters and return types:

```typescript
// ✅ Good
function readFile(path: string): Promise<string> {
  return fs.promises.readFile(path, 'utf-8');
}

// ❌ Bad
function readFile(path) {
  return fs.promises.readFile(path, 'utf-8');
}
```

### Type Inference

Let TypeScript infer types when obvious:

```typescript
// ✅ Good - TypeScript infers number
const count = 0;

// ❌ Bad - redundant type annotation
const count: number = 0;
```

### Avoid `any`

Avoid using `any` type:

```typescript
// ✅ Good - use unknown or specific type
function processData(data: unknown) {
  if (typeof data === 'string') {
    return data.toUpperCase();
  }
  throw new Error('Invalid data type');
}

// ❌ Bad - using any
function processData(data: any) {
  return data.toUpperCase();
}
```

### Use `readonly` for Immutable Data

Use `readonly` for immutable data:

```typescript
// ✅ Good
interface Config {
  readonly apiKey: string;
  readonly maxRetries: number;
}

// ❌ Bad
interface Config {
  apiKey: string;
  maxRetries: number;
}
```

## React Best Practices

### Functional Components

Use functional components with hooks:

```typescript
// ✅ Good
export const Component: React.FC<Props> = ({ title }) => {
  return <div>{title}</div>;
};

// ❌ Bad - class component (unless necessary)
export class Component extends React.Component<Props> {
  render() {
    return <div>{this.props.title}</div>;
  }
}
```

### Hooks

Follow hooks rules:

```typescript
// ✅ Good - hooks at top level
export const Component = () => {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');

  useEffect(() => {
    document.title = `Count: ${count}`;
  }, [count]);

  return <div>{count}</div>;
};

// ❌ Bad - hooks inside conditionals
export const Component = () => {
  if (someCondition) {
    const [count, setCount] = useState(0); // ❌
  }
  return <div></div>;
};
```

### Props Destructuring

Destructure props at the top:

```typescript
// ✅ Good
export const Component: React.FC<ComponentProps> = ({
  title,
  description,
  onAction,
  children
}) => {
  return (
    <div>
      <h1>{title}</h1>
      <p>{description}</p>
      <button onClick={onAction}>Action</button>
      {children}
    </div>
  );
};

// ❌ Bad
export const Component: React.FC<ComponentProps> = (props) => {
  return (
    <div>
      <h1>{props.title}</h1>
      <p>{props.description}</p>
    </div>
  );
};
```

### Early Returns

Use early returns for conditional rendering:

```typescript
// ✅ Good
export const Component: React.FC<Props> = ({ data, isLoading }) => {
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!data) {
    return <div>No data</div>;
  }

  return <div>{data.name}</div>;
};

// ❌ Bad
export const Component: React.FC<Props> = ({ data, isLoading }) => {
  return (
    <div>
      {isLoading ? (
        <div>Loading...</div>
      ) : data ? (
        <div>{data.name}</div>
      ) : (
        <div>No data</div>
      )}
    </div>
  );
};
```

## Async/Await

### Prefer Async/Await

Prefer async/await over promises:

```typescript
// ✅ Good
async function loadData() {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error loading data:', error);
    throw error;
  }
}

// ❌ Bad
function loadData() {
  return fetch('/api/data')
    .then(response => response.json())
    .catch(error => {
      console.error('Error loading data:', error);
      throw error;
    });
}
```

### Error Handling

Always handle errors in async functions:

```typescript
// ✅ Good
async function saveFile(path: string, content: string) {
  try {
    await fs.promises.writeFile(path, content);
  } catch (error) {
    if (error instanceof Error) {
      throw new FileSystemError(`Failed to save file: ${error.message}`);
    }
    throw error;
  }
}

// ❌ Bad - no error handling
async function saveFile(path: string, content: string) {
  await fs.promises.writeFile(path, content);
}
```

## Comments

### JSDoc Comments

Use JSDoc for function documentation:

```typescript
/**
 * Reads a file from the file system.
 * 
 * @param path - The path to the file to read
 * @returns The file content as a string
 * @throws {FileSystemError} If the file cannot be read
 * 
 * @example
 * ```typescript
 * const content = await readFile('/path/to/file.txt');
 * ```
 */
export async function readFile(path: string): Promise<string> {
  return fs.promises.readFile(path, 'utf-8');
}
```

### Inline Comments

Use inline comments sparingly:

```typescript
// ✅ Good - explains why
// Use debounce to avoid excessive file sync operations
const debouncedSync = debounce(syncFiles, 300);

// ❌ Bad - explains what (obvious)
// Define a function to read files
const readFile = (path: string) => { ... };
```

### TODO Comments

Use TODO comments for future work:

```typescript
// TODO: Implement file locking for concurrent operations
// TODO: Add support for binary files
// TODO: Refactor to use async/await consistently
```

## Code Organization

### File Structure

Organize files logically:

```
src/
├── components/
│   ├── ide/
│   │   ├── MonacoEditor/
│   │   │   ├── MonacoEditor.tsx
│   │   │   ├── hooks/
│   │   │   └── index.ts
│   │   └── FileTree/
│   ├── chat/
│   └── ui/
├── lib/
│   ├── agent/
│   ├── filesystem/
│   └── webcontainer/
├── hooks/
├── routes/
└── types/
```

### Barrel Exports

Use barrel exports for clean imports:

```typescript
// src/components/ide/index.ts
export { MonacoEditor } from './MonacoEditor';
export { FileTree } from './FileTree';
export { XTerminal } from './XTerminal';

// Usage
import { MonacoEditor, FileTree, XTerminal } from '@/components/ide';
```

Reference: [`src/components/chat/index.ts`](../../src/components/chat/index.ts)

## ESLint and Prettier

### ESLint Configuration

The project uses ESLint for code quality:

```json
{
  "rules": {
    "no-console": "warn",
    "no-unused-vars": "error",
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

Reference: [`eslint.config.mjs`](../../eslint.config.mjs)

### Prettier Configuration

The project uses Prettier for code formatting:

```json
{
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

Reference: [`.prettierrc`](../../.prettierrc)

## Best Practices

### 1. Keep Functions Small

Keep functions focused and small:

```typescript
// ✅ Good - focused function
function validateFilePath(path: string): boolean {
  return path.length > 0 && !path.includes('..');
}

// ❌ Bad - does too much
function processFile(path: string) {
  if (path.length === 0) return;
  if (path.includes('..')) return;
  const content = fs.readFileSync(path);
  const lines = content.split('\n');
  const filtered = lines.filter(line => line.trim());
  return filtered.join('\n');
}
```

### 2. Avoid Deep Nesting

Avoid deep nesting:

```typescript
// ✅ Good - early returns
function processFile(file: File | null) {
  if (!file) return null;
  if (!file.exists()) return null;
  if (file.size > MAX_SIZE) return null;
  return file.content;
}

// ❌ Bad - deep nesting
function processFile(file: File | null) {
  if (file) {
    if (file.exists()) {
      if (file.size <= MAX_SIZE) {
        return file.content;
      }
    }
  }
  return null;
}
```

### 3. Use Meaningful Names

Use descriptive names:

```typescript
// ✅ Good
const maxFileSize = 1024 * 1024;
const hasWritePermission = checkPermission('write');

// ❌ Bad
const ms = 1024 * 1024;
const p = checkPermission('write');
```

### 4. DRY (Don't Repeat Yourself)

Extract repeated code:

```typescript
// ✅ Good - extracted function
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// ❌ Bad - repeated code
const date1 = new Date();
const formatted1 = date1.toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});

const date2 = new Date();
const formatted2 = date2.toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});
```

## References

### Internal Documentation

- [`project-architecture-analysis-2025-12-27.md`](../../_bmad-output/documentation/project-architecture-analysis-2025-12-27.md) - Architecture analysis
- [`development-workflow-2025-12-27.md`](../../_bmad-output/documentation/development-workflow-2025-12-27.md) - Development workflow

### External Documentation

- **TypeScript**: [https://www.typescriptlang.org/docs/](https://www.typescriptlang.org/docs/)
- **React**: [https://react.dev/learn](https://react.dev/learn)
- **ESLint**: [https://eslint.org/docs/latest/](https://eslint.org/docs/latest/)
- **Prettier**: [https://prettier.io/docs/en/](https://prettier.io/docs/en/)

### Configuration Files

- [`tsconfig.json`](../../tsconfig.json) - TypeScript configuration
- [`eslint.config.mjs`](../../eslint.config.mjs) - ESLint configuration
- [`.prettierrc`](../../.prettierrc) - Prettier configuration

---

**Document Status**: Active
**Last Updated**: 2025-12-27T13:45:00Z
**Next Review**: 2026-01-27