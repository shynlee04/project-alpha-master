# Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- WebContainers integration pattern
- File System Access API adapter design
- Bidirectional sync strategy
- isomorphic-git FSA adapter

**Important Decisions (Shape Architecture):**
- TanStack AI tool architecture
- State management pattern
- Persistence layer design
- Error recovery patterns

**Deferred Decisions (Post-MVP):**
- Multi-project workspace
- Collaborative features
- Complex project templates

### Data Architecture

| Decision | Choice | Version | Rationale |
|----------|--------|---------|-----------|
| **Primary Storage** | IndexedDB via `idb` | latest | Browser-native, structured data |
| **Schema Validation** | Zod | 4.x | Type-safe validation, TanStack integration |
| **File Storage** | File System Access API | Native | Real local files, Git compatibility |
| **Fallback Storage** | IndexedDB (virtual FS) | N/A | When FSA permission denied |

**Data Model:**

```typescript
// Core entities stored in IndexedDB
interface ProjectMetadata {
  id: string;
  name: string;
  folderPath: string;
  fsaHandle: FileSystemDirectoryHandle | null;
  openFiles: string[];
  layoutState: LayoutConfig;
  lastOpened: Date;
}

interface ConversationState {
  projectId: string;
  messages: Message[];
  toolResults: ToolResult[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Authentication & Security

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **LLM Auth** | BYOK (Bring Your Own Key) | User controls API keys |
| **GitHub Auth** | Personal Access Token (PAT) | Client-side Git operations |
| **Data Transmission** | Zero server transmission | Complete client-side privacy |
| **File Access** | Scoped to user-approved directories | FSA permission model |

### API & Communication Patterns

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **AI Communication** | Server-Sent Events (SSE) | TanStack AI streaming |
| **Endpoint Pattern** | `/api/chat` for AI, client tools for execution | Separation of concerns |
| **Tool Execution** | Client-side via `clientTools()` | Browser-only architecture |
| **Event Format** | TanStack AI standard | Framework compatibility |

### Frontend Architecture

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **State Management** | Zustand 5.x + TanStack Query | ⬆️ Simpler API, better DevTools (changed from TanStack Store) |
| **Component Library** | Shadcn/ui + TailwindCSS 4.x | Customizable, accessible, utility-first styling |
| **Editor** | Monaco Editor | Industry standard, TypeScript support |
| **Terminal** | xterm.js | WebContainers compatibility |
| **Layout** | Resizable panels | IDE-standard UX |

### Infrastructure & Deployment

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Hosting** | Netlify (Static + SSR) | Native TanStack Start support, Edge Functions |
| **Build** | Vite + Nitro (NITRO_PRESET=netlify) | SSR + static hybrid output |
| **Headers** | Netlify Edge Functions | COOP/COEP injection for SSR compatibility |
| **Publish Dir** | `.output/public` | Nitro output structure |
| **Functions Dir** | `.output/server` | SSR functions location |

> **Lesson Learned (2025-12-20):** Headers via Edge Functions avoid SSR/hydration issues that occur with static `headers` in `netlify.toml`.

### Required Security Headers

| Header | Value | Requirement |
|--------|-------|-------------|
| `Cross-Origin-Opener-Policy` | `same-origin` | WebContainers (SharedArrayBuffer) |
| `Cross-Origin-Embedder-Policy` | `require-corp` | WebContainers (SharedArrayBuffer) |
| `Content-Security-Policy` | See below | Recommended for production |

**CSP Configuration (via `vite-plugin-csp-guard`):**
```typescript
// vite.config.ts
import csp from 'vite-plugin-csp-guard';

export default defineConfig({
  plugins: [
    csp({
      algorithm: 'sha256',
      dev: {
        run: true,
        outlierSupport: ['react'],
      },
    }),
  ],
});
```

**Netlify Edge Function (Header Injection):**
```typescript
// netlify/edge-functions/inject-headers.ts
export default async (request: Request, context: Context) => {
  const response = await context.next();
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
  return response;
};
```

### SSR Externalization (Client-Only Packages)

> **Lesson Learned (2025-12-20):** Packages like `@xterm/xterm` and `monaco-editor` cause SSR build failures if bundled.

**Solution:** Dynamic imports in components:
```typescript
// src/components/ide/XTerminal.tsx
const Terminal = dynamic(
  () => import('@xterm/xterm').then(m => m.Terminal),
  { ssr: false }
);
```

**Alternative:** Vite ssr.external configuration:
```typescript
// vite.config.ts
ssr: {
  external: ['@xterm/xterm', 'monaco-editor'],
}
```

---
