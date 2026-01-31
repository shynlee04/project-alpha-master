# Team A/B Coordination Map

**Date**: 2026-01-28
**Purpose**: Define safe zones for EPIC-UXUI-02 to proceed without breaking Team A's backend work
**Status**: COMPLETE

---

## Executive Summary

After comprehensive codebase analysis, I've mapped the boundaries between Team A's active backend work and areas where Team B (UX) can safely proceed with styling.

**Key Finding**: UX tokens exist (`src/styles/design-tokens.css`) but most components don't use them. Team B's work is safe IF they only touch CSS/Tailwind classes - NOT component logic, hooks, or state management.

---

## DO NOT DISTURB Zones (Team A Exclusive)

### Infrastructure Contexts (CRITICAL - Never Touch)

| File | Status | Reason |
|------|--------|--------|
| `src/infrastructure/context/project-context.tsx` | ACTIVE | FSA Handle Lifecycle (CC-01) |
| `src/infrastructure/context/plugin-coordination-context.tsx` | ACTIVE | Cross-plugin coordination |
| `src/routes/$projectId.tsx` | ACTIVE | Unified project route |
| `src/presentation/components/layout/PermissionOverlay.tsx` | ACTIVE | FSA permission restoration |
| `src/infrastructure/events/file-event-bus.ts` | ACTIVE | File change events |
| `src/infrastructure/webcontainer/*.ts` | ACTIVE | WebContainer integration |

### Plugin System (CRITICAL - Never Touch Logic)

| File | Status | Reason |
|------|--------|--------|
| `src/plugins/monaco/MonacoMain.tsx` | ACTIVE | Uses useProjectContext, usePluginCoordinationSafe |
| `src/plugins/notes/NotesPlugin.tsx` | ACTIVE | Uses useProjectContext, useFileEventBus |
| `src/plugins/preview/PreviewMain.tsx` | ACTIVE | Uses useProjectContext, usePluginCoordinationSafe |
| `src/plugins/filetree/FileTreePlugin.tsx` | ACTIVE | Uses useProjectContext, usePluginCoordinationSafe |
| `src/plugins/terminal/TerminalMain.tsx` | ACTIVE | Uses useProjectContext |
| `src/plugins/chat/ChatPlugin.tsx` | ACTIVE | Uses useProjectContext |
| `src/presentation/layouts/PluginLayout.tsx` (315 lines) | ACTIVE | CC-AR-08 will split this |

---

## Questions Answered

### 1. Hub Page (`/`) - Can Team B fully overhaul this?

**VERDICT**: MOSTLY YES (with constraints)

| File | Team B Can Touch | Notes |
|------|------------------|-------|
| `src/routes/index.tsx` | NO | Route definition - keep as-is |
| `src/routes/hub.tsx` | NO | Route definition - keep as-is |
| `src/presentation/components/hub/HubHomePage.tsx` | STYLING ONLY | 541 lines - has Dexie, navigation logic |
| `src/presentation/components/hub/HubHero.tsx` | YES | Pure presentation |
| `src/presentation/components/hub/QuickActionCard.tsx` | YES | Pure presentation |
| `src/presentation/components/hub/RecentProjectsSection.tsx` | STYLING ONLY | Has project navigation |
| `src/presentation/components/hub/WorkspaceBindingDialog.tsx` | STYLING ONLY | Has project/workspace logic |
| `src/presentation/components/hub/ProjectPickerDialog.tsx` | STYLING ONLY | Has navigation logic |
| `src/presentation/components/hub/SummaryCardsGrid.tsx` | YES | Pure presentation |
| `src/presentation/components/hub/ChartsGrid.tsx` | YES | Pure presentation |
| `src/presentation/components/hub/BootSequence.tsx` | YES | Pure presentation |
| `src/presentation/components/hub/ProjectCard.tsx` | YES | Pure presentation |
| `src/presentation/components/hub/TopicCard.tsx` | YES | Pure presentation |

**Safe Styling Targets in Hub**:
- Tailwind classes in JSX
- CSS custom properties (design tokens)
- Component visual structure (not data flow)

---

### 2. Sidebar/Navigation - Who owns this? Can styling proceed?

**VERDICT**: STYLING YES, LOGIC NO

| File | Team B Can Touch | Notes |
|------|------------------|-------|
| `src/presentation/components/layout/MainSidebar.tsx` | STYLING ONLY | 404 lines - has navigation, theme, locale logic |
| `src/presentation/components/layout/MainLayout.tsx` | STYLING ONLY | 85 lines - has layout store integration |
| `src/presentation/components/layout/SidebarWidgets.tsx` | YES | If pure presentation |
| `src/presentation/components/layout/SystemRail.tsx` | STYLING ONLY | Check for backend deps |

**Current Styling in MainSidebar**:
- Uses CVA (class-variance-authority)
- Uses `cn()` for class composition
- 8-bit design tokens already present (`rounded-none`, `shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`)
- Navigation logic uses `useLayoutStore`, `useRecentProjects`, `useNavigate`

