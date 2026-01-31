# AI/ML Package Updates - 2026-01-25

**Research Date**: 2026-01-25
**Researcher**: analyst-ext
**Status**: Complete

---

## Executive Summary

- **Packages Checked**: 6 AI/ML packages
- **Updates Available**: 1 package requires update
- **Breaking Changes**: 0 critical breaking changes identified
- **Recommendations**: Update @google/genai, monitor @huggingface/transformers migration path

---

## Current vs Latest Versions

| Package | Current | Latest | Action Needed | Priority |
|---------|---------|--------|---------------|----------|
| @anthropic-ai/sdk | 0.71.2 | 0.71.2 | ✅ None - Up to date | P3 |
| @google/genai | 1.34.0 | 1.38.0 | ⚠️ Update to 1.38.0 (Minor) | P1 |
| @xenova/transformers | 2.17.2 | 2.17.2 | ✅ None - Up to date | P2* |
| @tanstack/ai | 0.2.2 | 0.2.2 | ✅ None - Up to date | P3 |
| @tanstack/ai-gemini | 0.3.2 | 0.3.2 | ✅ None - Up to date | P3 |
| @tanstack/ai-openai | 0.2.1 | 0.2.1 | ✅ None - Up to date | P3 |

\* **Note**: @xenova/transformers is up to date, but @huggingface/transformers (v3.8.1) is now the official package. See migration recommendation below.

---

## Package-Specific Analysis

### 1. @anthropic-ai/sdk (v0.71.2)

**Status**: ✅ Current
**Last Published**: 2 months ago (Dec 2025)
**Latest Available**: 0.71.2

**Notes**:
- No new releases since current version
- Stable SDK with active maintenance
- No breaking changes reported

**Action**: None required

---

### 2. @google/genai (v1.34.0 → v1.38.0)

**Status**: ⚠️ Update Available
**Latest Released**: 3 days ago (Jan 22, 2026)
**Update Type**: Minor version bump

**Changes from v1.34.0 to v1.38.0**:
- 4 patch releases since current version
- General Availability (GA) achieved across all platforms
- Unified interface for Gemini 2.5 Pro and Gemini 2.0 models
- Enhanced support for both Gemini Developer API and Vertex AI

**Breaking Changes**: None documented
**Compatibility**: ✅ Compatible with current implementation

**TanStack AI Integration**:
- @tanstack/ai-gemini depends on @google/genai ^1.30.0
- Current v0.3.2 supports up to v1.38.0
- ✅ Safe to update without breaking TanStack integration

**Action**: Update to `^1.38.0` (recommended)

---

### 3. @xenova/transformers (v2.17.2)

**Status**: ✅ Current (but deprecated path)
**Last Published**: May 2024 (older package)
**Latest Available**: 2.17.2

**Important Note - Package Transition**:
- `@xenova/transformers` is being replaced by `@huggingface/transformers` (official package)
- `@huggingface/transformers` latest version: **3.8.1** (January 2026)
- The official package has reached v3.x with significant improvements

**@huggingface/transformers v3.8.1 Features**:
- New model architectures supported: Voxtral, LFM2, ModernBERT Decoder
- Updated ONNX runtime support
- Better performance and bug fixes
- Active development by Hugging Face team

**Migration Considerations**:
- Both packages have similar APIs
- @xenova/transformers remains available for backward compatibility
- Migration to @huggingface/transformers is recommended for long-term support

**Breaking Changes for Migration**:
- Import path changes: `@xenova/transformers` → `@huggingface/transformers`
- Some model loading APIs may have minor differences
- Recommended to review migration guide if switching

**Action**:
- Short-term: Keep @xenova/transformers v2.17.2 (stable)
- Long-term: Plan migration to @huggingface/transformers v3.8.1
- Priority: P2 (not urgent, but plan migration path)

---

### 4. @tanstack/ai (v0.2.2)

**Status**: ✅ Current
**Last Published**: 8 days ago (Jan 17, 2026)
**Latest Available**: 0.2.2

