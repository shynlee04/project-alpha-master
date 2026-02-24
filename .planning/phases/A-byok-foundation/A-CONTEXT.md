# Phase A: BYOK Foundation — Context

**Goal:** Users can input and persist API keys for Gemini and OpenRouter.

**Why first:** No AI features work without API keys. The vault is 100% stubbed.

---

## Current State

### What's Stubbed

| Component | Location | Behavior |
|-----------|----------|----------|
| `CredentialVault` | `src/lib/agent/providers/credential-vault.ts` | Returns `null` for all operations |
| `ProviderSettings` | `src/presentation/components/agent/ProviderSettings.tsx` | Shows "Phase 2 - Staged" |
| Provider store slices | `src/infrastructure/persistence/stores/providers/` | No-op functions |

### Archived Implementations

Working implementations exist in `_phase2-archive/`:

| Archive File | Contains |
|--------------|----------|
| `_phase2-archive/lib/agent/providers/credential-vault.ts` | AES-256-GCM encryption, IndexedDB storage |
| `_phase2-archive/lib/agent/providers/credential-encryption.ts` | Crypto functions |
| `_phase2-archive/lib/agent/providers/credential-storage.ts` | Dexie storage adapter |
| `_phase2-archive/presentation/components/agent/ProviderSettings.tsx` | API key input UI |
| `_phase2-archive/application/services/ProviderService.ts` | Provider CRUD with vault integration |

### Type Definitions (Ready)

Types already exist at canonical locations:

- `@/domain/types/llm/provider-types.ts` — `ProviderConfig`, `ProviderType`
- `@/domain/types/llm/credential-types.ts` — `StoredCredential`, `CredentialStorage`

---

## Target Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         PRESENTATION                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   ProviderSettings                        │   │
│  │  - API key input form                                     │   │
│  │  - Per-provider key status                                │   │
│  │  - Test connection button                                 │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ storeCredentials(providerId, apiKey)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      INFRASTRUCTURE                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   CredentialVault                         │   │
│  │  - storeCredentials(providerId, key) → encrypt & store   │   │
│  │  - getCredentials(providerId) → decrypt & return         │   │
│  │  - hasCredentials(providerId) → boolean                  │   │
│  │  - deleteCredentials(providerId) → remove                │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│           ┌──────────────────┴──────────────────┐               │
│           ▼                                      ▼               │
│  ┌─────────────────┐                    ┌─────────────────┐     │
│  │CredentialEncrypt│                    │CredentialStorage│     │
│  │ - AES-256-GCM   │                    │ - IndexedDB     │     │
│  │ - PBKDF2-SHA256 │                    │ - Dexie adapter │     │
│  └─────────────────┘                    └─────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Target Location

Restore to `src/infrastructure/ai/` (NOT `src/lib/`):

| File | Purpose |
|------|---------|
| `src/infrastructure/ai/credential-vault.ts` | Main vault class |
| `src/infrastructure/ai/credential-encryption.ts` | AES-256-GCM encryption |
| `src/infrastructure/ai/credential-storage.ts` | Dexie storage adapter |
| `src/infrastructure/ai/index.ts` | Barrel export |

---

## Success Criteria

- [ ] User can input Gemini API key in settings
- [ ] User can input OpenRouter API key in settings
- [ ] Keys persist after browser refresh
- [ ] `credentialVault.getCredentials('gemini')` returns the key
- [ ] `credentialVault.getCredentials('openrouter')` returns the key
- [ ] TypeScript errors: 0 new errors introduced
- [ ] Working features: Project CRUD, FileTree still work

---

## Isolation Boundary

### TOUCHES (allowed to modify)

- `src/infrastructure/ai/` — New directory for vault
- `src/presentation/components/settings/` — ProviderSettings
- `src/infrastructure/persistence/stores/providers/` — Provider store slices

### DOES NOT TOUCH (protected)

- `src/plugins/filetree/` — FileTree operator
- `src/infrastructure/persistence/stores/project/` — Project stores
- `src/domain/schemas/` — No schema changes
- `src/routes/` — No route changes

---

## Research Notes

From `.planning/research/` (AI Endpoints Inventory):

- Vault design uses AES-256-GCM with PBKDF2-SHA256 key derivation
- Per-key random IV for security
- Master key material in localStorage (obfuscated keys)
- Encrypted credentials in IndexedDB via Dexie
- `hasApiKey: boolean` flag in Zustand stores for reactivity

---

*Context created: 2026-02-01*
*Phase: A — BYOK Foundation*
