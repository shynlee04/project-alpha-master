# Epic 26: Agent Management Dashboard (NEW - 2025-12-21)

**Goal:** Central hub for configuring, monitoring, and managing AI agents.

**Priority:** 🟠 P1 | **Stories:** 6 | **Points:** 34 | **Duration:** 2 weeks  
**Source:** ux-specification-2025-12-21.md

### Rationale

As AI becomes central to the IDE, users need visibility and control over agent behavior, LLM providers, and multi-agent workflows.

### Dependencies

- Epic 25: AI Foundation Sprint

### Stories

| Story | Title | Points |
|-------|-------|--------|
| 26-1 | Dashboard Layout and Navigation | 5 |
| 26-2 | Agent List & Configuration Forms | 5 |
| 26-3 | Tool Registry UI | 5 |
| 26-4 | Workflow Visual Editor | 8 |
| 26-5 | LLM Provider Management | 5 |
| 26-6 | Analytics Dashboard | 5 |

### Story 26-1: Dashboard Layout and Navigation

As a **user**,
I want **a dedicated agent management interface**,
So that **I can configure and monitor AI helpers**.

**Acceptance Criteria:**
- `/agents` route with sidebar navigation
- Sections: Overview, Agents, Tools, Workflows, Providers, Analytics
- Breadcrumb navigation
- Responsive layout (1024px+)

---

### Story 26-2: Agent List & Configuration Forms

As a **user**,
I want **to view and configure available agents**,
So that **I can customize their behavior**.

**Acceptance Criteria:**
- List view of agents (Orchestrator, Coder, Validator, etc.)
- Click to expand configuration form
- Edit system prompts, temperatures, token limits
- Save configuration to IndexedDB

---

### Story 26-3: Tool Registry UI

As a **user**,
I want **to see and manage available tools**,
So that **I know what agents can do**.

**Acceptance Criteria:**
- Grid view of tools with icons
- Tool detail: name, description, parameters, permissions
- Toggle to enable/disable tools per agent
- Search and filter tools

---

### Story 26-4: Workflow Visual Editor

As a **user**,
I want **to create multi-agent workflows visually**,
So that **I can orchestrate complex development tasks**.

**Acceptance Criteria:**
- Canvas with drag-and-drop nodes
- Node types: Start, Agent, Condition, Merge, End
- Connect nodes with edges
- Save/load workflow definitions
- Execute workflow button

---

### Story 26-5: LLM Provider Management

As a **user**,
I want **to configure multiple LLM providers**,
So that **I can switch between models or use different ones for different tasks**.

**Acceptance Criteria:**
- Add provider: Gemini, OpenAI, Anthropic (connectors)
- BYOK: Enter and validate API keys
- Set default provider per agent type
- API key encryption in IndexedDB

---

### Story 26-6: Analytics Dashboard

As a **user**,
I want **to see AI usage statistics**,
So that **I can understand costs and effectiveness**.

**Acceptance Criteria:**
- Token usage over time (chart)
- Tool execution counts
- Success/failure rate per agent
- Time to completion metrics

---
