# Legacy Routes Archive Manifest

**Archive ID**: legacy-routes-2026-01-26
**Created At**: 2026-01-26T08:28:00+07:00
**Story**: CC-AR-09 (Archive All Legacy Routes)
**ADR Reference**: ADR-034 (Project-Centric Architecture)

---

## Purpose

Archive all legacy routes that violate ADR-034's 2-route architecture.
These routes have been replaced by the canonical 6-route structure.

---

## Files Archived

| Original Path | Archive Path | Reason | Replacement |
|--------------|-------------|--------|-------------|
| `src/routes/ide.$projectId.tsx` | `$projectId.tsx` | Legacy IDE route | `src/routes/$projectId.tsx` (Plugin System) |
| `src/routes/notes.$projectId.tsx` | `notes.$projectId.tsx` | Legacy Notes route | `src/routes/$projectId.tsx` (Plugin System) |
| `src/routes/workspace/$projectId.tsx` | `workspace.$projectId.tsx` | Workspace-specific route | `src/routes/$projectId.tsx` (Project-centric) |
| `src/routes/workspace/index.tsx` | `workspace.index.tsx` | Workspace landing | `src/routes/hub.tsx` |
| `src/routes/notes.lazy.tsx` | `notes.lazy.tsx` | Lazy notes route | `src/routes/$projectId.tsx` (Plugin System) |
| `src/routes/ide.tsx` | `ide.tsx` | Standalone IDE | `src/routes/$projectId.tsx` (Project-centric) |
| `src/routes/agents.tsx` | `agents.tsx` | Standalone agents route | Integrated in `src/routes/$projectId.tsx` (Phase 2) |
| `src/routes/settings.tsx` | `settings.tsx` | Standalone settings | `src/routes/$projectId.tsx` (Project settings) or SystemRail |
| `src/routes/projects.tsx` | `projects.tsx` | Standalone projects list | `src/routes/hub.tsx` (Project selection) |

---

## Breaking Changes

The following routes have been **removed** from the application:

### Removed Routes

- `/workspace/$projectId` → **Use** `/$projectId`
- `/ide/$projectId` → **Use** `/$projectId` (with plugin system)
- `/notes/$projectId` → **Use** `/$projectId` (with plugin system)
- `/settings` → **Use** `/$projectId` (project settings) or SystemRail
- `/projects` → **Use** `/hub` (project selection page)

### Impact Assessment

- ✅ **No imports found**: No other files import from archived routes
- ✅ **Clean break**: Routes can be safely removed without facade exports
- ✅ **TypeScript**: Zero errors expected after removal

---

## Canonical Route Structure (Post-Archive)

```
src/routes/
├── __root.tsx                   # ROOT - Layout + Providers
├── index.tsx                    # REDIRECT → /hub
├── hub.tsx                      # HUB - Project selection + entry point
├── $projectId.tsx              # PROJECT - Single project view (with plugin system)
├── about.tsx                    # INFO - About page
├── about.lazy.tsx               # INFO - Lazy-loaded about
└── api/                         # API - Server functions (kept)
```

**Total**: 6 user-facing routes + API routes

---

## Additional Files (Kept for Debugging/Testing)

The following files remain in `src/routes/` but are **NOT part of the canonical structure**:

- `$__debug__.provider-playground.tsx` - Debugging/testing provider integration
- `debug.tsx` - Debug page
- `test-error-boundary.tsx` - Error boundary testing
- `test-fs-adapter.tsx` - File system adapter testing
- `webcontainer.$.tsx` - WebContainer testing

These files can be archived in a future cleanup story.

---

## Validation Results

### File Count

- **Before**: 19 route files + 2 directories = 21 items
- **After**: 11 route files + 1 directory (api/) = 12 items
- **Archived**: 9 route files

### TypeScript Check

```bash
pnpm tsc --noEmit
# Result: 0 errors
```

### Build Check

```bash
pnpm build
# Result: SUCCESS
```

---

## Notes

- All archived files are preserved in this directory for reference
- No facade exports were needed (no imports found)
- Archive follows ADR-033 (File Tree Governance) naming convention
- TTL: Permanent (archival record)
