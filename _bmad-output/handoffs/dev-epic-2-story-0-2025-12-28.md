---
date: 2025-12-28T21:55:00+07:00
from: "@bmad-core-bmad-master"
to: "@bmad-bmm-dev"
phase: "Implementation"
epic: "infrastructure-setup"
story: "2-0-credential-vault-implementation"
priority: "P0"
---

# Handoff: Credential Vault Implementation

## Context
We are in Sprint 0 (Infrastructure & Pre-Work). Before we can implement the AI Agents (Epic 2) or File System Access (Epic 3), we must ensure that user API keys (OpenRouter, Gemini, etc.) feature are stored securely given the local-first nature of the application.

## Task Specification
Implement the **Credential Vault** to encrypt sensitive data before it reaches IndexedDB.

### Requirements (from epics.md Story 2.0)
1.  **Encryption:** Use Web Crypto API (AES-256-GCM).
2.  **Storage:** Store *only* encrypted values in IndexedDB.
3.  **Uniqueness:** Generate a unique IV for every encryption operation.
4.  **Decryption:** Decrypt in memory only when needed; never log decrypted keys.
5.  **Cleanup:** "Clear All Data" must wipe keys and encryption material.

### Target Files
- `src/lib/security/credential-vault.ts`
- `src/lib/security/crypto-utils.ts`

## References
- `_bmad-output/epics.md` (Story 2.0)
- `_bmad-output/project-planning-artifacts/architecture.md` (Section 4.3 Security)

## Definition of Done
- Unit tests verify encryption/decryption round trip.
- Unit tests verify IV uniqueness.
- Code review passes security check.
