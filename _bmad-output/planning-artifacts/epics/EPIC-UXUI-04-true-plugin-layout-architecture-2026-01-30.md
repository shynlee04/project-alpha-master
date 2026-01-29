# ═════════════════════════════════════════════════════════════════════════════
# EPIC-UXUI-04: True Plugin Layout Architecture
# CORRECTIVE EPIC - Fixes EPIC-UXUI-03 Misalignment
# Created: 2026-01-30T14:30:00+07:00
# Status: INITIATED
# Priority: P0 - BLOCKS Phase 1A Completion
# ═════════════════════════════════════════════════════════════════════════════

## 📋 EPIC METADATA

```yaml
epic_id: EPIC-UXUI-04
epic_name: "True Plugin Layout Architecture"
type: corrective
priority: P0
status: INITIATED
created_at: "2026-01-30T14:30:00+07:00"
created_by: ext-master
rationale: |
  EPIC-UXUI-03 created infrastructure that does NOT match user requirements.
  Current implementation: Single ActivityBar + FloatingDocker
  Required implementation: 3 Activity Bars (left, main-top, right) + Docker
  
  This epic CORRECTS the architecture to match the specified UX vision.
  
blocks: Phase 1A completion
depends_on: 
  - EPIC-0.6 (Plugin Coordination Layer - COMPLETE)
  - EPIC-UXUI-03 (infrastructure to be corrected)
```

## 🎯 PROBLEM STATEMENT

### Current State (WRONG):
- ❌ Single ActivityBar with all plugins visible
- ❌ FloatingPluginDocker as separate floating panel
- ❌ Multiple plugins visible simultaneously
- ❌ No single-instance enforcement
- ❌ No toggle behavior between plugins
- ❌ Broken responsive grid

### Required State (CORRECT):
- ✅ **3 Activity Bars**: Left (0.5), Main-Top (4), Right (2.5)
- ✅ **Plugin Docker**: Source of plugins, not destination
- ✅ **Single plugin visible per bar** (toggle behavior)
- ✅ **Drag from docker TO bars** (not dump all on bars)
- ✅ **Max 3 plugins per bar** (9 total max)
- ✅ **Grid ratio**: [0.5:0.5:2:4:2.5:0.5]
- ✅ **Global sidebar**: Auto-collapse with icons + tooltips

## 📐 ARCHITECTURE SPECIFICATION

### Grid Layout Structure

```
Desktop Grid Ratio: [0.5:0.5:2:4:2.5:0.5]

┌─────────────────────────────────────────────────────────────┐
│ 0.5 │ 0.5 │     2     │         4          │    2.5   │0.5 │
│Glob │ Act │  Plugin   │      Main-Top      │  Plugin  │Act │
│Side │ Bar │  Panel    │    Activity Bar    │  Panel   │Bar │
│(col)│(L)  │  (File)   │    (Notes default) │  (Chat)  │(R) │
├─────┴─────┴───────────┴────────────────────┴──────────┴────┤
│                    Terminal (optional)                      │
└─────────────────────────────────────────────────────────────┘

Where:
- 0.5 (Global Sidebar): Collapsible, icons + tooltips
- 0.5 (Activity Bar L): Left plugins (max 3)
- 2 (Plugin Panel L): File-tree-project-management (default)
- 4 (Main-Top Activity Bar): Notes plugin (default), switchable
- 2.5 (Plugin Panel R): Agent-chat-cascade (default)
- 0.5 (Activity Bar R): Right plugins (max 3)
```

### Plugin System Rules

