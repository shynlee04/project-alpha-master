# Technology Stack

## Core Technologies

| Category | Technology | Version | Justification |
|----------|------------|---------|---------------|
| **Framework** | TanStack Start | 1.143.3 | Full-stack React framework with server capabilities |
| **Language** | TypeScript | 5.9.3 | Type safety and modern features |
| **Styling** | TailwindCSS | 4.1.18 | Utility-first CSS framework |
| **State Management** | Zustand | 5.0.9 | Lightweight global state management |
| **Local Database** | Dexie | 4.2.1 | IndexedDB wrapper for client-side persistence |
| **AI Integration** | TanStack AI | 0.2.0 | AI/LLM integration utilities |
| **Routing** | TanStack Router | 1.143.3 | Type-safe routing |
| **Editor** | Monaco Editor | 0.55.1 | Code editing experience |
| **Terminal** | xterm.js | 5.5.0 | Terminal emulation |
| **Runtime** | WebContainers | 1.6.1 | Node.js in the browser |

## Architecture Pattern
**Monolithic Client-First Web Application**
- **Client-Heavy:** Extensive client-side logic (WebContainers, Monaco, filesystem).
- **Server Components:** API routes for AI proxying and potentially other backend tasks via TanStack Start.
- **Persistence:** Local-first approach with IndexedDB/FileSystem API.

## Key Dependencies
- `@blocknote/react`: Rich text editing
- `@radix-ui/*`: Headless UI primitives
- `framer-motion`: Animations (inferred)
- `zod`: Schema validation
