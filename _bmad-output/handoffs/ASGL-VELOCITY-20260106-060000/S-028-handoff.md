# Handoff: bmad-master → bmad-dev-story

**Session**: ASGL-VELOCITY-20260106-060000
**Story**: S-028
**Title**: Export/Import Project Settings
**Date**: 2026-01-06T09:30:00+07:00
**Priority**: P2 - MEDIUM

## From
- **Agent**: bmad-core-bmad-master (coordinator)
- **Module**: asgl

## To
- **Agent**: bmad-bmm-dev
- **Module**: bmm
- **Path**: _bmad/modules/bmm/agents/dev.md

## Task
Add export/import project settings functionality for backup, sharing, and migration between environments.

## Context
No way to backup or transfer project configurations. Users need to export settings for backup or share with team.

## Root Cause
```typescript
// No export functionality exists
// No import functionality exists
// Project settings locked in app
// No settings serialization
```

## Files to Create/Modify
- **Create**: `src/lib/settings/settings-serializer.ts` - Serialize/deserialize settings
- **Create**: `src/lib/settings/settings-exporter.ts` - Export to JSON/YAML
- **Create**: `src/lib/settings/settings-importer.ts` - Import from JSON/YAML
- **Create**: `src/presentation/components/settings/SettingsExportDialog.tsx` - Export UI
- **Create**: `src/presentation/components/settings/SettingsImportDialog.tsx` - Import UI
- **Modify**: `src/routes/settings.tsx` - Add export/import buttons

## Export Features

### Export Formats
1. **JSON** - Machine-readable format
   - All project settings
   - Workspace configuration
   - Agent permissions
   - File templates
   - Environment variables (sanitized)

2. **YAML** - Human-readable format
   - Same content as JSON
   - Easier for version control
   - Comments for documentation

### Export Options
- **Include**: Environment variables (masked)
- **Include**: File contents (optional, large export)
- **Include**: Workspace cache (optional)
- **Exclude**: Sensitive data (API keys, tokens)
- **Include**: Timestamp and version

### Export Actions
- Download file to local machine
- Copy to clipboard
- Save to project (settings.json)
- Generate shareable URL (Gist)

## Import Features

### Import Validation
1. **Schema Validation**:
   - Check format version compatibility
   - Required fields present
   - Data types correct
   - No malicious content

2. **Conflict Resolution**:
   - Skip existing: Keep current, ignore import
   - Overwrite: Replace current with import
   - Merge: Combine current and import
   - Prompt: Ask user for each conflict

3. **Preview**:
   - Show what will change
   - Highlight conflicts
   - Estimate impact
   - Allow selective import

### Import Actions
- Upload file from local machine
- Paste from clipboard
- Load from URL
- Load from project settings.json

## Settings to Export/Import

### Project Settings
- Project name, description, type
- Creation date, last modified
- Icon and color theme

### Workspace Configuration
- Workspace type (local/WebContainer)
- Folder structure
- File templates
- Ignored files/folders

### Agent Permissions
- Default agent
- Tool permissions (read, write, execute)
- Workspace bindings
- Custom agent configurations

### UI Preferences
- Theme (light/dark/system)
- Font size, editor settings
- Sidebar state
- Panel sizes

## Constraints
- Validation before import (schema version, data types)
- Sanitize sensitive data (API keys, tokens)
- Backup current settings before import
- Confirmation dialog for destructive changes
- Undo functionality (restore previous settings)
- i18n strings via t() function
- 8-bit gaming style (no blur)
- Mobile: Export/import dialogs responsive

## Acceptance Criteria
- [ ] Export settings to JSON format
- [ ] Export settings to YAML format
- [ ] Download file or copy to clipboard
- [ ] Import from file upload or clipboard paste
- [ ] Schema validation (version, fields, types)
- [ ] Conflict resolution (skip/overwrite/merge/prompt)
- [ ] Preview import changes before applying
- [ ] Backup current settings before import
- [ ] Undo/restore previous settings
- [ ] Sanitize sensitive data (mask API keys)
- [ ] Mobile: Responsive dialogs
- [ ] i18n strings via t() function
- [ ] 8-bit gaming style maintained

## Skills to Invoke
- `frontend-components` - Build export/import UI
- `global-validation` - Schema validation
- `brainstorming` - Design conflict resolution
- `global-coding-style` - Serialization patterns

## Validation Commands
```bash
# TypeScript check
pnpm typecheck

# Verify settings components
ls -la src/presentation/components/settings/

# Verify serializer
ls -la src/lib/settings/settings-serializer.ts
```

## Related Issues
- Project portability
- Settings backup/restore
- Ralph Loop Cycle 5A: Settings management

## Next Action
Create settings serializer, exporter/importer, and UI dialogs for backup and migration.

---
**Handoff ID**: S-028-VELOCITY-20260106
**Status**: PENDING
**Agent Assignment**: development-essentials:code
