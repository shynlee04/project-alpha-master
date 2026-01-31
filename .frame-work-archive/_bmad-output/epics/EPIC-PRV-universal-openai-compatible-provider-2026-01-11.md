# EPIC-PRV: Universal OpenAI-Compatible Provider System

**Version:** 1.0.0
**Date:** 2026-01-11
**Status:** Ready for Sprint Planning
**Priority:** P0 (Critical)
**Estimated Effort:** 24 hours

---

## Epic Overview

A universal provider system that supports dynamic registration of OpenAI-compatible APIs with per-modality endpoint configuration, manual model specification, and a dedicated test playground UI for rapid validation.

## Background

The current provider architecture has critical limitations:

| Limitation | Impact | Severity |
|------------|--------|----------|
| Single hardcoded `openai-compatible` provider | Cannot register multiple custom providers | P0 - BLOCKING |
| No per-modality endpoint support | Multi-modality providers (Chutes.ai) cannot work | P0 - BLOCKING |
| Assumes `/models` endpoint exists | Most providers don't expose model lists | P1 - HIGH |
| No test UI for rapid validation | Development and debugging slowed | P1 - HIGH |

### Real-World Use Case: Chutes.ai

Chutes.ai demonstrates the need for per-modality endpoints:

| Modality | Endpoint | Request Format |
|----------|----------|----------------|
| Text | `https://llm.chutes.ai/v1/chat/completions` | OpenAI-compatible |
| Image | `https://image.chutes.ai/generate` | Custom |
| TTS | `https://chutes-kokoro.chutes.ai/speak` | Custom |
| STT | `https://chutes-whisper-large-v3.chutes.ai/transcribe` | Custom |

**Current codebase cannot support this provider.**

## Scope

### In-Scope
- Universal provider registry with dynamic registration
- Per-modality endpoint configuration
- Manual model entry (no `/models` dependency)
- Backend adapter factory supporting all modalities
- Dedicated test playground UI at `/__debug__/provider-playground`
- LocalStorage persistence for provider configs
- localhost provider support (no API key required)

### Out-of-Scope
- Provider marketplace/discovery (future: EPIC-PRV-B)
- Automatic model discovery (future: EPIC-PRV-C)
- Streaming response handling in test UI (future iteration)
- Advanced auth (OAuth, etc.) - API key only for now

## Design Principles

### 1. Modality-First Architecture
Endpoints are configured per modality, not per provider.

```typescript
endpoints: {
  text: 'https://llm.chutes.ai/v1',
  image: 'https://image.chutes.ai',
  tts: 'https://chutes-kokoro.chutes.ai',
  stt: 'https://chutes-whisper-large-v3.chutes.ai',
}
```

### 2. Manual Model Configuration
Models are manually entered, not fetched. This works for ALL providers.

```typescript
models: [
  { id: 'zai-org/GLM-4.7-TEE', name: 'GLM 4.7 TEE', modalities: ['text', 'audio'] },
  { id: 'qwen-image', name: 'Qwen Image', modalities: ['image'] },
]
```

### 3. Test-Driven Development
Dedicated test playground allows rapid validation without touching production code.

### 4. Clean Architecture Separation
```
Domain Types → Registry Service → Adapter Factory → Test UI
```

## Stories

| Story | Title | Priority | Effort | Status | File |
|-------|-------|----------|--------|--------|------|
| PRV-01 | Domain Types for Universal Provider | P0 - CRITICAL | 2 hours | Ready | `stories/PRV-01-domain-types.md` |
| PRV-02 | Provider Registry Service | P0 - CRITICAL | 4 hours | Ready | `stories/PRV-02-registry-service.md` |
| PRV-03 | Universal Adapter Factory | P0 - CRITICAL | 6 hours | Ready | `stories/PRV-03-adapter-factory.md` |
| PRV-04 | Backend API Endpoints | P1 - HIGH | 4 hours | Ready | `stories/PRV-04-backend-api.md` |
| PRV-05 | Test Playground UI | P1 - HIGH | 6 hours | Ready | `stories/PRV-05-test-playground.md` |
| PRV-06 | Integration & E2E Tests | P1 - HIGH | 2 hours | Ready | `stories/PRV-06-integration-tests.md` |

## Dependencies

### External Dependencies
- `@tanstack/ai` ^1.0.0 - Core AI SDK
- `zod` ^3.0.0 - Runtime validation
- Existing credential vault for API key storage

### Internal Dependencies
- **EPIC-GU** (Grand Unification) - Reuses unified provider types
- **EPIC-40** (Agent Chat) - Provider system feeds into tool registry

### Dependency Graph
```
EPIC-GU (types) ─┐
                  ├──> EPIC-PRV (universal providers) ─> EPIC-40 (agent tools)
EPIC-FS (storage) ┘
```

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking existing provider code | HIGH | Create parallel system, migrate incrementally |
| CORS issues with browser requests | MEDIUM | Test UI handles CORS gracefully; backend proxies for production |
| Model ID typos causing confusion | LOW | Test UI validates requests before saving |

## Validation Criteria

### Functional Requirements
- [x] Can register multiple custom providers simultaneously
- [x] Each provider can have different endpoints per modality
- [x] Models are manually entered (no auto-fetch required)
- [x] localhost providers work without API key
- [x] Test playground can execute requests to all configured providers

### Non-Functional Requirements
- [x] No breaking changes to existing provider code
- [x] Type-safe configuration with Zod validation
- [x] Persistent storage using IndexedDB (credential vault)
- [x] Test UI isolated from production routes

## Architecture Overview

### Layer Structure
```
┌─────────────────────────────────────────────────────────────┐
│  PRESENTATION                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ /__debug__/provider-playground (Test UI)            │   │
│  │ - Provider configuration form                       │   │
│  │ - Modality selection (text/image/tts/stt)           │   │
│  │ - Request/response display                          │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  INFRASTRUCTURE                                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ProviderRegistry Service                             │   │
│  │ - register(config)                                  │   │
│  │ - get(id)                                           │   │
│  │ - list()                                            │   │
│  │ - getByModality(modality)                           │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ UniversalAdapterFactory                             │   │
│  │ - createAdapter(providerId)                         │   │
│  │ - executeRequest(modality, payload)                 │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  DOMAIN TYPES                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ UniversalProviderConfig                              │   │
│  │ ModalityType                                         │   │
│  │ ModalityEndpoint                                     │   │
│  │ UniversalModelConfig                                 │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## References

- **Research:** `_bmad-output/planning-artifacts/bmad-bmm-workflows-research-openai-compatible-provider-2026-01-11.md`
- **Quick Dev:** `_bmad-output/planning-artifacts/bmad-bmm-workflows-quick-dev-provider-test-ui-2026-01-11.md`
- **Provider Types:** `src/domain/types/llm/provider-types.ts`
- **Credential Vault:** `src/lib/agent/providers/credential-vault.ts`
- **EPIC-GU:** `_bmad-output/epics/EPIC-GU-grand-unification.md`

## Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-01-11 | BMAD-Architect | Initial epic creation |

---

**Created:** 2026-01-11
**Last Updated:** 2026-01-11
**Next Step:** Execute `/bmad:bmm:workflows:sprint-planning` with EPIC-PRV as input
