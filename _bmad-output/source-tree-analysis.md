# Source Tree Analysis

**Generated:** 2025-12-28

## Directory Structure

```
project-alpha-master/
├── .agent/              # AI Agent configuration
├── .gemini/             # Gemini AI configuration/cache
├── .github/             # GitHub Actions and workflows
├── _bmad/               # BMAD Framework Core
├── _bmad-output/        # Generated Documentation & Artifacts
├── docs/                # Project documentation
├── public/              # Static assets
├── server/              # Server-side logic
│   └── middleware/      # Request processing middleware
├── src/                 # Main Application Source
│   ├── components/      # UI Components
│   │   ├── agent/       # Agent interface components
│   │   ├── chat/        # Chat interface components
│   │   ├── common/      # Shared components
│   │   ├── dashboard/   # Dashboard views
│   │   ├── hub/         # Hub/Repository views
│   │   ├── ide/         # Core IDE components (Editor, Terminal)
│   │   ├── layout/      # Application layouts
│   │   └── ui/          # Base UI primitives (Radix/Tailwind)
│   ├── hooks/           # Custom React hooks
│   ├── i18n/            # Internationalization setup
│   ├── lib/             # Utilities and helper functions
│   ├── mocks/           # Test mocks
│   ├── routes/          # TanStack Router definitions
│   ├── stores/          # Zustand state stores
│   ├── styles/          # Global styles
│   ├── types/           # TypeScript definitions
│   ├── router.tsx       # Router configuration
│   └── server.ts        # Server entry point
├── netlify.toml         # Netlify configuration
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Vite configuration
└── wrangler.jsonc       # Cloudflare configuration
```

## Critical Directories

### `src/components/ide/`
Contains the core logic for the IDE experience, likely wrapping Monaco Editor and xterm.js interactions. This is a critical domain area.

### `src/routes/`
Defines the URL structure and page hierarchy. Using TanStack Router's file-based routing.

### `src/stores/`
Global state management using Zustand. Critical for managing application state like active files, terminal sessions, and user settings.

### `src/lib/`
Presumably contains the WebContainer integration logic and file system abstractions required for the in-browser IDE.
