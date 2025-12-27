# Via-gent Technology Stack Documentation

**Document ID:** `docs/2025-12-23/tech-context.md`  
**Version:** 1.0  
**Date:** 2025-12-23  
**Classification:** Internal  
**Target Audience:** Technical Leadership, Architects, Developers

---

## Table of Contents

1. [Introduction](#introduction)
2. [Technology Stack Overview](#technology-stack-overview)
3. [Core Framework](#core-framework)
4. [UI Framework & Components](#ui-framework--components)
5. [State Management](#state-management)
6. [Routing & Navigation](#routing--navigation)
7. [Code Execution](#code-execution)
8. [File System Access](#file-system-access)
9. [Persistence](#persistence)
10. [Editor & Terminal](#editor--terminal)
11. [Internationalization](#internationalization)
12. [Styling & Theming](#styling--theming)
13. [Build & Development Tools](#build--development-tools)
14. [Testing](#testing)
15. [Observability](#observability)
16. [Version Compatibility Matrix](#version-compatibility-matrix)
17. [Security Considerations](#security-considerations)
18. [Performance Considerations](#performance-considerations)
19. [Technology Selection Rationale](#technology-selection-rationale)

---

## Introduction

This document provides a comprehensive overview of the Via-gent technology stack, including all dependencies, their versions, roles in the system, and the rationale for their selection. It serves as a reference for understanding the technical foundation of the application.

### Document Purpose

| Purpose | Description |
|---------|-------------|
| **Inventory** | Complete list of all dependencies |
| **Rationale** | Justification for technology choices |
| **Risk Assessment** | Identification of potential risks |
| **Maintenance** | Guidance for updates and migrations |

---

## Technology Stack Overview

### Stack Summary

| Category | Primary Technology | Version |
|----------|-------------------|---------|
| **Framework** | React | 19.2.3 |
| **Language** | TypeScript | 5.7.3 |
| **Build Tool** | Vite | 6.1.0 |
| **Routing** | TanStack Router | 1.141.8 |
| **State Management** | TanStack Store | 0.2.1 (migrating to Zustand) |
| **Code Execution** | WebContainer API | 1.6.1 |
| **File System** | File System Access API | Browser native |
| **Persistence** | IndexedDB (Dexie.js) | 4.2.1 |
| **Editor** | Monaco Editor | 0.56.0 |
| **Terminal** | xterm.js | 5.8.1 |
| **Styling** | Tailwind CSS | 4.0.0 |
| **Testing** | Vitest | 3.0.7 |
| **i18n** | i18next | 24.2.2 |

---

## Core Framework

### React

| Property | Value |
|----------|-------|
| **Package** | `react`, `react-dom` |
| **Version** | 19.2.3 |
| **Role** | Core UI framework |
| **Usage** | Component-based UI, hooks, context |

**Rationale:**
- Industry standard for modern web development
- Large ecosystem and community support
- Excellent TypeScript integration
- Server Components (future-proofing)
- React 19 brings performance improvements and new features

**Key Features Used:**
- Functional components with hooks
- Context API for state management
- Concurrent rendering (React 18+)
- Suspense for async operations

**Migration Path:**
- React 19 is the latest stable version
- No major breaking changes from React 18
- Planned adoption of React Compiler when stable

---

### TypeScript

| Property | Value |
|----------|-------|
| **Package** | `typescript` |
| **Version** | 5.7.3 |
| **Role** | Type system and language |
| **Usage** | Type safety, IDE support, refactoring |

**Rationale:**
- Industry standard for React development
- Excellent IDE support (VS Code)
- Catch errors at compile time
- Better code documentation
- Safer refactoring

**Configuration:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "verbatimModuleSyntax": false
  }
}
```

---

## UI Framework & Components

### Radix UI

| Property | Value |
|----------|-------|
| **Package** | `@radix-ui/*` |
| **Version** | Various |
| **Role** | Headless UI components |
| **Components Used** | Dialog, Dropdown Menu, Label, Select, Separator, Slot, Switch, Tabs |

**Rationale:**
- Accessible by default (ARIA compliant)
- Unstyled (full design control)
- Excellent keyboard navigation
- Small bundle size
- Strong TypeScript support

**Components:**
- `@radix-ui/react-dialog` - Modal dialogs
- `@radix-ui/react-dropdown-menu` - Dropdown menus
- `@radix-ui/react-label` - Form labels
- `@radix-ui/react-select` - Select inputs
- `@radix-ui/react-separator` - Visual separators
- `@radix-ui/react-slot` - Component composition
- `@radix-ui/react-switch` - Toggle switches
- `@radix-ui/react-tabs` - Tab navigation

---

### Lucide React

| Property | Value |
|----------|-------|
| **Package** | `lucide-react` |
| **Version** | 0.468.0 |
| **Role** | Icon library |
| **Usage** | UI icons throughout the application |

**Rationale:**
- Consistent icon style
- Tree-shakeable (only used icons bundled)
- TypeScript support
- Active maintenance
- Customizable via props

---

### Sonner

| Property | Value |
|----------|-------|
| **Package** | `sonner` |
| **Version** | 1.7.4 |
| **Role** | Toast notifications |
| **Usage** | User feedback for operations |

**Rationale:**
- Beautiful default styling
- Easy to use API
- Supports stacking multiple toasts
- Customizable
- Small bundle size

---

### React Resizable Panels

| Property | Value |
|----------|-------|
| **Package** | `react-resizable-panels` |
| **Version** | 2.1.7 |
| **Role** | Resizable panel layouts |
| **Usage** | IDE layout with resizable panels |

**Rationale:**
- Smooth resizing with mouse drag
- Supports nested panels
- Persist panel sizes
- Good performance
- TypeScript support

---

## State Management

### TanStack Store

| Property | Value |
|----------|-------|
| **Package** | `@tanstack/store` |
| **Version** | 0.2.1 |
| **Role** | Lightweight state management |
| **Status** | Current (migrating to Zustand) |

**Rationale:**
- Minimal API surface
- Strong TypeScript support
- Good performance
- Small bundle size

**Migration Status:**
- Currently used in [`WorkspaceContext`](../src/lib/workspace/WorkspaceContext.tsx:1)
- Planned migration to Zustand (Epic 27)
- Migration will improve type safety and developer experience

---

### Zustand

| Property | Value |
|----------|-------|
| **Package** | `zustand` |
| **Version** | 5.0.2 |
| **Role** | State management (future) |
| **Status** | Planned (Epic 27) |

**Rationale:**
- Simple API
- No context provider needed
- Excellent TypeScript support
- Built-in middleware (devtools, persistence)
- Small bundle size

**Migration Plan:**
- Phase 1: Create Zustand stores for workspace state
- Phase 2: Migrate components to use Zustand stores
- Phase 3: Remove TanStack Store dependency
- Phase 4: Remove React Context for state management

---

## Routing & Navigation

### TanStack Router

| Property | Value |
|----------|-------|
| **Package** | `@tanstack/react-router` |
| **Version** | 1.141.8 |
| **Role** | Client-side routing |
| **Usage** | File-based routing, navigation |

**Rationale:**
- Type-safe routing
- File-based routing (like Next.js)
- Excellent TypeScript support
- Built-in data loading
- Search params management
- Code splitting out of the box

**Key Features Used:**
- File-based route generation
- Route parameters
- Search params
- Route loaders
- Code splitting

**Configuration:**
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [
    TanStackRouterVite(),
    // ... other plugins
  ],
});
```

**SSR Disabled:**
- Client-side only (SSR disabled for WebContainer compatibility)
- WebContainer requires browser APIs not available on server

---

## Code Execution

### WebContainer API

| Property | Value |
|----------|-------|
| **Package** | `@webcontainer/api` |
| **Version** | 1.6.1 |
| **Role** | Code execution in browser sandbox |
| **Usage** | Run Node.js code, install packages, execute commands |

**Rationale:**
- No server required
- Isolated execution environment
- Fast startup (compared to VMs)
- Native Node.js compatibility
- Secure sandbox

**Key Features:**
- File system operations
- Process spawning
- Terminal emulation
- Package installation (npm, yarn, pnpm)

**Limitations:**
- Browser compatibility (Chrome/Edge only)
- Requires cross-origin isolation headers
- Limited to Node.js ecosystem

**Cross-Origin Isolation:**
```typescript
// Required headers
res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
```

---

## File System Access

### File System Access API

| Property | Value |
|----------|-------|
| **Package** | Browser native |
| **Version** | Browser API |
| **Role** | Local file system access |
| **Usage** | Read/write local files |

**Rationale:**
- User owns their data
- Works offline (with limitations)
- Familiar mental model for developers
- No server required

**Browser Compatibility:**
- Chrome 86+
- Edge 86+
- Firefox (limited support)
- Safari (limited support)

**Key APIs Used:**
- `window.showDirectoryPicker()` - Request directory access
- `FileSystemDirectoryHandle` - Directory handle
- `FileSystemFileHandle` - File handle
- `requestPermission()` - Request permissions

**Permission States:**
- `granted` - Permission granted
- `denied` - Permission denied
- `prompt` - User needs to grant permission
- `unknown` - Permission state unknown

---

## Persistence

### IndexedDB (Dexie.js)

| Property | Value |
|----------|-------|
| **Package** | `dexie`, `dexie-react-hooks` |
| **Version** | 4.2.1 |
| **Role** | Client-side database |
| **Usage** | Project metadata, IDE state, chat history |

**Rationale:**
- Browser-native storage
- Large storage capacity (hundreds of MB)
- Asynchronous API
- Works offline
- Type-safe with Dexie.js

**Dexie.js Benefits:**
- Promises-based API
- Type-safe queries
- Automatic schema migrations
- Transaction support
- React hooks for easy integration

**Database Schema:**
```typescript
class ViaGentDatabase extends Dexie {
  constructor() {
    super('ViaGentDB');
    this.version(3).stores({
      projects: 'id, name, lastOpened, createdAt',
      ideState: 'projectId, updatedAt',
      conversations: 'id, projectId, createdAt, updatedAt',
      taskContexts: 'id, projectId, agentId, status, createdAt, updatedAt',
      toolExecutions: 'id, taskId, status, createdAt',
    });
  }
}
```

**Migration Status:**
- Version 3 schema active
- Legacy idb implementation being removed
- Data migration from legacy DB planned

---

### idb (Legacy)

| Property | Value |
|----------|-------|
| **Package** | `idb` |
| **Version** | 8.0.0 |
| **Role** | Legacy IndexedDB wrapper |
| **Status** | Deprecated (being removed) |

**Rationale for Removal:**
- Dexie.js provides better TypeScript support
- Dexie.js has better API ergonomics
- Dual persistence creates confusion
- Maintenance burden

---

## Editor & Terminal

### Monaco Editor

| Property | Value |
|----------|-------|
| **Package** | `@monaco-editor/react`, `monaco-editor` |
| **Version** | 0.56.0 |
| **Role** | Code editor |
| **Usage** | Main code editing interface |

**Rationale:**
- Industry standard (VS Code's editor)
- Excellent TypeScript support
- Rich language features (IntelliSense, etc.)
- Customizable
- Good performance

**Key Features:**
- Syntax highlighting
- Code completion
- Error diagnostics
- Multi-cursor editing
- Minimap
- Git integration (future)

**Configuration:**
```typescript
import { loader } from '@monaco-editor/react';
loader.config().then(/* ... */);
```

---

### xterm.js

| Property | Value |
|----------|-------|
| **Package** | `@xterm/xterm`, `@xterm/addon-fit` |
| **Version** | 5.8.1 |
| **Role** | Terminal emulation |
| **Usage** | Integrated terminal |

**Rationale:**
- Industry standard (VS Code's terminal)
- Excellent performance
- Customizable
- Good accessibility
- Active maintenance

**Key Features:**
- ANSI escape code support
- Custom themes
- Multiple addons (fit, search, webgl)
- Good performance

---

## Internationalization

### i18next

| Property | Value |
|----------|-------|
| **Package** | `i18next`, `i18next-browser-languagedetector`, `react-i18next` |
| **Version** | 24.2.2 |
| **Role** | Internationalization |
| **Usage** | Multi-language support (English, Vietnamese) |

**Rationale:**
- Industry standard
- Excellent TypeScript support
- Rich features (plurals, interpolation, etc.)
- Good performance
- Easy to use

**Supported Languages:**
- English (`en`)
- Vietnamese (`vi`)

**Key Features:**
- Automatic language detection
- Namespace support
- Pluralization
- Interpolation
- Translation extraction

---

## Styling & Theming

### Tailwind CSS

| Property | Value |
|----------|-------|
| **Package** | `tailwindcss`, `@tailwindcss/vite` |
| **Version** | 4.0.0 |
| **Role** | Utility-first CSS framework |
| **Usage** | UI styling, theming |

**Rationale:**
- Utility-first approach
- Small bundle size (tree-shakeable)
- Excellent developer experience
- Built-in responsive design
- Customizable via config

**Tailwind CSS 4:**
- Latest version with new features
- Better performance
- Improved TypeScript support
- New color palette

**Configuration:**
```javascript
// tailwind.config.js
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      // Custom theme extensions
    },
  },
};
```

---

### next-themes

| Property | Value |
|----------|-------|
| **Package** | `next-themes` |
| **Version** | 0.4.6 |
| **Role** | Theme management (dark/light mode) |
| **Status** | Planned (Epic 23) |

**Rationale:**
- Simple API
- System preference detection
- No flash of unstyled content
- TypeScript support

---

### class-variance-authority

| Property | Value |
|----------|-------|
| **Package** | `class-variance-authority` |
| **Version** | 0.7.1 |
| **Role** | Component variant management |
| **Usage** | Shadcn UI components |

**Rationale:**
- Type-safe component variants
- Composable styles
- Good TypeScript support
- Small bundle size

---

### clsx & tailwind-merge

| Property | Value |
|----------|-------|
| **Package** | `clsx`, `tailwind-merge` |
| **Version** | Various |
| **Role** | Utility functions for CSS classes |
| **Usage** | Conditional class names, merging Tailwind classes |

**Rationale:**
- clsx: Conditional class names
- tailwind-merge: Merge Tailwind classes without conflicts
- Small bundle size
- TypeScript support

---

## Build & Development Tools

### Vite

| Property | Value |
|----------|-------|
| **Package** | `vite` |
| **Version** | 6.1.0 |
| **Role** | Build tool and dev server |
| **Usage** | Development server, production builds |

**Rationale:**
- Fast development server (HMR)
- Fast production builds (ESBuild)
- Excellent plugin ecosystem
- Built-in TypeScript support
- Modern tooling

**Key Features:**
- Hot Module Replacement (HMR)
- Fast cold start
- Optimized production builds
- Plugin system

**Configuration:**
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [
    crossOriginIsolationPlugin(), // Must be first
    TanStackRouterVite(),
    // ... other plugins
  ],
});
```

---

### TypeScript Config Paths

| Property | Value |
|----------|-------|
| **Package** | `vite-tsconfig-paths` |
| **Version** | 5.1.4 |
| **Role** | TypeScript path mapping in Vite |
| **Usage** | `@/*` path alias |

**Rationale:**
- Enables `@/*` imports in Vite
- Consistent with tsconfig.json
- Better import readability

---

## Testing

### Vitest

| Property | Value |
|----------|-------|
| **Package** | `vitest` |
| **Version** | 3.0.7 |
| **Role** | Unit and integration testing |
| **Usage** | Test framework |

**Rationale:**
- Vite-native (fast)
- Jest-compatible API
- Excellent TypeScript support
- Built-in code coverage
- Watch mode

**Configuration:**
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
});
```

---

### @testing-library/react

| Property | Value |
|----------|-------|
| **Package** | `@testing-library/react` |
| **Version** | 16.2.0 |
| **Role** | React component testing |
| **Usage** | Test React components |

**Rationale:**
- User-centric testing
- Encourages accessible components
- Good TypeScript support
- Industry standard

---

### fake-indexeddb

| Property | Value |
|----------|-------|
| **Package** | `fake-indexeddb` |
| **Version** | 6.0.0 |
| **Role** | IndexedDB mocking |
| **Usage** | Test IndexedDB operations |

**Rationale:**
- In-memory IndexedDB implementation
- Fast tests
- No side effects
- Good API compatibility

---

## Observability

### Sentry

| Property | Value |
|----------|-------|
| **Package** | `@sentry/react` |
| **Version** | 8.55.0 |
| **Role** | Error tracking and monitoring |
| **Status** | Configured (Epic 22-4) |

**Rationale:**
- Industry standard
- Excellent error tracking
- Performance monitoring
- Release tracking
- Good TypeScript support

**Configuration:**
```typescript
// src/lib/sentry.ts
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
});
```

---

## Version Compatibility Matrix

### Browser Compatibility

| Browser | Minimum Version | File System Access | WebContainer | Notes |
|---------|----------------|-------------------|-------------|-------|
| Chrome | 86+ | ✅ Full | ✅ Full | Recommended |
| Edge | 86+ | ✅ Full | ✅ Full | Recommended |
| Firefox | 100+ | ⚠️ Partial | ❌ No | Not supported |
| Safari | 16.4+ | ⚠️ Partial | ❌ No | Not supported |

**Note:** Via-gent requires Chrome or Edge for full functionality.

---

### Dependency Compatibility

| Dependency | Version | React | TypeScript | Node.js |
|------------|---------|-------|------------|---------|
| React | 19.2.3 | 19+ | 4.1+ | N/A |
| TanStack Router | 1.141.8 | 18+ | 5.0+ | N/A |
| WebContainer API | 1.6.1 | N/A | N/A | N/A (browser) |
| Dexie.js | 4.2.1 | N/A | 4.0+ | N/A |
| Zustand | 5.0.2 | 18+ | 4.0+ | N/A |
| Tailwind CSS | 4.0.0 | N/A | N/A | N/A |
| Vite | 6.1.0 | N/A | 5.0+ | 18+ |

---

## Security Considerations

### Security Headers

| Header | Value | Purpose |
|--------|-------|---------|
| `Cross-Origin-Opener-Policy` | `same-origin` | Enable SharedArrayBuffer |
| `Cross-Origin-Embedder-Policy` | `require-corp` | Enable SharedArrayBuffer |
| `Cross-Origin-Resource-Policy` | `cross-origin` | Allow cross-origin resources |

**Implementation:**
```typescript
// netlify/edge-functions/add-headers.ts
export default async (request: Request) => {
  const response = await fetch(request);
  const newResponse = new Response(response.body, response);
  newResponse.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  newResponse.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
  newResponse.headers.set('Cross-Origin-Resource-Policy', 'cross-origin');
  return newResponse;
};
```

---

### Content Security Policy

**Status:** Not yet configured (Epic 22-1)

**Planned CSP:**
```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.stackblitz.io; font-src 'self' data:;
```

---

### Dependency Security

| Tool | Purpose | Status |
|------|---------|--------|
| `npm audit` | Vulnerability scanning | ✅ Configured |
| `snyk` | Dependency monitoring | ⏳ Planned |
| `dependabot` | Automated updates | ✅ Configured |

---

## Performance Considerations

### Bundle Size Optimization

| Strategy | Implementation | Status |
|----------|----------------|--------|
| Code splitting | TanStack Router file-based routing | ✅ Implemented |
| Tree shaking | Vite + ESBuild | ✅ Implemented |
| Lazy loading | Monaco Editor languages on-demand | ✅ Implemented |
| Compression | Brotli + Gzip | ✅ Implemented |

---

### Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Initial page load | < 2s | ⏳ Measuring |
| Time to interactive | < 5s | ⏳ Measuring |
| WebContainer boot | < 3s | ⏳ Measuring |
| File sync (100 files) | < 3s | ⏳ Measuring |
| First contentful paint | < 1s | ⏳ Measuring |

---

### Performance Monitoring

| Tool | Purpose | Status |
|------|---------|--------|
| Lighthouse CI | Performance metrics | ⏳ Planned (Epic 22-6) |
| Sentry | Error tracking | ✅ Configured (Epic 22-4) |
| Web Vitals | Core metrics | ⏳ Planned |

---

## Technology Selection Rationale

### Decision Framework

Technology selections were based on the following criteria:

1. **Local-First Architecture** - All data stored locally, no server required
2. **Browser Compatibility** - Chrome/Edge with File System Access API
3. **Performance** - Fast startup, responsive UI
4. **Type Safety** - TypeScript throughout
5. **Developer Experience** - Good tooling, clear patterns
6. **Maintainability** - Clear architecture, well-documented
7. **Extensibility** - Plugin architecture for future features

---

### Key Trade-offs

| Decision | Benefit | Trade-off |
|----------|---------|-----------|
| Client-side only | Zero infrastructure costs | Limited to browser capabilities |
| Local FS as source of truth | User owns data | No reverse sync from WebContainer |
| React Context for state | Simple for small apps | Performance issues at scale |
| IndexedDB for persistence | Works offline | Quota limitations |
| WebContainer for execution | No server required | Browser compatibility constraints |

---

### Future Technology Considerations

| Technology | Potential Use | Status |
|------------|---------------|--------|
| React Server Components | Performance optimization | ⏳ Evaluating |
| WebAssembly | Alternative code execution | ⏳ Evaluating |
| Service Workers | Offline support | ⏳ Planned |
| IndexedDB 2.0 | Better performance | ⏳ Waiting for browser support |
| File System Access API v2 | Better permissions | ⏳ Waiting for browser support |

---

## Conclusion

Via-gent's technology stack is carefully selected to support a local-first, browser-based IDE. The stack prioritizes type safety, performance, and developer experience while maintaining a small bundle size and good browser compatibility.

Key technologies include React 19, TypeScript, TanStack Router, WebContainer API, and IndexedDB. The stack is designed to be extensible, with clear migration paths for state management (to Zustand) and persistence (to Dexie.js).

For detailed architecture information, refer to the [`architecture.md`](./architecture.md) document.

---

## Document References

| Document | Location |
|----------|----------|
| **Project Overview** | [`project-overview.md`](./project-overview.md) |
| **Architecture** | [`architecture.md`](./architecture.md) |
| **Data & Contracts** | [`data-and-contracts.md`](./data-and-contracts.md) |
| **Tech Debt** | [`tech-debt.md`](./tech-debt.md) |
| **Improvement Opportunities** | [`improvement-opportunities.md`](./improvement-opportunities.md) |
| **Roadmap** | [`roadmap-and-planning.md`](./roadmap-and-planning.md) |

---

**Document Owners:** Architecture Team  
**Review Cycle:** Quarterly  
**Next Review:** 2025-03-23