```yaml
plugin_rules:
  single_instance: true
    description: "Never two same instances across all 3 bars"
    
  always_loaded:
    - file_tree_project_management
    - agent_chat_cascade_thread_management
    description: "Must be in one of the 3 bars, but can move between bars"
    
  default_assignments:
    left_bar: [file_tree_project_management]
    main_top_bar: [notes]
    right_bar: [agent_chat_cascade_thread_management]
    
  max_per_bar: 3
  max_total: 9
  
  visibility_rule: "Only 1 plugin visible per bar at a time"
  toggle_behavior: "Single click/tap toggles between plugins in same bar"
  
  docker_behavior:
    source: true
    destination: false
    description: "Plugins dragged FROM docker TO bars, not vice versa"
    
  device_filtering:
    pc_users: "All plugins available (including IDE: Monaco, Terminal)"
    non_pc: "IDE plugins hidden (no Monaco, no Terminal)"
```

### Responsive Variants

```yaml
responsive_layouts:
  desktop:
    min_width: 1024px
    grid: [0.5:0.5:2:4:2.5:0.5]
    features: [all_plugins, drag_drop, keyboard_shortcuts]
    
  tablet_landscape:
    min_width: 768px
    max_width: 1023px
    grid: [0.5:0.5:3:4:2:0.5]
    features: [all_plugins, touch_friendly]
    
  tablet_portrait:
    min_width: 600px
    max_width: 767px
    layout: single_panel
    features: [bottom_nav, swipe_gestures]
    
  mobile:
    max_width: 599px
    layout: single_panel
    features: [bottom_nav, full_screen_plugins]
```

## 📚 STORIES (RE-SEQUENCED: Archive-First Approach)

**Execution Model**: Single Team (Sequential, Not Parallel)
**Governance**: Absolute - No new code until old code archived
**Tracking**: Daily checkpoints, full audit trail

### Story 1: UXUI-04-01 - ARCHIVE Phase: Inventory & Cleanup
**Status**: READY
**Team**: Single Team
**Effort**: 4-6h
**Depends on**: None
**Gate**: Must complete before ANY new code

**Requirements**:
- Inventory ALL current layout components
- Identify files to archive vs. files to refactor
- Create archive manifest with reasons
- Move old components to `_bmad-ext/.archive/epic-uxui-04/`
- Update all imports to remove archived references
- Verify build passes after archival
- Document what was archived and why

**Acceptance Criteria**:
- [ ] Archive manifest created (`_bmad-output/tracking/EPIC-UXUI-04-ARCHIVE-MANIFEST.md`)
- [ ] All old layout components moved to archive
- [ ] No references to archived components remain
- [ ] Build passes (0 errors)
- [ ] Archive verification report generated
- [ ] **GATE**: Review and approval before proceeding

---

### Story 2: UXUI-04-02 - Global Sidebar Auto-Collapse
**Status**: READY
**Team**: Single Team
**Effort**: 3-4h
**Depends on**: UXUI-04-01 (Archive complete)
**Checkpoint**: Daily status update required

**Requirements**:
- Implement collapsible global sidebar
- Collapsed state: Icons only (48px) with tooltips
- Expanded state: Full sidebar with labels
- Auto-collapse on mobile/tablet
- Persist state in localStorage
- Smooth CSS transition (respects prefers-reduced-motion)

**Acceptance Criteria**:
- [ ] Sidebar collapses to 48px width
- [ ] Tooltips appear on hover (desktop) / tap (mobile)
- [ ] State persists across sessions
- [ ] Impacts main interface sizing correctly
- [ ] 8-bit design compliance (sharp corners, pixel shadows)
- [ ] **DAILY UPDATE**: Log progress to tracking registry

---

### Story 3: UXUI-04-03 - Three Activity Bar System
**Status**: READY
**Team**: Single Team
**Effort**: 6-8h
**Depends on**: UXUI-04-02
**Checkpoint**: Daily status update required

**Requirements**:
- Create 3 distinct ActivityBar components:
  1. `ActivityBarLeft` (0.5 width, vertical)
  2. `ActivityBarMainTop` (horizontal, sits above main panel)
  3. `ActivityBarRight` (0.5 width, vertical)
- Each bar displays plugin icons only
- Max 3 icons per bar
- Click/tap toggles plugin visibility in associated panel
- Active plugin highlighted
- Drag-drop support from docker

