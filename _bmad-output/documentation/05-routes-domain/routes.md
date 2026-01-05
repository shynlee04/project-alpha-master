# Routes Documentation

This document provides comprehensive documentation for all routes in the Via-gent application, powered by TanStack Router v1.

## Route Hierarchy

```
__root__ (/)
├── index (/)
├── hub (/hub)
├── about (/about)
├── agents (/agents)
├── settings (/settings)
├── test-fs-adapter (/test-fs-adapter)
├── workspace
│   ├── index (/workspace)
│   └── $projectId (/workspace/$projectId)
├── ide
│   ├── index (/ide)
│   └── $projectId (/ide/$projectId)
├── knowledge
│   ├── index (/knowledge)
│   └── $projectId (/knowledge/$projectId)
├── notes
│   ├── index (/notes)
│   └── $projectId (/notes/$projectId)
├── study
│   ├── index (/study)
│   └── $projectId (/study/$projectId)
├── webcontainer/$
└── api
    ├── chat (/api/chat)
    ├── quizzes/generate (/api/quizzes/generate)
    └── flashcards/generate (/api/flashcards/generate)
```

## Route Details

### Root Route (`__root.tsx`)

**Path:** `/`

**Purpose:** Application entry point that wraps all routes with required providers and error boundaries.

**Features:**
- Sentry error monitoring initialization
- ThemeProvider for 8-bit dark theme
- LocaleProvider for i18n support
- AppErrorBoundary for global error handling
- AppInitializer for app initialization
- UnifiedWorkspaceProvider for workspace state
- MigrationStatus overlay for data migrations

**Providers Wrapped:**
```tsx
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
```

---

### Home Routes (`index.tsx`, `hub.tsx`)

**Paths:** `/`, `/hub`

**Purpose:** Landing pages displaying the Hub home page.

**Component:** `HubHomePage` wrapped in `MainLayout`

---

### IDE Routes (`ide.tsx`, `ide.$projectId.tsx`)

**Paths:** `/ide`, `/ide/$projectId`

**Purpose:** Primary development workspace with Monaco editor, terminal, file tree, and AI chat.

#### `/ide` Route
- Loads the last active project automatically
- Shows loading spinner while loading
- Displays "No Open Project" message if no projects found

#### `/ide/$projectId` Route
- **Parameter:** `projectId` - Unique project identifier
- **Loader:** Fetches project metadata using `getProject(params.projectId)`
- **Wraps:** `ProjectProvider` with workspace type "ide"
- **Components:** Lazy-loaded `IDELayoutMain`
- **SSR:** Disabled (`ssr: false`)

```typescript
export const Route = createFileRoute('/ide/$projectId')({
  ssr: false,
  loader: async ({ params }) => {
    const project = await getProject(params.projectId);
    return { project };
  },
  component: IDEWorkspace,
});
```

---

### Workspace Routes (`workspace/$projectId.tsx`)

**Path:** `/workspace/$projectId`

**Status:** Legacy - Use `/ide/$projectId` instead

**Purpose:** Legacy route for IDE workspace (kept for backward compatibility).

**Features:**
- ProjectProvider integration
- Lazy-loaded IDELayout
- SSR disabled

---

### Knowledge Routes

**Paths:** `/knowledge`, `/knowledge/$projectId`

**Status:** Partially implemented - `/knowledge` works, `/knowledge/$projectId` shows placeholder

#### `/knowledge` Route
- **Component:** `KnowledgePage` (lazy-loaded)
- **Features:** Source Library, Knowledge Canvas, RAG Panel

#### `/knowledge/$projectId` Route
- **Parameter:** `projectId`
- **Wrapper:** `ProjectProvider` with workspace type "knowledge"
- **Content:** Placeholder component (full implementation pending)

---

### Notes Routes

**Paths:** `/notes`, `/notes/$projectId`

**Status:** Partially implemented

#### `/notes` Route
- **Component:** `NotesPage` (lazy-loaded)
- **Features:** BlockNote editor with AI slash commands and RAG retrieval

#### `/notes/$projectId` Route
- **Parameter:** `projectId`
- **Wrapper:** `ProjectProvider` with workspace type "notes"
- **Component:** `NotesPage` wrapped in ProjectProvider

---

### Study Routes

**Paths:** `/study`, `/study/$projectId`

**Status:** Partially implemented - `/study` works, `/study/$projectId` shows placeholder

#### `/study` Route
- **Component:** `StudyPage` (lazy-loaded)
- **Features:** Flashcards, quizzes, and learning analytics

#### `/study/$projectId` Route
- **Parameter:** `projectId`
- **Wrapper:** `ProjectProvider` with workspace type "study"
- **Content:** Placeholder component (full implementation pending)

---

### Agent Routes (`agents.tsx`)

**Path:** `/agents`

**Purpose:** Agent management center with AgentsPanel integration.

**Features:**
- MainLayout wrapper
- Mobile responsive design
- 8-bit themed border styling

---

### Settings Route (`settings.tsx`)

**Path:** `/settings`

**Purpose:** Configuration page for agents and providers.