**Notes**:
- Recently released library (January 2026)
- Active development with frequent updates
- Unified AI SDK across multiple providers
- No breaking changes in recent releases

**TanStack AI Ecosystem**:
- Core library is stable and actively maintained
- Provider adapters (OpenAI, Gemini, etc.) are up to date
- Strong integration with TanStack Router

**Action**: None required

---

### 5. @tanstack/ai-gemini (v0.3.2)

**Status**: ✅ Current
**Latest Available**: 0.3.2

**Dependencies**:
- Requires @tanstack/ai ^0.2.2 ✅ (current version satisfies)
- Requires @google/genai ^1.30.0 ✅ (supports up to v1.38.0)

**Action**: None required

---

### 6. @tanstack/ai-openai (v0.2.1)

**Status**: ✅ Current
**Latest Available**: 0.2.1

**Dependencies**:
- Requires @tanstack/ai ^0.2.1 ✅ (current version satisfies)
- Requires openai ^6.9.1 ✅ (openai package not in current dependencies)

**Note**: The project has `@tanstack/ai-openai` installed but does not have the underlying `openai` package (v6.x+) in dependencies. This is expected for adapter-only usage.

**Action**: None required

---

## New AI Providers/Models Found

### 1. AI SDK (Next.js/Vercel)
- **Package**: `ai` (from ai-sdk.dev)
- **Latest Version**: 5.0.106
- **Description**: Unified AI SDK from Next.js team
- **Relevance**: Alternative to TanStack AI, but TanStack is preferred for this project's architecture

### 2. @ai-sdk/anthropic
- **Package**: `@ai-sdk/anthropic`
- **Latest Version**: 3.0.13
- **Description**: Anthropic provider for AI SDK
- **Last Updated**: 2 hours ago (very active)
- **Relevance**: Could replace @anthropic-ai/sdk if switching to AI SDK architecture

### 3. @google/generative-ai (Deprecated)
- **Package**: `@google/generative-ai`
- **Status**: ❌ Deprecated
- **Replacement**: `@google/genai` (already using correct package)

### 4. @huggingface/transformers (Official)
- **Package**: `@huggingface/transformers`
- **Latest Version**: 3.8.1
- **Description**: Official Hugging Face Transformers.js (replacement for @xenova/transformers)
- **Relevance**: See migration plan above

### 5. TanStack AI Solid & Vue
- **Packages**: `@tanstack/ai-solid`, `@tanstack/ai-vue`
- **Latest**: 0.2.1 (Solid), 0.2.2 (Vue)
- **Relevance**: Project is React-only, not applicable

---

## Breaking Changes/Compatibility Notes

### Critical (Must Address)

**None** - No critical breaking changes identified.

### Important (Should Review)

1. **@google/genai v1.30.0+ - GA Announcement**
   - The SDK reached General Availability in May 2025
   - All pre-GA APIs are now stabilized
   - No breaking changes, but API contracts are now final

2. **@huggingface/transformers Migration Path**
   - @xenova/transformers will eventually reach end-of-life
   - Migration to @huggingface/transformers is recommended before EOL
   - Estimated EOL: Unknown (package still maintained as of Jan 2025)

### Low Priority (Monitor)

1. **@anthropic-ai/sdk Age**
   - Last update: December 2025 (2 months ago)
   - May indicate stable API or upcoming major version
   - Monitor for v0.72.0 or v1.0.0 release

2. **TanStack AI Release Cadence**
   - Frequent updates (every 8-15 days)
   - Early release cycle (v0.2.x)
   - Expect minor breaking changes before v1.0.0

---

## Recommended Updates

### Immediate (P1 - This Week)

1. **@google/genai**: `^1.34.0` → `^1.38.0`
   ```bash
   pnpm update @google/genai@^1.38.0
   ```
   **Rationale**:
   - 4 patch releases with bug fixes and improvements
   - Latest stable GA release
   - No breaking changes
   - Full compatibility with @tanstack/ai-gemini

### Short-term (P2 - Next Sprint)

