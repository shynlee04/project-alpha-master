# Product Mission

## Pitch

**Via-Gent** is a **100% browser-based, AI-powered development workspace** that helps **solo developers, learners, and distributed teams** eliminate setup friction and ship applications faster by providing a **zero-server, privacy-first IDE** with intelligent agents that can actually execute—not just suggest—code changes.

---

## Users

### Primary Customers

- **Solo Developers (Freelancers)**: Need quick project setup, AI assistance for common tasks, and easy client demos without infrastructure overhead
- **Distributed Development Teams**: Cross-functional teams (PM, Designer, Developer, QA) needing unified workspace with customizable workflows
- **Educational Platforms**: Coding bootcamps, instructors, and students who need instant-ready development environments

### User Personas

**Alex** (25-35, Solo Full-Stack Developer)
- **Role:** Freelance web developer
- **Context:** Takes on 3-4 projects monthly, works from various locations
- **Pain Points:** "Project setup takes 2+ hours"; switching between client projects is painful; managing local dev environments is fragmented
- **Goals:** Ship faster, reduce boilerplate, work from any computer

**Jordan** (18-24, Student/Bootcamp Graduate)
- **Role:** Learning full-stack development
- **Context:** Using shared/borrowed computers, limited CLI experience
- **Pain Points:** "I don't know how to set up a dev environment"; npm errors derail learning
- **Goals:** Focus on coding concepts, not tooling; understand how code works

**Taylor** (30-45, Workshop Instructor/Content Creator)
- **Role:** Teaching coding to groups
- **Context:** Half of workshop time lost to installation issues
- **Pain Points:** "Students can't follow along because their setup failed"
- **Goals:** Every student codes in browser instantly; demonstrate concepts without setup friction

---

## The Problem

### Development Setup Tax

Creating a new project with best practices requires **2+ hours of boilerplate configuration** across package managers, build tools, linting, testing, and deployment config. Existing solutions force unacceptable tradeoffs:

- **Cloud IDEs** (CodeSandbox, Replit): Require subscriptions, store code on their servers
- **AI Assistants** (Copilot, Cursor): Generate code but can't execute, test, or deploy it
- **Traditional IDEs** (VS Code): Require installation, local setup per machine

**Our Solution:** A browser-based IDE where AI agents have **full tool access**—they can read files, write code, run terminal commands, commit to Git, and show live previews. All powered by WebContainers running Node.js in the browser, with zero server infrastructure.

---

## Differentiators

### Zero-Server, Privacy-First Architecture

Unlike cloud IDEs that store your code on their servers, Via-Gent runs **100% client-side**. Your code never leaves your browser—it syncs directly to your local filesystem via the File System Access API. No subscription fees, no data lock-in, no privacy concerns.

### AI Agents That Execute, Not Just Suggest

Unlike Copilot or ChatGPT which only suggest code, Via-Gent's agents can **actually operate** on your project:
- Write and modify files
- Run terminal commands (`npm install`, `npm run dev`)
- Commit changes via Git
- Show results in live preview

Multi-agent orchestration with specialized roles: **Orchestrator** (coordinates), **Planner** (designs), **Coder** (implements), **Validator** (tests).

### Bring Your Own AI Key (BYOK)

No vendor lock-in to a specific AI provider. Connect your own Gemini, OpenAI, or other API keys. Control your costs, choose your model, keep your credentials secure.

### Customizable Workflows with Guardrails

Highly configurable agent behaviors, tools, and workflows designed for different team roles:
- **Product Managers**: Specification and planning tools
- **Designers**: Asset generation and UI mockups
- **Developers**: Code generation and terminal access
- **QA Engineers**: Validation and testing tools

Built-in guardrails to minimize AI hallucinations, improve context accuracy, and ensure coding quality through agent permission matrices and tool registries.

### Works Offline After Load

Once loaded, critical features work without internet:
- File editing and navigation
- Local code preview (for locally-runnable projects)
- Version control (local commits)

### Smart Dependency Sync

Unlike cloud IDEs that lose your `node_modules` when the session ends, Via-Gent can **persist dependencies to your local filesystem**. Next session loads instantly—no `pnpm install` required. You control what syncs: source files (auto), dependencies (with permission), or build outputs (never).

## Key Features

### Core Features

- **Browser-Based IDE**: Monaco editor, file tree, multi-tab editing, syntax highlighting for 20+ languages
- **In-Browser Node.js**: WebContainers run dev servers, build tools, npm/pnpm without local installation
- **Local Filesystem Sync**: File System Access API syncs changes to your actual disk in real-time
- **Live Preview Panel**: Hot-reloading iframe displays your running application
- **Integrated Terminal**: xterm.js console for running any Node.js command

### AI Features

- **Conversational Development**: Describe features in natural language, watch AI build them
- **Multi-Agent Orchestration**: Specialized agents collaborate to plan, code, and validate
- **Tool Execution Transparency**: See exactly what files AI reads/writes, what commands it runs
- **Conversation Threading**: Organize discussions by topic, search history semantically

### Collaboration Features

- **Client-Side Git**: isomorphic-git for commits, branches, diffs—all in browser
- **GitHub Integration**: Push, pull, clone repositories directly
- **Project Templates**: Start from working examples (blog, portfolio, e-commerce, API)
- **Session Persistence**: Close tab, reopen—everything restores exactly where you left off

### Advanced Features

- **Asset Studio**: AI-generated images, icons, illustrations with drag-and-drop to code
- **Multi-Language UI**: Full English and Vietnamese localization
- **Accessibility**: WCAG AA compliance, keyboard navigation, screen reader support
- **Performance Targets**: Sub-2-second page load, sub-100ms file operations
