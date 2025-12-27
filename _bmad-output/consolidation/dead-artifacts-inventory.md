# Dead Artifacts Inventory
**Date**: 2025-12-24
**Purpose**: Document artifacts that can be removed after consolidation

## IMPORTANT: DO NOT REMOVE YET
This document identifies artifacts for removal. **Do NOT delete any files** - this is for documentation only. Removal should be done after MVP epic is complete and traceability is no longer needed.

## Category 1: Superseded Story Files
### Epic 12: Tool Interface Layer (Superseded by MVP-3/MVP-4)
```
_bmad-output/sprint-artifacts/12-1-create-agentfiletools-facade.md
_bmad-output/sprint-artifacts/12-1-create-agentfiletools-facade-context.xml
_bmad-output/sprint-artifacts/12-1b-add-concurrency-control.md
_bmad-output/sprint-artifacts/12-1b-add-concurrency-control-context.xml
_bmad-output/sprint-artifacts/12-2-create-agentterminaltools-facade.md
_bmad-output/sprint-artifacts/12-2-create-agentterminaltools-facade-context.xml
_bmad-output/sprint-artifacts/12-5-wire-facades-to-tanstack-ai-tools.md
_bmad-output/sprint-artifacts/12-5-wire-facades-to-tanstack-ai-tools-context.xml
```
**Status**: Superseded by MVP stories but code may be referenced
**Action**: Keep until MVP complete, then archive

### Epic 25: AI Foundation Sprint (Superseded by MVP)
```
_bmad-output/sprint-artifacts/25-1-tanstack-ai-integration-setup.md
_bmad-output/sprint-artifacts/25-1-tanstack-ai-integration-setup-context.xml
_bmad-output/sprint-artifacts/25-2-implement-file-tools.md
_bmad-output/sprint-artifacts/25-2-implement-file-tools-context.xml
_bmad-output/sprint-artifacts/25-3-implement-terminal-tools.md
_bmad-output/sprint-artifacts/25-3-implement-terminal-tools-context.xml
_bmad-output/sprint-artifacts/25-4-wire-tool-execution-to-ui.md
_bmad-output/sprint-artifacts/25-4-wire-tool-execution-to-ui-context.xml
_bmad-output/sprint-artifacts/25-5-implement-approval-flow.md
_bmad-output/sprint-artifacts/25-5-implement-approval-flow-context.xml
_bmad-output/sprint-artifacts/25-6-wire-agent-ui-to-providers.md
_bmad-output/sprint-artifacts/25-6-wire-agent-ui-to-providers-context.xml
_bmad-output/sprint-artifacts/25-R1-integrate-useagentchat-to-chatpanel.md
_bmad-output/sprint-artifacts/25-R1-integrate-useagentchat-to-chatpanel-context.xml
```
**Status**: Superseded but critical for traceability
**Action**: Keep until MVP complete, then move to archive

### Epic 28: UX Brand Identity (Partially superseded)
```
_bmad-output/sprint-artifacts/28-1-override-design-tokens.md
_bmad-output/sprint-artifacts/28-2-configure-8bit-typography.md
_bmad-output/sprint-artifacts/28-3-create-brand-components.md
_bmad-output/sprint-artifacts/28-4-implement-8bit-icon-system.md
_bmad-output/sprint-artifacts/28-5-create-agent-avatars.md
_bmad-output/sprint-artifacts/28-6-build-animated-loader.md
_bmad-output/sprint-artifacts/28-7-craft-status-indicators.md
_bmad-output/sprint-artifacts/28-8-design-voice-feedback.md
_bmad-output/sprint-artifacts/28-9-agent-management-dashboard.md
_bmad-output/sprint-artifacts/28-10-agent-configuration-forms.md
_bmad-output/sprint-artifacts/28-11-tool-registry-workflow-editor.md
_bmad-output/sprint-artifacts/28-12-llm-provider-analytics.md
_bmad-output/sprint-artifacts/28-13-enhanced-project-dashboard.md
_bmad-output/sprint-artifacts/28-14-collapsible-ide-sidebar.md
_bmad-output/sprint-artifacts/28-15-agent-chat-interface.md
_bmad-output/sprint-artifacts/28-16-component-library-design-system.md
_bmad-output/sprint-artifacts/28-17-localization-integration.md
```
**Status**: Some components used in MVP, others deferred
**Action**: Review each after MVP - keep if used, archive if not

