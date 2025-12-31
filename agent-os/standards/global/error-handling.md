---
date: 2025-12-31
time: 03:25:00
phase: Standards Update
team: Team-A
agent_mode: bmad-core-bmad-master
---

# Error Handling Standards

## Overview

This document defines the error handling patterns and practices for the Via-gent project. All error handling must follow these standards to ensure consistent, user-friendly error experiences and maintainable code.

## Error Classification

### Error Severity Levels

| Level | Name | Description | User Notification |
|-------|------|-------------|-------------------|
| **L1** | `Info` | Informational messages | Toast/Silent |
| **L2** | `Warning` | Non-blocking issues | Toast |
| **L3** | `Error` | Recoverable errors | Toast + Retry |
| **L4** | `Critical` | Application-breaking | Full-screen ErrorState |
| **L5** | `Fatal` | Data loss possible | Full-screen + Report |

### Error Categories

```typescript
// src/lib/utils/error-classification.ts

export type ErrorCategory = 
  | 'sync'           // File sync errors
  | 'permission'     // FSA permission errors
  | 'webcontainer'   // WebContainer errors
  | 'agent'          // AI agent/tool errors
  | 'network'        // Network/API errors
  | 'validation'     // Input validation errors
  | 'filesystem'     // File system errors
  | 'ui'             // UI rendering errors
  | 'unknown';       // Uncategorized errors

export interface AppError {
  category: ErrorCategory;
  severity: 1 | 2 | 3 | 4 | 5;
  code: string;
  message: string;
  userMessage: string;
  technicalDetails?: Record<string, unknown>;
  recoveryAction?: string;
}
```

## Custom Error Classes

### Sync Errors

```typescript
// src/lib/filesystem/sync-types.ts

export class SyncError extends Error {
  readonly code: string;
  readonly path: string;
  readonly recoverable: boolean;

  constructor(
    message: string,
    code: string,
    path: string,
    options?: { recoverable?: boolean }
  ) {
    super(message);
    this.name = 'SyncError';
    this.code = code;
    this.path = path;
    this.recoverable = options?.recoverable ?? true;
  }
}

// Specific sync error codes
export const SyncErrorCodes = {
  FILE_NOT_FOUND: 'SYNC_001',
  PERMISSION_DENIED: 'SYNC_002',
  CONFLICT: 'SYNC_003',
  SYNC_IN_PROGRESS: 'SYNC_004',
  WEBTAINER_NOT_READY: 'SYNC_005',
  HANDLE_INVALID: 'SYNC_006',
} as const;
```

### File System Errors

```typescript
// src/lib/filesystem/fs-errors.ts

export class FileSystemError extends Error {
  readonly code: string;
  readonly path: string;

  constructor(
    message: string,
    code: string,
    path: string
  ) {
    super(message);
    this.name = 'FileSystemError';
    this.code = code;
    this.path = path;
  }
}

export class PermissionDeniedError extends FileSystemError {
  readonly handleType: 'file' | 'directory';

  constructor(path: string, handleType: 'file' | 'directory') {
    super(
      `Permission denied for ${handleType}: ${path}`,
      'FS_PERMISSION_DENIED',
      path
    );
    this.name = 'PermissionDeniedError';
    this.handleType = handleType;
  }
}
```

### Agent Tool Errors

```typescript
// src/lib/agent/tools/tool-error.ts

export class ToolExecutionError extends Error {
  readonly toolName: string;
  readonly args: Record<string, unknown>;
  readonly exitCode?: number;

  constructor(
    message: string,
    toolName: string,
    args: Record<string, unknown>,
    options?: { exitCode?: number }
  ) {
    super(message);
    this.name = 'ToolExecutionError';
    this.toolName = toolName;
    this.args = args;
    this.exitCode = options?.exitCode;
  }
}

export class ToolTimeoutError extends ToolExecutionError {
  readonly timeoutMs: number;

  constructor(
    toolName: string,
    args: Record<string, unknown>,
    timeoutMs: number
  ) {
    super(
      `Tool '${toolName}' timed out after ${timeoutMs}ms`,
      toolName,
      args
    );
    this.name = 'ToolTimeoutError';
    this.timeoutMs = timeoutMs;
  }
}
```

