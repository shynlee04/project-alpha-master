# Governance: Discovery Framework Phase

**Version:** 1.0.0
**Date:** 2026-01-17
**Status:** ACTIVE

## Scope Boundaries

### IN SCOPE
- Notes Workspace (Markdown/BlockNote editor)
- IDE Workspace (WebContainer + Monaco editor)
- Project-level infrastructure (storage, routing, state)
- Cross-workspace shared components/stores

### OUT OF SCOPE (Temporarily Closed)
- Knowledge Workspace (RAG infrastructure exists, not integrated)
- Study Workspace (Flashcard system exists, not priority)

## Project vs Workspace Distinction

**Definition:**
- **Project:** Container for all work (created → opened → closed)
- **Workspace:** Functional area within project (Notes, IDE, Knowledge, Study)

**Examples:**
- User creates project "My React App"
- User navigates to IDE workspace within "My React App"
- Project metadata stored in Dexie; workspace-specific data in stores

## Orchestrator Constraints

**Do NOT:**
- Write code files directly
- Read files directly (delegate to sub-agents)
- Make implementation decisions without evidence
- Exceed time-box limits

**DO:**
- Delegate to sub-agents with clear tool constraints
- Regulate work progress via session-log.md
- Monitor for governance violations
- Gatekeep all artifacts before completion

## Time-Boxing

- Track duration: 2-4 hours max
- Agent handoff: < 5 minutes
- Escalation: On track timeout or blocker

## Output Standards

All artifacts must have:
- Date stamp: 2026-01-17 (use current system date)
- Clear structure (JSON for data, MD for analysis)
- Evidence links (file paths, line numbers)
- Confidence levels for uncertain findings

## Success Criteria

Phase 1 Complete:
- [ ] All 5 tracks have JSON artifacts
- [ ] God components/stores identified
- [ ] Technical debt cataloged
- [ ] Feature-to-code mapping complete

Phase 2 Complete:
- [ ] All 5 tracks have analysis artifacts
- [ ] Dependency graphs constructed
- [ ] Cycles and conflicts detected
- [ ] Coupling and critical paths identified