## Category 2: Duplicate/Outdated Context Files
### Duplicate XML Context Files
```
_bmad-output/sprint-artifacts/*-context.xml (multiple copies)
```
**Status**: Duplicates created for each story
**Action**: Can be removed after story completion
**Note**: Keep only the final version for traceability

## Category 3: Temporary/Working Files
### Handoff Files
```
_bmad-output/handoffs/dev-epic-23-story-23-6-2025-12-21-1615.md
_bmad-output/handoffs/* (other handoff files)
```
**Status**: Temporary coordination files
**Action**: Can be removed after task complete

### Working Drafts
```
_bmad-output/working-drafts/* (if any)
_bmad-output/drafts/* (if any)
```
**Status**: Incomplete drafts
**Action**: Review and remove if obsolete

## Category 4: Legacy Documentation
### Pre-consolidation Documents
```
_bmad-output/archive/ (already exists)
_bmad-output/docs/legacy-unfiltered/ (already archived)
```
**Status**: Already archived
**Action**: Keep as is

### Old Status Files
```
_bmad-output/sprint-status-original-backup.yaml (just created)
_bmad-output/bmm-workflow-status-original-backup.yaml (just created)
```
**Status**: Backup files
**Action**: Move to archive folder after consolidation verified

## Category 5: Test/Example Files
### Roo Code Examples (Reference)
```
_bmad-output/proposal/roo-code-examples/ (if exists)
```
**Status**: Reference material
**Action**: Keep if still useful, archive if not

### Sample Implementations
```
_bmad-output/samples/ (if any)
_bmad-output/examples/ (if any)
```
**Status**: Sample code
**Action**: Review and keep if valuable

## Category 6: Build/CI Artifacts
### Temporary Build Files
```
_bmad-output/build-temp/ (if any)
_bmad-output/dist/ (if any)
```
**Status**: Temporary build outputs
**Action**: Can be safely removed

## Removal Timeline

### Phase 1: Safe to Remove Now
- Working drafts clearly marked as obsolete
- Temporary build artifacts
- Duplicate context files (keep latest)

### Phase 2: Remove After MVP Complete
- Superseded story files (move to archive first)
- Handoff files
- Working context files

### Phase 3: Review Before Removal
- Epic 28 components (check if used in MVP)
- Reference materials (check if still needed)
- Documentation (may need for maintenance)

## Removal Process

1. **Create Archive Structure**:
   ```
   _bmad-output/archive/
   ├── epics-superseded/
   ├── stories-pre-mvp/
   └── context-files/
   ```

2. **Move, Don't Delete**:
   - Move to archive folder first
   - Keep index of what was moved where
   - Verify nothing breaks

3. **Document Traceability**:
   - Keep mapping from old to new stories
   - Document what code came from where
   - Maintain for future reference

4. **Clean Gradually**:
   - Start with obvious duplicates
   - Review each category carefully
   - Stop if anything unclear

## Estimated Impact

### Files to Archive: ~100 files
- Story files: ~50
- Context files: ~40
- Other artifacts: ~10

### Space Savings: Minimal
- Text files are small
- Main benefit: clarity, not space

### Risk: Low
- Nothing deleted initially
- Gradual process
- Full traceability maintained

## Next Steps

1. Wait for MVP epic completion
2. Create archive structure
3. Move superseded files to archive
4. Update any references
5. Document final state
6. Clean when confident

## Notes

- Some Epic 28 UI components may be reused in MVP
- Epic 12/25 code patterns are reference for MVP implementation
- Keep all incident-related documentation
- Maintain traceability until project complete
