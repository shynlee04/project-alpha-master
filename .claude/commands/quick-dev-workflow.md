---
description: Quick development workflow for rapid provider wiring and iteration
---

# Quick Dev Workflow - Provider Wiring

**Purpose**: Rapidly iterate on provider adapter wiring with TanStack AI SDK

## Usage

```bash
/quick-dev-workflow
```

## Workflow Steps

1. **Analyze** - Current provider integration state
2. **Wire** - Create/update provider adapters
3. **Test** - Test provider connections
4. **Report** - Generate wiring status report

## Supported Providers

- **Google Gemini 3.0**: Full multi-modal (text, image, audio, video, Live API)
- **Groq**: LLaVA vision, ultra-fast inference
- **Mistral**: Pixtral multi-modal (12B, 124B)
- **chutes.ai**: Multi-endpoint (LLM, Image, TTS, STT)
- **OpenRouter**: 400+ models via unified API

## Quick Test Commands

```bash
# Test provider connection
pnpm exec tsx .scripts/test-provider.ts gemini-3-flash

# Test all providers
pnpm exec tsx .scripts/test-provider.ts --all

# Generate wiring report
pnpm exec tsx .scripts/provider-wiring-report.ts
```

## Files Modified

- `src/lib/agent/providers/*-adapter.ts` - Provider adapters
- `src/lib/agent/providers/provider-adapter.ts` - Factory
- `src/lib/agent/multimodal/*` - Multi-modal processing
- `src/domain/services/universal-provider-registry.ts` - Registry

## TanStack AI SDK Packages Used

- `@tanstack/ai` - Core AI SDK
- `@tanstack/ai-react` - React integration
- `@tanstack/ai-gemini` - Gemini adapter
- `@tanstack/ai-openai` - OpenAI-compatible adapter
