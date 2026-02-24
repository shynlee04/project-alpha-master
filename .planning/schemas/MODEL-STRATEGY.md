# Model Strategy: Selection, Loading, Fallback, and Capabilities

**Created:** 2026-02-02
**Authority:** HIGH-LEVEL DESIGN - Must be loaded before AI-related phase planning
**Consumes:** SOURCE-OF-TRUTH.md Part 3 (Schema Relationships)
**Consumed by:** Phase A (BYOK), Phase B (AI Gateway), Phase C (Notes AI)

---

## Purpose

This document defines the **model strategy** for Project Alpha's AI features. It addresses:

1. **Model Loading:** When and how models are fetched from providers
2. **Model Selection:** Which model for which task
3. **Fallback Chains:** What happens when a model fails
4. **Capability Registry:** What each model can do

**Without this strategy:** Users save API keys but see empty model dropdowns. AI features fail silently.

---

## 1. Model Loading Strategy

### 1.1 Trigger: When to Load Models

```
┌─────────────────────────────────────────────────────────────┐
│                    MODEL LOADING TRIGGERS                    │
├─────────────────────────────────────────────────────────────┤
│ 1. API Key Saved → Emit 'provider:key:stored' event         │
│ 2. App Initialization → Load cached models from IndexedDB   │
│ 3. Manual Refresh → User clicks "Refresh Models" button     │
│ 4. Cache Expired → TTL exceeded (24 hours default)          │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Loading Flow

```typescript
// Event-driven model loading
interface ModelLoadingFlow {
  // Step 1: Credential stored triggers event
  onKeyStored(providerId: string): void {
    eventBus.emit('provider:key:stored', { providerId });
  }

  // Step 2: Model slice listens and fetches
  onProviderKeyStored(event: { providerId: string }): void {
    await this.fetchModels(event.providerId);
    eventBus.emit('provider:models:loaded', { providerId, models });
  }

  // Step 3: UI reacts to models loaded
  onModelsLoaded(event: { providerId: string; models: ModelInfo[] }): void {
    // Update model dropdown
    // Enable AI features for this provider
  }
}
```

### 1.3 Fallback: Hardcoded Models

When API-based model discovery fails (rate limit, network error, unsupported):

```typescript
// Priority order for model resolution
const MODEL_RESOLUTION_PRIORITY = [
  'api',        // 1. Fetch from provider API (most current)
  'cache',      // 2. Use IndexedDB cached models (fast)
  'hardcoded',  // 3. Use static model lists (always works)
];

