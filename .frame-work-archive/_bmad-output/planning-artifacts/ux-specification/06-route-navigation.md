# Route Structure & Navigation

<- [Global Components](./05-global-components.md) | [Index](./index.md) | [Plugin Architecture](./07-plugin-architecture.md) ->

---

## 6.1 Route Hierarchy

```
/                           # Hub/Home - Project list and quick actions
|-- /projects               # Projects list (alternative view)
|-- /$projectId             # Project workspace (IDE layout)
|   |-- ?preset=notes       # With specific preset active
|   |-- ?plugins=a,b,c      # With specific plugins active
|   |-- ?file=path/to/file  # With specific file open
|-- /settings               # Global settings
|   |-- /settings/api-keys  # API key management
|   |-- /settings/vault     # Secure storage
|   |-- /settings/theme     # Theme preferences
|-- /agents                 # Agent management (future)
```

---

## 6.2 URL State Management

| Parameter | Example | Purpose |
|-----------|---------|---------|
| `preset` | `?preset=ide` | Active layout preset (ide, notes, split) |
| `plugins` | `?plugins=filetree,monaco,chat` | Active plugin list |
| `file` | `?file=src/index.ts` | Currently open file path |
| `line` | `?line=42` | Editor scroll position |

---

## 6.3 Deep Linking Requirements

```yaml
Share Link Contents:
  - Project ID (required)
  - Active file path (optional)
  - Preset/layout (optional)
  
Exclude from URLs:
  - Transient UI state (modal open, dropdown)
  - Scroll positions (use session storage)
  - Unsaved changes (prompt before navigation)
```

---

## 6.4 Route Transitions

### Loading States

```typescript
// Route loader with skeleton
export const Route = createFileRoute('/$projectId')({
  loader: async ({ params }) => {
    // Show skeleton immediately
    return defer({
      project: loadProject(params.projectId),
      files: loadFileTree(params.projectId),
    });
  },
  pendingComponent: ProjectSkeleton,
  errorComponent: ProjectError,
});
```

### Transition Timing

| Transition | Duration | Animation |
|------------|----------|-----------|
| Route change | 150ms | Fade content |
| Panel toggle | 100ms | Slide + fade |
| Modal open | 200ms | Scale + fade |
| Drawer slide | 200ms | Translate |

---

## 6.5 Back/Forward Navigation

```yaml
Browser Buttons:
  - Always respect browser back/forward
  - Maintain scroll position
  - Preserve form state (warn if dirty)

Custom Back Button (Mobile):
  - Show in header when depth > 1
  - Navigate to parent route
  - Use platform-native gesture when available

History State:
  - Push new state on navigation
  - Replace state on filter/sort changes
  - Don't add history for modals/drawers
```

---

## 6.6 Mobile Navigation Patterns

### Bottom Navigation

```
+-------+-------+-------+-------+
| Files | Notes | Chat  | More  |
|  [F]  |  [N]  |  [C]  |  ...  |
+-------+-------+-------+-------+
```

| Tab | Icon | Route/Action |
|-----|------|--------------|
| Files | `Folder` | Toggle FileTree plugin |
| Notes | `NotebookPen` | Switch to Notes plugin |
| Chat | `MessageSquare` | Switch to Chat plugin |
| More | `MoreHorizontal` | Open bottom sheet menu |

### Gesture Support

| Gesture | Action |
|---------|--------|
| Swipe left | Switch to next plugin |
| Swipe right | Switch to previous plugin |
| Pull up | Open bottom sheet |
| Edge swipe | Open sidebar drawer |

---

## 6.7 Error Handling

### 404 Not Found

```yaml
Display:
  - Custom 8-bit styled 404 page
  - Pixel art confused robot
  - "Page not found" in VT323 font
  
Actions:
  - Link back to Hub
  - Search suggestions
  - Recent projects list
```

### Permission Error (FSA)

```yaml
Display:
  - PermissionOverlay component
  - Clear explanation of why permission needed
  - File System Access API context
  
Actions:
  - "Grant Permission" button (primary)
  - "Skip" button (secondary)
  - "Use IndexedDB instead" option
```

### Network Error

```yaml
Display:
  - Offline indicator in status bar
  - Toast notification on disconnect
  
Behavior:
  - Queue actions for retry
  - Graceful degradation
  - Show cached content when available
```

---

<- [Global Components](./05-global-components.md) | [Index](./index.md) | [Plugin Architecture](./07-plugin-architecture.md) ->
