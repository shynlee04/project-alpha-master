# External Integrations

**Analysis Date:** 2026-01-31

## LLM/AI Providers (BYOK - Bring Your Own Key)

**Universal Provider Registry:**
- Location: `src/domain/services/universal-provider-registry.ts`
- Pattern: OpenAI-compatible endpoints with per-modality support
- Modalities: text, image, audio, video, tts, stt

**Built-in Providers:**

| Provider | Endpoint | Auth Env Var |
|----------|----------|--------------|
| OpenRouter | `https://openrouter.ai/api/v1` | `OPENROUTER_API_KEY` |
| Google Gemini | `https://generativelanguage.googleapis.com/v1beta` | `GEMINI_API_KEY` |
| OpenAI | OpenAI-compatible | `OPENAI_API_KEY` |
| Anthropic | Via TanStack AI adapter | `ANTHROPIC_API_KEY` |
| Groq | `https://api.groq.com/openai/v1` | (via vault) |
| Mistral | `https://api.mistral.ai/v1` | (via vault) |
| Chutes.ai | Multi-endpoint (text/image/tts/stt) | (via vault) |
| Ollama | Local, configurable | None (local) |

**SDK Integration:**
- `@tanstack/ai` - Core chat/streaming abstractions
- `@tanstack/ai-react` - `useChat`, `useCompletion` hooks
- Adapter packages: `@tanstack/ai-openai`, `@tanstack/ai-gemini`, `@tanstack/ai-anthropic`, `@tanstack/ai-ollama`
- API route: `src/routes/api/chat.ts`

**Credential Storage:**
- BYOK vault: API keys encrypted and stored in IndexedDB
- Settings UI for key management
- `hasApiKey` flag synced to provider registry (keys never in localStorage)

## Data Storage

**Primary Database:**
- Dexie.js 4.2.1 (IndexedDB wrapper)
- Database class: `src/infrastructure/persistence/dexie-db-class.ts`
- Main export: `src/infrastructure/persistence/dexie-db.ts`
- Schema version: 20+ (with migration system)

**Tables (50+):**
```
projects, ideState, conversations, taskContexts, toolExecutions,
credentials, threads, providerConfigs, agentConfigs, conversationState,
ragState, workspaceState, syncStatus, fileSyncStatus, fileMetadata,
toolExecutionLogs, fsaHandles, sessionSnapshots, diagnosticTraces,
fileSnapshots, fileContentCache, sources, collections, synthesisResults,
oramaIndexes, embedding_models, notes, workflows, codeSnippets,
savedBlocks, plugins, pluginSettings, pluginMarketplace, pluginStorage,
flashcards, flashcardSets, studySessions, studyCards, quizzes,
quizQuestions, idbFiles, terminalState
```

**Full-Text Search:**
- Orama 3.1.18 - In-memory search engine
- `@orama/plugin-data-persistence` - IndexedDB persistence
- Location: `src/lib/rag/orama-index.ts`
- Hybrid retriever: `src/lib/rag/hybrid-retriever.ts`

**File Storage Strategies:**

| Platform | Storage | Location |
|----------|---------|----------|
| Desktop (FSA) | File System Access API | User-selected directory |
| Desktop (fallback) | IndexedDB | `idbFiles` table |
| Mobile/Tablet | IndexedDB | `idbFiles` table |
| WebContainer | Memory + IndexedDB | `/project` mount |

**Platform Detection:**
- `src/infrastructure/filesystem/platform-detection.ts`
- Functions: `isFSASupported()`, `isWebContainerSupported()`, `getOptimalStorageType()`

## File System Access

**FSA Gateway:**
- `src/infrastructure/filesystem/fsa-gateway.ts` - Main FSA operations
- `src/infrastructure/filesystem/fsa-storage-adapter.ts` - Storage adapter
- `src/infrastructure/filesystem/handle-persistence.ts` - Handle persistence

**Handle Storage:**
- FSA handles persisted in IndexedDB (`fsaHandles` table)
- Permission states: `granted`, `prompt`, `denied`, `dismissed`, `restoring`
- Session restoration with permission re-prompting

**IDB Fallback:**
- `src/infrastructure/filesystem/idb-gateway.ts` - IndexedDB file operations
- `src/infrastructure/persistence/dexie-db-idb-file-types.ts` - File record types
- Compound key: `[projectId, path]`

## WebContainer Integration

**Core:**
- `@webcontainer/api` 1.6.1
- Location: `src/infrastructure/webcontainer/`

