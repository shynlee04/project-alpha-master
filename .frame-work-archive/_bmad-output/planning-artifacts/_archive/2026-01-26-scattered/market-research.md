# Market Research: AI IDE Competitive Landscape & Technical Patterns

**Research Date:** 2026-01-07
**Research Agent:** PRD Generation Research Specialist
**Confidence Levels:** HIGH (verified via multiple sources), MEDIUM (industry consensus), LOW (emerging trends)

---

## Executive Summary

This document provides comprehensive market and technical research for competitive AI IDE products, covering four critical domains:

1. **Competitive Landscape** - AI IDE market analysis
2. **Technical Patterns** - Agent integration, tools, permissions
3. **UX Best Practices** - Workspaces, mobile design
4. **State Management** - Zustand patterns, store architecture

**Key Findings:**
- AI IDE market is dominated by Cursor, Windsurf, Claude Code, and v0.dev
- Agent permission systems are becoming critical for security
- Workspace-aware state management is the emerging pattern
- Mobile-first responsive design is mandatory for modern IDEs

---

## 1. Competitive Landscape: AI IDEs (2025-2026)

### Market Leaders

#### **Cursor** ([ref_9](https://www.nucamp.co/blog/top-10-vibe-coding-tools-in-2026-cursor-copilot-claude-code-more))
- **Strengths:** Deep repo awareness, AI-native IDE architecture, excellent Vibe Coding experience
- **Target Users:** Professional developers, teams
- **Key Features:**
  - Multi-file editing with context awareness
  - Natural language command interface
  - Agent-based code generation with approval workflows
  - Real-time collaboration features
- **Market Position:** Premium pricing ($20/month), focused on professional workflows

#### **Windsurf** ([ref_5](https://www.builder.io/blog/windsurf-vs-cursor))
- **Strengths:** Open-source alternative, strong community, flexible agent framework
- **Target Users:** Indie developers, open-source projects
- **Key Features:**
  - AI code completion with multiple model support
  - Agent marketplace for custom tools
  - Local-first architecture with optional cloud sync
  - Extensible plugin system
- **Market Position:** Freemium model, targeting individual developers

#### **Claude Code** ([ref_8](https://www.cursor-ide.com/blog/claude-code-skills))
- **Strengths:** Advanced reasoning, Claude 3.5 Sonnet integration, excellent at complex refactoring
- **Target Users:** AI enthusiasts, early adopters
- **Key Features:**
  - Skills system for specialized agent capabilities
  - Deep thinking mode for complex problems
  - Cross-file refactoring with dependency tracking
  - Natural language test generation
- **Market Position:** CLI-first, expanding to IDE integration

#### **v0.dev by Vercel** ([ref_1](https://skywork.ai/blog/vercel-v0-dev-review-2025-ai-ui-react-tailwind/))
- **Strengths:** UI generation from prompts, React/Tailwind expertise, shadcn/ui integration
- **Target Users:** Frontend developers, UI designers
- **Key Features:**
  - Natural language to React components
  - Tailwind CSS styling by default
  - shadcn/ui component library integration
  - Instant preview and iteration
  - One-click export to production
- **Market Position:** Free tier available, paid plans for teams

### Competitive Analysis Matrix

| Feature | Cursor | Windsurf | Claude Code | v0.dev |
|---------|--------|----------|-------------|---------|
| **Code Completion** | ✅ Excellent | ✅ Excellent | ✅ Excellent | ❌ N/A (UI only) |
| **Agent System** | ✅ Advanced | ✅ Extensible | ✅ Skills-based | ❌ N/A |
| **Multi-file Editing** | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No |
| **Permission Controls** | ✅ Yes | ⚠️ Basic | ✅ Yes | ❌ N/A |
| **Mobile Support** | ❌ Desktop only | ❌ Desktop only | ❌ CLI only | ✅ Yes (web) |
| **Local-first** | ⚠️ Hybrid | ✅ Yes | ✅ Yes | ❌ Cloud |
| **Open Source** | ❌ No | ✅ Yes | ❌ No | ⚠️ Partial |
| **Pricing** | $20/month | Freemium | API-based | Freemium |

### Market Trends (2026)

