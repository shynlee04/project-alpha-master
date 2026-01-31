# Team A Implementation Plan: Mobile Routing Enhancement

**Date:** 2026-01-12  
**Team:** A (IDE Workspace Handling)  
**Priority:** P0 (Mobile Routing), P1 (Storage Type Enforcer)  
**Confidence Level:** 92%+

---

## Scope

This implementation addresses the mobile user routing gap identified in the IDE Workspace investigation:

1. **Problem:** Mobile users are NOT explicitly directed to `/notes` when entering from other workspaces
2. **Problem:** The `default_note` concept is NOT enforced for browser-mode projects  
3. **Problem:** No visual distinction between FSA-mode (Desktop) and IDB-mode (Mobile)

---

## Implementation Steps

### Step 1: Mobile Detection Hook (NEW)

**File:** `src/hooks/useDeviceType.ts` (already exists - verify usage)

**Enhancement:** Ensure `useDeviceType()` returns proper device classification for routing

### Step 2: Mobile Routing Enhancement

**File:** `src/lib/workspace/hooks/useWorkspaceActions.ts`

**Changes:**
- Add mobile detection check before FSA operations
- Auto-redirect mobile users to `/notes` (browser-mode IndexedDB)
- Show user-friendly message explaining why FSA is unavailable

### Step 3: Default Note Enforcement

**File:** `src/routes/notes.lazy.tsx`

**Changes:**
- When browser-mode project is created, automatically create `default_note`
- Select `default_note` as active note on first load
- Ensure `default_note` has proper blocks structure

### Step 4: Storage Type Enforcer

**File:** `src/lib/filesystem/unified-storage-adapter.ts`

**Changes:**
- Add static method `enforceStorageType(deviceType: DeviceType): StorageType`
- Ensure mobile devices always use `indexeddb`

### Step 5: Visual UI Indication (OPTIONAL)

**File:** `src/presentation/components/notes/NoteSidebar.tsx`

**Changes:**
- Add badge/icon indicating storage mode (FSA vs IndexedDB)
- Show mobile indicator for browser-mode projects

---

## Files to Modify

| File | Change Type | Lines Estimated |
|------|-------------|-----------------|
| `src/lib/workspace/hooks/useWorkspaceActions.ts` | Enhancement | +40 lines |
| `src/routes/notes.lazy.tsx` | Enhancement | +30 lines |
| `src/lib/filesystem/unified-storage-adapter.ts` | Enhancement | +15 lines |
| `src/presentation/components/notes/NoteSidebar.tsx` | UI Enhancement | +25 lines |

---

## Detailed Implementation

### Step 2: Mobile Routing Enhancement

```typescript
// Add to useWorkspaceActions.ts

import { useDeviceType } from '@/hooks/useDeviceType';
import { useNavigate } from '@tanstack/react-router';

// Inside component or hook that handles FSA operations:

const { isMobile, isTablet } = useDeviceType();
const navigate = useNavigate();

const handleMobileFSAFallback = useCallback(() => {
    if (isMobile || isTablet) {
        // Show toast explaining FSA unavailable
        toast.info(
            t('workspace.mobileFsaUnavailable', 'File sync requires desktop browser'),
            {
                description: t('workspace.redirectingToNotes', 'Redirecting to Notes workspace...'),
                duration: 3000,
                action: {
                    label: t('workspace.goNow', 'Go Now'),
                    onClick: () => navigate({ to: '/notes' }),
                },
            }
        );
        
        // Auto-redirect after delay
        setTimeout(() => {
            navigate({ to: '/notes' });
        }, 2000);
        
        return true; // Indicates mobile detected, action taken
    }
    return false; // Not mobile, proceed with FSA
}, [isMobile, isTablet, navigate, t]);
```

### Step 3: Default Note Enforcement