## Error Boundary Implementation

### Component Error Boundary

```typescript
// src/components/common/ErrorBoundary.tsx

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorState } from '@/components/ui/ErrorState';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[ErrorBoundary] Caught error:', error);
    console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);
    
    this.props.onError?.(error, errorInfo);
    
    // Report to Sentry if available
    if (typeof window !== 'undefined' && 'Sentry' in window) {
      (window as unknown as { Sentry: { captureException: (e: Error) => void } }).Sentry
        .captureException(error);
    }
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <ErrorState
          error={this.state.error}
          onRetry={() => this.setState({ hasError: false, error: null })}
        />
      );
    }

    return this.props.children;
  }
}
```

### Hook-Based Error Handler

```typescript
// src/lib/utils/error-handling.ts

import { useCallback } from 'react';
import { toast } from 'sonner';

export function useErrorHandler() {
  const handleError = useCallback((error: unknown) => {
    // Normalize to AppError
    const appError = normalizeError(error);
    
    // Log to console
    console.error('[ErrorHandler]', appError);
    
    // User notification based on severity
    switch (appError.severity) {
      case 1: // Info
        toast.info(appError.userMessage);
        break;
      case 2: // Warning
        toast.warning(appError.userMessage);
        break;
      case 3: // Error
        toast.error(appError.userMessage, {
          action: appError.recoveryAction ? {
            label: appError.recoveryAction,
            onClick: () => { /* Trigger recovery */ }
          } : undefined
        });
        break;
      case 4: // Critical
      case 5: // Fatal
        // These trigger full-screen error state
        showCriticalError(appError);
        break;
    }
    
    return appError;
  }, []);

  return { handleError };
}

function normalizeError(error: unknown): AppError {
  if (isAppError(error)) {
    return error;
  }
  
  if (error instanceof Error) {
    return {
      category: 'unknown',
      severity: 3,
      code: 'UNKNOWN_ERROR',
      message: error.message,
      userMessage: getDefaultUserMessage(error.message),
      technicalDetails: { stack: error.stack },
    };
  }
  
  return {
    category: 'unknown',
    severity: 3,
    code: 'UNKNOWN',
    message: String(error),
    userMessage: 'An unexpected error occurred',
  };
}
```

## Error State Components

### ErrorState Component

```typescript
// src/components/ui/ErrorState.tsx

import React from 'react';
import { AlertTriangle, RefreshCw, Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface ErrorStateProps {
  error: Error | null;
  title?: string;
  message?: string;
  onRetry?: () => void;
  onReport?: () => void;
  className?: string;
}

export function ErrorState({
  error,
  title = 'Something went wrong',
  message,
  onRetry,
  onReport,
  className
}: ErrorStateProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center p-8 text-center',
      'min-h-[400px] bg-background',
      className
    )}>
      <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
        <AlertTriangle className="w-8 h-8 text-destructive" />
      </div>
      
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      
      {message && (
        <p className="text-muted-foreground mb-4 max-w-md">{message}</      )}
      
      {error && process.env.NODE_ENV === 'development' && (
        <pre className="text-xs bg-muted p-4 rounded-md mb-4 max-w-2xl overflow-auto">
          {error.message}
          {error.stack && `\n\n${error.stack}`}
        </pre>
      )}
      
      <div className="flex gap-3">
        {onRetry && (
          <Button onClick={onRetry} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        )}
        {onReport && (
          <Button onClick={onReport} variant="default">
            <Mail className="w-4 h-4 mr-2" />
            Report Issue
          </Button>
        )}
      </div>
    </div>
  );
}
```

## Async Error Handling Pattern

### try/catch with Resource Cleanup

