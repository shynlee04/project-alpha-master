# Work Unit: ADR-034 Phase 3 - Route Standardization

**Date**: 2026-01-19
**Status**: IN_PROGRESS
**Owner**: EXCALIBUR
**Phase**: 3 (Route Standardization)

---

## Infections Targeted

| ID | File | Issue | Fix |
|----|------|-------|-----|
| ROUTE-003 | `ide.$projectId.tsx` | Double fetch (beforeLoad + loader) | Remove duplicate fetch from loader, use data from beforeLoad context |
| ROUTE-004 | `notes.$projectId.lazy.tsx` | useEffect instead of loader | Convert to use loader pattern with createFileRoute |
| ROUTE-005 | `workspace/$projectId.tsx` | No platform guard | Add beforeLoad platform check |
| ROUTE-012 | Missing files | `knowledge.$projectId.tsx`, `study.$projectId.tsx` | Create non-lazy routes with loader |

---

## Fix 1: ROUTE-003 - Remove Double Fetch

**File**: `src/routes/ide.$projectId.tsx`

**Current Issue**: Both `beforeLoad` and `loader` fetch the project with the same retry logic.

**Solution**: Remove duplicate fetch from loader, use data from beforeLoad context.

```typescript
// BEFORE (beforeLoad):
beforeLoad: async ({ params }) => {
  const { projectId } = params;
  const project = await getProjectWithRetry(projectId);
  return { project };
},

// BEFORE (loader):
loader: async ({ params }) => {
  const project = await getProjectWithRetry(params.projectId);
  return { project: project || undefined };
},

// AFTER:
beforeLoad: async ({ params }) => {
  const { projectId } = params;
  const project = await getProjectWithRetry(projectId);
  if (!project) throw redirect({ to: '/hub' });
  return { project };
},

loader: ({ params }) => {
  // Project already fetched in beforeLoad, no duplicate fetch needed
  return {};
},
```

---

## Fix 2: ROUTE-004 - Convert useEffect to Loader

**File**: `src/routes/notes.$projectId.lazy.tsx`

**Current Issue**: Uses `createLazyFileRoute` which doesn't support beforeLoad/loader, so it uses useEffect.

**Solution**: Change to `createFileRoute` to support loader pattern.

```typescript
// BEFORE:
import { createLazyFileRoute } from '@tanstack/react-router';
export const Route = createLazyFileRoute('/notes/$projectId')({
  component: () => <NotesWorkspace />,
});

// AFTER:
import { createFileRoute, redirect } from '@tanstack/react-router';
export const Route = createFileRoute('/notes/$projectId')({
  ssr: false,
  beforeLoad: async ({ params }) => {
    const project = await getProjectWithRetry(params.projectId);
    if (!project) throw redirect({ to: '/hub' });
    return { project };
  },
  loader: ({ params }) => {
    // Project already fetched in beforeLoad
    return {};
  },
  component: () => <NotesWorkspace />,
});
```

**Note**: `getProjectWithRetry` function already exists in the file.

---

## Fix 3: ROUTE-005 - Add Platform Guard

**File**: `src/routes/workspace/$projectId.tsx`

**Current Issue**: No platform guard for IDE access.

**Solution**: Add beforeLoad platform check.

```typescript
export const Route = createFileRoute('/workspace/$projectId')({
  ssr: false,
  beforeLoad: async ({ params, location }) => {
    // Platform validation
    const platform = getPlatformContract();
    if (!platform.canAccessIDE) {
      throw redirect({
        to: '/notes/$projectId',
        params: { projectId: params.projectId },
        search: { reason: 'mobile-not-supported' }
      });
    }
    
    // Project fetch
    const project = await getProjectWithRetry(params.projectId);
    if (!project) throw redirect({ to: '/hub' });
    return { project };
  },
  loader: ({ params }) => {
    return {};
  },
  component: ProjectWorkspace,
});
```

---

## Fix 4: ROUTE-012 - Create Missing Routes

### File 1: `src/routes/knowledge.$projectId.tsx`

