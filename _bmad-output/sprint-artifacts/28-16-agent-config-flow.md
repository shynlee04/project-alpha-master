# Story 28-16: Mock Agent Configuration Flow

## Story Metadata
- **Epic:** 28 - UX Brand Identity & Design System
- **Story:** 28-16
- **Title:** Mock Agent Configuration Flow
- **Priority:** P1
- **Points:** 5
- **Platform:** Platform B
- **Status:** drafted
- **Created:** 2025-12-22T20:30:00+07:00

---

## User Story

**As a** VIA-GENT user  
**I want to** configure new AI agents with provider, model, and settings  
**So that** I can customize agents for different development tasks

---

## Acceptance Criteria

### AC-1: Agent Configuration Dialog Opens
**Given** I am viewing the AgentsPanel in the IDE sidebar  
**When** I click the "Add Agent" button  
**Then** an agent configuration dialog should appear with form fields

### AC-2: Provider Selection Shows Available Models
**Given** the agent configuration dialog is open  
**When** I select a provider (OpenAI, Anthropic, Mistral, Google)  
**Then** the model dropdown should update to show that provider's models

### AC-3: Form Validation Prevents Empty Submission
**Given** the configuration dialog is open  
**When** I try to submit without required fields (name, provider, model)  
**Then** validation messages should appear for missing fields

### AC-4: Mock Submission Creates Agent
**Given** I have filled all required fields correctly  
**When** I click "Save Agent"  
**Then** a new agent should appear in the AgentsPanel list  
**And** a success toast notification should appear

### AC-5: Pixel Aesthetic Applied
**Given** the configuration dialog is displayed  
**Then** it should use squared corners (rounded-none)  
**And** use primary orange color for submit button  
**And** apply pixel font for title

### AC-6: Full i18n Coverage (EN/VI)
**Given** I switch language to Vietnamese  
**When** I view the configuration dialog  
**Then** all form labels, placeholders, and buttons should be in Vietnamese

---

## Tasks

### T1: Create AgentConfigDialog Component
- [ ] Create `src/components/agent/AgentConfigDialog.tsx`
- [ ] Implement form with fields:
  - Agent Name (required)
  - Role/Description (optional)
  - Provider dropdown (OpenAI, Anthropic, Mistral, Google)
  - Model dropdown (filtered by provider)
  - Temperature slider (0-2, default 0.7)
  - Max Tokens input (128-8192, default 4096)
- [ ] Apply pixel aesthetic (squared corners, shadows)
- [ ] Use Dialog, Input, Select from ShadcnUI

### T2: Wire Dialog to AgentsPanel
- [ ] Add `isConfigDialogOpen` state
- [ ] Modify "Add Agent" button to open dialog
- [ ] Pass `onSuccess` callback to close dialog and refresh

### T3: Implement Mock Form Submission
- [ ] Create submit handler calling `useAgents().addAgent()`
- [ ] Add toast notification using sonner
- [ ] Include JSDoc reference to Epic 25 for real API

### T4: Add i18n Translation Keys
- [ ] Add to `en.json`:
  - `agents.config.title`
  - `agents.config.name`, `agents.config.namePlaceholder`
  - `agents.config.role`, `agents.config.rolePlaceholder`
  - `agents.config.provider`
  - `agents.config.model`
  - `agents.config.temperature`
  - `agents.config.maxTokens`
  - `agents.config.save`
  - `agents.config.cancel`
  - `agents.config.successToast`
- [ ] Add Vietnamese translations to `vi.json`

### T5: Write Unit Tests
- [ ] Test dialog renders with all form fields
- [ ] Test provider change updates model list
- [ ] Test form validation (required fields)
- [ ] Test submit calls addAgent with correct data

---

## Dev Notes

### Architecture Patterns
- **Component location:** `src/components/agent/` (existing pattern)
- **State management:** Local component state (Story 28-15 pattern)
- **Form handling:** Controlled components with useState
- **Toast notifications:** Use sonner (already in project)

### Model Configuration by Provider
```typescript
const PROVIDER_MODELS = {
  OpenAI: ['gpt-4-turbo', 'gpt-4o', 'gpt-4o-mini'],
  Anthropic: ['claude-3-5-sonnet', 'claude-3-opus', 'claude-3-haiku'],
  Mistral: ['mistral-large-latest', 'mistral-medium', 'mixtral-8x7b'],
  Google: ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.0-pro']
}
```

### Integration Notes
- Uses existing `useAgents` hook from Story 28-15
- Mock data persists in component state (not IndexedDB yet)
- Epic 25 will add TanStack Query + real API

### Dependencies
- Story 28-15: Mock Agent States (DONE)
- Story 28-9: Agent Dashboard Components (DONE)
- Epic 25: AI Foundation (FUTURE - real API)

---

## Research Requirements

- [ ] Review ShadcnUI Dialog patterns: https://ui.shadcn.com/docs/components/dialog
- [ ] Review ShadcnUI Select for provider dropdown
- [ ] Review sonner toast API for success notifications

---

## References

- Epic 28 Specification: `_bmad-output/epics/epic-28-ux-brand-identity-design-system.md`
- UX Mockups: `_bmad-output/unified_ide_workspace_ux_ui/`
- Story 28-15 (Mock States): `_bmad-output/sprint-artifacts/28-15-mock-agent-states.md`
- Epic 25 (AI Foundation): `_bmad-output/epics/shards/epic-25-ai-foundation.md`

---

## Dev Agent Record

**Agent:** (pending)  
**Session:** (pending)  

### Task Progress
_To be updated during implementation_

### Files Changed
_To be updated during implementation_

### Tests Created
_To be updated during implementation_

### Decisions Made
_To be updated during implementation_

---

## Code Review

**Reviewer:** (pending)  
**Date:** (pending)  

### Checklist
- [ ] All ACs verified
- [ ] All tests passing
- [ ] Architecture patterns followed
- [ ] No TypeScript errors
- [ ] Code quality acceptable
- [ ] i18n coverage complete

### Issues Found
_To be updated during review_

### Sign-off
_Pending_

---

## Status History

| Date | Status | Notes |
|------|--------|-------|
| 2025-12-22T20:30:00+07:00 | drafted | SM Agent created story file |