```typescript
// Add to notes.lazy.tsx - inside useEffect that creates browser-mode project

// Auto-create default_note for browser-mode
if (!p && project.id === browserModeProjectId) {
    // Create default_note
    const defaultNoteId = await createNote({
        title: 'Welcome to Notes',
        blocks: [
            {
                type: 'paragraph',
                content: [
                    { type: 'text', text: 'This is your default note. Start writing!', styles: {} }
                ],
                props: { textAlignment: 'left' }
            }
        ],
    });
    
    // Select as active note
    setActiveNote(defaultNoteId);
    
    console.log('[NotesWorkspaceDefault] Created and selected default_note:', defaultNoteId);
}
```

### Step 4: Storage Type Enforcer

```typescript
// Add to UnifiedStorageAdapter class

import type { DeviceType } from '@/hooks/useDeviceType';

/**
 * Enforce storage type based on device capabilities
 * Mobile devices cannot use FSA (File System Access API)
 */
static enforceStorageType(deviceType: DeviceType): StorageType {
    if (deviceType.isMobile || deviceType.isTablet) {
        console.log('[UnifiedStorageAdapter] Mobile device detected, enforcing indexeddb storage');
        return 'indexeddb';
    }
    // Desktop can use either, default to FSA for better persistence
    return 'fsa';
}

/**
 * Get storage type with device awareness
 */
getStorageTypeWithDeviceCheck(deviceType: DeviceType): StorageType {
    return UnifiedStorageAdapter.enforceStorageType(deviceType);
}
```

---

## Validation Checklist

- [ ] Mobile device detection works correctly
- [ ] Mobile users are auto-redirected to `/notes`
- [ ] `default_note` is created and selected on first browser-mode load
- [ ] Storage type enforcer prevents FSA on mobile
- [ ] Visual indication shows storage mode (optional)
- [ ] TypeScript compilation succeeds (0 errors)
- [ ] No regressions in existing FSA functionality

---

## Testing Strategy

### Unit Tests

1. **Mobile Detection Test:**
   ```typescript
   // Test mobile detection returns correct type
   expect(useDeviceType({ userAgent: 'iPhone' })).toEqual({ isMobile: true, isTablet: false });
   ```

2. **Storage Type Enforcer Test:**
   ```typescript
   // Test mobile forces indexeddb
   expect(UnifiedStorageAdapter.enforceStorageType({ isMobile: true })).toBe('indexeddb');
   // Test desktop allows fsa
   expect(UnifiedStorageAdapter.enforceStorageType({ isMobile: false })).toBe('fsa');
   ```

3. **Default Note Creation Test:**
   ```typescript
   // Test default_note structure
   const defaultNote = createDefaultNote();
   expect(defaultNote.title).toBe('Welcome to Notes');
   expect(defaultNote.blocks).toHaveLength(1);
   ```

### Integration Tests

1. **Mobile Flow Test:**
   - Load IDE workspace on mobile device
   - Verify auto-redirect to `/notes`
   - Verify browser-mode project created
   - Verify `default_note` selected

2. **Storage Mode UI Test:**
   - Desktop: Show "FSA Mode" badge in sidebar
   - Mobile: Show "Browser Mode" badge in sidebar

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Device detection false positive | High | Test with real devices (iOS Safari, Chrome Mobile) |
| Redirect loop | Medium | Add isRedirecting guard (existing pattern) |
| Default note not created | Low | Graceful fallback to empty editor |
| FSA still accessible on some mobile browsers | Low | Check `showDirectoryPicker` in window object |

---

## Dependencies

- `useDeviceType` hook (existing)
- TanStack Router `navigate` (existing)
- Toast notifications (existing)
- `useNoteStore` (existing)

---

## Estimated Effort

| Task | Time |
|------|------|
| Mobile routing enhancement | 2 hours |
| Default note enforcement | 1 hour |
| Storage type enforcer | 1 hour |
| Visual UI indication | 1 hour |
| Testing and validation | 1 hour |
| **Total** | **6 hours** |

---

## Artifacts to Generate

1. This implementation plan
2. Updated files (tracked in git)
3. Updated sprint status in `sprint-status.yaml`
4. Handoff artifact for Team B (if cross-testing needed)

---

*Plan generated by Team A - 2026-01-12*