```typescript
/**
 * @fileoverview Knowledge Workspace Route with Project ID
 * @module routes/knowledge.$projectId
 *
 * Knowledge workspace route for a specific project ID.
 * Loads knowledge base with RAG retrieval and source management.
 *
 * Route Pattern: /knowledge/$projectId
 */

import { createFileRoute, redirect } from '@tanstack/react-router';
import { getProject } from '@/infrastructure/persistence/stores/project';
import { useProjectStore } from '@/infrastructure/persistence/stores/project';
import type { Project } from '@/infrastructure/persistence/stores/project/project-types';
import { useIDEStore } from '@/infrastructure/persistence/stores/ide';
import { ProjectProvider } from '@/lib/workspace/ProjectContext';
import { KnowledgePage } from '@/presentation/components/knowledge/KnowledgePage';
import { ErrorBoundary } from '@/presentation/components/error';

async function getProjectWithRetry(
  projectId: string,
  maxRetries: number = 3,
  baseDelayMs: number = 50
): Promise<Project | null> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const fromStore = useProjectStore.getState().getProject(projectId);
    if (fromStore) return fromStore as Project;

    try {
      const fromFacade = await getProject(projectId);
      if (fromFacade) return fromFacade as Project;
    } catch (error) {
      lastError = error as Error;
    }

    if (attempt < maxRetries) {
      const delayMs = baseDelayMs * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  console.error(`[KnowledgeRoute] Project not found after ${maxRetries} attempts:`, projectId, lastError);
  return null;
}

export const Route = createFileRoute('/knowledge/$projectId')({
  ssr: false,
  beforeLoad: async ({ params }) => {
    const project = await getProjectWithRetry(params.projectId);
    if (!project) throw redirect({ to: '/hub' });
    return { project };
  },
  loader: ({ params }) => {
    return {};
  },
  component: () => (
    <ErrorBoundary>
      <KnowledgeWorkspace />
    </ErrorBoundary>
  ),
});

function KnowledgeWorkspace() {
  const { projectId: _projectId } = Route.useParams();
  const { project } = Route.useLoaderData();

  // Set projectId in IDE store
  useEffect(() => {
    if (_projectId) {
      useIDEStore.getState().setProjectId(_projectId);
    }
  }, [_projectId]);

  return (
    <ProjectProvider project={project as Project | null} workspace="knowledge">
      <KnowledgePage />
    </ProjectProvider>
  );
}

import { useEffect } from 'react';
```

### File 2: `src/routes/study.$projectId.tsx`

```typescript
/**
 * @fileoverview Study Workspace Route with Project ID
 * @module routes/study.$projectId
 *
 * Study workspace route for a specific project ID.
 * Loads flashcards and quiz functionality.
 *
 * Route Pattern: /study/$projectId
 */

import { createFileRoute, redirect } from '@tanstack/react-router';
import { getProject } from '@/infrastructure/persistence/stores/project';
import { useProjectStore } from '@/infrastructure/persistence/stores/project';
import type { Project } from '@/infrastructure/persistence/stores/project/project-types';
import { useIDEStore } from '@/infrastructure/persistence/stores/ide';
import { ProjectProvider } from '@/lib/workspace/ProjectContext';
import { StudyPage } from '@/presentation/components/study/StudyPage';
import { ErrorBoundary } from '@/presentation/components/error';

async function getProjectWithRetry(
  projectId: string,
  maxRetries: number = 3,
  baseDelayMs: number = 50
): Promise<Project | null> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const fromStore = useProjectStore.getState().getProject(projectId);
    if (fromStore) return fromStore as Project;

    try {
      const fromFacade = await getProject(projectId);
      if (fromFacade) return fromFacade as Project;
    } catch (error) {
      lastError = error as Error;
    }

    if (attempt < maxRetries) {
      const delayMs = baseDelayMs * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  console.error(`[StudyRoute] Project not found after ${maxRetries} attempts:`, projectId, lastError);
  return null;
}

export const Route = createFileRoute('/study/$projectId')({
  ssr: false,
  beforeLoad: async ({ params }) => {
    const project = await getProjectWithRetry(params.projectId);
    if (!project) throw redirect({ to: '/hub' });
    return { project };
  },
  loader: ({ params }) => {
    return {};
  },
  component: () => (
    <ErrorBoundary>
      <StudyWorkspace />
    </ErrorBoundary>
  ),
});

function StudyWorkspace() {
  const { projectId: _projectId } = Route.useParams();
  const { project } = Route.useLoaderData();

  // Set projectId in IDE store
  useEffect(() => {
    if (_projectId) {
      useIDEStore.getState().setProjectId(_projectId);
    }
  }, [_projectId]);

  return (
    <ProjectProvider project={project as Project | null} workspace="study">
      <StudyPage />
    </ProjectProvider>
  );
}

import { useEffect } from 'react';
```

---

## Verification

After implementing fixes:
1. Run `pnpm tsc --noEmit` - must pass with 0 errors
2. Verify routes work correctly on both platforms

---

## Status History

| Timestamp | Action | Status |
|-----------|--------|--------|
| 2026-01-19T19:00:00+07:00 | Work unit created | IN_PROGRESS |
| 2026-01-19T19:XX:00+07:00 | Fix ROUTE-003 | PENDING |
| 2026-01-19T19:XX:00+07:00 | Fix ROUTE-004 | PENDING |
| 2026-01-19T19:XX:00+07:00 | Fix ROUTE-005 | PENDING |
| 2026-01-19T19:XX:00+07:00 | Create ROUTE-012 | PENDING |
