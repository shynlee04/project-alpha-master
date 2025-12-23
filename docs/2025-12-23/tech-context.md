# Tech Context

**Analysis Date:** 2025-12-23  
**Project:** Via-gent Browser-Based IDE  
**Purpose:** Technology stack analysis with versions, roles, and risk assessment

---

## Table of Contents

1. [Framework & Runtime](#framework--runtime)
2. [Routing & State Management](#routing--state-management)
3. [UI Components & Styling](#ui-components--styling)
4. [Code Editor & Terminal](#code-editor--terminal)
5. [WebContainer & File System](#webcontainer--file-system)
6. [Data Persistence](#data-persistence)
7. [Internationalization](#internationalization)
8. [Testing & Quality](#testing--quality)
9. [Build & Development Tools](#build--development-tools)
10. [Observability & Monitoring](#observability--monitoring)
11. [Risk Assessment Summary](#risk-assessment-summary)

---

## Framework & Runtime

| Package | Version | Role | Risk | Notes |
|---------|---------|------|------|-------|
| `react` | ^19.2.3 | UI Framework | **Low** | Latest stable React 19 with new features (useTransition, useDeferredValue) |
| `react-dom` | ^19.2.3 | DOM Rendering | **Low** | Paired with React 19 |
| `typescript` | ^5.9.3 | Type System | **Low** | Modern TypeScript with strict mode enabled |

**Key Points:**
- React 19 is the latest major version with improved performance and new hooks
- TypeScript strict mode is enabled with `noUnusedLocals` and `noUnusedParameters`
- `verbatimModuleSyntax: false` (not strict ESM) for compatibility

---

## Routing & State Management

| Package | Version | Role | Risk | Notes |
|---------|---------|------|------|-------|
| `@tanstack/react-router` | ^1.141.8 | File-based Routing | **Low** | Modern router with type-safe routes |
| `@tanstack/react-router-devtools` | ^1.141.8 | Router Debugging | **Low** | Development tool for router inspection |
| `@tanstack/react-router-ssr-query` | ^1.141.8 | SSR Query Integration | **Medium** | Not used (SSR disabled for WebContainer compatibility) |
| `@tanstack/react-start` | ^1.142.0 | App Framework | **Low** | TanStack Start framework integration |
| `@tanstack/router-plugin` | ^1.142.0 | Vite Router Plugin | **Low** | Auto-generates route tree |
| `@tanstack/store` | ^0.8.0 | State Management | **Medium** | Lightweight reactive state store |
| `@tanstack/react-devtools` | ^0.7.11 | React DevTools | **Low** | Development debugging tool |
| `zustand` | ^5.0.9 | Alternative State Store | **Low** | Used in Epic 27 migration (in progress) |

**Key Points:**
- TanStack Router provides file-based routing with type safety
- SSR is disabled due to WebContainer requirements
- TanStack Store is used for reactive state management
- Zustand is being migrated in for state architecture stabilization (Epic 27)

---

## UI Components & Styling

| Package | Version | Role | Risk | Notes |
|---------|---------|------|------|-------|
| `tailwindcss` | ^4.1.18 | CSS Framework | **Low** | Latest Tailwind CSS 4 with new features |
| `@tailwindcss/vite` | ^4.1.18 | Vite Tailwind Plugin | **Low** | Tailwind integration for Vite |
| `@radix-ui/react-dialog` | ^1.1.15 | Dialog Component | **Low** | Accessible dialog primitives |
| `@radix-ui/react-dropdown-menu` | ^2.1.16 | Dropdown Menu | **Low** | Accessible dropdown menu |
| `@radix-ui/react-label` | ^2.1.8 | Label Component | **Low** | Form label primitive |
| `@radix-ui/react-select` | ^2.2.6 | Select Component | **Low** | Accessible select dropdown |
| `@radix-ui/react-separator` | ^1.1.8 | Separator Component | **Low** | Visual separator |
| `@radix-ui/react-slot` | ^1.2.4 | Slot Component | **Low** | Compound component pattern |
| `@radix-ui/react-switch` | ^1.2.6 | Switch Component | **Low** | Toggle switch |
| `@radix-ui/react-tabs` | ^1.1.13 | Tabs Component | **Low** | Tab navigation |
| `@radix-ui/react-tooltip` | ^1.2.8 | Tooltip Component | **Low** | Accessible tooltips |
| `class-variance-authority` | ^0.7.1 | Variant Management | **Low** | CVA for component variants |
| `clsx` | ^2.1.1 | Class Name Utility | **Low** | Conditional class names |
| `tailwind-merge` | ^3.4.0 | Tailwind Merge | **Low** | Merges Tailwind classes |
| `next-themes` | ^0.4.6 | Theme Management | **Low** | Dark/light theme toggle |
| `lucide-react` | ^0.544.0 | Icon Library | **Low** | Consistent icon set |
| `sonner` | ^2.0.7 | Toast Notifications | **Low** | Modern toast component |
| `react-resizable-panels` | ^3.0.6 | Resizable Panels | **Low** | IDE panel resizing |

**Key Points:**
- Tailwind CSS 4 is the latest major version with improved performance
- Radix UI provides accessible, unstyled component primitives
- Component variants managed via CVA (Class Variance Authority)
- Theme switching via next-themes (Epic 23 implementation)

---

## Code Editor & Terminal

| Package | Version | Role | Risk | Notes |
|---------|---------|------|------|-------|
| `monaco-editor` | ^0.55.1 | Code Editor Core | **Low** | VS Code editor core |
| `@monaco-editor/react` | ^4.7.0 | React Monaco Wrapper | **Low** | React integration for Monaco |
| `@xterm/xterm` | ^5.5.0 | Terminal Emulator | **Low** | xterm.js terminal |
| `@xterm/addon-fit` | ^0.10.0 | Terminal Fit Addon | **Low** | Auto-fit terminal size |

**Key Points:**
- Monaco Editor provides VS Code-like editing experience
- xterm.js provides terminal emulation
- Both are mature, well-maintained libraries
- Monaco loads languages/features on-demand for performance

---

## WebContainer & File System

| Package | Version | Role | Risk | Notes |
|---------|---------|------|------|-------|
| `@webcontainer/api` | ^1.6.1 | WebContainer SDK | **Medium** | StackBlitz WebContainer API |
| `isomorphic-git` | ^1.36.1 | Git Operations | **Medium** | Client-side Git operations |

**Key Points:**
- WebContainer API is proprietary to StackBlitz
- Requires cross-origin isolation headers (COOP/COEP)
- WebContainer boot time is ~3-5 seconds
- Singleton pattern: only one WebContainer per page
- isomorphic-git enables client-side Git operations

**Risk Notes:**
- WebContainer API is a single-vendor dependency
- No open-source alternative available
- Requires specific browser support (Chrome/Edge with File System Access API)

---

## Data Persistence

| Package | Version | Role | Risk | Notes |
|---------|---------|------|------|-------|
| `dexie` | ^4.2.1 | IndexedDB Wrapper | **Low** | Type-safe IndexedDB |
| `dexie-react-hooks` | ^4.2.0 | Dexie React Hooks | **Low** | React hooks for Dexie |
| `idb` | ^8.0.3 | Alternative IndexedDB | **Low** | idb-style wrapper (compatibility layer) |
| `zod` | ^4.2.1 | Schema Validation | **Low** | Runtime type validation |

**Key Points:**
- Dexie.js provides type-safe IndexedDB access
- Version 3 schema with 5 tables: projects, conversations, ideState, taskContexts, toolExecutions
- idb is used as a compatibility layer
- Zod validates data at runtime

**Schema Version:** 3 (latest)

---

## Internationalization

| Package | Version | Role | Risk | Notes |
|---------|---------|------|------|-------|
| `i18next` | ^23.10.1 | i18n Framework | **Low** | Industry standard for i18n |
| `i18next-browser-languagedetector` | ^8.2.0 | Language Detection | **Low** | Browser language detection |
| `react-i18next` | ^15.3.0 | React Integration | **Low** | React hooks for i18next |

**Key Points:**
- Supports English (en) and Vietnamese (vi)
- Translation keys auto-extracted via i18next-scanner
- Translation files: `src/i18n/{en,vi}.json`
- Language switcher implemented in Epic 21

---

## Testing & Quality

| Package | Version | Role | Risk | Notes |
|---------|---------|------|------|-------|
| `vitest` | ^3.2.4 | Test Runner | **Low** | Fast test runner |
| `@testing-library/react` | ^16.3.1 | React Testing | **Low** | Component testing utilities |
| `@testing-library/jest-dom` | ^6.9.1 | Jest DOM Matchers | **Low** | Custom DOM matchers |
| `@testing-library/dom` | ^10.4.1 | DOM Testing | **Low** | DOM testing utilities |
| `jsdom` | ^27.3.0 | DOM Environment | **Low** | JSDOM for testing |
| `fake-indexeddb` | ^6.2.5 | IndexedDB Mock | **Low** | Mock IndexedDB in tests |
| `axe-core` | ^4.9.0 | Accessibility Testing | **Low** | Axe core for a11y |
| `jest-axe` | ^9.0.0 | Jest Axe Matcher | **Low** | Jest matcher for axe-core |
| `vitest-axe` | ^0.1.0 | Vitest Axe Matcher | **Low** | Vitest matcher for axe-core |

**Key Points:**
- Vitest is used as the test runner (compatible with Vite)
- Tests co-located in `__tests__` directories
- React components use `jsdom` environment
- File System Access API is mocked in tests
- Accessibility testing via axe-core

---

## Build & Development Tools

| Package | Version | Role | Risk | Notes |
|---------|---------|------|------|-------|
| `vite` | ^7.3.0 | Build Tool | **Low** | Fast build tool |
| `@vitejs/plugin-react` | ^5.1.2 | React Plugin | **Low** | Vite React plugin |
| `vite-tsconfig-paths` | ^5.1.4 | Path Alias Support | **Low** | TypeScript path aliases |
| `@tanstack/devtools-vite` | ^0.3.12 | TanStack DevTools | **Low** | Vite plugin for devtools |
| `@cloudflare/vite-plugin` | ^1.19.0 | Cloudflare Pages | **Medium** | Cloudflare deployment |
| `@netlify/vite-plugin-tanstack-start` | ^1.2.5 | Netlify Deployment | **Medium** | Netlify deployment |
| `wrangler` | ^4.56.0 | Cloudflare CLI | **Medium** | Cloudflare Workers CLI |
| `i18next-scanner` | ^4.6.0 | i18n Extraction | **Low** | Extract translation keys |

**Key Points:**
- Vite 7 is the latest major version
- Supports multiple deployment targets: Cloudflare Pages, Netlify, Node.js
- Dynamic deployment plugin loading based on target
- Cross-origin isolation headers plugin must be first in plugins array

**Deployment Targets:**
- Cloudflare Pages (primary)
- Netlify (alternative)
- Node.js (development)

---

## Observability & Monitoring

| Package | Version | Role | Risk | Notes |
|---------|---------|------|------|-------|
| `@sentry/react` | ^10.32.1 | Error Tracking | **Low** | Sentry error monitoring |
| `web-vitals` | ^5.1.0 | Performance Metrics | **Low** | Core Web Vitals |

**Key Points:**
- Sentry configured for error tracking (Epic 22-4)
- Web Vitals for performance monitoring (Epic 22-6)
- Error boundaries for React error handling

---

## AI & Agent Integration

| Package | Version | Role | Risk | Notes |
|---------|---------|------|------|-------|
| `@tanstack/ai` | ^0.1.0 | AI Framework | **High** | Experimental TanStack AI |
| `@tanstack/ai-gemini` | ^0.1.0 | Gemini Provider | **High** | Google Gemini integration |
| `@tanstack/ai-react` | ^0.1.0 | React AI Hooks | **High** | React hooks for AI |

**Key Points:**
- TanStack AI is experimental (version 0.1.0)
- Used for AI agent integration (Epic 25)
- Agent Tool Facade pattern provides stable interface (Epic 12)
- High risk due to experimental nature

**Risk Notes:**
- TanStack AI is in early development
- API may change significantly
- Consider fallback strategy if API changes

---

## Additional Utilities

| Package | Version | Role | Risk | Notes |
|---------|---------|------|------|-------|
| `eventemitter3` | ^5.0.1 | Event System | **Low** | Event emitter |
| `react-markdown` | ^10.1.0 | Markdown Rendering | **Low** | Markdown to React |
| `rehype-raw` | ^7.0.0 | HTML in Markdown | **Low** | Parse HTML in markdown |
| `rehype-sanitize` | ^6.0.0 | Sanitize HTML | **Low** | Sanitize HTML content |

**Key Points:**
- EventEmitter3 provides typed event bus
- Markdown rendering for agent chat messages
- HTML sanitization for security

---

## Risk Assessment Summary

### High Risk Dependencies

| Package | Risk | Mitigation |
|---------|------|------------|
| `@tanstack/ai` | Experimental API | Monitor for breaking changes, implement facade pattern |
| `@tanstack/ai-gemini` | Experimental API | Consider provider abstraction |
| `@tanstack/ai-react` | Experimental API | Consider provider abstraction |
| `@webcontainer/api` | Single-vendor | No alternative available, monitor for updates |

### Medium Risk Dependencies

| Package | Risk | Mitigation |
|---------|------|------------|
| `@tanstack/react-router-ssr-query` | Not used | Remove or document future use |
| `@cloudflare/vite-plugin` | Deployment lock-in | Support multiple deployment targets |
| `@netlify/vite-plugin-tanstack-start` | Deployment lock-in | Support multiple deployment targets |
| `wrangler` | Deployment lock-in | Support multiple deployment targets |
| `isomorphic-git` | Client-side Git | Monitor for updates, test thoroughly |

### Low Risk Dependencies

All other dependencies are mature, well-maintained libraries with stable APIs.

---

## Dependency Categories

### Core Dependencies (Cannot Remove)
- React 19, TypeScript
- TanStack Router, TanStack Store
- WebContainer API
- Monaco Editor, xterm.js

### UI Dependencies (Can Replace)
- Radix UI components
- Tailwind CSS
- Lucide icons

### State Management (Migrating)
- TanStack Store → Zustand (Epic 27)

### Data Persistence (Stable)
- Dexie.js
- IndexedDB

### Build Tools (Can Replace)
- Vite → alternatives: esbuild, webpack
- Vitest → alternatives: Jest, Mocha

---

## Version Compatibility Matrix

| Category | Current | Latest Stable | Status |
|----------|---------|---------------|--------|
| React | 19.2.3 | 19.2.3 | ✅ Latest |
| TypeScript | 5.9.3 | 5.9.3 | ✅ Latest |
| Vite | 7.3.0 | 7.3.0 | ✅ Latest |
| Vitest | 3.2.4 | 3.2.4 | ✅ Latest |
| Tailwind CSS | 4.1.18 | 4.1.18 | ✅ Latest |
| TanStack Router | 1.141.8 | 1.141.8 | ✅ Latest |
| WebContainer API | 1.6.1 | 1.6.1 | ✅ Latest |
| Monaco Editor | 0.55.1 | 0.55.1 | ✅ Latest |

---

## Security Considerations

### Known Vulnerabilities
- None detected in current dependency versions (as of 2025-12-23)

### Security Best Practices
- HTML sanitization via `rehype-sanitize`
- Path validation via `path-guard.ts`
- Permission lifecycle management
- Error boundaries for React error handling
- Sentry for error tracking

### Browser Requirements
- Chrome/Edge 122+ (File System Access API with persistent permissions)
- Modern browser with SharedArrayBuffer support
- Cross-origin isolation headers required

---

## Performance Considerations

### Bundle Size Impact
- Monaco Editor: ~2MB (code-split by language)
- xterm.js: ~500KB
- WebContainer API: ~1MB
- TanStack Router: ~100KB
- Total estimated: ~3.6MB (gzipped: ~1.2MB)

### Optimization Strategies
- Code splitting by route
- Lazy loading for Monaco languages
- Debounced file sync operations
- WebContainer singleton pattern
- On-demand feature loading

---

## References

- **Package Manifest:** [`package.json`](../package.json)
- **Vite Configuration:** [`vite.config.ts`](../vite.config.ts)
- **TypeScript Configuration:** [`tsconfig.json`](../tsconfig.json)
- **Vitest Configuration:** [`vitest.config.ts`](../vitest.config.ts)
- **Deployment Configuration:** [`netlify.toml`](../netlify.toml)