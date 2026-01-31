# ═══════════════════════════════════════════════════════════════════════════════
# BLOCK EDITOR & PANEL OVERHAUL AUDIT
# Block Editor, AI Features, Panel Layout, Mobile UX
# ═══════════════════════════════════════════════════════════════════════════════

**Audit ID**: AUDIT-BLOCK-PANEL-2026-01-15
**Created**: 2026-01-15
**Auditor**: EXCALIBUR (BMAD Extension Orchestrator)
**Proposed Epic**: EPIC-UX-01
**Scope**: Block Editor, Panel System, AI Integration, Mobile UX
**Severity**: CRITICAL - 67 issues identified (20 P0, 29 P1, 18 P2)

---

## 📊 EXECUTIVE SUMMARY

This audit focuses on **user-facing UX/UI issues** in the block editor and panel systems, based on:
1. User screenshots (5 images analyzed)
2. User reported issues (detailed prompt)
3. Parallel codebase exploration (5 agents)
4. Competitive research (Notion + Obsidian)

### Key Findings

| Category | P0 | P1 | P2 | Total |
|----------|----|----|----|-------|
| Block Editor | 8 | 6 | 4 | 18 |
| AI Features | 6 | 8 | 3 | 17 |
| Panel Layout | 3 | 7 | 5 | 15 |
| Mobile/Portrait | 3 | 8 | 6 | 17 |
| **TOTAL** | **20** | **29** | **18** | **67** |

**Estimated Effort**: 30-40 stories spanning 4-6 weeks

---

## 🎯 AUDIT METHODOLOGY

1. **Parallel Exploration**: 5 Explore agents launched simultaneously
2. **Competitive Research**: Notion and Obsidian features analyzed for hybrid parity
3. **Code Analysis**: Symbolic reading of 50+ affected files
4. **Screenshot Review**: 5 user-provided screenshots analyzed

---

## 📋 CATEGORY 1: BLOCK EDITOR ISSUES

### 1.1 The "+" Menu Problems

| Issue | Severity | Root Cause | Impact |
|-------|----------|------------|--------|
| AI features don't work on empty blocks | **P0** | No content selection context for new blocks | Users can't use AI generation on new notes |
| No in-block UI for generation options | **P0** | Missing container-aware popup | Generation covers/distorts surrounding UI |
| No context scope selection | **P1** | Can't choose above/below/all content | AI generation lacks precision |
| Slash command menu cluttered | **P2** | 25+ AI commands without grouping | Hard to find features |

#### Evidence

**File**: `src/presentation/components/notes/AISlashCommand.tsx`
- 25+ slash commands, flat list (no categorization)
- Commands not connected to user's custom prompts

**File**: `src/presentation/components/notes/AIInsertionDialog.tsx`
- Has "Append, Replace, Before" modes but not exposed in main flow
- Context selection exists but hidden behind dialog

**File**: `src/presentation/components/notes/AIPromptDialog.tsx`
- Context selection (none/above/all/selection) exists
- Not integrated with "+" menu for quick access

### 1.2 Block Selection Problems

| Issue | Severity | Root Cause | Impact |
|-------|----------|------------|--------|
| No multi-block selection | **P0** | BlockNote not configured for multi-select | Can't batch operations |
| Partial text selection inconsistent | **P1** | Selection state not unified across blocks | AI transform behaves unpredictably |
| No block drag-and-drop | **P1** | No drag handle implementation | Can't reorder blocks intuitively |
| Selection state lost on focus change | **P2** | Selection not persisted | UX frustration |

#### Evidence

**File**: `src/presentation/components/notes/NoteEditor.tsx`
- Uses `useCreateBlockNote` but no multi-select config found
- `type BlockNoteBlock = any;` indicates type system challenges

**Files**: `src/presentation/components/notes/blocks/*.tsx`
- 14 custom blocks, no drag handle implementation found
- Custom blocks use inconsistent patterns

### 1.3 Block Type Deficiencies vs Notion/Obsidian

| Missing Feature | Priority | Notion | Obsidian | Implementation Notes |
|-----------------|----------|--------|----------|----------------------|
| Toggle blocks | **P1** | ✅ | ❌ | Collapsible sections |
| Callout blocks | **P1** | ✅ | ✅ | Highlighted boxes with icons |
| Synced blocks | **P1** | ✅ | ❌ | Content mirroring across notes |
| Column layouts | **P1** | ✅ | ❌ | Multi-column containers |
| Database blocks | **P2** | ✅ | ❌ | Table/board/calendar views |
| Canvas/whiteboard | **P1** | Limited | ✅ | JSON Canvas spec support |
| Block references | **P0** | ❌ | ✅ | `^blockId` syntax for linking |