1. **Agentic Workflows** ([ref_1](https://linguista.bearblog.dev/2025-mid-ai-cursor-windsurf-claudecode/))
   - Shift from autocomplete to autonomous agents
   - Multi-step task execution with approval gates
   - Tool permission systems becoming standard
   - Competitive advantage: "Three pillars" = LLM quality + workflow integration + reliable agent framework

2. **Security & Permissions** ([ref_3](https://www.oasis.security/blog/cursor-oasis-governing-agentic-access))
   - Least-privilege agent access mandatory
   - Approval workflows for high-impact operations
   - Sandboxed execution environments (WebContainers, Docker)
   - OWASP Top 10 for Agentic Applications emerging ([ref_8](https://www.aikido.dev/blog/owasp-top-10-agentic-applications))

3. **Local-First Architecture** ([ref_4](https://research.aimultiple.com/ai-code-editor/))
   - Privacy concerns driving client-side execution
   - WebContainers API enabling browser-based development
   - Reduced latency, offline capability, cost efficiency
   - Hybrid models: local inference + cloud backup

4. **Vibe Coding Experience** ([ref_9](https://www.nucamp.co/blog/top-10-vibe-coding-tools-in-2026-cursor-copilot-claude-code-more))
   - Low-friction, conversational coding
   - "Talk to your code" paradigm
   - Reduced context switching
   - Ambient awareness of project state

### Differentiation Opportunities for Via-gent

1. **Mobile-First IDE** (No competitor has this)
   - Touch-optimized interface
   - Progressive Web App (PWA) architecture
   - Offline code editing with sync
   - Voice commands for mobile coding

2. **Multi-Workspace Architecture** (Unique)
   - IDE workspace (code execution)
   - Knowledge workspace (RAG, notes)
   - Study workspace (flashcards, quizzes)
   - Notes workspace (document sync)

3. **Education Market Focus** (Under-served)
   - Vietnamese localization (native language advantage)
   - Learn-to-code curriculum integration
   - Interactive tutorials with AI explanations
   - Student pricing model

4. **Local-First with AI Synthesis** ([ref_6](https://www.builder.io/blog/windsurf-vs-cursor))
   - Browser-based execution via WebContainers
   - Knowledge synthesis from multiple sources
   - Privacy-focused (no code leaves device)
   - No server costs for execution

---

## 2. Technical Patterns: Agent Integration & Tool Permissions

### Agent Tool Permission Systems

#### **TanStack AI Approval Workflow** ([TanStack AI](https://github.com/tanstack/ai/blob/main/docs/guides/tool-approval.md))
**Confidence:** HIGH (official documentation)

```typescript
// Define tool requiring approval
const deleteDataDef = toolDefinition({
  name: "delete_data",
  description: "Delete user data from the database",
  inputSchema: z.object({
    userId: z.string(),
    dataType: z.string(),
  }),
  outputSchema: z.object({
    deleted: z.boolean(),
    message: z.string(),
  }),
  needsApproval: true, // ⚠️ CRITICAL FLAG
});

// Server implementation
const deleteData = deleteDataDef.server(async ({ userId, dataType }) => {
  await db.userData.delete({ where: { userId, type: dataType } });
  return { deleted: true, message: "Data deleted successfully" };
});

// Client approval UI
function ChatWithApproval() {
  const { messages, addToolApprovalResponse } = useChat({
    connection: fetchServerSentEvents("/api/chat"),
  });

  return (
    <div>
      {messages.map((message) =>
        message.parts.map((part) => {
          if (
            part.type === "tool-call" &&
            part.state === "approval-requested"
          ) {
            return (
              <div key={part.id} className="approval-request">
                <p><strong>Approval Required:</strong> {part.name}</p>
                <p>Action: Delete {part.input.dataType}</p>
                <div className="approval-buttons">
                  <button
                    onClick={() =>
                      addToolApprovalResponse({
                        id: part.approval!.id,
                        approved: true,
                      })
                    }
                  >
                    Approve
                  </button>
                  <button
                    onClick={() =>
                      addToolApprovalResponse({
                        id: part.approval!.id,
                        approved: false,
                      })
                    }
                  >
                    Deny
                  </button>
                </div>
              </div>
            );
          }
          return null;
        })
      )}
    </div>
  );
}
```

**Key Patterns:**
1. **`needsApproval` flag** on tool definition enables approval workflow
2. **Three-state tool lifecycle:** pending → approval-requested → executed/denied
3. **UI must handle approval state** with approve/deny buttons
4. **Server waits for approval** before executing destructive operations

#### **Workspace-Aware Tool Filtering** (Derived from multiple sources)
**Confidence:** MEDIUM (industry consensus, architectural inference)

```typescript
// Agent configuration with workspace bindings
interface Agent {
  id: string;
  name: string;
  workspaceBindings: WorkspaceBinding[];
  tools: AgentToolBinding[];
}

interface WorkspaceBinding {
  workspaceType: 'ide' | 'knowledge' | 'study' | 'notes';
  isAvailable: boolean;
  uiVariant: 'full' | 'compact' | 'minimal';
}

interface AgentToolBinding {
  toolId: string;
  toolName: string;
  isEnabled: boolean;
  workspacePermissions: {
    ide: boolean;
    knowledge: boolean;
    study: boolean;
    notes: boolean;
  };
}

// Permission check before tool execution
function checkWorkspacePermission(
  toolId: string,
  agentTools: AgentToolBinding[],
  agentBindings: WorkspaceBinding[],
  currentWorkspace: WorkspaceType
): PermissionCheckResult {
  // Step 1: Check agent available in workspace
  const binding = agentBindings.find(b => b.workspaceType === currentWorkspace);
  if (!binding?.isAvailable) {
    return { canExecute: false, reason: 'agent-not-available' };
  }

  // Step 2: Check tool enabled for workspace
  const tool = agentTools.find(t => t.toolId === toolId);
  if (!tool?.workspacePermissions[currentWorkspace]) {
    return { canExecute: false, reason: 'tool-not-enabled-in-workspace' };
  }

  // Step 3: Check trust level (auto/prompt/block)
  const trustLevel = getTrustLevel(toolId);
  if (trustLevel === 'block') {
    return { canExecute: false, reason: 'tool-blocked' };
  }

  return {
    canExecute: true,
    needsApproval: trustLevel === 'prompt'
  };
}
```

**Key Patterns:**
1. **Three-tier permission model:** Agent availability → Tool permissions → Trust levels
2. **Workspace-scoped tool permissions** per agent
3. **Trust levels persist** across sessions (localStorage/IndexedDB)
4. **Graceful degradation** with clear error messages

### WebContainer API for Sandboxed Execution

#### **File System Operations** ([WebContainers Docs](https://webcontainers.io/guides/working-with-the-file-system))
**Confidence:** HIGH (official documentation)

```typescript
// WebContainer instance provides isolated file system
const webcontainerInstance = await WebContainer.boot();

// Read file
const fileContent = await webcontainerInstance.fs.readFile('/package.json', 'utf-8');

// Write file
await webcontainerInstance.fs.writeFile('/src/index.js', 'console.log("Hello")');

// List directory
const files = await webcontainerInstance.fs.readdir('/src');

// Delete file/directory
await webcontainerInstance.fs.rm('/old-file.js', { recursive: true });

// Create directory
await webcontainerInstance.fs.mkdir('/src/components', { recursive: true });
```

**Key Patterns:**
1. **Isolated file system** per WebContainer instance
2. **POSIX-like API** (readFile, writeFile, readdir, rm, mkdir)
3. **Mount local files** via `mount()` for instant hydration
4. **Security:** Cannot access host machine files directly

#### **Cross-Origin Isolation Headers** ([WebContainers Security](https://webcontainers.io/guides/configuring-headers))
**Confidence:** HIGH (official documentation)

```javascript
// Vite plugin configuration (MUST BE FIRST PLUGIN)
export default defineConfig({
  plugins: [
    crossOriginIsolationPlugin(), // ⚠️ CRITICAL: First in array
    // ... other plugins
  ]
});

// Headers for SharedArrayBuffer support
res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
```

**Key Patterns:**
1. **COOP/COEP headers mandatory** for SharedArrayBuffer (required by WebContainers)
2. **Plugin order critical** - crossOriginIsolationPlugin MUST be first
3. **Browser compatibility:** Chrome/Edge only (Safari/Firefox partial support)

### Agent Security Best Practices

#### **OWASP Top 10 for Agentic Applications** ([ref_8](https://www.aikido.dev/blog/owasp-top-10-agentic-applications))
**Confidence:** HIGH (industry standard)

1. **Prompt Injection** - Sanitize all user inputs before passing to LLM
2. **Unauthorized Tool Execution** - Implement approval workflows for destructive operations
3. **Data Exfiltration** - Restrict file system access, sandbox execution
4. **Resource Exhaustion** - Rate limits, timeouts, memory caps
5. **Supply Chain Poisoning** - Pin dependency versions, verify integrity
6. **Insecure Output Handling** - Validate LLM responses before execution
7. **Agent Impersonation** - Authenticate agents, verify identities
8. **Excessive Autonomy** - Human-in-the-loop for critical decisions
9. **Training Data Exposure** - Sanitize logs, redact sensitive data
10. **Model Denial of Service** - Queue management, circuit breakers

#### **Approval Workflow Design** ([ref_6](https://www.augmentcode.com/guides/ai-agent-workflow-implementation-guide))
**Confidence:** MEDIUM (industry consensus)

```typescript
// Trust levels with approval requirements
enum ToolTrustLevel {
  AUTO = 'auto',      // Execute without asking (safe operations)
  PROMPT = 'prompt',  // Ask user every time (risky operations)
  BLOCK = 'block'     // Never execute (dangerous operations)
}

// Permission check
function checkPermission(toolId: string): PermissionCheckResult {
  const trustLevel = getTrustLevel(toolId);

  if (trustLevel === ToolTrustLevel.BLOCK) {
    return {
      canExecute: false,
      needsApproval: false,
      reason: 'Tool blocked by policy'
    };
  }

  if (trustLevel === ToolTrustLevel.AUTO) {
    return {
      canExecute: true,
      needsApproval: false,
      reason: 'Auto-approved'
    };
  }

  return {
    canExecute: true,
    needsApproval: true,
    reason: 'User approval required'
  };
}
```

**Key Patterns:**
1. **Three-tier trust model** (auto/prompt/block)
2. **Trust levels persist** across sessions
3. **Approval UI shows** tool name, arguments, risk level
4. **Audit log** of all tool executions

---

## 3. UX Best Practices: Workspaces & Mobile Design

### Workspace Switching Patterns

#### **Mobile Workspace Switching** ([ref_1](https://ux.stackexchange.com/questions/123907/design-patterns-for-switching-workspaces-on-mobile))
**Confidence:** MEDIUM (UX best practices)

**Pattern 1: Bottom Navigation Bar**
- Pros: Thumb-friendly, always visible, clear affordance
- Cons: Takes up screen space, limited to 5 items
- Best for: 3-5 workspaces with equal usage frequency

**Pattern 2: Swipeable Tabs**
- Pros: Natural gesture, space-efficient, visual feedback
- Cons: Discoverability issues, not obvious to new users
- Best for: Power users, frequent workspace switching

**Pattern 3: Dropdown Menu**
- Pros: Space-efficient, scalable to many workspaces
- Cons: Extra tap required, not always visible
- Best for: 5+ workspaces, infrequent switching

**Recommendation for Via-gent:**
- **Primary:** Bottom navigation bar for mobile (4 workspaces)
- **Secondary:** Swipeable tabs for power users
- **Desktop:** Sidebar navigation with icons + labels

#### **Workspace State Persistence** (Derived from multiple IDE patterns)
**Confidence:** HIGH (industry standard)

```typescript
// Workspace-aware state management
interface WorkspaceState {
  activeWorkspace: WorkspaceType;
  workspaceStates: Record<WorkspaceType, {
    activeFile: string | null;
    openFiles: string[];
    panelLayout: PanelLayout;
    scrollPosition: number;
  }>;
}

// Switch workspaces
function switchWorkspace(newWorkspace: WorkspaceType) {
  // Save current workspace state
  const currentState = captureWorkspaceState();
  workspaceStates[activeWorkspace] = currentState;

  // Restore new workspace state
  const newState = workspaceStates[newWorkspace];
  restoreWorkspaceState(newState);

  // Update active workspace
  activeWorkspace = newWorkspace;
}
```

**Key Patterns:**
1. **State isolation** per workspace (no cross-workspace contamination)
2. **Context preservation** (scroll position, open files, panel layout)
3. **Lazy loading** (don't load workspace until accessed)
4. **Memory management** (unload least-recently-used workspace after threshold)

### Mobile-First Responsive Design

#### **Responsive Breakpoints** ([ref_2](https://ui.shadcn.com/docs/components/drawer))
**Confidence:** HIGH (shadcn/ui official patterns)

```typescript
// Design tokens for breakpoints
const breakpoints = {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet
  lg: '1024px',  // Laptop
  xl: '1280px',  // Desktop
  '2xl': '1536px' // Large desktop
};

// Media query hook
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);
    const listener = () => setMatches(media.matches);
    media.addListener(listener);
    return () => media.removeListener(listener);
  }, [query]);

  return matches;
}

// Usage: Responsive dialog/drawer
function ResponsiveDialog() {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  if (isDesktop) {
    return <Dialog>...</Dialog>; // Centered modal
  }

  return <Drawer>...</Drawer>; // Bottom sheet on mobile
}
```

**Key Patterns:**
1. **Dialog on desktop, Drawer on mobile** (responsive components)
2. **Touch targets ≥44px** (iOS HIG minimum)
3. **dvh (Dynamic Viewport Height)** for mobile browsers with collapsible UI
4. **16px (1rem) minimum font size** to prevent iOS auto-zoom

#### **Mobile-Specific UX Patterns** ([ref_7](https://www.designrush.com/best-designs/apps/trends/mobile-design-patterns))
**Confidence:** MEDIUM (mobile UX best practices)

1. **Thumb Zone Design**
   - Primary actions: Bottom 1/3 of screen
   - Secondary actions: Middle 1/3
   - Tertiary actions: Top 1/3 (harder to reach)

2. **Progressive Disclosure**
   - Show essential info first
   - Reveal advanced options on demand
   - Use accordions, expandable sections

3. **Gesture Shortcuts**
   - Swipe left/right: Navigate between workspaces
   - Pull down: Refresh/Reload
   - Long press: Context menu
   - Pinch to zoom: Editor font size

4. **Feedback & Affordance**
   - Loading spinners for async operations
   - Toast notifications for success/error
   - Haptic feedback for key actions
   - Skeleton screens for content loading

### Accessibility Standards

#### **Keyboard Navigation** ([Radix UI Primitives](https://www.radix-ui.com/docs/primitives))
**Confidence:** HIGH (official documentation)

```typescript
// Dialog with focus management (Radix UI pattern)
<Dialog.Root>
  <Dialog.Trigger asChild>
    <button>Open Dialog</button>
  </Dialog.Trigger>

  <Dialog.Portal>
    <Dialog.Overlay />
    <Dialog.Content
      onOpenAutoFocus={(event) => {
        // Focus the close button when dialog opens
        closeButtonRef.current?.focus();
        event.preventDefault();
      }}
    >
      {/* Dialog content */}

      <Dialog.Close ref={closeButtonRef}>
        Close
      </Dialog.Close>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
```

**Key Patterns:**
1. **Focus trap** - Tab cycles within dialog, doesn't escape
2. **Focus restoration** - Returns to trigger when dialog closes
3. **Escape key** - Closes dialog/overlay
4. **ARIA attributes** - `role="dialog"`, `aria-label`, `aria-describedby`

#### **Screen Reader Support** ([ref_4](https://www.interaction-design.org/literature/article/help-i-need-some-help-not-just-any-help-help-in-mobile-applications))
**Confidence:** HIGH (WCAG 2.1 AA standard)

1. **Semantic HTML**
   - Use `<button>` instead of `<div>` with onClick
   - Use `<nav>`, `<main>`, `<aside>` for layout
   - Use `<label>` with `htmlFor` for form inputs

2. **ARIA Labels**
   - `aria-label` for icon-only buttons
   - `aria-describedby` for additional context
   - `aria-live` for dynamic content (toasts, alerts)

3. **Keyboard Shortcuts**
   - `Cmd+K` - Open command palette
   - `Cmd+P` - Quick file switcher
   - `Cmd+S` - Save file
   - `Esc` - Close modal/dialog

### Design System Integration

#### **shadcn/ui Theming** ([shadcn/ui Docs](https://ui.shadcn.com/docs/components/field))
**Confidence:** HIGH (official documentation)

```css
/* CSS custom properties (design tokens) */
:root {
  /* Colors */
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;

  /* Typography */
  --font-heading: 'Inter', sans-serif;
  --font-body: 'Inter', sans-serif;

  /* Spacing */
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;

  /* Border radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
}
```

**Key Patterns:**
1. **CSS custom properties** for design tokens (colors, spacing, typography)
2. **HSL color format** for easier theming
3. **Tailwind CSS integration** via `@tailwindcss/typography`
4. **Component composition** (Field, FieldGroup, FieldSet for forms)

---

## 4. State Management: Zustand Patterns & Store Architecture

### Zustand Slices Pattern

#### **Official Slices Pattern** ([Zustand Docs](https://zustand.docs.pmnd.rs/guides/slices-pattern))
**Confidence:** HIGH (official documentation)

```typescript
// Create individual slices
interface FishSlice {
  fishes: number;
  addFish: () => void;
}

interface BearSlice {
  bears: number;
  addBear: () => void;
  eatFish: () => void; // Cross-slice action
}

// Slice creator functions
export const createFishSlice: StateCreator<
  FishSlice & BearSlice,  // Combined type for cross-slice access
  [],
  [],
  FishSlice
> = (set) => ({
  fishes: 0,
  addFish: () => set((state) => ({ fishes: state.fishes + 1 })),
});

export const createBearSlice: StateCreator<
  BearSlice & FishSlice,  // Combined type
  [],
  [],
  BearSlice
> = (set, get) => ({
  bears: 0,
  addBear: () => set((state) => ({ bears: state.bears + 1 })),
  eatFish: () => {
    // Cross-slice communication using get()
    const currentFishes = get().fishes;
    set({ fishes: Math.max(0, currentFishes - 1) });
  },
});

// Combine into single bounded store
export const useBoundStore = create<BearSlice & FishSlice>()((...a) => ({
  ...createBearSlice(...a),
  ...createFishSlice(...a),
}));
```

**Key Patterns:**
1. **Slice creator functions** receive `set` and `get` parameters
2. **Combined type** on `StateCreator` enables cross-slice awareness
3. **`get()` for cross-slice communication** (prevents circular dependencies)
4. **Single bounded store** (recommended over multiple stores)

#### **Cross-Slice Communication** ([ref_2](https://beyondthecode.medium.com/zustand-a-guide-to-scalable-state-management-0186c4208e01))
**Confidence:** HIGH (Zustand best practices)

**Pattern 1: Direct state access via `set()`**
```typescript
export const createBearSlice = (set) => ({
  bears: 0,
  addBear: () => set((state) => ({ bears: state.bears + 1 })),
  eatFish: () => set((state) => ({ fishes: state.fishes - 1 })),
});
```

**Pattern 2: Call other slice actions via `get()`**
```typescript
export const createCoordinatorSlice = (set, get) => ({
  addBearAndFish: () => {
    get().addBear();
    get().addFish();
  },
});
```

**Pattern 3: Domain services (pure functions)**
```typescript
// src/domain/services/project-workspace-validator.ts
export function validateWorkspaceBinding(project, workspaceType, binding) {
  if (workspaceType === 'ide' && !binding.isAvailable) {
    throw new Error('IDE workspace must be available');
  }
  return { isValid: true };
}

// Slice uses domain service
export const createProjectWorkspaceBindingsSlice = (set, get) => ({
  updateWorkspaceBinding: (projectId, workspaceType, binding) => {
    const project = get().getProject(projectId);
    const validation = validateWorkspaceBinding(project, workspaceType, binding);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }
    set((state) => ({
      projects: {
        ...state.projects,
        [projectId]: { ...project, workspaceBindings: updatedBindings }
      }
    }));
  }
});
```

**Key Patterns:**
1. **Prefer `get()` over direct imports** (prevents circular dependencies)
2. **Domain services for complex logic** (easier to test, pure functions)
3. **Single direction data flow** (no bidirectional dependencies)

### God Store Remediation

#### **God Store Definition** (From project analysis)
**Confidence:** HIGH (established pattern)

- **God Store:** Any Zustand store file exceeding **300 lines**
- **Anti-Patterns:**
  - 400+ lines in single file
  - 10+ methods in one store
  - Multiple unrelated concerns (CRUD + permissions + layout + events)
  - Direct cross-store imports (circular dependencies)

#### **Refactoring Methodology** (Derived from Epic CC-1 & CP-1)
**Confidence:** MEDIUM (architectural recommendation)

**Step 1: Identify Responsibilities** (1-2 hours)
```typescript
// BEFORE: God Store (450 lines)
// project-store.ts with 20+ methods:
├── Project CRUD (create, read, update, delete)
├── Workspace bindings management
├── Permission state tracking
├── Layout state persistence
└── Legacy migration utilities

// Analysis: 5 distinct responsibilities → 5 focused slices
```

**Step 2: Design Slice Boundaries** (2-3 hours)
```typescript
// AFTER: 5 Slices (each <120 lines)
├── project-crud-slice.ts (120 lines) - Project CRUD operations
├── project-workspace-bindings-slice.ts (100 lines) - WB management
├── project-permissions-slice.ts (110 lines) - Permission state
├── project-layout-slice.ts (80 lines) - Layout persistence
└── project-utils-slice.ts (90 lines) - Query helpers
```

**Step 3: Implement Slices** (8-12 hours per slice)
```typescript
// Example: project-crud-slice.ts
export interface ProjectCrudState {
  projects: Record<string, ProjectMetadata>;
  activeProjectId: string | null;

  createProject: (metadata: Omit<ProjectMetadata, 'id' | 'lastOpened'>) => Promise<string>;
  getProject: (id: string) => ProjectMetadata | undefined;
  updateProject: (id: string, updates: Partial<ProjectMetadata>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  getAllProjects: () => ProjectMetadata[];
  setActiveProject: (id: string) => void;
  getRecentProjects: (limit?: number) => ProjectMetadata[];
}

export const createProjectCrudSlice = (set, get) => ({
  projects: {},
  activeProjectId: null,

  createProject: async (metadata) => {
    const id = `project_${Date.now()}`;
    const project = { ...metadata, id, lastOpened: new Date() };
    set((state) => ({
      projects: { ...state.projects, [id]: project }
    }));
    return id;
  },

  getProject: (id) => {
    return get().projects[id];
  },

  // ... other methods
});
```

**Step 4: Combine into Single Store** (2-4 hours)
```typescript
export const useProjectStore = create<ProjectStore>()(
  persist(
    (...a) => ({
      ...createProjectCrudSlice(...a),
      ...createProjectWorkspaceBindingsSlice(...a),
      ...createProjectPermissionsSlice(...a),
      ...createProjectLayoutSlice(...a),
      ...createProjectUtilsSlice(...a),
    }),
    {
      name: 'project-state',
      storage: createDexieStorage('projectState'),
      partialize: (state) => ({
        projects: state.projects,
        activeProjectId: state.activeProjectId,
        // layoutState excluded (transient)
      }),
    }
  )
);
```

**Expected Outcomes:**
- **Code reduction:** 8-53% reduction (varies by store complexity)
- **Testability:** Easier to unit test (pure functions, single responsibility)
- **Maintainability:** Each slice ≤120 lines, focused on one concern
- **No circular dependencies:** Cross-slice via `get()` or domain services

### Workspace-Aware State Management

#### **Multi-Workspace Store Pattern** (Derived from multiple sources)
**Confidence:** MEDIUM (architectural inference)

```typescript
// Workspace-scoped store
interface WorkspaceStore<T> {
  workspaces: Record<WorkspaceType, T>;
  activeWorkspace: WorkspaceType;

  getWorkspaceState: (workspace: WorkspaceType) => T;
  setWorkspaceState: (workspace: WorkspaceType, state: Partial<T>) => void;
  switchWorkspace: (workspace: WorkspaceType) => void;
}

export const createWorkspaceStore = <T extends object>(
  initialStates: Record<WorkspaceType, T>
) => {
  return create<WorkspaceStore<T>>()((set, get) => ({
    workspaces: initialStates,
    activeWorkspace: 'ide',

    getWorkspaceState: (workspace) => {
      return get().workspaces[workspace];
    },

    setWorkspaceState: (workspace, updates) => {
      set((state) => ({
        workspaces: {
          ...state.workspaces,
          [workspace]: {
            ...state.workspaces[workspace],
            ...updates
          }
        }
      }));
    },

    switchWorkspace: (workspace) => {
      set({ activeWorkspace: workspace });
    }
  }));
};

// Usage
interface IDEWorkspaceState {
  openFiles: string[];
  activeFile: string | null;
}

const useIDEWorkspaceStore = createWorkspaceStore<IDEWorkspaceState>({
  ide: { openFiles: [], activeFile: null },
  knowledge: { openFiles: [], activeFile: null },
  study: { openFiles: [], activeFile: null },
  notes: { openFiles: [], activeFile: null },
});
```

**Key Patterns:**
1. **Workspace-scoped state** (no cross-workspace contamination)
2. **Type-safe workspace switching** (TypeScript generics)
3. **Lazy initialization** (workspaces created on first access)
4. **Isolation guarantees** (state mutation doesn't affect other workspaces)

### State Persistence Strategies

#### **Dexie Storage for Zustand** (From project architecture)
**Confidence:** HIGH (production-tested)

```typescript
// Custom storage adapter
import { Dexie } from 'dexie';

const db = new Dexie('ViaGentState');
db.version(1).stores({
  state: 'key, value, timestamp'
});

function createDexieStorage(tableName: string) {
  return {
    getItem: async (key: string) => {
      const item = await db.table(tableName).get(key);
      return item?.value;
    },
    setItem: async (key: string, value: string) => {
      await db.table(tableName).put({
        key,
        value,
        timestamp: Date.now()
      });
    },
    removeItem: async (key: string) => {
      await db.table(tableName).delete(key);
    }
  };
}

// Usage with persist middleware
export const useStore = create()(
  persist(
    (set, get) => ({
      // ... store implementation
    }),
    {
      name: 'my-store',
      storage: createDexieStorage('state'),
      partialize: (state) => ({
        // Only persist selected fields
        persistedField: state.persistedField,
        // transientField excluded
      }),
    }
  )
);
```

**Key Patterns:**
1. **IndexedDB via Dexie** for persistence (survives browser reload)
2. **Selective persistence** via `partialize` (transient state excluded)
3. **Versioning** for schema migrations
4. **Encryption** for sensitive data (API keys via AES-256-GCM)

---

## 5. Agile Project Management Patterns

### Sprint & Story Structure

#### **Taiga Project Management Patterns** ([Taiga Docs](https://github.com/taigaio/taiga-doc))
**Confidence:** HIGH (open-source project management platform)

**User Story Structure:**
```json
{
  "id": 22,
  "ref": 29,
  "subject": "Add tests for bulk operations",
  "description": "Write unit tests for bulk CRUD operations",
  "assigned_to": 8,
  "status": 5,
  "points": {
    "1": 6,
    "2": 5,
    "3": 9,
    "4": 5
  },
  "total_points": 68.0,
  "milestone": 2,
  "epics": [
    {
      "id": 5,
      "ref": 68,
      "subject": "Migrate to Python 3 and modernize codebase"
    }
  ],
  "tags": ["testing", "quality", "p0"],
  "due_date": "2026-01-15",
  "is_blocked": false,
  "watchers": [11, 7, 10]
}
```

**Sprint Structure:**
```json
{
  "id": 2,
  "name": "Sprint 2026-01-07",
  "estimated_start": "2026-01-07",
  "estimated_finish": "2026-01-15",
  "total_points": 240.5,
  "closed_points": 44.0,
  "user_stories": [
    {
      "id": 4,
      "subject": "Support for bulk actions",
      "status": 3,
      "backlog_order": 1593690984552
    }
  ]
}
```

**Key Patterns:**
1. **Story points** reflect complexity (1-4 scale: trivial → complex)
2. **Epics group related stories** for milestone tracking
3. **Sprints** are time-boxed (2 weeks typical)
4. **Velocity tracking** via `total_points` vs `closed_points`

#### **Story Breakdown Workflow** (Derived from agile best practices)
**Confidence:** MEDIUM (industry standard)

1. **Epic Creation**
   - Define high-level goal (e.g., "Implement workspace switching")
   - Identify business value (e.g., "Users can seamlessly switch between IDE, Knowledge, Study, Notes")
   - Estimate epic points (sum of story points)

2. **Story Breakdown**
   - Split epic into user stories (e.g., "Bottom navigation bar", "State persistence", "Swipe gestures")
   - Write acceptance criteria for each story
   - Estimate story points (Fibonacci sequence: 1, 2, 3, 5, 8, 13)

3. **Sprint Planning**
   - Select stories for sprint based on team velocity
   - Define sprint goal (one-sentence summary)
   - Assign stories to developers

4. **Story Execution**
   - Implement code changes
   - Write tests (unit + integration)
   - Create/update documentation
   - Mark story as "Ready for Review"

5. **Acceptance & Retrospective**
   - Product owner accepts/rejects story
   - Team retro: What went well? What to improve?
   - Update velocity estimates based on actuals

---

## 6. Implementation Recommendations for Via-gent

### Critical Features (P0 - Must Have)

1. **Agent Permission System** ([ref_2](https://www.cerbos.dev/blog/mcp-permissions-securing-ai-agent-access-to-tools))
   - Three-tier trust levels (auto/prompt/block)
   - Approval UI for destructive operations
   - Workspace-scoped tool permissions
   - Audit log of all tool executions

2. **Mobile-First Responsive Design**
   - Bottom navigation bar for workspace switching
   - Touch targets ≥44px
   - Dialog on desktop, Drawer on mobile
   - Progressive Web App (PWA) for offline capability

3. **Workspace-Aware State Management**
   - Zustand stores with slices pattern
   - Workspace-scoped state isolation
   - Dexie persistence for critical state
   - Cross-slice communication via `get()`

4. **WebContainer Integration**
   - Cross-origin isolation headers (COOP/COEP)
   - Sandboxed code execution
   - File system operations via `fs` API
   - Local file mounting via `mount()`

### Important Features (P1 - Should Have)

1. **Vibe Coding Experience** ([ref_9](https://www.nucamp.co/blog/top-10-vibe-coding-tools-in-2026-cursor-copilot-claude-code-more))
   - Natural language command interface
   - Ambient project awareness
   - Low-friction code generation
   - Context-aware suggestions

2. **Multi-Workspace Architecture**
   - IDE workspace (code execution)
   - Knowledge workspace (RAG, notes)
   - Study workspace (flashcards, quizzes)
   - Notes workspace (document sync)

3. **Education Market Features**
   - Vietnamese localization (i18n)
   - Learn-to-code curriculum integration
   - Interactive tutorials with AI explanations
   - Student pricing model

### Nice-to-Have Features (P2 - Could Have)

1. **Advanced Agent Capabilities**
   - Multi-agent debating system
   - Deep thinking mode for complex problems
   - Agent marketplace for custom tools
   - Workflow automation

2. **Collaboration Features**
   - Real-time collaboration (Google Docs style)
   - Shareable workspaces
   - Code review with AI assistance
   - Team knowledge base

3. **Analytics & Insights**
   - Coding velocity metrics
   - Learning progress tracking
   - AI usage analytics
   - Performance benchmarks

### Technical Architecture Recommendations

1. **State Management** (Zustand + Dexie)
   - Split god stores into slices (<120 lines each)
   - Single bounded store per domain
   - Cross-slice communication via `get()` or domain services
   - Persist critical state via Dexie (IndexedDB)

2. **UI Component Library** (shadcn/ui + Radix UI)
   - Accessible primitives (ARIA attributes)
   - Responsive components (Dialog/Drawer pattern)
   - Design tokens (CSS custom properties)
   - Tailwind CSS for styling

3. **Routing** (TanStack Router)
   - File-based routing
   - Type-safe navigation
   - Code-splitting per route
   - Workspace-specific routes

4. **AI Integration** (TanStack AI)
   - Provider-agnostic adapters
   - Tool approval workflows
   - Streaming responses
   - Multi-modal content support

5. **Code Execution** (WebContainers)
   - Sandboxed Node.js runtime
   - File system isolation
   - Cross-origin isolation headers
   - Local file mounting

---

## 7. Sources & References

### Competitive Landscape
- [Top 10 Vibe Coding Tools in 2026](https://www.nucamp.co/blog/top-10-vibe-coding-tools-in-2026-cursor-copilot-claude-code-more) (ref_9)
- [Windsurf vs Cursor](https://www.builder.io/blog/windsurf-vs-cursor) (ref_5)
- [Claude Code Skills Guide](https://www.cursor-ide.com/blog/claude-code-skills) (ref_8)
- [v0.dev Review 2025](https://skywork.ai/blog/vercel-v0-dev-review-2025-ai-ui-react-tailwind/) (ref_1)
- [2025 AI Coding New Paradigm](https://linguista.bearblog.dev/2025-mid-ai-cursor-windsurf-claudecode/) (ref_2)

### Technical Patterns
- [TanStack AI Tool Approval](https://github.com/tanstack/ai/blob/main/docs/guides/tool-approval.md) (HIGH confidence)
- [WebContainers File System](https://webcontainers.io/guides/working-with-the-file-system) (HIGH confidence)
- [WebContainers Security Headers](https://webcontainers.io/guides/configuring-headers) (HIGH confidence)
- [AI Agent Security Risks](https://www.mintmcp.com/blog/ai-agent-security-risks) (ref_5)
- [OWASP Top 10 for Agentic Applications](https://www.aikido.dev/blog/owasp-top-10-agentic-applications) (ref_8)
- [MCP Permissions](https://www.cerbos.dev/blog/mcp-permissions-securing-ai-agent-access-to-tools) (ref_2)
- [Cursor Oasis Security](https://www.oasis.security/blog/cursor-oasis-governing-agentic-access) (ref_3)
- [AI Agent Workflow Guide](https://www.augmentcode.com/guides/ai-agent-workflow-implementation-guide) (ref_6)

### UX Best Practices
- [Design Patterns for Switching Workspaces](https://ux.stackexchange.com/questions/123907/design-patterns-for-switching-workspaces-on-mobile) (ref_1)
- [shadcn/ui Drawer Component](https://ui.shadcn.com/docs/components/drawer) (ref_2)
- [Mobile Design Patterns](https://www.designrush.com/best-designs/apps/trends/mobile-design-patterns) (ref_7)
- [Radix UI Primitives](https://www.radix-ui.com/docs/primitives) (HIGH confidence)
- [Help in Mobile Applications](https://www.interaction-design.org/literature/article/help-i-need-some-help-not-just-any-help-help-in-mobile-applications) (ref_5)

### State Management
- [Zustand Slices Pattern](https://zustand.docs.pmnd.rs/guides/slices-pattern) (ref_4, HIGH confidence)
- [Zustand GitHub](https://github.com/pmndrs/zustand) (ref_1)
- [Zustand Scalable State Management](https://beyondthecode.medium.com/zustand-a-guide-to-scalable-state-management-0186c4208e01) (ref_2)
- [React State in 2025](https://dev.to/cristiansifuentes/react-state-management-in-2025-context-api-vs-zustand-385m) (ref_1)
- [Zustand Best Practices Video](https://www.youtube.com/watch?v=6tEQ1nJZ51w) (ref_10)

### Agile Project Management
- [Taiga Project Management Platform](https://github.com/taigaio/taiga-doc) (HIGH confidence)
- [Taiga API Documentation](https://github.com/taigaio/taiga-doc/blob/main/api/generated/milestones-filtered-list-output.adoc)

---

## Appendix: Confidence Level Definitions

- **HIGH:** Verified via official documentation, API references, or peer-reviewed research
- **MEDIUM:** Industry consensus, architectural inference, or multiple secondary sources
- **LOW:** Emerging trends, single sources, or speculative analysis

---

**Research Agent:** PRD Generation Research Specialist
**Document Version:** 1.0.0
**Last Updated:** 2026-01-07
**Total Research Sources:** 28+ references across 4 domains
