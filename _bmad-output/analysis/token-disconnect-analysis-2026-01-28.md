# Token Disconnect Analysis Report

**Date**: 2026-01-28
**Epic**: EPIC-UXUI-02 (Token Integration)
**Status**: CRITICAL - Major disconnect between design system and component usage
**Analyzed By**: analyst-ext

---

## Executive Summary

**PROBLEM**: We created 236+ CSS design tokens in `design-tokens.css`, styled 18 UI primitives in `ui/`, but **the main application components DON'T USE THEM**.

### Impact Metrics
| Category | Affected Files | Hardcoded Values | Priority |
|----------|----------------|------------------|----------|
| Notes Blocks | 8+ | ~200+ | P0 (user-facing) |
| Hub Components | 5+ | ~20+ | P1 (landing page) |
| IDE Components | 4+ | ~30+ | P1 (workspace) |
| Chat Components | 2+ | ~5+ | P2 |
| Layout Components | 10+ | ~15+ | P2 |
| Canvas/Edge | 2+ | ~10+ | P3 |

---

## 1. COMPONENT INVENTORY

### Category A: Notes Blocks (WORST OFFENDERS - ~200+ hardcoded values)

These BlockNote custom blocks use **entirely inline styles** with hardcoded colors:

#### 1.1 ArtifactGalleryBlock.tsx
- **Lines of hardcoded inline styles**: 100+
- **Hardcoded hex colors**: 40+
- **Location**: `src/presentation/components/notes/blocks/ArtifactGalleryBlock.tsx`
```typescript
// Examples from this file:
background: '#0f0f1a'          // Should be: var(--bg-0) or hsl(var(--background))
border: '2px solid #3f3f5c'    // Should be: var(--border-strong)
color: '#f8fafc'               // Should be: hsl(var(--foreground))
color: '#64748b'               // Should be: hsl(var(--muted-foreground))
background: '#6366f1'          // Should be: hsl(var(--primary)) - BUT using indigo instead of orange!
boxShadow: '4px 4px 0 0 #000'  // Should be: var(--shadow-pixel)
```

#### 1.2 ChartDiagramBlock.tsx
- **Lines of hardcoded inline styles**: 80+
- **Hardcoded hex colors**: 30+
- **Location**: `src/presentation/components/notes/blocks/ChartDiagramBlock.tsx`
```typescript
// Chart colors use wrong palette:
const CHART_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', ...] // Should use var(--chart-1) through --chart-5
background: '#1a1a2e'   // Non-token color
stroke: '#3f3f5c'       // Non-token color
stroke: '#94a3b8'       // Non-token color
```

#### 1.3 TransformPipelineBlock.tsx
- **Lines of hardcoded inline styles**: 60+
- **Hardcoded hex colors**: 25+
- **Location**: `src/presentation/components/notes/blocks/TransformPipelineBlock.tsx`
```typescript
background: '#1a1a2e'
border: '2px solid #3f3f5c'
color: '#22c55e'        // Should be: hsl(var(--success))
color: '#ef4444'        // Should be: hsl(var(--destructive))
color: '#6366f1'        // Using indigo instead of orange primary!
```

### Category B: Hub Components (Landing Page Visibility)

#### 2.1 MobileProjectSelector.tsx
- **Hardcoded values**: 5+
- **Critical**: Contains template CSS with hardcoded colors
```typescript
// In template string:
background: #1a1a1a;    // Should use CSS variable
color: #fff;            // Should use CSS variable
color: #00ff88;         // Non-token accent color!
```

#### 2.2 WorkspacePieChart.tsx & ProjectDistribution.tsx
- **Hardcoded values**: 10+ (duplicated in both files!)
```typescript
const WORKSPACE_COLORS = {
  ide: '#3b82f6',       // Should use hsl(var(--chart-2)) or var(--info)
  notes: '#eab308',     // Should use hsl(var(--chart-5)) or var(--warning)
};
fill="#8884d8"          // Random color, not in design system
```

### Category C: IDE Components

#### 3.1 XTerminal.tsx
- **Hardcoded values**: 20+ (but uses theme correctly!)
- **Status**: PARTIAL - Uses `useTheme()` hook correctly
```typescript
const isLightTheme = resolvedTheme === 'light';
background: isLight ? '#ffffff' : '#020617',  // Has theme awareness
// BUT: Colors should use CSS variables, not conditional hex
```

