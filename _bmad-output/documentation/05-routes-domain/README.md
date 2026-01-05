# Routes Domain Documentation

This directory contains comprehensive documentation for the `src/routes` domain of the Via-gent application.

## Overview

The Via-gent application uses **TanStack Router v1** for file-based routing. The routes directory contains 24 files (1,650+ lines of code) organized into:

- **Page Routes** - User-facing pages (IDE, Knowledge, Notes, Study, etc.)
- **API Routes** - Server-side endpoints (Chat, Quiz, Flashcard generation)
- **Utility Routes** - Development tools (Test FSA Adapter)
- **Generated Files** - Auto-generated route tree

## Documentation Files

| File | Description |
|------|-------------|
| `scan-inventory.json` | Structured scan data with file metadata |
| `file-structure.txt` | Tree view of all route files |
| `routes.md` | Comprehensive route documentation |
| `api-endpoints.md` | API endpoint specifications |
| `navigation.md` | Navigation patterns and conventions |
| `middleware.md` | Route guards and middleware |
| `error-handling.md` | Error handling strategies |
| `README.md` | This file (English) |
| `README-VI.md` | Vietnamese version |

## Quick Reference

### Route Hierarchy

```
__root__ (/)
├── index (/)
├── hub (/hub)
├── about (/about)
├── agents (/agents)
├── settings (/settings)
├── test-fs-adapter (/test-fs-adapter)
├── workspace (/workspace)
├── ide (/ide)
│   └── $projectId (/ide/$projectId)
├── knowledge (/knowledge)
│   └── $projectId (/knowledge/$projectId)
├── notes (/notes)
│   └── $projectId (/notes/$projectId)
├── study (/study)
│   └── $projectId (/study/$projectId)
├── webcontainer/$
└── api
    ├── chat (/api/chat)
    ├── quizzes/generate (/api/quizzes/generate)
    └── flashcards/generate (/api/flashcards/generate)
```

### Key Routes

| Path | Purpose | SSR |
|------|---------|-----|
| `/` | Home page | Yes |
| `/ide` | IDE workspace | No |
| `/ide/$projectId` | IDE with project | No |
| `/knowledge` | Knowledge workspace | Yes |
| `/notes` | Notes workspace | Yes |
| `/study` | Study workspace | Yes |
| `/settings` | Settings page | Yes |
| `/agents` | Agent management | Yes |
| `/api/chat` | AI chat API | - |
| `/api/flashcards/generate` | Flashcard API | - |
| `/api/quizzes/generate` | Quiz API | - |

## Framework & Technologies

- **Router**: TanStack Router v1.144.0
- **Routing Pattern**: File-based routing
- **State Management**: React Context + TanStack Router loaders
- **Lazy Loading**: TanStack Router lazy() function
- **Error Boundaries**: React ErrorBoundary pattern
- **Monitoring**: Sentry integration

## Key Patterns

### 1. Route Definition

```typescript
// Standard page route
export const Route = createFileRoute('/settings')({
  component: SettingsPage,
});
```

### 2. Routes with Parameters

```typescript
// Dynamic route with loader
export const Route = createFileRoute('/ide/$projectId')({
  ssr: false,
  loader: async ({ params }) => {
    const project = await getProject(params.projectId);
    return { project };
  },
  component: IDEWorkspace,
});
```

### 3. Lazy Loading

```typescript
// Lazy-loaded route
export const Route = createLazyFileRoute('/study')({
  component: StudyPage,
});
```

### 4. API Routes

```typescript
// Server-side handler
export const Route = createFileRoute('/api/chat')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Handle chat request
      },
    },
  },
});
```

## Providers & Context

All routes are wrapped with providers from `__root.tsx`:

```
ThemeProvider → 8-bit dark theme
LocaleProvider → i18n support
TooltipProvider → UI tooltips
AppInitializer → App setup
UnifiedWorkspaceProvider → Workspace state
AppErrorBoundary → Global error handling
MigrationStatus → Data migration
```

## API Endpoints

### Chat API (`/api/chat`)
- **GET**: Health check
- **POST**: Streaming AI chat with tool support

### Flashcards API (`/api/flashcards/generate`)
- **POST**: Generate flashcards from source content

### Quiz API (`/api/quizzes/generate`)
- **POST**: Generate quiz questions from sources

## Development

### Adding New Routes

1. Create route file in `src/routes/`
2. Use `createFileRoute()` or `createLazyFileRoute()`
3. Run dev server to auto-generate `routeTree.gen.ts`

### Route File Naming

| Pattern | Example |
|---------|---------|
| Static | `settings.tsx` → `/settings` |
| Dynamic | `ide.$projectId.tsx` → `/ide/$projectId` |
| Lazy | `study.lazy.tsx` → `/study` |
| Splat | `webcontainer.$.tsx` → `/webcontainer/*` |
| API | `api/chat.ts` → `/api/chat` |

### Testing Routes

Use the Test FSA Adapter route for development:
```
/test-fs-adapter
```

## Related Documentation

- TanStack Router Docs: https://tanstack.com/router
- AGENTS.md: Project-wide development guidelines
- `src/router.tsx`: Router configuration
- `src/routeTree.gen.ts`: Generated route tree

---

Generated: 2026-01-05
Framework: TanStack Router v1.144.0
Total Files: 24
Total Lines: ~1,650
