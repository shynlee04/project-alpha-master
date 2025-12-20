# Story 22-1: Implement Security Headers (CSP, HSTS, X-Frame-Options)

## Epic Context
- **Epic:** 22 - Production Hardening
- **Sprint:** Course Correction v6
- **Priority:** 🔴 CRITICAL
- **Points:** 3

---

## User Story

**As a** security-conscious developer  
**I want** comprehensive security headers configured  
**So that** the application is protected against XSS, clickjacking, and other web vulnerabilities

---

## Acceptance Criteria

### AC-1: Content Security Policy (CSP)
**Given** the Vite dev server is running  
**When** I load any page  
**Then** the response includes a `Content-Security-Policy` header with:
- `script-src 'self'` (with nonce for inline scripts)
- `style-src 'self' 'unsafe-inline'` (Monaco requires unsafe-inline)
- `frame-src https://*.webcontainer.io` (for WebContainer preview)
- `connect-src 'self' https://*.googleapis.com wss://*.webcontainer.io`
- `default-src 'self'`

### AC-2: HTTP Strict Transport Security (HSTS)
**Given** the production deployment  
**When** the site is accessed  
**Then** HSTS header is set with `max-age=31536000; includeSubDomains`

### AC-3: X-Frame-Options
**Given** any page load  
**When** the response is received  
**Then** `X-Frame-Options: DENY` prevents embedding in iframes

### AC-4: X-Content-Type-Options
**Given** any asset request  
**When** the response is received  
**Then** `X-Content-Type-Options: nosniff` is present

### AC-5: Referrer-Policy
**Given** navigation occurs  
**When** referrer is sent  
**Then** `Referrer-Policy: strict-origin-when-cross-origin` is applied

### AC-6: Netlify Headers
**Given** the production build  
**When** deployed to Netlify  
**Then** `public/_headers` includes all security headers

### AC-7: Dev Server Verification
**Given** the dev server is running  
**When** I check Network tab in DevTools  
**Then** all headers are visible on document responses

---

## Tasks

### Research (Pre-Implementation)
- [x] T0: Review existing vite.config.ts and COOP/COEP plugin
- [x] T1: Research vite-plugin-csp-guard configuration
- [ ] T2: Verify Monaco Editor CSP requirements
- [ ] T3: Verify WebContainer frameAncestors/connect requirements

### Implementation
- [ ] T4: Install vite-plugin-csp-guard
- [ ] T5: Configure CSP policy in vite.config.ts
- [ ] T6: Add HSTS, X-Frame-Options, X-Content-Type-Options to dev plugin
- [ ] T7: Add Referrer-Policy header
- [ ] T8: Update public/_headers for Netlify production

### Testing
- [ ] T9: Create security headers test (test/security-headers.test.ts)
- [ ] T10: Verify app loads correctly with CSP
- [ ] T11: Verify Monaco Editor still works
- [ ] T12: Verify WebContainer preview still works

### Documentation
- [ ] T13: Update DEPLOYMENT.md with security header notes

---

## Research Requirements

| Tool | Query | Purpose |
|------|-------|---------|
| Context7 | vite-plugin-csp-guard | Plugin configuration |
| Exa | Monaco CSP requirements | Editor compatibility |
| DeepWiki | webcontainer-core CSP | Frame/connect sources |

---

## Dev Notes

### Current vite.config.ts State
- Already has COOP/COEP via `crossOriginIsolationPlugin`
- TailwindCSS already integrated
- Plugin order: security plugins should be first

### CSP Considerations
- Monaco Editor requires `'unsafe-inline'` for styles
- WebContainer preview iframe needs frame-src allowlist
- Gemini API needs connect-src allowlist

### Header Locations
- **Dev server:** vite.config.ts middleware plugin
- **Production:** public/_headers (Netlify format)

---

## References

- [vite-plugin-csp-guard npm](https://www.npmjs.com/package/vite-plugin-csp-guard)
- [WebContainers COOP/COEP Guide](https://webcontainers.io/guides/configuring-headers)
- [OWASP Security Headers](https://owasp.org/www-project-secure-headers/)
- [Netlify _headers](https://docs.netlify.com/routing/headers/)

---

## Dev Agent Record

_To be filled during implementation_

---

## Status

| Phase | Status | Timestamp |
|-------|--------|-----------|
| Created | ✅ | 2025-12-20 19:16 |
| Drafted | 🔄 | - |
| Ready-for-dev | ⏳ | - |
| In-progress | ⏳ | - |
| Review | ⏳ | - |
| Done | ⏳ | - |