### Category D: Sync/Status Components

#### 4.1 SyncStatusIndicator.tsx
- **Hardcoded values**: 5+
```typescript
return { color: '#22c55e', ... };  // Should use: hsl(var(--success))
return { color: '#eab308', ... };  // Should use: hsl(var(--warning))
return { color: '#ef4444', ... };  // Should use: hsl(var(--destructive))
return { color: '#6b7280', ... };  // Should use: hsl(var(--muted-foreground))
```

#### 4.2 FileChangeNotification.tsx
- **Hardcoded values**: 3+
```typescript
const changeTypeColors = {
  created: '#22c55e',   // Should use: hsl(var(--success))
  modified: '#eab308',  // Should use: hsl(var(--warning))
  deleted: '#ef4444',   // Should use: hsl(var(--destructive))
};
```

### Category E: Canvas/Edge Components

#### 5.1 RelationshipEdge.tsx
- **Hardcoded values**: 4+
```typescript
color: '#22c55e',                    // Should use: hsl(var(--success))
color: '#ef4444',                    // Should use: hsl(var(--destructive))
color: '#3b82f6',                    // Should use: hsl(var(--info))
color: 'var(--color-primary, #a855f7)', // WRONG! Primary is orange #f97316, not purple!
```

### Category F: Debug Route

#### 6.1 debug.tsx
- **Hardcoded values**: 8+
```typescript
background: '#1a1a2e',
color: '#fff',
color: '#4ee',           // Non-token color!
background: '#e94560',   // Non-token color!
```

---

## 2. HARDCODED VALUES INVENTORY

### Background Colors (Non-Token)
| Hex Value | Occurrences | Should Be |
|-----------|-------------|-----------|
| `#0f0f1a` | 20+ | `hsl(var(--bg-0))` or `hsl(var(--background))` |
| `#1a1a2e` | 30+ | `hsl(var(--bg-1))` or `hsl(var(--card))` |
| `#1a1a1a` | 5+ | `hsl(var(--bg-0))` |
| `#020617` | 2+ | `hsl(var(--bg-0))` (slate-950) |

### Border Colors (Non-Token)
| Hex Value | Occurrences | Should Be |
|-----------|-------------|-----------|
| `#3f3f5c` | 40+ | `hsl(var(--border-strong))` |
| `#3f3f46` | 5+ | `hsl(var(--border))` |

### Text Colors (Non-Token)
| Hex Value | Occurrences | Should Be |
|-----------|-------------|-----------|
| `#f8fafc` | 30+ | `hsl(var(--foreground))` |
| `#64748b` | 25+ | `hsl(var(--muted-foreground))` |
| `#94a3b8` | 10+ | `hsl(var(--text-secondary))` |

### Semantic Colors (Hardcoded)
| Hex Value | Semantic | Occurrences | Should Be |
|-----------|----------|-------------|-----------|
| `#22c55e` | Success | 10+ | `hsl(var(--success))` |
| `#ef4444` | Error | 15+ | `hsl(var(--destructive))` |
| `#eab308` | Warning | 8+ | `hsl(var(--warning))` |
| `#3b82f6` | Info | 12+ | `hsl(var(--info))` |

### WRONG Primary Color Usage!
| Hex Value | Used As | CORRECT Primary |
|-----------|---------|-----------------|
| `#6366f1` (indigo) | Primary button/accent | `#f97316` (orange) |
| `#8b5cf6` (violet) | Primary accent | `#f97316` (orange) |
| `#a855f7` (purple) | Primary in RelationshipEdge | `#f97316` (orange) |

---

## 3. THEME FAILURE ANALYSIS

### Why Light Theme Toggle Does Nothing

**Root Cause**: Components use **hardcoded hex values** instead of CSS variables.

#### Theme System Is Correctly Wired:
✅ `ThemeProvider` uses `next-themes` with `attribute="class"`
✅ `.light` class is defined in `design-tokens.css` with proper overrides
✅ `useTheme()` hook is available and works
✅ Theme toggle cycles: light → dark → system

