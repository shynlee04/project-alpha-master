# Handoff: Home Page Layout Architecture Redesign

**Date**: 2025-12-27T02:40:00Z
**From**: BMAD Master Orchestrator
**To**: BMAD Architect
**Priority**: P0 - CRITICAL

---

## Context Summary

The home page layout architecture is fundamentally broken and requires complete redesign. Previous attempts to fix trivial issues (like missing imports) completely missed the root cause.

### Current State (BROKEN)

**Route Structure** ([`src/routes/index.tsx`](src/routes/index.tsx:1-11)):
```typescript
<HubLayout>
  <HubHomePage />
</HubLayout>
```

**Layout Components**:
- [`HubLayout.tsx`](src/components/layout/HubLayout.tsx:1-63): Header + HubSidebar + main content
- [`Header.tsx`](src/components/Header.tsx:1-127): Has its OWN mobile menu sidebar (lines 47-124)
- [`HubSidebar.tsx`](src/components/hub/HubSidebar.tsx): Separate sidebar component
- [`HubHomePage.tsx`](src/components/hub/HubHomePage.tsx:1-249): Topic-based onboarding + portal cards + recent projects

### Critical Problems

1. **DUPLICATE NAVIGATION SYSTEMS**:
   - Header has mobile menu sidebar (lines 47-124 in Header.tsx)
   - HubLayout has HubSidebar (line 43 in HubLayout.tsx)
   - These are TWO separate, conflicting navigation systems

2. **LAYOUT STRUCTURE WRONG**:
   - Current: Header (top) + HubSidebar (left) + main content
   - Expected: Collapsible sidebar with icons (centering project management) + topic-based onboarding + portal cards

3. **ROUTING NOT ALIGNED WITH VISION**:
   - Navigation links in Header don't match unified sidebar concept
   - Portal cards navigate to routes that may not exist
   - No clear hierarchy or user journey

4. **COMPONENTS NOT PROPERLY WIRED**:
   - Header's mobile menu is separate from HubSidebar
   - No state coordination between navigation systems
   - Layout doesn't center on project management as intended

---

## User's Vision (From Feedback)

> "Meaning I prefer something centering (hence the main sidebar that is collapsible with icons -> that at the home page it will be topic-based onboarding; quick actions and portal cards to other sections, centering the project managements while the other tabs bring the user to other interfaces from the IDE-workspace to the agent management center, to knowledge synthesis hub etc. And with the same mindset expecting to have an ease of mind to ready to reach to the relational ui or features without a disruptive workflows"

**Key Requirements**:
1. **Collapsible sidebar with icons** (main navigation)
2. **Topic-based onboarding** at home page
3. **Quick actions and portal cards** to other sections
4. **Centering project management** as primary focus
5. **Easy access to relational UI/features** without disruptive workflows
6. **Unified navigation** (not duplicate systems)

---

## Task Specification

### Acceptance Criteria

1. **Analyze Current Architecture**:
   - Document all navigation components and their relationships
   - Identify duplicate/conflicting systems
   - Map current routing structure
   - Identify missing routes

2. **Design Unified Layout Architecture**:
   - Single collapsible sidebar with icons (main navigation)
   - Proper integration with Header (remove duplicate mobile menu)
   - Clear hierarchy: Home → Projects → IDE → Agents → Knowledge → Settings
   - State management for sidebar collapse/expand

3. **Redesign Home Page Layout**:
   - Topic-based onboarding section
   - Quick actions (open folder, create project)
   - Portal cards to other sections (IDE, Agents, Knowledge, Settings)
   - Recent projects section (centering project management)
   - Proper spacing, typography, and visual hierarchy

4. **Define Routing Structure**:
   - Map all routes needed for the application
   - Ensure all portal cards navigate to valid routes
   - Define route hierarchy and navigation flow
   - Document route parameters and state

5. **Create Technical Specifications**:
   - Component architecture diagram
   - State management strategy
   - Routing configuration
   - Integration points with existing systems (Dexie, WebContainer, etc.)

### Constraints

1. **Preserve Existing Functionality**:
   - Keep Dexie project store integration
   - Keep File System Access API integration
   - Keep WebContainer integration
   - Keep i18next translations

2. **Follow Project Patterns**:
   - Use Zustand for state management
   - Use TanStack Router for routing
   - Use 8-bit design system (dark theme, pixel-perfect styling)
   - Follow naming conventions and file structure

3. **MCP Research Protocol**:
   - Use Context7 for TanStack Router documentation
   - Use Deepwiki for TanStack Router patterns
   - Use Tavily/Exa for 2025 best practices in React layouts
   - Use Repomix to analyze current codebase structure

4. **No Breaking Changes**:
   - Don't remove existing components without migration plan
   - Ensure backward compatibility with existing routes
   - Preserve all existing data and state

---

## Current Workflow Status

**From** [`_bmad-output/sprint-artifacts/sprint-status-consolidated.yaml`](_bmad-output/sprint-artifacts/sprint-status-consolidated.yaml):

- **Active Epic**: MVP (AI Coding Agent Vertical Slice)
- **Current Story**: MVP-1 (Agent Configuration & Persistence) - IN_PROGRESS
- **Platform**: Platform A (Antigravity)
- **Next Priority**: Complete MVP-1 → MVP-2 → MVP-3 (sequential)

**Note**: This home page layout redesign is a P0 architectural issue that must be resolved before continuing with MVP stories. The current layout blocks proper user journey and navigation.

---

## References

### Related Files
- [`src/routes/index.tsx`](src/routes/index.tsx) - Home page route
- [`src/components/layout/HubLayout.tsx`](src/components/layout/HubLayout.tsx) - Current layout wrapper
- [`src/components/Header.tsx`](src/components/Header.tsx) - Header with duplicate navigation
- [`src/components/hub/HubSidebar.tsx`](src/components/hub/HubSidebar.tsx) - Sidebar component
- [`src/components/hub/HubHomePage.tsx`](src/components/hub/HubHomePage.tsx) - Home page content
- [`src/lib/state/hub-store.ts`](src/lib/state/hub-store.ts) - Hub state management

### Architecture Documents
- [`AGENTS.md`](AGENTS.md) - Project-specific dev patterns
- [`_bmad-output/state-management-audit-2025-12-24.md`](_bmad-output/state-management-audit-2025-12-24.md) - State architecture
- [`_bmad-output/architecture/mcp-research-protocol-mandatory.md`](_bmad-output/architecture/mcp-research-protocol-mandatory.md) - MCP research protocol

### User Feedback
- Original task prompt (2025-12-26) - Detailed feedback about governance, sprint planning, and architectural issues
- "WHAT THE FUCK HAVE YOU DONE CHECK WHAT ROUTED AT HOME PAGE" - User's angry response to trivial import fix

---

## Next Agent Assignment

**Mode**: `@bmad-bmm-architect`
**Task**: Home Page Layout Architecture Redesign
**Output Location**: `_bmad-output/architecture/homepage-layout-redesign-2025-12-27.md`

**Return via**: Report to @bmad-core-bmad-master with completion summary including:
1. Architecture analysis findings
2. Proposed layout design (with diagrams if possible)
3. Routing structure specification
4. Component architecture
5. State management strategy
6. Migration plan from current to new architecture
7. Implementation recommendations

---

**CRITICAL**: This is NOT a trivial fix. The entire home page layout architecture needs to be redesigned from scratch to match the user's vision. Do NOT attempt to patch the current broken system.