2. **Plan @xenova/transformers → @huggingface/transformers Migration**
   - No immediate action needed (v2.17.2 is stable)
   - Create migration story for EPIC-FS or new epic
   - Research breaking changes between v2.17.2 and v3.8.1
   - Test with current model loading patterns
   - Schedule migration for after EPIC-CC-ARC completion

### Monitor (P3 - Ongoing)

3. **@anthropic-ai/sdk**
   - Monitor for v0.72.0 or v1.0.0 announcements
   - Subscribe to Anthropic release notes

4. **TanStack AI Ecosystem**
   - Monitor @tanstack/ai for v0.3.0 releases
   - Watch for breaking changes before v1.0.0

---

## Testing Requirements

### After @google/genai Update

1. **Unit Tests**:
   - Verify Google AI integration tests pass
   - Test Gemini 2.5 Pro and 2.0 model compatibility
   - Validate streaming responses work correctly

2. **Integration Tests**:
   - Run AI chat workflows
   - Test embeddings functionality
   - Verify error handling with new SDK version

3. **E2E Tests**:
   - Run Playwright AI workspace tests
   - Test cross-workspace AI features

### After @huggingface/transformers Migration (Future)

1. **Model Loading**:
   - Test all currently used transformer models
   - Verify ONNX model downloads work
   - Validate browser compatibility

2. **Performance**:
   - Benchmark model loading times
   - Compare memory usage with v2.17.2

3. **Features**:
   - Test new model architectures (Voxtral, LFM2)
   - Verify existing functionality remains intact

---

## Dependencies Matrix

### TanStack AI Ecosystem

```
@tanstack/ai (0.2.2)
├── @tanstack/ai-gemini (0.3.2)
│   └── @google/genai (^1.30.0) ← Update to ^1.38.0
├── @tanstack/ai-openai (0.2.1)
│   └── openai (^6.9.1) ← Not installed (adapter-only)
└── @tanstack/ai-client (0.2.2)
    └── Core AI client functionality
```

### Current AI SDK Usage

```
Project Alpha AI Stack:
├── Anthropic: @anthropic-ai/sdk (0.71.2) ✅ Current
├── Google Gemini: @google/genai (1.34.0) ⚠️ Update to 1.38.0
├── Transformers: @xenova/transformers (2.17.2) ✅ Stable
│   └── Consider: @huggingface/transformers (3.8.1) migration
└── Unified AI: @tanstack/ai (0.2.2) ✅ Current
```

---

## Risk Assessment

| Package | Update Risk | Impact | Recommendation |
|---------|------------|--------|----------------|
| @google/genai 1.34.0→1.38.0 | Low | Low-Medium | ✅ Proceed with update |
| @huggingface/transformers migration | Medium | High | ⚠️ Plan carefully, test thoroughly |
| @anthropic-ai/sdk v0.72+ | Unknown | Medium | 🔍 Monitor for release |
| TanStack AI v0.3+ | Medium | Low | 🔍 Watch for breaking changes |

---

## Next Steps

1. ✅ **Create update story for @google/genai v1.38.0**
2. 📋 **Plan @huggingface/transformers migration epic**
3. 🔍 **Set up automated version monitoring**
4. 📊 **Update governance docs with AI package update cadence**

---

## Research Sources

- NPM Registry (npmjs.com) - All package metadata and version info
- Google AI Documentation - @google/genai GA announcement
- Hugging Face GitHub - @huggingface/transformers v3.8.1 release notes
- TanStack AI Docs - Version compatibility matrix
- Web Search (Jan 25, 2026) - Latest release news and breaking changes

---

## Metadata

- **Research ID**: research-ai-ml-packages-2026-01-25
- **Research Duration**: 15 minutes
- **Packages Analyzed**: 6 core packages + 5 additional/new providers
- **Sources Consulted**: NPM registry (6), Web search (4), Official docs (3)
- **Confidence Level**: High (direct npm registry verification)
- **Next Review**: 2026-02-01 (weekly cadence recommended)

---

**End of Report**