#### But Components Don't Respond Because:
❌ Inline styles use `background: '#1a1a2e'` instead of `background: 'hsl(var(--card))'`
❌ Hex colors don't change when `.light` class is applied
❌ Only 8 components use `useTheme()` hook (out of 100+)

### Components That DO Respond to Theme:
1. `XTerminal.tsx` - Uses `useTheme()` for terminal colors ✅
2. `MonacoEditor.tsx` - Uses `useTheme()` for editor theme ✅
3. `Tabs.tsx` - Uses `useTheme()` for syntax highlighting ✅
4. `MainSidebar.tsx` - Uses `useTheme()` for toggle button ✅
5. `StreamdownRenderer.tsx` - Uses `useTheme()` for markdown ✅

### Components That DON'T Respond:
- ALL Notes blocks (ArtifactGallery, ChartDiagram, TransformPipeline, etc.)
- ALL Hub components (WorkspacePieChart, ProjectDistribution, etc.)
- ALL Sync status components
- ALL Debug routes
- ALL Canvas edges

---

## 4. FIX PRIORITY RANKING

### Priority 0 (Immediate - User-Facing, High Visibility)

| Component | File | Hardcoded Count | Impact |
|-----------|------|-----------------|--------|
| ArtifactGalleryBlock | notes/blocks/ArtifactGalleryBlock.tsx | 40+ | Notes workspace |
| ChartDiagramBlock | notes/blocks/ChartDiagramBlock.tsx | 30+ | Notes workspace |
| TransformPipelineBlock | notes/blocks/TransformPipelineBlock.tsx | 25+ | Notes workspace |
| SyncStatusIndicator | workspace/sync/SyncStatusIndicator.tsx | 5+ | All workspaces |
| FileChangeNotification | workspace/sync/FileChangeNotification.tsx | 3+ | All workspaces |

### Priority 1 (High - Landing Page, First Impression)

| Component | File | Hardcoded Count | Impact |
|-----------|------|-----------------|--------|
| MobileProjectSelector | hub/MobileProjectSelector.tsx | 5+ | Mobile users |
| WorkspacePieChart | hub/WorkspacePieChart.tsx | 6+ | Hub dashboard |
| ProjectDistribution | hub/ProjectDistribution.tsx | 6+ | Hub dashboard |
| BootSequence | hub/BootSequence.tsx | 3+ | First load |

### Priority 2 (Medium - IDE Workspace)

| Component | File | Hardcoded Count | Impact |
|-----------|------|-----------------|--------|
| XTerminal | ide/XTerminal.tsx | 20+ | IDE (has theme awareness) |
| RelationshipEdge | canvas/edges/RelationshipEdge.tsx | 4+ | Canvas view |
| WorkflowVisualizer | chat/WorkflowVisualizer.tsx | 1+ | Chat panel |

### Priority 3 (Low - Debug/Internal)

| Component | File | Hardcoded Count | Impact |
|-----------|------|-----------------|--------|
| debug.tsx | routes/debug.tsx | 8+ | Debug only |

---

## 5. RECOMMENDED STORIES FOR EPIC-UXUI-02

### Story UXUI-02-01: Fix Notes Blocks Token Integration (P0)
- **Effort**: 4-6 hours
- **Files**: 
  - `ArtifactGalleryBlock.tsx`
  - `ChartDiagramBlock.tsx`
  - `TransformPipelineBlock.tsx`
- **Acceptance Criteria**:
  - Replace ALL hardcoded hex colors with CSS variables
  - Use `hsl(var(--...))` pattern for all colors
  - Replace inline styles with Tailwind classes where possible
  - Theme toggle changes block appearance

### Story UXUI-02-02: Fix Sync Status Components (P0)
- **Effort**: 1-2 hours
- **Files**:
  - `SyncStatusIndicator.tsx`
  - `FileChangeNotification.tsx`
- **Acceptance Criteria**:
  - Use semantic tokens: `--success`, `--warning`, `--destructive`
  - Theme toggle changes indicator colors

### Story UXUI-02-03: Fix Hub Components (P1)
- **Effort**: 2-3 hours
- **Files**:
  - `MobileProjectSelector.tsx`
  - `WorkspacePieChart.tsx`
  - `ProjectDistribution.tsx`
- **Acceptance Criteria**:
  - Use chart tokens: `--chart-1` through `--chart-5`
  - Replace template string CSS with CSS variables
  - Theme toggle changes chart colors