---

### 3. Plugin Layout - Team A owns logic, can Team B style the shell?

**VERDICT**: NO - Wait for CC-AR-08

| File | Team B Can Touch | Notes |
|------|------------------|-------|
| `src/presentation/layouts/PluginLayout.tsx` | **NO** | 315 lines - CC-AR-08 will split this |
| `src/presentation/layouts/PluginLayoutStore.ts` | **NO** | State management |
| `src/presentation/layouts/workflow-presets.ts` | **NO** | Preset definitions |

**Reasoning**:
- CC-AR-08 story specifically targets splitting PluginLayout.tsx
- Team B styling now would conflict with that refactor
- After CC-AR-08 completes, resulting smaller components can be styled

---

### 4. Settings Page - Pure UI or backend integration?

**VERDICT**: STYLING YES (carefully)

| File | Team B Can Touch | Notes |
|------|------------------|-------|
| `src/routes/settings.tsx` | STYLING ONLY | 533 lines - mostly UI, some store integration |
| `src/presentation/components/settings/*.tsx` | YES | Check each for backend deps |
| `src/presentation/components/agent/ProviderSettings.tsx` | STYLING ONLY | Has API key logic |
| `src/presentation/components/agent/VaultStatusCard.tsx` | STYLING ONLY | Has vault status logic |
| `src/presentation/components/agent/AgentConfigDialog.tsx` | STYLING ONLY | Has agent creation logic |

**Settings Page Analysis**:
- Uses `useAppStore`, `useLayoutStore`, `useAllProjects`
- Has dialogs: ExportDialog, ImportDialog, SnippetManager, SlashCommandManager, AnalyticsDashboard
- All buttons use Tailwind classes - safe to restyle

---

### 5. Notes Route - Who owns? Can styling proceed?

**VERDICT**: STYLING YES (with extreme care)

| File | Team B Can Touch | Notes |
|------|------------------|-------|
| `src/presentation/components/notes/NotesPage.tsx` | **STYLING ONLY** | 1103 lines - COMPLEX, uses ProjectContext |
| `src/presentation/components/notes/NoteSidebar.tsx` | STYLING ONLY | Has note selection logic |
| `src/presentation/components/notes/NoteEditor.tsx` | **NO** | Uses useProjectContext, FileEventBus |
| `src/presentation/components/notes/NotesMobileLayout.tsx` | YES | Pure layout |
| `src/presentation/components/notes/MarkdownImportDialog.tsx` | STYLING ONLY | Has file sync logic |
| `src/presentation/components/notes/MarkdownExportDialog.tsx` | STYLING ONLY | Has file sync logic |

**NotesPage Analysis**:
- 1103 lines - god component candidate
- Uses: `useProjectContext`, `useFileSyncService`, `useConversationStore`
- Has complex: auto-import logic, event subscriptions, file sync
- Mobile layout: `NotesMobileLayout` component - safe to style

---

## Consolidated Team Boundaries

### Team B CAN TOUCH (Safe Zones)

```
PURE PRESENTATION - FULL STYLING ALLOWED:
src/presentation/components/ui/*.tsx          # UI primitives (button, input, dialog, etc.)
src/presentation/components/hub/HubHero.tsx
src/presentation/components/hub/QuickActionCard.tsx
src/presentation/components/hub/SummaryCardsGrid.tsx
src/presentation/components/hub/ChartsGrid.tsx
src/presentation/components/hub/BootSequence.tsx
src/presentation/components/hub/ProjectCard.tsx
src/presentation/components/hub/TopicCard.tsx
src/presentation/components/hub/TopicPortalCard.tsx
src/presentation/components/hub/WorkspaceBadge.tsx
src/presentation/components/hub/ProjectBadge.tsx
src/presentation/components/hub/ProjectFilter.tsx
src/presentation/components/hub/WorkspaceFilter.tsx
src/presentation/components/hub/ProjectDistribution.tsx
src/presentation/components/hub/WorkspacePieChart.tsx
src/presentation/components/hub/ActivityLineChart.tsx
src/presentation/components/hub/StorageUsageCard.tsx
src/presentation/components/hub/ProjectCountCard.tsx
src/presentation/components/notes/NotesMobileLayout.tsx
src/presentation/components/error/ErrorFallback.tsx
src/presentation/components/error/ErrorMessage.tsx
src/styles/*.css                               # Design tokens, animations

STYLING ONLY - NO LOGIC CHANGES:
src/presentation/components/hub/HubHomePage.tsx     # Tailwind classes only
src/presentation/components/hub/RecentProjectsSection.tsx
src/presentation/components/hub/ProjectPickerDialog.tsx
src/presentation/components/hub/WorkspaceBindingDialog.tsx
src/presentation/components/layout/MainSidebar.tsx
src/presentation/components/layout/MainLayout.tsx
src/routes/settings.tsx
src/presentation/components/notes/NoteSidebar.tsx
src/presentation/components/notes/NotesPage.tsx     # EXTREME CARE - 1103 lines
```

