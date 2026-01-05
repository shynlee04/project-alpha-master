# Error Handling Patterns Documentation

This document describes the error handling patterns and strategies used throughout the Via-gent application.

## Error Handling Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Error Boundary Chain                      │
├─────────────────────────────────────────────────────────────┤
│  AppErrorBoundary (Root)                                    │
│  ├── ThemeProvider Error                                    │
│  ├── LocaleProvider Error                                   │
│  ├── TooltipProvider Error                                  │
│  ├── AppInitializer Error                                   │
│  ├── UnifiedWorkspaceProvider Error                         │
│  │   └── Route Component Error                              │
│  │       ├── IDEWorkspace Error                             │
│  │       ├── SettingsPage Error                             │
│  │       │   └── AgentConfigDialog Error                    │
│  │       └── ...                                            │
│  └── MigrationStatus Error                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Global Error Boundary

### AppErrorBoundary (Root Level)

```tsx
// src/routes/__root.tsx
<AppErrorBoundary>
  <Outlet />
</AppErrorBoundary>
```

**Purpose:**
- Catches React rendering errors for the entire app
- Prevents app crash from propagating
- Provides fallback UI

---

## Component-Level Error Boundaries

### Settings Page Error Boundary

```tsx
// src/routes/settings.tsx
<ErrorBoundary
  fallback={
    <div className="p-6 text-center">
      <h2 className="text-lg font-bold mb-2">Agent Configuration Failed</h2>
      <p className="text-muted-foreground mb-4">
        The agent configuration dialog encountered an unexpected error.
      </p>
      <Button onClick={() => setIsDialogOpen(false)}>
        Close Dialog
      </Button>
    </div>
  }
  onError={(error) => {
    console.error('[SettingsPage] AgentConfigDialog error:', error);
  }}
>
  <AgentConfigDialog
    open={isDialogOpen}
    onOpenChange={setIsDialogOpen}
    onSuccess={handleAgentSuccess}
    agentId={null}
  />
</ErrorBoundary>
```

---

## API Error Handling

### Chat API Error Handling

```typescript
// src/routes/api/chat.ts
POST: async ({ request }) => {
  try {
    // Parse and validate request
    const body = await request.json();
    const validation = validateChatRequest(body);

    if (!validation.success) {
      logValidationError(/* ... */);
      return createValidationErrorResponse(
        validation.error.message,
        validation.error.details
      );
    }

    // Process chat request
    // ...

  } catch (error) {
    console.error('[/api/chat] Error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      500
    );
  }
}
```

### Error Response Helper

```typescript
// src/routes/api/chat.ts
function errorResponse(message: string, status: number) {
  return new Response(
    JSON.stringify({ error: message }),
    { status, headers: { 'Content-Type': 'application/json' } }
  );
}
```

### Validation Error Logging

```typescript
// src/routes/api/chat.ts
function logValidationError(
  path: string,
  error: string,
  requestInfo?: {
    providerId?: string;
    messageCount?: number;
    timestamp: number;
  }
) {
  console.log('[/api/chat] Validation error:', {
    path,
    error,
    providerId: requestInfo?.providerId,
    messageCount: requestInfo?.messageCount,
    timestamp: new Date(requestInfo?.timestamp).toISOString(),
  });
}
```

---

## Flashcards API Error Handling

```typescript
// src/routes/api/flashcards/generate.ts
try {
  // Generate flashcards
  let result: FlashcardGenerationResult;

  if (validRequest.useMock) {
    const mockGenerator = new MockFlashcardGenerator();
    result = mockGenerator.generateMockFlashcards(/* ... */);
  } else {
    result = await generateFlashcards(/* ... */);
  }

  return json({ success: true, data: result });

} catch (error) {
  console.error('Flashcard generation error:', error);

  // Specific error type handling
  if (error instanceof Error) {
    if (error.message.includes('API key') || error.message.includes('authentication')) {
      return errorResponse('Authentication failed. Please check your API key.', 401);
    }
    if (error.message.includes('rate limit') || error.message.includes('429')) {
      return errorResponse('Rate limit exceeded. Please try again later.', 429);
    }
  }

  return errorResponse('Failed to generate flashcards. Please try again.', 500);
}
```

---

## Quiz Generation API Error Handling

```typescript
// src/routes/api/quizzes/generate.ts
try {
  const body = await request.json();
  const validated = validateRequest(body);

  if (!validated.success) {
    return errorResponse('Invalid request', validated.error, 400);
  }

  // Check for API key
  const apiKey = request.headers.get('x-gemini-api-key') || undefined;

  if (!apiKey) {
    // Use mock generator
    const mockQuiz = mockGenerator.generateMockQuiz(/* ... */);
    return json({ success: true, data: mockQuiz });
  }

  // TODO: Real generation (Epic 6 pending)
  return errorResponse(
    'Source content loading not yet implemented',
    { message: 'Epic 6 (Source Ingestion) must be completed first' },
    501
  );

} catch (error) {
  console.error('Quiz generation error:', error);
  return errorResponse(
    'Failed to generate quiz',
    { message: error instanceof Error ? error.message : 'Unknown error' },
    500
  );
}
```

---

## File System Error Handling

### FileSystemError Class

```typescript
// src/lib/filesystem/fs-errors.ts
class FileSystemError extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = 'FileSystemError';
    this.code = code;
  }
}
```

### PermissionDeniedError

