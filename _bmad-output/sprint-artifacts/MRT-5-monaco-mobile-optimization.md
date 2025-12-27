# Story MRT-5: Monaco Editor Mobile Optimization

**Epic**: Mobile Responsive Transformation  
**Story ID**: MRT-5  
**Sprint**: 2025-12-28  
**Status**: in-progress  

---

## User Story

**As a** mobile user  
**I want** to edit code with a comfortable font size and keyboard handling  
**So that** I can write and modify code on my phone without frustration

---

## Background

The Monaco Editor needs mobile-specific optimizations:
- Font size increase for readability on small screens
- Word wrap enabled to prevent horizontal scrolling
- Keyboard-aware height adjustments (iOS Safari workaround)
- Optional fullscreen toggle for focused editing

**Current State**: Lines 269-287 define editor options. Minimap already disabled. Font size is 13px (too small for mobile).

---

## Acceptance Criteria

### AC-1: Increased Font Size on Mobile
**Given** a mobile viewport (<768px)  
**When** the editor loads  
**Then** font size is at least 16px (prevents iOS zoom)

### AC-2: Word Wrap on Mobile
**Given** a mobile viewport  
**When** editing code  
**Then** lines wrap to prevent horizontal scrolling

### AC-3: Reduced Line Height
**Given** a mobile viewport  
**When** viewing code  
**Then** line height is optimized for more visible lines

### AC-4: TypeScript Compilation
**Given** all changes are complete  
**When** running `pnpm exec tsc --noEmit`  
**Then** there are no TypeScript errors

---

## Tasks

- [x] T1: Research Monaco mobile patterns via Context7
- [ ] T2: Import useDeviceType hook into MonacoEditor
- [ ] T3: Create mobile-specific options object
- [ ] T4: Increase font size to 16px on mobile
- [ ] T5: Enable word wrap on mobile
- [ ] T6: Verify TypeScript compilation passes
- [ ] T7: Manual test on mobile viewport

---

## Dev Notes

### Key Files
- [MonacoEditor.tsx](file:///Users/apple/Documents/coding-projects/project-alpha-master/src/components/ide/MonacoEditor/MonacoEditor.tsx) - Primary modification target
- [useMediaQuery.ts](file:///Users/apple/Documents/coding-projects/project-alpha-master/src/hooks/useMediaQuery.ts) - Already implemented

### Current Editor Options (Lines 269-287)
```tsx
options={{
    fontFamily: 'ui-monospace, SFMono-Regular, ...',
    fontSize: 13,  // → 16 on mobile
    lineHeight: 1.6,
    minimap: { enabled: false },  // ✓ already disabled
    scrollBeyondLastLine: false,
    wordWrap: 'off',  // → 'on' for mobile
    automaticLayout: true,  // ✓ already enabled
    // ... other options
}}
```

### Implementation Pattern
```tsx
import { useDeviceType } from '@/hooks/useMediaQuery';

const { isMobile } = useDeviceType();

// Mobile-optimized options
const editorOptions = {
    fontSize: isMobile ? 16 : 13,
    lineHeight: isMobile ? 1.4 : 1.6,
    wordWrap: isMobile ? 'on' : 'off',
    // ... rest of options
};
```

---

## Status

| Phase | Status | Date |
|-------|--------|------|
| Drafted | ✅ | 2025-12-28 01:12 |
| In-progress | 🔄 | 2025-12-28 01:12 |
| Done | ⏳ | |

---

*Story created by BMAD SM Agent - 2025-12-28*