**Acceptance Criteria**:
- [ ] 3 bars render in correct positions
- [ ] Each bar shows max 3 plugin icons
- [ ] Single click toggles plugin in associated panel
- [ ] Only 1 plugin visible per panel at a time
- [ ] Visual indicator for active plugin
- [ ] 8-bit styling (sharp corners, no blur)
- [ ] **DAILY UPDATE**: Log progress to tracking registry

---

### Story 4: UXUI-04-04 - Plugin Docker Component
**Status**: READY
**Team**: Single Team
**Effort**: 4-6h
**Depends on**: UXUI-04-03
**Checkpoint**: Daily status update required

**Requirements**:
- Create `PluginDocker` component
- Shows ALL available plugins (filtered by device type)
- Plugins already in activity bars are HIDDEN from docker
- Drag source for activity bars
- Device-aware filtering (hide IDE plugins for non-PC)
- 8-bit styled panel with pixel shadows

**Acceptance Criteria**:
- [ ] Docker shows all available plugins
- [ ] Plugins in bars are hidden from docker
- [ ] Drag-and-drop to activity bars works
- [ ] Device filtering works (PC vs non-PC)
- [ ] Visual feedback during drag
- [ ] 8-bit design compliance
- [ ] **DAILY UPDATE**: Log progress to tracking registry

---

### Story 5: UXUI-04-05 - Plugin Panel System
**Status**: READY
**Team**: Single Team
**Effort**: 6-8h
**Depends on**: UXUI-04-04
**Checkpoint**: Daily status update required

**Requirements**:
- Create 3 PluginPanel components:
  1. `PluginPanelLeft` (2 width) - associated with ActivityBarLeft
  2. `PluginPanelMain` (4 width) - associated with ActivityBarMainTop
  3. `PluginPanelRight` (2.5 width) - associated with ActivityBarRight
- Each panel renders the active plugin for that bar
- Plugin switching via activity bar toggle
- Single instance enforcement across all panels
- Preserve plugin state when hidden

**Acceptance Criteria**:
- [ ] 3 panels render with correct widths
- [ ] Panels show active plugin from associated bar
- [ ] Toggle behavior switches plugins correctly
- [ ] Plugin state preserved when hidden
- [ ] Single instance enforced (no duplicates)
- [ ] Smooth transitions between plugins
- [ ] **DAILY UPDATE**: Log progress to tracking registry

---

### Story 6: UXUI-04-06 - Drag-Drop System
**Status**: READY
**Team**: Single Team
**Effort**: 4-6h
**Depends on**: UXUI-04-05
**Checkpoint**: Daily status update required

**Requirements**:
- Implement drag-drop from docker to activity bars
- Implement drag-drop between activity bars
- Enforce single-instance constraint
- Enforce max-3-per-bar constraint
- Visual feedback during drag (ghost, drop zones)
- Touch support for mobile/tablet

**Acceptance Criteria**:
- [ ] Drag from docker to bar works
- [ ] Drag between bars works
- [ ] Cannot drop duplicate plugin
- [ ] Cannot exceed 3 plugins per bar
- [ ] Visual feedback during drag
- [ ] Touch gestures work on mobile
- [ ] **DAILY UPDATE**: Log progress to tracking registry

---

### Story 7: UXUI-04-07 - Responsive Layout Implementation
**Status**: READY
**Team**: Single Team
**Effort**: 6-8h
**Depends on**: UXUI-04-06
**Checkpoint**: Daily status update required

**Requirements**:
- Implement desktop layout [0.5:0.5:2:4:2.5:0.5]
- Implement tablet landscape layout
- Implement tablet portrait (single panel + bottom nav)
- Implement mobile (single panel + bottom nav)
- Breakpoint detection and switching
- Preserve plugin assignments across breakpoints

**Acceptance Criteria**:
- [ ] Desktop layout matches spec
- [ ] Tablet layouts work correctly
- [ ] Mobile layout with bottom nav
- [ ] Smooth breakpoint transitions
- [ ] Plugin assignments preserved
- [ ] No layout jank during resize
- [ ] **DAILY UPDATE**: Log progress to tracking registry

