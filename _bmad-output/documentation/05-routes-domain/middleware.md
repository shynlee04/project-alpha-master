# Middleware and Route Guards Documentation

This document describes the middleware patterns, route guards, and protection mechanisms used in the Via-gent application.

## Overview

The Via-gent application uses TanStack Router's middleware capabilities for:
- Error handling boundaries
- Provider wrapping
- Authentication/authorization (future)
- Data preloading
- Route validation

---

## Provider Middleware (Root Level)

### Root Route Providers

The `__root.tsx` file wraps all routes with critical providers:

```tsx
// src/routes/__root.tsx
export const Route = createRootRoute({
  head: () => ({ /* meta, links, scripts */ }),
  component: () => (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider>
          <LocaleProvider>
            <TooltipProvider>
              <AppInitializer>
                <UnifiedWorkspaceProvider>
                  <AppErrorBoundary>
                    <Outlet />
                  </AppErrorBoundary>
                </UnifiedWorkspaceProvider>
              </AppInitializer>
            </TooltipProvider>
          </LocaleProvider>
        </ThemeProvider>
        <MigrationStatus />
        <Scripts />
      </body>
    </html>
  ),
});
```

### Provider Chain

| Provider | Purpose | Scope |
|----------|---------|-------|
| ThemeProvider | 8-bit dark theme styling | Global |
| LocaleProvider | Internationalization (i18n) | Global |
| TooltipProvider | UI tooltip functionality | Global |
| AppInitializer | App initialization tasks | Global |
| UnifiedWorkspaceProvider | Workspace state management | Global |
| AppErrorBoundary | Global error boundary | Global |
| MigrationStatus | Data migration overlay | Global |

---

## Error Boundaries

### AppErrorBoundary (Global)

```tsx
// Wraps all routes at the root level
<AppErrorBoundary>
  <Outlet />
</AppErrorBoundary>
```

**Responsibilities:**
- Catches React rendering errors
- Displays user-friendly error messages
- Reports errors to Sentry

### Component-Level ErrorBoundary

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

## Project Context Middleware

### ProjectProvider Wrapper

Workspace routes use `ProjectProvider` to inject project context:

```tsx
// src/routes/ide.$projectId.tsx
function IDEWorkspace() {
  const { project } = Route.useLoaderData();

  return (
    <ProjectProvider project={project} workspace="ide">
      <ToastProvider>
        <Suspense fallback={<Loading />}>
          <IDELayout />
        </Suspense>
        <Toast />
      </ToastProvider>
    </ProjectProvider>
  );
}
```

### Provider Hierarchy

```
ProjectProvider
├── workspace: "ide" | "knowledge" | "notes" | "study"
├── project: ProjectMetadata
└── provides access to:
    ├── projectStore
    ├── fileSystemAdapter
    ├── syncManager
    └── eventBus
```

---

## Data Loading Middleware

### Loader Pattern

```typescript
// src/routes/ide.$projectId.tsx
export const Route = createFileRoute('/ide/$projectId')({
  ssr: false,
  loader: async ({ params }) => {
    const project = await getProject(params.projectId);
    return { project };
  },
  component: IDEWorkspace,
});
```

### Loader Error Handling

```typescript
loader: async ({ params }) => {
  try {
    const project = await getProject(params.projectId);
    if (!project) {
      throw new Error('Project not found');
    }
    return { project };
  } catch (error) {
    console.error('Loader error:', error);
    throw error; // Will be caught by error boundary
  }
}
```

### Preloading

```typescript
const router = createRouter({
  routeTree,
  defaultPreloadStaleTime: 0, // Preload immediately on hover
});
```

---

## API Route Middleware

### Validation Middleware

All API routes implement request validation:

```typescript
// src/routes/api/chat.ts
const validation = validateChatRequest(body);

if (!validation.success) {
  logValidationError(
    validation.error.message,
    validation.error.message,
    {
      providerId: body.providerId,
      messageCount: body.messages?.length,
      timestamp: Date.now(),
    }
  );
  return createValidationErrorResponse(
    validation.error.message,
    validation.error.details
  );
}
```

### API Key Validation

```typescript
// src/routes/api/chat.ts
const apiKey = validatedBody.apiKey;
if (!apiKey) {
  return createValidationErrorResponse(
    'API key required. Configure API key in Agent Settings.',
    401
  );
}
```

