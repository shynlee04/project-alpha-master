# Technology Stack

**Analysis Date:** 2026-01-31

## Languages

**Primary:**
- TypeScript 5.9.3 - All application code (`src/**/*.ts`, `src/**/*.tsx`)
- Target: ES2022 with ESNext modules

**Secondary:**
- JavaScript - Config files only (`*.config.mjs`, `*.config.cjs`)
- CSS - Tailwind v4 directives in `.css` files

## Runtime

**Environment:**
- Node.js (version managed via lockfile, no `.nvmrc`)
- Vite 7.3.1 for development server and builds

**Package Manager:**
- pnpm (primary, lockfile present)
- `package.json` type: "module" (ESM)

## Frameworks

**Core:**
- React 19.2.3 - UI framework
- TanStack Router 1.157.3 - File-based routing with SSR support
- TanStack Start 1.157.3 - Full-stack React framework (SSR/SSG)
- Zustand 5.0.10 - State management with `useShallow` mandatory

**Testing:**
- Vitest 4.0.16 - Unit/integration tests (thread pool, 30s timeout)
- Playwright 1.57.0 - E2E tests per workspace
- Testing Library (React 16.3.1, DOM 10.4.1) - Component testing
- jest-axe 10.0.0 - Accessibility testing

**Build/Dev:**
- Vite 7.3.1 - Dev server, bundler, HMR
- SWC 1.15.10 - Fast TypeScript transpilation
- tsgo (native TypeScript 7.0 preview) - Fast type checking
- ESLint + Prettier - Linting and formatting

## Key Dependencies

**Critical (AI/LLM):**
- `@tanstack/ai` 0.2.2 - Core AI SDK
- `@tanstack/ai-react` 0.2.2 - React hooks for AI
- `@tanstack/ai-openai` 0.2.1 - OpenAI adapter
- `@tanstack/ai-gemini` 0.3.2 - Gemini adapter
- `@tanstack/ai-anthropic` 0.2.0 - Anthropic adapter
- `@tanstack/ai-ollama` 0.3.0 - Ollama adapter
- `@anthropic-ai/sdk` 0.71.2 - Direct Anthropic SDK
- `@google/genai` 1.34.0 - Google AI SDK

**Data/Storage:**
- `dexie` 4.2.1 - IndexedDB wrapper (50+ tables)
- `dexie-react-hooks` 4.2.0 - React bindings
- `idb` 8.0.3 - Low-level IndexedDB utilities
- `@orama/orama` 3.1.18 - Full-text search engine
- `@orama/plugin-data-persistence` 3.1.18 - Orama IndexedDB persistence

**UI Components:**
- `@radix-ui/react-*` - Unstyled primitives (dialog, dropdown, tabs, tooltip, etc.)
- `lucide-react` 0.562.0 - Icon library
- `cmdk` 1.1.1 - Command palette
- `sonner` 2.0.7 - Toast notifications
- `framer-motion` 12.23.26 - Animations
- `react-resizable-panels` 4.1.0 - Split panes

**Editors:**
- `@monaco-editor/react` 4.7.0 - Code editor (~5MB)
- `monaco-editor` 0.55.1 - Monaco core
- `@blocknote/react` 0.45.0 - Rich text editor (~400KB)
- `@blocknote/core` 0.45.0 - BlockNote core
- `@blocknote/mantine` 0.45.0 - BlockNote theme

**Terminal/Container:**
- `@xterm/xterm` 6.0.0 - Terminal emulator (~300KB)
- `@xterm/addon-*` - xterm plugins (fit, search, webgl)
- `@webcontainer/api` 1.6.1 - Browser-based Node runtime

**Visualization:**
- `@xyflow/react` 12.10.0 - Node/edge diagrams (~200KB)
- `mermaid` 11.12.2 - Diagram rendering (~500KB)
- `recharts` 3.6.0 - Charts/graphs (~200KB)

**ML/AI Processing:**
- `@xenova/transformers` 2.17.2 - Browser ML models (~800KB)
- `zod` 4.3.6 - Runtime validation
- `zod-to-json-schema` 3.25.1 - Schema generation

**Git:**
- `isomorphic-git` 1.36.1 - Browser-based Git operations

**Internationalization:**
- `i18next` 25.7.3 - Core i18n
- `react-i18next` 16.5.0 - React bindings
- `i18next-browser-languagedetector` 8.2.0 - Auto language detection

**Styling:**
- `tailwindcss` 4.1.18 - CSS framework (v4 with @theme directives)
- `@tailwindcss/vite` 4.1.18 - Vite plugin
- `tailwind-merge` 3.4.0 - Class deduplication
- `class-variance-authority` 0.7.1 - Variant utilities
- `clsx` 2.1.1 - Class composition

## Configuration

**TypeScript:**
- Config: `tsconfig.json` (main), `tsconfig.check.json`, `tsconfig.tsgo.json`
- Strict mode enabled with `noUnusedLocals`, `noUnusedParameters`
- Path aliases: `@/*` -> `./src/*`, plus layer-specific aliases
- Incremental compilation with `.tsbuildinfo` cache

**Environment:**
- `.env.example` - Template with all supported env vars
- `.env.local` - Local overrides (gitignored)
- Prefix: `VITE_` for client-exposed variables

**Build:**
- `vite.config.ts` - Multi-platform deployment (Cloudflare, Vercel, Netlify, Node)
- Chunk size warning: 600KB limit
- SSR externals configured for heavy client libs

**Testing:**
- `vitest.config.ts` - Thread pool, max workers (CPU-1), 30s timeout
- `playwright.config.ts` - E2E with workspace-specific suites

## Platform Requirements

**Development:**
- Node.js with ESM support
- pnpm (lockfile-based dependency resolution)
- Chrome/Edge 86+ for FSA testing (File System Access API)

**Production:**
- Cloudflare Workers (primary)
- Vercel Edge (secondary)
- Netlify (tertiary)
- Cross-Origin-Isolated headers required for WebContainer

**Browser Support:**
- Desktop: Chrome 86+, Edge 86+, Safari 15.2+
- Mobile: IndexedDB fallback (no FSA)
- WebContainer: SharedArrayBuffer + COOP/COEP required

## Scripts Reference

```bash
# Type Checking (use tsgo for 10x speed)
pnpm typecheck:fast        # tsgo native compiler
pnpm typecheck:watch       # Watch mode

# Testing
pnpm test:fast             # Parallel threads
pnpm test:e2e:ide          # IDE workspace E2E
pnpm test:e2e:notes        # Notes workspace E2E

# Building
pnpm build                 # Node target
pnpm build:cloudflare      # Cloudflare Workers
pnpm build:vercel          # Vercel Edge

# Governance
pnpm governance            # Size + import checks
pnpm governance:size       # File size limits (300 LOC)
pnpm governance:imports    # Canonical path validation

# Dependencies
pnpm deps:circular         # Check cycles (madge)
pnpm lint:fix              # Auto-fix ESLint
```

---

*Stack analysis: 2026-01-31*