// Static fallback lists per provider
const HARDCODED_MODELS: Record<string, ModelInfo[]> = {
  gemini: [
    { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', capabilities: ['text', 'vision', 'tools'] },
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', capabilities: ['text', 'vision', 'tools'] },
  ],
  openrouter: [
    { id: 'meta-llama/llama-3.3-8b-instruct:free', name: 'Llama 3.3 8B (Free)', capabilities: ['text'] },
    { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku', capabilities: ['text', 'vision'] },
  ],
  openai: [
    { id: 'gpt-4o', name: 'GPT-4o', capabilities: ['text', 'vision', 'tools'] },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', capabilities: ['text', 'vision', 'tools'] },
  ],
};
```

---

## 2. Model Selection Strategy

### 2.1 Selection by Task Type

Different AI operations benefit from different models:

| Task Type | Preferred Model Profile | Fallback |
|-----------|------------------------|----------|
| **Quick Text** (slash commands) | Fast, cheap (gemini-2.0-flash, gpt-4o-mini) | Any text model |
| **Complex Generation** | Powerful (gemini-1.5-pro, gpt-4o) | Fast model |
| **Vision Analysis** | Vision-capable | Error if none |
| **Image Generation** | Image models (imagen, dall-e) | Error if none |
| **Tool Calling** | Tool-capable | Fallback to no-tools mode |
| **Streaming** | Stream-capable | Non-streaming fallback |

### 2.2 Selection Algorithm

```typescript
interface ModelSelector {
  select(requirements: ModelRequirements): ModelInfo | null;
}

interface ModelRequirements {
  capabilities: CapabilityType[];       // Required: ['text', 'vision']
  preferFast?: boolean;                  // Prefer lower latency
  preferCheap?: boolean;                 // Prefer lower cost
  preferPowerful?: boolean;              // Prefer higher quality
  excludeProviders?: string[];           // Providers to skip
  specificModel?: string;                // User-specified override
}

// Selection priority:
// 1. If specificModel provided → use exactly that (error if unavailable)
// 2. Filter by required capabilities → exclude models that can't do the task
// 3. Sort by preference (fast/cheap/powerful)
// 4. Return first available model with valid API key
```

### 2.3 User Override

Users can always specify a model explicitly:
- Agent configuration: "Use gemini-1.5-pro for this agent"
- Per-request: AI command with model parameter

User override takes precedence over automatic selection.

---

## 3. Fallback Chain Strategy

### 3.1 When Fallback Triggers

| Failure Type | Fallback Action |
|--------------|-----------------|
| Rate Limited (429) | Try next provider in chain |
| Timeout (>30s) | Try faster model |
| API Error (5xx) | Try next provider in chain |
| Model Unavailable | Try alternative model same provider |
| Quota Exceeded | Notify user, try free tier |
| Network Error | Use cached response if available |

### 3.2 Fallback Chain Definition

```typescript
interface FallbackChain {
  primary: { providerId: string; modelId: string };
  fallbacks: FallbackOption[];
  maxRetries: number;             // Per-option retry count
  totalTimeout: number;           // Overall timeout (ms)
}

interface FallbackOption {
  providerId: string;
  modelId: string;
  condition: 'rate_limit' | 'timeout' | 'error' | 'any';
  priority: number;               // Lower = try first
}

// Example chain for text generation
const TEXT_GENERATION_CHAIN: FallbackChain = {
  primary: { providerId: 'gemini', modelId: 'gemini-2.0-flash' },
  fallbacks: [
    { providerId: 'openrouter', modelId: 'meta-llama/llama-3.3-8b-instruct:free', condition: 'any', priority: 1 },
    { providerId: 'openai', modelId: 'gpt-4o-mini', condition: 'any', priority: 2 },
  ],
  maxRetries: 2,
  totalTimeout: 60000,
};
```

### 3.3 Fallback Execution

```typescript
async function executeWithFallback<T>(
  chain: FallbackChain,
  operation: (provider: string, model: string) => Promise<T>
): Promise<T> {
  const options = [chain.primary, ...chain.fallbacks.sort((a, b) => a.priority - b.priority)];
  
  for (const option of options) {
    try {
      return await operation(option.providerId, option.modelId);
    } catch (error) {
      const shouldFallback = matchesFallbackCondition(error, option.condition);
      if (!shouldFallback) throw error;
      console.log(`[Fallback] ${option.providerId}/${option.modelId} failed, trying next`);
    }
  }
  
  throw new Error('All fallback options exhausted');
}
```

---

## 4. Capability Registry

### 4.1 Capability Types

```typescript
type CapabilityType =
  | 'text'              // Text generation
  | 'vision'            // Image understanding
  | 'image_generation'  // Image creation
  | 'video_generation'  // Video creation
  | 'audio'             // Audio understanding
  | 'tts'               // Text-to-speech
  | 'stt'               // Speech-to-text
  | 'tools'             // Function/tool calling
  | 'streaming'         // Streaming responses
  | 'json_mode'         // Structured JSON output
  | 'code_execution';   // Code interpreter
```

### 4.2 Capability Detection

```typescript
interface ModelCapabilities {
  modelId: string;
  providerId: string;
  capabilities: CapabilityType[];
  contextLength: number;
  maxOutputTokens?: number;
  costPer1kInput?: number;   // USD
  costPer1kOutput?: number;  // USD
  averageLatency?: number;   // ms
}

// Detection sources (priority order):
// 1. Provider API metadata (if available)
// 2. Model name heuristics (gemini-*-vision → has vision)
// 3. Static capability map (fallback)
```

### 4.3 Static Capability Map

```typescript
const CAPABILITY_MAP: Record<string, CapabilityType[]> = {
  // Gemini
  'gemini-2.0-flash': ['text', 'vision', 'tools', 'streaming', 'json_mode'],
  'gemini-1.5-pro': ['text', 'vision', 'tools', 'streaming', 'json_mode'],
  'gemini-2.0-flash-preview-image-generation': ['text', 'image_generation'],
  
  // OpenAI
  'gpt-4o': ['text', 'vision', 'tools', 'streaming', 'json_mode'],
  'gpt-4o-mini': ['text', 'vision', 'tools', 'streaming', 'json_mode'],
  'dall-e-3': ['image_generation'],
  
  // Anthropic
  'claude-3-opus': ['text', 'vision', 'tools', 'streaming'],
  'claude-3-sonnet': ['text', 'vision', 'tools', 'streaming'],
  'claude-3-haiku': ['text', 'vision', 'tools', 'streaming'],
  
  // Llama (via OpenRouter)
  'meta-llama/llama-3.3-8b-instruct:free': ['text', 'streaming'],
  'meta-llama/llama-3.1-70b-instruct': ['text', 'tools', 'streaming'],
};
```

---

## 5. Integration Points

### 5.1 Phase A: BYOK Foundation

**Must implement:**
- [ ] `provider:key:stored` event emission after key save
- [ ] Model loading on key activation
- [ ] Hardcoded models as fallback

**Files affected:**
- `src/infrastructure/persistence/stores/providers/provider-models-slice.ts` — Restore from archive
- `src/infrastructure/ai/credential-vault.ts` — Add event emission
- `src/lib/agent/providers/hardcoded-models.ts` — Already exists, use as fallback

### 5.2 Phase B: AI Gateway

**Must implement:**
- [ ] `ModelSelector` interface
- [ ] `FallbackChain` execution
- [ ] Capability detection

**Files to create:**
- `src/infrastructure/ai/model-selector.ts`
- `src/infrastructure/ai/fallback-chain.ts`
- `src/infrastructure/ai/capability-registry.ts`

### 5.3 Phase C: Notes AI

**Must use:**
- [ ] Model selection for slash commands (prefer fast)
- [ ] Fallback chain for reliability
- [ ] Capability check before image/vision operations

---

## 6. Schema Additions

### 6.1 Provider Store Extensions

```typescript
// Add to ProviderState
interface ProviderState {
  // Existing
  providers: ProviderConfig[];
  
  // Add
  modelCache: Record<string, {
    models: ModelInfo[];
    fetchedAt: number;
    source: 'api' | 'cache' | 'hardcoded';
  }>;
  
  fallbackChains: Record<string, FallbackChain>;
  
  // Actions
  fetchModels: (providerId: string) => Promise<void>;
  getModelsForProvider: (providerId: string) => ModelInfo[];
  selectModel: (requirements: ModelRequirements) => ModelInfo | null;
}
```

### 6.2 Events

```typescript
// Add to DomainEventType
type DomainEventType =
  | /* existing events */
  | 'provider:key:stored'      // API key saved to vault
  | 'provider:models:loaded'   // Models fetched successfully
  | 'provider:models:failed'   // Model fetch failed, using fallback
  | 'model:selected'           // Model selected for operation
  | 'fallback:triggered';      // Primary failed, using fallback
```

---

## 7. Governance

### 7.1 Schema Extension Rules

Per AGENTS.md Schema Governance:
- All additions are **ADDITIVE** (new fields, new union members)
- No modification of existing fields
- New capabilities add to `CapabilityType` union

### 7.2 Document Hierarchy

```
SOURCE-OF-TRUTH.md (Authority)
    └── MODEL-STRATEGY.md (This document - High-Level Design)
            └── A-04B-PLAN.md (Mid-Level Plan)
                    └── Implementation commits
```

### 7.3 Required Context Loading

**Before planning AI-related phases, agents MUST load:**
1. `.planning/SOURCE-OF-TRUTH.md` — Canonical architecture
2. `.planning/schemas/MODEL-STRATEGY.md` — This document
3. `.planning/ROADMAP.md` — Current phase structure

---

*Created: 2026-02-02*
*Authority: High-Level Design Document*
*Phase: Applies to A, B, C*
