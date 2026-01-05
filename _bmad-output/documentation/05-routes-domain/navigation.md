# Navigation Patterns Documentation

This document describes the navigation patterns and routing conventions used in the Via-gent application.

## TanStack Router Configuration

The application uses TanStack Router v1 for file-based routing with the following configuration:

```typescript
// src/router.tsx
const router = createRouter({
  routeTree,
  scrollRestoration: true,
  defaultPreloadStaleTime: 0,
  defaultNotFoundComponent: () => <p>Not Found</p>,
})
```

### Router Options

| Option | Value | Description |
|--------|-------|-------------|
| scrollRestoration | true | Restores scroll position on navigation |
| defaultPreloadStaleTime | 0 | Preload data immediately |
| defaultNotFoundComponent | 404 | Custom 404 component |

---

## Route Creation Patterns

### Standard Page Routes

```typescript
// src/routes/settings.tsx
export const Route = createFileRoute('/settings')({
  component: SettingsPage,
});
```

### Routes with Parameters

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

### Lazy-Loaded Routes

```typescript
// src/routes/study.lazy.tsx
export const Route = createLazyFileRoute('/study')({
  component: StudyPage,
});
```

### Server Routes (API)

```typescript
// src/routes/api/chat.ts
export const Route = createFileRoute('/api/chat')({
  server: {
    handlers: {
      GET: async () => { /* ... */ },
      POST: async ({ request }) => { /* ... */ },
    },
  },
});
```

---

## Route Parameters

### Dynamic Parameters

Routes use `$` prefix for dynamic parameters:

| Route Pattern | Parameter | Type |
|--------------|-----------|------|
| `/ide/$projectId` | projectId | string |
| `/workspace/$projectId` | projectId | string |
| `/knowledge/$projectId` | projectId | string |
| `/notes/$projectId` | projectId | string |
| `/study/$projectId` | projectId | string |
| `/webcontainer/$` | splat | string |

### Accessing Parameters

```typescript
function IDEWorkspace() {
  const { projectId } = Route.useParams();
  const { project } = Route.useLoaderData();
  // ...
}
```

---

## Data Loading

### Loader Pattern

```typescript
export const Route = createFileRoute('/ide/$projectId')({
  loader: async ({ params }) => {
    const project = await getProject(params.projectId);
    return { project };
  },
  component: IDEWorkspace,
});

function IDEWorkspace() {
  const { project } = Route.useLoaderData();
  // Use loaded data
}
```

### SSR Control

```typescript
// Disable SSR for routes using browser APIs
export const Route = createFileRoute('/ide')({
  ssr: false,
  component: IDEWorkspace,
});
```

Routes with `ssr: false`:
- `/ide`
- `/ide/$projectId`
- `/workspace/$projectId`
- `/webcontainer/$`

---

## Navigation Components

### MainLayout

Most pages use `MainLayout` for consistent header/sidebar:

```tsx
// src/routes/index.tsx
export const Route = createFileRoute('/')({
  component: () => (
    <MainLayout>
      <HubHomePage />
    </MainLayout>
  ),
});
```

### ProjectProvider

Workspace routes wrap content with `ProjectProvider` for project context:

```tsx
// src/routes/ide.$projectId.tsx
function IDEWorkspace() {
  return (
    <ProjectProvider project={project} workspace="ide">
      <IDELayout />
    </ProjectProvider>
  );
}
```

---

## Navigation from Components

### Using useNavigate Hook

```typescript
import { useNavigate } from '@tanstack/react-router';

function WorkspaceIndex() {
  const navigate = useNavigate();

  return (
    <button onClick={() => navigate({ to: '/ide' })}>
      Go to IDE
    </button>
  );
}
```

### Programmatic Navigation

```typescript
// Navigate to specific project
navigate({ to: '/ide/$projectId', params: { projectId: 'proj-123' } });

// Navigate with replace
navigate({ to: '/settings', replace: true });

// Navigate with state
navigate({
  to: '/agents',
  state: { from: '/settings' }
});
```

---

## Link Components

### Standard Links

```typescript
import { Link } from '@tanstack/react-router';

<Link to="/settings">Settings</Link>
<Link to="/ide/$projectId" params={{ projectId: 'proj-123' }}>
  Open Project
</Link>
```

### Active Links

```typescript
import { useMatch } from '@tanstack/react-router';

const isActive = useMatch({ to: '/settings' });
```

---

## Workspace Navigation

The application supports 4 workspaces with cross-workspace navigation:

```
IDE Workspace → /ide/$projectId
Knowledge Workspace → /knowledge/$projectId
Notes Workspace → /notes/$projectId
Study Workspace → /study/$projectId
```

### Workspace Switcher

The `WorkspaceSwitcher` component in the IDE header allows switching between workspaces while maintaining project context.

```tsx
// Each workspace route accepts projectId
/ide/$projectId
/knowledge/$projectId
/notes/$projectId
/study/$projectId
```

---

## Redirects

Some routes redirect to lazy-loaded versions:

```typescript
// src/routes/about.tsx
export const Route = createFileRoute('/about')({
  component: () => (
    // Redirects to about.lazy.tsx
    <Redirect to="/about" />
  ),
});
```

---

## Not Found Handling

### Default Not Found

The root route defines the default 404 component:

```tsx
// src/routes/__root.tsx
export const Route = createRootRoute({
  notFoundComponent: () => <div>404 - Page Not Found</div>,
  // ...
});
```

### Custom 404 Pages

Routes can override the not found component:

```typescript
export const Route = createFileRoute('/admin')({
  notFoundComponent: () => <AdminNotFound />,
  component: AdminPage,
});
```

---

## Error Boundaries

### App-Level Error Boundary

The root route wraps all content in `AppErrorBoundary`:

```tsx
// src/routes/__root.tsx
<AppErrorBoundary>
  <Outlet />
</AppErrorBoundary>
```

### Component-Level Error Boundary

Specific components can have dedicated error boundaries:

```tsx
// src/routes/settings.tsx
<ErrorBoundary
  fallback={<ErrorFallback />}
  onError={(error) => console.error(error)}
>
  <AgentConfigDialog />
</ErrorBoundary>
```

---

## Route Guards and Middleware

### Before Load (Loader Guards)

```typescript
export const Route = createFileRoute('/settings')({
  loader: async ({ preload }) => {
    if (preload) {
      // Preload data in background
      await preloadData();
    }
    return fetchData();
  },
});
```

### Before Navigate

```typescript
// Navigation guards can be implemented using event listeners
router.history.subscribe((event) => {
  if (event.action === 'push') {
    // Check navigation conditions
  }
});
```

---

## Scroll Restoration

The router is configured with scroll restoration:

```typescript
const router = createRouter({
  routeTree,
  scrollRestoration: true,
});
```

This automatically:
- Saves scroll position before navigation
- Restores scroll position after navigation
- Works with browser back/forward buttons

---

## Route Metadata

### Head/Meta Tags

Root route defines global meta tags:

```typescript
// src/routes/__root.tsx
export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Via-gent | Intelligent Local Dev' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    ],
  }),
});
```

---

## Best Practices

### 1. Use Lazy Loading for Heavy Components

```typescript
const IDELayout = lazy(() =>
  import('@/presentation/components/layout/IDELayoutMain')
    .then(m => ({ default: m.IDELayout }))
);
```

### 2. Handle Loading States

```typescript
function IDEWorkspace() {
  const { project } = Route.useLoaderData();

  if (!project) {
    return <LoadingSpinner />;
  }

  return <IDELayout />;
}
```

### 3. Handle Error States

```typescript
function IDEWorkspace() {
  const { project } = Route.useLoaderData();

  if (!project) {
    return <ErrorMessage message="Project not found" />;
  }

  return <IDELayout />;
}
```

### 4. Use Type-Safe Navigation

```typescript
import { createFileRoute } from '@tanstack/react-router';

type RouteTypes = {
  '/ide/$projectId': {
    params: { projectId: string };
    loaderData: { project: Project };
  };
};
```

---

## File Structure Convention

Routes follow TanStack Router's file-based routing convention:

```
src/routes/
├── __root.tsx              # Root route
├── index.tsx               # / route
├── $routeName.tsx          # /route-name
├── $routeName.$param.tsx   # /route-name/:param
├── routeName.lazy.tsx      # Lazy-loaded route
├── routeName/
│   └── index.tsx           # Nested route
└── api/
    └── endpoint.ts         # API endpoint
```

---

## Debugging Routes

### Route Tree Debug

The router logs route tree children for debugging:

```typescript
// src/router.tsx
console.log('[Router] routeTree children:', 
  routeTree.children?.map((c: any) => c.id)
);
```

### Route Deduplication

The router automatically deduplicates routes to prevent HMR issues:

```typescript
const deduplicatedChildren = children.filter((child: any) => {
  const childId = child?.id;
  if (!childId) return true;
  if (seenIds.has(childId)) return false;
  seenIds.add(childId);
  return true;
});
```
