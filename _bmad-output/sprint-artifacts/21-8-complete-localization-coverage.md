# Story 21-8: Complete Localization Coverage (Audit & Implementation)

**Epic:** 21 - Client-Side Localization (EN/VI)
**Sprint:** Project Alpha

## User Story

As a **localized user**,
I want **all remaining UI components (Chat, Terminal, Warnings) to be fully translated**,
So that **I have a consistent localized experience across the entire IDE**.

## Acceptance Criteria

### AC-21-8-1: Agent Chat Localization
**Given** the Agent Chat Panel
**When** I switch language
**Then** the "Agent Chat" title, "Clear" button, welcome messages, and placeholders update
**And** accessibility labels (aria-label) are translated

### AC-21-8-2: Editor & Terminal Localization
**Given** the Editor or Terminal
**When** loading or displaying status messages
**Then** "Loading editor...", "Shell exited...", and "Terminal Error..." messages are localized
**And** SyncEditWarning banner text is localized

### AC-21-8-3: Completeness
**Given** a full UI audit
**When** implemented
**Then** no hardcoded user-facing strings remain in `src/components/ide`

## Tasks

- [ ] Audit and instrument `AgentChatPanel.tsx` <!-- id: 1 -->
- [ ] Audit and instrument `XTerminal.tsx` (terminal output messages) <!-- id: 2 -->
- [ ] Audit and instrument `MonacoEditor.tsx` (loading state) <!-- id: 3 -->
- [ ] Audit and instrument `SyncEditWarning.tsx` <!-- id: 4 -->
- [ ] Run `i18n:extract` to generate keys <!-- id: 5 -->
- [ ] Populate `en.json` and `vi.json` with new translations <!-- id: 6 -->
- [ ] Verify all components in UI <!-- id: 7 -->

## Research Requirements

- Check `xterm.js` addons for localization support (unlikely, so we modify wrapper writes).
- Verify `monaco-editor` internal strings (difficult to localize fully without config, but we focus on wrapper UI).

## Dev Notes

- Use `t('namespace.key')` pattern.
- For Terminal `term.write`, use `t()` before sending string.
- Update `sprint-status.yaml`.