---

### Story 8: UXUI-04-08 - Plugin Coordination Integration
**Status**: READY
**Team**: Single Team
**Effort**: 4-6h
**Depends on**: UXUI-04-07
**Checkpoint**: Daily status update required

**Requirements**:
- Wire EPIC-0.6 PluginCoordinationContext to new layout
- Implement write-lock mechanism per plugin
- File open tracking across plugins
- Plugin capability interface enforcement
- Graceful fallback for unsupported operations

**Acceptance Criteria**:
- [ ] Coordination context integrated
- [ ] Write-lock prevents concurrent edits
- [ ] File open tracking works
- [ ] Plugin capabilities enforced
- [ ] Fallbacks handle edge cases
- [ ] **DAILY UPDATE**: Log progress to tracking registry

---

### Story 9: UXUI-04-09 - Persistence & State Management
**Status**: READY
**Team**: Single Team
**Effort**: 3-4h
**Depends on**: UXUI-04-08
**Checkpoint**: Daily status update required

**Requirements**:
- Persist plugin assignments to activity bars
- Persist active plugin per bar
- Persist sidebar collapse state
- Persist per-project (keyed by projectId)
- Restore state on page reload
- Handle missing/corrupted state gracefully

**Acceptance Criteria**:
- [ ] Plugin assignments persisted
- [ ] Active plugins remembered
- [ ] Sidebar state persisted
- [ ] Per-project isolation
- [ ] Graceful degradation
- [ ] State validation on load
- [ ] **DAILY UPDATE**: Log progress to tracking registry

---

### Story 10: UXUI-04-10 - FINAL VERIFICATION & Integration
**Status**: READY
**Team**: Single Team
**Effort**: 4-6h
**Depends on**: UXUI-04-09
**Checkpoint**: Final review required

**Requirements**:
- Full integration testing
- E2E validation of all user flows
- Test drag-drop, toggle, responsive layouts
- Test plugin coordination
- Test persistence
- Performance validation (no jank, 60fps)

**Acceptance Criteria**:
- [ ] All user flows work end-to-end
- [ ] Drag-drop tested across devices
- [ ] Toggle behavior verified
- [ ] Responsive layouts tested
- [ ] Persistence verified
- [ ] Performance meets targets
- [ ] No console errors
- [ ] **FINAL REPORT**: Complete work log submitted

---

## 📊 EPIC TIMELINE (Single Team - Sequential)

```
Week 1: ARCHIVE & FOUNDATION
  Day 1:    UXUI-04-01 - Archive Phase (Inventory & Cleanup)
            [GATE: Approval required before proceeding]
  Day 2:    UXUI-04-02 - Global Sidebar Auto-Collapse
  Day 3:    UXUI-04-03 - Three Activity Bar System
  Day 4:    UXUI-04-04 - Plugin Docker Component
  Day 5:    UXUI-04-05 - Plugin Panel System

Week 2: FEATURES & INTEGRATION
  Day 6:    UXUI-04-06 - Drag-Drop System
  Day 7:    UXUI-04-07 - Responsive Layout Implementation
  Day 8:    UXUI-04-08 - Plugin Coordination Integration
  Day 9:    UXUI-04-09 - Persistence & State Management
  Day 10:   UXUI-04-10 - FINAL VERIFICATION & Integration
            [GATE: Final review and approval]

Total Effort: 42-59 hours (2 weeks with SINGLE TEAM)
Governance: Daily checkpoints, full audit trail
```

---

## 📋 GOVERNANCE & TRACKING PROTOCOL

### Daily Checkpoint Requirements

**Every day at end of work, the team MUST:**

1. **Update Tracking Registry** (`_bmad-output/tracking/EPIC-UXUI-04-DAILY-LOG.md`)
   - Stories completed today
   - Lines of code changed
   - Files created/modified/archived
   - Blockers encountered
   - Next day plan

