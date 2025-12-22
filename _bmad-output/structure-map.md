# Via-gent Project - Phase 1 Structural Cartography

**Generated:** 2025-12-22T10:44:45Z  
**Project:** Via-gent - Browser-based IDE with WebContainers  
**Analysis Phase:** Structural Cartography - Root Layout & Key Entrypoints

---

## Executive Summary

Via-gent is a **100% client-side browser-based IDE** that leverages WebContainers to run code locally. The architecture follows a **Local FS as Source of Truth** pattern with bidirectional sync to WebContainer sandboxes.

**Tech Stack:** React 19 + TypeScript + Vite + TanStack Router + WebContainers + Monaco Editor + xterm.js

---

## 1. Root Layout Analysis

### 1.1 Project Type & Deployment Strategy

**Project Classification:** Client-Side Web Application (No Server-Side Rendering)

**Deployment Targets (Configurable):**
- **Cloudflare** (default): `DEPLOY_TARGET=cloudflare` - Full bundle for Workers
- **Netlify**: `DEPLOY_TARGET=netlify` - Netlify Functions integration  
- **Node**: `DEPLOY_TARGET=node` - Traditional Node.js deployment

**Critical Configuration:** `vite.config.ts` (lines 65-95)
- **Cross-Origin Isolation Plugin** is FIRST in plugins array (MANDATORY for WebContainers)
- Security headers: COOP, COEP, CORP for SharedArrayBuffer support
- SSR configuration varies by deployment target

### 1.2 Directory Structure

```
project-alpha-master/
├── src/                          # Source code
│   ├── components/               # React components by feature
│   │   ├── ide/                 # IDE-specific components
│   │   ├── ui/                  # Reusable UI components
│   │   └── layout/              # Layout components
│   ├── lib/                     # Core business logic
│   │   ├── filesystem/          # FSA + sync utilities
│   │   ├── webcontainer/        # WebContainer lifecycle
│   │   ├── workspace/           # State + persistence
│   │   ├── editor/              # Monaco integration
│   │   └── events/              # Event system
│   ├── routes/                  # TanStack Router file-based routes
│   ├── i18n/                    # Internationalization (en/vi)
│   └── data/                    # Demo data & fixtures
├── _bmad-output/                # BMAD artifacts & documentation
├── .cursor/rules/bmad/          # BMAD agent definitions
├── .kilocode/                   # Kilo Code configuration
├── public/                      # Static assets
├── server/                      # Server utilities (security headers)
└── Configuration Files
    ├── vite.config.ts           # Vite + security headers
    ├── vitest.config.ts         # Test configuration
    ├── tsconfig.json            # TypeScript config
    ├── package.json             # Dependencies
    └── wrangler.jsonc           # Cloudflare Workers config
```

---

## 2. Key Entrypoints Identification

### 2.1 Application Entry Points

**Primary Entry:** `src/routes/__root.tsx` (lines 1-95)
- **Root Document:** HTML shell with HeadContent, Scripts
- **Provider Stack:** ThemeProvider → LocaleProvider → AppErrorBoundary
- **Dev Tools:** TanStack Devtools (development only)
- **Typography:** VT323, Press Start 2P, Inter, JetBrains Mono

**Route Generation:** `src/routeTree.gen.ts` (AUTO-GENERATED)
- **⚠️ DO NOT EDIT MANUALLY**
- VS Code settings mark as read-only
- Excluded from watcher/search

### 2.2 HTTP Handlers & Server Logic

**Security Headers:** `vite.config.ts` (lines 32-50)
```typescript
// Cross-Origin Isolation (required for WebContainers)
res.setHeader('Cross-Origin-Opener-Policy', 'same-origin')
res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp')
res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')

// Security Headers (CSP omitted in dev)
res.setHeader('X-Frame-Options', 'DENY')
res.setHeader('X-Content-Type-Options', 'nosniff')
```

**Production Headers:** `server/middleware/security-headers.ts` (referenced in comments)