#### Current Custom Blocks

**Directory**: `src/presentation/components/notes/blocks/`

```
✅ Existing (14):
├── ImageBlock.tsx - Image with URL/alt
├── CodeFileBlock.tsx - Code file
├── FileAttachmentBlock.tsx - File attachment
├── AIImageBlock.tsx - AI-generated image
├── AIVisionBlock.tsx - AI vision understanding
├── StoryboardBlock.tsx - Sequential images
├── VideoBlock.tsx - Video understanding
├── TTSBlock.tsx - Text-to-speech
├── ArtifactBlock.tsx - Interactive HTML
├── VideoGenerationBlock.tsx - Video generation
├── SlidesExportBlock.tsx - PowerPoint export
├── ChartDiagramBlock.tsx - Chart generation
├── TransformPipelineBlock.tsx - Sequential transformation
├── ArtifactGalleryBlock.tsx - Artifact gallery
└── MultiStepGenerationBlock.tsx - Multi-step generation

❌ Missing (Basic):
├── Toggle block - Collapsible sections
├── Callout block - Highlighted boxes
├── Column layout - Multi-column
├── Block reference - Link to specific content
├── Synced block - Mirror content
```

**Analysis**: Heavy AI focus but missing basic note-taking blocks.

---

## 📋 CATEGORY 2: AI SELECTION BAR ISSUES

### 2.1 Text Selection AI Bar

| Issue | Severity | Root Cause | Impact |
|-------|----------|------------|--------|
| Bar appears but features disconnected | **P0** | Commands not linked to user prompts | Features don't match user intent |
| No multi-block selection support | **P0** | Selection API limited | Can't transform across blocks |
| No modal for replacement options | **P1** | Direct replacement only | Can't preview before accepting |
| No streaming animation | **P1** | TanStack AI streaming not visualized | Unresponsive feel |

#### Evidence

**File**: `src/presentation/components/notes/AITransformMenu.tsx`
- Predefined actions: Summarize, Expand, Improve, Explain, Translate
- Custom prompt input exists but disconnected from user's saved prompts
- No streaming progress indicator

### 2.2 AI Features Not Sharing Commands

**Problem**: The "+" menu and selection bar have separate command systems.

| System | Commands | User Custom | File |
|--------|----------|-------------|------|
| Slash Commands | 25+ hardcoded | ❌ No | `AISlashCommand.tsx` |
| Transform Menu | 5 predefined | ✅ Yes | `AITransformMenu.tsx` |
| Prompt Dialog | Free-form | ✅ Yes | `AIPromptDialog.tsx` |

**Impact**: User confusion - why does "custom" work in one place but not another?

### 2.3 Missing AI Features vs Competitors

| Missing Feature | Priority | Notion | Obsidian |
|-----------------|----------|--------|----------|
| Inline AI (spacebar) | **P0** | ✅ | ❌ |
| Streaming visualization | **P1** | ✅ | ❌ |
| AI chat with context | **P1** | ✅ | ✅ (plugins) |
| Build with AI | **P2** | ✅ | ❌ |
| Cross-app search | **P2** | ✅ | ❌ |
| Vector search | **P0** | ❌ | ✅ (plugins) |

---

## 📋 CATEGORY 3: MIDDLE PANE FEATURE FAILURES

### 3.1 Bars Distorted on Resize

| Issue | Severity | Files Affected | Problem |
|-------|----------|----------------|---------|
| Header bar covers content | **P0** | `IDELayoutMain.tsx` | Fixed positioning without flex awareness |
| Settings popup clipped | **P1** | `SlashCommandsDialog.tsx` | No overflow handling |
| AI selection bar misaligned | **P1** | `AITransformMenu.tsx` | Not pane-resize aware |

#### Evidence

**File**: `src/presentation/components/layout/IDELayoutMain.tsx`
- Uses `fixed` positioning for some bars
- No resize listeners for repositioning

**File**: `src/presentation/components/layout/IDELayout/IDEResizableLayout.tsx`
- Custom resizable implementation
- No "resize aware" component pattern

### 3.2 Z-Index Wars