### Story UXUI-02-04: Fix IDE Terminal Theme (P2)
- **Effort**: 2-3 hours
- **Files**:
  - `XTerminal.tsx`
- **Acceptance Criteria**:
  - Replace hex-based theme with CSS variable references
  - Create terminal-specific tokens if needed
  - Maintain theme awareness but use tokens

### Story UXUI-02-05: Fix Canvas Edge Colors (P2)
- **Effort**: 1 hour
- **Files**:
  - `RelationshipEdge.tsx`
- **Acceptance Criteria**:
  - Fix wrong primary color (purple → orange)
  - Use semantic tokens for relationship colors

### Story UXUI-02-06: Audit and Fix Remaining Components (P3)
- **Effort**: 2-3 hours
- **Files**: Various layout and debug components
- **Acceptance Criteria**:
  - Full audit of remaining hardcoded values
  - Replace all non-token colors

---

## 6. WRONG PRIMARY COLOR ALERT

**CRITICAL**: Multiple components use `#6366f1` (indigo-500) or `#a855f7` (purple-500) as primary color.

**VIA-GENT Brand Primary is ORANGE**: `#f97316`

### Files Using Wrong Primary:
1. `ArtifactGalleryBlock.tsx` - Uses `#6366f1` for active states
2. `ChartDiagramBlock.tsx` - Uses `#6366f1` for active states
3. `TransformPipelineBlock.tsx` - Uses `#6366f1` for active states
4. `RelationshipEdge.tsx` - Uses `#a855f7` for 'relates' relationship

### Fix Pattern:
```typescript
// WRONG
background: '#6366f1'
// CORRECT
background: 'hsl(var(--primary))'  // Resolves to #f97316
```

---

## 7. TOKEN USAGE REFERENCE

### Correct Token Usage Patterns:

```typescript
// Background surfaces
background: 'hsl(var(--background))'    // Base background
background: 'hsl(var(--card))'          // Card/panel background
background: 'hsl(var(--secondary))'     // Secondary surface

// Text colors
color: 'hsl(var(--foreground))'         // Primary text
color: 'hsl(var(--muted-foreground))'   // Secondary/muted text

// Borders
border: '2px solid hsl(var(--border))'
borderColor: 'hsl(var(--border-strong))'

// Semantic colors
color: 'hsl(var(--success))'            // Green success
color: 'hsl(var(--warning))'            // Amber warning
color: 'hsl(var(--destructive))'        // Red error
color: 'hsl(var(--info))'               // Blue info

// Primary brand
background: 'hsl(var(--primary))'       // Orange brand
color: 'hsl(var(--primary-foreground))' // White on primary

// Shadows (8-bit)
boxShadow: 'var(--shadow-pixel)'        // 4px 4px 0 0 rgba(0,0,0,0.5)
boxShadow: 'var(--shadow-pixel-sm)'     // 2px 2px 0 0 rgba(0,0,0,0.5)
```

---

## 8. APPENDIX: Files Requiring Changes

### Full File List (Sorted by Priority)

**P0 (Notes Blocks)**:
- `src/presentation/components/notes/blocks/ArtifactGalleryBlock.tsx`
- `src/presentation/components/notes/blocks/ChartDiagramBlock.tsx`
- `src/presentation/components/notes/blocks/TransformPipelineBlock.tsx`
- `src/presentation/components/workspace/sync/SyncStatusIndicator.tsx`
- `src/presentation/components/workspace/sync/FileChangeNotification.tsx`

**P1 (Hub)**:
- `src/presentation/components/hub/MobileProjectSelector.tsx`
- `src/presentation/components/hub/WorkspacePieChart.tsx`
- `src/presentation/components/hub/ProjectDistribution.tsx`

**P2 (IDE/Canvas)**:
- `src/presentation/components/ide/XTerminal.tsx`
- `src/presentation/components/canvas/edges/RelationshipEdge.tsx`
- `src/presentation/components/chat/WorkflowVisualizer.tsx`

**P3 (Debug/Internal)**:
- `src/routes/debug.tsx`

---

**Report Generated**: 2026-01-28
**Total Hardcoded Values Found**: ~300+
**Files Affected**: 15+
**Estimated Fix Effort**: 15-20 hours total
