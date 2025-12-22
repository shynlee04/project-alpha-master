# Story 28-13: Full UI Integration Audit & Replacement

## Epic Context
- **Epic:** 28 - UX Brand Identity & Design System
- **Phase:** 5 - Integration Enforcement
- **Sprint:** Current

## User Story

**As a** user of VIA-GENT IDE  
**I want** all UI components to use consistent VIA-GENT brand colors  
**So that** the application has a cohesive, professional 8-bit aesthetic without generic ShadcnUI defaults

## Problem Statement

Stories 28-1 through 28-10 created components but did NOT integrate them:
- Production still shows cyan/blue colors
- IconSidebar created but never imported
- Generic slate colors persist in routes
- "Browser verified" claims without evidence

## Acceptance Criteria

### AC-1: Complete Color Audit
**Given** the codebase in `src/routes/` and `src/components/`  
**When** grep is run for banned colors  
**Then** all instances are documented in an audit table

### AC-2: Systematic Color Replacement  
**Given** the audit from AC-1  
**When** colors are replaced  
**Then** NO grep matches for `bg-slate-`, `text-slate-`, `bg-cyan-`, `text-cyan-` in src/

### AC-3: Pixel Aesthetic Applied
**Given** all Button components  
**When** inspected  
**Then** use `rounded-none` and pixel variants (`pixel`, `pixel-primary`)

### AC-4: Visual Verification
**Given** the application running  
**When** browser screenshot captured  
**Then** NO cyan/blue visible on dashboard or IDE workspace

## Tasks

- [ ] T1: Run grep audit for all banned colors in src/
- [ ] T2: Document all files with hardcoded colors in table
- [ ] T3: Replace colors in `src/routes/test-fs-adapter.tsx`
- [ ] T4: Replace colors in `src/components/ide/` (any remaining)
- [ ] T5: Replace colors in `src/components/layout/` (any remaining)
- [ ] T6: Run verification grep - must return 0 results
- [ ] T7: Browser screenshot verification

## Research Requirements

- Query MCP: TailwindCSS 4.x color token patterns
- Check: project-context.md for VIA-GENT brand tokens

## Dev Notes

### Color Mapping Reference
```
bg-slate-950 → bg-background
bg-slate-900 → bg-card
bg-slate-800 → bg-secondary
text-slate-200 → text-foreground
text-slate-400 → text-muted-foreground
text-slate-500 → text-muted-foreground
bg-cyan-* → bg-primary
text-cyan-* → text-primary
rounded-lg → rounded-none
rounded-xl → rounded-none
```

## References

- Architecture: `_bmad-output/architecture.md`
- Epic 28 Spec: `_bmad-output/epics/shards/epic-28-ux-brand-identity-design-system.md`
- Design Tokens: `src/styles/design-tokens.css`

## Dev Agent Record

*To be populated during implementation*

## Status

| Date | Status | Notes |
|------|--------|-------|
| 2025-12-22 | drafted | Initial story creation |
