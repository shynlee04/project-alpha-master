# **3. Unified IDE Workspace with Collapsible Sidebar**

### **3.1 IDE Layout Enhancements**

**Current Issue:** Fixed layout, no transitions between workspaces

**Enhanced Layout:**

```
┌─────────────────────────────────────────────────────────────┐
│  [☰] via-gent/c6bb2119... [Auto-sync: On] [Sync Now] [⚙]   │
├─────────────────────────────────────────────────────────────┤
│ │                   │                 │                     │
│ │  Sidebar (48px)   │  Editor Area    │  Preview/Chat      │
│ │  [Collapsible]    │                 │  (Resizable)       │
│ │                   │                 │                     │
│ │  [📁] Files       │  Monaco Editor  │  Live Preview      │
│ │  [🔍] Search      │                 │                     │
│ │  [🤖] Agents      │                 │                     │
│ │  [🐙] Git         │                 │                     │
│ │  [⚙] Settings     │                 │                     │
│ │  ────────────     │                 │  OR                │
│ │  [💬] Chat        │                 │                     │
│ │  [📊] Analytics   │                 │  Agent Chat        │
│ │  [🎨] Assets      │                 │                     │
│ │                   │                 │                     │
│ └───────────────────┴─────────────────┴─────────────────────┘
│ │  Terminal (Bottom, Collapsible)                          │
└─────────────────────────────────────────────────────────────┘
```

***

### **3.2 Icon Sidebar (Left) - Collapsible**

**Inspiration:** VS Code Activity Bar

**States:**
1. **Collapsed (48px):** Show icons only
2. **Expanded (280px):** Show icons + content panel

**Icons with Tooltips:**

```typescript
const sidebarIcons = [
  { icon: <Files />, label: 'Explorer', tooltip: 'Cmd+Shift+E', panel: 'file-tree' },
  { icon: <Search />, label: 'Search', tooltip: 'Cmd+Shift+F', panel: 'search' },
  { icon: <Bot />, label: 'Agents', tooltip: 'Cmd+Shift+A', panel: 'agents', badge: 3 },
  { icon: <GitBranch />, label: 'Source Control', tooltip: 'Cmd+Shift+G', panel: 'git' },
  { icon: <Settings2 />, label: 'Settings', tooltip: 'Cmd+,', panel: 'settings' },
  // --- Divider ---
  { icon: <MessageSquare />, label: 'Chat', tooltip: 'Cmd+L', panel: 'chat' },
  { icon: <BarChart3 />, label: 'Analytics', tooltip: null, panel: 'analytics' },
  { icon: <Palette />, label: 'Assets', tooltip: 'Cmd+Shift+P', panel: 'assets' },
];
```

**Interaction:**
- **Click icon:** Toggle panel (if same icon, close; if different, switch)
- **Hover:** Show tooltip with keyboard shortcut
- **Badge:** Show notification count (e.g., 3 pending agent approvals)

***

### **3.3 Dynamic Content Panels**

#### **Panel: File Explorer (📁)**

```
┌──────────── EXPLORER ────────────┐
│  via-gent                         │
│  ▼ src                            │
│    ▼ components                   │
│      ▶ ide                        │
│      ▶ layout                     │
│      │ Button.tsx          M     │
│      │ Input.tsx                 │
│    ▼ routes                       │
│      │ _index.tsx          M     │
│      ▶ workspace                  │
│    ▶ lib                          │
│  ▶ public                         │
│  ▶ node_modules                   │
│    package.json                   │
│    tsconfig.json                  │
│                                   │
│  [+ New File] [+ New Folder]      │
└───────────────────────────────────┘
```

**Features:**
- **Git status indicators:** M (modified), A (added), D (deleted)
- **Context menu:** Right-click for rename, delete, reveal in finder
- **Drag-and-drop:** Move files between folders

***

#### **Panel: Agent Management (🤖)**

```
┌──────────── AGENTS ──────────────┐
│  Active Agents (3)                │
│                                   │
│  🤖 Coder                         │
│  Status: ● Working                │
│  Task: "Add login form"           │
│  Progress: ━━━━━━░░ 75%           │
│  [Pause] [View Details]           │
│                                   │
│  ✅ Validator                     │
│  Status: ⏸ Idle                   │
│  Last run: 5m ago                 │
│  [Resume] [View Logs]             │
│                                   │
│  📋 Planner                       │
│  Status: ○ Disabled               │
│  [Enable]                         │
│                                   │
│  ─────────────────────────        │
│  [+ Assign New Agent]             │
│  [⚙ Configure All]                │
└───────────────────────────────────┘
```

**Features:**
- **Real-time status** updates via WebSocket
- **Quick actions** (Pause, Resume, View)
- **Assign new agent** to current project

***