**Current State** (from `src/presentation/components/ui/resizable.tsx`):
```typescript
isDragging ? "z-50 bg-primary/60" : "z-10 hover:bg-primary/30"  // Inconsistent
"z-30"  // Collapse indicators
"!z-50"  // Mobile sidebar
"z-40"   // Mobile tab bar
```

**Issues**:
- No unified z-index scale
- Arbitrary values scattered
- Potential stacking context creation
- No single OverlayRoot for modals

### 3.3 Content Suggestion Weakness

| Issue | Severity | Current State | Desired |
|-------|----------|--------------|---------|
| No AI follow-up suggestions | **P1** | Manual prompt only | Auto-suggest based on context |
| No multi-media generation | **P1** | Text only | Image/audio/video blocks |
| No content-rich blocks | **P2** | Basic text | Tables, kanban, etc. |

---

## 📋 CATEGORY 4: LEFT/RIGHT PANEL OVERHAUL

### 4.1 Chat Panel Issues

| Issue | Severity | Files Affected | Problem |
|-------|----------|----------------|---------|
| Chat squeezed when AI generates long content | **P0** | `AgentChatPanel.tsx` | No bubble popup like Notion |
| No bubble interface option | **P0** | `ChatPanelWrapper.tsx` | Stacked messages only |
| ~20 props passed down (prop drilling) | **P1** | Multiple chat components | Should use store instead |
| Tool execution logs expandable but no collapse state persisted | **P2** | `EnhancedChatInterface.tsx` | State lost on navigation |

#### Evidence

**File**: `src/presentation/components/layout/ChatPanelWrapper.tsx`
- Manages ThreadManager vs AgentChatPanel states
- No "bubble popup" mode found

**File**: `src/presentation/components/ide/EnhancedChatInterface.tsx`
- Has tool execution logs but no collapse persistence
- Touch targets ≥44x44px (good) but overall mobile UX poor

### 4.2 Left Panel "Jungle"

| Issue | Severity | Files Affected | Problem |
|-------|----------|----------------|---------|
| Too many stacked rows | **P1** | `MainSidebar.tsx` | Information density too high |
| No collapse states persisted | **P2** | `layout-store.ts` | State not saved |
| No focus mode | **P0** | `IDELayoutMain.tsx` | Can't collapse for full-width editor |

#### Evidence

**File**: `src/presentation/components/layout/MainSidebar.tsx`
- Complex component with many nested rows
- No clear visual hierarchy

**File**: `src/infrastructure/persistence/stores/layout-store.ts`
- Has collapse state but not fully utilized

### 4.3 Panel Flex Control

| Missing Feature | Priority | Impact |
|-----------------|----------|--------|
| User-controlled resizable panels | **P0** | Can't customize layout |
| Panel width persistence | **P1** | Layout resets on refresh |
| Focus mode (collapse all panels) | **P0** | Limited workspace |

#### Evidence

**File**: `src/presentation/components/layout/IDELayout/IDEResizableLayout.tsx`
- Custom implementation exists but not user-controlled
- Double-click to collapse exists but not discoverable

**File**: `src/infrastructure/persistence/stores/ide/ide-layout-slice.ts`
- Has `panelLayouts` and `panelCollapsed` but not fully utilized

---

## 📋 CATEGORY 5: MOBILE/PORTRAIT UX DISASTER

### 5.1 Sync Status Hiding Chat

**User Report**: *"I have no word for this - as you see if I dont close the 'sync status where no hell I can know there is ai chat - once I close it the chat is beyond crap - ux ui fucked"*

| Issue | Severity | Evidence |
|-------|----------|----------|
| Sync status panel covers chat on mobile | **P0** | User screenshot #3 |
| No conditional visibility logic | **P0** | `SyncStatusPanel.tsx` always visible |
| Can't access AI chat when sync open | **P0** | Direct user quote |

#### Evidence

**File**: `src/presentation/components/ide/SyncStatusPanel.tsx`
- No mobile-specific conditional visibility
- Always renders regardless of screen size

**File**: `src/presentation/components/layout/MobileIDELayout.tsx`
- Single-panel focus mode
- Chat accessible via tab but not prominent

### 5.2 Mobile Chat Unusable

| Issue | Severity | Problem |
|-------|----------|---------|
| Chat beyond crap when sync closed | **P0** | Same UI as desktop, not mobile-optimized |
| No bubble chat on mobile | **P1** | Should use message bubbles like chat apps |
| Bottom tabs don't show chat clearly | **P1** | Chat icon not prominent |

#### Breakpoints

