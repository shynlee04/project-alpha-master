# Tech Stack Standards

> **Last Updated:** 2025-12-21  
> **Applies to:** Via-Gent (Project Alpha)

---

## Framework & Runtime

| Component | Technology | Version |
|-----------|------------|---------|
| **Application Framework** | TanStack Start | 1.121.4+ |
| **Language/Runtime** | TypeScript 5.x | strict mode |
| **Package Manager** | pnpm | 9.x |
| **Build Tool** | Vite | 7.x |

---

## Frontend

| Component | Technology |
|-----------|------------|
| **JavaScript Framework** | React 19 |
| **Router** | TanStack Router |
| **State Management** | Zustand 5.x + TanStack Query |
| **CSS Framework** | TailwindCSS 4.x |
| **UI Components** | Shadcn/ui |
| **Icons** | Lucide React |
| **Editor** | Monaco Editor |
| **Terminal** | xterm.js |

---

## Browser APIs & Client-Side Runtime

| Component | Technology |
|-----------|------------|
| **Sandboxed Runtime** | WebContainers (@webcontainer/api) |
| **Local File Access** | File System Access API |
| **Database** | IndexedDB via Dexie.js 4.x |
| **Git** | isomorphic-git |
| **Virtual FS** | BrowserFS + Lightning-FS |

---

## AI Integration

| Component | Technology |
|-----------|------------|
| **AI Framework** | @tanstack/ai 0.1.0 |
| **Orchestration** | LangGraph.js |
| **Local Search** | Fuse.js |
| **Embeddings** | @xenova/transformers |

---

## Testing & Quality

| Component | Technology |
|-----------|------------|
| **Test Framework** | Vitest 3.x |
| **React Testing** | @testing-library/react |
| **IndexedDB Mock** | fake-indexeddb |
| **Linting** | ESLint + Prettier |
| **Type Checking** | tsc --noEmit |

---

## Deployment & Infrastructure

| Component | Technology |
|-----------|------------|
| **Hosting** | Netlify (Static + SSR) |
| **Server Framework** | Nitro (NITRO_PRESET=netlify) |
| **Headers** | Netlify Edge Functions |
| **Monitoring** | @sentry/react |
| **Performance** | web-vitals |

---

## Key Constraints

- **100% Client-Side**: No traditional backend
- **Browser Compatibility**: Chrome 86+, Edge 86+, Safari 15.2+
- **Cross-Origin Isolation**: COOP/COEP headers required
- **Single Session**: One workspace per tab