### Team B CANNOT TOUCH (Blocked)

```
ACTIVE TEAM A WORK:
src/infrastructure/context/project-context.tsx
src/infrastructure/context/plugin-coordination-context.tsx
src/routes/$projectId.tsx
src/presentation/components/layout/PermissionOverlay.tsx
src/infrastructure/events/file-event-bus.ts
src/infrastructure/webcontainer/*.ts

PLUGIN SYSTEM (Pending CC-AR-08):
src/presentation/layouts/PluginLayout.tsx
src/presentation/layouts/PluginLayoutStore.ts
src/presentation/layouts/workflow-presets.ts
src/plugins/**/*.tsx                            # All plugins use ProjectContext

BACKEND-HEAVY COMPONENTS:
src/presentation/components/notes/NoteEditor.tsx  # Uses ProjectContext, FileEventBus
```

### Needs Coordination (Sync Required)

```
REQUIRE TEAM A SIGN-OFF:
src/presentation/components/layout/IDELayoutMain.tsx
src/presentation/components/ide/*.tsx              # Most use ProjectContext
src/presentation/components/workspace/*.tsx        # Sync/permission logic
src/presentation/components/chat/*.tsx             # Agent/conversation logic
```

---

## Styling Guidelines for Team B

### Safe Patterns (DO)

```css
/* Tailwind classes - ALWAYS SAFE */
className="bg-background text-foreground border-border"

/* CVA variants - SAFE to modify variants */
const buttonVariants = cva('...base classes...', { variants: {...} })

/* CSS custom properties - SAFE */
style={{ color: 'var(--primary)', background: 'var(--background)' }}

/* Class composition with cn() - SAFE */
className={cn('base-classes', conditionalClass && 'conditional')}
```

### Unsafe Patterns (DON'T)

```tsx
// DON'T change hooks or their parameters
const { gateway, project } = useProjectContext(); // DON'T TOUCH

// DON'T change event handlers
onClick={() => navigate({ to: '/$projectId', params: {...} })} // DON'T TOUCH

// DON'T change state management
const [isDialogOpen, setIsDialogOpen] = useState(false); // DON'T TOUCH

// DON'T change data flow
const projects = useLiveQuery(() => db.projects.toArray()); // DON'T TOUCH
```

---

## Token Usage Analysis

### Current State

| Token Category | Defined | Used | Gap |
|----------------|---------|------|-----|
| Colors | `src/styles/design-tokens.css` | Partially | Many components use hardcoded Tailwind colors |
| Spacing | Tailwind defaults | Inconsistent | Some use px, some use Tailwind scale |
| Shadows | Design tokens exist | `shadow-pixel-*` classes exist | Components use inline shadows |
| Animations | `src/styles/animations.css` | Partially | Most animations are custom |
| Typography | Font families defined | Consistent | Good font-family usage |

### Token Migration Priority

1. **Button.tsx** - Already using tokens (good example)
2. **MainSidebar.tsx** - Uses hardcoded `zinc-*` colors
3. **HubHomePage.tsx** - Mixed token usage
4. **Settings page** - Uses `shadow-[2px_2px_0px_rgba(0,0,0,0.5)]` - should use token

---

## Recommendations

### For EPIC-UXUI-02

1. **Start with UI Primitives** (`src/presentation/components/ui/`)
   - Already isolated, pure presentation
   - Button.tsx is a good reference for token usage
   - Safe to fully restyle

2. **Hub Page Components** (Safe batch)
   - HubHero, QuickActionCard, SummaryCardsGrid, ChartsGrid
   - All pure presentation
   - Can apply tokens without coordination

3. **Defer Layout Components**
   - MainSidebar, MainLayout - coordinate with Team A
   - PluginLayout - wait for CC-AR-08

4. **Avoid Notes/IDE Deep Components**
   - NoteEditor, MonacoMain, etc. use ProjectContext
   - High risk of breaking backend integration

### Git Workflow

```bash
# Safe zone branch
git checkout -b team-b/uxui-02-ui-primitives

# ONLY touch these paths:
src/presentation/components/ui/
src/presentation/components/hub/*.tsx  # Styling only
src/styles/*.css
```

---

## Validation Checklist Before Merge

- [ ] TypeScript: `pnpm tsc --noEmit` passes
- [ ] No changes to hooks or state management
- [ ] No changes to navigation logic
- [ ] No changes to ProjectContext usage
- [ ] No changes to file sync logic
- [ ] Token usage consistent with `design-tokens.css`
- [ ] 8-bit design compliance (rounded-none, pixel shadows)
- [ ] Light/dark theme variables work
- [ ] Mobile responsive (44px touch targets)

---

**Generated by**: architect-ext
**Analysis Duration**: Comprehensive codebase review
**Files Analyzed**: ~100+ components
