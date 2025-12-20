# Tech Stack

Complete technology stack for Via-Gent, validated against 2025 best practices.

---

## Framework & Runtime

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Application Framework** | TanStack Start | 1.141.7 | Full-stack React meta-framework with SSR/SPA modes |
| **Router** | TanStack Router | 1.141.6 | File-based routing, type-safe navigation |
| **State Management** | TanStack Store | 0.8.0 | Lightweight reactive state |
| **Language** | TypeScript | 5.x (strict) | Type safety, developer experience |
| **Runtime** | Node.js | 20.x LTS | Development and build-time |
| **Package Manager** | pnpm | 9.x | Fast, disk-efficient package management |

---

## Frontend

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **UI Library** | React | 19.2.3 | Component-based UI |
| **Build Tool** | Vite | 7.3.0 | Fast HMR, optimized builds |
| **UI Components** | shadcn/ui | latest | Accessible, customizable components |
| **Code Editor** | Monaco Editor | 4.7.0 (@monaco-editor/react) | VS Code-quality editor |
| **Terminal** | xterm.js | 5.5.0 (@xterm/xterm) | Terminal emulator with fit addon |
| **Icons** | Lucide React | latest | Consistent iconography |
| **Styling** | CSS (Vanilla) | - | Maximum flexibility, no framework lock-in |

---

## Browser APIs & Client-Side Runtime

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Node.js in Browser** | WebContainers | 1.6.1 (@webcontainer/api) | Sandboxed Node.js execution |
| **Local Filesystem** | File System Access API | native | Read/write user's local files |
| **Persistence** | IndexedDB (idb) | 8.0.3 | Client-side database |
| **Git Client** | isomorphic-git | 1.36.1 | Pure JavaScript Git implementation |

> **Critical Headers Required:**
> - `Cross-Origin-Embedder-Policy: require-corp`
> - `Cross-Origin-Opener-Policy: same-origin`

---

## AI Integration

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **AI Framework** | TanStack AI | 0.0.3 | Streaming responses, tool calls |
| **AI React Hooks** | @tanstack/ai-react | 0.0.3 | useChat, useCompletion hooks |
| **Gemini Adapter** | @tanstack/ai-gemini | 0.0.3 | Google Gemini integration |
| **Schema Validation** | Zod | 4.2.1 | Type-safe schemas for tools |

---

## Localization

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **I18n Framework** | react-i18next | latest | React integration for internationalization |
| **Core Library** | i18next | latest | Translation management |
| **Extraction** | i18next-scanner | latest | Automated key extraction from code |

---

## Testing & Quality

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Test Framework** | Vitest | latest | Fast unit/integration testing |
| **Testing Library** | @testing-library/react | latest | Component testing utilities |
| **E2E Testing** | Playwright | latest | Browser automation testing |
| **Mocking** | fake-indexeddb | latest | IndexedDB mocking for tests |
| **Linting** | ESLint | 9.x | Code quality, best practices |
| **Formatting** | Prettier | 3.x | Consistent code style |

---

## Deployment & Infrastructure

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Hosting** | Netlify | - | Static + SSR hosting |
| **Build Plugin** | @netlify/vite-plugin-tanstack-start | latest | Optimized Netlify builds |
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
