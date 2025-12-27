# **VIA-GENT PRODUCT REQUIREMENTS DOCUMENT (PRD)**

**Version:** 2.0.0  
**Date:** December 7, 2025  
**Status:** Living Document  
**Project Type:** Open-Source, Client-Side Multi-Agent IDE Platform  
**Repository:** [shynlee04/via-gent](https://github.com/shynlee04/via-gent)  
**Deployment:** Netlify (Static Frontend)

---

## **📋 Document Purpose**

This PRD defines **what** via-gent does and **why** it exists. It is:

✅ **Tech-Agnostic** - Can guide greenfield or enhancement work  
✅ **User-Focused** - Emphasizes user flows, not implementation  
✅ **Scope-Bound** - Client-side only, no auth/billing/membership  
✅ **BMAD v6 Compatible** - Supports Phase 1 (Discovery) + Phase 2 (Design)  
✅ **Open Source** - All features assume public, free access

This PRD does **NOT** contain:
❌ Technical architecture details (see Architecture doc)  
❌ Task breakdowns (see Spec docs)  
❌ Implementation timelines (see Roadmap)

---

## **🎯 Executive Summary**

### **Vision Statement**

> "Via-gent is a browser-based IDE where AI agents and human developers collaborate on full-stack projects without any server infrastructure—projects are scaffolded, coded, tested, and deployed entirely within the browser, persisted to the user's local machine."

### **Core Value Proposition**

**For Solo Developers:**  
Skip hours of boilerplate setup—via-gent's coordinator agent asks 5 questions, then bootstraps a production-ready TanStack Start project with your chosen features (Shadcn UI, Drizzle ORM, tRPC, etc.) running live in your browser within 2 minutes.

**For Teams Using AI:**  
Get a shareable, reproducible development environment where agents can read code, modify files, run tests, and deploy—all without fighting npm version conflicts or "works on my machine" issues.

**For Learning/Prototyping:**  
Code real applications without installing Node.js, Git, or a code editor—just open via-gent in Chrome, grant folder access, and start building. Perfect for workshops, tutorials, or quick experiments.

---

## **🧭 Product Context**

### **Market Position**

| Dimension                     | Via-gent           | GitHub Copilot Workspace | Replit             | StackBlitz             | CodeSandbox  |
| ----------------------------- | ------------------ | ------------------------ | ------------------ | ---------------------- | ------------ |
| **Runs in Browser**           | ✅ Yes             | ❌ Server-based          | ✅ Yes             | ✅ Yes                 | ✅ Yes       |
| **Local File Persistence**    | ✅ Tier 2 (FS API) | ❌ Cloud only            | ❌ Cloud only      | ⚠️ Web Containers only | ⚠️ Limited   |
| **Multi-Agent Orchestration** | ✅ Core feature    | ⚠️ Single agent          | ❌ No agents       | ❌ No agents           | ❌ No agents |
| **Zero Backend**              | ✅ 100% client     | ❌ Requires server       | ❌ Requires server | ✅ Yes                 | ⚠️ Hybrid    |
| **Open Source**               | ✅ Yes             | ❌ Proprietary           | ❌ Proprietary     | ⚠️ Partial             | ⚠️ Partial   |
| **Cost**                      | 🆓 Free            | 💰 Paid                  | 💰 Freemium        | 🆓 Free                | 💰 Freemium  |

**Unique Differentiators:**

1. **True Multi-Agent** - Coordinator, code gen, test writer, reviewer work together
2. **Bring Your Own LLM** - Use your own Gemini/Claude/OpenAI keys, no vendor lock-in
3. **Local-First** - Projects sync to your disk via File System Access API
4. **Framework Opinionated** - Deep TanStack Start integration, not generic
5. **Community Owned** - Open source, no SaaS upsells

---

## **👥 User Personas**

### **Primary Persona: "Alex the Solo Full-Stack Builder"**

**Demographics:**

- Age: 25-35
- Role: Freelance developer or indie hacker
- Skills: Intermediate JS/TS, knows React basics
- Goals: Ship MVPs fast, learn modern frameworks

**Pain Points:**

- "Setting up a new project takes 2 hours (ESLint, Prettier, DB, auth...)"
- "I want to use AI but don't want to pay $20/month for Cursor"
- "My projects break when I switch computers or Node versions"

**How Via-gent Helps:**

- Coordinator agent sets up entire project in <2 minutes
- BYOK (Bring Your Own Key) - use own Gemini API key (~$0.01/session)
- Projects saved to local folder, sync to GitHub manually when ready

**Success Metric:** Alex ships a working MVP in <1 day instead of <1 week

---

### **Secondary Persona: "Jordan the AI-Curious Learner"**

**Demographics:**

- Age: 18-24
- Role: Student or bootcamp grad
- Skills: Basic HTML/CSS, minimal JS
- Goals: Learn modern development, build portfolio

**Pain Points:**

- "I don't know how to set up a dev environment"
- "Following tutorials, half the commands fail on my Windows laptop"
- "I want to try AI coding but it's intimidating"

**How Via-gent Helps:**

- No installation needed—just open in browser
- Coordinator agent asks simple questions, hides complexity
- Agent explains code changes as it makes them

**Success Metric:** Jordan builds first full-stack app within first week of discovery

---

### **Tertiary Persona: "Taylor the Workshop Instructor"**

**Demographics:**

- Age: 30-45
- Role: Educator, conference speaker, course creator
- Skills: Expert developer, teaching experience
- Goals: Teach modern tools without env setup hassles

**Pain Points:**

- "Half my workshop time is lost to npm install errors"
- "Students have different OS/versions, can't reproduce issues"
- "Setting up 20 student laptops takes entire first day"

**How Via-gent Helps:**

- Students just visit URL + grant folder permission
- Everyone gets identical environment (WebContainers)
- Taylor can share project as URL—students clone to local instantly

**Success Metric:** Zero time spent on environment setup in workshop

---

## **📖 User Stories & Flows**

### **Epic 1: First-Time User Onboarding**

#### **Story 1.1: Discover Via-gent**

**As** a developer searching for "browser-based IDE",  
**I want** to understand what via-gent does within 30 seconds,  
**So that** I can decide if it's worth trying.

**Acceptance Criteria:**

- [ ] Landing page has hero section: "Build full-stack apps in your browser"
- [ ] Single screenshot showing: file tree + code editor + live preview
- [ ] Clear CTA: "Start Building (No Sign-Up)"
- [ ] 3 benefit bullets: Zero setup, AI-powered, Local-first

**Flow:**

```
User lands on via-gent.dev
  → Sees hero: "Browser IDE + AI Agents"
  → Reads: "Bootstrap TanStack Start projects in 2 minutes"
  → Clicks "Start Building"
  → Redirects to /onboarding
```

---

#### **Story 1.2: LLM Provider Setup**

**As** a new user,  
**I want** to connect my own Gemini API key,  
**So that** I can use AI agents without paying via-gent.

**Acceptance Criteria:**

- [ ] Onboarding asks: "Do you have a Gemini API key?" (Yes / Get One)
- [ ] "Get One" links to Google AI Studio with instructions
- [ ] Input field validates key format (AIza...)
- [ ] Test connection shows: "✓ Connected to Gemini 2.0 Flash"
- [ ] Key stored encrypted in browser (localStorage)

**Flow:**

```
User at /onboarding
  → Step 1: "Connect Your AI"
    → Option A: Paste Gemini API key
    → System tests key: GET https://generativelanguage.googleapis.com/v1/models
    → ✓ Success: "Connected! Let's create your first project."
    → Option B: "Get a Free Key"
      → Opens Google AI Studio in new tab
      → Returns with key, pastes, continues
```

**Edge Cases:**

- Invalid key → "Key format invalid. Should start with 'AIza'"
- Expired key → "This key is expired. Generate a new one?"
- Rate limited → "This key hit rate limits. Try in 60 seconds."

---

#### **Story 1.3: Project Folder Permission**

**As** a new user,  
**I want** to save my project to my computer (not just browser memory),  
**So that** my work persists and I can use other editors.

**Acceptance Criteria:**

- [ ] Onboarding step: "Where should we save your project?"
- [ ] Recommendation: "Create a folder like ~/via-gent-projects"
- [ ] Button: "Select Folder" → triggers File System Access API
- [ ] Shows permission dialog (browser native)
- [ ] After grant: "✓ We'll save projects to [path]"
- [ ] Fallback: "Skip (use browser storage only)" if denied

**Flow:**

```
User at /onboarding (after LLM setup)
  → Step 2: "Choose Project Location"
    → System checks: 'showDirectoryPicker' in window
      → ✓ Supported (Chrome/Edge/Safari)
        → Shows: "Select a folder to save projects"
        → User clicks button
        → Browser shows native file picker
        → User selects ~/Documents/via-gent-projects
        → Browser asks: "Allow via-gent to edit files?"
        → User clicks "Allow"
        → System stores handle reference
        → ✓ "Projects will sync to [path]"
      → ✗ Not supported (Firefox)
        → Shows: "Your browser doesn't support folder access"
        → Auto-selects "Browser storage" mode
```

**Edge Cases:**

- User denies permission → Fall back to IndexedDB, show warning
- User selects read-only folder → "This folder is read-only. Choose another."
- User selects root folder → "For safety, please choose a subfolder."

---

### **Epic 2: Project Creation (Coordinator Agent Flow)**

#### **Story 2.1: Coordinator Interview**

**As** a user who just completed onboarding,  
**I want** an AI agent to ask me questions about my project,  
**So that** it can set up exactly what I need.

**Acceptance Criteria:**

- [ ] Coordinator agent introduces itself: "I'm Via, your project coordinator"
- [ ] Asks 5 questions in sequence (not all at once)
- [ ] Shows progress: "Question 2 of 5"
- [ ] Validates answers before proceeding
- [ ] Summarizes choices before bootstrap

**Flow:**

```
User completes onboarding
  → Redirects to /project/new
  → Coordinator agent appears: "Hi! I'm Via. Let's set up your project."

Question 1: "What's your project name?"
  → Input: "my-saas-app"
  → Validation: Lowercase, no spaces, no special chars
  → ✓ Valid → "Great! Next..."

Question 2: "What are you building? (1 sentence)"
  → Input: "A task manager with real-time collaboration"
  → No validation, just context for agent

Question 3: "Which features do you need?" (Multi-select)
  → Options:
    ☑ Shadcn UI Components (default ON)
    ☑ Database (Drizzle ORM) (default ON)
    ☑ Authentication (Clerk) (default OFF)
    ☑ State Management (TanStack Store) (default ON)
    ☑ Forms (TanStack Form) (default OFF)
  → User toggles, clicks "Next"

Question 4: "What type of pages do you need to start?" (Radio)
  → Options:
    ○ Landing Page (marketing site)
    ● Dashboard (logged-in app)  ← selected
    ○ Blog (content site)
    ○ Admin Panel
  → Coordinator: "Dashboard it is!"

Question 5: "Any specific UI components to include?" (Optional, free text)
  → Input: "Login form, task list, dark mode toggle"
  → Coordinator: "Got it! Let me summarize..."

Summary Screen:
  Project: my-saas-app
  Description: Task manager with real-time collaboration
  Framework: TanStack Start
  Features: Shadcn UI, Drizzle ORM, TanStack Store
  Initial Page: Dashboard (login form, task list, dark mode)

  [Go Back] [Start Building]
```

**Edge Cases:**

- User types invalid project name → Inline error, suggest fix
- User selects 10+ features → Warning: "This might take 5 minutes"
- User leaves description blank → Coordinator: "No problem, we'll keep it simple"

---

#### **Story 2.2: Project Bootstrap**

**As** a user who confirmed their project setup,  
**I want** to see my project being created in real-time,  
**So that** I understand what's happening and can stop if needed.

**Acceptance Criteria:**

- [ ] Full-screen modal: "Bootstrapping [project-name]..."
- [ ] Shows terminal output (live stream from WebContainers)
- [ ] Progress indicators: "Installing dependencies (2/8)..."
- [ ] Completes within performance budget: <2 minutes
- [ ] On success: Auto-opens IDE with project loaded

**Flow:**

```
User clicks "Start Building"
  → System initiates bootstrap sequence
  → Modal appears (non-dismissible)

Phase 1: "Creating project structure..." (10s)
  Terminal shows:
    $ pnpm create @tanstack/start@latest my-saas-app
    ✓ Created project folder
    ✓ Initialized package.json

Phase 2: "Installing dependencies..." (60s)
  Terminal shows:
    $ cd my-saas-app && pnpm install
    Packages: +847
    Progress: [████████░░] 80%

Phase 3: "Adding Shadcn UI..." (15s)
  Terminal shows:
    $ npx shadcn@latest init -y
    ✓ Configured components.json
    ✓ Installed @shadcn/ui dependencies

Phase 4: "Setting up Drizzle ORM..." (20s)
  Terminal shows:
    $ pnpm add drizzle-orm @neondatabase/serverless
    ✓ Created db/ folder
    ✓ Generated schema.ts

Phase 5: "Generating dashboard template..." (15s)
  Agent writes files:
    ✓ src/routes/dashboard/index.tsx
    ✓ src/components/dashboard/TaskList.tsx
    ✓ src/components/ui/dark-mode-toggle.tsx

Phase 6: "Starting dev server..." (10s)
  Terminal shows:
    $ pnpm dev
    Local:   http://localhost:3000
    ✓ Dev server ready!

Total: ~130 seconds

Success Screen:
  "✨ Your project is ready!"
  [Open IDE] ← auto-clicks after 2s
```

**Edge Cases:**

- Network timeout during pnpm install → Retry 3x, then "Install manually?"
- WebContainers out of memory → "Your project is large. Use smaller template?"
- User closes tab mid-bootstrap → Resume from last phase on return
- Bootstrap fails (syntax error) → Show error, offer "Start Over" or "Debug"

---

### **Epic 3: IDE Workspace Experience**

#### **Story 3.1: First Project View**

**As** a user whose project just bootstrapped,  
**I want** to see a working IDE with my code,  
**So that** I can start editing immediately.

**Acceptance Criteria:**

- [ ] IDE loads with 3-pane layout: file tree (left), editor (center), terminal (bottom)
- [ ] File tree shows project structure (expanded to `src/`)
- [ ] Editor has `src/routes/dashboard/index.tsx` open
- [ ] Terminal tab "dev" shows running server logs
- [ ] Preview panel (right) shows live app at localhost:3000
- [ ] All panes load within 3 seconds

**Flow:**

```
Bootstrap completes
  → Transition: Fade out modal, fade in IDE
  → IDE renders:

┌─────────────────────────────────────────────────────────┐
│ [via-gent] my-saas-app              [Settings] [•••]    │ ← Header
├──────────┬──────────────────────────┬───────────────────┤
│ 📁 Files │ 📝 Editor                │ 👁 Preview       │
│          │                          │                   │
│ my-saas  │ src/routes/dashboard/    │ [localhost:3000]  │
│ ├─ src   │ index.tsx                │                   │
│ │  ├─ routes                      │ ┌─────────────┐  │
│ │  │  ├─ dashboard/ ← OPEN       │ │ Dashboard   │  │
│ │  │  └─ index.tsx               │ │             │  │
│ │  └─ components                 │ │ [ ] Task 1  │  │
│ │     └─ ui/                     │ │ [ ] Task 2  │  │
│ └─ package.json                  │ └─────────────┘  │
│                                   │                   │
├──────────┴───────────────────────────┴──────────────────┤
│ Terminal: dev | test | bash                           │
│ $ pnpm dev                                            │
│ Local: http://localhost:3000                          │
│ ✓ Ready in 847ms                                      │
└───────────────────────────────────────────────────────┘
```

**Interaction:**

- User clicks file in tree → Opens in editor
- User edits code → Auto-saves after 2s → Preview hot-reloads
- User clicks terminal tab → Switches to different shell

**Edge Cases:**

- Large file (>1MB) → Show "Large file. Load anyway?" before opening
- Binary file (.png) → Show preview, not Monaco editor
- Dev server crash → Terminal shows error, "Restart Server" button

---

#### **Story 3.2: Agent-Assisted Coding**

**As** a user editing code,  
**I want** to ask an AI agent to make changes,  
**So that** I can code faster without context-switching.

**Acceptance Criteria:**

- [ ] Agent chat panel (collapsible, right side or bottom)
- [ ] User types request: "Add a delete button to each task"
- [ ] Agent responds with plan before acting
- [ ] Agent executes tools: readFile, writeFile
- [ ] Changes appear in editor with visual diff highlight
- [ ] User can accept, reject, or modify changes

**Flow:**

```
User in IDE with TaskList.tsx open
  → Opens agent chat (Cmd+K or button)
  → Types: "Add a delete button to each task"
  → Agent responds:

  "I'll modify TaskList.tsx to:
   1. Add a delete icon button next to each task
   2. Wire up onClick to remove task from state
   3. Style with Shadcn UI Button (variant: ghost)

   Should I proceed?"

  User: "Yes"

  → Agent executes tools:
    [Tool: readFile] path: src/components/dashboard/TaskList.tsx
    [Tool: writeFile] path: src/components/dashboard/TaskList.tsx

  → Editor shows diff:
    + <Button variant="ghost" size="sm" onClick={() => deleteTask(task.id)}>
    +   <Trash2 className="h-4 w-4" />
    + </Button>

  → Agent: "✓ Done! Try clicking the trash icon."

  → User sees preview update (HMR kicks in)
  → User: "Perfect!"
```

**Edge Cases:**

- Agent can't parse request → Asks clarifying question
- Agent proposes breaking change → Shows warning, requires confirmation
- Tool fails (file locked) → Agent reports error, suggests manual fix
- User rejects change → Agent: "No problem. Want me to try differently?"

---

#### **Story 3.3: Multi-File Refactoring**

**As** a user with a growing codebase,  
**I want** the agent to refactor across multiple files,  
**So that** I can reorganize without manual tedium.

**Acceptance Criteria:**

- [ ] User requests: "Extract TaskItem into separate component"
- [ ] Agent identifies affected files (TaskList.tsx, new TaskItem.tsx)
- [ ] Shows plan with file tree preview
- [ ] User approves
- [ ] Agent creates new file, updates imports, shows all diffs
- [ ] All changes atomic (rollback if any fail)

**Flow:**

```
User: "Extract TaskItem into its own component file"

Agent analyzes:
  → Reads: src/components/dashboard/TaskList.tsx
  → Detects: TaskItem is inline component (30 lines)
  → Plans:

  "I'll create a new component:

   📁 Changes:
   + src/components/dashboard/TaskItem.tsx (new file)
   ~ src/components/dashboard/TaskList.tsx (modified)

   TaskItem will receive props: { task, onToggle, onDelete }

   Proceed?"

User: "Yes"

Agent executes:
  [Tool: createFile] src/components/dashboard/TaskItem.tsx
  [Tool: writeFile] src/components/dashboard/TaskList.tsx (update imports)

Editor shows:
  → New tab: TaskItem.tsx (created, highlighted in green)
  → Existing tab: TaskList.tsx (diff shows removed inline code, new import)

Agent: "✓ Refactor complete. TaskItem is now reusable!"
```

**Edge Cases:**

- Circular dependency detected → Agent stops, explains issue
- Type errors after refactor → Agent auto-fixes or asks for help
- User had unsaved changes → Prompt: "Save current changes first?"

---

### **Epic 4: Project Persistence & Recovery**

#### **Story 4.1: Save to Local Folder**

**As** a user working in the IDE,  
**I want** my changes auto-saved to my local folder,  
**So that** I can open the project in VS Code or Git.

**Acceptance Criteria:**

- [ ] Every file edit triggers sync to local folder (debounced 500ms)
- [ ] Terminal shows: "↓ Synced to ~/via-gent-projects/my-saas-app"
- [ ] User can open folder in Finder/Explorer and see files
- [ ] User can `git init` in that folder and commit

**Flow:**

```
User edits TaskList.tsx in Monaco
  → Types code
  → 500ms after last keystroke:
    → WebContainers writes to virtual FS
    → DualFileSystem syncs to local FS
    → File System Access API writes to disk

User opens Finder:
  ~/via-gent-projects/my-saas-app/src/components/dashboard/TaskList.tsx
  → File updated: 2 seconds ago

User opens VS Code:
  $ code ~/via-gent-projects/my-saas-app
  → Sees same files, can edit side-by-side
  → Via-gent detects external change (file watcher)
  → Monaco refreshes content
```

**Edge Cases:**

- Disk full → "Can't save to disk. Free up space or switch to browser storage."
- Permission revoked → "Folder access lost. Re-grant permission?"
- Large file (10MB+) → "This file is large. Sync may be slow."

---

#### **Story 4.2: Resume Project**

**As** a returning user,  
**I want** to continue where I left off,  
**So that** I don't lose context.

**Acceptance Criteria:**

- [ ] User opens via-gent
- [ ] Shows "Recent Projects" list
- [ ] Clicking project name restores IDE state:
  - Open files and active tab
  - Scroll positions in editor
  - Terminal states (dev server running)
  - Panel sizes

**Flow:**

```
User visits via-gent.dev (returning)
  → Lands on dashboard
  → Sees:

  Recent Projects:
  ┌─────────────────────────────────────┐
  │ my-saas-app                         │
  │ Last edited: 2 hours ago            │
  │ [Open]                              │
  └─────────────────────────────────────┘
  ┌─────────────────────────────────────┐
  │ landing-page-v2                     │
  │ Last edited: Yesterday              │
  │ [Open]                              │
  └─────────────────────────────────────┘

User clicks "Open" on my-saas-app
  → System reads PGlite:
    - Open tabs: [dashboard/index.tsx, TaskList.tsx]
    - Active tab: TaskList.tsx
    - Cursor position: Line 42, Column 15
    - Panel sizes: { fileTree: 250px, terminal: 200px }

  → IDE loads with exact state restored
  → Terminal auto-runs: pnpm dev
  → User continues from Line 42
```

**Edge Cases:**

- Project folder moved → "Can't find project at [old path]. Locate manually?"
- Project deleted from disk → "Project no longer exists. Remove from list?"
- Multiple projects open in tabs → Each tab maintains separate state

---

### **Epic 5: Deployment & Sharing**

#### **Story 5.1: Deploy to Netlify (One-Click)**

**As** a user with a working project,  
**I want** to deploy to production with one click,  
**So that** I can share my app with others.

**Acceptance Criteria:**

- [ ] Toolbar button: "Deploy"
- [ ] Connects to Netlify API (no OAuth, uses deploy key)
- [ ] Runs build command in terminal
- [ ] Uploads build output to Netlify
- [ ] Returns live URL: `https://my-saas-app.netlify.app`

**Flow:**

```
User clicks "Deploy" button
  → Modal: "Deploy to Netlify"
    → Input: "Site name" (pre-filled: my-saas-app)
    → Checkbox: "Auto-deploy on push" (OFF for v1)
    → [Deploy]

  → Terminal (deploy tab):
    $ pnpm build
    Building for production...
    ✓ Build complete in 12s

    Uploading to Netlify...
    ✓ Deployed to: https://my-saas-app.netlify.app

  → Success notification:
    "🚀 Deployed!"
    [Copy URL] [Open Site]
```

**Edge Cases:**

- Build fails → Show error log, "Fix errors and retry"
- Site name taken → Suggest: "my-saas-app-2" or custom name
- No Netlify API key → Prompt to create (link to Netlify dashboard)

---

#### **Story 5.2: Export Project (Offline Backup)**

**As** a user,  
**I want** to download my entire project as a ZIP,  
**So that** I have an offline backup.

**Acceptance Criteria:**

- [ ] File menu: "Export Project as ZIP"
- [ ] Generates ZIP with all files (excludes node_modules)
- [ ] Downloads via browser (my-saas-app.zip)
- [ ] User can extract and run `pnpm install` locally

**Flow:**

```
User: File → Export Project
  → System bundles:
    - All source files (src/, public/)
    - Config files (package.json, tsconfig.json)
    - Excludes: node_modules/, .git/, dist/

  → Browser downloads: my-saas-app.zip (2.3 MB)

User extracts ZIP:
  $ unzip my-saas-app.zip
  $ cd my-saas-app
  $ pnpm install
  $ pnpm dev
  → Works identically outside via-gent
```

---

## **🎨 User Experience Principles**

### **1. Zero-Friction Start**

**Principle:** User should go from landing page to coding in <3 minutes.

**Implementation:**

- No sign-up, no email, no credit card
- Onboarding: 2 steps (LLM key + folder permission)
- Pre-filled defaults for all questions

**Anti-Pattern:** ❌ Requiring account creation before seeing product

---

### **2. Progressive Disclosure**

**Principle:** Show advanced features only when user needs them.

**Implementation:**

- First project: Simple template (1 page, minimal deps)
- Agent chat: Collapsed by default, expands on Cmd+K
- Git integration: Hidden until user adds git remote
- Deployment: Available but not pushed

**Anti-Pattern:** ❌ Overwhelming new user with 50 toolbar buttons

---

### **3. Agent Transparency**

**Principle:** User always knows what agent is doing and can intervene.

**Implementation:**

- Agent explains plan before executing
- Shows tool calls: [Tool: writeFile] path: ...
- Diffs are reviewable before applying
- User can undo agent changes (Cmd+Z)

**Anti-Pattern:** ❌ Agent silently modifying files in background

---

### **4. Local-First Trust**

**Principle:** User's code stays on their machine unless they choose to share.

**Implementation:**

- All files save to user's selected folder
- No server uploads (except deploy to Netlify)
- API keys stored encrypted in browser only
- Clear messaging: "Your data never leaves your device"

**Anti-Pattern:** ❌ Syncing to via-gent servers without consent

---

## **📊 Success Metrics**

### **Acquisition Metrics**

| Metric                     | Target | Measurement                                |
| -------------------------- | ------ | ------------------------------------------ |
| Landing → Start Onboarding | >40%   | Click "Start Building" / Unique visitors   |
| Complete Onboarding        | >70%   | Grant folder permission / Start onboarding |
| First Project Created      | >60%   | Bootstrap success / Complete onboarding    |

### **Activation Metrics**

| Metric                       | Target | Measurement                                     |
| ---------------------------- | ------ | ----------------------------------------------- |
| Time to First Project        | <2 min | Bootstrap complete timestamp - Onboarding start |
| First File Edit              | >80%   | User edits any file / Project created           |
| First Agent Request          | >50%   | User sends message to agent / Project created   |
| Agent Tool Execution Success | >90%   | Successful tool calls / Total tool calls        |

### **Engagement Metrics**

| Metric                         | Target    | Measurement                                            |
| ------------------------------ | --------- | ------------------------------------------------------ |
| Daily Active Projects          | N/A (OSS) | Projects opened per day (client-side analytics opt-in) |
| Files Modified per Session     | >5        | File write events / Session                            |
| Agent Interactions per Session | >3        | Agent messages / Session                               |
| Session Duration               | >15 min   | Time spent in IDE / Session                            |

### **Retention Metrics**

| Metric                  | Target | Measurement                           |
| ----------------------- | ------ | ------------------------------------- |
| D1 Retention (next day) | >30%   | Users returning next day / New users  |
| D7 Retention (weekly)   | >20%   | Users returning in 7 days / New users |
| Multi-Project Users     | >40%   | Users with 2+ projects / Total users  |

### **Quality Metrics**

| Metric                     | Target | Measurement                            |
| -------------------------- | ------ | -------------------------------------- |
| Bootstrap Success Rate     | >95%   | Successful bootstraps / Total attempts |
| WebContainers Boot Success | >98%   | Successful boots / Total boots         |
| File Sync Success (Tier 2) | >99%   | Successful FS writes / Total writes    |
| Agent Error Rate           | <5%    | Agent errors / Total agent calls       |
| IDE Load Time              | <3s    | Time to interactive                    |

---

## **🔧 Functional Requirements**

### **FR-1: User Onboarding**

| ID     | Requirement                                             | Priority | Notes                  |
| ------ | ------------------------------------------------------- | -------- | ---------------------- |
| FR-1.1 | User can complete onboarding without account creation   | P0       | No auth system         |
| FR-1.2 | User can input and validate Gemini API key              | P0       | Future: Multi-provider |
| FR-1.3 | User can grant folder access via File System Access API | P0       | Tier 2                 |
| FR-1.4 | User can skip folder access (fallback to IndexedDB)     | P1       | Graceful degradation   |
| FR-1.5 | Onboarding state persists across page refreshes         | P1       | Resume if interrupted  |

---

### **FR-2: Project Creation**

| ID     | Requirement                                                     | Priority | Notes                                                 |
| ------ | --------------------------------------------------------------- | -------- | ----------------------------------------------------- |
| FR-2.1 | Coordinator agent asks 5 setup questions                        | P0       | Name, description, features, page type, UI components |
| FR-2.2 | Agent validates project name (lowercase, no spaces)             | P0       | Prevent invalid folder names                          |
| FR-2.3 | User can select from 8+ preset features (Shadcn, Drizzle, etc.) | P0       | Multi-select UI                                       |
| FR-2.4 | Agent bootstraps TanStack Start project via `pnpm create`       | P0       | Runs in WebContainers                                 |
| FR-2.5 | Bootstrap completes within 2 minutes                            | P0       | Performance requirement                               |
| FR-2.6 | User can cancel bootstrap and start over                        | P1       | Abort button                                          |
| FR-2.7 | Bootstrap progress shown in real-time terminal                  | P1       | User feedback                                         |

---

### **FR-3: IDE Workspace**

| ID      | Requirement                                                      | Priority | Notes                   |
| ------- | ---------------------------------------------------------------- | -------- | ----------------------- |
| FR-3.1  | IDE displays 3-pane layout: file tree, editor, terminal          | P0       | Core UI                 |
| FR-3.2  | File tree shows project structure from WebContainers FS          | P0       | Virtual + local sync    |
| FR-3.3  | Monaco editor opens files with syntax highlighting               | P0       | TS, JS, JSON, CSS, HTML |
| FR-3.4  | Editor supports multi-tab interface (max 20 tabs)                | P0       | Tab management          |
| FR-3.5  | File changes auto-save after 2s debounce                         | P0       | No manual save needed   |
| FR-3.6  | Terminal provides 3 named tabs: dev, test, bash                  | P0       | Persistent shells       |
| FR-3.7  | Terminal executes commands in WebContainers                      | P0       | Shell integration       |
| FR-3.8  | Preview panel shows live app at localhost:3000                   | P1       | Iframe HMR              |
| FR-3.9  | Panel sizes are resizable and persist                            | P1       | User preference         |
| FR-3.10 | Keyboard shortcuts: Cmd+B (toggle tree), Cmd+J (toggle terminal) | P1       | Power user              |

---

### **FR-4: AI Agent Integration**

| ID     | Requirement                                                          | Priority | Notes                |
| ------ | -------------------------------------------------------------------- | -------- | -------------------- |
| FR-4.1 | User can open agent chat panel (Cmd+K or button)                     | P0       | Accessible from IDE  |
| FR-4.2 | Agent responds to natural language code requests                     | P0       | TanStack AI + Gemini |
| FR-4.3 | Agent can execute tools: readFile, writeFile, createFile, runCommand | P0       | Tool registry        |
| FR-4.4 | Agent shows plan before executing changes                            | P0       | User approval        |
| FR-4.5 | File modifications shown as diffs in editor                          | P0       | Visual feedback      |
| FR-4.6 | User can accept, reject, or modify agent changes                     | P1       | Interactive review   |
| FR-4.7 | Agent can refactor across multiple files atomically                  | P1       | Multi-file ops       |
| FR-4.8 | Agent errors are logged and explained to user                        | P1       | Error handling       |

---

### **FR-5: File System Persistence (Tier 2)**

| ID     | Requirement                                                 | Priority | Notes                |
| ------ | ----------------------------------------------------------- | -------- | -------------------- |
| FR-5.1 | Files sync to local folder via File System Access API       | P0       | Dual FS              |
| FR-5.2 | Sync is debounced (500ms) to avoid disk thrashing           | P0       | Performance          |
| FR-5.3 | User can open project folder in external editor (VS Code)   | P0       | Two-way sync         |
| FR-5.4 | External file changes detected and reflected in IDE         | P1       | File watcher         |
| FR-5.5 | User can revoke folder permission (falls back to IndexedDB) | P1       | Graceful degradation |
| FR-5.6 | Large files (>10MB) show warning before sync                | P2       | Performance          |

---

### **FR-6: Project Management**

| ID     | Requirement                                    | Priority | Notes                                    |
| ------ | ---------------------------------------------- | -------- | ---------------------------------------- |
| FR-6.1 | User can view list of recent projects          | P0       | Dashboard                                |
| FR-6.2 | Clicking project opens IDE with restored state | P0       | Open files, scroll position, panel sizes |
| FR-6.3 | User can delete project (with confirmation)    | P1       | Remove from list + disk                  |
| FR-6.4 | User can rename project                        | P2       | Updates folder name                      |
| FR-6.5 | User can duplicate project                     | P2       | Copy to new folder                       |

---

### **FR-7: Deployment**

| ID     | Requirement                                | Priority | Notes                      |
| ------ | ------------------------------------------ | -------- | -------------------------- |
| FR-7.1 | User can deploy to Netlify with one click  | P1       | Build + upload             |
| FR-7.2 | Deployment runs build command in terminal  | P1       | `pnpm build`               |
| FR-7.3 | User receives live URL after deployment    | P1       | https://[name].netlify.app |
| FR-7.4 | Build errors shown in terminal             | P1       | Debugging                  |
| FR-7.5 | User can re-deploy (updates existing site) | P2       | Overwrite                  |

---

### **FR-8: Export & Sharing**

| ID     | Requirement                                        | Priority | Notes             |
| ------ | -------------------------------------------------- | -------- | ----------------- |
| FR-8.1 | User can export project as ZIP file                | P1       | Offline backup    |
| FR-8.2 | Exported ZIP excludes node_modules, .git, dist     | P1       | Size optimization |
| FR-8.3 | Exported project runs identically outside via-gent | P0       | Portability       |
| FR-8.4 | User can import ZIP to create new project          | P2       | Reverse of export |

---

## **⚡ Non-Functional Requirements**

### **NFR-1: Performance**

| ID      | Requirement                       | Target | Measurement              |
| ------- | --------------------------------- | ------ | ------------------------ |
| NFR-1.1 | Landing page load time            | <1s    | First Contentful Paint   |
| NFR-1.2 | IDE load time (cold start)        | <3s    | Time to interactive      |
| NFR-1.3 | IDE load time (warm start)        | <1s    | Cached assets            |
| NFR-1.4 | Project bootstrap time            | <2 min | 95th percentile          |
| NFR-1.5 | File open latency                 | <100ms | Time to render in Monaco |
| NFR-1.6 | File save latency (local FS)      | <500ms | FS Access API write      |
| NFR-1.7 | Agent response time (first token) | <2s    | Streaming start          |
| NFR-1.8 | HMR (Hot Module Reload) latency   | <1s    | Change to preview update |

---

### **NFR-2: Reliability**

| ID      | Requirement                         | Target | Notes                     |
| ------- | ----------------------------------- | ------ | ------------------------- |
| NFR-2.1 | WebContainers boot success rate     | >98%   | Across all browsers       |
| NFR-2.2 | File System Access API sync success | >99%   | Write operations          |
| NFR-2.3 | Agent tool execution success        | >90%   | Excluding user errors     |
| NFR-2.4 | Session state recovery after crash  | 100%   | PGlite persistence        |
| NFR-2.5 | Concurrent project limit            | 5      | Browser memory constraint |

---

### **NFR-3: Compatibility**

| ID      | Requirement       | Support Level     | Notes                            |
| ------- | ----------------- | ----------------- | -------------------------------- |
| NFR-3.1 | Chrome 86+        | Full (Tier 2)     | File System Access API           |
| NFR-3.2 | Safari 15.2+      | Full (Tier 2)     | File System Access API           |
| NFR-3.3 | Edge 86+          | Full (Tier 2)     | Chromium-based                   |
| NFR-3.4 | Firefox Latest    | Degraded (Tier 1) | No FS Access API, IndexedDB only |
| NFR-3.5 | Mobile browsers   | Not supported     | IDE requires desktop viewport    |
| NFR-3.6 | Screen resolution | Min 1280x720      | Responsive layout                |

---

### **NFR-4: Security & Privacy**

| ID      | Requirement                                  | Implementation              | Notes          |
| ------- | -------------------------------------------- | --------------------------- | -------------- |
| NFR-4.1 | API keys stored encrypted                    | AES-256-GCM in localStorage | Web Crypto API |
| NFR-4.2 | No user data sent to via-gent servers        | Client-side only            | Zero backend   |
| NFR-4.3 | File System Access API permissions scoped    | Per-folder only             | No root access |
| NFR-4.4 | Code never uploaded without user consent     | Netlify deploy is explicit  | User-triggered |
| NFR-4.5 | Agent prompts not logged to external servers | Local execution only        | Privacy-first  |

---

### **NFR-5: Accessibility**

| ID      | Requirement                               | WCAG Level | Notes                |
| ------- | ----------------------------------------- | ---------- | -------------------- |
| NFR-5.1 | Keyboard navigation for all IDE functions | AA         | Tab order, shortcuts |
| NFR-5.2 | Screen reader support for file tree, tabs | AA         | ARIA roles           |
| NFR-5.3 | Color contrast ratio                      | AA (4.5:1) | Dark theme compliant |
| NFR-5.4 | Focus indicators visible                  | AA         | Clear focus styles   |
| NFR-5.5 | Text resizable up to 200%                 | AA         | No layout breaks     |

---

### **NFR-6: Scalability (Client-Side)**

| ID      | Requirement                     | Limit      | Notes                  |
| ------- | ------------------------------- | ---------- | ---------------------- |
| NFR-6.1 | Max project size (Tier 2)       | 5GB        | Limited by user's disk |
| NFR-6.2 | Max project size (Tier 1)       | 50MB       | IndexedDB quota        |
| NFR-6.3 | Max open files in editor        | 20 tabs    | Memory management      |
| NFR-6.4 | Max file size for Monaco editor | 5MB        | Virtual scrolling      |
| NFR-6.5 | Max agent context length        | 32K tokens | Gemini model limit     |

---

## **🚫 Out of Scope (V1)**

### **Explicitly NOT Included**

❌ **Authentication/Authorization**

- No user accounts, no login, no passwords
- Rationale: Client-side only, no backend to protect

❌ **Collaboration/Multiplayer**

- No real-time co-editing
- No shared projects
- Rationale: Local-first architecture

❌ **Membership/Billing**

- No paid plans, no subscriptions
- Rationale: Open-source, free forever

❌ **Git Hosting**

- No built-in GitHub integration (user uses external Git)
- Rationale: Scope creep, use `git` CLI in terminal

❌ **Cloud Storage**

- No sync to Google Drive/Dropbox
- Rationale: Tier 2 uses local FS, sufficient

❌ **Custom LLM Fine-Tuning**

- No model training
- Rationale: BYOK assumes pre-trained models

❌ **Backend Services**

- No databases, no APIs, no serverless functions
- Rationale: 100% client-side (can deploy to Netlify)

❌ **Mobile App**

- No iOS/Android native apps
- Rationale: IDE requires desktop form factor

❌ **Extensions/Plugins**

- No marketplace, no third-party plugins
- Rationale: Complexity, v2 feature

---

## **📋 Edge Cases & Error Handling**

### **Edge Case Matrix**

| Scenario                                           | Expected Behavior                                                    | Fallback                      |
| -------------------------------------------------- | -------------------------------------------------------------------- | ----------------------------- |
| **Browser doesn't support WebContainers**          | Show error: "Use Chrome 86+, Safari 15.2+, or Edge"                  | No fallback, hard requirement |
| **Browser doesn't support File System Access API** | Auto-switch to Tier 1 (IndexedDB)                                    | Silent degradation            |
| **User denies folder permission**                  | Show warning, offer retry or browser storage                         | Tier 1 fallback               |
| **User revokes permission mid-session**            | Prompt to re-grant or switch to browser storage                      | Save unsaved work first       |
| **Disk full (Tier 2)**                             | Show error: "Disk full. Free space or use browser storage."          | Offer switch to Tier 1        |
| **IndexedDB quota exceeded (Tier 1)**              | Show error: "Storage full. Delete projects or grant folder access."  | Offer Tier 2 upgrade          |
| **WebContainers out of memory**                    | Show error: "Project too large. Simplify or use smaller template."   | Offer restart                 |
| **Bootstrap timeout (>5 min)**                     | Show error: "Bootstrap timed out. Network issue?"                    | Offer retry                   |
| **Agent API key invalid**                          | Show error: "API key invalid. Check Google AI Studio."               | Prompt to update key          |
| **Agent rate limited**                             | Show error: "Rate limit hit. Wait 60s or use different key."         | Queue retry                   |
| **Large file (>5MB) in Monaco**                    | Show warning: "Large file. Editor may be slow."                      | Offer plain text mode         |
| **Binary file clicked**                            | Show preview (image) or download link (PDF)                          | Don't crash Monaco            |
| **Dev server crash**                               | Show error in terminal + "Restart Server" button                     | Allow manual restart          |
| **HMR fails**                                      | Show warning: "Hot reload failed. Refresh preview?"                  | Manual refresh                |
| **User closes tab mid-bootstrap**                  | Resume from last checkpoint on return                                | Use PGlite to track state     |
| **Concurrent edits (browser vs external)**         | Via-gent detects change, prompts: "File changed externally. Reload?" | User chooses                  |
| **Network offline**                                | All features work except: Gemini API, Netlify deploy                 | Show offline indicator        |

---

## **📈 Roadmap Alignment**

### **Phase 1: MVP (Weeks 1-8)**

**Scope:** Core IDE + Single-Agent Bootstrap

- ✅ Onboarding (LLM key + folder permission)
- ✅ Coordinator agent (5 questions → bootstrap)
- ✅ IDE workspace (file tree, Monaco, terminals)
- ✅ WebContainers + Tier 2 local FS
- ✅ Basic agent chat (read/write files)
- ✅ Project persistence (PGlite + local folder)

**Exit Criteria:** User can create and edit TanStack Start project in browser

---

### **Phase 2: Agent Ecosystem (Weeks 9-16)**

**Scope:** Multi-Agent Workflows

- [ ] Tool registry with 10+ tools
- [ ] Multi-agent coordination (code gen + review + test)
- [ ] Agent memory (conversation history + context)
- [ ] Advanced file operations (refactor, search, replace)
- [ ] Git integration (init, commit, push via isomorphic-git)

**Exit Criteria:** Agents can complete full feature implementation autonomously

---

### **Phase 3: Production Ready (Weeks 17-24)**

**Scope:** Deployment + Polish

- [ ] One-click Netlify deploy
- [ ] Export/import projects (ZIP)
- [ ] Preview panel with responsive modes
- [ ] Performance optimization (lazy loading, code splitting)
- [ ] Accessibility audit + fixes

**Exit Criteria:** User can ship production app from via-gent

---

### **Future (Post-V1)**

- [ ] Multi-project workspace
- [ ] MCP server bridge (Tier 3)
- [ ] Collaboration features (share project URL)
- [ ] Plugin system
- [ ] Mobile-responsive IDE (tablet support)

---

## **🎨 Visual Design Principles**

### **Mood-Boosting Dark Theme**

**Core Palette:**

- Background: `#0A0E12` (deep blue-black)
- Surface: `#141922` (elevated panels)
- Accent: `#10B981` (emerald green)
- Text: `#E5E7EB` (soft white)
- Muted: `#6B7280` (gray)

**Typography:**

- UI: Inter (system font)
- Code: Jetbrains Mono (monospace)

**Spacing:**

- Base unit: 4px
- Grid: 8px

### **Component Library**

**Use Shadcn/UI for:**

- Buttons
- Inputs
- Modals
- Dropdowns
- Tooltips

**Custom Components:**

- File tree (hierarchical)
- Monaco wrapper
- Terminal tabs
- Agent chat

---

## **✅ Acceptance Criteria Summary**

### **MVP is "Done" When:**

✅ User completes onboarding in <3 minutes  
✅ Bootstrap succeeds >95% of attempts  
✅ IDE loads in <3 seconds  
✅ File edits sync to local folder within 1 second  
✅ Agent can read, write, create files without errors  
✅ User can open project in VS Code and see same files  
✅ Dev server runs and preview updates on HMR  
✅ User can close browser and resume next day

---

**END OF PRD**

---

This PRD is the **source of truth** for product decisions. For architecture, see Architecture doc. For implementation, see Spec docs. For BMAD v6 design work, this PRD defines all user flows and UI states to design. 🚀