**Files:**
- `useWebContainer.ts` - React hook for WebContainer lifecycle
- `useFSAMount.ts` - Mount FSA files to WebContainer at `/project`
- `fsa-adapter.ts` - Adapter for FSA operations in WebContainer
- `useDevServerDetection.ts` - Dev server URL detection

**Requirements:**
- Cross-Origin-Isolated headers (COOP/COEP)
- SharedArrayBuffer support
- Configured in `vite.config.ts` security headers plugin

## Git Integration

**Library:**
- `isomorphic-git` 1.36.1 - Pure JavaScript Git
- Location: `src/lib/git/git-client.ts`

**Features:**
- Clone, commit, push, pull
- Branch management
- Status matrix
- Merge conflict detection

**Authentication:**
- HTTP credentials via user-provided tokens
- No SSH support (browser limitation)

## Monitoring & Error Tracking

**Sentry:**
- `@sentry/react` 10.32.1
- Config: `src/lib/monitoring/sentry.ts`
- Error handlers: `src/lib/errorHandling/globalErrorHandlers.ts`

**Environment Variables:**
```bash
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx     # Required for Sentry
VITE_SENTRY_ENVIRONMENT=development           # Environment tag
VITE_SENTRY_SAMPLE_RATE=1.0                  # 0.0-1.0 sampling
VITE_SENTRY_FORCE_ENABLED=true               # Force in non-prod
```

**Usage:**
```typescript
import { captureException } from '@/lib/monitoring/sentry';
captureException(error, { tags: { component: 'Chat' } });
```

## Internationalization

**Framework:**
- i18next 25.7.3 + react-i18next 16.5.0
- Config: `i18next-scanner.config.cjs`

**Languages:**
- English (`src/i18n/en.json`) - Primary
- Vietnamese (`src/i18n/vi.json`) - Secondary

**Detection:**
- `i18next-browser-languagedetector` 8.2.0
- Fallback: English

**Usage:**
```typescript
import { useTranslation } from 'react-i18next';
const { t } = useTranslation();
t('key.path');
```

**Extraction:**
```bash
pnpm i18n:extract   # Scans src/ for t() calls
```

## Deployment Platforms

**Primary: Cloudflare Workers**
- Plugin: `@cloudflare/vite-plugin` 1.19.0
- Config: `wrangler.jsonc`
- Command: `pnpm deploy`

**Secondary: Vercel**
- Plugin: Nitro-based (via TanStack Start)
- Config: `vercel.json`
- Command: `pnpm deploy:vercel`

**Tertiary: Netlify**
- Plugin: `@netlify/vite-plugin-tanstack-start` 1.2.6
- Command: `pnpm deploy:netlify`

**Build Targets:**
```bash
DEPLOY_TARGET=cloudflare pnpm build   # Cloudflare Workers
DEPLOY_TARGET=vercel pnpm build       # Vercel Edge
DEPLOY_TARGET=netlify pnpm build      # Netlify Functions
DEPLOY_TARGET=node pnpm build         # Standard Node
```

## Security Headers

**Development (vite.config.ts):**
```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Resource-Policy: cross-origin
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

**Production:**
- Handled by `server/middleware/security-headers.ts`
- CSP configured per deployment platform

## Environment Configuration

**Required for AI Features:**
```bash
OPENAI_API_KEY=sk-...          # OpenAI (optional)
ANTHROPIC_API_KEY=...          # Anthropic (optional)
GEMINI_API_KEY=...             # Google Gemini (optional)
OPENROUTER_API_KEY=...         # OpenRouter (optional)
```

**Optional for Monitoring:**
```bash
VITE_SENTRY_DSN=...            # Sentry error tracking
VITE_SENTRY_ENVIRONMENT=...    # Environment tag
```

**Note:** All AI keys can be configured via Settings UI (encrypted vault) instead of environment variables. Keys in vault take precedence.

## Webhooks & Callbacks

**Incoming:**
- None (client-side application)

**Outgoing:**
- LLM API calls (streaming SSE)
- Error reports to Sentry (if configured)

## Third-Party UI Libraries

**Heavy Libraries (SSR-excluded):**
- Monaco Editor (~5MB) - Code editing
- Mermaid (~500KB) - Diagrams
- BlockNote (~400KB) - Rich text
- React Flow (~200KB) - Node graphs
- Recharts (~200KB) - Charts
- xterm (~300KB) - Terminal
- Transformers.js (~800KB) - Browser ML

**SSR Strategy:**
- Heavy libs aliased to empty mocks during SSR
- Configured in `vite.config.ts` `ssr-alias-resolve` plugin

---

*Integration audit: 2026-01-31*