### 2.3 Background Workers & Processes

**WebContainer Manager:** `src/lib/webcontainer/manager.ts`
- **Singleton Pattern:** Only one WebContainer per page
- **Lifecycle:** Boot → Ready → Error states
- **Process Management:** Terminal, file operations, npm commands

**Sync Manager:** `src/lib/filesystem/sync-manager.ts`
- **Bidirectional Sync:** Local FS ↔ WebContainer FS
- **Debounced Operations:** Batch file changes
- **Exclusions:** `.git`, `node_modules`, `.DS_Store`, `Thumbs.db`

### 2.4 CLI & Development Commands

**Essential Commands (from `package.json`):**
```bash
pnpm dev              # Dev server (port 3000 with COOP/COEP)
pnpm build            # Production build
pnpm preview          # Preview production build
pnpm test             # Run vitest tests
pnpm i18n:extract     # Extract translation keys
```

**Deployment Commands:**
```bash
pnpm build            # Builds with DEPLOY_TARGET env var
wrangler deploy       # Cloudflare deployment (if using wrangler)
```

---

## 3. Testing Topology Mapping

### 3.1 Unit Tests

**Configuration:** `vitest.config.ts`
- **React Components:** `jsdom` environment
- **Other Code:** `node` environment
- **Co-location:** `__tests__` directories adjacent to source

**Mock Requirements:**
- `window.showDirectoryPicker` (File System Access API)
- `fake-indexeddb` (IndexedDB persistence)
- `@testing-library/react` + `jsdom` (React components)

### 3.2 Integration Tests

**File System Tests:** Mock File System Access API
**WebContainer Tests:** Mock WebContainer API
**State Management Tests:** Mock IndexedDB

### 3.3 Test File Patterns

```
src/
├── lib/filesystem/
│   ├── sync-manager.ts
│   ├── sync-manager.test.ts
│   └── __tests__/
│       └── sync-integration.test.ts
├── lib/workspace/
│   ├── WorkspaceContext.tsx
│   ├── WorkspaceContext.test.tsx
│   └── project-store.test.ts
└── components/ide/
    ├── SettingsPanel.tsx
    └── __tests__/
        └── SettingsPanel.test.tsx
```

---

## 4. Architecture Boundaries & Primary Technologies

### 4.1 Apps/Services (Single Application)

**Via-gent:** 100% client-side browser IDE
- **No Admin Route:** Completely client-side (per AGENTS.md)
- **No Server-Side Rendering:** WebContainer compatibility requirement
- **No Backend Services:** All operations local via FSA + WebContainers

### 4.2 Packages/Libraries (External Dependencies)

**Core Framework:**
- **React 19:** UI framework
- **TypeScript:** Type safety
- **Vite 7:** Build tool + dev server
- **TanStack Router 1.141.8:** File-based routing
- **TanStack Start 1.142.0:** Full-stack framework

**WebContainer & Terminal:**
- **@webcontainer/api 1.6.1:** WebContainer lifecycle
- **@xterm/xterm 5.5.0:** Terminal emulator
- **@xterm/addon-fit 0.10.0:** Terminal fit addon

**Editor:**
- **@monaco-editor/react 4.7.0:** Monaco Editor wrapper
- **monaco-editor 0.55.1:** Code editor core

**State & Persistence:**
- **@tanstack/store 0.8.0:** Reactive state
- **zustand 5.0.9:** Additional state management
- **dexie 4.2.1:** IndexedDB wrapper
- **idb 8.0.3:** IndexedDB utilities

**UI Components:**
- **@radix-ui:** Primitives (Dialog, Dropdown, Tabs, etc.)
- **tailwindcss 4.1.18:** Styling
- **lucide-react 0.544.0:** Icons
- **react-resizable-panels 3.0.6:** Panel resizing

**Internationalization:**
- **i18next 23.10.1:** i18n framework
- **react-i18next 15.3.0:** React integration
- **i18next-scanner 4.6.0:** Key extraction

