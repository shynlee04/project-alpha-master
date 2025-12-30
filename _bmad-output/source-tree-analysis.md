# Source Tree Analysis

## Project Structure
**Root:** Monolithic implementation with server-side routes and client-side logic.

```
/
├── .bmad/                # Agent configuration
├── server/               # Server-side configuration (root level)
├── src/                  # Application Source
│   ├── components/       # Domain-grouped React components
│   │   ├── chat/         # AI Interface
│   │   ├── ide/          # Editor & Terminal
│   │   └── ui/           # Atomic Design System
│   ├── lib/              # Core Logic
│   │   ├── agent/        # AI Tools & Logic
│   │   ├── validation/   # Zod Schemas
│   │   └── webcontainer/ # Runtime
│   ├── routes/           # Routing
│   │   └── api/          # API Endpoints
│   │       ├── chat.ts
│   │       ├── flashcards/
│   │       └── quizzes/
│   ├── stores/           # Zustand State
│   └── types/            # TypeScript Definitions
├── public/               # Static Assets
└── package.json          # Dependencies
```

## Critical Pathways
1.  **Entry Point:** `src/main.tsx` (Vite app entry).
2.  **Routing:** `src/routes/` defines the app structure.
3.  **API Layer:** `src/routes/api/` contains the server-side logic for AI and tools.
4.  **State:** `src/stores/` manages global application state (threads, settings).
