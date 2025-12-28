# System Architecture

## Executive Summary
Project Alpha is a browser-based Integrated Development Environment (IDE) enabling users to write, execute, and debug code entirely within their web browser. It utilizes WebContainer technology to provide a secure, local Node.js runtime.

## Architecture Pattern
**Client-Side Modular Monolith with Server-Side capabilities.**
The application is primarily a Single Page Application (SPA) driven by React, but utilizes TanStack Start for Server-Side Rendering (SSR) and server functions where necessary.

## Key Architectures

### 1. The IDE Core (Client-Side)
- **Runtime**: WebContainer API boots a Node.js environment in the browser.
- **Editor**: Monaco Editor handles code editing, syntax highlighting, and LSP (via workers).
- **FileSystem**: An abstraction layer syncs the WebContainer virtual file system with the UI file tree.
- **Terminal**: xterm.js connects to the WebContainer process streams.

### 2. State Management
- **Zustand**: Used for ephemeral UI state (modals, active tabs, theme).
- **Dexie.js (IndexedDB)**: Used for persistent storage of:
  - User projects
  - File contents (for offline support)
  - User preferences
  - Chat history

### 3. Routing
- **TanStack Router**: File-based routing handles navigation.
- Routes are likely compiled from `src/routes`.

### 4. AI Integration
- **TanStack AI**: Provides a unified interface for AI generation.
- **Agent UI**: Components in `src/components/agent` and `src/components/chat` facilitate user interaction with AI assistants.

## Data Flow
1. **User Input** (Editor/Terminal) -> **Memory/Zustand** -> **WebContainer VFS** -> **Dexie.js** (Persistence).
2. **AI Action** -> **TanStack AI** -> **Server Function/API** -> **LLM Provider** -> **Response** -> **UI Update**.

## Integration Points
- **WebContainer API**: Deep integration for file system and process management.
- **LLM Providers**: External API calls for AI features.
