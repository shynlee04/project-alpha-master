---
story_key: "MM-04-gemini-2.5-integration"
epic: 40
story: "MM-04"
status: "drafted"
created_at: "2026-01-10T02:15:00+07:00"
points: 13
effort_hours: 6
priority: "P0"
track: "B"
team: "B"
governance:
  constitution: "_bmad/modules/governance/CONSTITUTION.md"
  version: "1.0.0"
  acknowledged_at: "2026-01-10"
  acknowledged_by: "@bmad-core-bmad-master"
  compliance:
    artifact_lifecycle: true
    naming_convention: true
    stale_artifact_protocol: true
    multi_team_coordination: true
---

# MM-04: Integrate Gemini 2.5 Flash/Pro APIs

**Epic**: EPIC-40 (Multimodal Chat Unification)
**Track**: B (Multimodal Integration)
**Priority**: P0 (Critical)
**Effort**: 6 hours
**Dependencies**: MM-01 (✅ Complete)
**Status**: DRAFTED

---

## User Story

**As a** user of the Via-Gent AI chat system

**I want** to use Gemini 2.5 Flash and Pro models for chat conversations

**So that** I can leverage the latest multimodal capabilities, 1M token context, and improved reasoning

---

## Problem Statement

The current AI provider system does not support Gemini 2.5 models. Users are limited to older model versions with smaller context windows and fewer multimodal capabilities.

**Gap Analysis**:
- No `gemini-2.5-flash` or `gemini-2.5-pro` model registration
- No modality-aware model selection (text vs image vs audio)
- No 1M token context utilization
- No thinking token cost management

---

## Acceptance Criteria

### AC-1: Model Registration
**Given** the provider system initializes
**When** I open the model selector dropdown
**Then** I see `gemini-2.5-flash` and `gemini-2.5-pro` as options

### AC-2: Modality-Aware Selection
**Given** a conversation with text-only messages
**When** the system selects a model
**Then** it chooses the optimal text model (gemini-2.5-flash)

**Given** a conversation with image attachments
**When** the system selects a model
**Then** it chooses the vision-capable model (gemini-2.5-pro)

### AC-3: 1M Token Context
**Given** a long conversation history
**When** the context is prepared for Gemini 2.5
**Then** it utilizes up to 1M tokens when available

### AC-4: API Key Storage
**Given** a user configures Gemini API key
**When** the key is saved
**Then** it is stored securely in CredentialVault (AES-256-GCM)

### AC-5: Streaming Responses
**Given** a chat message is sent to Gemini 2.5
**When** the response streams back
**Then** tokens appear progressively in the chat UI

### AC-6: TypeScript Compliance
**Given** all new code
**When** TypeScript validation runs
**Then** zero type errors in all affected files

---

## Files to Create

1. `src/lib/agent/providers/gemini-2026-provider.ts` - Gemini 2.5 provider adapter
2. `src/lib/agent/providers/gemini-model-registry.ts` - Model capabilities registry

## Files to Modify

1. `src/lib/agent/providers/ProviderAdapterFactory.ts` - Register Gemini 2.5 provider
2. `src/infrastructure/persistence/stores/provider/provider-crud-slice.ts` - Add Gemini 2.5 models

---

## Tasks

- [ ] T1: Research Gemini 2.5 API capabilities via TanStack AI docs
- [ ] T2: Create gemini-model-registry.ts with model capabilities
- [ ] T3: Create gemini-2026-provider.ts extending base provider
- [ ] T4: Implement modality detection (text/image/audio)
- [ ] T5: Add 1M token context window support
- [ ] T6: Integrate with CredentialVault for API key storage
- [ ] T7: Implement streaming response handling
- [ ] T8: Register models in ProviderAdapterFactory
- [ ] T9: Add models to provider-crud-slice
- [ ] T10: Run TypeScript validation

---

## Research Requirements

### Required MCP Research
- [ ] Context7: @tanstack/ai-gemini documentation
- [ ] Context7: Gemini 2.5 API capabilities (Flash vs Pro)
- [ ] DeepWiki: Gemini modality handling patterns

### Architecture References
- ADR-030: Multimodal Integration Strategy
- ADR-031: Chat System Unification

---

## Technical Specification

### Model Registry Schema
```typescript
interface GeminiModelConfig {
  id: string;
  name: string;
  provider: 'google';
  contextWindow: number;
  maxOutput: number;
  modalities: ('text' | 'image' | 'audio' | 'video')[];
  pricing: {
    inputPer1M: number;
    outputPer1M: number;
    thinkingPer1M?: number;
  };
  features: {
    streaming: boolean;
    thinking: boolean;
    grounding: boolean;
  };
}
```

### Supported Models (2026)
| Model ID | Context | Modalities | Features |
|----------|---------|------------|----------|
| gemini-2.5-flash | 1M | text, image | streaming, thinking |
| gemini-2.5-flash-thinking | 1M | text, image | extended reasoning |
| gemini-2.5-pro | 1M | text, image, audio | streaming, grounding |

### Provider Integration Pattern
```typescript
// CORRECT PATTERN 1: Using geminiText() (auto API key from GEMINI_API_KEY env)
import { geminiText } from '@tanstack/ai-gemini';

const adapter = geminiText('gemini-2.5-flash', {
  // config options (apiKey not needed - uses GEMINI_API_KEY env)
  temperature: 0.7,
});

// CORRECT PATTERN 2: Using createGeminiChat() (explicit API key)
import { createGeminiChat } from '@tanstack/ai-gemini';

const adapter = createGeminiChat(
  'gemini-2.5-flash',  // model first!
  await credentialVault.getKey('gemini'),  // apiKey second
  { temperature: 0.7 }  // config optional
);

// Then use with TanStack AI chat():
import { chat } from '@tanstack/ai';

const stream = chat({
  adapter,
  messages: [...],
});
```

> ⚠️ **IMPORTANT**: There is NO `createGeminiAdapter` function in `@tanstack/ai-gemini`.
> The correct exports are `geminiText()` and `createGeminiChat()`.
> The model parameter comes FIRST, then the API key.

---

## References

- Epic: `_bmad-output/planning-artifacts/epics/epic-40-multimodal-chat-unification.md`
- ADR-030: `_bmad-output/planning-artifacts/architecture/adr-030-multimodal-integration.md`
- TanStack AI: https://tanstack.com/ai/gemini
- Related: MM-01 (unified store), MM-05-MM-08 (voice tools)

---

## Status History

| Status | Timestamp | Agent | Notes |
|--------|-----------|-------|-------|
| backlog | 2026-01-09 | SM | From epic-40 planning |
| drafted | 2026-01-10T02:15:00+07:00 | BMAD-Master (Team B) | Story file created |

---

## Dev Agent Record

*This section populated during development phase*

### Agent
- Model: OpenCode
- Session: 2026-01-10

### Task Progress
- [ ] T1: Research Gemini 2.5 API
- [ ] T2: Create gemini-model-registry.ts
- [ ] T3: Create gemini-2026-provider.ts
- [ ] T4: Implement modality detection
- [ ] T5: Add 1M token context support
- [ ] T6: Integrate CredentialVault
- [ ] T7: Implement streaming
- [ ] T8: Register in ProviderAdapterFactory
- [ ] T9: Add to provider-crud-slice
- [ ] T10: TypeScript validation

### Research Executed
*Documentation of MCP research findings*

### Files Created
| File | Action | Lines |
|------|--------|-------|
| | | |

### Tests Created
- Unit tests for model selection
- Integration tests for streaming

### Decisions Made
- Decision 1: Model selection strategy
- Decision 2: Context window optimization
