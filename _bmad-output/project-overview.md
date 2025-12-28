# Project Alpha Overview

**Generated:** 2025-12-28
**Type:** Web Application (Monolith)

## Executive Summary

Project Alpha is a sophisticated web-based Integrated Development Environment (IDE) built with modern React technologies. It leverages WebContainers for in-browser Node.js execution, enabling a full development experience directly in the browser. The detailed architecture suggests a focus on AI-assisted coding, with integrations for various AI providers.

## Technology Stack

| Category | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | React 19 | UI Library |
| **Meta-Framework** | TanStack Start | SSR/Router/Server Functions |
| **Routing** | TanStack Router | Type-safe routing |
| **Build Tool** | Vite | Fast build tool |
| **Language** | TypeScript | Typed JavaScript |
| **Styling** | TailwindCSS v4 | Utility-first CSS |
| **UI Library** | Radix UI | Headless UI primitives |
| **State Management** | Zustand | Global state |
| **Persistence** | Dexie.js (IndexedDB) | Local database |
| **Editor** | Monaco Editor | VS Code-like editor |
| **Terminal** | xterm.js | Web-based terminal |
| **Runtime** | WebContainer | In-browser Node.js |
| **Testing** | Vitest, React Testing Library | Unit and Integration testing |
| **AI Integration** | TanStack AI | AI Provider abstraction |

## Architecture

The project follows a **Client-Centric Modular Monolith** pattern.
- **Frontend**: Heavy client-side logic utilizing WebContainers to run code locally in the browser.
- **Routing**: File-based routing via `src/routes` (TanStack Router).
- **Backend/API**: Utilizes TanStack Start for server functions, likely deployed to edge/serverless variants (Cloudflare/Netlify).
- **Offline Capabilities**: Uses Dexie.js for robust local data storage, enabling offline-first or local-first development workflows.

## Repository Structure

- **`src/`**: Core application source code.
  - **`components/`**: UI components organized by domain (`ide`, `chat`, `ui`, etc.).
  - **`routes/`**: Application routes.
  - **`lib/`, `hooks/`, `stores/`**: Shared logic and state.
- **`server/`**: Server-side logic (Middleware).
- **`docs/`**: Project documentation history.
- **`public/`**: Static assets.

## Deployment

Configuration files suggest multi-platform deployment support:
- **Netlify**: `netlify.toml`
- **Cloudflare Workers/Pages**: `wrangler.jsonc`