```typescript
// src/routes/test-fs-adapter.tsx
try {
  const handle = await adapter.requestDirectoryAccess();
  setHasAccess(true);
  setStatus(`✅ Directory access granted: ${handle.name}`);
} catch (error: any) {
  if (error instanceof PermissionDeniedError) {
    setStatus(`❌ Permission denied: ${error.message}`);
  } else if (error instanceof FileSystemError) {
    setStatus(`❌ FileSystem error: ${error.message}`);
  } else {
    setStatus(`❌ Error: ${error.message}`);
  }
}
```

### Path Traversal Protection

```typescript
// src/routes/test-fs-adapter.tsx
try {
  await adapter.readFile('../../../etc/passwd');
  setStatus('❌ Path validation failed - security issue!');
} catch (error: any) {
  if (error instanceof FileSystemError && error.code === 'PATH_TRAVERSAL') {
    setStatus('✅ Path validation working - traversal attack blocked');
  } else {
    const deviceType = useDeviceType();
    if (deviceType.isMobile || deviceType.isTablet) {
      setStatus('❌ Desktop Feature: File System Access API requires a desktop browser');
    } else {
      setStatus(`❌ Unexpected error: ${error.message}`);
    }
  }
}
```

---

## Loading States

### IDE Workspace Loading

```typescript
// src/routes/ide.tsx
function IDEWorkspace() {
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLastProject = async () => {
      const { listProjects } = await import('@/lib/workspace/project-store');
      const projects = await listProjects();
      if (projects.length > 0) {
        setProject(projects[0] as Project);
      }
      setIsLoading(false);
    };
    loadLastProject();
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          <p className="text-muted-foreground">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-4 max-w-md text-center p-6 border rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold">No Open Project</h2>
          <p className="text-muted-foreground">
            No recent projects were found.
          </p>
          <a href="/" className="px-4 py-2 bg-primary text-primary-foreground rounded-md">
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return <IDELayout />;
}
```

### Lazy Loading Suspense

```tsx
<Suspense fallback={
  <div className="h-screen w-screen flex items-center justify-center bg-background">
    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
  </div>
}>
  <IDELayout />
</Suspense>
```

---

## Toast Notifications

### ToastProvider Pattern

```tsx
// Used across workspace routes
<ToastProvider>
  <Suspense fallback={<Loading />}>
    <IDELayout />
  </Suspense>
  <Toast />
</ToastProvider>
```

---

## Sentry Integration

### Sentry Initialization

```typescript
// src/routes/__root.tsx
function initSentry(): boolean {
  if (typeof window === 'undefined') return false;

  if (!import.meta.env.VITE_SENTRY_DSN) {
    console.log('Sentry DSN not configured, skipping Sentry init');
    return false;
  }

  try {
    import('@sentry/react').then((Sentry) => {
      Sentry.init({
        dsn: import.meta.env.VITE_SENTRY_DSN,
        environment: import.meta.env.MODE,
        // Additional config
      });
    });
    return true;
  } catch (error) {
    console.error('Failed to initialize Sentry:', error);
    return false;
  }
}

if (typeof window !== 'undefined') {
  initSentry();
}
```

---

## Error Codes Reference

| Error Code | Source | HTTP Status | Description |
|------------|--------|-------------|-------------|
| `MISSING_API_KEY` | chat.ts | 401 | API key not provided |
| `INVALID_JSON` | chat.ts | 400 | Invalid JSON in request body |
| `VALIDATION_ERROR` | chat.ts | 400 | Validation failed |
| `AUTHENTICATION_FAILED` | flashcards.ts | 401 | Invalid API key |
| `RATE_LIMIT` | flashcards.ts | 429 | Too many requests |
| `NOT_IMPLEMENTED` | quizzes.ts | 501 | Feature pending |
| `INTERNAL_ERROR` | All APIs | 500 | Server error |
| `PATH_TRAVERSAL` | fs-adapter.ts | 403 | Security violation |
| `PERMISSION_DENIED` | fs-adapter.ts | 403 | FSA permission denied |

---

## Error Boundary Best Practices

### 1. Specific Fallback Components

```tsx
<ErrorBoundary
  fallback={
    <div className="p-6 text-center">
      <h2 className="text-lg font-bold mb-2">Failed to Load Agent</h2>
      <p className="text-muted-foreground mb-4">
        Unable to load agent configuration. Please try again.
      </p>
      <Button onClick={onRetry}>Retry</Button>
    </div>
  }
>
  <AgentConfigDialog />
</ErrorBoundary>
```

### 2. Error Logging

```tsx
<ErrorBoundary
  onError={(error, componentStack) => {
    console.error('Component error:', error);
    console.error('Component stack:', componentStack);
    // Send to monitoring service
  }}
>
```

### 3. Recovery Actions

```tsx
<ErrorBoundary
  fallback={({ error, resetErrorBoundary }) => (
    <div className="p-6">
      <h2>Something went wrong</h2>
      <p>{error.message}</p>
      <div className="flex gap-4 mt-4">
        <Button onClick={resetErrorBoundary}>Retry</Button>
        <Button onClick={() => window.location.reload()}>Reload Page</Button>
      </div>
    </div>
  )}
>
```

---

## Summary

| Error Type | Handler | Location |
|------------|---------|----------|
| React rendering errors | ErrorBoundary | Components |
| API validation errors | createValidationErrorResponse | API routes |
| API server errors | errorResponse helper | API routes |
| FSA permission errors | PermissionDeniedError | Test page |
| FSA security errors | FileSystemError | Test page |
| Global React errors | AppErrorBoundary | Root route |
| Monitoring | Sentry | Init in root |