### Rate Limiting (Flashcards API)

```typescript
// src/routes/api/flashcards/generate.ts
if (error.message.includes('rate limit') || error.message.includes('429')) {
  return errorResponse('Rate limit exceeded. Please try again later.', 429);
}
```

---

## Security Middleware

### Path Traversal Protection

The File System Access API adapter validates all paths:

```typescript
// src/routes/test-fs-adapter.tsx
try {
  await adapter.readFile('../../../etc/passwd');
  setStatus('❌ Path validation failed - security issue!');
} catch (error: any) {
  if (error instanceof FileSystemError && error.code === 'PATH_TRAVERSAL') {
    setStatus('✅ Path validation working - traversal attack blocked');
  }
}
```

### Custom Headers Validation

```typescript
// src/routes/api/chat.ts
let defaultHeaders: Record<string, string> | undefined;
if (validatedBody.customHeaders && Object.keys(validatedBody.customHeaders).length > 0) {
  defaultHeaders = Object.fromEntries(
    Object.entries(validatedBody.customHeaders).map(([k, v]) => [k, String(v)])
  );
}
```

---

## Toast Notification Middleware

### ToastProvider Wrapper

```tsx
// Used in IDE and workspace routes
<ToastProvider>
  <Suspense fallback={<Loading />}>
    <IDELayout />
  </Suspense>
  <Toast />
</ToastProvider>
```

---

## Lazy Loading Middleware

### Suspense Boundary

```tsx
// All lazy-loaded routes use Suspense
<Suspense fallback={
  <div className="h-screen w-screen flex items-center justify-center bg-background">
    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
  </div>
}>
  <IDELayout />
</Suspense>
```

### Lazy Route Loading

```typescript
// src/routes/study.lazy.tsx
export const Route = createLazyFileRoute('/study')({
  component: StudyPage,
});
```

---

## Sentry Integration

### Sentry Initialization

```typescript
// src/routes/__root.tsx
if (typeof window !== 'undefined') {
  initSentry();
}
```

### Error Reporting

```tsx
<ErrorBoundary
  onError={(error) => {
    console.error('[SettingsPage] AgentConfigDialog error:', error);
    // Sentry capture here
  }}
>
```

---

## Migration Status Middleware

### MigrationStatus Overlay

```tsx
// src/routes/__root.tsx
<MigrationStatus />
```

Displays migration progress for:
- Provider store consolidation
- Agent configuration migration
- Tool permission persistence

---

## Future Authentication Middleware

### Planned Auth Pattern

```typescript
// Future: Authentication guard
export const Route = createFileRoute('/settings')({
  beforeLoad: async ({ location }) => {
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
      });
    }
  },
  component: SettingsPage,
});
```

---

## CORS and Headers

### API Route Headers

```typescript
// src/routes/api/chat.ts
return new Response(readableStream, {
  headers: {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  },
});
```

---

## Client Disconnect Handling

### AbortController for Streaming

```typescript
// src/routes/api/chat.ts
const abortController = new AbortController();

request.signal.addEventListener('abort', () => {
  console.log('[/api/chat] Client disconnected, aborting stream');
  abortController.abort(new Error('Client disconnected'));
});
```

---

## Route Deduplication Middleware

### HMR Protection

```typescript
// src/router.tsx
const deduplicatedChildren = children.filter((child: any) => {
  const childId = child?.id;
  if (!childId) return true;
  if (seenIds.has(childId)) return false;
  seenIds.add(childId);
  return true;
});

if (deduplicatedChildren.length !== originalLength) {
  console.warn(`[Router] Deduplicated ${originalLength - deduplicatedChildren.length} routes`);
}
```

---

## Summary

| Middleware Type | Implementation | Purpose |
|-----------------|----------------|---------|
| Provider Wrapping | ThemeProvider, LocaleProvider, etc. | Global context |
| Error Boundaries | AppErrorBoundary, ErrorBoundary | Error handling |
| Project Context | ProjectProvider | Project state |
| Data Loading | Loaders, preloading | Data fetching |
| Validation | Zod schemas | Request validation |
| Security | Path traversal, headers | Protection |
| Lazy Loading | Suspense, lazy() | Performance |
| Monitoring | Sentry, error logging | Observability |
| Migration | MigrationStatus | Data migration |
| Streaming | AbortController | Resource cleanup |
