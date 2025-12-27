# Epic 1: Project Foundation & IDE Shell

**Goal:** Establish the foundational TanStack Start SPA with file-based routing and the core IDE layout structure with resizable panels.

**Requirements Covered:** ARCH-STARTER, FR-IDE-01, FR-IDE-02, ARCH-SSR, ARCH-STRUCTURE, UX-LAYOUT

### Story 1.1: Initialize TanStack Start Project

As a **developer**,
I want **the project initialized with TanStack Start using the default template**,
So that **I have a working foundation with file-based routing and Vite bundling**.

**Acceptance Criteria:**

**Given** no existing project structure
**When** I run `npx -y create-tanstack-start@latest ./ --template default --package-manager pnpm`
**Then** the project scaffolds successfully with TanStack Start 1.140.0+
**And** `pnpm dev` starts the development server
**And** TypeScript strict mode is enabled

---

### Story 1.2: Configure Core Dependencies

As a **developer**,
I want **all core dependencies installed and configured**,
So that **the project has access to WebContainers, Monaco, xterm, and other required libraries**.

**Acceptance Criteria:**

**Given** an initialized TanStack Start project
**When** I add dependencies via pnpm
**Then** the following packages are installed:
  - `@webcontainer/api`
  - `@monaco-editor/react` + `monaco-editor`
  - `xterm` + `xterm-addon-fit`
  - `isomorphic-git`
  - `idb`
  - `@tanstack/store`
  - `@tanstack/ai` + `@tanstack/ai-react` + `@tanstack/ai-gemini`
  - `zod` 4.x
**And** TypeScript compiles without errors

---

### Story 1.3: Create Route Structure

As a **developer**,
I want **the basic route structure established**,
So that **navigation between dashboard and workspace is functional**.

**Acceptance Criteria:**

**Given** the TanStack Start project with routing
**When** I create routes at `src/routes/`
**Then** the following routes exist:
  - `index.tsx` → Dashboard route (`/`)
  - `workspace/$projectId.tsx` → IDE workspace (`/workspace/:projectId`)
**And** the workspace route has `ssr: false` configured
**And** navigation between routes works correctly

---

### Story 1.4: Implement IDE Layout Shell

As a **developer**,
I want **the resizable panel layout structure for the IDE**,
So that **all major panels (FileTree, Editor, Terminal, Preview, Chat) have their positions**.

**Acceptance Criteria:**

**Given** the workspace route
**When** I navigate to `/workspace/:projectId`
**Then** I see a layout with resizable panels:
  - Left sidebar (240px default, resizable): FileTree placeholder
  - Center main area: Editor tabs + Monaco placeholder
  - Right panel (40% width, resizable): Preview panel placeholder
  - Bottom panel (200px, resizable): Terminal placeholder
  - Right sidebar (collapsible): Chat panel placeholder
**And** panels can be resized by dragging dividers
**And** minimum viewport width of 1024px is enforced

---

### Story 1.5: Configure COOP/COEP Headers

As a **developer**,
I want **proper COOP/COEP headers configured for WebContainers**,
So that **SharedArrayBuffer is available for WebContainers to function**.

**Acceptance Criteria:**

**Given** the Vite configuration
**When** I configure the dev server and production build
**Then** the following headers are set:
  - `Cross-Origin-Opener-Policy: same-origin`
  - `Cross-Origin-Embedder-Policy: require-corp`
**And** WebContainers can boot successfully in the browser

---