2. **Update LOOP_STATE.yaml**
   - Current story status
   - Progress percentage
   - Any issues or blockers

3. **Run Verification**
   - `pnpm typecheck:fast` (must pass)
   - `pnpm governance` (must pass)
   - Build verification

4. **Commit Work**
   - All changes committed
   - Clear commit messages
   - Reference story ID (e.g., "UXUI-04-02: Add Global Sidebar")

### Archive-First Enforcement

**STRICT RULE**: No new code files created until:
- ✅ Archive manifest complete
- ✅ Old components moved to archive
- ✅ All imports updated
- ✅ Build passes
- ✅ **APPROVAL GRANTED**

### Single Team Execution

**NO PARALLEL WORK**: 
- One story at a time
- Complete story N before starting story N+1
- Full handoff documentation between stories
- No context switching

### Quality Gates

**Between each story:**
1. Code review (clean code standards)
2. Build verification
3. Status update
4. **Approval to proceed**

### Tracking Artifacts

**Required Documents** (created at story start, updated daily):
1. `EPIC-UXUI-04-ARCHIVE-MANIFEST.md` - What was archived
2. `EPIC-UXUI-04-DAILY-LOG.md` - Daily progress
3. `EPIC-UXUI-04-COMPONENT-REGISTRY.md` - New components
4. `EPIC-UXUI-04-FINAL-REPORT.md` - Summary at completion

## 🎯 SUCCESS CRITERIA

- [ ] 3 Activity Bars render correctly with [0.5:0.5:2:4:2.5:0.5] ratio
- [ ] Plugin Docker shows available plugins (filtered by device)
- [ ] Drag-drop works from docker to bars
- [ ] Single plugin visible per bar (toggle behavior)
- [ ] Max 3 plugins per bar enforced
- [ ] Single instance enforced across all bars
- [ ] Global sidebar auto-collapses with tooltips
- [ ] Responsive layouts work (desktop, tablet, mobile)
- [ ] Plugin coordination works (write-lock, file tracking)
- [ ] State persists across sessions
- [ ] Old components archived
- [ ] All acceptance criteria met
- [ ] Build passes, no TypeScript errors
- [ ] Performance: 60fps, no jank

## 📝 NOTES

### Why This Epic is Necessary

EPIC-UXUI-03 created:
- `MainContentRenderer` - switches between Notes/Monaco/Preview
- `FloatingPluginDocker` - floating panel for plugins
- `ActivityBar` - single bar with all plugins

**Problem**: This is a generic plugin system, NOT the specific 3-bar architecture specified.

EPIC-UXUI-04 creates:
- `ActivityBarLeft`, `ActivityBarMainTop`, `ActivityBarRight` - 3 distinct bars
- `PluginDocker` - source of plugins (not floating destination)
- `PluginPanelLeft`, `PluginPanelMain`, `PluginPanelRight` - associated panels
- Proper drag-drop with constraints
- Correct responsive behavior

**Result**: Matches your exact UX vision.

### Dependencies

- **EPIC-0.6**: Plugin Coordination Layer (COMPLETE) - provides context
- **EPIC-UXUI-03**: Infrastructure to be corrected - some components may be repurposed
- **Design System**: 8-bit tokens from EPIC-UXUI-01 (COMPLETE)

### Risk Mitigation

1. **Risk**: Breaking existing functionality
   - **Mitigation**: Archive old components, don't delete immediately
   
2. **Risk**: Plugin coordination complexity
   - **Mitigation**: EPIC-0.6 already complete, just needs wiring
   
3. **Risk**: Responsive layout performance
   - **Mitigation**: Use CSS Grid, avoid JS layout calculations
   
4. **Risk**: State migration
   - **Mitigation**: Graceful fallback if old state format detected

---

**Created by**: ext-master
**Created at**: 2026-01-30T14:30:00+07:00
**Last Updated**: 2026-01-30T14:30:00+07:00
**Status**: INITIATED → Ready for Sprint Planning
