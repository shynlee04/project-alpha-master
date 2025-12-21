# Epic 19: Client-Side Security

**Goal:** Implement secure API key storage and CSP configuration for the BYOK (Bring Your Own Key) model.

**Priority:** P2  
**Status:** Backlog  
**Added By:** Course Correction v6 (2025-12-20) - Transformed from legacy Epic 17  
**Prerequisites:** Epic 5 (Persistence layer), Epic 8 (Validation complete)

### Story 19-1: Implement Secure API Key Storage

As a **user providing my Gemini API key**,  
I want **the key encrypted in browser storage**,  
So that **malicious scripts can't steal it**.

**Story Points:** 3

**Acceptance Criteria:**

- **AC-19-1-1:** Web Crypto API used for AES-256-GCM encryption
- **AC-19-1-2:** Key derived from user passphrase using PBKDF2
- **AC-19-1-3:** Encrypted key stored in IndexedDB
- **AC-19-1-4:** Key decrypted only when needed for API calls
- **AC-19-1-5:** "Forget API Key" clears storage completely

---

### Story 19-2: Configure Content Security Policy

As a **security-conscious user**,  
I want **CSP headers preventing XSS attacks**,  
So that **my data is protected**.

**Story Points:** 2

**Acceptance Criteria:**

- **AC-19-2-1:** CSP meta tag in `index.html`
- **AC-19-2-2:** `script-src 'self'` (no inline scripts)
- **AC-19-2-3:** `connect-src` allows WebContainer and AI API only
- **AC-19-2-4:** CSP violations logged but not blocking in dev
- **AC-19-2-5:** CSP report-only mode for gradual rollout

---

### Story 19-3: Create FSA Permission Audit Trail

As a **security auditor**,  
I want **to see when file access was granted**,  
So that **I can review access patterns**.

**Story Points:** 2

**Acceptance Criteria:**

- **AC-19-3-1:** Permission grants logged to console (dev mode)
- **AC-19-3-2:** Permission state changes stored in project metadata
- **AC-19-3-3:** Audit log exportable from settings
- **AC-19-3-4:** Timestamp and folder path recorded
- **AC-19-3-5:** "Clear All Permissions" button in settings

---

### Story 19-4: Implement Secrets Detection Before Commit

As a **user committing code**,  
I want **warnings when I'm about to commit secrets**,  
So that **I don't accidentally push API keys**.

**Story Points:** 3

**Acceptance Criteria:**

- **AC-19-4-1:** Pre-commit hook scans staged files for patterns
- **AC-19-4-2:** Patterns detected: AWS keys, GCP keys, API tokens
- **AC-19-4-3:** Warning modal shows matched content
- **AC-19-4-4:** User can override and commit anyway
- **AC-19-4-5:** False positive patterns can be added to ignore list

---

### Story 19-5: Add Security Headers Verification in CI

As a **maintainer**,  
I want **security headers verified on each deploy**,  
So that **misconfigurations don't reach production**.

**Story Points:** 2

**Acceptance Criteria:**

- **AC-19-5-1:** CI job checks deployed site headers
- **AC-19-5-2:** Verifies: COOP, COEP, CSP, X-Content-Type-Options
- **AC-19-5-3:** CI fails on missing required headers
- **AC-19-5-4:** Report uploaded as artifact
- **AC-19-5-5:** Slack/Discord notification on failure

---
