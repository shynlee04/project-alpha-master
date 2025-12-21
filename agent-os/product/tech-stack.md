# Tech Stack

Complete technology stack for Via-Gent, validated against 2025 best practices.  
**Last Updated:** 2025-12-21 (Stack Enhancement Report Integration)

---

## Framework & Runtime

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Application Framework** | TanStack Start | 1.142.0 | Full-stack React meta-framework with SSR/SPA modes |
| **Router** | TanStack Router | 1.141.8 | File-based routing, type-safe navigation |
| **State Management** | Zustand | 5.x | 🆕 Lightweight reactive state (replaces TanStack Store) |
| **Query/Caching** | TanStack Query | 5.x | 🆕 Server state, caching, background sync |
| **Language** | TypeScript | 5.9.3 (strict) | Type safety, developer experience |
| **Runtime** | Node.js | 20.x LTS | Development and build-time |
| **Package Manager** | pnpm | 9.x | Fast, disk-efficient package management |

---

## Frontend

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **UI Library** | React | 19.2.3 | Component-based UI |
| **Build Tool** | Vite | 7.3.0 | Fast HMR, optimized builds |
| **UI Components** | shadcn/ui | latest | Accessible, customizable components |
| **Command Palette** | cmdk | 1.x | 🆕 Command palette (⌘K) |
| **Virtualization** | @tanstack/react-virtual | latest | 🆕 Efficient large list rendering |
| **Code Editor** | Monaco Editor | 4.7.0 (@monaco-editor/react) | VS Code-quality editor |
| **Terminal** | xterm.js | 5.5.0 (@xterm/xterm) | Terminal emulator |
| **Terminal Addons** | xterm-addon-web-links, xterm-addon-search | latest | 🆕 Clickable links, search in terminal |
| **Icons** | Lucide React | latest | Consistent iconography |
| **Styling** | TailwindCSS | 4.1.18 | Utility-first CSS |

---

## Browser APIs & Client-Side Runtime

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Node.js in Browser** | WebContainers | 1.6.1 (@webcontainer/api) | Sandboxed Node.js execution |
| **Local Filesystem** | File System Access API | native | Read/write user's local files |
| **Persistence** | Dexie.js | 4.x | 🆕 IndexedDB wrapper (replaces idb) |
| **File System Abstraction** | BrowserFS + Lightning-FS | latest | 🆕 Unified FS interface for git |
| **Git Client** | isomorphic-git | 1.36.1 | Pure JavaScript Git implementation |

> **Critical Headers Required:**
> - `Cross-Origin-Embedder-Policy: require-corp`
> - `Cross-Origin-Opener-Policy: same-origin`

---

## AI Integration

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **AI Framework** | TanStack AI | 0.1.0 | ⬆️ Streaming responses, tool calls (stable release) |
| **AI React Hooks** | @tanstack/ai-react | 0.1.0 | useChat, useCompletion hooks |
| **AI DevTools** | @tanstack/ai-devtools | 0.1.0-alpha | 🆕 Debug AI tool execution |
| **Gemini Adapter** | @tanstack/ai-gemini | 0.1.0 | Google Gemini integration |
| **Orchestration** | LangGraph.js | latest | 🆕 Multi-agent workflow orchestration |
| **Fuzzy Search** | Fuse.js | latest | 🆕 In-memory fuzzy search for codebase |
| **Local Embeddings** | @xenova/transformers | latest | 🆕 Optional: client-side embeddings |
| **Schema Validation** | Zod | 4.2.1 | Type-safe schemas for tools |

---

## Localization

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **I18n Framework** | react-i18next | 15.3.0 | React integration for internationalization |
| **Core Library** | i18next | 23.10.1 | Translation management |
| **Language Detection** | i18next-browser-languagedetector | 8.2.0 | Auto-detect user language |
| **Extraction** | i18next-scanner | 4.6.0 | Automated key extraction from code |

---

## Testing & Quality

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Test Framework** | Vitest | 3.2.4 | Fast unit/integration testing |
| **Testing Library** | @testing-library/react | 16.3.1 | Component testing utilities |
| **E2E Testing** | Playwright | latest | Browser automation testing |
| **Mocking** | fake-indexeddb | 6.2.5 | IndexedDB mocking for tests |
| **Linting** | ESLint | 9.x | Code quality, best practices |
| **Formatting** | Prettier | 3.x | Consistent code style |

---

## Monitoring & Performance

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Error Monitoring** | @sentry/react | latest | 🆕 Runtime error tracking |
| **Performance Metrics** | web-vitals | 5.1.0 | 🆕 Core Web Vitals tracking |
| **Bundle Analysis** | rollup-plugin-visualizer | latest | 🆕 Build size visualization |
| **Lighthouse CI** | @lhci/cli | 0.15.x | 🆕 Performance benchmarks in CI |

---

## Deployment & Infrastructure

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Hosting** | Netlify | - | Static + SSR hosting |
| **Build Plugin** | @netlify/vite-plugin-tanstack-start | 1.2.5 | Optimized Netlify builds |
| **Edge Functions** | Netlify Edge Functions | - | COOP/COEP header injection |
| **CI/CD** | GitHub Actions | - | Automated build and deploy |
| **Server Runtime** | Nitro | (via TanStack Start) | Universal server framework |

---

## Architecture Patterns

| Pattern | Description |
|---------|-------------|
| **Layered Architecture** | UI → Store → Domain → Adapter → Browser/System |
| **Event-Driven Communication** | Typed EventBus for cross-component messaging |
| **Client-Side Tools** | AI tools execute in browser via `toolDefinition().client()` |
| **Dual Sync** | Local FS as source of truth, WebContainers mirrors |
| **SSR Selective** | `ssr: false` for WebContainer routes, SSR for landing pages |

---

## Browser Compatibility

| Browser | Version | Support Level |
|---------|---------|---------------|
| Chrome | 86+ | Full (required for WebContainers) |
| Edge | 86+ | Full (Chromium-based) |
| Safari | 15.2+ | Partial (FSA support, WebContainers vary) |
| Firefox | 115+ | Limited (no WebContainers, IndexedDB fallback) |

---

## Key Constraints

1. **No Backend Services**: All core functionality runs client-side
2. **Cross-Origin Isolation**: Headers mandatory for SharedArrayBuffer
3. **Client-Only Packages**: xterm, monaco must be externalized from SSR bundle
4. **Single Session**: One active workspace per browser tab
5. **FSA Permission Scope**: Limited to user-approved directories per session

---

## Changelog

| Date | Changes |
|------|---------|
| 2025-12-21 | Stack enhancements from tech-debt analysis |
| 2025-12-20 | Initial validated tech stack |
