---
date: 2025-12-28
time: 22:03:00
phase: Story Development Cycle
team: Team-A
agent_mode: bmad-bmm-sm
---

# Story 2.0: Credential Vault Implementation

## Epic Context
- **Epic ID:** Epic 2 - AI Chat That Just Works
- **Sprint:** Sprint 0 (Infrastructure & Pre-Work)
- **Story ID:** 2-0
- **Status:** drafted

## User Story

**As a** security-conscious user,
**I want** my API keys encrypted before storage,
**So that** my credentials are protected even if IndexedDB is compromised.

## Acceptance Criteria

### AC-1: Encryption on Storage
**Given** a user enters an API key
**When** the key is saved
**Then** it is encrypted using Web Crypto API (AES-256-GCM)
**And** only the encrypted value is stored in IndexedDB
**And** a unique IV is generated per encryption operation

### AC-2: In-Memory Decryption
**Given** an encrypted API key in storage
**When** the application needs to use it
**Then** it is decrypted in memory only when needed
**And** the decrypted value is never logged or transmitted

### AC-3: Secure Data Deletion
**Given** a user clears their data
**When** they click "Clear All Data" (EDU-PRIV-02)
**Then** all encrypted keys are permanently deleted
**And** encryption key material is cleared

## Implementation Files
- `src/lib/agent/providers/credential-vault.ts` - Main credential vault implementation
- `src/lib/state/dexie-db.ts` - IndexedDB schema with credentials table

## Task Breakdown

### Research Tasks
- [ ] Research Web Crypto API AES-256-GCM encryption patterns
- [ ] Research IndexedDB best practices for sensitive data
- [ ] Research browser-based key management patterns
- [ ] Document security considerations for localStorage vs secure storage

### Development Tasks
- [x] Create `CredentialVault` class with encryption/decryption methods
- [x] Implement master key generation and storage
- [x] Implement `storeCredentials()` with unique IV generation
- [x] Implement `getCredentials()` with in-memory decryption
- [x] Implement `hasCredentials()` for checking existence
- [x] Implement `deleteCredentials()` for secure deletion
- [x] Implement `getStoredProviders()` for listing all providers
- [x] Add helper methods for ArrayBuffer/Base64 conversion
- [x] Export singleton instance `credentialVault`

### Testing Tasks
- [ ] Write unit tests for encryption/decryption flow
- [ ] Write tests for IV uniqueness
- [ ] Write tests for master key persistence
- [ ] Write tests for credential CRUD operations
- [ ] Mock IndexedDB for testing
- [ ] Verify no plaintext credentials are logged

### Documentation Tasks
- [ ] Document security architecture in architecture.md
- [ ] Add usage examples in AGENTS.md
- [ ] Document key rotation strategy (future enhancement)
- [ ] Document production deployment considerations

## Dev Notes

### Architecture Pattern
The credential vault follows a **client-side encryption** pattern:

```
User Input (API Key)
        ↓
Web Crypto API (AES-256-GCM)
        ↓
Encrypted Data + IV
        ↓
IndexedDB (Dexie)
```

**Key Design Decisions:**

1. **Master Key Storage:** Currently stored in localStorage as JWK format
   - **Rationale:** Simple implementation for MVP
   - **Future Enhancement:** Use Web Authentication API or secure enclave
   - **Security Note:** localStorage is accessible to XSS attacks

2. **IV Generation:** Unique 12-byte IV per encryption operation
   - **Rationale:** AES-GCM requires unique IV for each encryption
   - **Implementation:** `crypto.getRandomValues(new Uint8Array(12))`
   - **Storage:** IV stored alongside encrypted data in IndexedDB

3. **Decryption Scope:** Only decrypted in-memory when needed
   - **Rationale:** Minimize exposure window for sensitive data
   - **Implementation:** `getCredentials()` returns decrypted string directly
   - **Security:** Never log or persist decrypted values

4. **IndexedDB Schema:** Credentials stored in dedicated table
   ```typescript
   interface CredentialRecord {
     providerId: string;      // Primary key
     encrypted: string;       // Base64-encoded ciphertext
     iv: string;              // Base64-encoded IV
     createdAt: Date;
   }
   ```

### Security Considerations

**Strengths:**
- ✅ AES-256-GCM provides authenticated encryption
- ✅ Unique IV per operation prevents replay attacks
- ✅ Decrypted values never persisted
- ✅ IndexedDB provides better isolation than localStorage

**Limitations (MVP):**
- ⚠️ Master key stored in localStorage (XSS vulnerable)
- ⚠️ No key rotation mechanism
- ⚠️ No device binding or biometric protection
- ⚠️ No backup/recovery mechanism

**Production Recommendations:**
1. Use Web Authentication API for key protection
2. Implement key rotation strategy
3. Add device binding (hardware attestation)
4. Implement secure backup with user-controlled encryption

### Integration Points

**Provider Adapter System:**
```typescript
// src/lib/agent/providers/provider-adapter.ts
import { credentialVault } from './credential-vault';

// Provider adapters use credential vault for API keys
const apiKey = await credentialVault.getCredentials(providerId);
```

**Agent Configuration UI:**
```typescript
// src/components/agent/AgentConfigDialog.tsx
// UI components interact with credential vault
await credentialVault.storeCredentials(providerId, apiKey);
```