**Components:**
- `ProviderSettings` - LLM provider configuration
- `AgentConfigDialog` - Agent creation/editing (wrapped in ErrorBoundary)
- `ErrorBoundary` - Catches and displays configuration errors

**Features:**
- Mobile responsive layout
- 44px touch targets on mobile
- Shadow-styled borders

---

### About Routes (`about.tsx`, `about.lazy.tsx`)

**Path:** `/about`

**Purpose:** About page with lazy-loaded component.

---

### Test Route (`test-fs-adapter.tsx`)

**Path:** `/test-fs-adapter`

**Purpose:** Development utility for testing File System Access API implementation.

**Features:**
- API support detection
- Permission request testing
- File read/write operations
- Path validation security testing
- Directory listing

---

### WebContainer Route (`webcontainer.$.tsx`)

**Path:** `/webcontainer/$`

**Purpose:** Catch-all route for WebContainer-related paths.

**Status:** Empty route with SSR disabled.

---

## API Routes

### Chat API (`api/chat.ts`)

**Path:** `/api/chat`

**Methods:** GET, POST

#### GET
Health check endpoint returning `{ status: "ok", endpoint: "/api/chat" }`

#### POST
Streaming AI chat endpoint with tool support.

**Request Body:**
```typescript
{
  messages: Array<{ role: string; content: string; tool_calls?: unknown[] }>,
  apiKey: string,
  providerId?: string,
  modelId?: string,
  customBaseURL?: string,
  customHeaders?: Record<string, string>,
  disableTools?: boolean
}
```

**Features:**
- Tool definitions for file/terminal operations
- Model compatibility checking
- Message sanitization for non-tool models
- SSE streaming response
- Request validation with Zod

**Tools Provided:**
- `read_file` - Read file contents
- `write_file` - Create/update files
- `list_files` - List directory contents
- `execute_command` - Run shell commands

---

### Quiz Generation API (`api/quizzes/generate.ts`)

**Path:** `/api/quizzes/generate`

**Method:** POST

**Request Body:**
```typescript
{
  sourceIds: string[],
  options?: {
    questionCount?: number,    // 3-20, default 5
    includeExplanation?: boolean,
    difficulty?: "mixed" | "easy" | "medium" | "hard"
  }
}
```

**Response:**
```typescript
{
  success: boolean,
  data: Quiz,
  error?: string
}
```

---

### Flashcard Generation API (`api/flashcards/generate.ts`)

**Path:** `/api/flashcards/generate`

**Method:** POST

**Request Body:**
```typescript
{
  projectId: string,
  sourceId: string,
  sourceContent: string,
  sourceTitle?: string,
  options?: {
    minCards?: number,
    maxCards?: number,
    topics?: string[]
  },
  apiKey?: string,
  useMock?: boolean
}
```

**Response:**
```typescript
{
  success: boolean,
  data: {
    cards: Array<{
      question: string,
      answer: string,
      difficulty: "easy" | "medium" | "hard",
      topic: string,
      sourceIds: string[]
    }>,
    totalCards: number,
    topics: string[],
    sourcesUsed: string[]
  }
}
```

---

## Lazy Loading

Routes marked with `.lazy.tsx` suffix are lazy-loaded using TanStack Router's lazy loading feature:

```typescript
const StudyLazyRoute = StudyRouteImport.update({
  id: '/study',
  path: '/study',
  getParentRoute: () => rootRoute,
}).lazy(() => import('./routes/study.lazy').then((d) => d.Route))
```

**Lazy-loaded routes:**
- `/about` → `about.lazy.tsx`
- `/knowledge` → `knowledge.lazy.tsx`
- `/notes` → `notes.lazy.tsx`
- `/study` → `study.lazy.tsx`
- `/knowledge/$projectId` → `knowledge.$projectId.lazy.tsx`
- `/notes/$projectId` → `notes.$projectId.lazy.tsx`
- `/study/$projectId` → `study.$projectId.lazy.tsx`

---

## Server-Side Rendering

Routes with SSR disabled:
- `/ide`
- `/ide/$projectId`
- `/workspace/$projectId`
- `/webcontainer/$`

These routes use `ssr: false` because they depend on browser APIs (File System Access, WebContainer).

```typescript
export const Route = createFileRoute('/ide/$projectId')({
  ssr: false,
  component: IDEWorkspace,
});
```

---

## Error Handling

### AppErrorBoundary
Root route wraps all content in `AppErrorBoundary` for global error handling.

### Route-specific ErrorBoundary
Settings page wraps `AgentConfigDialog` in `ErrorBoundary`:

```tsx
<ErrorBoundary
  fallback={
    <div className="p-6 text-center">
      <h2>Agent Configuration Failed</h2>
      <p>The agent configuration dialog encountered an unexpected error.</p>
    </div>
  }
  onError={(error) => {
    console.error('[SettingsPage] AgentConfigDialog error:', error);
  }}
>
  <AgentConfigDialog ... />
</ErrorBoundary>
```

---

## Not Found Component

Default 404 rendering:
```tsx
notFoundComponent: () => <div>404 - Page Not Found</div>
```