**Observability:**
- **@sentry/react 10.32.1:** Error monitoring

**Utilities:**
- **zod 4.2.1:** Schema validation
- **isomorphic-git 1.36.1:** Git operations
- **eventemitter3 5.0.1:** Event system
- **sonner 2.0.7:** Toast notifications

### 4.3 Infrastructure/Libs (Internal)

**Lib Layer:** `src/lib/`
- **filesystem/** - File system sync and FSA utilities
- **webcontainer/** - WebContainer lifecycle and process management
- **workspace/** - Workspace state and project persistence
- **editor/** - Monaco editor integration
- **events/** - Event system
- **persistence/** - Data persistence utilities

**Components Layer:** `src/components/`
- **ide/** - IDE-specific components (editor, terminal, file tree, preview)
- **ui/** - Reusable UI components
- **layout/** - Layout components

**Routes Layer:** `src/routes/`
- **file-based routing** with TanStack Router
- **SSR disabled** for WebContainer compatibility

---

## 5. Critical Architecture Patterns

### 5.1 File System Architecture

**Local FS as Source of Truth:**
```
Local FS (FSA) ←→ LocalFSAdapter ←→ SyncManager ←→ WebContainer FS
      ↑                                    ↑
   IndexedDB (ProjectStore)         File Change Events
```

**Key Components:**
- **LocalFSAdapter:** Browser's File System Access API wrapper
- **SyncManager:** Bidirectional sync with debounced operations
- **ProjectStore:** IndexedDB for project metadata

### 5.2 State Management

**Workspace State:** `src/lib/workspace/WorkspaceContext.tsx`
- **TanStack Store:** Reactive state
- **React Context:** Component access
- **IndexedDB:** Project persistence

**State Stores:**
- **IDE State:** `ide-state-store.ts` - Editor, panel states
- **File Sync Status:** `file-sync-status-store.ts` - Sync progress
- **Conversations:** `conversation-store.ts` - AI/chat state

### 5.3 WebContainer Lifecycle

**Manager:** `src/lib/webcontainer/manager.ts`
- **Singleton:** Only one instance per page
- **States:** Booting → Ready → Error
- **Process Management:** Terminal, file operations, npm commands

**Terminal Adapter:** `src/lib/webcontainer/terminal-adapter.ts`
- **Working Directory:** Must pass `projectPath` parameter
- **Shell:** Spawns at WebContainer root by default
- **Commands:** `npm install`, `npm run dev`, etc.

### 5.4 Component Structure

**Feature-Based Organization:**
```
src/components/
├── ide/                    # IDE components
│   ├── editor/            # Monaco Editor
│   ├── terminal/          # xterm.js terminal
│   ├── file-tree/         # File explorer
│   ├── preview/           # Live preview panel
│   └── index.ts          # Barrel exports
├── ui/                    # Reusable UI
│   ├── button.tsx         # Button component
│   ├── toast.tsx          # Toast notifications
│   └── index.ts          # Barrel exports
└── layout/                # Layout components
    ├── IDELayout.tsx      # Main IDE layout
    └── index.ts          # Barrel exports
```

**Barrel Exports:** Each component directory has `index.ts` for clean imports

---

## 6. Critical Gotchas & Warnings

### 6.1 WebContainer Cross-Origin Isolation
- **Missing COOP/COEP headers** break WebContainers in dev mode
- **crossOriginIsolationPlugin** must be FIRST in Vite plugins array
- **Required for SharedArrayBuffer** support

### 6.2 File System Sync Architecture
- **Local FS is source of truth**: WebContainer mirrors local files
- **No reverse sync**: Changes in WebContainer (e.g., `npm install`) do NOT sync back to local drive
- **Sync exclusions**: `.git`, `node_modules`, `.DS_Store`, `Thumbs.db` are excluded
- **Singleton WebContainer**: Only one instance per page

### 6.3 Terminal Working Directory
- **Shell spawns at WebContainer root** by default
- **Pass `projectPath`** to `XTerminal` component or `adapter.startShell(projectPath)`
- **Without this**, commands like `npm install` won't find `package.json`

### 6.4 File System Access API Permissions
- **Permissions are ephemeral** (single session by default)
- **Use `permission-lifecycle.ts`** utilities to manage persistence
- **Handle `PermissionDeniedError`** gracefully in UI

### 6.5 IndexedDB Schema Management
- **Project metadata schema** in `src/lib/workspace/project-store.ts`
- **Schema changes require** migration logic
- **Versioned schema** with upgrade transactions

### 6.6 Error Handling
- **Use custom error classes** from `src/lib/filesystem/sync-types.ts`
- **SyncError**, `PermissionDeniedError`, `FileSystemError`
- **Catch specific error types** rather than generic `Error`

### 6.7 Import Order Convention
1. React imports
2. Third-party libraries
3. Internal modules with `@/` alias
4. Relative imports

---

## 7. Development Workflow Summary

### 7.1 Starting Development
1. Run `pnpm dev` - starts on port 3000 with required headers
2. Open browser to `http://localhost:3000`
3. Grant file system permissions when prompted

### 7.2 Testing
- Tests use `vitest` with `jsdom` for React components
- File System Access API is mocked in tests
- Test files follow naming pattern `*.test.ts` or `*.test.tsx`

### 7.3 Internationalization
- Use `t()` hook or `i18next.t()` function for translations
- Run `pnpm i18n:extract` to update translation files
- Keys auto-extracted from source code

### 7.4 Route Generation
- TanStack Router auto-generates `src/routeTree.gen.ts`
- **DO NOT edit this file manually**
- VS Code settings mark it as read-only and exclude from watcher/search

---

## 8. Next Steps for Phase 2

**Recommended Deep Dives:**
1. **Sync Manager Implementation:** Analyze `src/lib/filesystem/sync-manager.ts`
2. **WebContainer Lifecycle:** Study `src/lib/webcontainer/manager.ts`
3. **State Management:** Examine `src/lib/workspace/WorkspaceContext.tsx`
4. **Component Inventory:** Map all IDE components in `src/components/ide/`
5. **Test Coverage:** Run `pnpm test` to identify gaps

**Critical Files to Read:**
- `src/lib/filesystem/sync-manager.ts` (Core sync logic)
- `src/lib/webcontainer/manager.ts` (WebContainer lifecycle)
- `src/lib/workspace/WorkspaceContext.tsx` (State management)
- `src/components/ide/index.ts` (Component exports)
- `src/routes/index.tsx` (Dashboard route)

---

## 9. Key Insights

### 9.1 Architecture Strengths
- **Local FS as Source of Truth:** Clear data flow and ownership
- **WebContainer Isolation:** Sandboxed execution environment
- **IndexedDB Persistence:** Project metadata survives sessions
- **BMAD Method Integration:** Structured development workflow
- **Multi-language Support:** English + Vietnamese i18n

### 9.2 Architecture Concerns
- **WebContainer Cross-Origin Isolation:** Critical dependency on headers
- **No Reverse Sync:** WebContainer changes don't sync back (by design)
- **Single WebContainer:** Potential bottleneck for multi-project workflows
- **Ephemeral Permissions:** Requires permission lifecycle management

### 9.3 Technology Decisions
- **TanStack Router:** File-based routing for simplicity
- **Monaco Editor:** Industry-standard code editor
- **xterm.js:** Robust terminal emulator
- **WebContainers:** Browser-based execution (no server required)
- **IndexedDB:** Client-side persistence without external dependencies

---

**Document Status:** ✅ COMPLETE  
**Analysis Depth:** Comprehensive structural cartography  
**Next Phase:** Component inventory and detailed implementation analysis

*This document provides the foundation for Phase 2 - Component Inventory and Phase 3 - Implementation Deep Dive.*