**Clear Data Flow:**
```typescript
// EDU-PRIV-02: Clear All Data
await credentialVault.deleteCredentials(providerId);
localStorage.removeItem('via-gent-master-key');
```

### Reference Architecture
See [`_bmad-output/project-planning-artifacts/architecture.md`](_bmad-output/project-planning-artifacts/architecture.md) for:
- Security architecture patterns
- Data flow diagrams
- IndexedDB schema documentation
- State management patterns

## Research Requirements

### Web Crypto API Documentation
**Required Research:**
1. MDN Web Docs: `SubtleCrypto.encrypt()` and `SubtleCrypto.decrypt()`
   - URL: https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/encrypt
   - Focus: AES-GCM algorithm parameters, IV requirements
   
2. Web Crypto API Specification
   - URL: https://www.w3.org/TR/WebCryptoAPI/
   - Focus: Key generation, import/export formats (JWK, raw, spki)

3. AES-GCM Security Analysis
   - Research: IV reuse vulnerabilities
   - Research: Authentication tag verification
   - Research: Key length recommendations (256-bit)

### IndexedDB Best Practices
**Required Research:**
1. Dexie.js Documentation
   - URL: https://dexie.org/docs/
   - Focus: Schema versioning, transactions, indexing
   
2. IndexedDB Security Patterns
   - Research: Storage quotas and eviction policies
   - Research: Private browsing mode considerations
   - Research: Cross-origin isolation requirements

3. Browser Storage Security
   - Research: localStorage vs IndexedDB security comparison
   - Research: XSS attack vectors and mitigation
   - Research: Data persistence across sessions

### Key Management Patterns
**Required Research:**
1. Web Authentication API (WebAuthn)
   - URL: https://www.w3.org/TR/webauthn/
   - Focus: Credential storage, biometric protection
   
2. Browser Key Storage Patterns
   - Research: Secure enclave integration
   - Research: Key derivation from user secrets
   - Research: Multi-device key synchronization

3. Industry Standards
   - Research: OWASP recommendations for client-side encryption
   - Research: Payment Card Industry (PCI) guidelines
   - Research: GDPR data protection requirements

## References

### Technical Documentation
- MDN Web Docs: Web Crypto API - https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API
- Dexie.js Documentation - https://dexie.org/docs/
- WebAuthn Specification - https://www.w3.org/TR/webauthn/
- OWASP Client-Side Encryption - https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html

### Project Documentation
- [`_bmad-output/project-planning-artifacts/architecture.md`](_bmad-output/project-planning-artifacts/architecture.md)
- [`_bmad-output/project-planning-artifacts/project-context.md`](_bmad-output/project-planning-artifacts/project-context.md)
- [`AGENTS.md`](AGENTS.md)
- [`src/lib/agent/providers/credential-vault.ts`](src/lib/agent/providers/credential-vault.ts)
- [`src/lib/state/dexie-db.ts`](src/lib/state/dexie-db.ts)

### Security Resources
- NIST Special Publication 800-38D: Recommendation for Block Cipher Modes of Operation
- RFC 5116: An Interface and Algorithms for Authenticated Encryption
- OWASP Top 10: Cross-Site Scripting (XSS)

## Dev Agent Record

### Agent: @bmad-bmm-dev
**Status:** Not yet assigned
**Handoff Date:** TBD
**Completion Date:** TBD
**Notes:**
- Implementation already exists in codebase
- Need to validate against acceptance criteria
- Need to write comprehensive tests
- Need to document security considerations

### Code Review
**Reviewer:** @code-reviewer
**Status:** Pending
**Review Date:** TBD
**Notes:**
- Review encryption implementation
- Verify IV uniqueness
- Check for security vulnerabilities
- Validate test coverage

## Status History

| Timestamp | Status | Agent | Notes |
|-----------|--------|-------|-------|
| 2025-12-28 22:03:00 | drafted | @bmad-bmm-sm | Story file created, implementation exists in codebase |

## Demo Checkpoint
🔒 **Show encrypted IndexedDB entries in DevTools**

**Steps:**
1. Open Chrome DevTools → Application → IndexedDB
2. Navigate to database → credentials table
3. Verify `encrypted` field contains Base64-encoded ciphertext
4. Verify `iv` field contains unique Base64-encoded IV
5. Confirm no plaintext API keys visible

## Dependencies
- **Blocked By:** None
- **Blocking:** Story 2-1 (Zustand Dexie State Migration) - needs credential vault for provider configuration
- **Related:** Epic 25 (AI Foundation) - credential vault originally created for provider adapters

## Definition of Done
- [x] Story file created with all required sections
- [x] User story format complete (As a/I want/So that)
- [x] At least 3 acceptance criteria defined with Given/When/Then format
- [x] Tasks section with checkboxes
- [x] Research Requirements section populated
- [x] Dev Notes references architecture.md
- [x] Implementation files identified
- [ ] All development tasks completed
- [ ] All testing tasks completed
- [ ] All documentation tasks completed
- [ ] Code review approved
- [ ] Demo checkpoint verified
- [ ] Status updated to `done`

## Next Actions
1. Assign story to @bmad-bmm-dev for validation and testing
2. Conduct code review with @code-reviewer
3. Verify demo checkpoint
4. Update sprint-status.yaml to `done` upon completion