```typescript
// ✅ REQUIRED: Always use try/catch for async operations
async function syncFile(path: string): Promise<void> {
  try {
    const handle = await getFileHandle(path);
    const content = await handle.getFile();
    await webcontainerInstance.fs.writeFile(path, content);
    toast.success('File synced successfully');
  } catch (error) {
    // ✅ REQUIRED: Use custom error classes
    if (error instanceof PermissionDeniedError) {
      // Handle permission specifically
      await requestPermission(path);
    } else if (error instanceof SyncError) {
      // Handle sync errors
      await handleSyncError(error);
    } else {
      // ✅ REQUIRED: Wrap unexpected errors
      throw new SyncError(
        `Failed to sync file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'SYNC_UNKNOWN',
        path,
        { recoverable: true }
      );
    }
  }
}
```

### Async Wrapper Pattern

```typescript
// ✅ RECOMMENDED: Use asyncWrapper for consistent error handling

type AsyncFunction<T> = () => Promise<T>;

interface AsyncResult<T> {
  data: T | null;
  error: AppError | null;
  isLoading: boolean;
}

function asyncWrapper<T>(
  fn: AsyncFunction<T>,
  options?: { showLoading?: boolean }
): AsyncResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<AppError | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const execute = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await fn();
      setData(result);
      return result;
    } catch (err) {
      const appError = normalizeError(err);
      setError(appError);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { data, error, isLoading, execute };
}
```

## Error Recovery Patterns

### Retry with Backoff

```typescript
// src/lib/utils/retry.ts

interface RetryOptions {
  maxAttempts?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryCondition?: (error: Error) => boolean;
}

async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
    retryCondition = () => true
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxAttempts || !retryCondition(lastError)) {
        throw lastError;
      }

      const delay = Math.min(
        baseDelay * Math.pow(backoffMultiplier, attempt - 1),
        maxDelay
      );

      console.warn(`[Retry] Attempt ${attempt} failed, retrying in ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
```

### Graceful Degradation

```typescript
// Detect capabilities and degrade gracefully
function getAppropriateHandler(): FileHandler {
  if (!supportsFileSystemAccess()) {
    return new IndexedDBFileHandler();
  }
  
  if (!supportsWebContainer()) {
    return new LocalOnlyHandler();
  }
  
  return new FullFeatureHandler();
}

// Usage with fallback
const handler = getAppropriateHandler();
await handler.readFile(path).catch(handleError);
```

## Toast Notifications

### sonner Integration

```typescript
// ✅ REQUIRED: Use sonner for toast notifications

import { toast } from 'sonner';

// Success
toast.success('File saved successfully');

// Error with action
toast.error('Failed to save file', {
  action: {
    label: 'Retry',
    onClick: () => saveFile()
  }
});

// Promise toast
const promise = saveFile();
toast.promise(promise, {
  loading: 'Saving file...',
  success: 'File saved!',
  error: 'Failed to save'
});
```

## Error Logging

### Console Logging Standards

```typescript
// ✅ REQUIRED: Use appropriate log levels

console.debug('[Sync] Starting sync operation');   // Development-only
console.info('[Sync] File synced successfully');    // Normal operations
console.warn('[Sync] Sync conflict detected');      // Non-critical issues
console.error('[Sync] Sync failed:', error);        // Errors (always with context)
```

### Sentry Integration

```typescript
// src/lib/monitoring/sentry.ts

import * as Sentry from '@sentry/react';

export function initSentry() {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    tracesSampleRate: 0.1,
    
    // Filter out known non-critical errors
    beforeSend(event, hint) {
      const error = hint.originalException;
      if (error instanceof PermissionDeniedError) {
        return null; // Don't report permission errors
      }
      return event;
    },
  });
}

export const SentryErrorBoundary = Sentry.ErrorBoundary;
```

## Related Documents

- [`coding-style.md`](coding-style.md) - Coding style standards
- [`validation.md`](validation.md) - Input validation standards
- [`project-context.md`](../../../../_bmad-output/project-planning-artifacts/project-context.md) - Project context and constraints
- [`AGENTS.md`](../../../../AGENTS.md) - Project-specific dev patterns