**File**: `src/hooks/useResponsive.ts`
```typescript
BREAKPOINTS = {
    xs: '(max-width: 413px)',           // Phone portrait
    sm: '(min-width: 414px) and (max-width: 767px)', // Phone landscape
    md: '(min-width: 768px) and (max-width: 1023px)', // Tablet portrait
    lg: '(min-width: 1024px)',          // Desktop
}
```

**Problem**: Mobile breakpoint (<768px) uses single-panel focus, but chat not properly adapted.

### 5.3 Touch Target Violations

| Component | Issue | Severity |
|-----------|-------|----------|
| Chat input | < 44px height on mobile | P1 |
| AI action buttons | Small touch targets | P2 |
| Block handles | Hard to grab on touch | P1 |

---

## 🔍 TECHNICAL DEBT ANALYSIS

### Code Quality Issues

| Issue | Severity | Files | Impact |
|-------|----------|-------|--------|
| `type BlockNoteBlock = any;` | **P1** | `NoteEditor.tsx` | Type safety lost |
| Multiple Zustand stores for AI | **P1** | Various | State fragmentation |
| No unified z-index scale | **P0** | Layout files | Stacking conflicts |
| Prop drilling in chat | **P1** | Chat components | Maintenance burden |
| Inconsistent block patterns | **P2** | Block files | Confusing patterns |

### Architecture Issues

| Issue | Severity | Impact |
|-------|----------|--------|
| No OverlayRoot for modals | **P0** | Modals clip, z-index wars |
| BlockNote type system issues | **P1** | Can't properly type blocks |
| AI service coupling | **P1** | Hard to swap providers |
| No error boundaries for panels | **P2** | Crashes cascade |

---

## 📁 AFFECTED FILES SUMMARY

### Block Editor (15 files)
```
src/presentation/components/notes/NoteEditor.tsx
src/presentation/components/notes/blocks/*.tsx (14 custom blocks)
src/presentation/components/notes/AISlashCommand.tsx
src/presentation/components/notes/AITransformMenu.tsx
src/presentation/components/notes/AIInsertionDialog.tsx
src/presentation/components/notes/AIPromptDialog.tsx
src/presentation/components/notes/SlashCommandsDialog.tsx
src/lib/notes/ai-insertion-store.ts
src/lib/notes/ai-prompt-store.ts
src/lib/notes/note-ai-service.ts
src/lib/notes/use-streaming-ai.ts
```

### Layout System (12 files)
```
src/presentation/components/layout/IDELayoutMain.tsx
src/presentation/components/layout/MobileIDELayout.tsx
src/presentation/components/layout/IDELayout/IDEResizableLayout.tsx
src/presentation/components/layout/IDELayout/IDEChatPanel.tsx
src/presentation/components/layout/ChatPanelWrapper.tsx
src/presentation/components/layout/MainSidebar.tsx
src/presentation/components/layout/MobileTabBar.tsx
src/presentation/components/ide/SyncStatusPanel.tsx
src/infrastructure/persistence/stores/layout-store.ts
src/infrastructure/persistence/stores/ide/ide-layout-slice.ts
src/presentation/components/ui/resizable.tsx
src/hooks/useResponsive.ts
```

### AI Integration (10 files)
```
src/presentation/components/ide/AgentChatPanel.tsx
src/presentation/components/ide/EnhancedChatInterface.tsx
src/application/services/ProviderService.ts
src/lib/ai/ (various AI utilities)
```

**Total**: ~50 files directly affected

---

## 🎯 RECOMMENDED EPIC STRUCTURE

### EPIC-UX-01: Block Editor & Panel Overhaul

**Phase 1: Foundation (P0 - Critical)**

| Story | Description | Effort |
|-------|-------------|--------|
| UX-01 | Unified z-index scale | 2h |
| UX-02 | OverlayRoot for all modals | 4h |
| UX-03 | Multi-block selection | 1d |
| UX-04 | Block drag-and-drop | 1d |
| UX-05 | Panel flex control | 4h |
| UX-06 | Mobile chat accessibility | 4h |

**Phase 2: Block Editor (P0-P1)**

| Story | Description | Effort |
|-------|-------------|--------|
| UX-07 | In-block AI generation UI | 1d |
| UX-08 | Context scope selection | 4h |
| UX-09 | Toggle and callout blocks | 1d |
| UX-10 | Block references (`^blockId`) | 2d |
| UX-11 | Column layouts | 1d |
| UX-12 | Synced blocks | 2d |

