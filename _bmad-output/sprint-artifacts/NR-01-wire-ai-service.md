---
story_id: NR-01
story_key: WIRE_AI_SERVICE
epic: notes-remediation
phase: phase_0
priority: P0
effort_hours: 4
status: ready-for-dev
created_date: 2025-12-31T16:00:00+07:00
module: notes-remediation-module
workflow: wire-ai-service.md
---

# Story: Wire AI Service to Agent System

## Objective

Replace the placeholder `note-ai-service.ts` with a real implementation that:
1. Reads the active agent from `useAgentsStore`
2. Gets the API key from `useProviderStore`
3. Calls the actual AI provider API
4. Returns real generated content

## Description

The Notes feature (Epic 26) includes a fake AI service that returns mock content. This story replaces it with a real implementation that integrates with the existing agent system. The goal is to make the AI Magic slash command (`/ai`, `/magic`) in the BlockNote editor produce actual AI-generated content based on the selected agent's configuration.

## User Story

As a user,
I want the AI Magic slash command in my notes to generate real content using my configured AI agent,
So that I can get intelligent suggestions, summaries, and content generation directly within my notes.

## Acceptance Criteria

### Functional Requirements

- [ ] AI Magic slash command produces real AI content (not mock)
- [ ] Selected agent's model is used for generation
- [ ] API key from provider store is used
- [ ] Error messages shown if no agent/key configured
- [ ] Console logs show actual AI call (look for `[NoteAIService] Calling ...`)

### Technical Requirements

- [ ] `note-ai-service.ts` updated to read from `useAgentsStore.getState().activeAgentId`
- [ ] `note-ai-service.ts` reads provider API key from `useProviderStore.getState().providers`
- [ ] Provider-specific API calls implemented (OpenRouter, OpenAI, Anthropic, Google)
- [ ] Proper error handling with user-friendly messages
- [ ] All user-facing strings translated (EN + VI)

### i18n Requirements

Add the following translation keys to `src/i18n/en.json` and `src/i18n/vi.json`:

```json
{
  "notes.ai.error.noAgent": "No active agent configured. Please select an agent first.",
  "notes.ai.error.agentNotFound": "Agent {{agentId}} not found.",
  "notes.ai.error.noApiKey": "No API key for provider \"{{providerId}}\". Add key in Settings.",
  "notes.ai.error.apiError": "AI API error: {{error}}",
  "notes.ai.generating": "Generating content...",
  "notes.ai.success": "Content generated successfully"
}
```

## Implementation Details

### Files to Modify

1. **`src/lib/notes/note-ai-service.ts`** - Main implementation
   - Remove mock content generation
   - Add real API calls to AI providers
   - Handle provider-specific response formats

2. **`src/i18n/en.json`** - English translations
3. **`src/i18n/vi.json`** - Vietnamese translations

### Key Code Patterns

```typescript
// From agents-store
useAgentsStore.getState().activeAgentId
useAgentsStore.getState().getAgent(id)

// From provider-store
useProviderStore.getState().providers[providerId]
```

### Provider Support

The implementation must support:
- **OpenRouter** (default)
- **OpenAI** (GPT-4, GPT-3.5-turbo)
- **Anthropic** (Claude-3-5-sonnet-20241022)
- **Google** (Gemini models)
- **OpenAI-compatible** fallback

### Error Handling

- No active agent: Show translated error message
- Agent not found: Show translated error message
- Missing API key: Show translated error message
- API error: Show error details from response

## Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| `useAgentsStore` | Ready | `src/infrastructure/persistence/stores/agents-store.ts` |
| `useProviderStore` | Ready | `src/infrastructure/persistence/stores/provider-store.ts` |
| AI Provider APIs | Ready | OpenRouter, OpenAI, Anthropic, Google configured |

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| API key missing | Medium | Show clear error message, guide user to Settings |
| Provider API changes | Low | Use OpenAI-compatible format as fallback |
| Network errors | Low | Implement proper error handling with retry hint |

## Testing Strategy

### Unit Tests (Required: 15+ tests)

- Test agent lookup with active agent ID
- Test provider lookup with provider ID
- Test API call for each provider (mocked)
- Test error handling for missing configuration
- Test response parsing for different provider formats

### Manual Testing

1. Open `/notes`
2. Create a note
3. Type `/ai` or `/magic` in editor
4. Enter a prompt
5. Verify real AI content appears (not mock)
6. Check console for `[NoteAIService] Calling ...` log

## Story Context

- **Module**: Notes Remediation Module (`_bmad-output/bmb-creations/notes-remediation-module/`)
- **Phase**: Phase 0 (Core Infrastructure)
- **Iteration**: 0
- **Preceded by**: None (first story in phase)
- **Followed by**: NR-02 (Fix Editor Reactivity)

## Definition of Done

- [ ] All acceptance criteria met
- [ ] All user-facing strings in i18n files (EN + VI)
- [ ] `pnpm i18n:extract` run successfully
- [ ] `pnpm exec tsc --noEmit` passes
- [ ] Unit tests created (15+ tests, all passing)
- [ ] Manual testing completed
- [ ] LOOP_STATE.yaml updated
- [ ] Sprint-status.yaml updated

## Notes

- This story fixes the critical issue where AI features are non-functional
- The mock implementation delays 1.5s and returns hardcoded content
- Real implementation will have variable response times based on API
- All error messages must be user-friendly and translated

---

## Handoff History

| Date | Agent | Action |
|------|-------|--------|
| 2025-12-31T16:00:00+07:00 | @bmad-core-bmad-master | Story file created |
| 2025-12-31T16:00:00+07:00 | @bmad-core-bmad-master | Context XML pending |
| 2025-12-31T16:00:00+07:00 | @bmad-core-bmad-master | Delegation pending |

## Workflow Reference

This story follows the `@bmad-bmm-dev` story development cycle:
1. Story → Story Context → Validation → Development → Code Review → Loop → Notes → Done

Reference: `_bmad-output/prompts/2025-12-28/dev-cycle-prompt.md`
