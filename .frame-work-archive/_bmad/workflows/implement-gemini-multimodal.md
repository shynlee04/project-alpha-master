# Workflow: Implement Gemini Multimodal
# ID: @bmad/workflows/implement-gemini-multimodal

## Phase 1: Foundation
1.  **Install Dependency**: `pnpm add @google/generative-ai`
2.  **Create Mapper**: Implement `src/lib/agent/providers/mappers/gemini-mapper.ts` to handle Image/Audio parts.
3.  **Create Adapter**: Implement `src/lib/agent/providers/gemini-adapter.ts`.

## Phase 2: Integration
1.  **Register**: Add `GeminiAdapter` to `ProviderFactory` in `src/lib/agent/providers/index.ts`.
2.  **Update Registry**: Add `gemini-1.5-flash` and `gemini-1.5-pro` to `model-registry.ts`.

## Phase 3: UI Updates
1.  **Chat Input**: Update `ChatInput` to allow file selection when Gemini is active.
2.  **Preview**: Add preview components for uploaded images/audio in the chat stream.

## Phase 4: Verification
1.  **Test**: Run `vitest` on the adapter.
2.  **Manual Test**: Upload an image and ask "What is this?" using `gemini-1.5-flash`.