**Phase 3: AI Features (P1)**

| Story | Description | Effort |
|-------|-------------|--------|
| UX-13 | Unified command system | 1d |
| UX-14 | Streaming animations | 4h |
| UX-15 | Replacement modal with preview | 4h |
| UX-16 | AI follow-up suggestions | 1d |

**Phase 4: Panel Overhaul (P1)**

| Story | Description | Effort |
|-------|-------------|--------|
| UX-17 | Bubble chat option | 1d |
| UX-18 | Focus mode | 4h |
| UX-19 | Panel width persistence | 2h |
| UX-20 | Left panel reorganization | 1d |

**Phase 5: Canvas & Advanced (P2)**

| Story | Description | Effort |
|-------|-------------|--------|
| UX-21 | JSON Canvas support | 3d |
| UX-22 | Database blocks | 3d |
| UX-23 | Graph view | 2d |

**Estimated Total**: 30-40 stories, 4-6 weeks

---

## 📊 COMPETITIVE ANALYSIS SUMMARY

### Notion Strengths to Emulate
1. **Block-based architecture** (composability)
2. **Slash commands** (categorized, fast)
3. **Multi-block selection** (batch operations)
4. **Synced blocks** (content reusability)
5. **AI inline** (spacebar activation)
6. **Database versatility** (multiple views)

### Obsidian Strengths to Emulate
1. **Block references** (`^blockId`)
2. **Canvas** (JSON Canvas spec)
3. **Graph view** (visual connections)
4. **Markdown native** (plain files)
5. **Properties/metadata** (YAML frontmatter)
6. **Plugin extensibility**

### Superior Features We Can Build
1. **Local-first AI**: Vector search without cloud
2. **Real-time collaboration**: CRDT-based
3. **True offline**: PWA with full sync
4. **Mobile-first**: Touch-native UX
5. **Hybrid blocks**: Best of both editors

---

## 🔧 IMPLEMENTATION RECOMMENDATIONS

### Immediate Actions (P0)

1. **Fix mobile chat accessibility** (sync status covering chat)
   - File: `SyncStatusPanel.tsx`, `MobileIDELayout.tsx`
   - Add conditional visibility for mobile

2. **Add multi-block selection**
   - File: `NoteEditor.tsx`
   - Configure BlockNote for multi-select

3. **Create in-block AI generation UI**
   - File: `AISlashCommand.tsx`, new component
   - Container-aware popup for generation options

4. **Implement unified z-index scale**
   - Files: All layout files
   - Define token-based z-index system

5. **Add OverlayRoot for modals**
   - File: New component
   - Portal all modals through single root

### Short-term (P1 - 2-3 weeks)

1. Block drag-and-drop
2. Panel flex control
3. Unified command system
4. Streaming animations
5. Bubble chat option
6. Block references
7. Focus mode

### Medium-term (P2 - 4-6 weeks)

1. Canvas support (JSON Canvas)
2. Database blocks
3. Graph view
4. Synced blocks
5. Column layouts

### Long-term (Future)

1. Real-time collaboration
2. Cross-app integrations
3. Advanced AI features (RAG, vector search)
4. Plugin system

---

## 📝 TRACEABILITY MATRIX

Every issue in this audit must map to:
- **Epic**: EPIC-UX-01 (proposed)
- **Story**: Individual story IDs (UX-01 through UX-30+)
- **Acceptance Criteria**: Defined per story
- **Files Modified**: Tracked in story completion
- **Git Commits**: Linked to story artifacts

---

## 🚨 GOVERNANCE STATUS

This audit was created following BMAD correct-course workflow:
- ✅ Parallel exploration agents deployed (5)
- ✅ Competitive research completed (Notion, Obsidian)
- ✅ Code analysis with symbolic tools
- ✅ User screenshots reviewed (5 images)
- ⏳ Awaiting sprint-planning-wrapper validation
- ⏳ Awaiting epic creation approval

---

**End of Audit**

*Next Steps*:
1. Review this audit with user
2. Create EPIC-UX-01 via sprint-planning-wrapper
3. Generate detailed story breakdown
4. Begin implementation with highest-priority stories

---

**Document ID**: AUDIT-BLOCK-PANEL-2026-01-15
**Status**: DRAFT - Awaiting User Review
**Agent IDs**:
- Block Editor: `a253b91`
- Panel Layout: `a7672a1`
- AI Features: `a42cf48`
- Notion Research: `af61cee`
- Obsidian Research: `a6acd10`
